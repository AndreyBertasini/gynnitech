import { promises as fs } from "fs";
import path from "path";
import { redirectEntries } from "../src/lib/config/redirects.mjs";

const DIST_ROOT = path.join(process.cwd(), "dist");
const SITE_ORIGIN = "https://ginnytech.it";
const MARKER_LEAK = "ginnytech-v2-editorial-pass";
const MAX_HTML_BYTES = 400_000;
const MAX_LOCAL_IMAGE_BYTES = 750_000;
const MAX_ROUTE_INITIAL_JS_BYTES = 60_000;
const MAX_ROUTE_STYLESHEET_BYTES = 220_000;
const MAX_ROUTE_INITIAL_ASSET_BYTES = 260_000;
const MAX_ROUTE_ISLAND_JS_BYTES = 320_000;
const MAX_SINGLE_JS_ASSET_BYTES = 700_000;
const MAX_SINGLE_CSS_ASSET_BYTES = 190_000;
const MAX_FONT_BYTES = 90_000;
const MOJIBAKE_MARKER_REGEX = /(?:\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\u00e2\u20ac[\u0080-\u2122]|\ufffd)/;
const REDIRECT_ENTRIES = redirectEntries as Array<[string, string]>;
const REDIRECT_SOURCE_FILES = new Set(
    REDIRECT_ENTRIES.map(([source]) => {
        const sourcePath = source.endsWith("/") ? source : `${source}/`;
        return `${sourcePath.replace(/^\//, "")}index.html`;
    }),
);

type Issue = {
    file: string;
    message: string;
};

type AttrRef = {
    attr: string;
    value: string;
};

type RoutePerformance = {
    initialJsBytes: number;
    stylesheetBytes: number;
    initialAssetBytes: number;
    islandJsBytes: number;
};

type ByteMetric = {
    file: string;
    bytes: number;
};

type PerformanceSummary = {
    html: ByteMetric;
    initialJs: ByteMetric;
    stylesheets: ByteMetric;
    initialAssets: ByteMetric;
    islandJs: ByteMetric;
    jsAsset: ByteMetric;
    cssAsset: ByteMetric;
    fontAsset: ByteMetric;
};

async function pathExists(filePath: string): Promise<boolean> {
    try {
        await fs.stat(filePath);
        return true;
    } catch {
        return false;
    }
}

async function walkFiles(dir: string, predicate: (filePath: string) => boolean): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await walkFiles(fullPath, predicate));
            continue;
        }

        if (entry.isFile() && predicate(fullPath)) {
            files.push(fullPath);
        }
    }

    return files;
}

function relativeDistPath(filePath: string): string {
    return path.relative(DIST_ROOT, filePath).split(path.sep).join("/");
}

function normalizeLocalUrl(rawValue: string): string | undefined {
    const value = rawValue.trim();
    if (
        value === ""
        || value.startsWith("#")
        || /^(mailto:|tel:|javascript:|data:|blob:|\/\/)/i.test(value)
    ) {
        return undefined;
    }

    if (/^https?:\/\//i.test(value)) {
        try {
            const url = new URL(value);
            if (url.origin !== SITE_ORIGIN) {
                return undefined;
            }
            return `${url.pathname}${url.search}${url.hash}`;
        } catch {
            return undefined;
        }
    }

    if (!value.startsWith("/")) {
        return undefined;
    }

    return value;
}

function extractAttributeRefs(html: string): AttrRef[] {
    const refs: AttrRef[] = [];
    const attrPattern =
        /\s(href|src|content|component-url|renderer-url|before-hydration-url)=["']([^"']+)["']/gi;
    const srcsetPattern = /\ssrcset=["']([^"']+)["']/gi;

    for (const match of html.matchAll(attrPattern)) {
        refs.push({ attr: match[1].toLowerCase(), value: match[2] });
    }

    for (const match of html.matchAll(srcsetPattern)) {
        for (const candidate of match[1].split(",")) {
            const url = candidate.trim().split(/\s+/)[0];
            if (url) {
                refs.push({ attr: "srcset", value: url });
            }
        }
    }

    return refs;
}

function stripSearchAndHash(localUrl: string): { pathname: string; hash: string } {
    const hashIndex = localUrl.indexOf("#");
    const hash = hashIndex >= 0 ? localUrl.slice(hashIndex + 1) : "";
    const withoutHash = hashIndex >= 0 ? localUrl.slice(0, hashIndex) : localUrl;
    const searchIndex = withoutHash.indexOf("?");
    const pathname = searchIndex >= 0 ? withoutHash.slice(0, searchIndex) : withoutHash;
    return { pathname, hash };
}

function resolveDistPath(localUrl: string): string {
    const { pathname } = stripSearchAndHash(localUrl);
    const decodedPathname = decodeURIComponent(pathname || "/");

    if (decodedPathname === "/") {
        return path.join(DIST_ROOT, "index.html");
    }

    if (decodedPathname === "/404/" || decodedPathname === "/404") {
        return path.join(DIST_ROOT, "404.html");
    }

    if (decodedPathname.endsWith("/")) {
        return path.join(DIST_ROOT, decodedPathname, "index.html");
    }

    if (path.extname(decodedPathname)) {
        return path.join(DIST_ROOT, decodedPathname);
    }

    return path.join(DIST_ROOT, decodedPathname, "index.html");
}

function hasAnchor(html: string, hash: string): boolean {
    if (!hash) return true;
    const escaped = hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\s(?:id|name)=["']${escaped}["']`, "i").test(html);
}

function getAttributes(tag: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrPattern = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

    for (const match of tag.matchAll(attrPattern)) {
        attributes[match[1].toLowerCase()] = (match[2] ?? match[3] ?? "").trim();
    }

    return attributes;
}

function titleContent(html: string): string | undefined {
    return html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.trim();
}

function metaContent(html: string, attr: "name" | "property", value: string): string | undefined {
    for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
        const attributes = getAttributes(match[0]);
        if (attributes[attr] === value) {
            return attributes.content;
        }
    }

    return undefined;
}

function linkHref(html: string, rel: string): string | undefined {
    for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
        const attributes = getAttributes(match[0]);
        if (attributes.rel === rel) {
            return attributes.href;
        }
    }

    return undefined;
}

function alternateLinksByHreflang(html: string): Map<string, Set<string>> {
    const alternates = new Map<string, Set<string>>();

    for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
        const attributes = getAttributes(match[0]);
        const relTokens = (attributes.rel ?? "").toLowerCase().split(/\s+/).filter(Boolean);
        const hreflang = attributes.hreflang;
        const href = attributes.href;

        if (!relTokens.includes("alternate") || !hreflang || !href) {
            continue;
        }

        if (!alternates.has(hreflang)) {
            alternates.set(hreflang, new Set());
        }
        alternates.get(hreflang)?.add(href);
    }

    return alternates;
}

function expectedLocalizedUrls(canonical: string): { italianUrl: string; englishUrl: string } | undefined {
    try {
        const canonicalUrl = new URL(canonical);
        if (canonicalUrl.origin !== SITE_ORIGIN) {
            return undefined;
        }

        const pathname = canonicalUrl.pathname;
        const italianPathname = pathname === "/en" || pathname === "/en/"
            ? "/"
            : pathname.startsWith("/en/")
                ? pathname.slice(3)
                : pathname;
        const englishPathname = italianPathname === "/" ? "/en/" : `/en${italianPathname}`;

        return {
            italianUrl: `${SITE_ORIGIN}${italianPathname}`,
            englishUrl: `${SITE_ORIGIN}${englishPathname}`,
        };
    } catch {
        return undefined;
    }
}

function formatBytes(bytes: number): string {
    if (bytes >= 1_000_000) {
        return `${(bytes / 1_000_000).toFixed(2)} MB`;
    }

    if (bytes >= 1_000) {
        return `${Math.round(bytes / 1_000)} KB`;
    }

    return `${bytes} B`;
}

function emptyMetric(): ByteMetric {
    return { file: "", bytes: 0 };
}

function updateMax(metric: ByteMetric, file: string, bytes: number): void {
    if (bytes > metric.bytes) {
        metric.file = file;
        metric.bytes = bytes;
    }
}

function addLocalUrl(target: Set<string>, rawValue: string | undefined): void {
    if (!rawValue) return;

    const localUrl = normalizeLocalUrl(rawValue);
    if (localUrl) {
        target.add(localUrl);
    }
}

async function localAssetSize(
    localUrl: string,
    sizeCache: Map<string, number | undefined>,
): Promise<number | undefined> {
    const { pathname } = stripSearchAndHash(localUrl);
    if (!path.extname(pathname)) {
        return undefined;
    }

    if (sizeCache.has(localUrl)) {
        return sizeCache.get(localUrl);
    }

    const targetPath = resolveDistPath(localUrl);
    if (!targetPath.startsWith(DIST_ROOT) || !await pathExists(targetPath)) {
        sizeCache.set(localUrl, undefined);
        return undefined;
    }

    const stat = await fs.stat(targetPath);
    sizeCache.set(localUrl, stat.size);
    return stat.size;
}

async function sumLocalAssetBytes(urls: Set<string>, sizeCache: Map<string, number | undefined>): Promise<number> {
    let total = 0;

    for (const localUrl of urls) {
        total += await localAssetSize(localUrl, sizeCache) ?? 0;
    }

    return total;
}

async function collectRoutePerformance(html: string, sizeCache: Map<string, number | undefined>): Promise<RoutePerformance> {
    const stylesheetRefs = new Set<string>();
    const initialScriptRefs = new Set<string>();
    const islandScriptRefs = new Set<string>();

    for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
        const attributes = getAttributes(match[0]);
        const relTokens = (attributes.rel ?? "").toLowerCase().split(/\s+/).filter(Boolean);
        const asValue = attributes.as?.toLowerCase();

        if (relTokens.includes("stylesheet") || asValue === "style") {
            addLocalUrl(stylesheetRefs, attributes.href);
        }

        if (relTokens.includes("modulepreload") || asValue === "script") {
            addLocalUrl(initialScriptRefs, attributes.href);
        }
    }

    for (const match of html.matchAll(/<script\b[^>]*>/gi)) {
        const attributes = getAttributes(match[0]);
        addLocalUrl(initialScriptRefs, attributes.src);
    }

    for (const match of html.matchAll(/<astro-island\b[^>]*>/gi)) {
        const attributes = getAttributes(match[0]);
        addLocalUrl(islandScriptRefs, attributes["component-url"]);
        addLocalUrl(islandScriptRefs, attributes["renderer-url"]);
        addLocalUrl(islandScriptRefs, attributes["before-hydration-url"]);
    }

    const initialJsBytes = await sumLocalAssetBytes(initialScriptRefs, sizeCache);
    const stylesheetBytes = await sumLocalAssetBytes(stylesheetRefs, sizeCache);
    const islandJsBytes = await sumLocalAssetBytes(islandScriptRefs, sizeCache);

    return {
        initialJsBytes,
        stylesheetBytes,
        initialAssetBytes: initialJsBytes + stylesheetBytes,
        islandJsBytes,
    };
}

function auditRoutePerformance(performance: RoutePerformance, file: string, issues: Issue[]): void {
    if (performance.initialJsBytes > MAX_ROUTE_INITIAL_JS_BYTES) {
        issues.push({
            file,
            message: `initial JS exceeds ${formatBytes(MAX_ROUTE_INITIAL_JS_BYTES)} (${formatBytes(performance.initialJsBytes)})`,
        });
    }

    if (performance.stylesheetBytes > MAX_ROUTE_STYLESHEET_BYTES) {
        issues.push({
            file,
            message: `stylesheet payload exceeds ${formatBytes(MAX_ROUTE_STYLESHEET_BYTES)} (${formatBytes(performance.stylesheetBytes)})`,
        });
    }

    if (performance.initialAssetBytes > MAX_ROUTE_INITIAL_ASSET_BYTES) {
        issues.push({
            file,
            message: `initial CSS/JS payload exceeds ${formatBytes(MAX_ROUTE_INITIAL_ASSET_BYTES)} (${formatBytes(performance.initialAssetBytes)})`,
        });
    }

    if (performance.islandJsBytes > MAX_ROUTE_ISLAND_JS_BYTES) {
        issues.push({
            file,
            message: `hydrated island JS exceeds ${formatBytes(MAX_ROUTE_ISLAND_JS_BYTES)} (${formatBytes(performance.islandJsBytes)})`,
        });
    }
}

function auditSeo(html: string, file: string, issues: Issue[], isRedirectPage: boolean): void {
    if (isRedirectPage || file.endsWith("404.html")) {
        return;
    }

    const title = titleContent(html);
    const description = metaContent(html, "name", "description");
    const canonical = linkHref(html, "canonical");
    const ogTitle = metaContent(html, "property", "og:title");
    const ogDescription = metaContent(html, "property", "og:description");
    const ogImage = metaContent(html, "property", "og:image");

    if (!title || title.length < 8) {
        issues.push({ file, message: "missing or too-short <title>" });
    }
    if (!description || description.length < 50) {
        issues.push({ file, message: "missing or too-short meta description" });
    }
    if (!canonical || !canonical.startsWith(SITE_ORIGIN)) {
        issues.push({ file, message: "missing canonical URL on site origin" });
    } else {
        const expectedUrls = expectedLocalizedUrls(canonical);
        const alternates = alternateLinksByHreflang(html);
        if (expectedUrls && !alternates.get("it-IT")?.has(expectedUrls.italianUrl)) {
            issues.push({ file, message: `missing it-IT alternate ${expectedUrls.italianUrl}` });
        }
        if (expectedUrls && !alternates.get("en-US")?.has(expectedUrls.englishUrl)) {
            issues.push({ file, message: `missing en-US alternate ${expectedUrls.englishUrl}` });
        }
        if (expectedUrls && !alternates.get("x-default")?.has(expectedUrls.italianUrl)) {
            issues.push({ file, message: `missing x-default alternate ${expectedUrls.italianUrl}` });
        }
    }
    if (!ogTitle || !ogDescription || !ogImage) {
        issues.push({ file, message: "missing Open Graph title, description, or image" });
    }
    if (!html.includes('type="application/ld+json"')) {
        issues.push({ file, message: "missing JSON-LD structured data" });
    }
}

function auditImages(html: string, file: string, issues: Issue[]): void {
    const imagePattern = /<img\b([^>]*)>/gi;
    for (const match of html.matchAll(imagePattern)) {
        const tag = match[0];
        const altMatch = tag.match(/\salt=["']([^"']*)["']/i);
        if (!altMatch) {
            issues.push({ file, message: `image missing alt attribute: ${tag.slice(0, 140)}` });
        }
    }
}

function stripCodeContent(html: string): string {
    return html
        .replace(/<pre\b[\s\S]*?<\/pre>/gi, "")
        .replace(/<code\b[\s\S]*?<\/code>/gi, "");
}

function auditMarkdownRendering(html: string, file: string, issues: Issue[]): void {
    const searchableHtml = stripCodeContent(html);
    if (/<p>\s*\|[^<]*\r?\n\s*\|[:\-\s|]+\r?\n/i.test(searchableHtml)) {
        issues.push({
            file,
            message: "raw Markdown table rendered as paragraph; check Markdown GFM support",
        });
    }
}

function auditTextEncoding(html: string, file: string, issues: Issue[]): void {
    const searchableHtml = stripCodeContent(html);
    if (MOJIBAKE_MARKER_REGEX.test(searchableHtml)) {
        issues.push({
            file,
            message: "possible mojibake or replacement character in rendered text",
        });
    }
}

async function main(): Promise<void> {
    if (!await pathExists(DIST_ROOT)) {
        throw new Error("dist/ does not exist. Run `npm run build` before `npm run audit:site`.");
    }

    const htmlFiles = await walkFiles(DIST_ROOT, (filePath) => filePath.endsWith(".html"));
    const imageFiles = await walkFiles(
        DIST_ROOT,
        (filePath) => /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(filePath),
    );
    const jsFiles = await walkFiles(DIST_ROOT, (filePath) => /\.m?js$/i.test(filePath));
    const cssFiles = await walkFiles(DIST_ROOT, (filePath) => /\.css$/i.test(filePath));
    const fontFiles = await walkFiles(DIST_ROOT, (filePath) => /\.(woff2?|ttf|otf)$/i.test(filePath));
    const issues: Issue[] = [];
    const htmlCache = new Map<string, string>();
    const assetSizeCache = new Map<string, number | undefined>();
    const performanceSummary: PerformanceSummary = {
        html: emptyMetric(),
        initialJs: emptyMetric(),
        stylesheets: emptyMetric(),
        initialAssets: emptyMetric(),
        islandJs: emptyMetric(),
        jsAsset: emptyMetric(),
        cssAsset: emptyMetric(),
        fontAsset: emptyMetric(),
    };

    for (const filePath of htmlFiles) {
        const file = relativeDistPath(filePath);
        const isRedirectPage = REDIRECT_SOURCE_FILES.has(file);
        const html = await fs.readFile(filePath, "utf-8");
        htmlCache.set(filePath, html);

        const stat = await fs.stat(filePath);
        updateMax(performanceSummary.html, file, stat.size);
        if (stat.size > MAX_HTML_BYTES) {
            issues.push({
                file,
                message: `HTML file exceeds ${formatBytes(MAX_HTML_BYTES)} (${formatBytes(stat.size)})`,
            });
        }

        if (html.includes(MARKER_LEAK)) {
            issues.push({ file, message: "internal editorial marker leaked into rendered HTML" });
        }

        auditSeo(html, file, issues, isRedirectPage);
        auditImages(html, file, issues);
        auditMarkdownRendering(html, file, issues);
        auditTextEncoding(html, file, issues);

        if (!isRedirectPage && file !== "404.html") {
            const performance = await collectRoutePerformance(html, assetSizeCache);
            updateMax(performanceSummary.initialJs, file, performance.initialJsBytes);
            updateMax(performanceSummary.stylesheets, file, performance.stylesheetBytes);
            updateMax(performanceSummary.initialAssets, file, performance.initialAssetBytes);
            updateMax(performanceSummary.islandJs, file, performance.islandJsBytes);
            auditRoutePerformance(performance, file, issues);
        }

        for (const ref of extractAttributeRefs(html)) {
            const localUrl = normalizeLocalUrl(ref.value);
            if (!localUrl) continue;

            const targetPath = resolveDistPath(localUrl);
            if (!targetPath.startsWith(DIST_ROOT)) {
                issues.push({ file, message: `${ref.attr} points outside dist: ${ref.value}` });
                continue;
            }

            if (!await pathExists(targetPath)) {
                issues.push({ file, message: `${ref.attr} points to missing local asset/page: ${ref.value}` });
                continue;
            }

            const { hash } = stripSearchAndHash(localUrl);
            if (hash && targetPath.endsWith(".html")) {
                const targetHtml = htmlCache.get(targetPath) ?? await fs.readFile(targetPath, "utf-8");
                htmlCache.set(targetPath, targetHtml);
                if (!hasAnchor(targetHtml, hash)) {
                    issues.push({ file, message: `${ref.attr} points to missing hash #${hash}: ${ref.value}` });
                }
            }
        }
    }

    for (const imagePath of imageFiles) {
        const stat = await fs.stat(imagePath);
        if (stat.size > MAX_LOCAL_IMAGE_BYTES) {
            issues.push({
                file: relativeDistPath(imagePath),
                message: `image exceeds ${formatBytes(MAX_LOCAL_IMAGE_BYTES)} (${formatBytes(stat.size)})`,
            });
        }
    }

    for (const jsPath of jsFiles) {
        const stat = await fs.stat(jsPath);
        const file = relativeDistPath(jsPath);
        updateMax(performanceSummary.jsAsset, file, stat.size);
        if (stat.size > MAX_SINGLE_JS_ASSET_BYTES) {
            issues.push({
                file,
                message: `JavaScript asset exceeds ${formatBytes(MAX_SINGLE_JS_ASSET_BYTES)} (${formatBytes(stat.size)})`,
            });
        }
    }

    for (const cssPath of cssFiles) {
        const stat = await fs.stat(cssPath);
        const file = relativeDistPath(cssPath);
        updateMax(performanceSummary.cssAsset, file, stat.size);
        if (stat.size > MAX_SINGLE_CSS_ASSET_BYTES) {
            issues.push({
                file,
                message: `CSS asset exceeds ${formatBytes(MAX_SINGLE_CSS_ASSET_BYTES)} (${formatBytes(stat.size)})`,
            });
        }
    }

    for (const fontPath of fontFiles) {
        const stat = await fs.stat(fontPath);
        const file = relativeDistPath(fontPath);
        updateMax(performanceSummary.fontAsset, file, stat.size);
        if (stat.size > MAX_FONT_BYTES) {
            issues.push({
                file,
                message: `font asset exceeds ${formatBytes(MAX_FONT_BYTES)} (${formatBytes(stat.size)})`,
            });
        }
    }

    if (issues.length > 0) {
        console.error(`Site quality audit failed with ${issues.length} issue(s):`);
        for (const issue of issues.slice(0, 200)) {
            console.error(`- ${issue.file}: ${issue.message}`);
        }
        if (issues.length > 200) {
            console.error(`...and ${issues.length - 200} more.`);
        }
        process.exitCode = 1;
        return;
    }

    const assetCount = imageFiles.length + jsFiles.length + cssFiles.length + fontFiles.length;
    console.log(`Site quality audit passed: ${htmlFiles.length} HTML files, ${assetCount} local assets checked.`);
    console.log(
        [
            `Largest HTML ${formatBytes(performanceSummary.html.bytes)} (${performanceSummary.html.file})`,
            `max initial CSS/JS ${formatBytes(performanceSummary.initialAssets.bytes)} (${performanceSummary.initialAssets.file})`,
            `max island JS ${formatBytes(performanceSummary.islandJs.bytes)} (${performanceSummary.islandJs.file})`,
            `largest JS asset ${formatBytes(performanceSummary.jsAsset.bytes)} (${performanceSummary.jsAsset.file})`,
            `largest CSS asset ${formatBytes(performanceSummary.cssAsset.bytes)} (${performanceSummary.cssAsset.file})`,
        ].join("; "),
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
