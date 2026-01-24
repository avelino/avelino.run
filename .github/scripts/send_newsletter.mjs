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
  console.error('RESEND_API_KEY:', RESEND_API_KEY ? 'SET (hidden)' : 'NOT SET');
  console.error('RESEND_AUDIENCE_ID:', AUDIENCE_ID ? 'SET (hidden)' : 'NOT SET');
  console.error('NEWSLETTER_FROM:', FROM ? FROM : 'NOT SET');
  process.exit(1);
}

console.log('Environment variables check:');
console.log('RESEND_API_KEY: SET');
console.log('RESEND_AUDIENCE_ID:', AUDIENCE_ID);
console.log('NEWSLETTER_FROM:', FROM);
console.log('SITE_BASE_URL:', BASE_URL);
console.log('SITE_NAME:', SITE_NAME);

const resend = new Resend(RESEND_API_KEY);
const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

const walkBlogPosts = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkBlogPosts(entryPath);
    }
    if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
      return [entryPath];
    }
    return [];
  });
};

const normalizeFileId = (filePath) => {
  if (!filePath) return '';

  let normalized = filePath;

  if (path.isAbsolute(normalized)) {
    normalized = path.relative(process.cwd(), normalized);
  }

  normalized = normalized
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/^content\//, '')
    .replace(/^blog\//, '');

  if (!normalized) return '';

  return `blog/${normalized}`;
};

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

state.lastSent = state.lastSent
  .filter(Boolean)
  .map(normalizeFileId)
  .filter(Boolean);

const normalizedStateSet = new Set(state.lastSent);

// Detect new files in content/blog/ from the last commit
// Use GitHub Actions context if available (github.event.before is the previous commit SHA)
const currentSha = process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim();
let parentSha = process.env.GITHUB_BASE_SHA;

// If GITHUB_BASE_SHA is not set, try to get the parent commit
if (!parentSha) {
  try {
    parentSha = execSync(`git rev-parse ${currentSha}^`).toString().trim();
  } catch (e) {
    // If no parent, try HEAD~1
    try {
      parentSha = execSync('git rev-parse HEAD~1').toString().trim();
    } catch (e2) {
      console.warn('Could not determine parent commit, trying alternative method');
      // Last resort: use git log to find the previous commit
      try {
        const logOutput = execSync('git log --format=%H -2').toString().trim().split('\n');
        if (logOutput.length >= 2) {
          parentSha = logOutput[1];
        }
      } catch (e3) {
        console.error('Failed to determine parent commit');
      }
    }
  }
}

console.log(`Current commit: ${currentSha}`);
console.log(`Parent commit: ${parentSha || 'unknown'}`);

let diff;
if (parentSha && currentSha !== parentSha) {
  try {
    diff = execSync(`git diff --name-status ${parentSha} ${currentSha}`).toString();
    console.log(`Using diff between ${parentSha.substring(0, 7)} and ${currentSha.substring(0, 7)}`);
  } catch (e) {
    console.warn(`Failed to diff ${parentSha}..${currentSha}, trying HEAD~1 HEAD`);
    try {
      diff = execSync('git diff --name-status HEAD~1 HEAD').toString();
    } catch (e2) {
      console.error('Failed to get git diff:', e2.message);
      process.exit(1);
    }
  }
} else {
  // Fallback: use HEAD~1 HEAD
  console.warn('No valid parent SHA, using HEAD~1 HEAD');
  try {
    diff = execSync('git diff --name-status HEAD~1 HEAD').toString();
  } catch (e) {
    console.error('Failed to get git diff:', e.message);
    process.exit(1);
  }
}

console.log('Git diff output:', diff);

const diffEntries = diff
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => line.split('\t').filter(Boolean))
  .filter(parts => parts.length >= 2);

const isBlogPostPath = (filePath) =>
  filePath && filePath.startsWith('content/blog/') && /\.(md|mdx)$/i.test(filePath);

const addedCandidates = diffEntries
  .flatMap(parts => {
    const rawStatus = parts[0] || '';
    const statusType = rawStatus[0];

    if (statusType === 'A') {
      const filePath = parts[1];
      return isBlogPostPath(filePath) ? [{ filePath, status: 'A' }] : [];
    }

    if (statusType === 'R' || statusType === 'C') {
      const oldPath = parts[1];
      const newPath = parts[parts.length - 1];
      if (isBlogPostPath(newPath)) {
        return [{ filePath: newPath, status: statusType, oldPath }];
      }
    }

    return [];
  });

const added = Array.from(new Set(
  addedCandidates
    .filter(entry => entry.status === 'A' || !isBlogPostPath(entry.oldPath || ''))
    .map(entry => entry.filePath)
));

const addedWithFallback = [...added];

if (!addedWithFallback.length) {
  console.log('No new posts detected in diff. Checking for unsent published posts...');

  const allPosts = fs.existsSync(BLOG_DIR) ? walkBlogPosts(BLOG_DIR) : [];
  const unsent = allPosts
    .map(postPath => {
      try {
        const raw = fs.readFileSync(postPath, 'utf8');
        const { data } = matter(raw);
        const draft = data?.draft === true;
        const parsedDate = data?.date ? new Date(data.date) : null;
        const date = parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime())
          ? parsedDate
          : null;
        return { postPath, draft, date };
      } catch (e) {
        console.warn(`Failed to read frontmatter for ${postPath}:`, e.message);
        return null;
      }
    })
    .filter(Boolean)
    .filter(({ postPath, draft }) => {
      if (draft) return false;
      const fileId = normalizeFileId(postPath);
      return !normalizedStateSet.has(fileId);
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        return a.date - b.date;
      }
      if (a.date) return -1;
      if (b.date) return 1;
      return a.postPath.localeCompare(b.postPath);
    });

  if (unsent.length) {
    const fallbackPosts = unsent.map(({ postPath }) => postPath);
    console.log(`Found ${fallbackPosts.length} unsent post(s) based on state. Adding them to processing queue.`);
    addedWithFallback.push(...fallbackPosts);
  }
}

const filesToProcess = Array.from(new Set(addedWithFallback));

console.log(`Found ${added.length} new file(s) in git diff`);

if (!filesToProcess.length) {
  console.log('No new posts added and no unsent posts found.');
  // Debug: list all commits and files
  try {
    const recentCommits = execSync('git log --oneline -5').toString();
    console.log('Recent commits:', recentCommits);
    const recentFiles = execSync('git log --name-status --oneline -1').toString();
    console.log('Files in last commit:', recentFiles);
  } catch (e) {
    console.warn('Could not get debug info:', e.message);
  }
  process.exit(0);
}

console.log(`Found ${filesToProcess.length} post(s) to process.`);
console.log(`Files to process:`, filesToProcess);

// Send 1..N posts added in the commit
for (const postPath of filesToProcess) {
  // Use relative file path as unique identifier
  const fileId = normalizeFileId(postPath);

  console.log(`\n=== Processing post: ${fileId} ===`);

  if (normalizedStateSet.has(fileId)) {
    console.log(`Skip: ${fileId} already sent.`);
    continue;
  }

  console.log(`Post ${fileId} is new, proceeding with newsletter send...`);

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
  console.log(`Audience ID: ${AUDIENCE_ID}`);
  console.log(`From: ${FROM}`);
  console.log(`HTML length: ${html.length} characters`);

  try {
    const response = await resend.broadcasts.create({
      audienceId: AUDIENCE_ID,
      from: FROM,
      subject: emailSubject,
      html,
      name: `post:${fileId.replace(/[\/\.]/g, '-')}`
    });

    console.log('Resend API response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('Error creating broadcast:', response.error);
      process.exit(1);
    }

    if (!response.data || !response.data.id) {
      console.error('Invalid response from Resend API. Response:', JSON.stringify(response, null, 2));
      process.exit(1);
    }

    const broadcastId = response.data.id;
    console.log(`✓ Broadcast created successfully (${broadcastId})`);

    // Send the broadcast immediately if possible, otherwise retry with a short delay
    let sendResponse = await resend.broadcasts.send(broadcastId);

    if (sendResponse.error && sendResponse.error.message?.includes('future date')) {
      const fallbackSchedule = new Date(Date.now() + 60_000).toISOString();
      console.warn('Immediate send rejected, retrying with scheduledAt:', fallbackSchedule);
      sendResponse = await resend.broadcasts.send(broadcastId, { scheduledAt: fallbackSchedule });
    }

    console.log('Send broadcast response:', JSON.stringify(sendResponse, null, 2));

    if (sendResponse.error) {
      console.error('Error sending broadcast:', sendResponse.error);
      process.exit(1);
    }

    console.log(`✓ Broadcast sent successfully (${broadcastId}) for: ${title}`);
  } catch (err) {
    console.error('Exception while creating/sending broadcast:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    process.exit(1);
  }

  // Update state with file identifier
  state.lastSent.push(fileId);
  state.lastSent = Array.from(new Set(state.lastSent));
  normalizedStateSet.add(fileId);
  // Write state immediately after each successful send
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`✓ Updated state file: ${fileId} added to lastSent`);
}

// Final state save (in case of multiple posts)
if (filesToProcess.length > 0) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`✓ Final state saved: ${state.lastSent.length} total posts tracked`);
}
