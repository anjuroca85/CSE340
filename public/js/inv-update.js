"use strict";

const form = document.querySelector("#updateForm");
if (form) {
  const updateBtn = form.querySelector("button[type='submit']");
  if (updateBtn) {
    form.addEventListener("change", function () {
      updateBtn.removeAttribute("disabled");
    });
  }
}
