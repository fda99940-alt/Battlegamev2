const translationBundle = window.MindsweeperTranslations || {};
const LANGUAGE_OPTIONS = translationBundle.LANGUAGE_OPTIONS || [];
const TRANSLATIONS = translationBundle.TRANSLATIONS || {};

/**
 * Main entry point that scopes Mindsweeper logic, prepares DOM references, and keeps state isolated.
 */
(() => {
const historyKey = 'mindsweeperRuns';
const cubeEl = document.getElementById('cube');
let faceBoards = [];
const statusMessage = document.getElementById('statusMessage');
const remainingMinesEl = document.getElementById('remainingMines');
const elapsedTimeEl = document.getElementById('elapsedTime');
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
const facesInput = document.getElementById('facesInput');
const faceShapeInfoEl = document.getElementById('faceShapeInfo');
const configScaleInfoEl = document.getElementById('configScaleInfo');
const toggleSpecialsBtn = document.getElementById('toggleSpecials');
const toggleBoardModeBtn = document.getElementById('toggleBoardMode');
const rendererModeSelectEl = document.getElementById('rendererModeSelect');
const showMinesBtn = document.getElementById('showMinesHandle');
const clearHistoryBtn = document.getElementById('clearHistory');
const historyList = document.getElementById('historyList');
const historyResultFilterEl = document.getElementById('historyResultFilter');
const historyDateFilterEl = document.getElementById('historyDateFilter');
const historyShowMoreBtn = document.getElementById('historyShowMore');
const historyPanel = document.querySelector('.panel.history');
const boardWrapper = document.querySelector('.board-wrapper');
const toggleFocusModeBtn = document.getElementById('toggleFocusMode');
const appShellEl = document.querySelector('.app-shell');
const toggleNeighborDebugBtn = document.getElementById('toggleNeighborDebug');
const neighborDebugEl = document.getElementById('neighborDebug');
const themeButtons = document.querySelectorAll('[data-theme-option]');
const themeStorageKey = 'mindsweeperTheme';
const boardModeStorageKey = 'mindsweeperBoardMode';
const rendererStorageKey = 'mindsweeperRenderer';
const neighborDebugStorageKey = 'mindsweeperNeighborDebug';
const focusModeStorageKey = 'mindsweeperFocusMode';
const SUPPORTED_RENDERERS = ['dom', 'canvas', 'svg', 'webgl', 'three'];
const availableThemes = ['neon', 'dusk', 'sunrise', 'midnight', 'verdant', 'ember'];
const defaultTheme = 'ember';
const presetButtons = document.querySelectorAll('[data-preset]');
const ALLOWED_FACE_COUNTS = [6];
const FACE_SHAPE_NAME = 'Cube (d6)';
const CUBE_FACE_TRANSITIONS = {
  0: { left: 3, right: 1, up: 4, down: 5 }, // front
  1: { left: 0, right: 2, up: 4, down: 5 }, // right
  2: { left: 1, right: 3, up: 4, down: 5 }, // back
  3: { left: 2, right: 0, up: 4, down: 5 }, // left
  4: { left: 3, right: 1, up: 2, down: 0 }, // top
  5: { left: 3, right: 1, up: 0, down: 2 }, // bottom
};
const REPLAY_CAMERA_BY_FACE = {
  0: { yaw: 0, pitch: -20 },   // front
  1: { yaw: -90, pitch: -20 }, // right
  2: { yaw: 180, pitch: -20 }, // back
  3: { yaw: 90, pitch: -20 },  // left
  4: { yaw: 0, pitch: -85 },   // top
  5: { yaw: 0, pitch: 68 },    // bottom
};
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
  const ROOM_CONFIG_SEGMENT_LENGTH = 24;
  function requireModule(key, path) {
    const module = window[key];
    if (!module) {
      throw new Error(`Missing module: ${path}`);
    }
    return module;
  }
  const coreUtils = requireModule('MindsweeperCoreUtils', 'modules/coreUtils.js');
  const historyStore = requireModule('MindsweeperHistoryStore', 'modules/historyStore.js');
  const i18n = requireModule('MindsweeperI18n', 'modules/i18n.js');
  const avatarCommentary = requireModule('MindsweeperAvatarCommentary', 'modules/avatarCommentary.js');
  const boardGeneration = requireModule('MindsweeperBoardGeneration', 'modules/boardGeneration.js');
  const boardActions = requireModule('MindsweeperBoardActions', 'modules/boardActions.js');
  const boardTopology = requireModule('MindsweeperBoardTopology', 'modules/boardTopology.js');
  const uiControls = requireModule('MindsweeperUiControls', 'modules/uiControls.js');
  const roomCodes = requireModule('MindsweeperRoomCodes', 'modules/roomCodes.js');
  const {
    clamp,
    pick,
    shuffle,
    createRng,
    shortestAngleTarget,
    formatTimestamp,
    getNumberColor,
  } = coreUtils;
  const createRandomSeed = (length = ROOM_CODE_RANDOM_SEGMENT_LENGTH) =>
    coreUtils.createRandomSeed({
      length,
      alphabet: ROOM_CODE_ALPHABET,
    });
  const createDistinctSeed = (previousSeed, maxAttempts = 12) =>
    coreUtils.createDistinctSeed(previousSeed, {
      maxAttempts,
      length: ROOM_CODE_RANDOM_SEGMENT_LENGTH,
      alphabet: ROOM_CODE_ALPHABET,
    });
  const toggleHistoryBtn = document.getElementById('toggleHistory');
  const historyCollapsedKey = 'mindsweeperHistoryCollapsed';
  const roomCodeInput = document.getElementById('roomCodeInput');
  const joinRoomBtn = document.getElementById('joinRoom');
  const seedCodeEl = document.getElementById('seedCode');
  const copySeedBtn = document.getElementById('copySeedCode');
  const roomMapKey = 'mindsweeperRooms';
  let roomMap = historyStore.loadRoomMap({ safeGetJSON, roomMapKey });
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
  let currentAvatarPersona = loadAvatarPersona();

  const defaultLocale = 'en';
  let currentLocale = loadLocale();

  let config = {
    rows: 10,
    cols: 10,
    faces: 6,
    mines: 108,
    rotationSpecials: 12,
    flipSpecials: 12,
    dogSpecials: 6,
    guardianSpecials: 6,
  };

  let grid = [];
  let runActions = [];
  let runs = historyStore.loadRuns({ safeGetJSON, historyKey });
  let gameActive = false;
  let boardMode = loadBoardMode();
  let rendererMode = loadRendererMode();
  let activeRenderer = null;
  let focusMode = safeGetItem(focusModeStorageKey) === 'true';
  let specialsEnabled = true;
  let cheatMode = false;
  let rotationAngle = 0;
  let cubeYaw = 36;
  let cubePitch = -28;
  let cubeZoom = 1;
  const cubeZoomMin = 0.2;
  const cubeZoomMax = 2.2;
  const cubeZoomSensitivity = 0.0015;
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
  let elapsedTimer = null;
  let focusCell = { face: 'f0', row: 0, col: 0 };
  let runStartTime = Date.now();
  let currentRoomCode = null;
  let currentRoomSeed = null;
  let cubeDrag = null;
  let suppressNextReveal = false;
  let neighborDebugEnabled = safeGetItem(neighborDebugStorageKey) === 'true';
  let neighborDebugOriginNodes = [];
  let neighborDebugNeighborNodes = [];
  let neighborDebugHoverNodes = [];

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
  let avatarHistory = [];
  const avatarHistoryLimit = 5;

  function updatePlayLayoutState() {
    if (!appShellEl) return;
    appShellEl.classList.toggle('app-shell--playing', Boolean(gameActive || isReplaying));
  }

  function updateFocusModeButton() {
    if (!toggleFocusModeBtn) return;
    toggleFocusModeBtn.textContent = `Focus: ${focusMode ? 'on' : 'off'}`;
    toggleFocusModeBtn.setAttribute('aria-pressed', String(focusMode));
  }

  function applyFocusMode(enabled, options = {}) {
    focusMode = Boolean(enabled);
    if (appShellEl) {
      appShellEl.classList.toggle('app-shell--focus', focusMode);
    }
    updateFocusModeButton();
    if (options.persist ?? true) {
      safeSetItem(focusModeStorageKey, String(focusMode));
    }
  }

  function formatElapsed(ms) {
    const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function restartElapsedTimer() {
    if (elapsedTimer) {
      clearInterval(elapsedTimer);
      elapsedTimer = null;
    }
    elapsedTimer = setInterval(() => {
      if (!gameActive || !runStartTime) return;
      updateStatus();
    }, 1000);
  }

  configForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setActivePreset(null);
    startNewGame({ forceNewSeed: true });
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

  if (toggleFocusModeBtn) {
    toggleFocusModeBtn.addEventListener('click', () => {
      applyFocusMode(!focusMode);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    runs = [];
    roomMap = {};
    persistRuns();
    persistRoomMap();
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

    cubeEl.addEventListener('click', (event) => {
      if (isReplaying) return;
      if (suppressNextReveal) {
        suppressNextReveal = false;
        return;
      }
      const cell = resolveCellFromInteractionTarget(event);
      if (!cell) return;
      renderNeighborDebug(cell);
      revealCell(cell);
    });

    cubeEl.addEventListener('contextmenu', (event) => {
      if (isReplaying) return;
      event.preventDefault();
      const cell = resolveCellFromInteractionTarget(event);
      if (!cell) return;
      renderNeighborDebug(cell);
      applyFlag(cell, !cell.flagged, { recordAction: true });
    });

    cubeEl.addEventListener('pointermove', (event) => {
      if (cubeDrag?.active) return;
      const cell = resolveCellFromInteractionTarget(event);
      if (!cell) return;
      renderNeighborDebug(cell);
    });

    cubeEl.addEventListener('pointerleave', () => {
      renderNeighborDebug();
    });

    cubeEl.addEventListener(
      'wheel',
      (event) => {
        if (boardMode === '2d') return;
        if (event.ctrlKey) return;
        event.preventDefault();
        const factor = Math.exp(-event.deltaY * cubeZoomSensitivity);
        cubeZoom = clamp(cubeZoom * factor, cubeZoomMin, cubeZoomMax);
        applyTransform();
      },
      { passive: false }
    );
  }

  document.addEventListener('keydown', (event) => {
    if (isReplaying) return;
    if (!grid[getActiveFaces()[0]]?.length) return;
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
    applyRendererMode(rendererMode, { persist: false, restart: false, rebuildFaces: false });
    initRendererModeSelector();
    ensureCubeFaces(config.faces);
    initLanguageSwitcher();
    initAvatarSwitcher();
    applyStaticTranslations();
    applyBoardMode(boardMode, { persist: false, restart: false });
    updateSpecialsButton();
    updateShowMinesButton();
    initThemeSwitcher();
    initDifficultyPresets();
    if (facesInput) {
      facesInput.value = '6';
    }
    initHistoryCollapse();
    syncHistoryFiltersUI();
    initRoomJoin();
    initNeighborDebugToggle();
    applyFocusMode(focusMode, { persist: false });
    renderHistory();
    applyCheatState();
    startNewGame();
    renderNeighborDebug();
    window.addEventListener('resize', layoutCubeFaces);
  }

  /**
   * Resets state for a fresh run, builds a new grid, and renders the updated board.
   */
  function startNewGame(options = {}) {
    const { roomCode, layout, seed, forceNewSeed = false } = options;
    stopReplay();
    runStartTime = Date.now();
    const safeConfig = applyConfigFromForm();
    config = { ...safeConfig };
    ensureCubeFaces(config.faces);
    resetBoardState();
    gameActive = true;
    updatePlayLayoutState();
    grid = createGrid(config.rows, config.cols);
    const seedValue = seed || (forceNewSeed ? createDistinctSeed(currentRoomSeed) : currentRoomSeed || createRandomSeed());
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
    restartElapsedTimer();
    const firstFace = getActiveFaces()[0];
    renderNeighborDebug(getCell(firstFace, 0, 0));
    showStatusMessage('status.newBoard');
    getCell(getActiveFaces()[0], 0, 0)?.element?.focus();
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
    updatePlayLayoutState();
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
    updatePlayLayoutState();
    runStartTime = null;
    applyConfigToInputs(record.config);
    config = { ...record.config };
    ensureCubeFaces(config.faces || 6);
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
      const face = normalizeFaceId(action.face);
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
      const cell = getCell(normalizeFaceId(mine.face), mine.row, mine.col);
      if (cell) {
        cell.isMine = true;
      }
    });
    (payload.rotationSpecials || []).forEach((special) => {
      const cell = getCell(normalizeFaceId(special.face), special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'rotation',
          direction: special.direction,
          triggered: false,
        };
      }
    });
    (payload.flipSpecials || []).forEach((special) => {
      const cell = getCell(normalizeFaceId(special.face), special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'flip',
          axis: special.axis,
          triggered: false,
        };
      }
    });
    (payload.dogSpecials || []).forEach((special) => {
      const cell = getCell(normalizeFaceId(special.face), special.row, special.col);
      if (cell) {
        cell.special = {
          type: 'dog',
          triggered: false,
        };
      }
    });
    (payload.guardianSpecials || []).forEach((special) => {
      const cell = getCell(normalizeFaceId(special.face), special.row, special.col);
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
    const configuredFaces = normalizeFaceCount(Number(facesInput?.value) || config.faces || 6);
    const faceCount = boardMode === '2d' ? 1 : configuredFaces;
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
      faces: configuredFaces,
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
      faces: configuredFaces,
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
    if (facesInput) {
      facesInput.value = normalizeFaceCount(Number(values.faces) || 6);
    }
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
    return boardGeneration.createGrid({
      rows,
      cols,
      getActiveFaces,
    });
  }

  /**
   * Randomly distributes the requested number of mine cells across the board.
   */
  function placeMines(count, rng = Math.random) {
    boardGeneration.placeMines({
      count,
      rng,
      config,
      getActiveFaces,
      getCell,
      shuffle,
    });
  }

  /**
   * Allocates specials to safe cells (rotation, flip, dog, guardian).
   */
  function assignSpecials(rng = Math.random) {
    boardGeneration.assignSpecials({
      rng,
      config,
      forEachCell,
      shuffle,
      pick,
    });
  }

  /**
   * Calculates the number of neighboring mines for every cell.
   */
  function computeNeighborCounts() {
    boardGeneration.computeNeighborCounts({
      forEachCell,
      getNeighbors,
    });
  }

  /**
   * Reveals a given cell and propagates uncovering, triggers specials, and checks end-of-game conditions.
   * @param {Object} cell Target cell data.
   */
  function revealCell(cell, options = {}) {
    boardActions.revealCell({
      cell,
      gameActive,
      replay: options.replay ?? false,
      recordAction: options.recordAction ?? true,
      checkVictory: options.checkVictory ?? true,
      userAction: options.userAction ?? true,
      guardianShields,
      setGuardianShields: (value) => {
        guardianShields = value;
      },
      describeCellPosition,
      speakAvatar,
      showStatusMessage,
      showGuardianToast,
      applyFlag,
      rendererMode,
      getNumberColor,
      activeRenderer,
      setRevealedCount: (value) => {
        revealedCount = value;
      },
      getRevealedCount: () => revealedCount,
      isReplaying,
      runActions,
      triggerSpecial,
      getNeighbors,
      revealCell,
      commentOnReveal,
      updateStatus,
      handleLoss,
      checkForWin,
      handleWin,
    });
  }

  /**
   * Toggles a flag on a cell while updating counters and recording the action when appropriate.
   */
  function applyFlag(cell, shouldFlag, options = {}) {
    boardActions.applyFlag({
      cell,
      shouldFlag,
      gameActive,
      replay: options.replay ?? false,
      recordAction: options.recordAction ?? true,
      userAction: options.userAction ?? true,
      rendererMode,
      isReplaying,
      getFlaggedCount: () => flaggedCount,
      setFlaggedCount: (value) => {
        flaggedCount = value;
      },
      runActions,
      commentOnFlag,
      activeRenderer,
      updateStatus,
    });
  }

  /**
   * Activates a discovered special cell when special effects are enabled.
   */
  function triggerSpecial(special, cell) {
    boardActions.triggerSpecial({
      special,
      cell,
      specialsEnabled,
      describeCellPosition,
      speakAvatar,
      onRotation: (triggeredSpecial) => {
        rotationTriggers += 1;
        const direction = triggeredSpecial.direction === 'ccw' ? -90 : 90;
        rotationAngle = (rotationAngle + direction + 360) % 360;
      },
      onFlip: (triggeredSpecial) => {
        flipTriggers += 1;
        if (triggeredSpecial.axis === 'horizontal') {
          flipHorizontal = !flipHorizontal;
        } else {
          flipVertical = !flipVertical;
        }
      },
      onDog: () => {
        dogTriggers += 1;
        flagRandomMine();
      },
      onGuardian: () => {
        guardianTriggers += 1;
        guardianShields += 1;
        showStatusMessage('status.guardianReady', { shields: guardianShields });
        showGuardianToast('status.guardianReady', { shields: guardianShields });
      },
      applyTransform,
      updateStatus,
      commentOnSpecial,
    });
  }

  function flagRandomMine(options = {}) {
    return boardActions.flagRandomMine({
      forEachCell,
      pick,
      applyFlag,
      recordAction: options.recordAction ?? true,
    });
  }

  function renderBoard() {
    if (!activeRenderer?.renderBoard) return;
    activeRenderer.renderBoard();
  }

  function applyTransform() {
    if (!activeRenderer?.applyTransform) return;
    activeRenderer.applyTransform();
  }

  function ensureCubeFaces(count = 6) {
    if (!activeRenderer?.ensureFaces) return;
    activeRenderer.ensureFaces(count);
  }

  function layoutCubeFaces() {
    if (!activeRenderer?.layoutFaces) return;
    activeRenderer.layoutFaces();
  }

  function getSpecialMarker(type) {
    const markerByType = {
      rotation: '⟳',
      flip: '⇋',
      dog: '🐶',
      guardian: '🛡',
    };
    return markerByType[type] || '✦';
  }

  function isWebglSupported() {
    const checker = window.MindsweeperRenderers?.isWebglSupported;
    if (typeof checker === 'function') {
      return checker();
    }
    return false;
  }

  function isThreeSupported() {
    const checker = window.MindsweeperRenderers?.isThreeSupported;
    if (typeof checker === 'function') {
      return checker();
    }
    return false;
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
    if (elapsedTimeEl) {
      elapsedTimeEl.textContent = runStartTime ? formatElapsed(Date.now() - runStartTime) : '00:00';
    }
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
    updatePlayLayoutState();
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
    updatePlayLayoutState();
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
        if (cellEl && rendererMode === 'dom') {
          cellEl.classList.add('cell--revealed', 'cell--mine');
        }
        cell.revealed = true;
        activeRenderer?.syncCell?.(cell);
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
    return boardGeneration.getMinePositions({
      forEachCell,
    });
  }

  /**
   * Collects specials filtered by type, along with their directional data.
   */
  function getSpecialsByType(type) {
    return boardGeneration.getSpecialsByType({
      type,
      forEachCell,
    });
  }

  /**
   * Generates the history UI from saved runs, including action buttons.
   */
  function renderHistory() {
    historyStore.renderHistory({
      runs,
      clearHistoryBtn,
      historyList,
      historyVisibleCount,
      historyPageSize,
      historyFilterResult,
      historyFilterDate,
      historyShowMoreBtn,
      t,
      formatTimestamp,
      resolveReplayBoardMode,
    });
  }

  function syncHistoryFiltersUI() {
    historyStore.syncHistoryFiltersUI({
      historyResultFilterEl,
      historyDateFilterEl,
      historyFilterResult,
      historyFilterDate,
    });
  }

  /**
   * Persists the run history to localStorage.
   */
  function persistRuns() {
    historyStore.persistRuns({ safeSetJSON, historyKey, runs });
  }

  /**
   * Persists room mapping data to localStorage.
   */
  function persistRoomMap() {
    historyStore.persistRoomMap({ safeSetJSON, roomMapKey, roomMap });
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

  function clearNeighborDebugHighlight(nodes, className) {
    nodes.forEach((node) => node?.classList?.remove(className));
  }

  function getNeighborDebugHighlightNodes(cell) {
    if (!cell) return [];
    const candidates = [cell.svgShape, cell.webglLabel, cell.threeLabel, cell.element];
    const unique = [];
    candidates.forEach((node) => {
      if (!node || !node.classList) return;
      if (unique.includes(node)) return;
      unique.push(node);
    });
    return unique;
  }

  function setNeighborDebugOrigin(cell) {
    clearNeighborDebugHighlight(neighborDebugOriginNodes, 'neighbor-debug--origin');
    neighborDebugOriginNodes = getNeighborDebugHighlightNodes(cell);
    neighborDebugOriginNodes.forEach((node) => node.classList.add('neighbor-debug--origin'));
  }

  function setNeighborDebugNeighbors(cells = []) {
    clearNeighborDebugHighlight(neighborDebugNeighborNodes, 'neighbor-debug--neighbor');
    const unique = [];
    cells.forEach((cell) => {
      getNeighborDebugHighlightNodes(cell).forEach((node) => {
        if (!unique.includes(node)) {
          unique.push(node);
        }
      });
    });
    neighborDebugNeighborNodes = unique;
    neighborDebugNeighborNodes.forEach((node) => node.classList.add('neighbor-debug--neighbor'));
  }

  function clearNeighborDebugNeighbors() {
    clearNeighborDebugHighlight(neighborDebugNeighborNodes, 'neighbor-debug--neighbor');
    neighborDebugNeighborNodes = [];
  }

  function setNeighborDebugHover(cell) {
    clearNeighborDebugHighlight(neighborDebugHoverNodes, 'neighbor-debug--target');
    neighborDebugHoverNodes = getNeighborDebugHighlightNodes(cell);
    neighborDebugHoverNodes.forEach((node) => node.classList.add('neighbor-debug--target'));
  }

  function clearNeighborDebugHover() {
    clearNeighborDebugHighlight(neighborDebugHoverNodes, 'neighbor-debug--target');
    neighborDebugHoverNodes = [];
  }

  function applyNeighborDebug(enabled, options = {}) {
    const { persist = true } = options;
    neighborDebugEnabled = Boolean(enabled);
    if (neighborDebugEl) {
      neighborDebugEl.hidden = !neighborDebugEnabled;
      if (!neighborDebugEnabled) {
        neighborDebugEl.textContent = '';
      }
    }
    if (!neighborDebugEnabled) {
      clearNeighborDebugHover();
      clearNeighborDebugNeighbors();
      clearNeighborDebugHighlight(neighborDebugOriginNodes, 'neighbor-debug--origin');
      neighborDebugOriginNodes = [];
    }
    if (toggleNeighborDebugBtn) {
      toggleNeighborDebugBtn.textContent = `Debug: ${neighborDebugEnabled ? 'on' : 'off'}`;
      toggleNeighborDebugBtn.setAttribute('aria-pressed', String(neighborDebugEnabled));
    }
    if (persist) {
      safeSetItem(neighborDebugStorageKey, String(neighborDebugEnabled));
    }
  }

  function initNeighborDebugToggle() {
    applyNeighborDebug(neighborDebugEnabled, { persist: false });
    if (!toggleNeighborDebugBtn) return;
    toggleNeighborDebugBtn.addEventListener('click', () => {
      applyNeighborDebug(!neighborDebugEnabled);
      if (neighborDebugEnabled) {
        const current = getCell(focusCell.face, focusCell.row, focusCell.col);
        renderNeighborDebug(current);
      }
    });
    if (neighborDebugEl) {
      neighborDebugEl.addEventListener('pointerover', (event) => {
        if (!neighborDebugEnabled) return;
        const rowEl = event.target.closest('[data-debug-face][data-debug-row][data-debug-col]');
        if (!rowEl) return;
        const face = rowEl.dataset.debugFace;
        const row = Number(rowEl.dataset.debugRow);
        const col = Number(rowEl.dataset.debugCol);
        const neighbor = getCell(face, row, col);
        setNeighborDebugHover(neighbor);
      });
      neighborDebugEl.addEventListener('pointerleave', () => {
        clearNeighborDebugHover();
      });
    }
  }

  function renderNeighborDebug(cell = null) {
    if (!neighborDebugEl || !neighborDebugEnabled) return;
    if (!cell) {
      neighborDebugEl.textContent = 'Debug: hover a cell (or use arrow keys) to inspect seam neighbors.';
      setNeighborDebugOrigin(null);
      clearNeighborDebugNeighbors();
      clearNeighborDebugHover();
      return;
    }
    const neighbors = getNeighbors(cell);
    const mineCount = neighbors.filter((neighbor) => neighbor.isMine).length;
    const header = `Cell ${cell.face}:${cell.row},${cell.col} mine=${cell.isMine ? 'yes' : 'no'} shown=${cell.neighborMines} expected=${mineCount}`;
    const headerEl = document.createElement('div');
    headerEl.className = 'neighbor-debug__header';
    headerEl.textContent = header;
    const listEl = document.createElement('div');
    listEl.className = 'neighbor-debug__list';
    neighbors.forEach((neighbor) => {
      const rowEl = document.createElement('div');
      rowEl.className = `neighbor-debug__row${neighbor.isMine ? ' neighbor-debug__row--mine' : ''}`;
      rowEl.dataset.debugFace = neighbor.face;
      rowEl.dataset.debugRow = String(neighbor.row);
      rowEl.dataset.debugCol = String(neighbor.col);
      rowEl.textContent = `${neighbor.isMine ? 'M' : '.'} ${neighbor.face}:${neighbor.row},${neighbor.col}`;
      listEl.appendChild(rowEl);
    });
    neighborDebugEl.replaceChildren(headerEl, listEl);
    setNeighborDebugOrigin(cell);
    setNeighborDebugNeighbors(neighbors);
    clearNeighborDebugHover();
  }

  function loadAvatarPersona() {
    return avatarCommentary.loadAvatarPersona({
      safeGetItem,
      avatarPersonaKey,
      avatarPersonas,
      defaultPersona: 'friendly',
    });
  }

  function initAvatarSwitcher() {
    avatarCommentary.initAvatarSwitcher({
      avatarSelectEl,
      avatarPortraitEl,
      onPersonaChange: (persona) => setAvatarPersona(persona),
    });
    setAvatarPersona(currentAvatarPersona, { persist: false });
  }

  function setAvatarPersona(persona, options = {}) {
    currentAvatarPersona = avatarCommentary.setAvatarPersona({
      persona,
      currentAvatarPersona,
      avatarPersonas,
      avatarPortraitEl,
      avatarSelectEl,
      safeSetItem,
      avatarPersonaKey,
      persist: options.persist ?? true,
      force: options.force === true,
      defaultPersona: 'friendly',
    });
  }

  function getAvatarLines(key) {
    return avatarCommentary.getAvatarLines({
      translations: TRANSLATIONS,
      currentLocale,
      currentAvatarPersona,
      key,
      defaultLocale: 'en',
      defaultPersona: 'friendly',
    });
  }

  function resolveAvatarLine(key, replacements = {}) {
    return avatarCommentary.resolveAvatarLine({
      key,
      replacements,
      getAvatarLines,
    });
  }

  function setAvatarComment(message, options = {}) {
    avatarPulseTimer = avatarCommentary.setAvatarComment({
      message,
      avatarCommentEl,
      avatarWindowEl,
      avatarPulseTimer,
      avatarPulseDuration,
      duration: options.duration,
      appendAvatarHistory: (nextMessage) => appendAvatarHistory(nextMessage),
    });
  }

  function speakAvatar(key, replacements = {}, options = {}) {
    const message = resolveAvatarLine(key, replacements);
    setAvatarComment(message, options);
  }

  function appendAvatarHistory(message) {
    avatarHistory = avatarCommentary.appendAvatarHistory({
      message,
      avatarHistory,
      avatarHistoryLimit,
      avatarHistoryListEl,
    });
  }

  function commentOnReveal(cell) {
    avatarCommentary.commentOnReveal({
      cell,
      describeCellPosition,
      speakAvatar,
    });
  }

  function commentOnFlag(cell, shouldFlag) {
    avatarCommentary.commentOnFlag({
      cell,
      shouldFlag,
      describeCellPosition,
      speakAvatar,
    });
  }

  function commentOnSpecial(special, cell) {
    avatarCommentary.commentOnSpecial({
      special,
      cell,
      describeCellPosition,
      speakAvatar,
    });
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
    return i18n.loadLocale({
      safeGetItem,
      localeKey,
      translations: TRANSLATIONS,
      defaultLocale,
    });
  }

  /**
   * Replaces static elements marked with data-i18n-key with translated text.
   */
  function applyStaticTranslations() {
    i18n.applyStaticTranslations({
      root: document,
      t,
    });
  }

  /**
   * Fetches a translation string for the current locale and applies replacements.
   * @param {string} key Dot-notated translation identifier.
   */
  function resolveTranslation(locale, key) {
    return i18n.resolveTranslation({
      translations: TRANSLATIONS,
      locale,
      key,
    });
  }

  function t(key, replacements = {}) {
    return i18n.translate({
      translations: TRANSLATIONS,
      currentLocale,
      defaultLocale,
      key,
      replacements,
    });
  }

  /**
   * Builds the language dropdown and wires translation-related listeners.
   */
  function initLanguageSwitcher() {
    if (!languageSelect) return;
    i18n.populateLanguageSelect({
      languageSelect,
      languages,
      currentLocale,
    });
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
    i18n.updateLanguageLabel({
      languageLabel,
      languages,
      currentLocale,
    });
  }

  /**
   * Generates a room code that embeds configuration data and a seed for deterministic layout.
   * @param {Object} config Current game settings to encode.
   * @param {string} seed Seed string used by the deterministic RNG.
   */
  function generateRoomCode(config, seed) {
    return roomCodes.generateRoomCode({
      config,
      seed,
      createRandomSeed,
      roomMap,
      encodeConfigForRoomCode,
      roomCodeRandomSegmentLength: ROOM_CODE_RANDOM_SEGMENT_LENGTH,
    });
  }

  /**
   * Encodes row/col/mines/special counts into a fixed-length base36 string.
   */
  function encodeConfigForRoomCode(config = {}) {
    return roomCodes.encodeConfigForRoomCode({
      config,
      clamp,
      roomConfigSegmentLength: ROOM_CONFIG_SEGMENT_LENGTH,
    });
  }

  /**
   * Derives config values from the encoded portion of a room code.
   * @param {string} code Room code string that contains the config segment.
   * @returns {Object|null} Extracted config or null when invalid.
   */
  function decodeRoomCode(code) {
    return roomCodes.decodeRoomCode({
      code,
      roomConfigSegmentLength: ROOM_CONFIG_SEGMENT_LENGTH,
    });
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
    focusCell = { face: faceId(0), row: 0, col: 0 };
    suppressNextReveal = false;
    cubeDrag = null;
  }

  /**
   * Hooks up theme buttons and applies a stored preference.
   */
  function initThemeSwitcher() {
    uiControls.initThemeSwitcher({
      themeButtons,
      safeGetItem,
      themeStorageKey,
      defaultTheme,
      applyTheme,
    });
  }

  /**
   * Applies the selected theme, updates toggle states, and optionally persists it.
   */
  function applyTheme(name, options = {}) {
    uiControls.applyTheme({
      name,
      availableThemes,
      defaultTheme,
      root: document.documentElement,
      themeButtons,
      safeSetItem,
      themeStorageKey,
      persist: options.persist ?? true,
      onAfterApply: () => {
        activeRenderer?.syncAll?.();
      },
    });
  }

  function initRendererModeSelector() {
    if (!rendererModeSelectEl) return;
    rendererModeSelectEl.innerHTML = '';
    SUPPORTED_RENDERERS.forEach((mode) => {
      const option = document.createElement('option');
      option.value = mode;
      const rendererLabels = {
        dom: 'DOM',
        canvas: 'Canvas',
        svg: 'SVG',
        webgl: 'WebGL',
        three: 'Three.js',
      };
      option.textContent = rendererLabels[mode] || mode.toUpperCase();
      rendererModeSelectEl.appendChild(option);
    });
    rendererModeSelectEl.addEventListener('change', () => {
      if (!SUPPORTED_RENDERERS.includes(rendererModeSelectEl.value)) return;
      applyRendererMode(rendererModeSelectEl.value, { persist: true, restart: true });
    });
    updateRendererModeSelect();
  }

  function updateRendererModeSelect() {
    if (!rendererModeSelectEl) return;
    rendererModeSelectEl.value = rendererMode;
  }

  /**
   * Sets up history collapse/expand controls and persists the state.
   */
  function initHistoryCollapse() {
    uiControls.initHistoryCollapse({
      toggleHistoryBtn,
      historyPanel,
      safeGetItem,
      historyCollapsedKey,
      applyHistoryCollapse,
    });
  }

  /**
   * Toggles the history panel collapsed state and updates the toggle button.
   */
  function applyHistoryCollapse(collapsed, options = {}) {
    uiControls.applyHistoryCollapse({
      collapsed,
      historyPanel,
      toggleHistoryBtn,
      t,
      safeSetItem,
      historyCollapsedKey,
      persist: options.persist ?? true,
    });
  }

  /**
   * Sets up difficulty preset buttons and clears active preset when inputs change.
   */
  function initDifficultyPresets() {
    uiControls.initDifficultyPresets({
      presetButtons,
      onPresetClick: (name) => applyPreset(name),
      inputs: [rowsInput, colsInput, minesInput, rotationInput, flipInput, dogInput, guardianInput],
      onInputsChanged: () => {
        setActivePreset(null);
        updateConfigScalingNote();
      },
    });
  }

  /**
   * Manages joining saved rooms by room code.
   */
  function initRoomJoin() {
    roomCodes.initRoomJoin({
      joinRoomBtn,
      roomCodeInput,
      getRoomMap: () => roomMap,
      getRuns: () => runs,
      decodeRoomCode,
      applyRoomSettings,
      showStatusMessage,
    });
  }

  /**
   * Copies a room code to clipboard, falling back to a message on failure.
   */
  function copyRoomCode(code) {
    roomCodes.copyRoomCode({
      code,
      onSuccess: (nextCode) => showStatusMessage('status.copySuccess', { code: nextCode }),
      onFailure: (nextCode) => showStatusMessage('status.copyFallback', { code: nextCode }),
    });
  }

  /**
   * Tracks the active preset and synchronizes UI button states.
   */
  function setActivePreset(name) {
    activePreset = name;
    uiControls.setActivePreset({
      name,
      presetButtons,
    });
  }

  /**
   * Applies a difficulty preset, updates inputs, and restarts the game.
   */
  function applyPreset(name) {
    const preset = difficultyPresets[name];
    if (!preset) return;
    const configuredFaces = normalizeFaceCount(Number(facesInput?.value) || config.faces || 6);
    const faceCount = boardMode === '2d' ? 1 : configuredFaces;
    applyConfigToInputs({
      rows: preset.rows,
      cols: preset.cols,
      faces: configuredFaces,
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
    const face = normalizeFaceId(element.dataset.face);
    const row = Number(element.dataset.row);
    const col = Number(element.dataset.col);
    return getCell(face, row, col);
  }

  /**
   * Resolves an interaction target element to a cell via the active renderer.
   */
  function resolveCellFromInteractionTarget(eventOrTarget) {
    if (activeRenderer?.getCellFromInteraction) {
      return activeRenderer.getCellFromInteraction(eventOrTarget);
    }
    const target = eventOrTarget?.target || eventOrTarget;
    const cellEl = target?.closest?.('.cell');
    return cellEl ? getCellFromElement(cellEl) : null;
  }

  /**
   * Returns array of existing neighboring cells for propagation logic.
   */
  function getNeighbors(cell) {
    return boardTopology.getNeighbors({
      cell,
      boardMode,
      neighbors: NEIGHBORS,
      getActiveFaces,
      getCell,
      resolveNeighbor,
    });
  }

  function resolveNeighbor(cell, dRow, dCol) {
    return boardTopology.resolveNeighbor({
      cell,
      dRow,
      dCol,
      getFaceCount,
      parseFaceIndex,
      cubeFaceTransitions: CUBE_FACE_TRANSITIONS,
      config,
      faceId,
      clamp,
    });
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
      const firstFace = getActiveFaces()[0];
      focusCell = { face: firstFace, row: nextRow, col: nextCol };
      const nextCell = getCell(firstFace, nextRow, nextCol);
      renderNeighborDebug(nextCell);
      nextCell?.element?.focus();
      return;
    }
    const origin = getCell(focusCell.face, focusCell.row, focusCell.col);
    const next = resolveNeighbor(origin, dRow, dCol);
    if (!next) return;
    focusCell = next;
    const nextCell = getCell(next.face, next.row, next.col);
    renderNeighborDebug(nextCell);
    nextCell?.element?.focus();
  }

  /**
   * Toggles the data attribute so revealed cheat info can be styled when needed.
   */
  function applyCheatState() {
    forEachCell((cell) => {
      if (cell.element && rendererMode === 'dom') {
        cell.element.setAttribute('data-show-cheat', cheatMode ? 'true' : 'false');
      }
    });
    activeRenderer?.syncAll?.();
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
    const configuredFaces = normalizeFaceCount(Number(facesInput?.value) || config.faces || 6);
    return boardMode === '2d' ? 1 : configuredFaces;
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
    const count = getFaceCount();
    return Array.from({ length: count }, (_, index) => faceId(index));
  }

  function normalizeFaceCount(value) {
    const numeric = Number(value) || 6;
    return numeric === 6 ? 6 : ALLOWED_FACE_COUNTS[0];
  }

  function updateFaceShapeInfo() {
    if (!faceShapeInfoEl) return;
    faceShapeInfoEl.textContent = `Shape: ${FACE_SHAPE_NAME}`;
  }

  function faceId(index) {
    return `f${index}`;
  }

  function getFaceBadgeIcon(index, totalFaces) {
    const cubeIcons = ['F', 'R', 'B', 'L', 'T', 'D'];
    return cubeIcons[index] || cubeIcons[index % cubeIcons.length];
  }

  function decorateFaceElement(faceEl, index, totalFaces) {
    faceEl.setAttribute('data-face-icon', getFaceBadgeIcon(index, totalFaces));
    faceEl.setAttribute('data-face-label', `Face ${index + 1}`);
  }

  function parseFaceIndex(face) {
    const normalized = normalizeFaceId(face);
    const match = /^f(\d+)$/.exec(normalized);
    return match ? Number(match[1]) : 0;
  }

  function normalizeFaceId(face) {
    const value = String(face || '').toLowerCase();
    if (/^f\d+$/.test(value)) {
      return value;
    }
    const legacy = {
      front: 0,
      right: 1,
      back: 2,
      left: 3,
      top: 4,
      bottom: 5,
    };
    if (value in legacy) {
      return faceId(legacy[value]);
    }
    return faceId(0);
  }

  function layoutCubeFacesDom() {
    window.MindsweeperPolyhedron?.layoutCubeFaces?.({ cubeEl, clamp });
  }

  function normalizeRendererMode(mode) {
    return SUPPORTED_RENDERERS.includes(mode) ? mode : SUPPORTED_RENDERERS[0];
  }

  function loadRendererMode() {
    return normalizeRendererMode(safeGetItem(rendererStorageKey));
  }

  function buildRendererContextForMode(mode) {
    const common = {
      cubeEl,
      getActiveFaces,
      getCell,
      layoutCubeFacesDom,
      updateWrapperSpacing,
      normalizeFaceCount,
      decorateFaceElement,
      faceId,
      setFaceBoards: (boards) => {
        faceBoards = Array.isArray(boards) ? boards : [];
      },
      getConfig: () => config,
      getVisualState: () => ({
        boardMode,
        specialsEnabled,
        flipHorizontal,
        flipVertical,
        rotationAngle,
        cubeZoom,
        cubePitch,
        cubeYaw,
        cheatMode,
      }),
    };

    if (mode === 'dom') {
      return {
        ...common,
        forEachCell,
        getCellFromElement,
      };
    }
    if (mode === 'canvas') {
      return {
        ...common,
        forEachCell,
        getNumberColor,
        getSpecialMarker,
        normalizeFaceId,
        clamp,
      };
    }
    if (mode === 'svg') {
      return {
        ...common,
        getFaceCount,
        normalizeFaceId,
        getNumberColor,
        getSpecialMarker,
      };
    }
    if (mode === 'webgl') {
      return {
        ...common,
        forEachCell,
        getNumberColor,
        getSpecialMarker,
        clamp,
        normalizeFaceId,
      };
    }
    if (mode === 'three') {
      return {
        ...common,
        forEachCell,
        getNumberColor,
        getSpecialMarker,
        clamp,
        normalizeFaceId,
      };
    }
    return common;
  }

  function createRendererWithFallback(mode) {
    const context = buildRendererContextForMode(mode);
    const domFallback = {
      id: 'dom',
      ensureFaces() {},
      layoutFaces: layoutCubeFacesDom,
      renderBoard() {},
      applyTransform() {},
      syncCell() {},
      syncAll() {},
      getCellFromInteraction(eventOrTarget) {
        const target = eventOrTarget?.target || eventOrTarget;
        const cellEl = target?.closest?.('.cell');
        return cellEl ? getCellFromElement(cellEl) : null;
      },
    };
    const factories = window.MindsweeperRenderers || {};
    const factoryByMode = {
      dom: factories.createDomRenderer,
      canvas: factories.createCanvasRenderer,
      svg: factories.createSvgRenderer,
      webgl: factories.createWebglRenderer,
      three: factories.createThreeRenderer,
    };
    const factory = factoryByMode[mode] || factoryByMode.dom;
    if (typeof factory === 'function') {
      const renderer = factory(context);
      if (renderer) return renderer;
    }
    const domFactory = factoryByMode.dom;
    if (typeof domFactory === 'function') {
      const domRenderer = domFactory(buildRendererContextForMode('dom'));
      if (domRenderer) return domRenderer;
    }
    return domFallback;
  }

  function createRenderer(mode) {
    if (!SUPPORTED_RENDERERS.includes(mode)) {
      return createRendererWithFallback('dom');
    }
    return createRendererWithFallback(mode);
  }

  function applyRendererMode(mode, options = {}) {
    const { persist = true, restart = false, rebuildFaces = true } = options;
    let requestedMode = normalizeRendererMode(mode);
    if (requestedMode === 'three' && !isThreeSupported()) {
      requestedMode = isWebglSupported() ? 'webgl' : 'canvas';
    }
    if (requestedMode === 'webgl' && !isWebglSupported()) {
      requestedMode = 'canvas';
    }
    rendererMode = requestedMode;
    activeRenderer = createRenderer(rendererMode);
    boardWrapper?.setAttribute('data-renderer', rendererMode);
    updateRendererModeSelect();
    if (persist) {
      safeSetItem(rendererStorageKey, rendererMode);
    }
    if (rebuildFaces) {
      ensureCubeFaces(config.faces);
    }
    if (restart) {
      setActivePreset(null);
      startNewGame();
      return;
    }
    applyTransform();
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
    updateFaceShapeInfo();
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
    ].some((entry) => entry?.face && normalizeFaceId(entry.face) !== faceId(0));
    return hasNonFrontFaceData ? 'cube' : boardMode;
  }

  function followReplayCell(cell) {
    if (boardMode !== 'cube' || !cell) return;
    const spinY = specialsEnabled ? rotationAngle : 0;
    const faceCount = Math.max(getFaceCount(), 1);
    const index = parseFaceIndex(cell.face) % faceCount;
    if (faceCount === 6) {
      const target = REPLAY_CAMERA_BY_FACE[index] || REPLAY_CAMERA_BY_FACE[0];
      const desiredCameraYaw = target.yaw - spinY;
      cubeYaw = shortestAngleTarget(cubeYaw, desiredCameraYaw);
      cubePitch = shortestAngleTarget(cubePitch, target.pitch);
    }
    applyTransform();
  }

  window.mindsweeperRenderer = {
    listModes: () => SUPPORTED_RENDERERS.slice(),
    getMode: () => rendererMode,
    setMode: (mode, options = {}) =>
      applyRendererMode(mode, {
        persist: options.persist ?? true,
        restart: options.restart ?? true,
      }),
  };

  init();
})();
