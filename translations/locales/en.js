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
          cute: {
            ready: [
              'Kyaa! The {size} board sparkles just for us!',
              'Let’s sprinkle some luck across every tile.',
              'Keep the sparkle high—we’ve got mines to chase!',
            ],
            zero: [
              'Nothing but love at {pos}! No mines nearby.',
              'So calm there—perfect spot to breathe and smile.',
              'The board is giving you a break, sweetie.',
            ],
            neighbor: [
              '{count} nearby looks scary, but you’ve got this!',
              'Careful at {pos}, cutie—those {count} neighbors are watching!',
              'A little patience and that {pos} will be safe, promise!',
            ],
            flagOn: [
              'Flagged beautifully at {pos}. Nice work, champ!',
              'You marked {pos}? So smart, love that energy.',
              'Perfect flag etiquette—mines can’t stand it.',
            ],
            flagOff: [
              'Flag lifted at {pos}. Maybe it was just a ghost.',
              'Let them hide again—it’s okay to change your mind.',
              'Undoing is part of the dance, darling.',
            ],
            specialRotation: [
              'Rotation at {pos}? Whee! Let’s twirl with it.',
              'Spin on, cutie—your reflexes are dazzling.',
              'That {direction} flip is just extra drama for you.',
            ],
            specialFlip: [
              'Flip {axis}? Mirror magic activated!',
              'Mirror move {axis} from {pos}—you shine anyway.',
              'Such flair! This flip just matched your style.',
            ],
            win: [
              'Victory sparkles! {size} cleared like a champion!',
              'You did it, gorgeous! Time for confetti.',
              'Yatta! Every safe cell is smiling with you!',
            ],
            loss: [
              'Oops! Mine at {pos} loves stealing hearts.',
              'A little stumble, but you’re still dazzling.',
              'The board bit back—let’s cuddle and try again.',
            ],
            specialHit: [
              'Special tile {pos} squealed—so dramatic!',
              'Yikes, {pos} woke up! Stay fabulous.',
              'That tile’s tantrum is just seasoning for your run.',
            ],
          },
          teasing: {
            ready: [
              'Hehe, the board can’t wait to see you slip up.',
              'Fresh {size}, and I’m already picking favorites—maybe you?',
              'Let’s see how dramatic those mines can get.',
            ],
            zero: [
              'No mines here? Suspicious. Keep looking, cutie.',
              'Calm {pos}? That’s just teasing you, watch out.',
              'Nothing yet—just the lull before a juicy trap.',
            ],
            neighbor: [
              '{count} neighbors near {pos}? Ooh, spicy.',
              'Pretty sure those {count} neighbors are gossiping about you.',
              'They’re whispering from {pos}. Are you listening?',
            ],
            flagOn: [
              'You flag at {pos}? Bold move. I’m watching closely.',
              'Cute little flag, but will it save you?',
              'Flag looks adorable… until it’s wrong.',
            ],
            flagOff: [
              'Flag off? Might be a trap, but I do love a plot twist.',
              'Removing the flag? Risky, but thrilling.',
              'I knew you were trouble when you walked in.',
            ],
            specialRotation: [
              'Rotation at {pos}? I’d spin too if I were you.',
              'Watch that {direction} twist—so dramatic, just like you.',
              'I’m dizzy just watching your board, darling.',
            ],
            specialFlip: [
              'Flip {axis}? Mirror, mirror, don’t break.',
              'That {pos} just flipped everything, *swoon*.',
              'Mirror move looks good on you.',
            ],
            win: [
              'Hmph, victory? I’ll let you feel smug for a minute.',
              'Not bad… keep the flattery coming.',
              'You won, so consider me impressed (a little).',
            ],
            loss: [
              'Mine got you? Perfect, I needed more drama.',
              'Burned again? Honestly, cute.',
              'You fall down, I clap. Keep it coming.',
            ],
            specialHit: [
              'Special tile {pos} just screamed—so embarrassing.',
              'OMG {pos} woke up? Classic.',
              'That tantrum got me low-key cheering.',
            ],
          },
        },
      },
    };
  window.MindsweeperTranslations.SEED_TERMS = window.MindsweeperTranslations.SEED_TERMS || {};
  window.MindsweeperTranslations.SEED_TERMS['en'] = {
  "seedLabel": "Seed",
  "copySeed": "Copy seed",
  "joinRoom": "Load seed",
  "copyRoom": "Copy seed",
  "placeholder": "Paste seed",
  "historyCode": "Seed {code}",
  "historyPending": "Seed pending",
  "enterRoom": "Enter a seed first.",
  "roomNotFound": "Seed {code} not found.",
  "joiningRoom": "Loading seed {code}...",
  "copySuccess": "Seed {code} copied to clipboard.",
  "copyFallback": "Seed {code}"
};
})();
