const STORAGE_KEY = "tabtones.consent.youtube";
const CONSENT_VERSION = 1;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 183;
const EMBED_BASE = "https://www.youtube-nocookie.com/embed/";

function readConsent() {
	try {
		const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
		const valid =
			stored &&
			stored.version === CONSENT_VERSION &&
			(stored.status === "accepted" || stored.status === "rejected") &&
			Date.now() - stored.timestamp < MAX_AGE_MS;
		return valid ? stored.status : null;
	} catch {
		return null;
	}
}

function writeConsent(status) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CONSENT_VERSION, status, timestamp: Date.now() }));
	} catch {
		// Storage blocked: the decision then only applies to this page view.
	}
}

function loadVideo(card) {
	const frame = card.querySelector("[data-video-frame]");
	if (frame.querySelector("iframe")) {
		return;
	}

	const iframe = document.createElement("iframe");
	iframe.className = "video-embed";
	iframe.src = `${EMBED_BASE}${encodeURIComponent(card.dataset.videoId)}?rel=0`;
	iframe.title = card.dataset.videoTitle;
	iframe.loading = card.classList.contains("is-featured") ? "eager" : "lazy";
	iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
	iframe.referrerPolicy = "strict-origin-when-cross-origin";
	iframe.allowFullscreen = true;
	frame.append(iframe);
	card.classList.add("is-playing");
}

function unloadVideo(card) {
	card.querySelector("iframe")?.remove();
	card.classList.remove("is-playing");
}

export function initConsent() {
	const banner = document.querySelector("[data-consent-banner]");
	const cards = document.querySelectorAll("[data-video]");
	let state = readConsent();
	let lastOpener = null;

	function render() {
		document.documentElement.dataset.consent = state ?? "unknown";
		cards.forEach(state === "accepted" ? loadVideo : unloadVideo);
	}

	function openBanner(opener) {
		lastOpener = opener ?? null;
		banner.hidden = false;
		if (opener) {
			banner.tabIndex = -1;
			banner.focus();
		}
	}

	function closeBanner() {
		banner.hidden = true;
		lastOpener?.focus();
		lastOpener = null;
	}

	function decide(status) {
		state = status;
		writeConsent(status);
		render();
		closeBanner();
	}

	banner.querySelector("[data-consent-accept]").addEventListener("click", () => decide("accepted"));
	banner.querySelector("[data-consent-reject]").addEventListener("click", () => decide("rejected"));

	document.querySelectorAll("[data-consent-open]").forEach((button) => {
		button.addEventListener("click", () => openBanner(button));
	});

	// Esc may only dismiss the banner once a decision exists, so it is never skipped silently.
	banner.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && state) {
			closeBanner();
		}
	});

	render();
	// Pages without videos (legal pages) stay free of the banner.
	if (!state && cards.length) {
		openBanner(null);
	}
}
