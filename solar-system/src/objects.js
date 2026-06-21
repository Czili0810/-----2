import * as THREE from 'three';
import { scene, camera, maxAniso } from './scene.js';
import { planetData, moonData, sunInfo, getBandColors } from './data.js';
import { createSunTexture, createRockyTexture, createGasGiantTexture, createRingTexture, createStarfieldTexture, makeFlareTex } from './textures.js';

// ==================== 星空背景 ====================

export function createStarfield() {
  const starfieldGroup = new THREE.Group();
  const skyTex = createStarfieldTexture();
  skyTex.colorSpace = THREE.SRGBColorSpace;
  starfieldGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(170, 64, 32),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, depthWrite: false })
  ));

  const starSprite = makeFlareTex(32, 32, (ctx, w) => {
    const g = ctx.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.08,'rgba(255,255,255,0.95)');
    g.addColorStop(0.2,'rgba(220,235,255,0.6)'); g.addColorStop(0.4,'rgba(150,180,220,0.15)');
    g.addColorStop(0.7,'rgba(50,80,150,0.02)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,32,32);
  });

  [{ pos: [45,55,80], color: 0xffffff, size: 1.8 }, { pos: [-70,40,-50], color: 0xffeedd, size: 1.5 },
   { pos: [90,-30,20], color: 0xccddff, size: 1.6 }, { pos: [-20,-60,90], color: 0xffffdd, size: 1.4 },
   { pos: [60,-20,-80], color: 0xffffff, size: 1.7 }, { pos: [-85,15,60], color: 0xffddaa, size: 1.3 },
   { pos: [30,70,-40], color: 0xaaccff, size: 1.5 }, { pos: [-50,-45,-70], color: 0xffffcc, size: 1.4 }]
    .forEach(star => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starSprite, color: star.color, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, transparent: true, opacity: 0.85 }));
      s.position.set(...star.pos); s.scale.setScalar(star.size); starfieldGroup.add(s);
    });

  const medCount = 800, medPos = new Float32Array(medCount*3), medCol = new Float32Array(medCount*3);
  for (let i = 0; i < medCount; i++) {
    const theta = Math.random()*Math.PI*2, phi = Math.acos(2*Math.random()-1), r = 130 + Math.random()*30;
    medPos[i*3]=r*Math.sin(phi)*Math.cos(theta); medPos[i*3+1]=r*Math.sin(phi)*Math.sin(theta); medPos[i*3+2]=r*Math.cos(phi);
    const tr = Math.random();
    let cr,cg,cb;
    if(tr<0.05){cr=0.7;cg=0.8;cb=1.0;}else if(tr<0.2){cr=0.9;cg=0.95;cb=1.0;}else if(tr<0.5){cr=1.0;cg=0.95;cb=0.8;}else{cr=1.0;cg=0.85;cb=0.65;}
    const b = 0.4+Math.random()*0.6; medCol[i*3]=cr*b; medCol[i*3+1]=cg*b; medCol[i*3+2]=cb*b;
  }
  const medGeo = new THREE.BufferGeometry();
  medGeo.setAttribute('position', new THREE.BufferAttribute(medPos,3));
  medGeo.setAttribute('color', new THREE.BufferAttribute(medCol,3));
  starfieldGroup.add(new THREE.Points(medGeo, new THREE.PointsMaterial({ map: starSprite, size:0.7, blending:THREE.AdditiveBlending, depthWrite:false, transparent:true, vertexColors:true, sizeAttenuation:true })));
  scene.add(starfieldGroup);
  return starfieldGroup;
}

// ==================== 太阳 ====================

export function createSun() {
  const sunGroup = new THREE.Group();
  const sunTex = createSunTexture(); sunTex.colorSpace = THREE.SRGBColorSpace; sunTex.anisotropy = maxAniso;
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(3.5, 96, 48), new THREE.MeshBasicMaterial({ map: sunTex }));
  sunMesh.name = '太阳'; sunMesh.userData = { ...sunInfo };
  sunGroup.add(sunMesh);

  // 三层光晕
  [{ rad: 3.8, seg: 48, uc1: '#ffdd60', uc2: '#ff8800', pow: 2.8, alpha: 0.55, pulse: true },
   { rad: 4.8, seg: 36, uc1: '#ff8830', uc2: '#ff8830', pow: 4.5, alpha: 0.3, pulse: false },
   { rad: 6.5, seg: 24, uc1: '#ee5500', uc2: '#ee5500', pow: 6.5, alpha: 0.12, pulse: false }]
    .forEach((cfg, idx) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor1: { value: new THREE.Color(cfg.uc1) }, uColor2: { value: new THREE.Color(cfg.uc2) }, uTime: { value: 0 } },
        vertexShader: `varying vec3 vW; varying vec3 vN; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `varying vec3 vW; varying vec3 vN; uniform vec3 uColor1,uColor2; uniform float uTime; void main(){ vec3 v=normalize(cameraPosition-vW); float f=1.-abs(dot(v,vN)); f=pow(f,${cfg.pow.toFixed(1)}); ${cfg.pulse?'float p=1.+sin(uTime*2.5+f*6.)*.08;':'float p=1.;'} vec3 c=mix(uColor1,uColor2,f); gl_FragColor=vec4(c,f*${cfg.alpha.toFixed(2)}*p); }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      sunGroup.add(new THREE.Mesh(new THREE.SphereGeometry(cfg.rad, cfg.seg, cfg.seg/2), mat));
      if (idx === 0) sunGroup.userData = { glowMat1: mat };
      if (idx === 1) sunGroup.userData = { ...sunGroup.userData, glowMat2: mat };
    });

  // 日冕 sprite
  const coronaTex = makeFlareTex(128, 128, (ctx, w) => {
    const g = ctx.createRadialGradient(w/2,w/2,10,w/2,w/2,w/2);
    g.addColorStop(0,'rgba(255,200,80,0.5)'); g.addColorStop(0.15,'rgba(255,150,30,0.3)');
    g.addColorStop(0.35,'rgba(255,100,10,0.1)'); g.addColorStop(0.6,'rgba(200,50,0,0.03)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,128,128);
  });
  const coronaSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: coronaTex, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, transparent: true, opacity: 0.7 }));
  coronaSprite.scale.setScalar(18); sunGroup.add(coronaSprite);
  scene.add(sunGroup);
  return { sunGroup, sunMesh };
}

// ==================== 镜头耀斑 ====================

export function createLensFlare(sunGroup) {
  const flareGroup = new THREE.Group();
  function addFlare(tex, sx, sy, opacity, dt = true) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthTest: dt, depthWrite: false, transparent: true, opacity }));
    s.scale.set(sx, sy, 1); s.userData.baseOpacity = opacity; flareGroup.add(s); return s;
  }
  const glowTex = makeFlareTex(256,256,(ctx,w)=>{const g=ctx.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);g.addColorStop(0,'rgba(255,170,40,0.65)');g.addColorStop(0.12,'rgba(255,130,15,0.35)');g.addColorStop(0.35,'rgba(255,70,5,0.08)');g.addColorStop(0.65,'rgba(180,20,0,0.01)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);});
  addFlare(glowTex,24,24,0.55);
  const coreTex = makeFlareTex(128,128,(ctx,w)=>{const g=ctx.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);g.addColorStop(0,'rgba(255,255,245,0.95)');g.addColorStop(0.06,'rgba(255,235,170,0.65)');g.addColorStop(0.2,'rgba(255,190,40,0.2)');g.addColorStop(0.45,'rgba(255,80,5,0.03)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);});
  addFlare(coreTex,12,12,0.65);
  const streakTex = makeFlareTex(512,48,(ctx,w,h)=>{const g=ctx.createLinearGradient(0,h/2,w,h/2);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.28,'rgba(0,0,0,0)');g.addColorStop(0.35,'rgba(255,180,50,0.2)');g.addColorStop(0.44,'rgba(255,220,120,0.28)');g.addColorStop(0.5,'rgba(255,240,200,0.32)');g.addColorStop(0.56,'rgba(255,220,120,0.28)');g.addColorStop(0.65,'rgba(255,180,50,0.2)');g.addColorStop(0.72,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});
  addFlare(streakTex,28,1.2,0.4);
  const vStreakTex = makeFlareTex(48,512,(ctx,w,h)=>{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.35,'rgba(255,180,40,0.08)');g.addColorStop(0.5,'rgba(255,220,120,0.12)');g.addColorStop(0.65,'rgba(255,180,40,0.08)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});
  addFlare(vStreakTex,1.0,24,0.2);
  const ringTex = makeFlareTex(128,128,(ctx,w)=>{const g=ctx.createRadialGradient(w/2,w/2,w*0.15,w/2,w/2,w*0.3);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.3,'rgba(255,150,30,0.12)');g.addColorStop(0.55,'rgba(255,130,20,0.18)');g.addColorStop(0.8,'rgba(200,80,10,0.06)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);});
  addFlare(ringTex,16,16,0.3);
  [{color:'rgba(255,60,40,0.25)',x:1.8},{color:'rgba(80,220,80,0.18)',x:-1.5},{color:'rgba(60,100,255,0.2)',x:0.9}].forEach(d=>{
    const dotTex = makeFlareTex(32,32,(ctx,w)=>{const g=ctx.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);g.addColorStop(0,d.color);g.addColorStop(0.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,32,32);});
    const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map:dotTex, blending:THREE.AdditiveBlending, depthTest:false, depthWrite:false, transparent:true, opacity:0.5 }));
    dot.position.set(d.x,0,0); dot.scale.set(5,5,1); flareGroup.add(dot);
  });
  sunGroup.add(flareGroup);
  return flareGroup;
}

// ==================== 闪烁星 ====================

export function createTwinkleStars() {
  const twinkleTex = makeFlareTex(32,32,(ctx,w)=>{const g=ctx.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);g.addColorStop(0,'rgba(255,255,255,0.9)');g.addColorStop(0.15,'rgba(220,235,255,0.5)');g.addColorStop(0.4,'rgba(150,180,220,0.1)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,32,32);});
  const colors = [0xffffff,0xffeedd,0xccddff,0xffffdd,0xffddaa,0xaaccff,0xffeebb,0xeeeeff];
  const stars = [];
  for (let i = 0; i < 50; i++) {
    const theta = Math.random()*Math.PI*2, phi = Math.acos(2*Math.random()-1), r = 100+Math.random()*60;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:twinkleTex, color:colors[Math.floor(Math.random()*colors.length)], blending:THREE.AdditiveBlending, depthWrite:false, depthTest:false, transparent:true, opacity:0 }));
    s.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.sin(phi)*Math.sin(theta), r*Math.cos(phi));
    s.scale.setScalar(0.6+Math.random()*1.6);
    s.userData = { phase: Math.random()*Math.PI*2, speed: 0.3+Math.random()*1.5, minOpacity: 0.05+Math.random()*0.2, maxOpacity: 0.5+Math.random()*0.5 };
    scene.add(s); stars.push(s);
  }
  return stars;
}

// ==================== 行星 & 月球 & 环 ====================

export function createPlanetsAndMoon() {
  const planets = [];
  const clickableObjects = [];
  const orbitLines = [];
  const labelSprites = [];

  function createLabelSprite(text, color = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 26px "PingFang SC","Microsoft YaHei","Segoe UI",sans-serif';
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 6;
    ctx.fillText(text, 128, 32); ctx.shadowBlur = 0;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true, depthWrite: false, transparent: true }));
    sprite.scale.set(5, 1.25, 1); sprite.visible = false;
    return sprite;
  }

  planetData.forEach((data) => {
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    let texture;
    if (data.name === '地球') texture = createRockyTexture(data.color, 'earth', 2048);
    else if (data.name === '火星') texture = createRockyTexture(data.color, 'mars', 2048);
    else if (data.name === '金星') texture = createRockyTexture(data.color, 'venus', 2048);
    else if (['木星','土星','天王星','海王星'].includes(data.name)) texture = createGasGiantTexture(getBandColors(data.name), 2048);
    else texture = createRockyTexture(data.color, 'default', 2048);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAniso;

    const segs = data.radius > 2 ? 72 : 48;
    const planetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius, segs, segs/2),
      new THREE.MeshStandardMaterial({ map: texture, roughness: data.roughness||0.7, metalness: data.metalness||0.05 })
    );
    planetMesh.castShadow = true; planetMesh.receiveShadow = true;
    planetMesh.name = data.name; planetMesh.userData = data;

    if (data.name === '地球') {
      const earthPivot = new THREE.Group();
      earthPivot.position.set(data.distance, 0, 0);
      orbitGroup.add(earthPivot);
      planetMesh.position.set(0, 0, 0);
      earthPivot.add(planetMesh);
      planetMesh.userData._earthPivot = earthPivot;
    } else {
      planetMesh.position.set(data.distance, 0, 0);
      orbitGroup.add(planetMesh);
    }
    clickableObjects.push(planetMesh);

    // 土星环
    if (data.hasRings) {
      const ringTex = createRingTexture(); ringTex.colorSpace = THREE.SRGBColorSpace; ringTex.anisotropy = maxAniso;
      const ringGeo = new THREE.RingGeometry(data.radius*1.3, data.radius*2.3, 200);
      const pos = ringGeo.attributes.position, uv = ringGeo.attributes.uv;
      const iR = data.radius*1.3, oR = data.radius*2.3;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        uv.setXY(i, (Math.sqrt(x*x+y*y)-iR)/(oR-iR), 0.5);
      }
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
        map: ringTex, side: THREE.DoubleSide, transparent: true,
        roughness: 0.55, metalness: 0.05, depthWrite: true, alphaTest: 0.02,
      }));
      ring.rotation.x = -Math.PI/2 + 0.45; ring.castShadow = true; ring.receiveShadow = true;
      ring.raycast = () => {};
      planetMesh.add(ring);
    }

    // 轨道线
    const oPts = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i/256)*Math.PI*2;
      oPts.push(new THREE.Vector3(Math.cos(a)*data.distance, 0, Math.sin(a)*data.distance));
    }
    const oLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(oPts),
      new THREE.LineBasicMaterial({ color: 0x4FC3FF, transparent: true, opacity: 0.7, depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    scene.add(oLine); orbitLines.push(oLine);

    // 标签
    const label = createLabelSprite(data.name);
    label.position.set(0, data.radius + 1.0, 0);
    planetMesh.add(label); labelSprites.push(label);

    planets.push({ mesh: planetMesh, orbitGroup, rotSpeed: data.rotSpeed, orbitSpeed: data.orbitSpeed, data });
  });

  // ===== 月球 =====
  let moonObj = null;
  const earthPlanet = planets.find(p => p.data.name === '地球');
  if (earthPlanet?.mesh.userData._earthPivot) {
    const earthPivot = earthPlanet.mesh.userData._earthPivot;
    const moonOrbitGroup = new THREE.Group(); earthPivot.add(moonOrbitGroup);

    const moonTex = createRockyTexture(moonData.color, 'default', 2048); moonTex.colorSpace = THREE.SRGBColorSpace; moonTex.anisotropy = maxAniso;
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(moonData.radius, 40, 20),
      new THREE.MeshStandardMaterial({ map: moonTex, roughness: moonData.roughness, metalness: moonData.metalness })
    );
    moonMesh.position.set(moonData.moonDistance, 0, 0);
    moonMesh.castShadow = true; moonMesh.receiveShadow = true;
    moonMesh.name = moonData.name; moonMesh.userData = moonData;
    moonOrbitGroup.add(moonMesh); clickableObjects.push(moonMesh);

    const moPts = [];
    for (let i = 0; i <= 100; i++) {
      const a = (i/100)*Math.PI*2;
      moPts.push(new THREE.Vector3(Math.cos(a)*moonData.moonDistance, 0, Math.sin(a)*moonData.moonDistance));
    }
    const moLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(moPts),
      new THREE.LineBasicMaterial({ color: 0x4FC3FF, transparent: true, opacity: 0.7, depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    earthPivot.add(moLine); orbitLines.push(moLine);

    const moonLabel = createLabelSprite('🌙 月球', '#ccccdd');
    moonLabel.position.set(0, moonData.radius + 0.5, 0); moonLabel.scale.set(3.5, 0.9, 1);
    moonMesh.add(moonLabel); labelSprites.push(moonLabel);

    moonObj = { mesh: moonMesh, orbitGroup: moonOrbitGroup, orbitSpeed: moonData.orbitSpeed, rotSpeed: moonData.rotSpeed };
  }

  return { planets, moonObj, clickableObjects, orbitLines, labelSprites };
}

// ==================== 耀斑可见性 ====================

export function updateFlareVisibility(flareGroup) {
  const dist = camera.position.length();
  const vis = THREE.MathUtils.clamp(1 - (dist - 8) / 130, 0.1, 1);
  flareGroup.children.forEach(c => {
    if (c.userData.baseOpacity !== undefined && c.material) {
      c.material.opacity = vis * c.userData.baseOpacity;
    }
  });
}
