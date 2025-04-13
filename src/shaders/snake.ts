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
  uniform vec2 iSnakePosition;
  uniform float iRippleTime;
  varying vec2 vUV;
  
  // Define how many wave rings we want to track
  #define MAX_WAVES 5
  
  void main() {
    vec2 uv = vUV;
    vec2 pixelCoord = uv * iResolution;
    
    // Normalized coordinates
    vec2 normalizedUV = pixelCoord / iResolution;
    vec2 normalizedSnake = iSnakePosition / iResolution;
    
    // Distance from current pixel to snake position
    float dist = distance(normalizedUV, normalizedSnake);
    
    // Calculate ripple effect based on iRippleTime
    float totalDisplacement = 0.0;
    
    // Only process ripple effect if ripple time is active
    if (iRippleTime > 0.0) {
      // We'll create multiple waves that start from the same event
      for(int i = 0; i < MAX_WAVES; i++) {
        // Each wave expands at a different speed from the same event
        float waveSpeed = 0.2 + float(i) * 0.05;
        float expandingRadius = iRippleTime * waveSpeed;
        
        // Calculate amplitude that decreases over time
        float amplitude = 0.025 * exp(-iRippleTime * (0.7 + float(i) * 0.1));
        
        // Ring thickness gets wider as it expands
        float ringWidth = 0.01 + expandingRadius * 0.005;
        
        // Create a wave peak that moves outward
        float ringDistance = abs(dist - expandingRadius);
        float ringFactor = smoothstep(ringWidth, 0.0, ringDistance);
        
        // Combine with a sine wave to create ripple effect
        float wave = sin(dist * 80.0 - iRippleTime * 10.0) * amplitude * ringFactor;
        
        // Add to total displacement
        totalDisplacement += wave;
      }
    }
    
    // Apply displacement to UV coordinates
    vec2 displacedUV = uv + vec2(totalDisplacement * 0.8, totalDisplacement);
    
    // Clamp UVs to avoid sampling outside texture bounds
    displacedUV = clamp(displacedUV, vec2(0.0), vec2(1.0));
    
    // Sample the texture with the distorted UVs
    vec3 color = texture2D(iChannel0, displacedUV).rgb;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
