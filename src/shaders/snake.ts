export const vertexShaderSource = `
  attribute vec2 aVertexPosition;
  varying vec2 vUV;
  void main() {
    vUV = aVertexPosition * 0.5 + 0.5;
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
  }
`;

export const fragmentShaderSource = `
  precision mediump float;
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iChannel0;
  varying vec2 vUV;

  void main() {
    vec2 uv = vUV;
    vec2 normalizedUV = uv * iResolution;
    uv.y += sin(normalizedUV.x * 0.01 + iTime) * 0.02;
    uv.x += cos(normalizedUV.y * 0.01 + iTime * 0.5) * 0.02;

    vec3 color = texture2D(iChannel0, uv).rgb;
    gl_FragColor = vec4(color, 1.0);
  }
`;
