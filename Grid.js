export function createGrid(resolution) {
  const positions = [];

  for (let y = 0; y <= resolution; y++) {
    for (let x = 0; x <= resolution; x++) {
      let u = x / resolution;
      let v = y / resolution;

      positions.push(u * 2 - 1);
      positions.push(v * 2 - 1);
    }
  }

  const indices = [];
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      let i = y * (resolution + 1) + x;

      indices.push(i, i + 1, i + resolution + 1);
      indices.push(i + 1, i + resolution + 2, i + resolution + 1);
    }
  }

  return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
}
