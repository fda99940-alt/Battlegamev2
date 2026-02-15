(() => {
  const CUBE_FACE_ORIENTATION = {
    // x: right, y: down, z: toward viewer
    0: { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },   // front
    1: { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },  // right
    2: { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }, // back
    3: { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },  // left
    4: { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },  // top
    5: { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },  // bottom
  };

  function dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function pointOnFace(faceIndex, a, b) {
    const basis = CUBE_FACE_ORIENTATION[faceIndex];
    return [
      basis.n[0] + basis.u[0] * a + basis.v[0] * b,
      basis.n[1] + basis.u[1] * a + basis.v[1] * b,
      basis.n[2] + basis.u[2] * a + basis.v[2] * b,
    ];
  }

  function projectToFace(faceIndex, point) {
    const basis = CUBE_FACE_ORIENTATION[faceIndex];
    const rel = [
      point[0] - basis.n[0],
      point[1] - basis.n[1],
      point[2] - basis.n[2],
    ];
    return {
      a: dot3(rel, basis.u),
      b: dot3(rel, basis.v),
    };
  }

  function indexToCoord(index, size) {
    if (size <= 1) return 0;
    return (index / (size - 1)) * 2 - 1;
  }

  function coordToIndex(coord, size, clamp) {
    if (size <= 1) return 0;
    const normalized = ((coord + 1) / 2) * (size - 1);
    return clamp(Math.round(normalized), 0, size - 1);
  }

  function transferCubeEdge(options = {}) {
    const {
      faceIndex,
      row,
      col,
      direction,
      cubeFaceTransitions,
      rows,
      cols,
      clamp,
    } = options;

    const edgeMap = cubeFaceTransitions[faceIndex];
    if (!edgeMap || !(direction in edgeMap)) {
      return null;
    }
    const nextFace = edgeMap[direction];

    const a = direction === 'left' ? -1 : direction === 'right' ? 1 : indexToCoord(col, cols);
    const b = direction === 'up' ? -1 : direction === 'down' ? 1 : indexToCoord(row, rows);

    const point = pointOnFace(faceIndex, a, b);
    const projected = projectToFace(nextFace, point);

    return {
      faceIndex: nextFace,
      row: coordToIndex(projected.b, rows, clamp),
      col: coordToIndex(projected.a, cols, clamp),
    };
  }

  function worldPointForCell(faceIndex, row, col, rows, cols) {
    const a = indexToCoord(col, cols);
    const b = indexToCoord(row, rows);
    return pointOnFace(faceIndex, a, b);
  }

  function squaredDistance3(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const dz = a[2] - b[2];
    return dx * dx + dy * dy + dz * dz;
  }

  function moveCubeAxisWithSingleWrap(options = {}) {
    const {
      faceIndex,
      row,
      col,
      axis,
      delta,
      wrapped,
      cubeFaceTransitions,
      rows,
      cols,
      clamp,
    } = options;

    if (!delta) {
      return { faceIndex, row, col, wrapped };
    }

    if (axis === 'col') {
      const nextCol = col + delta;
      if (nextCol >= 0 && nextCol < cols) {
        return { faceIndex, row, col: nextCol, wrapped };
      }
      if (wrapped) {
        return { faceIndex, row, col: clamp(nextCol, 0, cols - 1), wrapped };
      }
      const direction = nextCol < 0 ? 'left' : 'right';
      const transferred = transferCubeEdge({
        faceIndex,
        row,
        col: nextCol < 0 ? 0 : cols - 1,
        direction,
        cubeFaceTransitions,
        rows,
        cols,
        clamp,
      });
      if (!transferred) return null;
      return {
        faceIndex: transferred.faceIndex,
        row: transferred.row,
        col: transferred.col,
        wrapped: true,
      };
    }

    const nextRow = row + delta;
    if (nextRow >= 0 && nextRow < rows) {
      return { faceIndex, row: nextRow, col, wrapped };
    }
    if (wrapped) {
      return { faceIndex, row: clamp(nextRow, 0, rows - 1), col, wrapped };
    }
    const direction = nextRow < 0 ? 'up' : 'down';
    const transferred = transferCubeEdge({
      faceIndex,
      row: nextRow < 0 ? 0 : rows - 1,
      col,
      direction,
      cubeFaceTransitions,
      rows,
      cols,
      clamp,
    });
    if (!transferred) return null;
    return {
      faceIndex: transferred.faceIndex,
      row: transferred.row,
      col: transferred.col,
      wrapped: true,
    };
  }

  function resolveCubeDiagonal(options = {}) {
    const {
      faceIndex,
      row,
      col,
      dRow,
      dCol,
      cubeFaceTransitions,
      rows,
      cols,
      clamp,
    } = options;

    const runOrder = (firstAxis) => {
      const secondAxis = firstAxis === 'row' ? 'col' : 'row';
      const firstDelta = firstAxis === 'row' ? dRow : dCol;
      const secondDelta = secondAxis === 'row' ? dRow : dCol;

      const first = moveCubeAxisWithSingleWrap({
        faceIndex,
        row,
        col,
        axis: firstAxis === 'row' ? 'row' : 'col',
        delta: firstDelta,
        wrapped: false,
        cubeFaceTransitions,
        rows,
        cols,
        clamp,
      });
      if (!first) return null;

      return moveCubeAxisWithSingleWrap({
        faceIndex: first.faceIndex,
        row: first.row,
        col: first.col,
        axis: secondAxis === 'row' ? 'row' : 'col',
        delta: secondDelta,
        wrapped: first.wrapped,
        cubeFaceTransitions,
        rows,
        cols,
        clamp,
      });
    };

    const candidates = [runOrder('row'), runOrder('col')].filter(Boolean);
    if (!candidates.length) return null;

    const stepA = cols > 1 ? 2 / (cols - 1) : 0;
    const stepB = rows > 1 ? 2 / (rows - 1) : 0;
    const sourcePoint = worldPointForCell(faceIndex, row, col, rows, cols);
    const basis = CUBE_FACE_ORIENTATION[faceIndex];
    const idealPoint = [
      sourcePoint[0] + basis.u[0] * dCol * stepA + basis.v[0] * dRow * stepB,
      sourcePoint[1] + basis.u[1] * dCol * stepA + basis.v[1] * dRow * stepB,
      sourcePoint[2] + basis.u[2] * dCol * stepA + basis.v[2] * dRow * stepB,
    ];

    let best = candidates[0];
    let bestDistance = Infinity;
    candidates.forEach((candidate) => {
      const point = worldPointForCell(candidate.faceIndex, candidate.row, candidate.col, rows, cols);
      const distance = squaredDistance3(point, idealPoint);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    });
    return best;
  }

  function resolveNeighbor(options = {}) {
    const {
      cell,
      dRow,
      dCol,
      getFaceCount,
      parseFaceIndex,
      cubeFaceTransitions,
      config,
      faceId,
      clamp,
    } = options;

    if (!cell) return null;

    const faceCount = getFaceCount();
    if (faceCount === 6) {
      let nextFaceIndex = parseFaceIndex(cell.face);
      if (!(nextFaceIndex in cubeFaceTransitions)) return null;

      if (dRow !== 0 && dCol !== 0) {
        const diagonal = resolveCubeDiagonal({
          faceIndex: nextFaceIndex,
          row: cell.row,
          col: cell.col,
          dRow,
          dCol,
          cubeFaceTransitions,
          rows: config.rows,
          cols: config.cols,
          clamp,
        });
        if (!diagonal) return null;
        return { face: faceId(diagonal.faceIndex), row: diagonal.row, col: diagonal.col };
      }

      let nextRow = cell.row;
      let nextCol = cell.col + dCol;

      if (nextCol < 0) {
        const transferred = transferCubeEdge({
          faceIndex: nextFaceIndex,
          row: nextRow,
          col: cell.col,
          direction: 'left',
          cubeFaceTransitions,
          rows: config.rows,
          cols: config.cols,
          clamp,
        });
        if (!transferred) return null;
        nextFaceIndex = transferred.faceIndex;
        nextRow = transferred.row;
        nextCol = transferred.col;
      } else if (nextCol >= config.cols) {
        const transferred = transferCubeEdge({
          faceIndex: nextFaceIndex,
          row: nextRow,
          col: cell.col,
          direction: 'right',
          cubeFaceTransitions,
          rows: config.rows,
          cols: config.cols,
          clamp,
        });
        if (!transferred) return null;
        nextFaceIndex = transferred.faceIndex;
        nextRow = transferred.row;
        nextCol = transferred.col;
      }

      nextRow += dRow;
      if (nextRow < 0) {
        const transferred = transferCubeEdge({
          faceIndex: nextFaceIndex,
          row: 0,
          col: nextCol,
          direction: 'up',
          cubeFaceTransitions,
          rows: config.rows,
          cols: config.cols,
          clamp,
        });
        if (!transferred) return null;
        nextFaceIndex = transferred.faceIndex;
        nextRow = transferred.row;
        nextCol = transferred.col;
      } else if (nextRow >= config.rows) {
        const transferred = transferCubeEdge({
          faceIndex: nextFaceIndex,
          row: config.rows - 1,
          col: nextCol,
          direction: 'down',
          cubeFaceTransitions,
          rows: config.rows,
          cols: config.cols,
          clamp,
        });
        if (!transferred) return null;
        nextFaceIndex = transferred.faceIndex;
        nextRow = transferred.row;
        nextCol = transferred.col;
      }

      return { face: faceId(nextFaceIndex), row: nextRow, col: nextCol };
    }

    const index = parseFaceIndex(cell.face);
    if (index < 0 || faceCount <= 0) return null;

    let nextIndex = index;
    let nextCol = cell.col + dCol;
    if (nextCol < 0) {
      nextIndex = (index - 1 + faceCount) % faceCount;
      nextCol = config.cols - 1;
    } else if (nextCol >= config.cols) {
      nextIndex = (index + 1) % faceCount;
      nextCol = 0;
    }

    const nextRow = clamp(cell.row + dRow, 0, config.rows - 1);
    return { face: faceId(nextIndex), row: nextRow, col: nextCol };
  }

  function getNeighbors(options = {}) {
    const {
      cell,
      boardMode,
      neighbors,
      getActiveFaces,
      getCell,
      resolveNeighbor,
    } = options;

    const firstFace = getActiveFaces()[0];
    if (boardMode === '2d') {
      return neighbors.reduce((acc, [dRow, dCol]) => {
        const neighbor = getCell(firstFace, cell.row + dRow, cell.col + dCol);
        if (neighbor && neighbor !== cell) {
          acc.push(neighbor);
        }
        return acc;
      }, []);
    }

    const seen = new Set();
    return neighbors.reduce((acc, [dRow, dCol]) => {
      const target = resolveNeighbor(cell, dRow, dCol);
      if (target) {
        const neighbor = getCell(target.face, target.row, target.col);
        if (neighbor && neighbor !== cell) {
          const key = `${target.face}:${target.row}:${target.col}`;
          if (!seen.has(key)) {
            seen.add(key);
            acc.push(neighbor);
          }
        }
      }
      return acc;
    }, []);
  }

  window.MindsweeperBoardTopology = {
    resolveNeighbor,
    getNeighbors,
  };
})();
