<script>
    // The page as an edit: every section is a clip on V1, scroll position is the
    // playhead. Click a clip to hard-cut to it, drag the audio lane to scrub.

    /**
     * @type {{
     *   clips: { id: string, label: string, start: number, end: number }[],
     *   progress: number,
     *   current: string,
     *   onjump: (id: string) => void,
     *   onscrub: (frac: number) => void
     * }}
     */
    let { clips, progress, current, onjump, onscrub } = $props();

    const RUNTIME = 213; // seconds; the page plays like a 3:33 track
    const FPS = 24;
    const BARS = 96;
    const bars = Array.from({ length: BARS }, (_, i) =>
        Math.round(14 + 86 * Math.abs(Math.sin(i * 1.73) * Math.cos(i * 0.41) + 0.25 * Math.sin(i * 0.19)))
    ).map((h) => Math.min(100, h));

    const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
    let timecode = $derived.by(() => {
        const t = progress * RUNTIME;
        return `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(Math.floor(t) % 60)}:${pad(Math.floor((t % 1) * FPS))}`;
    });

    /** @type {HTMLDivElement} */
    let lane;
    let scrubbing = $state(false);

    /** @param {PointerEvent} e */
    function scrub(e) {
        const r = lane.getBoundingClientRect();
        onscrub(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    }
</script>

<nav class="timeline" class:scrubbing aria-label="Sections">
    <div class="tc" aria-hidden="true">
        <span class="tc-num">{timecode}</span>
        <span class="tc-cap">{scrubbing ? 'scrubbing' : 'playing'}</span>
    </div>

    <div class="tracks">
        <div class="lane v1">
            <span class="lane-name" aria-hidden="true">V1</span>
            <div class="row">
                {#each clips as clip}
                    <button
                        class="clip"
                        class:active={current === clip.id}
                        style="left: {clip.start * 100}%; width: {(clip.end - clip.start) * 100}%"
                        aria-current={current === clip.id ? 'true' : undefined}
                        onclick={() => onjump(clip.id)}
                    >
                        <span>{clip.label}</span>
                    </button>
                {/each}
            </div>
        </div>

        <div class="lane a1">
            <span class="lane-name" aria-hidden="true">A1</span>
            <div
                class="row wave"
                bind:this={lane}
                role="slider"
                tabindex="0"
                aria-label="Scrub through the page"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(progress * 100)}
                onpointerdown={(e) => { scrubbing = true; lane.setPointerCapture(e.pointerId); scrub(e); }}
                onpointermove={(e) => scrubbing && scrub(e)}
                onpointerup={() => (scrubbing = false)}
                onpointercancel={() => (scrubbing = false)}
                onkeydown={(e) => {
                    if (e.key === 'ArrowRight') onscrub(Math.min(1, progress + 0.05));
                    if (e.key === 'ArrowLeft') onscrub(Math.max(0, progress - 0.05));
                }}
            >
                {#each bars as h, i}
                    <i class:played={i / BARS < progress} style="height: {h}%"></i>
                {/each}
            </div>
        </div>
        <span class="playhead" style="--p: {progress}"></span>
    </div>
</nav>

<style>
    .timeline {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 60;
        display: grid;
        grid-template-columns: auto 1fr;
        background: #000;
        border-top: 3px solid #fff;
        font-family: 'Archivo', sans-serif;
        font-variation-settings: 'wdth' 62;
        user-select: none;
    }

    .tc {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 14px;
        border-right: 3px solid #fff;
        min-width: 7.2rem;
    }
    .tc-num {
        font-weight: 800;
        font-size: 1.35rem;
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        line-height: 1;
    }
    .tc-cap {
        font-size: 0.72rem;
        color: #8a8a8a;
        margin-top: 3px;
    }
    .scrubbing .tc-num { animation: jit 0.1s steps(2) infinite; }

    .tracks {
        --lane: 30px;
        position: relative;
        display: grid;
        grid-template-rows: 26px 22px;
    }

    .lane {
        display: grid;
        grid-template-columns: var(--lane) 1fr;
        border-bottom: 1px solid #3a3a3a;
    }
    .lane-name {
        font-size: 0.7rem;
        font-weight: 700;
        display: grid;
        place-items: center;
        color: #000;
        background: #e4f1ee;
    }

    .row { position: relative; overflow: hidden; }

    .clip {
        position: absolute;
        top: 3px;
        bottom: 3px;
        margin: 0;
        padding: 0 6px;
        border: 2px solid #fff;
        border-left-width: 6px;
        background: #000;
        color: #fff;
        font: inherit;
        font-weight: 700;
        font-size: 0.8rem;
        text-align: left;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
    }
    .clip span { display: block; overflow: hidden; text-overflow: clip; }
    .clip:hover,
    .clip.active {
        background: #fff;
        color: #000;
    }
    .clip.active { background: repeating-linear-gradient(90deg, #fff 0 10px, #e4f1ee 10px 12px); }
    .clip:focus-visible,
    .wave:focus-visible {
        outline: 3px solid #6f9c8e;
        outline-offset: -3px;
    }

    .wave {
        display: flex;
        align-items: center;
        gap: 1px;
        padding: 0 2px;
        cursor: ew-resize;
        touch-action: none;
    }
    .wave i {
        flex: 1;
        background: #3a3a3a;
        min-height: 2px;
    }
    .wave i.played { background: #6f9c8e; }

    .playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        left: calc(var(--lane) + var(--p) * (100% - var(--lane)));
        width: 2px;
        margin-left: -1px;
        background: #fff;
        pointer-events: none;
    }
    .playhead::before {
        content: '';
        position: absolute;
        top: 0;
        left: -6px;
        border: 7px solid transparent;
        border-top-color: #fff;
    }

    @keyframes jit { 50% { transform: translateX(3px); } }

    @media (max-width: 640px) {
        .tc { min-width: 0; padding: 0 8px; }
        .tc-num { font-size: 1rem; }
        .tc-cap { display: none; }
        .tracks { --lane: 20px; }
        .clip { font-size: 0.7rem; padding: 0 3px; border-left-width: 3px; }
    }
</style>
