(function initAmalakQuoteFormSubmit() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById("formError");
  const submitBtnLabel = submitBtn ? submitBtn.textContent : "";

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
