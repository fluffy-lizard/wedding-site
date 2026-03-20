/* ===================================================
   WEDDING WEBSITE — script.js
   Lukáš & Pája · 11. července 2026
   Safari / iOS compatible
   =================================================== */

var EMAILJS_PUBLIC_KEY  = 'xr4cyuqJHYioPTdTn';
var EMAILJS_SERVICE_ID  = 'service_g1shzho';
var EMAILJS_TEMPLATE_ID = 'template_x3jgcgg';

/* ===================================================
   SMOOTH SCROLL
   CSS scroll-behavior is ignored by iOS Safari in many cases.
   This JS handler covers all anchor clicks reliably.
   =================================================== */
function smoothScrollTo(id) {
  var target = document.querySelector(id);
  if (!target) return;
  var navH = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 0;
  var top = target.getBoundingClientRect().top + window.pageYOffset - navH;
  try {
    window.scrollTo({ top: top, behavior: 'smooth' });
  } catch (e) {
    window.scrollTo(0, top);
  }
}

/* ===================================================
   DARK MODE
   =================================================== */
function applyDark(isDark) {
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('wedding-dark', isDark ? '1' : '0');
}

/* ===================================================
   NAV
   =================================================== */
function initNav() {
  var nav       = document.querySelector('.nav');
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');

  if (!nav || !hamburger || !mobileMenu) return;

  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.pageYOffset > 40);
  }, { passive: true });

  hamburger.addEventListener('click', function() {
    var open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Intercept all anchor links — fixes iOS Safari smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var href = a.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        smoothScrollTo(href);
      }
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', function(e) {
    if (!nav.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===================================================
   COUNTDOWN
   Fixes:
   - Date.UTC() instead of ISO string (avoids NaN on old Safari)
   - Manual pad() — String.padStart() absent on Safari < 10
   - Date.now() instead of new Date() subtraction
   =================================================== */
function initCountdown() {
  // 11 July 2026 11:00 CEST = 09:00 UTC
  var weddingTs = Date.UTC(2026, 6, 11, 9, 0, 0);

  var daysEl  = document.getElementById('cd-days');
  var hoursEl = document.getElementById('cd-hours');
  var minsEl  = document.getElementById('cd-mins');
  var secsEl  = document.getElementById('cd-secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function pad(n) {
    var s = String(Math.max(0, Math.floor(n)));
    return s.length < 2 ? '0' + s : s;
  }

  function tick() {
    var diff = weddingTs - Date.now();
    if (diff <= 0) {
      daysEl.textContent  = '0';
      hoursEl.textContent = '00';
      minsEl.textContent  = '00';
      secsEl.textContent  = '00';
      return;
    }
    var totalSec = Math.floor(diff / 1000);
    daysEl.textContent  = String(Math.floor(totalSec / 86400));
    hoursEl.textContent = pad(Math.floor((totalSec % 86400) / 3600));
    minsEl.textContent  = pad(Math.floor((totalSec % 3600) / 60));
    secsEl.textContent  = pad(totalSec % 60);
  }

  tick();
  setInterval(tick, 1000);
}

/* ===================================================
   ICS DOWNLOAD
   =================================================== */
function downloadICS() {
  var now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  var lines = [
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
    'SUMMARY:Svatba Luk\u00e1\u0161 & P\u00e1ja \ud83d\udc8d',
    'DESCRIPTION:Ob\u0159ad v 11:00 (venku za hezk\u00e9ho po\u010das\u00ed).\\nOb\u011bd ve 12:00.\\nPros\u00edme bez zv\u00ed\u0159at.',
    'LOCATION:\u0160kola na Vsi\\, Kun\u010dina Ves 61\\, 516 01 Zdobnice',
    'GEO:50.2236725;16.3832923',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  var icsContent = lines.join('\r\n');
  var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  var url  = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href     = url;
  link.download = 'lukas-paja-svatba.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function() { URL.revokeObjectURL(url); }, 10000);
}

/* ===================================================
   RSVP FORM
   =================================================== */
function initRSVP() {
  // :has() fallback — add .checked class for Safari < 15.4
  document.querySelectorAll('.radio-label input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      document.querySelectorAll('.radio-label').forEach(function(lbl) {
        lbl.classList.remove('checked');
      });
      if (radio.checked) {
        radio.closest('.radio-label').classList.add('checked');
      }
    });
  });

  var btn = document.getElementById('rsvpSubmit');
  if (btn) btn.addEventListener('click', handleRSVP);
}

function handleRSVP() {
  var nameEl     = document.getElementById('rsvpName');
  var attending  = document.querySelector('input[name="attending"]:checked');
  var guestsEl   = document.getElementById('rsvpGuests');
  var messageEl  = document.getElementById('rsvpDiet');

  var name    = nameEl ? nameEl.value.trim() : '';
  var guests  = guestsEl ? guestsEl.value : '1';
  var message = messageEl ? messageEl.value.trim() : '';

  if (!name) {
    if (nameEl) {
      nameEl.style.borderColor = '#c0392b';
      nameEl.focus();
      nameEl.addEventListener('input', function() { nameEl.style.borderColor = ''; }, { once: true });
    }
    return;
  }
  if (!attending) {
    alert('Pros\u00edme vyberte, zda se z\u00fa\u010dastn\u00edte.');
    return;
  }

  var btn = document.getElementById('rsvpSubmit');
  if (btn) { btn.disabled = true; btn.textContent = 'Odes\u00edl\u00e1m\u2026'; }

  var params = {
    name:      name,
    attending: attending.value === 'yes' ? 'Ano, p\u0159ijdu!' : 'Bohužel se nez\u00fa\u010dastn\u00edm',
    guests:    guests || '1',
    message:   message || '(\u017e\u00e1dn\u00fd vzkaz)'
  };

  var sendPromise;
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    sendPromise = emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
  } else {
    sendPromise = new Promise(function(resolve) { setTimeout(resolve, 800); });
    console.log('RSVP (demo):', params);
  }

  sendPromise.then(function() {
    var form    = document.getElementById('rsvpForm');
    var success = document.getElementById('rsvpSuccess');
    if (form)    form.style.display = 'none';
    if (success) {
      // Use class toggle — not .hidden — for Safari compatibility
      success.classList.add('is-visible');
      try { success.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      catch(e) { success.scrollIntoView(false); }
    }
  }).catch(function(err) {
    console.error('EmailJS error:', err);
    if (btn) { btn.disabled = false; btn.textContent = 'Odeslat potvrzen\u00ed'; }
    alert('Odesl\u00e1n\u00ed selhalo. Zkuste to pros\u00edm znovu nebo n\u00e1s kontaktujte p\u0159\u00edmo.');
  });
}

/* ===================================================
   FAQ ACCORDION
   Fixes:
   - Does NOT use el.hidden (Safari can ignore .hidden = false when CSS has display:none)
   - Uses el.style.display = 'block' / 'none' directly
   =================================================== */
function initFAQ() {
  var buttons = document.querySelectorAll('.faq-q');

  // Ensure all answers start hidden via inline style
  buttons.forEach(function(btn) {
    var answer = btn.nextElementSibling;
    if (answer) {
      answer.style.display = 'none';
      answer.removeAttribute('hidden'); // remove HTML attr so only CSS/JS controls it
    }
  });

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      buttons.forEach(function(b) {
        b.setAttribute('aria-expanded', 'false');
        var a = b.nextElementSibling;
        if (a) a.style.display = 'none';
      });

      // Toggle open if it was closed
      if (!isExpanded) {
        btn.setAttribute('aria-expanded', 'true');
        var answer = btn.nextElementSibling;
        if (answer) answer.style.display = 'block';
      }
    });
  });
}

/* ===================================================
   SCROLL REVEAL
   Fixes the broken double-observer IIFE pattern in the
   original which silently prevented elements from ever
   becoming visible on iOS Safari.
   =================================================== */
function initScrollReveal() {
  var selectors = [
    '.section-label', '.section-title', '.about-text', '.about-photos',
    '.timeline-item', '.info-card', '.faq-item', '.rsvp-form-wrap',
    '.rsvp-subtitle', '.map-wrapper'
  ];
  var targets = document.querySelectorAll(selectors.join(', '));

  // No IntersectionObserver support — just show everything
  if (typeof IntersectionObserver === 'undefined') {
    for (var i = 0; i < targets.length; i++) {
      targets[i].classList.add('reveal', 'visible');
    }
    return;
  }

  for (var j = 0; j < targets.length; j++) {
    targets[j].classList.add('reveal');
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  for (var k = 0; k < targets.length; k++) {
    observer.observe(targets[k]);
  }
}

/* ===================================================
   PARALLAX — disabled on iOS (causes jank + battery drain)
   =================================================== */
function initParallax() {
  var heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  // Detect iOS / iPadOS
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', function() {
    if (window.pageYOffset < window.innerHeight) {
      heroBg.style.webkitTransform = 'translateY(' + (window.pageYOffset * 0.3) + 'px)';
      heroBg.style.transform = 'translateY(' + (window.pageYOffset * 0.3) + 'px)';
    }
  }, { passive: true });
}

/* ===================================================
   INIT
   =================================================== */
document.addEventListener('DOMContentLoaded', function() {
  // Dark mode
  var savedDark  = localStorage.getItem('wedding-dark');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyDark(savedDark !== null ? savedDark === '1' : prefersDark);

  var darkToggle = document.getElementById('darkToggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', function() {
      applyDark(!document.body.classList.contains('dark'));
    });
  }

  var addCalBtn = document.getElementById('addCalBtn');
  if (addCalBtn) addCalBtn.addEventListener('click', downloadICS);

  initNav();
  initCountdown();
  initRSVP();
  initFAQ();
  initScrollReveal();
  initParallax();
});
