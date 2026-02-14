# Mindsweeper

**Mindsweeper** is a browser-only twist on Minesweeper: a single static page with keyboard-first controls, persistent history, replay tooling, and configurable specials. It now supports both a true six-face cube board and a classic single-plane 2D board mode, while keeping the same reveal/flag/special systems.

## Structure overview

- `index.html`: bootstrapper that wires `styles.css`, `translations.js`, and `script.js`. The markup scopes every UI region—board, status, controls, theme toggles, difficulty presets, language dropdown (flags included), history panel, seed copy/join tools, and room-code tracker.
- `styles.css`: visual system that defines six palettes (Neon, Dusk, Sunrise, Midnight, Verdant, Ember), cube-face transforms, zero-gap grids, and responsive helpers so the board and controls stay tidy.
- `translations/locales/*.js`: each language lives in its own file that registers its localized strings plus the seed/share copy text on `window.MindsweeperTranslations.TRANSLATIONS` and `SEED_TERMS`.
- `translations.js`: aggregates the `LANGUAGE_OPTIONS` list, loads the per-locale registrations, augments theme names, and derives Braille output from English before exposing the bundle to the app.
- `script.js`: controller that manages input validation, board generation, mine placement, neighbor counting (including cross-face cube edges), specials, replay recording/playback, history rendering, localization wiring, and persistence of user-selected settings.

## Running

Open `index.html` in a modern browser. No build step or server is required—the UI is fully interactive out of the box. Try several games, tweak Rows/Cols/Mines/rotation/flip counts, switch `Board: Cube` / `Board: 2D`, toggle themes/languages, and use the history tools to replay or delete previous runs.

## Key features

1. **Keyboard-focused controls**: Arrow keys move focus, Enter/Space reveal, and F flags—every action works without a mouse.
2. **Board mode switch**: Toggle between `Board: Cube` (true six-face board) and `Board: 2D` (single front-face plane). Switching mode starts a fresh board with mode-appropriate cell/mine limits.
3. **Configurable specials**: Rows, columns, mine count, rotation specials, flip specials, dog specials, and guardian specials are clamp-safeguarded so you can experiment while keeping the logic valid.
4. **Difficulty presets**: Easy/Medium/Hard buttons seed the recommended inputs and immediately restart with that setup while highlighting the active preset.
5. **Rotation & flip fields**: Reveal specials to rotate the board or mirror it horizontally/vertically, and optionally disable these effects with “Specials: on/off”.
6. **Dog special tile**: Discovering a Dog tile flags a random unmarked mine automatically, so every good sniff buys you a little safety without touching the mine count input or flagging manually.
7. **Guardian special tile**: Stepping on a Guardian tile arms a temporary shield that automatically flags the next mine you would have hit, letting you recover without ending the run.
8. **Cheat view**: “Show mines” temporarily highlights raw mine locations and special tiles for inspection before you commit to a move.
9. **History + replay**: Runs capture timestamps, configurations, board mode, layouts, mine positions, special trigger counts, and action sequences; the panel shows each run’s board type, and replay auto-switches to the corresponding mode before playback. Each entry also exposes a copyable room code plus a join form for instant replays.
10. **Seed sharing**: A deterministic seed string above the board encodes configuration plus RNG state so the same board/special placement can be recreated by copying/pasting the seed (even into prompts).
11. **Persistence**: LocalStorage keeps runs (`mindsweeperRuns`), board mode (`mindsweeperBoardMode`), active theme (`mindsweeperTheme`), locale, and history panel collapse state so your setup survives reloads.
12. **Localization-ready**: Every UI string routes through the `TRANSLATIONS` map; the dropdown shows flag + name, and selecting a new locale rewrites hero text, labels, hints, and status messages (including playful dialects like Klingon, Pirate, LOLcat, and Braille).
13. **Hero personas**: Multilingual hero text changes tone per locale, covering canonical translations plus fantasy/dialect voices (Yoda, Elvish, Melodia, Angry mode, etc.).
14. **Commentary avatar**: An above-board avatar narrates each move, keeps a rolling five-line conversation history, lets you choose between the polite guide, the evil heckler, the anime-inspired “cute” bunny, or the teasing anime girl, and tapping the portrait briefly reveals the dropdown so you can change voices without adding extra chrome.
15. **Avatar bios**:
    - **Friendly (🤖)**: Steady, encouraging narration that celebrates every safe reveal and flags each learnable pattern with calm optimism.
    - **Evil (😈)**: Taunting, dramatic commentary that enjoys every misstep and reminds you the mines are always hungry—good for players who enjoy contrarian banter.
    - **Cute (🐰)**: Sugary anime-style cheers, encouragement, and sparkle-filled whispers that treat every special as a confetti moment.
    - **Teasing (😜)**: Flirty, teasing remarks that pull no punches about the board’s drama and add extra flavor to any hot streak or failure.
    - **Megumin (🧙‍♀️)**: Explosion-obsessed spellcaster who narrates in bombastic, cosplay-ready bursts and treats every special tile as a stage for “Explosion!”
    - **Friren (🧝‍♀️)**: Calm, wandering mage with meditative, storybook commentary that steadies the pace and highlights quiet lessons even amid chaos.
16. **Win/loss polish**: Winning reveals every mine before declaring victory, matching the loss behavior so the board state is obvious either way.

## Future improvements

- Animate replay steps so specials and cascade reveals feel more dramatic.
- Add multiplayer room-code matchmaking or shared leaderboards for synchronized challenges.
- Introduce daily/weekly locked presets with modifiers to keep returning players engaged.
- Track best times per layout and show a mini leaderboard so you can chase personal records.

## Notes

- Built with help from an AI coding assistant (Codex, GPT-5) under human supervision, following the author’s guidance to shape the experience.
- Some translations are machine-generated; the author may not fully verify every language so take those localized strings with a grain of salt.
