import Engine, { EngineObject, screenToWorld, worldToScreen } from '@orago/game/engine';

export class PanAndZoomHandler extends EngineObject {
	modes = {
		panning: false,
		zoom: false
	};

	pan = {
		start: { x: 0, y: 0 },
		offset: { x: 0, y: 0 },
		change: { x: 0, y: 0 },
		state: false,
		active: false
	};

	constructor(engine: Engine) {
		super(engine);

		this.engine.brush.canvas.addEventListener('wheel', this.handleWheel.bind(this));

		const { cursor } = engine;

		cursor.events.on('move', () => this.panTick());
		cursor.events.on('middle', () => this.pan.active = true);
		cursor.events.on('middle-release', () => this.pan.active = false);
	}

	toggleModes(status: boolean, modes: (keyof typeof this.modes)[]) {
		for (const mode of modes) {
			this.modes[mode] = status;
		}

		return this;
	}

	private handleWheel(event: WheelEvent) {
		if (this.modes.panning != true) return;

		const { deltaY } = event;

		const { offset } = this.engine;
		const pos = this.engine.cursor.pos;
		const npos = {
			x: pos.x,
			y: pos.y
		}

		const before = worldToScreen(npos, {
			zoom: 1,
			offset
		});

		const zoomFactor = 1.1;
		const g = deltaY < 0 ? zoomFactor : 1 / zoomFactor;

		this.engine.zoom *= g;

		const after = worldToScreen(npos, {
			zoom: g,
			offset
		});

		this.engine.offset.x += before.x - after.x;
		this.engine.offset.y += before.y - after.y;

		event.preventDefault();
	}

	panTick() {
		if (this.modes.panning != true) return;

		if (this.pan.active)
			this.panMove();

		else if (this.pan.state)
			this.panReset();
	}

	panMove() {
		const { cursor } = this.engine;

		if (this.pan.state != true) {
			this.pan.state = true;

			this.pan.start = {
				x: cursor.pos.x,
				y: cursor.pos.y
			}
		}

		this.pan.change.x = cursor.pos.x - this.pan.start.x;
		this.pan.change.y = cursor.pos.y - this.pan.start.y;

		this.engine.offset.x = (this.pan.offset.x + this.pan.change.x);
		this.engine.offset.y = (this.pan.offset.y + this.pan.change.y);
	}

	panReset() {
		this.pan.state = false;

		this.pan.offset.x += this.pan.change.x;
		this.pan.offset.y += this.pan.change.y;
		this.engine.offset.x = this.pan.offset.x;
		this.engine.offset.y = this.pan.offset.y;
		this.pan.change.x = 0;
		this.pan.change.y = 0;
	}
}