
const input=document.getElementById('fileInput');
const art=document.getElementById('artImg');
const wallArt=document.getElementById('roomArt');
document.getElementById('chooseBtn').addEventListener('click',()=>input.click());
input.addEventListener('change',e=>{
  const f=e.target.files?.[0];if(!f)return;
  const url=URL.createObjectURL(f);
  art.src=url;wallArt.src=url;
});
const frameImg=document.getElementById('frameImg');
document.querySelectorAll('[data-frame]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-frame]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    frameImg.src='assets/frames/'+btn.dataset.frame+'.png';
  });
});
