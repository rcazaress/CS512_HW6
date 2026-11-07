function createCube() {
  const positions = new Float32Array([
    -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,   // front
     1, -1, -1,  -1, -1, -1,  -1,  1, -1,   1,  1, -1,   // back
    -1,  1,  1,   1,  1,  1,   1,  1, -1,  -1,  1, -1,   // top
    -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,   // bottom
     1, -1,  1,   1, -1, -1,   1,  1, -1,   1,  1,  1,   // right
    -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1    // left
  ]);
  const faceNormals = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];
  const normals = new Float32Array(faceNormals.flatMap(n => [...n, ...n, ...n, ...n]));

  // Tangent; bitangent = cross(N, T)
  const faceTangents = [[1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, 1]];
  const tangents = new Float32Array(faceTangents.flatMap(t => [...t, ...t, ...t, ...t]));

  const texCoords = new Float32Array(faceNormals.flatMap(() => [0, 0, 1, 0, 1, 1, 0, 1]));

  const indices = new Uint16Array([
     0,  1,  2,   0,  2,  3,   // front
     4,  5,  6,   4,  6,  7,   // back
     8,  9, 10,   8, 10, 11,   // top
    12, 13, 14,  12, 14, 15,   // bottom
    16, 17, 18,  16, 18, 19,   // right
    20, 21, 22,  20, 22, 23    // left
  ]);
  return { positions, normals, tangents, texCoords, indices };
}


function createCylinder(segments = 64, uRepeat = 3) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  // Side: theta grows with u, so T points along the circle and B = cross(N, T) points up
  for (let i = 0; i <= segments; i++) {
    const u = i / segments, theta = 2 * Math.PI * u;
    const s = Math.sin(theta), c = Math.cos(theta);
    for (const y of [-1, 1]) {
      positions.push(s, y, c);
      normals.push(s, 0, c);
      tangents.push(c, 0, -s);
      texCoords.push(u * uRepeat, (y + 1) / 2);
    }
  }
  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 2, k + 3, k, k + 3, k + 1);
  }

  // Caps: planar mapping of x, z into the texture, T = +x on both
  for (const y of [1, -1]) {
    const center = positions.length / 3;
    positions.push(0, y, 0);
    normals.push(0, y, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5, 0.5);
    for (let i = 0; i <= segments; i++) {
      const theta = 2 * Math.PI * i / segments;
      const s = Math.sin(theta), c = Math.cos(theta);
      positions.push(s, y, c);
      normals.push(0, y, 0);
      tangents.push(1, 0, 0);
      texCoords.push(0.5 + 0.5 * s, 0.5 - 0.5 * y * c);  // keeps cross(N, T) along +v
    }
    for (let i = 0; i < segments; i++) {
      const a = center + 1 + i, b = a + 1;
      if (y > 0) indices.push(center, a, b);
      else indices.push(center, b, a);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


function createSphere(r = 1, uSteps = 64, vSteps = 32, uRepeat = 2) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  for (let i = 0; i <= vSteps; i++) {
    const v = i * Math.PI / vSteps;
    const sinv = Math.sin(v);
    const cosv = Math.cos(v);

    for (let j = 0; j <= uSteps; j++) {
      const u = j * 2 * Math.PI / uSteps;
      const sinu = Math.sin(u);
      const cosu = Math.cos(u);
      const x = cosu * sinv;
      const y = cosv;
      const z = sinu * sinv;

      positions.push(r * x, r * y, r * z);
      normals.push(x, y, z);
      tangents.push(sinu, 0, -cosu);
      texCoords.push(uRepeat * (1 - j / uSteps), 1 - i / vSteps);
    }
  }

  for (let i = 0; i < vSteps; i++) {
    for (let j = 0; j < uSteps; j++) {
      const k1 = i * (uSteps + 1) + j;
      const k2 = k1 + uSteps + 1;
      indices.push(k1, k1 + 1, k2);
      indices.push(k2, k1 + 1, k2 + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


function createCone(segments = 64, uRepeat = 3) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  // Side faces for cone based on amount of segments (segments = 4 to create pyramid) from base to apex
  for (let i = 0; i <= segments; i++) {
    const u = i / segments, theta = 2 * Math.PI * u;
    const s = Math.sin(theta), c = Math.cos(theta);
    positions.push(s, -1, c,   0, 1, 0);
    normals.push(2 * s, 1, 2 * c,   2 * s, 1, 2 * c);
    tangents.push(c, 0, -s,   c, 0, -s);
    texCoords.push(u * uRepeat, 0,   u * uRepeat, 1);
  }
  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 2, k + 3);
  }

  // base is like the base of the cylinder above, first the center point
  const center = positions.length / 3;
  positions.push(0, -1, 0);
  normals.push(0, -1, 0);
  tangents.push(1, 0, 0);
  texCoords.push(0.5, 0.5);

  // then each segment from the center corresponding to each face
  for (let i = 0; i <= segments; i++) {
    const theta = 2 * Math.PI * i / segments;
    const s = Math.sin(theta), c = Math.cos(theta);
    positions.push(s, -1, c);
    normals.push(0, -1, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5 + 0.5 * s, 0.5 + 0.5 * c);
  }
  for (let i = 0; i < segments; i++) {
    const a = center + 1 + i, b = a + 1;
    indices.push(center, b, a);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


function createPyramid() {

  // optional to just use createCone() and set segments to 4

  // Bottom which has 4 positions, facing down
  const positions = [-1, -1, -1,   1, -1, -1,   1, -1, 1,   -1, -1, 1];
  const normals = [0, -1, 0,   0, -1, 0,   0, -1, 0,   0, -1, 0];
  const tangents = [1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0];
  const texCoords = [0, 0, 1, 0, 1, 1, 0, 1];
  const indices = [0, 1, 2,   0, 2, 3];

  // FOR THE FOLLOWING
  // p = { [a], [b], [apex] } => a, b, apex for positions of face
  // n (normailized) = (b - a) cross (apex - a) => normal for face
  // t (normalized) = b - a => tangent for face

  const apex = [0, 1, 0];

  // back
  positions.push(1, -1, -1,  -1, -1, -1, ...apex);
  normals.push(0, 1, -2,  0, 1, -2,  0, 1, -2);
  tangents.push(-1, 0, 0,  -1, 0, 0,  -1, 0, 0);
  texCoords.push(0, 0, 1, 0, 0.5, 1);
  indices.push(4, 5, 6);

  // right
  positions.push(1, -1, 1,  1, -1, -1, ...apex);
  normals.push(2, 1, 0,  2, 1, 0,  2, 1, 0);
  tangents.push(0, 0, -1,  0, 0, -1,  0, 0, -1);
  texCoords.push(0, 0, 1, 0, 0.5, 1);
  indices.push(7, 8, 9);

  // front
  positions.push(-1, -1,  1,  1, -1,  1, ...apex);
  normals.push(0, 1, 2,  0, 1, 2,  0, 1, 2);
  tangents.push(1, 0, 0,  1, 0, 0,  1, 0, 0);
  texCoords.push(0, 0, 1, 0, 0.5, 1);
  indices.push(10, 11, 12);

  // left
  positions.push(-1, -1, -1,  -1, -1,  1, ...apex);
  normals.push(-2, 1, 0,  -2, 1, 0,  -2, 1, 0);
  tangents.push(0, 0, 1,  0, 0, 1,  0, 0, 1);
  texCoords.push(0, 0, 1, 0, 0.5, 1);
  indices.push(13, 14, 15);

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}
