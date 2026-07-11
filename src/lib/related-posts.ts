/**
 * Build-time "nearby islands" selection — related posts for the end of a
 * blog post.
 *
 * Given the full list of posts from the content collection (`listBlogs()`),
 * pick up to `limit` posts related to the current one:
 *
 *   1. most shared tags first (tags compared case-insensitively, trimmed),
 *   2. then most recent `pubDate`,
 *   3. then filename, purely so the order is deterministic across builds.
 *
 * The current post is always excluded. Posts without tags simply score 0 and
 * fall back to recency — so a brand-new untagged post still gets neighbours,
 * and an untagged collection degrades to "3 most recent other posts".
 */

/** The minimal shape `pickNearbyIslands` needs from a blog list node. */
export interface NearbyIslandCandidate {
	_sys: { filename: string };
	tags?: (string | null)[] | null;
	pubDate?: string | null;
}

/** Normalise a tags field into a comparable set of lowercase tags. */
function tagSet(tags: (string | null)[] | null | undefined): Set<string> {
	const set = new Set<string>();
	for (const tag of tags ?? []) {
		const normalised = tag?.trim().toLowerCase();
		if (normalised) set.add(normalised);
	}
	return set;
}

/** How many tags two posts share. */
function sharedTagCount(a: Set<string>, b: Set<string>): number {
	let count = 0;
	for (const tag of a) if (b.has(tag)) count++;
	return count;
}

/**
 * Pick up to `limit` posts related to `currentSlug` (its `_sys.filename`).
 * Returns `[]` when there are no other posts — callers hide the section.
 */
export function pickNearbyIslands<T extends NearbyIslandCandidate>(
	posts: T[],
	currentSlug: string,
	limit = 3,
): T[] {
	const current = posts.find((post) => post._sys.filename === currentSlug);
	const currentTags = tagSet(current?.tags);

	return posts
		.filter((post) => post._sys.filename !== currentSlug)
		.map((post) => ({
			post,
			shared: sharedTagCount(currentTags, tagSet(post.tags)),
			date: post.pubDate ? new Date(post.pubDate).valueOf() : 0,
		}))
		.sort(
			(a, b) =>
				b.shared - a.shared ||
				b.date - a.date ||
				a.post._sys.filename.localeCompare(b.post._sys.filename),
		)
		.slice(0, limit)
		.map((entry) => entry.post);
}
