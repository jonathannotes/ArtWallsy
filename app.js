const SIZES={'12x16':{price:169},'16x20':{price:199},'18x24':{price:229},'24x36':{price:289}};
const FRAMES={black:'assets/frame-black.png',white:'assets/frame-white.png',gold:'assets/frame-gold.png',silver:'assets/frame-silver.png',oak:'assets/frame-oak.png'};
const ROOMS={bedroom:{img:'assets/room-bedroom.jpg',note:'Sizes shown relative to a queen bed ≈ 60"',top:'12%'},
living:{img:'assets/room-living.jpg',note:'Sizes shown relative to a 84" sofa',top:'10%'},
hallway:{img:'assets/room-hallway.jpg',note:'Sizes shown relative to a 36" console',top:'14%'}};
const pick=document.getElementById('pick'),file=document.getElementById('file'),
artImg=document.getElementById('artImg'),frameImg=document.getElementById('frameImg'),price=document.getElementById('price'),
wallArt=document.getElementById('wallArt'),wallArtImg=document.getElementById('wallArtImg'),wallFrame=document.getElementById('wallFrame'),
roomImg=document.getElementById('roomImg'),scaleNote=document.getElementById('scaleNote');
document.querySelectorAll('.pill').forEach(p=>p.addEventListener('click',()=>{document.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));p.classList.add('active');price.textContent=`$${SIZES[p.dataset.size].price}`}));
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');frameImg.src=FRAMES[c.dataset.frame];wallFrame.src=FRAMES[c.dataset.frame]}));
pick.addEventListener('click',()=>file.click());file.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const u=URL.createObjectURL(f);artImg.src=u;wallArtImg.src=u});
const drop=document.getElementById('dropzone');['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag')}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{drop.classList.remove('drag')}));drop.addEventListener('drop',e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(!f)return;const u=URL.createObjectURL(f);artImg.src=u;wallArtImg.src=u});
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');const r=ROOMS[t.dataset.room];roomImg.src=r.img;wallArt.style.top=r.top;scaleNote.textContent=r.note}));
document.getElementById('seeOnWall').addEventListener('click',()=>{document.getElementById('rooms').scrollIntoView({behavior:'smooth',block:'start'})});
// AI mock
const modal=document.getElementById('modal'),aiBtn=document.getElementById('aiGen'),closeModal=document.getElementById('closeModal'),
genBtn=document.getElementById('gen'),useGen=document.getElementById('useGen'),canvas=document.getElementById('genCanvas'),ctx=canvas.getContext('2d');
aiBtn.addEventListener('click',()=>modal.classList.add('show'));closeModal.addEventListener('click',()=>modal.classList.remove('show'));
function drawMock(p){const g=ctx.createLinearGradient(0,0,canvas.width,canvas.height);g.addColorStop(0,'#0ea5e9');g.addColorStop(.5,'#3b82f6');g.addColorStop(1,'#1d4ed8');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalAlpha=.25;for(let y=0;y<canvas.height;y+=24){ctx.fillStyle='white';ctx.fillRect(0,y,canvas.width,12)}ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,canvas.height-220,canvas.width,220);ctx.fillStyle='white';ctx.font='bold 44px Inter, system-ui';ctx.fillText((p||'Abstract blue').slice(0,40),36,canvas.height-160);ctx.font='600 18px Inter, system-ui';ctx.fillText('Local mock artwork',36,canvas.height-120)}
genBtn.addEventListener('click',()=>{const p=document.getElementById('prompt').value.trim();drawMock(p)});
useGen.addEventListener('click',()=>{canvas.toBlob(b=>{const u=URL.createObjectURL(b);artImg.src=u;wallArtImg.src=u;modal.classList.remove('show')},'image/png',.92)});
