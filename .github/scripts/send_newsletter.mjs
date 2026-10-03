import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { renderEmailTemplate } from './NewsletterTemplate.mjs';
import { toFileId, broadcastName, findSegmentByName, pickPosts } from './newsletter_lib.mjs';

// ---- Config ----------------------------------------------------------------------
const SEGMENT_NAME = 'news.avelino.run'; // only contacts in this Resend Segment get the email
const MAX_AGE_DAYS = 7; // never email posts older than this (protects against sending an old backlog)
const MAX_PER_RUN = 1; // at most this many emails per run; the rest go in later runs

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.NEWSLETTER_FROM;
const BASE_URL = process.env.SITE_BASE_URL || 'https://avelino.run';
const SITE_NAME = process.env.SITE_NAME || 'avelino.run';
const DRY_RUN = process.env.NEWSLETTER_DRY_RUN === 'true';

const BLOG_DIR = path.join('content', 'blog');
const STATE_PATH = '.newsletter_state.json';

/**
 * Generate an engaging email subject line from title and description
 * Uses proven email marketing patterns to increase open rates
 */
function generateEmailSubject(title, description) {
  const maxLength = 65; // Optimal length for email subjects
  const desc = (description || '').toLowerCase();
  const titleLower = title.toLowerCase();

  // Extract key benefit/action words
  const hasGuide = /(guide|tutorial|how-to|walkthrough|practical guide)/i.test(desc);
  const hasProblem = /(problem|challenge|issue|pain)/i.test(desc);
  const hasSolution = /(solution|solve|fix|build|create|automate)/i.test(desc);
  const hasTips = /(tip|trick|secret|insight|learn)/i.test(desc);
  const isQuestion = /^(how|why|what|when|where|who|can|should|will)/i.test(title);
  const isTechnical = /(automating|building|creating|implementing|developing|setting up)/i.test(title) ||
                      /(automating|building|creating|implementing|developing|setting up)/i.test(desc);

  // Helper: Smart truncate with emoji support
  const smartTruncate = (text, max, emoji = '') => {
    const emojiLength = emoji.length;
    const availableLength = max - emojiLength;

    if (text.length <= availableLength) {
      return emoji ? `${emoji} ${text}` : text;
    }

    // Prefer truncation at meaningful breaks
    const colonIdx = text.indexOf(':');
    if (colonIdx > 0 && colonIdx <= availableLength) {
      const result = text.substring(0, colonIdx);
      return emoji ? `${emoji} ${result}` : result;
    }

    const dashIdx = text.lastIndexOf(' - ', availableLength);
    if (dashIdx > availableLength * 0.6) {
      const result = text.substring(0, dashIdx);
      return emoji ? `${emoji} ${result}` : result;
    }

    // Truncate at word boundary
    const truncated = text.substring(0, availableLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    const result = lastSpace > availableLength * 0.7
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
    return emoji ? `${emoji} ${result}` : result;
  };

  // Pattern 1: Technical/automation posts (add rocket emoji)
  if (isTechnical) {
    return smartTruncate(title, maxLength, '🚀');
  }

  // Pattern 2: Guide/tutorial posts
  if (hasGuide) {
    // Extract the main part (before colon)
    const mainPart = title.split(':')[0];
    if (mainPart.length <= maxLength - 3) {
      return `📚 ${mainPart}`;
    }
    return smartTruncate(title, maxLength, '📚');
  }

  // Pattern 3: Question hooks (great for engagement)
  if (isQuestion) {
    return smartTruncate(title, maxLength);
  }

  // Pattern 4: How-to format (action-oriented)
  if (/how to/i.test(title)) {
    const howToPart = title.match(/how to [^:]+/i)?.[0];
    if (howToPart && howToPart.length <= maxLength - 3) {
      return `📖 ${howToPart}`;
    }
    return smartTruncate(title, maxLength, '📖');
  }

  // Pattern 5: Tips/insights
  if (hasTips) {
    const coreValue = title.split(':')[0] || title.split(' - ')[0];
    if (coreValue.length <= maxLength - 4) {
      return `💡 ${coreValue.trim()}`;
    }
    return smartTruncate(title, maxLength, '💡');
  }

  // Pattern 6: Short titles (no truncation needed)
  if (title.length <= maxLength) {
    return title;
  }

  // Pattern 7: Default smart truncation (preserves meaning)
  return smartTruncate(title, maxLength);
}

// ---- Resend API --------------------------------------------------------------------

async function resend(method, apiPath, body) {
  const res = await fetch(`https://api.resend.com${apiPath}`, {
    method,
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${method} ${apiPath} failed (${res.status}): ${json.message || res.statusText}`);
  return json;
}

/** All items of a paginated Resend list endpoint. */
async function listAll(apiPath) {
  const items = [];
  let after = '';
  while (true) {
    const page = await resend('GET', `${apiPath}?limit=100${after && `&after=${after}`}`);
    items.push(...page.data);
    if (!page.has_more) return items;
    after = page.data[page.data.length - 1].id;
  }
}

// ---- Posts -------------------------------------------------------------------------

function readPost(postPath) {
  const { data, content } = matter(fs.readFileSync(postPath, 'utf8'));
  const date = data.date ? new Date(data.date) : null;
  return { data, content, draft: data.draft === true, date: date && !Number.isNaN(date.getTime()) ? date : null };
}

function emailFields(postPath, data, content) {
  const title = (data.title || path.basename(postPath, path.extname(postPath))).toString();
  const description = (data.description || content.replace(/[#>*_\-\[\]\(\)`]/g, '').trim().slice(0, 220)).toString();

  // Hugo URL: `url`, then `slug`, then the file name
  const urlPath = ('/' + (data.url || data.slug || path.basename(postPath).replace(/\.mdx?$/i, ''))).replace(/\/+/g, '/');
  const url = new URL(urlPath, BASE_URL).toString();

  const img = data.img || data.image;
  const imageUrl = img ? new URL(img, BASE_URL).toString() : null;

  return { title, description, url, imageUrl };
}

// ---- Main --------------------------------------------------------------------------

if (!RESEND_API_KEY || !FROM) {
  console.error('Missing RESEND_API_KEY or NEWSLETTER_FROM');
  process.exit(1);
}

const state = fs.existsSync(STATE_PATH) ? JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) : { lastSent: [] };
const sentIds = new Set(state.lastSent.map(toFileId));

function markSent(fileId) {
  sentIds.add(fileId);
  state.lastSent = [...sentIds];
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2)); // committed by the workflow
}

const posts = fs.readdirSync(BLOG_DIR)
  .filter((f) => /\.mdx?$/i.test(f))
  .map((f) => {
    const postPath = path.join(BLOG_DIR, f);
    return { postPath, fileId: toFileId(postPath), ...readPost(postPath) };
  });

const toSend = pickPosts(posts, sentIds, { maxAgeDays: MAX_AGE_DAYS, maxPerRun: MAX_PER_RUN });
if (!toSend.length) {
  console.log(`Nothing to send (no unsent post dated within the last ${MAX_AGE_DAYS} days).`);
  process.exit(0);
}

// Fails loudly if the segment does not exist. There is no fallback audience.
const segment = findSegmentByName(await listAll('/segments'), SEGMENT_NAME);
console.log(`Segment "${segment.name}": ${segment.id}${DRY_RUN ? ' (dry run, nothing will be sent)' : ''}`);

// Names of broadcasts already sent/queued, in case the state file missed a send.
const alreadySent = new Set((await listAll('/broadcasts')).filter((b) => b.status !== 'draft').map((b) => b.name));

for (const post of toSend) {
  const name = broadcastName(post.fileId);
  const { title, description, url, imageUrl } = emailFields(post.postPath, post.data, post.content);
  const subject = generateEmailSubject(title, description);

  if (alreadySent.has(name)) {
    console.log(`${post.fileId}: already sent in Resend (${name}), recording it in state.`);
    if (!DRY_RUN) markSent(post.fileId);
    continue;
  }
  if (DRY_RUN) {
    console.log(`Would send ${post.fileId} -> ${url} with subject "${subject}"`);
    continue;
  }

  const html = await renderEmailTemplate({ title, description, url, imageUrl, siteName: SITE_NAME });
  // `send: true` creates and sends in one call, so no draft waits for a manual click.
  const { id } = await resend('POST', '/broadcasts', { segment_id: segment.id, from: FROM, subject, html, name, send: true });
  console.log(`✓ Sent ${post.fileId} (broadcast ${id}) to "${segment.name}"`);
  markSent(post.fileId);
}
