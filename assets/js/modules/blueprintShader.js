/**
 * blueprintShader.js — SCD South Summit 2026
 *
 * Real WebGL procedural noise gradient (ShaderGradient / Olivier Larose style).
 * Uses 3D Simplex noise with domain warping inside a GLSL fragment shader to
 * project the summit brand palette (Orange, Purple, Blue, Green, Pink) into
 * fluid, organic, living chromatic currents.
 *
 * - Zero external libraries (pure vanilla WebGL).
 * - Aspect-ratio corrected, 60/120fps GPU execution.
 * - Reactive to horizontal scroll progress via `u_scroll`.
 * - Pauses automatically when offscreen via IntersectionObserver.
 * - Respects `prefers-reduced-motion: reduce`.
 */

let canvas = null;
let gl = null;
let program = null;
let animId = 0;
let isVisible = false;
let startTime = 0;
let scrollProgress = 0;
let observer = null;

// Uniform locations cache
let uResolutionLoc = null;
let uTimeLoc = null;
let uScrollLoc = null;
let uC1Loc = null;
let uC2Loc = null;
let uC3Loc = null;
let uC4Loc = null;
let uC5Loc = null;
let uBgLoc = null;
let uIntensityLoc = null;

const VS_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FS_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;
uniform vec3 u_c5;
uniform vec3 u_bg;
uniform float u_intensity;

// Simplex 3D Noise by Ian McEwan & Stefan Gustavson
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // Slow, serene, meditative time speed and gentle scroll response
  float t = u_time * 0.028;
  float s = u_scroll * 0.28;

  // Broad, low-frequency simplex noise domain displacement (liquid silk waves)
  vec2 q = vec2(
    snoise(vec3(p * 0.42, t + s * 0.25)),
    snoise(vec3(p * 0.42 + vec2(5.2, 1.3), t * 0.85 - s * 0.2))
  );

  // Gentle displacement - soft rolling swells rather than turbulent ripples
  vec2 displaced = p + q * 0.22;

  // Two broad, slow-drifting noise fields
  float n1 = snoise(vec3(displaced * 0.48, t * 0.65 + s * 0.15));
  float n2 = snoise(vec3(displaced * 0.38 + vec2(3.7, 8.1), t * 0.50));

  // Smooth spatial gradients across the screen, gently rippled by the noise
  float flow1 = clamp(uv.x * 0.65 + uv.y * 0.35 + n1 * 0.28, 0.0, 1.0);
  float flow2 = clamp((1.0 - uv.x) * 0.45 + uv.y * 0.55 + n2 * 0.26, 0.0, 1.0);

  // Wide, dreamy, blurry transitions across the summit colors
  vec3 colA = mix(u_c1, u_c2, smoothstep(0.12, 0.62, flow1));
  vec3 colB = mix(u_c3, u_c4, smoothstep(0.18, 0.72, flow2));

  // Harmonious blend between warm and cool fields, with subtle pink accent
  float blendFactor = clamp((flow1 + flow2) * 0.5 + (n1 - n2) * 0.12, 0.0, 1.0);
  vec3 col = mix(colA, colB, smoothstep(0.25, 0.75, blendFactor));

  // Gentle pink accent crest in the higher flow range
  float pinkAccent = smoothstep(0.68, 0.96, flow1 * 0.5 + flow2 * 0.5 + n1 * 0.15);
  col = mix(col, u_c5, pinkAccent * 0.80);

  // Boost chromatic saturation so blended gradients remain intensely vibrant
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = clamp(mix(vec3(luma), col, 1.25), 0.0, 1.0);

  // Blend with base background tone for calm elegance and text contrast
  vec3 finalCol = mix(u_bg, col, u_intensity);
  gl_FragColor = vec4(finalCol, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initProgram(gl) {
  const vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    return null;
  }

  return prog;
}

function updateColors() {
  if (!gl || !program) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  gl.useProgram(program);

  if (isDark) {
    // Dark Mode: Deep cosmic obsidian base + radiant, vibrant summit waves
    gl.uniform3f(uBgLoc, 0.035, 0.020, 0.075); // Deep obsidian
    gl.uniform3f(uC1Loc, 1.000, 0.580, 0.000); // Radiant Sun Orange #ff9400
    gl.uniform3f(uC2Loc, 0.680, 0.280, 1.000); // Electric Violet #ad47ff
    gl.uniform3f(uC3Loc, 0.150, 0.720, 1.000); // Vibrant Azure Blue #26b8ff
    gl.uniform3f(uC4Loc, 0.000, 0.940, 0.520); // Neon Summit Green #00f085
    gl.uniform3f(uC5Loc, 1.000, 0.250, 0.880); // Electric Pink #ff40e0
    gl.uniform1f(uIntensityLoc, 0.84);         // High vibrancy pop
  } else {
    // Light Mode: Clean soft lavender-white base + vivid watercolor editorial waves
    gl.uniform3f(uBgLoc, 0.960, 0.930, 0.980); // Soft lavender-white
    gl.uniform3f(uC1Loc, 1.000, 0.550, 0.000); // Vivid Orange
    gl.uniform3f(uC2Loc, 0.650, 0.300, 1.000); // Vivid Purple
    gl.uniform3f(uC3Loc, 0.120, 0.680, 1.000); // Vivid Blue
    gl.uniform3f(uC4Loc, 0.000, 0.880, 0.500); // Vivid Green
    gl.uniform3f(uC5Loc, 1.000, 0.280, 0.850); // Vivid Pink
    gl.uniform1f(uIntensityLoc, 0.68);         // Rich watercolor vibrancy
  }
}

function resize() {
  if (!canvas || !gl) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.round(canvas.clientWidth * dpr);
  const height = Math.round(canvas.clientHeight * dpr);

  if (width === 0 || height === 0) {
    stop();
    return;
  }

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}

function renderFrame(time) {
  if (!gl || !program) return;
  if (!canvas || canvas.width === 0 || canvas.height === 0) return;

  const elapsed = (time - startTime) * 0.001;
  gl.useProgram(program);
  gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
  gl.uniform1f(uTimeLoc, elapsed);
  gl.uniform1f(uScrollLoc, scrollProgress);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function loop(time) {
  if (!isVisible) return;
  renderFrame(time);
  animId = requestAnimationFrame(loop);
}

function start() {
  if (animId || !isVisible) return;
  if (!canvas || canvas.clientWidth === 0 || canvas.clientHeight === 0) return;
  startTime = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    // Render single static frame and pause
    renderFrame(startTime);
    return;
  }
  animId = requestAnimationFrame(loop);
}

function stop() {
  if (animId) {
    cancelAnimationFrame(animId);
    animId = 0;
  }
}

/** Update scroll progress uniform from blueprintScroll.js */
export function setShaderScroll(progress) {
  scrollProgress = progress;
  if (!animId && isVisible) {
    renderFrame(performance.now());
  }
}

/** Initialize the WebGL Noise Gradient Shader */
export function initBlueprintShader() {
  canvas = document.querySelector('.bp-shader-canvas');
  if (!canvas) return;

  const options = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power'
  };

  gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
  if (!gl) {
    console.warn('WebGL not supported, falling back to CSS background');
    return;
  }

  program = initProgram(gl);
  if (!program) return;

  // Setup full-screen quad geometry
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]),
    gl.STATIC_DRAW
  );

  const aPosLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPosLoc);
  gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

  // Cache uniform locations
  uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
  uTimeLoc = gl.getUniformLocation(program, 'u_time');
  uScrollLoc = gl.getUniformLocation(program, 'u_scroll');
  uC1Loc = gl.getUniformLocation(program, 'u_c1');
  uC2Loc = gl.getUniformLocation(program, 'u_c2');
  uC3Loc = gl.getUniformLocation(program, 'u_c3');
  uC4Loc = gl.getUniformLocation(program, 'u_c4');
  uC5Loc = gl.getUniformLocation(program, 'u_c5');
  uBgLoc = gl.getUniformLocation(program, 'u_bg');
  uIntensityLoc = gl.getUniformLocation(program, 'u_intensity');

  updateColors();
  resize();

  // Watch for theme changes to update color uniforms
  const themeObserver = new MutationObserver(() => {
    updateColors();
    if (!animId && isVisible) renderFrame(performance.now());
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // Watch for window resize
  window.addEventListener('resize', () => {
    resize();
    if (!animId && isVisible) renderFrame(performance.now());
  });

  // Observe visibility of #program so shader pauses completely when off-screen
  const section = document.getElementById('program');
  if ('IntersectionObserver' in window && section) {
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = entry.isIntersecting;
      if (isVisible) {
        resize();
        start();
      } else {
        stop();
      }
    }, { threshold: 0.01 });
    observer.observe(section);
  } else {
    isVisible = true;
    start();
  }
}
