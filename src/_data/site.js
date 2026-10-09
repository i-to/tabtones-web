const email = "tabtones@gmail.com";
const mailSubject = "Anfrage Tabtones Website";
const mailBody = [
	"Hallo Tabtones,",
	"",
	"wir planen eine Veranstaltung und würden uns über ein Angebot freuen:",
	"",
	"Anlass:",
	"Datum:",
	"Ort:",
	"Anzahl Gäste:",
	"",
	"Viele Grüße",
].join("\r\n");
const whatsappText = "Hallo Tabtones, wir haben eine Anfrage für eine Veranstaltung.";

module.exports = {
	name: "Tabtones",
	isBuild: process.env.ELEVENTY_RUN_MODE === "build",
	mailHref: `mailto:${email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`,
	whatsappHref: `https://wa.me/xxx?text=${encodeURIComponent(whatsappText)}`,
	tagline: "Live Pop, Dance & Lounge | München & Bayern",
	// CI sets SITE_URL to the GitHub Pages origin plus repository path.
	url: (process.env.SITE_URL || "http://localhost:8080").replace(/\/$/, ""),
	email,
	phone: "+49 xxx",
	mailSubject,
	social: [
		{ id: "youtube", label: "YouTube", url: "https://www.youtube.com/@Tabtones" },
		{ id: "instagram", label: "Instagram", url: "https://www.instagram.com/tabtones_band/" },
		{ id: "eventzone", label: "Eventzone", url: "https://eventzone.de/tabtones" },
		{ id: "eventpeppers", label: "Eventpeppers", url: "https://www.eventpeppers.com/de/tabtones" },
	],
};
