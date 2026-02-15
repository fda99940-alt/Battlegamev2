(() => {
  function applyTheme(options = {}) {
    const {
      name,
      availableThemes = [],
      defaultTheme,
      root = document.documentElement,
      themeButtons = [],
      safeSetItem,
      themeStorageKey,
      persist = true,
      onAfterApply = () => {},
    } = options;

    const themeName = availableThemes.includes(name) ? name : defaultTheme;
    root.setAttribute('data-theme', themeName);
    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeOption === themeName;
      button.classList.toggle('theme-toggle--active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    if (persist) {
      safeSetItem(themeStorageKey, themeName);
    }
    onAfterApply(themeName);
    return themeName;
  }

  function initThemeSwitcher(options = {}) {
    const {
      themeButtons = [],
      safeGetItem,
      themeStorageKey,
      defaultTheme,
      applyTheme,
    } = options;

    themeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        applyTheme(button.dataset.themeOption);
      });
    });
    const storedTheme = safeGetItem(themeStorageKey);
    applyTheme(storedTheme || defaultTheme, { persist: false });
  }

  function applyHistoryCollapse(options = {}) {
    const {
      collapsed,
      historyPanel,
      toggleHistoryBtn,
      t,
      safeSetItem,
      historyCollapsedKey,
      persist = true,
    } = options;

    historyPanel?.classList.toggle('history--collapsed', collapsed);
    if (toggleHistoryBtn) {
      toggleHistoryBtn.textContent = collapsed ? t('button.showHistory') : t('button.hideHistory');
    }
    if (persist) {
      safeSetItem(historyCollapsedKey, String(collapsed));
    }
  }

  function initHistoryCollapse(options = {}) {
    const {
      toggleHistoryBtn,
      historyPanel,
      safeGetItem,
      historyCollapsedKey,
      applyHistoryCollapse,
    } = options;

    if (!toggleHistoryBtn || !historyPanel) return;
    const stored = safeGetItem(historyCollapsedKey) === 'true';
    applyHistoryCollapse(stored, { persist: false });
    toggleHistoryBtn.addEventListener('click', () => {
      const currentlyCollapsed = historyPanel.classList.contains('history--collapsed');
      applyHistoryCollapse(!currentlyCollapsed);
    });
  }

  function setActivePreset(options = {}) {
    const {
      name,
      presetButtons = [],
    } = options;

    presetButtons.forEach((button) => {
      const isActive = name && button.dataset.preset === name;
      button.classList.toggle('preset-toggle--active', isActive);
      button.setAttribute('aria-pressed', String(Boolean(isActive)));
    });
  }

  function initDifficultyPresets(options = {}) {
    const {
      presetButtons = [],
      onPresetClick,
      inputs = [],
      onInputsChanged,
    } = options;

    presetButtons.forEach((button) => {
      button.addEventListener('click', () => onPresetClick(button.dataset.preset));
    });

    inputs
      .filter(Boolean)
      .forEach((input) => {
        input.addEventListener('input', () => onInputsChanged());
      });
  }

  function setActiveFacePreset(options = {}) {
    const {
      value,
      facePresetButtons = [],
    } = options;

    facePresetButtons.forEach((button) => {
      const isActive = Boolean(value) && button.dataset.facePreset === value;
      button.classList.toggle('face-preset-toggle--active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function initFacePresets(options = {}) {
    const {
      facePresetButtons = [],
      facesInput,
      normalizeFaceCount,
      setActiveFacePreset,
      updateFaceShapeInfo,
      updateConfigScalingNote,
    } = options;

    facePresetButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const value = normalizeFaceCount(Number(button.dataset.facePreset) || 6);
        if (facesInput) {
          facesInput.value = value;
        }
        setActiveFacePreset(String(value));
        updateFaceShapeInfo();
        updateConfigScalingNote();
      });
    });

    if (facesInput) {
      facesInput.addEventListener('input', () => {
        const value = normalizeFaceCount(Number(facesInput.value) || 6);
        facesInput.value = value;
        setActiveFacePreset(String(value));
        updateFaceShapeInfo();
      });
      const value = normalizeFaceCount(Number(facesInput.value) || 6);
      facesInput.value = value;
      setActiveFacePreset(String(value));
      updateFaceShapeInfo();
    }
  }

  window.MindsweeperUiControls = {
    applyTheme,
    initThemeSwitcher,
    applyHistoryCollapse,
    initHistoryCollapse,
    setActivePreset,
    initDifficultyPresets,
    setActiveFacePreset,
    initFacePresets,
  };
})();
