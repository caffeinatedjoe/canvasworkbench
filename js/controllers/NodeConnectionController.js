import ConnectionElement from '../elements/ConnectionElement.js';

class NodeConnectionController {
    constructor({ viewport, world, camera, elementManager }) {
        this.viewport = viewport;
        this.world = world;
        this.camera = camera;
        this.elementManager = elementManager;
        this.isConnecting = false;
        this.startNode = null;
        this.startType = null;
        this.startIndex = null;
        this.previewLine = null;
        this.connectionId = 0;
        this.onMouseMove = (e) => this.handleMouseMove(e);
        this.onMouseUp = (e) => this.handleMouseUp(e);
        this.bindEvents();
    }

    bindEvents() {
        this.viewport.addEventListener('mousedown', (e) => this.handleMouseDown(e), true);
    }

    handleMouseDown(e) {
        const connector = this.getConnectorFromEventTarget(e.target);
        if (!connector) return;
        const node = this.elementManager.getElementById(connector.nodeId);
        if (!node || node.type !== 'node') return;

        if (!this.elementManager.selectedElements.includes(node)) {
            this.elementManager.selectElement(node, e.shiftKey);
        }

        this.isConnecting = true;
        this.startNode = node;
        this.startType = connector.type;
        this.startIndex = connector.index;
        this.ensurePreviewLine();
        this.updatePreviewLine(e.clientX, e.clientY);

        e.preventDefault();
        if (typeof e.stopImmediatePropagation === 'function') {
            e.stopImmediatePropagation();
        } else {
            e.stopPropagation();
        }

        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    }

    handleMouseMove(e) {
        if (!this.isConnecting) return;
        this.updatePreviewLine(e.clientX, e.clientY);
        e.preventDefault();
    }

    handleMouseUp(e) {
        if (!this.isConnecting) return;
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);

        const endConnector = this.getConnectorFromEventTarget(e.target);
        if (endConnector) {
            const endNode = this.elementManager.getElementById(endConnector.nodeId);
            if (endNode && endNode.type === 'node' && endNode !== this.startNode) {
                this.createConnection(endNode, endConnector);
            }
        }

        this.cleanupPreview();
        this.isConnecting = false;
        this.startNode = null;
        this.startType = null;
        this.startIndex = null;
    }

    getConnectorFromEventTarget(target) {
        if (!target || !target.dataset || !target.dataset.connectorType) {
            return null;
        }
        return {
            type: target.dataset.connectorType,
            index: Number(target.dataset.connectorIndex),
            nodeId: target.dataset.nodeId
        };
    }

    ensurePreviewLine() {
        if (this.previewLine) return;
        this.previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.previewLine.classList.add('connection-line', 'connection-line-preview');
        this.world.appendChild(this.previewLine);
    }

    updatePreviewLine(clientX, clientY) {
        if (!this.previewLine) return;
        const start = this.startNode.getConnectorWorldPosition(this.startType, this.startIndex);
        const end = this.camera.clientToWorld(clientX, clientY);
        const dx = Math.max(40, Math.abs(end.x - start.x) * 0.4);
        const c1x = start.x + (this.startType === 'output' ? dx : -dx);
        const c2x = end.x + (this.startType === 'output' ? -dx : dx);
        const d = `M ${start.x} ${start.y} C ${c1x} ${start.y} ${c2x} ${end.y} ${end.x} ${end.y}`;
        this.previewLine.setAttribute('d', d);
    }

    createConnection(endNode, endConnector) {
        if (endConnector.type === this.startType) {
            return;
        }
        const fromNode = this.startType === 'output' ? this.startNode : endNode;
        const toNode = this.startType === 'output' ? endNode : this.startNode;
        const fromIndex = this.startType === 'output' ? this.startIndex : endConnector.index;
        const toIndex = this.startType === 'output' ? endConnector.index : this.startIndex;
        const connection = new ConnectionElement(
            `connection_${this.connectionId++}`,
            fromNode,
            fromIndex,
            toNode,
            toIndex,
            this.world
        );
        connection.render();
        this.elementManager.addElement(connection);
    }

    cleanupPreview() {
        if (!this.previewLine) return;
        this.previewLine.remove();
        this.previewLine = null;
    }
}

export default NodeConnectionController;
