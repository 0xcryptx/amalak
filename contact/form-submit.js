(function initAmalakQuoteFormSubmit() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById("formError");
  const submitBtnLabel = submitBtn ? submitBtn.textContent : "";
  const countdownEl = document.getElementById("successCountdown");
  let countdownInterval = null;

  const RESET_SECONDS = 3;

  function resetToEditable() {
    clearInterval(countdownInterval);
    if (countdownEl) countdownEl.textContent = "";
    form.reset();
    form.classList.remove("is-submitted");
    if (errorEl) errorEl.hidden = true;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtnLabel;
    }
  }

  function startResetCountdown() {
    clearInterval(countdownInterval);
    let secondsLeft = RESET_SECONDS;

    function tick() {
      if (!countdownEl) return;
      countdownEl.textContent =
        "This form will reset for a new request in " + secondsLeft + "s…";
    }

    tick();
    countdownInterval = setInterval(function () {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        resetToEditable();
      } else {
        tick();
      }
    }, 1000);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (errorEl) errorEl.hidden = true;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data && result.data.success) {
          form.classList.add("is-submitted");
          startResetCountdown();
        } else {
          throw new Error((result.data && result.data.message) || "Submission failed");
        }
      })
      .catch(function () {
        if (errorEl) errorEl.hidden = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtnLabel;
        }
      });
  });
})();
