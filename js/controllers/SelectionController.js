class SelectionController {
    constructor({ vectorLayer, elementManager, interactionState }) {
        this.vectorLayer = vectorLayer;
        this.elementManager = elementManager;
        this.interactionState = interactionState;
        this.bindEvents();
    }

    bindEvents() {
        this.vectorLayer.addEventListener('click', (e) => this.onClick(e));
    }

    onClick(e) {
        if (this.interactionState.dragOccurred) {
            this.interactionState.dragOccurred = false;
            return;
        }
        const isElementClicked = this.elementManager.elements.some(element => (
            e.target === element.svgElement || element.svgElement.contains(e.target)
        ));
        if (isElementClicked) {
            e.preventDefault();
        }
        this.elementManager.handleClick(e, e.shiftKey);
    }
}

export default SelectionController;
