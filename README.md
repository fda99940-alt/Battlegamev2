# Mindsweeper

**Mindsweeper** is a browser-only twist on Minesweeper: a single static page with keyboard-first controls, persistent history, replay tooling, configurable specials, and swappable renderers. It supports both a 3D cube board (`d6`) and a classic single-plane 2D board mode, while keeping the same reveal/flag/special systems.

## Start playing (recommended)

1. Download the latest release file: [mindsweeper-play.html](https://github.com/fda99940-alt/Battlegamev2/releases/latest/download/mindsweeper-play.html)
2. Open it in any modern browser.
3. Click **Start game**.

Watch out for special fields while playing:
- `⟳ Rotation`: rotates the board.
- `⇋ Flip`: mirrors the board.
- `🐶 Dog`: auto-flags a random unmarked mine.
- `🛡 Guardian`: gives a shield that blocks the next mine hit.

`mindsweeper-play.html` is self-contained and ready to run.

![Mindsweeper Screenshot](./Mindsweeper.png)

![Mindsweeper Focus Mode Screenshot](./Mindsweeper_Focus.png)

## Project structure (for contributors)

If you just want to play, use the release file above and skip this section.

- `dist/mindsweeper-play.html`: generated single-file distributable used for releases.
- `index.html`: source entry page used to generate the distributable build.
- `styles.css`: visual system that defines six palettes (Neon, Dusk, Sunrise, Midnight, Verdant, Ember), cube-face transforms, zero-gap grids, and responsive helpers so the board and controls stay tidy.
- `translations/locales/*.js`: each language lives in its own file that registers its localized strings plus the seed/share copy text on `window.MindsweeperTranslations.TRANSLATIONS` and `SEED_TERMS`.
- `translations.js`: aggregates the `LANGUAGE_OPTIONS` list, loads the per-locale registrations, augments theme names, and derives Braille output from English before exposing the bundle to the app.
- `renderers/domRenderer.js`: DOM renderer implementation (button-grid board creation, DOM-mode transforms, and DOM hit resolution).
- `renderers/canvasRenderer.js`: Canvas renderer implementation (face canvas creation, resize/draw pipeline, and canvas hit testing).
- `renderers/three.vendor.js`: local bundled Three runtime used to expose global `THREE` without relying on a CDN.
- `renderers/threeRenderer.js`: Three.js renderer implementation (Three-powered face rendering, overlay labels, Three support probe, hit testing, and revealed-tile texture overlays from optional uploaded images).
- `modules/coreUtils.js`: shared utility helpers (clamping, seeded RNG, shuffle/pick helpers, formatting, and color helpers).
- `modules/historyStore.js`: history list filtering/rendering plus run/room-map persistence helpers.
- `modules/i18n.js`: locale selection, translation lookup, template replacement, and static text hydration.
- `modules/avatarCommentary.js`: avatar persona selection, commentary line resolution, speech pulse, and avatar history rendering.
- `modules/boardGeneration.js`: grid creation, mine/special placement, and neighbor count computation.
- `modules/boardActions.js`: reveal/flag actions, special-trigger flow, and helper actions like random mine flagging.
- `modules/boardTopology.js`: neighbor/edge transition logic across 2D and cube/poly-face boards.
- `modules/uiControls.js`: theme, history collapse, and preset UI wiring/state helpers.
- `modules/roomCodes.js`: room-code encode/decode, join-flow wiring, and clipboard copy helpers.
- `modules/polyhedronLayout.js`: cube face transform/layout helper used by renderer modules.
- `script.js`: top-level app orchestrator that composes modules, coordinates renderer mode/board mode/game lifecycle, and owns shared runtime state.
- `tests/*.test.js` + `tests/helpers/loadBrowserModule.js`: lightweight Node test harness for browser-style modules via VM loading.

## Running from source (contributors)

Open `index.html` in a modern browser. No server is required.

## Single-file build

To generate a distributable single HTML file with inlined/minified CSS and JS:

```bash
npm install
npm run build:single
```

Output file:

- `dist/mindsweeper-play.html`

The build script uses `index.html` as source, inlines `styles.css`, inlines every `<script src="...">` in existing order, and minifies the result with `esbuild`.
The generated `dist/mindsweeper-play.html` is fully self-contained (including the local Three runtime), so it can be moved and opened as a standalone file.

### Refreshing local Three vendor bundle

This project loads Three from the local bundled file `renderers/three.vendor.js` (not a CDN).
After upgrading the `three` dependency, regenerate that bundle with:

```bash
npm run build:three-vendor
```

`renderers/three.vendor.entry.js` intentionally imports only the Three APIs used by this project so the vendor bundle stays smaller than exposing the full library globally.

### Visual version badge

The app header shows a small visual version badge (`vX.Y.Z`).
Configure it in one place:

- `script.js` -> `APP_VERSION`
- Current value: `1.3.0`

After changing it, regenerate the distributable:

```bash
npm run build:single
```

## Testing

Run the lightweight Node test harness:

```bash
npm test
```

Current automated coverage focuses on:
- `modules/roomCodes.js` (lossless config encode/decode including `faces`, join flow behavior, clipboard callback behavior)
- `modules/boardTopology.js` (neighbor transition, invalid/edge handling, and de-dup logic)
- `modules/boardGeneration.js` + `modules/boardActions.js` (neighbor mine counts, reveal/flag state transitions, guardian/mine edge cases, cross-face rim/corner adjacency)

## Key features

1. **Keyboard-focused controls**: Arrow keys move focus, Enter/Space reveal, and F flags—every action works without a mouse.
2. **Mouse drag controls (2D + 3D)**: In `Cube` mode, left-drag orbits the board and mouse wheel zooms with a camera-depth transform (non-distorting). In `2D` mode, holding left click and dragging rotates the field, while click-without-drag still reveals as usual.
3. **Board mode switch + 2D six-side adjacency**: Toggle between `Board: Cube` (3D dice-style board) and `Board: 2D` (single front-face plane). `2D` mode uses a six-neighbor adjacency model (hex-style row parity), so each field behaves as if it has six sides instead of classic 8-way square neighbors.
4. **Renderer mode switch**: Choose `DOM`, `Canvas`, or `Three.js` from the controls dropdown. `DOM` preserves native button-grid behavior, `Canvas` favors draw performance on bigger boards, and `Three.js` uses a Three-powered render path with overlay hit targets, a static metallic surface treatment, and badge-styled mine/flag markers.
5. **Three texture uploads (revealed-only)**: In `Three.js` mode you can upload an image in the controls panel; the image is mapped as a shared face texture and shown on revealed tiles only via the lightweight overlay layer, while covered tiles keep the default metallic style for better performance.
6. **Cube-only 3D scaling**: 3D mode uses a fixed six-face cube (`d6`). Mines/specials inputs are still per-face values, multiplied by active faces (1 in `2D`, 6 in `Cube`) before a run starts.
7. **Difficulty presets**: Easy/Medium/Hard buttons seed the recommended inputs and immediately restart with that setup while highlighting the active preset.
8. **Rotation & flip fields**: Reveal specials to rotate the board or mirror it horizontally/vertically, and optionally disable these effects with “Specials: on/off”.
9. **Dog special tile**: Discovering a Dog tile flags a random unmarked mine automatically, so every good sniff buys you a little safety without touching the mine count input or flagging manually.
10. **Guardian special tile**: Stepping on a Guardian tile arms a temporary shield that automatically flags the next mine you would have hit, letting you recover without ending the run.
11. **Cheat view**: “Show mines” temporarily highlights raw mine locations and special tiles for inspection before you commit to a move.
12. **Neighbor debug inspector**: A `Debug: on/off` toggle under the board lists the currently hovered/focused cell neighbors (including cross-face seams) and highlights origin/neighbor cells directly on the board to verify adjacency behavior.
13. **History tabs + replay/import**: The history panel now has `Runs` and `Imports` tabs. `Runs` keeps local completed games with filters, pagination (`Show more`), per-entry replay/export/delete actions, and room-code copy. `Imports` accepts exported JSON files and lets you replay, re-export, or remove imported runs without mixing them into local run history.
14. **JSON export (all runs + single run)**: Use `Export JSON` in the history header to download all local runs, or `Export run` on a single entry. Single-run exports intentionally omit mine and rotation-special positions so shared files can rely on deterministic seed reconstruction instead of revealing the full layout.
15. **Seed sharing**: A deterministic seed string above the board encodes configuration (including `faces`) plus RNG state so the same board/special placement can be recreated by copying/pasting the seed (even into prompts). Clicking **Start game** intentionally rolls a fresh seed for the new board.
16. **Persistence**: LocalStorage keeps runs (`mindsweeperRuns`), imported runs (`mindsweeperImportedRuns`), board mode (`mindsweeperBoardMode`), renderer mode (`mindsweeperRenderer`), active theme (`mindsweeperTheme`), locale, focus mode (`mindsweeperFocusMode`), and history panel state keys so your setup survives reloads. If no renderer is stored yet, the app starts with `Three.js` by default.
17. **Localization-ready**: Every UI string routes through the `TRANSLATIONS` map; the dropdown shows flag + name, and selecting a new locale rewrites hero text, labels, hints, and status messages (including playful dialects like Klingon, Pirate, LOLcat, and Braille).
18. **Hero personas**: Multilingual hero text changes tone per locale, covering canonical translations plus fantasy/dialect voices (Yoda, Elvish, Melodia, Angry mode, etc.).
19. **Commentary avatar**: An above-board avatar narrates each move, keeps a rolling five-line conversation history, lets you choose between the polite guide, the evil heckler, the anime-inspired “cute” bunny, or the teasing anime girl, and tapping the portrait briefly reveals the dropdown so you can change voices without adding extra chrome.
20. **Avatar bios**:
    - **Friendly (🤖)**: Steady, encouraging narration that celebrates every safe reveal and flags each learnable pattern with calm optimism.
    - **Evil (😈)**: Taunting, dramatic commentary that enjoys every misstep and reminds you the mines are always hungry—good for players who enjoy contrarian banter.
    - **Cute (🐰)**: Sugary anime-style cheers, encouragement, and sparkle-filled whispers that treat every special as a confetti moment.
    - **Teasing (😜)**: Flirty, teasing remarks that pull no punches about the board’s drama and add extra flavor to any hot streak or failure.
    - **Megumin (🧙‍♀️)**: Explosion-obsessed spellcaster who narrates in bombastic, cosplay-ready bursts and treats every special tile as a stage for “Explosion!”
    - **Friren (🧝‍♀️)**: Calm, wandering mage with meditative, storybook commentary that steadies the pace and highlights quiet lessons even amid chaos.
21. **Face badges + visual polish**: Face icons now appear on rendered faces for quicker orientation, and covered cells in `Canvas` and `Three.js` have stronger depth/hover/press feedback.
22. **Special icon consistency**: Rotation, flip, dog, and guardian specials now use consistent icon markers across `DOM`, `Canvas`, and `Three.js`; when revealed, the special marker appears as a corner badge so center mine-count numbers stay readable.
23. **Win/loss polish**: Winning reveals every mine before declaring victory, matching the loss behavior so the board state is obvious either way.
24. **Focus mode**: A `Focus: on/off` toggle in the status strip hides non-essential chrome (hero, avatar, history, themes, debug helpers) to keep attention on board play and core controls.
25. **Challenge mode (pace timer)**: Optional challenge rules require revealing a configured number of cells within a repeating time window (`Challenge mode`, `Reveals per window`, `Window seconds`). If the quota is missed, the run is lost immediately. The live challenge pace chip appears next to the `Toasts` toggle and pulses urgently near timeout.
26. **Challenge metadata in run history**: Completed runs persist challenge settings (`challengeMode`, `challengeTarget`, `challengeWindowSeconds`) inside each run `config`, so exported/imported history keeps challenge context.

### Three Texture Technical Hints

- Upload flow lives in `script.js`:
  - `applyThreeTextureFile(...)` creates a blob URL (`URL.createObjectURL(file)`), validates decode, stores `{ name, textureUrl }` in runtime state, and triggers renderer sync.
  - `clearThreeTexture()` revokes the active blob URL (`URL.revokeObjectURL(...)`) before clearing state.
- Renderer plumbing:
  - `buildRendererContextForMode('three')` passes `getThreeTextureOverlay()` into `renderers/threeRenderer.js`.
  - `getThreeTextureOverlay()` exposes the active blob URL only when a texture is loaded.
- Reveal-only texture display in `renderers/threeRenderer.js`:
  - `syncThreeOverlayCell(cell)` applies texture only when `cell.revealed` is true.
  - Texture is set on the HTML overlay label (`.three-cell-label`) as inline `background-image` (gradient + image), not on WebGL geometry.
  - Background size/position map one shared image across each face (`cols * 100%` / `rows * 100%`, per-cell background position).
- Performance rationale:
  - The WebGL pass stays on low-cost metallic shading (no per-vertex texture sampling loops).
  - Texture work is pushed to lightweight CSS backgrounds on revealed overlay labels.
- Styling hooks:
  - `.three-cell-label--revealed-texture` in `styles.css` provides base defaults; inline styles in `syncThreeOverlayCell(...)` are authoritative.
- Cube seam orientation contract (important):
  - Cube cross-face neighbor math in modules/boardTopology.js (FACE_BASIS + mapAcrossCubeEdge(...)) must stay aligned with the face transforms used in renderers/threeRenderer.js (setCubeFaceTransform(...)).
  - If you rotate or re-orient any Three face without updating FACE_BASIS, seam neighbors will appear to jump to the wrong visible side even when the debug list is internally consistent.
  - Quick sanity check after topology/renderer changes: in Cube mode, Cell 1:0:0 should include front-side neighbor 0:0:7 (not back-side 2:0:0).

## Future improvements

- Animate replay steps so specials and cascade reveals feel more dramatic.
- Add multiplayer room-code matchmaking or shared leaderboards for synchronized challenges.
- Introduce daily/weekly locked presets with modifiers to keep returning players engaged.
- Track best times per layout and show a mini leaderboard so you can chase personal records.

## Notes

- Built with help from an AI coding assistant (Codex, GPT-5) under human supervision, following the author’s guidance to shape the experience.
- Some translations are machine-generated; the author may not fully verify every language so take those localized strings with a grain of salt.
- 3D mode is intentionally cube-only (`d6`) to keep visual seams and neighbor transitions consistent.
