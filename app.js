const FRAMES = {
  black:  '/assets/frames/black.png',
  white:  '/assets/frames/white.png',
  gold:   '/assets/frames/gold.png',
  silver: '/assets/frames/silver.png',
  oak:    '/assets/frames/oak.png',
};

const ROOM_META = {
  bedroom: { src:'/assets/rooms/bedroom.jpg', top:'28%', note:'Sizes shown relative to a queen bed ≈ 60".' },
  living:  { src:'/assets/rooms/living.jpg',  top:'24%', note:'Sizes shown relative to a sofa ≈ 84".' },
  hallway: { src:'/assets/rooms/hallway.jpg', top:'22%', note:'Sizes shown relative to a console ≈ 72".' }
};

const PRICES = { '12x16':169, '16x20':189, '18x24':199, '24x36':289 };

const fileEl = document.getElementById('file');
const art = document.getElementById('art');
const art2 = document.getElementById('art2');
const frame = document.getElementById('frame');
const frame2 = document.getElementById('frame2');
const framePicker = document.getElementById('framePicker');
const sizePicker = document.getElementById('sizePicker');
const priceEl = document.getElementById('price');
const seeBtn = document.getElementById('see');
const roomTabs = document.getElementById('roomTabs');
const roomBg = document.getElementById('roomBg');
const mount = document.getElementById('mount');
const scaleNote = document.getElementById('scaleNote');

let state = { frame:'black', size:'12x16', room:'bedroom' };

fileEl.addEventListener('change', (e)=>{
  const f = e.target.files?.[0]; if(!f) return;
  const url = URL.createObjectURL(f);
  art.src = url; art2.src = url;
});

framePicker.addEventListener('click',(e)=>{
  const btn = e.target.closest('button[data-frame]'); if(!btn) return;
  framePicker.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  state.frame = btn.dataset.frame;
  frame.src = FRAMES[state.frame];
  frame2.src = FRAMES[state.frame];
});

sizePicker.addEventListener('click',(e)=>{
  const btn = e.target.closest('button[data-size]'); if(!btn) return;
  sizePicker.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  state.size = btn.dataset.size;
  priceEl.textContent = `$${PRICES[state.size]}`;
  const matInset = { '12x16':'9.2%', '16x20':'8.8%', '18x24':'8.4%', '24x36':'8.0%' }[state.size];
  document.querySelectorAll('.art').forEach(n=> n.style.inset = matInset);
});

seeBtn.addEventListener('click', ()=>{
  document.querySelector('#rooms').scrollIntoView({behavior:'smooth'});
});

roomTabs.addEventListener('click',(e)=>{
  const t = e.target.closest('button[data-room]'); if(!t) return;
  roomTabs.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  state.room = t.dataset.room;
  const cfg = ROOM_META[state.room];
  roomBg.src = cfg.src;
  mount.style.top = cfg.top;
  scaleNote.textContent = cfg.note;
});

priceEl.textContent = `$${PRICES[state.size]}`;
frame.src = FRAMES[state.frame];
frame2.src = FRAMES[state.frame];
roomBg.src = ROOM_META[state.room].src;
mount.style.top = ROOM_META[state.room].top;
scaleNote.textContent = ROOM_META[state.room].note;
