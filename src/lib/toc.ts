/**
 * Build-time "Chart of contents" extraction for blog posts (#213).
 *
 * Post bodies arrive as a Tina rich-text AST (the same tree `<TinaMarkdown>`
 * renders — see reading-time.ts). We walk that tree collecting every h2/h3
 * node and derive the SAME slug ids that DropAnchor.astro (#209) assigns
 * client-side, so the TOC's fragment links land on the anchors DropAnchor
 * creates. Keep `tocSlug` in lockstep with `anchorSlug` in DropAnchor.astro.
 *
 * Slug parity notes:
 * - Algorithm: GitHub-style — lowercase, punctuation stripped (unicode
 *   letters/numbers/spaces/hyphens kept), spaces → hyphens, collapsed,
 *   trimmed, `section` fallback.
 * - Dedupe: DropAnchor bumps with -1/-2… while `document.getElementById(id)`
 *   matches, i.e. against EVERY id already in the page — earlier headings AND
 *   the static chrome ids that exist on a post page (drop-anchor, voyage-bar,
 *   …). We mirror that by seeding the used-set with those static ids, so a
 *   heading literally titled e.g. "Drop anchor" gets the same `-1` suffix at
 *   build time that it gets at runtime.
 */

export interface TocEntry {
	/** Heading level: 2 (h2) or 3 (h3, rendered indented). */
	depth: 2 | 3;
	/** Rendered heading text. */
	text: string;
	/** Fragment id — identical to the id DropAnchor assigns client-side. */
	slug: string;
}

/**
 * Static element ids present on every blog-post page (Base + BlogPost chrome)
 * that are shaped like heading slugs, so `document.getElementById` in
 * DropAnchor's dedupe loop can match them. Sourced from the components
 * rendered by Base.astro / BlogPost.astro. OceanHero ids are excluded — the
 * hero never mounts on post pages.
 */
const POST_PAGE_STATIC_IDS = [
	'abyss-cursor-wake',
	'bottle-another',
	'bottle-card',
	'bottle-close',
	'bottle-fortune',
	'bottle-toggle',
	'captains-wheel',
	'carve-plank',
	'carve-plank-btn',
	'carve-plank-status',
	'drop-anchor',
	'drop-anchor-status',
	'drop-anchor-toast',
	'hoist-colours',
	'kraken-eye',
	'kraken-overlay',
	'lightbox-caption',
	'lightbox-close',
	'lightbox-dialog',
	'lightbox-img',
	'lightbox-overlay',
	'mobile-menu-panel',
	'mobile-menu-toggle',
	'nearby-islands-heading',
	'plunder-code-status',
	'ships-manual-close',
	'ships-manual-dialog',
	'ships-manual-overlay',
	'ships-manual-title',
	'spyglass-close',
	'spyglass-dialog',
	'spyglass-input',
	'spyglass-overlay',
	'spyglass-results',
	'spyglass-status',
	'voyage-fill',
	'voyage-progress',
	'voyage-ship',
];

/**
 * GitHub-style slug — MUST stay identical to `anchorSlug` in DropAnchor.astro
 * so build-time TOC hrefs match the runtime heading ids.
 */
export function tocSlug(text: string): string {
	const slug = (text || '')
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
	return slug || 'section';
}

/** Recursively collect the rendered text of a heading's children. */
function headingText(node: unknown, out: string[]): void {
	if (node == null) return;
	if (typeof node === 'string') {
		out.push(node);
		return;
	}
	if (Array.isArray(node)) {
		for (const child of node) headingText(child, out);
		return;
	}
	if (typeof node !== 'object') return;
	const record = node as Record<string, unknown>;
	if (typeof record.text === 'string') out.push(record.text);
	if (Array.isArray(record.children)) headingText(record.children, out);
}

/** Walk the rich-text tree collecting h2/h3 nodes in document order. */
function collectHeadings(node: unknown, out: { depth: 2 | 3; text: string }[]): void {
	if (node == null) return;
	if (Array.isArray(node)) {
		for (const child of node) collectHeadings(child, out);
		return;
	}
	if (typeof node !== 'object') return;
	const record = node as Record<string, unknown>;
	if (record.type === 'h2' || record.type === 'h3') {
		const parts: string[] = [];
		headingText(record.children, parts);
		// Same normalisation the DOM applies to textContent-derived slugs:
		// DropAnchor trims, and interior runs collapse via the slug regexes.
		const text = parts.join('').replace(/\s+/g, ' ').trim();
		out.push({ depth: record.type === 'h2' ? 2 : 3, text });
		return; // headings never nest further headings
	}
	if (Array.isArray(record.children)) collectHeadings(record.children, out);
}

/**
 * Extract the chart of contents from a Tina rich-text body: every h2/h3 in
 * document order, with DropAnchor-identical slugs (deduped -1/-2… in the same
 * order DropAnchor arms headings).
 */
export function extractToc(body: unknown): TocEntry[] {
	const found: { depth: 2 | 3; text: string }[] = [];
	collectHeadings(body, found);

	const used = new Set<string>(POST_PAGE_STATIC_IDS);
	return found.map(({ depth, text }) => {
		const base = tocSlug(text);
		let slug = base;
		let n = 1;
		while (used.has(slug)) slug = `${base}-${n++}`;
		used.add(slug);
		return { depth, text, slug };
	});
}
