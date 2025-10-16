
const SIZES = [
  {label:'12×16', w:12, h:16},
  {label:'16×20', w:16, h:20},
  {label:'18×24', w:18, h:24},
  {label:'24×36', w:24, h:36},
];
const FRAMES = [
  {key:'black',  src:'assets/frames/frame-black.png'},
  {key:'white',  src:'assets/frames/frame-white.png'},
  {key:'gold',   src:'assets/frames/frame-gold.png'},
  {key:'silver', src:'assets/frames/frame-silver.png'},
  {key:'oak',    src:'assets/frames/frame-oak.png'},
];
const ROOMS = {
  bedroom: { src:'assets/rooms/bedroom.jpg',  refInches:60,  anchorY:0.31 },
  living:  { src:'assets/rooms/livingroom.jpg', refInches:84, anchorY:0.32 },
  hallway: { src:'assets/rooms/hallway.jpg',  refInches:72,  anchorY:0.36 }
};

let state = {
  size:SIZES[0],
  frame:FRAMES[0],
  room:'bedroom',
  userImg:null,
  userImgBitmap:null,
  mat: true,
};

const frameCanvas = document.getElementById('frameCanvas');
const fctx = frameCanvas.getContext('2d');
const roomCanvas = document.getElementById('roomCanvas');
const rctx = roomCanvas.getContext('2d');

function byId(id){ return document.getElementById(id); }

function setActive(container, value){
  [...container.querySelectorAll('.chip')].forEach(ch => {
    ch.classList.toggle('active', ch.dataset.value === value);
  });
}

async function loadImage(src){
  const img = new Image();
  img.crossOrigin = "anonymous";
  return new Promise((res, rej)=>{
    img.onload = ()=>res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function drawFramePreview(){
  const size = Math.min(frameCanvas.width, frameCanvas.height);
  fctx.clearRect(0,0,frameCanvas.width, frameCanvas.height);
  fctx.fillStyle = '#0b1220';
  fctx.fillRect(0,0,frameCanvas.width, frameCanvas.height);

  const frameImg = await loadImage(state.frame.src);

  // Fit frame to full canvas
  const fw = size, fh = size;
  fctx.drawImage(frameImg, 0, 0, fw, fh);

  if(state.userImgBitmap){
    // Compute inner opening by sampling transparent bounds of frame
    // We'll derive padding by detecting non-transparent border on the frame PNG.
    // Fallback: 9% border.
    let pad = Math.round(size * 0.09);

    try{
      // read a 1px column to detect where alpha becomes 0
      const test = fctx.getImageData(size/2|0, 0, 1, size).data;
      let top = 0; 
      for(let y=0;y<size;y++){ if(test[y*4+3]===0){ top=y; break; } }
      let bottom = size-1;
      for(let y=size-1;y>=0;y--){ if(test[y*4+3]===0){ bottom = size-1-y; break; } }
      // If detection seems valid, use average
      if(top>0 && bottom>0 && (top+bottom)<(size*0.6)){
        pad = Math.round((top+bottom)/2);
      }
    }catch(e){}

    // Draw mat (white border) slightly inset
    const innerX = pad, innerY = pad, innerW = size - pad*2, innerH = size - pad*2;
    const matPad = Math.round(innerW * 0.06);
    if(state.mat){
      fctx.fillStyle = 'white';
      fctx.fillRect(innerX, innerY, innerW, innerH);
    }
    // Place the artwork inside mat area keeping aspect
    const ix = innerX + (state.mat ? matPad : 0);
    const iy = innerY + (state.mat ? matPad : 0);
    const iw = innerW - (state.mat ? matPad*2 : 0);
    const ih = innerH - (state.mat ? matPad*2 : 0);

    const artW = state.size.w, artH = state.size.h;
    const frameRatio = iw/ih;
    const artRatio = artW/artH;
    let dw, dh, dx, dy;
    if(artRatio > frameRatio){
      dw = iw; dh = iw/artRatio;
      dx = ix; dy = iy + (ih - dh)/2;
    }else{
      dh = ih; dw = ih*artRatio;
      dy = iy; dx = ix + (iw - dw)/2;
    }
    fctx.drawImage(state.userImgBitmap, dx, dy, dw, dh);
  }
}

async function drawRoom(){
  const room = ROOMS[state.room];
  const bg = await loadImage(room.src);
  rctx.clearRect(0,0,roomCanvas.width, roomCanvas.height);
  // Fit background
  const cw = roomCanvas.width, ch = roomCanvas.height;
  const bgRatio = bg.width/bg.height;
  const cRatio = cw/ch;
  let bw, bh, bx, by;
  if(bgRatio > cRatio){ // bg wider
    bh = ch; bw = ch*bgRatio; bx = (cw - bw)/2; by = 0;
  }else{
    bw = cw; bh = cw/bgRatio; bx = 0; by = (ch - bh)/2;
  }
  rctx.drawImage(bg, bx, by, bw, bh);

  if(state.userImgBitmap){
    // Load frame graphic to calculate visual thickness & mat
    const frameImg = await loadImage(state.frame.src);
    const fSize = Math.min(cw, ch) * 0.6; // base draw size before scaling to inches

    // derive opening pad (as before)
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = 1000;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(frameImg,0,0,1000,1000);
    let pad = 90;
    try{
      const test = tctx.getImageData(500,0,1,1000).data;
      let top = 0;
      for(let y=0;y<1000;y++){ if(test[y*4+3]===0){ top=y; break; } }
      let bottom = 0;
      for(let y=999;y>=0;y--){ if(test[y*4+3]===0){ bottom=999-y; break; } }
      if(top>0 && bottom>0) pad = Math.round((top+bottom)/2);
    }catch(e){}

    const frameThicknessRatio = pad/1000; // portion around
    // Compute inches->pixels scale: measure using container width and a fudge factor for perspective
    const refPx = bw; // bg drawn width
    const ppi = (refPx / bg.width) *  (bg.width / room.refInches); // naive pixels per inch
    const fudge = 0.86; // makes it feel realistic; tweak if needed
    const pxPerInch = ppi * fudge;

    const artWIn = state.size.w;
    const artHIn = state.size.h;
    const totalW = (artWIn / Math.max(artWIn, artHIn)) * (Math.min(bw,ch) * 0.52); // fallback width cap
    // True-to-scale preferred
    const drawW = artWIn * pxPerInch;
    const drawH = artHIn * pxPerInch;

    const placedW = drawW;
    const placedH = drawH;

    // Centered placement with anchor height
    const centerX = cw/2;
    const centerY = ch * room.anchorY;
    const x = centerX - placedW/2;
    const y = centerY - placedH/2;

    // draw drop shadow
    rctx.shadowColor = 'rgba(0,0,0,.35)';
    rctx.shadowBlur = 18;
    rctx.shadowOffsetY = 8;

    // Draw framed image by compositing into offscreen canvas
    const off = document.createElement('canvas');
    off.width = off.height = 1200;
    const octx = off.getContext('2d');
    octx.clearRect(0,0,1200,1200);
    octx.drawImage(frameImg, 0,0,1200,1200);

    // inner opening rect
    const padPx = Math.round(1200 * frameThicknessRatio);
    const inner = {x:padPx, y:padPx, w:1200 - padPx*2, h:1200 - padPx*2};
    const matPad = Math.round(inner.w * 0.06);
    octx.fillStyle = '#fff';
    octx.fillRect(inner.x, inner.y, inner.w, inner.h);

    // fit artwork to inner - mat
    const ix = inner.x + matPad;
    const iy = inner.y + matPad;
    const iw = inner.w - matPad*2;
    const ih = inner.h - matPad*2;
    const artRatio = state.size.w/state.size.h;
    let dw, dh, dx, dy;
    if(iw/ih > artRatio){ dh = ih; dw = ih*artRatio; dx = ix + (iw-dw)/2; dy = iy; }
    else { dw = iw; dh = iw/artRatio; dx = ix; dy = iy + (ih-dh)/2; }
    octx.drawImage(state.userImgBitmap, dx, dy, dw, dh);

    // finally draw scaled offscreen canvas
    rctx.drawImage(off, x, y, placedW, placedH);
    rctx.shadowBlur = 0;
  }
}

async function refresh(){
  await drawFramePreview();
  await drawRoom();
}

function makeChips(container, list, curKey, onClick){
  container.innerHTML = '';
  list.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'chip' + (item.key===curKey?' active':'');
    div.textContent = item.label || item.key;
    div.dataset.value = item.key;
    div.onclick = ()=>onClick(item);
    container.appendChild(div);
  })
}

function initUI(){
  // sizes
  const sizeChips = document.getElementById('sizeChips');
  makeChips(sizeChips, SIZES.map(s=>({key:s.label,label:s.label})), state.size.label, (item)=>{
    state.size = SIZES.find(s=>s.label===item.key);
    refresh();
  });
  // frames
  const frameChips = document.getElementById('frameChips');
  makeChips(frameChips, FRAMES.map((f,i)=>({key:f.key,label:f.key.charAt(0).toUpperCase()+f.key.slice(1)})), state.frame.key, (item)=>{
    state.frame = FRAMES.find(f=>f.key===item.key);
    setActive(frameChips, item.key);
    refresh();
  });
  // rooms
  const roomChips = document.getElementById('roomChips');
  const roomsList = [{key:'bedroom',label:'Bedroom'},{key:'living',label:'Living Room'},{key:'hallway',label:'Hallway'}];
  makeChips(roomChips, roomsList, state.room, (item)=>{
    state.room = item.key;
    setActive(roomChips, item.key);
    refresh();
  });

  // uploader
  const fileInput = document.getElementById('fileInput');
  fileInput.onchange = async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    state.userImg = file;
    const bmp = await createImageBitmap(await file.arrayBuffer().then(b=>new Blob([b])));
    state.userImgBitmap = bmp;
    refresh();
  };

  // AI generator (requires API key; provide URL textbox fallback)
  const genBtn = document.getElementById('genBtn');
  const genStatus = document.getElementById('genStatus');
  const promptIn = document.getElementById('prompt');
  genBtn.onclick = async ()=>{
    const prompt = promptIn.value.trim();
    if(!prompt){ alert('Enter a prompt.'); return; }
    genBtn.disabled = true; genStatus.style.display='inline-block';
    try{
      // Placeholder generation using picsum.photos as a free stand-in (not AI but gives an image without key)
      // Replace this block with a real API call to Stability/Replicate/etc.
      const url = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`;
      const img = await loadImage(url);
      // Turn into bitmap
      const c = document.createElement('canvas'); c.width=c.height=img.width;
      const cx = c.getContext('2d'); cx.drawImage(img,0,0);
      const blob = await new Promise(res=>c.toBlob(res,'image/png'));
      state.userImgBitmap = await createImageBitmap(blob);
      refresh();
    }catch(e){
      alert('Generation failed. Please try again or configure a real AI API.');
      console.error(e);
    }finally{
      genBtn.disabled = false; genStatus.style.display='none';
    }
  };
}

function fitCanvases(){
  const fw = frameCanvas.parentElement.clientWidth;
  frameCanvas.width = frameCanvas.height = Math.min(700, fw);
  let rw = roomCanvas.parentElement.clientWidth;
  let rh = Math.round(rw*0.65);
  roomCanvas.width = rw; roomCanvas.height = rh;
}

window.addEventListener('resize', ()=>{ fitCanvases(); refresh(); });

window.addEventListener('DOMContentLoaded', async ()=>{
  initUI();
  fitCanvases();
  // Load a faint checker bg in frame stage to emphasize transparency
  await refresh();
});
