import { Emitter } from "@orago/lib";
import { ProxyNode } from "@orago/dom";

export class Page extends ProxyNode {
	public static readonly events: Emitter<
		{
			load: (page: Page) => void;
		},
		true
	> = new Emitter();

	constructor() {
		super("div");

		this.styles({
			padding: "5px",
			height: "100%",
		});
	}
}
