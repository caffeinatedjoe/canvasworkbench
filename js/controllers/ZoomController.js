class ZoomController {
    constructor({ viewport, camera, menu }) {
        this.viewport = viewport;
        this.camera = camera;
        this.menu = menu;
        this.bindEvents();
    }

    bindEvents() {
        this.viewport.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    }

    onWheel(e) {
        e.preventDefault();
        if (this.menu) {
            this.menu.close();
        }
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.camera.zoomAt(e.clientX, e.clientY, zoomFactor);
    }
}

export default ZoomController;
