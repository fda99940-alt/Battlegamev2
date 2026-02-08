# Mindsweeper

**Mindsweeper** is a browser-based take on Minesweeper built as a single static page. It ships with keyboard-first controls, persistent run history, replay/clear/delete tools, and configurable board settings so you can experiment with different grid sizes and mine counts.

## Structure

-- `index.html`: the entry point. It loads `styles.css` for presentation, `translations.js` for every language bundle (including Esperanto, Klingon, Pirate, LOLcat, Elvish, Yoda-speak, and the purely note-based Melodia), and `script.js` for all game logic. The DOM hooks span the board, status, controls, theme switcher, difficulty presets, language selector (with flag/label), history panel, join-input, and per-run room codes. Input fields let you change rows, columns, mines, rotation specials, or flip specials before applying a new layout, while the theme controls let you toggle between Neon, Dusk, Sunrise, Midnight, Verdant, or Ember palettes, the preset buttons instantly seed the recommended board settings, and the language dropdown swaps between well-translated locales plus a few playful dialects. Each history entry now exposes a room code you can copy, plus there's a dedicated form at the top of the history panel to paste a code and replay that board.
- `styles.css`: the entire visual system. It defines three theme palettes using CSS variables plus the tighter, zero-gap grid styling so boards render as a compact matrix regardless of the chosen theme.
- `translations.js`: the shared localization bundle. It exports `LANGUAGE_OPTIONS` and `TRANSLATIONS`, exposes every hero, label, button, and hint copy, and augments themes per locale so the UI can switch between English, Spanish, Kiswahili, Mandarin, Japanese, Hindi, French, Portuguese, German, Russian, Klingon, Pirate, LOLcat, Esperanto, Swedish, Arabic, Elvish, Yoda-speak, and Melodia without rebuilding.
- `script.js`: the controller. It:
  1. Tracks the current board size, mine count, and board grid state.
  2. Handles starting a new game, placing mines, counting neighbors, flood-filling, flagging, and win/loss conditions.
  3. Records every run (with timestamps, layout, open count, mine locations, and step-by-step actions) into `localStorage` for persistence.
  4. Renders the history list with replay/delete actions and a “clear history” button.
  5. Supports replaying past games by reconstructing the mine layout, resetting inputs, and replaying clicks/flags with a timer while showing status updates.
  6. Persists the selected theme and difficulty preset so the UI returns to the same palette and recommended layout when you revisit the page.
  7. Centralizes every label, hint, and status message in a `TRANSLATIONS` map and renders DOM nodes marked with `data-i18n-key` so additional languages can be layered in later.

## Running / Testing

Simply open `index.html` in a modern browser (no build step required). The UI is fully functional out of the box. Run through a few games, adjust the configuration via the Rows/Cols/Mines inputs, and interact with history entries to replay, delete, or clear previous runs.

## Key Features

1. **Keyboard-friendly controls**: Click, flag, and navigate with shortcuts (F for flagging, Enter/Space to reveal, arrow keys to move focus).
2. **Configurable board & specials**: Rows, columns, mines, rotation fields, and flip fields can be customized before starting a new round. Invalid values are clamped so the number of specials never exceeds the available safe cells, and the selected counts are reseeded every time mines are placed so a new board always honors your configuration.
3. **Difficulty presets**: Easy/Medium/Hard buttons fill the inputs with curated sizes, mine counts, and special counts, kick off a fresh board immediately, and keep track of which preset is active.
4. **Special rotation cells**: Every fresh board places a few special tiles that rotate the view 90° (clockwise or counter-clockwise) when revealed. Use the “Specials: on/off” button to disable the spinning if you prefer a steady grid.
5. **Special flip cells**: Additional tiles flip the grid horizontally or vertically upon reveal, creating mirrored versions of the board to keep things visually unpredictable.
6. **Cheat toggle**: Reveal the true mine locations and the special rotation/flip cells temporarily with the “Show mines” button so you can inspect both hazards before committing to a move.
7. **History & replay**: Each attempt logs total cells, revealed cells, layout, mine count, mine positions, special-field counts/triggers, and sequential actions. The history panel shows a room code per run and provides a pasteable field so you can replay any saved board immediately.
8. **Seed sharing**: Every board now exposes a short seed string above the grid plus a “Copy seed” button. The seed encodes the current configuration and deterministic RNG state so typing or pasting it anywhere (even into an LLM prompt) replays the same mine layout and specials without storing full history—perfect for reproducible runs, race challenges, or scripted challengers.
9. **Persistence**: History is stored in `localStorage` under `mindsweeperRuns`, so reloads keep your runs until you clear or delete them.
10. **Theme switching**: Choose from six palettes (Neon, Dusk, Sunrise, Midnight, Verdant, Ember); each theme swaps gradients, fonts, and the mine/flag icons so the grid takes on a unique look, and the current selection is stored under `mindsweeperTheme` for automatic reloads.
11. **Localization ready**: All UI copy lives behind the `TRANSLATIONS` map in `script.js`, every data-labeled node is refreshed from that bundle, and the dropdown shows the language name plus a flag so switching among a dozen locales immediately relabels the UI.
14. **Persona-rich hero**: The hero copy now includes a language-aware greeting (“Welcome to the game, anointed one,” etc.) that flips into Yoda-speak, LOLcat, Elvish, Melodia, and every other translated voice whenever you pick a new locale.
12. **Persona-rich hero**: The hero copy now includes a language-aware greeting (“Welcome to the game, anointed one,” etc.) that flips into Yoda-speak, LOLcat, Elvish, Melodia, and every other translated voice whenever you pick a new locale.
13. **History toggling**: Collapse the History panel to hide the replay list, then expand it again with the same button; the collapsed state is saved to `localStorage` so your preference persists while you play.
14. **Win/loss handling**: Winning reveals all mines before declaring success, just like with a loss.

## Future improvements

- Visualize replay steps with animated highlights so special triggers and flood-fill cascades feel more dramatic.
- Add multiplayer room-code matchmaking or a shared leaderboard so friends can compete on the same board in real time.
- Introduce daily/weekly challenge boards with locked presets and unique modifiers to keep repeat sessions fresh.
- Track best times per layout and surface a mini leaderboard so you can chase personal records.
