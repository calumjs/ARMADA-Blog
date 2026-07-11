/**
 * Build-time static search index for the spyglass post search overlay.
 *
 * Emits one JSON array of every blog post — title, description, url, date —
 * sourced from the same Tina-backed `listBlogs()` the blog pages and RSS feed
 * use, so the index can never drift from the rendered posts. Prerendered at
 * build time; the client fetches it once and caches it (see
 * `src/components/SpyglassSearch.astro`).
 */
import { listBlogs } from '../lib/data';

export const prerender = true;

export async function GET() {
	const posts = await listBlogs();
	const index = posts.map((post) => ({
		title: post.title ?? '',
		description: post.description ?? '',
		url: `/blog/${post._sys.filename}/`,
		date: post.pubDate ?? null,
	}));
	return new Response(JSON.stringify(index), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
}
