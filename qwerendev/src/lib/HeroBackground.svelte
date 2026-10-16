<script>
    // Procedural "found footage": an empty room filmed three ways, cut together
    // like a music video. Rendered at very low resolution, then crushed, grained
    // and smeared per-pixel so it reads as cheap camcorder / CCTV footage.
    import { onMount } from 'svelte';

    /** @type {{ onflash?: (on: boolean) => void, onmode?: (mode: string) => void }} */
    let { onflash = () => {}, onmode = () => {} } = $props();

    /** @type {HTMLCanvasElement} */
    let canvas;

    const rand = (/** @type {number} */ a, /** @type {number} */ b) => a + Math.random() * (b - a);
    const MODES = ['strip', 'flash', 'nv'];

    onMount(() => {
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d', { willReadFrequently: true }));
        let W = 0, H = 0;
        /** @type {Float32Array} */ let lum = new Float32Array(0);
        /** @type {Float32Array} */ let prev = new Float32Array(0);

        /** @type {{mode: string, tapeX: number, tapeY: number}} */
        let shot;
        let shotEnd = 0, lastFlash = -1e9, nextFlash = 0, dragUntil = 0, glitchUntil = 0, cutFrames = 0;
        let flashLit = false, visible = true, raf = 0, lastFrame = 0;

        function resize() {
            const r = canvas.getBoundingClientRect();
            const px = r.width < 700 ? 3 : 4;
            W = Math.max(96, Math.round(r.width / px));
            H = Math.max(64, Math.round(r.height / px));
            canvas.width = W;
            canvas.height = H;
            lum = new Float32Array(W * H);
            prev = new Float32Array(W * H);
        }

        /** @param {number} now */
        function newShot(now) {
            let mode = MODES[Math.floor(Math.random() * 3)];
            if (shot && mode === shot.mode) mode = MODES[(MODES.indexOf(mode) + 1 + Math.floor(Math.random() * 2)) % 3];
            shot = {
                mode,
                tapeX: rand(0.1, 0.9),
                tapeY: rand(0.2, 0.45)
            };
            shotEnd = now + rand(1100, 3300);
            if (Math.random() < 0.55) dragUntil = now + rand(180, 520);
            cutFrames = Math.random() < 0.5 ? 1 : 0;
            nextFlash = now + rand(80, 300);
            onmode(mode);
        }

        /** @param {number} now */
        function draw(now) {
            if (!shot || now > shotEnd) newShot(now);
            if (shot.mode === 'flash' && now > nextFlash) {
                lastFlash = now;
                // never faster than ~2 flashes per second
                nextFlash = now + (Math.random() < 0.3 ? rand(450, 520) : rand(700, 1600));
            }
            const f = shot.mode === 'flash' ? Math.exp(-(now - lastFlash) / 110) : 0;
            const lit = f > 0.45;
            if (lit !== flashLit) { flashLit = lit; onflash(lit); }

            if (shot.mode === 'strip') {
                // single fluorescent tube
                const flick = Math.random() < 0.05 ? 0.15 : Math.random() < 0.1 ? 0.7 : 1;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, W, H);
                const ty = H * 0.14;
                ctx.save();
                ctx.translate(W * 0.5, ty);
                ctx.scale(1.5, 1);
                const g = ctx.createRadialGradient(0, 0, 0, 0, 0, H * 0.95);
                g.addColorStop(0, `rgba(235,245,242,${0.95 * flick})`);
                g.addColorStop(0.4, `rgba(150,160,158,${0.55 * flick})`);
                g.addColorStop(1, 'rgba(0,0,0,1)');
                ctx.fillStyle = g;
                ctx.fillRect(-W, -ty, W * 2, H * 2);
                ctx.restore();
                ctx.fillStyle = `rgba(255,255,255,${flick})`;
                ctx.fillRect(W * 0.18, ty - 2, W * 0.64, 3);
                // X of gaffer tape on the wall
                ctx.save();
                ctx.translate(W * shot.tapeX, H * shot.tapeY);
                ctx.fillStyle = 'rgba(20,20,20,0.9)';
                for (const a of [0.78, -0.78]) {
                    ctx.save(); ctx.rotate(a); ctx.fillRect(-H * 0.14, -H * 0.018, H * 0.28, H * 0.036); ctx.restore();
                }
                ctx.restore();
            } else if (shot.mode === 'flash') {
                // on-camera flash: room pops, then falls off to black
                const wall = Math.round(10 + 80 * f);
                ctx.fillStyle = `rgb(${wall},${wall},${wall})`;
                ctx.fillRect(0, 0, W, H);
            } else {
                // IR night vision
                const g = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.1, W * 0.5, H * 0.5, W * 0.7);
                g.addColorStop(0, '#6a6a6a');
                g.addColorStop(1, '#101010');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, W, H);
            }

            if (cutFrames > 0) {
                cutFrames--;
                ctx.fillStyle = Math.random() < 0.5 ? '#fff' : '#000';
                ctx.fillRect(0, 0, W, H);
            }

            post(now, shot.mode === 'nv');
        }

        /** @param {number} now @param {boolean} nv */
        function post(now, nv) {
            const img = ctx.getImageData(0, 0, W, H);
            const d = img.data;
            const noise = nv ? 80 : 44;
            const dragging = now < dragUntil;
            for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
                let v = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
                v = (v - 30) * 1.5 + (Math.random() - 0.5) * noise; // crush the mids, blow the highs
                if (dragging) v = Math.max(v, prev[p] * 0.86);
                lum[p] = v;
            }
            if (dragging) {
                // shutter drag: bright pixels streak sideways
                for (let y = 0; y < H; y++) {
                    let run = 0;
                    const row = y * W;
                    for (let x = 0; x < W; x++) {
                        run = Math.max(lum[row + x], run * 0.9);
                        lum[row + x] = run;
                    }
                }
            }
            if (now < glitchUntil || Math.random() < 0.015) {
                // macroblocking: low-bitrate compression squares
                const B = 8;
                for (let k = 0; k < 14; k++) {
                    const bx = Math.floor(Math.random() * (W / B)) * B;
                    const by = Math.floor(Math.random() * (H / B)) * B;
                    const src = lum[Math.min(lum.length - 1, (by + 3) * W + bx + 3)];
                    for (let y = by; y < Math.min(H, by + B); y++)
                        for (let x = bx; x < Math.min(W, bx + B); x++) lum[y * W + x] = src;
                }
                // tear a band sideways
                const ty = Math.floor(Math.random() * H), th = Math.floor(rand(2, 9)), off = Math.floor(rand(-W * 0.2, W * 0.2));
                for (let y = ty; y < Math.min(H, ty + th); y++) {
                    const row = lum.slice(y * W, y * W + W);
                    for (let x = 0; x < W; x++) lum[y * W + x] = row[(x - off + W) % W];
                }
            }
            if (Math.random() < 0.006) glitchUntil = now + rand(90, 260);

            for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
                let v = lum[p];
                if (((p / W) | 0) % 3 === 0) v *= 0.78; // chunky low-res scanlines
                v = v < 0 ? 0 : v > 255 ? 255 : v;
                prev[p] = v;
                if (nv) {
                    d[i] = v * 0.62 + 6; d[i + 1] = v * 0.94 + 14; d[i + 2] = v * 0.86 + 12;
                } else {
                    d[i] = v * 0.95; d[i + 1] = v; d[i + 2] = v * 0.99 + 2;
                }
            }
            ctx.putImageData(img, 0, 0);
        }

        /** @param {number} now */
        function loop(now) {
            raf = requestAnimationFrame(loop);
            if (!visible || document.hidden) return;
            if (now - lastFrame < 1000 / 20) return; // 20fps: choppy, like cheap surveillance
            lastFrame = now;
            draw(now);
        }

        resize();
        if (reduce) {
            shot = { mode: 'strip', tapeX: 0.25, tapeY: 0.3 };
            shotEnd = Infinity;
            onmode('strip');
            draw(0);
        } else {
            raf = requestAnimationFrame(loop);
        }

        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(canvas);
        const ro = new ResizeObserver(() => { resize(); if (reduce) draw(0); });
        ro.observe(canvas);

        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
        };
    });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
    canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
        display: block;
    }
</style>
