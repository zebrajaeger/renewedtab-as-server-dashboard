import { miscMessages } from "app/locale/common";
import React, { ChangeEvent, useState } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import Button, { ButtonVariant } from "../Button";
import LanguageSelector from "../LanguageSelector";


const messages = defineMessages({
	privacyPolicy: {
		defaultMessage: "Privacy Policy",
		description: "General settings: privacy policy button",
	},

	bookmarksBar: {
		defaultMessage: "Bookmarks Bar",
		description: "General settings: bookmarks bar",
	},

	firefoxBookmarksBar: {
		defaultMessage: "You can show the bookmarks bar only on the New Tab page by Right-clicking next to the address bar > Bookmarks Toolbar > Only Show on New Tab. <a>See more</a>",
		description: "General settings: Help for Firefox bookmarks bar",
	},
})


export interface GeneralSettingsProps {
	locale: string;
	setLocale: (locale: string) => void;

	showBookmarksBar: boolean;
	setShowBookmarksBar: (value: boolean) => void;
}


export default function GeneralSettings(props: GeneralSettingsProps) {
	const [sentryEnabled, setSentryEnabled] =
		useState(localStorage.getItem("_sentry-opt-out") != "yes");
	function onSentryEnabledChanged(e: ChangeEvent<HTMLInputElement>) {
		if (e.target.checked) {
			localStorage.removeItem("_sentry-opt-out");
		} else {
			localStorage.setItem("_sentry-opt-out", "yes");
		}
		setSentryEnabled(e.target.checked);
	}

	const isBrowserExtension = typeof browser !== "undefined";

	return (
		<div className="modal-body">
			<p>
				<FormattedMessage
						{...miscMessages.widgetsHaveSettings}
						values={{ b: (chunk: any) => (<b>{chunk}</b>) }} />
			</p>
			<LanguageSelector
				locale={props.locale}
				setLocale={props.setLocale} />

			{isBrowserExtension && app_version.target == "firefox" && (<>
				<h3 className="label">
					<FormattedMessage {...messages.bookmarksBar} />
				</h3>
				<p className="text-muted">
					<FormattedMessage {...messages.firefoxBookmarksBar}
						values={{ a: (chunk: any) => (<a href="https://renewedtab.com/help/firefox-bookmarks/">{chunk}</a>) }} />
				</p>
			</>)}

			{isBrowserExtension && app_version.target == "chrome" && (<>
				<h3 className="label">
					<FormattedMessage {...messages.bookmarksBar} />
				</h3>
				<div className="field">
					<label className="inline" htmlFor="sshow-bookmarks-bar">
						<input name="show-bookmarks-bar" className="mr-2"
							type="checkbox" checked={props.showBookmarksBar}
							onChange={e => props.setShowBookmarksBar(e.target.checked)} />
						<FormattedMessage
							defaultMessage="Show bookmarks bar"
							description="General settings: bookmarks bar" />
					</label>
					<p className="text-muted">
						<FormattedMessage
							defaultMessage="Show a bookmarks bar at the top of the page."
							description="General settings: bookmarks bar" />{" "}
						<FormattedMessage
							defaultMessage="Alternatively, you could use a Bookmarks widget for fine-grained control."
							description="General settings: bookmarks bar" />
					</p>
				</div>
			</>)}

			<h3 className="label mt-6">
				<FormattedMessage
					defaultMessage="Privacy"
					description="General settings: privacy" />
			</h3>

			<div className="field">
				<label className="inline" htmlFor="sentry-enabled">
					<input name="sentry-enabled" className="mr-2"
						type="checkbox" checked={sentryEnabled}
						onChange={onSentryEnabledChanged} />
					<FormattedMessage
						defaultMessage="Enable crash reporting (using Sentry)"
						description="General settings: enable sentry" />
				</label>
				<p className="mt-4">
					<Button label={messages.privacyPolicy}
						variant={ButtonVariant.Secondary} target="_blank"
						href="https://renewedtab.com/privacy_policy/" />
				</p>
			</div>
		</div>);
}
