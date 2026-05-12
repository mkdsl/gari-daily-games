// speakers.js — speaker entity logic

export function getSpeakerConePoints(sx, sy, angle_deg, length, spread_deg) {
  const angle_rad = (angle_deg * Math.PI) / 180;
  const spread_rad = (spread_deg * Math.PI) / 180;

  const left_angle = angle_rad - spread_rad / 2;
  const right_angle = angle_rad + spread_rad / 2;

  return {
    origin: { x: sx, y: sy },
    left: {
      x: sx + Math.cos(left_angle) * length,
      y: sy + Math.sin(left_angle) * length
    },
    right: {
      x: sx + Math.cos(right_angle) * length,
      y: sy + Math.sin(right_angle) * length
    },
    center: {
      x: sx + Math.cos(angle_rad) * length,
      y: sy + Math.sin(angle_rad) * length
    }
  };
}
