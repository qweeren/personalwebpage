<script>
    // Procedural "found footage": a hooded figure filmed three ways, cut together
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

        /** @type {{mode: string, zoom: number, x: number, low: boolean, mirror: boolean, tapeX: number, tapeY: number}} */
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
            const close = Math.random() < 0.35;
            shot = {
                mode,
                zoom: close ? rand(1.45, 1.9) : rand(0.8, 1.15),
                x: rand(0.28, 0.74),
                low: Math.random() < 0.4,
                mirror: Math.random() < 0.5,
                tapeX: rand(0.1, 0.9),
                tapeY: rand(0.2, 0.45)
            };
            shotEnd = now + rand(1100, 3300);
            if (Math.random() < 0.55) dragUntil = now + rand(180, 520);
            cutFrames = Math.random() < 0.5 ? 1 : 0;
            nextFlash = now + rand(80, 300);
            onmode(mode);
        }

        /**
         * Hooded figure. Everything is in units of u (roughly head-top to frame bottom).
         * @param {number} cx @param {number} by @param {number} u @param {number} t
         * @param {string} body @param {string} face @param {string} shade
         */
        function figure(cx, by, u, t, body, face, shade = body, glint = 0, eyes = 0) {
            ctx.save();
            ctx.translate(cx, by);
            if (shot.mirror) ctx.scale(-1, 1);
            ctx.rotate(Math.sin(t * 0.0011) * 0.025);
            ctx.fillStyle = body;
            ctx.beginPath();
            ctx.moveTo(-0.7 * u, 0.05 * u);
            ctx.bezierCurveTo(-0.66 * u, -0.26 * u, -0.56 * u, -0.38 * u, -0.3 * u, -0.46 * u);
            ctx.bezierCurveTo(-0.27 * u, -0.6 * u, -0.34 * u, -0.86 * u, -0.1 * u, -0.98 * u);
            ctx.quadraticCurveTo(0.02 * u, -1.05 * u, 0.12 * u, -0.99 * u);
            ctx.bezierCurveTo(0.33 * u, -0.9 * u, 0.3 * u, -0.62 * u, 0.28 * u, -0.46 * u);
            ctx.bezierCurveTo(0.55 * u, -0.38 * u, 0.66 * u, -0.26 * u, 0.72 * u, 0.05 * u);
            ctx.closePath();
            ctx.fill();

            // inner hood fabric, then the face: never visible, just a hole
            ctx.fillStyle = shade;
            ctx.beginPath();
            ctx.ellipse(0.01 * u, -0.68 * u, 0.19 * u, 0.235 * u, -0.06, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = face;
            ctx.beginPath();
            ctx.ellipse(0.01 * u, -0.68 * u, 0.145 * u, 0.185 * u, -0.06, 0, Math.PI * 2);
            ctx.fill();

            // hoodie drawstrings
            ctx.strokeStyle = shade;
            ctx.lineWidth = Math.max(1, 0.014 * u);
            ctx.beginPath();
            ctx.moveTo(-0.09 * u, -0.5 * u); ctx.lineTo(-0.11 * u, -0.3 * u + Math.sin(t * 0.003) * 0.01 * u);
            ctx.moveTo(0.11 * u, -0.5 * u); ctx.lineTo(0.12 * u, -0.32 * u + Math.cos(t * 0.003) * 0.01 * u);
            ctx.stroke();

            if (eyes > 0) {
                ctx.fillStyle = `rgba(255,255,255,${eyes})`;
                const blink = Math.sin(t * 0.004) > 0.97 ? 0.2 : 1;
                ctx.fillRect(-0.06 * u, -0.75 * u, 0.028 * u, 0.02 * u * blink);
                ctx.fillRect(0.04 * u, -0.75 * u, 0.028 * u, 0.02 * u * blink);
            }

            if (glint > 0) {
                // grillz + fangs catching the light
                ctx.fillStyle = `rgba(255,255,255,${glint})`;
                ctx.fillRect(-0.07 * u, -0.615 * u, 0.15 * u, 0.028 * u);
                ctx.beginPath();
                ctx.moveTo(-0.055 * u, -0.588 * u); ctx.lineTo(-0.035 * u, -0.588 * u); ctx.lineTo(-0.045 * u, -0.55 * u);
                ctx.moveTo(0.045 * u, -0.588 * u); ctx.lineTo(0.065 * u, -0.588 * u); ctx.lineTo(0.055 * u, -0.55 * u);
                ctx.fill();
                // star sparkle
                const s = (0.05 + 0.04 * Math.sin(t * 0.02)) * u;
                const gx = 0.06 * u, gy = -0.605 * u;
                ctx.fillRect(gx - s, gy - 0.004 * u, s * 2, 0.008 * u);
                ctx.fillRect(gx - 0.004 * u, gy - s, 0.008 * u, s * 2);
            }

            // chain + cross pendant
            ctx.strokeStyle = glint > 0 ? `rgba(255,255,255,${glint * 0.8})` : 'rgba(90,90,90,1)';
            ctx.lineWidth = Math.max(1, 0.012 * u);
            ctx.beginPath();
            ctx.moveTo(-0.2 * u, -0.46 * u);
            ctx.quadraticCurveTo(0, -0.16 * u, 0.2 * u, -0.46 * u);
            ctx.stroke();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillRect(-0.012 * u, -0.29 * u, 0.024 * u, 0.13 * u);
            ctx.fillRect(-0.045 * u, -0.26 * u, 0.09 * u, 0.022 * u);
            ctx.restore();
        }

        /** @param {number} now */
        function draw(now) {
            if (!shot || now > shotEnd) newShot(now);
            const u = Math.min(H * 0.82, W * 0.9) * shot.zoom;
            const cx = W * shot.x + (now < dragUntil ? Math.sin(now * 0.05) * W * 0.05 : 0);
            const by = H * (shot.low ? 1.02 : 0.9) + (shot.zoom > 1.4 ? u * 0.3 : 0);

            if (shot.mode === 'flash' && now > nextFlash) {
                lastFlash = now;
                // never faster than ~2 flashes per second
                nextFlash = now + (Math.random() < 0.3 ? rand(450, 520) : rand(700, 1600));
            }
            const f = shot.mode === 'flash' ? Math.exp(-(now - lastFlash) / 110) : 0;
            const lit = f > 0.45;
            if (lit !== flashLit) { flashLit = lit; onflash(lit); }

            if (shot.mode === 'strip') {
                // single fluorescent tube behind the figure
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
                figure(cx, by, u, now, '#000', '#000', '#000', Math.random() < 0.08 ? 0.9 : 0);
            } else if (shot.mode === 'flash') {
                // on-camera flash: subject blown out, room falls off to black
                const wall = Math.round(10 + 80 * f);
                ctx.fillStyle = `rgb(${wall},${wall},${wall})`;
                ctx.fillRect(0, 0, W, H);
                const sh = 0.07 * u;
                figure(cx + sh, by + sh * 0.4, u, now, '#000', '#000');
                const v = Math.min(255, Math.round(88 + 300 * f));
                figure(cx, by, u, now, `rgb(${v},${v},${v})`, '#000', `rgb(${v >> 1},${v >> 1},${v >> 1})`, Math.min(1, 0.35 + f));
            } else {
                // IR night vision
                const g = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.1, W * 0.5, H * 0.5, W * 0.7);
                g.addColorStop(0, '#6a6a6a');
                g.addColorStop(1, '#101010');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, W, H);
                figure(cx, by, u, now, '#262626', '#050505', '#161616', 0, 1);
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
            shot = { mode: 'strip', zoom: 1, x: 0.62, low: false, mirror: false, tapeX: 0.25, tapeY: 0.3 };
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
