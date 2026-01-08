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
        const isElementClicked = this.elementManager.elements.some(element => (
            element.isHitTarget && element.isHitTarget(e.target)
        ));
        const isHandleClicked = !!(e.target && e.target.dataset && e.target.dataset.handleType);
        if (this.interactionState.dragOccurred) {
            this.interactionState.dragOccurred = false;
            if (!isElementClicked) {
                return;
            }
        }
        if (isElementClicked || isHandleClicked) {
            e.preventDefault();
            return;
        }
        this.elementManager.handleClick(e, e.shiftKey);
    }
}

export default SelectionController;
