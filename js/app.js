const state = { frame: 'black', size: '8x10', seeWall: false, prices: {'8x10':59,'12x16':89,'16x20':129} };

const uploader = document.getElementById('uploader');
const frameEl = document.getElementById('frame');
const photoEl = document.getElementById('photo');
const priceVal = document.getElementById('priceVal');
const seeWallBtn = document.getElementById('seeWall');
const wallEl = document.getElementById('wall');
const resetBtn = document.getElementById('reset');
const checkoutBtn = document.getElementById('checkoutBtn');

uploader.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { photoEl.src = ev.target.result; };
  reader.readAsDataURL(file);
});

document.getElementById('frameSwatches').addEventListener('click', (e) => {
  if (e.target.classList.contains('swatch')) {
    Array.from(document.querySelectorAll('.swatch')).forEach(s=>s.classList.remove('active'));
    e.target.classList.add('active');
    const val = e.target.getAttribute('data-frame');
    state.frame = val;
    frameEl.className = 'frame ' + val;
  }
});

document.getElementById('sizeOptions').addEventListener('change', (e) => {
  state.size = e.target.value;
  priceVal.textContent = `$${state.prices[state.size]}`;
  const scale = state.size === '8x10' ? 0.9 : state.size === '12x16' ? 1.0 : 1.1;
  frameEl.style.transform = `scale(${scale})`;
});

seeWallBtn.addEventListener('click', () => {
  state.seeWall = !state.seeWall;
  seeWallBtn.textContent = state.seeWall ? 'Studio View' : 'See on Wall';
  wallEl.style.backgroundImage = state.seeWall ? "url('assets/sample_wall.svg')" : 'none';
  wallEl.style.backgroundColor = state.seeWall ? 'transparent' : '#faf7ef';
});

resetBtn.addEventListener('click', () => {
  photoEl.src = '';
  state.frame = 'black'; state.size = '8x10'; state.seeWall = false;
  priceVal.textContent = `$${state.prices[state.size]}`;
  frameEl.className = 'frame black'; frameEl.style.transform = 'scale(0.9)';
  wallEl.style.backgroundImage = 'none'; wallEl.style.backgroundColor = '#faf7ef';
  uploader.value = '';
  Array.from(document.querySelectorAll('.swatch')).forEach(s=>s.classList.remove('active'));
  document.querySelector('.swatch[data-frame="black"]').classList.add('active');
  document.querySelector('input[name="size"][value="8x10"]').checked = true;
});

checkoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const subject = encodeURIComponent('ArtWallsy Order Request');
  const body = encodeURIComponent(`Hi ArtWallsy,\n\nI want to order a framed print.\n\nSize: ${state.size}\nFrame: ${state.frame}\n\n(Reply with payment link + shipping info.)\n\nThanks!`);
  window.location.href = `mailto:support@artwallsy.com?subject=${subject}&body=${body}`;
});
