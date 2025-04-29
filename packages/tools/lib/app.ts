import "./css/main.css";
import { body, loadPage } from "./dom";
import { Homepage } from "./pages/home";
import { RttexPage } from "./pages/rttex";
import { Page } from "./util/page";

body.append("wao");

Page.events.on("load", (page) => {
	loadPage(page);
});

Page.events.emit("load", new RttexPage());