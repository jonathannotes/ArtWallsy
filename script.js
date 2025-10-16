
const uploadInput = document.getElementById('upload');
const fakeBtn = document.getElementById('fakeBtn');
const artImg = document.querySelector('.art-img');
const roomPic = document.querySelector('.room .pic');
const frameWrap = document.querySelector('.frame-wrap');
const frameRim = document.querySelector('.frame');
const roomMount = document.querySelector('.room .mount');
const priceEl = document.getElementById('price');
let currentSize = {w:12,h:16}; // inches
let basePrice = 88;
let frameStyle = 'black';
function updatePrice(){
  const area = currentSize.w*currentSize.h;
  const p = Math.max(88, Math.round(0.55 * area));
  priceEl.textContent = `$${p}`;
}
function pickFrame(style){
  frameStyle = style;
  frameRim.className = `frame ${style}`;
  roomMount.className = `mount ${style}`;
}
function setRoom(room){
  document.querySelector('.room img.bg').src = `assets/${room}.jpg`;
  const note = document.getElementById('scaleNote');
  if(room==='bedroom'){ note.textContent = 'Shown at realistic scale relative to a queen bed (~60").'; }
  if(room==='livingroom'){ note.textContent = 'Shown at realistic scale relative to a 3-seat sofa (~84").'; }
  if(room==='gallery'){ note.textContent = 'Gallery wall – reference width ≈ 16 ft.'; }
}
function setSize(w,h){
  currentSize = {w,h};
  // square preview on wall regardless; compute physical width vs reference furniture width
  const room = document.querySelector('.room img.bg').src;
  // pick reference in inches
  let ref = 60; // bed default
  if(room.includes('livingroom')) ref = 84;
  if(room.includes('gallery')) ref = 192;
  const ratio = (w)/ref; // show square width as a fraction
  const canvas = document.querySelector('.room .canvas');
  const canvasW = canvas.clientWidth;
  const mountW = Math.max(canvasW*0.10, Math.min(canvasW*0.28, canvasW*ratio)); // clamp
  roomMount.style.width = mountW+'px';
  updatePrice();
}
// Upload handlers
fakeBtn.addEventListener('click', ()=> uploadInput.click());
uploadInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  artImg.src = url;
  roomPic.src = url;
});
// Frame buttons
document.querySelectorAll('[data-frame]').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('[data-frame]').forEach(x=>x.classList.remove('is-active'));
    b.classList.add('is-active');
    pickFrame(b.dataset.frame);
  });
});
// Room tabs
document.querySelectorAll('[data-room]').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('[data-room]').forEach(x=>x.classList.remove('is-active'));
    b.classList.add('is-active');
    setRoom(b.dataset.room);
    setSize(currentSize.w,currentSize.h);
  });
});
// Size chips
document.querySelectorAll('[data-size]').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('[data-size]').forEach(x=>x.classList.remove('is-active'));
    b.classList.add('is-active');
    const [w,h]=b.dataset.size.split('x').map(Number);
    setSize(w,h);
  });
});
// init
pickFrame('black'); setRoom('bedroom'); setSize(12,16); updatePrice();
