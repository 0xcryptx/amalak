/* AMALAK — lightweight site interactions (no dependencies) */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var body = document.body;

  /* Scroll-progress bar attached to the bottom of the navbar */
  var progressFill = null;
  if (header) {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    progressFill = document.createElement("i");
    bar.appendChild(progressFill);
    header.appendChild(bar);
  }

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
    if (progressFill) {
      var st = window.scrollY || document.documentElement.scrollTop;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var p = docH > 0 ? Math.min(1, Math.max(0, st / docH)) : 0;
      progressFill.style.transform = "scaleX(" + p + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  if (toggle) {
    function closeNav() {
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("click", function (e) {
      if (body.classList.contains("nav-open") && header && !header.contains(e.target)) {
        closeNav();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) closeNav();
    });
  }

  /* Reveal-on-scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Portfolio filter (portfolio page only) */
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    var buttons = filterBar.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".portfolio-card");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      buttons.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var filter = btn.getAttribute("data-filter");
      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
      });
    });

    /* Click-to-enlarge lightbox for the full portfolio grid */
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.innerHTML =
      '<figure class="lightbox__figure">' +
      '<button type="button" class="lightbox__close" aria-label="Close">&times;</button>' +
      '<img class="lightbox__img" src="" alt="" />' +
      '<figcaption class="lightbox__caption">' +
      '<span class="lightbox__tag"></span>' +
      '<h3 class="lightbox__title"></h3>' +
      "</figcaption>" +
      "</figure>";
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector(".lightbox__img");
    var lbTag = lightbox.querySelector(".lightbox__tag");
    var lbTitle = lightbox.querySelector(".lightbox__title");
    var lbClose = lightbox.querySelector(".lightbox__close");
    var lastFocused = null;

    function openLightbox(card) {
      var img = card.querySelector("img");
      var tag = card.querySelector(".portfolio-card__tag");
      var title = card.querySelector(".portfolio-card__label h3");
      if (!img) return;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      lbTag.textContent = tag ? tag.textContent : "";
      lbTitle.textContent = title ? title.textContent : "";
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      body.classList.add("lightbox-open");
      lbClose.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      body.classList.remove("lightbox-open");
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    cards.forEach(function (card) {
      if (card.tagName === "A") return; /* teaser cards keep their link behavior */
      card.classList.add("portfolio-card--clickable");
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.addEventListener("click", function () { openLightbox(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(card);
        }
      });
    });

    lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
