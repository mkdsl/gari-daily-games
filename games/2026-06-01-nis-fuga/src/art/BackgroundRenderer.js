/**
 * BackgroundRenderer.js — CSS art backgrounds for 5 game scenes
 * All visual elements rendered in pure CSS — no image files
 * @module BackgroundRenderer
 */

/**
 * Inject all scene background CSS into document head
 * Called once during game initialization
 */
export function injectStyles() {
  const style = document.createElement('style');
  style.id = 'bg-renderer-styles';
  style.textContent = getBackgroundCSS();
  document.head.appendChild(style);
}

function getBackgroundCSS() {
  return `
/* ===== BASE SCENE BG ===== */
.scene-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* ===== SCENA 1: BULEVAR ===== */
.bg-bulevar {
  background: linear-gradient(
    180deg,
    #E8A24A 0%,
    #F5C57A 25%,
    #F5E6C8 55%,
    #D4C5A0 100%
  );
}
/* Sky */
.bg-bulevar::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 45%;
  background: linear-gradient(180deg, #E8A24A 0%, #F5C57A 60%, #F5E6C8 100%);
}
/* Ground / pavement */
.bg-bulevar::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 30%;
  background: repeating-linear-gradient(
    90deg,
    #C8B89A 0px, #C8B89A 60px,
    #D4C5A0 60px, #D4C5A0 62px
  );
}
/* Building block left */
.bg-bulevar .bg-building-l {
  position: absolute;
  left: 0; top: 15%;
  width: 20%; height: 55%;
  background: #3D3D3D;
  box-shadow: inset -4px 0 0 #2A2A2A;
}
.bg-bulevar .bg-building-l::after {
  content: '';
  position: absolute;
  top: 10%; left: 10%;
  width: 75%; height: 80%;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px, transparent 18px,
    rgba(74,127,165,0.4) 18px, rgba(74,127,165,0.4) 26px
  );
}
/* Building block right */
.bg-bulevar .bg-building-r {
  position: absolute;
  right: 0; top: 10%;
  width: 18%; height: 65%;
  background: #4A4040;
  box-shadow: inset 4px 0 0 #2A2A2A;
}
/* Van */
.bg-bulevar .bg-van {
  position: absolute;
  left: 8%; bottom: 28%;
  width: 22%; height: 18%;
  background: #E8E0D0;
  border-radius: 8px 8px 4px 4px;
  box-shadow: 2px 2px 0 #C0B8A8;
}
.bg-bulevar .bg-van::before {
  content: '';
  position: absolute;
  top: -35%; left: 20%;
  width: 60%; height: 40%;
  background: #D4C8B4;
  border-radius: 4px 4px 0 0;
}
.bg-bulevar .bg-van::after {
  content: '';
  position: absolute;
  bottom: -20%; left: 10%;
  width: 25%; height: 28%;
  background: #1A1A1A;
  border-radius: 50%;
  box-shadow: 48% 0 0 0 #1A1A1A;
}
/* Parking sign */
.bg-bulevar .bg-parksign {
  position: absolute;
  right: 22%; top: 28%;
  width: 3%; height: 18%;
  background: #666;
}
.bg-bulevar .bg-parksign::before {
  content: 'P';
  position: absolute;
  top: -50%; left: -150%;
  width: 600%;
  height: 80%;
  background: #003DA5;
  color: white;
  font-size: 14px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
.bg-bulevar .bg-parksign::after {
  content: '';
  position: absolute;
  top: -30%;
  left: -120%;
  width: 480%;
  height: 4px;
  background: #C0392B;
  transform: rotate(-45deg);
}

/* ===== SCENA 2: KIOSK ===== */
.bg-kiosk {
  background: linear-gradient(180deg, #87CEEB 0%, #B0D8F5 40%, #E8E0D0 40%, #D4C5A0 100%);
}
/* Apartment building bg */
.bg-kiosk::before {
  content: '';
  position: absolute;
  right: 0; top: 5%;
  width: 45%; height: 70%;
  background: #6B6B6B;
  background-image:
    repeating-linear-gradient(0deg, transparent 0, transparent 20px, rgba(0,0,0,0.15) 20px, rgba(0,0,0,0.15) 22px),
    repeating-linear-gradient(90deg, transparent 0, transparent 30px, rgba(0,0,0,0.1) 30px, rgba(0,0,0,0.1) 32px);
}
/* Kiosk box */
.bg-kiosk .bg-kiosk-box {
  position: absolute;
  left: 15%; bottom: 20%;
  width: 45%; height: 45%;
  background: #E8A24A;
  border: 3px solid #C07830;
  border-radius: 4px;
}
/* Rolo kapak napola */
.bg-kiosk .bg-kiosk-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 45%;
  background: repeating-linear-gradient(
    0deg,
    #C07830 0px, #C07830 6px,
    #E8A24A 6px, #E8A24A 10px
  );
}
/* Kiosk awning */
.bg-kiosk .bg-kiosk-box::after {
  content: '';
  position: absolute;
  top: -15%; left: -5%;
  width: 110%; height: 18%;
  background: #C0392B;
  background-image: repeating-linear-gradient(
    90deg,
    transparent 0, transparent 15px,
    rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 16px
  );
}
/* Signal bars 0-bar */
.bg-kiosk .bg-signal {
  position: absolute;
  top: 5%; right: 5%;
  display: flex;
  align-items: flex-end;
  gap: 2px;
}
.bg-kiosk .bg-signal span {
  width: 6px;
  background: rgba(0,0,0,0.2);
  border-radius: 1px;
}
.bg-kiosk .bg-signal span:nth-child(1) { height: 6px; }
.bg-kiosk .bg-signal span:nth-child(2) { height: 10px; }
.bg-kiosk .bg-signal span:nth-child(3) { height: 14px; }
.bg-kiosk .bg-signal span:nth-child(4) { height: 18px; }
/* Queue line */
.bg-kiosk .bg-queue {
  position: absolute;
  bottom: 18%; left: 8%;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

/* ===== SCENA 3: KAFANA ===== */
.bg-kafana {
  background: #8B7355;
}
/* Ceramic floor pattern */
.bg-kafana::before {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 35%;
  background:
    repeating-conic-gradient(#C8A87A 0% 25%, #A88054 0% 50%) 0 0 / 24px 24px;
}
/* Wall */
.bg-kafana::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 65%;
  background: #6B5140;
  background-image:
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 80px 80px;
}
/* Sank bar */
.bg-kafana .bg-sank {
  position: absolute;
  left: 0; bottom: 32%;
  width: 35%; height: 22%;
  background: linear-gradient(180deg, #8B5E3C, #6B4020);
  border-top: 6px solid #A07040;
  border-right: 4px solid #4A2800;
}
/* Window with Tvrdjava silhouette */
.bg-kafana .bg-prozor {
  position: absolute;
  right: 8%; top: 8%;
  width: 28%; height: 35%;
  background: linear-gradient(180deg, #87CEEB 0%, #A0D8EF 60%, #D4C5A0 60%, #C8B890 100%);
  border: 5px solid #4A2800;
  border-radius: 2px;
}
.bg-kafana .bg-prozor::after {
  content: '';
  position: absolute;
  bottom: 0; left: 10%;
  width: 80%; height: 40%;
  background: #3D3010;
  clip-path: polygon(
    0% 100%, 5% 60%, 10% 50%, 15% 55%, 20% 30%, 25% 45%, 30% 20%,
    35% 35%, 40% 10%, 45% 25%, 50% 15%, 55% 30%, 60% 18%,
    65% 35%, 70% 25%, 75% 50%, 80% 45%, 85% 60%, 90% 55%, 95% 65%, 100% 100%
  );
}

/* ===== SCENA 4: TVRDJAVA ===== */
.bg-tvrdjava {
  background: linear-gradient(180deg, #87CEEB 0%, #B5D8F0 50%, #5A8C30 50%, #4A7A25 100%);
}
/* Brick wall */
.bg-tvrdjava::before {
  content: '';
  position: absolute;
  left: 0; top: 10%;
  width: 40%; height: 75%;
  background:
    repeating-linear-gradient(
      0deg,
      #8B3A2A 0px, #8B3A2A 18px,
      #6B2A1A 18px, #6B2A1A 20px
    ),
    repeating-linear-gradient(
      90deg,
      transparent 0px, transparent 38px,
      #6B2A1A 38px, #6B2A1A 40px
    );
  background-size: 80px 20px, 80px 20px;
}
/* Tower top */
.bg-tvrdjava::after {
  content: '';
  position: absolute;
  left: 0; top: 5%;
  width: 40%; height: 15%;
  background: #8B3A2A;
  clip-path: polygon(
    0 100%, 0 60%, 10% 60%, 10% 0, 22% 0, 22% 60%, 40% 60%, 40% 0, 52% 0, 52% 60%, 65% 60%, 65% 0, 77% 0, 77% 60%, 90% 60%, 90% 0, 100% 0, 100% 100%
  );
}
/* Grass / park */
.bg-tvrdjava .bg-grass {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 30%;
  background: linear-gradient(180deg, #5A8C30 0%, #4A7A25 100%);
}
/* Bench */
.bg-tvrdjava .bg-bench {
  position: absolute;
  right: 15%; bottom: 28%;
  width: 20%; height: 6%;
  background: #6B4A20;
  border-radius: 2px;
  box-shadow: 0 4px 0 #4A3010;
}
.bg-tvrdjava .bg-bench::before {
  content: '';
  position: absolute;
  bottom: -40%; left: 10%;
  width: 10%; height: 60%;
  background: #4A3010;
  box-shadow: 280% 0 0 0 #4A3010;
}

/* ===== SCENA 5: KAPIJA KLUBA (nočna) ===== */
.bg-kapija {
  background: #1A1A2E;
}
/* Night sky gradient */
.bg-kapija::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(255,107,157,0.15) 0%, transparent 70%);
}
/* Club door */
.bg-kapija .bg-door {
  position: absolute;
  left: 35%; top: 20%;
  width: 30%; height: 65%;
  background: #2A2A4A;
  border: 3px solid #4A4A6A;
  border-radius: 4px 4px 0 0;
}
.bg-kapija .bg-door::before {
  content: 'TONIKA';
  position: absolute;
  top: -18%; left: -20%;
  width: 140%; height: 20%;
  color: #FF6B9D;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 3px;
  text-align: center;
  line-height: 1;
  text-shadow: 0 0 10px #FF6B9D, 0 0 20px #FF6B9D, 0 0 40px #FF6B9D;
  animation: neonPulse 2s ease-in-out infinite;
}
.bg-kapija .bg-door::after {
  content: '';
  position: absolute;
  top: 20%; left: 45%;
  width: 10%; height: 60%;
  background: #FF6B9D;
  border-radius: 50%;
  box-shadow: 0 0 8px #FF6B9D;
}
/* Stars */
.bg-kapija .bg-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bg-kapija .bg-stars::before {
  content: '·  ·    ·  ·   ·    ·  ·  ·    ·  ·   ·  ·    ·    ·  ·    ·  ·';
  position: absolute;
  top: 2%; left: 2%;
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  letter-spacing: 8px;
  white-space: pre;
}
/* Street light glow */
.bg-kapija .bg-streetlight {
  position: absolute;
  right: 15%; top: 5%;
  width: 2%; height: 55%;
  background: #4A4A6A;
}
.bg-kapija .bg-streetlight::before {
  content: '';
  position: absolute;
  top: -5%; left: -200%;
  width: 500%; height: 15%;
  background: #F5E6C8;
  border-radius: 50%;
  box-shadow: 0 0 20px 10px rgba(245,230,200,0.4);
}
@keyframes neonPulse {
  0%, 100% { text-shadow: 0 0 10px #FF6B9D, 0 0 20px #FF6B9D, 0 0 40px #FF6B9D; }
  50% { text-shadow: 0 0 5px #FF6B9D, 0 0 10px #FF6B9D, 0 0 20px #FF6B9D; }
}
  `;
}

/**
 * Build child elements for a scene background div
 * Called after the scene-bg element is created
 * @param {HTMLElement} bgEl - The .scene-bg element
 * @param {string} sceneId
 */
export function populateBackground(bgEl, sceneId) {
  const builders = {
    bulevar: buildBulevarChildren,
    kiosk: buildKioskChildren,
    kafana: buildKafanaChildren,
    tvrdjava: buildTvrdjavaChildren,
    kapija: buildKapijaChildren
  };
  builders[sceneId]?.(bgEl);
}

function buildBulevarChildren(el) {
  el.innerHTML = `
    <div class="bg-building-l"></div>
    <div class="bg-building-r"></div>
    <div class="bg-van"></div>
    <div class="bg-parksign"></div>
  `;
}

function buildKioskChildren(el) {
  el.innerHTML = `
    <div class="bg-kiosk-box"></div>
    <div class="bg-signal">
      <span></span><span></span><span></span><span></span>
    </div>
    <div class="bg-queue"></div>
  `;
}

function buildKafanaChildren(el) {
  el.innerHTML = `
    <div class="bg-sank"></div>
    <div class="bg-prozor"></div>
  `;
}

function buildTvrdjavaChildren(el) {
  el.innerHTML = `
    <div class="bg-grass"></div>
    <div class="bg-bench"></div>
  `;
}

function buildKapijaChildren(el) {
  el.innerHTML = `
    <div class="bg-door"></div>
    <div class="bg-stars"></div>
    <div class="bg-streetlight"></div>
  `;
}

export default { injectStyles, populateBackground };
