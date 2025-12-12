# MVP Parameterized Radial Menu Module Plan

## Overview

Create a simple, reusable radial menu module that can be easily integrated into any project. Focus on core functionality: dynamic sections, basic positioning, and clean configuration.

## Goals (MVP)

- **Reusable Module**: Single file that can be imported/included in any project
- **Dynamic Sections**: Support any number of menu items (N >= 1)
- **Simple API**: Easy to configure and use
- **Basic Positioning**: Open at mouse coordinates with viewport clamping
- **No Dependencies**: Pure vanilla JavaScript

## Architecture (Simplified)

### Single Module File: `RadialMenu.js`

```javascript
class RadialMenu {
  constructor(config = {}) {
    this.config = {
      innerDiameter: config.innerDiameter || 80,
      outerDiameter: config.outerDiameter || 160,
      sections: config.sections || [],
      container: config.container || document.body
    };
    this.menuElement = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    // Create menu container and SVG
    this.createMenuElement();
    // Attach to container
    this.config.container.appendChild(this.menuElement);
    // Hide initially
    this.menuElement.style.display = 'none';
  }

  createMenuElement() {
    const svg = this.generateSVG();
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'radial-menu';
    this.menuElement.appendChild(svg);
  }

  generateSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const center = this.config.outerDiameter / 2;
    const innerRadius = this.config.innerDiameter / 2;
    const outerRadius = this.config.outerDiameter / 2;

    svg.setAttribute('width', this.config.outerDiameter);
    svg.setAttribute('height', this.config.outerDiameter);
    svg.setAttribute('viewBox', `0 0 ${this.config.outerDiameter} ${this.config.outerDiameter}`);

    const numSections = this.config.sections.length;
    const anglePerSection = 360 / numSections;

    this.config.sections.forEach((section, index) => {
      const path = this.createSlicePath(center, innerRadius, outerRadius, index, numSections);
      path.setAttribute('data-section-id', section.id);
      path.addEventListener('click', () => this.handleSectionClick(section));

      const label = this.createLabel(center, innerRadius, outerRadius, section.label, index, numSections);

      svg.appendChild(path);
      svg.appendChild(label);
    });

    return svg;
  }

  createSlicePath(center, innerRadius, outerRadius, index, total) {
    const anglePerSection = (2 * Math.PI) / total;
    const startAngle = -Math.PI / 2 + (index * anglePerSection);
    const endAngle = startAngle + anglePerSection;

    const x1 = center + outerRadius * Math.cos(startAngle);
    const y1 = center + outerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(endAngle);
    const y2 = center + outerRadius * Math.sin(endAngle);
    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);

    const largeArcFlag = anglePerSection > Math.PI ? 1 : 0;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`);
    path.setAttribute('fill', 'rgba(0,0,0,0.1)');
    path.setAttribute('stroke', 'rgba(0,0,0,0.3)');
    path.setAttribute('stroke-width', '1');
    path.style.cursor = 'pointer';

    return path;
  }

  createLabel(center, innerRadius, outerRadius, text, index, total) {
    const anglePerSection = (2 * Math.PI) / total;
    const midAngle = -Math.PI / 2 + (index * anglePerSection) + (anglePerSection / 2);
    const labelRadius = (innerRadius + outerRadius) / 2;

    const x = center + labelRadius * Math.cos(midAngle);
    const y = center + labelRadius * Math.sin(midAngle);

    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('dominant-baseline', 'middle');
    textElement.setAttribute('font-size', '14px');
    textElement.setAttribute('fill', 'rgba(0,0,0,0.8)');
    textElement.setAttribute('pointer-events', 'none');
    textElement.textContent = text;

    return textElement;
  }

  handleSectionClick(section) {
    if (section.action) {
      section.action();
    }
    this.close();
  }

  openAt(x, y) {
    if (this.isOpen) return;

    // Position menu
    const menuSize = this.config.outerDiameter;
    let left = x - (menuSize / 2);
    let top = y - (menuSize / 2);

    // Basic viewport clamping
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 10) left = 10;
    if (top < 10) top = 10;
    if (left + menuSize > viewportWidth - 10) left = viewportWidth - menuSize - 10;
    if (top + menuSize > viewportHeight - 10) top = viewportHeight - menuSize - 10;

    this.menuElement.style.left = `${left}px`;
    this.menuElement.style.top = `${top}px`;
    this.menuElement.style.display = 'block';
    this.isOpen = true;

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', this.closeHandler = () => this.close());
    }, 0);
  }

  close() {
    if (!this.isOpen) return;

    this.menuElement.style.display = 'none';
    this.isOpen = false;

    if (this.closeHandler) {
      document.removeEventListener('click', this.closeHandler);
      this.closeHandler = null;
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    // Recreate SVG with new config
    const newSvg = this.generateSVG();
    this.menuElement.replaceChild(newSvg, this.menuElement.querySelector('svg'));
  }

  destroy() {
    this.close();
    if (this.menuElement && this.menuElement.parentNode) {
      this.menuElement.parentNode.removeChild(this.menuElement);
    }
  }
}
```

## Usage

### Basic Usage

```javascript
// Include the RadialMenu.js file in your project

// Create menu instance
const menu = new RadialMenu({
  innerDiameter: 80,
  outerDiameter: 160,
  sections: [
    { id: 'circle', label: 'Circle', action: () => console.log('Add Circle') },
    { id: 'rect', label: 'Rectangle', action: () => console.log('Add Rectangle') },
    { id: 'line', label: 'Line', action: () => console.log('Add Line') },
    { id: 'text', label: 'Text', action: () => console.log('Add Text') }
  ]
});

// Open on right-click
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  menu.openAt(e.clientX, e.clientY);
});
```

### Dynamic Configuration

```javascript
// Change menu items dynamically
menu.updateConfig({
  sections: [
    { id: 'shape1', label: 'Shape 1', action: () => createShape1() },
    { id: 'shape2', label: 'Shape 2', action: () => createShape2() },
    { id: 'shape3', label: 'Shape 3', action: () => createShape3() }
  ]
});
```

## CSS (Minimal)

```css
.radial-menu {
  position: fixed;
  z-index: 9999;
  user-select: none;
  pointer-events: none;
}

.radial-menu svg {
  pointer-events: auto;
}

.radial-menu path:hover {
  fill: rgba(0,0,0,0.2) !important;
}
```

## Implementation in Another Project

### Prerequisites

- Modern web browser with SVG support
- Basic knowledge of JavaScript and DOM manipulation

### Integration Steps

1. **Include the Module**: Copy `RadialMenu.js` into your project's JavaScript directory and include it in your HTML or import it as a module.

2. **Add CSS**: Include the provided CSS in your stylesheet or add it to your project's CSS files.

3. **Instantiate the Menu**: Create a new instance of `RadialMenu` with your desired configuration.

4. **Handle Events**: Attach event listeners to trigger the menu opening, such as right-click events.

5. **Customize**: Adjust the configuration as needed for your project's requirements.

### Example Integration

For a plain HTML/JS project:

- Add `<script src="path/to/RadialMenu.js"></script>` to your HTML.

- Add the CSS to your stylesheet.

- In your JS: `const menu = new RadialMenu({ sections: [...] });`

For a framework like React:

- Import the class and use `useEffect` to instantiate.

- Handle state for dynamic updates.

### Considerations

- Ensure the container element is positioned relatively or absolutely if needed.

- Test viewport clamping on different screen sizes.

- For mobile, consider touch events instead of right-click.

## Implementation Steps (MVP)

1. **Create RadialMenu.js**: Implement the core class with SVG generation
2. **Add CSS**: Basic styling for the menu
3. **Test Basic Functionality**: Verify with different numbers of sections
4. **Add Positioning Logic**: Implement viewport clamping
5. **Test Integration**: Use in the existing canvas application
6. **Refine API**: Make any necessary adjustments based on testing

## Benefits (MVP)

- **Simple**: Single file, easy to understand and integrate
- **Flexible**: Dynamic number of sections, configurable sizes
- **Reusable**: Can be used in any project with minimal setup
- **Lightweight**: No dependencies, minimal code
- **Extensible**: Easy to add features later if needed

## Future Enhancements (Post-MVP)

- Event system for better decoupling
- Theme support
- Animations
- Accessibility features
- Framework wrappers (React, Vue, etc.)

## Next Steps

Once this MVP plan is approved, switch to Code mode to implement the RadialMenu class.