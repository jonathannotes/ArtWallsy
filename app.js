
const input = document.getElementById('fileInput');
const art = document.getElementById('artImg');
const mart = document.getElementById('roomArt');
document.getElementById('chooseBtn').addEventListener('click', ()=> input.click());
input.addEventListener('change', e=>{
  const f = e.target.files?.[0]; if(!f) return;
  const url = URL.createObjectURL(f);
  art.src = url; document.getElementById('roomArt').src = url;
});

// Frame finish
const frame = document.getElementById('frameRim');
const mount = document.getElementById('mount');
document.querySelectorAll('[data-frame]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('[data-frame]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const val = btn.dataset.frame;
    frame.className = 'frame '+val;
    mount.className = 'mount '+val;
  });
});

// Size & price
const price = document.getElementById('price');
const sizeMap = {'8x10':[8,10],'12x16':[12,16],'16x20':[16,20],'18x24':[18,24],'24x36':[24,36]};
document.querySelectorAll('[data-size]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('[data-size]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    updatePrice(btn.dataset.size);
    scaleOnWall(btn.dataset.size);
  });
});
function updatePrice(k){
  const [w,h] = sizeMap[k]; const area = w*h;
  const p = Math.max(99, Math.round(0.52*area/5)*5 + 69);
  price.textContent = '$'+p;
}

// Rooms
const roomImg = document.getElementById('roomBg');
const note = document.getElementById('note');
const roomMeta = {
  bedroom: {src:'assets/rooms/bedroom.jpg', refIn:60, note:'Shown at realistic scale relative to a queen bed (~60″).', top:42},
  living:  {src:'assets/rooms/living.jpg',  refIn:84, note:'Shown at realistic scale relative to a sofa (~84″).',    top:40},
  gallery: {src:'assets/rooms/gallery.jpg', refIn:120, note:'Shown on a gallery wall (~10 ft panel).',                top:42}
};
document.querySelectorAll('[data-room]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('[data-room]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const key = btn.dataset.room;
    setRoom(key);
  });
});
function setRoom(key){
  const r = roomMeta[key];
  roomImg.src = r.src;
  note.textContent = r.note;
  document.getElementById('mount').style.top = r.top+'%';
  const activeSize = document.querySelector('[data-size].active')?.dataset.size || '12x16';
  scaleOnWall(activeSize);
}

// See on Wall scroll
document.getElementById('seeBtn').addEventListener('click', ()=>{
  document.getElementById('roomCard').scrollIntoView({behavior:'smooth', block:'center'});
});

// Scale painting realistically vs furniture reference
function scaleOnWall(sizeKey){
  const [w,h] = sizeMap[sizeKey];
  const currentRoomBtn = document.querySelector('[data-room].active');
  const rkey = currentRoomBtn ? currentRoomBtn.dataset.room : 'bedroom';
  const refIn = roomMeta[rkey].refIn;
  const baselineIn = 24, baselinePct = 28;
  const pct = Math.max(10, Math.min(40, (w/baselineIn) * baselinePct * (60/refIn)));
  document.getElementById('mount').style.width = pct + '%';
}

// init
document.querySelector('[data-frame="black"]').classList.add('active');
document.querySelector('[data-size="12x16"]').classList.add('active');
updatePrice('12x16'); setRoom('bedroom'); scaleOnWall('12x16');
