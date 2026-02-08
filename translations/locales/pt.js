(() => {
  window.MindsweeperTranslations = window.MindsweeperTranslations || {};
  window.MindsweeperTranslations.TRANSLATIONS = window.MindsweeperTranslations.TRANSLATIONS || {};
  window.MindsweeperTranslations.TRANSLATIONS['pt'] = {
      hero: {
        eyebrow: 'Navegador em primeiro',
        title: 'Mindsweeper',
        greeting: 'Bem-vindo ao jogo, escolhido.',
        lede: 'Um Minesweeper neon com campos rotativos, tiles que viram e replays salvos para cada rodada.',
        meta: {
          keyboard: 'Compatível com teclado',
          history: 'Histórico persistente',
          replay: 'Replay com efeitos',
        },
      },
      label: {
        minesRemaining: 'Minas restantes',
        cellsRevealed: 'Células reveladas',
        rotationTriggers: 'Giros',
        flipTriggers: 'Viradas',
        rows: 'Linhas',
        cols: 'Colunas',
        mines: 'Minas',
        rotationSpecials: 'Especiais de rotação',
        flipSpecials: 'Especiais de flip',
        themes: 'Temas',
        difficulty: 'Dificuldade',
        language: 'Idioma',
        on: 'ligado',
        off: 'desligado',
      },
      theme: {
        neon: 'Neon',
        dusk: 'Crepúsculo',
        sunrise: 'Aurora',
        midnight: 'Meia-noite',
        verdant: 'Verdejante',
        ember: 'Brasa',
      },
      panel: {
        boardTitle: 'Tabuleiro e especiais',
        boardSubtitle: 'Configure antes de iniciar.',
      },
      section: {
        history: {
          title: 'Histórico',
          desc: 'Reproduza ou limpe jogadas anteriores.',
        },
      },
      button: {
        applyLayout: 'Aplicar',
        specials: 'Especiais: {state}',
        showMines: 'Mostrar minas',
        hideMines: 'Ocultar minas',
        clearHistory: 'Limpar histórico',
        hideHistory: 'Ocultar histórico',
        showHistory: 'Mostrar histórico',
        joinRoom: 'Entrar na sala',
        copyRoom: 'Copiar código',
        replay: 'Repetir',
        delete: 'Apagar',
        preset: {
          easy: 'Fácil',
          medium: 'Médio',
          hard: 'Difícil',
        },
      },
      placeholder: {
        roomCode: 'Cole o código da sala',
      },
      history: {
        metaStats: '{timestamp} • {duration}s • {steps} jogadas',
        metaSpecials: 'Giros {rotations}, flips {flips}',
        roomCode: 'Sala {code}',
        roomPending: 'Código pendente',
        empty: 'Nenhuma partida salva.',
      },
      status: {
        start: 'Clique em qualquer célula para começar.',
        newBoard: 'Tabuleiro novo pronto. Use teclado ou mouse.',
        specialEffects: 'Efeitos especiais {state}.',
        cheatEnabled: 'Modo trapaça ativado.',
        cheatDisabled: 'Modo trapaça desativado.',
        replayInit: 'Reproduzindo partida de {timestamp}',
        replayProgress: 'Reproduzindo ({step}/{total}) de {timestamp}',
        replayComplete: 'Replay finalizado. Crie um novo layout.',
        loss: 'Você pisou em uma mina! As minas agora fazem festa apontando para você.',
        win: 'Vitória! Todas as células seguras abertas.',
        enterRoom: 'Digite um código de sala primeiro.',
        roomNotFound: 'Sala {code} não encontrada.',
        joiningRoom: 'Entrando na sala {code}…',
        copySuccess: 'Sala {code} copiada.',
        copyFallback: 'Código {code}',
      },
      hint: {
        keyboard: 'Setas para mover, Enter/Espaço para revelar, F para sinalizar.',
      },
    };
})();
