import Engine from '@orago/game/engine';
import { brush } from '../renderer';
import { Scene } from '../util/scene';
import { drawGridBackground } from '../gridBackground';
import { baseTileSize } from '../util/tiles';
import { PanningPlugin } from '../entities/panning';
import { newNode as node } from '@orago/dom';
import { body } from '../dom';
import { ViewerScene } from './viewer';
import { ItemsDatScene } from './itemsdat';

export class HomeScene extends Scene {
	constructor(engine: Engine) {
		super(engine);

		this.priority = 0;

		this.loadDom();

		engine.keyboard.init();

		new PanningPlugin(engine, 'all')
			.ref(self => {
				self.options.min = 1;
				self.options.max = 20;
			})
			.addTo()
			.toggleModes(true, ['zoom', 'panning']);


		this.events.on('render', () => {
			// brush.clear();

			brush.chainable
			.pos(0, 0)
			.size(32, 32)
			.color('red')
			.rect;

			drawGridBackground(engine,{
				size: baseTileSize * engine.zoom,
				offset: engine.offset
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
				node.p.text('Most if not all assets used are copyright by Ubisoft.'),
				node.p.text('This project is not affiliated with Ubisoft or Growtopia.'),

				node.button
					.on('click', () => new ViewerScene(this.engine))
					.text('Launch Viewer'),
				node.button
					.on('click', () => new ItemsDatScene(this.engine))
					.text('Launch Items Dat')
			);

		this.engine.ui.append(page);
		this.events.on('remove', () => page.remove());
	}
}