document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", () => {
      const open = mobilePanel.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", String(open));
    });
  }

  const page = document.body.getAttribute("data-page");
  if (page) {
    document.querySelectorAll("[data-page-link]").forEach((link) => {
      if (link.getAttribute("data-page-link") === page) {
        link.setAttribute("aria-current", "page");
      }
    });
  }
});
