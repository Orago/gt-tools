import Engine from '@orago/game/engine';
import { brush, engine } from '../renderer';
import { Scene } from '../util/scene';
import { drawGridBackground } from '../gridBackground';
import { baseTileSize } from '../util/tiles';
import { PanAndZoomHandler } from '../entities/panning';
import { newNode as node, ProxyNode } from '@orago/dom';
import { body } from '../dom';
import { parseItemsDat } from '@orago/items-dat/main';
import { Buffer } from 'buffer';
import { GrowtopiaItem, GrowtopiaItemsDat } from '@orago/items-dat/structures';
import { Vector2Map } from '@orago/vector';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


export class ItemsDatScene extends Scene {
	static async promiseConversion(file: any): Promise<GrowtopiaItemsDat | null> {
		return new Promise(resolve => {
			const reader = new FileReader();

			reader.readAsArrayBuffer(file);

			reader.onload = async function () {
				resolve(
					parseItemsDat({
						buffer: Buffer.from(
							new Uint8Array(reader.result as any)
						)
					})
				);
			};

			reader.onerror = function () {
				console.log(reader.error);
				resolve(null);
			};
		});
	}

	indexedItems: Vector2Map<GrowtopiaItem>;
	dat: GrowtopiaItemsDat;
	loadedDom = node.div;

	constructor(engine: Engine) {
		super(engine);

		this.priority = 0;

		this.addTo();
		this.loadDom();

		engine.keyboard.init();

		new PanAndZoomHandler(engine)
			.addTo()
			.toggleModes(true, ['zoom', 'panning']);

		const chain = brush.chainable;

		this.events.on('render', () => {
			brush.clear();

			drawGridBackground(engine, {
				size: baseTileSize * engine.zoom,
				offset: engine.offset,
				gridColor: 'goldenrod',
				gridBackground: 'wheat',
			});

			const hoff = 50 * engine.zoom;
			const x = engine.offset.x + 50 * engine.zoom

			chain
				.generatedFont({
					size: 30 * engine.zoom
				})
				.color('red')
				.pos(
					x,
					engine.offset.y + hoff * 1,
				)
				.text(`Loaded items ${this.dat?.count ?? 0}`)
				.pos(
					x,
					engine.offset.y + hoff * 2,
				)
				.text(`Items.Dat Version ${this.dat?.version ?? 'unloaded'}`)

		});
	}

	loadDom() {
		const page = this.loadedDom
			.styles({
				position: 'fixed',
				display: 'flex',
				flexDirection: 'column',
				top: 0,
				left: 0,
				padding: '5px',
				alignItems: 'baseline'
			})
			.append(
				node.p.text('Click load items.dat to load items'),
				node.button
					.on('click', () => this.loadItems())
					.text('Load Items')
			);

		body.append(page);

		this.events.on('remove', () => page.remove());
	}

	loadItems() {
		const tmp = node.input
			.attr({ type: 'file' })
			.appendTo(body);

		tmp.on('change', async () => {
			const files = (tmp.element as any).files;
			const file = files[0];
			const result = await ItemsDatScene.promiseConversion(file);

			if (result != null) {
				this.dat = result;

				this.loadedDom.setContent(
					node.button
						.on('click', () => this.saveAllJson())
						.text('Save As Json'),

					node.button
						.on('click', () => this.saveAllText())
						.text('Save As Text List')
				);
			}
		});

		(tmp.element as HTMLInputElement).click();
	}

	async saveAllJson() {
		const content = JSON.stringify(this.dat, null, 2);

		saveAs(
			new Blob([content], { type: 'text/plain;charset=utf-8' }),
			'items.json'
		);
	}

	async saveAllText() {
		const items = Object
			.entries(this.dat.items)
			.map(e => {
				const g = Object
					.entries(e[1])
					.map(e => `\n--- ${e[0]}: ${e[1] ?? null}`)
					.join('');

				return `\n-- ${e[0]}${g}\n\n`
			})
			.join('');

		const content = `- Version: ${this.dat.version}\n\n- Count: ${this.dat.count}\n\n- Items: ${items}`;

		saveAs(
			new Blob([content], { type: 'text/plain;charset=utf-8' }),
			'items.txt'
		);
	}
}