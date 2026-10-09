import { initConsent } from "./consent.js";
import { initNav } from "./nav.js";
import { initContact } from "./contact.js";

document.documentElement.classList.add("js");

initNav();
initConsent();
initContact();
