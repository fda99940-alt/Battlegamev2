# 3D Cube Feasibility Plan (Local HTML Only)

## Goal
Evaluate how to turn the current flat board into a 3D cube experience with no server, running fully from local files (`index.html`, `styles.css`, `script.js`).

## Current State (Observed)
- The game renders a single 2D grid in `#board` (`renderBoard()` in `script.js`).
- Special effects currently apply 2D transforms only (`applyTransform()` uses `rotate(...) scale(...)`).
- Layout and interaction already work entirely client-side (no backend dependency).

## Feasibility
Yes, this is feasible without a server.
- CSS 3D transforms (`perspective`, `transform-style: preserve-3d`) work in local HTML.
- Game state can stay in memory/localStorage exactly like now.
- No networking is required for a cube implementation.

## Can We Keep Current Gameplay and Add a 3D Switch?
Yes. This is the best near-term approach.
- Keep all gameplay logic exactly as-is (same `grid`, mines, reveal rules, specials, history).
- Add a render mode toggle: `2d` (current board) vs `3d` (cube-style presentation).
- In this model, 3D changes camera/container transforms only, not game rules.
- Result: one rules engine, two visual modes, minimal regression risk.

## Recommended Mode-Switch Architecture
- Add state: `let viewMode = '2d';` with persistence key (example: `mindsweeperViewMode`).
- Keep existing `renderBoard()` and cell event handlers unchanged.
- Add wrapper elements (`.cube-scene`, `.cube`) around `#board`.
- Route transforms through one function:
  - `applyViewTransform()` delegates to current 2D transform logic or 3D camera transform based on `viewMode`.
- Add UI control:
  - Button/select: `View: 2D / 3D`.
  - Switching mode does not reset game state.

## Scope Split
- Phase A (safe): 3D visual mode only, same gameplay.
- Phase B (optional): true six-face cube gameplay as a separate mode later.
- Keep these as separate tracks so the 3D visual mode can ship quickly and safely.

## Implementation Options

### Option A: Visual Cube Shell (lowest risk)
- Keep one playable board.
- Wrap board in a 3D cube-like container and rotate the whole object for visuals.
- Pros: fastest, minimal logic change.
- Cons: not a true six-face gameplay cube.

### Option B: True Six-Face Cube (recommended)
- Create 6 face containers (`front/back/left/right/top/bottom`), each face with its own NxN cell matrix.
- Move from `(row, col)` indexing to `(face, row, col)`.
- Neighbor checks cross face boundaries using edge mapping rules.
- Pros: real cube gameplay.
- Cons: larger refactor.

### Option C: Hybrid
- Start with Option A to ship quickly, then migrate data model to Option B.

## Recommendation
Use **Option C**:
1. Ship visual 3D cube first for immediate progress.
2. Refactor into true six-face logic in controlled phases.

## Proposed Phases

## Phase 1: 3D Rendering Scaffold
- Add DOM structure:
  - `.cube-scene` (perspective root)
  - `.cube` (rotating 3D object)
  - six `.cube-face` elements
- Keep current `#board` mounted on `front` face only.
- Add CSS:
  - `perspective`
  - `transform-style: preserve-3d`
  - per-face transforms (`translateZ`, `rotateX/Y`)
- Update `applyTransform()` to rotate `.cube` instead of flat `#board`.

## Phase 2: Input + Camera Controls
- Add drag or button controls for cube rotation (`cubeRotX`, `cubeRotY`).
- Keep existing keyboard navigation for current active face.
- Ensure click hit-testing still targets cells after 3D transforms.

## Phase 3: Data Model Upgrade to True Cube
- Replace `grid[row][col]` with `grid[face][row][col]`.
- Define face adjacency map and coordinate transforms across edges.
- Update:
  - mine placement
  - neighbor counting
  - flood reveal propagation
  - special-cell placement/triggers

## Phase 4: UX and Rule Decisions
- Decide win condition:
  - all non-mine cells across all 6 faces revealed (default).
- Decide focus model:
  - active face follows camera, or explicit face lock.
- Add subtle face indicator so player knows which face is active.

## Phase 5: Testing Checklist
- Verify edge/corner neighbor correctness across faces.
- Verify reveal flood crossing face boundaries.
- Verify specials after cube rotations.
- Verify mobile/touch drag + desktop mouse + keyboard.
- Verify persistence/replay schema supports face index.

## Technical Risks
- Cross-face neighbor mapping is the main complexity and bug source.
- 3D transforms can affect pointer accuracy if stacking and `backface-visibility` are wrong.
- Existing replay/history schema will need versioning when adding `face`.

## Suggested File-Level Changes
- `index.html`
  - Introduce cube scene/container and six face nodes.
- `styles.css`
  - Add cube scene/face styles and 3D transform rules.
- `script.js`
  - Split rendering into:
    - `renderCube()`
    - `renderFace(faceId)`
  - Replace transform logic in `applyTransform()`.
  - Add face-aware helpers for neighbors and coordinate mapping.

## Success Criteria
- Runs from local `index.html` without server.
- Cube rotates smoothly.
- Cell interactions remain reliable.
- For true-cube mode: gameplay rules are consistent across all six faces.
