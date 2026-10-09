export function initNav() {
	const header = document.querySelector("[data-header]");
	const toggle = document.querySelector("[data-nav-toggle]");
	const nav = document.querySelector("[data-nav]");
	const sentinel = document.querySelector("[data-header-sentinel]");

	if (sentinel && "IntersectionObserver" in window) {
		new IntersectionObserver(([entry]) => {
			header.classList.toggle("is-scrolled", !entry.isIntersecting);
		}).observe(sentinel);
	}

	function setOpen(open) {
		toggle.setAttribute("aria-expanded", String(open));
		header.classList.toggle("is-open", open);
	}

	toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
	nav.addEventListener("click", (event) => {
		if (event.target.closest("a")) {
			setOpen(false);
		}
	});
	header.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && header.classList.contains("is-open")) {
			setOpen(false);
			toggle.focus();
		}
	});
}
