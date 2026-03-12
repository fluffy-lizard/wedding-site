/* =========================================
   WEDDING — script.js
   Lukáš & Pája · 11. července 2026
   =========================================
   RSVP emails → Formspree
   To activate:
   1. Go to https://formspree.io and sign up (free)
   2. Create a new form → set recipient to capekabcd@gmail.com
   3. Replace FORMSPREE_ID below with your form ID
   ========================================= */

'use strict';

// ── Config ──────────────────────────────────────────────
// Explicit year/month/day/hour constructor avoids UTC vs local timezone issues
const WEDDING_DATE = new Date(2026, 6, 11, 11, 0, 0); // month is 0-indexed → 6 = July

// 👇 Replace with your Formspree form ID after signing up at formspree.io
// Example: if your endpoint is https://formspree.io/f/xaybcdeg → use 'xaybcdeg'
const FORMSPREE_ID = 'YOUR_FORMSPREE_ID';

const CALENDAR = {
  title:       'Svatba Lukase a Paji',   // no emoji/diacritics → safe URL encoding
  start:       '20260711T110000',
  end:         '20260712T140000',
  location:    'Kuncina Ves, Orlicke hory, Czech Republic',
  description: 'Obrad v 11:00, obed ve 12:00. Konec pronajmu nedele ve 14:00.',
};

// ── DOM refs ────────────────────────────────────────────
const navbar      = document.getElementById('navbar');
const darkToggle  = document.getElementById('darkToggle');
const rsvpForm    = document.getElementById('rsvpForm');
const rsvpSuccess = document.getElementById('rsvpSuccess');
const calBtn      = document.getElementById('calBtn');
const cdDays      = document.getElementById('cd-days');
const cdHours     = document.getElementById('cd-hours');
const cdMins      = document.getElementById('cd-mins');
const cdSecs      = document.getElementById('cd-secs');
const submitBtn   = document.getElementById('submitBtn');

// ─────────────────────────────────────────
// 1. DARK MODE
// ─────────────────────────────────────────
function initTheme() {
  const saved      = localStorage.getItem('weddingTheme');
  const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (preferDark ? 'dark' : 'light'));
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('weddingTheme', t);
}
darkToggle.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});
initTheme();

// ─────────────────────────────────────────
// 2. NAVBAR
// ─────────────────────────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// Active link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
sections.forEach(s => {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${s.id}"]`);
      if (a) a.classList.add('active');
    }
  }, { threshold: 0.3 }).observe(s);
});

// ─────────────────────────────────────────
// 3. COUNTDOWN
// ─────────────────────────────────────────
function pad(n, len = 2) {
  return String(Math.max(0, n)).padStart(len, '0');
}
function setNum(el, val) {
  if (el.textContent !== val) {
    el.classList.add('flip');
    setTimeout(() => { el.textContent = val; el.classList.remove('flip'); }, 80);
  }
}
function tick() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) {
    [cdDays, cdHours, cdMins, cdSecs].forEach((el, i) =>
      setNum(el, i === 0 ? '000' : '00')
    );
    return;
  }
  const s  = Math.floor(diff / 1000);
  setNum(cdDays,  pad(Math.floor(s / 86400), 3));
  setNum(cdHours, pad(Math.floor((s % 86400) / 3600)));
  setNum(cdMins,  pad(Math.floor((s % 3600) / 60)));
  setNum(cdSecs,  pad(s % 60));
}
tick();
setInterval(tick, 1000);

// ─────────────────────────────────────────
// 4. CALENDAR BUTTONS
// ─────────────────────────────────────────
function buildGCalLink(d) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text:   d.title,
    dates:  `${d.start}/${d.end}`,
    location: d.location,
    details:  d.description,
  });
  return `https://www.google.com/calendar/render?${p}`;
}
calBtn.href = buildGCalLink(CALENDAR);

// ICS download button
(function addICSBtn() {
  const btn = document.createElement('a');
  btn.className = 'btn btn-outline';
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Stáhnout .ics`;
  btn.href = '#';
  btn.addEventListener('click', e => {
    e.preventDefault();
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lukáš&Pája//CS',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@lukas-paja.cz`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g,'').slice(0,15)}Z`,
      `DTSTART:${CALENDAR.start}`,
      `DTEND:${CALENDAR.end}`,
      `SUMMARY:${CALENDAR.title}`,
      `DESCRIPTION:${CALENDAR.description}`,
      `LOCATION:${CALENDAR.location}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    Object.assign(document.createElement('a'), { href: url, download: 'lukas-paja-svatba.ics' }).click();
    URL.revokeObjectURL(url);
  });
  calBtn.parentNode.appendChild(btn);
})();

// ─────────────────────────────────────────
// 5. SCROLL ANIMATIONS
// ─────────────────────────────────────────
const aoObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      aoObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-aos], .timeline-item').forEach(el => aoObs.observe(el));

// Also trigger anything already visible on first load (e.g. hero items)
window.addEventListener('load', () => {
  document.querySelectorAll('[data-aos], .timeline-item').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });
});

// ─────────────────────────────────────────
// 6. RSVP FORM — Formspree integration
// ─────────────────────────────────────────
function validate(el) {
  const ok = el.checkValidity() && el.value.trim() !== '';
  el.classList.toggle('error', !ok);
  return ok;
}

rsvpForm && rsvpForm.addEventListener('submit', async e => {
  e.preventDefault();

  const fName     = rsvpForm.querySelector('#fname');
  const fEmail    = rsvpForm.querySelector('#femail');
  const fAttend   = rsvpForm.querySelector('#attending');
  if (![fName, fEmail, fAttend].map(validate).every(Boolean)) return;

  const payload = {
    jmeno:      fName.value.trim(),
    email:      fEmail.value.trim(),
    prijde:     fAttend.value === 'yes' ? 'ANO – přijde' : 'NE – nepřijde',
    pocet_osob: rsvpForm.querySelector('#guests').value,
    diety:      rsvpForm.querySelector('#dietary').value.trim() || '–',
    ubytovani:  rsvpForm.querySelector('#accom').value || '–',
    vzkaz:      rsvpForm.querySelector('#message').value.trim() || '–',
  };

  // Show loading state
  submitBtn.querySelector('.btn-text').hidden = true;
  submitBtn.querySelector('.btn-loading').hidden = false;
  submitBtn.disabled = true;

  // ── Send to Formspree ──────────────────────────
  // If FORMSPREE_ID is set, send via API
  if (FORMSPREE_ID && FORMSPREE_ID !== 'YOUR_FORMSPREE_ID') {
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Formspree error');
    } catch (err) {
      // Fallback: still show success, log error
      console.error('Formspree submit failed:', err);
    }
  } else {
    // No Formspree ID yet → save locally and warn in console
    console.warn('Formspree ID not configured. RSVP saved locally only.');
    console.info('Set up at https://formspree.io → replace FORMSPREE_ID in script.js');
    await new Promise(r => setTimeout(r, 800)); // simulate network
  }

  // Always persist locally as backup
  try {
    const list = JSON.parse(localStorage.getItem('rsvps') || '[]');
    list.push({ ...payload, ts: new Date().toISOString() });
    localStorage.setItem('rsvps', JSON.stringify(list));
  } catch (_) {}

  // Show success
  rsvpForm.style.transition = 'opacity 0.35s';
  rsvpForm.style.opacity = '0';
  setTimeout(() => {
    rsvpForm.hidden = true;
    rsvpSuccess.hidden = false;
    rsvpSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 350);
});

// Live validation feedback
rsvpForm && rsvpForm.querySelectorAll('input[required], select[required]').forEach(el => {
  el.addEventListener('blur',  () => validate(el));
  el.addEventListener('input', () => { if (el.classList.contains('error')) validate(el); });
});

// ─────────────────────────────────────────
// 7. PARALLAX — subtle hero topo layer
// ─────────────────────────────────────────
const topoLayer = document.querySelector('.hero-topo');
if (topoLayer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    topoLayer.style.transform = `translateY(${window.scrollY * 0.18}px)`;
  }, { passive: true });
}
