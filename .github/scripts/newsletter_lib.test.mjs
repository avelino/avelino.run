// Run with: node --test .github/scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import { toFileId, broadcastName, findSegmentByName, pickPosts } from './newsletter_lib.mjs';

const now = new Date('2026-10-03T13:00:00Z');
const opts = { now, maxAgeDays: 7, maxPerRun: 1 };
const post = (fileId, date, draft = false) => ({ fileId, date: date ? new Date(date) : null, draft });

test('toFileId and broadcastName', () => {
  assert.equal(toFileId('content/blog/2026-10-a.md'), 'blog/2026-10-a.md');
  assert.equal(toFileId('blog/2026-10-a.md'), 'blog/2026-10-a.md');
  assert.equal(broadcastName('blog/2026-10-the-pointer-was-right.md'), 'post:blog-2026-10-the-pointer-was-right-md');
});

test('findSegmentByName needs exactly one match', () => {
  const segs = [{ id: 's1', name: 'General' }, { id: 's2', name: 'news.avelino.run' }];
  assert.equal(findSegmentByName(segs, 'news.avelino.run').id, 's2');
  assert.throws(() => findSegmentByName([segs[0]], 'news.avelino.run'), /found 0/);
  assert.throws(() => findSegmentByName([...segs, { id: 's3', name: 'news.avelino.run' }], 'news.avelino.run'), /found 2/);
});

test('pickPosts sends only the newest recent unsent post', () => {
  const posts = [
    post('blog/2026-07-obcecado.md', '2026-07-18'),
    post('blog/2026-09-page.md', '2026-09-14'),
    post('blog/2026-10-01-a.md', '2026-10-01'),
    post('blog/2026-10-pointer.md', '2026-10-03'),
    post('blog/2026-10-draft.md', '2026-10-03', true),
    post('blog/no-date.md', null),
  ];
  assert.deepEqual(pickPosts(posts, new Set(), opts).map((p) => p.fileId), ['blog/2026-10-pointer.md']);
  // next run, after the pointer post is recorded: the other recent one goes
  assert.deepEqual(pickPosts(posts, new Set(['blog/2026-10-pointer.md']), opts).map((p) => p.fileId), ['blog/2026-10-01-a.md']);
});

test('pickPosts sends nothing once the backlog is older than the window', () => {
  const later = { ...opts, now: new Date('2026-10-11T00:00:00Z') };
  assert.deepEqual(pickPosts([post('blog/2026-10-pointer.md', '2026-10-03')], new Set(), later), []);
});
