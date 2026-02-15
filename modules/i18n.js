(() => {
  function loadLocale(options = {}) {
    const {
      safeGetItem,
      localeKey = 'mindsweeperLocale',
      translations = {},
      defaultLocale = 'en',
      navigatorLanguage = navigator.language,
    } = options;

    const stored = safeGetItem(localeKey);
    if (stored && translations[stored]) {
      return stored;
    }
    const nav = navigatorLanguage?.split('-')[0];
    if (nav && translations[nav]) {
      return nav;
    }
    return defaultLocale;
  }

  function resolveTranslation(options = {}) {
    const { translations = {}, locale, key } = options;
    if (!locale || !key) return null;
    const segments = key.split('.');
    let node = translations[locale];
    for (const segment of segments) {
      if (!node || !(segment in node)) {
        return null;
      }
      node = node[segment];
    }
    return node;
  }

  function translate(options = {}) {
    const {
      translations = {},
      currentLocale,
      defaultLocale = 'en',
      key,
      replacements = {},
    } = options;

    let text = resolveTranslation({ translations, locale: currentLocale, key });
    if (text == null && currentLocale !== defaultLocale) {
      text = resolveTranslation({ translations, locale: defaultLocale, key });
    }
    if (text == null) return key;

    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });

    return text;
  }

  function applyStaticTranslations(options = {}) {
    const {
      root = document,
      t = (key) => key,
      selector = '[data-i18n-key]',
    } = options;

    root.querySelectorAll(selector).forEach((element) => {
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

  function populateLanguageSelect(options = {}) {
    const {
      languageSelect,
      languages = [],
      currentLocale,
    } = options;

    if (!languageSelect) return;
    languageSelect.innerHTML = '';
    languages.forEach((lang) => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = `${lang.flag} ${lang.name}`;
      languageSelect.appendChild(option);
    });
    languageSelect.value = currentLocale;
  }

  function updateLanguageLabel(options = {}) {
    const {
      languageLabel,
      languages = [],
      currentLocale,
    } = options;

    if (!languageLabel || !languages.length) return;
    const lang = languages.find((entry) => entry.code === currentLocale) || languages[0];
    languageLabel.textContent = `${lang.flag} ${lang.name}`;
  }

  window.MindsweeperI18n = {
    loadLocale,
    resolveTranslation,
    translate,
    applyStaticTranslations,
    populateLanguageSelect,
    updateLanguageLabel,
  };
})();
