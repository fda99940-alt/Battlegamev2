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
        overlay.style.gridTemplateRows = `repeat(${config.rows}, minmax(0, 1fr))`;
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
      const zoomDistance = cubeZoom >= 1
        ? (cubeZoom - 1) * Math.max(cubeEl.clientWidth * 0.65, 260)
        : -(1 - cubeZoom) * Math.max(cubeEl.clientWidth * 2.4, 900);
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
        label.textContent = '🔥';
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
        const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: 2 });
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

    function mixRgb(base, tint, amount) {
      const ratio = clamp(Number(amount) || 0, 0, 1);
      return [
        base[0] * (1 - ratio) + tint[0] * ratio,
        base[1] * (1 - ratio) + tint[1] * ratio,
        base[2] * (1 - ratio) + tint[2] * ratio,
      ];
    }

    function toFaceIndex(face) {
      const text = String(face || '');
      const match = text.match(/\d+/);
      return match ? Number(match[0]) || 0 : 0;
    }

    function hashNoise(faceIndex, x, y) {
      const seed = Math.sin((faceIndex + 1) * 12.9898 + x * 78.233 + y * 37.719) * 43758.5453;
      return seed - Math.floor(seed);
    }

    function applyMetalTexture(baseColor, face, x, y, strength = 0.2) {
      const faceIndex = toFaceIndex(face);
      const waveA = Math.sin(x * 1.6 + y * 0.95 + faceIndex * 0.5) * 0.5 + 0.5;
      const waveB = Math.sin(x * 5.2 - y * 3.6 + faceIndex * 1.1) * 0.5 + 0.5;
      const noise = hashNoise(faceIndex, x * 2.7, y * 2.7);
      const grain = clamp(0.2 + waveA * 0.45 + waveB * 0.25 + noise * 0.2, 0, 1);
      const brushedDark = [0.2, 0.22, 0.26];
      const brushedMid = [0.48, 0.5, 0.55];
      const brushedHot = [0.72, 0.74, 0.78];
      let metal = mixRgb(brushedDark, brushedMid, grain);
      metal = mixRgb(metal, brushedHot, clamp(waveB > 0.9 ? 0.4 : 0.08, 0, 0.5));
      const mix = clamp(strength * (0.4 + grain * 0.45), 0, 0.62);
      const toned = mixRgb(baseColor, metal, mix);
      const shadow = clamp((1 - grain) * strength * 0.16, 0, 0.14);
      return [
        clamp(toned[0] * (1 - shadow), 0, 1),
        clamp(toned[1] * (1 - shadow), 0, 1),
        clamp(toned[2] * (1 - shadow), 0, 1),
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
      const inset = 0.015;
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
          const style = getThreeCellStyle(cell, palette, face, row, col);
          pushThreeSubdividedRect(vertices, colors, left, top, right, bottom, 3, (sampleX, sampleY) =>
            applyMetalTexture(style.baseColor, face, sampleX, sampleY, style.textureStrength)
          );
          pushThreeEdgeGlow(vertices, colors, left, top, right, bottom, style.edgeColor, style.edgeStrength);
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

    function pushThreeRectGradient(vertices, colors, left, top, right, bottom, cTL, cTR, cBR, cBL) {
      vertices.push(left, top, 0, right, top, 0, right, bottom, 0, left, top, 0, right, bottom, 0, left, bottom, 0);
      colors.push(
        cTL[0], cTL[1], cTL[2],
        cTR[0], cTR[1], cTR[2],
        cBR[0], cBR[1], cBR[2],
        cTL[0], cTL[1], cTL[2],
        cBR[0], cBR[1], cBR[2],
        cBL[0], cBL[1], cBL[2]
      );
    }

    function pushThreeSubdividedRect(vertices, colors, left, top, right, bottom, subdivisions = 3, sampleColor) {
      const steps = Math.max(1, Math.floor(subdivisions));
      const width = right - left;
      const height = bottom - top;
      for (let sy = 0; sy < steps; sy += 1) {
        for (let sx = 0; sx < steps; sx += 1) {
          const x0 = left + (sx / steps) * width;
          const y0 = top + (sy / steps) * height;
          const x1 = left + ((sx + 1) / steps) * width;
          const y1 = top + ((sy + 1) / steps) * height;
          const cTL = sampleColor(x0, y0);
          const cTR = sampleColor(x1, y0);
          const cBR = sampleColor(x1, y1);
          const cBL = sampleColor(x0, y1);
          pushThreeRectGradient(vertices, colors, x0, y0, x1, y1, cTL, cTR, cBR, cBL);
        }
      }
    }

    function pushThreeEdgeGlow(vertices, colors, left, top, right, bottom, edgeColor, edgeStrength = 0) {
      const strength = clamp(edgeStrength, 0, 1);
      if (strength <= 0.01) return;
      const thickness = 0.04;
      const [r, g, b] = mixRgb([0, 0, 0], edgeColor, strength);
      const push = (x1, y1, x2, y2) => pushThreeRect(vertices, colors, x1, y1, x2, y2, [r, g, b]);
      push(left, top, right, Math.min(top + thickness, bottom));
      push(left, Math.max(bottom - thickness, top), right, bottom);
      push(left, top + thickness, Math.min(left + thickness, right), Math.max(bottom - thickness, top + thickness));
      push(Math.max(right - thickness, left), top + thickness, right, Math.max(bottom - thickness, top + thickness));
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

    function getThreeCellStyle(cell, palette, face, row, col) {
      const boardSurface = palette.boardSurface || [0, 0, 0, 1];
      const activeTheme = document.documentElement.getAttribute('data-theme') || '';
      const steelBoost = activeTheme === 'midnight' ? 1.08 : 1;
      const steelHiddenBase = blendOver(boardSurface, [0.04, 0.045, 0.055, 0.92]);
      const steelRevealedBase = blendOver(boardSurface, [0.48, 0.5, 0.55, 0.76]);
      const steelMineBase = blendOver(boardSurface, [0.72, 0.22, 0.2, 0.84]);
      const steelSpecialBase = blendOver(boardSurface, [0.4, 0.46, 0.56, 0.74]);
      const edgeBase = [0.66, 0.69, 0.74];

      if (!cell) {
        return {
          baseColor: steelHiddenBase,
          textureStrength: 0.22 * steelBoost,
          edgeColor: [0.3, 0.34, 0.42],
          edgeStrength: 0.1,
        };
      }
      if (cell.revealed && cell.isMine) {
        return {
          baseColor: steelMineBase,
          textureStrength: 0.34 * steelBoost,
          edgeColor: [0.9, 0.35, 0.32],
          edgeStrength: 0.2,
        };
      }
      if (cell.flagged && !cell.revealed) {
        return {
          baseColor: blendOver(boardSurface, [0.38, 0.42, 0.5, 0.78]),
          textureStrength: 0.24 * steelBoost,
          edgeColor: [0.8, 0.84, 0.92],
          edgeStrength: 0.2,
        };
      }
      if (cell.revealed) {
        return {
          baseColor: steelRevealedBase,
          textureStrength: 0.2 * steelBoost,
          edgeColor: [0.76, 0.8, 0.86],
          edgeStrength: 0.12,
        };
      }
      if (getVisualState().cheatMode && cell.special) {
        return {
          baseColor: steelSpecialBase,
          textureStrength: 0.28 * steelBoost,
          edgeColor: [0.9, 0.94, 1],
          edgeStrength: 0.16,
        };
      }
      return {
        baseColor: steelHiddenBase,
        textureStrength: 0.26 * steelBoost,
        edgeColor: [0.34, 0.38, 0.46],
        edgeStrength: 0.12,
      };
    }

    return {
      id: 'three',
      dispose() {
        disposeAllThreeState();
      },
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
