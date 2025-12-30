// Camera variables
let offsetX = 0;
let offsetY = 0;
let scale = 1;

// Get elements
const viewport = document.getElementById('viewport');
const rasterLayer = document.getElementById('rasterLayer');
const vectorLayer = document.getElementById('vectorLayer');
const world = document.getElementById('world');

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

// Panning: middle-click drag
viewport.addEventListener('mousedown', (e) => {
    if (e.button === 1) { // middle click
        e.preventDefault();
        menu.close();
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

viewport.addEventListener('mousemove', (e) => {
    if (isPanning) {
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

function createSvgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, String(v));
    }
    return el;
}

function addCircleAt(x, y) {
    const circle = createSvgEl('circle', {
        cx: x,
        cy: y,
        r: 30,
        fill: 'rgba(231, 76, 60, 0.9)',
    });
    world.appendChild(circle);
}

function addRectAt(x, y) {
    const rect = createSvgEl('rect', {
        x: x - 50,
        y: y - 25,
        width: 100,
        height: 50,
        fill: 'rgba(52, 152, 219, 0.9)',
    });
    world.appendChild(rect);
}

function addLineAt(x, y) {
    const line = createSvgEl('line', {
        x1: x - 60,
        y1: y - 20,
        x2: x + 60,
        y2: y + 20,
        stroke: 'rgba(46, 204, 113, 0.95)',
        'stroke-width': 6,
        'stroke-linecap': 'round',
    });
    world.appendChild(line);
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
