(() => {
  function layoutCubeFaces(options = {}) {
    const { cubeEl } = options;
    if (!cubeEl) return;

    const faces = cubeEl.querySelectorAll('.cube-face');
    if (!faces.length) return;

    const size = Math.max(Math.min(cubeEl.clientWidth, cubeEl.clientHeight), 1);
    const half = size / 2;
    const transforms = [
      `translateZ(${half}px)`,
      `rotateY(90deg) translateZ(${half}px)`,
      `rotateY(180deg) translateZ(${half}px)`,
      `rotateY(-90deg) translateZ(${half}px)`,
      `rotateX(90deg) translateZ(${half}px)`,
      `rotateX(-90deg) translateZ(${half}px)`,
    ];

    cubeEl.setAttribute('data-face-count', String(faces.length));
    cubeEl.style.setProperty('--face-width', `${size}px`);

    faces.forEach((faceEl, index) => {
      faceEl.style.left = '0px';
      faceEl.style.top = '0px';
      faceEl.style.width = `${size}px`;
      faceEl.style.height = `${size}px`;
      faceEl.style.marginLeft = '0px';
      faceEl.style.marginTop = '0px';
      faceEl.style.clipPath = '';
      faceEl.style.webkitClipPath = '';
      faceEl.style.transform = transforms[index] || transforms[0];
    });
  }

  window.MindsweeperPolyhedron = window.MindsweeperPolyhedron || {};
  window.MindsweeperPolyhedron.layoutCubeFaces = layoutCubeFaces;
})();
