(() => {
  window.MindsweeperRenderers = window.MindsweeperRenderers || {};

  window.MindsweeperRenderers.createDomRenderer = function createDomRenderer(context) {
    const {
      cubeEl,
      getActiveFaces,
      getConfig,
      getVisualState,
      forEachCell,
      layoutCubeFacesDom,
      updateWrapperSpacing,
      normalizeFaceCount,
      decorateFaceElement,
      faceId,
      setFaceBoards,
      getCellFromElement,
      getCell,
    } = context;

    let boardByFace = {};

    function renderBoardDom() {
      const config = getConfig();
      const cheatMode = Boolean(getVisualState().cheatMode);

      layoutCubeFacesDom();
      getActiveFaces().forEach((face) => {
        const boardEl = boardByFace[face];
        if (!boardEl) return;
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${config.cols}, minmax(0, 1fr))`;
      });

      forEachCell((cell) => {
        const boardEl = boardByFace[cell.face];
        if (!boardEl) return;
        const cellEl = document.createElement('button');
        cellEl.type = 'button';
        cellEl.className = 'cell';
        cellEl.setAttribute('data-face', cell.face);
        cellEl.setAttribute('data-row', cell.row);
        cellEl.setAttribute('data-col', cell.col);
        cellEl.setAttribute('data-show-cheat', cheatMode ? 'true' : 'false');
        cellEl.setAttribute('aria-label', 'Hidden cell');
        if (cell.special?.type === 'rotation') {
          cellEl.classList.add('cell--special-rotation');
        }
        if (cell.special?.type === 'flip') {
          cellEl.classList.add('cell--special-flip');
        }
        if (cell.special?.type === 'dog') {
          cellEl.classList.add('cell--special-dog');
        }
        if (cell.special?.type === 'guardian') {
          cellEl.classList.add('cell--special-guardian');
        }
        cell.element = cellEl;
        boardEl.appendChild(cellEl);
      });
    }

    function applyTransformDom() {
      if (!cubeEl) return;
      const firstFace = getActiveFaces()[0];
      const {
        boardMode,
        specialsEnabled,
        flipHorizontal,
        flipVertical,
        rotationAngle,
        cubeZoom,
        cubePitch,
        cubeYaw,
      } = getVisualState();

      if (boardMode === '2d') {
        const board = boardByFace[firstFace];
        if (board) {
          const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
          const scaleY = specialsEnabled && flipVertical ? -1 : 1;
          const spin = specialsEnabled ? rotationAngle : 0;
          board.style.transform = `rotate(${spin}deg) scale(${scaleX}, ${scaleY})`;
        }
        cubeEl.style.transform = 'none';
        updateWrapperSpacing(false);
        return;
      }

      if (boardByFace[firstFace]) {
        boardByFace[firstFace].style.transform = 'none';
      }
      const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
      const scaleY = specialsEnabled && flipVertical ? -1 : 1;
      const spinY = specialsEnabled ? rotationAngle : 0;
      const zoomDistance = (cubeZoom - 1) * Math.max(cubeEl.clientWidth * 0.75, 240);
      cubeEl.style.transform = `translateZ(${zoomDistance}px) rotateX(${cubePitch}deg) rotateY(${cubeYaw + spinY}deg) scale(${scaleX}, ${scaleY})`;
      updateWrapperSpacing(false);
    }

    function ensureCubeFacesDom(count = 6) {
      if (!cubeEl) return;
      const safeCount = normalizeFaceCount(Number(count) || 6);
      cubeEl.innerHTML = '';
      for (let i = 0; i < safeCount; i += 1) {
        const faceEl = document.createElement('div');
        faceEl.className = 'cube-face';
        faceEl.setAttribute('data-face-index', String(i));
        decorateFaceElement(faceEl, i, safeCount);
        const boardEl = document.createElement('div');
        boardEl.className = 'board';
        boardEl.setAttribute('data-face-board', faceId(i));
        boardEl.setAttribute('role', 'grid');
        boardEl.setAttribute('aria-label', `Face ${i + 1}`);
        faceEl.appendChild(boardEl);
        cubeEl.appendChild(faceEl);
      }
      const nextFaceBoards = Array.from(cubeEl.querySelectorAll('[data-face-board]'));
      setFaceBoards(nextFaceBoards);
      boardByFace = nextFaceBoards.reduce((acc, board) => {
        const face = board.dataset.faceBoard;
        if (face) {
          acc[face] = board;
        }
        return acc;
      }, {});
      layoutCubeFacesDom();
    }

    return {
      id: 'dom',
      ensureFaces: ensureCubeFacesDom,
      layoutFaces: layoutCubeFacesDom,
      renderBoard: renderBoardDom,
      applyTransform: applyTransformDom,
      syncCell() {},
      syncAll() {},
      getCellFromInteraction(eventOrTarget) {
        const target = eventOrTarget?.target || eventOrTarget;
        const cellEl = target?.closest?.('.cell');
        if (cellEl && typeof getCellFromElement === 'function') {
          return getCellFromElement(cellEl);
        }
        if (!cellEl || typeof getCell !== 'function') return null;
        const face = cellEl.dataset.face;
        const row = Number(cellEl.dataset.row);
        const col = Number(cellEl.dataset.col);
        return getCell(face, row, col);
      },
    };
  };
})();
