const translationBundle = window.MindsweeperTranslations || {};
const LANGUAGE_OPTIONS = translationBundle.LANGUAGE_OPTIONS || [];
const TRANSLATIONS = translationBundle.TRANSLATIONS || {};

/**
 * Main entry point that scopes Mindsweeper logic, prepares DOM references, and keeps state isolated.
 */
(() => {
const historyKey = 'mindsweeperRuns';
const cubeEl = document.getElementById('cube');
const faceBoards = Array.from(document.querySelectorAll('[data-face-board]'));
const boardByFace = faceBoards.reduce((acc, board) => {
  const face = board.dataset.faceBoard;
  if (face) {
    acc[face] = board;
  }
  return acc;
}, {});
const statusMessage = document.getElementById('statusMessage');
const remainingMinesEl = document.getElementById('remainingMines');
const revealedCountEl = document.getElementById('revealedCount');
const rotationCountEl = document.getElementById('rotationCount');
const flipCountEl = document.getElementById('flipCount');
const dogCountEl = document.getElementById('dogCount');
const guardianCountEl = document.getElementById('guardianCount');
const guardianToastEl = document.getElementById('guardianToast');
const guardianIndicatorEl = document.getElementById('guardianIndicator');
const configForm = document.getElementById('configForm');
const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const minesInput = document.getElementById('minesInput');
const rotationInput = document.getElementById('rotationInput');
const flipInput = document.getElementById('flipInput');
const dogInput = document.getElementById('dogInput');
const guardianInput = document.getElementById('guardianInput');
const configScaleInfoEl = document.getElementById('configScaleInfo');
const toggleSpecialsBtn = document.getElementById('toggleSpecials');
const toggleBoardModeBtn = document.getElementById('toggleBoardMode');
const showMinesBtn = document.getElementById('showMinesHandle');
const clearHistoryBtn = document.getElementById('clearHistory');
const historyList = document.getElementById('historyList');
const historyResultFilterEl = document.getElementById('historyResultFilter');
const historyDateFilterEl = document.getElementById('historyDateFilter');
const historyShowMoreBtn = document.getElementById('historyShowMore');
const historyPanel = document.querySelector('.panel.history');
const boardWrapper = document.querySelector('.board-wrapper');
const themeButtons = document.querySelectorAll('[data-theme-option]');
const themeStorageKey = 'mindsweeperTheme';
const boardModeStorageKey = 'mindsweeperBoardMode';
const availableThemes = ['neon', 'dusk', 'sunrise', 'midnight', 'verdant', 'ember'];
const defaultTheme = availableThemes[0];
const presetButtons = document.querySelectorAll('[data-preset]');
const difficultyPresets = {
  easy: {
    rows: 8,
    cols: 8,
    mines: 10,
    rotationSpecials: 1,
    flipSpecials: 1,
    dogSpecials: 1,
    guardianSpecials: 1,
  },
  medium: {
    rows: 10,
    cols: 10,
    mines: 18,
    rotationSpecials: 2,
    flipSpecials: 2,
    dogSpecials: 1,
    guardianSpecials: 1,
  },
  hard: {
    rows: 16,
    cols: 16,
    mines: 36,
    rotationSpecials: 3,
    flipSpecials: 3,
    dogSpecials: 1,
    guardianSpecials: 1,
  },
};
let activePreset = null;
  const historyPageSize = 20;
  let historyVisibleCount = historyPageSize;
  let historyFilterResult = 'all';
  let historyFilterDate = 'all';
  const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const ROOM_CODE_RANDOM_SEGMENT_LENGTH = 4;
  const ROOM_CONFIG_SEGMENT_LENGTH = 14;
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
  const avatarHistoryListEl = document.getElementById('avatarHistoryList');
  const avatarSelectEl = document.getElementById('avatarSelect');
  const avatarPortraitEl = document.querySelector('.avatar-window__portrait');
  const avatarPersonaKey = 'mindsweeperAvatarPersona';
  const avatarPersonas = {
    friendly: { icon: '🤖' },
    evil: { icon: '😈' },
    cute: { icon: '🐰' },
    teasing: { icon: '😜' },
    megumin: { icon: '🧙‍♀️' },
    friren: { icon: '🧝‍♀️' },
  };
  const avatarPersonaOrder = Object.keys(avatarPersonas);
  let currentAvatarPersona = loadAvatarPersona();

  const defaultLocale = 'en';
  let currentLocale = loadLocale();

  let config = {
    rows: 10,
    cols: 10,
    mines: 108,
    rotationSpecials: 12,
    flipSpecials: 12,
    dogSpecials: 6,
    guardianSpecials: 6,
  };

  let grid = [];
  let runActions = [];
  let runs = loadRuns();
  let gameActive = false;
  let boardMode = loadBoardMode();
  let specialsEnabled = true;
  let cheatMode = false;
  let rotationAngle = 0;
  let cubeYaw = 36;
  let cubePitch = -28;
  let flipHorizontal = false;
  let flipVertical = false;
  let rotationTriggers = 0;
  let flipTriggers = 0;
  let dogTriggers = 0;
  let guardianTriggers = 0;
  let guardianShields = 0;
  let guardianToastTimer = null;
  let flaggedCount = 0;
  let revealedCount = 0;
  let isReplaying = false;
  let replayTimer = null;
  let focusCell = { face: 'front', row: 0, col: 0 };
  let runStartTime = Date.now();
  let currentRoomCode = null;
  let currentRoomSeed = null;
  let cubeDrag = null;
  let suppressNextReveal = false;

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
  const FACE_ORDER = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  const FACE_VECTORS = {
    front: {
      n: [0, 0, 1],
      u: [1, 0, 0],
      v: [0, 1, 0],
    },
    back: {
      n: [0, 0, -1],
      u: [-1, 0, 0],
      v: [0, 1, 0],
    },
    right: {
      n: [1, 0, 0],
      u: [0, 0, -1],
      v: [0, 1, 0],
    },
    left: {
      n: [-1, 0, 0],
      u: [0, 0, 1],
      v: [0, 1, 0],
    },
    top: {
      n: [0, -1, 0],
      u: [1, 0, 0],
      v: [0, 0, 1],
    },
    bottom: {
      n: [0, 1, 0],
      u: [1, 0, 0],
      v: [0, 0, -1],
    },
  };

  let avatarPulseTimer = null;
  const avatarPulseDuration = 1400;
  let avatarHistory = [];
  const avatarHistoryLimit = 5;

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

  if (toggleBoardModeBtn) {
    toggleBoardModeBtn.addEventListener('click', () => {
      const nextMode = boardMode === 'cube' ? '2d' : 'cube';
      applyBoardMode(nextMode);
    });
  }

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

  if (historyResultFilterEl) {
    historyResultFilterEl.addEventListener('change', () => {
      historyFilterResult = historyResultFilterEl.value;
      historyVisibleCount = historyPageSize;
      renderHistory();
    });
  }

  if (historyDateFilterEl) {
    historyDateFilterEl.addEventListener('change', () => {
      historyFilterDate = historyDateFilterEl.value;
      historyVisibleCount = historyPageSize;
      renderHistory();
    });
  }

  if (historyShowMoreBtn) {
    historyShowMoreBtn.addEventListener('click', () => {
      historyVisibleCount += historyPageSize;
      renderHistory();
    });
  }

  if (copySeedBtn) {
    copySeedBtn.addEventListener('click', () => {
      if (!currentRoomCode) return;
      copyRoomCode(currentRoomCode);
    });
  }

  if (cubeEl) {
    cubeEl.addEventListener('pointerdown', (event) => {
      if (boardMode === '2d') return;
      if (event.button !== 0) return;
      cubeDrag = {
        active: true,
        x: event.clientX,
        y: event.clientY,
        moved: false,
        pointerId: event.pointerId,
      };
    });

    document.addEventListener('pointermove', (event) => {
      if (!cubeDrag?.active || cubeDrag.pointerId !== event.pointerId) return;
      const dx = event.clientX - cubeDrag.x;
      const dy = event.clientY - cubeDrag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        cubeDrag.moved = true;
      }
      cubeDrag.x = event.clientX;
      cubeDrag.y = event.clientY;
      cubeYaw += dx * 0.35;
      cubePitch = clamp(cubePitch - dy * 0.25, -78, 78);
      applyTransform();
    });

    document.addEventListener('pointerup', (event) => {
      if (!cubeDrag?.active || cubeDrag.pointerId !== event.pointerId) return;
      if (cubeDrag.moved) {
        suppressNextReveal = true;
      }
      cubeDrag = null;
    });

    faceBoards.forEach((board) => {
      board.addEventListener('click', (event) => {
        if (isReplaying) return;
        if (suppressNextReveal) {
          suppressNextReveal = false;
          return;
        }
        const cellEl = event.target.closest('.cell');
        if (!cellEl) return;
        const cell = getCellFromElement(cellEl);
        revealCell(cell);
      });

      board.addEventListener('contextmenu', (event) => {
        if (isReplaying) return;
        event.preventDefault();
        const cellEl = event.target.closest('.cell');
        if (!cellEl) return;
        const cell = getCellFromElement(cellEl);
        applyFlag(cell, !cell.flagged, { recordAction: true });
      });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (isReplaying) return;
    if (!grid.front?.length) return;
    const { key } = event;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      handleArrowNavigation(key);
      return;
    }

    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      const cell = getCell(focusCell.face, focusCell.row, focusCell.col);
      if (cell) {
        revealCell(cell);
      }
      return;
    }

    if (key.toLowerCase() === 'f') {
      event.preventDefault();
      const cell = getCell(focusCell.face, focusCell.row, focusCell.col);
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
    applyBoardMode(boardMode, { persist: false, restart: false });
    updateSpecialsButton();
    updateShowMinesButton();
    initThemeSwitcher();
    initDifficultyPresets();
    initHistoryCollapse();
    syncHistoryFiltersUI();
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
    getCell('front', 0, 0)?.element?.focus();
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
    faceBoards.forEach((board) => board.classList.remove('board--replaying'));
  }

  /**
   * Reconstructs a saved run and steps through its recorded actions.
   * @param {Object} record Replay metadata and actions.
   */
  function startReplay(record) {
    stopReplay();
    const replayBoardMode = resolveReplayBoardMode(record);
    applyBoardMode(replayBoardMode, { persist: false, restart: false });
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
    faceBoards.forEach((board) => board.classList.add('board--replaying'));
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
      const face = action.face || 'front';
      const cell = getCell(face, action.row, action.col);
      if (cell) {
        if (action.type === 'reveal') {
          followReplayCell(cell);
        }
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
      dogSpecials: record.dogSpecials,
      guardianSpecials: record.guardianSpecials,
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
      const cell = getCell(mine.face || 'front', mine.row, mine.col);
      if (cell) {
        cell.isMine = true;
      }
    });
    (payload.rotationSpecials || []).forEach((special) => {
      const cell = getCell(special.face || 'front', special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'rotation',
          direction: special.direction,
          triggered: false,
        };
      }
    });
    (payload.flipSpecials || []).forEach((special) => {
      const cell = getCell(special.face || 'front', special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'flip',
          axis: special.axis,
          triggered: false,
        };
      }
    });
    (payload.dogSpecials || []).forEach((special) => {
      const cell = getCell(special.face || 'front', special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'dog',
          triggered: false,
        };
      }
    });
    (payload.guardianSpecials || []).forEach((special) => {
      const cell = getCell(special.face || 'front', special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'guardian',
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
      dogSpecials: getSpecialsByType('dog'),
      guardianSpecials: getSpecialsByType('guardian'),
    };
  }

  /**
   * Reads config inputs, clamps them to safe ranges, updates the form fields, and returns the new config.
   */
  function applyConfigFromForm() {
    const rows = clamp(Number(rowsInput.value) || config.rows, 5, 25);
    const cols = clamp(Number(colsInput.value) || config.cols, 5, 25);
    const faceCount = getFaceCount();
    const totalCells = rows * cols * faceCount;
    const maxMinesPerFace = Math.max(Math.floor((totalCells - 1) / faceCount), 1);
    const minesPerFace = clamp(Number(minesInput.value) || toPerFaceCount(config.mines), 1, maxMinesPerFace);
    const mines = minesPerFace * faceCount;
    const safeCellsTotal = Math.max(totalCells - mines, 0);
    const maxRotationPerFace = Math.floor(safeCellsTotal / faceCount);
    const rotationPerFace = clamp(
      Number(rotationInput.value) || toPerFaceCount(config.rotationSpecials),
      0,
      maxRotationPerFace
    );
    const rotationSpecials = rotationPerFace * faceCount;

    const maxFlipPerFace = Math.floor(Math.max(safeCellsTotal - rotationSpecials, 0) / faceCount);
    const flipPerFace = clamp(
      Number(flipInput.value) || toPerFaceCount(config.flipSpecials),
      0,
      maxFlipPerFace
    );
    const flipSpecials = flipPerFace * faceCount;

    const maxDogPerFace = Math.floor(Math.max(safeCellsTotal - rotationSpecials - flipSpecials, 0) / faceCount);
    const dogPerFace = clamp(
      Number(dogInput.value) || toPerFaceCount(config.dogSpecials),
      0,
      maxDogPerFace
    );
    const dogSpecials = dogPerFace * faceCount;

    const maxGuardianPerFace = Math.floor(
      Math.max(safeCellsTotal - rotationSpecials - flipSpecials - dogSpecials, 0) / faceCount
    );
    const guardianPerFace = clamp(
      Number(guardianInput.value) || toPerFaceCount(config.guardianSpecials),
      0,
      maxGuardianPerFace
    );
    const guardianSpecials = guardianPerFace * faceCount;

    applyConfigToInputs({
      rows,
      cols,
      mines,
      rotationSpecials,
      flipSpecials,
      dogSpecials,
      guardianSpecials,
    });
    updateConfigScalingNote();
    return {
      rows,
      cols,
      mines,
      rotationSpecials,
      flipSpecials,
      dogSpecials,
      guardianSpecials,
    };
  }

  /**
   * Pushes normalized configuration values back into the aligned form inputs.
   * @param {Object} values Configuring values to render in inputs.
   */
  function applyConfigToInputs(values) {
    rowsInput.value = values.rows;
    colsInput.value = values.cols;
    minesInput.value = toPerFaceCount(values.mines);
    rotationInput.value = toPerFaceCount(values.rotationSpecials);
    flipInput.value = toPerFaceCount(values.flipSpecials);
    if (dogInput) {
      dogInput.value = toPerFaceCount(values.dogSpecials ?? 0);
    }
    if (guardianInput) {
      guardianInput.value = toPerFaceCount(values.guardianSpecials ?? 0);
    }
    updateConfigScalingNote();
  }

  /**
   * Builds a blank grid data structure reflecting the requested dimensions.
   */
  function createGrid(rows, cols) {
    return getActiveFaces().reduce((acc, face) => {
      acc[face] = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({
          face,
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
      return acc;
    }, {});
  }

  /**
   * Randomly distributes the requested number of mine cells across the board.
   */
  function placeMines(count, rng = Math.random) {
    const cells = [];
    getActiveFaces().forEach((face) => {
      for (let row = 0; row < config.rows; row += 1) {
        for (let col = 0; col < config.cols; col += 1) {
          cells.push({ face, row, col });
        }
      }
    });
    shuffle(cells, rng);
    const selection = cells.slice(0, count);
    selection.forEach(({ face, row, col }) => {
      const cell = getCell(face, row, col);
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
    available = available.slice(config.flipSpecials);
    flipCells.forEach((cell) => {
      cell.special = {
        type: 'flip',
        axis: pick(['horizontal', 'vertical'], rng),
        triggered: false,
      };
    });
    const dogCells = available.slice(0, config.dogSpecials);
    available = available.slice(config.dogSpecials);
    dogCells.forEach((cell) => {
      cell.special = {
        type: 'dog',
        triggered: false,
      };
    });
    const guardianCells = available.slice(0, config.guardianSpecials);
    guardianCells.forEach((cell) => {
      cell.special = {
        type: 'guardian',
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
    FACE_ORDER.forEach((face) => {
      const boardEl = boardByFace[face];
      if (!boardEl) return;
      boardEl.innerHTML = '';
      boardEl.style.gridTemplateColumns = `repeat(${config.cols}, minmax(0, 1fr))`;
    });
    forEachCell((cell) => {
      const boardEl = boardByFace[cell.face];
      if (!boardEl) return;
      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.className = 'cell';
      cellEl.setAttribute('data-face', cell.face);
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
      if (cell.special?.type === 'dog') {
        cellEl.classList.add('cell--special-dog');
      }
      if (cell.special?.type === 'guardian') {
        cellEl.classList.add('cell--special-guardian');
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
    const pos = describeCellPosition(cell);
    if (!replay && cell.isMine && guardianShields > 0) {
      guardianShields -= 1;
      speakAvatar('specialGuardianSave', { pos });
      showStatusMessage('status.guardianSaved');
      showGuardianToast('status.guardianSaved');
      applyFlag(cell, true, { recordAction, replay: false, userAction: false });
      updateStatus();
      return;
    }
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
      runActions.push({ type: 'reveal', face: cell.face, row: cell.row, col: cell.col });
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
      runActions.push({ type: 'flag', face: cell.face, row: cell.row, col: cell.col, flagged: shouldFlag });
    }
    if (userAction && !replay) {
      commentOnFlag(cell, shouldFlag);
    }
    updateStatus();
  }

  /**
   * Activates a discovered special cell when special effects are enabled.
   */
  function triggerSpecial(special, cell) {
    if (!special || special.triggered) return;
    if (!specialsEnabled) return;
    special.triggered = true;
    const pos = describeCellPosition(cell);
    speakAvatar('specialHit', { pos });
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
    } else if (special.type === 'dog') {
      dogTriggers += 1;
      flagRandomMine();
    } else if (special.type === 'guardian') {
      guardianTriggers += 1;
      guardianShields += 1;
      showStatusMessage('status.guardianReady', { shields: guardianShields });
      showGuardianToast('status.guardianReady', { shields: guardianShields });
    }
    applyTransform();
    updateStatus();
    commentOnSpecial(special, cell);
  }

  function flagRandomMine(options = {}) {
    const { recordAction = true } = options;
    const candidates = [];
    forEachCell((cell) => {
      if (cell.isMine && !cell.flagged) {
        candidates.push(cell);
      }
    });
    if (!candidates.length) return null;
    const target = pick(candidates);
    applyFlag(target, true, { recordAction, replay: false, userAction: false });
    return target;
  }

  /**
   * Applies current rotation/flip transforms to the cube container.
   */
  function applyTransform() {
    if (!cubeEl) return;
    if (boardMode === '2d') {
      const board = boardByFace.front;
      if (board) {
        const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
        const scaleY = specialsEnabled && flipVertical ? -1 : 1;
        const spin = specialsEnabled ? rotationAngle : 0;
        board.style.transform = `rotate(${spin}deg) scale(${scaleX}, ${scaleY})`;
      }
      cubeEl.style.transform = 'none';
      updateWrapperSpacing(false);
      return;
    }
    if (boardByFace.front) {
      boardByFace.front.style.transform = 'none';
    }
    const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
    const scaleY = specialsEnabled && flipVertical ? -1 : 1;
    const spinY = specialsEnabled ? rotationAngle : 0;
    cubeEl.style.transform = `rotateX(${cubePitch}deg) rotateY(${cubeYaw + spinY}deg) scale(${scaleX}, ${scaleY})`;
    updateWrapperSpacing(false);
  }

  /**
   * Adjusts wrapper classes based on rotation to preserve layout spacing.
   */
  function updateWrapperSpacing(rotated = rotationAngle % 180 !== 0) {
    if (!boardWrapper) return;
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
    if (dogCountEl) {
      dogCountEl.textContent = dogTriggers;
    }
    if (guardianCountEl) {
      guardianCountEl.textContent = guardianTriggers;
    }
    updateGuardianIndicator();
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
    const totalSafeCells = config.rows * config.cols * getActiveFaces().length - config.mines;
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
      dogTriggers,
      guardianTriggers,
      totalCells: config.rows * config.cols * getActiveFaces().length,
      minePositions: layoutPayload.minePositions,
      rotationSpecials: layoutPayload.rotationSpecials,
      flipSpecials: layoutPayload.flipSpecials,
      dogSpecials: layoutPayload.dogSpecials,
      guardianSpecials: layoutPayload.guardianSpecials,
      layout: layoutPayload,
      boardMode,
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
        mines.push({ face: cell.face, row: cell.row, col: cell.col });
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
          list.push({ face: cell.face, row: cell.row, col: cell.col, direction: cell.special.direction });
        } else if (type === 'flip') {
          list.push({ face: cell.face, row: cell.row, col: cell.col, axis: cell.special.axis });
        } else if (type === 'dog') {
          list.push({ face: cell.face, row: cell.row, col: cell.col });
        } else if (type === 'guardian') {
          list.push({ face: cell.face, row: cell.row, col: cell.col });
        }
      }
    });
    return list;
  }

  /**
   * Generates the history UI from saved runs, including action buttons.
   */
  function renderHistory() {
    clearHistoryBtn.disabled = !runs.length;
    const filteredRuns = getFilteredRuns();
    if (!runs.length) {
      historyList.innerHTML = `<p class="history-empty">${t('history.empty')}</p>`;
      updateHistoryShowMoreButton(0);
      return;
    }
    if (!filteredRuns.length) {
      historyList.innerHTML = `<p class="history-empty">${t('history.filteredEmpty')}</p>`;
      updateHistoryShowMoreButton(0);
      return;
    }
    const visibleRuns = filteredRuns.slice(0, historyVisibleCount);
    historyList.innerHTML = '';
    visibleRuns.forEach((run) => {
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
      const boardType = document.createElement('p');
      const runMode = resolveReplayBoardMode(run);
      boardType.textContent = `Board: ${runMode === '2d' ? '2D' : 'Cube'}`;
      wrapper.appendChild(boardType);
      const specials = document.createElement('p');
      specials.textContent = t('history.metaSpecials', {
        rotations: run.rotationTriggers,
        flips: run.flipTriggers,
        dogs: run.dogTriggers,
        guardians: run.guardianTriggers ?? 0,
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
    updateHistoryShowMoreButton(filteredRuns.length);
  }

  function getFilteredRuns() {
    const now = Date.now();
    const maxAgeMsByFilter = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    const maxAgeMs = maxAgeMsByFilter[historyFilterDate] ?? null;
    return runs.filter((run) => {
      if (historyFilterResult !== 'all' && run.result !== historyFilterResult) {
        return false;
      }
      if (!maxAgeMs) return true;
      const timestamp = Date.parse(run.timestamp);
      if (Number.isNaN(timestamp)) return false;
      return now - timestamp <= maxAgeMs;
    });
  }

  function updateHistoryShowMoreButton(totalFilteredCount) {
    if (!historyShowMoreBtn) return;
    const remaining = Math.max(totalFilteredCount - historyVisibleCount, 0);
    if (remaining <= 0) {
      historyShowMoreBtn.hidden = true;
      historyShowMoreBtn.disabled = true;
      return;
    }
    historyShowMoreBtn.hidden = false;
    historyShowMoreBtn.disabled = false;
    const step = Math.min(historyPageSize, remaining);
    historyShowMoreBtn.textContent = t('history.showMore', { count: step, remaining });
  }

  function syncHistoryFiltersUI() {
    if (historyResultFilterEl) {
      historyResultFilterEl.value = historyFilterResult;
    }
    if (historyDateFilterEl) {
      historyDateFilterEl.value = historyFilterDate;
    }
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

  function showGuardianToast(key, replacements = {}) {
    if (!guardianToastEl) return;
    const text = t(key, replacements);
    if (!text) return;
    guardianToastEl.textContent = text;
    guardianToastEl.classList.add('toast--visible');
    if (guardianToastTimer) {
      clearTimeout(guardianToastTimer);
    }
    guardianToastTimer = setTimeout(() => {
      guardianToastEl.classList.remove('toast--visible');
    }, 3200);
  }

  function updateGuardianIndicator() {
    if (!guardianIndicatorEl) return;
    if (guardianShields <= 0) {
      guardianIndicatorEl.classList.remove('guardian-indicator--visible');
      guardianIndicatorEl.textContent = '';
      return;
    }
    const icons = '🛡'.repeat(Math.min(guardianShields, 5));
    guardianIndicatorEl.textContent = icons;
    guardianIndicatorEl.classList.add('guardian-indicator--visible');
  }

  function describeCellPosition(cell) {
    if (!cell) return 'the board';
    return `${cell.face} ${cell.row + 1},${cell.col + 1}`;
  }

  function loadAvatarPersona() {
    const stored = safeGetItem(avatarPersonaKey);
    if (stored && avatarPersonas[stored]) {
      return stored;
    }
    return 'friendly';
  }

  function initAvatarSwitcher() {
    if (avatarSelectEl) {
      avatarSelectEl.addEventListener('change', () => {
        setAvatarPersona(avatarSelectEl.value);
      });
    }
    if (avatarPortraitEl && avatarSelectEl) {
      const showSelect = () => {
        avatarSelectEl.parentElement?.classList.add('avatar-select--active');
        if (avatarSelectEl.showPicker) {
          avatarSelectEl.showPicker();
        }
        avatarSelectEl.focus();
      };
      const hideSelect = () => {
        avatarSelectEl.parentElement?.classList.remove('avatar-select--active');
      };
      avatarPortraitEl.addEventListener('click', showSelect);
      avatarSelectEl.addEventListener('blur', hideSelect);
      avatarSelectEl.addEventListener('change', hideSelect);
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
    if (avatarSelectEl) {
      avatarSelectEl.value = normalized;
      avatarSelectEl.parentElement?.setAttribute('data-avatar-icon', avatarPersonas[normalized].icon);
    }
    if (persist) {
      safeSetItem(avatarPersonaKey, normalized);
    }
  }

  function getAvatarLines(key) {
    const personaLines =
      TRANSLATIONS[currentLocale]?.avatar?.personas?.[currentAvatarPersona]?.[key];
    if (Array.isArray(personaLines) && personaLines.length) {
      return personaLines;
    }
    const fallbackPersonaLines =
      TRANSLATIONS.en?.avatar?.personas?.[currentAvatarPersona]?.[key];
    if (Array.isArray(fallbackPersonaLines) && fallbackPersonaLines.length) {
      return fallbackPersonaLines;
    }
    const friendlyFallback =
      TRANSLATIONS.en?.avatar?.personas?.friendly?.[key];
    return Array.isArray(friendlyFallback) ? friendlyFallback : [];
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
    appendAvatarHistory(message);
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

  function appendAvatarHistory(message) {
    if (!avatarHistoryListEl) return;
    avatarHistory.unshift(message);
    if (avatarHistory.length > avatarHistoryLimit) {
      avatarHistory = avatarHistory.slice(0, avatarHistoryLimit);
    }
    avatarHistoryListEl.innerHTML = avatarHistory
      .map((line) => `<li>${line}</li>`)
      .join('');
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
    } else if (special.type === 'dog') {
      speakAvatar('specialDog', { pos }, { duration: 1700 });
    } else if (special.type === 'guardian') {
      speakAvatar('specialGuardian', { pos }, { duration: 1700 });
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
  function resolveTranslation(locale, key) {
    const segments = key.split('.');
    let node = TRANSLATIONS[locale];
    for (const segment of segments) {
      if (!node || !(segment in node)) {
        return null;
      }
      node = node[segment];
    }
    return node;
  }

  function t(key, replacements = {}) {
    let text = resolveTranslation(currentLocale, key);
    if (text == null && currentLocale !== defaultLocale) {
      text = resolveTranslation(defaultLocale, key);
    }
    if (text == null) return key;
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
      updateConfigScalingNote();
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
      config.dogSpecials ?? 0,
      config.guardianSpecials ?? 0,
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
    if (!configSegment || !seedSegment) {
      return null;
    }
    const validLengths = [
      ROOM_CONFIG_SEGMENT_LENGTH,
      ROOM_CONFIG_SEGMENT_LENGTH - 2,
      ROOM_CONFIG_SEGMENT_LENGTH - 4,
    ];
    if (!validLengths.includes(configSegment.length)) {
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
    const [
      rows,
      cols,
      mines,
      rotationSpecials,
      flipSpecials,
      dogSpecials = 0,
      guardianSpecials = 0,
    ] = values;
    return {
      config: {
        rows,
        cols,
        mines,
        rotationSpecials,
        flipSpecials,
        dogSpecials,
        guardianSpecials,
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
    cubeYaw = 36;
    cubePitch = -28;
    flipHorizontal = false;
    flipVertical = false;
    rotationTriggers = 0;
    flipTriggers = 0;
    dogTriggers = 0;
    guardianTriggers = 0;
    guardianShields = 0;
    flaggedCount = 0;
    revealedCount = 0;
    focusCell = { face: 'front', row: 0, col: 0 };
    suppressNextReveal = false;
    cubeDrag = null;
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
    [rowsInput, colsInput, minesInput, rotationInput, flipInput, dogInput, guardianInput]
      .filter(Boolean)
      .forEach((input) => {
      input.addEventListener('input', () => setActivePreset(null));
      input.addEventListener('input', () => updateConfigScalingNote());
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
    const faceCount = getFaceCount();
    applyConfigToInputs({
      rows: preset.rows,
      cols: preset.cols,
      mines: preset.mines * faceCount,
      rotationSpecials: preset.rotationSpecials * faceCount,
      flipSpecials: preset.flipSpecials * faceCount,
      dogSpecials: (preset.dogSpecials ?? 0) * faceCount,
      guardianSpecials: (preset.guardianSpecials ?? 0) * faceCount,
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
    getActiveFaces().forEach((face) => {
      const faceGrid = grid[face] || [];
      faceGrid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          callback(cell, rowIndex, colIndex, face);
        });
      });
    });
  }

  /**
   * Safely returns a grid cell by coordinates.
   */
  function getCell(face, row, col) {
    if (!grid[face] || !grid[face][row]) return null;
    return grid[face][row][col] || null;
  }

  /**
   * Maps a DOM cell button back to its data model cell.
   */
  function getCellFromElement(element) {
    const face = element.dataset.face || 'front';
    const row = Number(element.dataset.row);
    const col = Number(element.dataset.col);
    return getCell(face, row, col);
  }

  /**
   * Returns array of existing neighboring cells for propagation logic.
   */
  function getNeighbors(cell) {
    if (boardMode === '2d') {
      return NEIGHBORS.reduce((acc, [dRow, dCol]) => {
        const neighbor = getCell('front', cell.row + dRow, cell.col + dCol);
        if (neighbor && neighbor !== cell) {
          acc.push(neighbor);
        }
        return acc;
      }, []);
    }
    const seen = new Set();
    return NEIGHBORS.reduce((acc, [dRow, dCol]) => {
      const target = resolveNeighbor(cell, dRow, dCol);
      if (target) {
        const neighbor = getCell(target.face, target.row, target.col);
        if (neighbor && neighbor !== cell) {
          const key = `${target.face}:${target.row}:${target.col}`;
          if (!seen.has(key)) {
            seen.add(key);
            acc.push(neighbor);
          }
        }
      }
      return acc;
    }, []);
  }

  function resolveNeighbor(cell, dRow, dCol) {
    if (!cell) return null;
    const basis = FACE_VECTORS[cell.face];
    if (!basis) return null;
    const x = ((cell.col + 0.5) / config.cols) * 2 - 1;
    const y = ((cell.row + 0.5) / config.rows) * 2 - 1;
    const p = addVec3(
      basis.n,
      addVec3(scaleVec3(basis.u, x), scaleVec3(basis.v, y))
    );
    const step = addVec3(
      scaleVec3(basis.u, dCol * (2 / config.cols)),
      scaleVec3(basis.v, dRow * (2 / config.rows))
    );
    const q = addVec3(p, scaleVec3(step, 1 + 1e-6));
    return projectPointToFaceCell(q);
  }

  function projectPointToFaceCell(point) {
    const ax = Math.abs(point[0]);
    const ay = Math.abs(point[1]);
    const az = Math.abs(point[2]);
    let face = 'front';
    if (ax >= ay && ax >= az) {
      face = point[0] >= 0 ? 'right' : 'left';
    } else if (ay >= ax && ay >= az) {
      face = point[1] >= 0 ? 'bottom' : 'top';
    } else {
      face = point[2] >= 0 ? 'front' : 'back';
    }
    const basis = FACE_VECTORS[face];
    const x = dotVec3(point, basis.u);
    const y = dotVec3(point, basis.v);
    const col = clamp(Math.floor(((x + 1) / 2) * config.cols), 0, config.cols - 1);
    const row = clamp(Math.floor(((y + 1) / 2) * config.rows), 0, config.rows - 1);
    return { face, row, col };
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
    if (boardMode === '2d') {
      const nextRow = clamp(focusCell.row + dRow, 0, config.rows - 1);
      const nextCol = clamp(focusCell.col + dCol, 0, config.cols - 1);
      focusCell = { face: 'front', row: nextRow, col: nextCol };
      const nextCell = getCell('front', nextRow, nextCol);
      nextCell?.element?.focus();
      return;
    }
    const origin = getCell(focusCell.face, focusCell.row, focusCell.col);
    const next = resolveNeighbor(origin, dRow, dCol);
    if (!next) return;
    focusCell = next;
    const nextCell = getCell(next.face, next.row, next.col);
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

  function getFaceCount() {
    return boardMode === '2d' ? 1 : FACE_ORDER.length;
  }

  function toPerFaceCount(total) {
    const faceCount = Math.max(getFaceCount(), 1);
    const numeric = Number(total) || 0;
    return Math.max(0, Math.round(numeric / faceCount));
  }

  function updateConfigScalingNote() {
    if (!configScaleInfoEl) return;
    const faceCount = getFaceCount();
    const minesPerFace = clamp(Number(minesInput.value) || 0, 0, 9999);
    const rotationPerFace = clamp(Number(rotationInput.value) || 0, 0, 9999);
    const flipPerFace = clamp(Number(flipInput.value) || 0, 0, 9999);
    const dogPerFace = clamp(Number(dogInput?.value) || 0, 0, 9999);
    const guardianPerFace = clamp(Number(guardianInput?.value) || 0, 0, 9999);
    configScaleInfoEl.textContent = t('config.scaleInfo', {
      faces: faceCount,
      mines: minesPerFace * faceCount,
      rotations: rotationPerFace * faceCount,
      flips: flipPerFace * faceCount,
      dogs: dogPerFace * faceCount,
      guardians: guardianPerFace * faceCount,
    });
  }

  function getActiveFaces() {
    return boardMode === '2d' ? ['front'] : FACE_ORDER;
  }

  function loadBoardMode() {
    const stored = safeGetItem(boardModeStorageKey);
    return stored === '2d' ? '2d' : 'cube';
  }

  function applyBoardMode(mode, options = {}) {
    const { persist = true, restart = true } = options;
    boardMode = mode === '2d' ? '2d' : 'cube';
    boardWrapper?.setAttribute('data-board-mode', boardMode);
    updateBoardModeButton();
    updateConfigScalingNote();
    if (persist) {
      safeSetItem(boardModeStorageKey, boardMode);
    }
    if (restart) {
      setActivePreset(null);
      startNewGame();
    } else {
      applyTransform();
    }
  }

  function updateBoardModeButton() {
    if (!toggleBoardModeBtn) return;
    toggleBoardModeBtn.textContent = boardMode === '2d' ? 'Board: 2D' : 'Board: Cube';
  }

  function resolveReplayBoardMode(record) {
    if (record?.boardMode === '2d' || record?.boardMode === 'cube') {
      return record.boardMode;
    }
    const rows = Number(record?.config?.rows) || 0;
    const cols = Number(record?.config?.cols) || 0;
    const total2dCells = rows * cols;
    if (total2dCells > 0 && Number(record?.totalCells) === total2dCells) {
      return '2d';
    }
    const hasNonFrontFaceData = [
      ...(record?.minePositions || []),
      ...(record?.rotationSpecials || []),
      ...(record?.flipSpecials || []),
      ...(record?.dogSpecials || []),
      ...(record?.guardianSpecials || []),
      ...(record?.actions || []),
    ].some((entry) => entry?.face && entry.face !== 'front');
    return hasNonFrontFaceData ? 'cube' : boardMode;
  }

  function followReplayCell(cell) {
    if (boardMode !== 'cube' || !cell) return;
    const spinY = specialsEnabled ? rotationAngle : 0;
    let targetYaw = 0;
    let targetPitch = -28;
    if (cell.face === 'right') {
      targetYaw = -90;
    } else if (cell.face === 'back') {
      targetYaw = 180;
    } else if (cell.face === 'left') {
      targetYaw = 90;
    } else if (cell.face === 'top') {
      targetPitch = -76;
    } else if (cell.face === 'bottom') {
      targetPitch = 70;
    }
    const desiredCameraYaw = targetYaw - spinY;
    cubeYaw = shortestAngleTarget(cubeYaw, desiredCameraYaw);
    cubePitch = shortestAngleTarget(cubePitch, targetPitch);
    applyTransform();
  }

  function shortestAngleTarget(current, target) {
    const delta = normalizeAngle(target - current);
    return current + delta;
  }

  function normalizeAngle(value) {
    let angle = value % 360;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    return angle;
  }

  function addVec3(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  function scaleVec3(v, scalar) {
    return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
  }

  function dotVec3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
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
