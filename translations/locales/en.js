(() => {
  window.MindsweeperTranslations = window.MindsweeperTranslations || {};
  window.MindsweeperTranslations.TRANSLATIONS = window.MindsweeperTranslations.TRANSLATIONS || {};
  window.MindsweeperTranslations.TRANSLATIONS['en'] = {
      hero: {
        eyebrow: 'Browser first',
        title: 'Mindsweeper',
        greeting: 'Welcome to the game, chosen champion.',
        lede: 'A neon-infused Minesweeper where rotation fields, flipping tiles, and persistent replays keep each round unpredictable.',
        meta: {
          keyboard: 'Keyboard friendly',
          history: 'Persistent run history',
          replay: 'Replay + special effects',
        },
      },
      label: {
        minesRemaining: 'Mines remaining',
        cellsRevealed: 'Cells revealed',
        rotationTriggers: 'Rotation triggers',
        flipTriggers: 'Flip triggers',
        rows: 'Rows',
        cols: 'Columns',
        mines: 'Mines',
        rotationSpecials: 'Rotation specials',
        flipSpecials: 'Flip specials',
        themes: 'Themes',
        difficulty: 'Difficulty',
        language: 'Language',
        on: 'on',
        off: 'off',
      },
      theme: {
        neon: 'Neon',
        dusk: 'Dusk',
        sunrise: 'Sunrise',
        midnight: 'Midnight',
        verdant: 'Verdant',
        ember: 'Ember',
      },
      panel: {
        boardTitle: 'Board & specials',
        boardSubtitle: 'Adjust the layout before starting a new round.',
      },
      section: {
        history: {
          title: 'History',
          desc: 'Replay or trim past runs.',
        },
      },
      button: {
        size: 'Size',
        applyLayout: 'Apply layout',
        specials: 'Specials: {state}',
        showMines: 'Show mines',
        hideMines: 'Hide mines',
        clearHistory: 'Clear history',
        hideHistory: 'Hide history',
        showHistory: 'Show history',
        joinRoom: 'Load seed',
        copyRoom: 'Copy seed',
        replay: 'Replay',
        delete: 'Delete',
        preset: {
          easy: 'Easy',
          medium: 'Medium',
          hard: 'Hard',
        },
      },
      placeholder: {
        roomCode: 'Paste seed',
      },
      history: {
        metaStats: '{timestamp} • {duration}s • {steps} steps',
        metaSpecials: 'Rotation triggers {rotations}, flips {flips}',
        roomCode: 'Seed {code}',
        roomPending: 'Seed pending',
        empty: 'No runs yet.',
      },
      status: {
        start: 'Click any cell to begin.',
        newBoard: 'New board ready. Click or use the keyboard to explore.',
        specialEffects: 'Special effects {state}.',
        cheatEnabled: 'Cheat view enabled.',
        cheatDisabled: 'Cheat view disabled.',
        replayInit: 'Replaying run from {timestamp}',
        replayProgress: 'Replaying run from {timestamp} ({step}/{total})',
        replayComplete: 'Replay complete. Apply a new layout to play.',
        loss: 'You hit a mine! Even the mines are laughing at you as they all pop out.',
        win: 'Victory! Every safe cell has been found.',
        enterRoom: 'Enter a seed first.',
        roomNotFound: 'Seed {code} not found.',
        joiningRoom: 'Loading seed {code}...',
        copySuccess: 'Seed {code} copied to clipboard.',
        copyFallback: 'Seed {code}',
      },
      hint: {
        keyboard: 'Arrow keys to move focus, Enter/Space to reveal, F to flag.',
      },
      avatar: {
        personas: {
          friendly: {
            ready: [
              'Fresh {size} board loaded. Let’s sweep.',
              'Grid {size} is primed. Eyes up.',
              'New {size} layout ready. Stay sharp.',
            ],
            zero: [
              'Clear skies at {pos}. No mines nearby.',
              'Nothing but air around {pos}. Keep going.',
            ],
            neighbor: [
              '{count} mines glancing near {pos}. Careful.',
              'Watch that {pos}—{count} neighbors nearby.',
            ],
            flagOn: ['Flag planted at {pos}. That’ll slow them down.'],
            flagOff: ['Flag lifted at {pos}. Retry that scan.'],
            specialRotation: [
              'Rotation blast at {pos} ({direction}). Watch the spin.',
              'Spin trigger at {pos}, turning {direction}.',
            ],
            specialFlip: [
              'Flip field at {pos} flips {axis}. Stay oriented.',
              'Mirrored view triggered {axis} from {pos}.',
            ],
            win: [
              'Victory! The {size} grid bows to you.',
              'You cleared {size}. Celebrate the sweep!',
            ],
            loss: [
              'Ouch. Mine at {pos} got the better of us.',
              'Loss logged at {pos}. Mines were waiting.',
            ],
            specialHit: ['Special tile at {pos} woke up. Brace yourself.'],
          },
          evil: {
            ready: [
              'Finally, another {size} grid to corrupt.',
              'The {size} board is feeding my impatience.',
              'Let’s see how fast you can fall apart.',
            ],
            zero: [
              'Empty space at {pos}? Fine, I’ll wait.',
              'Still nothing around {pos}. Boring.',
              'Don’t get used to the silence.',
            ],
            neighbor: [
              '{count} mines near {pos}? I’d say trust your instincts—if you have any.',
              'Those {count} neighbors near {pos} are just teasing you.',
              'You can feel them laughing, can’t you?',
            ],
            flagOn: [
              'You flag {pos}? Cute. I’ll enjoy the surprise.',
              'Keep that flag up; it’s like a target practice sign.',
              'Let it flap there—makes the eventual blowup more dramatic.',
            ],
            flagOff: [
              'Flag removed at {pos}. Let them dance there.',
              'Good, now they’ll happily hide again.',
              'You just gave the mines a free invitation.',
            ],
            specialRotation: [
              'Rotation trap at {pos} slams {direction}. Good luck, mortal.',
              'Spin triggered {direction} at {pos}. Keep up if you can.',
              'See that twist? It was just warming up.',
            ],
            specialFlip: [
              'Flip {axis} from {pos}. Panic now.',
              'Mirrored chaos {axis} from {pos}. I told you.',
              'The mirror loves showing you mistakes.',
            ],
            win: [
              'You survived {size}? Even my minions are stunned.',
              'Fine, {size} cleared. I’ll be back.',
              'Enjoy the win—it’s the only kindness I’ll offer.',
            ],
            loss: [
              'Mine at {pos} just ate you. Delicious.',
              'You walked into {pos} and paid the price.',
              'Tell me, does it sting to be that predictable?',
            ],
            specialHit: [
              'Special tile {pos} just screamed something rude.',
              'That field {pos} hates you—wait for the next tantrum.',
              'Another special awake at {pos}. I live for this chaos.',
            ],

          },
        },
      },
    };
})();
