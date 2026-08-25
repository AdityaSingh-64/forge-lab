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
function draw(){
  if(!ctx) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let p of particles){
    p.x += p.vx; p.y += p.vy;
    if(p.x<0) p.x = canvas.width; if(p.x>canvas.width) p.x = 0;
    if(p.y<0) p.y = canvas.height; if(p.y>canvas.height) p.y = 0;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.fill();
  }
  requestAnimationFrame(draw);
}
function start(){resize(); makeParticles(Math.round((canvas.width*canvas.height)/90000)); draw(); }
window.addEventListener('resize', ()=>{resize(); makeParticles( Math.round((canvas.width*canvas.height)/90000) ); });
if(canvas && ctx){start();}

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
