import InteractiveElement from './InteractiveElement.js';
import { rotatePoint } from '../core/geometry.js';

class NodeElement extends InteractiveElement {
    constructor(id, x, y, width, height, container, options = {}) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        super(id, 'node', { x: centerX, y: centerY }, container);
        this.width = width;
        this.height = height;
        this.inputCount = options.inputCount ?? 2;
        this.outputCount = options.outputCount ?? 2;
        this.cornerRadius = options.cornerRadius ?? 12;
        this.connectorRadius = options.connectorRadius ?? 5;
        this.connections = [];

        this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.svgElement.setAttribute('data-element-id', this.id);
        this.svgElement.classList.add('node');

        this.rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.rectElement.classList.add('node-rect');
        this.rectElement.setAttribute('fill', 'rgba(236, 240, 241, 0.95)');
        this.rectElement.setAttribute('stroke', '#2c3e50');
        this.rectElement.setAttribute('stroke-width', 1.5);
        this.rectElement.setAttribute('rx', this.cornerRadius);
        this.rectElement.setAttribute('ry', this.cornerRadius);
        this.svgElement.appendChild(this.rectElement);

        this.inputConnectors = this.createConnectors('input', this.inputCount);
        this.outputConnectors = this.createConnectors('output', this.outputCount);
    }

    createConnectors(type, count) {
        const connectors = [];
        for (let i = 0; i < count; i += 1) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.classList.add('node-connector', `node-connector-${type}`);
            circle.setAttribute('r', this.connectorRadius);
            circle.setAttribute('fill', '#ffffff');
            circle.setAttribute('stroke', '#2c3e50');
            circle.setAttribute('stroke-width', 1.2);
            circle.dataset.connectorType = type;
            circle.dataset.connectorIndex = String(i);
            circle.dataset.nodeId = this.id;
            this.svgElement.appendChild(circle);
            connectors.push(circle);
        }
        return connectors;
    }

    render() {
        this.container.appendChild(this.svgElement);
        this.updateSvgPosition();
        this.updateSvgRotation();
    }

    registerConnection(connection) {
        this.connections.push(connection);
    }

    unregisterConnection(connection) {
        const index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
        }
    }

    updateConnections() {
        this.connections.forEach(connection => connection.update());
    }

    getBoundingBox() {
        return {
            x: this.position.x - (this.width * this.scale) / 2,
            y: this.position.y - (this.height * this.scale) / 2,
            width: this.width * this.scale,
            height: this.height * this.scale
        };
    }

    getConnectorWorldPosition(type, index) {
        const positions = this.getConnectorBasePositions();
        const list = type === 'input' ? positions.inputs : positions.outputs;
        const base = list[index];
        if (!base) return { x: this.position.x, y: this.position.y };
        if (!this.rotation) {
            return { x: base.x, y: base.y };
        }
        const rad = this.rotation * Math.PI / 180;
        return rotatePoint(base.x, base.y, this.position.x, this.position.y, rad);
    }

    getConnectorBasePositions() {
        const halfW = (this.width * this.scale) / 2;
        const halfH = (this.height * this.scale) / 2;
        const leftX = this.position.x - halfW;
        const rightX = this.position.x + halfW;

        const inputs = [];
        const outputs = [];
        const inputGap = this.height * this.scale / (this.inputCount + 1);
        const outputGap = this.height * this.scale / (this.outputCount + 1);

        for (let i = 0; i < this.inputCount; i += 1) {
            inputs.push({
                x: leftX,
                y: this.position.y - halfH + inputGap * (i + 1)
            });
        }
        for (let i = 0; i < this.outputCount; i += 1) {
            outputs.push({
                x: rightX,
                y: this.position.y - halfH + outputGap * (i + 1)
            });
        }
        return { inputs, outputs };
    }

    updateConnectorPositions() {
        const positions = this.getConnectorBasePositions();
        this.inputConnectors.forEach((connector, index) => {
            const pos = positions.inputs[index];
            connector.setAttribute('cx', pos.x);
            connector.setAttribute('cy', pos.y);
        });
        this.outputConnectors.forEach((connector, index) => {
            const pos = positions.outputs[index];
            connector.setAttribute('cx', pos.x);
            connector.setAttribute('cy', pos.y);
        });
    }

    updateSvgPosition() {
        const bbox = this.getBoundingBox();
        this.rectElement.setAttribute('x', bbox.x);
        this.rectElement.setAttribute('y', bbox.y);
        this.rectElement.setAttribute('width', bbox.width);
        this.rectElement.setAttribute('height', bbox.height);
        this.updateConnectorPositions();
        this.updateConnections();
    }

    updateSvgScale(origin) {
        if (origin) {
            const newWidth = this.width * this.scale;
            const newHeight = this.height * this.scale;
            const dx = this.position.x - origin.x;
            const dy = this.position.y - origin.y;
            const dirX = dx === 0 ? 1 : Math.sign(dx);
            const dirY = dy === 0 ? 1 : Math.sign(dy);
            this.position.x = origin.x + dirX * (newWidth / 2);
            this.position.y = origin.y + dirY * (newHeight / 2);
        }
        this.updateSvgPosition();
        this.updateSvgRotation();
    }

    updateSvgRotation() {
        const bbox = this.getBoundingBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        if (this.rotation) {
            this.svgElement.setAttribute('transform', `rotate(${this.rotation} ${centerX} ${centerY})`);
        } else {
            this.svgElement.removeAttribute('transform');
        }
        this.updateConnections();
    }

    delete() {
        const connections = this.connections.slice();
        connections.forEach(connection => connection.destroy());
        super.delete();
    }
}

export default NodeElement;
