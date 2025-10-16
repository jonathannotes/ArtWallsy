
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const frames = {
  black: 'assets/frames/black.svg',
  gold:  'assets/frames/gold.svg',
  oak:   'assets/frames/oak.svg',
  silver:'assets/frames/silver.svg',
};
const sizes = {
  '8x10': [8,10],
  '12x16':[12,16],
  '16x20':[16,20],
  '18x24':[18,24],
  '24x36':[24,36],
};

let currentFrame='black', currentSize='12x16', uploadedImg=null;
const artCanvas = document.createElement('canvas');
const ctx = artCanvas.getContext('2d');
artCanvas.width = 900; artCanvas.height = 900;

const frameImg = new Image();
const artImg = new Image();

function drawComposition(){
  const canvas = artCanvas;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // draw frame SVG
  frameImg.src = frames[currentFrame];
  frameImg.onload = () => {
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // Mat opening positions — match frame SVG
    const openX=160, openY=160, openW=580, openH=580;

    if(uploadedImg){
      // fit artwork inside opening (contain)
      const iw = uploadedImg.width, ih = uploadedImg.height;
      const scale = Math.min(openW/iw, openH/ih);
      const w = iw*scale, h = ih*scale;
      const x = openX + (openW - w)/2;
      const y = openY + (openH - h)/2;

      // clip to opening for natural mount
      ctx.save();
      ctx.beginPath();
      ctx.rect(openX, openY, openW, openH);
      ctx.clip();
      ctx.drawImage(uploadedImg, x, y, w, h);
      ctx.restore();
    }

    $('#frameCanvas').src = canvas.toDataURL('image/png');
    updateRoom();
  };
}

function handleFile(file){
  const reader = new FileReader();
  reader.onload = e => {
    uploadedImg = new Image();
    uploadedImg.onload = drawComposition;
    uploadedImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function selectFrame(key){
  currentFrame = key;
  $$('.frame-pill').forEach(b=>b.classList.toggle('active', b.dataset.key===key));
  drawComposition();
}

function selectSize(key){
  currentSize = key;
  $$('.size-pill').forEach(b=>b.classList.toggle('active', b.dataset.key===key));
  updatePrice();
  updateRoom();
}

function updatePrice(){
  // simple tiered pricing by area
  const [w,h] = sizes[currentSize];
  const area = w*h;
  const base = 0.42; // $/sqin
  const price = Math.round(area*base/5)*5 + 79;
  $('#price').textContent = `$${price}`;
}

const roomRefs = {
  bedroom: { img: 'assets/rooms/bedroom.jpg', refWidthIn: 60, refPxBox: [120, 310, 540] }, // bed 60" mapped to px width
  living:  { img: 'assets/rooms/living.jpg',  refWidthIn: 84, refPxBox: [130, 190, 640] }, // sofa
  gallery: { img: 'assets/rooms/gallery.jpg', refWidthIn: 144, refPxBox: [40, 160, 820] }, // wall span
};

let currentRoom='bedroom';
const roomImg = new Image();
roomImg.onload = ()=> renderRoom();
function updateRoom(){
  roomImg.src = roomRefs[currentRoom].img;
}

function renderRoom(){
  const cvs = document.createElement('canvas');
  const ctx2 = cvs.getContext('2d');
  cvs.width = roomImg.width; cvs.height = roomImg.height;
  ctx2.drawImage(roomImg, 0, 0);

  // compute frame pixel width using true scale
  const [wIn,hIn] = sizes[currentSize];
  const ref = roomRefs[currentRoom];
  const refPx = ref.refPxBox[2]-ref.refPxBox[0];
  const pxPerIn = refPx / ref.refWidthIn;
  const framePxW = Math.round(wIn * pxPerIn);
  const framePxH = Math.round(hIn * pxPerIn);

  // center above bed/sofa (roughly over the ref box)
  const centerX = (ref.refPxBox[0]+ref.refPxBox[2])/2;
  const x = Math.round(centerX - framePxW/2);
  const y = ref.refPxBox[1] - framePxH - 30;

  // paste framed art
  const tmp = new Image();
  tmp.onload = ()=>{
    ctx2.drawImage(tmp, x, y, framePxW, framePxH);
    $('#roomPreview').src = cvs.toDataURL('image/jpeg');
  };
  tmp.src = $('#frameCanvas').src;
}

function chooseRoom(key){
  currentRoom = key;
  $$('.room-pill').forEach(b=>b.classList.toggle('active', b.dataset.key===key));
  updateRoom();
}

// drag & drop
const drop = $('.dropzone');
drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.style.borderColor='#93c5fd'; });
drop.addEventListener('dragleave', e=>{ drop.style.borderColor='rgba(255,255,255,.18)'; });
drop.addEventListener('drop', e=>{ 
  e.preventDefault(); drop.style.borderColor='rgba(255,255,255,.18)';
  const file = e.dataTransfer.files?.[0]; if(file) handleFile(file);
});
$('#fileInput').addEventListener('change', e=>{
  const file = e.target.files?.[0]; if(file) handleFile(file);
});
$('#browseBtn').addEventListener('click', ()=> $('#fileInput').click());

// init
updatePrice();
selectFrame('black');
selectSize('12x16');
chooseRoom('bedroom');
drawComposition();
