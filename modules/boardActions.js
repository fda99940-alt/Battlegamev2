(() => {
  function applyFlag(options = {}) {
    const {
      cell,
      shouldFlag,
      gameActive,
      replay = false,
      recordAction = true,
      userAction = true,
      rendererMode,
      isReplaying,
      getFlaggedCount,
      setFlaggedCount,
      runActions,
      commentOnFlag,
      activeRenderer,
      updateStatus,
    } = options;

    if (!gameActive && !replay) return;
    if (!cell || cell.revealed) return;

    const wasFlagged = cell.flagged;
    cell.flagged = shouldFlag;
    const cellEl = cell.element;
    if (cellEl && rendererMode === 'dom') {
      cellEl.classList.toggle('cell--flagged', shouldFlag);
    }
    if (shouldFlag && !wasFlagged) {
      setFlaggedCount(getFlaggedCount() + 1);
    }
    if (!shouldFlag && wasFlagged) {
      setFlaggedCount(Math.max(0, getFlaggedCount() - 1));
    }
    if (recordAction && !isReplaying) {
      runActions.push({ type: 'flag', face: cell.face, row: cell.row, col: cell.col, flagged: shouldFlag });
    }
    if (userAction && !replay) {
      commentOnFlag(cell, shouldFlag);
    }
    activeRenderer?.syncCell?.(cell);
    updateStatus();
  }

  function revealCell(options = {}) {
    const {
      cell,
      gameActive,
      replay = false,
      recordAction = true,
      checkVictory = true,
      userAction = true,
      revealBatch = null,
      guardianShields,
      setGuardianShields,
      describeCellPosition,
      speakAvatar,
      showStatusMessage,
      showGuardianToast,
      applyFlag,
      rendererMode,
      getNumberColor,
      activeRenderer,
      setRevealedCount,
      getRevealedCount,
      isReplaying,
      runActions,
      triggerSpecial,
      getNeighbors,
      revealCell,
      commentOnReveal,
      updateStatus,
      handleLoss,
      checkForWin,
      handleWin,
    } = options;

    if (!gameActive && !replay) return;
    if (!cell || cell.revealed || cell.flagged) return;

    const pos = describeCellPosition(cell);
    if (!replay && cell.isMine && guardianShields > 0) {
      setGuardianShields(guardianShields - 1);
      speakAvatar('specialGuardianSave', { pos });
      showStatusMessage('status.guardianSaved');
      showGuardianToast('status.guardianSaved');
      applyFlag(cell, true, { recordAction, replay: false, userAction: false });
      updateStatus();
      return;
    }

    cell.revealed = true;
    const cellEl = cell.element;
    if (cellEl && rendererMode === 'dom') {
      cellEl.classList.add('cell--revealed');
      cellEl.removeAttribute('aria-label');
      if (cell.isMine) {
        cellEl.classList.add('cell--mine');
      } else if (cell.neighborMines) {
        cellEl.textContent = cell.neighborMines;
        cellEl.style.color = getNumberColor(cell.neighborMines);
      }
    }
    activeRenderer?.syncCell?.(cell);
    setRevealedCount(getRevealedCount() + 1);
    if (recordAction && !isReplaying) {
      runActions.push({ type: 'reveal', face: cell.face, row: cell.row, col: cell.col });
    }
    if (cell.special) {
      triggerSpecial(cell.special, cell, { revealBatch, replay });
    }
    if (!cell.isMine && cell.neighborMines === 0) {
      getNeighbors(cell).forEach((neighbor) => {
        if (!neighbor.revealed) {
          revealCell(neighbor, { recordAction: false, replay, checkVictory, userAction: false, revealBatch });
        }
      });
    }
    if (userAction && !replay && !cell.isMine && !cell.special) {
      commentOnReveal(cell);
    }
    updateStatus();
    if (!replay && cell.isMine) {
      handleLoss(cell);
      return;
    }
    if (!replay && checkVictory && checkForWin()) {
      handleWin();
    }
  }

  function flagRandomMine(options = {}) {
    const {
      forEachCell,
      pick,
      applyFlag,
      recordAction = true,
    } = options;

    const candidates = [];
    forEachCell((cell) => {
      if (cell.isMine && !cell.flagged) {
        candidates.push(cell);
      }
    });

    if (!candidates.length) return null;
    const target = pick(candidates);
    applyFlag(target, true, { recordAction, replay: false, userAction: false });
    return target;
  }

  function triggerSpecial(options = {}) {
    const {
      special,
      cell,
      specialsEnabled,
      describeCellPosition,
      speakAvatar,
      onRotation,
      onFlip,
      onDog,
      onGuardian,
      applyTransform,
      updateStatus,
      commentOnSpecial,
      showSpecialToast,
      toastContext = {},
    } = options;

    if (!special || special.triggered) return;
    if (!specialsEnabled) return;

    special.triggered = true;
    const pos = describeCellPosition(cell);
    speakAvatar('specialHit', { pos });

    if (special.type === 'rotation') {
      onRotation(special);
    } else if (special.type === 'flip') {
      onFlip(special);
    } else if (special.type === 'dog') {
      onDog(special);
    } else if (special.type === 'guardian') {
      onGuardian(special);
    }

    applyTransform();
    updateStatus();
    commentOnSpecial(special, cell);
    showSpecialToast?.(special, cell, toastContext);
  }

  window.MindsweeperBoardActions = {
    applyFlag,
    revealCell,
    flagRandomMine,
    triggerSpecial,
  };
})();
