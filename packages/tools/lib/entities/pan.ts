import Engine, { EngineObject, screenToWorld } from "@orago/game/engine";
import type { Vector } from "@orago/lib";

function getMidpoint(points: Vector.Point[]) {
	const midpoint = {
		x: points.reduce((x, point) => x + point.x, 0) / points.length,
		y: points.reduce((y, point) => y + point.y, 0) / points.length,
	};

	return midpoint;
}

function getDistance(point1: Vector.Point, point2: Vector.Point) {
	const dx = point2.x - point1.x;
	const dy = point2.y - point1.y;

	return Math.sqrt(dx ** 2 + dy ** 2);
}

function getTotalDistance(points: Vector.Point[]) {
	let totalDistance = 0;

	for (let i = 0; i < points.length - 1; i++)
		totalDistance += getDistance(points[i], points[i + 1]);

	return totalDistance;
}

class PCHandler {
	parent: PanningPlugin;

	constructor(parent: PCHandler["parent"]) {
		this.parent = parent;
	}

	panTick() {
		const PARENT = this.parent;

		if (PARENT.modes.panning && PARENT.pan.active) this.panMove();
	}

	panMove() {
		const PARENT = this.parent;
		const { cursor } = PARENT.engine;

		PARENT.panStart(cursor.pos);
		PARENT.translate(cursor.pos);
	}
}

class MobileHandler {
	parent: PanningPlugin;
	start: MobileStart = {
		points: [],
		size: 0,
	};

	lastDistance?: number;

	constructor(parent: MobileHandler["parent"]) {
		this.parent = parent;
	}

	pan(e: TouchEvent) {
		const PARENT = this.parent;

		if (PARENT.pan.active) this.panMove(e);
	}

	reset() {
		if (this.parent.pan.state != true) return;

		this.parent.panReset();
		this.start.points = [];
		this.start.size = 0;
		delete this.lastDistance;
	}

	touchToPoints(e: TouchEvent) {
		const points: Vector.Point[] = [];

		for (let i = 0; i < e.touches.length; i++) {
			const touch = e.touches[i];

			points.push({
				x: touch.clientX,
				y: touch.clientY,
			});
		}

		return points;
	}

	panMove(e: TouchEvent) {
		const PARENT = this.parent;
		const points = this.touchToPoints(e);
		const pos = getMidpoint(points);

		if (PARENT.pan.state != true) {
			PARENT.pan.state = true;
			PARENT.pan.start = pos;
		}

		if (points.length >= 2 && PARENT.modes.zoom == true) {
			const total = getTotalDistance(points);

			if (total != this.lastDistance && this.lastDistance) {
				const change = total / this.lastDistance;

				PARENT.factorZoom(change * PARENT.options.mobileFactor, pos);
			}

			/* Update after */
			this.lastDistance = total;
		}

		if (PARENT.modes.panning) PARENT.translate(pos);
	}
}

interface MobileStart {
	points: Vector.Point[];
	size: number;
}

type Control = "pc" | "mobile";

interface Options {
	min?: number;
	max?: number;
	mobileFactor: number;
	pcFactor: number;
}

export class PanningPlugin extends EngineObject {
	modes = {
		panning: false,
		zoom: false,
	};

	options: Options = {
		min: undefined,
		max: undefined,
		mobileFactor: 1,
		pcFactor: 1,
	};

	pan = {
		start: { x: 0, y: 0 },
		offset: { x: 0, y: 0 },
		change: { x: 0, y: 0 },
		state: false,
		active: false,
	};

	PC?: PCHandler;
	Mobile?: MobileHandler;

	constructor(engine: Engine, controls: Control[] | "all") {
		super(engine);

		if (controls === "all") controls = ["pc", "mobile"];

		const { cursor } = engine;
		const touchStart = () => (this.pan.active = true);
		const touchEnd = () => this.interactionEnd();

		if (controls.includes("pc")) {
			this.PC = new PCHandler(this);

			const mouseMove = () => this.PC?.panTick();
			const bound = this.handleWheel.bind(this);

			this.engine.brush.canvas.addEventListener("wheel", bound);
			cursor.object.addEventListener("mousemove", mouseMove);
			cursor.events.on("middle", () => (this.pan.active = true));
			cursor.events.on("middle-release", () => this.interactionEnd());

			this.events.on("remove", () => {
				this.engine.brush.canvas.removeEventListener("wheel", bound);
				cursor.object.removeEventListener("mousemove", mouseMove);
				cursor.events.off("middle", touchStart);
				cursor.events.off("middle-release", touchEnd);
			});
		}

		if (controls.includes("mobile")) {
			this.Mobile = new MobileHandler(this);

			const touchMove = (e: TouchEvent) => this.Mobile?.pan(e);

			cursor.object.addEventListener("touchmove", touchMove);
			cursor.object.addEventListener("touchstart", touchStart);
			cursor.object.addEventListener("touchend", touchEnd);

			this.events.on("remove", () => {
				cursor.object.removeEventListener("touchmove", touchMove);
				cursor.object.removeEventListener("touchstart", touchStart);
				cursor.object.removeEventListener("touchend", touchEnd);
			});
		}
	}

	private interactionEnd() {
		if (this.pan.active) {
			this.Mobile?.reset();
			this.panReset();
		}

		this.pan.active = false;
	}

	toggleModes(status: boolean, modes: (keyof typeof this.modes)[]) {
		for (const mode of modes) this.modes[mode] = status;

		return this;
	}

	public panStart(pos: Vector.Point) {
		if (this.pan.state == true) return;

		this.pan.state = true;
		this.pan.start = pos;
	}

	public panReset() {
		const { pan } = this;

		pan.state = false;
		this.engine.offset.x = pan.offset.x += pan.change.x;
		this.engine.offset.y = pan.offset.y += pan.change.y;
		pan.change.x = 0;
		pan.change.y = 0;
	}

	private handleWheel(event: WheelEvent) {
		if (this.modes.zoom != true) return;

		const zoom =
			(1.1 * this.options.pcFactor) ** (event.deltaY < 0 ? 1 : -1);

		this.factorZoom(zoom, this.engine.cursor.pos);

		event.preventDefault();
	}

	public translate(pos: Vector.Point) {
		// console.log(pos, this.pan.start)
		this.pan.change.x = pos.x - this.pan.start.x;
		this.pan.change.y = pos.y - this.pan.start.y;
		this.engine.offset.x = this.pan.offset.x + this.pan.change.x;
		this.engine.offset.y = this.pan.offset.y + this.pan.change.y;
	}

	private setZoomTrim(value: number) {
		this.engine.zoom = value;

		if (this.options.min)
			this.engine.zoom = Math.max(this.engine.zoom, this.options.min);

		if (this.options.max)
			this.engine.zoom = Math.min(this.engine.zoom, this.options.max);
	}

	public setZoom(value: number, pos: Vector.Point) {
		const last = this.engine.zoom;
		const zoom = value / last;

		if (this.modes.panning != true) return this.setZoomTrim(value), void 0;

		const { offset } = this.engine;
		const npos = pos;
		const before = screenToWorld(npos, { zoom: 1, offset });

		this.setZoomTrim(last * zoom);

		const after = screenToWorld(npos, { zoom, offset });

		this.pan.offset.x += before.x - after.x;
		this.pan.offset.y += before.y - after.y;
		this.engine.offset.x += before.x - after.x;
		this.engine.offset.y += before.y - after.y;
	}

	public factorZoom(zoom: number, pos: Vector.Point) {
		return this.setZoom(this.engine.zoom * zoom, pos);
	}
}
