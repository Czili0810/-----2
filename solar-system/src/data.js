// ==================== 行星 & 天体数据 ====================

export const planetData = [
  {
    name: '水星', nameEn: 'Mercury', type: '岩石行星',
    color: '#b0ada6', emissive: '#1a1510',
    radius: 0.45, distance: 10, orbitSpeed: 2.5, rotSpeed: 0.3,
    roughness: 0.7, metalness: 0.15,
    info: {
      diameter: '4,879 km', radius: '2,440 km', mass: '3.30 × 10²³ kg',
      density: '5.43 g/cm³', gravity: '3.7 m/s² (0.38 g)',
      distance: '5,790 万 km', orbit: '88 天', rotation: '59 天',
      temp: '-180°C ~ 430°C', moons: '0',
      fact: '水星是太阳系中最小的行星，表面布满了撞击坑，没有大气层保护。其铁核占体积的42%，比例远高于其他行星。'
    }
  },
  {
    name: '金星', nameEn: 'Venus', type: '岩石行星',
    color: '#e8cda0', emissive: '#2a2010',
    radius: 0.95, distance: 16, orbitSpeed: 1.1, rotSpeed: 0.2,
    roughness: 0.55, metalness: 0.05,
    info: {
      diameter: '12,104 km', radius: '6,052 km', mass: '4.87 × 10²⁴ kg',
      density: '5.24 g/cm³', gravity: '8.87 m/s² (0.90 g)',
      distance: '1.08 亿 km', orbit: '225 天', rotation: '243 天 (逆行)',
      temp: '462°C (平均)', moons: '0',
      fact: '金星是太阳系中最热的行星，浓密的CO₂大气层造成极强的温室效应。自转方向与大多数行星相反（逆行自转），是夜空中最亮的天体之一。'
    }
  },
  {
    name: '地球', nameEn: 'Earth', type: '岩石行星',
    color: '#5599dd', emissive: '#0a1520',
    radius: 1.0, distance: 22, orbitSpeed: 0.7, rotSpeed: 1.0,
    roughness: 0.6, metalness: 0.08,
    info: {
      diameter: '12,742 km', radius: '6,371 km', mass: '5.97 × 10²⁴ kg',
      density: '5.51 g/cm³', gravity: '9.81 m/s² (1.00 g)',
      distance: '1.496 亿 km', orbit: '365.25 天', rotation: '24 小时',
      temp: '-89°C ~ 57°C', moons: '1',
      fact: '地球是太阳系中唯一已知存在生命的天体。液态水覆盖约71%的表面，拥有适中的温度和大气层，是目前人类唯一的家园。🌍'
    }
  },
  {
    name: '火星', nameEn: 'Mars', type: '岩石行星',
    color: '#d45a3a', emissive: '#200a05',
    radius: 0.55, distance: 29, orbitSpeed: 0.38, rotSpeed: 0.9,
    roughness: 0.75, metalness: 0.1,
    info: {
      diameter: '6,779 km', radius: '3,390 km', mass: '6.42 × 10²³ kg',
      density: '3.93 g/cm³', gravity: '3.72 m/s² (0.38 g)',
      distance: '2.279 亿 km', orbit: '687 天', rotation: '24.6 小时',
      temp: '-140°C ~ 20°C', moons: '2',
      fact: '火星因其红色外观被称为"红色星球"，拥有太阳系中最大的火山——奥林帕斯山（高约21.9公里），以及长达4,000公里的水手号峡谷。'
    }
  },
  {
    name: '木星', nameEn: 'Jupiter', type: '气态巨行星',
    color: '#d4c8a8', emissive: '#1a1000',
    radius: 3.6, distance: 40, orbitSpeed: 0.15, rotSpeed: 1.8,
    roughness: 0.5, metalness: 0.02,
    info: {
      diameter: '139,820 km', radius: '69,911 km', mass: '1.90 × 10²⁷ kg',
      density: '1.33 g/cm³', gravity: '24.79 m/s² (2.53 g)',
      distance: '7.786 亿 km', orbit: '11.86 年', rotation: '9.9 小时',
      temp: '-108°C (云顶)', moons: '95+',
      fact: '木星是太阳系中最大的行星，质量是其他所有行星总和的2.5倍。著名的大红斑是一个持续了数百年的超级风暴，比地球还大。'
    }
  },
  {
    name: '土星', nameEn: 'Saturn', type: '气态巨行星',
    color: '#ead8a0', emissive: '#1a1400',
    radius: 3.0, distance: 52, orbitSpeed: 0.09, rotSpeed: 1.5,
    hasRings: true, roughness: 0.45, metalness: 0.03,
    info: {
      diameter: '116,460 km', radius: '58,232 km', mass: '5.68 × 10²⁶ kg',
      density: '0.69 g/cm³', gravity: '10.44 m/s² (1.06 g)',
      distance: '14.34 亿 km', orbit: '29.46 年', rotation: '10.7 小时',
      temp: '-139°C (云顶)', moons: '146+',
      fact: '土星密度仅为0.69 g/cm³——理论上可以漂浮在水面上。其壮观的环系统由冰和岩石碎片组成，是太阳系最美丽的景象之一。'
    }
  },
  {
    name: '天王星', nameEn: 'Uranus', type: '冰巨行星',
    color: '#8cccd5', emissive: '#051015',
    radius: 2.0, distance: 64, orbitSpeed: 0.045, rotSpeed: 1.2,
    roughness: 0.4, metalness: 0.05,
    info: {
      diameter: '50,724 km', radius: '25,362 km', mass: '8.68 × 10²⁵ kg',
      density: '1.27 g/cm³', gravity: '8.87 m/s² (0.90 g)',
      distance: '28.71 亿 km', orbit: '84.0 年', rotation: '17.2 小时',
      temp: '-197°C', moons: '27',
      fact: '天王星的自转轴倾斜约98°，几乎是"躺着"绕太阳公转，这可能是远古时期一次巨大碰撞造成的，使其拥有极端的季节变化。'
    }
  },
  {
    name: '海王星', nameEn: 'Neptune', type: '冰巨行星',
    color: '#4466cc', emissive: '#050515',
    radius: 1.9, distance: 74, orbitSpeed: 0.03, rotSpeed: 1.1,
    roughness: 0.4, metalness: 0.06,
    info: {
      diameter: '49,244 km', radius: '24,622 km', mass: '1.02 × 10²⁶ kg',
      density: '1.64 g/cm³', gravity: '11.15 m/s² (1.14 g)',
      distance: '44.95 亿 km', orbit: '164.8 年', rotation: '16.1 小时',
      temp: '-201°C', moons: '16',
      fact: '海王星是太阳系中风速最快的行星，风速可达2,100公里/小时。它是通过数学预测（而非直接观测）发现的第一颗行星，彰显了牛顿力学的威力。'
    }
  }
];

export const moonData = {
  name: '月球', nameEn: 'Moon', type: '卫星 (岩石)',
  color: '#c8c8c0',
  radius: 0.27, moonDistance: 2.5, orbitSpeed: 3.5, rotSpeed: 0.15,
  roughness: 0.65, metalness: 0.08,
  info: {
    diameter: '3,474 km', radius: '1,737 km', mass: '7.34 × 10²² kg',
    density: '3.34 g/cm³', gravity: '1.62 m/s² (0.17 g)',
    distance: '38.4 万 km (距地球)', orbit: '27.3 天',
    rotation: '27.3 天 (潮汐锁定)', temp: '-173°C ~ 127°C',
    moons: '--',
    fact: '月球是地球唯一的天然卫星，始终以同一面朝向地球（潮汐锁定）。1969年阿波罗11号实现人类首次登月，尼尔·阿姆斯特朗成为第一个踏上月球的人。🌙'
  }
};

export const sunInfo = {
  name: '太阳', nameEn: 'Sun', type: '恒星 (G型主序星)',
  color: '#ffcc33',
  info: {
    diameter: '1,392,700 km', radius: '696,340 km', mass: '1.989 × 10³⁰ kg',
    density: '1.41 g/cm³', gravity: '274 m/s² (27.9 g)',
    distance: '--', orbit: '--', rotation: '25 天 (赤道)',
    temp: '5,500°C (表面), 1,500万°C (核心)', moons: '8 颗行星',
    fact: '太阳是一颗G型主序星（黄矮星），占太阳系总质量的99.86%。核心通过氢核聚变每秒释放3.8×10²⁶瓦能量，已持续约46亿年，预计还将稳定燃烧约50亿年。☀️'
  }
};

// 气态巨行星条纹颜色
export function getBandColors(name) {
  switch (name) {
    case '木星':
      return ['#d4c8a8','#c4a070','#e8d8b8','#b89050','#d4c090','#c09860','#e0d0b0','#b89058','#d8c8a0','#c8a870','#e0d0b8'];
    case '土星':
      return ['#ead8a0','#e0c888','#f0e0b0','#d4c080','#e8d8a8','#dcc890','#f0e0b0','#e0d098','#ead8a8','#d8c488'];
    case '天王星':
      return ['#8cccd5','#a4dce8','#78bcc8','#b4e8f4','#8cccd5','#a4dce8','#78bcc8','#b4e8f4','#8cccd5'];
    case '海王星':
      return ['#4466cc','#5577dd','#3355bb','#6688ee','#4466cc','#5577dd','#3355bb','#6688ee','#4466cc'];
    default:
      return ['#cccccc','#dddddd','#bbbbbb','#dddddd','#cccccc'];
  }
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 128, g: 128, b: 128 };
}

export function clamp(v, min = 0, max = 255) {
  return Math.min(max, Math.max(min, Math.round(v)));
}
