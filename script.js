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
let canvasActive = false;

function draw(now){
  if(!ctx) return;
  if(!canvasActive){ requestAnimationFrame(draw); return; }
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
  canvasActive = true;
  requestAnimationFrame(draw);
}

window.addEventListener('resize', ()=>{resize(); makeParticles( Math.round((canvas.width*canvas.height)/90000) ); });
if(canvas && ctx){start();}

// Pause particle canvas when hero is off-screen to save CPU
(function(){
  const hero = document.querySelector('.hero');
  if(!hero || !('IntersectionObserver' in window)) return;
  var heroObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      canvasActive = entry.isIntersecting;
    });
  }, {threshold: 0});
  heroObserver.observe(hero);
})();

document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) lastFrameTime = performance.now(); });

// Nav background toggles on once scrolled past the midpoint of the hero
// Using IntersectionObserver with a small sentinel element at the hero midpoint
(function(){
  var nav = document.querySelector('.nav');
  var hero = document.querySelector('.hero');
  if(!nav || !hero) return;

  var useObserver = 'IntersectionObserver' in window;
  var sentinel = null;
  var observer = null;

  // Scroll-based fallback
  function checkNav(){
    var threshold = hero.offsetHeight * 0.5;
    if(window.scrollY > threshold){
      if(!nav.classList.contains('scrolled')) nav.classList.add('scrolled');
    } else {
      if(nav.classList.contains('scrolled')) nav.classList.remove('scrolled');
    }
  }

  // Setup IntersectionObserver
  if(useObserver){
    sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:50%;left:0;width:1px;height:1px;pointer-events:none;';
    hero.appendChild(sentinel);
    observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          nav.classList.remove('scrolled');
        } else {
          nav.classList.add('scrolled');
        }
      });
    }, {threshold: 0});
    observer.observe(sentinel);
  } else {
    // Fallback to scroll events if no IntersectionObserver
    window.addEventListener('scroll', checkNav, {passive:true});
  }

  // On resize, re-check after layout settles
  var resizeTimer = null;
  window.addEventListener('resize', function() {
    if(resizeTimer) clearTimeout(resizeTimer);
    // Use both immediate RAF check and a delayed check for safety
    requestAnimationFrame(function(){
      if(useObserver && observer && sentinel){
        // Force observer to re-evaluate by briefly disconnecting and reconnecting
        observer.disconnect();
        observer.observe(sentinel);
      } else {
        checkNav();
      }
    });
    // Double-check after layout is definitely stable
    resizeTimer = setTimeout(function(){
      if(useObserver && observer && sentinel){
        observer.disconnect();
        observer.observe(sentinel);
      } else {
        checkNav();
      }
    }, 100);
  });

  // Initial check
  if(!useObserver) checkNav();
})();
function initCarousel(){
  const carousels = document.querySelectorAll('[data-carousel]');
  if(!carousels.length) return;

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const cards = track ? Array.from(track.children) : [];
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const dotsContainer = carousel.parentElement ? carousel.parentElement.querySelector('.carousel-dots') : null;

    if(!viewport || !track || !cards.length || !prevBtn || !nextBtn || !dotsContainer) return;

    // Clone cards for infinite scroll - add one set at each end
    const originalCards = [...cards];
    
    // Clone cards to append at the end
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('cloned');
      track.appendChild(clone);
    });
    
    // Clone cards to prepend at the start
    const clonesToPrepend = [];
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('cloned');
      clonesToPrepend.unshift(clone); // Reverse order for prepending
    });
    clonesToPrepend.forEach(clone => track.insertBefore(clone, track.firstChild));
    
    // Update cards array to include all (original + clones)
    const allCards = Array.from(track.children);
    const cloneCount = originalCards.length;

    // Fade-in for project images — must cover CLONES too, otherwise cloned
    // <img> elements stay at opacity:0 (blank cards) because they never get
    // the `.loaded` class from the original fade-in pass.
    const setupCardImages = (card) => {
      card.querySelectorAll('.project-thumb, .thumb').forEach(img => {
        if(img.classList.contains('loaded')) return;
        if(img.complete){
          img.classList.add('loaded');
        } else {
          img.addEventListener('load', () => img.classList.add('loaded'), {once:true});
          img.addEventListener('error', () => img.classList.add('loaded'), {once:true});
        }
      });
    };
    allCards.forEach(setupCardImages);

    let currentIndex = cloneCount; // Start at first original card
    let startX = 0;
    let startY = 0;
    let dragOffset = 0;
    let dragStartTranslate = 0;
    let isTracking = false;
    let isDragging = false;
    let dragAxis = null;
    let isInfiniteScroll = true;
    let navCooldown = false; // Prevents rapid-click animation stacking
    let cachedStep = 0;     // Cached card step to avoid getComputedStyle on every call
    let teleportTimer = null; // Tracks pending infinite-scroll teleport
    const TRANSITION_MS = 280; // Snappier transition (was 450ms)

    // Auto-scroll support
    const AUTO_SCROLL_MS = 2500; // Advance every 2.5 seconds
    const RESUME_DELAY_MS = 5000; // Resume 5s after last interaction
    const AUTO_SCROLL_TRANSITION_MS = 500; // Slower, smoother transition for auto-scroll
    let autoScrollTimer = null;
    let resumeTimer = null;
    let sectionInView = false; // Whether the carousel section is visible
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function startAutoScroll(){
      stopAutoScroll();
      if(prefersReducedMotion.matches || !sectionInView) return;
      autoScrollTimer = setInterval(() => {
        // Don't advance if user is actively dragging or section scrolled away
        if(!isDragging && sectionInView) goNext(true, true); // smooth=true for auto-scroll
      }, AUTO_SCROLL_MS);
    }

    function stopAutoScroll(){
      if(autoScrollTimer){ clearInterval(autoScrollTimer); autoScrollTimer = null; }
    }

    function pauseAndResume(){
      stopAutoScroll();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAutoScroll, RESUME_DELAY_MS);
    }

    // Observe the parent section — only auto-scroll when in view
    (function(){
      const section = carousel.closest('section');
      if(!section || !('IntersectionObserver' in window)){
        sectionInView = true; // fallback: always treat as in view
        return;
      }
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const wasInView = sectionInView;
          sectionInView = entry.isIntersecting;
          if(!wasInView && sectionInView){
            // Section just came into view — start auto-scroll
            startAutoScroll();
          } else if(wasInView && !sectionInView){
            // Section scrolled away — stop auto-scroll
            stopAutoScroll();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(section);
    })();

    function getVisibleCards(){
      if(window.innerWidth <= 767) return 1;
      if(window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getCardStep(){
      if(cachedStep) return cachedStep;
      const firstCard = allCards[cloneCount];
      if(!firstCard) return 0;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.gap || 0);
      cachedStep = firstCard.getBoundingClientRect().width + gap;
      return cachedStep;
    }

    function buildDots(){
      const totalSlides = Math.max(1, originalCards.length - getVisibleCards() + 1);
      dotsContainer.innerHTML = '';
      for(let i = 0; i < totalSlides; i += 1){
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = i === 0 ? 'active' : '';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => {
          currentIndex = i + cloneCount;
          pauseAndResume();
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateCarousel(animate = true, smooth = false){
      const visibleCards = getVisibleCards();
      const step = getCardStep();
      const duration = smooth ? AUTO_SCROLL_TRANSITION_MS : TRANSITION_MS;
      
      track.style.transition = animate ? `transform ${duration}ms cubic-bezier(.22,1,.36,1)` : 'none';
      track.style.transform = `translate3d(-${currentIndex * step}px, 0, 0)`;

      // Handle infinite scroll - jump back to original position when reaching clones
      if(isInfiniteScroll && animate){
        // Clear any pending teleport to prevent stacking
        clearTimeout(teleportTimer);
        teleportTimer = null;
        // If we've scrolled into the prepended clones (before first original)
        if(currentIndex < cloneCount){
          teleportTimer = setTimeout(() => {
            teleportTimer = null;
            currentIndex = cloneCount + originalCards.length + currentIndex;
            updateCarousel(false);
          }, TRANSITION_MS);
        }
        // If we've scrolled into the appended clones (after last original)
        else if(currentIndex >= cloneCount + originalCards.length){
          teleportTimer = setTimeout(() => {
            teleportTimer = null;
            currentIndex = currentIndex - originalCards.length;
            updateCarousel(false);
          }, TRANSITION_MS);
        }
      }

      const maxIndex = Math.max(0, originalCards.length - visibleCards);
      const displayIndex = ((currentIndex - cloneCount) % originalCards.length + originalCards.length) % originalCards.length;
      
      if(isInfiniteScroll){
        prevBtn.disabled = false;
        nextBtn.disabled = false;
      } else {
        prevBtn.disabled = displayIndex <= 0;
        nextBtn.disabled = displayIndex >= maxIndex;
      }

      const dots = Array.from(dotsContainer.children);
      const activeDotIndex = Math.min(Math.max(0, displayIndex), dots.length - 1);
      dots.forEach((dot, index) => {
        const isActive = index === activeDotIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    function goNext(infinite = isInfiniteScroll, smooth = false){
      if(navCooldown) return;
      navCooldown = true;
      setTimeout(() => { navCooldown = false; }, TRANSITION_MS);
      if(infinite){
        currentIndex += 1;
        updateCarousel(true, smooth);
      } else {
        const visibleCards = getVisibleCards();
        const maxIndex = Math.max(0, originalCards.length - visibleCards);
        const displayIndex = currentIndex - cloneCount;
        if(displayIndex < maxIndex){
          currentIndex += 1;
          updateCarousel(true, smooth);
        }
      }
    }

    function goPrev(infinite = isInfiniteScroll, smooth = false){
      if(navCooldown) return;
      navCooldown = true;
      setTimeout(() => { navCooldown = false; }, TRANSITION_MS);
      if(infinite){
        currentIndex -= 1;
        updateCarousel(true, smooth);
      } else {
        const displayIndex = currentIndex - cloneCount;
        if(displayIndex > 0){
          currentIndex -= 1;
          updateCarousel(true, smooth);
        }
      }
    }

    function handlePointerDown(event){
      isTracking = true;
      isDragging = false;
      dragAxis = null;
      startX = event.clientX;
      startY = event.clientY;
      dragStartTranslate = currentIndex * getCardStep();
      dragOffset = 0;
    }

    function handlePointerMove(event){
      if(!isTracking) return;

      if(dragAxis === null){
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        // Small dead zone, then decide axis decisively.
        // Only engage horizontal drag if X is clearly dominant (1.5x Y),
        // so diagonal vertical scrolls never move the carousel.
        if(Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3) return;
        dragAxis = (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) ? 'x' : 'y';
        if(dragAxis === 'x'){
          isDragging = true;
          viewport.setPointerCapture(event.pointerId);
          track.style.transition = 'none';
          // Prevent vertical scroll on mobile Safari when horizontal swipe is detected
          event.preventDefault();
        } else {
          // Vertical gesture — hand control back to native page scroll
          isTracking = false;
          return;
        }
      }

      if(!isDragging) return;
      // Continue preventing default for horizontal swipes
      event.preventDefault();
      dragOffset = event.clientX - startX;
      const offset = dragStartTranslate - dragOffset;
      const step = getCardStep();
      const totalCards = allCards.length;
      const visibleCards = getVisibleCards();
      const maxOffset = (totalCards - visibleCards) * step;
      const boundedOffset = Math.min(Math.max(offset, -step * cloneCount), maxOffset);
      track.style.transform = `translate3d(-${boundedOffset}px, 0, 0)`;
    }

    function handlePointerUp(event){
      isTracking = false;
      if(!isDragging) return;
      isDragging = false;
      dragAxis = null;
      track.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.22,1,.36,1)`;
      if(viewport.hasPointerCapture && viewport.hasPointerCapture(event.pointerId)){
        viewport.releasePointerCapture(event.pointerId);
      }

      const step = getCardStep();
      if(dragOffset > step * 0.45){
        goPrev();
      } else if(dragOffset < -step * 0.45){
        goNext();
      } else {
        updateCarousel();
      }
        }

    // Handle wheel/trackpad scrolling — instant 1:1, snap on rest.
    // Captures ALL scroll events over the viewport and converts to horizontal.
    let wheelAccum = 0;
    let wheelSnapTimer = null;
    const WHEEL_SNAP_MS = 120;
    let wheelTranslateBase = 0;
    let rafPending = false;
    let pendingDelta = 0;
    function flushWheel(){
      rafPending = false;
      const step = getCardStep();
      const totalCards = allCards.length;
      const visibleCards = getVisibleCards();

      if(wheelAccum === 0){
        wheelTranslateBase = currentIndex * step;
        track.style.transition = 'none';
      }

      wheelAccum += pendingDelta;
      pendingDelta = 0;

      const raw = wheelTranslateBase + wheelAccum;
      let currentIdx = Math.round(raw / step);
      
      // Infinite scroll teleport: instantly jump when hitting clone boundaries
      if(currentIdx < cloneCount){
        // Scrolled into left clones - teleport to equivalent position at right
        const offset = cloneCount - currentIdx;
        currentIndex = cloneCount + originalCards.length - offset;
        currentIdx = currentIndex;
        wheelTranslateBase = currentIndex * step;
        wheelAccum = 0;
      } else if(currentIdx >= cloneCount + originalCards.length){
        // Scrolled into right clones - teleport to equivalent position at left
        const offset = currentIdx - (cloneCount + originalCards.length);
        currentIndex = cloneCount + offset;
        currentIdx = currentIndex;
        wheelTranslateBase = currentIndex * step;
        wheelAccum = 0;
      }

      const minTranslate = 0;
      const maxTranslate = totalCards * step;
      const clamped = Math.min(Math.max(raw, minTranslate), maxTranslate);

      track.style.transform = `translate3d(-${clamped}px, 0, 0)`;

      // Update dots to reflect current scroll position
      const totalOriginal = originalCards.length;
      const displayIdx = ((currentIdx - cloneCount) % totalOriginal + totalOriginal) % totalOriginal;
      const dots = Array.from(dotsContainer.children);
      const activeDot = Math.min(Math.max(0, displayIdx), dots.length - 1);
      dots.forEach((dot, i) => { dot.classList.toggle('active', i === activeDot); });
    }
    function handleWheel(event){
      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);

      // Only capture clearly HORIZONTAL scroll. If there's any meaningful
      // vertical component, let the page scroll normally. This is critical
      // for trackpads where most gestures are primarily vertical.
      if(absX < 2 && absY < 2) return;         // noise — ignore
      if(absY >= absX * 1.2) return;           // vertical or diagonal — page scroll

      event.preventDefault();

      let delta = event.deltaX;
      if(Math.abs(delta) < 2) delta = event.deltaY;          // most trackpads fire mostly deltaY
      if(event.deltaMode === 1) delta *= 16;                  // line mode
      if(event.deltaMode === 2) delta *= 800;                 // page mode
      if(Math.abs(delta) < 0.5) return;                       // ignore noise

      // Mouse wheel notches are large discrete jumps (~100px).
      // Treat each notch as one card step so one scroll = one card.
      if(Math.abs(delta) >= 30){
        clearTimeout(wheelSnapTimer);
        if(delta > 0) goNext(true);
        else goPrev(true);
        // Also reset any in-progress trackpad tracking
        wheelAccum = 0;
        pendingDelta = 0;
        return;
      }

      // Trackpad / smooth scroll — accumulate and snap after rest
      // Coalesce multiple wheel events per frame into a single paint
      pendingDelta += delta;
      if(!rafPending){ rafPending = true; requestAnimationFrame(flushWheel); }

      // Snap to nearest card once the user stops scrolling
      clearTimeout(wheelSnapTimer);
      wheelSnapTimer = setTimeout(() => {
        const step = getCardStep();
        const finalPos = wheelTranslateBase + wheelAccum;
        const nearestIdx = Math.round(finalPos / step);
        const total = allCards.length;
        const visible = getVisibleCards();
        currentIndex = Math.max(cloneCount, Math.min(nearestIdx, total - visible));
        wheelAccum = 0;
        pendingDelta = 0;
        track.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.22,1,.36,1)`;
        updateCarousel();
      }, WHEEL_SNAP_MS);
    }

    // Auto-scroll: pause on any user interaction, resume after idle
    viewport.addEventListener('pointerdown', () => { pauseAndResume(); });
    viewport.addEventListener('wheel', () => { pauseAndResume(); }, { passive: true });

    prevBtn.addEventListener('click', () => { pauseAndResume(); goPrev(true); });
    nextBtn.addEventListener('click', () => { pauseAndResume(); goNext(true); });
    viewport.addEventListener('pointerdown', handlePointerDown);
    viewport.addEventListener('pointermove', handlePointerMove);
    viewport.addEventListener('pointerup', handlePointerUp);
    viewport.addEventListener('pointerleave', handlePointerUp);
    viewport.addEventListener('pointercancel', handlePointerUp);
    
    // Add horizontal wheel/trackpad support
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    
    window.addEventListener('resize', () => {
      cachedStep = 0; // Recalculate card dimensions on resize
      buildDots();
      updateCarousel();
    });

    buildDots();

    // Start hidden for graceful crossfade-in
    track.style.opacity = '0';
    track.style.transition = 'none';
    updateCarousel();

    // Fade in after initial positioning settles
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.transition = 'opacity 0.6s cubic-bezier(.22,1,.36,1)';
        track.style.opacity = '1';
      });
    });

    // Start auto-scrolling after initial render
    startAutoScroll();
  });
}

// Mobile nav toggle
function toggleNav(){
  const links = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  
  if(!links) return;
  
  const isOpen = links.classList.contains('active');
  
  if(isOpen){
    // Close menu
    links.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  } else {
    // Open menu
    links.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
  }
}

function closeNav(){
  const links = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  
  if(!links) return;
  
  links.classList.remove('active');
  if(hamburger){
    hamburger.setAttribute('aria-expanded', 'false');
  }
}

// Smooth anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const hash = a.getAttribute('href');
    if(hash.length>1){ const el = document.querySelector(hash); if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    }
  })
});

// Contact form handler with FormSubmit.co
// No JavaScript needed - form submits directly to FormSubmit
// First submission will require email verification, then works automatically

// ========================================
// SCROLL-REVEAL OBSERVER (Apple-style entrances)
// ========================================
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('[data-reveal],[data-reveal-stagger],[data-reveal-group]');

  if(reduceMotion || !('IntersectionObserver' in window)){
    // Show everything immediately for reduced-motion or no-IO browsers
    revealEls.forEach(el => el.classList.add('revealed'));
    return;
  }
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -8% 0px'});
  revealEls.forEach(el => revealObserver.observe(el));
})();

// ========================================
// HERO PARALLAX + SCROLL INDICATOR FADE
// ========================================
(function(){
  const heroInner = document.querySelector('.hero-inner');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(heroInner || scrollIndicator){
    let ticking = false;
    window.addEventListener('scroll', () => {
      if(!ticking){
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const y = window.scrollY;
          if(heroInner && y < window.innerHeight){
            heroInner.style.transform = `translateY(${y * 0.22}px)`;
            heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));
          }
          if(scrollIndicator){
            scrollIndicator.classList.toggle('hidden', y > 80);
          }
        });
      }
    }, {passive: true});
  }
})();

// ========================================
// PAGE LOAD FADE-IN
// ========================================
(function(){
  document.body.classList.add('loading');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.remove('loading');
  }));
})();


// ========================================
// APPLE-LEVEL POLISH: scroll progress + image fade-in
// ========================================
(function(){
  // Mark the page as enhanced (enables safe JS-dependent polish)
  document.body.classList.add('enhanced');

  // Scroll progress bar
  const progress = document.querySelector('.scroll-progress');
  if(progress && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      progress.style.transform = `scaleX(${pct})`;
    };
    window.addEventListener('scroll', () => {
      if(!ticking){ ticking = true; requestAnimationFrame(update); }
    }, {passive:true});
    window.addEventListener('resize', update, {passive:true});
    update();
  }

  // Image fade-in: add .loaded once each project image is fully loaded
  const imgs = document.querySelectorAll('.project-thumb, .project-card .thumb');
  imgs.forEach(img => {
    if(img.complete){
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), {once:true});
      // Safety fallback if load never fires (cached/partial)
      img.addEventListener('error', () => img.classList.add('loaded'), {once:true});
    }
  });
})();

// ========================================
// BACK-TO-TOP BUTTON
// ========================================
(function(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;
  const navTicking = {v:false};
  const update = () => {
    navTicking.v = false;
    btn.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', () => {
    if(!navTicking.v){ navTicking.v = true; requestAnimationFrame(update); }
  }, {passive:true});
  window.addEventListener('resize', update, {passive:true});
  update();
  btn.addEventListener('click', () => {
    window.scrollTo({top:0, behavior:'smooth'});
  });
})();


document.addEventListener('DOMContentLoaded', initCarousel);