import * as THREE from 'three';
import './style.css';
import { scene, camera, renderer, controls, maxAniso, setupLighting, setupPostProcessing, updatePostProcessingSize } from './scene.js';
import { createStarfield, createSun, createLensFlare, createTwinkleStars, createPlanetsAndMoon, updateFlareVisibility } from './objects.js';
import { uiState, resetIdle, showPlanetInfo, hidePlanetInfo, setCameraMode, focusOnSun, focusOnPlanet, followPlanet, flyToPlanet, startTour, stopTour, tourStops, setupKeyboard, setupControlPanel, updateUI, getPlanetWorldPos } from './ui.js';

// ==================== 初始化 ====================

// Lighting & Post
setupLighting();
const { bloomComposer, mainComposer, bokehPass, BLOOM_LAYER } = setupPostProcessing();

// Objects
const starfield = createStarfield();
const { sunGroup, sunMesh } = createSun();
const flareGroup = createLensFlare(sunGroup);
const twinkleStars = createTwinkleStars();
const { planets, moonObj, clickableObjects, orbitLines, labelSprites } = createPlanetsAndMoon();
clickableObjects.unshift(sunMesh); // sun first

// Bloom layer tagging
sunGroup.traverse(c => c.layers.enable(BLOOM_LAYER));
flareGroup.traverse(c => c.layers.enable(BLOOM_LAYER));
starfield.traverse(c => c.layers.enable(BLOOM_LAYER));
twinkleStars.forEach(s => s.layers.enable(BLOOM_LAYER));

// Camera init
camera.position.set(30, 35, 70);
controls.update();

// UI setup
setupKeyboard();
const ts = tourStops(sunMesh, planets);
setupControlPanel(planets, null, orbitLines, labelSprites, sunMesh);

// ==================== 射线交互 ====================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateMouse(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function findPlanetEntry(obj) {
  return planets.find(p => p.mesh === obj) || (moonObj?.mesh === obj ? { mesh: moonObj.mesh, data: moonObj.mesh.userData } : null);
}

// Hover
window.addEventListener('mousemove', (e) => {
  updateMouse(e);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);
  const s = uiState;

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (s.hoveredObject !== obj) {
      if (s.hoveredObject?.material?.emissive?.setHex) s.hoveredObject.material.emissive.setHex(0x000000);
      s.hoveredObject = obj;
      document.body.style.cursor = 'pointer';
      if (obj.material?.emissive?.setHex) obj.material.emissive.setHex(0x222222);
    }
  } else {
    if (s.hoveredObject?.material?.emissive?.setHex) s.hoveredObject.material.emissive.setHex(0x000000);
    s.hoveredObject = null;
    document.body.style.cursor = s.cameraMode === 'free' ? 'crosshair' : 'grab';
  }
});

// Click (with double-click detection)
window.addEventListener('click', (e) => {
  if (e.target.closest('#info-panel') || e.target.closest('#ctrl-bar')) return;
  const s = uiState;
  updateMouse(e);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (s.clickTimer && s.lastClickedObj === obj) {
      clearTimeout(s.clickTimer); s.clickTimer = null; s.lastClickedObj = null;
      const entry = findPlanetEntry(obj);
      if (entry) { flyToPlanet(entry); if (s.cameraMode === 'orbit') setCameraMode('focus'); }
      return;
    }
    s.lastClickedObj = obj;
    s.clickTimer = setTimeout(() => {
      showPlanetInfo(obj);
      if (obj === sunMesh) focusOnSun();
      if (s.cameraMode === 'focus' || s.cameraMode === 'follow') {
        const entry = findPlanetEntry(obj);
        if (entry) s.cameraMode === 'focus' ? focusOnPlanet(entry) : followPlanet(entry);
      }
      s.clickTimer = null; s.lastClickedObj = null;
    }, 280);
  } else {
    hidePlanetInfo();
    if (s.cameraMode === 'focus' || s.cameraMode === 'follow') setCameraMode('orbit');
  }
});

// ==================== 动画循环 ====================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const s = uiState;
  const rawDelta = Math.min(clock.getDelta(), 0.1);
  const delta = s.isPaused ? 0 : rawDelta * s.timeScale;
  const elapsed = performance.now() * 0.001;

  // Sun glow
  const glowMats = sunGroup.userData;
  if (glowMats?.glowMat1) glowMats.glowMat1.uniforms.uTime.value = elapsed;
  if (glowMats?.glowMat2) glowMats.glowMat2.uniforms.uTime.value = elapsed;

  // Sun rotation
  sunMesh.rotation.y += delta * 0.3;

  // Planets
  planets.forEach(p => {
    p.orbitGroup.rotation.y += p.orbitSpeed * delta;
    p.mesh.rotation.y += p.rotSpeed * delta;
  });

  // Moon
  if (moonObj) {
    moonObj.orbitGroup.rotation.y += moonObj.orbitSpeed * delta;
    moonObj.mesh.rotation.y += moonObj.rotSpeed * delta;
  }

  // Starfield
  starfield.rotation.y += delta * 0.012;
  starfield.rotation.x += delta * 0.002;

  // UI update (camera modes, tour, etc.)
  updateUI(rawDelta, elapsed, sunMesh, planets, moonObj, clickableObjects, orbitLines, raycaster, mouse);

  // Dynamic DOF
  const targetDist = s.focusedPlanet ? camera.position.distanceTo(getPlanetWorldPos(s.focusedPlanet)) : camera.position.length();
  bokehPass.uniforms['focus'].value = THREE.MathUtils.lerp(bokehPass.uniforms['focus'].value, targetDist, 0.05);

  // Dynamic near/far
  const dynNear = Math.max(0.001, targetDist * 0.01);
  const dynFar = Math.max(targetDist * 50, 5000);
  if (Math.abs(camera.near - dynNear) > 0.0001 || Math.abs(camera.far - dynFar) > 1) {
    camera.near = dynNear; camera.far = dynFar; camera.updateProjectionMatrix();
  }

  // Flare visibility
  updateFlareVisibility(flareGroup);

  // Twinkle stars
  twinkleStars.forEach(st => {
    const ud = st.userData;
    st.material.opacity = ud.minOpacity + (Math.sin(elapsed * ud.speed + ud.phase) * 0.5 + 0.5) * (ud.maxOpacity - ud.minOpacity);
  });

  // Render: selective bloom
  controls.update();
  camera.layers.set(BLOOM_LAYER);
  bloomComposer.render();
  camera.layers.enableAll();
  mainComposer.render();

  // Hide loading screen after first frame
  const loadingEl = document.getElementById('loading');
  if (loadingEl && !loadingEl.classList.contains('hidden')) {
    loadingEl.classList.add('hidden');
    setTimeout(() => loadingEl.remove(), 600);
  }
}

// ==================== 启动 ====================

animate();

console.log('🚀 Solar System Simulator — NASA Mission Control');
console.log(`   Planets: ${planets.length} | Clickable: ${clickableObjects.length}`);
console.log('   Textures: 2048² | Anisotropy: ' + maxAniso + 'x | Depth: Logarithmic');

// Expose for console debugging
window.__solarSystem = { scene, camera, renderer, controls, planets, moonObj, sunMesh, focusOnSun, startTour, stopTour };
