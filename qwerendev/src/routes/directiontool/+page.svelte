<script>
    import { onMount } from 'svelte';

    let canvas;
    let ctx;

    const gridSize = 10;
    const tileSize = 60;

    const mapLayout = [
        [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
        [0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 1, 1]
    ];

    const buildings = [
        { x: 2, y: 3, name: 'Bakery', color: '#BBB0C1', icon: '🥐' },
        { x: 3, y: 2, name: 'School', color: '#BBB0C1', icon: '🏫' },
        { x: 3, y: 3, name: 'Gym', color: '#BBB0C1', icon: '🏋️' },
        { x: 2, y: 2, name: 'Library', color: '#BBB0C1', icon: '📚' },
        { x: 7, y: 2, name: 'Police', color: '#BBB0C1', icon: '👮' },
        { x: 2, y: 5, name: 'Park', color: '#BBB0C1', icon: '🌳' },
        { x: 7, y: 5, name: 'Cafe', color: '#BBB0C1', icon: '☕' },
        { x: 3, y: 5, name: 'Bank', color: '#BBB0C1', icon: '💰' },
        { x: 2, y: 7, name: 'Hospital', color: '#BBB0C1', icon: '🏥' },
        { x: 7, y: 3, name: 'Cinema', color: '#BBB0C1', icon: '🎬' },
        { x: 5, y: 5, name: 'Restaurant', color: '#BBB0C1', icon: '🍽️' },
        { x: 7, y: 7, name: 'Zoo', color: '#BBB0C1', icon: '🦒' },
        { x: 5, y: 4, name: 'Museum', color: '#BBB0C1', icon: '🏛️' },
        { x: 5, y: 4, name: 'University', color: '#BBB0C1', icon: '🎓' },
        { x: 5, y: 2, name: 'Pharmacy', color: '#BBB0C1', icon: '💊' },
        { x: 4, y: 7, name: 'Stadium', color: '#BBB0C1', icon: '🏟️' },
        { x: 5, y: 7, name: 'Dentist', color: '#BBB0C1', icon: '🦷' },
    ];

    let startPos = { x: 0, y: 0 };
    let endPos = { x: 0, y: 0 };
    let currentPath = [];
    let showingPath = false;
    let alternativePath1 = [];
    let alternativePath2 = [];
    let showingAlt1 = false;
    let showingAlt2 = false;

    function getRoadChar(x, y) {
        const up = y > 0 && mapLayout[y - 1][x] === 0;
        const right = x < gridSize - 1 && mapLayout[y][x + 1] === 0;
        const down = y < gridSize - 1 && mapLayout[y + 1][x] === 0;
        const left = x > 0 && mapLayout[y][x - 1] === 0;

        const connections = (up ? 1 : 0) + (right ? 1 : 0) + (down ? 1 : 0) + (left ? 1 : 0);

        if (connections === 0) return ' ';
        if (connections === 1) {
            if (up) return '⊥';
            if (down) return 'T';
            if (left) return '┫';
            if (right) return '┣';
        }
        if (connections === 2) {
            if ((up && down) || (left && right)) return '─';
            if (up && right) return '└';
            if (up && left) return '┘';
            if (down && right) return '┌';
            if (down && left) return '┐';
        }
        if (connections === 3) {
            if (!up) return 'T';
            if (!right) return '┫';
            if (!down) return '⊥';
            if (!left) return '┣';
        }
        if (connections === 4) return '┼';
        return '─';
    }

    function drawMap() {
        ctx.fillStyle = '#354257';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (mapLayout[y][x] === 0) {
                    const bx = x * tileSize;
                    const by = y * tileSize;
                    const char = getRoadChar(x, y);
                    ctx.fillStyle = '#5a687d';
                    ctx.font = '28px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(char, bx + tileSize / 2, by + tileSize / 2);
                }
            }
        }

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (mapLayout[y][x] === 1) {
                    const bx = x * tileSize;
                    const by = y * tileSize;
                    const landmark = buildings.find((b) => b.y === y && b.x === x);
                    if (landmark) {
                        ctx.fillStyle = landmark.color;
                        ctx.fillRect(bx, by, tileSize, tileSize);
                        ctx.fillStyle = 'white';
                        ctx.font = '24px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(landmark.icon, bx + tileSize / 2, (by + tileSize / 2) - 5);

                        ctx.fillStyle = 'black';
                        ctx.font = '11px Arial';
                        ctx.fillText(landmark.name, bx + tileSize / 2, by + tileSize - 10);
                    } else {
                        ctx.fillStyle = '#BBB0C1';
                        ctx.fillRect(bx, by, tileSize, tileSize);
                        ctx.fillStyle = 'white';
                        ctx.font = '24px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🏢', bx + tileSize / 2, by + tileSize / 2);
                    }
                }
            }
        }

        if (showingPath && currentPath.length > 0) {
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.6)';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startPos.x * tileSize + tileSize / 2, startPos.y * tileSize + tileSize / 2);
            for (let p of currentPath) {
                ctx.lineTo(p.x * tileSize + tileSize / 2, p.y * tileSize + tileSize / 2);
            }
            ctx.stroke();
        }

        drawMarker(startPos.x, startPos.y, 'Start', 'blue');
        drawMarker(endPos.x, endPos.y, 'End', 'red');
    }

    function drawMarker(x, y, text, color) {
        const px = x * tileSize + tileSize / 2;
        const py = y * tileSize + tileSize / 2;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, px, py - 15);
    }

    function generateScenario() {
        showingPath = false;
        let valid = false;
        while (!valid) {
            let sY = Math.floor(Math.random() * gridSize);
            let sX = Math.floor(Math.random() * gridSize);
            let eY = Math.floor(Math.random() * gridSize);
            let eX = Math.floor(Math.random() * gridSize);

            if (mapLayout[sY][sX] !== 0 || mapLayout[eY][eX] !== 0) continue;

            let distance = Math.abs(sY - eY) + Math.abs(sX - eX);
            if (distance < 5) continue;

            startPos = { x: sX, y: sY };
            endPos = { x: eX, y: eY };

            currentPath = findPath(startPos, endPos);
            if (currentPath.length > 0) valid = true;
        }
        drawMap();
    }

    function togglePath() {
        showingPath = !showingPath;
        drawMap();
    }

    function findPath(start, end) {
        let queue = [[start]];
        let visited = new Set();
        visited.add(start.y + ',' + start.x);
        while (queue.length > 0) {
            let path = queue.shift();
            let curr = path[path.length - 1];
            if (curr.y === end.y && curr.x === end.x) return path;

            const dirs = [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0]
            ];

            for (let d of dirs) {
                let ny = curr.y + d[0];
                let nx = curr.x + d[1];
                if (
                    ny >= 0 &&
                    ny < gridSize &&
                    nx >= 0 &&
                    nx < gridSize &&
                    mapLayout[ny][nx] === 0 &&
                    !visited.has(ny + ',' + nx)
                ) {
                    visited.add(ny + ',' + nx);
                    let newPath = [...path, { y: ny, x: nx }];
                    queue.push(newPath);
                }
            }
        }
        return [];
    }

    onMount(() => {
        ctx = canvas.getContext('2d');
        generateScenario();
    });
</script>

<svelte:head>
    <title>ESL City Direction Tool</title>
</svelte:head>

<style>
    :global(body) {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f0f4f8;
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
    }

    h1 {
        color: #2c3e50;
        margin-bottom: 10px;
    }

    .container {
        display: flex;
        gap: 20px;
        background: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    canvas {
        border: 2px solid #333;
        border-radius: 4px;
        cursor: crosshair;
    }

    .controls {
        width: 250px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .btn {
        padding: 12px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: transform 0.1s;
    }

    .btn:active {
        transform: scale(0.98);
    }

    .btn-new {
        background-color: #3498db;
        color: white;
    }

    .btn-new:hover {
        background-color: #2980b9;
    }

    .btn-solve {
        background-color: #2ecc71;
        color: white;
    }

    .btn-solve:hover {
        background-color: #27ae60;
    }
</style>

<div class="wrapper">
    <h1>🏙️ City Directions Trainer</h1>

    <div class="container">
        <canvas bind:this={canvas} width="600" height="600"></canvas>

        <div class="controls">
            <button class="btn btn-new" on:click={generateScenario}>🎲 New Scenario</button>
            <button class="btn btn-solve" on:click={togglePath}>🗺️ Show/Hide Path</button>
        </div>
    </div>
</div>
