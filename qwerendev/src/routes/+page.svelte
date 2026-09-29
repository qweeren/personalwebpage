<script>
    import { onMount } from 'svelte';
    import { Github } from 'lucide-svelte';
    import HeroBackground from '$lib/HeroBackground.svelte';
    import Professions from '$lib/Professions.svelte';
    import Status from '$lib/Status.svelte';
    import Timeline from '$lib/Timeline.svelte';
    import Cursor from '$lib/Cursor.svelte';

    const works = [
        {
            title: 'Content Warning Mods',
            description: 'Mods I made for the game Content Warning.',
            subProjects: ['Where My Bell At?', 'Detailed Face Rotation', 'More Stamina'],
            image: '/cwmods.png',
            link: 'https://steamcommunity.com/id/erenyrd/myworkshopfiles/?appid=2881650'
        },
        {
            title: 'Minecraft Mods',
            description: 'Mods, modpacks and shaders I made for Minecraft.',
            subProjects: ['Brighter Accesibility', 'Poops And Farts', 'World Wide Wanders'],
            image: '/mcmods.png',
            link: 'https://modrinth.com/user/qweren'
        },
        {
            title: 'FNF TR',
            description: 'A Turkish translation mod for Friday Night Funkin’.',
            image: '/friday-night-funkin.gif',
            link: 'https://gamebanana.com/mods/355919'
        },
        {
            title: 'Personal Desktop Website',
            description: 'A site that imitates Windows XP, with smaller projects of mine hosted on it.',
            image: '/personaldesktop.png',
            link: 'https://qweren.vercel.app'
        }
    ];

    const hobbies = ['Coding', 'Graphic Design', 'Translation', 'Modding Games'];

    const devicon = (/** @type {string} */ n) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${n}/${n}-original.svg`;
    const skills = [
        { name: 'Svelte', href: 'https://svelte.dev/', logos: ['https://svelte.dev/svelte-logo.svg'] },
        { name: 'Web', note: 'HTML, CSS, JavaScript', logos: [devicon('html5'), devicon('css3'), devicon('javascript')] },
        { name: 'C#', href: 'https://dotnet.microsoft.com/languages/csharp', logos: [devicon('csharp')] },
        { name: 'Python', href: 'https://www.python.org/', logos: [devicon('python')] },
        { name: 'Godot', href: 'https://godotengine.org/', logos: [devicon('godot')] }
    ];

    const SCENES = [
        { id: 'intro', label: 'intro' },
        { id: 'about', label: 'about' },
        { id: 'hobbies', label: 'hobbies' },
        { id: 'projects', label: 'projects' },
        { id: 'end', label: 'end' }
    ];

    /** @param {string} birthDate */
    function calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }
    const age = calculateAge('2006-01-05');
    const year = new Date().getFullYear();

    // torn-paper edges for the footage frames, seeded so server and client agree
    /** @param {number} seed */
    function jag(seed) {
        let s = seed * 9301 + 49297;
        const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
        const n = 18;
        const top = Array.from({ length: n + 1 }, (_, i) => `${((i / n) * 100).toFixed(1)}% ${(r() * 3.5).toFixed(1)}%`);
        const bottom = Array.from({ length: n + 1 }, (_, i) => `${(100 - (i / n) * 100).toFixed(1)}% ${(100 - r() * 3.5).toFixed(1)}%`);
        return `polygon(${[...top, ...bottom].join(', ')})`;
    }

    let clips = $state(SCENES.map((s, i) => ({ ...s, start: i / SCENES.length, end: (i + 1) / SCENES.length })));
    let progress = $state(0);
    let current = $state('intro');
    let camMode = $state('strip');
    let flashLit = $state(false);
    let clock = $state('');
    let flashKey = $state(0);
    let rewinding = $state(false);

    let reduce = false;
    let lastFlashAt = 0;
    /** @type {SVGFEGaussianBlurElement} */
    let smearEl;
    /** @type {HTMLCanvasElement} */
    let grainCanvas;

    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);

    // a white frame, then black: the cut between two shots
    function fire() {
        const now = performance.now();
        if (reduce || now - lastFlashAt < 600) return; // never more than ~2 flashes a second
        lastFlashAt = now;
        flashKey++;
    }

    function tear(ms = 170) {
        if (reduce) return;
        const root = document.documentElement;
        root.classList.add('tear');
        setTimeout(() => root.classList.remove('tear'), ms);
    }

    /** @param {string} id */
    function jump(id) {
        const el = document.getElementById(id);
        if (!el) return;
        fire();
        tear(220);
        // cut while the frame is white
        setTimeout(() => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }), reduce ? 0 : 60);
    }

    /** @param {number} frac */
    function scrub(frac) {
        window.scrollTo({ top: frac * maxScroll(), behavior: 'instant' });
    }

    function rewind() {
        if (reduce) return window.scrollTo({ top: 0, behavior: 'instant' });
        rewinding = true;
        const from = scrollY;
        const t0 = performance.now();
        const dur = Math.min(1700, 500 + from * 0.12);
        /** @param {number} now */
        const step = (now) => {
            const k = Math.min(1, (now - t0) / dur);
            window.scrollTo({ top: from * (1 - k * k), behavior: 'instant' });
            if (k < 1) requestAnimationFrame(step);
            else {
                rewinding = false;
                lastFlashAt = 0;
                fire();
            }
        };
        requestAnimationFrame(step);
    }

    function measure() {
        const vh = innerHeight;
        const max = maxScroll();
        const starts = SCENES.map((s, i) => {
            const el = document.getElementById(s.id);
            if (!el || i === 0) return 0;
            const top = el.getBoundingClientRect().top + scrollY;
            return Math.min(1, Math.max(0, (top - vh * 0.5) / max));
        });
        clips = SCENES.map((s, i) => ({ ...s, start: starts[i], end: i < SCENES.length - 1 ? starts[i + 1] : 1 }));
    }

    /**
     * Stutter-cut an element into frame each time it enters the viewport.
     * @param {HTMLElement} node @param {number} delay
     */
    function cut(node, delay = 0) {
        node.classList.add('cut');
        node.style.setProperty('--d', `${delay}ms`);
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            node.classList.add('in');
            return {};
        }
        const io = new IntersectionObserver(
            ([e]) => {
                if (!e.isIntersecting) return;
                node.classList.remove('in');
                void node.offsetWidth;
                node.classList.add('in');
            },
            { threshold: 0.15 }
        );
        io.observe(node);
        return { destroy: () => io.disconnect() };
    }

    onMount(() => {
        reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const root = document.documentElement;

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(document.body);

        const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
        const tick = () => {
            const d = new Date();
            clock = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };
        tick();
        const clockTimer = setInterval(tick, 1000);

        // scroll: playhead, current clip, and vertical motion blur from scroll speed
        let lastY = scrollY, vel = 0, lastSmear = 0, raf = 0;
        const loop = () => {
            raf = requestAnimationFrame(loop);
            const y = scrollY;
            progress = Math.min(1, y / maxScroll());
            vel = vel * 0.75 + (y - lastY) * 0.25;
            lastY = y;

            const smear = reduce ? 0 : Math.min(Math.abs(vel) * 0.45, 20);
            if (Math.abs(smear - lastSmear) > 0.15) {
                smearEl.setAttribute('stdDeviation', `0 ${smear.toFixed(1)}`);
                root.classList.toggle('moving', smear > 0.8);
                root.style.setProperty('--skew', `${Math.max(-3, Math.min(3, vel * 0.06)).toFixed(2)}deg`);
                lastSmear = smear;
            }

            let now = clips[0].id;
            for (const c of clips) if (progress >= c.start - 0.0001) now = c.id;
            if (now !== current) {
                current = now;
                if (!rewinding) fire();
            }
        };
        raf = requestAnimationFrame(loop);

        // random signal tears, like a bad tape
        /** @type {ReturnType<typeof setTimeout>} */
        let tearTimer;
        const scheduleTear = () => {
            tearTimer = setTimeout(() => {
                tear(110 + Math.random() * 160);
                scheduleTear();
            }, 4000 + Math.random() * 6500);
        };
        if (!reduce) scheduleTear();

        // film grain: small noise tiles, re-shuffled ~16 times a second
        const g = /** @type {CanvasRenderingContext2D} */ (grainCanvas.getContext('2d'));
        const tiles = Array.from({ length: 4 }, () => {
            const c = document.createElement('canvas');
            c.width = c.height = 128;
            const cx = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
            const img = cx.createImageData(128, 128);
            for (let i = 0; i < img.data.length; i += 4) {
                const v = Math.random() * 255;
                img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
                img.data[i + 3] = Math.random() < 0.55 ? Math.random() * 46 : 0;
            }
            cx.putImageData(img, 0, 0);
            return /** @type {CanvasPattern} */ (g.createPattern(c, 'repeat'));
        });
        const sizeGrain = () => {
            grainCanvas.width = Math.ceil(innerWidth / 2);
            grainCanvas.height = Math.ceil(innerHeight / 2);
        };
        sizeGrain();
        addEventListener('resize', sizeGrain);
        let grainRaf = 0, lastGrain = 0, tileIndex = 0;
        /** @param {number} t */
        const grain = (t) => {
            grainRaf = requestAnimationFrame(grain);
            if (t - lastGrain < 62) return;
            lastGrain = t;
            const w = grainCanvas.width, h = grainCanvas.height;
            const ox = Math.random() * 128, oy = Math.random() * 128;
            g.clearRect(0, 0, w, h);
            g.save();
            g.translate(-ox, -oy);
            g.fillStyle = tiles[tileIndex = (tileIndex + 1) % tiles.length];
            g.fillRect(0, 0, w + ox, h + oy);
            g.restore();
        };
        if (reduce) grain(1000);
        else grainRaf = requestAnimationFrame(grain);

        return () => {
            ro.disconnect();
            clearInterval(clockTimer);
            clearTimeout(tearTimer);
            cancelAnimationFrame(raf);
            cancelAnimationFrame(grainRaf);
            removeEventListener('resize', sizeGrain);
        };
    });
</script>

<svelte:head>
    <title>qweren</title>
    <meta name="description" content="Eren (qweren): ELT student, developer and translator. Game mods, websites and other projects." />
</svelte:head>

{#snippet chain(reverse = false, tilt = 0)}
    <div class="chain" class:reverse style="--tilt: {tilt}deg" aria-hidden="true">
        <svg><rect width="100%" height="100%" fill="url(#chainlink)" /></svg>
    </div>
{/snippet}

{#snippet dropLetters(/** @type {string} */ word)}
    {#each word.split('') as ch, i}
        <span class="ch" style="--i: {i}">{ch}</span>
    {/each}
{/snippet}

<svg class="defs" aria-hidden="true" width="0" height="0">
    <defs>
        <filter id="smear" x="-5%" y="-40%" width="110%" height="180%">
            <feGaussianBlur bind:this={smearEl} stdDeviation="0 0" />
        </filter>
        <filter id="tear" x="-10%" y="0%" width="120%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.00001 0.07" numOctaves="1" seed="7" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1" result="shift" />
            <feDisplacementMap in="SourceGraphic" in2="shift" scale="70" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id="chainlink" width="56" height="28" patternUnits="userSpaceOnUse">
            <rect x="3" y="5" width="34" height="18" rx="9" fill="none" stroke="#fff" stroke-width="4" />
            <rect x="31" y="12" width="28" height="4" fill="#fff" />
        </pattern>
    </defs>
</svg>

<!-- overlays: the lens and the tape -->
<canvas class="grain" bind:this={grainCanvas} aria-hidden="true"></canvas>
<div class="scanlines" aria-hidden="true"></div>
<div class="rollbar" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
{#if flashKey > 0}
    {#key flashKey}
        <div class="flash" aria-hidden="true"></div>
    {/key}
{/if}
{#if rewinding}
    <div class="rew" aria-live="polite">
        <span class="rew-glyph" aria-hidden="true">◀◀</span> rewinding
    </div>
{/if}

<div class="viewfinder" aria-hidden="true">
    <span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
    <span class="osd osd-l"><i class="rec-dot"></i>rec</span>
    <span class="osd osd-r">{clock}</span>
</div>

<Cursor />

<main class:rewinding>
    <!-- INTRO -->
    <section id="intro" class="scene intro" class:lit={flashLit} class:nv={camMode === 'nv'} class:is-current={current === 'intro'}>
        <HeroBackground onflash={(v) => (flashLit = v)} onmode={(m) => (camMode = m)} />

        <div class="cam-osd" aria-hidden="true">
            <span>{camMode === 'nv' ? 'IR  0.0 LUX' : camMode === 'flash' ? 'FLASH ON' : 'CAM 03'}</span>
            <span class="batt"><i></i><i></i><i></i><i class="low"></i></span>
        </div>

        <span class="big-x" aria-hidden="true"></span>

        <h1 class="name" data-text="qweren" aria-label="qweren">
            <span aria-hidden="true">{@render dropLetters('qweren')}</span>
        </h1>

        <Professions />

        <a class="scroll-cue" href="#about" onclick={(e) => { e.preventDefault(); jump('about'); }}>scroll</a>
    </section>

    <!-- ABOUT -->
    <section id="about" class="scene about" class:is-current={current === 'about'}>
        <h2 class="ghost-word" aria-label="About">{@render dropLetters('about')}</h2>

        <div class="about-top">
            <p class="age" use:cut>
                <span class="age-im">i’m</span>
                <span class="age-num smear">{age}</span>
            </p>

            <p class="study" use:cut={140}>
                3rd year ELT student at
                <a href="https://www.omu.edu.tr/" target="_blank" rel="noopener noreferrer">
                    Ondokuz Mayıs University
                    <img src="https://upload.wikimedia.org/wikipedia/tr/c/c4/OM%C3%9C_logo.svg" alt="" class="omu" />
                </a>
            </p>

            <div class="tape-slot" use:cut={260}>
                <Status />
            </div>
        </div>

        <div class="tools">
            <h3 class="caption-box" use:cut>tools</h3>
            <ul>
                {#each skills as skill, i}
                    <li class="tool-row" style="--off: {[0, 3, 1, 4, 2][i]}" use:cut={i * 70}>
                        <svelte:element
                            this={skill.href ? 'a' : 'span'}
                            class="tool"
                            href={skill.href}
                            target={skill.href ? '_blank' : undefined}
                            rel={skill.href ? 'noopener noreferrer' : undefined}
                        >
                            <span class="tool-logos">
                                {#each skill.logos as logo}<img src={logo} alt="" />{/each}
                            </span>
                            <span class="tool-name">{skill.name}</span>
                            {#if skill.note}<span class="tool-note">{skill.note}</span>{/if}
                        </svelte:element>
                    </li>
                {/each}
            </ul>
        </div>
    </section>

    <!-- HOBBIES -->
    <section id="hobbies" class="scene hobbies" class:is-current={current === 'hobbies'}>
        {@render chain(false, -2)}
        <h2 class="caption-box hob-title" use:cut>hobbies</h2>
        <ul class="strips">
            {#each hobbies as hobby, i}
                <li class="strip strip-{i}" style="--dur: {[19, 27, 15, 23][i]}s">
                    <span class="sr-only">{hobby}</span>
                    <div class="strip-track" aria-hidden="true">
                        {#each Array(6) as _}
                            <span class="strip-word">{hobby}</span><span class="strip-sep">{i % 2 ? '†' : '✕'}</span>
                        {/each}
                    </div>
                </li>
            {/each}
        </ul>
        {@render chain(true, 3)}
    </section>

    <!-- PROJECTS -->
    <section id="projects" class="scene projects" class:is-current={current === 'projects'}>
        <h2 class="proj-title smear" use:cut>{@render dropLetters('projects')}</h2>

        <div class="reel">
            {#each works as work, i}
                <article class="footage f{i}" use:cut={i * 90}>
                    <div class="frame-wrap">
                        <a class="frame" href={work.link} target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true" style="clip-path: {jag(i + 1)}">
                            <img src={work.image} alt="" loading="lazy" />
                            <span class="f-osd f-tl"><i class="rec-dot"></i>rec</span>
                            <span class="f-osd f-tr">cam 0{i + 1}</span>
                            <span class="f-osd f-bl">00:0{i}:{17 + i * 11}:0{(i * 7) % 10}</span>
                            <span class="sweep"></span>
                        </a>
                    </div>
                    <div class="f-meta">
                        <h3 class="smear">{work.title}</h3>
                        <p>{work.description}</p>
                        {#if work.subProjects}
                            <ul class="tapes">
                                {#each work.subProjects as sub, j}
                                    <li style="--r: {((i + j) % 3 - 1) * 2.5}deg">{sub}</li>
                                {/each}
                            </ul>
                        {/if}
                        <a class="open" href={work.link} target="_blank" rel="noopener noreferrer">Open project</a>
                    </div>
                </article>
            {/each}
        </div>
    </section>

    <!-- END -->
    <footer id="end" class="scene end" class:is-current={current === 'end'}>
        {@render chain(false, 0)}
        <h2 class="end-title">
            <span class="end-line">{@render dropLetters('end of')}</span>
            <span class="end-line">{@render dropLetters('tape')}</span>
        </h2>

        <div class="end-grid">
            <nav class="socials" aria-label="Elsewhere">
                <a href="https://github.com/qweeren/" target="_blank" rel="noopener noreferrer" style="--o: 0">
                    <Github size={40} strokeWidth={2.5} aria-hidden="true" /> github
                </a>
                <a href="https://steamcommunity.com/id/erenyrd/" target="_blank" rel="noopener noreferrer" style="--o: 1">
                    <img src="/steam.svg" alt="" /> steam
                </a>
                <a href="https://open.spotify.com/user/15apjwc8ui4nhsc7lq90a4h7g?si=70824440834d46d5" target="_blank" rel="noopener noreferrer" style="--o: 2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" alt="" /> spotify
                </a>
            </nav>

            <div class="credits">
                <div class="roll">
                    <p><span>made by</span> Eren</p>
                    <p><span>built with</span> Svelte</p>
                    <p><span>hosted on</span> Vercel</p>
                    <p><span>now playing via</span> Last.fm</p>
                    <p>© {year} Eren</p>
                </div>
            </div>
        </div>

        <button class="rewind" onclick={rewind}>
            <span aria-hidden="true">◀◀</span> Rewind to start
        </button>
    </footer>
</main>

<Timeline {clips} {progress} {current} onjump={jump} onscrub={scrub} />

<style>
    /* ---------- base ---------- */
    :global(:root) {
        --void: #000000;
        --flash: #ffffff;
        --tube: #e4f1ee;
        --nv: #6f9c8e;
        --soot: #3a3a3a;
        --ash: #8a8a8a;
        --gothic: 'Jacquard 24', serif;
        --grot: 'Archivo', 'Arial Narrow', sans-serif;
        --tl-h: 52px;
        --skew: 0deg;
    }
    :global(html) {
        background: var(--void);
        color: var(--flash);
        scrollbar-width: none;
        overflow-x: clip;
    }
    :global(html::-webkit-scrollbar) { display: none; }
    :global(body) {
        margin: 0;
        background: var(--void);
        color: var(--flash);
        font-family: var(--grot);
        font-variation-settings: 'wdth' 80;
        font-weight: 400;
        -webkit-font-smoothing: antialiased;
        overflow-x: clip;
    }
    :global(::selection) { background: var(--flash); color: var(--void); }
    :global(a:focus-visible),
    :global(button:focus-visible) {
        outline: 3px solid var(--nv);
        outline-offset: 3px;
    }
    :global(.sr-only) {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
    }

    .defs { position: absolute; width: 0; height: 0; }

    main {
        position: relative;
        padding-bottom: var(--tl-h);
    }

    .scene {
        position: relative;
        min-height: 100vh;
        overflow: clip;
    }
    :global(html.moving) .scene { transform: skewY(var(--skew)); }
    :global(html.moving) .smear { filter: url(#smear); }
    :global(html.tear) .scene.is-current { filter: url(#tear); }

    /* ---------- overlays ---------- */
    .grain,
    .scanlines,
    .rollbar,
    .vignette,
    .viewfinder {
        position: fixed;
        inset: 0;
        pointer-events: none;
    }
    .grain {
        z-index: 50;
        width: 100vw;
        height: 100vh;
        image-rendering: pixelated;
        opacity: 0.9;
    }
    :global(html.tear) .grain { opacity: 1; filter: contrast(2); }
    .scanlines {
        z-index: 51;
        background: repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0, 0, 0, 0.32) 2px 3px);
    }
    .rollbar {
        z-index: 52;
        height: 22vh;
        background: linear-gradient(to bottom, transparent, rgba(228, 241, 238, 0.045) 45%, rgba(228, 241, 238, 0.07) 50%, transparent);
        animation: roll 7.3s linear infinite;
    }
    .vignette {
        z-index: 49;
        background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.75) 100%);
    }
    .flash {
        position: fixed;
        inset: 0;
        z-index: 90;
        pointer-events: none;
        animation: flash 0.2s steps(1) forwards;
    }
    @keyframes flash {
        0% { background: var(--flash); }
        35% { background: var(--void); }
        60% { background: rgba(228, 241, 238, 0.35); }
        100% { background: transparent; }
    }
    @keyframes roll {
        from { transform: translateY(-25vh); }
        to { transform: translateY(105vh); }
    }

    .viewfinder { z-index: 55; bottom: var(--tl-h); }
    .corner {
        position: absolute;
        width: 34px;
        height: 34px;
        border: 0 solid var(--flash);
    }
    .c1 { top: 14px; left: 14px; border-top-width: 3px; border-left-width: 3px; }
    .c2 { top: 14px; right: 14px; border-top-width: 3px; border-right-width: 3px; }
    .c3 { bottom: 14px; left: 14px; border-bottom-width: 3px; border-left-width: 3px; }
    .c4 { bottom: 14px; right: 14px; border-bottom-width: 3px; border-right-width: 3px; }
    .osd {
        position: absolute;
        top: 22px;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 700;
        font-size: 0.95rem;
        letter-spacing: 0.02em;
        text-shadow: 1px 1px 0 #000;
        white-space: pre;
        font-variant-numeric: tabular-nums;
    }
    .osd-l { left: 58px; display: flex; align-items: center; gap: 7px; text-transform: uppercase; }
    .osd-r { right: 58px; }
    .rec-dot {
        display: inline-block;
        width: 0.62em;
        height: 0.62em;
        border-radius: 50%;
        background: currentColor;
        animation: blink 1s steps(1) infinite;
    }

    .rew {
        position: fixed;
        z-index: 91;
        inset: 0;
        display: grid;
        place-content: center;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 900;
        font-size: clamp(2rem, 7vw, 5rem);
        mix-blend-mode: difference;
        pointer-events: none;
        background: repeating-linear-gradient(to bottom, transparent 0 40px, rgba(255, 255, 255, 0.14) 40px 46px);
        animation: tracking 0.25s steps(3) infinite;
    }
    .rew-glyph { animation: blink 0.4s steps(1) infinite; }
    main.rewinding { filter: contrast(1.6) brightness(1.1); }
    main.rewinding .scene { transform: skewX(-6deg) translateX(-2vw); }
    @keyframes tracking {
        to { background-position: 0 46px; }
    }

    /* ---------- shared devices ---------- */
    :global(.cut:not(.in)) { visibility: hidden; }
    :global(.cut.in) { animation: stutter 0.5s steps(1, end) var(--d, 0ms) both; }
    @keyframes -global-stutter {
        0% { visibility: visible; clip-path: inset(0 0 70% 0); transform: translateX(-16px); }
        12% { visibility: hidden; }
        24% { visibility: visible; clip-path: inset(45% 0 0 0); transform: translateX(12px); }
        38% { visibility: hidden; }
        52% { visibility: visible; clip-path: inset(0 0 0 0); transform: translateX(-5px) skewX(-10deg); }
        68% { transform: translateX(2px); }
        100% { visibility: visible; clip-path: none; transform: none; }
    }

    .ch {
        display: inline-block;
        animation: drop calc(2.3s + var(--i) * 0.77s) steps(1) infinite;
        animation-delay: calc(var(--i) * -0.41s);
    }
    @keyframes drop {
        0%, 86%, 90%, 100% { opacity: 1; transform: none; }
        87% { opacity: 0; }
        88% { opacity: 1; transform: translate(0.04em, -0.03em); }
        89% { opacity: 0.2; }
    }

    .caption-box {
        display: inline-block;
        margin: 0;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 800;
        font-size: clamp(1.3rem, 2.4vw, 2rem);
        line-height: 1;
        padding: 0.12em 0.3em 0.16em;
        background: var(--flash);
        color: var(--void);
    }

    .chain {
        position: relative;
        z-index: 3;
        width: 112vw;
        margin-left: -6vw;
        height: 28px;
        overflow: hidden;
        transform: rotate(var(--tilt));
    }
    .chain svg {
        width: calc(100% + 56px);
        height: 28px;
        animation: chain 0.9s linear infinite;
    }
    .chain.reverse svg { animation-direction: reverse; }
    @keyframes chain { to { transform: translateX(-56px); } }

    /* ---------- intro ---------- */
    .intro {
        height: 100vh;
        min-height: 560px;
        background: var(--void);
    }
    .cam-osd {
        position: absolute;
        z-index: 4;
        left: 58px;
        top: 50px;
        display: flex;
        gap: 14px;
        align-items: center;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 700;
        font-size: 0.95rem;
        white-space: pre;
        text-shadow: 1px 1px 0 #000;
    }
    .batt {
        display: inline-flex;
        gap: 2px;
        padding: 2px;
        border: 2px solid currentColor;
    }
    .batt i { width: 5px; height: 9px; background: currentColor; }
    .batt i.low { animation: blink 0.8s steps(1) infinite; }

    .big-x {
        position: absolute;
        z-index: 3;
        right: -9vmin;
        top: -6vmin;
        width: 62vmin;
        height: 62vmin;
        mix-blend-mode: difference;
        animation: xsnap 3.3s steps(1) infinite;
        pointer-events: none;
    }
    .big-x::before,
    .big-x::after {
        content: '';
        position: absolute;
        left: -10%;
        right: -10%;
        top: 50%;
        height: 3.4vmin;
        margin-top: -1.7vmin;
        background: var(--flash);
        transform: rotate(45deg);
    }
    .big-x::after { transform: rotate(-45deg); }
    @keyframes xsnap {
        0% { transform: none; }
        31% { transform: rotate(9deg) scale(1.04); }
        33% { transform: rotate(-4deg) translate(3vmin, 1vmin); }
        70% { transform: rotate(2deg) scale(0.97); }
        72% { transform: none; opacity: 0.2; }
        74% { opacity: 1; }
    }

    .name {
        position: absolute;
        z-index: 5;
        left: -0.04em;
        bottom: calc(var(--tl-h) + 2vh);
        margin: 0;
        font-family: var(--gothic);
        font-weight: 400;
        font-size: clamp(7rem, 31vw, 30rem);
        line-height: 0.72;
        letter-spacing: -0.02em;
        color: var(--flash);
        mix-blend-mode: difference;
        white-space: nowrap;
        text-shadow: 0 0 0.04em rgba(255, 255, 255, 0.6);
    }
    .name::before,
    .name::after {
        content: attr(data-text);
        position: absolute;
        inset: 0;
        pointer-events: none;
    }
    .name::before {
        color: var(--nv);
        transform: translateX(-0.03em);
        animation: slice-a 2.7s steps(1) infinite;
    }
    .name::after {
        color: var(--tube);
        transform: translateX(0.045em);
        animation: slice-b 3.9s steps(1) infinite;
    }
    /* difference over the IR tint goes pink; keep night vision strictly mono */
    .intro.nv .name,
    .intro.nv .big-x { mix-blend-mode: normal; }
    .intro.lit .name { transform: translate(-0.02em, 0.012em) scale(1.012); }
    .intro.lit .name::after { clip-path: inset(30% 0 40% 0); transform: translateX(0.12em); }
    @keyframes slice-a {
        0%, 100% { clip-path: inset(100% 0 0 0); }
        20% { clip-path: inset(12% 0 71% 0); }
        22% { clip-path: inset(60% 0 22% 0); }
        24% { clip-path: inset(100% 0 0 0); }
        61% { clip-path: inset(40% 0 44% 0); transform: translateX(-0.08em); }
        63% { clip-path: inset(100% 0 0 0); }
    }
    @keyframes slice-b {
        0%, 100% { clip-path: inset(100% 0 0 0); }
        44% { clip-path: inset(0 0 82% 0); }
        46% { clip-path: inset(74% 0 5% 0); transform: translateX(-0.06em); }
        48% { clip-path: inset(100% 0 0 0); }
        88% { clip-path: inset(33% 0 50% 0); transform: translateX(0.1em); }
        89% { clip-path: inset(100% 0 0 0); }
    }

    .scroll-cue {
        position: absolute;
        z-index: 5;
        right: 22px;
        bottom: calc(var(--tl-h) + 34vh);
        writing-mode: vertical-rl;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 700;
        font-size: 1rem;
        color: var(--flash);
        text-decoration: none;
        padding: 10px 4px;
        border: 2px solid var(--flash);
        mix-blend-mode: difference;
        animation: blink 1.4s steps(1) infinite;
    }
    .scroll-cue:hover { background: var(--flash); color: var(--void); animation: none; mix-blend-mode: normal; }

    /* ---------- about ---------- */
    .about {
        padding: 18vh 0 16vh;
    }
    .ghost-word {
        position: absolute;
        z-index: 0;
        top: -0.12em;
        right: -0.06em;
        margin: 0;
        font-family: var(--gothic);
        font-weight: 400;
        font-size: clamp(9rem, 36vw, 36rem);
        line-height: 0.8;
        color: transparent;
        -webkit-text-stroke: 2px var(--soot);
        pointer-events: none;
        white-space: nowrap;
    }

    .about-top {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 7vw minmax(0, 1fr) minmax(0, 1.1fr) 4vw;
        grid-template-areas:
            '. age   tape  .'
            '. study tape  .';
        row-gap: 5vh;
    }
    .age {
        grid-area: age;
        margin: 0;
        display: flex;
        align-items: flex-end;
        gap: 0.2em;
        font-family: var(--gothic);
        line-height: 0.75;
    }
    .age-im {
        font-size: clamp(3rem, 9vw, 8rem);
        color: var(--ash);
        transform: translateY(-0.9em);
    }
    .age-num {
        font-size: clamp(10rem, 40vw, 34rem);
        text-shadow: 0.02em 0 0 var(--nv), -0.015em 0 0 var(--tube);
    }
    .study {
        grid-area: study;
        align-self: start;
        margin: 0;
        max-width: 22ch;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 800;
        font-size: clamp(1.6rem, 3.6vw, 3.1rem);
        line-height: 1;
        letter-spacing: -0.01em;
        padding-left: 12vw;
    }
    .study a {
        color: var(--flash);
        text-decoration: underline;
        text-decoration-thickness: 0.12em;
        text-underline-offset: 0.12em;
    }
    .study a:hover { background: var(--flash); color: var(--void); text-decoration: none; }
    .omu {
        height: 0.9em;
        vertical-align: -0.1em;
        margin-left: 0.15em;
        filter: grayscale(1) brightness(0) invert(1);
    }
    .study a:hover .omu { filter: grayscale(1) brightness(0); }
    .tape-slot {
        grid-area: tape;
        justify-self: end;
        width: min(460px, 100%);
        align-self: center;
        transform: rotate(-3.5deg) translate(2vw, 4vh);
    }

    .tools {
        position: relative;
        z-index: 1;
        margin-top: 14vh;
        padding-left: 4vw;
    }
    .tools ul {
        list-style: none;
        margin: 2vh 0 0;
        padding: 0;
    }
    .tool-row {
        margin-left: calc(var(--off) * 7vw);
        margin-top: -0.6vw;
    }
    .tool {
        display: inline-flex;
        align-items: center;
        gap: 0.25em;
        color: var(--flash);
        text-decoration: none;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 900;
        font-size: clamp(3.4rem, 10.5vw, 10rem);
        line-height: 0.86;
        text-transform: uppercase;
        letter-spacing: -0.02em;
        padding: 0 0.08em;
    }
    .tool:hover {
        font-variation-settings: 'wdth' 125;
        background: var(--flash);
        color: var(--void);
        text-shadow: 0.03em 0 0 var(--nv), -0.03em 0 0 var(--soot);
    }
    .tool-logos {
        display: inline-flex;
        gap: 0.08em;
    }
    .tool-logos img {
        height: 0.62em;
        width: auto;
        filter: grayscale(1) contrast(4) brightness(1.6);
    }
    .tool:hover .tool-logos img { filter: grayscale(1) contrast(4) invert(1); }
    .tool-note {
        align-self: flex-start;
        margin-top: 0.3em;
        font-size: 0.14em;
        font-weight: 600;
        letter-spacing: 0;
        text-transform: none;
        font-variation-settings: 'wdth' 75;
        color: var(--ash);
    }

    /* ---------- hobbies ---------- */
    .hobbies {
        min-height: 0;
        padding: 10vh 0 12vh;
    }
    .hob-title {
        margin: 7vh 0 3vh 20vw;
        transform: rotate(-2deg);
    }
    .strips {
        list-style: none;
        margin: 0 0 8vh;
        padding: 0;
    }
    .strip {
        overflow: hidden;
        width: 110vw;
        margin-left: -5vw;
        line-height: 0.9;
        white-space: nowrap;
    }
    .strip-track {
        display: inline-flex;
        align-items: center;
        animation: marquee var(--dur) linear infinite;
    }
    .strip:nth-child(even) .strip-track { animation-direction: reverse; }
    .strip-sep { padding: 0 0.3em; font-family: var(--grot); }

    .strip-0 {
        transform: rotate(-2deg);
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 900;
        font-size: clamp(4rem, 14vw, 13rem);
        text-transform: uppercase;
    }
    .strip-1 {
        transform: rotate(1.2deg);
        margin-top: -2vw;
        font-family: var(--gothic);
        font-size: clamp(4.5rem, 16vw, 15rem);
        color: var(--ash);
    }
    .strip-2 {
        transform: rotate(-4deg);
        margin-top: -1vw;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 125;
        font-weight: 900;
        font-size: clamp(3rem, 10vw, 9rem);
        text-transform: uppercase;
        color: transparent;
        -webkit-text-stroke: 2px var(--flash);
    }
    .strip-3 {
        transform: rotate(2deg);
        margin-top: 1vw;
        background: var(--flash);
        color: var(--void);
        font-family: var(--gothic);
        font-size: clamp(3.6rem, 12vw, 11rem);
        padding: 0.06em 0 0.12em;
    }
    .strip:hover .strip-track { animation-play-state: paused; }
    .strip:hover { filter: invert(1); background: var(--void); }
    .strip-3:hover { background: var(--flash); }
    @keyframes marquee { to { transform: translateX(-50%); } }

    /* ---------- projects ---------- */
    .projects { padding: 12vh 4vw 18vh; }
    .proj-title {
        margin: 0 0 6vh;
        font-family: var(--gothic);
        font-weight: 400;
        font-size: clamp(5rem, 20vw, 19rem);
        line-height: 0.75;
        margin-left: -0.05em;
        text-shadow: 0.025em 0.01em 0 var(--soot);
    }
    .reel {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        column-gap: 2vw;
    }
    .footage { position: relative; }
    .f0 { grid-column: 1 / 8; grid-row: 1; }
    .f1 { grid-column: 8 / 13; grid-row: 1; margin-top: 38vh; }
    .f2 { grid-column: 2 / 7; grid-row: 2; margin-top: 4vh; transform: rotate(-1.6deg); }
    .f3 { grid-column: 6 / 13; grid-row: 3; margin-top: -16vh; }

    .frame {
        position: relative;
        display: block;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        background: var(--soot);
    }
    .frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: grayscale(1) brightness(1.7) contrast(1.7);
        transform: scale(1.04);
    }
    .frame::after {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0, 0, 0, 0.45) 2px 4px);
        pointer-events: none;
    }
    .footage:hover .frame img {
        filter: grayscale(1) contrast(2.6) invert(1);
        animation: shake 0.22s steps(2) infinite;
    }
    .footage:hover .frame-wrap {
        filter: drop-shadow(6px 0 0 var(--nv)) drop-shadow(-6px 0 0 var(--tube));
    }
    .f-osd {
        position: absolute;
        z-index: 2;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        color: var(--flash);
        mix-blend-mode: difference;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .f-tl { top: 7%; left: 4%; }
    .f-tr { top: 7%; right: 4%; }
    .f-bl { bottom: 7%; left: 4%; font-variant-numeric: tabular-nums; }
    .sweep {
        position: absolute;
        z-index: 1;
        left: 0;
        right: 0;
        top: -20%;
        height: 18%;
        background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.5), transparent);
        mix-blend-mode: overlay;
        opacity: 0;
    }
    .footage:hover .sweep { opacity: 1; animation: sweep 0.7s linear infinite; }
    @keyframes sweep { to { top: 110%; } }
    @keyframes shake {
        0% { transform: scale(1.04) translate(-1%, 0.5%); }
        50% { transform: scale(1.08) translate(1.2%, -0.4%); }
    }

    .f-meta {
        position: relative;
        z-index: 2;
        padding: 0 3% 0 6%;
    }
    .f-meta h3 {
        margin: -0.45em 0 0.2em;
        font-family: var(--gothic);
        font-weight: 400;
        font-size: clamp(2.6rem, 5.4vw, 5rem);
        line-height: 0.85;
        mix-blend-mode: difference;
    }
    .f-meta p {
        margin: 0 0 1em;
        max-width: 38ch;
        font-size: 1.06rem;
        line-height: 1.45;
        color: var(--tube);
    }
    .tapes {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em 0.4em;
        margin: 0 0 1.3em;
        padding: 0;
    }
    .tapes li {
        background: var(--tube);
        color: var(--void);
        font-variation-settings: 'wdth' 62;
        font-weight: 700;
        font-size: 0.92rem;
        padding: 0.3em 0.9em;
        transform: rotate(var(--r));
        clip-path: polygon(0 8%, 4% 0, 7% 12%, 11% 2%, 100% 0, 96% 50%, 100% 100%, 8% 96%, 3% 100%, 0 90%, 4% 50%);
    }
    .open {
        display: inline-block;
        font-variation-settings: 'wdth' 62;
        font-weight: 800;
        font-size: 1.15rem;
        color: var(--flash);
        text-decoration: none;
        border: 3px solid var(--flash);
        padding: 0.3em 0.7em;
    }
    .open:hover {
        background: var(--flash);
        color: var(--void);
        box-shadow: 5px 0 0 var(--nv), -5px 0 0 var(--soot);
        transform: translate(2px, -1px);
    }

    /* ---------- end ---------- */
    .end {
        min-height: 88vh;
        padding: 6vh 0 12vh;
    }
    .end-title {
        margin: 12vh 0 0 3vw;
        font-family: var(--gothic);
        font-weight: 400;
        font-size: clamp(5rem, 21vw, 20rem);
        line-height: 0.74;
        white-space: nowrap;
    }
    .end-line { display: block; }
    .end-line:last-child { margin-left: 30vw; color: var(--void); -webkit-text-stroke: 2px var(--flash); }

    .end-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        gap: 6vw;
        align-items: end;
        margin: 8vh 5vw 0 9vw;
    }
    .socials {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    .socials a {
        display: inline-flex;
        align-items: center;
        gap: 0.2em;
        margin-left: calc(var(--o) * 6vw);
        font-variation-settings: 'wdth' 62;
        font-weight: 900;
        font-size: clamp(2.6rem, 7vw, 6rem);
        line-height: 0.95;
        color: var(--flash);
        text-decoration: none;
        text-transform: uppercase;
    }
    .socials img,
    .socials :global(svg) {
        width: 0.62em;
        height: 0.62em;
        filter: grayscale(1) brightness(0) invert(1);
    }
    .socials a:hover {
        background: var(--flash);
        color: var(--void);
        font-variation-settings: 'wdth' 125;
    }
    .socials a:hover img,
    .socials a:hover :global(svg) { filter: grayscale(1) brightness(0); }

    .credits {
        height: 9.5em;
        overflow: hidden;
        font-size: 1.05rem;
        mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent);
    }
    .roll { animation: credits 11s linear infinite; }
    .roll p {
        margin: 0 0 1.2em;
        font-variation-settings: 'wdth' 62;
        font-weight: 700;
        font-size: 1.35rem;
        text-align: center;
    }
    .roll span {
        display: block;
        font-weight: 400;
        font-size: 0.8rem;
        color: var(--ash);
        font-variation-settings: 'wdth' 80;
    }
    @keyframes credits {
        from { transform: translateY(9.5em); }
        to { transform: translateY(-100%); }
    }

    .rewind {
        display: block;
        margin: 10vh 0 0 auto;
        margin-right: 7vw;
        font-family: var(--grot);
        font-variation-settings: 'wdth' 62;
        font-weight: 800;
        font-size: 1.3rem;
        color: var(--void);
        background: var(--flash);
        border: 0;
        padding: 0.45em 0.9em;
        cursor: pointer;
        transform: rotate(2deg);
    }
    .rewind:hover { background: var(--void); color: var(--flash); outline: 3px solid var(--flash); animation: shake-btn 0.16s steps(2) infinite; }
    @keyframes shake-btn { 50% { transform: rotate(-1deg) translateX(-3px); } }

    @keyframes blink { 50% { opacity: 0; } }

    /* scroll-linked drift where the browser supports it */
    @supports (animation-timeline: view()) {
        .ghost-word {
            animation: drift linear both;
            animation-timeline: view();
        }
        .f0 .frame img, .f2 .frame img { animation: pan linear both; animation-timeline: view(); }
        .end-title {
            animation: slam linear both;
            animation-timeline: view();
            animation-range: entry 0% cover 45%;
        }
        @keyframes drift {
            from { transform: translateX(22vw); }
            to { transform: translateX(-30vw); }
        }
        @keyframes pan {
            from { transform: scale(1.2) translateY(-6%); }
            to { transform: scale(1.2) translateY(6%); }
        }
        @keyframes slam {
            from { transform: scale(0.55) translateX(-20vw); filter: blur(6px); }
            to { transform: none; filter: none; }
        }
    }

    /* ---------- small screens ---------- */
    @media (max-width: 760px) {
        :global(:root) { --tl-h: 48px; }
        .osd-l { left: 44px; }
        .osd-r { right: 44px; font-size: 0.8rem; }
        .cam-osd { left: 44px; }
        .scroll-cue { display: none; }
        .about-top {
            grid-template-columns: 5vw minmax(0, 1fr) 5vw;
            grid-template-areas: '. age .' '. study .' '. tape .';
        }
        .study { padding-left: 0; }
        .tape-slot { transform: rotate(-2deg); justify-self: center; margin-top: 3vh; }
        .tool-row { margin-left: calc(var(--off) * 3vw); }
        .reel { display: flex; flex-direction: column; gap: 12vh; }
        .f1, .f2, .f3 { margin-top: 0; }
        .f1 { margin-left: 10vw; }
        .f3 { margin-right: 8vw; }
        .end-grid { grid-template-columns: 1fr; margin: 6vh 5vw 0; }
        .end-line:last-child { margin-left: 12vw; }
        .rewind { margin: 8vh auto 0; }
    }

    @media (prefers-reduced-motion: reduce) {
        :global(*),
        :global(*::before),
        :global(*::after) {
            animation: none !important;
        }
        .rollbar { display: none; }
    }
</style>
