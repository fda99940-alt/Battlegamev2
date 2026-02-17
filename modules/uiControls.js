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
    const storedValue = safeGetItem(historyCollapsedKey);
    const collapsed = storedValue == null ? true : storedValue === 'true';
    applyHistoryCollapse(collapsed, { persist: false });
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

  window.MindsweeperUiControls = {
    applyTheme,
    initThemeSwitcher,
    applyHistoryCollapse,
    initHistoryCollapse,
    setActivePreset,
    initDifficultyPresets,
  };
})();
