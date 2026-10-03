// Pure helpers for send_newsletter.mjs, kept apart so they can be unit tested:
//   node --test .github/scripts/

const DAY_MS = 24 * 60 * 60 * 1000;

/** "content/blog/x.md" or "blog/x.md" -> "blog/x.md", the id stored in .newsletter_state.json */
export const toFileId = (filePath) =>
  'blog/' + filePath.replace(/\\/g, '/').replace(/^(\.\/)?(content\/)?(blog\/)?/, '');

/** Broadcast name in Resend. Also used to detect a post that was already sent. */
export const broadcastName = (fileId) => `post:${fileId.replace(/[/.]/g, '-')}`;

/** The one segment with this name. Throws if there is none or more than one: never send to anything else. */
export function findSegmentByName(segments, name) {
  const matches = segments.filter((s) => s.name === name);
  if (matches.length !== 1) {
    const found = segments.map((s) => s.name).join(', ') || '(none)';
    throw new Error(`Expected exactly one Resend segment named "${name}", found ${matches.length}. Segments: ${found}`);
  }
  return matches[0];
}

/**
 * Posts to email in this run: published, not sent yet, dated within maxAgeDays,
 * newest first, at most maxPerRun. The age limit keeps an old backlog of unsent
 * posts from going out all at once.
 * posts: [{ fileId, draft, date }]
 */
export function pickPosts(posts, sentIds, { now = new Date(), maxAgeDays, maxPerRun }) {
  return posts
    .filter((p) => !p.draft && !sentIds.has(p.fileId))
    .filter((p) => p.date && now - p.date <= maxAgeDays * DAY_MS)
    .sort((a, b) => b.date - a.date)
    .slice(0, maxPerRun);
}
