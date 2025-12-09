// js/overlay.js
// ========== DETAIL OVERLAY (BIO / PROJECTS) ==========

export function initOverlay(projectState) {
  const { getSectionState, getVisibleProjects } = projectState;
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

  // ---------- BIO TIMELINE SCROLL / FADE-IN ----------

  function initBioTimelineAnimations(rootEl) {
    if (!rootEl || !("IntersectionObserver" in window)) return;

    const events = rootEl.querySelectorAll(".bio-timeline__event");
    if (!events.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: overlayBodyEl, // scroll container
        threshold: 0.2
      }
    );

    events.forEach((el) => observer.observe(el));
  }

  // ---------- OVERLAY CONTENT RENDERERS ----------

  function isBioOrProjectsActive() {
    return (sectionBio && sectionBio.checked) ||
           (sectionProjects && sectionProjects.checked);
  }

  function renderBioOverlayContent() {
    if (!overlayBodyEl) return;
    overlayBodyEl.innerHTML = "";

    const tpl = document.getElementById("overlay-bio");
    if (!tpl) {
      // Fallback if template is missing
      const p = document.createElement("p");
      p.textContent =
        'Bio overlay template not found. Add <template id="overlay-bio"> to index.html.';
      overlayBodyEl.appendChild(p);
      return;
    }

    const clone = tpl.content.cloneNode(true);
    overlayBodyEl.appendChild(clone);

    // Enable scroll-based fade-in for timeline events
    initBioTimelineAnimations(overlayBodyEl);
  }

  function renderProjectOverlayContent() {
    if (!overlayBodyEl) return;
    overlayBodyEl.innerHTML = "";

    // If we don't yet know the current project (e.g. overlay initialized after projects),
    // fall back to the first visible project.
    if (!currentProject && typeof getVisibleProjects === "function") {
      const visible = getVisibleProjects() || [];
      if (visible.length > 0) {
        currentProject = visible[0];
      }
    }

    // Still nothing? Show a safe message.
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

    // Broadcast that overlay is now open (projects.js listens to freeze auto-rotate)
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

    // Broadcast that overlay is now closed
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
