/**
 * Curated sea-chant & maritime folk-song playlist.
 *
 * --- Curation approach -----------------------------------------------------
 * This is a hand-picked, static list — there is no audio player, no streaming
 * integration, no accounts, and nothing fetched at runtime. It is the musical
 * companion to the site's existing pirate/maritime theme (see /games, /gold),
 * and follows the same client-side, account-free spirit.
 *
 * Selection criteria, applied deliberately:
 *   1. Recognisability — well-known, frequently-performed sea shanties and
 *      maritime folk songs that a casual listener is likely to have heard of
 *      (e.g. the 2021 "ShantyTok" revival of "Wellerman").
 *   2. Variety — a spread across work-song types (capstan/halyard/short-haul
 *      shanties) and broader maritime/folk ballads, so the list reads as a
 *      tour rather than eight versions of one song.
 *   3. Heritage / public-domain leaning — most entries are traditional songs
 *      whose words and tunes are long out of copyright; we link to a *search*
 *      for performances rather than embedding or hosting any recording, so the
 *      page makes no claim over, and ships none of, the underlying audio.
 *
 * Each `link` is a YouTube search URL for the song so a reader can preview a
 * performance on a third-party service of their choice. We intentionally link
 * to a search (not a single fixed video) so the page does not rot when an
 * individual upload is taken down, and so we are not curating/endorsing any one
 * uploader's recording. `artist` names a well-known performer or tradition
 * associated with the song, not an exclusive rights-holder.
 *
 * Out of scope (by design, per the issue): building an audio player, real
 * streaming integration, and any licensing arrangement.
 * --------------------------------------------------------------------------- */

export interface Shanty {
	/** Stable id, used for anchor links and the "jump to" nav. */
	id: string;
	/** Song title. */
	title: string;
	/** A performer or tradition associated with the song. */
	artist: string;
	/** Loose category, shown as a tag. */
	type: 'Capstan shanty' | 'Halyard shanty' | 'Short-haul shanty' | 'Folk ballad' | 'Forebitter';
	/** One-line note on the song and why it made the list. */
	note: string;
}

/** Build a YouTube search link for a song (a preview source, not an embed). */
export function previewLink(s: Shanty): string {
	return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${s.title} sea shanty`)}`;
}

export const shanties: Shanty[] = [
	{
		id: 'wellerman',
		title: 'The Wellerman (Soon May the Wellerman Come)',
		artist: 'Traditional (popularised by Nathan Evans)',
		type: 'Folk ballad',
		note: 'A 19th-century New Zealand whaling ballad that went viral in 2021 and reignited mainstream interest in shanties — the obvious anchor for any modern playlist.',
	},
	{
		id: 'drunken-sailor',
		title: 'Drunken Sailor (What Shall We Do with a Drunken Sailor?)',
		artist: 'Traditional (often The Irish Rovers)',
		type: 'Short-haul shanty',
		note: 'Perhaps the most recognisable shanty of all — a brisk stamp-and-go work song with an endlessly singable call-and-response.',
	},
	{
		id: 'leave-her-johnny',
		title: 'Leave Her, Johnny, Leave Her',
		artist: 'Traditional',
		type: 'Capstan shanty',
		note: 'Sung at the very end of a voyage as the crew worked the pumps before paying off — a wry farewell to a hard ship.',
	},
	{
		id: 'blow-the-man-down',
		title: 'Blow the Man Down',
		artist: 'Traditional',
		type: 'Halyard shanty',
		note: 'A classic halyard shanty from the Western Ocean packet trade, with a swaggering rhythm built for hauling on the lines.',
	},
	{
		id: 'south-australia',
		title: 'South Australia',
		artist: 'Traditional (often The Clancy Brothers)',
		type: 'Capstan shanty',
		note: 'A rollicking outward-bound capstan shanty — a perennial folk-club favourite that rewards a big chorus.',
	},
	{
		id: 'haul-away-joe',
		title: 'Haul Away, Joe',
		artist: 'Traditional',
		type: 'Short-haul shanty',
		note: 'A short-haul shanty whose single sharp pull per line shows exactly how the music was shaped by the work.',
	},
	{
		id: 'spanish-ladies',
		title: 'Spanish Ladies',
		artist: 'Traditional',
		type: 'Forebitter',
		note: "A Royal Navy forebitter (an off-watch song, not a work song) name-checked in Moby-Dick and Jaws — a sailor's homeward-bound classic.",
	},
	{
		id: 'fish-in-the-sea',
		title: 'The Fish in the Sea (Windy Old Weather)',
		artist: 'Traditional',
		type: 'Folk ballad',
		note: 'A playful fishing folk song cataloguing the catch verse by verse — a lighter, story-driven counterpoint to the work shanties.',
	},
];
