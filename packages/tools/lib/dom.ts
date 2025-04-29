import { ProxyNode, qs } from "@orago/dom";
import { Page } from "./util/page";

export const body: ProxyNode = qs("body") as ProxyNode;

export function loadPage(page: Page) {
	body.setContent(page);
}
