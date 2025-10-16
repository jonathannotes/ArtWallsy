// ------- frames & rooms -------
const FRAMES = [
  { key:'black',  label:'Black',  src:'/assets/frames/black.png',  matInset:28 },
  { key:'white',  label:'White',  src:'/assets/frames/white.png',  matInset:28 },
  { key:'gold',   label:'Gold',   src:'/assets/frames/gold.png',   matInset:28 },
  { key:'silver', label:'Silver', src:'/assets/frames/silver.png', matInset:28 },
  { key:'oak',    label:'Oak',    src:'/assets/frames/oak.png',    matInset:28 },
];

const ROOMS = {
  bedroom: { label:'Bedroom', img:'/assets/rooms/bedroom.jpg', refIn:60, refPx:1180, topOffsetPx:120 },
  living:  { label:'Living Room', img:'/assets/rooms/living.jpg', refIn:84, refPx:1460, topOffsetPx:110 },
  hallway: { label:'Hallway', img:'/assets/rooms/hallway.jpg', refIn:72, refPx:1280, topOffsetPx:80 },
};

const SIZES = [
  { w:12, h:16, label:'12×16', price:169 },
  { w:16, h:20, label:'16×20', price:189 },
  { w:18, h:24, label:'18×24', price:199 },
  { w:24, h:36, label:'24×36', price:289 }
];

// ------- state & dom -------
let userImg = null;
let currentFrame = FRAMES[0];
let currentSize = SIZES[0];

const fileInput = document.getElementById('fileInput');
const frameCanvas = document.getElementById('frameCanvas');
const ctx = frameCanvas.getContext('2d');

const framePicker = document.getElementById('framePicker');
const sizePicker  = document.getElementById('sizePicker');
const priceEl = document.getElementById('price');

const wallModal = document.getElementById('wallModal');
const wallImg   = document.getElementById('wallImg');
const wallFrame = document.getElementById('wallFrame');
const wallCanvas = document.getElementById('wallCanvas');
const wallCtx = wallCanvas.getContext('2d');
const roomTabs = document.getElementById('roomTabs');
const scaleNote = document.getElementById('scaleNote');

function loadImg(src){
  return new Promise((res, rej)=>{ const i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; });
}

async function renderFramedPreview(){
  if(!currentFrame) return;
  const frameImg = await loadImg(currentFrame.src);

  frameCanvas.width = frameImg.width;
  frameCanvas.height = frameImg.height;
  ctx.clearRect(0,0,frameCanvas.width,frameCanvas.height);

  const b = currentFrame.matInset;
  const inner = { x:b, y:b, w:frameCanvas.width-2*b, h:frameCanvas.height-2*b };

  if(userImg){
    const imgRatio = userImg.width / userImg.height;
    const boxRatio = inner.w / inner.h;
    let dw, dh, dx, dy;
    if(imgRatio > boxRatio){ dh = inner.h; dw = dh*imgRatio; dx = inner.x + (inner.w-dw)/2; dy = inner.y; }
    else{ dw = inner.w; dh = dw/imgRatio; dx = inner.x; dy = inner.y + (inner.h-dh)/2; }
    ctx.save(); ctx.beginPath(); ctx.rect(inner.x, inner.y, inner.w, inner.h); ctx.clip();
    ctx.drawImage(userImg, dx, dy, dw, dh);
    ctx.restore();
  }else{
    ctx.fillStyle = '#f2f4f7'; ctx.fillRect(b,b,inner.w,inner.h);
  }

  ctx.drawImage(frameImg, 0, 0);
}

function inchesToPixels(roomKey, inches){
  const r = ROOMS[roomKey];
  return (r.refPx / r.refIn) * inches;
}

async function renderWall(roomKey){
  const room = ROOMS[roomKey];
  const frameImg = await loadImg(currentFrame.src);

  const baseW = frameImg.width, baseH = frameImg.height;
  const off = document.createElement('canvas');
  off.width = baseW; off.height = baseH;
  const ox = off.getContext('2d');

  const b = currentFrame.matInset;
  const inner = { x:b, y:b, w:baseW-2*b, h:baseH-2*b };

  if(userImg){
    const imgRatio = userImg.width / userImg.height;
    const boxRatio = inner.w / inner.h;
    let dw, dh, dx, dy;
    if(imgRatio > boxRatio){ dh = inner.h; dw = dh*imgRatio; dx = inner.x + (inner.w-dw)/2; dy = inner.y; }
    else{ dw = inner.w; dh = dw/imgRatio; dx = inner.x; dy = inner.y + (inner.h-dh)/2; }
    ox.save(); ox.beginPath(); ox.rect(inner.x, inner.y, inner.w, inner.h); ox.clip();
    ox.drawImage(userImg, dx, dy, dw, dh);
    ox.restore();
  } else {
    ox.fillStyle='#f2f4f7'; ox.fillRect(b,b,inner.w,inner.h);
  }
  ox.drawImage(frameImg, 0, 0);

  // size on wall
  const targetWpx = Math.round(inchesToPixels(roomKey, currentSize.w));
  const targetHpx = Math.round(inchesToPixels(roomKey, currentSize.h));

  wallCanvas.width = targetWpx;
  wallCanvas.height = targetHpx;
  wallCtx.clearRect(0,0,wallCanvas.width,wallCanvas.height);
  wallCtx.drawImage(off, 0, 0, targetWpx, targetHpx);

  // Background & placement
  document.getElementById('wallImg').src = ROOMS[roomKey].img;
  wallFrame.style.width = targetWpx + 'px';
  wallFrame.style.top = (ROOMS[roomKey].topOffsetPx) + 'px';

  const noteMap = {
    bedroom:`Sizes shown relative to a queen bed ≈ 60".`,
    living:`Sizes shown relative to a standard sofa ≈ 84".`,
    hallway:`Sizes shown relative to a console ≈ 72".`
  };
  document.getElementById('scaleNote').textContent = noteMap[roomKey];
}

// UI builders
function buildPickers(){
  const fp = document.getElementById('framePicker');
  fp.innerHTML='';
  FRAMES.forEach((f,i)=>{
    const b=document.createElement('button');
    b.className='chip'+(i===0?' active':'');
    b.textContent=f.label;
    b.onclick=()=>{
      [...fp.children].forEach(c=>c.classList.remove('active'));
      b.classList.add('active');
      currentFrame=f; renderFramedPreview();
    };
    fp.appendChild(b);
  });

  const sp = document.getElementById('sizePicker');
  sp.innerHTML='';
  SIZES.forEach((s,i)=>{
    const b=document.createElement('button');
    b.className='chip'+(i===0?' active':'');
    b.textContent=s.label;
    b.onclick=()=>{
      [...sp.children].forEach(c=>c.classList.remove('active'));
      b.classList.add('active');
      currentSize=s;
      document.getElementById('price').textContent = `$${s.price}`;
    };
    sp.appendChild(b);
  });
}

function hookEvents(){
  document.getElementById('fileInput').addEventListener('change', async e=>{
    const f=e.target.files?.[0]; if(!f) return;
    const url=URL.createObjectURL(f);
    userImg = await loadImg(url);
    renderFramedPreview();
  });

  document.getElementById('seeOnWallBtn').addEventListener('click', ()=>{
    openWall('bedroom');
  });

  document.getElementById('closeWall').addEventListener('click', ()=>{
    document.getElementById('wallModal').close();
  });

  document.querySelectorAll('#roomTabs button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#roomTabs button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      openWall(btn.dataset.room);
    });
  });
}

async function openWall(roomKey){
  document.getElementById('wallModal').showModal();
  await renderWall(roomKey);
}

// init
buildPickers();
hookEvents();
renderFramedPreview();
