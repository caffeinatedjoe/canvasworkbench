# Modularization Plan for Reuse

## Goal

Refactor Canvas Workbench into reusable, framework-agnostic modules that can be embedded in other web applications without relying on fixed DOM structure or global event wiring.

## Target Outcomes

- Clean public API for creating and controlling a workbench instance.
- Explicit separation between model state, rendering, and input handling.
- Dependency injection for DOM nodes, scheduling, and event wiring.
- Easy theming and CSS scoping without leaking global styles.

## Proposed Module Boundaries

### 1) Core / Math

**Current:** `js/core/camera.js`, `js/core/geometry.js`  
**Change:** keep as pure, framework-free utilities with no DOM coupling.

- `Camera` should become a state object with explicit inputs/outputs.
- Move DOM-specific canvas transforms into a renderer adapter.

### 2) Scene Model

**Current:** `js/elements/*` tightly couples data + SVG node.  
**Change:** split into models and renderers.

- `ElementModel` (type, position, scale, rotation, style)
- `ElementRenderer` interface:
  - `createElement(model)`
  - `updateElement(model)`
  - `removeElement(model)`
  - `getBoundingBox(model)`
- Concrete renderer: `SvgElementRenderer` for current implementation.

### 3) Rendering Adapters

**Current:** SVG and raster canvas handled directly by `Camera`.  
**Change:** create render adapters for `SvgWorldRenderer` and optional `CanvasLayer`.

- `SvgWorldRenderer` updates the `world` group transform.
- `CanvasLayer` updates the `2d` context when enabled.

### 4) Input Controllers

**Current:** controllers bind directly to DOM events.  
**Change:** support input adapters that bind/unbind and emit domain events.

- `PointerInputAdapter` (mousedown/mousemove/mouseup/wheel)
- `KeyboardInputAdapter`
- Controllers consume adapter events rather than DOM events.

### 5) Selection + Transform Services

**Current:** `ElementManager` handles selection, clipboard, and handle rendering.  
**Change:** split into focused services:

- `SelectionStore` (selected IDs, add/remove/replace)
- `ClipboardService` (serialize/deserialize)
- `HandleRenderer` (SVG-only, lives in renderer layer)
- `TransformService` (drag/scale/rotate operations on models)

### 6) UI Widgets

**Current:** `RadialMenu` and `MenuController` are global DOM widgets.  
**Change:** isolate into a UI package with:

- Config-driven menu actions
- Scoped styles and optional mounting container
- No direct assumptions about `document.body`

## API Surface Proposal

```js
const workbench = createWorkbench({
  viewportEl,
  svgLayerEl,
  worldEl,
  canvasLayerEl, // optional
  renderer: new SvgElementRenderer({ worldEl }),
  inputs: {
    pointer: new PointerInputAdapter({ viewportEl }),
    keyboard: new KeyboardInputAdapter({ target: window })
  },
  menu: new RadialMenuWidget({ mountEl }),
  theme: { /* colors, handle sizes */ }
});

workbench.addElement({ type: 'circle', position: { x, y }, r: 30 });
workbench.setSelection([id1, id2]);
workbench.destroy();
```

## Concrete Changes Required

1) **Extract element models**
- Move SVG node creation out of `CircleElement`, `RectangleElement`, etc.
- Replace element classes with plain model objects plus renderer methods.

2) **Introduce renderer interfaces**
- `SvgElementRenderer` owns SVG nodes, handle rendering, and marquee.
- Add a thin `ViewportRenderer` for camera transforms.

3) **Decouple controllers from DOM**
- Replace direct `addEventListener` calls with injected adapters.
- Controllers accept events in a uniform shape (client coords + buttons).

4) **Refactor ElementManager**
- Split selection, clipboard, and handle rendering into separate services.
- Keep a registry for elements and IDs; use a dictionary rather than array scan.

5) **Centralize state**
- Create a `WorkbenchState` that holds:
  - elements by ID
  - selection set
  - camera state
  - interaction flags

6) **CSS scoping**
- Prefix or scope `.radial-menu`, `.marquee-rect`, and handle styles.
- Provide a `styles.css` export or injected style tag to avoid clashes.

7) **Config and defaults**
- Allow customization of:
  - menu sections
  - default element styles
  - drag thresholds
  - zoom factors

8) **Packaging**
- Export as ES module with a single entrypoint.
- Document required DOM structure and provide helper to build it.

## Migration Steps

1. Create model classes and render adapters without changing behavior.
2. Migrate one element type at a time to the renderer pattern.
3. Replace `ElementManager` handle rendering with `HandleRenderer`.
4. Move controller event wiring into input adapters.
5. Introduce `createWorkbench()` composition root.
6. Add public API docs and integration examples.

## Risks and Mitigations

- **Risk:** Increased complexity from abstractions.  
  **Mitigation:** keep a default "simple" adapter that mirrors current wiring.

- **Risk:** Selection/transform regressions.  
  **Mitigation:** add demo scenarios or regression tests for drag/scale/rotate.

- **Risk:** CSS collisions in host apps.  
  **Mitigation:** scope CSS and allow style injection by the host.
