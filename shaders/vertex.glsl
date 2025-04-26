#version 300 es

in vec2 a_position; //grid goes here

uniform float u_aspect;
uniform float u_zoom;
uniform vec2 u_rotation;
uniform sampler2D u_heightmap;
uniform float u_heightScale;

out vec2 v_uv;

void main() {
  vec2 uv = a_position * 0.5 + 0.5;

  // Sample heightmap
  float height = texture(u_heightmap, uv).r;

  // Start with 2D position, add height displacement on Z
  vec3 pos = vec3(a_position, 0.0);
  pos.z += height * u_heightScale;

  // Camera Bug Here. This sucked.
  // CENTER the mesh: shift downward by half of the max height
  pos.z -= 0.5 * u_heightScale;

  // Apply pitch rotation (around X axis)
  float pitch = u_rotation.x;
  mat3 pitchMatrix = mat3(
    1.0, 0.0,      0.0,
    0.0, cos(pitch), -sin(pitch),
    0.0, sin(pitch),  cos(pitch)
  );

  // Apply yaw rotation (around Y axis)
  float yaw = u_rotation.y;
  mat3 yawMatrix = mat3(
    cos(yaw), 0.0, sin(yaw),
    0.0,      1.0, 0.0,
    -sin(yaw), 0.0, cos(yaw)
  );

  pos = yawMatrix * pitchMatrix * pos;
  vec2 projected = pos.xy;
  vec2 scaled = projected * u_zoom;
  scaled.x /= u_aspect;
  gl_Position = vec4(scaled, 0.0, 1.0);
  v_uv = uv;
}
