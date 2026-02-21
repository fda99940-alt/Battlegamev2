const test = require('node:test');
const assert = require('node:assert/strict');

const { loadBrowserModule } = require('./helpers/loadBrowserModule');

function createStyle() {
  return {
    color: '',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: '',
    backgroundRepeat: '',
    removeProperty(name) {
      if (name === 'color') this.color = '';
      if (name === 'background-image') this.backgroundImage = '';
      if (name === 'background-size') this.backgroundSize = '';
      if (name === 'background-position') this.backgroundPosition = '';
      if (name === 'background-repeat') this.backgroundRepeat = '';
    },
  };
}

function createClassList() {
  const values = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => values.add(token)),
    remove: (...tokens) => tokens.forEach((token) => values.delete(token)),
    contains: (token) => values.has(token),
  };
}

test('three renderer applies revealed texture overlay style when texture is available', () => {
  const renderers = loadBrowserModule('renderers/threeRenderer.js', 'MindsweeperRenderers');
  const renderer = renderers.createThreeRenderer({
    cubeEl: null,
    getActiveFaces: () => [],
    getCell: () => null,
    forEachCell: () => {},
    layoutCubeFacesDom: () => {},
    updateWrapperSpacing: () => {},
    normalizeFaceCount: (count) => count,
    decorateFaceElement: () => {},
    faceId: (index) => `f${index}`,
    getNumberColor: () => '#fff',
    getSpecialMarker: () => '⟳',
    getThreeTextureOverlay: () => ({ url: 'blob:test-texture' }),
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    normalizeFaceId: (face) => face,
    setFaceBoards: () => {},
    getConfig: () => ({ rows: 3, cols: 4 }),
    getVisualState: () => ({ cheatMode: false }),
  });

  const label = {
    textContent: '',
    style: createStyle(),
    classList: createClassList(),
    removeAttribute: () => {},
    setAttribute: () => {},
  };

  renderer.syncCell({
    face: 'f0',
    row: 1,
    col: 2,
    revealed: true,
    flagged: false,
    isMine: false,
    neighborMines: 0,
    special: null,
    threeLabel: label,
  });

  assert.equal(label.classList.contains('three-cell-label--revealed-texture'), true);
  assert.match(label.style.backgroundImage, /blob:test-texture/);
  assert.match(label.style.backgroundSize, /400% 300%/);
});
