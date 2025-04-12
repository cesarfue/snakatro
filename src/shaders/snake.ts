export const vertexShaderSource = `
  attribute vec2 aVertexPosition;
  varying vec2 vUV;
  void main() {
    vec2 flippedPosition = vec2(aVertexPosition.x, -aVertexPosition.y);
    vUV = flippedPosition * 0.5 + 0.5;
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
  }
`;

export const fragmentShaderSource = `
  precision mediump float;
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iChannel0;
  uniform vec2 iSnakePosition; // New uniform for snake position
  varying vec2 vUV;
  
  void main() {
    vec2 uv = vUV;
    vec2 normalizedUV = uv * iResolution;
    
    // Calculate distance from current pixel to snake position
    vec2 normalizedSnake = iSnakePosition / iResolution;
    float dist = distance(normalizedUV, iSnakePosition);
    
    // Create stronger waves near the snake that fade with distance
    float waveFactor = 0.1 * exp(-dist * 0.01);
    float waveSpeed = iTime * 1.0;
    
    // Add circular waves emanating from the snake position
    float circularWave = sin(dist * 0.05 - waveSpeed) * waveFactor;
    
    // Add the base wave pattern
    // Add the snake-influenced wave
    uv.y += circularWave;
    uv.x += circularWave * 0.8;

    // Clamp UVs to avoid sampling outside texture bounds
    uv = clamp(uv, vec2(0.0), vec2(1.0));

    vec3 color = texture2D(iChannel0, uv).rgb;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
