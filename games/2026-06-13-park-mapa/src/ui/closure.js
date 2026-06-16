let closureEl = null;
let isShown = false;

export function createClosureEl() {
  if (closureEl) return closureEl;

  closureEl = document.createElement('div');
  closureEl.id = 'closure-screen';
  closureEl.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(13, 27, 42, 0.92);
    z-index: 500;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-family: monospace;
    color: #E8DCC8;
    text-align: center;
    backdrop-filter: blur(4px);
  `;

  document.body.appendChild(closureEl);
  return closureEl;
}

export function showClosure(ptEarnedToday, emit) {
  if (isShown) return;
  isShown = true;

  const el = createClosureEl();
  el.style.display = 'flex';
  el.innerHTML = `
    <div style="animation: closureFadeIn 0.8s ease-out both;">
      <div style="font-size: 48px; margin-bottom: 16px; animation: lanternSway 2s ease-in-out infinite;">
        *
      </div>
      <div style="font-size: 28px; font-weight: bold; color: #FFD700; margin-bottom: 8px;">
        Park je za danas tvoj.
      </div>
      <div style="font-size: 14px; color: #aaa; margin-bottom: 20px;">
        Sve misije ovog dana su završene.
      </div>
      <div style="display: inline-block; background: rgba(255,215,0,0.1); border: 1px solid #FFD700;
                  border-radius: 8px; padding: 16px 32px; margin-bottom: 24px;">
        <div style="font-size: 11px; color: #888; margin-bottom: 4px;">DANAS ZARAĐENO</div>
        <div style="font-size: 32px; font-weight: bold; color: #FFD700;">+${ptEarnedToday} PT</div>
      </div>
      <div style="font-size: 12px; color: #555; margin-bottom: 20px;">
        Vrati se sutra za nove Easter Egg-ove i Dnevno Svetlo.
      </div>
      <button id="closure-dismiss" style="
        background: #FFD700;
        color: #0D1B2A;
        border: none;
        border-radius: 4px;
        padding: 10px 24px;
        font-family: monospace;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
      ">Nastavi</button>
    </div>
  `;

  // Add CSS animation via style tag if not present
  if (!document.getElementById('closure-styles')) {
    const style = document.createElement('style');
    style.id = 'closure-styles';
    style.textContent = `
      @keyframes closureFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes lanternSway {
        0%, 100% { transform: rotate(-10deg); }
        50% { transform: rotate(10deg); }
      }
    `;
    document.head.appendChild(style);
  }

  el.querySelector('#closure-dismiss')?.addEventListener('click', () => {
    hideClosure();
    if (emit) emit('closureDismissed', {});
  });
}

export function hideClosure() {
  if (!closureEl) return;
  closureEl.style.display = 'none';
  isShown = false;
}

export function isClosureShown() { return isShown; }
