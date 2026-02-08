(() => {
  window.MindsweeperTranslations = window.MindsweeperTranslations || {};
  window.MindsweeperTranslations.TRANSLATIONS = window.MindsweeperTranslations.TRANSLATIONS || {};
  window.MindsweeperTranslations.TRANSLATIONS['ru'] = {
      hero: {
        eyebrow: 'Браузеру — приоритет',
        title: 'Mindsweeper',
        greeting: 'Добро пожаловать в игру, избранный.',
        lede: 'Неоновый сапёр с вращением, переворотами и перезаписями, которые ломают каждую партию.',
        meta: {
          keyboard: 'Управление клавиатурой',
          history: 'Сохранённая история',
          replay: 'Повторы с эффектами',
        },
      },
      label: {
        minesRemaining: 'Осталось мин',
        cellsRevealed: 'Открыто клеток',
        rotationTriggers: 'Ротации',
        flipTriggers: 'Перевороты',
        rows: 'Строки',
        cols: 'Столбцы',
        mines: 'Мины',
        rotationSpecials: 'Ротационные спец.',
        flipSpecials: 'Флип-спец.',
        themes: 'Темы',
        difficulty: 'Сложность',
        language: 'Язык',
        on: 'вкл',
        off: 'выкл',
      },
      theme: {
        neon: 'Неон',
        dusk: 'Сумерки',
        sunrise: 'Рассвет',
        midnight: 'Полночь',
        verdant: 'Изумруд',
        ember: 'Жар',
      },
      panel: {
        boardTitle: 'Поле и спецэффекты',
        boardSubtitle: 'Настройте перед новой партией.',
      },
      section: {
        history: {
          title: 'История',
          desc: 'Пересмотрите или очистите прошлые игры.',
        },
      },
      button: {
        applyLayout: 'Применить',
        specials: 'Спецэффекты: {state}',
        showMines: 'Показать мины',
        hideMines: 'Спрятать мины',
        clearHistory: 'Очистить историю',
        hideHistory: 'Скрыть историю',
        showHistory: 'Показать историю',
        joinRoom: 'Войти в комнату',
        copyRoom: 'Скопировать код',
        replay: 'Повтор',
        delete: 'Удалить',
        preset: {
          easy: 'Легко',
          medium: 'Средне',
          hard: 'Сложно',
        },
      },
      placeholder: {
        roomCode: 'Вставьте код комнаты',
      },
      history: {
        metaStats: '{timestamp} • {duration}s • {steps} ходов',
        metaSpecials: 'Ротаций {rotations}, флипов {flips}',
        roomCode: 'Комната {code}',
        roomPending: 'Код ждёт',
        empty: 'Записей пока нет.',
      },
      status: {
        start: 'Кликните клетку, чтобы начать.',
        newBoard: 'Поле готово. Используйте мышь или клавиатуру.',
        specialEffects: 'Эффекты {state}.',
        cheatEnabled: 'Режим читов включён.',
        cheatDisabled: 'Режим читов выключен.',
        replayInit: 'Воспроизведение игры от {timestamp}',
        replayProgress: 'Идёт воспроизведение ({step}/{total}) от {timestamp}',
        replayComplete: 'Повтор завершён. Примените новую сетку.',
        loss: 'Вы попали на мину! Все мины теперь ржут над тем, как вы угадали самый очевидный шаг.',
        win: 'Победа! Все безопасные клетки открыты.',
        enterRoom: 'Сначала введите код.',
        roomNotFound: 'Комната {code} не найдена.',
        joiningRoom: 'Входим в комнату {code}…',
        copySuccess: 'Комната {code} скопирована.',
        copyFallback: 'Код {code}',
      },
      hint: {
        keyboard: 'Стрелки перемещают, Enter/Space открывает, F флаг.',
      },
    };
})();
