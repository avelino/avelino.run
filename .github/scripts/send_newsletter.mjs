import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';
import { renderEmailTemplate } from './NewsletterTemplate.mjs';
import {
  normalizeFileId,
  parseAddedPosts,
  parsePostDate,
  selectPosts,
  findSegmentByName,
  broadcastName,
  planForExisting,
  parsePositiveInt,
} from './newsletter_lib.mjs';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.NEWSLETTER_FROM;
const BASE_URL = process.env.SITE_BASE_URL || 'https://avelino.run';
const SITE_NAME = process.env.SITE_NAME || 'avelino.run';
// Only contacts in this Resend Segment get the email. Resolved by name unless an id is given.
const SEGMENT_NAME = process.env.RESEND_SEGMENT_NAME || 'news.avelino.run';
const SEGMENT_ID = process.env.RESEND_SEGMENT_ID || '';
// Blast guards: only posts dated within MAX_AGE_DAYS, at most MAX_PER_RUN per run.
const MAX_AGE_DAYS = parsePositiveInt(process.env.NEWSLETTER_MAX_AGE_DAYS, 7);
const MAX_PER_RUN = parsePositiveInt(process.env.NEWSLETTER_MAX_PER_RUN, 1);
const DRY_RUN = /^(1|true|yes)$/i.test(process.env.NEWSLETTER_DRY_RUN || '');
const RESEND_API = 'https://api.resend.com';

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

// ---- Resend REST API (Segments + Broadcasts) ---------------------------------

async function resendRequest(method, apiPath, body) {
  const res = await fetch(`${RESEND_API}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`Resend ${method} ${apiPath} failed with ${res.status}: ${json.message || text}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function listAll(apiPath) {
  const items = [];
  let after;
  for (let page = 0; page < 100; page++) {
    const qs = new URLSearchParams({ limit: '100' });
    if (after) qs.set('after', after);
    const json = await resendRequest('GET', `${apiPath}?${qs}`);
    const data = Array.isArray(json.data) ? json.data : [];
    items.push(...data);
    if (!json.has_more || !data.length) return items;
    after = data[data.length - 1].id;
  }
  throw new Error(`Too many pages while listing ${apiPath}`);
}

async function resolveSegment() {
  if (SEGMENT_ID) {
    const seg = await resendRequest('GET', `/segments/${encodeURIComponent(SEGMENT_ID)}`);
    if (seg.name !== SEGMENT_NAME) {
      throw new Error(`RESEND_SEGMENT_ID points to segment "${seg.name}", expected "${SEGMENT_NAME}". Refusing to send.`);
    }
    return seg;
  }
  return findSegmentByName(await listAll('/segments'), SEGMENT_NAME);
}

// ---- Post discovery ------------------------------------------------------------

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

const walkBlogPosts = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkBlogPosts(entryPath);
    if (entry.isFile() && /\.mdx?$/i.test(entry.name)) return [path.relative(process.cwd(), entryPath)];
    return [];
  });

function readPost(postPath) {
  const raw = fs.readFileSync(postPath, 'utf8');
  const { data, content } = matter(raw);
  return { data, content, draft: data?.draft === true, date: parsePostDate(data?.date) };
}

function gitDiffNameStatus() {
  const currentSha = process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim();
  let parentSha = process.env.GITHUB_BASE_SHA;
  if (!parentSha || /^0+$/.test(parentSha)) {
    try { parentSha = execSync(`git rev-parse ${currentSha}^`).toString().trim(); } catch { parentSha = ''; }
  }
  console.log(`Current commit: ${currentSha}`);
  console.log(`Parent commit: ${parentSha || 'unknown'}`);
  if (!parentSha || parentSha === currentSha) return '';
  try {
    return execSync(`git diff --name-status ${parentSha} ${currentSha}`).toString();
  } catch (e) {
    console.warn(`Could not diff ${parentSha}..${currentSha}: ${e.message}`);
    return '';
  }
}

function buildEmailFields(postPath, data, content) {
  const title = (data.title || path.basename(postPath, path.extname(postPath))).toString();
  const description = (data.description || content.replace(/[#>*_\-\[\]\(\)`]/g, '').trim().slice(0, 220)).toString();

  let urlPath;
  if (data.url) urlPath = data.url.startsWith('/') ? data.url : '/' + data.url;
  else if (data.slug) urlPath = data.slug.startsWith('/') ? data.slug : '/' + data.slug;
  else urlPath = '/' + postPath.replace(/^content\/blog\//, '').replace(/\.mdx?$/i, '');
  urlPath = urlPath.replace(/\/+/g, '/');
  const url = new URL(urlPath, BASE_URL).toString();

  let imageUrl = null;
  const imgPath = data.img || data.image;
  if (imgPath) {
    imageUrl = /^https?:\/\//.test(imgPath)
      ? imgPath
      : new URL(imgPath.startsWith('/') ? imgPath : '/' + imgPath, BASE_URL).toString();
  }
  return { title, description, url, imageUrl };
}

// ---- Main ----------------------------------------------------------------------

const statePath = path.join(process.cwd(), '.newsletter_state.json');

function loadState() {
  let state = { lastSent: [] };
  if (fs.existsSync(statePath)) {
    try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { console.warn('Could not parse state file, starting fresh'); }
  }
  if (!Array.isArray(state.lastSent)) state.lastSent = [];
  state.lastSent = Array.from(new Set(state.lastSent.filter(Boolean).map((p) => normalizeFileId(p)).filter(Boolean)));
  return state;
}

function recordSent(state, fileId) {
  if (DRY_RUN) return;
  if (!state.lastSent.includes(fileId)) state.lastSent.push(fileId);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`✓ Recorded ${fileId} in .newsletter_state.json`);
}

async function main() {
  if (!FROM) fail('Missing NEWSLETTER_FROM');
  if (!RESEND_API_KEY && !DRY_RUN) fail('Missing RESEND_API_KEY');

  console.log(`Segment: "${SEGMENT_NAME}"${SEGMENT_ID ? ` (id from RESEND_SEGMENT_ID)` : ' (resolved by name)'}`);
  console.log(`From: ${FROM} | max age: ${MAX_AGE_DAYS}d | max per run: ${MAX_PER_RUN} | dry run: ${DRY_RUN}`);

  const state = loadState();
  const sentSet = new Set(state.lastSent);

  // Candidates: posts added in this push + any published post not yet in the state file.
  // selectPosts() applies the age window and per-run cap, so old unsent posts never go out in bulk.
  const addedInPush = parseAddedPosts(gitDiffNameStatus());
  console.log(`Posts added in this push: ${addedInPush.length ? addedInPush.join(', ') : '(none)'}`);
  const allPosts = fs.existsSync(BLOG_DIR) ? walkBlogPosts(BLOG_DIR) : [];
  const candidatePaths = Array.from(new Set([...addedInPush, ...allPosts]))
    .filter((p) => !sentSet.has(normalizeFileId(p)));

  const candidates = candidatePaths.flatMap((postPath) => {
    try {
      const { draft, date } = readPost(postPath);
      return [{ fileId: normalizeFileId(postPath), postPath, draft, date }];
    } catch (e) {
      console.warn(`Skip ${postPath}: cannot read frontmatter (${e.message})`);
      return [];
    }
  });

  const { selected, skipped } = selectPosts({ candidates, sentSet, maxAgeDays: MAX_AGE_DAYS, maxPerRun: MAX_PER_RUN });
  for (const s of skipped) console.log(`Not sending ${s.fileId}: ${s.reason}`);

  if (!selected.length) {
    console.log('Nothing to send.');
    return;
  }
  console.log(`Will send: ${selected.map((s) => s.fileId).join(', ')}`);

  if (!RESEND_API_KEY) {
    console.log('Dry run without RESEND_API_KEY: skipping segment lookup.');
    return;
  }

  // Fail loudly if the segment is missing. There is no fallback to a whole audience.
  const segment = await resolveSegment();
  console.log(`✓ Segment "${segment.name}" -> ${segment.id}`);

  const existing = await listAll('/broadcasts');

  for (const post of selected) {
    const { data, content } = readPost(post.postPath);
    const { title, description, url, imageUrl } = buildEmailFields(post.postPath, data, content);
    const name = broadcastName(post.fileId);
    const plan = planForExisting(existing, name, segment.id);
    console.log(`\n=== ${post.fileId} -> ${url}`);
    for (const d of plan.staleDrafts) {
      console.warn(`Ignoring old draft broadcast ${d.id} for this post (different audience/segment). Delete it in Resend if you like.`);
    }

    if (plan.action === 'skip') {
      console.log(`Already ${plan.broadcast.status} in Resend (${plan.broadcast.id}). Not sending again.`);
      recordSent(state, post.fileId);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry run] would ${plan.action === 'send-draft' ? `send existing draft ${plan.broadcast.id}` : 'create and send a broadcast'} to segment ${segment.id}, subject: ${generateEmailSubject(title, description)}`);
      continue;
    }

    if (plan.action === 'send-draft') {
      await resendRequest('POST', `/broadcasts/${plan.broadcast.id}/send`, {});
      console.log(`✓ Sent existing draft ${plan.broadcast.id}`);
      recordSent(state, post.fileId);
      continue;
    }

    const html = await renderEmailTemplate({ title, description, url, imageUrl, siteName: SITE_NAME });
    const subject = generateEmailSubject(title, description);
    console.log(`Subject: ${subject} | HTML: ${html.length} chars`);

    // Create and send in one call (`send: true`), so no draft is left waiting for a manual click.
    const created = await resendRequest('POST', '/broadcasts', {
      segment_id: segment.id,
      from: FROM,
      subject,
      html,
      name,
      send: true,
    });
    if (!created.id) fail(`Unexpected response creating broadcast: ${JSON.stringify(created)}`);
    console.log(`✓ Broadcast ${created.id} created and sent to segment "${segment.name}"`);
    recordSent(state, post.fileId);
  }
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

main().catch((err) => fail(err.stack || err.message));
