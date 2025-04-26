import { createShader, createProgram } from './shaderUtils.js';

export class ShaderProgram {
  constructor(gl, vertexSrc, fragmentSrc) {
    this.gl = gl;
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    this.program = createProgram(gl, vs, fs);
  }

  use() {
    this.gl.useProgram(this.program);
  }

  getAttrib(name) {
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniform(name) {
    return this.gl.getUniformLocation(this.program, name);
  }
}
