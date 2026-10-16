import { json } from '@sveltejs/kit';

// Finds a 30s preview for a track. Deezer first (bigger catalog, but no CORS,
// hence this endpoint), iTunes as a fallback.

/** @param {string} s */
const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
/** @param {string} artist */
const mainArtist = (artist) => artist.split(/\s*(?:&|,|\bfeat\.?|\bft\.?|\bx\b)\s*/i)[0];

/** @param {typeof fetch} fetch @param {string} title @param {string} artist */
async function deezer(fetch, title, artist) {
    const q = encodeURIComponent(`${title} ${mainArtist(artist)}`);
    const res = await fetch(`https://api.deezer.com/search?q=${q}&limit=10`);
    if (!res.ok) return '';
    const { data = [] } = await res.json();
    const withPreview = data.filter((/** @type {any} */ r) => r.preview);
    const a = norm(mainArtist(artist));
    const hit = withPreview.find((/** @type {any} */ r) => norm(r.artist?.name ?? '').includes(a)) ?? withPreview[0];
    return hit ? /** @type {string} */ (hit.preview) : '';
}

/** @param {typeof fetch} fetch @param {string} title @param {string} artist */
async function itunes(fetch, title, artist) {
    const term = encodeURIComponent(`${title} ${mainArtist(artist)}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=10`);
    if (!res.ok) return '';
    const { results = [] } = await res.json();
    const withPreview = results.filter((/** @type {any} */ r) => r.previewUrl);
    const a = norm(mainArtist(artist));
    const hit = withPreview.find((/** @type {any} */ r) => norm(r.artistName ?? '').includes(a)) ?? withPreview[0];
    return hit ? /** @type {string} */ (hit.previewUrl) : '';
}

export async function GET({ url, fetch, setHeaders }) {
    const title = url.searchParams.get('title')?.slice(0, 200) ?? '';
    const artist = url.searchParams.get('artist')?.slice(0, 200) ?? '';
    if (!title) return json({ src: '' }, { status: 400 });

    let src = '';
    for (const source of [deezer, itunes]) {
        try {
            src = await source(fetch, title, artist);
        } catch {
            src = '';
        }
        if (src) break;
    }
    // Deezer preview links are signed and expire after a while
    setHeaders({ 'cache-control': 'public, max-age=300, s-maxage=600' });
    return json({ src });
}
