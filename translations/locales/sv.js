(() => {
  window.MindsweeperTranslations = window.MindsweeperTranslations || {};
  window.MindsweeperTranslations.TRANSLATIONS = window.MindsweeperTranslations.TRANSLATIONS || {};
  window.MindsweeperTranslations.TRANSLATIONS['sv'] = {
      hero: {
        eyebrow: 'Bläddrare först',
        title: 'Mindsweeper',
        greeting: 'Välkommen till spelet, den utvalda.',
        lede: 'Ett neonfärgat Minesweeper där snurrfält, flippar och sparade repriser gör varje omgång oviss.',
        meta: {
          keyboard: 'Tangentbordsvänligt',
          history: 'Bestående historia',
          replay: 'Repris + effekter',
        },
      },
      label: {
        minesRemaining: 'Kvarvarande minor',
        cellsRevealed: 'Upptäckta rutor',
        rotationTriggers: 'Rotationer',
        flipTriggers: 'Flippar',
        rows: 'Rader',
        cols: 'Kolumner',
        mines: 'Minor',
        rotationSpecials: 'Rotationsspecial',
        flipSpecials: 'Flip-special',
        themes: 'Teman',
        difficulty: 'Svårighet',
        language: 'Språk',
        on: 'på',
        off: 'av',
      },
      theme: {
        neon: 'Neon',
        dusk: 'Skymning',
        sunrise: 'Soluppgång',
        midnight: 'Midnatt',
        verdant: 'Grön',
        ember: 'Glöd',
      },
      panel: {
        boardTitle: 'Bräde & specialare',
        boardSubtitle: 'Justera innan du börjar.',
      },
      section: {
        history: {
          title: 'Historik',
          desc: 'Spela om eller rensa tidigare rundor.',
        },
      },
      button: {
        applyLayout: 'Använd',
        specials: 'Specialer: {state}',
        showMines: 'Visa minor',
        hideMines: 'Dölj minor',
        clearHistory: 'Rensa historik',
        hideHistory: 'Dölj historik',
        showHistory: 'Visa historik',
        joinRoom: 'Gå med i rum',
        copyRoom: 'Kopiera kod',
        replay: 'Repris',
        delete: 'Ta bort',
        preset: {
          easy: 'Lätt',
          medium: 'Medium',
          hard: 'Svår',
        },
      },
      placeholder: {
        roomCode: 'Klistra in rumskod',
      },
      history: {
        metaStats: '{timestamp} • {duration}s • {steps} steg',
        metaSpecials: 'Rotationer {rotations}, flippar {flips}',
        roomCode: 'Rum {code}',
        roomPending: 'Kod väntar',
        empty: 'Inga rundor ännu.',
      },
      status: {
        start: 'Klicka en cell för att börja.',
        newBoard: 'Nytt bräde redo. Använd mus eller tangentbord.',
        specialEffects: 'Specialeffekter {state}.',
        cheatEnabled: 'Fuskläge aktiverat.',
        cheatDisabled: 'Fuskläge avaktiverat.',
        replayInit: 'Repriserar från {timestamp}',
        replayProgress: 'Repriserar ({step}/{total}) från {timestamp}',
        replayComplete: 'Repris klar. Välj ny layout.',
        loss: 'Ajdå! En mina bröt upp och de andra småskrattar på avstånd.',
        win: 'Seger! Alla säkra rutor funna.',
        enterRoom: 'Ange kod först.',
        roomNotFound: 'Rum {code} hittades inte.',
        joiningRoom: 'Går med i rum {code}…',
        copySuccess: 'Rum {code} kopierat.',
        copyFallback: 'Kod {code}',
      },
      hint: {
        keyboard: 'Pilar flyttar, Enter/Space avslöjar, F flaggar.',
      },
    };
})();
