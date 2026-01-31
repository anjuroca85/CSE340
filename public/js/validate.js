document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", () => {
      form.classList.add("was-validated");
    });
  });
});
