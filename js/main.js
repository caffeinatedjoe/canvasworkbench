import Camera from './core/camera.js';
import CircleElement from './elements/CircleElement.js';
import RectangleElement from './elements/RectangleElement.js';
import LineElement from './elements/LineElement.js';
import TextElement from './elements/TextElement.js';
import NodeElement from './elements/NodeElement.js';
import ElementManager from './managers/ElementManager.js';
import RadialMenu from './ui/RadialMenu.js';
import PanningController from './controllers/PanningController.js';
import TransformController from './controllers/TransformController.js';
import MenuController from './controllers/MenuController.js';
import SelectionController from './controllers/SelectionController.js';
import ZoomController from './controllers/ZoomController.js';
import MarqueeSelectionController from './controllers/MarqueeSelectionController.js';
import NodeConnectionController from './controllers/NodeConnectionController.js';

const viewport = document.getElementById('viewport');
const rasterLayer = document.getElementById('rasterLayer');
const vectorLayer = document.getElementById('vectorLayer');
const world = document.getElementById('world');

const camera = new Camera({ viewport, rasterLayer, world });
const elementManager = new ElementManager();
const interactionState = { dragOccurred: false };
let elementIdCounter = 0;
let lastCursorWorld = { x: 0, y: 0 };

window.addEventListener('resize', () => camera.resize());
viewport.addEventListener('mousemove', (e) => {
    lastCursorWorld = camera.clientToWorld(e.clientX, e.clientY);
});

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

function addNodeAt(x, y) {
    const id = `node_${elementIdCounter++}`;
    const nodeElement = new NodeElement(id, x - 70, y - 40, 140, 80, world, {
        inputCount: 2,
        outputCount: 2
    });
    nodeElement.render();
    elementManager.addElement(nodeElement);
}

function createElementFromDescriptor(descriptor) {
    const id = `${descriptor.type}_${elementIdCounter++}`;

    if (descriptor.type === 'circle') {
        const circleElement = new CircleElement(id, descriptor.position.x, descriptor.position.y, descriptor.r, world);
        circleElement.render();
        circleElement.scale = descriptor.scale;
        circleElement.rotation = descriptor.rotation;
        circleElement.updateSvgScale();
        return circleElement;
    }

    if (descriptor.type === 'rectangle') {
        const x = descriptor.position.x - descriptor.width / 2;
        const y = descriptor.position.y - descriptor.height / 2;
        const rectElement = new RectangleElement(id, x, y, descriptor.width, descriptor.height, world);
        rectElement.render();
        rectElement.scale = descriptor.scale;
        rectElement.rotation = descriptor.rotation;
        rectElement.updateSvgScale();
        return rectElement;
    }

    if (descriptor.type === 'line') {
        const lineElement = new LineElement(
            id,
            descriptor.x1,
            descriptor.y1,
            descriptor.x2,
            descriptor.y2,
            world
        );
        lineElement.render();
        lineElement.scale = descriptor.scale;
        lineElement.rotation = descriptor.rotation;
        return lineElement;
    }

    if (descriptor.type === 'text') {
        const textElement = new TextElement(
            id,
            descriptor.position.x,
            descriptor.position.y,
            descriptor.text,
            world,
            {
                fontSize: descriptor.baseFontSize,
                fontFamily: descriptor.fontFamily,
                fill: descriptor.fill
            }
        );
        textElement.render();
        textElement.scale = descriptor.scale;
        textElement.rotation = descriptor.rotation;
        textElement.updateSvgScale();
        return textElement;
    }

    if (descriptor.type === 'node') {
        const x = descriptor.position.x - descriptor.width / 2;
        const y = descriptor.position.y - descriptor.height / 2;
        const nodeElement = new NodeElement(id, x, y, descriptor.width, descriptor.height, world, {
            inputCount: descriptor.inputCount,
            outputCount: descriptor.outputCount,
            cornerRadius: descriptor.cornerRadius
        });
        nodeElement.render();
        nodeElement.scale = descriptor.scale;
        nodeElement.rotation = descriptor.rotation;
        nodeElement.updateSvgScale();
        return nodeElement;
    }

    return null;
}

const icons = {
    circle: { path: 'M 0 0 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0', size: 50, color: 'rgba(0,0,0,0.8)' },
    line: { path: 'M -5 -5 l 10 10', size: 50, color: 'rgba(0,0,0,0.8)' },
    rectangle: { path: 'M -8 -5 h 16 v 10 h -16 z', size: 40, color: 'rgba(0,0,0,0.8)' },
    node: { path: 'M -9 -6 h 18 a 4 4 0 0 1 4 4 v 4 a 4 4 0 0 1 -4 4 h -18 a 4 4 0 0 1 -4 -4 v -4 a 4 4 0 0 1 4 -4 Z', size: 40, color: 'rgba(0,0,0,0.8)' },
    cursor: { path: 'm 1.872 9.6 l 3.656 -1.48 l -2.736 -6.752 l 4.448 0.08 L -3.76 -9.6 l -0.24 15.592 l 3.144 -3.144 Z', size: 35, color: 'rgba(0,0,0,0.8)' }
};

const contextState = { x: 0, y: 0 };

const menu = new RadialMenu({
    innerDiameter: 70,
    outerDiameter: 170,
    sections: [
        { id: 'circle', icon: icons.circle, action: () => addCircleAt(contextState.x, contextState.y) },
        { id: 'rectangle', icon: icons.rectangle, action: () => addRectAt(contextState.x, contextState.y) },
        { id: 'node', icon: icons.node, action: () => addNodeAt(contextState.x, contextState.y) },
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
new NodeConnectionController({ viewport, world, camera, elementManager });

document.addEventListener('keydown', (e) => elementManager.handleKeyDown(e, {
    createElementFromDescriptor,
    cursorWorld: lastCursorWorld
}));
