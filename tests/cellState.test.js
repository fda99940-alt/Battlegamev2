const test = require('node:test');
const assert = require('node:assert/strict');

const { loadBrowserModule } = require('./helpers/loadBrowserModule');

const boardActions = loadBrowserModule('modules/boardActions.js', 'MindsweeperBoardActions');
const boardGeneration = loadBrowserModule('modules/boardGeneration.js', 'MindsweeperBoardGeneration');
const boardTopology = loadBrowserModule('modules/boardTopology.js', 'MindsweeperBoardTopology');
const coreUtils = loadBrowserModule('modules/coreUtils.js', 'MindsweeperCoreUtils');
const roomCodes = loadBrowserModule('modules/roomCodes.js', 'MindsweeperRoomCodes');
const plain = (value) => JSON.parse(JSON.stringify(value));
const CUBE_FACE_TRANSITIONS = {
  0: { left: 3, right: 1, up: 4, down: 5 },
  1: { left: 0, right: 2, up: 4, down: 5 },
  2: { left: 1, right: 3, up: 4, down: 5 },
  3: { left: 2, right: 0, up: 4, down: 5 },
  4: { left: 3, right: 1, up: 2, down: 0 },
  5: { left: 3, right: 1, up: 0, down: 2 },
};

function createMockElement() {
  const classes = new Set();
  return {
    textContent: '',
    style: {},
    attributes: { 'aria-label': 'Hidden cell' },
    classList: {
      add: (...tokens) => tokens.forEach((token) => classes.add(token)),
      toggle: (token, enabled) => {
        if (enabled) classes.add(token);
        else classes.delete(token);
      },
      contains: (token) => classes.has(token),
    },
    removeAttribute: (key) => {
      delete this?.attributes?.[key];
    },
    _classes: classes,
  };
}

test('computeNeighborCounts sets neighborMines based on neighbors', () => {
  const cells = [
    { id: 'a', isMine: false, neighborMines: 0 },
    { id: 'b', isMine: true, neighborMines: 0 },
    { id: 'c', isMine: true, neighborMines: 0 },
  ];

  boardGeneration.computeNeighborCounts({
    forEachCell: (callback) => cells.forEach(callback),
    getNeighbors: (cell) => {
      if (cell.id === 'a') return [cells[1], cells[2]];
      return [cells[0]];
    },
  });

  assert.equal(cells[0].neighborMines, 2);
  assert.equal(cells[1].neighborMines, 0);
  assert.equal(cells[2].neighborMines, 0);
});

test('revealCell shows adjacent mine count and color on DOM cell', () => {
  const element = createMockElement();
  const cell = {
    face: 'f0',
    row: 1,
    col: 1,
    isMine: false,
    neighborMines: 2,
    special: null,
    revealed: false,
    flagged: false,
    element,
  };

  const runActions = [];
  let revealedCount = 0;
  let commentCalled = false;
  let statusUpdates = 0;

  boardActions.revealCell({
    cell,
    gameActive: true,
    replay: false,
    recordAction: true,
    checkVictory: true,
    userAction: true,
    guardianShields: 0,
    setGuardianShields: () => {},
    describeCellPosition: () => 'f0 2,2',
    speakAvatar: () => {},
    showStatusMessage: () => {},
    showGuardianToast: () => {},
    applyFlag: () => {},
    rendererMode: 'dom',
    getNumberColor: (value) => (value === 2 ? '#68a0ff' : '#dadada'),
    activeRenderer: { syncCell: () => {} },
    setRevealedCount: (value) => {
      revealedCount = value;
    },
    getRevealedCount: () => revealedCount,
    isReplaying: false,
    runActions,
    triggerSpecial: () => {},
    getNeighbors: () => [],
    revealCell: () => {},
    commentOnReveal: () => {
      commentCalled = true;
    },
    updateStatus: () => {
      statusUpdates += 1;
    },
    handleLoss: () => {
      throw new Error('should not lose on safe cell');
    },
    checkForWin: () => false,
    handleWin: () => {},
  });

  assert.equal(cell.revealed, true);
  assert.equal(String(element.textContent), '2');
  assert.equal(element.style.color, '#68a0ff');
  assert.equal(element.classList.contains('cell--revealed'), true);
  assert.equal(element.classList.contains('cell--mine'), false);
  assert.equal(runActions.length, 1);
  assert.deepEqual(plain(runActions[0]), { type: 'reveal', face: 'f0', row: 1, col: 1 });
  assert.equal(commentCalled, true);
  assert.equal(statusUpdates, 1);
  assert.equal(revealedCount, 1);
});

test('revealCell with zero adjacent mines does not print a number', () => {
  const element = createMockElement();
  const cell = {
    face: 'f0',
    row: 0,
    col: 0,
    isMine: false,
    neighborMines: 0,
    special: null,
    revealed: false,
    flagged: false,
    element,
  };

  let recurseCalls = 0;

  boardActions.revealCell({
    cell,
    gameActive: true,
    replay: false,
    recordAction: false,
    checkVictory: false,
    userAction: false,
    guardianShields: 0,
    setGuardianShields: () => {},
    describeCellPosition: () => 'f0 1,1',
    speakAvatar: () => {},
    showStatusMessage: () => {},
    showGuardianToast: () => {},
    applyFlag: () => {},
    rendererMode: 'dom',
    getNumberColor: () => '#000',
    activeRenderer: { syncCell: () => {} },
    setRevealedCount: () => {},
    getRevealedCount: () => 0,
    isReplaying: false,
    runActions: [],
    triggerSpecial: () => {},
    getNeighbors: () => [{ revealed: false }],
    revealCell: () => {
      recurseCalls += 1;
    },
    commentOnReveal: () => {},
    updateStatus: () => {},
    handleLoss: () => {},
    checkForWin: () => false,
    handleWin: () => {},
  });

  assert.equal(cell.revealed, true);
  assert.equal(String(element.textContent), '');
  assert.equal(recurseCalls, 1);
});

test('revealCell on mine with guardian shield flags cell instead of losing', () => {
  const cell = {
    face: 'f0',
    row: 0,
    col: 0,
    isMine: true,
    neighborMines: 0,
    special: null,
    revealed: false,
    flagged: false,
    element: createMockElement(),
  };

  let shields = 1;
  let applyFlagCalled = false;
  let lossCalled = false;
  let statusCalled = false;
  let toastCalled = false;

  boardActions.revealCell({
    cell,
    gameActive: true,
    replay: false,
    recordAction: true,
    checkVictory: true,
    userAction: true,
    guardianShields: shields,
    setGuardianShields: (value) => {
      shields = value;
    },
    describeCellPosition: () => 'f0 1,1',
    speakAvatar: () => {},
    showStatusMessage: () => {
      statusCalled = true;
    },
    showGuardianToast: () => {
      toastCalled = true;
    },
    applyFlag: () => {
      applyFlagCalled = true;
    },
    rendererMode: 'dom',
    getNumberColor: () => '#000',
    activeRenderer: { syncCell: () => {} },
    setRevealedCount: () => {},
    getRevealedCount: () => 0,
    isReplaying: false,
    runActions: [],
    triggerSpecial: () => {},
    getNeighbors: () => [],
    revealCell: () => {},
    commentOnReveal: () => {},
    updateStatus: () => {},
    handleLoss: () => {
      lossCalled = true;
    },
    checkForWin: () => false,
    handleWin: () => {},
  });

  assert.equal(shields, 0);
  assert.equal(applyFlagCalled, true);
  assert.equal(lossCalled, false);
  assert.equal(statusCalled, true);
  assert.equal(toastCalled, true);
  assert.equal(cell.revealed, false);
});

test('revealCell on mine without shield triggers loss', () => {
  const cell = {
    face: 'f0',
    row: 0,
    col: 0,
    isMine: true,
    neighborMines: 0,
    special: null,
    revealed: false,
    flagged: false,
    element: createMockElement(),
  };

  let lossCalled = false;

  boardActions.revealCell({
    cell,
    gameActive: true,
    replay: false,
    recordAction: true,
    checkVictory: true,
    userAction: true,
    guardianShields: 0,
    setGuardianShields: () => {},
    describeCellPosition: () => 'f0 1,1',
    speakAvatar: () => {},
    showStatusMessage: () => {},
    showGuardianToast: () => {},
    applyFlag: () => {},
    rendererMode: 'dom',
    getNumberColor: () => '#000',
    activeRenderer: { syncCell: () => {} },
    setRevealedCount: () => {},
    getRevealedCount: () => 0,
    isReplaying: false,
    runActions: [],
    triggerSpecial: () => {},
    getNeighbors: () => [],
    revealCell: () => {},
    commentOnReveal: () => {},
    updateStatus: () => {},
    handleLoss: () => {
      lossCalled = true;
    },
    checkForWin: () => false,
    handleWin: () => {},
  });

  assert.equal(lossCalled, true);
});

test('applyFlag ignores revealed cells and does not mutate counts', () => {
  const cell = {
    face: 'f0',
    row: 0,
    col: 0,
    revealed: true,
    flagged: false,
    element: createMockElement(),
  };

  let flaggedCount = 3;

  boardActions.applyFlag({
    cell,
    shouldFlag: true,
    gameActive: true,
    replay: false,
    recordAction: true,
    userAction: true,
    rendererMode: 'dom',
    isReplaying: false,
    getFlaggedCount: () => flaggedCount,
    setFlaggedCount: (value) => {
      flaggedCount = value;
    },
    runActions: [],
    commentOnFlag: () => {},
    activeRenderer: { syncCell: () => {} },
    updateStatus: () => {},
  });

  assert.equal(flaggedCount, 3);
  assert.equal(cell.flagged, false);
});

test('applyFlag is idempotent and never decrements below zero', () => {
  const cell = {
    face: 'f0',
    row: 0,
    col: 0,
    revealed: false,
    flagged: false,
    element: createMockElement(),
  };

  let flaggedCount = 0;
  const runActions = [];

  const invoke = (shouldFlag) =>
    boardActions.applyFlag({
      cell,
      shouldFlag,
      gameActive: true,
      replay: false,
      recordAction: false,
      userAction: false,
      rendererMode: 'dom',
      isReplaying: false,
      getFlaggedCount: () => flaggedCount,
      setFlaggedCount: (value) => {
        flaggedCount = value;
      },
      runActions,
      commentOnFlag: () => {},
      activeRenderer: { syncCell: () => {} },
      updateStatus: () => {},
    });

  invoke(true);
  assert.equal(flaggedCount, 1);
  invoke(true);
  assert.equal(flaggedCount, 1);
  invoke(false);
  assert.equal(flaggedCount, 0);
  invoke(false);
  assert.equal(flaggedCount, 0);
});

test('revealCell with adjacent mines does not recurse', () => {
  const cell = {
    face: 'f0',
    row: 1,
    col: 1,
    isMine: false,
    neighborMines: 3,
    special: null,
    revealed: false,
    flagged: false,
    element: createMockElement(),
  };

  let recurseCalls = 0;

  boardActions.revealCell({
    cell,
    gameActive: true,
    replay: false,
    recordAction: false,
    checkVictory: false,
    userAction: false,
    guardianShields: 0,
    setGuardianShields: () => {},
    describeCellPosition: () => 'f0 2,2',
    speakAvatar: () => {},
    showStatusMessage: () => {},
    showGuardianToast: () => {},
    applyFlag: () => {},
    rendererMode: 'dom',
    getNumberColor: () => '#000',
    activeRenderer: { syncCell: () => {} },
    setRevealedCount: () => {},
    getRevealedCount: () => 0,
    isReplaying: false,
    runActions: [],
    triggerSpecial: () => {},
    getNeighbors: () => [{ revealed: false }],
    revealCell: () => {
      recurseCalls += 1;
    },
    commentOnReveal: () => {},
    updateStatus: () => {},
    handleLoss: () => {},
    checkForWin: () => false,
    handleWin: () => {},
  });

  assert.equal(recurseCalls, 0);
});

test('neighbor count includes mines across face edges on cube rim cells', () => {
  const rows = 3;
  const cols = 3;
  const faces = ['f0', 'f1', 'f2', 'f3', 'f4', 'f5'];

  const grid = faces.reduce((acc, face) => {
    acc[face] = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        face,
        row,
        col,
        isMine: false,
        neighborMines: 0,
      }))
    );
    return acc;
  }, {});

  // Target is on the left rim of f0; its left neighbor should resolve to f3 col=2.
  const target = grid.f0[1][0];
  grid.f3[1][2].isMine = true;

  const getCell = (face, row, col) => grid[face]?.[row]?.[col] || null;
  const parseFaceIndex = (face) => Number(String(face).slice(1));
  const faceId = (index) => `f${index}`;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const neighbors = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  const getNeighbors = (cell) =>
    boardTopology.getNeighbors({
      cell,
      boardMode: 'cube',
      neighbors,
      getActiveFaces: () => faces,
      getCell,
      resolveNeighbor: (origin, dRow, dCol) =>
        boardTopology.resolveNeighbor({
          cell: origin,
          dRow,
          dCol,
          getFaceCount: () => 6,
          parseFaceIndex,
          cubeFaceTransitions: CUBE_FACE_TRANSITIONS,
          config: { rows, cols },
          faceId,
          clamp,
        }),
    });

  boardGeneration.computeNeighborCounts({
    forEachCell: (callback) => {
      faces.forEach((face) => {
        grid[face].forEach((row) => row.forEach((cell) => callback(cell)));
      });
    },
    getNeighbors,
  });

  assert.equal(target.neighborMines, 1);
});

test('neighbor count includes cross-face neighbors at cube corner connections', () => {
  const rows = 3;
  const cols = 3;
  const faces = ['f0', 'f1', 'f2', 'f3', 'f4', 'f5'];

  const grid = faces.reduce((acc, face) => {
    acc[face] = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        face,
        row,
        col,
        isMine: false,
        neighborMines: 0,
      }))
    );
    return acc;
  }, {});

  // Corner cell on f0 where left/up/diagonal transitions land on different faces.
  const target = grid.f0[0][0];
  grid.f3[0][2].isMine = true; // left neighbor across face boundary
  grid.f4[2][0].isMine = true; // up neighbor across face boundary
  grid.f3[1][2].isMine = true; // diagonal neighbor across the same corner seam

  const getCell = (face, row, col) => grid[face]?.[row]?.[col] || null;
  const parseFaceIndex = (face) => Number(String(face).slice(1));
  const faceId = (index) => `f${index}`;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const neighbors = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  const getNeighbors = (cell) =>
    boardTopology.getNeighbors({
      cell,
      boardMode: 'cube',
      neighbors,
      getActiveFaces: () => faces,
      getCell,
      resolveNeighbor: (origin, dRow, dCol) =>
        boardTopology.resolveNeighbor({
          cell: origin,
          dRow,
          dCol,
          getFaceCount: () => 6,
          parseFaceIndex,
          cubeFaceTransitions: CUBE_FACE_TRANSITIONS,
          config: { rows, cols },
          faceId,
          clamp,
        }),
    });

  boardGeneration.computeNeighborCounts({
    forEachCell: (callback) => {
      faces.forEach((face) => {
        grid[face].forEach((row) => row.forEach((cell) => callback(cell)));
      });
    },
    getNeighbors,
  });

  assert.equal(target.neighborMines, 3);
});

test('room code 005005006006006006006006-ATQ7: revealed safe region shows correct mine indication numbers', () => {
  const decoded = roomCodes.decodeRoomCode({
    code: '005005006006006006006006-ATQ7',
    roomConfigSegmentLength: 24,
  });
  assert.ok(decoded?.config);

  const config = { ...decoded.config };
  const boardMode = 'cube';
  const faceId = (index) => `f${index}`;
  const parseFaceIndex = (face) => Number(String(face).slice(1));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const getFaceCount = () => (boardMode === '2d' ? 1 : config.faces);
  const getActiveFaces = () => Array.from({ length: getFaceCount() }, (_, index) => faceId(index));

  const grid = boardGeneration.createGrid({
    rows: config.rows,
    cols: config.cols,
    getActiveFaces,
  });

  const getCell = (face, row, col) => grid[face]?.[row]?.[col] || null;
  const forEachCell = (callback) => {
    getActiveFaces().forEach((face) => {
      grid[face].forEach((row) => row.forEach((cell) => callback(cell)));
    });
  };
  const resolveNeighbor = (cell, dRow, dCol) =>
    boardTopology.resolveNeighbor({
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
  const neighbors = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const getNeighbors = (cell) =>
    boardTopology.getNeighbors({
      cell,
      boardMode,
      neighbors,
      getActiveFaces,
      getCell,
      resolveNeighbor,
    });

  const rng = coreUtils.createRng(decoded.seed);
  boardGeneration.placeMines({
    count: config.mines,
    rng,
    config,
    getActiveFaces,
    getCell,
    shuffle: coreUtils.shuffle,
  });
  boardGeneration.assignSpecials({
    rng,
    config,
    forEachCell,
    shuffle: coreUtils.shuffle,
    pick: coreUtils.pick,
  });
  boardGeneration.computeNeighborCounts({
    forEachCell,
    getNeighbors,
  });

  forEachCell((cell) => {
    cell.element = createMockElement();
  });

  let revealedCount = 0;
  let guardianShields = 0;
  const runActions = [];

  const reveal = (cell, options = {}) => {
    boardActions.revealCell({
      cell,
      gameActive: true,
      replay: options.replay ?? false,
      recordAction: options.recordAction ?? true,
      checkVictory: options.checkVictory ?? true,
      userAction: options.userAction ?? true,
      guardianShields,
      setGuardianShields: (value) => {
        guardianShields = value;
      },
      describeCellPosition: () => 'test',
      speakAvatar: () => {},
      showStatusMessage: () => {},
      showGuardianToast: () => {},
      applyFlag: () => {},
      rendererMode: 'dom',
      getNumberColor: (value) => `c${value}`,
      activeRenderer: { syncCell: () => {} },
      setRevealedCount: (value) => {
        revealedCount = value;
      },
      getRevealedCount: () => revealedCount,
      isReplaying: false,
      runActions,
      triggerSpecial: () => {},
      getNeighbors,
      revealCell: reveal,
      commentOnReveal: () => {},
      updateStatus: () => {},
      handleLoss: () => {
        throw new Error('expected safe reveal in this test');
      },
      checkForWin: () => false,
      handleWin: () => {},
    });
  };

  let startCell = null;
  forEachCell((cell) => {
    if (startCell) return;
    if (!cell.isMine && cell.neighborMines === 0) {
      startCell = cell;
    }
  });
  if (!startCell) {
    forEachCell((cell) => {
      if (startCell) return;
      if (!cell.isMine) {
        startCell = cell;
      }
    });
  }
  assert.ok(startCell, 'expected at least one safe cell');

  reveal(startCell, { checkVictory: false, userAction: false });

  const revealedCells = [];
  forEachCell((cell) => {
    if (cell.revealed) {
      revealedCells.push(cell);
    }
  });
  assert.ok(revealedCells.length > 0, 'expected at least one revealed cell');

  revealedCells.forEach((cell) => {
    const expected = getNeighbors(cell).filter((neighbor) => neighbor.isMine).length;
    assert.equal(cell.neighborMines, expected, `neighbor count mismatch for ${cell.face}:${cell.row}:${cell.col}`);
    if (expected > 0) {
      assert.equal(String(cell.element.textContent), String(expected), `display mismatch for ${cell.face}:${cell.row}:${cell.col}`);
    } else {
      assert.equal(String(cell.element.textContent), '', `expected empty text for zero-neighbor cell ${cell.face}:${cell.row}:${cell.col}`);
    }
  });
});
