# Custom Right-Click Menu: Donut Design Outline

## Overview

This document outlines the best practices for implementing a custom right-click menu designed as a "donut" with two concentric circles, divided into 4 quadrants. Each quadrant represents a selection: Add Circle, Add Rectangle, Add Line, and Add Text. The menu appears around the cursor position upon right-click, providing an intuitive radial interface for quick actions in the canvas workbench application.

## Best Practices for Custom Right-Click Menus

- **Prevent Default Behavior**: Always prevent the browser's default context menu to avoid conflicts.
- **Positioning**: Position the menu at the exact mouse coordinates, ensuring it doesn't go off-screen.
- **User Interaction**: Handle left-clicks on quadrants to execute actions, and clicks outside or on the inner circle to close the menu.
- **Accessibility**: Implement keyboard navigation (e.g., arrow keys to select quadrants), ARIA labels, and focus management.
- **Performance**: Use efficient rendering methods like SVG for smooth animations and low CPU usage.
- **Responsiveness**: Adjust menu size and positioning based on viewport dimensions and zoom levels.
- **Visual Feedback**: Provide hover effects, animations for opening/closing, and clear visual separation between quadrants.
- **Integration**: Ensure the menu integrates seamlessly with existing canvas interactions (e.g., panning, zooming).

## Design Specifications

- **Structure**: Two concentric circles forming a donut shape.
  - Outer circle: Radius approximately 100px (adjustable).
  - Inner circle: Radius approximately 50px (creates the donut hole).
- **Quadrants**: The donut is divided into 4 equal sectors (90 degrees each).
  - Top: Add Circle
  - Right: Add Rectangle
  - Bottom: Add Line
  - Left: Add Text
- **Visual Elements**:
  - Each quadrant has a distinct color or icon.
  - Labels positioned radially.
  - Subtle borders between quadrants.
- **Appearance**: Semi-transparent background, high contrast for readability.

## Implementation Steps

1. **HTML Structure**: Add a hidden menu element to the DOM, structured with SVG for the donut shape.
2. **CSS Styling**: Define styles for the menu container, SVG paths for quadrants, and animations.
3. **JavaScript Logic**:
   - Listen for `contextmenu` event on the viewport.
   - Calculate position and show menu.
   - Handle quadrant clicks to execute actions.
   - Handle outside clicks or key presses to hide menu.
4. **Integration**: Modify existing event handlers to coexist with the menu (e.g., don't interfere with panning).
5. **Testing**: Test on different devices, browsers, and interaction scenarios.

## Code Examples

### HTML Structure
```html
<div id="radialMenu" class="radial-menu hidden">
  <svg width="200" height="200" viewBox="0 0 200 200">
    <!-- Quadrants as paths -->
    <path id="quadrant1" d="M100,100 L100,0 A100,100 0 0,1 200,100 Z" fill="rgba(255,0,0,0.5)" />
    <!-- Similar for other quadrants -->
    <circle cx="100" cy="100" r="50" fill="transparent" />
    <!-- Labels -->
    <text x="150" y="50" text-anchor="middle">Add Circle</text>
    <!-- etc. -->
  </svg>
</div>
```

### CSS Styling
```css
.radial-menu {
  position: absolute;
  pointer-events: none;
  z-index: 1000;
}
.radial-menu svg {
  pointer-events: auto;
}
.hidden {
  display: none;
}
```

### JavaScript Logic
```javascript
viewport.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const menu = document.getElementById('radialMenu');
  menu.style.left = `${e.clientX - 100}px`;
  menu.style.top = `${e.clientY - 100}px`;
  menu.classList.remove('hidden');
});

// Handle quadrant clicks
document.getElementById('quadrant1').addEventListener('click', () => {
  // Add circle logic
  hideMenu();
});

// Hide on outside click
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target)) {
    hideMenu();
  }
});

function hideMenu() {
  menu.classList.add('hidden');
}
```

## Potential Challenges and Solutions

- **Edge Positioning**: If menu would go off-screen, adjust position or scale.
- **Z-Index Conflicts**: Ensure menu appears above canvas layers.
- **Touch Devices**: Add touch event support for mobile.
- **Performance on Large Canvases**: Use requestAnimationFrame for animations.
- **Accessibility**: Test with screen readers and keyboard-only navigation.

## Conclusion

This donut-style radial menu provides an efficient way to access common actions in the canvas workbench. By following these best practices, the implementation will be user-friendly, performant, and accessible.