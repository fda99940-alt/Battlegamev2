(() => {
  function encodeConfigForRoomCode(options = {}) {
    const {
      config = {},
      clamp,
      roomConfigSegmentLength = 14,
    } = options;

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
      .slice(0, roomConfigSegmentLength);
  }

  function generateRoomCode(options = {}) {
    const {
      config,
      seed,
      createRandomSeed,
      roomMap = {},
      encodeConfigForRoomCode,
      roomCodeRandomSegmentLength = 4,
      maxAttempts = 40,
    } = options;

    const configSegment = encodeConfigForRoomCode(config);
    const seedSegment = seed || createRandomSeed();

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const baseCode = `${configSegment}-${seedSegment}`;
      if (!roomMap[baseCode]) {
        return baseCode;
      }
    }

    const fallbackSegment = Date.now().toString(36).toUpperCase().slice(-roomCodeRandomSegmentLength);
    return `${configSegment}-${fallbackSegment}`;
  }

  function decodeRoomCode(options = {}) {
    const {
      code,
      roomConfigSegmentLength = 14,
    } = options;

    if (!code) return null;

    const [configSegment, seedSegment] = String(code).split('-');
    if (!configSegment || !seedSegment) {
      return null;
    }

    const validLengths = [
      roomConfigSegmentLength,
      roomConfigSegmentLength - 2,
      roomConfigSegmentLength - 4,
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

  function copyRoomCode(options = {}) {
    const {
      code,
      clipboard = navigator.clipboard,
      onSuccess = () => {},
      onFailure = () => {},
    } = options;

    if (!code) return;
    if (clipboard?.writeText) {
      clipboard.writeText(code).then(
        () => onSuccess(code),
        () => onFailure(code)
      );
    } else {
      onFailure(code);
    }
  }

  function initRoomJoin(options = {}) {
    const {
      joinRoomBtn,
      roomCodeInput,
      roomMap = {},
      runs = [],
      decodeRoomCode,
      applyRoomSettings,
      showStatusMessage,
    } = options;

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

  window.MindsweeperRoomCodes = {
    encodeConfigForRoomCode,
    generateRoomCode,
    decodeRoomCode,
    copyRoomCode,
    initRoomJoin,
  };
})();
