import { defineMessages } from "react-intl";


export const backgroundMessages = defineMessages({
	position: {
		defaultMessage: "Position",
		description: "Backgroud settings: form field label",
	},

	positionHint: {
		defaultMessage: "center, top, or bottom",
		description: "Backgroud settings: form field hint (Position)",
	},

	collection: {
		defaultMessage: "Unsplash collection",
		description: "Backgroud settings: form field label",
	},

	collectionHint: {
		defaultMessage: "Collection ID. Found in the URL, example: 42576559",
		description: "Backgroud settings: form field hint (Unsplash Collection)",
	},

	brightness: {
		defaultMessage: "Brightness",
		description: "Backgroud settings: form field label",
	},

	brightnessDark: {
		defaultMessage: "Brightness: Dark",
		description: "Backgroud settings: form field label",
	},

	brightnessDarkHint: {
		defaultMessage: "Change brightness of darker images",
		description: "Backgroud settings: form field label (Brightness: Dark)",
	},

	brightnessLight: {
		defaultMessage: "Brightness: Light",
		description: "Backgroud settings: form field label",
	},

	brightnessLightHint: {
		defaultMessage: "Change brightness of lighter images",
		description: "Backgroud settings: form field label (Brightness: Light)",
	},

	blurRadius: {
		defaultMessage: "Blur radius",
		description: "Backgroud settings: form field label",
	}
});
