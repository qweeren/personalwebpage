<script>
    // A bare drywall with the roll taped up on it as instant film. Click a print
    // to take it off the wall for a closer look; it keeps its border.
    import { onMount, tick } from 'svelte';
    import Cursor from '$lib/Cursor.svelte';
    import { photos, transit } from '$lib/photos.js';

    // arrived through the camera's flash: the wall develops out of the white
    const flashed = transit.flash;
    transit.flash = false;

    let open = $state(-1);
    let closing = $state(false);
    let vw = $state(1280);
    let vh = $state(800);
    let reduce = false;

    /** @type {HTMLButtonElement[]} */
    const prints = $state([]);
    /** @type {HTMLElement | undefined} */
    let big = $state();
    /** @type {HTMLButtonElement | undefined} */
    let closeBtn = $state();

    let shown = $derived(open >= 0 ? photos[open] : null);
    // as large as the screen allows, leaving room for the caption under it
    let bigWidth = $derived(shown ? Math.min(vw - (vw > 640 ? 170 : 24), (vh * 0.88 - 64) / shown.ratio, 1500) : 0);

    /**
     * Fly the big print from (or back to) its spot on the wall.
     * @param {number} i @param {'in' | 'out'} dir
     */
    function flip(i, dir) {
        const from = prints[i];
        if (reduce || !from || !big) return Promise.resolve();
        const a = from.getBoundingClientRect();
        const b = big.getBoundingClientRect();
        const dx = a.left + a.width / 2 - (b.left + b.width / 2);
        const dy = a.top + a.height / 2 - (b.top + b.height / 2);
        const k = from.offsetWidth / big.offsetWidth;
        const wall = { transform: `translate(${dx}px, ${dy}px) scale(${k}) rotate(${photos[i].tilt}deg)` };
        const keys = dir === 'in' ? [wall, { transform: 'none' }] : [{ transform: 'none' }, wall];
        return big
            .animate(keys, { duration: dir === 'in' ? 460 : 340, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' })
            .finished.catch(() => {});
    }

    /** @param {number} i */
    async function show(i) {
        open = i;
        await tick();
        flip(i, 'in');
        closeBtn?.focus({ preventScroll: true });
    }

    async function hide() {
        if (open < 0 || closing) return;
        const i = open;
        closing = true;
        await flip(i, 'out');
        open = -1;
        closing = false;
        prints[i]?.focus({ preventScroll: true });
    }

    /** @param {number} d */
    async function step(d) {
        if (open < 0 || closing) return;
        open = (open + d + photos.length) % photos.length;
        await tick();
        if (!reduce)
            big?.animate(
                [{ opacity: 0, transform: `translateX(${d * 40}px) rotate(${d * 1.5}deg)` }, { opacity: 1, transform: 'none' }],
                { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
            );
    }

    /** @param {KeyboardEvent} e */
    function onkey(e) {
        if (open < 0) return;
        if (e.key === 'Escape') hide();
        else if (e.key === 'ArrowRight') step(1);
        else if (e.key === 'ArrowLeft') step(-1);
    }

    // swipe between prints on touch screens
    let swipeX = 0;
    /** @param {PointerEvent} e */
    const swipeStart = (e) => (swipeX = e.clientX);
    /** @param {PointerEvent} e */
    function swipeEnd(e) {
        const dx = e.clientX - swipeX;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    }

    /**
     * Instant film comes out milky and the picture swims up into it. Each print
     * develops the first time it's on screen.
     * @param {HTMLElement} node
     */
    function develop(node) {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
        node.classList.add('latent');
        const io = new IntersectionObserver(
            ([e]) => {
                if (!e.isIntersecting) return;
                node.classList.replace('latent', 'developing');
                io.disconnect();
            },
            { threshold: 0.3 }
        );
        io.observe(node);
        return { destroy: () => io.disconnect() };
    }

    $effect(() => {
        document.documentElement.style.overflow = open >= 0 ? 'hidden' : '';
    });

    onMount(() => {
        reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        // the home page paints <html> black; the wall runs to the edges
        const root = document.documentElement;
        const bg = root.style.background;
        root.style.background = '#d4d0c6';
        return () => {
            root.style.background = bg;
            root.style.overflow = '';
        };
    });
</script>

<svelte:head>
    <title>photography · qweren</title>
    <meta name="description" content="Photos by Eren (qweren), shot on a Canon EOS 700D." />
    <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet" />
</svelte:head>

<svelte:window bind:innerWidth={vw} bind:innerHeight={vh} onkeydown={onkey} />

{#snippet print(/** @type {typeof photos[number]} */ p, /** @type {string} */ src, big = false)}
    <span class="film" style="--side: {p.film.side}; --top: {p.film.top}; --bottom: {p.film.bottom}">
        <span class="shot">
            {#if big}
                <img {src} alt={p.alt} width={p.w} height={p.h} style="background-image: url({p.thumb})" />
            {:else}
                <img {src} alt={p.alt} width={p.w} height={p.h} loading={p.n > 4 ? 'lazy' : 'eager'} use:develop />
            {/if}
        </span>
        {#if p.ink}<span class="ink" aria-hidden="true">{p.ink}</span>{/if}
    </span>
{/snippet}

<Cursor />

<div class="lamp" aria-hidden="true"></div>
<div class="wall" class:flashed>
    <span class="seam s1" aria-hidden="true"></span>
    <span class="seam s2" aria-hidden="true"></span>

    <header class="head">
        <a class="back" href="/#photography"><span aria-hidden="true">◀◀</span> back to the tape</a>
        <h1 class="title">photography</h1>
        <p class="label">canon eos 700d &nbsp;·&nbsp; 50mm f/1.8 &nbsp;·&nbsp; {photos.length} shots</p>
    </header>

    <ul class="board">
        {#each photos as p, i}
            <li
                class="pin"
                class:wide={p.wide}
                class:lifted={open === i}
                style="--tilt: {p.tilt}deg; --drop: {p.drop}; --nudge: {p.nudge}; --tt: {p.tapeTilt}deg"
            >
                <button class="paper frame" bind:this={prints[i]} onclick={() => show(i)} aria-label="Open photo {p.n}: {p.alt}">
                    {#if p.tape === 'top'}
                        <span class="tape top" aria-hidden="true"></span>
                    {:else}
                        <span class="tape tl" aria-hidden="true"></span>
                        <span class="tape tr" aria-hidden="true"></span>
                    {/if}
                    {@render print(p, p.thumb)}
                </button>
            </li>
        {/each}
    </ul>

    <footer class="foot">
        <p class="label">end of roll</p>
        <a class="back" href="/#photography"><span aria-hidden="true">◀◀</span> back to the tape</a>
    </footer>
</div>

{#if shown}
    <div class="lb" class:closing role="dialog" aria-modal="true" aria-label="Photo {shown.n} of {photos.length}">
        <button class="shade" tabindex="-1" aria-label="Close" onclick={hide}></button>
        <figure class="stage" onpointerdown={swipeStart} onpointerup={swipeEnd}>
            <div class="paper big" bind:this={big} style="width: {bigWidth}px">
                {@render print(shown, shown.full, true)}
            </div>
            <figcaption class="label">
                {String(shown.n).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}{#if shown.exif}&nbsp; · &nbsp;{shown.exif}{/if}
            </figcaption>
        </figure>
        <button class="ctl close label" bind:this={closeBtn} onclick={hide}>close ✕</button>
        <button class="ctl prev label" onclick={() => step(-1)} aria-label="Previous photo">◀</button>
        <button class="ctl next label" onclick={() => step(1)} aria-label="Next photo">▶</button>
    </div>
{/if}

{#if flashed}
    <div class="develop-in" aria-hidden="true"></div>
{/if}

<style>
    /* ---------- the wall ---------- */
    .wall {
        --drywall: #d4d0c6;
        --ink: #1d2433;
        --pencil: #57534b;
        position: relative;
        min-height: 100vh;
        overflow: clip;
        color: #1b1a17;
        background-color: var(--drywall);
        /* paper face of the board: fine fibres, plus soft blotches of joint compound */
        background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.25 0 0 0 0 0.23 0 0 0 0 0.2 0.9 0 0 0 -0.38'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='900'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.004' numOctaves='3' seed='4' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.94 0 0 0 0 0.91 1.4 0 0 0 -0.62'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E"),
            radial-gradient(ellipse 90% 55% at 50% 0%, rgba(255, 252, 244, 0.5), transparent 70%);
        font-family: var(--grot, 'Archivo', sans-serif);
        font-variation-settings: 'wdth' 80;
    }
    .lamp {
        /* a lamp somewhere above, falling off toward the corners */
        z-index: 2;
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at 50% 30%, transparent 50%, rgba(60, 50, 36, 0.28) 100%);
    }
    .wall.flashed { animation: overexposed 1.8s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
    @keyframes overexposed {
        from { filter: brightness(1.9) contrast(0.6) saturate(0.4); }
        to { filter: none; }
    }

    /* taped and mudded joints between the sheets, screws along the edges */
    .seam {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 120px;
        pointer-events: none;
        background:
            radial-gradient(circle at 16px 50%, rgba(236, 233, 226, 0.7) 0 6px, rgba(120, 112, 98, 0.12) 6.5px, transparent 8px) 0 0 / 100% 41vh repeat-y,
            radial-gradient(circle at calc(100% - 16px) 50%, rgba(236, 233, 226, 0.7) 0 6px, rgba(120, 112, 98, 0.12) 6.5px, transparent 8px) 0 13vh / 100% 41vh repeat-y,
            linear-gradient(to right, transparent, rgba(226, 223, 215, 0.4) 25%, rgba(228, 225, 218, 0.48) 50%, rgba(226, 223, 215, 0.4) 75%, transparent);
    }
    .s1 { left: calc(31% - 60px); }
    .s2 { left: calc(82% - 60px); }

    /* ---------- header ---------- */
    .head {
        position: relative;
        z-index: 1;
        padding: 5vh 6vw 2vh;
    }
    .back {
        display: inline-block;
        font-family: 'Permanent Marker', cursive;
        font-size: 1.15rem;
        color: var(--ink);
        text-decoration: none;
        padding: 0.45em 1.1em 0.4em;
        background: rgba(229, 219, 190, 0.92);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
        transform: rotate(-2.5deg);
        clip-path: polygon(0 6%, 3% 0, 6% 8%, 9% 1%, 100% 0, 97% 26%, 100% 50%, 97% 76%, 100% 100%, 8% 97%, 4% 100%, 0 93%, 3% 70%, 0 48%, 3% 25%);
    }
    .back:hover { background: #fff7d6; transform: rotate(-1deg) translateY(-2px); }
    .title {
        margin: 3vh 0 0 -0.04em;
        font-family: var(--gothic, 'Jacquard 24', serif);
        font-weight: 400;
        font-size: clamp(4.4rem, 15vw, 14rem);
        line-height: 0.8;
        color: #171614;
        transform: rotate(-1.5deg);
        transform-origin: left;
        /* like it was sprayed through a stencil: the edges bleed a little */
        text-shadow: 0 0 0.012em rgba(23, 22, 20, 0.7), 0.01em 0.015em 0.03em rgba(23, 22, 20, 0.25);
        mix-blend-mode: multiply;
    }
    /* embossed label-maker tape */
    .label {
        display: inline-block;
        margin: 2vh 0 0;
        padding: 0.35em 0.75em 0.38em;
        background: #121212;
        color: #f2f2f2;
        font-family: var(--grot, 'Archivo', sans-serif);
        font-variation-settings: 'wdth' 70;
        font-weight: 700;
        font-size: 0.95rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.6);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        border-radius: 2px;
    }
    .head .label { transform: rotate(1.2deg); margin-left: 8vw; }

    /* ---------- the prints ---------- */
    .board {
        position: relative;
        z-index: 1;
        list-style: none;
        margin: 0;
        padding: 6vh 4vw 10vh;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: flex-start;
        gap: 7vh 4.5vw;
    }
    .pin {
        width: clamp(220px, 21vw, 330px);
        margin-top: calc(var(--drop) * 9vh);
        translate: calc(var(--nudge) * 1.5vw) 0;
    }
    .pin.wide { width: clamp(290px, 34vw, 540px); }
    .pin.lifted { visibility: hidden; }

    .paper {
        display: block;
        position: relative;
        container-type: inline-size;
    }
    .frame {
        width: 100%;
        padding: 0;
        border: 0;
        background: none;
        cursor: pointer;
        font: inherit;
        transform: rotate(var(--tilt));
        transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .frame:hover {
        transform: rotate(calc(var(--tilt) * 0.4)) translateY(-6px) scale(1.025);
    }
    .frame:hover .film {
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 14px 22px -6px rgba(40, 30, 20, 0.4), 0 34px 44px -24px rgba(40, 30, 20, 0.45);
    }
    .frame:focus-visible {
        outline: 3px solid #171614;
        outline-offset: 8px;
    }

    .film {
        display: block;
        position: relative;
        padding: calc(var(--top) * 100cqw) calc(var(--side) * 100cqw) calc(var(--bottom) * 100cqw);
        background: linear-gradient(165deg, #fdfcf8, #f1efe8 60%, #e9e6dd);
        border-radius: 1.5px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.16), 0 6px 12px -4px rgba(40, 30, 20, 0.35), 0 18px 28px -18px rgba(40, 30, 20, 0.4);
        transition: box-shadow 0.3s;
    }
    .shot {
        display: block;
        position: relative;
        overflow: hidden;
        background: #2b2a27;
    }
    .shot img {
        display: block;
        width: 100%;
        height: auto;
        background-size: cover;
        background-position: center;
    }
    /* the window the picture sits in: a hairline edge and a bit of gloss */
    .shot::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.22), inset 0 1px 3px rgba(0, 0, 0, 0.3);
        background: linear-gradient(118deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 36%, rgba(255, 255, 255, 0) 72%, rgba(255, 255, 255, 0.06));
    }
    .shot::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background: #c3c7c4;
        opacity: 0;
    }
    .shot:has(:global(img.latent))::before { opacity: 1; }
    .shot:has(:global(img.developing))::before { animation: clear 1.5s cubic-bezier(0.3, 0.5, 0.3, 1) both; }
    :global(.shot img.latent) { filter: saturate(0) contrast(0.6); }
    :global(.shot img.developing) { animation: swim 2.4s cubic-bezier(0.3, 0.5, 0.3, 1) both; }
    @keyframes clear {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes swim {
        from { filter: saturate(0) contrast(0.6); }
        to { filter: none; }
    }

    .ink {
        position: absolute;
        left: calc(var(--side) * 100cqw);
        right: calc(var(--side) * 100cqw + 3cqw);
        bottom: 0;
        height: calc(var(--bottom) * 100cqw);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-family: 'Permanent Marker', cursive;
        font-size: calc(var(--bottom) * 100cqw * 0.3);
        color: var(--ink, #1d2433);
        opacity: 0.85;
        transform: rotate(-2.5deg);
        pointer-events: none;
    }

    /* masking tape holding it up */
    .tape {
        position: absolute;
        z-index: 2;
        height: 10cqw;
        background:
            linear-gradient(rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 40%),
            rgba(226, 216, 186, 0.82);
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
        clip-path: polygon(0 8%, 3% 0, 6% 10%, 9% 0, 91% 2%, 94% 12%, 97% 0, 100% 9%, 98% 30%, 100% 52%, 97% 74%, 100% 92%, 96% 100%, 92% 92%, 88% 100%, 8% 98%, 4% 100%, 0 92%, 3% 70%, 0 48%, 3% 26%);
    }
    .tape.top {
        width: 38cqw;
        left: 50%;
        top: -4.5cqw;
        transform: translateX(-50%) rotate(var(--tt));
    }
    .tape.tl,
    .tape.tr {
        width: 26cqw;
        top: 1cqw;
    }
    .tape.tl { left: -7cqw; transform: rotate(calc(-38deg + var(--tt))); }
    .tape.tr { right: -7cqw; transform: rotate(calc(38deg + var(--tt))); }

    .foot {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 3vh 6vw;
        padding: 4vh 6vw 10vh;
    }
    .foot .label { transform: rotate(-1.5deg); margin: 0; }

    /* ---------- a print off the wall ---------- */
    .lb {
        position: fixed;
        inset: 0;
        z-index: 80;
        display: grid;
        place-items: center;
        animation: dim 0.3s ease-out both;
    }
    .lb.closing { animation: undim 0.34s ease-in both; }
    .shade {
        position: absolute;
        inset: 0;
        border: 0;
        padding: 0;
        background: rgba(20, 17, 13, 0.84);
        backdrop-filter: blur(3px);
        cursor: zoom-out;
    }
    @keyframes dim { from { opacity: 0; } }
    @keyframes undim { to { opacity: 0; } }
    .lb.closing .big,
    .lb.closing figcaption { animation: none; }

    .stage {
        position: relative;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 22px;
        touch-action: pan-y;
    }
    .big .film {
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3), 0 30px 60px -20px rgba(0, 0, 0, 0.7);
    }
    .big img { user-select: none; -webkit-user-drag: none; }
    .stage .label {
        margin: 0;
        transform: rotate(-1deg);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        text-transform: lowercase;
        animation: dim 0.4s 0.25s ease-out both;
    }

    .ctl {
        position: absolute;
        z-index: 1;
        margin: 0;
        border: 0;
        cursor: pointer;
    }
    /* white label tape reads better against the dark */
    .lb .label { background: #ecebe6; color: #121212; text-shadow: none; }
    .ctl:hover { background: #121212; color: #f2f2f2; }
    .ctl:focus-visible { outline: 3px solid #f2f2f2; outline-offset: 3px; }
    .close { top: 18px; right: 18px; transform: rotate(2deg); }
    .prev,
    .next {
        top: 50%;
        font-size: 1.3rem;
        padding: 0.5em 0.7em;
    }
    .prev { left: 18px; transform: translateY(-50%) rotate(-3deg); }
    .next { right: 18px; transform: translateY(-50%) rotate(3deg); }

    .develop-in {
        position: fixed;
        inset: 0;
        z-index: 95;
        pointer-events: none;
        background: #fff;
        animation: fade 1.1s 0.08s ease-out forwards;
    }
    @keyframes fade { to { opacity: 0; } }

    /* ---------- small screens ---------- */
    @media (max-width: 640px) {
        .board { gap: 6vh 0; padding-top: 4vh; }
        .pin { width: 74vw; margin-top: 0; translate: calc(var(--nudge) * 5vw) 0; }
        .pin.wide { width: 88vw; }
        .label { font-size: 0.8rem; }
        .stage .label { white-space: normal; text-align: center; max-width: 90vw; }
        .prev,
        .next { top: auto; bottom: 18px; transform: none; }
    }

    @media (prefers-reduced-motion: reduce) {
        .wall.flashed,
        .lb,
        .stage .label { animation: none; }
        .develop-in { display: none; }
    }
</style>
