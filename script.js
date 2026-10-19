/* =========================================================
   20/10 ULTRA CUTE, ADORABLE, MARSHMALLOW 3D CLOUD FLIGHT
   Three.js Marshmallow Worlds + GSAP Auto Journey
   Trần Mỹ Tâm & Lê Kiều Vy
   ========================================================= */

// --- Cute Music Box & Sound Synthesizer (Kalimba / Music Box Style) ---
class CuteAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.enabled = true;
    this.gainNode = null;
    this.melodyTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.enabled ? 0.25 : 0, this.ctx.currentTime);
    }
    return this.enabled;
  }

  // Play a cheerful, cute, sparkling music box melody in loop
  startCuteBGM() {
    if (!this.enabled || this.isPlaying) return;
    this.init();
    this.isPlaying = true;

    // Cheerful, cute pentatonic music box notes (C5, D5, E5, G5, A5, C6)
    const notes = [
      523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
      880.00, 783.99, 659.25, 587.33,  // A5, G5, E5, D5
      523.25, 659.25, 880.00, 1046.50, // C5, E5, A5, C6
      1174.66, 1046.50, 880.00, 783.99 // D6, C6, A5, G5
    ];

    let noteIdx = 0;
    const playNote = () => {
      if (!this.isPlaying || !this.ctx) return;

      const freq = notes[noteIdx % notes.length];
      noteIdx++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Sine wave with quick attack and gentle bell-like decay (Music Box sound)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.85);

      // Play soft warm bass chord every 4 notes
      if (noteIdx % 4 === 1) {
        const bassFreq = [261.63, 220.00, 174.61, 196.00][Math.floor((noteIdx / 4) % 4)];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        bassOsc.connect(bassGain);
        bassGain.connect(this.gainNode);
        bassOsc.start(now);
        bassOsc.stop(now + 1.8);
      }

      this.melodyTimer = setTimeout(playNote, 320); // Cute bouncy tempo
    };

    playNote();
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.07);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playBeep(freq = 550, dur = 0.2) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  playFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, t: 0, d: 0.18 },
      { f: 659.25, t: 0.16, d: 0.18 },
      { f: 783.99, t: 0.32, d: 0.2 },
      { f: 1046.50, t: 0.5, d: 0.85 }
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + n.t;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + n.d);
    });
  }
}

const audio = new CuteAudioSynthesizer();

// =========================================================
// THREE.JS: CHUBBY MARSHMALLOW CLOUDS, CANDY HEARTS & BOBA
// =========================================================
let scene, camera, renderer;
let marshmallowCloudsGroup, candyHeartsGroup;
let bobaCup3D, flowerBouquet3D;

function initCute3DScene() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xfff5ea, 0.0018);

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 3500);
  camera.position.set(0, 0, 300);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Soft Warm Pastel Lighting
  const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffbe76, 1.1);
  sunLight.position.set(200, 300, 500);
  scene.add(sunLight);

  const pinkRimLight = new THREE.DirectionalLight(0xff758c, 0.9);
  pinkRimLight.position.set(-200, -100, -300);
  scene.add(pinkRimLight);

  // 1. Marshmallow Clouds (Clusters of overlapping smooth white shiny spheres)
  marshmallowCloudsGroup = new THREE.Group();
  const cloudMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 30,
    specular: 0xffeef2,
    transparent: true,
    opacity: 0.92
  });

  // Create 35 puffy cartoon cloud clusters along the flight path
  for (let c = 0; c < 35; c++) {
    const cluster = new THREE.Group();
    // 5 overlapping spheres per cloud cluster for chubby marshmallow shape
    const numPuffs = 5;
    for (let p = 0; p < numPuffs; p++) {
      const radius = Math.random() * 12 + 10;
      const puffGeo = new THREE.SphereGeometry(radius, 16, 16);
      const puffMesh = new THREE.Mesh(puffGeo, cloudMat);
      puffMesh.position.set(
        (p - numPuffs / 2) * 14 + (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
      cluster.add(puffMesh);
    }

    cluster.position.set(
      (Math.random() - 0.5) * 450,
      (Math.random() - 0.5) * 220,
      350 - Math.random() * 3000
    );
    const scale = Math.random() * 1.5 + 0.9;
    cluster.scale.set(scale, scale * 0.7, scale);

    cluster.userData = {
      driftX: (Math.random() - 0.5) * 0.06,
      floatY: Math.random() * 0.03 + 0.01
    };

    marshmallowCloudsGroup.add(cluster);
  }
  scene.add(marshmallowCloudsGroup);

  // 2. Shiny 3D Pastel Candy Hearts (Glossy, cute)
  candyHeartsGroup = new THREE.Group();
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();
  heartShape.moveTo(x + 0.25, y + 0.25);
  heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
  heartShape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
  heartShape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95);
  heartShape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
  heartShape.bezierCurveTo(x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y);
  heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

  const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  heartGeo.center();

  const candyColors = [0xff758c, 0xffbe76, 0xffa8ba, 0xfeca57, 0x00cec9, 0xa8e6cf];
  for (let i = 0; i < 48; i++) {
    const mat = new THREE.MeshPhongMaterial({
      color: candyColors[i % candyColors.length],
      shininess: 100,
      specular: 0xffffff,
      transparent: true,
      opacity: 0.88
    });
    const mesh = new THREE.Mesh(heartGeo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 350,
      (Math.random() - 0.5) * 200,
      350 - Math.random() * 2800
    );
    const s = Math.random() * 12 + 8;
    mesh.scale.set(s, -s, s);

    mesh.userData = {
      rotX: (Math.random() - 0.5) * 0.02,
      rotY: (Math.random() - 0.5) * 0.02
    };

    candyHeartsGroup.add(mesh);
  }
  scene.add(candyHeartsGroup);

  // 3. Cute 3D Boba Milk Tea Cup at Kiều Vy's Station (z = -850)
  bobaCup3D = createCute3DBobaCup();
  bobaCup3D.position.set(55, -20, -850);
  scene.add(bobaCup3D);

  // 4. Cute 3D Sakura Flower Ring at Mỹ Tâm's Station (z = -250)
  flowerBouquet3D = createCute3DFlowerRing();
  flowerBouquet3D.position.set(-55, -20, -250);
  scene.add(flowerBouquet3D);

  window.addEventListener('resize', onResize);
  render3DLoop();
}

// Create a cute cartoon 3D Boba Cup with pearls and a straw
function createCute3DBobaCup() {
  const group = new THREE.Group();

  // Cup body (Cylinder)
  const cupGeo = new THREE.CylinderGeometry(8, 6.5, 18, 24);
  const cupMat = new THREE.MeshPhongMaterial({ color: 0xffeaa7, transparent: true, opacity: 0.85, shininess: 80 });
  const cup = new THREE.Mesh(cupGeo, cupMat);
  group.add(cup);

  // Lid
  const lidGeo = new THREE.CylinderGeometry(8.5, 8.5, 2, 24);
  const lidMat = new THREE.MeshPhongMaterial({ color: 0xff758c });
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.y = 9;
  group.add(lid);

  // Straw
  const strawGeo = new THREE.CylinderGeometry(0.8, 0.8, 14, 16);
  const strawMat = new THREE.MeshPhongMaterial({ color: 0x00cec9 });
  const straw = new THREE.Mesh(strawGeo, strawMat);
  straw.position.set(2, 13, 0);
  straw.rotation.z = -0.2;
  group.add(straw);

  // Tapioca pearls
  const pearlMat = new THREE.MeshPhongMaterial({ color: 0x2d3436, shininess: 90 });
  for (let i = 0; i < 9; i++) {
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), pearlMat);
    pearl.position.set((Math.random() - 0.5) * 8, -6 + Math.random() * 3, (Math.random() - 0.5) * 8);
    group.add(pearl);
  }

  group.scale.set(1.4, 1.4, 1.4);
  return group;
}

// Create a cute cartoon 3D Sakura Flower Ring
function createCute3DFlowerRing() {
  const group = new THREE.Group();
  const petalMat = new THREE.MeshPhongMaterial({ color: 0xffa8ba, shininess: 70 });
  const centerMat = new THREE.MeshPhongMaterial({ color: 0xfeca57 });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), petalMat);
    petal.position.set(Math.cos(angle) * 7, Math.sin(angle) * 7, 0);
    petal.scale.set(1, 1.4, 0.5);
    petal.rotation.z = angle;
    group.add(petal);
  }

  const center = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), centerMat);
  group.add(center);

  group.scale.set(1.4, 1.4, 1.4);
  return group;
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

let tick = 0;
function render3DLoop() {
  requestAnimationFrame(render3DLoop);
  tick += 0.02;

  // Drift marshmallow clouds
  if (marshmallowCloudsGroup) {
    marshmallowCloudsGroup.children.forEach(c => {
      c.position.x += c.userData.driftX;
      c.position.y += Math.sin(tick + c.position.x) * c.userData.floatY;
      if (c.position.x > 260) c.position.x = -260;
      if (c.position.x < -260) c.position.x = 260;
    });
  }

  // Rotate cute candy hearts
  if (candyHeartsGroup) {
    candyHeartsGroup.children.forEach(h => {
      h.rotation.x += h.userData.rotX;
      h.rotation.y += h.userData.rotY;
      h.position.y += Math.sin(tick + h.position.x) * 0.1;
    });
  }

  // Animate Boba cup and Flower ring
  if (bobaCup3D) {
    bobaCup3D.rotation.y += 0.015;
    bobaCup3D.position.y = -20 + Math.sin(tick * 1.5) * 4;
  }
  if (flowerBouquet3D) {
    flowerBouquet3D.rotation.z += 0.012;
    flowerBouquet3D.position.y = -20 + Math.sin(tick * 1.5) * 4;
  }

  // Gentle camera sway
  camera.position.x = Math.sin(tick * 0.8) * 8;
  camera.position.y = Math.cos(tick * 0.6) * 5;

  renderer.render(scene, camera);
}

// =========================================================
// GSAP AUTOMATED STORY PROGRESSION (100% TỰ ĐỘNG)
// =========================================================
let mainGSAPTimeline = null;

function showCuteCard(index) {
  audio.playPop();
  const cards = document.querySelectorAll('.cute-card');
  cards.forEach((c, idx) => {
    if (idx === index) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
}

function startCuteAutoJourney() {
  document.getElementById('cuteStartCurtain').classList.add('hidden');
  audio.startCuteBGM();

  mainGSAPTimeline = gsap.timeline();

  // Candy Progress Bar Fill (0% to 100% over 48 seconds)
  const totalDuration = 48;
  gsap.to('#candyProgressFill', {
    width: '100%',
    duration: totalDuration,
    ease: 'none'
  });

  // --- CẢNH 0: CỔNG MÂY MARSHMALLOW (0s - 7s) ---
  mainGSAPTimeline.call(() => showCuteCard(0), null, 0.5);
  mainGSAPTimeline.to(camera.position, {
    z: 220,
    duration: 6.5,
    ease: 'power1.inOut'
  }, 0);

  // --- CẢNH 1: ĐÁM MÂY TRẦN MỸ TÂM (7s - 17s) ---
  mainGSAPTimeline.call(() => showCuteCard(1), null, 7.5);
  mainGSAPTimeline.to(camera.position, {
    z: -250,
    duration: 9.5,
    ease: 'power1.inOut'
  }, 7);

  // --- CẢNH 2: ĐÁM MÂY LÊ KIỀU VY (17s - 27s) ---
  mainGSAPTimeline.call(() => showCuteCard(2), null, 17.5);
  mainGSAPTimeline.to(camera.position, {
    z: -850,
    duration: 9.5,
    ease: 'power1.inOut'
  }, 17);

  // --- CẢNH 3: TÂM THƯ CẢ TEAM (27s - 37s) ---
  mainGSAPTimeline.call(() => showCuteCard(3), null, 27.5);
  mainGSAPTimeline.to(camera.position, {
    z: -1450,
    duration: 9.5,
    ease: 'power1.inOut'
  }, 27);

  // --- CẢNH 4: BẬT MÍ QUÀ NGOÀI ĐỜI THẬT (37s - 45s) ---
  mainGSAPTimeline.call(() => showCuteCard(4), null, 37.5);
  mainGSAPTimeline.to(camera.position, {
    z: -1950,
    duration: 8,
    ease: 'power1.out'
  }, 37);

  // --- CẢNH 5: TỰ ĐỘNG ĐẾM NGƯỢC 3... 2... 1... (tại giây 46) ---
  mainGSAPTimeline.call(() => {
    triggerCuteCountdown();
  }, null, 46);
}

// 3-Second Dramatic Countdown Modal
let countdownTimerId = null;
function triggerCuteCountdown() {
  document.querySelectorAll('.cute-card').forEach(c => c.classList.remove('active'));

  const modal = document.getElementById('cuteCountdownModal');
  const numElem = document.getElementById('countdownNumBig');
  modal.classList.remove('hidden');

  let count = 3;
  numElem.textContent = count;
  audio.playBeep(480, 0.25);

  if (countdownTimerId) clearInterval(countdownTimerId);
  countdownTimerId = setInterval(() => {
    count--;
    if (count > 0) {
      numElem.textContent = count;
      audio.playBeep(480 + (3 - count) * 90, 0.25);
    } else {
      clearInterval(countdownTimerId);
      numElem.textContent = "🙈";
      audio.playBeep(880, 0.6); // Final cheerful beep

      setTimeout(() => {
        modal.classList.add('hidden');
        enterCuteEyesClosedTheater();
      }, 750);
    }
  }, 1000);
}

// Chế độ nhắm mắt Theater Mode
function enterCuteEyesClosedTheater() {
  document.getElementById('cuteEyesClosedScreen').classList.remove('hidden');
  if (scene) {
    scene.fog = new THREE.FogExp2(0x110d1c, 0.0035);
  }
}

// Bấm nút khi đã trao quà thật xong ngoài đời
function unveilGrandCelebration() {
  audio.playFanfare();
  document.getElementById('cuteEyesClosedScreen').classList.add('hidden');
  document.getElementById('cuteCelebrationScreen').classList.remove('hidden');

  if (scene) {
    scene.fog = new THREE.FogExp2(0xfff5ea, 0.0018);
  }

  fireCuteConfetti();
}

function replayCuteJourney() {
  document.getElementById('cuteCelebrationScreen').classList.add('hidden');
  document.getElementById('cuteEyesClosedScreen').classList.add('hidden');
  document.querySelectorAll('.cute-card').forEach(c => c.classList.remove('active'));
  document.getElementById('candyProgressFill').style.width = '0%';

  camera.position.set(0, 0, 300);
  startCuteAutoJourney();
}

// =========================================================
// CANVAS CONFETTI (PASTEL CANDY COLORS)
// =========================================================
const canvasConfetti = document.getElementById('confetti-canvas');
const ctxConfetti = canvasConfetti.getContext('2d');
let particles = [];
let animReq = null;

function resizeConfetti() {
  canvasConfetti.width = window.innerWidth;
  canvasConfetti.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

const cutePalette = ['#ff758c', '#ffbe76', '#feca57', '#00cec9', '#a29bfe', '#ff7675', '#55efc4', '#fd79a8'];

class CuteParticle {
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    const angle = (opts.angle || 90) * (Math.PI / 180);
    const spread = (opts.spread || 70) * (Math.PI / 180);
    const velocity = (opts.startVelocity || 48) * (0.8 + Math.random() * 0.4);

    const randomAngle = angle + (Math.random() - 0.5) * spread;
    this.vx = Math.cos(randomAngle) * velocity;
    this.vy = -Math.sin(randomAngle) * velocity;

    this.color = cutePalette[Math.floor(Math.random() * cutePalette.length)];
    this.size = Math.random() * 9 + 6;
    this.tilt = Math.random() * 10;
    this.tiltInc = Math.random() * 0.08 + 0.04;
    this.gravity = 0.55;
    this.drag = 0.94;
    this.opacity = 1;
    this.decay = Math.random() * 0.015 + 0.008;
    this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
  }

  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.tilt += this.tiltInc;
    this.opacity -= this.decay;
  }

  draw() {
    if (this.opacity <= 0) return;
    ctxConfetti.save();
    ctxConfetti.fillStyle = this.color;
    ctxConfetti.globalAlpha = Math.max(0, this.opacity);
    ctxConfetti.translate(this.x, this.y);

    if (this.shape === 'rect') {
      ctxConfetti.fillRect(-this.size / 2, Math.sin(this.tilt) * 5, this.size, this.size * 0.6);
    } else {
      ctxConfetti.beginPath();
      ctxConfetti.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctxConfetti.fill();
    }
    ctxConfetti.restore();
  }
}

function fireCuteConfetti() {
  audio.playFanfare();
  for (let i = 0; i < 75; i++) {
    particles.push(new CuteParticle(window.innerWidth * 0.1, window.innerHeight * 0.8, { angle: 60, spread: 55, startVelocity: 55 }));
  }
  for (let i = 0; i < 75; i++) {
    particles.push(new CuteParticle(window.innerWidth * 0.9, window.innerHeight * 0.8, { angle: 120, spread: 55, startVelocity: 55 }));
  }
  setTimeout(() => {
    for (let i = 0; i < 85; i++) {
      particles.push(new CuteParticle(window.innerWidth * 0.5, window.innerHeight * 0.5, { angle: 90, spread: 120, startVelocity: 45 }));
    }
  }, 350);

  if (!animReq) loopConfetti();
}

function loopConfetti() {
  ctxConfetti.clearRect(0, 0, canvasConfetti.width, canvasConfetti.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.opacity <= 0 || p.y > canvasConfetti.height + 20) {
      particles.splice(i, 1);
    }
  }

  if (particles.length > 0) {
    animReq = requestAnimationFrame(loopConfetti);
  } else {
    animReq = null;
    ctxConfetti.clearRect(0, 0, canvasConfetti.width, canvasConfetti.height);
  }
}

// =========================================================
// INITIALIZATION
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  initCute3DScene();

  const startBtn = document.getElementById('startAutoFlightBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      audio.init();
      startCuteAutoJourney();
    });
  }

  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isEnabled = audio.toggle();
      const lbl = soundBtn.querySelector('.sound-label');
      const icn = document.getElementById('soundIcon');
      if (isEnabled) {
        icn.textContent = '🎵';
        lbl.textContent = 'Nhạc: BẬT';
      } else {
        icn.textContent = '🔇';
        lbl.textContent = 'Nhạc: TẮT';
      }
    });
  }
});
