(() => {
  window.MindsweeperTranslations = window.MindsweeperTranslations || {};
  window.MindsweeperTranslations.TRANSLATIONS = window.MindsweeperTranslations.TRANSLATIONS || {};
  window.MindsweeperTranslations.TRANSLATIONS['fr'] = {
      hero: {
        eyebrow: 'Navigateur d’abord',
        title: 'Mindsweeper',
        greeting: 'Bienvenue dans le jeu, ô élu.',
        lede: 'Une version néon de Démineur où rotations, retournements et relectures persistantes rendent chaque partie imprévisible.',
        meta: {
          keyboard: 'Adapté clavier',
          history: 'Historique sauvegardé',
          replay: 'Relecture stylée',
        },
      },
      label: {
        minesRemaining: 'Mines restantes',
        cellsRevealed: 'Cases ouvertes',
        rotationTriggers: 'Rotations',
        flipTriggers: 'Retournements',
        rows: 'Lignes',
        cols: 'Colonnes',
        mines: 'Mines',
        rotationSpecials: 'Spéciaux rotation',
        flipSpecials: 'Spéciaux flip',
        themes: 'Thèmes',
        difficulty: 'Difficulté',
        language: 'Langue',
        on: 'activé',
        off: 'désactivé',
      },
      theme: {
        neon: 'Néon',
        dusk: 'Crépuscule',
        sunrise: 'Aurore',
        midnight: 'Minuit',
        verdant: 'Verdoyant',
        ember: 'Braise',
      },
      panel: {
        boardTitle: 'Grille et effets',
        boardSubtitle: 'Ajustez les paramètres avant la partie.',
      },
      section: {
        history: {
          title: 'Historique',
          desc: 'Relancez ou nettoyez vos anciennes parties.',
        },
      },
      button: {
        applyLayout: 'Appliquer',
        specials: 'Spéciaux : {state}',
        showMines: 'Afficher les mines',
        hideMines: 'Cacher les mines',
        clearHistory: 'Vider l’historique',
        hideHistory: 'Cacher l’historique',
        showHistory: 'Montrer l’historique',
        joinRoom: 'Rejoindre la salle',
        copyRoom: 'Copier le code',
        replay: 'Relancer',
        delete: 'Supprimer',
        preset: {
          easy: 'Facile',
          medium: 'Moyen',
          hard: 'Difficile',
        },
      },
      placeholder: {
        roomCode: 'Collez le code de salle',
      },
      history: {
        metaStats: '{timestamp} • {duration}s • {steps} coups',
        metaSpecials: 'Rotations {rotations}, flips {flips}',
        roomCode: 'Salle {code}',
        roomPending: 'Code en attente',
        empty: 'Aucune partie enregistrée.',
      },
      status: {
        start: 'Cliquez sur une case pour débuter.',
        newBoard: 'Nouvelle grille prête. Explorez avec la souris ou le clavier.',
        specialEffects: 'Effets spéciaux {state}.',
        cheatEnabled: 'Vue triche activée.',
        cheatDisabled: 'Vue triche désactivée.',
        replayInit: 'Relecture de la partie du {timestamp}',
        replayProgress: 'Relecture ({step}/{total}) de {timestamp}',
        replayComplete: 'Relecture terminée. Recalculez un nouveau plan.',
        loss: 'Boom ! Vous avez touché une mine, et elles font une ovation moqueuse en apparaissant.',
        win: 'Victoire ! Toutes les cases sûres révélées.',
        enterRoom: 'Entrez un code de salle d’abord.',
        roomNotFound: 'Salle {code} introuvable.',
        joiningRoom: 'Rejoindre la salle {code}…',
        copySuccess: 'Salle {code} copiée.',
        copyFallback: 'Code de salle {code}',
      },
      hint: {
        keyboard: 'Flèches pour bouger, Entrée/Espace pour révéler, F pour marquer.',
      },
    };
})();
