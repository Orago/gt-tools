import Engine, { EngineObject } from '@orago/game/engine';

import { newNode as node } from '@orago/dom';
// import { convertt } from '../convert';
import { rttexToImage } from '@gt/rttex-browser/main';
import { body } from '../dom';

export class RttexEntityGenerator extends EngineObject {
	static async promiseConversion(file: any): Promise<HTMLCanvasElement | null> {
		return new Promise(resolve => {
			const reader = new FileReader();

			reader.readAsArrayBuffer(file);

			reader.onload = async function () {
				resolve(
					rttexToImage(new Uint8Array(reader.result as any))
				);
			};

			reader.onerror = function () {
				console.log(reader.error);
				resolve(null);
			};
		});
	}

	images: (HTMLImageElement | HTMLCanvasElement)[] = [];


	constructor(engine: Engine) {
		super(engine);

		this.width = 32;
		this.height = 32;

		engine.keyboard.events.on('key-k', () => this.popup());

		this.events.on('render', () => {
			let y = 0;

			for (const img of this.images) {

				engine.brush.chainable
					.pos(engine.offset.x, engine.offset.y + y)
					.size(img.width * engine.zoom, img.height * engine.zoom)
					.image(img);

				y += img.height * engine.zoom;
			}
		})
	}

	popup() {
		const tmp = node.input
			.attr({ type: 'file', multiple: 'multiple' })
			.appendTo(body);

		tmp.on('change', () => this.handleFiles((tmp.element as any).files));

		(tmp.element as HTMLInputElement).click();
	}

	async handleFiles(files: any) {
		for (const file of files) {
			const result = await RttexEntityGenerator.promiseConversion(file);

			if (result != null)
				this.images.push(result);
		}
	}
}