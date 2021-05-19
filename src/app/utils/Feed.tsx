import { escapeHTMLtoText } from "app/utils/html";

export interface Article {
	title: string;
	link: string;
	image?: string;
	alt?: string;
}

export interface Feed {
	title?: string;
	link?: string;
	articles: Article[];
}

function cleanURL(url: string) {
	if (url.startsWith("//")) {
		return "https://" + url.slice(2);
	} else {
		return url;
	}
}

function getImage(el: Element): ([string, string | undefined] | undefined) {
	const enclosure = el.querySelector("enclosure[type^='image/'][url]");
	if (enclosure) {
		return [ cleanURL(enclosure.getAttribute("url")!), undefined ];
	}

	const html = el.querySelector("description, summary")?.textContent ?? undefined
	if (!html) {
		return undefined;
	}

	const parser = new window.DOMParser().parseFromString(html, "text/html");
	const img = parser.querySelector("img");
	if (!img) {
		return undefined;
	}

	return [ cleanURL(img.getAttribute("src")!), img.getAttribute("alt") ?? ""];
}

export function parseFeed(root: Element): Feed | null {
	const articles: Article[] = [];
	if (root.tagName == "rss") {
		root.querySelectorAll("item").forEach(el => {
			const img = getImage(el);
			articles.push({
				title: escapeHTMLtoText(el.querySelector("title")!.textContent!),
				link: el.querySelector("link")!.textContent!,
				image: img && img[0],
				alt: img && img[1],
			});
		});

		return {
			title: root.querySelector("channel > title")!.textContent ?? undefined,
			link: root.querySelector("channel > link")!.textContent ?? undefined,
			articles: articles,
		};
	} else if (root.tagName == "feed") {
		root.querySelectorAll("entry").forEach(el => {
			const img = getImage(el);
			articles.push({
				title: escapeHTMLtoText(el.querySelector("title")!.textContent!),
				link: el.querySelector("link")!.getAttribute("href")!,
				image: img && img[0],
				alt: img && img[1],
			});
		});

		return {
			title: root.getElementsByTagName("title")[0]?.textContent ?? undefined,
			link: root.getElementsByTagName("link")[0]?.textContent ?? undefined,
			articles: articles
		};
	} else {
		return null;
	}
}
