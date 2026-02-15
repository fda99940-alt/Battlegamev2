const test = require('node:test');
const assert = require('node:assert/strict');

const { loadBrowserModule } = require('./helpers/loadBrowserModule');

const boardTopology = loadBrowserModule('modules/boardTopology.js', 'MindsweeperBoardTopology');
const plain = (value) => JSON.parse(JSON.stringify(value));

const CUBE_FACE_TRANSITIONS = {
  0: { left: 3, right: 1, up: 4, down: 5 },
  1: { left: 0, right: 2, up: 4, down: 5 },
  2: { left: 1, right: 3, up: 4, down: 5 },
  3: { left: 2, right: 0, up: 4, down: 5 },
  4: { left: 3, right: 1, up: 2, down: 0 },
  5: { left: 3, right: 1, up: 0, down: 2 },
};

test('resolveNeighbor wraps across cube face boundaries', () => {
  const result = boardTopology.resolveNeighbor({
    cell: { face: 'f0', row: 2, col: 0 },
    dRow: 0,
    dCol: -1,
    getFaceCount: () => 6,
    parseFaceIndex: (face) => Number(String(face).slice(1)),
    cubeFaceTransitions: CUBE_FACE_TRANSITIONS,
    config: { rows: 5, cols: 5 },
    faceId: (index) => `f${index}`,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
  });

  assert.deepEqual(plain(result), { face: 'f3', row: 2, col: 4 });
});

test('resolveNeighbor wraps poly-face index and clamps rows', () => {
  const result = boardTopology.resolveNeighbor({
    cell: { face: 'f0', row: 0, col: 0 },
    dRow: -1,
    dCol: -1,
    getFaceCount: () => 8,
    parseFaceIndex: (face) => Number(String(face).slice(1)),
    cubeFaceTransitions: CUBE_FACE_TRANSITIONS,
    config: { rows: 4, cols: 4 },
    faceId: (index) => `f${index}`,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
  });

  assert.deepEqual(plain(result), { face: 'f7', row: 0, col: 3 });
});

test('getNeighbors returns valid adjacent cells in 2d mode', () => {
  const grid = {
    f0: [
      [{ id: '00' }, { id: '01' }, { id: '02' }],
      [{ id: '10' }, { id: '11' }, { id: '12' }],
      [{ id: '20' }, { id: '21' }, { id: '22' }],
    ],
  };
  const center = grid.f0[1][1];

  const neighbors = boardTopology.getNeighbors({
    cell: { ...center, row: 1, col: 1 },
    boardMode: '2d',
    neighbors: [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ],
    getActiveFaces: () => ['f0'],
    getCell: (face, row, col) => grid[face]?.[row]?.[col] || null,
    resolveNeighbor: () => null,
  });

  assert.equal(neighbors.length, 8);
});

test('getNeighbors de-duplicates repeated targets', () => {
  const repeatedCell = { face: 'f1', row: 0, col: 0 };

  const neighbors = boardTopology.getNeighbors({
    cell: { face: 'f0', row: 0, col: 0 },
    boardMode: 'cube',
    neighbors: [[0, 1], [1, 0], [1, 1]],
    getActiveFaces: () => ['f0'],
    getCell: () => repeatedCell,
    resolveNeighbor: () => ({ face: 'f1', row: 0, col: 0 }),
  });

  assert.equal(neighbors.length, 1);
  assert.equal(neighbors[0], repeatedCell);
});

test('getNeighbors never includes the origin cell', () => {
  const origin = { face: 'f0', row: 1, col: 1 };

  const neighbors = boardTopology.getNeighbors({
    cell: origin,
    boardMode: 'cube',
    neighbors: [[0, 1], [1, 0], [1, 1]],
    getActiveFaces: () => ['f0'],
    getCell: () => origin,
    resolveNeighbor: () => ({ face: 'f0', row: 1, col: 1 }),
  });

  assert.equal(neighbors.length, 0);
});

test('resolveNeighbor returns null for invalid cube face index', () => {
  const result = boardTopology.resolveNeighbor({
    cell: { face: 'f99', row: 1, col: 1 },
    dRow: 0,
    dCol: 1,
    getFaceCount: () => 6,
    parseFaceIndex: () => 99,
    cubeFaceTransitions: CUBE_FACE_TRANSITIONS,
    config: { rows: 4, cols: 4 },
    faceId: (index) => `f${index}`,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
  });

  assert.equal(result, null);
});

test('resolveNeighbor keeps top-front-left diagonal on adjacent seams (no opposite-face jump)', () => {
  const result = boardTopology.resolveNeighbor({
    cell: { face: 'f4', row: 4, col: 0 },
    dRow: 1,
    dCol: -1,
    getFaceCount: () => 6,
    parseFaceIndex: (face) => Number(String(face).slice(1)),
    cubeFaceTransitions: CUBE_FACE_TRANSITIONS,
    config: { rows: 5, cols: 5 },
    faceId: (index) => `f${index}`,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
  });

  assert.deepEqual(plain(result), { face: 'f0', row: 0, col: 0 });
});
