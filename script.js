/* =====================================================================
   HAPPY BIRTHDAY WEBSITE — SCRIPT
   Organized in clearly-commented modules:
     1. Loading screen
     2. Background canvas (stars, fireflies, shooting stars, hearts)
     3. Mouse glow + cursor sparkle trail
     4. Hero balloons + falling petals
     5. Confetti / fireworks / floating-hearts engine (fx-canvas)
     6. Countdown timer
     7. Scroll-reveal observer
     8. Gallery lightbox
     9. Surprise button
    10. Cake / blow candles
    11. Floating music player
    12. Final full-screen surprise
   ===================================================================== */

/* ---------- 1. LOADING SCREEN ---------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const site = document.getElementById('site');
  setTimeout(() => {
    loader.classList.add('hidden');
    site.classList.add('revealed');
  }, 2200);
});

/* ---------- 2. BACKGROUND CANVAS: stars / fireflies / shooting stars ---------- */
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let W, H;
function resizeBg(){
  W = bgCanvas.width = window.innerWidth;
  H = bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

// twinkling stars
const STAR_COUNT = Math.min(140, Math.floor((window.innerWidth*window.innerHeight)/9000));
const stars = Array.from({length:STAR_COUNT}, () => ({
  x: Math.random()*W,
  y: Math.random()*H*0.85,
  r: Math.random()*1.6+0.4,
  phase: Math.random()*Math.PI*2,
  speed: Math.random()*0.02+0.01
}));

// fireflies (soft drifting golden dots)
const FIREFLY_COUNT = 18;
const fireflies = Array.from({length:FIREFLY_COUNT}, () => ({
  x: Math.random()*W, y: Math.random()*H,
  vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3,
  r: Math.random()*2+1.5,
  glow: Math.random()*Math.PI*2
}));

// shooting stars
let shootingStars = [];
function spawnShootingStar(){
  shootingStars.push({
    x: Math.random()*W*0.6 + W*0.2,
    y: Math.random()*H*0.25,
    len: 90+Math.random()*60,
    speed: 9+Math.random()*5,
    angle: Math.PI/4 + (Math.random()*0.15-0.075),
    life: 0, maxLife: 60
  });
}
setInterval(() => { if(Math.random() < 0.6) spawnShootingStar(); }, 3500);

// ambient floating hearts (background layer, subtle)
const bgHearts = Array.from({length:10}, () => ({
  x: Math.random()*W, y: H + Math.random()*H,
  size: 10+Math.random()*14,
  speed: 0.25+Math.random()*0.35,
  drift: Math.random()*0.6-0.3,
  sway: Math.random()*Math.PI*2
}));
function drawHeart(ctx,x,y,size,alpha){
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x,y);
  ctx.fillStyle = '#ff8fc7';
  ctx.beginPath();
  const s = size/16;
  ctx.moveTo(0, 4*s);
  ctx.bezierCurveTo(0,-2*s, -8*s,-2*s, -8*s,4*s);
  ctx.bezierCurveTo(-8*s,9*s, 0,13*s, 0,16*s);
  ctx.bezierCurveTo(0,13*s, 8*s,9*s, 8*s,4*s);
  ctx.bezierCurveTo(8*s,-2*s, 0,-2*s, 0,4*s);
  ctx.fill();
  ctx.restore();
}

function bgLoop(t){
  bgCtx.clearRect(0,0,W,H);

  // stars
  stars.forEach(s => {
    s.phase += s.speed;
    const a = 0.4 + Math.sin(s.phase)*0.35 + 0.25;
    bgCtx.beginPath();
    bgCtx.fillStyle = `rgba(255,246,234,${Math.min(a,1)})`;
    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    bgCtx.fill();
  });

  // fireflies
  fireflies.forEach(f => {
    f.x += f.vx; f.y += f.vy; f.glow += 0.05;
    if(f.x<0) f.x=W; if(f.x>W) f.x=0;
    if(f.y<0) f.y=H; if(f.y>H) f.y=H*0.9;
    const a = 0.35 + Math.sin(f.glow)*0.35;
    bgCtx.beginPath();
    bgCtx.fillStyle = `rgba(255,216,138,${Math.max(a,0.05)})`;
    bgCtx.shadowColor = '#ffd88a';
    bgCtx.shadowBlur = 8;
    bgCtx.arc(f.x, f.y, f.r, 0, Math.PI*2);
    bgCtx.fill();
    bgCtx.shadowBlur = 0;
  });

  // shooting stars
  shootingStars.forEach(sh => {
    sh.life++;
    sh.x += Math.cos(sh.angle)*sh.speed;
    sh.y += Math.sin(sh.angle)*sh.speed;
    const alpha = 1 - sh.life/sh.maxLife;
    const grad = bgCtx.createLinearGradient(sh.x, sh.y, sh.x - Math.cos(sh.angle)*sh.len, sh.y - Math.sin(sh.angle)*sh.len);
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    bgCtx.strokeStyle = grad;
    bgCtx.lineWidth = 2;
    bgCtx.beginPath();
    bgCtx.moveTo(sh.x, sh.y);
    bgCtx.lineTo(sh.x - Math.cos(sh.angle)*sh.len, sh.y - Math.sin(sh.angle)*sh.len);
    bgCtx.stroke();
  });
  shootingStars = shootingStars.filter(s => s.life < s.maxLife);

  // ambient hearts
  bgHearts.forEach(h => {
    h.y -= h.speed;
    h.sway += 0.02;
    h.x += Math.sin(h.sway)*0.3 + h.drift*0.05;
    if(h.y < -20){ h.y = H+20; h.x = Math.random()*W; }
    drawHeart(bgCtx, h.x, h.y, h.size, 0.18);
  });

  requestAnimationFrame(bgLoop);
}
requestAnimationFrame(bgLoop);

/* ---------- 3. MOUSE GLOW + CURSOR SPARKLE TRAIL ---------- */
const glowEl = document.getElementById('mouseGlow');
let lastSpark = 0;
window.addEventListener('pointermove', (e) => {
  glowEl.style.left = e.clientX + 'px';
  glowEl.style.top = e.clientY + 'px';

  const now = performance.now();
  if(now - lastSpark > 60){
    lastSpark = now;
    const spark = document.createElement('div');
    spark.className = 'cursor-spark';
    spark.style.left = (e.clientX + (Math.random()*10-5)) + 'px';
    spark.style.top = (e.clientY + (Math.random()*10-5)) + 'px';
    const hue = Math.random() > 0.5 ? '#ffd88a' : '#ff8fc7';
    spark.style.background = hue;
    spark.style.boxShadow = `0 0 8px 2px ${hue}`;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 750);
  }
});

/* ---------- 4. HERO BALLOONS + FALLING PETALS ---------- */
const balloonColors = ['#ff8fc7','#ffd88a','#b48cff','#8fd9ff','#ff5fa8'];
const balloonsWrap = document.getElementById('balloons');
function spawnBalloon(){
  const b = document.createElement('div');
  b.className = 'balloon';
  const color = balloonColors[Math.floor(Math.random()*balloonColors.length)];
  b.style.background = `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.65), ${color} 60%)`;
  b.style.left = Math.random()*94 + '%';
  const dur = 10 + Math.random()*8;
  b.style.animationDuration = dur + 's';
  b.style.animationDelay = (Math.random()*4) + 's';
  balloonsWrap.appendChild(b);
  setTimeout(() => b.remove(), (dur+4)*1000);
}
for(let i=0;i<7;i++) spawnBalloon();
setInterval(spawnBalloon, 2600);

function spawnPetal(){
  const p = document.createElement('div');
  p.className = 'petal';
  p.style.left = Math.random()*100 + '%';
  const dur = 7 + Math.random()*6;
  p.style.animationDuration = dur + 's';
  const hue = Math.random() > 0.5 ? '#ffd88a' : '#ff8fc7';
  p.style.background = `radial-gradient(circle at 30% 30%, #fff, ${hue})`;
  balloonsWrap.appendChild(p);
  setTimeout(() => p.remove(), dur*1000);
}
setInterval(spawnPetal, 500);

/* ---------- 5. CONFETTI / FIREWORKS / FLOATING HEARTS ENGINE ---------- */
const fxCanvas = document.getElementById('fx-canvas');
const fxCtx = fxCanvas.getContext('2d');
function resizeFx(){ fxCanvas.width = window.innerWidth; fxCanvas.height = window.innerHeight; }
resizeFx();
window.addEventListener('resize', resizeFx);

let confettiParticles = [];
let fireworkParticles = [];
let risingHearts = [];
const confettiColors = ['#ff8fc7','#ffd88a','#b48cff','#8fd9ff','#ff5fa8','#fff6ea'];

function burstConfetti(count = 90){
  for(let i=0;i<count;i++){
    confettiParticles.push({
      x: Math.random()*fxCanvas.width,
      y: -20 - Math.random()*200,
      w: 6+Math.random()*6,
      h: 10+Math.random()*8,
      color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
      vy: 2+Math.random()*3,
      vx: (Math.random()-0.5)*2.5,
      rot: Math.random()*360,
      vrot: (Math.random()-0.5)*10,
      life: 0, maxLife: 260+Math.random()*100
    });
  }
}

function burstFirework(cx, cy, hue){
  const count = 46;
  for(let i=0;i<count;i++){
    const angle = (Math.PI*2/count)*i;
    const speed = 2.4 + Math.random()*2.6;
    fireworkParticles.push({
      x: cx, y: cy,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      color: hue || confettiColors[Math.floor(Math.random()*confettiColors.length)],
      life: 0, maxLife: 55+Math.random()*20
    });
  }
}
function randomFirework(){
  burstFirework(
    Math.random()*fxCanvas.width*0.7 + fxCanvas.width*0.15,
    Math.random()*fxCanvas.height*0.45 + 40
  );
}

function spawnRisingHearts(count = 26){
  for(let i=0;i<count;i++){
    risingHearts.push({
      x: fxCanvas.width/2 + (Math.random()-0.5)*fxCanvas.width*0.6,
      y: fxCanvas.height*0.7 + Math.random()*100,
      size: 14+Math.random()*18,
      vy: 1.4+Math.random()*2,
      sway: Math.random()*Math.PI*2,
      life:0, maxLife: 180+Math.random()*60
    });
  }
}

function fxLoop(){
  fxCtx.clearRect(0,0,fxCanvas.width, fxCanvas.height);

  // confetti
  confettiParticles.forEach(p => {
    p.life++;
    p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
    fxCtx.save();
    fxCtx.translate(p.x,p.y);
    fxCtx.rotate(p.rot*Math.PI/180);
    fxCtx.globalAlpha = Math.max(0, 1 - p.life/p.maxLife);
    fxCtx.fillStyle = p.color;
    fxCtx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    fxCtx.restore();
  });
  confettiParticles = confettiParticles.filter(p => p.life < p.maxLife && p.y < fxCanvas.height+30);

  // fireworks
  fireworkParticles.forEach(p => {
    p.life++;
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.035; // gravity
    fxCtx.beginPath();
    fxCtx.globalAlpha = Math.max(0, 1 - p.life/p.maxLife);
    fxCtx.fillStyle = p.color;
    fxCtx.shadowColor = p.color;
    fxCtx.shadowBlur = 10;
    fxCtx.arc(p.x,p.y,2.4,0,Math.PI*2);
    fxCtx.fill();
    fxCtx.shadowBlur = 0;
  });
  fxCtx.globalAlpha = 1;
  fireworkParticles = fireworkParticles.filter(p => p.life < p.maxLife);

  // rising hearts
  risingHearts.forEach(h => {
    h.life++;
    h.y -= h.vy;
    h.sway += 0.05;
    h.x += Math.sin(h.sway)*0.6;
    const alpha = h.life < h.maxLife*0.15 ? h.life/(h.maxLife*0.15) : Math.max(0,1-h.life/h.maxLife);
    drawHeart(fxCtx, h.x, h.y, h.size, alpha);
  });
  risingHearts = risingHearts.filter(h => h.life < h.maxLife);

  requestAnimationFrame(fxLoop);
}
requestAnimationFrame(fxLoop);

// gentle continuous fireworks once the final section is reached
let continuousFireworks = false;
setInterval(() => { if(continuousFireworks && Math.random()<0.5) randomFirework(); }, 900);

/* ---------- 6. COUNTDOWN TIMER ---------- */
// CUSTOMIZE: set her real birthday (month is 0-indexed: 0=Jan ... 11=Dec)
const BIRTHDAY_MONTH = 07;  // December
const BIRTHDAY_DAY = 13;

function getNextBirthday(){
  const now = new Date();
  let year = now.getFullYear();
  let target = new Date(year, BIRTHDAY_MONTH, BIRTHDAY_DAY, 0,0,0);
  const isToday = now.getMonth() === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY;
  if(!isToday && target < now){
    target = new Date(year+1, BIRTHDAY_MONTH, BIRTHDAY_DAY, 0,0,0);
  }
  return {target, isToday};
}

function updateCountdown(){
  const { target, isToday } = getNextBirthday();
  const activeEl = document.getElementById('countdownActive');
  const bdayEl = document.getElementById('countdownBirthday');

  if(isToday){
    activeEl.style.display = 'none';
    bdayEl.style.display = 'block';
    if(!window.__bdayCelebrated){
      window.__bdayCelebrated = true;
      burstConfetti(140);
      randomFirework(); randomFirework();
    }
    return;
  }
  activeEl.style.display = 'flex';
  bdayEl.style.display = 'none';

  const now = new Date();
  const diff = target - now;
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  document.getElementById('cd-days').textContent = String(d).padStart(2,'0');
  document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
  document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
  document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- 7. SCROLL-REVEAL OBSERVER ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if(entry.isIntersecting){
      setTimeout(() => entry.target.classList.add('in'), i*70);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// trigger continuous fireworks when final section is visible
const finalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { continuousFireworks = entry.isIntersecting; });
}, { threshold: 0.3 });
finalObserver.observe(document.getElementById('final'));

/* ---------- 8. GALLERY LIGHTBOX ---------- */
const lightbox = document.getElementById('lightbox');
const lbInner = document.getElementById('lbInner');
document.querySelectorAll('.photo-card').forEach(card => {
  const open = () => {
    lbInner.style.background = card.style.background;
    const closeBtn = document.getElementById('lbClose');
    lbInner.innerHTML = '📷';
    lbInner.appendChild(closeBtn);
    lightbox.classList.add('open');
  };
  card.addEventListener('click', open);
  card.addEventListener('keypress', (e) => { if(e.key === 'Enter') open(); });
});
function closeLightbox(){ lightbox.classList.remove('open'); }
document.getElementById('lbClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') { closeLightbox(); closeFinale(); } });

/* ---------- 9. SURPRISE BUTTON ---------- */
document.getElementById('surpriseBtn').addEventListener('click', function(){
  burstConfetti(160);
  for(let i=0;i<5;i++){
    setTimeout(randomFirework, i*250);
  }
  spawnRisingHearts(34);
  document.getElementById('surpriseMsg').classList.add('show');
  this.style.transform = 'scale(.95)';
  setTimeout(() => this.style.transform = '', 200);
});

/* ---------- 10. CAKE / BLOW CANDLES ---------- */
document.getElementById('blowBtn').addEventListener('click', function(){
  document.querySelectorAll('.candle').forEach((c, i) => {
    setTimeout(() => {
      c.classList.add('blown');
      const smoke = document.createElement('div');
      smoke.className = 'smoke';
      c.appendChild(smoke);
    }, i*150);
  });
  const clap = document.getElementById('clapSound');
  clap.currentTime = 0;
  clap.play().catch(()=>{});
  setTimeout(() => {
    burstConfetti(120);
    document.getElementById('cakeNote').classList.add('show');
  }, 500);
  this.disabled = true;
  this.style.opacity = '.55';
});

/* ---------- 11. FLOATING MUSIC PLAYER ---------- */
const bgMusic = document.getElementById('bgMusic');
const playerToggle = document.getElementById('playerToggle');
const playerEl = document.getElementById('player');
const musicPill = document.getElementById('musicPill');
const musicPillLabel = document.getElementById('musicPillLabel');
const progressFill = document.getElementById('playerProgressFill');
const progressBar = document.getElementById('playerProgress');
const volumeSlider = document.getElementById('playerVolume');
const playerTime = document.getElementById('playerTime');
const playerMinBtn = document.getElementById('playerMinimize');
const playerMinFab = document.getElementById('playerMin');

bgMusic.volume = 0.6;

function fmtTime(sec){
  if(!isFinite(sec)) return '0:00';
  const m = Math.floor(sec/60);
  const s = Math.floor(sec%60);
  return `${m}:${String(s).padStart(2,'0')}`;
}

function togglePlay(){
  if(!bgMusic.src){
    // no audio source configured — still toggle UI so the demo feels alive
    document.body.classList.toggle('music-demo-playing');
    const nowPlaying = document.body.classList.contains('music-demo-playing');
    reflectPlayState(nowPlaying);
    return;
  }
  if(bgMusic.paused){
    bgMusic.play().catch(()=>{});
  } else {
    bgMusic.pause();
  }
}
function reflectPlayState(isPlaying){
  playerToggle.textContent = isPlaying ? '❚❚' : '▶';
  playerEl.classList.toggle('is-playing', isPlaying);
  musicPill.classList.toggle('playing', isPlaying);
  musicPillLabel.textContent = isPlaying ? 'Playing the song' : 'Play the song';
  musicPill.setAttribute('aria-pressed', String(isPlaying));
}
bgMusic.addEventListener('play', () => reflectPlayState(true));
bgMusic.addEventListener('pause', () => reflectPlayState(false));
bgMusic.addEventListener('timeupdate', () => {
  if(bgMusic.duration){
    progressFill.style.width = (bgMusic.currentTime/bgMusic.duration*100) + '%';
    playerTime.textContent = `${fmtTime(bgMusic.currentTime)} / ${fmtTime(bgMusic.duration)}`;
  }
});
playerToggle.addEventListener('click', togglePlay);
musicPill.addEventListener('click', togglePlay);
volumeSlider.addEventListener('input', (e) => { bgMusic.volume = parseFloat(e.target.value); });
progressBar.addEventListener('click', (e) => {
  if(!bgMusic.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  bgMusic.currentTime = ratio * bgMusic.duration;
});
playerMinBtn.addEventListener('click', () => {
  playerEl.classList.add('collapsed');
  playerMinFab.classList.remove('hide');
});
playerMinFab.addEventListener('click', () => {
  playerEl.classList.remove('collapsed');
  playerMinFab.classList.add('hide');
});

/* ---------- 12. FINAL FULL-SCREEN SURPRISE ---------- */
const finale = document.getElementById('finale');
function openFinale(){
  finale.classList.add('open');
  burstConfetti(220);
  spawnRisingHearts(60);
  for(let i=0;i<8;i++) setTimeout(randomFirework, i*220);
  for(let i=0;i<7;i++) setTimeout(spawnBalloon, i*180);
}
function closeFinale(){ finale.classList.remove('open'); }
document.getElementById('finalBtn').addEventListener('click', openFinale);
document.getElementById('finaleClose').addEventListener('click', closeFinale);
finale.addEventListener('click', (e) => { if(e.target === finale) closeFinale(); });