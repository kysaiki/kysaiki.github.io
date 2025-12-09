// js/main.js
import { allProjects } from "./projects-data.js";
import { initProjects } from "./projects.js";
import { initOverlay } from "./overlay.js";
import { initCvDownloads } from "./cv-downloads.js";

document.addEventListener("DOMContentLoaded", () => {
  const projectState = initProjects(allProjects);
  const overlayAPI   = initOverlay(projectState);
  initCvDownloads();

  // Global keyboard handler:
  window.addEventListener("keydown", (e) => {
    const key = e.key;

    // If overlay is open, Esc closes it and other keys are ignored
    if (overlayAPI && overlayAPI.isOpen && overlayAPI.isOpen()) {
      if (key === "Escape") {
        e.preventDefault();
        overlayAPI.close();
      }
      return;
    }

    // Otherwise, let the project module handle arrow keys
    if (projectState && projectState.handleKeydown) {
      projectState.handleKeydown(e);
    }
  });
});
