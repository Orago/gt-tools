import Engine, { EngineObject } from '@orago/game/engine';
import { Vector2Map } from '@orago/vector';
import { baseTileSize } from '../app';
import { brush } from '../renderer';
import { screenToGrid } from '../transform';


export class World extends EngineObject {
	tiles: Vector2Map<number> = new Vector2Map();

	constructor(engine: Engine) {
		super(engine);

		const { cursor } = engine;

		cursor.events.on('move', () => {
			if (cursor.down) {
				const scaled = screenToGrid(cursor.pos, baseTileSize, { offset: engine.offset, zoom: engine.zoom });

				if (cursor.button == 0) {
					this.tiles.set(scaled, 0);
				}
				else if (cursor.button == 2) {
					this.tiles.delete(scaled);
				}
			}
		});

		this.events.on('render', () => {
			const tileSize = baseTileSize * engine.zoom;

			for (const [vector, tile] of this.tiles.entries()) {

				brush.chainable
					.pos(
						vector.x * tileSize + engine.offset.x,
						vector.y * tileSize + engine.offset.y
					)
					.size(tileSize)
					.color('green')
					.rect;
			}
		});
	}
}
