// Lightweight particle background + small UI helpers
const canvas = document.getElementById('particles');
const ctx = canvas && canvas.getContext && canvas.getContext('2d');
let particles = [];
function resize(){
  if(!canvas) return;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
function rand(min,max){return Math.random()*(max-min)+min}
function makeParticles(n=60){particles = []; for(let i=0;i<n;i++){particles.push({x:rand(0,canvas.width),y:rand(0,canvas.height),r:rand(0.6,2.6),vx:rand(-0.2,0.2),vy:rand(-0.15,0.15),alpha:rand(0.08,0.28)});} }
let TARGET_FPS = 30;
let FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastFrameTime = 0;

function draw(now){
  if(!ctx) return;
  if(!now) now = performance.now();
  // Pause internal work while the page is hidden (tab background) to save CPU
  if(document.hidden){ lastFrameTime = now; requestAnimationFrame(draw); return; }
  // Throttle to TARGET_FPS to reduce jank on low-powered devices
  if(now - lastFrameTime < FRAME_INTERVAL){ requestAnimationFrame(draw); return; }
  lastFrameTime = now;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let p of particles){
    p.x += p.vx; p.y += p.vy;
    if(p.x<0) p.x = canvas.width; if(p.x>canvas.width) p.x = 0;
    if(p.y<0) p.y = canvas.height; if(p.y>canvas.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}

function start(){
  resize();
  makeParticles(Math.round((canvas.width*canvas.height)/90000));
  requestAnimationFrame(draw);
}

window.addEventListener('resize', ()=>{resize(); makeParticles( Math.round((canvas.width*canvas.height)/90000) ); });
if(canvas && ctx){start();}

document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) lastFrameTime = performance.now(); });

// Nav background toggles on once scrolled past the midpoint of the hero
function updateNavBackground(){
  const hero = document.querySelector('.hero');
  const nav = document.querySelector('.nav');
  if(!hero || !nav) return;
  const threshold = hero.offsetHeight * 0.5;
  if(window.scrollY > threshold){ nav.classList.add('scrolled'); }
  else { nav.classList.remove('scrolled'); }
}
window.addEventListener('scroll', updateNavBackground, {passive:true});
window.addEventListener('resize', updateNavBackground);
updateNavBackground();
function initCarousel(){
  const carousel = document.querySelector('[data-carousel]');
  if(!carousel) return;

  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const cards = Array.from(track.children);
  const prevBtn = carousel.parentElement.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.parentElement.querySelector('.carousel-btn.next');
  const dotsContainer = carousel.parentElement.querySelector('.carousel-dots');

  if(!viewport || !track || !cards.length || !prevBtn || !nextBtn || !dotsContainer) return;

  let currentIndex = 0;
  let startX = 0;
  let dragOffset = 0;
  let dragStartTranslate = 0;
  let isDragging = false;

  function getVisibleCards(){
    if(window.innerWidth <= 767) return 1;
    if(window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getCardStep(){
    const firstCard = cards[0];
    if(!firstCard) return 0;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap || 0);
    return firstCard.getBoundingClientRect().width + gap;
  }

  function buildDots(){
    const totalSlides = Math.max(1, cards.length - getVisibleCards() + 1);
    dotsContainer.innerHTML = '';
    for(let i = 0; i < totalSlides; i += 1){
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = i === 0 ? 'active' : '';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel(){
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, cards.length - visibleCards);
    currentIndex = Math.min(currentIndex, maxIndex);
    const step = getCardStep();
    track.style.transform = `translate3d(-${currentIndex * step}px, 0, 0)`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;

    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function goNext(){
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, cards.length - visibleCards);
    if(currentIndex < maxIndex){
      currentIndex += 1;
      updateCarousel();
    }
  }

  function goPrev(){
    if(currentIndex > 0){
      currentIndex -= 1;
      updateCarousel();
    }
  }

  function handlePointerDown(event){
    isDragging = true;
    startX = event.clientX;
    dragStartTranslate = currentIndex * getCardStep();
    dragOffset = 0;
    viewport.setPointerCapture(event.pointerId);
    track.style.transition = 'none';
  }

  function handlePointerMove(event){
    if(!isDragging) return;
    dragOffset = event.clientX - startX;
    const offset = dragStartTranslate - dragOffset;
    const maxOffset = (cards.length - getVisibleCards()) * getCardStep();
    const boundedOffset = Math.min(Math.max(offset, 0), maxOffset || 0);
    track.style.transform = `translate3d(-${boundedOffset}px, 0, 0)`;
  }

  function handlePointerUp(event){
    if(!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1)';
    viewport.releasePointerCapture(event.pointerId);

    const step = getCardStep();
    if(dragOffset > step * 0.45){
      goPrev();
    } else if(dragOffset < -step * 0.45){
      goNext();
    } else {
      updateCarousel();
    }
  }

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);
  viewport.addEventListener('pointerdown', handlePointerDown);
  viewport.addEventListener('pointermove', handlePointerMove);
  viewport.addEventListener('pointerup', handlePointerUp);
  viewport.addEventListener('pointerleave', handlePointerUp);
  viewport.addEventListener('pointercancel', handlePointerUp);
  window.addEventListener('resize', () => {
    buildDots();
    updateCarousel();
  });

  buildDots();
  updateCarousel();
}

// Mobile nav toggle
function toggleNav(){
  const links = document.querySelector('.nav-links');
  if(!links) return;
  if(links.style.display==='flex'){links.style.display='none'}else{links.style.display='flex';links.style.flexDirection='column';links.style.background='transparent';links.style.position='absolute';links.style.right='20px';links.style.top='56px';links.style.padding='12px';links.style.borderRadius='8px'}
}

// Smooth anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const hash = a.getAttribute('href');
    if(hash.length>1){ const el = document.querySelector(hash); if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    }
  })
});

initCarousel();
