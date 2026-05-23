// Sparkle particle — spawned on successful placement
export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color || '#FFD700';
    this.vx = (Math.random() - 0.5) * 120;
    this.vy = (Math.random() - 0.9) * 120;
    this.life = 1.0; // 0..1, 1 = fresh
    this.decay = 0.03 + Math.random() * 0.04;
    this.size = 3 + Math.random() * 4;
    this.gravity = 60;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;
    this.life -= this.decay;
  }

  get alive() {
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Spawn a burst of particles at (x, y) with given color.
 * Returns array of Particle instances.
 */
export function spawnParticles(x, y, color, count = 10) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
  return particles;
}
