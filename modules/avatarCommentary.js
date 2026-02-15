(() => {
  function loadAvatarPersona(options = {}) {
    const {
      safeGetItem,
      avatarPersonaKey = 'mindsweeperAvatarPersona',
      avatarPersonas = {},
      defaultPersona = 'friendly',
    } = options;

    const stored = safeGetItem(avatarPersonaKey);
    if (stored && avatarPersonas[stored]) {
      return stored;
    }
    return defaultPersona;
  }

  function initAvatarSwitcher(options = {}) {
    const {
      avatarSelectEl,
      avatarPortraitEl,
      onPersonaChange = () => {},
    } = options;

    if (avatarSelectEl) {
      avatarSelectEl.addEventListener('change', () => {
        onPersonaChange(avatarSelectEl.value);
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
  }

  function setAvatarPersona(options = {}) {
    const {
      persona,
      currentAvatarPersona,
      avatarPersonas = {},
      avatarPortraitEl,
      avatarSelectEl,
      safeSetItem,
      avatarPersonaKey = 'mindsweeperAvatarPersona',
      persist = true,
      force = false,
      defaultPersona = 'friendly',
    } = options;

    const normalized = avatarPersonas[persona] ? persona : defaultPersona;
    if (currentAvatarPersona === normalized && force !== true) {
      return currentAvatarPersona;
    }

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

    return normalized;
  }

  function getAvatarLines(options = {}) {
    const {
      translations = {},
      currentLocale,
      currentAvatarPersona,
      key,
      defaultLocale = 'en',
      defaultPersona = 'friendly',
    } = options;

    const personaLines = translations[currentLocale]?.avatar?.personas?.[currentAvatarPersona]?.[key];
    if (Array.isArray(personaLines) && personaLines.length) {
      return personaLines;
    }

    const fallbackPersonaLines = translations[defaultLocale]?.avatar?.personas?.[currentAvatarPersona]?.[key];
    if (Array.isArray(fallbackPersonaLines) && fallbackPersonaLines.length) {
      return fallbackPersonaLines;
    }

    const friendlyFallback = translations[defaultLocale]?.avatar?.personas?.[defaultPersona]?.[key];
    return Array.isArray(friendlyFallback) ? friendlyFallback : [];
  }

  function resolveAvatarLine(options = {}) {
    const {
      key,
      replacements = {},
      getAvatarLines = () => [],
      rng = Math.random,
    } = options;

    const choices = getAvatarLines(key);
    if (!choices?.length) {
      return replacements.fallback || '';
    }

    let template = choices[Math.floor(rng() * choices.length)];
    Object.entries(replacements).forEach(([token, value]) => {
      template = template.replace(new RegExp(`\\{${token}\\}`, 'g'), value);
    });
    return template;
  }

  function appendAvatarHistory(options = {}) {
    const {
      message,
      avatarHistory = [],
      avatarHistoryLimit = 5,
      avatarHistoryListEl,
    } = options;

    if (!avatarHistoryListEl || !message) return avatarHistory;

    const nextHistory = [message, ...avatarHistory].slice(0, avatarHistoryLimit);
    avatarHistoryListEl.innerHTML = nextHistory.map((line) => `<li>${line}</li>`).join('');
    return nextHistory;
  }

  function setAvatarComment(options = {}) {
    const {
      message,
      avatarCommentEl,
      avatarWindowEl,
      avatarPulseTimer,
      avatarPulseDuration = 1400,
      duration,
      appendAvatarHistory,
    } = options;

    if (!avatarCommentEl || !message) return avatarPulseTimer;

    avatarCommentEl.textContent = message;
    appendAvatarHistory(message);

    if (!avatarWindowEl) return avatarPulseTimer;

    avatarWindowEl.classList.add('avatar-window--active');
    if (avatarPulseTimer) {
      clearTimeout(avatarPulseTimer);
    }

    return setTimeout(() => {
      avatarWindowEl.classList.remove('avatar-window--active');
    }, duration || avatarPulseDuration);
  }

  function commentOnReveal(options = {}) {
    const {
      cell,
      describeCellPosition = () => 'the board',
      speakAvatar = () => {},
    } = options;

    if (!cell || cell.isMine || cell.special) return;
    const replacements = { pos: describeCellPosition(cell) };
    if (cell.neighborMines === 0) {
      speakAvatar('zero', replacements);
    } else {
      speakAvatar('neighbor', { ...replacements, count: cell.neighborMines });
    }
  }

  function commentOnFlag(options = {}) {
    const {
      cell,
      shouldFlag,
      describeCellPosition = () => 'the board',
      speakAvatar = () => {},
    } = options;

    speakAvatar(shouldFlag ? 'flagOn' : 'flagOff', {
      pos: describeCellPosition(cell),
    });
  }

  function commentOnSpecial(options = {}) {
    const {
      special,
      cell,
      describeCellPosition = () => 'the board',
      speakAvatar = () => {},
    } = options;

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

  window.MindsweeperAvatarCommentary = {
    loadAvatarPersona,
    initAvatarSwitcher,
    setAvatarPersona,
    getAvatarLines,
    resolveAvatarLine,
    appendAvatarHistory,
    setAvatarComment,
    commentOnReveal,
    commentOnFlag,
    commentOnSpecial,
  };
})();
