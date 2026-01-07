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

    getSelected() {
        return this.selectedElements;
    }

    handleClick(event, shiftKey = false) {
        // Find the element that was clicked
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

    // Placeholder for group bounding box calculation (to be implemented in later steps)
    calculateBoundingBox() {
        if (this.selectedElements.length === 0) return null;
        // Calculate min bounding box for selected elements
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.selectedElements.forEach(element => {
            const bbox = element.getBoundingBox();
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

        // Create border (rect around bbox)
        const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        border.setAttribute('x', bbox.x);
        border.setAttribute('y', bbox.y);
        border.setAttribute('width', bbox.width);
        border.setAttribute('height', bbox.height);
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', 'blue');
        border.setAttribute('stroke-width', 2);
        border.setAttribute('stroke-dasharray', '5,5');
        this.elements[0].container.appendChild(border); // assuming all elements have same container
        this.groupHandles.push(border);

        // Corner handles (small squares at corners)
        const handleSize = 8;
        const corners = [
            { x: bbox.x, y: bbox.y, name: 'top-left' }, // top-left
            { x: bbox.x + bbox.width, y: bbox.y, name: 'top-right' }, // top-right
            { x: bbox.x + bbox.width, y: bbox.y + bbox.height, name: 'bottom-right' }, // bottom-right
            { x: bbox.x, y: bbox.y + bbox.height, name: 'bottom-left' } // bottom-left
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

        // Rotate handle (circle above top-center)
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
