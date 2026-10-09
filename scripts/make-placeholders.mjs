// Creates drop-in placeholder images under their final names; real images simply overwrite them. Existing files are never touched.
import { access, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = path.join(root, "src/assets/images");
await mkdir(imagesDir, { recursive: true });

const exists = (file) => access(file).then(() => true, () => false);

// Deterministic pseudo-random so placeholders are stable between runs.
function rng(seed) {
	let s = seed;
	return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

function bokehSvg({ width, height, from, to, glow, seed, count = 26 }) {
	const rand = rng(seed);
	const dots = Array.from({ length: count }, () => {
		const r = 20 + rand() * Math.min(width, height) * 0.09;
		return `<circle cx="${(rand() * width).toFixed(0)}" cy="${(rand() * height).toFixed(0)}" r="${r.toFixed(0)}" fill="${glow}" fill-opacity="${(0.05 + rand() * 0.13).toFixed(2)}"/>`;
	}).join("");
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>${dots}</svg>`;
}

const placeholders = [
	{ file: "bg-bokeh-gold.jpg", width: 2400, height: 1400, from: "#faf3e3", to: "#efdcae", glow: "#d4af37", seed: 11 },
	{ file: "bg-stage-dark.jpg", width: 2400, height: 1400, from: "#0f172a", to: "#2a2540", glow: "#d4af37", seed: 23 },
	{ file: "card-wedding.jpg", width: 1200, height: 1500, from: "#f7ead0", to: "#c9a24a", glow: "#ffffff", seed: 31 },
	{ file: "card-party.jpg", width: 1200, height: 1500, from: "#3b1d4a", to: "#d4af37", glow: "#ffffff", seed: 47 },
	{ file: "card-corporate.jpg", width: 1200, height: 1500, from: "#0f172a", to: "#46618f", glow: "#d4af37", seed: 59 },
	{ file: "video-poster-fallback.jpg", width: 1280, height: 720, from: "#0f172a", to: "#2a2540", glow: "#d4af37", seed: 71 },
];

for (const item of placeholders) {
	const target = path.join(imagesDir, item.file);
	if (await exists(target)) continue;
	await sharp(Buffer.from(bokehSvg(item))).jpeg({ quality: 78, mozjpeg: true }).toFile(target);
	console.log(`placeholder ${item.file}`);
}

const ogTarget = path.join(imagesDir, "og-image.jpg");
if (!(await exists(ogTarget))) {
	await sharp(path.join(root, "src/photos/tabtones-band.jpg"))
		.rotate()
		.resize(1200, 630, { fit: "cover", position: "centre" })
		.jpeg({ quality: 82, mozjpeg: true })
		.toFile(ogTarget);
	console.log("og-image.jpg");
}

const iconSvg = path.join(imagesDir, "favicon.svg");
if (!(await exists(iconSvg))) {
	await writeFile(
		iconSvg,
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f172a"/><path d="M20 14v26a7 7 0 1 0 5 6.7V24l22-5v17a7 7 0 1 0 5 6.7V10z" fill="#d4af37"/></svg>\n`,
	);
	console.log("favicon.svg");
}

const touchTarget = path.join(imagesDir, "apple-touch-icon.png");
if (!(await exists(touchTarget))) {
	await sharp(iconSvg, { density: 288 }).resize(180, 180).png().toFile(touchTarget);
	console.log("apple-touch-icon.png");
}
