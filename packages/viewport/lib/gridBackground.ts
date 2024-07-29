import Engine from "@orago/game/engine";

interface gridBgOptions {
	size: number;
	gridColor?: string;
	gridColorV?: string;
	gridBackground?: string;
	offset: {
		x: number;
		y: number;
	}
}

export function drawGridBackground(engine: Engine, options: gridBgOptions) {
	const { brush } = engine;
	const { ctx } = engine.brush;

	options.gridColor ??= 'grey';
	options.gridColorV ??= options.gridColor;
	options.gridBackground ??= 'silver';

	const space = options.size;
	// top is the position where the first line should be drawn (it's this part that gives the scrolling illusion)
	// left is the position where the first line should be drawn
	const top = (options.offset.y % space);
	const left = (options.offset.x % space); // - space is used only to reverse the direction of the lines

	// clear the canvas
	ctx.clearRect(0, 0, brush.width, brush.height);
	ctx.fillStyle = options.gridBackground;
	ctx.fillRect(0, 0, brush.width, brush.height);

	// draw the 1px grid lines on the x axis
	for (let i = top; i < brush.height; i += space) {
		ctx.beginPath();
		ctx.moveTo(0, i);
		ctx.lineTo(brush.width, i);
		ctx.strokeStyle = options.gridColor;
		ctx.stroke();
	}

	// draw the 1px grid lines on the y axis
	for (let i = left; i < brush.width; i += space) {
		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i, brush.height);
		ctx.strokeStyle = options.gridColorV;
		ctx.stroke();
	}
}