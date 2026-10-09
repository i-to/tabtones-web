// Fails the build if the output contains inline styles/scripts or loads from hosts other than the allow-list.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT = "_site";
// Hosts that may appear in links or the consent-gated embed; everything else would be a third-party request.
const ALLOWED_HOSTS = new Set([
	"www.youtube-nocookie.com",
	"www.youtube.com",
	"www.instagram.com",
	"eventzone.de",
	"www.eventpeppers.com",
	"wa.me",
	"policies.google.com",
	"www.lda.bayern.de",
	"schema.org",
	"www.w3.org",
	"www.sitemaps.org",
]);

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(full);
		else yield full;
	}
}

const problems = [];

for await (const file of walk(OUTPUT)) {
	if (!/\.(html|css|js)$/.test(file)) continue;
	const content = await readFile(file, "utf8");

	for (const match of content.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) {
		const host = match[1].toLowerCase();
		const isOwnSite = host === "localhost" || host.endsWith(".github.io") || host === "example.com";
		if (!ALLOWED_HOSTS.has(host) && !isOwnSite) problems.push(`${file}: unexpected host ${host}`);
	}

	if (file.endsWith(".html")) {
		if (/\sstyle="/.test(content)) problems.push(`${file}: inline style attribute (blocked by CSP)`);
		if (/<script(?![^>]*(?:\bsrc=|application\/ld\+json))/.test(content)) problems.push(`${file}: inline script (blocked by CSP)`);
	}
}

if (problems.length) {
	console.error(problems.join("\n"));
	process.exit(1);
}
console.log("check passed: no third-party loads, no inline styles or scripts");
