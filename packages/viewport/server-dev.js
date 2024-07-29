import webpack from 'webpack';
import webpackConfig from './webpack.config.js';
import webpackDevServer from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import express from 'express';

const app = express();

if (webpackConfig.mode == 'development') {
	// @ts-ignore
	const compiler = webpack(webpackConfig);

	app.use(
		// @ts-ignore
		webpackDevServer(compiler)
	);

	app.use(
		webpackHotMiddleware(compiler)
	);
}

const startServer = () => console.log('Server listening at port %d', process.env.PORT);

app.listen(2000, startServer);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static('public'));
