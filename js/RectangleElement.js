class RectangleElement extends InteractiveElement {
  constructor(id, x, y, width, height, container) {
    // Position is center of rectangle
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    super(id, 'rectangle', { x: centerX, y: centerY }, container);
    this.width = width;
    this.height = height;
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.svgElement.setAttribute('x', x);
    this.svgElement.setAttribute('y', y);
    this.svgElement.setAttribute('width', width);
    this.svgElement.setAttribute('height', height);
    this.svgElement.setAttribute('fill', 'rgba(52, 152, 219, 0.9)');
    this.svgElement.setAttribute('stroke', 'black');
    this.svgElement.setAttribute('stroke-width', 1);
  }

  render() {
    this.container.appendChild(this.svgElement);
  }

  getBoundingBox() {
    return {
      x: this.position.x - (this.width * this.scale) / 2,
      y: this.position.y - (this.height * this.scale) / 2,
      width: this.width * this.scale,
      height: this.height * this.scale
    };
  }

  updateSvgPosition() {
    const bbox = this.getBoundingBox();
    this.svgElement.setAttribute('x', bbox.x);
    this.svgElement.setAttribute('y', bbox.y);
  }

  updateSvgScale(origin) {
    this.svgElement.setAttribute('width', this.width * this.scale);
    this.svgElement.setAttribute('height', this.height * this.scale);
    // Update position to keep origin fixed
    if (origin) {
      const newWidth = this.width * this.scale;
      const newHeight = this.height * this.scale;
      // The origin should remain at the same position
      // For example, if origin is top-left of bbox, new x = origin.x, new y = origin.y
      // But since position is center, center = origin + (newWidth/2, newHeight/2) depending on which corner
      // Wait, for top-left origin, new center = origin + (newWidth/2, newHeight/2)
      // But origin is the opposite corner, so for top-left handle, origin is bottom-right, so to keep bottom-right fixed, new center = origin - (newWidth/2, newHeight/2)
      // Yes.
      let offsetX = 0, offsetY = 0;
      const bbox = this.getBoundingBox(); // but this uses current scale, wait no, getBoundingBox uses this.scale, but since we just set it, it's new.
      // Wait, better to calculate based on original.
      // Actually, since position is center, and origin is a point, the vector from center to origin should be scaled? No.
      // To keep origin fixed, the new position = origin - vector from origin to center in new scale.
      // For rectangle, center is at position, origin is say bottom-right, vector from origin to center is (-newWidth/2, -newHeight/2) for bottom-right origin.
      // So new center = origin + (-newWidth/2, -newHeight/2) = origin - (newWidth/2, newHeight/2)
      // Yes.
      // But which corner is origin? For scaling from corner, origin is opposite.
      // So, for example, if dragging top-left, origin is bottom-right, so to keep bottom-right fixed, new center = bottom-right - (newWidth/2, newHeight/2)
      // Yes.
      // But in code, origin is the opposite corner position.
      this.position.x = origin.x - newWidth / 2;
      this.position.y = origin.y - newHeight / 2;
      // For top-left drag, origin is bottom-right, so center = bottom-right - (w/2, h/2), which is correct, top-left will be at bottom-right - (w, h), no.
      // Bottom-right is at (center.x + w/2, center.y + h/2), to keep it fixed, new center = fixed - (newW/2, newH/2)
      // Yes, and new top-left = new center - (newW/2, newH/2) = fixed - (newW/2, newH/2) - (newW/2, newH/2) = fixed - (newW, newH), but since scale >1, it's further, but actually for scaling up, the top-left moves left and up, yes.
      // Yes, correct.
    }
    this.updateSvgPosition();
  }

  updateSvgRotation() {
    const bbox = this.getBoundingBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    this.svgElement.setAttribute('transform', `rotate(${this.rotation} ${centerX} ${centerY})`);
  }

  // renderHandles() uses base class, which is suitable for rectangle
}