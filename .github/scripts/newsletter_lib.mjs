// Pure helpers for send_newsletter.mjs. No I/O here, so they can be unit tested
// with `node --test .github/scripts/`.

import path from 'path';

/** "content/blog/2026-10-x.md" | "blog/2026-10-x.md" | abs path -> "blog/2026-10-x.md" */
export function normalizeFileId(filePath, cwd = process.cwd()) {
  if (!filePath) return '';
  let normalized = filePath;
  if (path.isAbsolute(normalized)) normalized = path.relative(cwd, normalized);
  normalized = normalized
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/^content\//, '')
    .replace(/^blog\//, '');
  return normalized ? `blog/${normalized}` : '';
}

export const isBlogPostPath = (filePath) =>
  Boolean(filePath) && filePath.startsWith('content/blog/') && /\.(md|mdx)$/i.test(filePath);

/** Blog posts added (or renamed/copied in from outside content/blog) in a `git diff --name-status`. */
export function parseAddedPosts(diffText) {
  const entries = (diffText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('\t').filter(Boolean))
    .filter((parts) => parts.length >= 2);

  const added = [];
  for (const parts of entries) {
    const status = (parts[0] || '')[0];
    if (status === 'A' && isBlogPostPath(parts[1])) added.push(parts[1]);
    if ((status === 'R' || status === 'C') && isBlogPostPath(parts[parts.length - 1]) && !isBlogPostPath(parts[1])) {
      added.push(parts[parts.length - 1]);
    }
  }
  return Array.from(new Set(added));
}

export function parsePostDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Decide which posts to email in this run.
 * candidates: [{ fileId, postPath, draft, date }]
 * Guards against blasting old posts: a post is only eligible if its frontmatter
 * date is within `maxAgeDays`, and at most `maxPerRun` posts go out per run
 * (newest first). Everything else is reported with a reason and left alone.
 */
export function selectPosts({ candidates, sentSet, now = new Date(), maxAgeDays = 7, maxPerRun = 1 }) {
  const skipped = [];
  const eligible = [];
  const seen = new Set();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const c of candidates) {
    if (!c || !c.fileId || seen.has(c.fileId)) continue;
    seen.add(c.fileId);
    if (sentSet.has(c.fileId)) { skipped.push({ fileId: c.fileId, reason: 'already in .newsletter_state.json' }); continue; }
    if (c.draft) { skipped.push({ fileId: c.fileId, reason: 'draft' }); continue; }
    if (!c.date) { skipped.push({ fileId: c.fileId, reason: 'no valid date in frontmatter' }); continue; }
    const ageDays = (now.getTime() - c.date.getTime()) / dayMs;
    if (ageDays > maxAgeDays) {
      skipped.push({ fileId: c.fileId, reason: `older than ${maxAgeDays} days (${Math.floor(ageDays)}d)` });
      continue;
    }
    eligible.push(c);
  }

  eligible.sort((a, b) => b.date - a.date || a.fileId.localeCompare(b.fileId));
  const selected = eligible.slice(0, Math.max(0, maxPerRun));
  for (const c of eligible.slice(selected.length)) {
    skipped.push({ fileId: c.fileId, reason: `over the per-run limit of ${maxPerRun}, will go in a later run` });
  }
  return { selected, skipped };
}

/** Exactly one segment with this name, or throw. Never falls back to anything else. */
export function findSegmentByName(segments, name) {
  const matches = (segments || []).filter((s) => s && s.name === name);
  if (matches.length === 0) {
    const names = (segments || []).map((s) => s && s.name).filter(Boolean);
    throw new Error(`Resend segment "${name}" not found. Segments visible to this API key: ${names.length ? names.join(', ') : '(none)'}`);
  }
  if (matches.length > 1) {
    throw new Error(`More than one Resend segment is named "${name}" (${matches.map((s) => s.id).join(', ')}). Set RESEND_SEGMENT_ID to pick one.`);
  }
  return matches[0];
}

export const broadcastName = (fileId) => `post:${fileId.replace(/[\/\.]/g, '-')}`;

/**
 * Look at broadcasts that already exist in Resend for this post (same name).
 * - any non-draft (queued/scheduled/sending/sent) -> already handled, skip and record in state
 * - a draft for the same segment (created by an earlier run whose send failed) -> send that draft, don't create a duplicate
 * - otherwise -> create a new one (drafts for another audience are ignored and reported)
 */
export function planForExisting(broadcasts, name, segmentId) {
  const same = (broadcasts || []).filter((b) => b && b.name === name);
  const done = same.find((b) => b.status && b.status !== 'draft');
  if (done) return { action: 'skip', broadcast: done, staleDrafts: [] };
  const segOf = (b) => b.segment_id || b.audience_id;
  const reusable = same.find((b) => b.status === 'draft' && segOf(b) === segmentId);
  const staleDrafts = same.filter((b) => b.status === 'draft' && segOf(b) !== segmentId);
  if (reusable) return { action: 'send-draft', broadcast: reusable, staleDrafts };
  return { action: 'create', broadcast: null, staleDrafts };
}

export function parsePositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
