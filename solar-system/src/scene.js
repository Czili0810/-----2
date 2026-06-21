import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// ==================== 场景 / 相机 / 渲染器 ====================

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 100000);

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', logarithmicDepthBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
export const maxAniso = renderer.capabilities.getMaxAnisotropy();

// ==================== OrbitControls ====================

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 0);
controls.minDistance = 0.1;
controls.maxDistance = 5000;
controls.maxPolarAngle = Math.PI * 0.85;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.15;

// ==================== 光照 ====================

export function setupLighting() {
  scene.add(new THREE.AmbientLight(0x1a1a3a, 1.8));
  const sunLight = new THREE.PointLight(0xfff8e8, 70, 5000, 0.25);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.01;
  sunLight.shadow.camera.far = 5000;
  sunLight.shadow.bias = -0.00005;
  sunLight.shadow.normalBias = 0.02;
  scene.add(sunLight);
  scene.add(new THREE.PointLight(0x8899cc, 18, 250, 0.6).translateY(80));
  scene.add(new THREE.HemisphereLight(0x8899cc, 0x112244, 0.8));
  return sunLight;
}

// ==================== 后处理 ====================

export function setupPostProcessing() {
  const BLOOM_LAYER = 1;

  const AdditiveBlendShader = {
    uniforms: { tDiffuse: { value: null }, tBloom: { value: null } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform sampler2D tBloom; varying vec2 vUv; void main() { vec4 base = texture2D(tDiffuse, vUv); vec4 bloom = texture2D(tBloom, vUv); gl_FragColor = base + bloom * 0.75; }`,
  };

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(new RenderPass(scene, camera));
  bloomComposer.addPass(new UnrealBloomPass(
    new THREE.Vector2(Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2)), 2.0, 0.5, 0.85
  ));

  const blendPass = new ShaderPass(AdditiveBlendShader);
  blendPass.uniforms['tBloom'].value = bloomComposer.renderTarget2.texture;

  const bokehPass = new BokehPass(scene, camera, {
    focus: 22, aperture: 0.00025, maxblur: 0.004,
    width: window.innerWidth, height: window.innerHeight,
  });

  const mainComposer = new EffectComposer(renderer);
  mainComposer.addPass(new RenderPass(scene, camera));
  mainComposer.addPass(bokehPass);
  mainComposer.addPass(blendPass);
  blendPass.renderToScreen = true;

  return { bloomComposer, mainComposer, bokehPass, BLOOM_LAYER };
}

export function updatePostProcessingSize(bloomComposer, mainComposer, bokehPass) {
  bloomComposer.setSize(Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2));
  mainComposer.setSize(window.innerWidth, window.innerHeight);
  bokehPass.setSize(window.innerWidth, window.innerHeight);
}
