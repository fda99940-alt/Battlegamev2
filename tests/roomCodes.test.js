const test = require('node:test');
const assert = require('node:assert/strict');

const { loadBrowserModule } = require('./helpers/loadBrowserModule');

const roomCodes = loadBrowserModule('modules/roomCodes.js', 'MindsweeperRoomCodes');
const plain = (value) => JSON.parse(JSON.stringify(value));

test('encodeConfigForRoomCode clamps values and emits fixed segment length', () => {
  const encoded = roomCodes.encodeConfigForRoomCode({
    config: {
      rows: 40,
      cols: -3,
      faces: 6,
      mines: 18,
      rotationSpecials: 2,
      flipSpecials: 1,
      dogSpecials: 0,
      guardianSpecials: 99,
    },
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    roomConfigSegmentLength: 24,
  });

  assert.equal(encoded.length, 24);
  assert.equal(encoded, '01400000600I00200100002R');
});

test('decodeRoomCode parses valid room code', () => {
  const decoded = roomCodes.decodeRoomCode({
    code: '00A00B00600C00D00E00F00G-SEED',
    roomConfigSegmentLength: 24,
  });

  assert.deepEqual(plain(decoded), {
    config: {
      rows: 10,
      cols: 11,
      faces: 6,
      mines: 12,
      rotationSpecials: 13,
      flipSpecials: 14,
      dogSpecials: 15,
      guardianSpecials: 16,
    },
    seed: 'SEED',
  });
});

test('decodeRoomCode returns null for invalid code', () => {
  assert.equal(roomCodes.decodeRoomCode({ code: '' }), null);
  assert.equal(roomCodes.decodeRoomCode({ code: 'BADCODE' }), null);
  assert.equal(roomCodes.decodeRoomCode({ code: 'XXYYZZ-OK' }), null);
  assert.equal(roomCodes.decodeRoomCode({ code: '00A00B00600C00D00E-SEED', roomConfigSegmentLength: 24 }), null);
});

test('generateRoomCode uses fallback segment after collisions exceed maxAttempts', () => {
  const config = {
    rows: 10,
    cols: 10,
    faces: 6,
    mines: 18,
    rotationSpecials: 2,
    flipSpecials: 2,
    dogSpecials: 1,
    guardianSpecials: 1,
  };

  const configSegment = roomCodes.encodeConfigForRoomCode({
    config,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    roomConfigSegmentLength: 24,
  });

  const collidingRoomMap = {
    [`${configSegment}-SEED`]: { id: 'existing' },
  };

  const generated = roomCodes.generateRoomCode({
    config,
    seed: 'SEED',
    createRandomSeed: () => 'SEED',
    roomMap: collidingRoomMap,
    encodeConfigForRoomCode: (cfg) =>
      roomCodes.encodeConfigForRoomCode({
        config: cfg,
        clamp: (value, min, max) => Math.min(Math.max(value, min), max),
        roomConfigSegmentLength: 24,
      }),
    roomCodeRandomSegmentLength: 4,
    maxAttempts: 1,
  });

  assert.ok(generated.startsWith(`${configSegment}-`));
  assert.notEqual(generated, `${configSegment}-SEED`);
});

test('initRoomJoin uses latest getRuns/getRoomMap values at click time', () => {
  let clickHandler = null;
  const joinRoomBtn = {
    addEventListener: (event, handler) => {
      if (event === 'click') clickHandler = handler;
    },
  };
  const roomCodeInput = { value: 'abc-123' };

  let roomMap = {};
  let runs = [];

  const messages = [];
  const applied = [];

  roomCodes.initRoomJoin({
    joinRoomBtn,
    roomCodeInput,
    getRoomMap: () => roomMap,
    getRuns: () => runs,
    decodeRoomCode: () => null,
    applyRoomSettings: (record, options) => {
      applied.push({ record, options });
      return true;
    },
    showStatusMessage: (key, payload) => {
      messages.push({ key, payload });
    },
  });

  assert.equal(typeof clickHandler, 'function');

  // Mutate state AFTER initRoomJoin to ensure getters are used lazily.
  runs = [{ id: '1', roomCode: 'ABC-123', config: { rows: 8, cols: 8 } }];

  clickHandler();

  assert.equal(applied.length, 1);
  assert.equal(applied[0].record.roomCode, 'ABC-123');
  assert.equal(applied[0].options.roomCode, 'ABC-123');
  assert.equal(messages.at(-1).key, 'status.joiningRoom');
});

test('copyRoomCode triggers success and failure callbacks', async () => {
  let success = null;
  let failure = null;

  roomCodes.copyRoomCode({
    code: 'ROOM-OK',
    clipboard: { writeText: () => Promise.resolve() },
    onSuccess: (code) => {
      success = code;
    },
    onFailure: (code) => {
      failure = code;
    },
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(success, 'ROOM-OK');
  assert.equal(failure, null);

  success = null;
  failure = null;

  roomCodes.copyRoomCode({
    code: 'ROOM-FAIL',
    clipboard: { writeText: () => Promise.reject(new Error('nope')) },
    onSuccess: (code) => {
      success = code;
    },
    onFailure: (code) => {
      failure = code;
    },
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(success, null);
  assert.equal(failure, 'ROOM-FAIL');
});
