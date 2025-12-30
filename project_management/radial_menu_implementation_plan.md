# Radial Menu Integration Plan

## Overview
Replace the current radial menu implementation in the main page with the complete code from the "radial_menu" folder, providing an icon-based radial menu instead of text labels.

## Current State
- Main page has a basic radial menu using text labels in `js/RadialMenu.js`
- Menu sections: Circle, Rectangle, Line, Text
- Opens on right-click and adds shapes to the infinite canvas

## Radial Menu Folder Contents
- `RadialMenu.js`: Advanced class supporting SVG icons with paths, sizes, and colors
- `script.js`: Usage example with 5 icon-based sections (circle, rectangle, line, cursor, pentagon)
- `style.css`: Styling for menu positioning and z-index

## Replacement Strategy
Completely replace the radial menu components:

1. **Replace js/RadialMenu.js** with `radial_menu/RadialMenu.js`
2. **Replace css/radial-menu.css** with `radial_menu/style.css`
3. **Update js/main.js** radial menu section to use icons from `radial_menu/script.js` and integrate with canvas actions

## Integration Steps
1. **Backup current radial menu files** (js/RadialMenu.js, css/radial-menu.css)
2. **Copy radial_menu/RadialMenu.js** to js/RadialMenu.js
3. **Copy radial_menu/style.css** to css/radial-menu.css
4. **Modify js/main.js** to:
   - Define icon objects (circle, rectangle, line, cursor, pentagon)
   - Update radial menu sections to use icons instead of text
   - Map icon actions to existing canvas shape functions (addCircleAt, addRectAt, etc.)
   - Adjust diameters to match current implementation (inner: 70, outer: 170)
5. **Test the integration** to ensure right-click opens icon menu and shapes are added correctly
6. **Verify no interference** with canvas panning, zooming, and other interactions

## Expected Outcome
- Radial menu now uses intuitive icons instead of text labels
- Maintains all existing functionality for adding shapes to canvas
- Improved visual design with hover effects and better positioning
- Seamless integration with existing viewport interactions