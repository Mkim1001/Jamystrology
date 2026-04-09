// ── Meditation Modal ─────────────────────────────────
// Path: relative to index.html location
// posenet-meditation repo root → meditation/sketch.html
const SKETCH_SRC = 'meditation/sketch.html';
let _iframeReady = false;

function openMeditationModal() {
  const modal   = document.getElementById('meditation-modal');
  const iframe  = document.getElementById('meditation-iframe');
  const loading = document.getElementById('modal-loading');

  // Lazy-load iframe only once
  if (!_iframeReady) {
    _iframeReady = true;
    loading.classList.remove('hidden');
    iframe.classList.remove('loaded');

    iframe.addEventListener('load', function onLoad() {
      loading.classList.add('hidden');
      iframe.classList.add('loaded');
      iframe.removeEventListener('load', onLoad);
    });

    iframe.src = SKETCH_SRC;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMeditationModal() {
  const modal = document.getElementById('meditation-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMeditationModal();
});

// ── Sticky header shadow on scroll ──────────────────
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10
    ? '0 2px 20px rgba(0,0,0,0.10)'
    : '0 1px 8px rgba(0,0,0,0.05)';
});

// ── Mobile hamburger ─────────────────────────────────
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('main-nav');
hamburger?.addEventListener('click', () => {
  nav.classList.toggle('open');
  const open = nav.classList.contains('open');
  hamburger.setAttribute('aria-expanded', open);
  // Animate bars
  const bars = hamburger.querySelectorAll('span');
  if (open) {
    bars[0].style.transform = 'translateY(7px) rotate(45deg)';
    bars[1].style.opacity = '0';
    bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  }
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) {
    nav.classList.remove('open');
    const bars = hamburger?.querySelectorAll('span');
    bars?.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  }
});

// ── Newsletter subscribe ──────────────────────────────
function handleSubscribe(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type=email]').value;
  const btn = form.querySelector('button');
  btn.textContent = '✓ 구독 완료!';
  btn.style.background = '#2e7a4a';
  btn.disabled = true;
  form.querySelector('input').disabled = true;
  setTimeout(() => {
    btn.textContent = '구독하기';
    btn.style.background = '';
    btn.disabled = false;
    form.querySelector('input').value = '';
    form.querySelector('input').disabled = false;
  }, 3500);
}

// ── Scroll-in animations ─────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.latest-card, .start-card, .article-card, .featured-article, .promo-inner'
).forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// Inject fade-up CSS once
const style = document.createElement('style');
style.textContent = `
  .fade-up { opacity: 0; transform: translateY(24px); transition: opacity .55s ease, transform .55s ease; }
  .fade-up.visible { opacity: 1; transform: none; }
`;
document.head.appendChild(style);
