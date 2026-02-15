(() => {
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function pick(array, rng = Math.random) {
    return array[Math.floor(rng() * array.length)];
  }

  function shuffle(array, rng = Math.random) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function createRandomSeed(options = {}) {
    const {
      length = 4,
      alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
      rng = Math.random,
    } = options;
    return Array.from({ length }, () => alphabet[Math.floor(rng() * alphabet.length)]).join('');
  }

  function createDistinctSeed(previousSeed, options = {}) {
    const {
      maxAttempts = 12,
      length = 4,
      alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
      rng = Math.random,
    } = options;

    let next = createRandomSeed({ length, alphabet, rng });
    for (let attempt = 0; attempt < maxAttempts && next === previousSeed; attempt += 1) {
      next = createRandomSeed({ length, alphabet, rng });
    }
    if (next === previousSeed) {
      const stamp = Date.now().toString(36).toUpperCase();
      next = `${stamp}${createRandomSeed({ length, alphabet, rng })}`.slice(0, length);
    }
    return next;
  }

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

  function normalizeAngle(value) {
    let angle = value % 360;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    return angle;
  }

  function shortestAngleTarget(current, target) {
    const delta = normalizeAngle(target - current);
    return current + delta;
  }

  function formatTimestamp(value) {
    return new Date(value).toLocaleString();
  }

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

  window.MindsweeperCoreUtils = {
    clamp,
    pick,
    shuffle,
    createRandomSeed,
    createDistinctSeed,
    createRng,
    normalizeAngle,
    shortestAngleTarget,
    formatTimestamp,
    getNumberColor,
  };
})();
