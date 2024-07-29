import Engine from '@orago/game/engine';
import { brush, engine } from '../renderer';
import { Scene } from '../util/scene';
import { drawGridBackground } from '../gridBackground';
import { baseTileSize } from '../util/tiles';
import { RttexEntityGenerator } from '../entities/rttexGen';
import { PanAndZoomHandler } from '../entities/panning';


export class ViewerScene extends Scene {
	constructor(engine: Engine) {
		super(engine);

		this.priority = 0;

		this.addTo();

		engine.keyboard.init();

		new RttexEntityGenerator(engine).addTo();
		new PanAndZoomHandler(engine)
			.addTo()
			.toggleModes(true, ['zoom', 'panning']);

		this.events.on('render', () => {
			brush.clear();

			drawGridBackground(engine, {
				size: baseTileSize * engine.zoom,
				offset: engine.offset
			});
		});
	}
}