
const imgInput = document.getElementById('imgInput');
const art = document.getElementById('art');
const wallArt = document.getElementById('wallArt');
const frame = document.getElementById('frame');
const wallFrame = document.getElementById('wallFrame');
const priceEl = document.getElementById('price');
let currentURL = null;
let frameStyle = 'black';
let size = '18x24';

const prices = { '8x10': 88, '12x16': 129, '18x24': 199, '24x36': 329 };

// Upload
imgInput.addEventListener('change', e => {
  const file = e.target.files?.[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  currentURL = url;
  art.style.backgroundImage = `url(${url})`;
  wallArt.style.backgroundImage = `url(${url})`;
});

// Frame style
document.querySelectorAll('[data-frame]').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('[data-frame]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    frameStyle = b.dataset.frame;
    frame.setAttribute('data-style', frameStyle);
    wallFrame.style.setProperty('--frame-color', getComputedStyle(frame).getPropertyValue('--frame-color'));
  });
});

// Size
document.querySelectorAll('[data-size]').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('[data-size]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    size = b.dataset.size;
    priceEl.textContent = `$${prices[size]}`;
    // Size also affects wall frame target width (rough visual scaling)
    const map = {'8x10': 18, '12x16': 22, '18x24': 28, '24x36': 36}; // vh
    wallFrame.style.width = `min(${map[size]}vh, 44vw)`;
  });
});

// Modal
const modal = document.getElementById('modal');
document.getElementById('openWall').addEventListener('click', ()=>{
  modal.classList.add('open');
});
document.getElementById('closeWall').addEventListener('click', ()=>{
  modal.classList.remove('open');
});

// Rooms
const note = document.getElementById('note');
const wallImg = document.getElementById('wallImg');
const roomNotes = {
  bedroom: 'Sizes shown at realistic scale relative to furniture (queen bed ≈ 60").',
  living:  'Sizes shown at realistic scale relative to furniture (sofa ≈ 84").',
  gallery: 'Sizes shown at realistic scale relative to panel (gallery panel ≈ 96").',
};
function setRoom(r){
  wallImg.src = `assets/rooms/${r}.jpg`;
  note.textContent = roomNotes[r];
  document.querySelectorAll('[data-room]').forEach(x=>x.classList.remove('active'));
  document.querySelector(`[data-room="${r}"]`).classList.add('active');
}
setRoom('bedroom');

document.querySelectorAll('[data-room]').forEach(b=>{
  b.addEventListener('click', ()=> setRoom(b.dataset.room));
});

// Init defaults
document.querySelector('[data-frame="black"]').classList.add('active');
document.querySelector('[data-size="18x24"]').classList.add('active');
priceEl.textContent = `$${prices[size]}`;
