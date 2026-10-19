// The photo roll for /photography. photos.json is written by scripts/photos.py.
import roll from './photos.json';

// set by the camera on the home page right before it navigates, so the gallery
// knows to come in out of the flash
export const transit = { flash: false };

// instax borders as fractions of the film's width: mini for portrait shots,
// wide for landscape. The thick strip at the bottom is where you'd write on it.
const MINI = { side: 0.07, top: 0.08, bottom: 0.28 };
const WIDE = { side: 0.042, top: 0.06, bottom: 0.16 };

// seeded, so server and client stick them on the wall the same way
let s = 1966;
const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

export const photos = roll.map((p, i) => {
    const wide = p.w > p.h;
    const film = wide ? WIDE : MINI;
    return {
        ...p,
        n: i + 1,
        wide,
        film,
        // film height / film width
        ratio: film.top + film.bottom + ((1 - 2 * film.side) * p.h) / p.w,
        thumb: `/photography/thumb/${p.name}`,
        full: `/photography/full/${p.name}`,
        tilt: (r() * 2 - 1) * 3.6,
        drop: r(),
        nudge: r() * 2 - 1,
        // one strip across the top, or two across the corners
        tape: r() < 0.6 ? 'top' : 'corners',
        tapeTilt: (r() * 2 - 1) * 7,
        // the date it was taken, in marker on the bottom strip
        ink: p.taken ? p.taken.slice(2).split('-').reverse().join('.') : ''
    };
});
