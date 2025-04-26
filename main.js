import { Renderer } from './Renderer.js';
import { InputHandler } from './Input.js';
import { Joystick } from './Joystick.js';
import { createGrid } from './Grid.js';
import { loadShaderSource } from './ShaderLoader.js';
import { ShaderProgram } from './ShaderProgram.js';
import { Mesh } from './Mesh.js';
import { RenderTarget } from './RenderTarget.js';

const canvas = document.getElementById('glCanvas');
const renderer = new Renderer(canvas);
const gl = renderer.gl;
const input = new InputHandler();
const joystick = new Joystick();

async function main() {
  const [squareVS, squareFS, weatherVS, weatherFS] = await Promise.all([
    loadShaderSource('shaders/vertex.glsl'),
    loadShaderSource('shaders/fragment.glsl'),
    loadShaderSource('shaders/weather_vert.glsl'),
    loadShaderSource('shaders/weather_frag.glsl'),
  ]);

  const squareProgram = new ShaderProgram(gl, squareVS, squareFS);
  const weatherProgram = new ShaderProgram(gl, weatherVS, weatherFS);

  const fullscreenQuad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1,
  ]), gl.STATIC_DRAW);

  const weatherRT = new RenderTarget(gl, 512, 512);

  const resizeSlider = document.getElementById('resizeSlider');
  const heightmapSlider = document.getElementById('heightmapSlider');
  const gridResolutionSlider = document.getElementById('gridResolutionSlider');
  const weatherZoomSlider = document.getElementById('weatherZoomSlider');

  const setupMinMaxInput = (sliderId, minInputId, maxInputId) => {
	const slider = document.getElementById(sliderId);
	const minInput = document.getElementById(minInputId);
	const maxInput = document.getElementById(maxInputId);

	minInput.addEventListener('change', () => {
	const minValue = parseFloat(minInput.value);
		if (!isNaN(minValue)) {
		  slider.min = minValue;

		  if (parseFloat(slider.value) < minValue) {
			slider.value = minValue;
		  }
		}
	});

	maxInput.addEventListener('change', () => {
	const maxValue = parseFloat(maxInput.value);
		if (!isNaN(maxValue)) {
		  slider.max = maxValue;

		  if (parseFloat(slider.value) > maxValue) {
			slider.value = maxValue;
		  }
		}
	});
  };

  setupMinMaxInput('resizeSlider', 'resizeSliderMinInput', 'resizeSliderMaxInput');
  setupMinMaxInput('heightmapSlider', 'heightmapMinInput', 'heightmapMaxInput');
  setupMinMaxInput('gridResolutionSlider', 'gridResolutionMinInput', 'gridResolutionMaxInput');
  setupMinMaxInput('weatherZoomSlider', 'weatherZoomMinInput', 'weatherZoomMaxInput');

  let mesh;

  function rebuildMesh() {
    const resolution = parseInt(gridResolutionSlider.value);
    const { positions, indices } = createGrid(resolution);
    mesh = new Mesh(gl, positions, indices);
  }

  gridResolutionSlider.addEventListener('input', rebuildMesh);

  rebuildMesh();

  const squareUniforms = {
    u_aspect: squareProgram.getUniform('u_aspect'),
    u_zoom: squareProgram.getUniform('u_zoom'),
    u_rotation: squareProgram.getUniform('u_rotation'),
    u_texture: squareProgram.getUniform('u_texture'),
    u_heightmap: squareProgram.getUniform('u_heightmap'),
    u_heightScale: squareProgram.getUniform('u_heightScale')
  };

  const weatherUniforms = {
    u_time: weatherProgram.getUniform('u_time'),
    u_weatherZoom: weatherProgram.getUniform('u_weatherZoom'),
	u_windDirection: weatherProgram.getUniform('u_windDirection')
  };

  const squarePosAttrib = squareProgram.getAttrib('a_position');
  const weatherPosAttrib = weatherProgram.getAttrib('a_position');

  let startTime = performance.now();
  renderer.start((now) => {
    const elapsed = now - (startTime * 0.001);
    renderer.resize();

    // Render weather into RTT
    weatherRT.bind();
    gl.viewport(0, 0, 512, 512);

    weatherProgram.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuad);
    gl.enableVertexAttribArray(weatherPosAttrib);
    gl.vertexAttribPointer(weatherPosAttrib, 2, gl.FLOAT, false, 0, 0);

    renderer.clear();
    gl.uniform1f(weatherUniforms.u_time, elapsed);
    gl.uniform1f(weatherUniforms.u_weatherZoom, parseFloat(weatherZoomSlider.value));
	const joystickInput = joystick.getValue();
	const joystickStrength = joystick.getStrength();
	const windStrength = joystickStrength;

	gl.uniform2f(weatherUniforms.u_windDirection,
	  joystickInput.x * windStrength,
	  joystickInput.y * windStrength
	);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    weatherRT.unbind();

    // Render main scene
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.clear();

    squareProgram.use();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, weatherRT.texture);

    gl.uniform1i(squareUniforms.u_texture, 0);
    gl.uniform1i(squareUniforms.u_heightmap, 0);

    gl.uniform1f(squareUniforms.u_aspect, gl.drawingBufferWidth / gl.drawingBufferHeight);
    gl.uniform1f(squareUniforms.u_zoom, parseFloat(resizeSlider.value));
    gl.uniform2f(squareUniforms.u_rotation, input.getRotation().x, input.getRotation().y);
    gl.uniform1f(squareUniforms.u_heightScale, parseFloat(heightmapSlider.value));

    mesh.bind(squarePosAttrib);
    mesh.draw();
  });
}

main();