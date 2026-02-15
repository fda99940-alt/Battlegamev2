(() => {
  function createGrid(options = {}) {
    const {
      rows,
      cols,
      getActiveFaces,
    } = options;

    return getActiveFaces().reduce((acc, face) => {
      acc[face] = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({
          face,
          row,
          col,
          isMine: false,
          neighborMines: 0,
          special: null,
          revealed: false,
          flagged: false,
          element: null,
        }))
      );
      return acc;
    }, {});
  }

  function placeMines(options = {}) {
    const {
      count,
      rng = Math.random,
      config,
      getActiveFaces,
      getCell,
      shuffle,
    } = options;

    const cells = [];
    getActiveFaces().forEach((face) => {
      for (let row = 0; row < config.rows; row += 1) {
        for (let col = 0; col < config.cols; col += 1) {
          cells.push({ face, row, col });
        }
      }
    });

    shuffle(cells, rng);
    const selection = cells.slice(0, count);
    selection.forEach(({ face, row, col }) => {
      const cell = getCell(face, row, col);
      if (cell) {
        cell.isMine = true;
      }
    });
  }

  function assignSpecials(options = {}) {
    const {
      rng = Math.random,
      config,
      forEachCell,
      shuffle,
      pick,
    } = options;

    const safeCells = [];
    forEachCell((cell) => {
      if (!cell.isMine) {
        safeCells.push(cell);
      }
    });

    shuffle(safeCells, rng);
    let available = [...safeCells];

    const rotationCells = available.slice(0, config.rotationSpecials);
    available = available.slice(config.rotationSpecials);
    rotationCells.forEach((cell) => {
      cell.special = {
        type: 'rotation',
        direction: pick(['cw', 'ccw'], rng),
        triggered: false,
      };
    });

    const flipCells = available.slice(0, config.flipSpecials);
    available = available.slice(config.flipSpecials);
    flipCells.forEach((cell) => {
      cell.special = {
        type: 'flip',
        axis: pick(['horizontal', 'vertical'], rng),
        triggered: false,
      };
    });

    const dogCells = available.slice(0, config.dogSpecials);
    available = available.slice(config.dogSpecials);
    dogCells.forEach((cell) => {
      cell.special = {
        type: 'dog',
        triggered: false,
      };
    });

    const guardianCells = available.slice(0, config.guardianSpecials);
    guardianCells.forEach((cell) => {
      cell.special = {
        type: 'guardian',
        triggered: false,
      };
    });
  }

  function computeNeighborCounts(options = {}) {
    const {
      forEachCell,
      getNeighbors,
    } = options;

    forEachCell((cell) => {
      cell.neighborMines = getNeighbors(cell).filter((neighbor) => neighbor.isMine).length;
    });
  }

  function getMinePositions(options = {}) {
    const {
      forEachCell,
    } = options;

    const mines = [];
    forEachCell((cell) => {
      if (cell.isMine) {
        mines.push({ face: cell.face, row: cell.row, col: cell.col });
      }
    });
    return mines;
  }

  function getSpecialsByType(options = {}) {
    const {
      type,
      forEachCell,
    } = options;

    const list = [];
    forEachCell((cell) => {
      if (cell.special?.type === type) {
        if (type === 'rotation') {
          list.push({ face: cell.face, row: cell.row, col: cell.col, direction: cell.special.direction });
        } else if (type === 'flip') {
          list.push({ face: cell.face, row: cell.row, col: cell.col, axis: cell.special.axis });
        } else if (type === 'dog') {
          list.push({ face: cell.face, row: cell.row, col: cell.col });
        } else if (type === 'guardian') {
          list.push({ face: cell.face, row: cell.row, col: cell.col });
        }
      }
    });
    return list;
  }

  window.MindsweeperBoardGeneration = {
    createGrid,
    placeMines,
    assignSpecials,
    computeNeighborCounts,
    getMinePositions,
    getSpecialsByType,
  };
})();
