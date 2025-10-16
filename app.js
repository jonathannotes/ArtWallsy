// Frames map
const FRAME_ORDER = ['black','white','gold','silver','oak'];
const FRAMES = {
  black: 'assets/frames/frame_black.png',
  white: 'assets/frames/frame_white.png',
  gold: 'assets/frames/frame_gold.png',
  silver: 'assets/frames/frame_silver.png',
  oak: 'assets/frames/frame_oak.png'
};

// Room configs with reference widths in inches (for true-to-size scaling)
const ROOMS = {
  bedroom: { img: 'assets/rooms/bedroom.jpg', refInches: 60, note:'Sizes shown at realistic scale relative to a queen bed ≈ 60”.', mountTop:'18%' },
  living:  { img: 'assets/rooms/living.jpg',  refInches: 84, note:'Sizes shown at realistic scale relative to a standard sofa ≈ 84”.', mountTop:'18%' },
  hallway: { img: 'assets/rooms/hallway.jpg', refInches: 72, note:'Sizes shown at realistic scale relative to a console ≈ 72”.', mountTop:'16%' }
};

// State
const state = {
  frame: 'black',
  size: '12x16',
  url: null,
  mat: true,
  room: 'bedroom'
};

// Elements
const fileInput = document.getElementById('file');
const frameOverlay = document.getElementById('frameOverlay');
const artwork = document.getElementById('artwork');
const seeWallBtn = document.getElementById('seeWall');
const sizeButtons = document.getElementById('sizeButtons');
const frameButtons = document.getElementById('frameButtons');
const matToggle = document.getElementById('matToggle');
const priceEl = document.getElementById('price');

const roomTabs = document.getElementById('roomTabs');
const roomImg = document.getElementById('roomImage');
const roomMount = document.getElementById('roomMount');
const roomFrame = document.getElementById('roomFrame');
const roomArt = document.getElementById('roomArt');
const scaleNote = document.getElementById('scaleNote');

// Helpers
function setActive(container, attr, value){
  [...container.querySelectorAll('button')].forEach(b=>{
    b.classList.toggle('active', b.dataset[attr]===value);
  });
}
function updateFrame(){
  frameOverlay.src = FRAMES[state.frame];
  roomFrame.src = FRAMES[state.frame];
  setActive(frameButtons,'frame',state.frame);
}
function updateSize(){
  setActive(sizeButtons,'size',state.size);
  // Price stub
  const [w,h] = state.size.split('x').map(Number);
  const area = w*h;
  const price = Math.round(0.22*area + 149); // simple scaling
  priceEl.textContent = `$${price}`;
}
function updateMat(){
  const matPct = state.mat ? 7 : 0;
  document.documentElement.style.setProperty('--mat', matPct + '%');
  // Adjust artwork inset inside frame for the builder
  artwork.style.inset = `calc(var(--mat))`;
  // And for the room preview (mat renders by shrinking art a bit inside the frame)
  roomArt.style.inset = `calc(var(--mat))`;
}

function loadArtwork(url){
  state.url = url;
  artwork.src = url;
  roomArt.src = url;
}

// Room true-to-size scaling
function updateRoom(){
  // Update room image and note
  const cfg = ROOMS[state.room];
  roomImg.src = cfg.img;
  scaleNote.textContent = cfg.note;
  roomMount.style.alignItems = 'start';
  roomMount.style.paddingTop = cfg.mountTop;

  // After the room image loads, compute scale
  requestAnimationFrame(()=>{
    // width of reference (e.g., bed) relative to the image width
    // We'll approximate by using a constant fraction of the image width where the furniture spans.
    // Use generous approximation that looks centered and realistic.
    const roomWidthPx = roomImg.clientWidth;
    const refPx = roomWidthPx * 0.52; // furniture spans ~52% of image width in these assets
    const pxPerInch = refPx / cfg.refInches;

    const [wIn,hIn] = state.size.split('x').map(Number);
    // Add the frame thickness visually by enlarging the outer size a bit
    const outerWIn = wIn * 1.08;
    const outerHIn = hIn * 1.08;

    const outWpx = outerWIn * pxPerInch;
    const outHpx = outerHIn * pxPerInch;

    // Center mount
    roomFrame.style.width = outWpx + 'px';
    roomFrame.style.height = outHpx + 'px';
    roomArt.style.width = outWpx + 'px';
    roomArt.style.height = outHpx + 'px';
  });
}

function init(){
  // defaults
  updateFrame();
  updateSize();
  updateMat();
  updateRoom();

  // clicks
  frameButtons.addEventListener('click', (e)=>{
    const f = e.target.dataset.frame; if(!f) return;
    state.frame = f; updateFrame();
  });
  sizeButtons.addEventListener('click', (e)=>{
    const s = e.target.dataset.size; if(!s) return;
    state.size = s; updateSize(); updateRoom();
  });
  roomTabs.addEventListener('click', (e)=>{
    const r = e.target.dataset.room; if(!r) return;
    state.room = r;
    [...roomTabs.querySelectorAll('button')].forEach(b=>b.classList.toggle('active', b.dataset.room===r));
    updateRoom();
  });
  matToggle.addEventListener('change', (e)=>{
    state.mat = !!e.target.checked; updateMat();
  });
  document.querySelector('.drop').addEventListener('click', ()=>fileInput.click());
  fileInput.addEventListener('change', (e)=>{
    const file = e.target.files?.[0]; if(!file) return;
    const url = URL.createObjectURL(file);
    loadArtwork(url);
  });

  // See on wall scroll
  seeWallBtn.addEventListener('click', ()=>{
    document.getElementById('wall').scrollIntoView({behavior:'smooth', block:'start'});
  });
}

window.addEventListener('load', init);
