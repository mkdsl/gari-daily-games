const sheets = {};
const atlasData = {};

export async function loadSprites(atlasUrl) {
  const resp = await fetch(atlasUrl);
  const atlas = await resp.json();
  Object.assign(atlasData, atlas);

  const promises = Object.entries(atlas).map(([key, data]) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { sheets[key] = img; resolve(); };
      img.onerror = () => resolve(); // graceful fallback
      img.src = data.image;
    });
  });
  await Promise.all(promises);
}

export function drawSprite(ctx, sheetKey, frameName, x, y, w, h) {
  const sheet = sheets[sheetKey];
  const atlas = atlasData[sheetKey];
  if (!sheet || !atlas) return false; // signal: use fallback drawing

  const frame = atlas.frames[frameName];
  if (!frame) return false;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet, frame.x, frame.y, atlas.frameWidth, atlas.frameHeight, x, y, w || atlas.frameWidth, h || atlas.frameHeight);
  return true; // drawn successfully
}

export function drawBgSection(ctx, sectionName, dx, dy, dw, dh) {
  const sheet = sheets['background'];
  const atlas = atlasData['background'];
  if (!sheet || !atlas || !atlas.sections) return false;

  const sec = atlas.sections[sectionName];
  if (!sec) return false;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet, sec.x, sec.y, sec.w, sec.h, dx, dy, dw || sec.w, dh || sec.h);
  return true;
}

export function hasSprites(sheetKey) {
  return !!sheets[sheetKey];
}
