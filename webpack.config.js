const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";
const dest = path.resolve(__dirname, "dist/webext/app");

const configFile = path.resolve(__dirname, "config.json");
function getConfig() {
	const config = JSON.parse(fs.readFileSync(configFile).toString());
	return {
		API_URL: JSON.stringify(config.API_URL),
		PROXY_URL: JSON.stringify(config.PROXY_URL),
	};
}

module.exports = {
	mode: isProd ? "production" : "development",
	entry: "./src/app/index",
	devtool: isProd ? undefined : "source-map",
	plugins: [
		new webpack.DefinePlugin({
			config: getConfig(),
		}),
		new CopyPlugin({
			patterns: [
				{ from: "src/app/public/", to: dest },
				{ from: "src/webext/manifest.json", to: path.resolve(__dirname, "dist/webext") },
				{ from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js", to: dest },
			]
		}),
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: "[name].css",
			chunkFilename: "[id].css",
		}),
		new HtmlWebpackPlugin({
			filename: "index.html",
			title: "Homescreen Web",
			template: "src/app/templates/index.ejs",
			hash: true,
			templateParameters: {
				"webext": false,
			},
		}),
		new HtmlWebpackPlugin({
			filename: "webext.html",
			title: "New Tab",
			template: "src/app/templates/index.ejs",
			hash: false,
			chunksSortMode: "manual",
			scriptLoading: "blocking",
			templateParameters: {
				"webext": true,
			},
		}),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: "ts-loader",
						options: {
							configFile: "tsconfig.app.json",
						}
					}
				],
				exclude: /node_modules/
			},
			{
				test: /\.s?[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader"
				],
				sideEffects: true,
			},
		]
	},
	resolve: {
		extensions: [ ".ts", ".tsx", ".js" ],
		modules: [
			path.resolve(__dirname, "src"),
			"node_modules"
		]

	},
	output: {
		filename: "[name].js",
		path: dest
	},
};
