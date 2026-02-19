(() => {
  window.MindsweeperRenderers = window.MindsweeperRenderers || {};

  window.MindsweeperRenderers.isWebglSupported = function isWebglSupported() {
    try {
      const probe = document.createElement('canvas');
      return Boolean(probe.getContext('webgl'));
    } catch (error) {
      return false;
    }
  };

  window.MindsweeperRenderers.createWebglRenderer = function createWebglRenderer(context) {
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
      clamp,
      normalizeFaceId,
      setFaceBoards,
      getConfig,
      getVisualState,
    } = context;

    let faceWebglByFace = {};
    let faceWebglOverlayByFace = {};
    let webglStateByFace = {};

    function disposeWebglState(state) {
      if (!state?.gl) return;
      const { gl, program, buffer } = state;
      try {
        if (buffer) gl.deleteBuffer(buffer);
      } catch (_error) {}
      try {
        if (program) gl.deleteProgram(program);
      } catch (_error) {}
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext?.();
      } catch (_error) {}
    }

    function disposeAllWebglState() {
      Object.values(webglStateByFace).forEach((state) => disposeWebglState(state));
      webglStateByFace = {};
    }

    function renderBoardWebgl() {
      forEachCell((cell) => {
        cell.element = null;
        cell.svgShape = null;
        cell.svgValue = null;
        cell.webglLabel = null;
      });
      getActiveFaces().forEach((face) => {
        const overlay = faceWebglOverlayByFace[face];
        if (!overlay) return;
        overlay.innerHTML = '';
        const config = getConfig();
        overlay.style.gridTemplateColumns = `repeat(${config.cols}, minmax(0, 1fr))`;
        overlay.style.gridTemplateRows = `repeat(${config.rows}, minmax(0, 1fr))`;
        for (let row = 0; row < config.rows; row += 1) {
          for (let col = 0; col < config.cols; col += 1) {
            const cell = getCell(face, row, col);
            if (!cell) continue;
            const labelEl = document.createElement('span');
            labelEl.className = 'webgl-cell-label';
            labelEl.setAttribute('data-webgl-cell-face', face);
            labelEl.setAttribute('data-webgl-cell-row', String(row));
            labelEl.setAttribute('data-webgl-cell-col', String(col));
            overlay.appendChild(labelEl);
            cell.webglLabel = labelEl;
            syncWebglOverlayCell(cell);
          }
        }
      });
      layoutCubeFacesWebgl();
      drawAllWebglFaces();
    }

    function applyTransformWebgl() {
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
        const canvas = faceWebglByFace[firstFace];
        const overlay = faceWebglOverlayByFace[firstFace];
        if (canvas) {
          const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
          const scaleY = specialsEnabled && flipVertical ? -1 : 1;
          const spin = specialsEnabled ? rotationAngle : 0;
          canvas.style.transform = `rotate(${spin}deg) scale(${scaleX}, ${scaleY})`;
          if (overlay) {
            overlay.style.transform = `rotate(${spin}deg) scale(${scaleX}, ${scaleY})`;
          }
        }
        cubeEl.style.transform = 'none';
        updateWrapperSpacing(false);
        return;
      }

      if (faceWebglByFace[firstFace]) {
        faceWebglByFace[firstFace].style.transform = 'none';
      }
      if (faceWebglOverlayByFace[firstFace]) {
        faceWebglOverlayByFace[firstFace].style.transform = 'none';
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

    function ensureCubeFacesWebgl(count = 6) {
      if (!cubeEl) return;
      const safeCount = normalizeFaceCount(Number(count) || 6);
      disposeAllWebglState();
      cubeEl.innerHTML = '';
      for (let i = 0; i < safeCount; i += 1) {
        const faceEl = document.createElement('div');
        faceEl.className = 'cube-face';
        faceEl.setAttribute('data-face-index', String(i));
        decorateFaceElement(faceEl, i, safeCount);

        const canvasEl = document.createElement('canvas');
        canvasEl.className = 'board board-webgl';
        canvasEl.setAttribute('data-face-webgl', faceId(i));
        canvasEl.setAttribute('data-face-board', faceId(i));
        canvasEl.setAttribute('role', 'img');
        canvasEl.setAttribute('aria-label', `Face ${i + 1}`);

        const overlayEl = document.createElement('div');
        overlayEl.className = 'board-webgl-overlay';
        overlayEl.setAttribute('data-face-webgl-overlay', faceId(i));

        faceEl.appendChild(canvasEl);
        faceEl.appendChild(overlayEl);
        cubeEl.appendChild(faceEl);
      }

      const nextFaceBoards = Array.from(cubeEl.querySelectorAll('[data-face-webgl]'));
      setFaceBoards(nextFaceBoards);

      faceWebglByFace = nextFaceBoards.reduce((acc, canvas) => {
        const face = canvas.dataset.faceWebgl;
        if (face) {
          acc[face] = canvas;
        }
        return acc;
      }, {});

      faceWebglOverlayByFace = Array.from(cubeEl.querySelectorAll('[data-face-webgl-overlay]')).reduce((acc, overlay) => {
        const face = overlay.dataset.faceWebglOverlay;
        if (face) {
          acc[face] = overlay;
        }
        return acc;
      }, {});

      layoutCubeFacesWebgl();
    }

    function layoutCubeFacesWebgl() {
      layoutCubeFacesDom();
      resizeWebglFaces();
      drawAllWebglFaces();
    }

    function resizeWebglFaces() {
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 1);
      Object.entries(faceWebglByFace).forEach(([face, canvas]) => {
        const width = Math.max(Math.floor(canvas.clientWidth * pixelRatio), 1);
        const height = Math.max(Math.floor(canvas.clientHeight * pixelRatio), 1);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          const state = webglStateByFace[face];
          if (state?.gl) {
            state.gl.viewport(0, 0, width, height);
          }
        }
      });
    }

    function drawAllWebglFaces() {
      getActiveFaces().forEach((face) => drawWebglFace(face));
    }

    function syncWebglOverlayCell(cell) {
      if (!cell?.webglLabel) return;
      const label = cell.webglLabel;
      label.textContent = '';
      label.style.color = '';
      label.classList.remove(
        'webgl-cell-label--covered',
        'webgl-cell-label--revealed',
        'webgl-cell-label--flagged',
        'webgl-cell-label--mine',
        'webgl-cell-label--special'
      );
      if (cell.revealed) {
        label.classList.add('webgl-cell-label--revealed');
      } else {
        label.classList.add('webgl-cell-label--covered');
      }
      if (cell.flagged && !cell.revealed) {
        label.classList.add('webgl-cell-label--flagged');
        label.textContent = '⚑';
        return;
      }
      if (cell.revealed && cell.isMine) {
        label.classList.add('webgl-cell-label--mine');
        label.textContent = '✹';
        return;
      }
      if (cell.revealed && cell.neighborMines > 0) {
        label.textContent = String(cell.neighborMines);
        label.style.color = getNumberColor(cell.neighborMines);
        return;
      }
      if (!cell.revealed && getVisualState().cheatMode && cell.special) {
        label.classList.add('webgl-cell-label--special');
        label.textContent = getSpecialMarker(cell.special.type);
      }
    }

    function createWebglState(canvas) {
      const gl = canvas.getContext('webgl', { antialias: false, depth: false, stencil: false, alpha: true });
      if (!gl) return null;

      const vertexSource = `
        attribute vec2 aPosition;
        attribute vec4 aColor;
        varying vec4 vColor;
        void main() {
          gl_Position = vec4(aPosition, 0.0, 1.0);
          vColor = aColor;
        }
      `;
      const fragmentSource = `
        precision mediump float;
        varying vec4 vColor;
        void main() {
          gl_FragColor = vColor;
        }
      `;

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!vertexShader || !fragmentShader) return null;

      gl.shaderSource(vertexShader, vertexSource);
      gl.shaderSource(fragmentShader, fragmentSource);
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) return null;
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) return null;

      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      const buffer = gl.createBuffer();
      if (!buffer) return null;
      const aPosition = gl.getAttribLocation(program, 'aPosition');
      const aColor = gl.getAttribLocation(program, 'aColor');
      if (aPosition < 0 || aColor < 0) return null;

      return { gl, program, buffer, aPosition, aColor };
    }

    function getWebglState(face) {
      if (webglStateByFace[face]) return webglStateByFace[face];
      const canvas = faceWebglByFace[face];
      if (!canvas) return null;
      const state = createWebglState(canvas);
      if (!state) return null;
      webglStateByFace[face] = state;
      return state;
    }

    function drawWebglFace(face) {
      const state = getWebglState(face);
      const canvas = faceWebglByFace[face];
      if (!state || !canvas) return;
      const { gl, program, buffer, aPosition, aColor } = state;

      gl.viewport(0, 0, canvas.width, canvas.height);
      const palette = getWebglPalette();
      gl.clearColor(
        palette.boardSurface[0],
        palette.boardSurface[1],
        palette.boardSurface[2],
        palette.boardSurface[3]
      );
      gl.clear(gl.COLOR_BUFFER_BIT);

      const vertices = [];
      const config = getConfig();
      const cols = Math.max(config.cols, 1);
      const rows = Math.max(config.rows, 1);
      const insetX = 0.06 / cols;
      const insetY = 0.06 / rows;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const cell = getCell(face, row, col);
          if (!cell) continue;
          const left = (col / cols) * 2 - 1 + insetX * 2;
          const right = ((col + 1) / cols) * 2 - 1 - insetX * 2;
          const top = 1 - (row / rows) * 2 - insetY * 2;
          const bottom = 1 - ((row + 1) / rows) * 2 + insetY * 2;
          const color = getWebglCellColor(cell, palette);
          pushWebglRect(vertices, left, top, right, bottom, color);
        }
      }

      if (!vertices.length) return;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

      const stride = 6 * 4;
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, stride, 2 * 4);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
    }

    function pushWebglRect(vertices, left, top, right, bottom, color) {
      const [r, g, b, a] = color;
      vertices.push(left, top, r, g, b, a);
      vertices.push(right, top, r, g, b, a);
      vertices.push(right, bottom, r, g, b, a);
      vertices.push(left, top, r, g, b, a);
      vertices.push(right, bottom, r, g, b, a);
      vertices.push(left, bottom, r, g, b, a);
    }

    function parseCssColorToRgba(value, fallback = [1, 1, 1, 1]) {
      const text = String(value || '').trim();
      if (!text) return fallback;
      if (text.startsWith('#')) {
        const hex = text.slice(1);
        if (hex.length === 3 || hex.length === 4) {
          const r = parseInt(hex[0] + hex[0], 16) / 255;
          const g = parseInt(hex[1] + hex[1], 16) / 255;
          const b = parseInt(hex[2] + hex[2], 16) / 255;
          const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
          return [r, g, b, a];
        }
        if (hex.length === 6 || hex.length === 8) {
          const r = parseInt(hex.slice(0, 2), 16) / 255;
          const g = parseInt(hex.slice(2, 4), 16) / 255;
          const b = parseInt(hex.slice(4, 6), 16) / 255;
          const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
          return [r, g, b, a];
        }
      }
      const rgbaMatch = text.match(/^rgba?\(([^)]+)\)$/i);
      if (rgbaMatch) {
        const parts = rgbaMatch[1].split(',').map((part) => part.trim());
        if (parts.length >= 3) {
          const r = clamp(Number(parts[0]) / 255, 0, 1);
          const g = clamp(Number(parts[1]) / 255, 0, 1);
          const b = clamp(Number(parts[2]) / 255, 0, 1);
          const a = parts.length > 3 ? clamp(Number(parts[3]), 0, 1) : 1;
          return [r, g, b, a];
        }
      }
      return fallback;
    }

    function getWebglPalette() {
      const rootStyles = getComputedStyle(document.documentElement);
      return {
        boardSurface: parseCssColorToRgba(rootStyles.getPropertyValue('--board-surface'), [0.02, 0.03, 0.06, 1]),
        hidden: parseCssColorToRgba(rootStyles.getPropertyValue('--panel-surface'), [0.12, 0.12, 0.14, 1]),
        revealed: parseCssColorToRgba(rootStyles.getPropertyValue('--cell-revealed-bg'), [0.3, 0.3, 0.35, 1]),
        mine: parseCssColorToRgba(rootStyles.getPropertyValue('--danger'), [1, 0.3, 0.3, 1]),
        accent: parseCssColorToRgba(rootStyles.getPropertyValue('--accent'), [0.35, 0.95, 0.78, 1]),
        highlight: parseCssColorToRgba(rootStyles.getPropertyValue('--highlight'), [0.22, 0.93, 1, 1]),
      };
    }

    function getWebglCellColor(cell, palette) {
      if (!cell) return palette.hidden;
      if (cell.revealed && cell.isMine) return palette.mine;
      if (cell.flagged && !cell.revealed) return [palette.accent[0], palette.accent[1], palette.accent[2], 0.65];
      if (cell.revealed) return palette.revealed;
      if (getVisualState().cheatMode && cell.special) {
        return [palette.highlight[0], palette.highlight[1], palette.highlight[2], 0.55];
      }
      return palette.hidden;
    }

    return {
      id: 'webgl',
      dispose() {
        disposeAllWebglState();
      },
      ensureFaces: ensureCubeFacesWebgl,
      layoutFaces: layoutCubeFacesWebgl,
      renderBoard: renderBoardWebgl,
      applyTransform: applyTransformWebgl,
      syncCell(cell) {
        if (!cell) return;
        syncWebglOverlayCell(cell);
        drawWebglFace(cell.face);
      },
      syncAll() {
        forEachCell((cell) => syncWebglOverlayCell(cell));
        drawAllWebglFaces();
      },
      getCellFromInteraction(eventOrTarget) {
        const target = eventOrTarget?.target || eventOrTarget;
        const hit = target?.closest?.('[data-webgl-cell-face]');
        if (!hit) return null;
        const face = normalizeFaceId(hit.dataset.webglCellFace);
        const row = Number(hit.dataset.webglCellRow);
        const col = Number(hit.dataset.webglCellCol);
        return getCell(face, row, col);
      },
    };
  };
})();
