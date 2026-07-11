/**
 * Build-time "previous port / next port" selection — chronological
 * neighbours for the end of a blog post (#214).
 *
 * Given the full list of posts from the content collection (`listBlogs()`),
 * find the current post's neighbours on the publication timeline:
 *
 *   - `previous` — the next-OLDER post ("Previous port"),
 *   - `next`     — the next-NEWER post ("Next port").
 *
 * Posts are ordered newest-first by `pubDate` (missing dates sort as epoch 0,
 * i.e. oldest), with `_sys.filename` as a tiebreak purely so neighbours are
 * deterministic across builds when two posts share a date. Either side is
 * `null` at the ends of the timeline — callers hide that side.
 */

/** The minimal shape `pickPortNeighbours` needs from a blog list node. */
export interface PortNeighbourCandidate {
	_sys: { filename: string };
	pubDate?: string | null;
}

export interface PortNeighbours<T> {
	/** The next-older post, or `null` when the current post is the oldest. */
	previous: T | null;
	/** The next-newer post, or `null` when the current post is the newest. */
	next: T | null;
}

export function pickPortNeighbours<T extends PortNeighbourCandidate>(
	posts: T[],
	currentSlug: string,
): PortNeighbours<T> {
	// Newest-first, deterministic: pubDate desc, then filename asc.
	const ordered = [...posts].sort((a, b) => {
		const ad = a.pubDate ? new Date(a.pubDate).valueOf() : 0;
		const bd = b.pubDate ? new Date(b.pubDate).valueOf() : 0;
		return bd - ad || a._sys.filename.localeCompare(b._sys.filename);
	});

	const index = ordered.findIndex((post) => post._sys.filename === currentSlug);
	if (index === -1) return { previous: null, next: null };

	return {
		previous: ordered[index + 1] ?? null,
		next: index > 0 ? (ordered[index - 1] ?? null) : null,
	};
}
