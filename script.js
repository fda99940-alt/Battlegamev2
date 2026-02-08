const translationBundle = window.MindsweeperTranslations || {};
const LANGUAGE_OPTIONS = translationBundle.LANGUAGE_OPTIONS || [];
const TRANSLATIONS = translationBundle.TRANSLATIONS || {};

/**
 * Main entry point that scopes Mindsweeper logic, prepares DOM references, and keeps state isolated.
 */
(() => {
const historyKey = 'mindsweeperRuns';
const boardEl = document.getElementById('board');
const statusMessage = document.getElementById('statusMessage');
const remainingMinesEl = document.getElementById('remainingMines');
const revealedCountEl = document.getElementById('revealedCount');
const rotationCountEl = document.getElementById('rotationCount');
const flipCountEl = document.getElementById('flipCount');
const configForm = document.getElementById('configForm');
const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const minesInput = document.getElementById('minesInput');
const rotationInput = document.getElementById('rotationInput');
const flipInput = document.getElementById('flipInput');
const toggleSpecialsBtn = document.getElementById('toggleSpecials');
const showMinesBtn = document.getElementById('showMinesHandle');
const clearHistoryBtn = document.getElementById('clearHistory');
const historyList = document.getElementById('historyList');
const historyPanel = document.querySelector('.panel.history');
const boardWrapper = document.querySelector('.board-wrapper');
const themeButtons = document.querySelectorAll('[data-theme-option]');
const themeStorageKey = 'mindsweeperTheme';
const availableThemes = ['neon', 'dusk', 'sunrise', 'midnight', 'verdant', 'ember'];
const defaultTheme = availableThemes[0];
const presetButtons = document.querySelectorAll('[data-preset]');
const difficultyPresets = {
  easy: { rows: 8, cols: 8, mines: 10, rotationSpecials: 1, flipSpecials: 1 },
  medium: { rows: 10, cols: 10, mines: 18, rotationSpecials: 2, flipSpecials: 2 },
  hard: { rows: 16, cols: 16, mines: 36, rotationSpecials: 3, flipSpecials: 3 },
};
let activePreset = null;
  const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const ROOM_CODE_RANDOM_SEGMENT_LENGTH = 4;
  const ROOM_CONFIG_SEGMENT_LENGTH = 10;
  const toggleHistoryBtn = document.getElementById('toggleHistory');
  const historyCollapsedKey = 'mindsweeperHistoryCollapsed';
  const roomCodeInput = document.getElementById('roomCodeInput');
  const joinRoomBtn = document.getElementById('joinRoom');
  const seedCodeEl = document.getElementById('seedCode');
  const copySeedBtn = document.getElementById('copySeedCode');
  const roomMapKey = 'mindsweeperRooms';
  let roomMap = loadRoomMap();
  const languageSelect = document.getElementById('languageSelect');
  const languageLabel = document.getElementById('languageLabel');
  const localeKey = 'mindsweeperLocale';
  const languages = LANGUAGE_OPTIONS;
  const avatarCommentEl = document.getElementById('avatarComment');
  const avatarWindowEl = document.querySelector('.avatar-window');
  const avatarPortraitEl = document.querySelector('.avatar-window__portrait');
  const avatarSwitcherButtons = document.querySelectorAll('[data-avatar-option]');
  const avatarPersonaKey = 'mindsweeperAvatarPersona';
  const avatarPersonas = {
    friendly: {
      icon: '🤖',
      lines: {
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
      },
    },
    evil: {
      icon: '😈',
      lines: {
        ready: [
          'Finally, another {size} grid to corrupt.',
          'The {size} board is feeding my impatience.',
        ],
        zero: [
          'Empty space at {pos}? Fine, I’ll wait.',
          'Still nothing around {pos}. Boring.',
        ],
        neighbor: [
          '{count} mines near {pos}? I’d say trust your instincts—if you have any.',
          'Those {count} neighbors near {pos} are just teasing you.',
        ],
        flagOn: ['You flag {pos}? Cute. I’ll enjoy the surprise.'],
        flagOff: ['Flag removed at {pos}. Let them dance there.'],
        specialRotation: [
          'Rotation trap at {pos} slams {direction}. Good luck, mortal.',
          'Spin triggered {direction} at {pos}. Keep up if you can.',
        ],
        specialFlip: [
          'Flip {axis} from {pos}. Panic now.',
          'Mirrored chaos {axis} from {pos}. I told you.',
        ],
        win: [
          'You survived {size}? Even my minions are stunned.',
          'Fine, {size} cleared. I’ll be back.',
        ],
        loss: [
          'Mine at {pos} just ate you. Delicious.',
          'You walked into {pos} and paid the price.',
        ],
      },
    },
  };
  let currentAvatarPersona = loadAvatarPersona();

  const defaultLocale = 'en';
  let currentLocale = loadLocale();

  let config = {
    rows: 10,
    cols: 10,
    mines: 18,
    rotationSpecials: 2,
    flipSpecials: 2,
  };

  let grid = [];
  let runActions = [];
  let runs = loadRuns();
  let gameActive = false;
  let specialsEnabled = true;
  let cheatMode = false;
  let rotationAngle = 0;
  let flipHorizontal = false;
  let flipVertical = false;
  let rotationTriggers = 0;
  let flipTriggers = 0;
  let flaggedCount = 0;
  let revealedCount = 0;
  let isReplaying = false;
  let replayTimer = null;
  let focusCell = { row: 0, col: 0 };
  let runStartTime = Date.now();
  let currentRoomCode = null;
  let currentRoomSeed = null;

  const NEIGHBORS = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  let avatarPulseTimer = null;
  const avatarPulseDuration = 1400;

  configForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setActivePreset(null);
    startNewGame();
  });

  toggleSpecialsBtn.addEventListener('click', () => {
    specialsEnabled = !specialsEnabled;
    updateSpecialsButton();
    applyTransform();
    showStatusMessage('status.specialEffects', {
      state: specialsEnabled ? t('label.on') : t('label.off'),
    });
  });

  showMinesBtn.addEventListener('click', () => {
    cheatMode = !cheatMode;
    applyCheatState();
    updateShowMinesButton();
    showStatusMessage(cheatMode ? 'status.cheatEnabled' : 'status.cheatDisabled');
  });

  clearHistoryBtn.addEventListener('click', () => {
    runs = [];
    persistRuns();
    renderHistory();
  });

  if (copySeedBtn) {
    copySeedBtn.addEventListener('click', () => {
      if (!currentRoomCode) return;
      copyRoomCode(currentRoomCode);
    });
  }

  boardEl.addEventListener('click', (event) => {
    if (isReplaying) return;
    const cellEl = event.target.closest('.cell');
    if (!cellEl) return;
    const cell = getCellFromElement(cellEl);
    revealCell(cell);
  });

  boardEl.addEventListener('contextmenu', (event) => {
    if (isReplaying) return;
    event.preventDefault();
    const cellEl = event.target.closest('.cell');
    if (!cellEl) return;
    const cell = getCellFromElement(cellEl);
    applyFlag(cell, !cell.flagged, { recordAction: true });
  });

  document.addEventListener('keydown', (event) => {
    if (isReplaying) return;
    if (!grid.length) return;
    const { key } = event;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      handleArrowNavigation(key);
      return;
    }

    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      const cell = getCell(focusCell.row, focusCell.col);
      if (cell) {
        revealCell(cell);
      }
      return;
    }

    if (key.toLowerCase() === 'f') {
      event.preventDefault();
      const cell = getCell(focusCell.row, focusCell.col);
      if (cell) {
        applyFlag(cell, !cell.flagged, { recordAction: true });
      }
    }
  });

  historyList.addEventListener('click', (event) => {
    if (isReplaying) return;
    const copyBtn = event.target.closest('[data-copy-room]');
    if (copyBtn) {
      copyRoomCode(copyBtn.dataset.copyRoom);
      return;
    }
    const actionBtn = event.target.closest('button[data-action]');
    if (!actionBtn) return;
    const { action, id } = actionBtn.dataset;
    const runRecord = runs.find((run) => run.id === id);
    if (!runRecord) return;
    if (action === 'replay') {
      startReplay(runRecord);
    } else if (action === 'delete') {
      if (runRecord.roomCode) {
        delete roomMap[runRecord.roomCode];
        persistRoomMap();
      }
      runs = runs.filter((run) => run.id !== id);
      persistRuns();
      renderHistory();
    }
  });

  /**
   * Initializes the UI, translations, theme, presets, history, and game state.
   */
  function init() {
    initLanguageSwitcher();
    initAvatarSwitcher();
    applyStaticTranslations();
    updateSpecialsButton();
    updateShowMinesButton();
    initThemeSwitcher();
    initDifficultyPresets();
    initHistoryCollapse();
    initRoomJoin();
    renderHistory();
    applyCheatState();
    startNewGame();
  }

  /**
   * Resets state for a fresh run, builds a new grid, and renders the updated board.
   */
  function startNewGame(options = {}) {
    const { roomCode, layout, seed } = options;
    stopReplay();
    runStartTime = Date.now();
    const safeConfig = applyConfigFromForm();
    config = { ...safeConfig };
    resetBoardState();
    gameActive = true;
    grid = createGrid(config.rows, config.cols);
    const seedValue = seed || currentRoomSeed || createRandomSeed();
    currentRoomSeed = seedValue;
    const rng = createRng(seedValue);
    if (layout?.minePositions?.length || layout?.rotationSpecials?.length || layout?.flipSpecials?.length) {
      applyLayoutFromPayload(layout);
    } else {
      placeMines(config.mines, rng);
      assignSpecials(rng);
    }
    computeNeighborCounts();
    renderBoard();
    applyTransform();
    applyCheatState();
    const layoutPayload = layout || captureLayoutPayload();
    currentRoomCode = roomCode || generateRoomCode(config, currentRoomSeed);
    updateSeedDisplay();
    updateStatus();
    showStatusMessage('status.newBoard');
    grid[0]?.[0]?.element?.focus();
    speakAvatar('ready', { size: `${config.rows}×${config.cols}` });
  }

  /**
   * Halts any replay in progress and restores regular game controls.
   */
  function stopReplay() {
    if (replayTimer) {
      clearInterval(replayTimer);
      replayTimer = null;
    }
    isReplaying = false;
    boardEl.classList.remove('board--replaying');
  }

  /**
   * Reconstructs a saved run and steps through its recorded actions.
   * @param {Object} record Replay metadata and actions.
   */
  function startReplay(record) {
    stopReplay();
    isReplaying = true;
    gameActive = false;
    runStartTime = null;
    applyConfigToInputs(record.config);
    config = { ...record.config };
    resetBoardState();
    grid = createGrid(config.rows, config.cols);
    loadLayout(record);
    computeNeighborCounts();
    renderBoard();
    applyTransform();
    applyCheatState();
    showStatusMessage('status.replayInit', { timestamp: formatTimestamp(record.timestamp) });
    boardEl.classList.add('board--replaying');
    const actions = record.actions || [];
    let step = 0;

    replayTimer = setInterval(() => {
      if (step >= actions.length) {
        finalizeReplay();
        return;
      }
      const action = actions[step];
      showStatusMessage('status.replayProgress', {
        timestamp: formatTimestamp(record.timestamp),
        step: step + 1,
        total: actions.length,
      });
      const cell = getCell(action.row, action.col);
      if (cell) {
        if (action.type === 'reveal') {
          revealCell(cell, { replay: true, recordAction: false, checkVictory: false });
        } else if (action.type === 'flag') {
          applyFlag(cell, action.flagged, { recordAction: false, replay: true, userAction: false });
        }
      }
      step += 1;
    }, 500);
  }

  /**
   * Finalizes replay playback by stopping the timer and updating the status message.
   */
  function finalizeReplay() {
    stopReplay();
    showStatusMessage('status.replayComplete');
  }

  /**
   * Restores mine and special cell assignments from a saved record.
   * @param {Object} record Saved run data.
   */
  function loadLayout(record) {
    applyLayoutFromPayload({
      minePositions: record.minePositions,
      rotationSpecials: record.rotationSpecials,
      flipSpecials: record.flipSpecials,
    });
  }

  /**
   * Applies a stored payload of mines and specials to the grid.
   */
  function applyLayoutFromPayload(payload) {
    if (!payload) return;
    forEachCell((cell) => {
      cell.isMine = false;
      cell.special = null;
    });
    (payload.minePositions || []).forEach((mine) => {
      const cell = getCell(mine.row, mine.col);
      if (cell) {
        cell.isMine = true;
      }
    });
    (payload.rotationSpecials || []).forEach((special) => {
      const cell = getCell(special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'rotation',
          direction: special.direction,
          triggered: false,
        };
      }
    });
    (payload.flipSpecials || []).forEach((special) => {
      const cell = getCell(special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'flip',
          axis: special.axis,
          triggered: false,
        };
      }
    });
  }

  /**
   * Captures the current layout as a payload for encoding.
   */
  function captureLayoutPayload() {
    return {
      minePositions: getMinePositions(),
      rotationSpecials: getSpecialsByType('rotation'),
      flipSpecials: getSpecialsByType('flip'),
    };
  }

  /**
   * Reads config inputs, clamps them to safe ranges, updates the form fields, and returns the new config.
   */
  function applyConfigFromForm() {
    const rows = clamp(Number(rowsInput.value) || config.rows, 5, 25);
    const cols = clamp(Number(colsInput.value) || config.cols, 5, 25);
    const totalCells = rows * cols;
    const maxMines = Math.max(totalCells - 1, 1);
    const mines = clamp(Number(minesInput.value) || config.mines, 1, maxMines);
    const safeCells = Math.max(totalCells - mines, 0);
    const rotationSpecials = clamp(Number(rotationInput.value) || config.rotationSpecials, 0, safeCells);
    const flipSpecials = clamp(
      Number(flipInput.value) || config.flipSpecials,
      0,
      Math.max(safeCells - rotationSpecials, 0)
    );

    applyConfigToInputs({ rows, cols, mines, rotationSpecials, flipSpecials });
    return { rows, cols, mines, rotationSpecials, flipSpecials };
  }

  /**
   * Pushes normalized configuration values back into the aligned form inputs.
   * @param {Object} values Configuring values to render in inputs.
   */
  function applyConfigToInputs(values) {
    rowsInput.value = values.rows;
    colsInput.value = values.cols;
    minesInput.value = values.mines;
    rotationInput.value = values.rotationSpecials;
    flipInput.value = values.flipSpecials;
  }

  /**
   * Builds a blank grid data structure reflecting the requested dimensions.
   */
  function createGrid(rows, cols) {
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        row,
        col,
        isMine: false,
        neighborMines: 0,
        special: null,
        revealed: false,
        flagged: false,
        element: null,
      }))
    );
  }

  /**
   * Randomly distributes the requested number of mine cells across the board.
   */
  function placeMines(count, rng = Math.random) {
    const cells = [];
    for (let row = 0; row < config.rows; row += 1) {
      for (let col = 0; col < config.cols; col += 1) {
        cells.push({ row, col });
      }
    }
    shuffle(cells, rng);
    const selection = cells.slice(0, count);
    selection.forEach(({ row, col }) => {
      const cell = getCell(row, col);
      if (cell) {
        cell.isMine = true;
      }
    });
  }

  /**
   * Allocates rotation and flip specials to safe cells, marking their type and direction.
   */
  function assignSpecials(rng = Math.random) {
    const safeCells = [];
    forEachCell((cell) => {
      if (!cell.isMine) {
        safeCells.push(cell);
      }
    });
    shuffle(safeCells, rng);
    let available = [...safeCells];
    const rotationCells = available.slice(0, config.rotationSpecials);
    available = available.slice(config.rotationSpecials);
    rotationCells.forEach((cell) => {
      cell.special = {
        type: 'rotation',
        direction: pick(['cw', 'ccw'], rng),
        triggered: false,
      };
    });
    const flipCells = available.slice(0, config.flipSpecials);
    flipCells.forEach((cell) => {
      cell.special = {
        type: 'flip',
        axis: pick(['horizontal', 'vertical'], rng),
        triggered: false,
      };
    });
  }

  /**
   * Calculates the number of neighboring mines for every cell.
   */
  function computeNeighborCounts() {
    forEachCell((cell) => {
      cell.neighborMines = getNeighbors(cell).filter((neighbor) => neighbor.isMine).length;
    });
  }

  /**
   * Creates and inserts DOM elements for each cell, applying initial classes.
   */
  function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${config.cols}, minmax(0, 1fr))`;
    forEachCell((cell) => {
      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.className = 'cell';
      cellEl.setAttribute('data-row', cell.row);
      cellEl.setAttribute('data-col', cell.col);
      cellEl.setAttribute('data-show-cheat', cheatMode ? 'true' : 'false');
      cellEl.setAttribute('aria-label', 'Hidden cell');
      if (cell.special?.type === 'rotation') {
        cellEl.classList.add('cell--special-rotation');
      }
      if (cell.special?.type === 'flip') {
        cellEl.classList.add('cell--special-flip');
      }
      cell.element = cellEl;
      boardEl.appendChild(cellEl);
    });
  }

  /**
   * Reveals a given cell and propagates uncovering, triggers specials, and checks end-of-game conditions.
   * @param {Object} cell Target cell data.
   */
  function revealCell(cell, options = {}) {
    if (!gameActive && !options.replay) return;
    if (!cell || cell.revealed || cell.flagged) return;
    const { recordAction = true, replay = false, checkVictory = true, userAction = true } = options;
    cell.revealed = true;
    const cellEl = cell.element;
    if (!cellEl) return;
    cellEl.classList.add('cell--revealed');
    cellEl.removeAttribute('aria-label');
    if (cell.isMine) {
      cellEl.classList.add('cell--mine');
    } else if (cell.neighborMines) {
      cellEl.textContent = cell.neighborMines;
      cellEl.style.color = getNumberColor(cell.neighborMines);
    }
    revealedCount += 1;
    if (recordAction && !isReplaying) {
      runActions.push({ type: 'reveal', row: cell.row, col: cell.col });
    }
    if (cell.special) {
      triggerSpecial(cell.special, cell);
    }
    if (!cell.isMine && cell.neighborMines === 0) {
      getNeighbors(cell).forEach((neighbor) => {
        if (!neighbor.revealed) {
          revealCell(neighbor, { recordAction: false, replay, checkVictory, userAction: false });
        }
      });
    }
    if (userAction && !replay && !cell.isMine && !cell.special) {
      commentOnReveal(cell);
    }
    updateStatus();
    if (!replay && cell.isMine) {
      handleLoss(cell);
      return;
    }
    if (!replay && checkVictory && checkForWin()) {
      handleWin();
    }
  }

  /**
   * Toggles a flag on a cell while updating counters and recording the action when appropriate.
   */
  function applyFlag(cell, shouldFlag, options = {}) {
    if (!gameActive && !options.replay) return;
    if (!cell || cell.revealed) return;
    const { recordAction = true, replay = false, userAction = true } = options;
    const wasFlagged = cell.flagged;
    cell.flagged = shouldFlag;
    const cellEl = cell.element;
    if (cellEl) {
      cellEl.classList.toggle('cell--flagged', shouldFlag);
    }
    if (shouldFlag && !wasFlagged) {
      flaggedCount += 1;
    }
    if (!shouldFlag && wasFlagged) {
      flaggedCount = Math.max(0, flaggedCount - 1);
    }
    if (recordAction && !isReplaying) {
      runActions.push({ type: 'flag', row: cell.row, col: cell.col, flagged: shouldFlag });
    }
    if (userAction && !replay) {
      commentOnFlag(cell, shouldFlag);
    }
    updateStatus();
  }

  /**
   * Activates a discovered special cell, adjusting rotation or flip state if specials are enabled.
   */
  function triggerSpecial(special, cell) {
    if (!special || special.triggered) return;
    special.triggered = true;
    if (special.type === 'rotation') {
      rotationTriggers += 1;
      if (specialsEnabled) {
        const direction = special.direction === 'ccw' ? -90 : 90;
        rotationAngle = (rotationAngle + direction + 360) % 360;
      }
    } else if (special.type === 'flip') {
      flipTriggers += 1;
      if (specialsEnabled) {
        if (special.axis === 'horizontal') {
          flipHorizontal = !flipHorizontal;
        } else {
          flipVertical = !flipVertical;
        }
      }
    }
    applyTransform();
    updateStatus();
    commentOnSpecial(special, cell);
  }

  /**
   * Applies current rotation/flip transforms to the board element and updates wrapper spacing.
   */
  function applyTransform() {
    if (!specialsEnabled) {
      boardEl.style.transform = 'none';
      updateWrapperSpacing();
      return;
    }
    const scaleX = flipHorizontal ? -1 : 1;
    const scaleY = flipVertical ? -1 : 1;
    boardEl.style.transform = `rotate(${rotationAngle}deg) scale(${scaleX}, ${scaleY})`;
    updateWrapperSpacing();
  }

  /**
   * Adjusts wrapper classes based on rotation to preserve layout spacing.
   */
  function updateWrapperSpacing() {
    if (!boardWrapper) return;
    const rotated = rotationAngle % 180 !== 0;
    boardWrapper.classList.toggle('board-wrapper--expanded', rotated);
  }

  /**
   * Refreshes counters showing mines remaining, revealed cells, and specials triggered.
   */
  function updateStatus() {
    remainingMinesEl.textContent = Math.max(config.mines - flaggedCount, 0);
    revealedCountEl.textContent = revealedCount;
    rotationCountEl.textContent = rotationTriggers;
    flipCountEl.textContent = flipTriggers;
  }

  /**
   * Updates the seed display text and enables/disables the copy button.
   */
  function updateSeedDisplay() {
    if (seedCodeEl) {
      seedCodeEl.textContent = currentRoomCode || '—';
    }
    if (copySeedBtn) {
      copySeedBtn.disabled = !currentRoomCode;
    }
  }

  /**
   * Handles a loss by revealing all mines, notifying the player, and saving the outcome.
   */
  function handleLoss(cell) {
    gameActive = false;
    revealAllMines();
    showStatusMessage('status.loss');
    saveRun('loss');
    speakAvatar('loss', { pos: describeCellPosition(cell) });
  }

  /**
   * Handles a win similarly, ensuring completion data is saved and presented.
   */
  function handleWin() {
    gameActive = false;
    revealAllMines();
    showStatusMessage('status.win');
    saveRun('win');
    speakAvatar('win', { size: `${config.rows}×${config.cols}` });
  }

  /**
   * Reveals every mined cell on the board for end-of-game feedback.
   */
  function revealAllMines() {
    forEachCell((cell) => {
      if (cell.isMine && !cell.revealed) {
        const cellEl = cell.element;
        if (cellEl) {
          cellEl.classList.add('cell--revealed', 'cell--mine');
        }
        cell.revealed = true;
      }
    });
  }

  /**
   * Determines whether all safe cells are revealed, indicating victory.
   */
  function checkForWin() {
    const totalSafeCells = config.rows * config.cols - config.mines;
    return revealedCount >= totalSafeCells;
  }

  /**
   * Records the final run metadata into history storage and trims the list.
   */
  function saveRun(result) {
    const layoutPayload = captureLayoutPayload();
    const record = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      config: { ...config },
      result,
      duration: runStartTime ? Date.now() - runStartTime : 0,
      mines: config.mines,
      revealed: revealedCount,
      flagged: flaggedCount,
      rotationTriggers,
      flipTriggers,
      totalCells: config.rows * config.cols,
      minePositions: layoutPayload.minePositions,
      rotationSpecials: layoutPayload.rotationSpecials,
      flipSpecials: layoutPayload.flipSpecials,
      layout: layoutPayload,
      seed: currentRoomSeed,
      actions: runActions.slice(),
    };
    record.roomCode = currentRoomCode || generateRoomCode(record.config, currentRoomSeed);
    roomMap[record.roomCode] = record;
    persistRoomMap();
    runs.unshift(record);
    if (runs.length > 40) {
      runs = runs.slice(0, 40);
    }
    persistRuns();
    renderHistory();
    runStartTime = null;
  }

  /**
   * Returns coordinates of every mine for replay or sharing purposes.
   */
  function getMinePositions() {
    const mines = [];
    forEachCell((cell) => {
      if (cell.isMine) {
        mines.push({ row: cell.row, col: cell.col });
      }
    });
    return mines;
  }

  /**
   * Collects specials filtered by type, along with their directional data.
   */
  function getSpecialsByType(type) {
    const list = [];
    forEachCell((cell) => {
      if (cell.special?.type === type) {
        if (type === 'rotation') {
          list.push({ row: cell.row, col: cell.col, direction: cell.special.direction });
        } else if (type === 'flip') {
          list.push({ row: cell.row, col: cell.col, axis: cell.special.axis });
        }
      }
    });
    return list;
  }

  /**
   * Generates the history UI from saved runs, including action buttons.
   */
  function renderHistory() {
    if (!runs.length) {
      historyList.innerHTML = `<p class="history-empty">${t('history.empty')}</p>`;
      clearHistoryBtn.disabled = true;
      return;
    }
    clearHistoryBtn.disabled = false;
    historyList.innerHTML = '';
    runs.forEach((run) => {
      const wrapper = document.createElement('article');
      wrapper.className = 'history-run';
      const title = document.createElement('h3');
      title.textContent = `${run.result.toUpperCase()} • ${run.config.rows}×${run.config.cols} • ${run.config.mines} mines`;
      wrapper.appendChild(title);
      const meta = document.createElement('p');
      meta.textContent = t('history.metaStats', {
        timestamp: formatTimestamp(run.timestamp),
        duration: Math.round(run.duration / 1000),
        steps: run.actions.length,
      });
      wrapper.appendChild(meta);
      const specials = document.createElement('p');
      specials.textContent = t('history.metaSpecials', {
        rotations: run.rotationTriggers,
        flips: run.flipTriggers,
      });
      wrapper.appendChild(specials);
      const roomCodeRow = document.createElement('div');
      roomCodeRow.className = 'history-run__code';
      const codeLabel = document.createElement('span');
      codeLabel.textContent = run.roomCode
        ? t('history.roomCode', { code: run.roomCode })
        : t('history.roomPending');
      roomCodeRow.appendChild(codeLabel);
      if (run.roomCode) {
        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'ghost copy-room-code';
        copyButton.dataset.copyRoom = run.roomCode;
        copyButton.textContent = t('button.copyRoom');
        roomCodeRow.appendChild(copyButton);
      }
      wrapper.appendChild(roomCodeRow);
      const runActionsEl = document.createElement('div');
      runActionsEl.className = 'run-actions';
      const replayButton = document.createElement('button');
      replayButton.type = 'button';
      replayButton.dataset.action = 'replay';
      replayButton.dataset.id = run.id;
      replayButton.textContent = t('button.replay');
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete';
      deleteButton.dataset.action = 'delete';
      deleteButton.dataset.id = run.id;
      deleteButton.textContent = t('button.delete');
      runActionsEl.appendChild(replayButton);
      runActionsEl.appendChild(deleteButton);
      wrapper.appendChild(runActionsEl);
      historyList.appendChild(wrapper);
    });
  }

  /**
   * Persists the run history to localStorage.
   */
  function persistRuns() {
    safeSetJSON(historyKey, runs);
  }

  /**
   * Loads run history from localStorage.
   */
  function loadRuns() {
    return safeGetJSON(historyKey, []);
  }

  /**
   * Persists room mapping data to localStorage.
   */
  function persistRoomMap() {
    safeSetJSON(roomMapKey, roomMap);
  }

  /**
   * Loads stored room mappings.
   */
  function loadRoomMap() {
    return safeGetJSON(roomMapKey, {});
  }

  /**
   * Writes a status message to the UI.
   */
  function setStatus(message) {
    statusMessage.textContent = message;
  }

  /**
   * Sets a localized status message using the translation helpers.
   */
  function showStatusMessage(key, replacements = {}) {
    setStatus(t(key, replacements));
  }

  function describeCellPosition(cell) {
    if (!cell) return 'the board';
    return `${cell.row + 1},${cell.col + 1}`;
  }

  function loadAvatarPersona() {
    const stored = safeGetItem(avatarPersonaKey);
    if (stored && avatarPersonas[stored]) {
      return stored;
    }
    return 'friendly';
  }

  function initAvatarSwitcher() {
    if (avatarSwitcherButtons?.length) {
      avatarSwitcherButtons.forEach((button) => {
        button.addEventListener('click', () => {
          setAvatarPersona(button.dataset.avatarOption);
        });
      });
    }
    setAvatarPersona(currentAvatarPersona, { persist: false });
  }

  function setAvatarPersona(persona, options = {}) {
    const normalized = avatarPersonas[persona] ? persona : 'friendly';
    const { persist = true } = options;
    if (currentAvatarPersona === normalized && options.force !== true) return;
    currentAvatarPersona = normalized;
    if (avatarPortraitEl) {
      avatarPortraitEl.textContent = avatarPersonas[normalized].icon;
    }
    avatarSwitcherButtons.forEach((button) => {
      const isActive = button.dataset.avatarOption === normalized;
      button.classList.toggle('avatar-toggle--active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    if (persist) {
      safeSetItem(avatarPersonaKey, normalized);
    }
  }

  function getAvatarLines(key) {
    return (
      avatarPersonas[currentAvatarPersona]?.lines?.[key] ||
      avatarPersonas.friendly.lines?.[key] ||
      []
    );
  }

  function resolveAvatarLine(key, replacements = {}) {
    const choices = getAvatarLines(key);
    if (!choices?.length) {
      return replacements.fallback || '';
    }
    let template = choices[Math.floor(Math.random() * choices.length)];
    Object.entries(replacements).forEach(([token, value]) => {
      template = template.replace(new RegExp(`\\{${token}\\}`, 'g'), value);
    });
    return template;
  }

  function setAvatarComment(message, options = {}) {
    if (!avatarCommentEl) return;
    if (!message) return;
    avatarCommentEl.textContent = message;
    if (!avatarWindowEl) return;
    avatarWindowEl.classList.add('avatar-window--active');
    if (avatarPulseTimer) {
      clearTimeout(avatarPulseTimer);
    }
    avatarPulseTimer = setTimeout(() => {
      avatarWindowEl.classList.remove('avatar-window--active');
    }, options.duration || avatarPulseDuration);
  }

  function speakAvatar(key, replacements = {}, options = {}) {
    const message = resolveAvatarLine(key, replacements);
    setAvatarComment(message, options);
  }

  function commentOnReveal(cell) {
    if (!cell || cell.isMine || cell.special) return;
    const replacements = { pos: describeCellPosition(cell) };
    if (cell.neighborMines === 0) {
      speakAvatar('zero', replacements);
    } else {
      speakAvatar('neighbor', { ...replacements, count: cell.neighborMines });
    }
  }

  function commentOnFlag(cell, shouldFlag) {
    speakAvatar(shouldFlag ? 'flagOn' : 'flagOff', {
      pos: describeCellPosition(cell),
    });
  }

  function commentOnSpecial(special, cell) {
    if (!special || !cell) return;
    const pos = describeCellPosition(cell);
    if (special.type === 'rotation') {
      const direction = special.direction === 'ccw' ? 'counter-clockwise' : 'clockwise';
      speakAvatar('specialRotation', { pos, direction }, { duration: 1700 });
    } else if (special.type === 'flip') {
      const axis = special.axis === 'horizontal' ? 'horizontally' : 'vertically';
      speakAvatar('specialFlip', { pos, axis }, { duration: 1700 });
    }
  }

  /**
   * Safely writes to localStorage with error handling.
   */
  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Unable to persist "${key}"`, error);
    }
  }

  /**
   * Safely reads from localStorage and logs failures.
   */
  function safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Unable to read "${key}"`, error);
      return null;
    }
  }

  /**
   * Stringifies and persists JSON-friendly values.
   */
  function safeSetJSON(key, value) {
    safeSetItem(key, JSON.stringify(value));
  }

  /**
   * Parses JSON data from storage or returns a fallback.
   */
  function safeGetJSON(key, fallback = null) {
    const stored = safeGetItem(key);
    if (!stored) return fallback;
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) || (parsed && typeof parsed === 'object') ? parsed : fallback;
    } catch (error) {
      console.error(`Unable to parse "${key}"`, error);
      return fallback;
    }
  }

  /**
   * Determines the active locale, falling back to defaults when needed.
   */
  function loadLocale() {
    const stored = safeGetItem(localeKey);
    if (stored && TRANSLATIONS[stored]) {
      return stored;
    }
    const nav = navigator.language?.split('-')[0];
    if (nav && TRANSLATIONS[nav]) {
      return nav;
    }
    return defaultLocale;
  }

  /**
   * Replaces static elements marked with data-i18n-key with translated text.
   */
  function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n-key]').forEach((element) => {
      const key = element.dataset.i18nKey;
      if (!key) return;
      const text = t(key);
      if (text == null) return;
      const attr = element.dataset.i18nAttr;
      if (attr) {
        element.setAttribute(attr, text);
      } else {
        element.textContent = text;
      }
    });
  }

  /**
   * Fetches a translation string for the current locale and applies replacements.
   * @param {string} key Dot-notated translation identifier.
   */
  function t(key, replacements = {}) {
    const segments = key.split('.');
    let node = TRANSLATIONS[currentLocale];
    for (const segment of segments) {
      if (!node || !(segment in node)) {
        return key;
      }
      node = node[segment];
    }
    let text = node;
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return text;
  }

  /**
   * Builds the language dropdown and wires translation-related listeners.
   */
  function initLanguageSwitcher() {
    if (!languageSelect) return;
    languageSelect.innerHTML = '';
    languages.forEach((lang) => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = `${lang.flag} ${lang.name}`;
      languageSelect.appendChild(option);
    });
    languageSelect.value = currentLocale;
    languageSelect.addEventListener('change', () => {
      if (!languages.some((lang) => lang.code === languageSelect.value)) return;
      currentLocale = languageSelect.value;
      safeSetItem(localeKey, currentLocale);
      applyStaticTranslations();
      updateSpecialsButton();
      updateShowMinesButton();
      updateLanguageLabel();
      renderHistory();
    });
    updateLanguageLabel();
  }

  /**
   * Updates the localized language label display to match the dropdown selection.
   */
  function updateLanguageLabel() {
    if (!languageLabel) return;
    const lang = languages.find((entry) => entry.code === currentLocale) || languages[0];
    languageLabel.textContent = `${lang.flag} ${lang.name}`;
  }

  /**
   * Generates a room code that embeds configuration data and a seed for deterministic layout.
   * @param {Object} config Current game settings to encode.
   * @param {string} seed Seed string used by the deterministic RNG.
   */
  function generateRoomCode(config, seed) {
    const configSegment = encodeConfigForRoomCode(config);
    const seedSegment = seed || createRandomSeed();
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const baseCode = `${configSegment}-${seedSegment}`;
      if (!roomMap[baseCode]) {
        return baseCode;
      }
    }
    const fallbackSegment = Date.now().toString(36).toUpperCase().slice(-ROOM_CODE_RANDOM_SEGMENT_LENGTH);
    return `${configSegment}-${fallbackSegment}`;
  }

  /**
   * Encodes row/col/mines/special counts into a fixed-length base36 string.
   */
  function encodeConfigForRoomCode(config = {}) {
    const values = [
      config.rows ?? 0,
      config.cols ?? 0,
      config.mines ?? 0,
      config.rotationSpecials ?? 0,
      config.flipSpecials ?? 0,
    ];
    return values
      .map((value) => clamp(value, 0, 35).toString(36).toUpperCase().padStart(2, '0'))
      .join('')
      .slice(0, ROOM_CONFIG_SEGMENT_LENGTH);
  }

  /**
   * Encodes layout metadata as a base64-url string.
   */
  /**
   * Derives config values from the encoded portion of a room code.
   * @param {string} code Room code string that contains the config segment.
   * @returns {Object|null} Extracted config or null when invalid.
   */
  function decodeRoomCode(code) {
    if (!code) return null;
    const [configSegment, seedSegment] = code.split('-');
    if (!configSegment || configSegment.length !== ROOM_CONFIG_SEGMENT_LENGTH || !seedSegment) {
      return null;
    }
    const values = [];
    for (let i = 0; i < configSegment.length; i += 2) {
      const chunk = configSegment.slice(i, i + 2);
      const parsed = parseInt(chunk, 36);
      if (Number.isNaN(parsed)) {
        return null;
      }
      values.push(parsed);
    }
    const [rows, cols, mines, rotationSpecials, flipSpecials] = values;
    return {
      config: {
        rows,
        cols,
        mines,
        rotationSpecials,
        flipSpecials,
      },
      seed: seedSegment,
    };
  }

  /**
   * Resets counters and focus tracking ahead of new games or replays.
   */
  function resetBoardState() {
    runActions = [];
    rotationAngle = 0;
    flipHorizontal = false;
    flipVertical = false;
    rotationTriggers = 0;
    flipTriggers = 0;
    flaggedCount = 0;
    revealedCount = 0;
    focusCell = { row: 0, col: 0 };
  }

  /**
   * Hooks up theme buttons and applies a stored preference.
   */
  function initThemeSwitcher() {
    themeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        applyTheme(button.dataset.themeOption);
      });
    });
    const storedTheme = safeGetItem(themeStorageKey);
    applyTheme(storedTheme || defaultTheme, { persist: false });
  }

  /**
   * Applies the selected theme, updates toggle states, and optionally persists it.
   */
  function applyTheme(name, options = {}) {
    const { persist = true } = options;
    const themeName = availableThemes.includes(name) ? name : defaultTheme;
    document.documentElement.setAttribute('data-theme', themeName);
    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeOption === themeName;
      button.classList.toggle('theme-toggle--active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    if (persist) {
      safeSetItem(themeStorageKey, themeName);
    }
  }

  /**
   * Sets up history collapse/expand controls and persists the state.
   */
  function initHistoryCollapse() {
    if (!toggleHistoryBtn || !historyPanel) return;
    const stored = safeGetItem(historyCollapsedKey) === 'true';
    applyHistoryCollapse(stored, { persist: false });
    toggleHistoryBtn.addEventListener('click', () => {
      const currentlyCollapsed = historyPanel.classList.contains('history--collapsed');
      applyHistoryCollapse(!currentlyCollapsed);
    });
  }

  /**
   * Toggles the history panel collapsed state and updates the toggle button.
   */
  function applyHistoryCollapse(collapsed, options = {}) {
    const { persist = true } = options;
    historyPanel?.classList.toggle('history--collapsed', collapsed);
    if (toggleHistoryBtn) {
      toggleHistoryBtn.textContent = collapsed ? t('button.showHistory') : t('button.hideHistory');
    }
    if (persist) {
      safeSetItem(historyCollapsedKey, String(collapsed));
    }
  }

  /**
   * Sets up difficulty preset buttons and clears active preset when inputs change.
   */
  function initDifficultyPresets() {
    presetButtons.forEach((button) => {
      button.addEventListener('click', () => applyPreset(button.dataset.preset));
    });
    [rowsInput, colsInput, minesInput, rotationInput, flipInput].forEach((input) => {
      input.addEventListener('input', () => setActivePreset(null));
    });
  }

  /**
   * Manages joining saved rooms by room code.
   */
  function initRoomJoin() {
    if (!joinRoomBtn || !roomCodeInput) return;
    joinRoomBtn.addEventListener('click', () => {
      const code = (roomCodeInput.value || '').trim().toUpperCase();
      if (!code) {
        showStatusMessage('status.enterRoom');
        return;
      }
      const target = roomMap[code] || runs.find((run) => run.roomCode === code);
      const decoded = decodeRoomCode(code);
      const recordOrConfig = target || decoded;
      if (!recordOrConfig?.config) {
        showStatusMessage('status.roomNotFound', { code });
        return;
      }
      const roomCodeToShow = target?.roomCode || code;
      if (applyRoomSettings(recordOrConfig, { roomCode: roomCodeToShow, seed: decoded?.seed })) {
        showStatusMessage('status.joiningRoom', { code });
      } else {
        showStatusMessage('status.roomNotFound', { code });
      }
    });
  }

  /**
   * Copies a room code to clipboard, falling back to a message on failure.
   */
  function copyRoomCode(code) {
    if (!code) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(
        () => showStatusMessage('status.copySuccess', { code }),
        () => showStatusMessage('status.copyFallback', { code })
      );
    } else {
      showStatusMessage('status.copyFallback', { code });
    }
  }

  /**
   * Tracks the active preset and synchronizes UI button states.
   */
  function setActivePreset(name) {
    activePreset = name;
    presetButtons.forEach((button) => {
      const isActive = name && button.dataset.preset === name;
      button.classList.toggle('preset-toggle--active', isActive);
      button.setAttribute('aria-pressed', String(Boolean(isActive)));
    });
  }

  /**
   * Applies a difficulty preset, updates inputs, and restarts the game.
   */
  function applyPreset(name) {
    const preset = difficultyPresets[name];
    if (!preset) return;
    applyConfigToInputs({
      rows: preset.rows,
      cols: preset.cols,
      mines: preset.mines,
      rotationSpecials: preset.rotationSpecials,
      flipSpecials: preset.flipSpecials,
    });
    setActivePreset(name);
    startNewGame();
  }

  /**
   * Applies room configuration values to the inputs and starts a matching game.
   * @param {Object} recordOrConfig Saved run or config object.
   * @param {Object} options Optionally provide a roomCode override.
   */
  function applyRoomSettings(recordOrConfig, options = {}) {
    const config = recordOrConfig?.config || recordOrConfig;
    if (!config) return false;
    const layout = recordOrConfig?.layout || recordOrConfig?.layoutPayload;
    applyConfigToInputs(config);
    setActivePreset(null);
    startNewGame({
      roomCode: options.roomCode ?? recordOrConfig?.roomCode,
      seed: recordOrConfig?.seed,
      layout,
    });
    return true;
  }

  /**
   * Iterates every cell row/col pairing and invokes the callback.
   */
  function forEachCell(callback) {
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        callback(cell, rowIndex, colIndex);
      });
    });
  }

  /**
   * Safely returns a grid cell by coordinates.
   */
  function getCell(row, col) {
    if (!grid[row]) return null;
    return grid[row][col] || null;
  }

  /**
   * Maps a DOM cell button back to its data model cell.
   */
  function getCellFromElement(element) {
    const row = Number(element.dataset.row);
    const col = Number(element.dataset.col);
    return getCell(row, col);
  }

  /**
   * Returns array of existing neighboring cells for propagation logic.
   */
  function getNeighbors(cell) {
    return NEIGHBORS.reduce((acc, [dRow, dCol]) => {
      const neighbor = getCell(cell.row + dRow, cell.col + dCol);
      if (neighbor) acc.push(neighbor);
      return acc;
    }, []);
  }

  /**
   * Moves focus within the grid based on arrow key input.
   */
  function handleArrowNavigation(key) {
    const movement = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const [dRow, dCol] = movement[key];
    const nextRow = clamp(focusCell.row + dRow, 0, config.rows - 1);
    const nextCol = clamp(focusCell.col + dCol, 0, config.cols - 1);
    focusCell = { row: nextRow, col: nextCol };
    const nextCell = getCell(nextRow, nextCol);
    nextCell?.element?.focus();
  }

  /**
   * Toggles the data attribute so revealed cheat info can be styled when needed.
   */
  function applyCheatState() {
    forEachCell((cell) => {
      if (cell.element) {
        cell.element.setAttribute('data-show-cheat', cheatMode ? 'true' : 'false');
      }
    });
  }

  /**
   * Updates the specials toggle text to reflect the current state.
   */
  function updateSpecialsButton() {
    if (!toggleSpecialsBtn) return;
    toggleSpecialsBtn.textContent = t('button.specials', {
      state: specialsEnabled ? t('label.on') : t('label.off'),
    });
  }

  /**
   * Updates the show/hide mines button copy.
   */
  function updateShowMinesButton() {
    if (!showMinesBtn) return;
    showMinesBtn.textContent = cheatMode ? t('button.hideMines') : t('button.showMines');
  }

  /**
   * Picks a random entry from the provided array.
   */
  function pick(array, rng = Math.random) {
    return array[Math.floor(rng() * array.length)];
  }

  /**
   * Fisher-Yates shuffles the provided array in-place.
   */
  function shuffle(array, rng = Math.random) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Clamps a number between min and max inclusive.
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Builds a deterministic RNG from a string seed.
   */
  function createRng(seed = createRandomSeed()) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i += 1) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return () => {
      h += h << 13;
      h ^= h >>> 7;
      h += h << 3;
      h ^= h >>> 17;
      h += h << 5;
      return (h >>> 0) / 4294967296;
    };
  }

  function createRandomSeed(length = ROOM_CODE_RANDOM_SEGMENT_LENGTH) {
    return Array.from({ length }, () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]).join(
      ''
    );
  }

  /**
   * Localizes a timestamp for display.
   */
  function formatTimestamp(value) {
    const date = new Date(value);
    return date.toLocaleString();
  }

  /**
   * Supplies the color used for neighbor counts based on Minesweeper conventions.
   */
  function getNumberColor(value) {
    switch (value) {
      case 1:
        return '#5af2c7';
      case 2:
        return '#68a0ff';
      case 3:
        return '#ff6b6b';
      case 4:
        return '#f2d388';
      case 5:
        return '#c084fc';
      default:
        return '#dadada';
    }
  }

  init();
})();
