import { CONFIG } from './config.js';

export function render(ctx, state) {
  const w = ctx.canvas.width / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;

  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  // Jova: zameni sa pravim render-om po Perinom dizajnu
  ctx.fillStyle = CONFIG.COLORS.PRIMARY;
  ctx.font = '16px monospace';
  ctx.fillText(`score: ${state.score}`, 20, 40);

  if (state.gameOver) {
    ctx.fillStyle = CONFIG.COLORS.ACCENT;
    ctx.font = '32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', w / 2, h / 2);
    ctx.textAlign = 'left';
  }
}
