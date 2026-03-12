/* ===================================================
   WEDDING WEBSITE — script.js
   Lukáš & Pája · July 11, 2026
   =================================================== */

/* ===================================================
   EMAILJS CONFIGURATION
   ---------------------------------------------------
   SETUP STEPS:
   1. Create free account at https://www.emailjs.com
   2. Dashboard → Email Services → Add New Service → Gmail
      → Name it "wedding_gmail" → note the Service ID
   3. Dashboard → Email Templates → Create New Template
      Subject:  New RSVP from {{name}}
      Body:
        Name: {{name}}
        Attending: {{attending}}
        Guests: {{guests}}
        Message / Dietary: {{message}}
      To Email: capekabcd@gmail.com
      Note the Template ID
   4. Account → API Keys → copy Public Key
   5. Replace the three constants below
   6. In index.html, un-comment the EmailJS <script> tag
   =================================================== */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';    // e.g. "aB1cD2eF3gH4"
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';    // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. "template_xyz789"

/* ===================================================
   LANGUAGE
   =================================================== */
let currentLang = 'en';

function detectLanguage() {
  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return browserLang.startsWith('cs') || browserLang.startsWith('sk') ? 'cs' : 'en';
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // Update all [data-en] / [data-cs] elements
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute('data-' + lang);
    if (!text) return;
    // For headings with <br> we can use innerHTML
    if (el.innerHTML.includes('<br') || text.includes('<br')) {
      el.innerHTML = text;
    } else if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
      el.textContent = text;
    }
  });

  // Update lang button
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'en' ? '🇨🇿 CS' : '🇬🇧 EN';

  // Update placeholders
  const dietEl = document.getElementById('rsvpDiet');
  if (dietEl) {
    dietEl.placeholder = lang === 'cs'
      ? 'Vegetarián, bezlepkové… nebo jen vzkaz novomanželům'
      : 'Vegetarian, gluten-free, or any message to the couple…';
  }
  const nameEl = document.getElementById('rsvpName');
  if (nameEl) {
    nameEl.placeholder = lang === 'cs' ? 'Jana Nováková' : 'Lukáš Novák';
  }

  // Update RSVP success message
  const successMsg = document.getElementById('successMsg');
  if (successMsg) {
    successMsg.textContent = lang === 'cs'
      ? 'Vaše potvrzení bylo přijato. Těšíme se na vás v horách! 🏔'
      : 'We\'ve received your RSVP. See you in the mountains! 🏔';
  }

  localStorage.setItem('wedding-lang', lang);
}

function toggleLanguage() {
  applyLanguage(currentLang === 'en' ? 'cs' : 'en');
}

/* ===================================================
   DARK MODE
   =================================================== */
function applyDark(isDark) {
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('wedding-dark', isDark ? '1' : '0');
}

function toggleDark() {
  applyDark(!document.body.classList.contains('dark'));
}

/* ===================================================
   NAV — scroll & mobile
   =================================================== */
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  // Scroll state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===================================================
   COUNTDOWN TIMER
   =================================================== */
function initCountdown() {
  // Wedding: 11 July 2026 at 11:00 AM CET (UTC+2 in summer)
  const weddingDate = new Date('2026-07-11T09:00:00Z'); // 11:00 CET = 09:00 UTC

  const daysEl  = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      daysEl.textContent  = '00';
      hoursEl.textContent = '00';
      minsEl.textContent  = '00';
      secsEl.textContent  = '00';
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const days  = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins  = Math.floor((totalSec % 3600)  / 60);
    const secs  = totalSec % 60;

    daysEl.textContent  = String(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent  = pad(mins);
    secsEl.textContent  = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
}

/* ===================================================
   ICS / CALENDAR DOWNLOAD
   =================================================== */
function downloadICS() {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lukas & Paja Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:lukas-paja-wedding-2026@wedding',
    'DTSTAMP:' + formatICSDate(new Date()),
    'DTSTART;TZID=Europe/Prague:20260711T110000',
    'DTEND;TZID=Europe/Prague:20260711T230000',
    'SUMMARY:Lukáš & Pája – Wedding 💍',
    'DESCRIPTION:Ceremony at 11:00 AM (outdoors if weather allows).\\n' +
      'Lunch at 12:00 PM.\\nPlease no photos during ceremony.\\n' +
      'No pets please.\\nPark on the nearby meadow.\\n' +
      'Please vacate venue by Sunday 2:00 PM.',
    'LOCATION:Kunčina Ves\\, Orlické hory\\, Czech Republic',
    'GEO:50.2236725;16.3832923',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'lukas-paja-wedding.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/* ===================================================
   RSVP FORM
   =================================================== */
function initRSVP() {
  const submitBtn = document.getElementById('rsvpSubmit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', handleRSVP);
}

async function handleRSVP() {
  const name      = document.getElementById('rsvpName').value.trim();
  const attending = document.querySelector('input[name="attending"]:checked');
  const guests    = document.getElementById('rsvpGuests').value;
  const message   = document.getElementById('rsvpDiet').value.trim();

  // Validation
  if (!name) {
    showFieldError('rsvpName', currentLang === 'cs' ? 'Prosíme zadejte jméno.' : 'Please enter your name.');
    return;
  }
  if (!attending) {
    alert(currentLang === 'cs'
      ? 'Prosíme vyberte, zda se zúčastníte.'
      : 'Please select whether you will attend.');
    return;
  }

  const btn = document.getElementById('rsvpSubmit');
  btn.disabled  = true;
  btn.textContent = currentLang === 'cs' ? 'Odesílám…' : 'Sending…';

  const params = {
    name:      name,
    attending: attending.value === 'yes'
      ? (currentLang === 'cs' ? 'Ano, přijdu!' : 'Yes, attending!')
      : (currentLang === 'cs' ? 'Bohužel se nezúčastním' : 'Cannot attend'),
    guests:    guests || '1',
    message:   message || (currentLang === 'cs' ? '(žádný vzkaz)' : '(no message)'),
  };

  try {
    // Check if EmailJS is loaded (user has uncommented the script tag and set keys)
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    } else {
      // DEMO MODE: Simulate success when EmailJS isn't configured
      // In production, remove this branch once EmailJS is set up
      await new Promise(r => setTimeout(r, 1200));
      console.log('RSVP (demo mode — EmailJS not configured):', params);
    }

    // Show success
    document.getElementById('rsvpForm').style.display = 'none';
    const success = document.getElementById('rsvpSuccess');
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    console.error('EmailJS error:', err);
    btn.disabled    = false;
    btn.textContent = currentLang === 'cs' ? 'Odeslat potvrzení' : 'Send RSVP';
    alert(currentLang === 'cs'
      ? 'Odeslání selhalo. Zkuste to prosím znovu nebo nás kontaktujte přímo.'
      : 'Sending failed. Please try again or contact us directly.');
  }
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#c0392b';
  el.focus();
  el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
  // Brief shake animation
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.3s ease';
}

/* ===================================================
   FAQ ACCORDION
   =================================================== */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answer   = btn.nextElementSibling;

      // Close all others
      document.querySelectorAll('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const a = b.nextElementSibling;
        if (a) a.hidden = true;
      });

      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });
}

/* ===================================================
   SCROLL REVEAL
   =================================================== */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.section-label, .section-title, .about-text, .about-photos, ' +
    '.timeline-item, .info-card, .faq-item, .rsvp-form-wrap, ' +
    '.rsvp-subtitle, .map-wrapper'
  );

  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
}

/* ===================================================
   PARALLAX (hero bg subtle)
   =================================================== */
function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  }, { passive: true });
}

/* ===================================================
   SMOOTH ACTIVE NAV HIGHLIGHT
   =================================================== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a, .mobile-menu a');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.style.color = '');
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.style.color = 'var(--accent-light)';
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
}

/* ===================================================
   ADD SHAKE KEYFRAMES DYNAMICALLY
   =================================================== */
function injectShakeKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%,60%  { transform: translateX(-5px); }
      40%,80%  { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}

/* ===================================================
   INIT
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Restore preferences
  const savedLang = localStorage.getItem('wedding-lang') || detectLanguage();
  const savedDark = localStorage.getItem('wedding-dark');

  // Dark mode: restore or use system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyDark(savedDark !== null ? savedDark === '1' : prefersDark);

  // Language
  applyLanguage(savedLang);

  // Wire up controls
  document.getElementById('langToggle')?.addEventListener('click', toggleLanguage);
  document.getElementById('darkToggle')?.addEventListener('click', toggleDark);
  document.getElementById('addCalBtn')?.addEventListener('click', downloadICS);

  // Features
  injectShakeKeyframes();
  initNav();
  initCountdown();
  initRSVP();
  initFAQ();
  initScrollReveal();
  initParallax();
  initActiveNav();
});
