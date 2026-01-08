import InteractiveElement from './InteractiveElement.js';

class ConnectionElement extends InteractiveElement {
    constructor(id, fromNode, fromIndex, toNode, toIndex, container) {
        super(id, 'connection', { x: 0, y: 0 }, container);
        this.id = id;
        this.fromNode = fromNode;
        this.fromIndex = fromIndex;
        this.toNode = toNode;
        this.toIndex = toIndex;
        this.container = container;

        this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.svgElement.classList.add('connection-line');

        this.fromNode.registerConnection(this);
        this.toNode.registerConnection(this);
    }

    render() {
        if (this.container.firstChild) {
            this.container.insertBefore(this.svgElement, this.container.firstChild);
        } else {
            this.container.appendChild(this.svgElement);
        }
        this.update();
    }

    update() {
        const start = this.fromNode.getConnectorWorldPosition('output', this.fromIndex);
        const end = this.toNode.getConnectorWorldPosition('input', this.toIndex);
        const dx = Math.max(40, Math.abs(end.x - start.x) * 0.4);
        const c1x = start.x + dx;
        const c2x = end.x - dx;
        const d = `M ${start.x} ${start.y} C ${c1x} ${start.y} ${c2x} ${end.y} ${end.x} ${end.y}`;
        this.svgElement.setAttribute('d', d);
        this.position.x = (start.x + end.x) / 2;
        this.position.y = (start.y + end.y) / 2;
        this.start = start;
        this.end = end;
    }

    updateSvgPosition() {
        this.update();
    }

    updateSvgScale() {}
    updateSvgRotation() {}

    getBoundingBox() {
        if (!this.start || !this.end) {
            return null;
        }
        const minX = Math.min(this.start.x, this.end.x);
        const minY = Math.min(this.start.y, this.end.y);
        const maxX = Math.max(this.start.x, this.end.x);
        const maxY = Math.max(this.start.y, this.end.y);
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    renderHandles() {
        this.removeHandles();
    }

    select() {
        super.select();
        this.svgElement.classList.add('connection-line-selected');
    }

    deselect() {
        super.deselect();
        this.svgElement.classList.remove('connection-line-selected');
    }

    move() {}

    destroy() {
        if (this.svgElement) {
            this.svgElement.remove();
        }
        if (this.fromNode) {
            this.fromNode.unregisterConnection(this);
        }
        if (this.toNode) {
            this.toNode.unregisterConnection(this);
        }
        this.fromNode = null;
        this.toNode = null;
    }

    delete() {
        this.destroy();
    }
}

export default ConnectionElement;
