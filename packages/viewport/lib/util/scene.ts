import Engine, { EngineObject } from '@orago/game/engine';

export class Scene extends EngineObject {
	constructor(engine: Engine) {
		super(engine);

		engine.destroy();
	}
}