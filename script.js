/* =========================================
   WEDDING INVITATION — script.js
   Lukáš & [Bride] · March 2027
   ========================================= */

'use strict';

// ── Config ────────────────────────────────
const WEDDING_DATE = new Date('2027-03-13T14:00:00');

const CALENDAR_DETAILS = {
  title:       'Wedding of Lukáš & [Bride]',
  start:       '20270313T140000',
  end:         '20270313T230000',
  location:    'Uhřínov u Liberka, Orlické hory, Czech Republic',
  description: 'Join us to celebrate the wedding of Lukáš & [Bride] — ceremony at 14:00, party from 17:00.',
};

// ── DOM refs ──────────────────────────────
const navbar     = document.getElementById('navbar');
const darkToggle = document.getElementById('darkToggle');
const rsvpForm   = document.getElementById('rsvpForm');
const rsvpSuccess = document.getElementById('rsvpSuccess');
const calBtn     = document.getElementById('calBtn');
const cdDays     = document.getElementById('cd-days');
const cdHours    = document.getElementById('cd-hours');
const cdMins     = document.getElementById('cd-mins');
const cdSecs     = document.getElementById('cd-secs');

// ─────────────────────────────────────────
// 1.  DARK MODE
// ─────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('weddingTheme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('weddingTheme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

darkToggle.addEventListener('click', toggleTheme);
initTheme();

// ─────────────────────────────────────────
// 2.  NAVBAR — scroll behaviour
// ─────────────────────────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Smooth nav link active state
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));

// ─────────────────────────────────────────
// 3.  COUNTDOWN TIMER
// ─────────────────────────────────────────
function pad(n, len = 2) {
  return String(Math.max(0, n)).padStart(len, '0');
}

function updateCountdown() {
  const now  = Date.now();
  const diff = WEDDING_DATE.getTime() - now;

  if (diff <= 0) {
    cdDays.textContent  = '000';
    cdHours.textContent = '00';
    cdMins.textContent  = '00';
    cdSecs.textContent  = '00';
    return;
  }

  const totalSecs = Math.floor(diff / 1000);
  const days      = Math.floor(totalSecs / 86400);
  const hours     = Math.floor((totalSecs % 86400) / 3600);
  const mins      = Math.floor((totalSecs % 3600) / 60);
  const secs      = totalSecs % 60;

  setNum(cdDays,  pad(days, 3));
  setNum(cdHours, pad(hours));
  setNum(cdMins,  pad(mins));
  setNum(cdSecs,  pad(secs));
}

function setNum(el, val) {
  if (el.textContent !== val) {
    el.classList.add('flip');
    setTimeout(() => {
      el.textContent = val;
      el.classList.remove('flip');
    }, 75);
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ─────────────────────────────────────────
// 4.  GOOGLE CALENDAR LINK
// ─────────────────────────────────────────
function buildGCalLink(d) {
  const base = 'https://www.google.com/calendar/render?action=TEMPLATE';
  const p = new URLSearchParams({
    text:     d.title,
    dates:    `${d.start}/${d.end}`,
    location: d.location,
    details:  d.description,
  });
  return `${base}&${p.toString()}`;
}

calBtn.href = buildGCalLink(CALENDAR_DETAILS);

// Also generate an ICS download option (fallback)
function buildICS(d) {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invite//EN',
    'BEGIN:VEVENT',
    `UID:${now}-wedding@lukas-bride.cz`,
    `DTSTAMP:${now}`,
    `DTSTART:${d.start}`,
    `DTEND:${d.end}`,
    `SUMMARY:${d.title}`,
    `DESCRIPTION:${d.description}`,
    `LOCATION:${d.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// Append ICS button after cal button
(function addICSButton() {
  const btn = document.createElement('a');
  btn.className = 'btn btn-outline';
  btn.style.marginLeft = '0.75rem';
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download .ics`;
  btn.addEventListener('click', e => {
    e.preventDefault();
    const blob = new Blob([buildICS(CALENDAR_DETAILS)], { type: 'text/calendar' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'lukas-bride-wedding.ics';
    a.click();
    URL.revokeObjectURL(url);
  });
  calBtn.parentNode.insertBefore(btn, calBtn.nextSibling);
})();

// ─────────────────────────────────────────
// 5.  SCROLL ANIMATIONS (mini AOS)
// ─────────────────────────────────────────
const animObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-aos], .timeline-item').forEach(el => {
  animObserver.observe(el);
});

// ─────────────────────────────────────────
// 6.  RSVP FORM
// ─────────────────────────────────────────
function validateField(el) {
  const ok = el.checkValidity() && el.value.trim() !== '';
  el.classList.toggle('error', !ok);
  return ok;
}

rsvpForm && rsvpForm.addEventListener('submit', e => {
  e.preventDefault();

  const name      = rsvpForm.querySelector('#fname');
  const email     = rsvpForm.querySelector('#email');
  const attending = rsvpForm.querySelector('#attending');

  const valid = [name, email, attending].map(validateField).every(Boolean);
  if (!valid) return;

  // Build submission object
  const data = {
    name:      name.value.trim(),
    email:     email.value.trim(),
    attending: attending.value,
    guests:    rsvpForm.querySelector('#guests').value,
    dietary:   rsvpForm.querySelector('#dietary').value.trim(),
    message:   rsvpForm.querySelector('#message').value.trim(),
    timestamp: new Date().toISOString(),
  };

  // Save to localStorage (works offline / static hosting)
  try {
    const existing = JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
    existing.push(data);
    localStorage.setItem('weddingRSVPs', JSON.stringify(existing));
  } catch (_) { /* quota exceeded — silently ignore */ }

  // Animate transition
  rsvpForm.style.transition = 'opacity 0.4s ease';
  rsvpForm.style.opacity = '0';
  setTimeout(() => {
    rsvpForm.hidden = true;
    rsvpSuccess.hidden = false;
    rsvpSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 400);

  console.info('RSVP submitted:', data);
  // ℹ️  In production: replace localStorage logic with a fetch() to your
  //     serverless function / Formspree / Netlify Forms endpoint.
});

// Live validation on blur
rsvpForm && rsvpForm.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('blur', () => {
    if (el.required) validateField(el);
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) validateField(el);
  });
});

// ─────────────────────────────────────────
// 7.  PARALLAX — subtle hero layer
// ─────────────────────────────────────────
const heroBg = document.querySelector('.hero-bg');
if (heroBg && window.matchMedia('(min-width: 769px)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.25}px)`;
  }, { passive: true });
}

// ─────────────────────────────────────────
// 8.  HERO ENTRANCE ANIMATION
// ─────────────────────────────────────────
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

// ─────────────────────────────────────────
// 9.  NAV MOBILE — smooth active highlight
// ─────────────────────────────────────────
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', function() {
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});
