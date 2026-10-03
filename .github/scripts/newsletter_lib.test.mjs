// Run with: node --test .github/scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeFileId, parseAddedPosts, selectPosts, findSegmentByName, broadcastName, planForExisting,
} from './newsletter_lib.mjs';

const now = new Date('2026-10-03T13:00:00Z');
const post = (fileId, date, draft = false) => ({ fileId, postPath: `content/${fileId}`, draft, date: date ? new Date(date) : null });

test('normalizeFileId', () => {
  assert.equal(normalizeFileId('content/blog/2026-10-a.md'), 'blog/2026-10-a.md');
  assert.equal(normalizeFileId('blog/2026-10-a.md'), 'blog/2026-10-a.md');
  assert.equal(normalizeFileId('2026-10-a.md'), 'blog/2026-10-a.md');
});

test('parseAddedPosts keeps only new blog posts', () => {
  const diff = 'A\tcontent/blog/2026-10-a.md\nM\tcontent/blog/2026-09-b.md\nA\tREADME.md\nR100\tdrafts/x.md\tcontent/blog/2026-10-c.md\nR100\tcontent/blog/old.md\tcontent/blog/new.md\n';
  assert.deepEqual(parseAddedPosts(diff), ['content/blog/2026-10-a.md', 'content/blog/2026-10-c.md']);
});

test('selectPosts: old unsent posts are never blasted, newest within window wins', () => {
  const candidates = [
    post('blog/2026-07-obcecado.md', '2026-07-18'),
    post('blog/2026-08-engine.md', '2026-08-17'),
    post('blog/2026-09-page.md', '2026-09-14'),
    post('blog/2026-10-pointer.md', '2026-10-03'),
    post('blog/2026-10-draft.md', '2026-10-02', true),
    post('blog/2010-old.md', '2010-05-25'),
  ];
  const { selected, skipped } = selectPosts({ candidates, sentSet: new Set(['blog/2010-old.md']), now, maxAgeDays: 7, maxPerRun: 1 });
  assert.deepEqual(selected.map((s) => s.fileId), ['blog/2026-10-pointer.md']);
  const reasons = Object.fromEntries(skipped.map((s) => [s.fileId, s.reason]));
  assert.match(reasons['blog/2026-09-page.md'], /older than 7 days/);
  assert.match(reasons['blog/2026-07-obcecado.md'], /older than 7 days/);
  assert.equal(reasons['blog/2026-10-draft.md'], 'draft');
  assert.match(reasons['blog/2010-old.md'], /already/);
});

test('selectPosts: per-run cap defers the rest', () => {
  const candidates = [post('blog/a.md', '2026-10-01'), post('blog/b.md', '2026-10-02')];
  const { selected, skipped } = selectPosts({ candidates, sentSet: new Set(), now, maxAgeDays: 7, maxPerRun: 1 });
  assert.deepEqual(selected.map((s) => s.fileId), ['blog/b.md']);
  assert.match(skipped[0].reason, /per-run limit/);
});

test('selectPosts: nothing eligible after the window passes', () => {
  const { selected } = selectPosts({ candidates: [post('blog/2026-10-pointer.md', '2026-10-03')], sentSet: new Set(), now: new Date('2026-10-11T00:00:00Z'), maxAgeDays: 7, maxPerRun: 1 });
  assert.equal(selected.length, 0);
});

test('findSegmentByName fails loudly, never falls back', () => {
  const segs = [{ id: 's1', name: 'General' }, { id: 's2', name: 'news.avelino.run' }];
  assert.equal(findSegmentByName(segs, 'news.avelino.run').id, 's2');
  assert.throws(() => findSegmentByName([{ id: 's1', name: 'General' }], 'news.avelino.run'), /not found/);
  assert.throws(() => findSegmentByName([], 'news.avelino.run'), /not found/);
  assert.throws(() => findSegmentByName([...segs, { id: 's3', name: 'news.avelino.run' }], 'news.avelino.run'), /More than one/);
});

test('planForExisting avoids duplicate broadcasts', () => {
  const name = broadcastName('blog/2026-10-the-pointer-was-right.md');
  assert.equal(name, 'post:blog-2026-10-the-pointer-was-right-md');
  const oldDraft = { id: 'b0', name, status: 'draft', audience_id: 'aud-old' };
  assert.equal(planForExisting([oldDraft], name, 'seg').action, 'create');
  assert.equal(planForExisting([oldDraft], name, 'seg').staleDrafts.length, 1);
  assert.equal(planForExisting([{ id: 'b1', name, status: 'draft', segment_id: 'seg' }], name, 'seg').action, 'send-draft');
  assert.equal(planForExisting([oldDraft, { id: 'b2', name, status: 'sent', segment_id: 'seg' }], name, 'seg').action, 'skip');
  assert.equal(planForExisting([{ id: 'b3', name: 'other', status: 'sent' }], name, 'seg').action, 'create');
});
