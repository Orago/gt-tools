import BrushCanvas from '@orago/game/brush';
import Engine from '@orago/game/engine';

export const brush = new BrushCanvas().resizable();
export const engine = new Engine(brush);

document.body.append(engine.dom.element);