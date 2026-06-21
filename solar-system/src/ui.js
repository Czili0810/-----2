import * as THREE from 'three';
import { camera, controls } from './scene.js';
import { planetData, moonData, hexToRgb, clamp } from './data.js';

// ==================== UI 状态 ====================

export const uiState = {
  isPaused: false,
  timeScale: 1.0,
  showOrbits: true,
  showLabels: false,
  cameraMode: 'orbit',
  focusedPlanet: null,
  lastPlanetPos: null,
  flyAnim: null,
  smoothTarget: null,
  savedOrbitState: null,
  freeFlyYaw: 0,
  freeFlyPitch: 0,
  freeFlySpeed: 15,
  freeFlyKeys: { w: false, a: false, s: false, d: false, q: false, e: false },
  idleTime: 0,
  IDLE_LIMIT: 25,
  tourActive: false,
  tourIndex: 0,
  tourWaitTimer: 0,
  tourCameraOffset: null,
  tourBaseDirection: null,
  tourBaseDistance: 0,
  tourZoomFactor: 1.0,
  TOUR_ZOOM_MIN: 0.15,
  TOUR_ZOOM_MAX: 6.0,
  TOUR_WAIT: 5.0,
  TOUR_FLY_DURATION: 1500,
  clickTimer: null,
  lastClickedObj: null,
  hoveredObject: null,
};

export function resetIdle() { uiState.idleTime = 0; }

function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
}

export function getPlanetWorldPos(entry) {
  const pos = new THREE.Vector3();
  if (entry?.mesh) entry.mesh.getWorldPosition(pos);
  return pos;
}

// ==================== 信息面板 ====================

function lightenColor(hex, factor) {
  const rgb = hexToRgb(hex);
  return `rgb(${clamp(rgb.r*factor)},${clamp(rgb.g*factor)},${clamp(rgb.b*factor)})`;
}
function darkenColor(hex, factor) {
  const rgb = hexToRgb(hex);
  return `rgb(${clamp(rgb.r*factor)},${clamp(rgb.g*factor)},${clamp(rgb.b*factor)})`;
}

const infoPanel = document.getElementById('info-panel');
const iconCtx = document.getElementById('planet-icon').getContext('2d');

export function showPlanetInfo(obj) {
  const data = obj.userData;
  if (!data?.info) return;
  infoPanel.classList.add('visible');
  iconCtx.clearRect(0,0,64,64);
  const grad = iconCtx.createRadialGradient(32,32,2,32,32,32);
  grad.addColorStop(0, lightenColor(data.color, 1.3));
  grad.addColorStop(0.7, data.color);
  grad.addColorStop(1, darkenColor(data.color, 0.4));
  iconCtx.beginPath(); iconCtx.arc(32,32,30,0,Math.PI*2); iconCtx.fillStyle = grad; iconCtx.fill();
  document.getElementById('p-name').textContent = data.name;
  document.getElementById('p-name-en').textContent = data.nameEn;
  document.getElementById('p-type').textContent = data.type || (data.name==='太阳'?'恒星 (G型主序星)':'行星');
  document.getElementById('p-radius').textContent = data.info.radius || data.info.diameter;
  document.getElementById('p-mass').textContent = data.info.mass || '--';
  document.getElementById('p-density').textContent = data.info.density || '--';
  document.getElementById('p-gravity').textContent = data.info.gravity || '--';
  document.getElementById('p-temp').textContent = data.info.temp;
  document.getElementById('p-orbit').textContent = data.info.orbit;
  document.getElementById('p-rot').textContent = data.info.rotation;
  document.getElementById('p-moons').textContent = data.info.moons;
  document.getElementById('p-dist').textContent = data.info.distance;
  document.getElementById('p-fact').textContent = data.info.fact;
}

export function hidePlanetInfo() { infoPanel.classList.remove('visible'); }

// ==================== 相机模式 ====================

export function setCameraMode(mode) {
  const s = uiState;
  s.cameraMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');

  if (mode === 'free') {
    s.savedOrbitState = { position: camera.position.clone(), target: controls.target.clone() };
    controls.enabled = false; document.body.style.cursor = 'crosshair';
    const lookDir = new THREE.Vector3(); camera.getWorldDirection(lookDir);
    s.freeFlyYaw = Math.atan2(lookDir.x, lookDir.z);
    s.freeFlyPitch = Math.asin(Math.min(0.99, Math.max(-0.99, lookDir.y)));
  } else {
    if (s.cameraMode === 'free' && s.savedOrbitState) {
      camera.position.copy(s.savedOrbitState.position);
      controls.target.copy(s.savedOrbitState.target);
      controls.update(); s.savedOrbitState = null;
    }
    controls.enabled = true; document.body.style.cursor = 'grab';
    if (mode === 'orbit' && (s.cameraMode === 'follow' || s.cameraMode === 'focus')) {
      focusOnSun(); return;
    }
  }
  if (mode === 'orbit') { s.focusedPlanet = null; s.lastPlanetPos = null; }
}

export function focusOnSun(endPos = null, endTarget = null) {
  const s = uiState;
  s.smoothTarget = {
    startPos: camera.position.clone(), startTarget: controls.target.clone(),
    endPos: endPos || new THREE.Vector3(30, 35, 70), endTarget: endTarget || new THREE.Vector3(0, 0, 0),
    startTime: performance.now(), duration: 2500,
  };
  setCameraMode('orbit'); s.focusedPlanet = null; s.lastPlanetPos = null; s.flyAnim = null;
}

export function focusOnPlanet(entry) {
  uiState.focusedPlanet = entry;
  uiState.lastPlanetPos = getPlanetWorldPos(entry);
}

export function followPlanet(entry) {
  setCameraMode('follow');
  uiState.focusedPlanet = entry;
  uiState.lastPlanetPos = getPlanetWorldPos(entry);
}

export function flyToPlanet(entry, duration = 1100) {
  const s = uiState;
  const worldPos = getPlanetWorldPos(entry);
  const radius = entry.data?.radius || 1;
  const toCamera = camera.position.clone().sub(worldPos).normalize();
  const dist = radius * 8 + 4;
  const endPos = worldPos.clone().add(toCamera.multiplyScalar(dist));
  endPos.y += radius * 1.5;
  s.flyAnim = { startPos: camera.position.clone(), endPos, startTarget: controls.target.clone(), endTarget: worldPos.clone(), startTime: performance.now(), duration };
  if (s.cameraMode !== 'focus' && s.cameraMode !== 'follow') setCameraMode('focus');
  s.focusedPlanet = entry; s.lastPlanetPos = worldPos.clone();
}

// ==================== 自动巡航 ====================

export const tourStops = (sunMesh, planets) => [
  { name: '太阳', getEntry: () => ({ mesh: sunMesh, data: sunMesh.userData }) },
  { name: '水星', getEntry: () => planets.find(p => p.data.name === '水星') },
  { name: '金星', getEntry: () => planets.find(p => p.data.name === '金星') },
  { name: '地球', getEntry: () => planets.find(p => p.data.name === '地球') },
  { name: '火星', getEntry: () => planets.find(p => p.data.name === '火星') },
  { name: '木星', getEntry: () => planets.find(p => p.data.name === '木星') },
  { name: '土星', getEntry: () => planets.find(p => p.data.name === '土星') },
  { name: '天王星', getEntry: () => planets.find(p => p.data.name === '天王星') },
  { name: '海王星', getEntry: () => planets.find(p => p.data.name === '海王星') },
];

export function startTour() {
  const s = uiState;
  s.tourActive = true; s.tourIndex = 0; s.tourWaitTimer = 0;
  s.tourCameraOffset = null; s.tourBaseDirection = null; s.tourBaseDistance = 0; s.tourZoomFactor = 1.0;
  s.flyAnim = null; s.smoothTarget = null; resetIdle();
  setCameraMode('focus');
  document.getElementById('btn-tour').classList.add('active');
}

export function stopTour() {
  uiState.tourActive = false; uiState.tourWaitTimer = 0;
  document.getElementById('btn-tour').classList.remove('active');
}

export function gotoNextTourStop(ts) {
  const s = uiState;
  s.tourIndex = (s.tourIndex + 1) % ts.length;
  s.tourWaitTimer = 0; s.tourCameraOffset = null; s.tourBaseDirection = null; s.tourBaseDistance = 0;
}

// ==================== 键盘事件 ====================

export function setupKeyboard() {
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (uiState.cameraMode === 'free') {
      if (k in uiState.freeFlyKeys) { uiState.freeFlyKeys[k] = true; e.preventDefault(); }
      if (k === 'shift') uiState.freeFlySpeed = 40;
      return;
    }
    switch (k) {
      case 'r': controls.target.set(0,0,0); camera.position.set(30,35,70); controls.update(); break;
      case 'f': controls.target.set(0,0,0); camera.position.set(0,100,2); controls.update(); break;
      case 'escape': hidePlanetInfo(); break;
      case ' ': controls.autoRotate = !controls.autoRotate; e.preventDefault(); break;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (uiState.cameraMode !== 'free') return;
    const k = e.key.toLowerCase();
    if (k in uiState.freeFlyKeys) { uiState.freeFlyKeys[k] = false; e.preventDefault(); }
    if (k === 'shift') uiState.freeFlySpeed = 15;
  });

  // Free fly mouse
  window.addEventListener('mousemove', (e) => {
    if (uiState.cameraMode !== 'free' || document.pointerLockElement) return;
    if (e.buttons !== 0) {
      uiState.freeFlyYaw -= e.movementX * 0.003;
      uiState.freeFlyPitch -= e.movementY * 0.003;
      uiState.freeFlyPitch = Math.max(-Math.PI/2+0.01, Math.min(Math.PI/2-0.01, uiState.freeFlyPitch));
    }
  });
}

// ==================== UI 控制面板连线 ====================

export function setupControlPanel(ps, getCE, orbitLines, labelSprites, sunMesh) {
  const s = uiState;

  document.getElementById('btn-play').addEventListener('click', () => {
    s.isPaused = !s.isPaused;
    const btn = document.getElementById('btn-play');
    btn.textContent = s.isPaused ? '⏸' : '▶';
    btn.classList.toggle('active', s.isPaused);
  });

  function updateSpeedLabel() {
    document.getElementById('speed-label').textContent = s.timeScale.toFixed(1) + '×';
  }

  document.getElementById('btn-slower').addEventListener('click', () => {
    const steps = [0.1,0.25,0.5,0.75,1.0,1.5,2.0,3.0,5.0,10.0];
    const idx = steps.findIndex(v => v >= s.timeScale);
    s.timeScale = idx > 0 ? steps[idx-1] : steps[0];
    updateSpeedLabel();
  });

  document.getElementById('btn-faster').addEventListener('click', () => {
    const steps = [0.1,0.25,0.5,0.75,1.0,1.5,2.0,3.0,5.0,10.0];
    const rev = [...steps].reverse();
    const idx = rev.findIndex(v => v <= s.timeScale);
    s.timeScale = idx < steps.length-1 ? steps[steps.length-1-idx+1] : steps[steps.length-1];
    updateSpeedLabel();
  });

  document.getElementById('btn-orbits').addEventListener('click', () => {
    s.showOrbits = !s.showOrbits;
    orbitLines.forEach(l => l.visible = s.showOrbits);
    document.getElementById('btn-orbits').classList.toggle('active', s.showOrbits);
  });
  document.getElementById('btn-orbits').classList.add('active');

  document.getElementById('btn-labels').addEventListener('click', () => {
    s.showLabels = !s.showLabels;
    labelSprites.forEach(sp => sp.visible = s.showLabels);
    document.getElementById('btn-labels').classList.toggle('active', s.showLabels);
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    s.isPaused = false; s.timeScale = 1.0; s.flyAnim = null; s.smoothTarget = null;
    stopTour();
    document.getElementById('btn-play').textContent = '▶';
    document.getElementById('btn-play').classList.remove('active');
    updateSpeedLabel(); resetIdle(); focusOnSun();
  });

  // Mode buttons with toggle
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mode = btn.dataset.mode;
      if (mode === 'free' && s.cameraMode === 'free') {
        if (s.savedOrbitState) {
          camera.position.copy(s.savedOrbitState.position);
          controls.target.copy(s.savedOrbitState.target);
          controls.update(); s.savedOrbitState = null;
        }
        setCameraMode('orbit'); return;
      }
      if (mode === 'follow' && s.cameraMode === 'follow') { focusOnSun(); return; }
      setCameraMode(mode);
    });
  });

  // Tour button
  document.getElementById('btn-tour').addEventListener('click', () => {
    if (s.tourActive) { stopTour(); } else { startTour(); }
  });

  // Info panel close
  document.querySelector('#info-panel .close-btn').addEventListener('click', (e) => {
    e.stopPropagation(); hidePlanetInfo();
  });

  // Wheel zoom during tour
  window.addEventListener('wheel', (e) => {
    if (!s.tourActive || s.flyAnim || s.smoothTarget) return;
    s.tourZoomFactor *= (1 - Math.sign(e.deltaY) * 0.12);
    s.tourZoomFactor = THREE.MathUtils.clamp(s.tourZoomFactor, s.TOUR_ZOOM_MIN, s.TOUR_ZOOM_MAX);
    resetIdle();
  }, { passive: true });

  // Idle reset
  ['mousemove','click','keydown','wheel'].forEach(evt =>
    window.addEventListener(evt, resetIdle, { passive: true })
  );

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

// ==================== 主更新循环 ====================

export function updateUI(rawDelta, elapsed, sunMesh, planets, moonObj, clickableObjects, orbitLines, raycaster, mouse) {
  const s = uiState;
  const dtSec = rawDelta;

  // ---- 平滑相机 ----
  if (s.smoothTarget) {
    const el = performance.now() - s.smoothTarget.startTime;
    const t = Math.min(el / s.smoothTarget.duration, 1.0);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(s.smoothTarget.startPos, s.smoothTarget.endPos, e);
    controls.target.lerpVectors(s.smoothTarget.startTarget, s.smoothTarget.endTarget, e);
    if (t >= 1) s.smoothTarget = null;
  }

  // ---- 空闲检测 ----
  if (!s.flyAnim && !s.smoothTarget && s.cameraMode !== 'free' && !s.tourActive) {
    s.idleTime += rawDelta;
  }
  if (s.idleTime > s.IDLE_LIMIT && s.cameraMode !== 'orbit') {
    focusOnSun(); s.idleTime = 0;
  }

  // ---- 飞行动画 ----
  if (s.flyAnim && !s.smoothTarget) {
    const el = performance.now() - s.flyAnim.startTime;
    const t = Math.min(el / s.flyAnim.duration, 1.0);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(s.flyAnim.startPos, s.flyAnim.endPos, e);
    controls.target.lerpVectors(s.flyAnim.startTarget, s.flyAnim.endTarget, e);
    if (t >= 1) { s.flyAnim = null; s.idleTime = 0; }
  }

  // ---- 跟随模式 ----
  if (s.cameraMode === 'follow' && s.focusedPlanet && !s.smoothTarget && !s.flyAnim) {
    const wp = getPlanetWorldPos(s.focusedPlanet);
    if (s.lastPlanetPos) {
      const d = wp.clone().sub(s.lastPlanetPos); camera.position.add(d);
    }
    controls.target.copy(wp); s.lastPlanetPos = wp.clone();
  }

  // ---- 聚焦模式 ----
  if (s.cameraMode === 'focus' && s.focusedPlanet && !s.smoothTarget && !s.flyAnim) {
    controls.target.lerp(getPlanetWorldPos(s.focusedPlanet), 0.15);
  }

  // ---- 自由飞行 ----
  if (s.cameraMode === 'free') {
    const spd = s.freeFlySpeed * dtSec;
    const fwd = new THREE.Vector3(-Math.sin(s.freeFlyYaw)*Math.cos(s.freeFlyPitch), Math.sin(s.freeFlyPitch), -Math.cos(s.freeFlyYaw)*Math.cos(s.freeFlyPitch));
    const rt = new THREE.Vector3(Math.cos(s.freeFlyYaw), 0, -Math.sin(s.freeFlyYaw));
    if (s.freeFlyKeys.w) camera.position.addScaledVector(fwd, spd);
    if (s.freeFlyKeys.s) camera.position.addScaledVector(fwd, -spd);
    if (s.freeFlyKeys.a) camera.position.addScaledVector(rt, -spd);
    if (s.freeFlyKeys.d) camera.position.addScaledVector(rt, spd);
    if (s.freeFlyKeys.q) camera.position.y -= spd;
    if (s.freeFlyKeys.e) camera.position.y += spd;
    controls.target.copy(camera.position).addScaledVector(fwd, 10);
  }

  // ---- 自动巡航 ----
  const ts = tourStops(sunMesh, planets);
  if (s.tourActive && !s.flyAnim && !s.smoothTarget) {
    s.tourWaitTimer += rawDelta;
    const entry = ts[s.tourIndex]?.getEntry();
    if (entry) {
      const wp = getPlanetWorldPos(entry);
      if (!s.tourCameraOffset) {
        s.tourCameraOffset = camera.position.clone().sub(wp);
        s.tourBaseDistance = s.tourCameraOffset.length();
        s.tourBaseDirection = s.tourCameraOffset.normalize();
      }
      const pr = entry.data?.radius || 1;
      const cd = THREE.MathUtils.clamp(s.tourBaseDistance * s.tourZoomFactor, pr*1.3, pr*50);
      camera.position.lerp(wp.clone().add(s.tourBaseDirection.clone().multiplyScalar(cd)), 0.15);
      controls.target.lerp(wp, 0.2);
    }
    if (s.tourWaitTimer >= s.TOUR_WAIT) {
      gotoNextTourStop(ts);
      s.tourWaitTimer = 0;
      const next = ts[s.tourIndex].getEntry();
      if (next) { flyToPlanet(next, s.TOUR_FLY_DURATION); showPlanetInfo(next.mesh); }
    }
  }

  // ---- 闪烁星 ----
  // handled externally with twinkleStars array

  // ---- 轨道线 hover 高亮 ----
  orbitLines.forEach(l => { l.material.color.set(0x4FC3FF); l.material.opacity = 0.7; });
  if (s.hoveredObject) {
    const idx = planets.findIndex(p => p.mesh === s.hoveredObject);
    if (idx >= 0 && orbitLines[idx]) { orbitLines[idx].material.color.set(0x00FFFF); orbitLines[idx].material.opacity = 1.0; }
  }
}
