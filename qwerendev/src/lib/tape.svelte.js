// The page's soundtrack: a 30s preview (via /api/preview) of whatever Last.fm says was
// played last, plus a synthesized tape-rewind whine. We try to start it as soon as
// the preview loads; most browsers block that until the visitor interacts, so
// otherwise playback starts on their first click/tap/key.

const VOLUME_KEY = 'tape-volume';

export const tape = $state({
    /** @type {{ title: string, artist: string } | null} */
    track: null,
    src: '',
    playing: false,
    // false once the visitor pauses it themselves; then we stop auto-starting it
    wanted: true,
    volume: 0.45
});

/** @type {HTMLAudioElement | null} */
let audio = null;
/** @type {AudioContext | null} */
let ac = null;
let lookup = '';

function el() {
    if (!audio) {
        audio = new Audio();
        audio.preload = 'none';
        audio.loop = true;
        audio.volume = tape.volume;
        audio.addEventListener('play', () => (tape.playing = true));
        audio.addEventListener('pause', () => (tape.playing = false));
        // signed preview links expire: look the track up again
        audio.addEventListener('error', () => {
            if (!tape.track || !audio?.getAttribute('src')) return;
            const { title, artist } = tape.track;
            lookup = '';
            setTrack(title, artist);
        });
    }
    return audio;
}

/** @param {string} title @param {string} artist */
export async function setTrack(title, artist) {
    const key = `${title}\n${artist}`;
    if (key === lookup) return;
    lookup = key;
    tape.track = { title, artist };
    try {
        const res = await fetch(`/api/preview?${new URLSearchParams({ title, artist })}`);
        const { src = '' } = await res.json();
        if (lookup !== key) return;
        if (!src) return void (tape.src = '');
        const wasPlaying = tape.playing;
        tape.src = src;
        const a = el();
        a.src = src;
        // autoplay attempt; if the browser refuses, armAutostart picks it up on the first gesture
        if (wasPlaying || tape.wanted) a.play().catch(() => {});
    } catch {
        if (lookup === key) tape.src = '';
    }
}

export function play() {
    if (!tape.src) return;
    tape.wanted = true;
    el().play().catch(() => {});
}

export function pause() {
    tape.wanted = false;
    audio?.pause();
}

export function toggle() {
    tape.playing ? pause() : play();
}

/** @param {number} v 0..1 */
export function setVolume(v) {
    tape.volume = Math.min(1, Math.max(0, v));
    if (audio) audio.volume = tape.volume;
    try {
        localStorage.setItem(VOLUME_KEY, String(tape.volume));
    } catch {
        // storage blocked: the setting just won't stick
    }
}

// first gesture anywhere starts the music, unless the visitor already said no
export function armAutostart() {
    try {
        const saved = parseFloat(localStorage.getItem(VOLUME_KEY) ?? '');
        if (saved >= 0 && saved <= 1) setVolume(saved);
    } catch {
        // no storage (private mode): keep the default
    }
    const start = () => {
        if (tape.wanted && tape.src && !tape.playing) el().play().catch(() => {});
        if (tape.src) off();
    };
    const off = () => ['pointerdown', 'keydown'].forEach((t) => removeEventListener(t, start, true));
    ['pointerdown', 'keydown'].forEach((t) => addEventListener(t, start, true));
    return off;
}

/**
 * Fast-wind whine + hiss for `ms`, then the clunk of the transport stopping.
 * The song stops while rewinding and starts again from the top.
 * @param {number} ms
 */
export function rewindSound(ms) {
    audio?.pause();
    try {
        ac ??= new AudioContext();
        ac.resume();
        const t0 = ac.currentTime, t1 = t0 + ms / 1000;
        const out = ac.createGain();
        out.gain.setValueAtTime(0, t0);
        out.gain.linearRampToValueAtTime(0.28, t0 + 0.08);
        out.gain.setValueAtTime(0.28, t1 - 0.05);
        out.gain.linearRampToValueAtTime(0, t1);
        out.connect(ac.destination);

        // tape hiss
        const len = Math.ceil(ac.sampleRate * (t1 - t0 + 0.1));
        const buf = ac.createBuffer(1, len, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const hiss = ac.createBufferSource();
        hiss.buffer = buf;
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = 0.9;
        bp.frequency.setValueAtTime(1800, t0);
        bp.frequency.exponentialRampToValueAtTime(5200, t1);
        const hg = ac.createGain();
        hg.gain.value = 0.5;
        hiss.connect(bp).connect(hg).connect(out);
        hiss.start(t0);
        hiss.stop(t1 + 0.05);

        // the motor/tape whine, pitching up as the reel empties, with a wobble
        const whine = ac.createOscillator();
        whine.type = 'sawtooth';
        whine.frequency.setValueAtTime(320, t0);
        whine.frequency.exponentialRampToValueAtTime(1400, t1);
        const lfo = ac.createOscillator();
        lfo.frequency.value = 13;
        const lfoAmt = ac.createGain();
        lfoAmt.gain.value = 40;
        lfo.connect(lfoAmt).connect(whine.frequency);
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2400;
        const wg = ac.createGain();
        wg.gain.value = 0.22;
        whine.connect(lp).connect(wg).connect(out);
        whine.start(t0);
        lfo.start(t0);
        whine.stop(t1 + 0.05);
        lfo.stop(t1 + 0.05);

        // clunk
        const thump = ac.createOscillator();
        thump.type = 'square';
        thump.frequency.setValueAtTime(140, t1);
        thump.frequency.exponentialRampToValueAtTime(45, t1 + 0.09);
        const tg = ac.createGain();
        tg.gain.setValueAtTime(0.0001, t1);
        tg.gain.exponentialRampToValueAtTime(0.35, t1 + 0.005);
        tg.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.12);
        const tl = ac.createBiquadFilter();
        tl.type = 'lowpass';
        tl.frequency.value = 900;
        thump.connect(tl).connect(tg).connect(ac.destination);
        thump.start(t1);
        thump.stop(t1 + 0.15);
    } catch {
        // no Web Audio: rewind silently
    }
    setTimeout(() => {
        if (!audio || !tape.src) return;
        audio.currentTime = 0;
        if (tape.wanted) audio.play().catch(() => {});
    }, ms + 180);
}
