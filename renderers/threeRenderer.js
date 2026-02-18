(() => {
  window.MindsweeperRenderers = window.MindsweeperRenderers || {};

  window.MindsweeperRenderers.isThreeSupported = function isThreeSupported() {
    try {
      if (!window.THREE) return false;
      const probe = document.createElement('canvas');
      return Boolean(probe.getContext('webgl'));
    } catch (error) {
      return false;
    }
  };

  window.MindsweeperRenderers.createThreeRenderer = function createThreeRenderer(context) {
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

    let faceCanvasByFace = {};
    let faceOverlayByFace = {};
    let threeStateByFace = {};

    function renderBoardThree() {
      forEachCell((cell) => {
        cell.element = null;
        cell.svgShape = null;
        cell.svgValue = null;
        cell.webglLabel = null;
        cell.threeLabel = null;
      });

      getActiveFaces().forEach((face) => {
        const overlay = faceOverlayByFace[face];
        if (!overlay) return;
        overlay.innerHTML = '';
        const config = getConfig();
        overlay.style.gridTemplateColumns = `repeat(${config.cols}, minmax(0, 1fr))`;
        for (let row = 0; row < config.rows; row += 1) {
          for (let col = 0; col < config.cols; col += 1) {
            const cell = getCell(face, row, col);
            if (!cell) continue;
            const labelEl = document.createElement('span');
            labelEl.className = 'three-cell-label';
            labelEl.setAttribute('data-three-cell-face', face);
            labelEl.setAttribute('data-three-cell-row', String(row));
            labelEl.setAttribute('data-three-cell-col', String(col));
            overlay.appendChild(labelEl);
            cell.threeLabel = labelEl;
            syncThreeOverlayCell(cell);
          }
        }
      });

      layoutCubeFacesThree();
      drawAllThreeFaces();
    }

    function applyTransformThree() {
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
        const overlay = faceOverlayByFace[firstFace];
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

      if (faceCanvasByFace[firstFace]) {
        faceCanvasByFace[firstFace].style.transform = 'none';
      }
      if (faceOverlayByFace[firstFace]) {
        faceOverlayByFace[firstFace].style.transform = 'none';
      }

      const scaleX = specialsEnabled && flipHorizontal ? -1 : 1;
      const scaleY = specialsEnabled && flipVertical ? -1 : 1;
      const spinY = specialsEnabled ? rotationAngle : 0;
      const zoomDistance = (cubeZoom - 1) * Math.max(cubeEl.clientWidth * 0.75, 240);
      cubeEl.style.transform = `translateZ(${zoomDistance}px) rotateX(${cubePitch}deg) rotateY(${cubeYaw + spinY}deg) scale(${scaleX}, ${scaleY})`;
      updateWrapperSpacing(false);
    }

    function disposeThreeState(state) {
      if (!state) return;
      try {
        state.geometry?.dispose?.();
      } catch (_error) {}
      try {
        state.material?.dispose?.();
      } catch (_error) {}
      try {
        state.renderer?.dispose?.();
      } catch (_error) {}
      try {
        state.renderer?.forceContextLoss?.();
      } catch (_error) {}
    }

    function disposeAllThreeState() {
      Object.values(threeStateByFace).forEach((state) => disposeThreeState(state));
      threeStateByFace = {};
    }

    function ensureCubeFacesThree(count = 6) {
      if (!cubeEl) return;
      const safeCount = normalizeFaceCount(Number(count) || 6);
      disposeAllThreeState();
      cubeEl.innerHTML = '';

      for (let i = 0; i < safeCount; i += 1) {
        const faceEl = document.createElement('div');
        faceEl.className = 'cube-face';
        faceEl.setAttribute('data-face-index', String(i));
        decorateFaceElement(faceEl, i, safeCount);

        const canvasEl = document.createElement('canvas');
        canvasEl.className = 'board board-three';
        canvasEl.setAttribute('data-face-three', faceId(i));
        canvasEl.setAttribute('data-face-board', faceId(i));
        canvasEl.setAttribute('role', 'img');
        canvasEl.setAttribute('aria-label', `Face ${i + 1}`);

        const overlayEl = document.createElement('div');
        overlayEl.className = 'board-three-overlay';
        overlayEl.setAttribute('data-face-three-overlay', faceId(i));

        faceEl.appendChild(canvasEl);
        faceEl.appendChild(overlayEl);
        cubeEl.appendChild(faceEl);
      }

      const nextFaceBoards = Array.from(cubeEl.querySelectorAll('[data-face-three]'));
      setFaceBoards(nextFaceBoards);

      faceCanvasByFace = nextFaceBoards.reduce((acc, canvas) => {
        const face = canvas.dataset.faceThree;
        if (face) {
          acc[face] = canvas;
        }
        return acc;
      }, {});

      faceOverlayByFace = Array.from(cubeEl.querySelectorAll('[data-face-three-overlay]')).reduce((acc, overlay) => {
        const face = overlay.dataset.faceThreeOverlay;
        if (face) {
          acc[face] = overlay;
        }
        return acc;
      }, {});

      layoutCubeFacesThree();
    }

    function layoutCubeFacesThree() {
      layoutCubeFacesDom();
      resizeThreeFaces();
      drawAllThreeFaces();
    }

    function resizeThreeFaces() {
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 1);
      Object.entries(faceCanvasByFace).forEach(([face, canvas]) => {
        const width = Math.max(Math.floor(canvas.clientWidth * pixelRatio), 1);
        const height = Math.max(Math.floor(canvas.clientHeight * pixelRatio), 1);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          const state = threeStateByFace[face];
          if (state?.renderer) {
            state.renderer.setSize(width, height, false);
          }
        }
      });
    }

    function drawAllThreeFaces() {
      getActiveFaces().forEach((face) => drawThreeFace(face));
    }

    function syncThreeOverlayCell(cell) {
      if (!cell?.threeLabel) return;
      const label = cell.threeLabel;
      label.textContent = '';
      label.style.color = '';
      label.classList.remove(
        'three-cell-label--covered',
        'three-cell-label--revealed',
        'three-cell-label--flagged',
        'three-cell-label--mine',
        'three-cell-label--special'
      );
      if (cell.revealed) {
        label.classList.add('three-cell-label--revealed');
      } else {
        label.classList.add('three-cell-label--covered');
      }
      if (cell.flagged && !cell.revealed) {
        label.classList.add('three-cell-label--flagged');
        label.textContent = '⚑';
        return;
      }
      if (cell.revealed && cell.isMine) {
        label.classList.add('three-cell-label--mine');
        label.textContent = '✹';
        return;
      }
      if (cell.revealed && cell.neighborMines > 0) {
        label.textContent = String(cell.neighborMines);
        label.style.color = getNumberColor(cell.neighborMines);
        return;
      }
      if (!cell.revealed && getVisualState().cheatMode && cell.special) {
        label.classList.add('three-cell-label--special');
        label.textContent = getSpecialMarker(cell.special.type);
      }
    }

    function createThreeState(canvas) {
      const THREE = window.THREE;
      if (!THREE) return null;
      try {
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          depth: false,
          stencil: false,
        });
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1, 1);
        camera.position.z = 1;

        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshBasicMaterial({ vertexColors: true });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        return { renderer, scene, camera, geometry, material, mesh };
      } catch (error) {
        return null;
      }
    }

    function getThreeState(face) {
      if (threeStateByFace[face]) return threeStateByFace[face];
      const canvas = faceCanvasByFace[face];
      if (!canvas) return null;
      const state = createThreeState(canvas);
      if (!state) return null;
      state.renderer.setSize(Math.max(canvas.width, 1), Math.max(canvas.height, 1), false);
      threeStateByFace[face] = state;
      return state;
    }

    function blendOver(base, color) {
      const alpha = clamp(Number(color?.[3] ?? 1), 0, 1);
      return [
        base[0] * (1 - alpha) + color[0] * alpha,
        base[1] * (1 - alpha) + color[1] * alpha,
        base[2] * (1 - alpha) + color[2] * alpha,
      ];
    }

    function drawThreeFace(face) {
      const state = getThreeState(face);
      const canvas = faceCanvasByFace[face];
      if (!state || !canvas) return;
      const { renderer, scene, camera, geometry } = state;
      const palette = getThreePalette();

      camera.left = 0;
      camera.right = Math.max(getConfig().cols, 1);
      camera.top = 0;
      camera.bottom = Math.max(getConfig().rows, 1);
      camera.updateProjectionMatrix();

      renderer.setClearColor(
        (palette.boardSurface?.[0] ?? 0.03),
        (palette.boardSurface?.[1] ?? 0.04),
        (palette.boardSurface?.[2] ?? 0.08),
        1
      );
      renderer.clear();

      const config = getConfig();
      const cols = Math.max(config.cols, 1);
      const rows = Math.max(config.rows, 1);
      const inset = 0.06;
      const vertices = [];
      const colors = [];

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const cell = getCell(face, row, col);
          if (!cell) continue;
          const left = col + inset;
          const right = col + 1 - inset;
          const top = row + inset;
          const bottom = row + 1 - inset;
          const color = getThreeCellColor(cell, palette);
          pushThreeRect(vertices, colors, left, top, right, bottom, color);
        }
      }

      geometry.setAttribute('position', new window.THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new window.THREE.Float32BufferAttribute(colors, 3));
      geometry.computeBoundingSphere();
      renderer.render(scene, camera);
    }

    function pushThreeRect(vertices, colors, left, top, right, bottom, color) {
      const [r, g, b] = color;
      vertices.push(left, top, 0, right, top, 0, right, bottom, 0, left, top, 0, right, bottom, 0, left, bottom, 0);
      for (let i = 0; i < 6; i += 1) {
        colors.push(r, g, b);
      }
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

    function getThreePalette() {
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

    function getThreeCellColor(cell, palette) {
      const boardSurface = palette.boardSurface || [0, 0, 0, 1];
      if (!cell) return blendOver(boardSurface, palette.hidden);
      if (cell.revealed && cell.isMine) return blendOver(boardSurface, palette.mine);
      if (cell.flagged && !cell.revealed) {
        return blendOver(boardSurface, [palette.accent[0], palette.accent[1], palette.accent[2], 0.65]);
      }
      if (cell.revealed) return blendOver(boardSurface, palette.revealed);
      if (getVisualState().cheatMode && cell.special) {
        return blendOver(boardSurface, [palette.highlight[0], palette.highlight[1], palette.highlight[2], 0.55]);
      }
      return blendOver(boardSurface, palette.hidden);
    }

    return {
      id: 'three',
      ensureFaces: ensureCubeFacesThree,
      layoutFaces: layoutCubeFacesThree,
      renderBoard: renderBoardThree,
      applyTransform: applyTransformThree,
      syncCell(cell) {
        if (!cell) return;
        syncThreeOverlayCell(cell);
        drawThreeFace(cell.face);
      },
      syncAll() {
        forEachCell((cell) => syncThreeOverlayCell(cell));
        drawAllThreeFaces();
      },
      getCellFromInteraction(eventOrTarget) {
        const target = eventOrTarget?.target || eventOrTarget;
        const hit = target?.closest?.('[data-three-cell-face]');
        if (!hit) return null;
        const face = normalizeFaceId(hit.dataset.threeCellFace);
        const row = Number(hit.dataset.threeCellRow);
        const col = Number(hit.dataset.threeCellCol);
        return getCell(face, row, col);
      },
    };
  };
})();
