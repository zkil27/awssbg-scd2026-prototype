/**
 * grainient.js — SCD South Summit 2026
 *
 * Vanilla JavaScript ES module implementation of the React Bits <Grainient />
 * procedural WebGL component using OGL.
 */

import { Renderer, Program, Mesh, Triangle } from '../vendor/ogl.js';

export const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform float uHasColor4;
uniform float uLightMode;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);} 
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);} 
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colPink=uColor1;
  vec3 colPurple=uColor2;
  vec3 colBlue=uColor3;
  vec3 colGreen=uColor4;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;

  vec3 layer1;
  vec3 layer2;
  if (uHasColor4 > 0.5) {
    layer1=mix(colGreen,colBlue,S(edge0,edge1,blendX));
    layer2=mix(colPink,colPurple,S(edge0,edge1,blendX));
  } else {
    layer1=mix(colBlue,colPurple,S(edge0,edge1,blendX));
    layer2=mix(colPurple,colPink,S(edge0,edge1,blendX));
  }
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);} 
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);
  if(uLightMode>0.5){
    float energy=max(max(col.r,col.g),col.b);
    vec3 hue=col/max(energy,0.001);
    float chroma=length(col-vec3(dot(col,vec3(0.333333))));
    float coverage=clamp(0.12+chroma*1.15+energy*0.18,0.0,0.88);
    col=mix(vec3(1.0),clamp(hue*0.58+col*0.18,0.0,1.0),coverage);
  }

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

/**
 * Creates and mounts a Grainient instance inside the given container element.
 *
 * @param {HTMLElement} container
 * @param {Object} initialProps
 * @returns {Object|null} Grainient instance controller or null
 */
export function createGrainient(container, initialProps = {}) {
  if (!container) return null;

  const props = {
    timeSpeed: 0.25,
    colorBalance: 0.0,
    warpStrength: 1.0,
    warpFrequency: 5.0,
    warpSpeed: 2.0,
    warpAmplitude: 50.0,
    blendAngle: 0.0,
    blendSoftness: 0.05,
    rotationAmount: 500.0,
    noiseScale: 2.0,
    grainAmount: 0.1,
    grainScale: 2.0,
    grainAnimated: false,
    contrast: 1.5,
    gamma: 1.0,
    saturation: 1.0,
    centerX: 0.0,
    centerY: 0.0,
    zoom: 0.9,
    color1: '#FE55EB',
    color2: '#AD5CFD',
    color3: '#42B2FE',
    color4: '#00E681',
    lightMode: false,
    ...initialProps
  };

  let renderer = null;
  try {
    renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
  } catch (err) {
    console.warn('[Grainient] WebGL 2 not supported:', err);
    return null;
  }

  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      iTime:           { value: 0 },
      iResolution:     { value: new Float32Array([1, 1]) },
      uTimeSpeed:      { value: props.timeSpeed },
      uColorBalance:   { value: props.colorBalance },
      uWarpStrength:   { value: props.warpStrength },
      uWarpFrequency:  { value: props.warpFrequency },
      uWarpSpeed:      { value: props.warpSpeed },
      uWarpAmplitude:  { value: props.warpAmplitude },
      uBlendAngle:     { value: props.blendAngle },
      uBlendSoftness:  { value: props.blendSoftness },
      uRotationAmount: { value: props.rotationAmount },
      uNoiseScale:     { value: props.noiseScale },
      uGrainAmount:    { value: props.grainAmount },
      uGrainScale:     { value: props.grainScale },
      uGrainAnimated:  { value: props.grainAnimated ? 1.0 : 0.0 },
      uContrast:       { value: props.contrast },
      uGamma:          { value: props.gamma },
      uSaturation:     { value: props.saturation },
      uCenterOffset:   { value: new Float32Array([props.centerX, props.centerY]) },
      uZoom:           { value: props.zoom },
      uColor1:         { value: new Float32Array(hexToRgb(props.color1)) },
      uColor2:         { value: new Float32Array(hexToRgb(props.color2)) },
      uColor3:         { value: new Float32Array(hexToRgb(props.color3)) },
      uColor4:         { value: new Float32Array(props.color4 ? hexToRgb(props.color4) : [0, 0, 0]) },
      uHasColor4:      { value: props.color4 ? 1.0 : 0.0 },
      uLightMode:      { value: props.lightMode ? 1.0 : 0.0 }
    }
  });

  const mesh = new Mesh(gl, { geometry, program });

  const setSize = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width || window.innerWidth));
    const h = Math.max(1, Math.floor(rect.height || window.innerHeight));
    renderer.setSize(w, h);
    const res = program.uniforms.iResolution.value;
    res[0] = gl.drawingBufferWidth;
    res[1] = gl.drawingBufferHeight;
    renderer.render({ scene: mesh });
  };

  const ro = new ResizeObserver(setSize);
  ro.observe(container);
  setSize();

  let raf = 0;
  let isVisible = true;
  let isPageVisible = !document.hidden;
  const t0 = performance.now();

  const loop = t => {
    program.uniforms.iTime.value = (t - t0) * 0.001;
    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(loop);
  };

  const tryStart = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      program.uniforms.iTime.value = 0.5;
      renderer.render({ scene: mesh });
      return;
    }
    if (isVisible && isPageVisible && raf === 0) {
      raf = requestAnimationFrame(loop);
    }
  };

  const tryStop = () => {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      isVisible ? tryStart() : tryStop();
    },
    { threshold: 0 }
  );
  io.observe(container);

  const onVisibility = () => {
    isPageVisible = !document.hidden;
    isPageVisible ? tryStart() : tryStop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  tryStart();

  /**
   * Syncs new props to shader uniforms without context recreation.
   */
  const update = newProps => {
    Object.assign(props, newProps);
    const u = program.uniforms;

    if (newProps.timeSpeed !== undefined) u.uTimeSpeed.value = props.timeSpeed;
    if (newProps.colorBalance !== undefined) u.uColorBalance.value = props.colorBalance;
    if (newProps.warpStrength !== undefined) u.uWarpStrength.value = props.warpStrength;
    if (newProps.warpFrequency !== undefined) u.uWarpFrequency.value = props.warpFrequency;
    if (newProps.warpSpeed !== undefined) u.uWarpSpeed.value = props.warpSpeed;
    if (newProps.warpAmplitude !== undefined) u.uWarpAmplitude.value = props.warpAmplitude;
    if (newProps.blendAngle !== undefined) u.uBlendAngle.value = props.blendAngle;
    if (newProps.blendSoftness !== undefined) u.uBlendSoftness.value = props.blendSoftness;
    if (newProps.rotationAmount !== undefined) u.uRotationAmount.value = props.rotationAmount;
    if (newProps.noiseScale !== undefined) u.uNoiseScale.value = props.noiseScale;
    if (newProps.grainAmount !== undefined) u.uGrainAmount.value = props.grainAmount;
    if (newProps.grainScale !== undefined) u.uGrainScale.value = props.grainScale;
    if (newProps.grainAnimated !== undefined) u.uGrainAnimated.value = props.grainAnimated ? 1.0 : 0.0;
    if (newProps.contrast !== undefined) u.uContrast.value = props.contrast;
    if (newProps.gamma !== undefined) u.uGamma.value = props.gamma;
    if (newProps.saturation !== undefined) u.uSaturation.value = props.saturation;
    if (newProps.centerX !== undefined || newProps.centerY !== undefined) {
      u.uCenterOffset.value = new Float32Array([props.centerX, props.centerY]);
    }
    if (newProps.zoom !== undefined) u.uZoom.value = props.zoom;
    if (newProps.color1 !== undefined) u.uColor1.value = new Float32Array(hexToRgb(props.color1));
    if (newProps.color2 !== undefined) u.uColor2.value = new Float32Array(hexToRgb(props.color2));
    if (newProps.color3 !== undefined) u.uColor3.value = new Float32Array(hexToRgb(props.color3));
    if (newProps.color4 !== undefined) {
      props.color4 = newProps.color4;
      u.uColor4.value = new Float32Array(props.color4 ? hexToRgb(props.color4) : [0, 0, 0]);
      u.uHasColor4.value = props.color4 ? 1.0 : 0.0;
    }
    if (newProps.lightMode !== undefined) u.uLightMode.value = props.lightMode ? 1.0 : 0.0;

    if (!raf && isVisible) {
      renderer.render({ scene: mesh });
    }
  };

  /**
   * Adjusts center offset dynamically.
   */
  const setOffset = (x, y) => {
    props.centerX = x;
    props.centerY = y;
    program.uniforms.uCenterOffset.value = new Float32Array([x, y]);
    if (!raf && isVisible) {
      renderer.render({ scene: mesh });
    }
  };

  const destroy = () => {
    tryStop();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    try {
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    } catch { /* ignore */ }
  };

  return {
    update,
    setOffset,
    destroy,
    renderer,
    program,
    canvas,
    setSize
  };
}
