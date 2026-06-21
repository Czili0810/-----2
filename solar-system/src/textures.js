import * as THREE from 'three';
import { hexToRgb, clamp } from './data.js';

// ==================== 程序化纹理生成 ====================

/** 太阳纹理 (1024×512) */
export function createSunTexture(size = 1024) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size / 2;
  const ctx = c.getContext('2d');
  const w = size, h = size / 2;
  const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
  grad.addColorStop(0, '#fffff8'); grad.addColorStop(0.04, '#ffffcc');
  grad.addColorStop(0.12, '#ffe880'); grad.addColorStop(0.28, '#ffcc44');
  grad.addColorStop(0.5, '#ff9922'); grad.addColorStop(0.72, '#ee6611');
  grad.addColorStop(0.9, '#cc3300'); grad.addColorStop(0.97, '#991100'); grad.addColorStop(1, '#660800');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i+1] = Math.min(255, Math.max(0, data[i+1] + n * 0.7));
    data[i+2] = Math.min(255, Math.max(0, data[i+2] + n * 0.3));
  }
  ctx.putImageData(imageData, 0, 0);
  for (let i = 0; i < 15; i++) {
    const cx = w * 0.2 + Math.random() * w * 0.6, cy = h * 0.2 + Math.random() * h * 0.6;
    ctx.beginPath(); ctx.arc(cx, cy, 4 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(80,40,10,${0.3 + Math.random() * 0.5})`; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 8 + Math.random() * 16, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(150,100,30,${0.15 + Math.random() * 0.25})`; ctx.fill();
  }
  for (let i = 0; i < 50; i++) {
    const bx = Math.random() * w, by = Math.random() * h, br = 2 + Math.random() * 8;
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,220,${Math.random() * 0.45})`; ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

/** 岩石行星纹理 (2048²) */
export function createRockyTexture(baseColor, features = 'default', size = 2048) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size / 2;
  const ctx = c.getContext('2d');
  const w = size, h = size / 2;
  const rgb = hexToRgb(baseColor);
  ctx.fillStyle = baseColor; ctx.fillRect(0, 0, w, h);

  if (features === 'earth') {
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, '#2255aa'); oceanGrad.addColorStop(0.3, '#3366cc');
    oceanGrad.addColorStop(0.5, '#4488dd'); oceanGrad.addColorStop(0.7, '#3366cc');
    oceanGrad.addColorStop(1, '#2255aa');
    ctx.fillStyle = oceanGrad; ctx.fillRect(0, 0, w, h);
    const continents = [
      { cx: 0.55, cy: 0.32, pts: [{dx:0,dy:-0.14},{dx:0.1,dy:-0.08},{dx:0.14,dy:0},{dx:0.1,dy:0.1},{dx:0,dy:0.14},{dx:-0.08,dy:0.1},{dx:-0.12,dy:0},{dx:-0.06,dy:-0.08}] },
      { cx: 0.22, cy: 0.42, pts: [{dx:0,dy:-0.1},{dx:0.08,dy:-0.05},{dx:0.1,dy:0.05},{dx:0.04,dy:0.1},{dx:-0.06,dy:0.08},{dx:-0.1,dy:0},{dx:-0.06,dy:-0.08}] },
      { cx: 0.38, cy: 0.38, pts: [{dx:0,dy:-0.06},{dx:0.05,dy:0},{dx:0.04,dy:0.06},{dx:-0.03,dy:0.04},{dx:-0.05,dy:-0.02}] },
      { cx: 0.8, cy: 0.55, pts: [{dx:0,dy:-0.05},{dx:0.04,dy:-0.02},{dx:0.05,dy:0.03},{dx:0,dy:0.05},{dx:-0.04,dy:0}] },
      { cx: 0.48, cy: 0.88, pts: [{dx:0,dy:-0.03},{dx:0.2,dy:0},{dx:0,dy:0.03},{dx:-0.2,dy:0}] },
    ];
    continents.forEach(cont => {
      ctx.beginPath();
      ctx.moveTo((cont.cx + cont.pts[0].dx) * w, (cont.cy + cont.pts[0].dy) * h);
      for (let i = 1; i < cont.pts.length; i++) ctx.lineTo((cont.cx + cont.pts[i].dx) * w, (cont.cy + cont.pts[i].dy) * h);
      ctx.closePath();
      ctx.fillStyle = `rgb(${55 + Math.random()*35},${125 + Math.random()*45},${45 + Math.random()*35})`; ctx.fill();
      for (let j = 0; j < 60; j++) {
        const dp = cont.pts[Math.floor(Math.random() * cont.pts.length)];
        const dx = (cont.cx + dp.dx * (0.2 + Math.random() * 0.8)) * w, dy = (cont.cy + dp.dy * (0.2 + Math.random() * 0.8)) * h;
        ctx.beginPath(); ctx.arc(dx, dy, Math.random() * 12 + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.random()>0.5?'70,150,60':'110,155,80'},${0.3 + Math.random()*0.4})`; ctx.fill();
      }
    });
    const iceTop = ctx.createLinearGradient(0, 0, 0, h * 0.1);
    iceTop.addColorStop(0, 'rgba(245,250,255,0.9)'); iceTop.addColorStop(0.5, 'rgba(240,245,255,0.4)'); iceTop.addColorStop(1, 'rgba(240,245,255,0)');
    ctx.fillStyle = iceTop; ctx.fillRect(0, 0, w, h * 0.1);
    const iceBot = ctx.createLinearGradient(0, h * 0.88, 0, h);
    iceBot.addColorStop(0, 'rgba(240,245,255,0)'); iceBot.addColorStop(0.5, 'rgba(240,245,255,0.5)'); iceBot.addColorStop(1, 'rgba(245,250,255,0.9)');
    ctx.fillStyle = iceBot; ctx.fillRect(0, h * 0.88, w, h * 0.12);
    for (let i = 0; i < 120; i++) {
      ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*18+2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.12})`; ctx.fill();
    }
  } else if (features === 'mars') {
    for (let i = 0; i < 300; i++) {
      const x = Math.random()*w, y = Math.random()*h, r = Math.random()*18+2, v = (Math.random()-0.5)*45;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${clamp(rgb.r+v)},${clamp(rgb.g+v*0.5)},${clamp(rgb.b+v*0.3)},${Math.random()*0.45})`; ctx.fill();
    }
    for (let i = 0; i < 40; i++) {
      ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*22+4, 0, Math.PI*2);
      ctx.fillStyle = `rgba(100,25,8,${Math.random()*0.45})`; ctx.fill();
    }
    ctx.fillStyle = 'rgba(240,242,250,0.55)'; ctx.fillRect(0,0,w,h*0.06); ctx.fillRect(0,h*0.93,w,h*0.07);
    for (let i = 0; i < 80; i++) {
      ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*5+1, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(0,0,0,${Math.random()*0.35})`; ctx.lineWidth = 0.6; ctx.stroke();
    }
  } else if (features === 'venus') {
    for (let i = 0; i < 250; i++) {
      ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*20+3, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,240,210,${Math.random()*0.22})`; ctx.fill();
    }
    for (let i = 0; i < 8; i++) {
      const y = (i/7)*h;
      ctx.beginPath(); ctx.moveTo(0, y-5); ctx.quadraticCurveTo(w/2, y+(Math.random()-0.5)*12, w, y+5);
      ctx.lineTo(w, y+12); ctx.quadraticCurveTo(w/2, y+8+(Math.random()-0.5)*14, 0, y+6);
      ctx.fillStyle = 'rgba(200,170,120,0.08)'; ctx.fill();
    }
  } else {
    for (let i = 0; i < 300; i++) {
      const x = Math.random()*w, y = Math.random()*h, r = Math.random()*15+2, v = (Math.random()-0.5)*50;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${clamp(rgb.r+v)},${clamp(rgb.g+v)},${clamp(rgb.b+v)},${Math.random()*0.5})`; ctx.fill();
    }
    for (let i = 0; i < 100; i++) {
      ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*6+1, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(0,0,0,${Math.random()*0.35})`; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.15})`; ctx.fill();
    }
  }
  return new THREE.CanvasTexture(c);
}

/** 气态巨行星纹理 (2048²) */
export function createGasGiantTexture(bands, size = 2048) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size / 2;
  const ctx = c.getContext('2d');
  const w = size, h = size / 2;
  ctx.fillStyle = bands[0]; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < bands.length; i++) {
    const y = (i / (bands.length - 1)) * h, bandH = (h / bands.length) * 1.5;
    const grad = ctx.createLinearGradient(0, y - bandH/2, 0, y + bandH/2);
    grad.addColorStop(0, 'transparent'); grad.addColorStop(0.35, bands[i]); grad.addColorStop(0.65, bands[i]); grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(0, y - bandH/2, w, bandH);
  }
  for (let i = 0; i < 250; i++) {
    const x = Math.random()*w, y = Math.random()*h, rx = Math.random()*35+3, ry = Math.random()*4+0.5;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.fillStyle = Math.random()>0.5 ? `rgba(255,255,240,${Math.random()*0.12})` : `rgba(150,120,80,${Math.random()*0.1})`; ctx.fill();
  }
  for (let i = 0; i < 100; i++) {
    ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*8+1, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${Math.random()>0.5?'255,240,200':'180,140,80'},${Math.random()*0.2})`; ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

/** 土星环纹理 (1024×64) */
export function createRingTexture(size = 1024) {
  const c = document.createElement('canvas');
  c.width = size; c.height = 64;
  const ctx = c.getContext('2d');
  const w = size;
  function gradientBand(x0, x1, colorStops) {
    const grad = ctx.createLinearGradient(x0, 0, x1, 0);
    colorStops.forEach(([pos, color]) => grad.addColorStop(pos, color));
    ctx.fillStyle = grad; ctx.fillRect(x0, 0, x1 - x0 + 1, 64);
  }
  gradientBand(0, w*0.05, [[0,'rgba(170,150,120,0)'],[0.5,'rgba(185,160,130,0.06)'],[1,'rgba(190,168,138,0)']]);
  gradientBand(w*0.04, w*0.17, [[0,'rgba(175,155,125,0.01)'],[0.15,'rgba(195,172,142,0.18)'],[0.45,'rgba(205,182,152,0.25)'],[0.7,'rgba(195,172,142,0.16)'],[1,'rgba(180,158,128,0.02)']]);
  gradientBand(w*0.17, w*0.20, [[0,'rgba(170,150,120,0.02)'],[0.5,'rgba(160,140,110,0.05)'],[1,'rgba(180,158,128,0.01)']]);
  gradientBand(w*0.20, w*0.50, [[0,'rgba(190,170,140,0.05)'],[0.04,'rgba(225,200,165,0.65)'],[0.18,'rgba(240,215,180,0.92)'],[0.35,'rgba(238,212,177,0.9)'],[0.5,'rgba(235,210,175,0.85)'],[0.65,'rgba(232,207,172,0.82)'],[0.82,'rgba(225,200,165,0.7)'],[0.94,'rgba(200,178,148,0.25)'],[1,'rgba(140,120,95,0.01)']]);
  gradientBand(w*0.50, w*0.565, [[0,'rgba(80,55,35,0.01)'],[0.1,'rgba(100,75,50,0.06)'],[0.3,'rgba(60,40,22,0.035)'],[0.5,'rgba(50,32,18,0.03)'],[0.7,'rgba(65,42,25,0.04)'],[0.9,'rgba(110,85,60,0.06)'],[1,'rgba(160,135,105,0.01)']]);
  gradientBand(w*0.565, w*0.80, [[0,'rgba(170,148,118,0.04)'],[0.04,'rgba(215,190,158,0.55)'],[0.18,'rgba(228,203,170,0.78)'],[0.30,'rgba(230,205,172,0.80)'],[0.32,'rgba(115,90,68,0.06)'],[0.335,'rgba(70,48,30,0.025)'],[0.35,'rgba(200,175,145,0.45)'],[0.38,'rgba(225,200,167,0.72)'],[0.50,'rgba(225,200,167,0.74)'],[0.51,'rgba(130,105,80,0.04)'],[0.515,'rgba(210,185,155,0.60)'],[0.7,'rgba(220,195,163,0.55)'],[0.88,'rgba(200,175,145,0.22)'],[1,'rgba(155,132,105,0.01)']]);
  gradientBand(w*0.80, w*0.85, [[0,'rgba(140,120,95,0.01)'],[0.5,'rgba(120,100,78,0.03)'],[1,'rgba(145,125,100,0.01)']]);
  gradientBand(w*0.85, w*0.95, [[0,'rgba(155,135,108,0)'],[0.2,'rgba(200,178,148,0.08)'],[0.5,'rgba(195,173,143,0.06)'],[0.8,'rgba(180,160,132,0.03)'],[1,'rgba(155,135,108,0)']]);
  gradientBand(w*0.95, w, [[0,'rgba(140,120,95,0)'],[1,'rgba(0,0,0,0)']]);
  return new THREE.CanvasTexture(c);
}

/** 星空天空球纹理 (4096×2048) */
export function createStarfieldTexture(size = 4096) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size / 2;
  const ctx = c.getContext('2d');
  const w = size, h = size / 2;
  ctx.fillStyle = '#000008'; ctx.fillRect(0, 0, w, h);
  const mwGrad = ctx.createLinearGradient(0, 0, 0, h);
  mwGrad.addColorStop(0, 'rgba(8,8,30,0)'); mwGrad.addColorStop(0.15, 'rgba(10,10,35,0.3)');
  mwGrad.addColorStop(0.35, 'rgba(15,12,45,0.7)'); mwGrad.addColorStop(0.45, 'rgba(20,15,55,0.85)');
  mwGrad.addColorStop(0.5, 'rgba(22,16,58,0.9)'); mwGrad.addColorStop(0.55, 'rgba(20,15,55,0.85)');
  mwGrad.addColorStop(0.65, 'rgba(15,12,45,0.7)'); mwGrad.addColorStop(0.85, 'rgba(10,10,35,0.3)'); mwGrad.addColorStop(1, 'rgba(8,8,30,0)');
  ctx.fillStyle = mwGrad; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    const y = h * (0.25 + Math.random() * 0.5), bandW = 40 + Math.random() * 80;
    ctx.beginPath(); ctx.moveTo(0, y + (Math.random() - 0.5) * 25);
    for (let x = 0; x < w; x += w / 20) ctx.lineTo(x, y + (Math.random() - 0.5) * bandW);
    ctx.strokeStyle = `rgba(5,5,20,${Math.random() * 0.3})`; ctx.lineWidth = 6 + Math.random() * 30; ctx.stroke();
  }
  const starTypes = [
    { color: [255,180,140], pct: 0.40, magRange: [0.05,0.3], sizeRange: [0.5,1.5] },
    { color: [255,210,170], pct: 0.25, magRange: [0.1,0.5], sizeRange: [0.8,2.0] },
    { color: [255,245,220], pct: 0.18, magRange: [0.15,0.7], sizeRange: [1.0,2.5] },
    { color: [240,245,255], pct: 0.10, magRange: [0.3,0.85], sizeRange: [1.2,3.0] },
    { color: [200,215,255], pct: 0.05, magRange: [0.5,1.0], sizeRange: [1.5,3.5] },
    { color: [170,190,255], pct: 0.02, magRange: [0.7,1.0], sizeRange: [2.0,4.5] },
  ];
  starTypes.forEach(st => {
    const count = Math.floor(8000 * st.pct);
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      let y = Math.random() < 0.55 ? h/2 + (Math.random()-0.5)*h*0.5 : Math.random() * h;
      const mag = st.magRange[0] + Math.random() * (st.magRange[1] - st.magRange[0]);
      const sz = (st.sizeRange[0] + Math.random() * (st.sizeRange[1] - st.sizeRange[0])) * mag;
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${st.color[0]},${st.color[1]},${st.color[2]},${mag})`; ctx.fill();
      if (mag > 0.75 && Math.random() < 0.3) {
        const glowGrad = ctx.createRadialGradient(x, y, sz, x, y, sz * 3);
        glowGrad.addColorStop(0, `rgba(${st.color[0]},${st.color[1]},${st.color[2]},${mag*0.7})`);
        glowGrad.addColorStop(0.5, `rgba(${st.color[0]},${st.color[1]},${st.color[2]},${mag*0.2})`); glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x, y, sz*3, 0, Math.PI*2); ctx.fillStyle = glowGrad; ctx.fill();
      }
    }
  });
  for (let i = 0; i < 6000; i++) {
    const x = Math.random()*w, y = h/2 + (Math.random()-0.5)*h*0.45, sz = 0.3 + Math.random()*1.2;
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
    const b = 100 + Math.floor(Math.random()*155);
    ctx.fillStyle = `rgba(${b},${b},${b + Math.floor(Math.random()*30)},${0.1 + Math.random()*0.4})`; ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

/** 星芒/辉光通用纹理 */
export function makeFlareTex(w, h, drawFn) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  drawFn(ctx, w, h);
  return new THREE.CanvasTexture(c);
}
