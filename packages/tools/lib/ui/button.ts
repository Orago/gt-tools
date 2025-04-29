import { ProxyNode } from "@orago/dom";

export class Button extends ProxyNode {
	constructor() {
		super("div");

		this.class("gt-button");

		this.styles({
			// width: "fit-content",
			backgroundColor: "#a5e3fb",
		});
	}
}

export class GreenButton extends Button {
	constructor() {
		super();
		this.styles({
			backgroundColor: "#14ae5c",
		});
	}
}

export class RedButton extends Button {
	constructor() {
		super();
		this.styles({
			backgroundColor: "#f12727",
		});
	}
}
export class YellowButton extends Button {
	constructor() {
		super();
		this.styles({
			backgroundColor: "#fdcc04",
		});
	}
}
