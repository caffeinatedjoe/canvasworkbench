import { rotatePoint } from '../core/geometry.js';

class ElementManager {
    constructor() {
        this.elements = [];
        this.selectedElements = [];
        this.groupHandles = [];
        this.groupRotation = 0;
        this.groupRotationCenter = null;
    }

    addElement(element) {
        this.elements.push(element);
    }

    removeElement(element) {
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
        }
        this.deselectElement(element);
    }

    selectElement(element, shiftKey = false) {
        const wasSelected = this.selectedElements.includes(element);
        if (!shiftKey) {
            this.deselectAll();
        }
        if (wasSelected && shiftKey) {
            this.deselectElement(element);
        } else {
            this.selectedElements.push(element);
            element.select();
        }
        this.groupRotation = 0;
        this.groupRotationCenter = null;
        this.updateHandles();
    }

    deselectElement(element) {
        const index = this.selectedElements.indexOf(element);
        if (index > -1) {
            this.selectedElements.splice(index, 1);
            element.deselect();
            this.groupRotation = 0;
            this.groupRotationCenter = null;
            this.updateHandles();
        }
    }

    deselectAll() {
        this.removeIndividualHandles();
        this.removeGroupHandles();
        this.selectedElements.forEach(element => element.deselect());
        this.selectedElements = [];
        this.groupRotation = 0;
        this.groupRotationCenter = null;
    }

    setSelection(elements) {
        this.deselectAll();
        this.selectedElements = [];
        elements.forEach(element => {
            if (!element) return;
            element.selected = true;
            this.selectedElements.push(element);
        });
        this.groupRotation = 0;
        this.groupRotationCenter = null;
        this.updateHandles();
    }

    getSelected() {
        return this.selectedElements;
    }

    handleClick(event, shiftKey = false) {
        let targetElement = null;
        for (const element of this.elements) {
            if (event.target === element.svgElement || element.svgElement.contains(event.target)) {
                targetElement = element;
                break;
            }
        }
        if (targetElement) {
            this.selectElement(targetElement, shiftKey);
        } else {
            this.deselectAll();
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Delete' && this.selectedElements.length > 0) {
            this.selectedElements.forEach(element => {
                element.delete();
                this.removeElement(element);
            });
            this.selectedElements = [];
        }
    }

    getElementBoundingBox(element) {
        const bbox = element.getBoundingBox();
        if (!bbox) return null;
        if (!element.rotation || element.rotation === 0 || element.type !== 'rectangle') {
            return bbox;
        }
        const centerX = element.position.x;
        const centerY = element.position.y;
        const rad = element.rotation * Math.PI / 180;
        const corners = [
            { x: bbox.x, y: bbox.y },
            { x: bbox.x + bbox.width, y: bbox.y },
            { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
            { x: bbox.x, y: bbox.y + bbox.height }
        ].map(point => rotatePoint(point.x, point.y, centerX, centerY, rad));
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        corners.forEach(point => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    getGroupLocalBoundingBox() {
        const center = this.groupRotationCenter;
        if (!center) return null;
        const invRad = -this.groupRotation * Math.PI / 180;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        this.selectedElements.forEach(element => {
            if (element.type === 'circle') {
                const localCenter = rotatePoint(element.position.x, element.position.y, center.x, center.y, invRad);
                const r = element.r * element.scale;
                minX = Math.min(minX, localCenter.x - r);
                minY = Math.min(minY, localCenter.y - r);
                maxX = Math.max(maxX, localCenter.x + r);
                maxY = Math.max(maxY, localCenter.y + r);
                return;
            }

            if (element.type === 'line') {
                const p1 = rotatePoint(element.x1, element.y1, center.x, center.y, invRad);
                const p2 = rotatePoint(element.x2, element.y2, center.x, center.y, invRad);
                minX = Math.min(minX, p1.x, p2.x);
                minY = Math.min(minY, p1.y, p2.y);
                maxX = Math.max(maxX, p1.x, p2.x);
                maxY = Math.max(maxY, p1.y, p2.y);
                return;
            }

            if (element.type === 'rectangle') {
                const halfW = (element.width * element.scale) / 2;
                const halfH = (element.height * element.scale) / 2;
                const rotationRad = (element.rotation || 0) * Math.PI / 180;
                const cos = Math.cos(rotationRad);
                const sin = Math.sin(rotationRad);
                const corners = [
                    { x: -halfW, y: -halfH },
                    { x: halfW, y: -halfH },
                    { x: halfW, y: halfH },
                    { x: -halfW, y: halfH }
                ];
                corners.forEach(offset => {
                    const worldX = element.position.x + offset.x * cos - offset.y * sin;
                    const worldY = element.position.y + offset.x * sin + offset.y * cos;
                    const local = rotatePoint(worldX, worldY, center.x, center.y, invRad);
                    minX = Math.min(minX, local.x);
                    minY = Math.min(minY, local.y);
                    maxX = Math.max(maxX, local.x);
                    maxY = Math.max(maxY, local.y);
                });
                return;
            }

            const bbox = this.getElementBoundingBox(element);
            if (!bbox) return;
            const corners = [
                { x: bbox.x, y: bbox.y },
                { x: bbox.x + bbox.width, y: bbox.y },
                { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
                { x: bbox.x, y: bbox.y + bbox.height }
            ];
            corners.forEach(point => {
                const local = rotatePoint(point.x, point.y, center.x, center.y, invRad);
                minX = Math.min(minX, local.x);
                minY = Math.min(minY, local.y);
                maxX = Math.max(maxX, local.x);
                maxY = Math.max(maxY, local.y);
            });
        });

        if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
            return null;
        }
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    calculateBoundingBox() {
        if (this.selectedElements.length === 0) return null;
        if (this.selectedElements.length > 1 && this.groupRotation !== 0 && this.groupRotationCenter) {
            const rotatedBox = this.getGroupLocalBoundingBox();
            if (rotatedBox) return rotatedBox;
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        this.selectedElements.forEach(element => {
            const bbox = this.getElementBoundingBox(element);
            if (!bbox) return;
            minX = Math.min(minX, bbox.x);
            minY = Math.min(minY, bbox.y);
            maxX = Math.max(maxX, bbox.x + bbox.width);
            maxY = Math.max(maxY, bbox.y + bbox.height);
        });
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    updateHandles() {
        if (this.selectedElements.length > 1) {
            this.removeIndividualHandles();
            this.renderGroupHandles();
        } else if (this.selectedElements.length === 1) {
            this.removeGroupHandles();
            this.selectedElements[0].renderHandles();
        } else {
            this.removeIndividualHandles();
            this.removeGroupHandles();
            this.groupRotation = 0;
            this.groupRotationCenter = null;
        }
    }

    removeIndividualHandles() {
        this.selectedElements.forEach(element => element.removeHandles());
    }

    removeGroupHandles() {
        this.groupHandles.forEach(handle => handle.remove());
        this.groupHandles = [];
    }

    renderGroupHandles() {
        this.removeGroupHandles();
        const bbox = this.calculateBoundingBox();
        if (!bbox) return;

        const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        border.setAttribute('x', bbox.x);
        border.setAttribute('y', bbox.y);
        border.setAttribute('width', bbox.width);
        border.setAttribute('height', bbox.height);
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', 'blue');
        border.setAttribute('stroke-width', 2);
        border.setAttribute('stroke-dasharray', '5,5');
        this.elements[0].container.appendChild(border);
        this.groupHandles.push(border);

        const handleSize = 8;
        const corners = [
            { x: bbox.x, y: bbox.y, name: 'top-left' },
            { x: bbox.x + bbox.width, y: bbox.y, name: 'top-right' },
            { x: bbox.x + bbox.width, y: bbox.y + bbox.height, name: 'bottom-right' },
            { x: bbox.x, y: bbox.y + bbox.height, name: 'bottom-left' }
        ];
        corners.forEach(corner => {
            const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            handle.setAttribute('x', corner.x - handleSize / 2);
            handle.setAttribute('y', corner.y - handleSize / 2);
            handle.setAttribute('width', handleSize);
            handle.setAttribute('height', handleSize);
            handle.setAttribute('fill', 'white');
            handle.setAttribute('stroke', 'blue');
            handle.setAttribute('stroke-width', 1);
            handle.setAttribute('data-handle-type', 'scale');
            handle.setAttribute('data-corner', corner.name);
            handle.classList.add('handle');
            this.elements[0].container.appendChild(handle);
            this.groupHandles.push(handle);
        });

        const rotateHandle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rotateHandle.setAttribute('cx', bbox.x + bbox.width / 2);
        rotateHandle.setAttribute('cy', bbox.y - 20);
        rotateHandle.setAttribute('r', 6);
        rotateHandle.setAttribute('fill', 'white');
        rotateHandle.setAttribute('stroke', 'blue');
        rotateHandle.setAttribute('stroke-width', 1);
        rotateHandle.setAttribute('data-handle-type', 'rotate');
        this.elements[0].container.appendChild(rotateHandle);
        this.groupHandles.push(rotateHandle);

        if (this.groupRotation !== 0) {
            const center = this.groupRotationCenter || {
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2
            };
            this.groupHandles.forEach(handle => {
                handle.setAttribute('transform', `rotate(${this.groupRotation} ${center.x} ${center.y})`);
            });
        }
    }
}

export default ElementManager;
