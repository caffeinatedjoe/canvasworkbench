import Camera from './core/camera.js';
import CircleElement from './elements/CircleElement.js';
import RectangleElement from './elements/RectangleElement.js';
import LineElement from './elements/LineElement.js';
import TextElement from './elements/TextElement.js';
import ElementManager from './managers/ElementManager.js';
import RadialMenu from './ui/RadialMenu.js';
import PanningController from './controllers/PanningController.js';
import TransformController from './controllers/TransformController.js';
import MenuController from './controllers/MenuController.js';
import SelectionController from './controllers/SelectionController.js';
import ZoomController from './controllers/ZoomController.js';
import MarqueeSelectionController from './controllers/MarqueeSelectionController.js';

const viewport = document.getElementById('viewport');
const rasterLayer = document.getElementById('rasterLayer');
const vectorLayer = document.getElementById('vectorLayer');
const world = document.getElementById('world');

const camera = new Camera({ viewport, rasterLayer, world });
const elementManager = new ElementManager();
const interactionState = { dragOccurred: false };
let elementIdCounter = 0;

window.addEventListener('resize', () => camera.resize());

function addCircleAt(x, y) {
    const id = `circle_${elementIdCounter++}`;
    const circleElement = new CircleElement(id, x, y, 30, world);
    circleElement.render();
    elementManager.addElement(circleElement);
}

function addRectAt(x, y) {
    const id = `rect_${elementIdCounter++}`;
    const rectElement = new RectangleElement(id, x - 50, y - 25, 100, 50, world);
    rectElement.render();
    elementManager.addElement(rectElement);
}

function addLineAt(x, y) {
    const id = `line_${elementIdCounter++}`;
    const lineElement = new LineElement(id, x - 60, y - 20, x + 60, y + 20, world);
    lineElement.render();
    elementManager.addElement(lineElement);
}

function addTextAt(x, y) {
    const id = `text_${elementIdCounter++}`;
    const textElement = new TextElement(id, x, y, 'Text', world);
    textElement.render();
    elementManager.addElement(textElement);
}

const icons = {
    circle: { path: 'M 0 0 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0', size: 50, color: 'rgba(0,0,0,0.8)' },
    line: { path: 'M -5 -5 l 10 10', size: 50, color: 'rgba(0,0,0,0.8)' },
    rectangle: { path: 'M -8 -5 h 16 v 10 h -16 z', size: 40, color: 'rgba(0,0,0,0.8)' },
    cursor: { path: 'm 1.872 9.6 l 3.656 -1.48 l -2.736 -6.752 l 4.448 0.08 L -3.76 -9.6 l -0.24 15.592 l 3.144 -3.144 Z', size: 35, color: 'rgba(0,0,0,0.8)' }
};

const contextState = { x: 0, y: 0 };

const menu = new RadialMenu({
    innerDiameter: 70,
    outerDiameter: 170,
    sections: [
        { id: 'circle', icon: icons.circle, action: () => addCircleAt(contextState.x, contextState.y) },
        { id: 'rectangle', icon: icons.rectangle, action: () => addRectAt(contextState.x, contextState.y) },
        { id: 'line', icon: icons.line, action: () => addLineAt(contextState.x, contextState.y) }//,
        //{ id: 'cursor', icon: icons.cursor, action: () => addTextAt(contextState.x, contextState.y) }
    ],
    container: document.body
});

new PanningController({ viewport, camera, menu });
new TransformController({ viewport, elementManager, camera, menu, interactionState });
new MenuController({
    viewport,
    camera,
    menu,
    onContext: (world) => {
        contextState.x = world.x;
        contextState.y = world.y;
    }
});
new SelectionController({ vectorLayer, elementManager, interactionState });
new MarqueeSelectionController({ viewport, world, elementManager, camera, interactionState });
new ZoomController({ viewport, camera, menu });

document.addEventListener('keydown', (e) => elementManager.handleKeyDown(e));
