---
date: "2025-11-02"
draft: false
title: "Automating newsletter delivery with Hugo, Resend, and GitHub Actions: building an active community around your static site"
tags: ["hugo", "resend", "github actions", "newsletter", "automation", "community", "email marketing"]
description: "A practical guide to building a Substack-like newsletter system for Hugo sites using Resend.com and GitHub Actions, with automatic post detection, duplicate prevention, and community engagement mechanisms"
url: "/automating-newsletter-hugo-resend-github-actions-building-active-community"
---

Building an audience around a static site is fundamentally different from social media. While platforms like Twitter or LinkedIn provide built-in notification systems, static sites are silent by default. Your readers discover your content only if they remember to check back—which they rarely do.

This is the core problem: **how do you keep your community engaged when your publishing platform has no native notification system?**

The answer isn't to abandon static sites for dynamic platforms. It's to add the missing notification layer through automation. In this article, I'll show you how to build a Substack-like newsletter system for Hugo sites using [Resend.com](https://resend.com?ref=avelino.run) and GitHub Actions—complete with duplicate prevention, automatic post detection, and community engagement mechanisms.

## The static site engagement problem

Static site generators like Hugo excel at performance, simplicity, and hosting economics. They generate pure HTML, CSS, and JavaScript that can be served from CDNs for pennies. But this architectural strength creates an engagement weakness: there's no server-side logic to notify readers when new content is published.

Traditional solutions have significant drawbacks:

- **RSS feeds**: Require readers to actively use feed readers—most don't
- **Social media announcements**: Fragment your audience across platforms and create dependency on external networks (see [Interactions: IRL vs. Social Media - What Really Matters?](https://avelino.run/interactions-irl-vs-social-media-what-really-matters) for why direct channels matter)
- **Email newsletters**: Manual effort creates friction; posts often go unannounced or get announced inconsistently

The gap between "publishing" and "notifying" leads to a classic problem: you write great content, but your audience never knows it exists. Engagement metrics stagnate, and the community you're trying to build remains dormant.

## The automation solution: Hugo + Resend + GitHub Actions

The solution is to automate the entire notification flow:

1. **Detect new posts automatically** when you commit to your repository
2. **Extract content metadata** (title, description, URL) from markdown frontmatter
3. **Send broadcast emails** via Resend's broadcast API to all subscribers
4. **Prevent duplicate sends** by tracking what's already been delivered
5. **Update state automatically** in version control for auditability

This creates a closed loop: write → commit → publish → notify. No manual steps, no forgotten announcements, no duplicate sends.

### Why this architecture works

**GitHub Actions as the orchestrator**: Actions trigger on git events, making them perfect for "content published" detection. The workflow runs in a sandboxed environment with access to your repository state, git history, and secrets. (For more on GitHub Actions workflows, see [How to reuse workflow in GitHub Action pipeline](https://avelino.run/how-to-reuse-workflow-in-github-action-pipeline).)

**Resend for email delivery**: Resend's broadcast API is designed for newsletters. Unlike transactional email APIs, broadcasts are optimized for one-to-many sends with built-in unsubscribe handling and delivery tracking.

**State management in git**: Tracking sent posts in `.newsletter_state.json` keeps the system auditable and reproducible. Every change is versioned, making it easy to understand what was sent when.

**Hugo frontmatter as the data source**: Markdown frontmatter already contains title, description, and URL—everything needed to generate newsletter content without additional configuration.

## Implementation: building the system

The implementation consists of three components:

### 1. GitHub Actions workflow

The workflow triggers on pushes to `content/blog/**` and executes the newsletter script:

```yaml
name: Newsletter on new post

on:
  push:
    branches: [main]
    paths:
      - "content/blog/**"

jobs:
  send-broadcast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # Needed for git diff
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install deps
        run: npm ci || npm i
      - name: Send newsletter broadcast
        run: node .github/scripts/send_newsletter.mjs
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          RESEND_AUDIENCE_ID: ${{ secrets.RESEND_AUDIENCE_ID }}
          NEWSLETTER_FROM: ${{ secrets.NEWSLETTER_FROM }}
          SITE_BASE_URL: ${{ secrets.SITE_BASE_URL }}
      - name: Commit newsletter state
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .newsletter_state.json
          git commit -m "update newsletter state [skip ci]" || echo "no changes"
          git push
```

See the full implementation: [`.github/workflows/newsletter.yml`](https://github.com/avelino/avelino.run/blob/main/.github/workflows/newsletter.yml)

Key design decisions:

- **`fetch-depth: 2`**: Required to compare `HEAD~1` and `HEAD` for detecting new files
- **Path-based triggering**: Only runs when blog content changes, reducing unnecessary executions
- **Automatic state commit**: Updates the tracking file and commits it back, creating an audit trail

### 2. Newsletter script

The script handles detection, extraction, and sending:

```javascript
import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import matter from 'gray-matter';
import { execSync } from 'child_process';

// Detect new files via git diff
const diff = execSync('git diff --name-status HEAD~1 HEAD').toString();
const added = diff
  .split('\n')
  .map(l => l.trim().split('\t'))
  .filter(p => p[0] === 'A' && p[1] && p[1].startsWith('content/blog/'))
  .map(p => p[1])
  .filter(f => /\.(md|mdx)$/.test(f));

// Read state to prevent duplicates
const statePath = path.join(process.cwd(), '.newsletter_state.json');
let state = { lastSent: [] };
if (fs.existsSync(statePath)) {
  state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

// Process each new post
for (const postPath of added) {
  const fileId = postPath.replace(/^content\/blog\//, '');

  if (state.lastSent.includes(fileId)) {
    continue; // Skip already sent posts
  }

  // Extract frontmatter and content
  const raw = fs.readFileSync(postPath, 'utf8');
  const { data, content } = matter(raw);

  // Generate email HTML
  const html = generateEmailHTML(data, content);

  // Send broadcast
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.broadcasts.create({
    audienceId: process.env.RESEND_AUDIENCE_ID,
    from: process.env.NEWSLETTER_FROM,
    subject: `Novo post: ${data.title}`,
    html,
  });

  // Update state
  state.lastSent.push(fileId);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}
```

See the full implementation: [`.github/scripts/send_newsletter.mjs`](https://github.com/avelino/avelino.run/blob/main/.github/scripts/send_newsletter.mjs)

The script's logic:

- **Git-based detection**: Uses `git diff` to find files added in the latest commit—more reliable than file timestamps
- **Frontmatter parsing**: Uses `gray-matter` to extract Hugo frontmatter, including custom URL fields
- **Duplicate prevention**: Checks `.newsletter_state.json` before sending, ensuring posts are only sent once
- **Broadcast API**: Uses Resend's broadcast endpoint, which is optimized for newsletter delivery

### 3. State management

The `.newsletter_state.json` file tracks all sent posts:

```json
{
  "lastSent": [
    "blog/2025-11-automating-newsletter-hugo-resend-github-actions.md",
    "blog/2025-10-open-source-governance-reference-leading-engineering-teams.md"
  ]
}
```

See the current state file: [`.newsletter_state.json`](https://github.com/avelino/avelino.run/blob/main/.newsletter_state.json)

This file is:

- **Versioned in git**: Full history of what was sent when
- **Human-readable**: Easy to inspect and debug
- **Immutable**: Posts are never removed from the list, preventing re-sends even if the file is reset

## Community engagement mechanisms

The automation doesn't just solve the technical problem—it creates engagement patterns. This aligns with broader principles of [community building in open source](https://avelino.run/communication-the-hidden-backbone-of-successful-open-source-rojects), where consistent, automated communication channels reduce friction and enable scalable engagement:

### 1. Consistent delivery timing

Readers learn when to expect your content. Automation ensures every post is announced, building trust through reliability.

### 2. Zero-friction publishing

No manual steps means you're more likely to publish consistently. The system removes the "I should announce this on email" mental overhead.

### 3. Direct relationship with readers

Email newsletters create a direct channel that you own. Unlike social media platforms, there's no algorithm deciding who sees your content. This direct communication is [the most efficient way to scale your outreach](https://avelino.run/text-e-a-forma-mais-eficiente-de-escalar-sua-comunicacao), as text-based communication allows for asynchronous, thoughtful engagement.

### 4. Analytics and feedback

Resend provides delivery analytics: open rates, click rates, and subscriber growth. This data helps you understand what resonates with your audience.

### 5. Unsubscribe handling

Resend automatically handles unsubscribe requests and maintains compliance with email regulations (GDPR, CAN-SPAM). The system respects user preferences without manual intervention.

## Technical considerations and edge cases

### Handling multiple posts in one commit

The script processes all new posts in a commit sequentially. If you publish multiple posts at once, each gets its own broadcast email—readers see all new content, not just the latest.

### URL generation from Hugo permalinks

Hugo's permalink configuration can generate URLs that don't match the file path. The script handles this by:

1. Checking frontmatter `url` field first (Hugo's explicit URL)
2. Falling back to `slug` if present
3. Defaulting to filename-based slug if neither exists

This ensures newsletter links always point to the correct published URL.

### Initial state population

When setting up the system, populate `.newsletter_state.json` with existing posts to prevent re-sending:

```bash
find content/blog -name "*.md" | sed 's|^content/||' | jq -R -s 'split("\n") | map(select(length > 0))' > .newsletter_state.json
```

### Error handling

The script exits on error, causing the GitHub Action to fail. This surfaces issues immediately:

- Missing environment variables
- Resend API errors
- File system errors

Action logs show exactly what went wrong, making debugging straightforward.

## Comparison with alternatives

| Approach | Pros | Cons |
|----------|------|------|
| **Manual email** | Full control, personal touch | Time-consuming, easy to forget |
| **RSS to email services** | No code required | Limited customization, service dependency |
| **WordPress plugins** | Easy setup | Requires WordPress, plugin maintenance |
| **This solution** | Automated, version-controlled, scalable | Requires GitHub, initial setup |

The automated approach scales: whether you publish once a month or daily, the system handles it without additional effort.

## Conclusion: automation as community infrastructure

Building an active community around static content requires making your publishing system "push" rather than "pull." Automation transforms static sites from silent archives into active communication channels.

The Hugo + Resend + GitHub Actions combination provides:

- **Zero-maintenance operation**: Write and commit—the system handles the rest
- **Duplicate prevention**: State management ensures posts are never sent twice
- **Audit trail**: Git history shows exactly what was sent when
- **Scalability**: Handles one post or hundreds without additional configuration
- **Direct ownership**: You own the subscriber list, email templates, and delivery mechanism

Most importantly, this system turns consistency into a default behavior rather than a conscious effort. When publishing becomes as simple as `git commit && git push`, you're more likely to maintain the publishing cadence that keeps communities engaged.

The technical details matter, but the real value is in creating infrastructure that supports long-term community building. Automation removes friction, and removing friction enables consistency. **Consistency is what builds engaged communities.**

---


### Implementation resources

- **Full implementation**: [avelino/avelino.run repository](https://github.com/avelino/avelino.run)
  - [GitHub Actions workflow](https://github.com/avelino/avelino.run/blob/main/.github/workflows/newsletter.yml)
  - [Newsletter script](https://github.com/avelino/avelino.run/blob/main/.github/scripts/send_newsletter.mjs)
  - [Email template](https://github.com/avelino/avelino.run/blob/main/.github/scripts/NewsletterTemplate.mjs)
  - [State file](https://github.com/avelino/avelino.run/blob/main/.newsletter_state.json)
- [Resend Broadcast API Documentation](https://resend.com/docs/api-reference/broadcasts?ref=avelino.run)
- [GitHub Actions Documentation](https://docs.github.com/en/actions?ref=avelino.run)
- [Hugo Content Management](https://gohugo.io/content-management/?ref=avelino.run)
- [gray-matter Package](https://github.com/jonschlinkert/gray-matter?ref=avelino.run)
