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

const BRAND = {
  dark: '#08090d',
  darker: '#050608',
  surface: '#0d0f14',
  elevated: '#12151c',
  border: '#1e2128',
  accent: '#ccff00',
  accentHover: '#b3e600',
  accentSoft: '#e7ff65',
  text: '#f4f4f5',
  muted: '#94a3b8',
};

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

function titleCase(value) {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapTitle(title, maxLineLength = 23, maxLines = 3) {
  const words = title.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';
  let consumed = 0;

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxLineLength) {
      currentLine = nextLine;
      consumed += 1;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
    consumed += 1;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  if (consumed < words.length && lines.length > 0) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = `${lines[lastIndex].replace(/[. ]+$/, '')}...`;
  }

  return lines;
}

function shortLabel(category, title) {
  const value = `${category} ${title}`.toLowerCase();
  if (/privacy|gdpr|security|sicurezza|etica|dark|fairness/.test(value)) return 'TRUST';
  if (/experiment|test|trigger|guardrail|scorecard|rollout|fake|reverse/.test(value)) return 'TEST';
  if (/data|pipeline|olap|oltp|analytics|dashboard|telemetria|modeling/.test(value)) return 'DATA';
  if (/team|engineer|pm|designer|workflow|collaborazione/.test(value)) return 'TEAM';
  if (/growth|retention|churn|pricing|business|market|sales|marketing/.test(value)) return 'GROWTH';
  if (/ai|agenti|agent|rag|prompt|memoria/.test(value)) return 'AI';
  return 'INSIGHT';
}

function motifName(category, title) {
  const value = `${category} ${title}`.toLowerCase();
  if (/privacy|gdpr|security|sicurezza|etica|dark|fairness/.test(value)) return 'shield';
  if (/experiment|test|trigger|guardrail|scorecard|rollout|fake|reverse/.test(value)) return 'experiment';
  if (/data|pipeline|olap|oltp|analytics|dashboard|telemetria|modeling/.test(value)) return 'pipeline';
  if (/team|engineer|pm|designer|workflow|collaborazione/.test(value)) return 'team';
  if (/growth|retention|churn|pricing|business|market|sales|marketing/.test(value)) return 'growth';
  return 'agent';
}

function numberFromHash(hash, min, span) {
  return min + (hash % span);
}

function buildTitleText(lines) {
  const longest = Math.max(...lines.map((line) => line.length), 1);
  const fontSize = longest > 26 ? 50 : longest > 22 ? 54 : 60;
  const lineGap = fontSize + 15;
  const startY = lines.length === 1 ? 350 : lines.length === 2 ? 318 : 286;

  return lines
    .map((line, index) => {
      const y = startY + index * lineGap;
      return `<text x="86" y="${y}" font-family="Montserrat, Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="800" letter-spacing="-0.2" fill="${BRAND.text}">${escapeXml(line)}</text>`;
    })
    .join('\n  ');
}

function buildPill(category) {
  const label = category.toUpperCase();
  const width = Math.max(168, Math.min(390, label.length * 12 + 58));
  return `<rect x="86" y="78" width="${width}" height="42" rx="21" fill="rgba(255,255,255,0.065)" stroke="rgba(255,255,255,0.12)"/>
  <circle cx="112" cy="99" r="5" fill="${BRAND.accent}"/>
  <text x="130" y="105" font-family="Montserrat, Inter, Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="1.2" fill="#e5e7eb">${escapeXml(label)}</text>`;
}

function agentMotif(seed) {
  const offset = numberFromHash(seed, 0, 36);
  return `
  <g transform="translate(${760 + offset} 146)" opacity="0.96">
    <path d="M56 220C116 118 200 74 308 88C408 101 474 174 484 272C492 360 444 432 358 466C264 504 162 472 96 394C45 334 28 278 56 220Z" fill="rgba(204,255,0,0.055)" stroke="rgba(204,255,0,0.22)" stroke-width="2"/>
    <path d="M114 164L224 110L360 156L414 280L332 392L188 394L96 286Z" stroke="rgba(204,255,0,0.38)" stroke-width="3" fill="none"/>
    <path d="M224 110L188 394M360 156L188 394M96 286L414 280M114 164L332 392" stroke="rgba(255,255,255,0.13)" stroke-width="2"/>
    <circle cx="114" cy="164" r="14" fill="${BRAND.accent}"/>
    <circle cx="224" cy="110" r="10" fill="#f8ffe0"/>
    <circle cx="360" cy="156" r="12" fill="${BRAND.accentSoft}"/>
    <circle cx="414" cy="280" r="16" fill="${BRAND.accent}"/>
    <circle cx="332" cy="392" r="10" fill="#f8ffe0"/>
    <circle cx="188" cy="394" r="14" fill="${BRAND.accentSoft}"/>
    <circle cx="96" cy="286" r="11" fill="#f8ffe0"/>
  </g>`;
}

function pipelineMotif(seed) {
  const offset = numberFromHash(seed, -18, 36);
  return `
  <g transform="translate(${752 + offset} 150)" opacity="0.96">
    <rect x="26" y="34" width="414" height="356" rx="34" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.12)"/>
    <path d="M74 108H198C232 108 232 164 266 164H388" stroke="rgba(204,255,0,0.65)" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M74 214H178C232 214 230 270 282 270H388" stroke="rgba(255,255,255,0.2)" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M74 320H218C250 320 256 296 290 296H388" stroke="rgba(204,255,0,0.32)" stroke-width="12" stroke-linecap="round" fill="none"/>
    <rect x="52" y="82" width="78" height="52" rx="14" fill="${BRAND.accent}"/>
    <rect x="190" y="138" width="84" height="52" rx="14" fill="rgba(255,255,255,0.92)"/>
    <rect x="334" y="138" width="78" height="52" rx="14" fill="${BRAND.accentSoft}"/>
    <rect x="52" y="292" width="78" height="52" rx="14" fill="rgba(255,255,255,0.88)"/>
    <rect x="334" y="244" width="78" height="52" rx="14" fill="${BRAND.accent}"/>
    <text x="76" y="414" font-family="JetBrains Mono, Consolas, monospace" font-size="18" font-weight="700" fill="rgba(255,255,255,0.64)">events - models - insight</text>
  </g>`;
}

function experimentMotif(seed) {
  const offset = numberFromHash(seed, -22, 44);
  return `
  <g transform="translate(${748 + offset} 142)" opacity="0.96">
    <rect x="32" y="40" width="188" height="372" rx="28" fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.12)"/>
    <rect x="252" y="40" width="188" height="372" rx="28" fill="rgba(204,255,0,0.07)" stroke="rgba(204,255,0,0.28)"/>
    <text x="91" y="116" font-family="Montserrat, Inter, Arial, sans-serif" font-size="66" font-weight="900" fill="rgba(255,255,255,0.86)">A</text>
    <text x="309" y="116" font-family="Montserrat, Inter, Arial, sans-serif" font-size="66" font-weight="900" fill="${BRAND.accent}">B</text>
    <rect x="74" y="174" width="102" height="18" rx="9" fill="rgba(255,255,255,0.18)"/>
    <rect x="74" y="218" width="68" height="18" rx="9" fill="rgba(255,255,255,0.12)"/>
    <rect x="74" y="262" width="128" height="18" rx="9" fill="rgba(255,255,255,0.22)"/>
    <rect x="294" y="174" width="102" height="18" rx="9" fill="${BRAND.accent}"/>
    <rect x="294" y="218" width="128" height="18" rx="9" fill="rgba(204,255,0,0.72)"/>
    <rect x="294" y="262" width="76" height="18" rx="9" fill="rgba(204,255,0,0.42)"/>
    <path d="M86 350H384" stroke="rgba(255,255,255,0.13)" stroke-width="2"/>
    <path d="M112 350C156 304 216 330 250 296C288 258 330 282 374 218" stroke="${BRAND.accent}" stroke-width="6" stroke-linecap="round" fill="none"/>
  </g>`;
}

function shieldMotif(seed) {
  const offset = numberFromHash(seed, -16, 32);
  return `
  <g transform="translate(${770 + offset} 132)" opacity="0.96">
    <path d="M238 42L416 106V236C416 348 344 438 238 482C132 438 60 348 60 236V106L238 42Z" fill="rgba(204,255,0,0.07)" stroke="rgba(204,255,0,0.34)" stroke-width="3"/>
    <path d="M238 104L346 144V236C346 308 304 366 238 398C172 366 130 308 130 236V144L238 104Z" fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.16)" stroke-width="2"/>
    <rect x="178" y="224" width="120" height="92" rx="18" fill="${BRAND.accent}"/>
    <path d="M204 224V190C204 150 272 150 272 190V224" stroke="#050608" stroke-width="16" stroke-linecap="round" fill="none"/>
    <circle cx="238" cy="270" r="11" fill="#050608"/>
    <path d="M238 280V300" stroke="#050608" stroke-width="8" stroke-linecap="round"/>
    <path d="M112 158H364M108 356H368" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="9 12"/>
  </g>`;
}

function teamMotif(seed) {
  const offset = numberFromHash(seed, -20, 40);
  return `
  <g transform="translate(${744 + offset} 144)" opacity="0.96">
    <rect x="46" y="58" width="368" height="330" rx="34" fill="rgba(255,255,255,0.038)" stroke="rgba(255,255,255,0.12)"/>
    <rect x="82" y="106" width="128" height="92" rx="20" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)"/>
    <rect x="252" y="106" width="128" height="92" rx="20" fill="rgba(204,255,0,0.12)" stroke="rgba(204,255,0,0.32)"/>
    <rect x="168" y="246" width="128" height="92" rx="20" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)"/>
    <circle cx="146" cy="150" r="22" fill="${BRAND.accent}"/>
    <circle cx="316" cy="150" r="22" fill="#f8ffe0"/>
    <circle cx="232" cy="290" r="22" fill="${BRAND.accentSoft}"/>
    <path d="M168 170L232 248M296 170L250 248M210 150H252" stroke="rgba(204,255,0,0.42)" stroke-width="4" stroke-linecap="round"/>
    <rect x="100" y="352" width="248" height="12" rx="6" fill="${BRAND.accent}"/>
  </g>`;
}

function growthMotif(seed) {
  const offset = numberFromHash(seed, -24, 48);
  return `
  <g transform="translate(${746 + offset} 136)" opacity="0.96">
    <rect x="42" y="64" width="384" height="346" rx="36" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.12)"/>
    <path d="M118 300C160 242 210 244 244 206C286 160 324 128 386 126" stroke="${BRAND.accent}" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M344 98L394 124L352 160" stroke="${BRAND.accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="118" cy="300" r="23" fill="rgba(255,255,255,0.88)"/>
    <circle cx="244" cy="206" r="24" fill="${BRAND.accentSoft}"/>
    <circle cx="386" cy="126" r="27" fill="${BRAND.accent}"/>
    <rect x="96" y="352" width="52" height="30" rx="8" fill="rgba(255,255,255,0.12)"/>
    <rect x="178" y="316" width="52" height="66" rx="8" fill="rgba(255,255,255,0.16)"/>
    <rect x="260" y="270" width="52" height="112" rx="8" fill="rgba(204,255,0,0.32)"/>
    <rect x="342" y="218" width="52" height="164" rx="8" fill="${BRAND.accent}"/>
  </g>`;
}

function buildMotif(name, seed) {
  if (name === 'pipeline') return pipelineMotif(seed);
  if (name === 'experiment') return experimentMotif(seed);
  if (name === 'shield') return shieldMotif(seed);
  if (name === 'team') return teamMotif(seed);
  if (name === 'growth') return growthMotif(seed);
  return agentMotif(seed);
}

function createSvg({ title, category, slug }) {
  const hash = hashString(slug);
  const secondaryHash = hashString(`${slug}:${category}`);
  const lines = wrapTitle(title);
  const categoryLabel = titleCase(category || 'Articolo');
  const motif = motifName(categoryLabel, title);
  const systemLabel = shortLabel(categoryLabel, title);
  const titleText = buildTitleText(lines);
  const pill = buildPill(categoryLabel);
  const motifSvg = buildMotif(motif, secondaryHash);
  const gridOpacity = 0.2 + (hash % 4) * 0.04;
  const ringX = numberFromHash(hash, 820, 180);
  const ringY = numberFromHash(secondaryHash, 60, 180);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${BRAND.darker}"/>
      <stop offset="0.46" stop-color="${BRAND.dark}"/>
      <stop offset="1" stop-color="#11131a"/>
    </linearGradient>
    <linearGradient id="lime" x1="96" y1="100" x2="1060" y2="548" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${BRAND.accent}" stop-opacity="1"/>
      <stop offset="0.52" stop-color="${BRAND.accentSoft}" stop-opacity="0.86"/>
      <stop offset="1" stop-color="${BRAND.accentHover}" stop-opacity="0.9"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${BRAND.accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${BRAND.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="44"/>
    </filter>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.15" fill="rgba(255,255,255,0.12)"/>
    </pattern>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
    <clipPath id="frameClip">
      <rect x="56" y="48" width="1088" height="534" rx="34"/>
    </clipPath>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <g clip-path="url(#frameClip)">
    <rect x="0" y="0" width="1200" height="630" fill="url(#grid)" opacity="${gridOpacity}"/>
    <rect x="0" y="0" width="1200" height="630" fill="url(#dots)" opacity="0.2"/>
    <circle cx="${ringX}" cy="${ringY}" r="260" fill="url(#glow)" filter="url(#softBlur)"/>
    <circle cx="138" cy="602" r="210" fill="${BRAND.accent}" fill-opacity="0.09" filter="url(#softBlur)"/>
    <path d="M-20 544C180 470 350 514 530 438C730 354 826 218 1208 244" stroke="rgba(204,255,0,0.18)" stroke-width="2"/>
    <path d="M-18 582C212 512 366 550 548 486C736 420 906 338 1210 364" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <path d="M616 -80L1166 458" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <path d="M708 -80L1190 394" stroke="rgba(204,255,0,0.13)" stroke-width="1"/>
  </g>

  <rect x="56" y="48" width="1088" height="534" rx="34" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.10)"/>
  <rect x="70" y="62" width="1060" height="506" rx="26" stroke="rgba(204,255,0,0.16)" stroke-width="1"/>

  ${pill}
  <text x="86" y="168" font-family="JetBrains Mono, Consolas, monospace" font-size="18" font-weight="700" fill="rgba(204,255,0,0.76)">GINNYTECH / ${escapeXml(systemLabel)}</text>
  <rect x="86" y="194" width="394" height="9" rx="4.5" fill="url(#lime)"/>
  <rect x="86" y="216" width="138" height="9" rx="4.5" fill="rgba(255,255,255,0.18)"/>

  <text x="715" y="112" font-family="Montserrat, Inter, Arial, sans-serif" font-size="102" font-weight="900" letter-spacing="6" fill="rgba(255,255,255,0.035)">${escapeXml(systemLabel)}</text>
  ${motifSvg}

  ${titleText}

  <g transform="translate(86 520)">
    <rect x="0" y="-28" width="228" height="42" rx="21" fill="rgba(255,255,255,0.055)" stroke="rgba(255,255,255,0.10)"/>
    <text x="24" y="-2" font-family="Montserrat, Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="rgba(255,255,255,0.82)">GinnyTech Blog</text>
    <circle cx="196" cy="-8" r="6" fill="${BRAND.accent}"/>
  </g>
</svg>
`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const blogFiles = globSync(blogPattern).sort();

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
