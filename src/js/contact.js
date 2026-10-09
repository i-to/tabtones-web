export function initContact() {
	const status = document.querySelector("[data-copy-status]");

	document.querySelectorAll("[data-copy]").forEach((button) => {
		const label = button.querySelector("span");
		const original = label.textContent;

		button.addEventListener("click", async () => {
			try {
				await navigator.clipboard.writeText(button.dataset.copy);
				label.textContent = "Kopiert";
				status.textContent = "E-Mail-Adresse in die Zwischenablage kopiert.";
			} catch {
				label.textContent = "Bitte manuell kopieren";
				status.textContent = "Kopieren nicht möglich. Bitte die Adresse manuell markieren.";
			}
			window.setTimeout(() => {
				label.textContent = original;
			}, 2500);
		});
	});
}
