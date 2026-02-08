(() => {
    const LANGUAGE_OPTIONS = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
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
    yoda: ['Neon', 'Dusk', 'Sunrise', 'Midnight', 'Verdant', 'Ember'],
    mus: ['♪ Neon', '♪ Dusk', '♪ Sunrise', '♪ Midnight', '♪ Verdant', '♪ Ember'],
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

    const SEED_TERMS = {
      en: {
        seedLabel: 'Seed',
        copySeed: 'Copy seed',
        joinRoom: 'Load seed',
        copyRoom: 'Copy seed',
        placeholder: 'Paste seed',
        historyCode: 'Seed {code}',
        historyPending: 'Seed pending',
        enterRoom: 'Enter a seed first.',
        roomNotFound: 'Seed {code} not found.',
        joiningRoom: 'Loading seed {code}...',
        copySuccess: 'Seed {code} copied to clipboard.',
        copyFallback: 'Seed {code}',
      },
      es: {
        seedLabel: 'Semilla',
        copySeed: 'Copiar semilla',
        joinRoom: 'Cargar semilla',
        copyRoom: 'Copiar semilla',
        placeholder: 'Pega la semilla',
        historyCode: 'Semilla {code}',
        historyPending: 'Semilla pendiente',
        enterRoom: 'Ingresa una semilla primero.',
        roomNotFound: 'Semilla {code} no encontrada.',
        joiningRoom: 'Cargando la semilla {code}...',
        copySuccess: 'Semilla {code} copiada al portapapeles.',
        copyFallback: 'Semilla {code}',
      },
      sw: {
        seedLabel: 'Mbegu',
        copySeed: 'Nakili mbegu',
        joinRoom: 'Pakia mbegu',
        copyRoom: 'Nakili mbegu',
        placeholder: 'Bandika mbegu',
        historyCode: 'Mbegu {code}',
        historyPending: 'Mbegu inasubiri',
        enterRoom: 'Weka mbegu kwanza.',
        roomNotFound: 'Mbegu {code} haijapatikana.',
        joiningRoom: 'Inapakia mbegu {code}...',
        copySuccess: 'Mbegu {code} imenakiliwa.',
        copyFallback: 'Mbegu {code}',
      },
      zh: {
        seedLabel: '种子',
        copySeed: '复制种子',
        joinRoom: '加载种子',
        copyRoom: '复制种子',
        placeholder: '粘贴种子',
        historyCode: '种子 {code}',
        historyPending: '种子待定',
        enterRoom: '请先输入种子。',
        roomNotFound: '未找到种子 {code}。',
        joiningRoom: '正在加载种子 {code}…',
        copySuccess: '种子 {code} 已复制到剪贴板。',
        copyFallback: '种子 {code}',
      },
      ja: {
        seedLabel: 'シード',
        copySeed: 'シードをコピー',
        joinRoom: 'シードを読み込む',
        copyRoom: 'シードをコピー',
        placeholder: 'シードを貼り付け',
        historyCode: 'シード {code}',
        historyPending: 'シード待ち',
        enterRoom: 'まずシードを入力してください。',
        roomNotFound: 'シード {code} が見つかりません。',
        joiningRoom: 'シード {code} を読み込み中…',
        copySuccess: 'シード {code} をコピーしました。',
        copyFallback: 'シード {code}',
      },
      hi: {
        seedLabel: 'सीड',
        copySeed: 'सीड कॉपी करें',
        joinRoom: 'सीड लोड करें',
        copyRoom: 'सीड कॉपी करें',
        placeholder: 'सीड चिपकाएँ',
        historyCode: 'सीड {code}',
        historyPending: 'सीड लंबित',
        enterRoom: 'पहले सीड दर्ज करें।',
        roomNotFound: 'सीड {code} नहीं मिला।',
        joiningRoom: 'सीड {code} लोड हो रहा है…',
        copySuccess: 'सीड {code} क्लिपबोर्ड पर कॉपी हुआ।',
        copyFallback: 'सीड {code}',
      },
      fr: {
        seedLabel: 'Graine',
        copySeed: 'Copier la graine',
        joinRoom: 'Charger la graine',
        copyRoom: 'Copier la graine',
        placeholder: 'Collez la graine',
        historyCode: 'Graine {code}',
        historyPending: 'Graine en attente',
        enterRoom: 'Saisissez d’abord une graine.',
        roomNotFound: 'Graine {code} introuvable.',
        joiningRoom: 'Chargement de la graine {code}…',
        copySuccess: 'Graine {code} copiée dans le presse-papiers.',
        copyFallback: 'Graine {code}',
      },
      pt: {
        seedLabel: 'Semente',
        copySeed: 'Copiar semente',
        joinRoom: 'Carregar semente',
        copyRoom: 'Copiar semente',
        placeholder: 'Cole a semente',
        historyCode: 'Semente {code}',
        historyPending: 'Semente pendente',
        enterRoom: 'Insira uma semente primeiro.',
        roomNotFound: 'Semente {code} não encontrada.',
        joiningRoom: 'Carregando semente {code}…',
        copySuccess: 'Semente {code} copiada.',
        copyFallback: 'Semente {code}',
      },
      de: {
        seedLabel: 'Seed',
        copySeed: 'Seed kopieren',
        joinRoom: 'Seed laden',
        copyRoom: 'Seed kopieren',
        placeholder: 'Seed einfügen',
        historyCode: 'Seed {code}',
        historyPending: 'Seed ausstehend',
        enterRoom: 'Zuerst einen Seed eingeben.',
        roomNotFound: 'Seed {code} nicht gefunden.',
        joiningRoom: 'Seed {code} wird geladen…',
        copySuccess: 'Seed {code} kopiert.',
        copyFallback: 'Seed {code}',
      },
      ru: {
        seedLabel: 'Сид',
        copySeed: 'Скопировать сид',
        joinRoom: 'Загрузить сид',
        copyRoom: 'Скопировать сид',
        placeholder: 'Вставьте сид',
        historyCode: 'Сид {code}',
        historyPending: 'Сид в ожидании',
        enterRoom: 'Сначала введите сид.',
        roomNotFound: 'Сид {code} не найден.',
        joiningRoom: 'Загружаем сид {code}…',
        copySuccess: 'Сид {code} скопирован.',
        copyFallback: 'Сид {code}',
      },
      tlh: {
        seedLabel: 'tI\'',
        copySeed: 'tI\' yIqIj',
        joinRoom: 'tI\' yIloda',
        copyRoom: 'tI\' yIqIj',
        placeholder: 'tI\' tIchen',
        historyCode: 'tI\' {code}',
        historyPending: 'tI\' loReady',
        enterRoom: 'tI\' yI\'ogh zuerst.',
        roomNotFound: 'tI\' {code} tu\'be\'lu\'.',
        joiningRoom: 'tI\' {code} loDlu\'...',
        copySuccess: 'tI\' {code} qIj.',
        copyFallback: 'tI\' {code}',
      },
      pir: {
        seedLabel: 'Seed',
        copySeed: 'Copy seed',
        joinRoom: 'Hoist seed',
        copyRoom: 'Copy seed',
        placeholder: 'Paste th’ seed',
        historyCode: 'Seed {code}',
        historyPending: 'Seed be waitin’',
        enterRoom: 'Enter a seed first, matey.',
        roomNotFound: 'Seed {code} ain’t in the log.',
        joiningRoom: 'Hoistin’ seed {code}…',
        copySuccess: 'Seed {code} copied to yer clipboard.',
        copyFallback: 'Seed {code}',
      },
      lol: {
        seedLabel: 'Seedz',
        copySeed: 'Copy seedz',
        joinRoom: 'Load seedz',
        copyRoom: 'Copy seedz',
        placeholder: 'Paste seedz',
        historyCode: 'Seed {code}',
        historyPending: 'Seed pending',
        enterRoom: 'Paste a seed furst.',
        roomNotFound: 'Seed {code} not found, kthx.',
        joiningRoom: 'Loading seed {code}…',
        copySuccess: 'Seed {code} copied :3',
        copyFallback: 'Seed {code}',
      },
      eo: {
        seedLabel: 'Semo',
        copySeed: 'Kopii semon',
        joinRoom: 'Ŝargi semon',
        copyRoom: 'Kopii semon',
        placeholder: 'Algluu semon',
        historyCode: 'Semo {code}',
        historyPending: 'Semo atendata',
        enterRoom: 'Unue enigu semon.',
        roomNotFound: 'Semo {code} ne trovita.',
        joiningRoom: 'Ŝargante semon {code}…',
        copySuccess: 'Semo {code} kopiita.',
        copyFallback: 'Semo {code}',
      },
      sv: {
        seedLabel: 'Seed',
        copySeed: 'Kopiera seed',
        joinRoom: 'Ladda seed',
        copyRoom: 'Kopiera seed',
        placeholder: 'Klistra in seed',
        historyCode: 'Seed {code}',
        historyPending: 'Seed väntar',
        enterRoom: 'Ange ett seed först.',
        roomNotFound: 'Seed {code} hittades inte.',
        joiningRoom: 'Laddar seed {code}…',
        copySuccess: 'Seed {code} kopierat.',
        copyFallback: 'Seed {code}',
      },
      ar: {
        seedLabel: 'بذرة',
        copySeed: 'نسخ البذرة',
        joinRoom: 'تحميل البذرة',
        copyRoom: 'نسخ البذرة',
        placeholder: 'الصق البذرة',
        historyCode: 'البذرة {code}',
        historyPending: 'بذرة قيد الانتظار',
        enterRoom: 'أدخل البذرة أولاً.',
        roomNotFound: 'البذرة {code} غير موجودة.',
        joiningRoom: 'يتم تحميل البذرة {code}…',
        copySuccess: 'تم نسخ البذرة {code}.',
        copyFallback: 'البذرة {code}',
      },
      elv: {
        seedLabel: 'Seda',
        copySeed: 'Seda kopi',
        joinRoom: 'Seda telya',
        copyRoom: 'Seda kopi',
        placeholder: 'Seda tampë',
        historyCode: 'Seda {code}',
        historyPending: 'Seda úvë',
        enterRoom: 'Anta seda yéni.',
        roomNotFound: 'Seda {code} úvë hirna.',
        joiningRoom: 'Seda {code} telya…',
        copySuccess: 'Seda {code} kopië.',
        copyFallback: 'Seda {code}',
      },
      yoda: {
        seedLabel: 'Seed',
        copySeed: 'Copy seed, you will',
        joinRoom: 'Load seed, you must',
        copyRoom: 'Copy seed',
        placeholder: 'Paste seed, you must',
        historyCode: 'Seed {code}, ready it is',
        historyPending: 'Seed pending, patience',
        enterRoom: 'Enter a seed first, do not rush',
        roomNotFound: 'Seed {code} not found, lost it is',
        joiningRoom: 'Loading seed {code}..., steady be',
        copySuccess: 'Seed {code} copied, share you will',
        copyFallback: 'Seed {code}',
      },
      ang: {
        seedLabel: 'Seed',
        copySeed: 'Copy seed',
        joinRoom: 'Load seed',
        copyRoom: 'Copy seed',
        placeholder: 'Paste seed',
        historyCode: 'Seed {code}',
        historyPending: 'Seed pending',
        enterRoom: 'Enter a seed, if you even have one.',
        roomNotFound: 'Seed {code} not found. Shocker.',
        joiningRoom: 'Loading seed {code}... don’t mess it up.',
        copySuccess: 'Seed {code} copied. Share that embarrassment.',
        copyFallback: 'Seed {code}.',
      },
      mus: {
        seedLabel: '♪ Seed',
        copySeed: '♫ Copy seed',
        joinRoom: '♪ Load seed',
        copyRoom: '♫ Copy seed',
        placeholder: '♫♪',
        historyCode: 'Seed {code}',
        historyPending: 'Seed pending',
        enterRoom: '♫ Enter a seed.',
        roomNotFound: 'Seed {code}♬',
        joiningRoom: '♩ Loading {code}…',
        copySuccess: '♬{code}',
        copyFallback: '{code}',
      },
    };

    Object.keys(TRANSLATIONS).forEach((code) => {
      const locale = TRANSLATIONS[code];
      const terms = SEED_TERMS[code] || SEED_TERMS.en;
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
