# Interactive Elements MVP Implementation Steps

This document provides a detailed, step-by-step plan for implementing the MVP interactive elements feature based on the `interactive_elements_plan.md`. Each step is designed as a single, verifiable task to be implemented one at a time, with user verification in the loop before proceeding to the next step. The focus is on MVP functionality: selection (single and multiple with Shift), visual feedback (border, handles), drag to move, scaling via corner handles, rotation via rotate handle, endpoint handles for lines, and deletion via Delete key.

## MVP Scope Reminder
- Single and multiple selection (Shift key for multi-select).
- Visual feedback: border, corner handles for scaling, rotate handle, bounding box for groups.
- Drag to move elements/lines.
- Corner handles for scaling.
- Rotate handle for rotation.
- Endpoint handles for lines.
- Delete key for removal.
- No undo/redo.
- Scalable for arbitrary objects.
- Account for camera transforms and avoid conflicts with panning/zooming.

## Implementation Steps

### Step 1: Create Base `InteractiveElement` Class
- **Task**: Create a new file `js/InteractiveElement.js` with a base `InteractiveElement` class.
- **Details**:
  - Define the class with properties: id, type, position, scale, rotation, svgElement.
  - Implement common methods: `select()`, `deselect()`, `move(deltaX, deltaY)`, `scale(factor, origin)`, `rotate(angle)`, `delete()`, `renderHandles()`.
  - The `renderHandles()` method should create and append SVG elements for border, corner handles, rotate handle, and endpoint handles (for lines).
  - Ensure handles are positioned correctly relative to the element.
  - Add event listeners for handle interactions (to be implemented in later steps).
- **Verification**: Confirm the class is created, methods are defined, and it can be instantiated without errors. Check that SVG elements are created but not yet interactive.

### Step 2: Implement `CircleElement` Class
- **Task**: Create `js/CircleElement.js` extending `InteractiveElement`.
- **Details**:
  - Override constructor to create an SVG circle element with initial properties (cx, cy, r).
  - Implement `render()` to append the circle to the 'world' group.
  - Customize `renderHandles()` for circle-specific handles: border (ellipse), corner handles (squares at cardinal points), rotate handle (above center).
- **Verification**: Instantiate a CircleElement, render it on the canvas, and verify handles appear when selected (manually call select for now).

### Step 3: Implement `RectangleElement` Class
- **Task**: Create `js/RectangleElement.js` extending `InteractiveElement`.
- **Details**:
  - Override constructor to create an SVG rect element with initial properties (x, y, width, height).
  - Implement `render()` to append the rect to the 'world' group.
  - Customize `renderHandles()` for rectangle-specific handles: border (rect), corner handles (squares at corners), rotate handle (above center).
- **Verification**: Instantiate a RectangleElement, render it, and verify handles appear on selection.

### Step 4: Implement `LineElement` Class
- **Task**: Create `js/LineElement.js` extending `InteractiveElement`.
- **Details**:
  - Override constructor to create an SVG line element with initial properties (x1, y1, x2, y2).
  - Implement `render()` to append the line to the 'world' group.
  - Customize `renderHandles()` for line-specific handles: border (invisible or minimal), endpoint handles (circles at x1y1 and x2y2), rotate handle (midpoint), corner handles (if applicable, but focus on endpoints).
- **Verification**: Instantiate a LineElement, render it, and verify handles appear on selection.

### Step 5: Create `ElementManager` Class
- **Task**: Create `js/ElementManager.js` with a class to manage all elements.
- **Details**:
  - Properties: array of elements, selectedElements array.
  - Methods: `addElement(element)`, `removeElement(element)`, `selectElement(element, shiftKey)`, `deselectAll()`, `getSelected()`, `handleClick(event, shiftKey)`, `handleKeyDown(event)`.
  - Implement selection logic: single select clears others, shift adds/removes from selection.
  - For groups, calculate min bounding box and render collective handles.
- **Verification**: Create an instance of ElementManager, add elements, and test selection/deselection logic without UI yet.

### Step 6: Modify Creation Functions to Use New Classes
- **Task**: Update the radial menu creation functions in `js/main.js` or relevant files to instantiate new element classes and add to ElementManager.
- **Details**:
  - For circle creation: Instead of direct SVG append, create CircleElement instance, render it, and add to manager.
  - Similarly for rectangle and line.
  - Ensure new elements are not selected by default.
- **Verification**: Create elements via radial menu, confirm they are instances of the new classes and added to manager.

### Step 7: Add Click Event Listeners for Selection
- **Task**: Add event listeners to the canvas for element clicks to handle selection.
- **Details**:
  - In `js/main.js`, add a click event listener to the SVG or world group.
  - Use event.target to identify clicked element, find corresponding InteractiveElement via manager.
  - Call manager's `handleClick(event, shiftKey)` to update selection.
  - Prevent default if element clicked, allow panning otherwise.
- **Verification**: Click on elements to select/deselect, verify visual feedback (handles appear/disappear), test Shift for multi-select.

### Step 8: Implement Visual Feedback Rendering
- **Task**: Ensure selected elements render their handles correctly.
- **Details**:
  - In ElementManager's select/deselect methods, call element's `renderHandles()` or `removeHandles()`.
  - For groups, render a bounding box with handles.
  - Style handles in CSS (update `css/styles.css` if needed).
- **Verification**: Select elements and confirm handles are visible; deselect and confirm they disappear.

### Step 9: Add Drag Functionality for Moving Elements
- **Task**: Implement drag to move selected elements.
- **Details**:
  - Add mousedown, mousemove, mouseup listeners to the canvas.
  - On mousedown on element, start drag if selected.
  - Track mouse movement, convert to world coordinates, move all selected elements by delta.
  - Prevent panning during drag.
- **Verification**: Drag selected elements and verify they move correctly, accounting for zoom/pan.

### Step 10: Add Resize Handles for Scaling
- **Task**: Make corner handles functional for scaling.
- **Details**:
  - In `renderHandles()`, add event listeners to corner handle elements.
  - On mousedown on handle, start resize mode.
  - Calculate scale factor based on mouse movement relative to opposite corner.
  - Apply scale to selected elements.
- **Verification**: Use corner handles to scale elements, verify they resize proportionally.

### Step 11: Add Rotate Handle for Rotation
- **Task**: Make rotate handle functional.
- **Details**:
  - Add event listener to rotate handle.
  - On mousedown, start rotate mode.
  - Calculate rotation angle based on mouse position relative to element center.
  - Apply rotation to selected elements.
- **Verification**: Use rotate handle to rotate elements, verify correct rotation.

### Step 12: Add Endpoint Handles for Lines
- **Task**: Make endpoint handles functional for moving line endpoints.
- **Details**:
  - In LineElement's `renderHandles()`, add listeners to endpoint circles.
  - On drag, update the corresponding x1y1 or x2y2.
  - Re-render the line.
- **Verification**: Drag line endpoints and verify the line updates correctly.

### Step 13: Add Keyboard Listener for Deletion
- **Task**: Implement Delete key to remove selected elements.
- **Details**:
  - Add keydown listener to window or canvas.
  - If Delete key and elements selected, call delete on each, remove from manager and DOM.
- **Verification**: Select elements, press Delete, verify they are removed from canvas and manager.

### Step 14: Handle Group Editing with Bounding Box
- **Task**: Implement collective editing for multiple selections.
- **Details**:
  - In ElementManager, when multiple selected, calculate min bounding box.
  - Render handles on the bounding box for move, scale, rotate.
  - Apply transformations to all selected elements.
- **Verification**: Select multiple elements, verify bounding box and handles work for group operations.

### Step 15: Test with Camera Transforms and Prevent Conflicts
- **Task**: Ensure all interactions work with zoom/pan.
- **Details**:
  - Use existing `clientToWorld` function for coordinate conversions.
  - Test dragging, scaling, rotating at different zoom levels.
  - Ensure panning is disabled during interactions.
- **Verification**: Zoom in/out, pan, and perform all interactions; confirm no conflicts.

### Step 16: Final MVP Testing and Refinement
- **Task**: Comprehensive test of all features.
- **Details**:
  - Create various elements, select, move, scale, rotate, delete.
  - Test multi-select and group operations.
  - Check performance with multiple elements.
  - Fix any bugs discovered.
- **Verification**: All MVP features work as expected; no regressions in existing functionality.

## Notes
- Each step should be implemented and verified before proceeding to the next.
- If issues arise, pause and discuss with user.
- After completion, consider extending for full features like undo/redo.