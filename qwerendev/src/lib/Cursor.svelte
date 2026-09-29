<script>
    // An X that marks the spot. Over anything clickable it snaps into a cross.
    import { onMount } from 'svelte';

    let enabled = $state(false);
    let x = $state(-200);
    let y = $state(-200);
    let hot = $state(false);
    let down = $state(false);

    const pad = (/** @type {number} */ n) => String(Math.max(0, Math.round(n))).padStart(4, '0');

    onMount(() => {
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        enabled = true;
        const root = document.documentElement;
        root.classList.add('has-cursor');

        /** @param {PointerEvent} e */
        const move = (e) => {
            x = e.clientX;
            y = e.clientY;
            const t = /** @type {Element | null} */ (e.target);
            hot = !!t?.closest?.('a, button, [role="slider"]');
        };
        const press = () => (down = true);
        const release = () => (down = false);
        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('pointerdown', press);
        window.addEventListener('pointerup', release);
        return () => {
            root.classList.remove('has-cursor');
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerdown', press);
            window.removeEventListener('pointerup', release);
        };
    });
</script>

{#if enabled}
    <div class="cursor" class:hot class:down style="transform: translate3d({x}px, {y}px, 0)" aria-hidden="true">
        <span class="bar a"></span>
        <span class="bar b"></span>
        <span class="read">x{pad(x)} y{pad(y)}</span>
    </div>
{/if}

<style>
    :global(html.has-cursor),
    :global(html.has-cursor *) {
        cursor: none !important;
    }

    .cursor {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 100;
        pointer-events: none;
        mix-blend-mode: difference;
    }

    .bar {
        position: absolute;
        left: -14px;
        top: -1.5px;
        width: 28px;
        height: 3px;
        background: #fff;
        transition: transform 0.09s steps(2);
    }
    .a { transform: rotate(45deg); }
    .b { transform: rotate(-45deg); }

    /* the X turns into a cross */
    .hot .a { transform: translateY(-5px) scaleX(0.85); }
    .hot .b { transform: rotate(90deg) scaleX(1.5); }
    .down .bar { background: #6f9c8e; }

    .read {
        position: absolute;
        left: 18px;
        top: 12px;
        font-family: 'Archivo', sans-serif;
        font-variation-settings: 'wdth' 62;
        font-weight: 600;
        font-size: 11px;
        color: #fff;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
</style>
