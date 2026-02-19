(() => {
  window.MindsweeperRenderers = window.MindsweeperRenderers || {};

  window.MindsweeperRenderers.createCanvasRenderer = function createCanvasRenderer(context) {
    const {
      cubeEl,
      getActiveFaces,
      getCell,
      forEachCell,
      layoutCubeFacesDom,
      updateWrapperSpacing,
      normalizeFaceCount,
      decorateFaceElement,
      faceId,
      getNumberColor,
      getSpecialMarker,
      normalizeFaceId,
      clamp,
      setFaceBoards,
      getConfig,
      getVisualState,
    } = context;

    let faceCanvasByFace = {};

    function renderBoardCanvas() {
      const config = getConfig();
      getActiveFaces().forEach((face) => {
        const canvas = faceCanvasByFace[face];
        if (canvas) {
          canvas.style.aspectRatio = `${config.cols} / ${config.rows}`;
        }
      });
      forEachCell((cell) => {
        cell.element = null;
      });
      layoutCubeFacesCanvas();
      drawAllCanvasFaces();
    }

    function applyTransformCanvas() {
      if (!cubeEl) return;
      const firstFace = getActiveFaces()[0];
      const state = getVisualState();
      const {
        boardMode,
        specialsEnabled,
        flipHorizontal,
        flipVertical,
        rotationAngle,
        cubeZoom,
        cubePitch,
        cubeYaw,
      } = state;

      if (boardMode === '2d') {
        const canvas = faceCanvasByFace[firstFace];
        if (canvas) {
          const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
          const scaleY = specialsEnabled && flipVertical ? -1 : 1;
          const spin = specialsEnabled ? rotationAngle : 0;
          canvas.style.transform = `rotate(${spin}deg) scale(${scaleX}, ${scaleY})`;
        }
        cubeEl.style.transform = 'none';
        updateWrapperSpacing(false);
        return;
      }

      if (faceCanvasByFace[firstFace]) {
        faceCanvasByFace[firstFace].style.transform = 'none';
      }
      const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
      const scaleY = specialsEnabled && flipVertical ? -1 : 1;
      const spinY = specialsEnabled ? rotationAngle : 0;
      const zoomDistance = cubeZoom >= 1
        ? (cubeZoom - 1) * Math.max(cubeEl.clientWidth * 0.65, 260)
        : -(1 - cubeZoom) * Math.max(cubeEl.clientWidth * 2.4, 900);
      cubeEl.style.transform = `translateZ(${zoomDistance}px) rotateX(${cubePitch}deg) rotateY(${cubeYaw + spinY}deg) scale(${scaleX}, ${scaleY})`;
      updateWrapperSpacing(false);
    }

    function ensureCubeFacesCanvas(count = 6) {
      if (!cubeEl) return;
      const safeCount = normalizeFaceCount(Number(count) || 6);
      cubeEl.innerHTML = '';
      for (let i = 0; i < safeCount; i += 1) {
        const faceEl = document.createElement('div');
        faceEl.className = 'cube-face';
        faceEl.setAttribute('data-face-index', String(i));
        decorateFaceElement(faceEl, i, safeCount);

        const canvasEl = document.createElement('canvas');
        canvasEl.className = 'board board-canvas';
        canvasEl.setAttribute('data-face-canvas', faceId(i));
        canvasEl.setAttribute('data-face-board', faceId(i));
        canvasEl.setAttribute('role', 'img');
        canvasEl.setAttribute('aria-label', `Face ${i + 1}`);

        faceEl.appendChild(canvasEl);
        cubeEl.appendChild(faceEl);
      }

      const nextFaceBoards = Array.from(cubeEl.querySelectorAll('[data-face-canvas]'));
      setFaceBoards(nextFaceBoards);

      faceCanvasByFace = nextFaceBoards.reduce((acc, canvas) => {
        const face = canvas.dataset.faceCanvas;
        if (face) {
          acc[face] = canvas;
        }
        return acc;
      }, {});

      layoutCubeFacesCanvas();
    }

    function layoutCubeFacesCanvas() {
      layoutCubeFacesDom();
      resizeCanvasFaces();
      drawAllCanvasFaces();
    }

    function resizeCanvasFaces() {
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 1);
      Object.values(faceCanvasByFace).forEach((canvas) => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(Math.floor(rect.width * pixelRatio), 1);
        const height = Math.max(Math.floor(rect.height * pixelRatio), 1);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      });
    }

    function drawAllCanvasFaces() {
      getActiveFaces().forEach((face) => drawCanvasFace(face));
    }

    function drawCanvasFace(face) {
      const canvas = faceCanvasByFace[face];
      if (!canvas) return;
      const context2d = canvas.getContext('2d');
      if (!context2d) return;

      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      const scaleX = canvas.width / width;
      const scaleY = canvas.height / height;

      context2d.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      context2d.clearRect(0, 0, width, height);

      const palette = getCanvasPalette();
      context2d.fillStyle = palette.boardSurface;
      context2d.fillRect(0, 0, width, height);

      const config = getConfig();
      const cellWidth = width / Math.max(config.cols, 1);
      const cellHeight = height / Math.max(config.rows, 1);

      for (let row = 0; row < config.rows; row += 1) {
        for (let col = 0; col < config.cols; col += 1) {
          const cell = getCell(face, row, col);
          if (!cell) continue;
          drawCanvasCell(context2d, cell, col * cellWidth, row * cellHeight, cellWidth, cellHeight, palette);
        }
      }
    }

    function getCanvasPalette() {
      const rootStyles = getComputedStyle(document.documentElement);
      return {
        boardSurface: rootStyles.getPropertyValue('--board-surface').trim() || 'rgba(0, 0, 0, 0.25)',
        hiddenFill: rootStyles.getPropertyValue('--panel-surface').trim() || 'rgba(255, 255, 255, 0.06)',
        revealedFill: rootStyles.getPropertyValue('--cell-revealed-bg').trim() || 'rgba(255, 255, 255, 0.12)',
        border: rootStyles.getPropertyValue('--panel-border').trim() || 'rgba(255, 255, 255, 0.2)',
        text: rootStyles.getPropertyValue('--text-primary').trim() || '#ffffff',
        accent: rootStyles.getPropertyValue('--accent').trim() || '#5af2c7',
        highlight: rootStyles.getPropertyValue('--highlight').trim() || '#39f0ff',
        mine: rootStyles.getPropertyValue('--danger').trim() || '#ff6b6b',
      };
    }

    function drawCanvasCell(context2d, cell, x, y, width, height, palette) {
      const innerPadding = Math.max(Math.min(width, height) * 0.08, 1);
      const boxX = x + innerPadding;
      const boxY = y + innerPadding;
      const boxW = Math.max(width - innerPadding * 2, 1);
      const boxH = Math.max(height - innerPadding * 2, 1);

      context2d.fillStyle = cell.revealed ? palette.revealedFill : palette.hiddenFill;
      context2d.fillRect(boxX, boxY, boxW, boxH);
      context2d.strokeStyle = palette.border;
      context2d.lineWidth = 1;
      context2d.strokeRect(boxX + 0.5, boxY + 0.5, Math.max(boxW - 1, 1), Math.max(boxH - 1, 1));

      if (!cell.revealed && cell.flagged) {
        context2d.fillStyle = palette.accent;
        context2d.font = `${Math.max(Math.floor(boxH * 0.6), 10)}px sans-serif`;
        context2d.textAlign = 'center';
        context2d.textBaseline = 'middle';
        context2d.fillText('⚑', boxX + boxW / 2, boxY + boxH / 2);
        return;
      }

      if (cell.revealed && cell.isMine) {
        context2d.fillStyle = palette.mine;
        context2d.beginPath();
        context2d.arc(boxX + boxW / 2, boxY + boxH / 2, Math.max(Math.min(boxW, boxH) * 0.22, 3), 0, Math.PI * 2);
        context2d.fill();
        return;
      }

      if (cell.revealed && cell.neighborMines > 0) {
        context2d.fillStyle = getNumberColor(cell.neighborMines);
        context2d.font = `${Math.max(Math.floor(boxH * 0.52), 9)}px sans-serif`;
        context2d.textAlign = 'center';
        context2d.textBaseline = 'middle';
        context2d.fillText(String(cell.neighborMines), boxX + boxW / 2, boxY + boxH / 2);
        return;
      }

      if (!cell.revealed && getVisualState().cheatMode && cell.special) {
        context2d.fillStyle = palette.highlight;
        context2d.font = `${Math.max(Math.floor(boxH * 0.38), 8)}px sans-serif`;
        context2d.textAlign = 'center';
        context2d.textBaseline = 'middle';
        context2d.fillText(getSpecialMarker(cell.special.type), boxX + boxW / 2, boxY + boxH / 2);
      }
    }

    return {
      id: 'canvas',
      ensureFaces: ensureCubeFacesCanvas,
      layoutFaces: layoutCubeFacesCanvas,
      renderBoard: renderBoardCanvas,
      applyTransform: applyTransformCanvas,
      syncCell(cell) {
        if (!cell) return;
        drawCanvasFace(cell.face);
      },
      syncAll() {
        drawAllCanvasFaces();
      },
      getCellFromInteraction(eventOrTarget) {
        const event = eventOrTarget?.target ? eventOrTarget : null;
        const target = event?.target || eventOrTarget;
        const canvas = target?.closest?.('[data-face-canvas]');
        if (!canvas) return null;
        const face = normalizeFaceId(canvas.dataset.faceCanvas);
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const config = typeof getConfig === 'function' ? getConfig() : null;
        if (!config) return null;
        const x = event ? event.clientX - rect.left : 0;
        const y = event ? event.clientY - rect.top : 0;
        const col = clamp(Math.floor((x / rect.width) * config.cols), 0, config.cols - 1);
        const row = clamp(Math.floor((y / rect.height) * config.rows), 0, config.rows - 1);
        return getCell(face, row, col);
      },
    };
  };
})();
