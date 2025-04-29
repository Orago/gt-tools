import { Emitter } from "@orago/lib";
import { newNode as node, ProxyNode } from "@orago/dom";
import { Button, GreenButton, RedButton, YellowButton } from "../ui/button";
import { Page } from "../util/page";
import { Homepage } from "./home";
import { RttexEntities, RttexEntity } from "../util/rttex";
import { GrowtopiaItemsDat } from "@orago/items-dat/structures";
import { parseItemsDat } from "@orago/items-dat/main";
import { saveAs } from "file-saver";
import { Buffer } from "buffer";

export class ItemsDatPage extends Page {
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

	constructor() {
		super();

		this.styles({
			display: "flex",
			flexDirection: "column",
			gap: "0.5rem",
		});

		this.setContent(
			new YellowButton().text("Back").on("click", () => {
				Page.events.emit("load", new Homepage());
			}),

			ItemsDatPage.row().append(
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
			const result = await ItemsDatPage.promiseConversion(file);

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

		for (const item of Object.values(this.dat.items)) {
			const obtained = this.textures.get(item.texture_name);

			if (obtained == undefined) {
				continue;
			}

			if (item.spread_type == 2) {
				const canvas = document.createElement("canvas");
				canvas.width = 256;
				canvas.height = 192;

				const ctx: CanvasRenderingContext2D = canvas.getContext(
					"2d"
				) as any;

				ctx.drawImage(
					obtained.sprite,
					item.texture_x * 32,
					item.texture_y * 32,
					256,
					192
				);
			}
		}
	}
}
