(() => {
  function getFilteredRuns(options = {}) {
    const {
      runs = [],
      historyFilterResult = 'all',
      historyFilterDate = 'all',
      now = Date.now(),
    } = options;

    const maxAgeMsByFilter = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    const maxAgeMs = maxAgeMsByFilter[historyFilterDate] ?? null;

    return runs.filter((run) => {
      if (historyFilterResult !== 'all' && run.result !== historyFilterResult) {
        return false;
      }
      if (!maxAgeMs) return true;
      const timestamp = Date.parse(run.timestamp);
      if (Number.isNaN(timestamp)) return false;
      return now - timestamp <= maxAgeMs;
    });
  }

  function updateHistoryShowMoreButton(options = {}) {
    const {
      historyShowMoreBtn,
      totalFilteredCount = 0,
      historyVisibleCount = 0,
      historyPageSize = 20,
      t = (key) => key,
    } = options;

    if (!historyShowMoreBtn) return;
    const remaining = Math.max(totalFilteredCount - historyVisibleCount, 0);
    if (remaining <= 0) {
      historyShowMoreBtn.hidden = true;
      historyShowMoreBtn.disabled = true;
      return;
    }
    historyShowMoreBtn.hidden = false;
    historyShowMoreBtn.disabled = false;
    const step = Math.min(historyPageSize, remaining);
    historyShowMoreBtn.textContent = t('history.showMore', { count: step, remaining });
  }

  function syncHistoryFiltersUI(options = {}) {
    const {
      historyResultFilterEl,
      historyDateFilterEl,
      historyFilterResult = 'all',
      historyFilterDate = 'all',
    } = options;

    if (historyResultFilterEl) {
      historyResultFilterEl.value = historyFilterResult;
    }
    if (historyDateFilterEl) {
      historyDateFilterEl.value = historyFilterDate;
    }
  }

  function renderHistory(options = {}) {
    const {
      runs = [],
      clearHistoryBtn,
      historyList,
      historyVisibleCount = 20,
      historyPageSize = 20,
      historyFilterResult = 'all',
      historyFilterDate = 'all',
      historyShowMoreBtn,
      t = (key) => key,
      formatTimestamp = (value) => String(value),
      resolveReplayBoardMode = () => 'cube',
    } = options;

    if (!historyList) return;

    if (clearHistoryBtn) {
      clearHistoryBtn.disabled = !runs.length;
    }

    const filteredRuns = getFilteredRuns({
      runs,
      historyFilterResult,
      historyFilterDate,
    });

    if (!runs.length) {
      historyList.innerHTML = `<p class="history-empty">${t('history.empty')}</p>`;
      updateHistoryShowMoreButton({
        historyShowMoreBtn,
        totalFilteredCount: 0,
        historyVisibleCount,
        historyPageSize,
        t,
      });
      return;
    }

    if (!filteredRuns.length) {
      historyList.innerHTML = `<p class="history-empty">${t('history.filteredEmpty')}</p>`;
      updateHistoryShowMoreButton({
        historyShowMoreBtn,
        totalFilteredCount: 0,
        historyVisibleCount,
        historyPageSize,
        t,
      });
      return;
    }

    const visibleRuns = filteredRuns.slice(0, historyVisibleCount);
    historyList.innerHTML = '';

    visibleRuns.forEach((run) => {
      const wrapper = document.createElement('article');
      wrapper.className = 'history-run';

      const title = document.createElement('h3');
      title.textContent = `${run.result.toUpperCase()} • ${run.config.rows}×${run.config.cols} • ${run.config.mines} mines`;
      wrapper.appendChild(title);

      const meta = document.createElement('p');
      meta.textContent = t('history.metaStats', {
        timestamp: formatTimestamp(run.timestamp),
        duration: Math.round(run.duration / 1000),
        steps: run.actions.length,
      });
      wrapper.appendChild(meta);

      const boardType = document.createElement('p');
      const runMode = resolveReplayBoardMode(run);
      boardType.textContent = `Board: ${runMode === '2d' ? '2D' : 'Cube'}`;
      wrapper.appendChild(boardType);

      const specials = document.createElement('p');
      specials.textContent = t('history.metaSpecials', {
        rotations: run.rotationTriggers,
        flips: run.flipTriggers,
        dogs: run.dogTriggers,
        guardians: run.guardianTriggers ?? 0,
      });
      wrapper.appendChild(specials);

      const roomCodeRow = document.createElement('div');
      roomCodeRow.className = 'history-run__code';
      const codeLabel = document.createElement('span');
      codeLabel.textContent = run.roomCode
        ? t('history.roomCode', { code: run.roomCode })
        : t('history.roomPending');
      roomCodeRow.appendChild(codeLabel);

      if (run.roomCode) {
        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'ghost copy-room-code';
        copyButton.dataset.copyRoom = run.roomCode;
        copyButton.textContent = t('button.copyRoom');
        roomCodeRow.appendChild(copyButton);
      }

      wrapper.appendChild(roomCodeRow);

      const runActionsEl = document.createElement('div');
      runActionsEl.className = 'run-actions';

      const replayButton = document.createElement('button');
      replayButton.type = 'button';
      replayButton.dataset.action = 'replay';
      replayButton.dataset.id = run.id;
      replayButton.textContent = t('button.replay');

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete';
      deleteButton.dataset.action = 'delete';
      deleteButton.dataset.id = run.id;
      deleteButton.textContent = t('button.delete');

      runActionsEl.appendChild(replayButton);
      runActionsEl.appendChild(deleteButton);
      wrapper.appendChild(runActionsEl);
      historyList.appendChild(wrapper);
    });

    updateHistoryShowMoreButton({
      historyShowMoreBtn,
      totalFilteredCount: filteredRuns.length,
      historyVisibleCount,
      historyPageSize,
      t,
    });
  }

  function persistRuns(options = {}) {
    const { safeSetJSON, historyKey = 'mindsweeperRuns', runs = [] } = options;
    safeSetJSON(historyKey, runs);
  }

  function loadRuns(options = {}) {
    const { safeGetJSON, historyKey = 'mindsweeperRuns' } = options;
    return safeGetJSON(historyKey, []);
  }

  function persistRoomMap(options = {}) {
    const { safeSetJSON, roomMapKey = 'mindsweeperRooms', roomMap = {} } = options;
    safeSetJSON(roomMapKey, roomMap);
  }

  function loadRoomMap(options = {}) {
    const { safeGetJSON, roomMapKey = 'mindsweeperRooms' } = options;
    return safeGetJSON(roomMapKey, {});
  }

  window.MindsweeperHistoryStore = {
    getFilteredRuns,
    updateHistoryShowMoreButton,
    syncHistoryFiltersUI,
    renderHistory,
    persistRuns,
    loadRuns,
    persistRoomMap,
    loadRoomMap,
  };
})();
