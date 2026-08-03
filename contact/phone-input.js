(function initAmalakContactIntlPhone() {
  const phoneInput = document.getElementById("contact-phone");
  const intlTelUtilsCdn = "https://cdn.jsdelivr.net/npm/intl-tel-input@27.0.0/dist/js/utils.js";
  if (!phoneInput || typeof window.intlTelInput !== "function") return;

  const narrowPopup = () => window.matchMedia("(max-width: 600px)").matches;
  const instance = window.intlTelInput(phoneInput, {
    initialCountry: "ae",
    preferredCountries: ["ae", "gb", "us", "sa", "in"],
    separateDialCode: true,
    nationalMode: true,
    loadUtils: () => import(intlTelUtilsCdn),
    autoPlaceholder: "aggressive",
    placeholderNumberType: "MOBILE",
    formatAsYouType: true,
    formatOnDisplay: true,
    strictMode: true,
    countrySearch: true,
    ...(narrowPopup() ? { useFullscreenPopup: false } : {}),
  });
  window.amalakPhoneIti = instance;

  function updatePhoneInputOffset() {
    const itiWrap = phoneInput.closest(".iti");
    const selected = itiWrap && itiWrap.querySelector(".iti__selected-country");
    if (!itiWrap || !selected) return;
    const measured = Math.ceil(selected.getBoundingClientRect().width);
    const offset = measured + 26;
    itiWrap.style.setProperty("--phone-input-offset", offset + "px");
  }

  function pinUaeToTop() {
    const listEl = phoneInput.closest(".iti")?.querySelector(".iti__country-list");
    if (!listEl) return;
    const uae = listEl.querySelector('.iti__country[data-country-code="ae"]');
    if (!uae) return;
    listEl.querySelector(".iti__divider")?.remove();
    if (listEl.firstElementChild !== uae) listEl.insertBefore(uae, listEl.firstElementChild);
  }

  function syncDropdownHighlight() {
    if (!instance || !phoneInput) return;
    const iso2 = instance.getSelectedCountryData()?.iso2;
    const itiWrap = phoneInput.closest(".iti");
    const listEl = itiWrap?.querySelector(".iti__country-list");
    const selectedBtn = itiWrap?.querySelector(".iti__selected-country");
    if (!iso2 || !listEl || !selectedBtn) return;
    const target = listEl.querySelector('.iti__country[data-country-code="' + iso2 + '"]');
    if (!target) return;
    listEl.querySelectorAll(".iti__country.iti__highlight").forEach((li) => {
      li.classList.remove("iti__highlight");
      li.setAttribute("aria-selected", "false");
    });
    target.classList.add("iti__highlight");
    target.setAttribute("aria-selected", "true");
    selectedBtn.setAttribute("aria-activedescendant", target.getAttribute("id") || "");
    target.scrollIntoView({ block: "nearest", behavior: "auto" });
  }

  function removeItiNativeHoverTooltips() {
    const itiWrap = phoneInput.closest(".iti");
    if (!itiWrap) return;
    itiWrap.querySelectorAll("[title]").forEach((el) => el.removeAttribute("title"));
  }

  if (instance.promise && typeof instance.promise.then === "function") {
    instance.promise.then(() => {
      updatePhoneInputOffset();
      pinUaeToTop();
      removeItiNativeHoverTooltips();
    });
  }
  setTimeout(() => {
    updatePhoneInputOffset();
    pinUaeToTop();
    removeItiNativeHoverTooltips();
  }, 0);

  phoneInput.addEventListener("countrychange", () => {
    window.requestAnimationFrame(() => {
      updatePhoneInputOffset();
      pinUaeToTop();
      removeItiNativeHoverTooltips();
    });
  });
  window.addEventListener("resize", updatePhoneInputOffset);

  const selCountry = phoneInput.closest(".iti")?.querySelector(".iti__selected-country");
  if (selCountry) {
    selCountry.addEventListener("click", () => {
      setTimeout(() => {
        pinUaeToTop();
        removeItiNativeHoverTooltips();
      }, 0);
    });
  }

  phoneInput.addEventListener("open:countrydropdown", () => {
    window.requestAnimationFrame(() => {
      syncDropdownHighlight();
      removeItiNativeHoverTooltips();
    });
  });

  const contactFormEl = phoneInput.closest("form");
  if (contactFormEl) {
    contactFormEl.addEventListener("reset", () => {
      setTimeout(() => {
        instance.setNumber("");
        instance.setCountry("ae");
        updatePhoneInputOffset();
      }, 0);
    });

    // Fold the selected country's dial code into the field value so the
    // mailed message includes the full international number.
    contactFormEl.addEventListener("submit", () => {
      if (!window.intlTelInput?.utils) return;
      const full = instance.getNumber(window.intlTelInput.utils.numberFormat.INTERNATIONAL);
      if (full) phoneInput.value = full;
    });
  }
})();
