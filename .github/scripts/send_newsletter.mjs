import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import matter from 'gray-matter';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { renderEmailTemplate } from './NewsletterTemplate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
const FROM = process.env.NEWSLETTER_FROM;
const BASE_URL = process.env.SITE_BASE_URL || 'https://avelino.run';
const SITE_NAME = process.env.SITE_NAME || 'avelino.run';

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

if (!RESEND_API_KEY || !AUDIENCE_ID || !FROM) {
  console.error('Missing required environment variables: RESEND_API_KEY, RESEND_AUDIENCE_ID, NEWSLETTER_FROM');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);
const statePath = path.join(process.cwd(), '.newsletter_state.json');
let state = { lastSent: [] };
if (fs.existsSync(statePath)) {
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (e) {
    console.warn('Could not parse state file, starting fresh');
  }
}
if (!Array.isArray(state.lastSent)) state.lastSent = [];

// Detect new files in content/blog/ from the last commit
const diff = execSync('git diff --name-status HEAD~1 HEAD').toString();
const added = diff
  .split('\n')
  .map(l => l.trim().split('\t'))
  .filter(p => p[0] === 'A' && p[1] && p[1].startsWith('content/blog/'))
  .map(p => p[1])
  .filter(f => /\.(md|mdx)$/.test(f));

if (!added.length) {
  console.log('No new posts added.');
  process.exit(0);
}

console.log(`Found ${added.length} new post(s) to process.`);

// Send 1..N posts added in the commit
for (const postPath of added) {
  // Use relative file path as unique identifier
  const fileId = postPath.replace(/^content\/blog\//, '');

  if (state.lastSent.includes(fileId)) {
    console.log(`Skip: ${fileId} already sent.`);
    continue;
  }

  const raw = fs.readFileSync(postPath, 'utf8');
  const { data, content } = matter(raw);
  const title = (data.title || path.basename(postPath, path.extname(postPath))).toString();
  const description = (data.description || content.replace(/[#>*_\-\[\]\(\)`]/g, '').trim().slice(0, 220)).toString();

  // Generate URL based on Hugo slug or file path
  let urlPath;
  if (data.url) {
    urlPath = data.url.startsWith('/') ? data.url : '/' + data.url;
  } else if (data.slug) {
    urlPath = data.slug.startsWith('/') ? data.slug : '/' + data.slug;
  } else {
    // For blog posts, Hugo uses :slug which is the filename without extension
    const slugFromPath = postPath
      .replace(/^content\/blog\//, '')
      .replace(/\.mdx?$/i, '');
    urlPath = `/${slugFromPath}`;
  }

  // Ensure no duplicate slashes
  urlPath = urlPath.replace(/\/+/g, '/');
  const url = new URL(urlPath, BASE_URL).toString();

  // Generate image URL if available
  let imageUrl = null;
  if (data.img || data.image) {
    const imgPath = data.img || data.image;
    // If image path starts with http, use as is, otherwise make it absolute
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      imageUrl = imgPath;
    } else {
      // Make relative paths absolute
      const normalizedImgPath = imgPath.startsWith('/') ? imgPath : '/' + imgPath;
      imageUrl = new URL(normalizedImgPath, BASE_URL).toString();
    }
  }

  // Render React Email template
  const html = await renderEmailTemplate({
    title,
    description,
    url,
    imageUrl,
    siteName: SITE_NAME,
  });

  // Generate engaging subject line
  const emailSubject = generateEmailSubject(title, description);

  console.log(`Creating broadcast for: ${title}`);
  console.log(`Email subject: ${emailSubject}`);
  const { data: created, error } = await resend.broadcasts.create({
    audienceId: AUDIENCE_ID,
    from: FROM,
    subject: emailSubject,
    html,
    name: `post:${fileId.replace(/[\/\.]/g, '-')}`
  });

  if (error) {
    console.error('Error creating broadcast:', error);
    process.exit(1);
  }

  const { error: sendErr } = await resend.broadcasts.send(created.id, { scheduledAt: 'now' });
  if (sendErr) {
    console.error('Error sending broadcast:', sendErr);
    process.exit(1);
  }

  console.log(`✓ Broadcast sent successfully (${created.id}) for: ${title}`);

  // Update state with file identifier
  state.lastSent.push(fileId);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}
