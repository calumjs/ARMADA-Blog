/**
 * Message-in-a-bottle RSS feed (/rss.xml).
 *
 * Hand-rolled RSS 2.0 — deliberately no @astrojs/rss (or any other)
 * dependency: a plain prerendered endpoint that serialises the same
 * Tina-backed `listBlogs()` the blog pages and search index use, so the
 * feed can never drift from the rendered posts. `listBlogs()` already
 * sorts newest-first. All interpolated content is XML-escaped.
 */
import type { APIContext } from 'astro';
import config from '../content/config/config.json';
import { listBlogs } from '../lib/data';

export const prerender = true;

/** Escape a value for safe interpolation into XML text or attributes. */
function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** RFC-822/1123 date, e.g. "Fri, 11 Jul 2026 00:00:00 GMT". */
function rfc822(date: Date): string {
	return date.toUTCString();
}

export async function GET(context: APIContext) {
	const site = context.site ?? new URL('https://example.com');
	const posts = await listBlogs();

	const items = posts
		.map((post) => {
			const link = new URL(`/blog/${post._sys.filename}/`, site).href;
			const pubDate = post.pubDate ? new Date(post.pubDate) : null;
			return [
				'\t\t<item>',
				`\t\t\t<title>${escapeXml(post.title ?? post._sys.filename)}</title>`,
				`\t\t\t<link>${escapeXml(link)}</link>`,
				`\t\t\t<guid isPermaLink="true">${escapeXml(link)}</guid>`,
				...(pubDate && !Number.isNaN(pubDate.valueOf())
					? [`\t\t\t<pubDate>${escapeXml(rfc822(pubDate))}</pubDate>`]
					: []),
				...(post.description
					? [`\t\t\t<description>${escapeXml(post.description)}</description>`]
					: []),
				'\t\t</item>',
			].join('\n');
		})
		.join('\n');

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'\t<channel>',
		`\t\t<title>${escapeXml(config.seo.title)}</title>`,
		`\t\t<link>${escapeXml(site.href)}</link>`,
		`\t\t<description>${escapeXml(config.seo.description)}</description>`,
		'\t\t<language>en</language>',
		`\t\t<lastBuildDate>${escapeXml(rfc822(new Date()))}</lastBuildDate>`,
		`\t\t<atom:link href="${escapeXml(new URL('/rss.xml', site).href)}" rel="self" type="application/rss+xml" />`,
		items,
		'\t</channel>',
		'</rss>',
		'',
	].join('\n');

	return new Response(xml, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
	});
}
