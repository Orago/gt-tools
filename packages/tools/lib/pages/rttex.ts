import { newNode as node, ProxyNode } from "@orago/dom";
import { Button, GreenButton, RedButton, YellowButton } from "../ui/button";
import { Page } from "../util/page";
import { RttexEntities } from "../util/rttex";
import { Homepage } from "./home";

import { parseItemsDat } from "@orago/items-dat/main";
import { GrowtopiaItemsDat } from "@orago/items-dat/structures";
import { Emitter } from "@orago/lib";
import { Buffer } from "buffer";
import { saveAs } from "file-saver";
import { RttexEntity } from "../util/rttex";
import JSZip from "jszip";

function sanitizeFileName(name: string, extension = "txt"): string {
	let sanitized = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "");

	sanitized = sanitized.trim().replace(/\.+$/, "").replace(/\s+/g, " ");

	const max_length = 255 - extension.length - 1;
	if (sanitized.length > max_length) {
		sanitized = sanitized.substring(0, max_length);
	}

	if (sanitized.length === 0) {
		sanitized = "file";
	}

	extension = extension.replace(/[^a-zA-Z0-9]/g, "");

	return `${sanitized}.${extension}`;
}

class RttexManagement extends ProxyNode {
	static row() {
		return node.div.styles({
			display: "flex",
			justifyContent: "space-between",
			gap: "1rem",
		});
	}

	manager = new RttexEntities();

	constructor() {
		super("div");

		this.styles({
			display: "flex",
			flexDirection: "column",
			gap: "0.5rem",
		});

		const updatable_container = node.div;

		this.manager.events.on("update", () => {
			const nodes = node.div.styles({
				display: "flex",
				gap: "5px",
				flexWrap: "wrap",
			});

			updatable_container.setContent(
				node.p.text(
					`(${this.manager.entities.size}) sprites are loaded`
				),
				nodes
			);

			for (const entity of this.manager.entities) {
				new ProxyNode(entity.sprite)
					.styles({
						maxWidth: "100%",
						minWidth: "10rem",
						imageRendering: "pixelated",
						cursor: "pointer",
						background: "lime",
					})
					.on("click", () => {
						entity.saveImage();
					});

				const container = node.div
					.styles({
						background: "grey",
						borderRadius: "5px",
						padding: "5px",
						maxWidth: "600px",
						flex: "1",
						display: "flex",
						flexDirection: "column",
						gap: "5px",
					})
					.append(
						node.h3.text(entity.file.name).styles({
							color: "white",
							fontFamily: "monospace",
						}),
						entity.sprite,
						new RedButton()
							.text("Remove Sprite")
							.on("click", () => {
								this.manager.removeEntity(entity);
							})
					);

				nodes.append(container);
			}
		});

		this.setContent(
			new YellowButton().text("Back").on("click", () => {
				Page.events.emit("load", new Homepage());
			}),

			RttexManagement.row().append(
				new Button()
					.styles({
						flex: "1",
					})
					.text("Load Sprites")
					.on("click", () => {
						this.manager.requestSprites();
					}),

				new RedButton()
					.styles({
						flex: "1",
					})
					.text("Clear Sprites")
					.on("click", () => {
						this.manager.entities.clear();
						this.manager.events.emit("update");
					})
			),

			new GreenButton().text("Download All (ZIP)").on("click", () => {
				this.manager.saveAll();
			}),

			updatable_container
		);
	}
}

class ItemsDatManagement extends ProxyNode {
	static row() {
		return node.div.styles({
			display: "flex",
			justifyContent: "space-between",
			gap: "1rem",
		});
	}

	static async promiseConversion(
		file: any
	): Promise<GrowtopiaItemsDat | null> {
		return new Promise((resolve) => {
			const reader = new FileReader();

			reader.readAsArrayBuffer(file);

			reader.onload = async function () {
				resolve(
					parseItemsDat({
						buffer: Buffer.from(
							new Uint8Array(reader.result as any)
						),
					})
				);
			};

			reader.onerror = function () {
				console.log(reader.error);
				resolve(null);
			};
		});
	}

	spriteCutout(
		entity: RttexEntity,
		grid_x: number,
		grid_y: number,
		width: number,
		height: number
	) {
		this.switch = true;
		this.canvas.width = width * 32;
		this.canvas.height = height * 32;

		this.ctx.drawImage(
			entity.sprite,
			grid_x * 32,
			grid_y * 32,
			width * 32,
			height * 32,
			0,
			0,
			width * 32,
			height * 32
		);
	}

	textures: Map<string, RttexEntity> = new Map();

	events: Emitter<
		{
			update: () => void;
		},
		true
	> = new Emitter();

	dat?: GrowtopiaItemsDat;

	loaded_dom = node.div;
	content = node.div.styles({
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
	});

	canvas = document.createElement("canvas");

	ctx: CanvasRenderingContext2D = this.canvas.getContext("2d") as any;

	switch: boolean = false;

	constructor() {
		super("div");

		this.styles({
			display: "flex",
			flexDirection: "column",
			gap: "0.5rem",
		});

		this.setContent(
			new YellowButton().text("Back").on("click", () => {
				Page.events.emit("load", new Homepage());
			}),

			ItemsDatManagement.row().append(
				new Button()
					.styles({
						flex: "1",
					})
					.text("Load Items.Dat")
					.on("click", () => {
						this.handleInput();
						// this.manager.requestSprites();
					})
			),

			this.content
		);

		this.events.on("update", () => {
			if (this.dat == undefined) {
				return this.content.setContent(
					node.p.text("Failed to load items.dat!")
				);
			}

			this.content.setContent(
				new GreenButton()
					.on("click", () => this.saveAllJson())
					.text("Save As Json"),

				new GreenButton()
					.on("click", () => this.saveAllText())
					.text("Save As Text List"),
				new GreenButton()
					.on("click", () => this.exportSprites())
					.text("Ora's Zspriter"),
				node.p.text(
					`Loaded items.dat! | (${this.dat.count.toLocaleString()}) items | version ${
						this.dat.version
					}`
				)
			);
		});
	}

	handleInput() {
		const tmp = node.input.attr({ type: "file" });

		tmp.on("change", async () => {
			const files = (tmp.element as any).files;
			const file = files[0];
			const result = await ItemsDatManagement.promiseConversion(file);

			if (result != null) {
				this.dat = result;
				this.events.emit("update");
			}
		});

		(tmp.element as HTMLInputElement).click();
	}

	async saveAllJson() {
		if (this.dat == undefined) {
			return;
		}
		const content = JSON.stringify(this.dat, null, 2);

		saveAs(
			new Blob([content], { type: "text/plain;charset=utf-8" }),
			"items.json"
		);
	}

	async saveAllText() {
		if (this.dat == undefined) {
			return;
		}
		const items = Object.entries(this.dat.items)
			.map((e) => {
				const g = Object.entries(e[1])
					.map((e) => `\n--- ${e[0]}: ${e[1] ?? null}`)
					.join("");

				return `\n-- ${e[0]}${g}\n\n`;
			})
			.join("");

		const content = `- Version: ${this.dat.version}\n\n- Count: ${this.dat.count}\n\n- Items: ${items}`;

		saveAs(
			new Blob([content], { type: "text/plain;charset=utf-8" }),
			"items.txt"
		);
	}

	async exportSprites() {
		if (this.dat == undefined) {
			return;
		}

		const zip = new JSZip();

		for (const item of Object.values(this.dat.items)) {
			this.switch = false;
			const obtained = this.textures.get(item.texture_name);

			if (
				obtained == undefined ||
				item.item_kind != 0 ||
				item.seed_color != -1
			) {
				continue;
			}

			const spr_name = sanitizeFileName(item.name, "png");

			if (item.spread_type == 1) {
				this.spriteCutout(
					obtained,
					item.texture_x,
					item.texture_y,
					1,
					1
				);
			} else if (item.spread_type == 2) {
				this.spriteCutout(
					obtained,
					item.texture_x,
					item.texture_y,
					8,
					6
				);
				this.ctx.clearRect(256 - 32, 192 - 32, 32, 32);
			} else if (item.spread_type == 3) {
				this.spriteCutout(
					obtained,
					item.texture_x,
					item.texture_y,
					4,
					1
				);
			} else if (item.spread_type == 4) {
				this.spriteCutout(
					obtained,
					item.texture_x,
					item.texture_y,
					5,
					1
				);
			}

			if (this.switch) {
				zip.file(
					spr_name,
					await new Promise((resolve) => {
						this.canvas.toBlob(function (blob) {
							resolve(blob as any);
							return blob;
						}, "image/png");
					})
				);
			}
		}

		zip.generateAsync({ type: "blob" }).then(function (content) {
			// see FileSaver.js
			console.log("saving?");
			saveAs(content, "rttex_sprites.zip");
		});
	}
}

export class RttexPage extends Page {
	rttex = new RttexManagement();
	dat = new ItemsDatManagement();

	constructor() {
		super();

		this.styles({
			display: "flex",
			flexDirection: "column",
			gap: "0.5rem",
		});

		this.rttex.manager.events.on("update", () => {
			this.dat.textures.clear();
			for (const entity of this.rttex.manager.entities) {
				this.dat.textures.set(entity.file.name, entity);
			}
		});

		this.append(this.dat, node.hr.styles({ width: "100%" }), this.rttex);
	}
}
