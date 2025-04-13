import { vertexShaderSource, fragmentShaderSource } from "./shaders/snake";
import { initGame } from "./game/game";

// Define the type for the electronAPI
declare global {
  interface Window {
    electronAPI: {
      getScreenSource: () => Promise<string>;
    };
  }
}

function initWebGL(canvas: HTMLCanvasElement) {
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    console.error(
      "Unable to initialize WebGL. Your browser may not support it.",
    );
    return null;
  }
  console.log("WebGL context initialized successfully");
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
  console.log(
    `Shader compiled successfully: ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"}`,
  );
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
    return null;
  }

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) return null;

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
  console.log("Shader program linked successfully");
  return shaderProgram;
}

function start(video: HTMLVideoElement) {
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }
  console.log("Canvas dimensions:", canvas.clientWidth, canvas.clientHeight);
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  console.log("Canvas buffer dimensions:", canvas.width, canvas.height);
  const gl = initWebGL(canvas);
  if (!gl) return;
  const shaderProgram = initShaderProgram(gl);
  gl.useProgram(shaderProgram);
  if (!(shaderProgram instanceof WebGLProgram)) {
    console.error("Shader program is not a valid WebGLProgram");
    return;
  }
  const vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  if (vertexPosition === -1) {
    console.error("Could not find vertex position attribute");
    return;
  }
  gl.enableVertexAttribArray(vertexPosition);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
  ]);
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

  // Get uniform locations
  const timeUniformLocation = gl.getUniformLocation(shaderProgram, "iTime");
  const resolutionUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "iResolution",
  );
  const textureUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "iChannel0",
  );
  const snakePositionUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "iSnakePosition",
  );
  const rippleTimeUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "iRippleTime",
  );

  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  let rippleStartTime = 0;
  let rippleActive = false;

  function triggerRipple() {
    console.log("triggerRipple()");
    rippleStartTime = performance.now() / 1000;
    rippleActive = true;
  }

  window.addEventListener("keydown", (event) => {
    if (
      event.code === "Space" ||
      event.code === "ArrowUp" ||
      event.code === "ArrowDown" ||
      event.code === "ArrowLeft" ||
      event.code === "ArrowRight"
    ) {
      triggerRipple();
    }
  });

  window.snakeEatsFood = function () {
    triggerRipple();
  };

  function render() {
    if (!gl) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    const currentTime = performance.now() / 1000;
    gl.uniform1f(timeUniformLocation, currentTime);
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform1i(textureUniformLocation, 0);

    if (window.snakePosition) {
      gl.uniform2f(
        snakePositionUniformLocation,
        window.snakePosition.x * window.devicePixelRatio,
        window.snakePosition.y * window.devicePixelRatio,
      );
    }

    let rippleTime = 0;
    if (rippleActive) {
      rippleTime = currentTime - rippleStartTime;
      if (rippleTime > 3.0) {
        rippleActive = false;
      }
    }
    gl.uniform1f(rippleTimeUniformLocation, rippleTime);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  console.log("Starting render loop");
  render();
}

declare global {
  interface Window {
    snakeEatsFood?: () => void;
  }
}

window.onload = async () => {
  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;

  try {
    console.log("Requesting screen source");
    if (!window.electronAPI) {
      throw new Error("electronAPI not available");
    }

    const sourceId = await window.electronAPI.getScreenSource();
    console.log("Screen source obtained:", sourceId);

    const stream = await (navigator.mediaDevices as any).getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          minHeight: 720,
          maxWidth: 4000,
          maxHeight: 4000,
        },
      },
    });

    console.log("Screen capture stream obtained");
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      console.log("Video metadata loaded, starting playback");
      video.play();
      start(video);
      initGame();
    };
  } catch (err) {
    console.error("Failed to get screen stream", err);
  }
};
