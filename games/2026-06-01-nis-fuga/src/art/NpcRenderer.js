/**
 * NpcRenderer.js — CSS sprite compositions for 5 NPCs (80×120px each)
 * All NPC visuals built with CSS div compositions — no image files
 * @module NpcRenderer
 */

/**
 * Inject NPC sprite CSS into document head
 */
export function injectStyles() {
  const style = document.createElement('style');
  style.id = 'npc-renderer-styles';
  style.textContent = getNpcCSS();
  document.head.appendChild(style);
}

function getNpcCSS() {
  return `
/* ===== BASE NPC ===== */
.scene-npc {
  position: absolute;
  bottom: 20%;
  width: 80px;
  height: 120px;
  pointer-events: none;
}
/* NPC breathing animation */
.scene-npc::before {
  animation: npcBreath 3s ease-in-out infinite;
}
@keyframes npcBreath {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
/* NPC body base */
.npc-body {
  position: absolute;
  border-radius: 4px 4px 0 0;
}
/* NPC head */
.npc-head {
  position: absolute;
  border-radius: 50%;
}
/* NPC arms */
.npc-arm-l, .npc-arm-r {
  position: absolute;
  border-radius: 8px;
}
/* NPC legs */
.npc-leg-l, .npc-leg-r {
  position: absolute;
  border-radius: 0 0 4px 4px;
}

/* ===== DRAGOLJUB — Parking inspektor ===== */
.npc-dragoljub {
  right: 30%;
}
/* Body — dark blue uniform */
.npc-dragoljub .npc-body {
  left: 22px; top: 32px;
  width: 36px; height: 52px;
  background: #1A3A6B;
  box-shadow: inset 0 0 0 2px #0A2A4B;
}
/* Yellow trim stripe */
.npc-dragoljub .npc-body::before {
  content: '';
  position: absolute;
  left: 4px; top: 8px;
  width: 28px; height: 3px;
  background: #FFD700;
  box-shadow: 0 8px 0 #FFD700;
}
/* Notepad */
.npc-dragoljub .npc-body::after {
  content: '';
  position: absolute;
  right: -12px; top: 10px;
  width: 14px; height: 18px;
  background: #F5E6C8;
  border: 1px solid #C0A870;
  border-radius: 2px;
}
/* Head */
.npc-dragoljub .npc-head {
  left: 24px; top: 4px;
  width: 32px; height: 32px;
  background: #D4916C;
}
/* Hat */
.npc-dragoljub .npc-head::before {
  content: '';
  position: absolute;
  left: -4px; top: -14px;
  width: 40px; height: 16px;
  background: #1A3A6B;
  border-radius: 6px 6px 0 0;
  box-shadow: -6px 2px 0 0 #1A3A6B, 46px 2px 0 0 #1A3A6B;
}
/* Mustache */
.npc-dragoljub .npc-head::after {
  content: '';
  position: absolute;
  left: 6px; bottom: 8px;
  width: 20px; height: 5px;
  background: #3A2010;
  border-radius: 50% 50% 0 0 / 80% 80% 0 0;
}
/* Arms */
.npc-dragoljub .npc-arm-l {
  left: 8px; top: 40px;
  width: 12px; height: 36px;
  background: #1A3A6B;
  transform: rotate(-10deg);
}
.npc-dragoljub .npc-arm-r {
  right: 8px; top: 40px;
  width: 12px; height: 36px;
  background: #1A3A6B;
  transform: rotate(15deg);
}
/* Legs */
.npc-dragoljub .npc-leg-l {
  left: 22px; bottom: 0;
  width: 14px; height: 30px;
  background: #0A1A3A;
}
.npc-dragoljub .npc-leg-r {
  right: 22px; bottom: 0;
  width: 14px; height: 30px;
  background: #0A1A3A;
}

/* ===== BACA MILE — Kiosk vlasnik ===== */
.npc-bacamile {
  left: 55%;
}
/* Body — apron */
.npc-bacamile .npc-body {
  left: 20px; top: 32px;
  width: 40px; height: 52px;
  background: #4A7F4A;
}
/* Apron */
.npc-bacamile .npc-body::before {
  content: '';
  position: absolute;
  left: 8px; top: 4px;
  width: 24px; height: 44px;
  background: #F5E6C8;
  border-radius: 0 0 4px 4px;
}
/* Head */
.npc-bacamile .npc-head {
  left: 22px; top: 2px;
  width: 36px; height: 34px;
  background: #C07840;
}
/* Šajkača hat */
.npc-bacamile .npc-head::before {
  content: '';
  position: absolute;
  left: -8px; top: -16px;
  width: 52px; height: 20px;
  background: #2A1A0A;
  border-radius: 4px 4px 0 0;
  clip-path: polygon(0 100%, 0 40%, 8% 0, 92% 0, 100% 40%, 100% 100%);
}
/* Smile lines */
.npc-bacamile .npc-head::after {
  content: '';
  position: absolute;
  left: 8px; bottom: 6px;
  width: 20px; height: 8px;
  border-bottom: 3px solid #6B3010;
  border-radius: 0 0 50% 50%;
}
/* Arms */
.npc-bacamile .npc-arm-l {
  left: 4px; top: 38px;
  width: 14px; height: 32px;
  background: #4A7F4A;
  transform: rotate(-20deg);
}
.npc-bacamile .npc-arm-r {
  right: 4px; top: 38px;
  width: 14px; height: 32px;
  background: #4A7F4A;
  transform: rotate(20deg);
}
/* Legs */
.npc-bacamile .npc-leg-l {
  left: 20px; bottom: 0;
  width: 14px; height: 28px;
  background: #3A3030;
}
.npc-bacamile .npc-leg-r {
  right: 20px; bottom: 0;
  width: 14px; height: 28px;
  background: #3A3030;
}

/* ===== PANTA — Kafandžija ===== */
.npc-panta {
  left: 20%;
}
/* White shirt */
.npc-panta .npc-body {
  left: 20px; top: 30px;
  width: 40px; height: 54px;
  background: #F5F0E8;
  box-shadow: inset 0 0 0 2px #D4C8B0;
}
/* Vest / tie */
.npc-panta .npc-body::before {
  content: '';
  position: absolute;
  left: 14px; top: 0;
  width: 12px; height: 54px;
  background: #8B1A1A;
  clip-path: polygon(2px 0, 10px 0, 12px 54px, 0 54px);
}
/* Coffee džezva in hand */
.npc-panta .npc-body::after {
  content: '';
  position: absolute;
  left: -18px; top: 20px;
  width: 16px; height: 20px;
  background: #C07830;
  border-radius: 2px 2px 4px 4px;
  box-shadow: 10px -4px 0 0 #C07830;
}
/* Head */
.npc-panta .npc-head {
  left: 20px; top: 2px;
  width: 40px; height: 32px;
  background: #C89060;
}
/* Gray hair */
.npc-panta .npc-head::before {
  content: '';
  position: absolute;
  left: 0; top: 0;
  width: 100%; height: 35%;
  background: #A0A0A0;
  border-radius: 50% 50% 0 0;
}
/* Glasses */
.npc-panta .npc-head::after {
  content: '';
  position: absolute;
  left: 4px; top: 12px;
  width: 32px; height: 10px;
  border: 2px solid #3A2810;
  border-radius: 4px;
  box-shadow: 14px 0 0 0 #3A2810;
}
.npc-panta .npc-arm-l {
  left: 4px; top: 36px;
  width: 14px; height: 32px;
  background: #F5F0E8;
  transform: rotate(-30deg);
}
.npc-panta .npc-arm-r {
  right: 4px; top: 36px;
  width: 14px; height: 32px;
  background: #F5F0E8;
  transform: rotate(10deg);
}
.npc-panta .npc-leg-l {
  left: 20px; bottom: 0;
  width: 14px; height: 28px;
  background: #2A2A2A;
}
.npc-panta .npc-leg-r {
  right: 20px; bottom: 0;
  width: 14px; height: 28px;
  background: #2A2A2A;
}

/* ===== BOJAN — Gitarista ===== */
.npc-bojan {
  right: 25%;
}
/* Casual jacket */
.npc-bojan .npc-body {
  left: 18px; top: 28px;
  width: 44px; height: 56px;
  background: #3A4A6B;
  border-radius: 6px 6px 0 0;
}
/* Guitar case */
.npc-bojan .npc-body::after {
  content: '';
  position: absolute;
  right: -22px; top: 4px;
  width: 20px; height: 50px;
  background: #2A1A0A;
  border-radius: 4px;
  border: 2px solid #3A2810;
}
/* Head */
.npc-bojan .npc-head {
  left: 20px; top: 0;
  width: 40px; height: 32px;
  background: #C89060;
}
/* Curly hair */
.npc-bojan .npc-head::before {
  content: '';
  position: absolute;
  left: -2px; top: -8px;
  width: 44px; height: 20px;
  background: #2A1A0A;
  border-radius: 50% 50% 0 0;
}
/* Stubble */
.npc-bojan .npc-head::after {
  content: '';
  position: absolute;
  left: 4px; bottom: 2px;
  width: 32px; height: 10px;
  background: rgba(42,26,10,0.3);
  border-radius: 4px;
}
.npc-bojan .npc-arm-l {
  left: 2px; top: 34px;
  width: 14px; height: 34px;
  background: #3A4A6B;
  transform: rotate(-15deg);
}
.npc-bojan .npc-arm-r {
  right: 2px; top: 34px;
  width: 14px; height: 34px;
  background: #3A4A6B;
  transform: rotate(15deg);
}
.npc-bojan .npc-leg-l {
  left: 18px; bottom: 0;
  width: 14px; height: 30px;
  background: #1A1A1A;
}
.npc-bojan .npc-leg-r {
  right: 18px; bottom: 0;
  width: 14px; height: 30px;
  background: #1A1A1A;
}

/* ===== NENAD — Čuvar kluba ===== */
.npc-nenad {
  right: 20%;
}
/* Black uniform */
.npc-nenad .npc-body {
  left: 18px; top: 26px;
  width: 44px; height: 58px;
  background: #1A1A1A;
}
/* Security badge */
.npc-nenad .npc-body::before {
  content: 'SEC';
  position: absolute;
  left: 6px; top: 8px;
  width: 24px; height: 16px;
  background: #FFD700;
  color: #1A1A1A;
  font-size: 6px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}
/* Head */
.npc-nenad .npc-head {
  left: 20px; top: 0;
  width: 40px; height: 30px;
  background: #8B6030;
}
/* Buzzcut */
.npc-nenad .npc-head::before {
  content: '';
  position: absolute;
  left: 0; top: 0;
  width: 100%; height: 30%;
  background: #1A1A1A;
  border-radius: 50% 50% 0 0;
}
/* Crossed arms — right arm */
.npc-nenad .npc-arm-r {
  right: 0; top: 32px;
  width: 20px; height: 14px;
  background: #1A1A1A;
  transform: rotate(-30deg) translateX(8px);
  z-index: 2;
}
/* Crossed arms — left arm */
.npc-nenad .npc-arm-l {
  left: 0; top: 38px;
  width: 20px; height: 14px;
  background: #1A1A1A;
  transform: rotate(20deg) translateX(-4px);
}
.npc-nenad .npc-leg-l {
  left: 18px; bottom: 0;
  width: 14px; height: 30px;
  background: #0A0A0A;
}
.npc-nenad .npc-leg-r {
  right: 18px; bottom: 0;
  width: 14px; height: 30px;
  background: #0A0A0A;
}
  `;
}

/**
 * Create NPC DOM element with sprite divs
 * @param {string} npcId
 * @returns {HTMLElement}
 */
export function createNpcElement(npcId) {
  const el = document.createElement('div');
  el.className = `scene-npc npc-${npcId}`;

  // Add sprite sub-elements
  ['head', 'body', 'arm-l', 'arm-r', 'leg-l', 'leg-r'].forEach(part => {
    const div = document.createElement('div');
    div.className = `npc-${part}`;
    el.appendChild(div);
  });

  return el;
}

// NPC portrait CSS for dialog
export function injectPortraitStyles() {
  const style = document.createElement('style');
  style.id = 'npc-portrait-styles';
  style.textContent = `
    .dialog-portrait { width: 64px; height: 64px; border-radius: 50%; background: #3D3D3D; overflow: hidden; }
    .npc-portrait-dragoljub_stern,
    .npc-portrait-dragoljub_curious,
    .npc-portrait-dragoljub_neutral { background: #1A3A6B; }
    .npc-portrait-bacamile_busy,
    .npc-portrait-bacamile_friendly,
    .npc-portrait-bacamile_skeptical { background: #4A7F4A; }
    .npc-portrait-panta_neutral,
    .npc-portrait-panta_interested,
    .npc-portrait-panta_amused,
    .npc-portrait-panta_convinced { background: #8B1A1A; }
    .npc-portrait-bojan_sheepish,
    .npc-portrait-bojan_grateful,
    .npc-portrait-bojan_okay,
    .npc-portrait-bojan_hurt { background: #3A4A6B; }
    .npc-portrait-nenad_official,
    .npc-portrait-nenad_checking,
    .npc-portrait-nenad_neutral,
    .npc-portrait-nenad_impressed { background: #1A1A1A; }
    .npc-portrait-jovanka_neutral,
    .npc-portrait-jovanka_worried,
    .npc-portrait-jovanka_explaining,
    .npc-portrait-jovanka_frustrated { background: #E8A24A; }
    .npc-portrait-default { background: #555; }
  `;
  document.head.appendChild(style);
}

export default { injectStyles, createNpcElement, injectPortraitStyles };
