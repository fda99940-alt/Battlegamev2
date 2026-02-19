(() => {
  window.MindsweeperRenderers = window.MindsweeperRenderers || {};

  const SVG_NS = 'http://www.w3.org/2000/svg';

  window.MindsweeperRenderers.createSvgRenderer = function createSvgRenderer(context) {
    const {
      cubeEl,
      getActiveFaces,
      getCell,
      getFaceCount,
      getConfig,
      getVisualState,
      layoutCubeFacesDom,
      updateWrapperSpacing,
      normalizeFaceCount,
      decorateFaceElement,
      faceId,
      normalizeFaceId,
      getNumberColor,
      getSpecialMarker,
      setFaceBoards,
    } = context;

    let faceSvgByFace = {};

    function renderBoardSvg() {
      const usePolygonCells = getFaceCount() !== 6;
      const config = getConfig();
      getActiveFaces().forEach((face) => {
        const svg = faceSvgByFace[face];
        if (!svg) return;
        svg.setAttribute('viewBox', `0 0 ${config.cols} ${config.rows}`);
        svg.innerHTML = '';
        for (let row = 0; row < config.rows; row += 1) {
          for (let col = 0; col < config.cols; col += 1) {
            const cell = getCell(face, row, col);
            if (!cell) continue;

            const group = document.createElementNS(SVG_NS, 'g');
            group.classList.add('svg-cell-group');
            group.setAttribute('data-cell-face', face);
            group.setAttribute('data-cell-row', String(row));
            group.setAttribute('data-cell-col', String(col));
            group.setAttribute('tabindex', '-1');

            const shape = document.createElementNS(SVG_NS, usePolygonCells ? 'polygon' : 'rect');
            shape.classList.add('svg-cell');
            if (usePolygonCells) {
              const inset = 0.14;
              const points = [
                [col + inset, row],
                [col + 1 - inset, row],
                [col + 1, row + inset],
                [col + 1, row + 1 - inset],
                [col + 1 - inset, row + 1],
                [col + inset, row + 1],
                [col, row + 1 - inset],
                [col, row + inset],
              ]
                .map((point) => point.join(','))
                .join(' ');
              shape.setAttribute('points', points);
            } else {
              shape.setAttribute('x', String(col + 0.06));
              shape.setAttribute('y', String(row + 0.06));
              shape.setAttribute('width', '0.88');
              shape.setAttribute('height', '0.88');
              shape.setAttribute('rx', '0.08');
              shape.setAttribute('ry', '0.08');
            }

            const label = document.createElementNS(SVG_NS, 'text');
            label.classList.add('svg-cell__value');
            label.setAttribute('x', String(col + 0.5));
            label.setAttribute('y', String(row + 0.54));

            group.appendChild(shape);
            group.appendChild(label);
            svg.appendChild(group);

            cell.element = group;
            cell.svgShape = shape;
            cell.svgValue = label;
            syncSvgCell(cell);
          }
        }
      });
      layoutCubeFacesSvg();
    }

    function applyTransformSvg() {
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
        const svg = faceSvgByFace[firstFace];
        if (svg) {
          const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
          const scaleY = specialsEnabled && flipVertical ? -1 : 1;
          const spin = specialsEnabled ? rotationAngle : 0;
          svg.style.transform = `rotate(${spin}deg) scale(${scaleX}, ${scaleY})`;
        }
        cubeEl.style.transform = 'none';
        updateWrapperSpacing(false);
        return;
      }

      if (faceSvgByFace[firstFace]) {
        faceSvgByFace[firstFace].style.transform = 'none';
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

    function ensureCubeFacesSvg(count = 6) {
      if (!cubeEl) return;
      const safeCount = normalizeFaceCount(Number(count) || 6);
      cubeEl.innerHTML = '';
      for (let i = 0; i < safeCount; i += 1) {
        const faceEl = document.createElement('div');
        faceEl.className = 'cube-face';
        faceEl.setAttribute('data-face-index', String(i));
        decorateFaceElement(faceEl, i, safeCount);

        const svgEl = document.createElementNS(SVG_NS, 'svg');
        svgEl.classList.add('board', 'board-svg');
        svgEl.setAttribute('data-face-svg', faceId(i));
        svgEl.setAttribute('data-face-board', faceId(i));
        svgEl.setAttribute('aria-label', `Face ${i + 1}`);

        faceEl.appendChild(svgEl);
        cubeEl.appendChild(faceEl);
      }

      const nextFaceBoards = Array.from(cubeEl.querySelectorAll('[data-face-svg]'));
      setFaceBoards(nextFaceBoards);

      faceSvgByFace = nextFaceBoards.reduce((acc, svg) => {
        const face = svg.dataset.faceSvg;
        if (face) {
          acc[face] = svg;
        }
        return acc;
      }, {});

      layoutCubeFacesSvg();
    }

    function layoutCubeFacesSvg() {
      layoutCubeFacesDom();
      drawAllSvgFaces();
    }

    function drawAllSvgFaces() {
      getActiveFaces().forEach((face) => drawSvgFace(face));
    }

    function drawSvgFace(face) {
      const config = getConfig();
      for (let row = 0; row < config.rows; row += 1) {
        for (let col = 0; col < config.cols; col += 1) {
          syncSvgCell(getCell(face, row, col));
        }
      }
    }

    function syncSvgCell(cell) {
      if (!cell?.svgShape || !cell?.svgValue) return;
      const shape = cell.svgShape;
      const value = cell.svgValue;
      shape.classList.remove(
        'cell--revealed',
        'cell--mine',
        'cell--flagged',
        'cell--special-rotation',
        'cell--special-flip',
        'cell--special-dog',
        'cell--special-guardian'
      );
      if (cell.revealed) {
        shape.classList.add('cell--revealed');
      }
      if (cell.isMine && cell.revealed) {
        shape.classList.add('cell--mine');
      }
      if (cell.flagged && !cell.revealed) {
        shape.classList.add('cell--flagged');
      }
      if (cell.special?.type === 'rotation') {
        shape.classList.add('cell--special-rotation');
      }
      if (cell.special?.type === 'flip') {
        shape.classList.add('cell--special-flip');
      }
      if (cell.special?.type === 'dog') {
        shape.classList.add('cell--special-dog');
      }
      if (cell.special?.type === 'guardian') {
        shape.classList.add('cell--special-guardian');
      }

      value.classList.remove('svg-cell__value--special');
      value.textContent = '';
      value.removeAttribute('fill');

      if (cell.flagged && !cell.revealed) {
        value.textContent = '⚑';
      } else if (cell.revealed && cell.isMine) {
        value.textContent = '✹';
      } else if (cell.revealed && cell.neighborMines > 0) {
        value.textContent = String(cell.neighborMines);
        value.setAttribute('fill', getNumberColor(cell.neighborMines));
      } else if (!cell.revealed && getVisualState().cheatMode && cell.special) {
        value.classList.add('svg-cell__value--special');
        value.textContent = getSpecialMarker(cell.special.type);
      }
    }

    return {
      id: 'svg',
      ensureFaces: ensureCubeFacesSvg,
      layoutFaces: layoutCubeFacesSvg,
      renderBoard: renderBoardSvg,
      applyTransform: applyTransformSvg,
      syncCell(cell) {
        syncSvgCell(cell);
      },
      syncAll() {
        drawAllSvgFaces();
      },
      getCellFromInteraction(eventOrTarget) {
        const target = eventOrTarget?.target || eventOrTarget;
        const hit = target?.closest?.('[data-cell-face]');
        if (!hit) return null;
        const face = normalizeFaceId(hit.dataset.cellFace);
        const row = Number(hit.dataset.cellRow);
        const col = Number(hit.dataset.cellCol);
        return getCell(face, row, col);
      },
    };
  };
})();
