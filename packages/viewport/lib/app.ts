import { brush, engine } from './renderer';
import './css/main.css';
import Sprites from '@orago/game/sprites';
import { drawGridBackground } from './gridBackground';
import { World } from './entities/world';
import { PanAndZoomHandler } from './entities/panning';
import { RttexEntityGenerator } from './entities/rttexGen';

export const baseTileSize = 32;

new PanAndZoomHandler(engine)
	.addTo()
	.toggleModes(true, ['zoom', 'panning']);
new World(engine).addTo();
new RttexEntityGenerator(engine).addTo();

engine.object({ priority: 0 }, ref => {
	ref.addTo();
	engine.keyboard.init();

	ref.events.on('render', () => {
		brush.clear();

		drawGridBackground(engine, {
			size: baseTileSize * engine.zoom,
			offset: engine.offset
		});
	});
});