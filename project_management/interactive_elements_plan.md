# Interactive Elements Plan

## Overview
This plan outlines a modular and scalable MVP approach to make drawn elements (circles, rectangles, lines) interactive. The solution will allow clicking to select, editing position/scale, and deletion, while keeping the code simple and extensible.

## Current State Analysis
- Elements are SVG shapes appended to the 'world' group.
- No current interactivity beyond creation via radial menu.
- Camera system handles panning/zooming, so interactions must account for transforms.

## Proposed Architecture
- Create an `ElementManager` class to handle all elements, selection, and operations. It will maintain an array of element instances for programmatic tracking.
- Each element type (Circle, Rectangle, Line, and extensible for others) will have a class extending a base `InteractiveElement` class.
- Elements will store their properties, create/render their own SVG DOM elements with event listeners, and handle interactions.
- Selection: Single or multiple (with Shift). Visual feedback: border with square corner handles for scaling, rotate handle from top middle.
- For groups: Min bounding box with handles for collective editing.
- Editing: Drag element/line to move, corner handles for scaling, rotate handle for rotation, endpoint handles for lines.
- Deletion: Delete key when selected.
- Storage Proposal: Use an array in ElementManager to store element instances. Each instance holds properties and references its DOM element. This allows programmatic manipulation while leveraging DOM for rendering and events.

## Implementation Steps
1. Create base `InteractiveElement` class with common methods (select, deselect, move, scale, rotate, delete, render handles).
2. Implement specific classes for Circle, Rectangle, Line (with endpoint handles for Line).
3. Create `ElementManager` class with array to store elements, methods for selection (single/multi), group operations.
4. Modify creation functions to instantiate new classes and add to manager.
5. Add event listeners for clicks on elements (with Shift for multi-select).
6. Implement visual feedback: border, corner handles, rotate handle, bounding box for groups.
7. Add drag functionality for moving elements/lines.
8. Add resize handles for scaling (corner squares).
9. Add rotate handle for rotation.
10. Add endpoint handles for lines.
11. Add keyboard listener for deletion.
12. Handle group editing with min bounding box.
13. Ensure scalability for arbitrary objects by making base class flexible.
14. Test interactions with camera transforms and prevent conflicts with panning.

## Modularity and Scalability
- Base class allows easy addition of new element types.
- ElementManager can be extended for features like groups, layers.
- Event handling is centralized but delegated to elements.

## MVP Scope
- Single and multiple selection (Shift key).
- Visual feedback: border, corner handles, rotate handle, bounding box for groups.
- Drag to move elements/lines.
- Corner handles for scaling.
- Rotate handle for rotation.
- Endpoint handles for lines.
- Delete key for removal.
- No undo/redo in MVP.
- Scalable for arbitrary objects.

## Potential Challenges
- Handling mouse events with camera transforms (use clientToWorld function).
- Preventing conflicts with panning/zooming.
- Performance with many elements (use event delegation if needed).

## Next Steps
Review this plan and answer the questions above. Once approved, switch to Code mode to implement.