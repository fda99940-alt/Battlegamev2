(() => {
  window.MindsweeperTranslations = window.MindsweeperTranslations || {};
  window.MindsweeperTranslations.TRANSLATIONS = window.MindsweeperTranslations.TRANSLATIONS || {};
  window.MindsweeperTranslations.TRANSLATIONS['zh'] = {
      hero: {
        eyebrow: '优先浏览器',
        title: 'Mindsweeper',
        greeting: '欢迎来到游戏，被选中的勇士。',
        lede: '霓虹风格的扫雷，每轮都有旋转、翻转和持久回放，让局势不可预测。',
        meta: {
          keyboard: '键盘友好',
          history: '持久对局',
          replay: '回放特效',
        },
      },
      label: {
        minesRemaining: '剩余雷数',
        cellsRevealed: '已揭示格',
        rotationTriggers: '旋转次数',
        flipTriggers: '翻转次数',
        rows: '行',
        cols: '列',
        mines: '地雷',
        rotationSpecials: '旋转加成',
        flipSpecials: '翻转加成',
        themes: '主题',
        difficulty: '难度',
        language: '语言',
        on: '开启',
        off: '关闭',
      },
      theme: {
        neon: '霓虹',
        dusk: '暮色',
        sunrise: '朝霞',
        midnight: '午夜',
        verdant: '翠绿',
        ember: '余烬',
      },
      panel: {
        boardTitle: '棋盘与特效',
        boardSubtitle: '开始新一轮前可在此调整布局。',
      },
      section: {
        history: {
          title: '历史记录',
          desc: '重播、删除或清空过往对局。',
        },
      },
      button: {
        applyLayout: '应用布局',
        specials: '特效：{state}',
        showMines: '显示地雷',
        hideMines: '隐藏地雷',
        clearHistory: '清空历史',
        hideHistory: '隐藏记录',
        showHistory: '显示记录',
        joinRoom: '加入房间',
        copyRoom: '复制代码',
        replay: '重播',
        delete: '删除',
        preset: {
          easy: '简单',
          medium: '中等',
          hard: '困难',
        },
      },
      placeholder: {
        roomCode: '粘贴房间代码',
      },
      history: {
        metaStats: '{timestamp} • {duration}s • {steps} 步',
        metaSpecials: '旋转 {rotations} 次，翻转 {flips} 次',
        roomCode: '房间 {code}',
        roomPending: '等待房间代码',
        empty: '尚未记录任何对局。',
      },
      status: {
        start: '点击任意格子开始。',
        newBoard: '新棋盘已准备，点 click 或用键盘探索。',
        specialEffects: '特效已{state}。',
        cheatEnabled: '作弊视图已启用。',
        cheatDisabled: '作弊视图已关闭。',
        replayInit: '正在回放于 {timestamp} 的对局',
        replayProgress: '正在回放于 {timestamp} 的对局 ({step}/{total})',
        replayComplete: '回放完成，请应用新布局。',
        loss: '踩雷啦！所有地雷一起跳出来嘲笑你，喊着“看，我早就说了”。',
        win: '胜利！所有安全格已找到。',
        enterRoom: '请先输入房间代码。',
        roomNotFound: '未找到房间 {code}。',
        joiningRoom: '正在加入房间 {code}…',
        copySuccess: '房间 {code} 已复制到剪贴板。',
        copyFallback: '房间代码 {code}',
      },
      hint: {
        keyboard: '方向键移动焦点，回车/空格翻开，F 标记。',
      },
    };
})();
