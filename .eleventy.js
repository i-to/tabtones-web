const path = require("node:path");

// CI sets PATH_PREFIX=/tabtones-web/ for GitHub Pages project sites.
const pathPrefix = process.env.PATH_PREFIX || "/";
const imageUrlPath = `${pathPrefix}assets/img/`;

module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/js");
	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addPassthroughCopy({
		"node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2":
			"assets/fonts/plus-jakarta-sans-latin-wght-normal.woff2",
		"node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2":
			"assets/fonts/playfair-display-latin-wght-normal.woff2",
		"node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2":
			"assets/fonts/playfair-display-latin-wght-italic.woff2",
		"node_modules/@fontsource-variable/plus-jakarta-sans/LICENSE": "assets/fonts/LICENSE-plus-jakarta-sans.txt",
		"node_modules/@fontsource-variable/playfair-display/LICENSE": "assets/fonts/LICENSE-playfair-display.txt",
	});

	eleventyConfig.addAsyncShortcode("photo", async function (file, alt, options = {}) {
		const { default: Image } = await import("@11ty/eleventy-img");
		const {
			widths = [480, 960, 1600],
			sizes = "100vw",
			className = "",
			loading = "lazy",
			fetchpriority,
		} = options;

		const metadata = await Image(path.join("src/photos", file), {
			widths,
			formats: ["webp", "jpeg"],
			outputDir: "_site/assets/img/",
			urlPath: imageUrlPath,
		});

		const jpeg = metadata.jpeg;
		const fallback = jpeg[jpeg.length - 1];
		const sources = Object.values(metadata)
			.map((entries) => `<source type="${entries[0].sourceType}" srcset="${entries.map((e) => e.srcset).join(", ")}" sizes="${sizes}">`)
			.join("");
		const classAttr = className ? ` class="${className}"` : "";
		const priorityAttr = fetchpriority ? ` fetchpriority="${fetchpriority}"` : "";

		return `<picture>${sources}<img${classAttr} src="${fallback.url}" width="${fallback.width}" height="${fallback.height}" alt="${alt}" loading="${loading}" decoding="async"${priorityAttr}></picture>`;
	});

	eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

	return {
		pathPrefix,
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
		dir: {
			input: "src",
			includes: "_includes",
			data: "_data",
			output: "_site",
		},
	};
};