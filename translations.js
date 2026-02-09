(() => {
    const LANGUAGE_OPTIONS = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'tlh', name: 'Klingon', flag: '🏴' },
    { code: 'pir', name: 'Pirate', flag: '🏴‍☠️' },
    { code: 'lol', name: 'LOLcat', flag: '😺' },
    { code: 'eo', name: 'Esperanto', flag: '🇪🇸' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'yoda', name: 'Yoda-speak', flag: '🛸' },
    { code: 'mus', name: 'Melodia', flag: '🎼' },
    { code: 'ang', name: 'Angry', flag: '😡' },
    { code: 'elv', name: 'Elvish', flag: '🧝‍♂️' },
    { code: 'bra', name: 'Braille', flag: '⠿' },
  ];

  window.MindsweeperTranslations = window.MindsweeperTranslations || {};
  window.MindsweeperTranslations.TRANSLATIONS = window.MindsweeperTranslations.TRANSLATIONS || {};
  const TRANSLATIONS = window.MindsweeperTranslations.TRANSLATIONS;

  const BRAILLE_LETTERS = {
    a: '\u2801',
    b: '\u2803',
    c: '\u2809',
    d: '\u2819',
    e: '\u2811',
    f: '\u280b',
    g: '\u281b',
    h: '\u2813',
    i: '\u280a',
    j: '\u281a',
    k: '\u2805',
    l: '\u2807',
    m: '\u280d',
    n: '\u281d',
    o: '\u2815',
    p: '\u280f',
    q: '\u281f',
    r: '\u2817',
    s: '\u280e',
    t: '\u281e',
    u: '\u2825',
    v: '\u2827',
    w: '\u283a',
    x: '\u282d',
    y: '\u283d',
    z: '\u2835',
  };

  const BRAILLE_DIGITS = {
    '1': '\u2801',
    '2': '\u2803',
    '3': '\u2809',
    '4': '\u2819',
    '5': '\u2811',
    '6': '\u280b',
    '7': '\u281b',
    '8': '\u2813',
    '9': '\u280a',
    '0': '\u281a',
  };

  const BRAILLE_PUNCTUATION = {
    ',': '\u2802',
    '.': '\u2832',
    '!': '\u2816',
    '?': '\u2826',
    ':': '\u2812',
    ';': '\u2806',
    '-': '\u2824',
    '—': '\u2824',
    "'": '\u2804',
    '"': '\u2836',
    '/': '\u282c',
    '&': '\u2834',
  };

  const BRAILLE_NUMBER_PREFIX = '\u283c';
  const BRAILLE_SPACE = '\u2800';
  const BRAILLE_PLACEHOLDER_PATTERN = /\{[^}]+\}/g;

  function brailleizeSegment(segment) {
    let output = '';
    let sawDigit = false;
    for (const char of segment) {
      if (char === ' ') {
        output += BRAILLE_SPACE;
        sawDigit = false;
        continue;
      }
      const lower = char.toLowerCase();
      if (BRAILLE_LETTERS[lower]) {
        output += BRAILLE_LETTERS[lower];
        sawDigit = false;
      } else if (BRAILLE_DIGITS[char]) {
        if (!sawDigit) {
          output += BRAILLE_NUMBER_PREFIX;
        }
        output += BRAILLE_DIGITS[char];
        sawDigit = true;
      } else if (BRAILLE_PUNCTUATION[char]) {
        output += BRAILLE_PUNCTUATION[char];
        sawDigit = false;
      } else {
        output += char;
        sawDigit = false;
      }
    }
    return output;
  }

  function brailleizeString(value) {
    let result = '';
    let lastIndex = 0;
    BRAILLE_PLACEHOLDER_PATTERN.lastIndex = 0;
    let match;
    while ((match = BRAILLE_PLACEHOLDER_PATTERN.exec(value)) !== null) {
      result += brailleizeSegment(value.slice(lastIndex, match.index));
      result += match[0];
      lastIndex = match.index + match[0].length;
    }
    result += brailleizeSegment(value.slice(lastIndex));
    return result;
  }

  function convertToBraille(value) {
    if (typeof value === 'string') {
      return brailleizeString(value);
    }
    if (Array.isArray(value)) {
      return value.map(convertToBraille);
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key, convertToBraille(entryValue)]));
    }
    return value;
  }

  TRANSLATIONS.bra = convertToBraille(TRANSLATIONS.en);

  const EXTRA_THEME_NAMES = {
    fr: ['Néon', 'Crépuscule', 'Aurore', 'Minuit', 'Verdoyant', 'Braise'],
    pt: ['Neon', 'Crepúsculo', 'Aurora', 'Meia-noite', 'Verdejante', 'Brasa'],
    de: ['Neon', 'Dämmerung', 'Sonnenaufgang', 'Mitternacht', 'Grün', 'Glut'],
    ru: ['Неон', 'Сумерки', 'Рассвет', 'Полночь', 'Изумруд', 'Уголь'],
    tlh: ['ne\'on', 'ram', 'poH', 'ramDaq', 'pong', 'ho\'a\''],
    pir: ['Neon', 'Twilight', 'Dawn', 'Midnight', 'Verdant', 'Ember'],
    lol: ['Neon', 'Dusk', 'Sunrise', 'Midnight', 'Verdant', 'Ember'],
    eo: ['Neono', 'Krepusko', 'Sunleviĝo', 'Noktomezo', 'Verdira', 'Braz'],
    sv: ['Neon', 'Skymning', 'Soluppgång', 'Midnatt', 'Grön', 'Glöd'],
    ar: ['نيون', 'الغسق', 'الشروق', 'منتصف الليل', 'أخضر', 'جمرة'],
    elv: ['Elenya', 'Lómelindë', 'Anarórë', 'Alcaro', 'Vëaná', 'Urëra'],
    it: ['Neon', 'Crepuscolo', 'Alba', 'Mezzanotte', 'Verdeggiante', 'Brace'],
    tr: ['Neon', 'Alacakaranlık', 'Gün doğumu', 'Gece yarısı', 'Yeşil', 'Kor'],
    yoda: ['Neon', 'Dusk', 'Sunrise', 'Midnight', 'Verdant', 'Ember'],
    bn: ['নিয়ন', 'বেণুজ্বালা', 'সূর্যোদয়', 'অর্ধরাত্রি', 'সবুজ', 'জ্বলন্ত কোণা'],
    mus: ['♪ Neon', '♪ Dusk', '♪ Sunrise', '♪ Midnight', 'Verdant', '♪ Ember'],
  };
    Object.keys(EXTRA_THEME_NAMES).forEach((code) => {
    if (TRANSLATIONS[code]) return;
    TRANSLATIONS[code] = JSON.parse(JSON.stringify(TRANSLATIONS.en));
    TRANSLATIONS[code].theme = {};
    const names = EXTRA_THEME_NAMES[code];
    ['neon', 'dusk', 'sunrise', 'midnight', 'verdant', 'ember'].forEach((key, index) => {
      TRANSLATIONS[code].theme[key] = names[index] || 'Neon';
    });
    });

    Object.keys(TRANSLATIONS).forEach((code) => {
      const locale = TRANSLATIONS[code];
      const seedMap = window.MindsweeperTranslations.SEED_TERMS || {};
      const terms = seedMap[code] || seedMap.en;
      if (!terms) return;
      locale.label = locale.label || {};
      locale.label.seed = terms.seedLabel || terms.seed || 'Seed';
      locale.button = locale.button || {};
      locale.button.copySeed = terms.copySeed || 'Copy seed';
      locale.button.joinRoom = terms.joinRoom || locale.button.joinRoom || 'Load seed';
      locale.button.copyRoom = terms.copyRoom || locale.button.copyRoom || 'Copy seed';
      locale.placeholder = locale.placeholder || {};
      locale.placeholder.roomCode = terms.placeholder || locale.placeholder.roomCode || 'Paste seed';
      locale.history = locale.history || {};
      locale.history.roomCode = terms.historyCode || locale.history.roomCode || 'Seed {code}';
      locale.history.roomPending = terms.historyPending || locale.history.roomPending || 'Seed pending';
      locale.status = locale.status || {};
      locale.status.enterRoom = terms.enterRoom || locale.status.enterRoom || 'Enter a seed first.';
      locale.status.roomNotFound = terms.roomNotFound || locale.status.roomNotFound || 'Seed {code} not found.';
      locale.status.joiningRoom = terms.joiningRoom || locale.status.joiningRoom || 'Loading seed {code}...';
      locale.status.copySuccess = terms.copySuccess || locale.status.copySuccess || 'Seed {code} copied to clipboard.';
      locale.status.copyFallback = terms.copyFallback || locale.status.copyFallback || 'Seed {code}';
    });

    window.MindsweeperTranslations = window.MindsweeperTranslations || {};
    window.MindsweeperTranslations.LANGUAGE_OPTIONS = LANGUAGE_OPTIONS;
    window.MindsweeperTranslations.TRANSLATIONS = TRANSLATIONS;

})();
