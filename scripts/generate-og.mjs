// Generate social-share PNG cards from Hugo's per-page ogmeta.json files.
// Reads public/**/ogmeta.json (produced by the `ogmeta` Hugo output format),
// renders an SVG card with the site's light gradient palette + title +
// description, and rasterizes to public/og/<section>/<slug>.png via resvg-js.

import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OG_DIR = path.join(PUBLIC_DIR, "og");
const FONT_PATH = path.join(ROOT, "assets/fonts/og/Inter.ttf");

const WIDTH = 1200;
const HEIGHT = 630;
const PADDING_X = 80;
const CONTENT_WIDTH = WIDTH - PADDING_X * 2;

const COLORS = {
  bgFrom: "#fafafa",
  bgVia: "#f1e9fd",
  bgTo: "#e9d5ff",
  accent: "#663399",
  accentLight: "#a78bfa",
  accentSoft: "#bd93f9",
  textPrimary: "#1a1a2e",
  textSecondary: "#4a5568",
};

const TITLE_SIZE = 64;
const TITLE_LINE_HEIGHT = 1.15;
const TITLE_MAX_LINES = 4;
const DESC_SIZE = 30;
const DESC_LINE_HEIGHT = 1.4;
const DESC_MAX_LINES = 4;

// Approximate average glyph width as a fraction of font size for Inter.
// Bold runs slightly wider than regular.
const TITLE_AVG_EM = 0.56;
const DESC_AVG_EM = 0.52;

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, fontSize, avgEm, maxWidth, maxLines) {
  if (!text) return [];
  const charWidth = fontSize * avgEm;
  const maxChars = Math.max(8, Math.floor(maxWidth / charWidth));
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? current + " " + word : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // Hard-break very long single tokens.
      if (word.length > maxChars) {
        let rest = word;
        while (rest.length > maxChars) {
          lines.push(rest.slice(0, maxChars));
          rest = rest.slice(maxChars);
        }
        current = rest;
      } else {
        current = word;
      }
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length > maxLines) {
    const trimmed = lines.slice(0, maxLines);
    const last = trimmed[trimmed.length - 1];
    trimmed[trimmed.length - 1] = last.replace(/\s+\S*$/, "") + "…";
    return trimmed;
  }
  return lines;
}

function buildSvg({ title, description }) {
  const titleLines = wrapText(
    title,
    TITLE_SIZE,
    TITLE_AVG_EM,
    CONTENT_WIDTH,
    TITLE_MAX_LINES,
  );
  const descLines = wrapText(
    description,
    DESC_SIZE,
    DESC_AVG_EM,
    CONTENT_WIDTH,
    DESC_MAX_LINES,
  );

  const titleY = 220;
  const titleBlockHeight = titleLines.length * TITLE_SIZE * TITLE_LINE_HEIGHT;
  const descY = titleY + titleBlockHeight + 36;

  const titleTspans = titleLines
    .map(
      (line, i) =>
        `<tspan x="${PADDING_X}" dy="${i === 0 ? 0 : TITLE_SIZE * TITLE_LINE_HEIGHT}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const descTspans = descLines
    .map(
      (line, i) =>
        `<tspan x="${PADDING_X}" dy="${i === 0 ? 0 : DESC_SIZE * DESC_LINE_HEIGHT}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.bgFrom}"/>
      <stop offset="55%" stop-color="${COLORS.bgVia}"/>
      <stop offset="100%" stop-color="${COLORS.bgTo}"/>
    </linearGradient>
    <radialGradient id="glow" cx="15%" cy="15%" r="55%">
      <stop offset="0%" stop-color="${COLORS.accentLight}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${COLORS.accentLight}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="92%" cy="95%" r="55%">
      <stop offset="0%" stop-color="${COLORS.accentSoft}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${COLORS.accentSoft}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>

  <rect x="${PADDING_X}" y="100" width="72" height="6" rx="3" fill="${COLORS.accent}"/>

  <text x="${PADDING_X}" y="158" font-family="Inter" font-weight="600" font-size="22" fill="${COLORS.accent}" letter-spacing="0.5">avelino.run</text>

  <text x="${PADDING_X}" y="${titleY}" font-family="Inter" font-weight="700" font-size="${TITLE_SIZE}" fill="${COLORS.textPrimary}" letter-spacing="-1.2">${titleTspans}</text>

  ${descLines.length ? `<text x="${PADDING_X}" y="${descY}" font-family="Inter" font-weight="400" font-size="${DESC_SIZE}" fill="${COLORS.textSecondary}">${descTspans}</text>` : ""}

  <text x="${PADDING_X}" y="${HEIGHT - 60}" font-family="Inter" font-weight="600" font-size="22" fill="${COLORS.textPrimary}">Thiago Avelino</text>
  <text x="${WIDTH - PADDING_X}" y="${HEIGHT - 60}" font-family="Inter" font-weight="500" font-size="22" fill="${COLORS.accent}" text-anchor="end">avelino.run</text>
</svg>`;
}

async function walkOgMeta(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return out;
    throw err;
  }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkOgMeta(p)));
    } else if (e.name === "ogmeta.json") {
      out.push(p);
    }
  }
  return out;
}

async function main() {
  const fontData = await fs.readFile(FONT_PATH);
  const metas = await walkOgMeta(PUBLIC_DIR);
  if (metas.length === 0) {
    console.warn(
      `[generate-og] no ogmeta.json files found under ${PUBLIC_DIR}; did Hugo run first?`,
    );
    return;
  }

  await fs.mkdir(OG_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  for (const metaPath of metas) {
    let meta;
    try {
      meta = JSON.parse(await fs.readFile(metaPath, "utf8"));
    } catch (err) {
      console.warn(`[generate-og] skipping unreadable ${metaPath}: ${err.message}`);
      skipped++;
      continue;
    }
    if (!meta.slug || !meta.ogImagePath) {
      skipped++;
      continue;
    }
    const svg = buildSvg({
      title: meta.title || "",
      description: meta.description || "",
    });
    const resvg = new Resvg(svg, {
      font: {
        fontBuffers: [fontData],
        defaultFontFamily: "Inter",
        loadSystemFonts: false,
      },
      fitTo: { mode: "width", value: WIDTH },
    });
    const png = resvg.render().asPng();
    const outPath = path.join(PUBLIC_DIR, meta.ogImagePath.replace(/^\/+/, ""));
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, png);
    written++;
  }

  console.log(
    `[generate-og] wrote ${written} OG images to ${OG_DIR} (skipped ${skipped})`,
  );
}

main().catch((err) => {
  console.error("[generate-og] failed:", err);
  process.exit(1);
});
