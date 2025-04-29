import { Button, GreenButton } from "../ui/button";
import { Page } from "../util/page";
import { ItemsDatPage } from "./items_dat";
import { RttexPage } from "./rttex";

export class Homepage extends Page {
	constructor() {
		super();

		this.styles({
			display: "flex",
			flexDirection: "column",
			gap: "0.5rem",
		});

		this.setContent(
			new GreenButton()
				.text("Open RTTEX parser")
				.styles({
					flex: "1",
				})
				.on("click", () => {
					Page.events.emit("load", new RttexPage());
				}),
			new GreenButton()
				.text("Open Items.Dat parser")
				.styles({
					flex: "1",
				})
				.on("click", () => {
					Page.events.emit("load", new ItemsDatPage());
				})
		);
	}
}
