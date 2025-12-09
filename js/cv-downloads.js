// js/cv-downloads.js
// ========== CV / RESUME DOWNLOAD HANDLERS ==========

export function initCvDownloads() {
  const buttons = document.querySelectorAll(".cv-download");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.remove("cv-download--animating");
      // force reflow so animation can retrigger
      // eslint-disable-next-line no-unused-expressions
      btn.offsetWidth;
      btn.classList.add("cv-download--animating");

      const file = btn.getAttribute("data-file");
      if (!file) return;

      const link = document.createElement("a");
      link.href = file;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    });

    btn.addEventListener("animationend", () => {
      btn.classList.remove("cv-download--animating");
    });
  });
}
