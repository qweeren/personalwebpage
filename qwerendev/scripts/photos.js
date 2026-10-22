// Web copies for /photography, made automatically. Drop a camera original into
// static/photography/full/ and on `vite dev` (as soon as it lands) or
// `vite build` this:
//   - reads its date and settings from the EXIF into src/lib/photos.json
//   - shrinks it in place to the web size, under a clean name (_MG_1943.JPG -> mg_1943.jpg)
//   - writes the matching thumb/
// Deleting a photo from full/ takes it off the wall. Alt texts are written by
// hand in photos.json and kept across runs.

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import exifReader from 'exif-reader';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = path.join(ROOT, 'static', 'photography');
const FULL = path.join(OUT, 'full');
const THUMB = path.join(OUT, 'thumb');
const MANIFEST = path.join(ROOT, 'src', 'lib', 'photos.json');
const SIZES = { thumb: 1100, full: 2600 }; // long edge, px
const QUALITY = { thumb: 80, full: 84 };
const IMAGE = /\.(jpe?g|png|webp|tiff?)$/i;

const clean = (file) =>
	path.parse(file).name.toLowerCase().replace(/^_+/, '').replace(/\s+/g, '-') + '.jpg';

const jpeg = (buf, size) =>
	sharp(buf)
		.rotate() // bake in the EXIF orientation
		.resize(SIZES[size], SIZES[size], { fit: 'inside', withoutEnlargement: true })
		.jpeg({ quality: QUALITY[size], progressive: true, mozjpeg: true })
		.toBuffer();

/** When it was taken and how, from the camera's EXIF. */
function settings(meta) {
	if (!meta.exif) return {};
	let photo;
	try {
		photo = exifReader(meta.exif).Photo ?? {};
	} catch {
		return {};
	}
	const out = {};
	// exif-reader reads the camera's wall-clock time as UTC, so this is the local date
	if (photo.DateTimeOriginal instanceof Date) out.taken = photo.DateTimeOriginal.toISOString().slice(0, 10);
	const parts = [];
	const t = photo.ExposureTime;
	if (t) parts.push(t < 1 ? `1/${Math.round(1 / t)}` : `${+t.toFixed(2)}s`);
	if (photo.FNumber) parts.push(`f/${+photo.FNumber.toFixed(1)}`);
	const iso = [photo.ISOSpeedRatings].flat()[0];
	if (iso) parts.push(`iso ${iso}`);
	if (photo.FocalLength) parts.push(`${+photo.FocalLength.toFixed(1)}mm`);
	if (parts.length) out.exif = parts.join(' · ');
	return out;
}

const mtime = async (file) => (await fs.stat(file).catch(() => null))?.mtimeMs ?? 0;

async function sync(log = console.log) {
	await fs.mkdir(FULL, { recursive: true });
	await fs.mkdir(THUMB, { recursive: true });
	const before = existsSync(MANIFEST) ? await fs.readFile(MANIFEST, 'utf8') : '[]\n';
	const known = new Map(JSON.parse(before).map((p) => [p.name, p]));
	const roll = new Map();

	for (const file of (await fs.readdir(FULL)).filter((f) => IMAGE.test(f)).sort()) {
		const src = path.join(FULL, file);
		const name = clean(file);
		const dest = path.join(FULL, name);
		let entry = known.get(name);
		const buf = await fs.readFile(src);
		const meta = await sharp(buf).metadata();
		const { width: w, height: h } = meta.autoOrient ?? meta;

		// anything bigger than the web size, or not yet a clean .jpg, is an original
		if (file !== name || Math.max(w, h) > SIZES.full) {
			// a fresh original replaces whatever was known under this name
			entry = { name, w, h, alt: entry?.alt ?? '', ...settings(meta) };
			await fs.writeFile(dest, await jpeg(buf, 'full'));
			if (src !== dest) await fs.rm(src);
			log(`${file} -> full/${name} (${w}x${h})`);
		}
		entry ??= { name, w, h, alt: '', ...settings(meta) };

		// remake the thumb if it's missing or the full was swapped out since (with some
		// slack: thumb and full get written a moment apart)
		const thumb = path.join(THUMB, name);
		if ((await mtime(thumb)) + 2000 < (await mtime(dest))) {
			await fs.writeFile(thumb, await jpeg(await fs.readFile(dest), 'thumb'));
			log(`thumb/${name}`);
		}
		roll.set(name, entry);
	}

	// thumbs whose photo is gone
	for (const file of await fs.readdir(THUMB)) {
		if (!roll.has(file)) {
			await fs.rm(path.join(THUMB, file));
			log(`removed thumb/${file}`);
		}
	}

	const after = JSON.stringify([...roll.values()], null, '\t') + '\n';
	if (after !== before) {
		await fs.writeFile(MANIFEST, after);
		log(`${roll.size} photos -> src/lib/photos.json`);
	}
}

/** @returns {import('vite').Plugin} */
export function photos() {
	let running = null;
	let again = false;
	const log = (msg) => console.log(`[photos] ${msg}`);
	// one pass at a time; anything that lands mid-pass gets another pass after
	const run = async () => {
		if (running) return void (again = true);
		running = sync(log)
			.catch((err) => log(`skipped for now: ${err.message}`))
			.finally(() => {
				running = null;
				if (again) {
					again = false;
					run();
				}
			});
		return running;
	};

	return {
		name: 'photos',
		buildStart: () => run(),
		configureServer(server) {
			server.watcher.add(FULL);
			let timer;
			const touched = (file) => {
				if (!path.resolve(file).startsWith(FULL)) return;
				// let a big copy finish writing before reading it
				clearTimeout(timer);
				timer = setTimeout(run, 600);
			};
			server.watcher.on('add', touched);
			server.watcher.on('change', touched);
			server.watcher.on('unlink', touched);
		}
	};
}

// `node scripts/photos.js` for a one-off run
if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) await sync();
