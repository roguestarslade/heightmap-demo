export async function loadShaderSource(url) {
  const response = await fetch(url);
  return await response.text();
}
