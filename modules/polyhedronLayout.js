(() => {
  const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
  const D20_VERTICES = [
    [-1, GOLDEN_RATIO, 0],
    [1, GOLDEN_RATIO, 0],
    [-1, -GOLDEN_RATIO, 0],
    [1, -GOLDEN_RATIO, 0],
    [0, -1, GOLDEN_RATIO],
    [0, 1, GOLDEN_RATIO],
    [0, -1, -GOLDEN_RATIO],
    [0, 1, -GOLDEN_RATIO],
    [GOLDEN_RATIO, 0, -1],
    [GOLDEN_RATIO, 0, 1],
    [-GOLDEN_RATIO, 0, -1],
    [-GOLDEN_RATIO, 0, 1],
  ];

  const D20_FACES = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  const POLYHEDRON_LAYOUTS = {
    4: {
      sides: 3,
      normals: [
        [1, 1, 1],
        [-1, -1, 1],
        [-1, 1, -1],
        [1, -1, -1],
      ],
      seamOverlap: 1.0,
    },
    8: {
      sides: 3,
      normals: [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, 1],
        [-1, -1, -1],
      ],
      seamOverlap: 1.0,
    },
    12: {
      sides: 5,
      normals: [
        [0, 1, GOLDEN_RATIO],
        [0, 1, -GOLDEN_RATIO],
        [0, -1, GOLDEN_RATIO],
        [0, -1, -GOLDEN_RATIO],
        [1, GOLDEN_RATIO, 0],
        [1, -GOLDEN_RATIO, 0],
        [-1, GOLDEN_RATIO, 0],
        [-1, -GOLDEN_RATIO, 0],
        [GOLDEN_RATIO, 0, 1],
        [GOLDEN_RATIO, 0, -1],
        [-GOLDEN_RATIO, 0, 1],
        [-GOLDEN_RATIO, 0, -1],
      ],
      seamOverlap: 1.0,
    },
    20: {
      sides: 3,
      normals: D20_FACES.map(() => [0, 0, 1]),
      seamOverlap: 1.0,
    },
  };

  let cachedD20FaceData = null;
  let cachedD12FaceData = null;

  function clampDefault(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function createRegularPolygonClipPath(sides) {
    const safeSides = Math.max(Number(sides) || 3, 3);
    const points = [];
    const step = (Math.PI * 2) / safeSides;
    const start = -Math.PI / 2;
    for (let i = 0; i < safeSides; i += 1) {
      const angle = start + i * step;
      const x = 50 + Math.cos(angle) * 50;
      const y = 50 + Math.sin(angle) * 50;
      points.push(`${x.toFixed(3)}% ${y.toFixed(3)}%`);
    }
    return `polygon(${points.join(', ')})`;
  }

  function normalizeVector(vector) {
    const [x, y, z] = vector;
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
  }

  function cross3(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  function sub3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function rotateVectorAxisAngle(vector, axis, angle) {
    const [vx, vy, vz] = vector;
    const [ax, ay, az] = normalizeVector(axis);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dot = vx * ax + vy * ay + vz * az;
    return [
      vx * cos + (ay * vz - az * vy) * sin + ax * dot * (1 - cos),
      vy * cos + (az * vx - ax * vz) * sin + ay * dot * (1 - cos),
      vz * cos + (ax * vy - ay * vx) * sin + az * dot * (1 - cos),
    ];
  }

  function scale3(vector, factor) {
    return [vector[0] * factor, vector[1] * factor, vector[2] * factor];
  }

  function add3(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  function faceMatrixFromTriangle(a, b, c, faceWidth) {
    const r = faceWidth / 2;
    const k = Math.sqrt(3) / 2;
    const bc = sub3(b, c);
    const u = [bc[0] / (2 * k * r), bc[1] / (2 * k * r), bc[2] / (2 * k * r)];
    const midBC = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2, (b[2] + c[2]) / 2];
    const mToA = sub3(midBC, a);
    const v = [mToA[0] / (1.5 * r), mToA[1] / (1.5 * r), mToA[2] / (1.5 * r)];
    const origin = add3(a, [v[0] * r, v[1] * r, v[2] * r]);
    const n = normalizeVector(cross3(u, v));
    return `matrix3d(${u[0]}, ${u[1]}, ${u[2]}, 0, ${v[0]}, ${v[1]}, ${v[2]}, 0, ${n[0]}, ${n[1]}, ${n[2]}, 0, ${origin[0]}, ${origin[1]}, ${origin[2]}, 1)`;
  }

  function dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function buildD20FaceData() {
    let maxVertexRadius = 0;
    D20_VERTICES.forEach((vertex) => {
      maxVertexRadius = Math.max(maxVertexRadius, Math.hypot(vertex[0], vertex[1], vertex[2]));
    });
    const faces = D20_FACES.map((face) => {
      let [ia, ib, ic] = face;
      let a = D20_VERTICES[ia];
      let b = D20_VERTICES[ib];
      let c = D20_VERTICES[ic];
      let ab = sub3(b, a);
      let ac = sub3(c, a);
      let normal = normalizeVector(cross3(ab, ac));
      const center = normalizeVector([
        (a[0] + b[0] + c[0]) / 3,
        (a[1] + b[1] + c[1]) / 3,
        (a[2] + b[2] + c[2]) / 3,
      ]);
      if (dot3(normal, center) < 0) {
        [ib, ic] = [ic, ib];
        b = D20_VERTICES[ib];
        c = D20_VERTICES[ic];
        ab = sub3(b, a);
        ac = sub3(c, a);
        normal = normalizeVector(cross3(ab, ac));
      }
      const faceCenter = [
        (a[0] + b[0] + c[0]) / 3,
        (a[1] + b[1] + c[1]) / 3,
        (a[2] + b[2] + c[2]) / 3,
      ];
      const upHint = normalizeVector(sub3(a, faceCenter));
      const tangentY = normalizeVector(cross3(normal, upHint));
      const vertices = [a, b, c];
      let faceCircumradiusUnit = 0;
      vertices.forEach((vertex) => {
        const centered = sub3(vertex, faceCenter);
        const localX = dot3(centered, upHint);
        const localY = dot3(centered, tangentY);
        faceCircumradiusUnit = Math.max(faceCircumradiusUnit, Math.hypot(localX, localY));
      });
      const inradiusUnit = Math.abs(dot3(a, normal));
      return { normal, upHint, faceCircumradiusUnit, inradiusUnit, indices: [ia, ib, ic] };
    });
    return { faces, maxVertexRadius };
  }

  function buildD12FaceData() {
    const d20Data = buildD20FaceData();
    const dodecaVertices = d20Data.faces.map((face) => face.normal);
    let maxVertexRadius = 0;
    dodecaVertices.forEach((vertex) => {
      maxVertexRadius = Math.max(maxVertexRadius, Math.hypot(vertex[0], vertex[1], vertex[2]));
    });
    const faces = D20_VERTICES.map((vertex, vertexIndex) => {
      const normal = normalizeVector(vertex);
      const incident = [];
      D20_FACES.forEach((face, faceIndex) => {
        if (face.includes(vertexIndex)) {
          incident.push(faceIndex);
        }
      });
      let center = [0, 0, 0];
      incident.forEach((fi) => {
        center = add3(center, dodecaVertices[fi]);
      });
      center = scale3(center, 1 / Math.max(incident.length, 1));
      const basisU =
        projectToFacePlane([0, -1, 0], normal) ||
        projectToFacePlane([1, 0, 0], normal) ||
        [1, 0, 0];
      const basisV = normalizeVector(cross3(normal, basisU));
      let ordered = incident
        .map((fi) => {
          const p = dodecaVertices[fi];
          const rel = sub3(p, center);
          const angle = Math.atan2(dot3(rel, basisV), dot3(rel, basisU));
          return { fi, angle };
        })
        .sort((a, b) => a.angle - b.angle)
        .map((entry) => entry.fi);
      if (ordered.length >= 3) {
        const p0 = dodecaVertices[ordered[0]];
        const p1 = dodecaVertices[ordered[1]];
        const p2 = dodecaVertices[ordered[2]];
        const winding = dot3(cross3(sub3(p1, p0), sub3(p2, p0)), normal);
        if (winding < 0) {
          ordered = ordered.slice().reverse();
        }
      }
      const firstPoint = dodecaVertices[ordered[0]];
      const upHint = normalizeVector(sub3(firstPoint, center));
      let faceCircumradiusUnit = 0;
      ordered.forEach((fi) => {
        const rel = sub3(dodecaVertices[fi], center);
        faceCircumradiusUnit = Math.max(faceCircumradiusUnit, Math.hypot(rel[0], rel[1], rel[2]));
      });
      const inradiusUnit = Math.abs(dot3(firstPoint, normal));
      return { normal, upHint, faceCircumradiusUnit, inradiusUnit };
    });
    return { faces, maxVertexRadius };
  }

  function getD20FaceData() {
    if (!cachedD20FaceData) {
      cachedD20FaceData = buildD20FaceData();
    }
    return cachedD20FaceData;
  }

  function getD12FaceData() {
    if (!cachedD12FaceData) {
      cachedD12FaceData = buildD12FaceData();
    }
    return cachedD12FaceData;
  }

  function projectToFacePlane(vector, normal) {
    const [nx, ny, nz] = normal;
    const projection = [
      vector[0] - nx * dot3(vector, normal),
      vector[1] - ny * dot3(vector, normal),
      vector[2] - nz * dot3(vector, normal),
    ];
    const length = Math.hypot(projection[0], projection[1], projection[2]);
    if (length < 1e-8) return null;
    return [projection[0] / length, projection[1] / length, projection[2] / length];
  }

  function computeFaceOrientationHints(normals, neighborCount = 3) {
    const unit = normals.map((n) => normalizeVector(n));
    return unit.map((normal, index) => {
      const ranked = unit
        .map((other, otherIndex) => ({ other, otherIndex, score: otherIndex === index ? -2 : dot3(normal, other) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(neighborCount, 1));
      for (const candidate of ranked) {
        const projected = projectToFacePlane(candidate.other, normal);
        if (projected) return projected;
      }
      return null;
    });
  }

  function faceTransformForNormal(vector, radius, sides = 4, upHint = null, clampFn = clampDefault) {
    const [nx, ny, nz] = normalizeVector(vector);
    let ax = -ny;
    let ay = nx;
    let az = 0;
    let axisLength = Math.hypot(ax, ay, az);
    const angle = Math.acos(clampFn(nz, -1, 1));
    if (axisLength < 1e-6) {
      if (nz < 0) {
        ax = 1;
        ay = 0;
        az = 0;
        axisLength = 1;
      } else {
        ax = 0;
        ay = 1;
        az = 0;
        axisLength = 1;
      }
    }
    ax /= axisLength;
    ay /= axisLength;
    az /= axisLength;
    const angleDeg = (angle * 180) / Math.PI;
    const upWorld = [0, -1, 0];
    const fallbackUp = [1, 0, 0];
    const projectedHint = upHint ? projectToFacePlane(upHint, [nx, ny, nz]) : null;
    const projectedUp =
      projectedHint ||
      projectToFacePlane(
        Math.abs(dot3([nx, ny, nz], upWorld)) > 0.96 ? fallbackUp : upWorld,
        [nx, ny, nz]
      ) ||
      [0, -1, 0];
    const rotatedUp = normalizeVector(rotateVectorAxisAngle([0, -1, 0], [ax, ay, az], angle));
    const cross = cross3(rotatedUp, projectedUp);
    const roll = Math.atan2(dot3([nx, ny, nz], cross), dot3(rotatedUp, projectedUp));
    const rawRollDeg = (roll * 180) / Math.PI;
    const rollStep = 360 / Math.max(Number(sides) || 3, 3);
    const rollDeg = Math.round(rawRollDeg / rollStep) * rollStep;
    return `rotate3d(${ax}, ${ay}, ${az}, ${angleDeg}deg) rotateZ(${rollDeg}deg) translateZ(${radius}px)`;
  }

  function derivePolyhedronFaceSizing(normals, sides, diameter, seamOverlap = 1, clampFn = clampDefault) {
    const unitNormals = normals.map((normal) => normalizeVector(normal));
    let maxDot = -1;
    for (let i = 0; i < unitNormals.length; i += 1) {
      for (let j = 0; j < unitNormals.length; j += 1) {
        if (i === j) continue;
        const d = dot3(unitNormals[i], unitNormals[j]);
        if (d > maxDot && d < 0.999999) {
          maxDot = d;
        }
      }
    }
    const adjacentAngle = Math.acos(clampFn(maxDot, -1, 1));
    const sideApothemFactor = Math.tan(adjacentAngle / 2);
    const polygonApothemFactor = Math.max(Math.cos(Math.PI / Math.max(sides, 3)), 0.001);
    const extentFactor = 1 + sideApothemFactor / polygonApothemFactor;
    const radius = Math.max((diameter * 0.46) / extentFactor, 1);
    const faceApothem = radius * sideApothemFactor;
    const faceCircumradius = faceApothem / polygonApothemFactor;
    const safeOverlap = clampFn(Number(seamOverlap) || 1, 0.97, 1.03);
    const faceWidth = Math.max(faceCircumradius * 2 * safeOverlap, 1);
    return {
      radius,
      faceWidth,
      normals: unitNormals,
    };
  }

  function applyPolyFaceStyles(faceEl, faceWidth, clipPath) {
    faceEl.style.left = '50%';
    faceEl.style.top = '50%';
    faceEl.style.width = `${faceWidth}px`;
    faceEl.style.height = `${faceWidth}px`;
    faceEl.style.marginLeft = `${-faceWidth / 2}px`;
    faceEl.style.marginTop = `${-faceWidth / 2}px`;
    faceEl.style.clipPath = clipPath;
    faceEl.style.webkitClipPath = clipPath;
  }

  function layoutCubeFaces(options = {}) {
    const { cubeEl, clamp } = options;
    if (!cubeEl) return;
    const clampFn = typeof clamp === 'function' ? clamp : clampDefault;
    const faces = cubeEl.querySelectorAll('.cube-face');
    const faceCount = faces.length;
    if (!faceCount) return;
    cubeEl.setAttribute('data-face-count', String(faceCount));
    if (faceCount === 6) {
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
      return;
    }
    const layout = POLYHEDRON_LAYOUTS[faceCount];
    if (!layout) {
      return;
    }
    const d20Data = faceCount === 20 ? getD20FaceData() : null;
    const d12Data = faceCount === 12 ? getD12FaceData() : null;
    const explicitData = d20Data || d12Data;
    const explicitFaces = explicitData ? explicitData.faces : null;
    const normalsForSizing = explicitFaces ? explicitFaces.map((entry) => entry.normal) : layout.normals;
    const width = Math.max(cubeEl.clientWidth, 1);
    const height = Math.max(cubeEl.clientHeight, 1);
    const diameter = Math.max(Math.min(width, height), 1);
    let radius;
    let faceWidth;
    let sizing = null;
    if (explicitData && explicitFaces?.length) {
      const seam = clampFn(Number(layout.seamOverlap) || 1, 0.97, 1.03);
      const targetOuterRadius = diameter * 0.46;
      const scale = targetOuterRadius / Math.max(explicitData.maxVertexRadius, 1e-6);
      radius = explicitFaces[0].inradiusUnit * scale;
      faceWidth = explicitFaces[0].faceCircumradiusUnit * 2 * seam * scale;
      const clipPath = createRegularPolygonClipPath(layout.sides);
      cubeEl.style.setProperty('--face-width', `${faceWidth}px`);
      if (faceCount === 20) {
        const explicitTransforms = explicitFaces.map((face) => {
          const [ia, ib, ic] = face.indices;
          const a = scale3(D20_VERTICES[ia], scale);
          const b = scale3(D20_VERTICES[ib], scale);
          const c = scale3(D20_VERTICES[ic], scale);
          return faceMatrixFromTriangle(a, b, c, faceWidth);
        });
        faces.forEach((faceEl, index) => {
          applyPolyFaceStyles(faceEl, faceWidth, clipPath);
          faceEl.style.transform = explicitTransforms[index] || explicitTransforms[0];
        });
      } else {
        const normals = explicitFaces.map((entry) => entry.normal);
        const orientationHints = explicitFaces.map((entry) => entry.upHint);
        faces.forEach((faceEl, index) => {
          const normal = normals[index] || normals[index % normals.length] || [0, 0, 1];
          const upHint = orientationHints[index] || null;
          applyPolyFaceStyles(faceEl, faceWidth, clipPath);
          faceEl.style.transform = faceTransformForNormal(normal, radius, layout.sides, upHint, clampFn);
        });
      }
      return;
    }

    sizing = derivePolyhedronFaceSizing(
      normalsForSizing,
      layout.sides,
      diameter,
      layout.seamOverlap ?? 1,
      clampFn
    );
    radius = sizing.radius;
    faceWidth = sizing.faceWidth;

    const clipPath = createRegularPolygonClipPath(layout.sides);
    cubeEl.style.setProperty('--face-width', `${faceWidth}px`);
    const normals = sizing.normals;
    const orientationHints = computeFaceOrientationHints(normals, layout.sides);
    faces.forEach((faceEl, index) => {
      const normal = normals[index] || normals[index % normals.length] || [0, 0, 1];
      const upHint = orientationHints[index] || null;
      applyPolyFaceStyles(faceEl, faceWidth, clipPath);
      faceEl.style.transform = faceTransformForNormal(normal, radius, layout.sides, upHint, clampFn);
    });
  }

  window.MindsweeperPolyhedron = window.MindsweeperPolyhedron || {};
  window.MindsweeperPolyhedron.layoutCubeFaces = layoutCubeFaces;
})();
