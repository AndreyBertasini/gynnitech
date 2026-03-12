import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const blogPattern = path.join(repoRoot, 'src', 'content', 'blog', '*.{md,mdx}').replace(/\\/g, '/');
const outputDir = path.join(repoRoot, 'public', 'article-covers');

const palettes = [
  ['#00f3ff', '#ccff00', '#4f46e5'],
  ['#fb7185', '#22d3ee', '#a3e635'],
  ['#f59e0b', '#38bdf8', '#8b5cf6'],
  ['#34d399', '#60a5fa', '#f472b6'],
  ['#f97316', '#06b6d4', '#84cc16'],
  ['#818cf8', '#2dd4bf', '#facc15'],
];

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTitle(title, maxLineLength = 22, maxLines = 3) {
  const words = title.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxLineLength) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  const remainingWords = words.slice(lines.join(' ').split(/\s+/).filter(Boolean).length);
  if (remainingWords.length > 0 && lines.length > 0) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = `${lines[lastIndex].replace(/[. ]+$/, '')}...`;
  }

  return lines;
}

function createSvg({ title, category, slug }) {
  const hash = hashString(slug);
  const [accentA, accentB, accentC] = palettes[hash % palettes.length];
  const secondaryHash = hashString(`${slug}:${category}`);
  const orbitX = 820 + (secondaryHash % 220);
  const orbitY = 120 + (secondaryHash % 180);
  const titleLines = wrapTitle(title);

  const titleText = titleLines
    .map((line, index) => {
      const y = 310 + index * 74;
      return `<text x="88" y="${y}" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="800" fill="#ffffff">${escapeXml(line)}</text>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#050505"/>
      <stop offset="0.55" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="accent" x1="110" y1="80" x2="980" y2="540" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${accentA}" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="${accentB}" stop-opacity="0.88"/>
      <stop offset="1" stop-color="${accentC}" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="blur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="42"/>
    </filter>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.35"/>

  <circle cx="1030" cy="96" r="162" fill="${accentA}" fill-opacity="0.18" filter="url(#blur)"/>
  <circle cx="260" cy="610" r="180" fill="${accentB}" fill-opacity="0.14" filter="url(#blur)"/>
  <circle cx="${orbitX}" cy="${orbitY}" r="92" fill="${accentC}" fill-opacity="0.22"/>

  <rect x="72" y="72" width="1056" height="486" rx="32" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
  <rect x="88" y="90" width="164" height="36" rx="18" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)"/>
  <text x="116" y="113" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="1.3" fill="#e2e8f0">${escapeXml(category.toUpperCase())}</text>

  <rect x="88" y="162" width="360" height="10" rx="5" fill="url(#accent)"/>
  <rect x="88" y="184" width="118" height="10" rx="5" fill="rgba(255,255,255,0.12)"/>

  ${titleText}

  <text x="88" y="540" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.72)">GinnyTech · Articoli</text>

  <g opacity="0.95">
    <path d="M820 208C880 144 964 136 1025 190C1088 245 1095 332 1042 396C988 461 902 473 839 421C776 368 762 272 820 208Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>
    <path d="M868 250L963 211L1000 306L905 344L868 250Z" fill="url(#accent)" fill-opacity="0.88"/>
    <path d="M840 366L1020 366" stroke="rgba(255,255,255,0.16)" stroke-width="10" stroke-linecap="round"/>
    <path d="M840 400L978 400" stroke="rgba(255,255,255,0.1)" stroke-width="10" stroke-linecap="round"/>
    <path d="M840 434L936 434" stroke="rgba(255,255,255,0.08)" stroke-width="10" stroke-linecap="round"/>
  </g>
</svg>
`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const blogFiles = globSync(blogPattern);

  for (const filePath of blogFiles) {
    const source = await fs.readFile(filePath, 'utf8');
    const { data } = matter(source);
    const slug = path.basename(filePath).replace(/\.(md|mdx)$/i, '');
    const title = data.title || slug;
    const category = data.category || 'Articolo';
    const outputPath = path.join(outputDir, `${slug}.svg`);
    const svg = createSvg({ title, category, slug });
    await fs.writeFile(outputPath, svg, 'utf8');
  }

  console.log(`Generated ${blogFiles.length} article covers in ${path.relative(repoRoot, outputDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
