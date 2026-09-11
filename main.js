/* ============================================================
   ARBOROPS — main.js
   ============================================================ */

// ── Nav scroll behaviour ──
const nav = document.getElementById('nav');
function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Hamburger menu ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ── Scroll-reveal (IntersectionObserver) ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach(el => observer.observe(el));

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

  const data = new FormData(form);

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      formMsg.textContent = 'Your message has been received. We will be in touch shortly.';
      formMsg.className = 'form-message success';
      form.reset();
    } else {
      const json = await res.json();
      const err = json?.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
      formMsg.textContent = err;
      formMsg.className = 'form-message error';
    }
  } catch {
    formMsg.textContent = 'Network error. Please email us directly at arborops.tech@gmail.com';
    formMsg.className = 'form-message error';
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Enquiry';
});
