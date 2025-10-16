// Frames in order Black → White → Gold → Silver → Oak
const FRAME_ORDER = [
  { id:'black',  label:'Black',  src:'assets/frames/black.png',  innerInset:16 },
  { id:'white',  label:'White',  src:'assets/frames/white.png',  innerInset:16 },
  { id:'gold',   label:'Gold',   src:'assets/frames/gold.png',   innerInset:16 },
  { id:'silver', label:'Silver', src:'assets/frames/silver.png', innerInset:16 },
  { id:'oak',    label:'Oak',    src:'assets/frames/oak.png',    innerInset:16 },
];
// Sizes (outer frame inches)
const SIZES = [ {w:12,h:16},{w:16,h:20},{w:18,h:24},{w:24,h:36} ];
const ROOMS = {
  bedroom: { label:'Bedroom', src:'assets/rooms/bedroom.jpg',   furniture:'queen bed ≈ 60″', furnitureWidthPct:0.66, mountCenterYPct:0.43 },
  living:  { label:'Living',  src:'assets/rooms/livingroom.jpg', furniture:'sofa ≈ 84″',       furnitureWidthPct:0.58, mountCenterYPct:0.40 },
  hallway: { label:'Hallway', src:'assets/rooms/hallway.jpg',   furniture:'console ≈ 72″',    furnitureWidthPct:0.70, mountCenterYPct:0.48 }
};
const pick   = document.getElementById('pick');
const file   = document.getElementById('file');
const stage  = document.getElementById('stage');
const framesWrap = document.getElementById('frames');
const sizesWrap  = document.getElementById('sizes');
const matToggle  = document.getElementById('matToggle');
const seeOnWall  = document.getElementById('seeOnWall');
const roomCanvas = document.getElementById('roomCanvas');
const scaleNote  = document.getElementById('scaleNote');
const tabs       = document.querySelectorAll('.tab');
const sctx = stage.getContext('2d');
const rctx = roomCanvas.getContext('2d');
scaleCanvasToDPR(stage, sctx);
scaleCanvasToDPR(roomCanvas, rctx);
let state = { img:null, frameIdx:0, sizeIdx:2, activeRoom:'bedroom' };
FRAME_ORDER.forEach((f,i)=>{
  const b=document.createElement('button'); b.textContent=f.label;
  if(i===state.frameIdx) b.classList.add('active');
  b.onclick=()=>{state.frameIdx=i; refresh();};
  framesWrap.appendChild(b);
});
SIZES.forEach((s,i)=>{
  const b=document.createElement('button'); b.textContent=`${s.w}×${s.h}`;
  if(i===state.sizeIdx) b.classList.add('active');
  b.onclick=()=>{state.sizeIdx=i; refresh();};
  sizesWrap.appendChild(b);
});
tabs.forEach(t=>{
  t.onclick=()=>{ tabs.forEach(x=>x.classList.remove('active')); t.classList.add('active');
    state.activeRoom=t.dataset.room; drawRoom(); };
});
pick.onclick=()=>file.click();
file.onchange=e=>{
  const f=e.target.files?.[0]; if(!f) return;
  const img=new Image(); img.onload=()=>{ state.img=img; refresh(); };
  img.src=URL.createObjectURL(f);
};
async function drawStage(){
  sctx.clearRect(0,0,stage.width,stage.height);
  sctx.fillStyle='#0b1123'; sctx.fillRect(0,0,stage.width,stage.height);
  const frame=FRAME_ORDER[state.frameIdx];
  const fimg=await loadImage(frame.src);
  const fit=fitContain(fimg.width,fimg.height,stage.width*0.9,stage.height*0.9);
  const fx=(stage.width-fit.w)/2, fy=(stage.height-fit.h)/2;
  sctx.drawImage(fimg,fx,fy,fit.w,fit.h);
  const openingX = fx + frame.innerInset*(fit.w/fimg.width);
  const openingY = fy + frame.innerInset*(fit.h/fimg.height);
  const openingW = fit.w - 2*frame.innerInset*(fit.w/fimg.width);
  const openingH = fit.h - 2*frame.innerInset*(fit.h/fimg.height);
  const matPx = matToggle.checked ? Math.max(openingW,openingH)*0.06 : 0;
  if(state.img){
    drawCover(sctx, state.img, { x:openingX+matPx, y:openingY+matPx, w:openingW-2*matPx, h:openingH-2*matPx });
  }else{
    sctx.fillStyle='#0f1731'; sctx.fillRect(openingX,openingY,openingW,openingH);
  }
}
async function drawRoom(){
  const room=ROOMS[state.activeRoom]; const bg=await loadImage(room.src);
  const fit=fitContain(bg.width,bg.height,roomCanvas.width,roomCanvas.height);
  const ox=(roomCanvas.width-fit.w)/2, oy=(roomCanvas.height-fit.h)/2;
  rctx.clearRect(0,0,roomCanvas.width,roomCanvas.height);
  rctx.fillStyle='#0b1123'; rctx.fillRect(0,0,roomCanvas.width,roomCanvas.height);
  rctx.drawImage(bg,ox,oy,fit.w,fit.h);
  const inchesPerPixel = (room.furnitureWidthPct*fit.w) / furnitureInches(room);
  const size=SIZES[state.sizeIdx];
  const outerInches=Math.max(size.w,size.h);
  const outerPixels=outerInches / inchesPerPixel;
  const cx=ox+fit.w/2;
  const cy=oy+fit.h*room.mountCenterYPct;
  const frame=FRAME_ORDER[state.frameIdx];
  const fimg=await loadImage(frame.src);
  const fr=fimg.width/fimg.height;
  const fw=outerPixels, fh=fw/fr;
  const fx=cx-fw/2, fy=cy-fh/2;
  rctx.drawImage(fimg,fx,fy,fw,fh);
  const openingX = fx + frame.innerInset*(fw/fimg.width);
  const openingY = fy + frame.innerInset*(fh/fimg.height);
  const openingW = fw - 2*frame.innerInset*(fw/fimg.width);
  const openingH = fh - 2*frame.innerInset*(fh/fimg.height);
  const matPx = document.getElementById('matToggle').checked ? Math.max(openingW,openingH)*0.06 : 0;
  if(state.img){
    drawCover(rctx, state.img, { x:openingX+matPx, y:openingY+matPx, w:openingW-2*matPx, h:openingH-2*matPx });
  }else{
    rctx.fillStyle='#101830'; rctx.fillRect(openingX,openingY,openingW,openingH);
  }
  scaleNote.textContent = `Sizes shown relative to ${room.furniture}.`;
}
function furnitureInches(room){
  if(room===ROOMS.bedroom) return 60;
  if(room===ROOMS.living)  return 84;
  return 72;
}
function loadImage(src){ return new Promise(res=>{ const i=new Image(); i.onload=()=>res(i); i.src=src; }); }
function fitContain(sw,sh,maxw,maxh){ const r=Math.min(maxw/sw, maxh/sh); return {w:sw*r,h:sh*r}; }
function drawCover(ctx, img, box){
  const ratio=img.width/img.height, target=box.w/box.h;
  let dw,dh; if(ratio>target){ dh=box.h; dw=dh*ratio; } else { dw=box.w; dh=dw/ratio; }
  const dx=box.x+(box.w-dw)/2, dy=box.y+(box.h-dh)/2;
  ctx.save(); ctx.beginPath(); ctx.rect(box.x,box.y,box.w,box.h); ctx.clip();
  ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
  ctx.drawImage(img,dx,dy,dw,dh); ctx.restore();
}
function scaleCanvasToDPR(canvas, ctx){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const {width, height} = canvas;
  canvas.width = width * dpr; canvas.height = height * dpr;
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function refresh(){
  document.querySelectorAll('#frames button').forEach((b,i)=>b.classList.toggle('active',i===state.frameIdx));
  document.querySelectorAll('#sizes  button').forEach((b,i)=>b.classList.toggle('active',i===state.sizeIdx));
  drawStage(); drawRoom();
}
document.getElementById('matToggle').onchange = refresh;
document.getElementById('seeOnWall').onclick = ()=>{ location.hash='#rooms'; drawRoom(); };
window.addEventListener('load', refresh);
window.addEventListener('resize', ()=>{ scaleCanvasToDPR(stage,sctx); scaleCanvasToDPR(roomCanvas,rctx); refresh(); });
