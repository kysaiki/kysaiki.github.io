// js/overlay.js
// ========== DETAIL OVERLAY (BIO / PROJECTS) ==========

export function initOverlay(projectState) {
  const { getSectionState } = projectState;
  const { sectionBio, sectionProjects } = getSectionState();

  const bottomRightCorner = document.querySelector(".corner--bottom-right");
  const overlayEl         = document.getElementById("detail-overlay");
  const overlayBodyEl     = document.getElementById("detail-overlay-body");
  const overlayCloseBtn   = document.querySelector(".detail-overlay__close");
  const overlayBackdrop   = document.querySelector(".detail-overlay__backdrop");
  const overlayContentEl  = document.querySelector(".detail-overlay__content");

  let overlayOpen = false;
  let currentProject = null;

  // Track current project from projects.js
  window.addEventListener("projectChange", (e) => {
    currentProject = e.detail.project || null;

    // If overlay is already open on Projects, live-update content
    if (overlayOpen && sectionProjects && sectionProjects.checked) {
      renderProjectOverlayContent();
    }
  });

  // ---------- OVERLAY CONTENT RENDERERS ----------

  function isBioOrProjectsActive() {
    return (sectionBio && sectionBio.checked) ||
           (sectionProjects && sectionProjects.checked);
  }

  function renderBioOverlayContent() {
    if (!overlayBodyEl) return;
    overlayBodyEl.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "overlay-section overlay-section--bio";

    const title = document.createElement("h2");
    title.textContent = "More About Me";
    title.className = "overlay-title";
    wrapper.appendChild(title);

    const intro = document.createElement("p");
    intro.className = "overlay-text";
    intro.textContent =
      "I'm a game programmer and tools engineer who likes building systems that make other developers faster and happier.";
    wrapper.appendChild(intro);

    const timelineTitle = document.createElement("h3");
    timelineTitle.textContent = "Journey So Far";
    timelineTitle.className = "overlay-subtitle";
    wrapper.appendChild(timelineTitle);

    const timeline = document.createElement("ul");
    timeline.className = "overlay-timeline";

    const entries = [
      {
        label: "2024 — USC",
        text: "Graduated from the University of Southern California with a B.S. in Computer Science (Games)."
      },
      {
        label: "2024–2025 — Visual Concepts & Gearbox",
        text: "Rotations on internal tools, pipelines, and gameplay-support systems across multiple AAA studios."
      },
      {
        label: "Now — 2K Games Engineering Grad Program",
        text: "Focusing on Unreal Engine tools, automation, and workflows that support large production teams."
      }
    ];

    entries.forEach(({ label, text }) => {
      const li = document.createElement("li");
      li.className = "overlay-timeline__item";

      const badge = document.createElement("div");
      badge.className = "overlay-timeline__label";
      badge.textContent = label;

      const body = document.createElement("p");
      body.className = "overlay-timeline__text";
      body.textContent = text;

      li.appendChild(badge);
      li.appendChild(body);
      timeline.appendChild(li);
    });

    wrapper.appendChild(timeline);

    const now = document.createElement("p");
    now.className = "overlay-text overlay-text--muted";
    now.textContent =
      "When I’m not working on tools or gameplay, I’m usually experimenting in the kitchen, sketching, or bouldering.";
    wrapper.appendChild(now);

    overlayBodyEl.appendChild(wrapper);
  }

  function renderProjectOverlayContent() {
    if (!overlayBodyEl) return;
    overlayBodyEl.innerHTML = "";

    // No project selected yet (should be rare, but safe)
    if (!currentProject) {
      const msg = document.createElement("p");
      msg.textContent = "No project selected.";
      overlayBodyEl.appendChild(msg);
      return;
    }

    // Use explicit overlayTemplateId if present, otherwise fall back to overlay-{id}
    const templateId =
      currentProject.overlayTemplateId || `overlay-${currentProject.id}`;

    const tpl = document.getElementById(templateId);
    if (!tpl) {
      const msg = document.createElement("p");
      msg.textContent = "Detailed view coming soon.";
      overlayBodyEl.appendChild(msg);
      return;
    }

    const clone = tpl.content.cloneNode(true);
    overlayBodyEl.appendChild(clone);
  }

  function renderOverlayContent() {
    if (!isBioOrProjectsActive()) return;

    if (sectionBio && sectionBio.checked) {
      renderBioOverlayContent();
    } else if (sectionProjects && sectionProjects.checked) {
      renderProjectOverlayContent();
    }
  }

  // ---------- DETAIL OVERLAY HELPERS ----------

  function getActivePanel() {
    if (!bottomRightCorner) return null;
    const panels = bottomRightCorner.querySelectorAll(".panel");
    for (const panel of panels) {
      const style = window.getComputedStyle(panel);
      if (style.display !== "none") {
        return panel;
      }
    }
    return null;
  }

  function openDetailOverlay() {
    if (!overlayEl || overlayOpen) return;

    // Only open overlay / animate description when on Bio or Projects
    if (!isBioOrProjectsActive()) return;

    const activePanel = getActivePanel();
    if (!activePanel) return;

    overlayOpen = true;

    // NEW: broadcast that overlay is now open
    window.dispatchEvent(
      new CustomEvent("overlayOpenChange", { detail: { open: true } })
    );

    // Animate panel out to the right
    activePanel.classList.add("panel--exit-right");

    // After the panel finishes its exit animation, show overlay with appropriate content
    setTimeout(() => {
      if (!overlayEl) return;

      renderOverlayContent();
      overlayEl.classList.add("detail-overlay--visible");
    }, 200); // matches CSS transition
  }

  function closeDetailOverlay() {
    if (!overlayEl || !overlayOpen) return;
    overlayOpen = false;

    // NEW: broadcast that overlay is now closed
    window.dispatchEvent(
      new CustomEvent("overlayOpenChange", { detail: { open: false } })
    );

    overlayEl.classList.remove("detail-overlay--visible");

    // Remove exit class from active panel so it fades back in
    const activePanel = getActivePanel();
    if (activePanel) {
      activePanel.classList.remove("panel--exit-right");
    }
  }

  // ---------- BIND OVERLAY EVENTS ----------

  if (bottomRightCorner) {
    // Open on click (only when bio/projects)
    bottomRightCorner.addEventListener("click", (e) => {
      const target = e.target;

      // Ignore clicks on obvious interactive elements inside
      if (
        target.closest(".contact-icon") ||
        target.closest(".cv-download") ||
        target.closest(".projects-nav") ||
        target.closest(".projects-filter-root") ||
        target === overlayCloseBtn
      ) {
        return;
      }
      openDetailOverlay();
    });

    // Open on hover (only when bio/projects)
    bottomRightCorner.addEventListener("mouseenter", () => {
      if (!overlayOpen) {
        openDetailOverlay();
      }
    });
  }

  if (overlayCloseBtn) {
    overlayCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDetailOverlay();
    });
  }

  if (overlayBackdrop) {
    overlayBackdrop.addEventListener("click", () => {
      closeDetailOverlay();
    });
  }

  // Close overlay when mouse leaves the overlay content area
  if (overlayContentEl) {
    overlayContentEl.addEventListener("mouseleave", () => {
      if (overlayOpen) {
        closeDetailOverlay();
      }
    });
  }

  // Public API so main.js can coordinate keyboard behavior
  return {
    isOpen: () => overlayOpen,
    close: closeDetailOverlay
  };
}
