const state = {
  frame: 'black',
  size: '8x10',
  matMM: 16,
  prices: {'8x10':59,'12x16':99,'16x20':149,'24x36':249},
  ppi: 3, // pixels per inch on scene scale (will be computed)
  scene: 'none'
};

const $ = id => document.getElementById(id);

// Elements
const artUpload = $('artUpload');
const artImg = $('artImg');
const frameEl = $('frame');
const matEl = $('mat');
const matVal = $('matVal');
const frameSwatches = $('frameSwatches');
const sizeOptions = $('sizeOptions');
const priceVal = $('priceVal');
const scene = $('scene');
const sceneImg = $('sceneImg');
const sceneSelect = $('sceneSelect');
const refWidth = $('refWidth');
const seeWallBtn = $('seeWall');
const roomUpload = $('roomUpload');
const dims = $('dims');
const checkoutBtn = $('checkoutBtn');

// Helpers
function sizeToInches(sizeStr){
  const [w,h] = sizeStr.split('x').map(Number);
  return {w, h};
}
function mmToPx(mm){ return (mm/25.4) * state.ppi; }

function updateFrameScale(){
  const {w, h} = sizeToInches(state.size);
  // Inner art area (image) is the paper size minus mat. Frame moulding assumed ~1.5in visually
  const matPx = mmToPx(state.matMM);
  const mouldingIn = 1.5;
  const mouldingPx = mouldingIn * state.ppi;

  const innerW = w * state.ppi;
  const innerH = h * state.ppi;

  const totalW = innerW + matPx*2 + mouldingPx*2;
  const totalH = innerH + matPx*2 + mouldingPx*2;

  // Apply sizes
  matEl.style.padding = `${matPx}px`;
  artImg.style.maxWidth = `${innerW}px`;
  artImg.style.maxHeight = `${innerH}px`;

  frameEl.style.padding = `${mouldingPx}px`;
  frameEl.style.width = `${totalW}px`;
  frameEl.style.height = 'auto';

  dims.textContent = `${w} × ${h} in`;
}

function setPrice(){
  priceVal.textContent = `$${state.prices[state.size]}`;
}

// Upload artwork
artUpload.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => { artImg.src = ev.target.result; };
  reader.readAsDataURL(f);
});

// Frame swatches
frameSwatches.addEventListener('click', (e)=>{
  if(!e.target.classList.contains('swatch')) return;
  document.querySelectorAll('.swatch').forEach(s=>s.classList.remove('active'));
  e.target.classList.add('active');
  state.frame = e.target.getAttribute('data-frame');
  frameEl.className = `frame ${state.frame}`;
});

// Size radio
sizeOptions.addEventListener('change', (e)=>{
  state.size = e.target.value;
  setPrice();
  updateFrameScale();
});

// Mat slider
$('matRange').addEventListener('input', (e)=>{
  state.matMM = parseInt(e.target.value,10);
  matVal.textContent = state.matMM;
  updateFrameScale();
});

// Scene select (built-in scenes with default ref widths)
sceneSelect.addEventListener('change', (e)=>{
  state.scene = e.target.value;
  if(state.scene === 'none'){
    sceneImg.removeAttribute('src');
    scene.classList.remove('has-bg');
    state.ppi = 3; // default studio scale
  } else {
    let src = '';
    let defaultRef = 84; // inches
    if(state.scene==='living'){ src='assets/scene_livingroom.jpg'; defaultRef=84; }
    if(state.scene==='gallery'){ src='assets/scene_gallery.jpg'; defaultRef=96; }
    if(state.scene==='bed'){ src='assets/scene_bedroom.jpg'; defaultRef=60; }
    sceneImg.src = src;
    refWidth.value = defaultRef;
    scene.classList.add('has-bg');
    sceneImg.onload = ()=> computeScaleFromRef();
  }
  updateFrameScale();
});

// Compute pixels-per-inch from reference width
function computeScaleFromRef(){
  // Heuristic: refWidth spans ~60% of scene width (sofa/bed region). User can tweak value.
  const refInches = parseFloat(refWidth.value||'84');
  const scenePx = scene.clientWidth * 0.60; // assume central object spans ~60%
  state.ppi = scenePx / refInches;
  updateFrameScale();
}

// Manual ref width change
refWidth.addEventListener('input', ()=>{
  computeScaleFromRef();
});

// See on wall toggle (just ensures a background is visible)
seeWallBtn.addEventListener('click', ()=>{
  if(state.scene==='none'){
    sceneSelect.value = 'living';
    sceneSelect.dispatchEvent(new Event('change'));
  }
});

// Upload custom room
roomUpload.addEventListener('change', (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    sceneImg.src = ev.target.result;
    scene.classList.add('has-bg');
    sceneImg.onload = ()=> computeScaleFromRef();
  };
  reader.readAsDataURL(f);
});

// Checkout placeholder
checkoutBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  const subject = encodeURIComponent('ArtWallsy Order Request');
  const body = encodeURIComponent(`Hi ArtWallsy,\n\nI'd like to order a framed print.\nSize: ${state.size}\nFrame: ${state.frame}\nMat: ${state.matMM}mm\n\nPlease reply with payment link and shipping steps.\n`);
  location.href = `mailto:support@artwallsy.com?subject=${subject}&body=${body}`;
});

// Init
updateFrameScale(); setPrice();
