<script>
    // Burned-in subtitles that hard-cut between roles, jumping around the frame
    // like lyric captions in a music video.
    import { onMount } from 'svelte';

    /** @type {{ textOptions?: string[] }} */
    let { textOptions =['ELT student', 'developer', 'translator', 'designer', 'editor'] } = $props();

    let index = $state(0);
    let slot = $state(0);
    let inverted = $state(false);
    let doubled = $state(false);
    let tilt = $state(0);

    onMount(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        /** @type {ReturnType<typeof setTimeout>} */
        let timer;
        const cut = () => {
            index = (index + 1) % textOptions.length;
            slot = Math.floor(Math.random() * 4);
            inverted = Math.random() < 0.3;
            doubled = Math.random() < 0.25;
            tilt = Math.random() < 0.3 ? (Math.random() - 0.5) * 8 : 0;
            timer = setTimeout(cut, 520 + Math.random() * 1100);
        };
        timer = setTimeout(cut, 900);
        return () => clearTimeout(timer);
    });
</script>

<p class="sr-only">{textOptions.join(', ')}</p>

<div class="captions slot-{slot}" aria-hidden="true">
    {#key index}
        <span class="cap" class:inverted style="--tilt: {tilt}deg">{textOptions[index]}</span>
        {#if doubled}
            <span class="cap ghost" class:inverted style="--tilt: {tilt}deg">{textOptions[index]}</span>
        {/if}
    {/key}
</div>

<style>
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
    }

    .captions {
        position: absolute;
        z-index: 4;
        pointer-events: none;
    }
    .slot-0 { left: 6vw; bottom: 22vh; }
    .slot-1 { right: 9vw; top: 21vh; }
    .slot-2 { left: 38vw; bottom: 13vh; }
    .slot-3 { left: 12vw; top: 30vh; }

    .cap {
        display: inline-block;
        font-family: 'Archivo', sans-serif;
        font-variation-settings: 'wdth' 62;
        font-weight: 800;
        font-size: clamp(1.4rem, 3.4vw, 2.6rem);
        line-height: 1;
        letter-spacing: -0.02em;
        padding: 0.12em 0.3em 0.16em;
        background: #fff;
        color: #000;
        transform: rotate(var(--tilt));
        animation: burn 0.14s steps(2) both;
    }
    .cap.inverted {
        background: #000;
        color: #fff;
        outline: 2px solid #fff;
        outline-offset: -2px;
    }
    .ghost {
        position: absolute;
        left: 0.4em;
        top: 0.55em;
        opacity: 0.45;
        mix-blend-mode: difference;
        animation: burn 0.14s steps(2) both, jitter 0.18s steps(2) infinite;
    }

    @keyframes burn {
        0% { opacity: 0; transform: rotate(var(--tilt)) translateX(-18px) scaleY(1.6); }
        50% { opacity: 1; transform: rotate(var(--tilt)) translateX(10px) scaleY(0.7); }
        100% { opacity: 1; transform: rotate(var(--tilt)); }
    }
    @keyframes jitter {
        50% { transform: translate(-6px, 2px); }
    }

    @media (max-width: 640px) {
        .slot-1 { right: 4vw; top: 18vh; }
        .slot-2 { left: 20vw; bottom: 17vh; }
    }
</style>
