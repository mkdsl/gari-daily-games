let _faceImg = null;
let _faceLoaded = false;

export function getFaceImage() {
  if (_faceLoaded) return _faceImg;
  _faceLoaded = true;
  const data = localStorage.getItem('avala-run-face');
  if (data) { _faceImg = new Image(); _faceImg.src = data; }
  return _faceImg;
}

export function refreshFace() {
  _faceLoaded = false;
  _faceImg = null;
}
