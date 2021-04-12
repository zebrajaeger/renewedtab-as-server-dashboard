import { usePromise } from "app/hooks";
import schemaMessages from "app/locale/common";
import Schema, { type } from "app/utils/Schema";
import { Vector2 } from "app/utils/Vector2";
import { Widget, WidgetProps } from "app/Widget";
import React, { useRef } from "react";
import { defineMessages, useIntl } from "react-intl";


const messages = defineMessages({
	description: {
		defaultMessage: "Search box to your favourite search engine",
	},

	placeholder: {
		defaultMessage: "Enter notes here",
	},

	searchTitle: {
		defaultMessage: "Search engine name",
	},

	useBrowserDefault: {
		defaultMessage: "Use browser's default search engine",
	},

	searchWith: {
		defaultMessage: "Search with {name}",
	},

	search: {
		defaultMessage: "Search",
	},
});


interface SearchProps {
	useBrowserEngine: boolean;
	searchTitle: string;
	searchURL: string;
}


declare namespace browser.search {
	interface SearchEngine {
		name: string;
		isDefault: boolean;
		alias?: string;
		favIconUrl?: string;
	}

	function get(): Promise<SearchEngine[]>;
	function search(props: any): void;
	function query(props: any): void;
}

declare namespace browser.tabs {
	interface Tab {
		id?: number;
	}

	function getCurrent(): Promise<Tab>;
}


const hasSearchAPI = typeof browser !== "undefined" && typeof browser.search !== "undefined";

const hasSearchGetAPI = hasSearchAPI && typeof browser.search.get !== "undefined";


async function getBrowserSearchEngineName(): Promise<string> {
	if (!hasSearchGetAPI) {
		return "";
	}

	const def = (await browser.search.get()).find((x) => x.isDefault);
	return def?.name ?? "";
}


export default function Search(widget: WidgetProps<SearchProps>) {
	const props = widget.props;
	const intl = useIntl();

	if (hasSearchAPI && props.useBrowserEngine) {
		const [name] = usePromise(() => getBrowserSearchEngineName(), []);
		const ref = useRef<HTMLInputElement>(null);

		function onSubmit(e: React.FormEvent<HTMLFormElement>) {
			e.preventDefault();

			const query = ref.current?.value;
			if (query) {
				if (typeof browser.search.query == "function") {
					browser.search.query({
						text: query
					});
				} else {
					browser.tabs.getCurrent().then((tab) => {
						browser.search.search({
							query: query,
							tabId: tab.id,
						});
					})
				}
			}
		}

		const placeholder = name
			? intl.formatMessage(messages.searchWith, { name: props.searchTitle })
			: intl.formatMessage(messages.search);

		return (
			<div className="panel flush">
				<form onSubmit={onSubmit}>
					<input autoFocus={true} placeholder={placeholder}
							type="text" name="q" ref={ref}
							className="large invisible" />
				</form>
			</div>);
	}

	return (
		<div className="panel flush">
			<form method="get" action={props.searchURL}>
				<input autoFocus={true} type="text" name="q"
						placeholder={
							intl.formatMessage(messages.searchWith, { name: props.searchTitle })}
						className="large invisible" />
			</form>
		</div>);
}


Search.description = messages.description;

Search.initialProps = {
	useBrowserEngine: true,
	searchTitle: "Google",
	searchURL: "https://google.com/search",
};

Search.schema = (widget: Widget<SearchProps>) => {
	if (!hasSearchAPI) {
		return {
			searchTitle: type.string(messages.searchTitle),
			searchURL: type.url(schemaMessages.url),
		} as Schema;
	} else if (widget.props.useBrowserEngine) {
		return {
			useBrowserEngine: type.boolean(messages.useBrowserDefault),
		}
	} else {
		return {
			useBrowserEngine: type.boolean(messages.useBrowserDefault),
			searchTitle: type.string(messages.searchTitle),
			searchURL: type.url(schemaMessages.url),
		} as Schema;
	}
}


Search.defaultSize = new Vector2(15, 1);

Search.onCreated = (widget: Widget<SearchProps>) => {
	if (!hasSearchAPI) {
		widget.props.searchTitle = "Google";
		widget.props.searchURL = "https://google.com/search";
	}
}
