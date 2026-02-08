# Mindsweeper

**Mindsweeper** is a browser-only twist on Minesweeper: a single static page with keyboard-first controls, persistent history, replay tooling, and configurable specials. It layers rotation/flip effects over cloned Minesweeper mechanics so every reveal can rotate, mirror, or reshuffle the grid before you continue.

## Structure overview

- `index.html`: bootstrapper that wires `styles.css`, `translations.js`, and `script.js`. The markup scopes every UI region—board, status, controls, theme toggles, difficulty presets, language dropdown (flags included), history panel, seed copy/join tools, and room-code tracker.
- `styles.css`: visual system that defines six palettes (Neon, Dusk, Sunrise, Midnight, Verdant, Ember), a zero-gap grid layout, and responsive helpers so the board and controls stay tidy.
- `translations.js`: exports `LANGUAGE_OPTIONS` and `TRANSLATIONS`, covering the full roster of locales (en, es, sw, zh, ja, hi, fr, pt, de, ru, tlh, pir, lol, eo, sv, ar, elv, yoda, mus, ang, bra) plus their hero/button/label/hint copy. The file also generates Braille output based on the English bundle and augments theme names in locales that need custom palettes.
- `script.js`: controller that manages input validation, board generation, mine placement, neighbor counting, specials, replay recording/playback, history rendering, localization wiring, and persistence of user-selected themes/locales/presets.

## Running

Open `index.html` in a modern browser. No build step or server is required—the UI is fully interactive out of the box. Try several games, tweak Rows/Cols/Mines/rotation/flip counts, toggle themes/languages, and use the history tools to replay or delete previous runs.

## Key features

1. **Keyboard-focused controls**: Arrow keys move focus, Enter/Space reveal, and F flags—every action works without a mouse.
2. **Configurable specials**: Rows, columns, mine count, rotation specials, and flip specials are clamp-safeguarded so you can experiment while keeping the logic valid.
3. **Difficulty presets**: Easy/Medium/Hard buttons seed the recommended inputs and immediately restart with that setup while highlighting the active preset.
4. **Rotation & flip fields**: Reveal specials to rotate the board 90° clockwise/counter-clockwise or mirror it horizontally/vertically, and optionally disable the animations with “Specials: on/off”.
5. **Cheat view**: “Show mines” temporarily highlights raw mine locations and special tiles for inspection before you commit to a move.
6. **History + replay**: Runs capture timestamps, configurations, layouts, mine positions, special trigger counts, and action sequences; the panel lets you replay, delete, or clear them. Each entry also exposes a copyable room code plus a join form for instant replays.
7. **Seed sharing**: A deterministic seed string above the board encodes configuration plus RNG state so the same board/special placement can be recreated by copying/pasting the seed (even into prompts).
8. **Persistence**: LocalStorage keeps runs (`mindsweeperRuns`), the active theme (`mindsweeperTheme`), locale, and history panel collapse state so your setup survives reloads.
9. **Localization-ready**: Every UI string routes through the `TRANSLATIONS` map; the dropdown shows flag + name, and selecting a new locale rewrites hero text, labels, hints, and status messages (including playful dialects like Klingon, Pirate, LOLcat, and Braille).
10. **Hero personas**: Multilingual hero text changes tone per locale, covering canonical translations plus fantasy/dialect voices (Yoda, Elvish, Melodia, Angry mode, etc.).
11. **Commentary avatar**: An above-board avatar narrates every rediscover, flag, special, win, and loss, and you can switch between the polite guide and an evil heckler for a different tone.
12. **Win/loss polish**: Winning reveals every mine before declaring victory, matching the loss behavior so the board state is obvious either way.

## Future improvements

- Animate replay steps so specials and cascade reveals feel more dramatic.
- Add multiplayer room-code matchmaking or shared leaderboards for synchronized challenges.
- Introduce daily/weekly locked presets with modifiers to keep returning players engaged.
- Track best times per layout and show a mini leaderboard so you can chase personal records.
