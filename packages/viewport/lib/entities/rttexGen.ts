import Engine, { EngineObject } from '@orago/game/engine';
import { newNode as node } from '@orago/dom';
import { rttexToImage } from '@orago/rttex/main';
import { body } from '../dom';
import { Collision } from '@orago/game/collision';
import { Position2D } from '@orago/vector';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

class RttexSprite {
	file: File;
	sprite: HTMLCanvasElement;

	render: {
		x: 0;
		y: 0;
	} = {
			x: 0,
			y: 0
		};

	constructor(file: File, sprite: HTMLCanvasElement) {
		this.file = file;
		this.sprite = sprite;
	}
}

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

	rttexList: RttexSprite[] = [];

	constructor(engine: Engine, clickToDownload: boolean = false) {
		super(engine);

		this.width = 32;
		this.height = 32;

		engine.keyboard.events.on('key-k', () => this.popup());

		if (clickToDownload) {
			engine.cursor.events
				.on('click', () => {
					let y = 0;

					for (const ent of this.rttexList) {
						const { sprite } = ent;
						const box = {
							x: engine.offset.x,
							y: engine.offset.y + y,
							width: sprite.width * engine.zoom,
							height: sprite.height * engine.zoom
						}

						if (Collision.rectContains(box, { x: engine.cursor.pos.x, y: engine.cursor.pos.y, width: 1, height: 1 })) {
							this.saveCanvas(sprite);
							break;
						}
					}
				});

			engine.cursor.events
				.on('context', () => {
					let y = 0;
					let i = 0;

					for (const { sprite } of this.rttexList) {
						const box = {
							x: engine.offset.x,
							y: engine.offset.y + y,
							width: sprite.width * engine.zoom,
							height: sprite.height * engine.zoom
						}

						y += sprite.height * engine.zoom;

						if (Collision.rectContains(box, { x: engine.cursor.pos.x, y: engine.cursor.pos.y, width: 1, height: 1 })) {
							this.rttexList.splice(i, 1);
							break;
						}

						i++;
					}
				});
		}

		this.events.on('render', () => {
			let y = 0;

			for (const { sprite } of this.rttexList) {
				engine.brush.chainable
					.pos(engine.offset.x, engine.offset.y + y)
					.size(sprite.width * engine.zoom, sprite.height * engine.zoom)
					.image(sprite);

				y += sprite.height * engine.zoom;
			}
		})
	}

	rttexAt(pos: Position2D) {

	}

	popup() {
		const tmp = node.input
			.attr({ type: 'file', multiple: 'multiple' })
			.appendTo(body);

		tmp.on('change', () => this.handleFiles((tmp.element as any).files));

		(tmp.element as HTMLInputElement).click();
	}

	async handleFiles(files: File[]) {
		for (const file of files) {
			const result = await RttexEntityGenerator.promiseConversion(file);

			if (result != null)
				this.rttexList.push(
					new RttexSprite(
						file,
						result
					)
				);
		}
	}

	saveCanvas(instance: HTMLCanvasElement) {
		const a = document.createElement('a');
		const url = instance.toDataURL('image/png', 1);

		a.style.visibility = "hidden";
		document.body.appendChild(a);
		a.href = url
		a.download = 'rttex'.split(".")[0] + ".png";
		a.click();
		a.remove();
	}

	async saveall() {
		const zip = new JSZip();

		for (const e of this.rttexList) {
			zip.file(
				e.file.name.replace('.rttex', '.png'),
				await new Promise(resolve => {
					// @ts-ignore
					e.sprite.toBlob(function (blob) { resolve(blob); return blob; }, 'image/png');
				})
			);
		}

		zip.generateAsync({ type: "blob" }).then(function (content) {
			// see FileSaver.js
			saveAs(content, "example.zip");
		});
	}
}