// ── Language Toggle ──────────────────────────────────
let currentLang = 'ko';

function toggleLang() {
  currentLang = currentLang === 'ko' ? 'en' : 'ko';
  applyLang(currentLang);

  // Update toggle button active states
  document.querySelector('.lang-ko').classList.toggle('active', currentLang === 'ko');
  document.querySelector('.lang-en').classList.toggle('active', currentLang === 'en');

  // Update html lang attribute
  document.documentElement.lang = currentLang;

  // Update page title
  const titleEl = document.querySelector('title');
  const titleVal = currentLang === 'en' ? titleEl.dataset.en : titleEl.dataset.ko;
  if (titleVal) titleEl.textContent = titleVal;

  // Update newsletter input placeholder
  const input = document.getElementById('newsletter-input');
  if (input) {
    input.placeholder = currentLang === 'en'
      ? (input.dataset.placeholderEn || input.placeholder)
      : '이메일 주소 입력';
  }
}

function applyLang(lang) {
  // 1. Simple text swap: data-en attribute (textContent)
  document.querySelectorAll('[data-en]').forEach(el => {
    if (!el.dataset.ko) el.dataset.ko = el.textContent.trim();
    el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ko;
  });

  // 2. HTML swap: data-en-html attribute (innerHTML)
  document.querySelectorAll('[data-en-html]').forEach(el => {
    if (!el.dataset.koHtml) el.dataset.koHtml = el.innerHTML;
    el.innerHTML = lang === 'en' ? el.dataset.enHtml : el.dataset.koHtml;
  });
}

// ── Meditation Modal ─────────────────────────────────
// Candidate paths tried in order (relative to this page's location)
const SKETCH_CANDIDATES = [
  'meditation/sketch.html',
  '../meditation/sketch.html',
  '../public/meditation/sketch.html',
];
let _iframeLoading = false;
let _iframeLoaded  = false;
let _loadTimer     = null;

async function _resolveSketchSrc() {
  for (const path of SKETCH_CANDIDATES) {
    try {
      const res = await fetch(path, { method: 'HEAD', cache: 'no-store' });
      if (res.ok) return path;
    } catch (_) { /* try next */ }
  }
  return null; // all failed → show new-tab link
}

function _showNewtab() {
  const newtab  = document.getElementById('modal-newtab');
  const spinner = document.getElementById('modal-spinner');
  const loadTxt = document.getElementById('modal-loading-text');
  if (newtab)  newtab.style.display  = 'inline-block';
  if (spinner) spinner.style.display = 'none';
  if (loadTxt) loadTxt.textContent   =
    currentLang === 'en'
      ? 'Camera apps cannot load inside this frame. Please open in a new tab:'
      : '카메라 앱은 이 창 안에서 로드될 수 없습니다. 새 탭에서 열어주세요:';
}

function openMeditationModal() {
  const modal   = document.getElementById('meditation-modal');
  const iframe  = document.getElementById('meditation-iframe');
  const loading = document.getElementById('modal-loading');
  const newtab  = document.getElementById('modal-newtab');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Already loaded successfully — nothing more to do
  if (_iframeLoaded) return;

  // Already in progress — just show the modal
  if (_iframeLoading) return;

  _iframeLoading = true;
  loading.classList.remove('hidden');
  iframe.classList.remove('loaded');
  if (newtab) newtab.style.display = 'none';

  // Resolve path, then set iframe src
  _resolveSketchSrc().then(src => {
    if (!src) {
      // No path reachable (e.g. file:// or network block) → show new-tab
      _showNewtab();
      return;
    }

    // Update new-tab href to the resolved path
    if (newtab) newtab.href = src;

    // Timeout: if iframe hasn't fired load within 10 s, show fallback
    _loadTimer = setTimeout(() => {
      if (!_iframeLoaded) _showNewtab();
    }, 10000);

    iframe.addEventListener('load', function onLoad() {
      clearTimeout(_loadTimer);
      _iframeLoaded  = true;
      _iframeLoading = false;
      loading.classList.add('hidden');
      iframe.classList.add('loaded');
      iframe.removeEventListener('load', onLoad);
    });

    iframe.src = src;
  });
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
