/* ============================================================
   ARBOROPS — main.js
   Micro-interactions: scroll progress, active nav, count-up,
   copy email, back-to-top, process hover, reveal animations
   ============================================================ */

// ── Scroll progress bar ──
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (scrolled / total) * 100 : 0;
  progressBar.style.width = pct + '%';
}

// ── Nav scroll behaviour ──
const nav = document.getElementById('nav');
function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  updateProgress();
  updateBackToTop();
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Active nav link tracking ──
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id], article[id]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
sections.forEach(s => sectionObserver.observe(s));

// ── Hamburger menu ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// ── Scroll-reveal (IntersectionObserver) ──
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);
revealEls.forEach(el => revealObserver.observe(el));

// ── Count-up animation on metrics ──
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  if (isNaN(target)) return;
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countEls = document.querySelectorAll('.solution-metric-value[data-count]');
const countObserver = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        countObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.6 }
);
countEls.forEach(el => countObserver.observe(el));

// ── Copy email to clipboard ──
const copyBtn = document.getElementById('copy-email-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('build@arborops.tech');
      copyBtn.classList.add('copied');
      copyBtn.setAttribute('title', 'Copied!');
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.setAttribute('title', 'Copy email');
      }, 2200);
    } catch {
      // fallback — select the link text
      const link = document.getElementById('contact-email-link');
      if (link) link.select && link.select();
    }
  });
}

// ── Back to top ──
const backToTop = document.getElementById('back-to-top');
function updateBackToTop() {
  const show = window.scrollY > window.innerHeight * 0.5;
  backToTop.classList.toggle('visible', show);
}
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Contact Form — Formspree AJAX ──
const form = document.getElementById('contact-form');
const formMsg = document.getElementById('form-message');
const submitBtn = document.getElementById('form-submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  formMsg.className = 'form-message';
  formMsg.textContent = '';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      formMsg.textContent = '✓ Received. We\'ll be in touch within 24 hours.';
      formMsg.className = 'form-message success';
      form.reset();
    } else {
      const json = await res.json().catch(() => ({}));
      const err = json?.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
      formMsg.textContent = err;
      formMsg.className = 'form-message error';
    }
  } catch {
    formMsg.textContent = 'Network error. Email us directly at build@arborops.tech';
    formMsg.className = 'form-message error';
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Enquiry';
});
