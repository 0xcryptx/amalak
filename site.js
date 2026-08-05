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

    /* Click-to-enlarge gallery lightbox for the full portfolio grid.
       Each card represents a whole project; PORTFOLIO_GALLERIES (loaded via
       gallery-data.js) supplies every photo for that project so the modal
       can page through them instead of showing just the card's cover shot. */
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Close">&times;</button>' +
      '<figure class="lightbox__figure">' +
      '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>' +
      '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>' +
      '<img class="lightbox__img" src="" alt="" />' +
      '<figcaption class="lightbox__caption">' +
      '<span class="lightbox__tag"></span>' +
      '<h3 class="lightbox__title"></h3>' +
      '<p class="lightbox__subcaption"></p>' +
      '<p class="lightbox__counter"></p>' +
      "</figcaption>" +
      "</figure>";
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector(".lightbox__img");
    var lbTag = lightbox.querySelector(".lightbox__tag");
    var lbTitle = lightbox.querySelector(".lightbox__title");
    var lbSubcaption = lightbox.querySelector(".lightbox__subcaption");
    var lbCounter = lightbox.querySelector(".lightbox__counter");
    var lbClose = lightbox.querySelector(".lightbox__close");
    var lbPrev = lightbox.querySelector(".lightbox__nav--prev");
    var lbNext = lightbox.querySelector(".lightbox__nav--next");
    var lastFocused = null;

    var galleryImages = [];
    var galleryIndex = 0;
    var galleryTag = "";
    var galleryTitle = "";

    function preload(src) {
      if (!src) return;
      var im = new Image();
      im.src = src;
    }

    function renderSlide() {
      var total = galleryImages.length;
      var current = galleryImages[galleryIndex];
      if (!current) return;
      lbImg.src = current.src;
      lbImg.alt = current.alt || "";
      lbTag.textContent = galleryTag;
      lbTitle.textContent = galleryTitle;
      lbSubcaption.textContent = current.caption || "";
      lbSubcaption.hidden = !current.caption;
      lbCounter.textContent = total > 1 ? galleryIndex + 1 + " / " + total : "";
      lightbox.classList.toggle("lightbox--single", total <= 1);
      if (total > 1) {
        preload(galleryImages[(galleryIndex + 1) % total].src);
        preload(galleryImages[(galleryIndex - 1 + total) % total].src);
      }
    }

    function showRelative(delta) {
      var total = galleryImages.length;
      if (total <= 1) return;
      galleryIndex = (galleryIndex + delta + total) % total;
      renderSlide();
    }

    function openLightbox(card) {
      var tag = card.querySelector(".portfolio-card__tag");
      var title = card.querySelector(".portfolio-card__label h3");
      var slug = card.getAttribute("data-project");
      var gallery = slug && window.PORTFOLIO_GALLERIES ? window.PORTFOLIO_GALLERIES[slug] : null;

      galleryTag = tag ? tag.textContent : "";
      if (gallery && gallery.images && gallery.images.length) {
        galleryImages = gallery.images;
        galleryTitle = gallery.title || (title ? title.textContent : "");
      } else {
        var img = card.querySelector("img");
        if (!img) return;
        galleryImages = [{ src: img.currentSrc || img.src, alt: img.alt || "" }];
        galleryTitle = title ? title.textContent : "";
      }
      galleryIndex = 0;
      renderSlide();

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

    lbPrev.addEventListener("click", function (e) {
      e.stopPropagation();
      showRelative(-1);
    });
    lbNext.addEventListener("click", function (e) {
      e.stopPropagation();
      showRelative(1);
    });
    lbClose.addEventListener("click", function (e) {
      e.stopPropagation();
      closeLightbox();
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lbImg) return; /* clicking the photo itself keeps it open */
      closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showRelative(-1);
      if (e.key === "ArrowRight") showRelative(1);
    });
  }

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
