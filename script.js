

// ===== Footer godina =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Smooth scroll za #ankere =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior:'smooth', block:'start' });
      // zatvori overlay ako je otvoren
      if (!menuOverlay.hasAttribute('hidden')) toggleOverlay(false);
    }
  });
});

// ===== Reveal on scroll =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
},{ threshold:0.12 });

document.querySelectorAll('.reveal, section .card, .case, .testimonial').forEach(el=>{
  el.classList.add('reveal'); io.observe(el);
});

// ===== Parallax valovi (ostavljeno, mirno) =====
const parallaxEls = document.querySelectorAll('[data-parallax]');
window.addEventListener('mousemove',(e)=>{
  const { innerWidth:w, innerHeight:h } = window;
  const x = (e.clientX - w/2) / w;
  const y = (e.clientY - h/2) / h;
  parallaxEls.forEach(el=>{
    const speed = parseFloat(el.getAttribute('data-parallax')) || 0;
    el.style.transform = `translate(${x*speed*200}px, ${y*speed*140}px)`;
  });
});



// ===== SIMPLE OVERLAY MENU =====
const openOverlayBtn = document.getElementById('openOverlay');
const overlayCloseBtn = document.getElementById('overlayClose');
const menuOverlay = document.getElementById('menuOverlay');

function isDesktop(){ return window.matchMedia('(min-width: 1024px)').matches; }

function toggleOverlay(open){
  if (!menuOverlay) return;
  if (open && !isDesktop()){
    menuOverlay.removeAttribute('hidden');
    openOverlayBtn?.setAttribute('aria-expanded','true');
    document.documentElement.classList.add('menu-open');
  } else {
    menuOverlay.setAttribute('hidden','');
    openOverlayBtn?.setAttribute('aria-expanded','false');
    document.documentElement.classList.remove('menu-open');
  }
}

// Sigurno stanje na load
document.addEventListener('DOMContentLoaded', ()=>{ toggleOverlay(false); });

// Gumb otvori/zatvori (mob)
openOverlayBtn && openOverlayBtn.addEventListener('click', ()=>{
  const willOpen = menuOverlay && menuOverlay.hasAttribute('hidden') && !isDesktop();
  toggleOverlay(willOpen);
});

// Close X
overlayCloseBtn && overlayCloseBtn.addEventListener('click', ()=> toggleOverlay(false));

// ESC zatvara
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape' && menuOverlay && !menuOverlay.hasAttribute('hidden')) toggleOverlay(false);
});

// Klik izvan panela zatvara (mobilni + tablet)
menuOverlay && menuOverlay.addEventListener('click', (e)=>{
  const panel = e.target.closest('.overlay-nav');
  const closeBtn = e.target.closest('#overlayClose');
  // ako klik nije na panelu ni gumbu — zatvori
  if (!panel && !closeBtn) toggleOverlay(false);
});

// Dodatno: klik bilo gdje izvan menija (npr. tamna pozadina)
document.addEventListener('click', (e)=>{
  if (!menuOverlay || menuOverlay.hasAttribute('hidden')) return;
  // ne zatvaraj ako se klik dogodio unutar menija ili na hamburger gumb
  if (!e.target.closest('.overlay-nav') && !e.target.closest('#openOverlay')) {
    toggleOverlay(false);
  }
}, true); // true = capture faza, reagira prije linkova unutar overlay-a

// Resize: prelazak na desktop zatvara
window.addEventListener('resize', ()=>{ if (isDesktop()) toggleOverlay(false); });


// ===== ACTIVE NAV STATE (aria-current) =====
(function markActiveNav(){
  const links = document.querySelectorAll('.nav-links a, .overlay-nav a');
  const here = window.location.pathname.replace(/\/index\.html$/,'/');
  links.forEach(a=>{
    const href = a.getAttribute('href'); if(!href) return;
    const url = new URL(href, window.location.origin + window.location.pathname);
    const path = url.pathname.replace(/\/index\.html$/,'/');
    if (path === here) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });
})();



// === CONTACT FORM (fancy floating labels + EmailJS) =======================
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = document.getElementById('contactStatus');
  const fields = Array.from(form.querySelectorAll('.fancy-input__field'));

  // Helperi
  const setHasValue = (input) => {
    const wrap = input.closest('.fancy-input');
    if (!wrap) return;
    if (input.value && String(input.value).trim().length > 0) {
      wrap.classList.add('has-value');
    } else {
      wrap.classList.remove('has-value');
    }
  };

  const setInvalid = (input, invalid) => {
    const wrap = input.closest('.fancy-input');
    if (!wrap) return;
    wrap.classList.toggle('is-invalid', invalid);
  };

  // Inicijalizacija (autofill / back nav)
  fields.forEach((el) => {
    setHasValue(el);
    el.addEventListener('input', () => {
      setHasValue(el);
      setInvalid(el, !el.checkValidity());
    });
    el.addEventListener('blur', () => {
      setInvalid(el, !el.checkValidity());
    });
  });

  // SUBMIT
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // simple validacija
    let ok = true;
    fields.forEach((el) => {
      const invalid = !el.checkValidity() || !String(el.value).trim();
      setInvalid(el, invalid);
      if (invalid) ok = false;
    });

    if (!ok) {
      if (statusEl) statusEl.textContent = 'Please check the highlighted fields.';
      return;
    }

    if (!statusEl) return;
    statusEl.textContent = 'Sending your message...';

    // OVDJE VUČEMO PODATKE IZ TVOG FORMA
    const templateParams = {
      from_name: form.name.value,          // <input name="name">
      from_email: form.email.value,        // <input name="email">
      company_niche: form.niche.value,     // <input name="niche">
      message: form.message.value          // <textarea name="message">
    };

    // zamijeni sa svojim EmailJS ID-ovima
    emailjs
      .send('service_qkje798', 'template_609yrqz', templateParams)
      .then(() => {
        statusEl.textContent = 'Thank you! Your message has been sent.';
        form.reset();
        fields.forEach((el) => {
          setHasValue(el);
          setInvalid(el, false);
        });
      })
      .catch((error) => {
        console.error('EmailJS error:', error);
        statusEl.textContent = 'Something went wrong. Please try again.';
      });
  });

  // Reset
  form.addEventListener('reset', () => {
    setTimeout(() => {
      if (statusEl) statusEl.textContent = '';
      fields.forEach((el) => {
        setHasValue(el);
        setInvalid(el, false);
      });
    }, 0);
  });
})();


/// === FOOTER CONTACT FORM ===
(function () {
  // KONFIGURACIJA ZA FOOTER FORM
  const FOOTER_SERVICE_ID = "service_4oxl4le";
  const FOOTER_TEMPLATE_ID = "template_nxzyvpq";

  // Inicijalizacija footera
  function setupFooterContactForm() {
    const form = document.getElementById("footerContactForm");
    if (!form) return;

    const emailInput = document.getElementById("footerContactEmail");
    const nicheInput = document.getElementById("footerCompanyNiche");
    const statusEl = document.getElementById("footerContactStatus");
    const submitBtn = form.querySelector(".footer-contact-btn");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      clearFooterValidation(form);
      updateFooterStatus(statusEl, "", "");

      const email = emailInput.value.trim();
      const niche = nicheInput.value.trim();

      let hasError = false;

      if (!email || !validateEmail(email)) {
        markFooterFieldInvalid(emailInput);
        hasError = true;
      }

      if (!niche) {
        markFooterFieldInvalid(nicheInput);
        hasError = true;
      }

      if (hasError) {
        updateFooterStatus(
          statusEl,
          "Please check the fields above and try again.",
          "error"
        );
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      const templateParams = {
        // ova imena moraju biti ista kao u EmailJS templateu
        footer_email: email,
        footer_company_niche: niche,
      };

      if (typeof emailjs === "undefined") {
        console.error("emailjs is not loaded");
        updateFooterStatus(
          statusEl,
          "Form error. Please try again later.",
          "error"
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send message";
        }
        return;
      }

      emailjs
        .send(FOOTER_SERVICE_ID, FOOTER_TEMPLATE_ID, templateParams)
        .then(
          function () {
            updateFooterStatus(
              statusEl,
              "Thank you! Your message has been sent.",
              "success"
            );
            form.reset();
          },
          function (error) {
            console.error("Footer form error:", error);
            updateFooterStatus(
              statusEl,
              "Something went wrong. Please try again later.",
              "error"
            );
          }
        )
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send message";
          }
        });
    });
  }

  // === POMOĆNE FUNKCIJE – lokalne u IIFE-u ===

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function markFooterFieldInvalid(inputEl) {
    const wrapper = inputEl.closest(".footer-contact-input");
    if (wrapper) {
      wrapper.classList.add("is-invalid");
    }
  }

  function clearFooterValidation(form) {
    const invalidFields = form.querySelectorAll(
      ".footer-contact-input.is-invalid"
    );
    invalidFields.forEach(function (field) {
      field.classList.remove("is-invalid");
    });
  }

  function updateFooterStatus(el, message, type) {
    if (!el) return;
    el.textContent = message || "";
    el.classList.remove(
      "footer-contact-status--error",
      "footer-contact-status--success"
    );

    if (type === "error") {
      el.classList.add("footer-contact-status--error");
    } else if (type === "success") {
      el.classList.add("footer-contact-status--success");
    }
  }

  // pokretanje nakon učitavanja DOM-a
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupFooterContactForm);
  } else {
    setupFooterContactForm();
  }
})();
