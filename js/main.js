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
let initialGroupStates = [];
let isRotating = false;
let rotateCenter;
let rotateStartAngle = 0;
let initialRotationStates = [];
let initialGroupRotation = 0;

// Panning: middle-click drag, Dragging: left-click on selected elements, Scaling: left-click on scale handles
viewport.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // left click
        const worldPos = clientToWorld(e.clientX, e.clientY);
        dragStartWorldX = worldPos.x;
        dragStartWorldY = worldPos.y;
        // Check if clicked on a scale handle
        if (e.target.dataset && e.target.dataset.handleType === 'rotate') {
            isRotating = true;
            const bbox = elementManager.selectedElements.length === 1 ?
                elementManager.selectedElements[0].getBoundingBox() :
                elementManager.calculateBoundingBox();
            rotateCenter = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
            rotateStartAngle = Math.atan2(worldPos.y - rotateCenter.y, worldPos.x - rotateCenter.x);
            initialGroupRotation = elementManager.groupRotation || 0;
            initialRotationStates = elementManager.selectedElements.map(el => {
                const state = {
                    element: el,
                    position: { x: el.position.x, y: el.position.y },
                    rotation: el.rotation
                };
                if (el.type === 'line') {
                    state.x1 = el.x1;
                    state.y1 = el.y1;
                    state.x2 = el.x2;
                    state.y2 = el.y2;
                }
                return state;
            });
            e.preventDefault();
            return;
        }
        if (e.target.dataset && e.target.dataset.handleType === 'scale') {
            isScaling = true;
            scaleCorner = e.target.dataset.corner;
            const bbox = elementManager.selectedElements.length === 1 ?
                elementManager.selectedElements[0].getBoundingBox() :
                elementManager.calculateBoundingBox();
            const isGroup = elementManager.selectedElements.length > 1;
            const rotationDeg = isGroup
                ? (elementManager.groupRotation || 0)
                : (elementManager.selectedElements[0].rotation || 0);
            const rotationCenter = isGroup
                ? (elementManager.groupRotationCenter || { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 })
                : { x: elementManager.selectedElements[0].position.x, y: elementManager.selectedElements[0].position.y };
            if (rotationDeg !== 0) {
                const oppositeName = getOppositeCornerName(scaleCorner);
                const oppositeCorner = getCornerPositions(bbox)[oppositeName];
                scaleOppositeCorner = rotatePoint(
                    oppositeCorner.x,
                    oppositeCorner.y,
                    rotationCenter.x,
                    rotationCenter.y,
                    rotationDeg * Math.PI / 180
                );
            } else {
                scaleOppositeCorner = getOppositeCorner(scaleCorner, bbox);
            }
            initialDistance = distance(worldPos, scaleOppositeCorner);
            initialScales = elementManager.selectedElements.map(el => el.scale);
            initialGroupStates = elementManager.selectedElements.map(el => {
                const state = {
                    element: el,
                    position: { x: el.position.x, y: el.position.y },
                    scale: el.scale
                };
                if (el.type === 'line') {
                    state.x1 = el.x1;
                    state.y1 = el.y1;
                    state.x2 = el.x2;
                    state.y2 = el.y2;
                }
                return state;
            });
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
        initialGroupStates.forEach(state => {
            const element = state.element;
            if (element.type === 'line') {
                element.x1 = scaleOppositeCorner.x + (state.x1 - scaleOppositeCorner.x) * factor;
                element.y1 = scaleOppositeCorner.y + (state.y1 - scaleOppositeCorner.y) * factor;
                element.x2 = scaleOppositeCorner.x + (state.x2 - scaleOppositeCorner.x) * factor;
                element.y2 = scaleOppositeCorner.y + (state.y2 - scaleOppositeCorner.y) * factor;
                element.position.x = (element.x1 + element.x2) / 2;
                element.position.y = (element.y1 + element.y2) / 2;
                element.updateSvgPosition();
            } else {
                element.scale = state.scale * factor;
                element.position.x = scaleOppositeCorner.x + (state.position.x - scaleOppositeCorner.x) * factor;
                element.position.y = scaleOppositeCorner.y + (state.position.y - scaleOppositeCorner.y) * factor;
                element.updateSvgScale();
            }
        });
        elementManager.updateHandles();
        e.preventDefault();
    } else if (isRotating) {
        const currentWorld = clientToWorld(e.clientX, e.clientY);
        const currentAngle = Math.atan2(currentWorld.y - rotateCenter.y, currentWorld.x - rotateCenter.x);
        const deltaAngle = currentAngle - rotateStartAngle;
        const deltaDeg = deltaAngle * 180 / Math.PI;
        if (elementManager.selectedElements.length > 1) {
            elementManager.groupRotation = initialGroupRotation + deltaDeg;
            elementManager.groupRotationCenter = rotateCenter;
        }
        initialRotationStates.forEach(state => {
            const element = state.element;
            if (element.type === 'line') {
                const p1 = rotatePoint(state.x1, state.y1, rotateCenter.x, rotateCenter.y, deltaAngle);
                const p2 = rotatePoint(state.x2, state.y2, rotateCenter.x, rotateCenter.y, deltaAngle);
                element.x1 = p1.x;
                element.y1 = p1.y;
                element.x2 = p2.x;
                element.y2 = p2.y;
                element.position.x = (element.x1 + element.x2) / 2;
                element.position.y = (element.y1 + element.y2) / 2;
                element.rotation = state.rotation + deltaDeg;
                element.updateSvgPosition();
            } else {
                const pos = rotatePoint(state.position.x, state.position.y, rotateCenter.x, rotateCenter.y, deltaAngle);
                element.position.x = pos.x;
                element.position.y = pos.y;
                element.rotation = state.rotation + deltaDeg;
                element.updateSvgPosition();
                element.updateSvgRotation();
            }
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
    if (isRotating) {
        isRotating = false;
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

function getOppositeCornerName(corner) {
    switch (corner) {
        case 'top-left': return 'bottom-right';
        case 'top-right': return 'bottom-left';
        case 'bottom-right': return 'top-left';
        case 'bottom-left': return 'top-right';
        case 'top': return 'bottom';
        case 'right': return 'left';
        case 'bottom': return 'top';
        case 'left': return 'right';
        default: return corner;
    }
}

function getCornerPositions(bbox) {
    return {
        'top-left': { x: bbox.x, y: bbox.y },
        'top-right': { x: bbox.x + bbox.width, y: bbox.y },
        'bottom-right': { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
        'bottom-left': { x: bbox.x, y: bbox.y + bbox.height },
        top: { x: bbox.x + bbox.width / 2, y: bbox.y },
        right: { x: bbox.x + bbox.width, y: bbox.y + bbox.height / 2 },
        bottom: { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height },
        left: { x: bbox.x, y: bbox.y + bbox.height / 2 }
    };
}

function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function rotatePoint(px, py, cx, cy, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = px - cx;
    const dy = py - cy;
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
    };
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
