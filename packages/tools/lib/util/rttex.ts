import Engine, { EngineObject, Entity } from "@orago/game/engine";
import { newNode as node } from "@orago/dom";
import { Collision } from "@orago/game/collision";
import { Position2D } from "@orago/vector";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { rttexToImage } from "@orago/rttex/rttexToImage";
import { body } from "../dom";
import Emitter from "@orago/lib/emitter";

export class RttexEntity {
	static convertRttexToCanvas(file: File): Promise<HTMLCanvasElement | null> {
		return new Promise((resolve) => {
			const reader = new FileReader();

			reader.readAsArrayBuffer(file);

			reader.onload = async function () {
				resolve(rttexToImage(new Uint8Array(reader.result as any)));
			};

			reader.onerror = function () {
				console.log(reader.error);
				resolve(null);
			};
		});
	}

	file: File;
	sprite: HTMLCanvasElement;

	constructor(file: RttexEntity["file"], image: RttexEntity["sprite"]) {
		this.file = file;
		this.sprite = image;
	}

	saveImage() {
		const a = document.createElement("a");
		const url = this.sprite.toDataURL("image/png", 1);

		a.style.visibility = "hidden";
		document.body.appendChild(a);
		a.href = url;
		a.download = this.getPngName();
		a.click();
		a.remove();
	}

	getPngName() {
		return this.file.name.split(".")[0] + ".png";
	}
}

export class RttexEntities {
	events: Emitter<
		{
			update: () => void;
		},
		true
	> = new Emitter();

	entities: Set<RttexEntity> = new Set();

	constructor() {}

	removeEntity(entity: RttexEntity) {
		this.entities.delete(entity);
		this.events.emit("update");
	}

	async handleFiles(files: File[]) {
		// const start_count = this.entities.size;

		for (const file of files) {
			const result = await RttexEntity.convertRttexToCanvas(file);

			if (result != null) {
				this.entities.add(new RttexEntity(file, result));
				this.events.emit("update");
			}
		}

		// if (this.entities.size != start_count) {
		// 	this.events.emit("update");
		// }
	}

	requestSprites() {
		const tmp = node.input.attr({ type: "file", multiple: "multiple" });

		tmp.on("change", () => {
			const files = (tmp.element as any).files;
			tmp.remove();
			this.handleFiles(files);
		});

		(tmp.element as HTMLInputElement).click();
	}

	async saveAll() {
		const zip = new JSZip();

		for (const entity of this.entities) {
			zip.file(
				entity.getPngName(),
				await new Promise((resolve) => {
					// @ts-ignore
					entity.sprite.toBlob(function (blob) {
						resolve(blob as any);
						return blob;
					}, "image/png");
				})
			);
		}

		zip.generateAsync({ type: "blob" }).then(function (content) {
			// see FileSaver.js
			saveAs(content, "rttex_sprites.zip");
		});
	}
}
