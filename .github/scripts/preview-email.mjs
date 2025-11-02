import { renderEmailTemplate } from './NewsletterTemplate.mjs';
import fs from 'fs';
import path from 'path';

// Sample data for preview (without image, matching actual post)
const sampleData = {
  title: "Automating newsletter delivery with Hugo, Resend, and GitHub Actions: building an active community around your static site",
  description: "A practical guide to building a Substack-like newsletter system for Hugo sites using Resend.com and GitHub Actions, with automatic post detection, duplicate prevention, and community engagement mechanisms.",
  url: "https://avelino.run/automating-newsletter-hugo-resend-github-actions-building-active-community",
  imageUrl: null, // No image in this post
  siteName: "avelino.run"
};

async function preview() {
  console.log('Rendering email template...\n');
  console.log('Title:', sampleData.title);
  console.log('Description:', sampleData.description);
  console.log('URL:', sampleData.url);
  console.log('Image:', sampleData.imageUrl || 'None');
  console.log('Site:', sampleData.siteName);
  console.log('\nGenerating HTML...\n');

  try {
    const html = await renderEmailTemplate(sampleData);

    const outputPath = path.join(process.cwd(), 'email-preview.html');
    fs.writeFileSync(outputPath, html, 'utf8');

    console.log(`✓ Email preview generated successfully!`);
    console.log(`  File: ${outputPath}`);
    console.log(`  Open it in your browser to see how it looks.\n`);
    console.log('HTML preview (first 500 chars):');
    console.log(html.substring(0, 500) + '...\n');
  } catch (error) {
    console.error('Error rendering email:', error);
    process.exit(1);
  }
}

preview();

