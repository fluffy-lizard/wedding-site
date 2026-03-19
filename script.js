/* ===================================================
   WEDDING WEBSITE — script.js
   Lukáš & Pája · 11. července 2026
   =================================================== */

const EMAILJS_PUBLIC_KEY  = 'xr4cyuqJHYioPTdTn';
const EMAILJS_SERVICE_ID  = 'service_g1shzho';
const EMAILJS_TEMPLATE_ID = 'template_x3jgcgg';

/* ===================================================
   SMOOTH SCROLL POLYFILL (Safari iOS < 15.4)
   =================================================== */
function smoothScrollTo(targetId) {
  const target = document.querySelector(targetId);
  if (!target) return;
  // Use native smooth scroll if supported, else instant
  try {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    target.scrollIntoView(true);
  }
}

/* ===================================================
   TMAVÝ REŽIM
   =================================================== */
function applyDark(isDark) {
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('wedding-dark', isDark ? '1' : '0');
}

/* ===================================================
   NAV — scroll & mobilní menu
   =================================================== */
function initNav() {
  const nav       = document.querySelector('.nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Fix anchor-link smooth scroll on iOS Safari
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        smoothScrollTo(href);
      }
      // Close mobile menu if open
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===================================================
   ODPOČET
   =================================================== */
function initCountdown() {
  // Svatba: 11. července 2026 v 11:00 SEČ (CEST = UTC+2)
  const weddingDate = new Date(2026, 6, 11, 11, 0, 0); // Month is 0-based

  const daysEl  = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    const diff = weddingDate - now;
    if (diff <= 0) {
      [daysEl, hoursEl, minsEl, secsEl].forEach(el => el.textContent = '00');
      return;
    }
    const totalSec = Math.floor(diff / 1000);
    daysEl.textContent  = String(Math.floor(totalSec / 86400));
    hoursEl.textContent = pad(Math.floor((totalSec % 86400) / 3600));
    minsEl.textContent  = pad(Math.floor((totalSec % 3600) / 60));
    secsEl.textContent  = pad(totalSec % 60);
  }

  tick();
  setInterval(tick, 1000);
}

/* ===================================================
   ICS STAŽENÍ
   =================================================== */
function downloadICS() {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lukas & Paja Svatba//CS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:lukas-paja-svatba-2026@wedding',
    'DTSTAMP:' + now,
    'DTSTART;TZID=Europe/Prague:20260711T110000',
    'DTEND;TZID=Europe/Prague:20260711T230000',
    'SUMMARY:Svatba Lukáš & Pája 💍',
    'DESCRIPTION:Obřad v 11:00 hodin (venku za hezkého počasí).\\n' +
      'Oběd ve 12:00.\\nProsíme bez zvířat.\\n' +
      'Parkujte na přilehlé louce.\\n' +
      'Areál uvolněte do neděle 14:00.',
    'LOCATION:Škola na Vsi\\, Kunčina Ves 61\\, 516 01 Zdobnice\\, Orlické hory',
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
  link.download = 'lukas-paja-svatba.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/* ===================================================
   RSVP FORMULÁŘ
   =================================================== */
function initRSVP() {
  // :has() fallback for older Safari — add/remove .checked class on radio labels
  document.querySelectorAll('.radio-label input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.radio-label').forEach(lbl => lbl.classList.remove('checked'));
      if (radio.checked) {
        radio.closest('.radio-label').classList.add('checked');
      }
    });
  });

  document.getElementById('rsvpSubmit')?.addEventListener('click', handleRSVP);
}

async function handleRSVP() {
  const name      = document.getElementById('rsvpName').value.trim();
  const attending = document.querySelector('input[name="attending"]:checked');
  const guests    = document.getElementById('rsvpGuests').value;
  const message   = document.getElementById('rsvpDiet').value.trim();

  if (!name) {
    const el = document.getElementById('rsvpName');
    el.style.borderColor = '#c0392b';
    el.focus();
    el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
    return;
  }
  if (!attending) {
    alert('Prosíme vyberte, zda se zúčastníte.');
    return;
  }

  const btn = document.getElementById('rsvpSubmit');
  btn.disabled    = true;
  btn.textContent = 'Odesílám…';

  const params = {
    name:      name,
    attending: attending.value === 'yes' ? 'Ano, přijdu!' : 'Bohužel se nezúčastním',
    guests:    guests || '1',
    message:   message || '(žádný vzkaz)',
  };

  try {
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    } else {
      // Demo režim — simulace odeslání (EmailJS není nakonfigurováno)
      await new Promise(r => setTimeout(r, 1000));
      console.log('RSVP (demo režim):', params);
    }

    document.getElementById('rsvpForm').style.display = 'none';
    const success = document.getElementById('rsvpSuccess');
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    console.error('EmailJS chyba:', err);
    btn.disabled    = false;
    btn.textContent = 'Odeslat potvrzení';
    alert('Odeslání selhalo. Zkuste to prosím znovu nebo nás kontaktujte přímo.');
  }
}

/* ===================================================
   FAQ AKORDEON
   =================================================== */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const a = b.nextElementSibling;
        if (a) a.hidden = true;
      });
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.hidden = false;
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
    '.info-card, .faq-item, .rsvp-form-wrap, ' +
    '.rsvp-subtitle, .map-wrapper'
  );
  targets.forEach(el => el.classList.add('reveal'));

  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }).observe
    ? (() => {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        targets.forEach(el => io.observe(el));
      })()
    : targets.forEach(el => el.classList.add('visible'));
}

/* ===================================================
   PARALLAX HERO
   =================================================== */
function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  // Disable parallax on iOS/iPadOS — causes jank and battery drain
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!heroBg || isIOS || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }
  }, { passive: true });
}

/* ===================================================
   INIT
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Tmavý režim
  const savedDark  = localStorage.getItem('wedding-dark');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyDark(savedDark !== null ? savedDark === '1' : prefersDark);

  document.getElementById('darkToggle')?.addEventListener('click', () => {
    applyDark(!document.body.classList.contains('dark'));
  });

  // ICS tlačítko
  document.getElementById('addCalBtn')?.addEventListener('click', downloadICS);

  // Google Kalendář odkaz je statický href v HTML — nepotřebuje JS

  initNav();
  initCountdown();
  initRSVP();
  initFAQ();
  initScrollReveal();
  initParallax();
});
