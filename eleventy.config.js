import { RenderPlugin } from "@11ty/eleventy";
import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import MarkdownItFootnote from 'markdown-it-footnote';
import MarkdownItGitHubAlerts from 'markdown-it-github-alerts';
import pluginMermaid from "@kevingimbel/eleventy-plugin-mermaid";

import pluginFilters from "./_config/filters.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Drafts, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft) {
			data.title = `${data.title} (draft)`;
		}

		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// inject macros globally to markdowns files
	// macros can be used like this: `macros.macroName()`
	eleventyConfig.addPreprocessor("macro-inject", ".njk,.md", (data, content) => {
		return `{%- import "macros/content.njk" as macros with context -%}\n` + content;
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/"
		})
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl")
	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch CSS files
	eleventyConfig.addWatchTarget("css/**/*.css");
	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Bundle <style> content and adds a {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
		// Add all <style> content to `css` bundle (use <style eleventy:ignore> to opt-out)
		// Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "style",
	});

	// Bundle <script> content and adds a {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
		// Add all <script> content to the `js` bundle (use <script eleventy:ignore> to opt-out)
		// Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "script",
	});

	// Official plugins
	eleventyConfig.addPlugin(RenderPlugin);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});

	eleventyConfig.addPlugin(pluginMermaid);
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	// Markdown
	eleventyConfig.amendLibrary("md", (mdLib) => mdLib
		.use(MarkdownItGitHubAlerts, {
			markers: '*'
		})
		.use(MarkdownItFootnote)
	);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
		},
		collection: {
			name: "posts",
		},
		metadata: {
			language: "en",
			title: "Jérémie Robi | jrb.nz",
			subtitle: "Jérémie Robitaille is a cloud engineer based in Canada. He's interested in all things that make the internet what it is, from the infrastructure that runs it silently to the small and weird websites that keep it interesting.",
			base: "https://jrb.nz/",
			author: {
				name: "Jérémie Robi"
			}
		}
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			}
		},

		sharpOptions: {
			animated: true,
		},
	});

	// Filters
	// Used to add a warning for blog posts older than 2 years
	// https://www.raymondcamden.com/2020/11/09/adding-a-warning-for-old-posts-to-your-jamstack-site
	eleventyConfig.addFilter('ageInDays', d => {
		let date = new Date(d);
		let now = new Date();
		let diff = now.getTime() - date.getTime();
		let day_diff = Math.floor(diff / (1000 * 3600 * 24));
		return day_diff;
	});

	// Add a filter to extract headings for the TOC macro (see macros/content.njk)
	eleventyConfig.addFilter("extractHeadings", function (content) {
		if (!content) return [];

		// Note: `content` here is the page's own rendered HTML, before the site-wide
		// IdAttributePlugin transform runs, so headings don't have `id` attributes yet.
		// We compute the same id it will assign later (slugified heading text, with
		// `-2`, `-3`, ... suffixes on repeats) so TOC links match the final anchors.
		const slugify = eleventyConfig.getFilter("slugify");
		const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
		const headings = [];
		const seenIds = {};
		let match;

		while ((match = headingRegex.exec(content)) !== null) {
			const text = match[2]
				.replace(/<[^>]+>/g, '') // Strip HTML tags from heading text
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.replace(/&#0?39;/g, "'")
				.trim();

			let id = slugify(text);
			if (seenIds[id]) {
				id = `${id}-${++seenIds[id]}`;
			} else {
				seenIds[id] = 1;
			}

			headings.push({
				level: parseInt(match[1]),
				id,
				text,
			});
		}

		return headings;
	});

	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "_site"
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};
