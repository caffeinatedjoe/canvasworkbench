// Camera variables
let offsetX = 0;
let offsetY = 0;
let scale = 1;

// Get elements
const viewport = document.getElementById('viewport');
const rasterLayer = document.getElementById('rasterLayer');
const vectorLayer = document.getElementById('vectorLayer');
const world = document.getElementById('world');

// Element manager
const elementManager = new ElementManager();

// ID counter for elements
let elementIdCounter = 0;

// Canvas context
const ctx = rasterLayer.getContext('2d');

// Set canvas size
rasterLayer.width = viewport.clientWidth;
rasterLayer.height = viewport.clientHeight;

// Function to apply camera transform
function updateTransforms() {
    // SVG transform
    world.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scale})`);

    // Canvas transform
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    // Clear and redraw canvas (for now, just clear since no content)
    ctx.clearRect(-offsetX / scale, -offsetY / scale, viewport.clientWidth / scale, viewport.clientHeight / scale);
}

// Initial transform
updateTransforms();

// Keep raster layer sized to viewport
window.addEventListener('resize', () => {
    rasterLayer.width = viewport.clientWidth;
    rasterLayer.height = viewport.clientHeight;
    updateTransforms();
});

// Panning variables
let isPanning = false;
let lastX, lastY;

// Dragging variables
let isDragging = false;
let dragStartWorldX, dragStartWorldY;
let dragOccurred = false;

// Scaling variables
let isScaling = false;
let scaleCorner;
let scaleOppositeCorner;
let initialDistance;
let initialScales = [];

// Panning: middle-click drag, Dragging: left-click on selected elements, Scaling: left-click on scale handles
viewport.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // left click
        const worldPos = clientToWorld(e.clientX, e.clientY);
        dragStartWorldX = worldPos.x;
        dragStartWorldY = worldPos.y;
        // Check if clicked on a scale handle
        if (e.target.dataset && e.target.dataset.handleType === 'scale') {
            isScaling = true;
            scaleCorner = e.target.dataset.corner;
            const bbox = elementManager.selectedElements.length === 1 ?
                elementManager.selectedElements[0].getBoundingBox() :
                elementManager.calculateBoundingBox();
            scaleOppositeCorner = getOppositeCorner(scaleCorner, bbox);
            initialDistance = distance(worldPos, scaleOppositeCorner);
            initialScales = elementManager.selectedElements.map(el => el.scale);
            e.preventDefault();
            return;
        }
        // Check if clicked on a selected element
        let clickedElement = null;
        for (const element of elementManager.elements) {
            if (e.target === element.svgElement || element.svgElement.contains(e.target)) {
                clickedElement = element;
                break;
            }
        }
        if (clickedElement && elementManager.selectedElements.includes(clickedElement)) {
            isDragging = true;
            dragOccurred = false;
            e.preventDefault();
        }
    } else if (e.button === 1) { // middle click
        e.preventDefault();
        menu.close();
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

viewport.addEventListener('mousemove', (e) => {
    if (isScaling) {
        const currentWorld = clientToWorld(e.clientX, e.clientY);
        const currentDistance = distance(currentWorld, scaleOppositeCorner);
        const factor = currentDistance / initialDistance;
        elementManager.selectedElements.forEach((element, i) => {
            element.scale = initialScales[i] * factor;
            element.updateSvgScale(scaleOppositeCorner);
        });
        elementManager.updateHandles();
        e.preventDefault();
    } else if (isDragging) {
        const currentWorld = clientToWorld(e.clientX, e.clientY);
        const deltaX = currentWorld.x - dragStartWorldX;
        const deltaY = currentWorld.y - dragStartWorldY;
        elementManager.selectedElements.forEach(element => {
            element.move(deltaX, deltaY);
        });
        dragStartWorldX = currentWorld.x;
        dragStartWorldY = currentWorld.y;
        dragOccurred = true;
        elementManager.updateHandles();
        e.preventDefault();
    } else if (isPanning) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        offsetX += dx;
        offsetY += dy;
        updateTransforms();
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

viewport.addEventListener('mouseup', () => {
    if (isScaling) {
        isScaling = false;
        elementManager.updateHandles();
    }
    if (isDragging) {
        isDragging = false;
        elementManager.updateHandles();
    }
    isPanning = false;
});

// --- Radial Menu Module Integration ---

const SVG_NS = 'http://www.w3.org/2000/svg';

let lastContextWorldX = 0;
let lastContextWorldY = 0;

function clientToWorld(clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    return {
        x: (px - offsetX) / scale,
        y: (py - offsetY) / scale,
    };
}

function getOppositeCorner(corner, bbox) {
    switch (corner) {
        case 'top-left': return { x: bbox.x + bbox.width, y: bbox.y + bbox.height };
        case 'top-right': return { x: bbox.x, y: bbox.y + bbox.height };
        case 'bottom-right': return { x: bbox.x, y: bbox.y };
        case 'bottom-left': return { x: bbox.x + bbox.width, y: bbox.y };
        case 'top': return { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height };
        case 'right': return { x: bbox.x, y: bbox.y + bbox.height / 2 };
        case 'bottom': return { x: bbox.x + bbox.width / 2, y: bbox.y };
        case 'left': return { x: bbox.x + bbox.width, y: bbox.y + bbox.height / 2 };
    }
}

function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function createSvgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, String(v));
    }
    return el;
}

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
    const text = createSvgEl('text', {
        x,
        y,
        fill: 'rgba(0, 0, 0, 0.8)',
        'font-size': 18,
        'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    });
    text.textContent = 'Text';
    world.appendChild(text);
}

// Define icons
const icons = {
  circle: { path: 'M 0 0 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0', size: 50, color: 'rgba(0,0,0,0.8)' },
  line: { path: 'M -5 -5 l 10 10', size: 50, color: 'rgba(0,0,0,0.8)' },
  rectangle: { path: 'M -8 -5 h 16 v 10 h -16 z', size: 40, color: 'rgba(0,0,0,0.8)' },
  cursor: { path: 'm 1.872 9.6 l 3.656 -1.48 l -2.736 -6.752 l 4.448 0.08 L -3.76 -9.6 l -0.24 15.592 l 3.144 -3.144 Z', size: 35, color: 'rgba(0,0,0,0.8)' }
};

// Create radial menu instance
const menu = new RadialMenu({
    innerDiameter: 70,
    outerDiameter: 170,
    sections: [
        { id: 'circle', icon: icons.circle, action: () => addCircleAt(lastContextWorldX, lastContextWorldY) },
        { id: 'rectangle', icon: icons.rectangle, action: () => addRectAt(lastContextWorldX, lastContextWorldY) },
        { id: 'line', icon: icons.line, action: () => addLineAt(lastContextWorldX, lastContextWorldY) },
        { id: 'cursor', icon: icons.cursor, action: () => addTextAt(lastContextWorldX, lastContextWorldY) }
    ],
    container: document.body
});

// Prevent default context menu and show custom menu.
viewport.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    // Only open when right-clicking inside viewport.
    const { x, y } = clientToWorld(e.clientX, e.clientY);
    lastContextWorldX = x;
    lastContextWorldY = y;
    menu.openAt(e.clientX, e.clientY);
});

// Zooming: mouse wheel
viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    menu.close();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = viewport.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const worldX = (px - offsetX) / scale;
    const worldY = (py - offsetY) / scale;
    scale *= zoomFactor;
    offsetX = px - worldX * scale;
    offsetY = py - worldY * scale;
    updateTransforms();
});

// Element selection: left-click
vectorLayer.addEventListener('click', (e) => {
    if (dragOccurred) {
        dragOccurred = false;
        return;
    }
    let isElementClicked = false;
    for (const element of elementManager.elements) {
        if (e.target === element.svgElement || element.svgElement.contains(e.target)) {
            isElementClicked = true;
            break;
        }
    }
    if (isElementClicked) {
        e.preventDefault();
    }
    elementManager.handleClick(e, e.shiftKey);
});
