import { LegacyEntity } from '@orago/game/dist/plugins/legacy.js';
import Engine from '@orago/game/engine';

export class Scene extends LegacyEntity {
	engine: Engine;
	constructor(engine: Engine) {
		super(engine.ecs);
		this.engine = engine;
		// engine.destroy();
		// engine.ecs.addSystem(new LegacySystem(engine.ecs, engine));
		engine.ecs.addEntity(this);
	}
}