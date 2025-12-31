class LineElement extends InteractiveElement {
  constructor(id, x1, y1, x2, y2, container) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    super(id, 'line', { x: midX, y: midY }, container);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.svgElement.setAttribute('x1', x1);
    this.svgElement.setAttribute('y1', y1);
    this.svgElement.setAttribute('x2', x2);
    this.svgElement.setAttribute('y2', y2);
    this.svgElement.setAttribute('stroke', 'rgba(46, 204, 113, 0.95)');
    this.svgElement.setAttribute('stroke-width', 6);
    this.svgElement.setAttribute('stroke-linecap', 'round');
  }

  render() {
    this.container.appendChild(this.svgElement);
  }

  getBoundingBox() {
    const minX = Math.min(this.x1, this.x2);
    const minY = Math.min(this.y1, this.y2);
    const maxX = Math.max(this.x1, this.x2);
    const maxY = Math.max(this.y1, this.y2);
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  updateSvgPosition() {
    this.svgElement.setAttribute('x1', this.x1);
    this.svgElement.setAttribute('y1', this.y1);
    this.svgElement.setAttribute('x2', this.x2);
    this.svgElement.setAttribute('y2', this.y2);
  }

  updateSvgScale(origin) {
    // Scale the line length from midpoint
    const midX = this.position.x;
    const midY = this.position.y;
    const dx1 = this.x1 - midX;
    const dy1 = this.y1 - midY;
    const dx2 = this.x2 - midX;
    const dy2 = this.y2 - midY;
    this.x1 = midX + dx1 * this.scale;
    this.y1 = midY + dy1 * this.scale;
    this.x2 = midX + dx2 * this.scale;
    this.y2 = midY + dy2 * this.scale;
    this.updateSvgPosition();
  }

  updateSvgRotation() {
    // Rotation around midpoint
    const centerX = this.position.x;
    const centerY = this.position.y;
    const rotatePoint = (px, py, angle, cx, cy) => {
      const rad = angle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = px - cx;
      const dy = py - cy;
      return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
      };
    };
    const newP1 = rotatePoint(this.x1, this.y1, this.rotation, centerX, centerY);
    const newP2 = rotatePoint(this.x2, this.y2, this.rotation, centerX, centerY);
    this.x1 = newP1.x;
    this.y1 = newP1.y;
    this.x2 = newP2.x;
    this.y2 = newP2.y;
    this.updateSvgPosition();
  }

  move(deltaX, deltaY) {
    this.x1 += deltaX;
    this.y1 += deltaY;
    this.x2 += deltaX;
    this.y2 += deltaY;
    this.position.x = (this.x1 + this.x2) / 2;
    this.position.y = (this.y1 + this.y2) / 2;
    this.updateSvgPosition();
  }

  renderHandles() {
    this.removeHandles();
    // No border for line

    // Endpoint handles: circles at x1y1 and x2y2
    const handleRadius = 6;
    const endpoints = [
      { x: this.x1, y: this.y1 },
      { x: this.x2, y: this.y2 }
    ];
    endpoints.forEach(point => {
      const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      handle.setAttribute('cx', point.x);
      handle.setAttribute('cy', point.y);
      handle.setAttribute('r', handleRadius);
      handle.setAttribute('fill', 'white');
      handle.setAttribute('stroke', 'blue');
      handle.setAttribute('stroke-width', 1);
      this.container.appendChild(handle);
      this.handles.push(handle);
    });

    // Rotate handle at midpoint
    const rotateHandle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    rotateHandle.setAttribute('cx', this.position.x);
    rotateHandle.setAttribute('cy', this.position.y - 20);
    rotateHandle.setAttribute('r', 6);
    rotateHandle.setAttribute('fill', 'white');
    rotateHandle.setAttribute('stroke', 'blue');
    rotateHandle.setAttribute('stroke-width', 1);
    this.container.appendChild(rotateHandle);
    this.handles.push(rotateHandle);
  }
}