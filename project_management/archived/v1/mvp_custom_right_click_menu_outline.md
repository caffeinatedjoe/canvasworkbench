# MVP Custom Right-Click Menu: Donut Design

## Overview

Minimal viable product for a custom right-click menu as a donut with two concentric circles and 4 quadrants for Add Circle, Add Rectangle, Add Line, Add Text. Pops up at cursor on right-click.

## Design

- Outer radius: 100px
- Inner radius: 50px
- 4 quadrants: top (circle), right (rectangle), bottom (line), left (text)
- Colors: different for each quadrant

## Implementation

1. HTML: Add SVG menu element.
2. CSS: Position absolute, hidden by default.
3. JS: On right-click, show menu at mouse position. On quadrant click, perform action and hide. On outside click, hide.

## Code

### HTML
```html
<div id="menu" style="position:absolute; display:none;">
  <svg width="200" height="200">
    <path d="M100,100 L100,0 A100,100 0 0,1 200,100 Z" fill="red" id="addCircle" />
    <path d="M100,100 L200,100 A100,100 0 0,1 100,200 Z" fill="blue" id="addRect" />
    <path d="M100,100 L100,200 A100,100 0 0,1 0,100 Z" fill="green" id="addLine" />
    <path d="M100,100 L0,100 A100,100 0 0,1 100,0 Z" fill="yellow" id="addText" />
    <circle cx="100" cy="100" r="50" fill="white" />
  </svg>
</div>
```

### JS
```javascript
const menu = document.getElementById('menu');

viewport.addEventListener('contextmenu', e => {
  e.preventDefault();
  menu.style.left = e.clientX - 100 + 'px';
  menu.style.top = e.clientY - 100 + 'px';
  menu.style.display = 'block';
});

document.addEventListener('click', e => {
  if (!menu.contains(e.target)) menu.style.display = 'none';
});

document.getElementById('addCircle').addEventListener('click', () => {
  // add circle to canvas
  menu.style.display = 'none';
});
// similar for others