import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";

function initWebGL(canvas: HTMLCanvasElement) {
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return null;
  }
  return gl as WebGLRenderingContext;
}

function compileShader(
  gl: WebGLRenderingContext,
  source: string,
  type: number,
) {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Failed to create shader");
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initShaderProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(
    gl,
    fragmentShaderSource,
    gl.FRAGMENT_SHADER,
  );

  if (!vertexShader || !fragmentShader) {
    console.error("Failed to compile shaders");
    return null;
  }

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) {
    console.error("Failed to create shader program");
    return null;
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram),
    );
    return null;
  }
  return shaderProgram;
}

function start() {
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  const gl = initWebGL(canvas);
  if (!gl) return;

  const shaderProgram = initShaderProgram(gl);
  if (!shaderProgram) return;

  gl.useProgram(shaderProgram);

  const vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPosition);

  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
  ]);

  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.error("Failed to create vertex buffer");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

  const timeUniformLocation = gl.getUniformLocation(shaderProgram, "iTime");
  const resolutionUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "iResolution",
  );

  if (!timeUniformLocation || !resolutionUniformLocation) {
    console.error("Failed to get uniform locations");
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  function render(
    gl: WebGLRenderingContext,
    shaderProgram: WebGLProgram,
    timeUniformLocation: WebGLUniformLocation,
    resolutionUniformLocation: WebGLUniformLocation,
  ) {
    const time = performance.now() / 1000; // time in seconds
    gl.uniform1f(timeUniformLocation, time);
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(() =>
      render(gl, shaderProgram, timeUniformLocation, resolutionUniformLocation),
    );
  }

  render(gl, shaderProgram, timeUniformLocation, resolutionUniformLocation);
}

window.onload = start;
