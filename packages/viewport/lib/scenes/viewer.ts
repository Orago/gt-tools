import Engine from '@orago/game/engine';
import { brush, engine } from '../renderer';
import { Scene } from '../util/scene';
import { drawGridBackground } from '../gridBackground';
import { baseTileSize } from '../util/tiles';
import { RttexEntityGenerator } from '../entities/rttexGen';
import { PanAndZoomHandler } from '../entities/panning';
import { newNode as node } from '@orago/dom';
import { body } from '../dom';

export class ViewerScene extends Scene {
	egen: RttexEntityGenerator;
	constructor(engine: Engine) {
		super(engine);

		this.priority = 0;

		this.addTo();
		this.loadDom();

		engine.keyboard.init();

		this.egen = new RttexEntityGenerator(engine, true).addTo();
		new PanAndZoomHandler(engine)
			.addTo()
			.toggleModes(true, ['zoom', 'panning']);

		this.events.on('render', () => {
			brush.clear();

			drawGridBackground(engine, {
				size: baseTileSize * engine.zoom,
				offset: engine.offset,
				gridColor: 'goldenrod',
				gridBackground: 'wheat',
			});
		});
	}

	loadDom() {
		const page = node.div
			.styles({
				position: 'fixed',
				top: 0,
				left: 0,
				padding: '5px'
			})
			.append(
				node.p.text('Click load files to render'),
				node.p.text('Click on a sprite to download it'),
				node.p.text('Right click or hold (if on mobile) on a sprite to remove it'),
				node.button
					.on('click', () => this.egen.popup())
					.text('Load Files'),
				node.button
					.on('click', () => this.egen.saveall())
					.text('Download all')
			);

		body.append(page);

		this.events.on('remove', () => page.remove());
	}
}