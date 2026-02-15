(() => {
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
      let nextFace = parseFaceIndex(cell.face);
      if (!(nextFace in cubeFaceTransitions)) return null;
      let nextRow = cell.row + dRow;
      let nextCol = cell.col + dCol;

      if (nextCol < 0) {
        nextFace = cubeFaceTransitions[nextFace].left;
        nextCol = config.cols - 1;
      } else if (nextCol >= config.cols) {
        nextFace = cubeFaceTransitions[nextFace].right;
        nextCol = 0;
      }

      if (nextRow < 0) {
        nextFace = cubeFaceTransitions[nextFace].up;
        nextRow = config.rows - 1;
      } else if (nextRow >= config.rows) {
        nextFace = cubeFaceTransitions[nextFace].down;
        nextRow = 0;
      }

      return { face: faceId(nextFace), row: nextRow, col: nextCol };
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
