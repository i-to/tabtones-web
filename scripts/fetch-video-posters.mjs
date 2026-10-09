// One-time developer tool: stores thumbnails/titles locally so visitors never contact YouTube before consent.
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videosFile = path.join(root, "src/_data/videos.json");
const postersDir = path.join(root, "src/assets/images/video-posters");
const DARK_MEAN = 30;

const exists = (file) => access(file).then(() => true, () => false);
const download = async (url) => {
	const response = await fetch(url);
	return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
};
const brightness = async (buffer) => {
	const { channels } = await sharp(buffer).stats();
	return (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
};

async function fetchPoster(id) {
	let best = (await download(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)) ?? (await download(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`));
	let bestBrightness = best ? await brightness(best) : -1;

	// Intro or title frames are often black: fall back to the 25/50/75% frames (4:3 with letterbox bars, cropped to 16:9).
	if (bestBrightness < DARK_MEAN) {
		for (const frame of ["hq1", "hq2", "hq3"]) {
			const raw = await download(`https://i.ytimg.com/vi/${id}/${frame}.jpg`);
			if (!raw) continue;
			const cropped = await sharp(raw).extract({ left: 0, top: 45, width: 480, height: 270 }).resize(1280, 720).jpeg({ quality: 82 }).toBuffer();
			const value = await brightness(cropped);
			if (value > bestBrightness) {
				best = cropped;
				bestBrightness = value;
			}
		}
	}
	return best;
}

const videos = JSON.parse(await readFile(videosFile, "utf8"));
await mkdir(postersDir, { recursive: true });

for (const video of videos) {
	const target = path.join(postersDir, `${video.id}.jpg`);
	if (!(await exists(target))) {
		const poster = await fetchPoster(video.id);
		if (poster) {
			await writeFile(target, poster);
			console.log(`poster ${video.id}`);
		}
	}

	if (!video.title) {
		const oembed = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://youtu.be/${video.id}`)}`);
		if (oembed.ok) {
			video.title = (await oembed.json()).title;
			console.log(`title ${video.id}: ${video.title}`);
		}
	}
}

await writeFile(videosFile, `${JSON.stringify(videos, null, "\t")}\n`);
