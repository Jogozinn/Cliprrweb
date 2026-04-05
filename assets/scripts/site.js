document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    const setMobileMenu = (open) => {
      mobileToggle.setAttribute("aria-expanded", String(open));
      mobilePanel.hidden = !open;
      mobilePanel.classList.toggle("is-open", open);
    };

    setMobileMenu(false);

    mobileToggle.addEventListener("click", () => {
      const open = mobileToggle.getAttribute("aria-expanded") !== "true";
      setMobileMenu(open);
    });

    mobilePanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMobileMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMobileMenu(false);
      }
    });
  }

  document.querySelectorAll("[data-video-launch]").forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.getAttribute("data-video-src");
      if (!src) return;

      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = "Cliprr product walkthrough";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      iframe.loading = "lazy";
      button.replaceWith(iframe);
    });
  });
});
