/**
 * Build-time reading-time estimation for blog posts.
 *
 * Posts are authored in TinaCMS (.md/.mdx under `src/content/blog`) and their
 * bodies arrive as a Tina rich-text AST — the same tree `<TinaMarkdown>`
 * renders. We walk that tree collecting every piece of rendered text (`text`
 * on leaf nodes, `value` on code blocks) and derive minutes at ~200 words per
 * minute, rounded up, never below 1. Because the count comes from the AST and
 * not the raw source, frontmatter, markup syntax, and MDX component tags are
 * naturally excluded for both .md and .mdx posts.
 */

const WORDS_PER_MINUTE = 200;

/** Recursively collect the rendered text of a Tina rich-text AST node. */
function collectText(node: unknown, out: string[]): void {
	if (node == null) return;
	if (typeof node === 'string') {
		out.push(node);
		return;
	}
	if (Array.isArray(node)) {
		for (const child of node) collectText(child, out);
		return;
	}
	if (typeof node !== 'object') return;
	const record = node as Record<string, unknown>;
	if (typeof record.text === 'string') out.push(record.text);
	// Code blocks (and mdx raw fallbacks) carry their content in `value`.
	if (typeof record.value === 'string') out.push(record.value);
	if (Array.isArray(record.children)) collectText(record.children, out);
	// Embedded MDX templates keep their rich-text/props under `props`
	// (e.g. captions, nested bodies) — include what would render as text.
	if (record.props && typeof record.props === 'object') collectText(record.props, out);
}

/** Count the words that would render from a Tina rich-text body. */
export function countWords(body: unknown): number {
	const parts: string[] = [];
	collectText(body, parts);
	const words = parts.join(' ').trim().split(/\s+/).filter(Boolean);
	return words.length;
}

/** Reading time in whole minutes: ~200 wpm, rounded up, minimum 1. */
export function readingTimeMinutes(body: unknown): number {
	return Math.max(1, Math.ceil(countWords(body) / WORDS_PER_MINUTE));
}

/** Nautical badge copy, e.g. `~6 min voyage`. */
export function readingTimeLabel(body: unknown): string {
	return `~${readingTimeMinutes(body)} min voyage`;
}
