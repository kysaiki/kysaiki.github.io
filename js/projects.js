// js/projects.js
// ========== CAROUSEL + FILTER + KEYBOARD ==========

export function initProjects(allProjects) {
  const dotsEl          = document.getElementById("project-dots");
  const previewEl       = document.getElementById("project-preview");
  const detailEl        = document.getElementById("project-detail");
  const sectionBio      = document.getElementById("section-bio");
  const sectionProjects = document.getElementById("section-projects");
  const sectionCV       = document.getElementById("section-cv");
  const sectionContact  = document.getElementById("section-contact");
  const projectsNav     = document.querySelector(".projects-nav");
  const filterRoot      = document.querySelector(".projects-filter-root");
  const filterMenu      = document.getElementById("skill-filter-menu");
  const filterLabel     = document.getElementById("skill-filter-label");
  const filterToggle    = document.getElementById("skill-filter-toggle");
  const projectBgEl     = document.getElementById("project-bg-overlay");

  const sectionOrder = [
    sectionBio,
    sectionProjects,
    sectionCV,
    sectionContact
  ];

  // If key elements are missing, bail but still return a safe API
  if (!dotsEl || !previewEl || !detailEl || !sectionProjects || !projectsNav) {
    console.warn(
      "[initProjects] Missing DOM elements, skipping project UI init.",
      { dotsEl, previewEl, detailEl, sectionProjects, projectsNav }
    );

    return {
      handleKeydown: () => {},
      getAllProjects: () => allProjects,
      getVisibleProjects: () => [],
      getSectionState: () => ({
        sectionBio,
        sectionProjects,
        sectionCV,
        sectionContact
      })
    };
  }

  let visibleProjects = [...allProjects];
  let activeIndex = 0;
  let activeSkill = null; // null = All
  let userLocked = false; // stops auto-rotate on interaction
  let autoRotateTimer = null;

  let menuOpen = false;
  let menuPinned = false;
  let overlayOpen = false; // track overlay state
  let thumbnailTimer = null;

  // Listen for overlay open/close so we can freeze auto-rotate
  window.addEventListener("overlayOpenChange", (e) => {
    overlayOpen = !!(e.detail && e.detail.open);
    if (overlayOpen) {
      userLocked = true; // hard-freeze rotation while overlay visible
    }
  });

  // ---------- PROJECT BACKGROUND OVERLAY ----------

  function updateProjectBackground(projectOrNull) {
    if (!projectBgEl) return;

    const project = projectOrNull || null;

    if (project && project.bgGif && sectionProjects && sectionProjects.checked) {
      const url = project.bgGif;
      projectBgEl.style.backgroundImage =
        `radial-gradient(circle at center, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.9) 100%), url("${url}")`;
      projectBgEl.classList.add("project-bg-overlay--visible");
    } else {
      projectBgEl.classList.remove("project-bg-overlay--visible");
      projectBgEl.style.backgroundImage = "";
    }
  }

  // ---------- FILTER MENU HELPERS ----------

  function openMenu() {
    if (!filterMenu) return;
    menuOpen = true;
    filterMenu.classList.add("is-open");
  }

  function closeMenu() {
    if (!filterMenu) return;
    menuOpen = false;
    menuPinned = false;
    filterMenu.classList.remove("is-open");
  }

  function buildSkillFilterMenu() {
    if (!filterMenu) return;

    filterMenu.innerHTML = "";

    const skillsSet = new Set();
    allProjects.forEach(p => (p.skills || []).forEach(s => skillsSet.add(s)));
    const skills = Array.from(skillsSet).sort();

    // "All" option
    const allOption = document.createElement("button");
    allOption.type = "button";
    allOption.className = "skill-filter-option" + (activeSkill === null ? " is-active" : "");
    allOption.textContent = "All";
    allOption.addEventListener("click", (e) => {
      e.stopPropagation();
      applySkillFilter(null);
    });
    filterMenu.appendChild(allOption);

    // Specific skills
    skills.forEach(skill => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "skill-filter-option" + (activeSkill === skill ? " is-active" : "");
      btn.textContent = skill;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        applySkillFilter(skill);
      });
      filterMenu.appendChild(btn);
    });
  }

  function applySkillFilter(skill) {
    activeSkill = skill;
    userLocked = true; // user explicitly filtered → pause auto-rotate

    if (filterLabel) {
      filterLabel.textContent = activeSkill || "All";
    }

    if (!activeSkill) {
      visibleProjects = [...allProjects];
    } else {
      visibleProjects = allProjects.filter(p => (p.skills || []).includes(activeSkill));
    }

    activeIndex = 0;
    renderProjects();
    buildSkillFilterMenu();
  }

  // ---------- RENDER PROJECTS ----------

  function renderProjects() {
    dotsEl.innerHTML = "";
    detailEl.innerHTML = "";

    if (visibleProjects.length === 0) {
      const msg = document.createElement("p");
      msg.className = "project-detail__body";
      msg.textContent = "No projects tagged with this skill yet.";
      detailEl.appendChild(msg);
      previewEl.innerHTML = "";
      updateProjectBackground(null);
      return;
    }

    visibleProjects.forEach((project, index) => {
      // Dot
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.dataset.index = index.toString();

      // HOVER → ONLY update thumbnail
      dot.addEventListener("mouseenter", () => {
        userLocked = true;
        showThumbnail(index);   // only swaps the thumbnail
      });

      // CLICK → change active project + background + thumbnail
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        userLocked = true;
        setActiveProject(index); // updates background + right panel + overlay state
        showThumbnail(index);    // shows thumbnail for the new active project
      });


      dotsEl.appendChild(dot);

      // Description (right)
      const item = document.createElement("div");
      item.className = "project-detail__item";

      const title = document.createElement("h2");
      title.className = "project-detail__title";
      title.textContent = project.title;
      item.appendChild(title);

      project.detail.forEach(text => {
        const p = document.createElement("p");
        p.className = "project-detail__body";
        p.textContent = text;
        item.appendChild(p);
      });

      detailEl.appendChild(item);
    });

    if (activeIndex >= visibleProjects.length) {
      activeIndex = 0;
    }

    setActiveProject(activeIndex);
    showThumbnail(activeIndex);
  }

  function setActiveProject(index) {
    activeIndex = index;

    const dots = dotsEl.querySelectorAll(".dot");
    const items = detailEl.querySelectorAll(".project-detail__item");

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });

    items.forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
    });

    // NEW: background follows the *active* project only
    const project = visibleProjects[activeIndex] || null;
    updateProjectBackground(project);

    // Broadcast active project so overlay.js can render per-project content
    window.dispatchEvent(
      new CustomEvent("projectChange", {
        detail: { project }
      })
    );
  }

  // ---------- THUMBNAIL (CROSSFADE) ----------

  function showThumbnail(index) {
    const project = visibleProjects[index];
    if (!project) return;

    // Clear any pending hover change so fast moves don't spam transitions
    if (thumbnailTimer) {
      clearTimeout(thumbnailTimer);
      thumbnailTimer = null;
    }

    // Small delay so quick passes over dots don't constantly swap
    thumbnailTimer = setTimeout(() => {
      const prev = previewEl.querySelector(".project-preview__card");
      if (prev) {
        prev.classList.remove("is-active");
        prev.classList.add("is-leaving");
        prev.addEventListener(
          "transitionend",
          () => prev.remove(),
          { once: true }
        );
      }

      const card = document.createElement("div");
      card.className =
        "project-preview__card" +
        (project.variant === "alt" ? " project-preview__card--alt" : "");

      // Use bgGif as the thumbnail image if available
      const imageSrc = project.bgGif || "";

      card.innerHTML = `
        <div class="project-preview__image-wrapper">
          ${imageSrc
            ? `<img class="project-preview__image" src="${imageSrc}" alt="${project.title} thumbnail" />`
            : ""}
        </div>
        <div class="project-preview__text">
          <div class="project-preview__title">${project.title}</div>
          <div class="project-preview__desc">${project.short}</div>
        </div>
      `;

      previewEl.appendChild(card);

      // Trigger fade-in on the next frame
      requestAnimationFrame(() => {
        card.classList.add("is-active");
      });
    }, 120); // ~120ms feels responsive but not twitchy
  }



  // ---------- AUTO-ROTATE ----------

  function startAutoRotate() {
    if (autoRotateTimer) return;

    autoRotateTimer = setInterval(() => {
      if (!sectionProjects || !sectionProjects.checked) return;
      if (overlayOpen) return;    // do not rotate while overlay is on
      if (userLocked) return;
      if (visibleProjects.length <= 1) return;

      const next = (activeIndex + 1) % visibleProjects.length;
      setActiveProject(next);   // updates background + event
      showThumbnail(next);      // updates thumbnail only
    }, 5000);
  }

  if (sectionProjects) {
    sectionProjects.addEventListener("change", () => {
      userLocked = false;
      const project = visibleProjects[activeIndex] || null;
      updateProjectBackground(project);
    });
  }

  // ---------- SECTION / PROJECT NAV HELPERS ----------

  function changeSection(delta) {
    const currentIndex = sectionOrder.findIndex(r => r && r.checked);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const len = sectionOrder.length;
    const nextIndex = (safeIndex + delta + len) % len;
    const nextRadio = sectionOrder[nextIndex];
    if (nextRadio) {
      nextRadio.checked = true;
      nextRadio.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (nextRadio === sectionProjects) {
      const project = visibleProjects[activeIndex] || null;
      updateProjectBackground(project);
    } else {
      updateProjectBackground(null);
    }
  }

  function changeProject(delta) {
    if (!sectionProjects || !sectionProjects.checked) return;
    if (visibleProjects.length === 0) return;

    userLocked = true;
    const len = visibleProjects.length;
    const next = (activeIndex + delta + len) % len;
    setActiveProject(next);
    showThumbnail(next);
  }

  // ---------- KEYBOARD NAVIGATION (ARROWS) ----------

  function handleKeydown(e) {
    const key = e.key;

    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      return;
    }

    const target = e.target;
    if (
      target &&
      (target.tagName === "INPUT" ||
       target.tagName === "TEXTAREA" ||
       target.isContentEditable)
    ) {
      return;
    }

    if (key === "ArrowUp") {
      e.preventDefault();
      changeSection(-1);
      closeMenu();
      return;
    }

    if (key === "ArrowDown") {
      e.preventDefault();
      changeSection(1);
      closeMenu();
      return;
    }

    if (sectionProjects && sectionProjects.checked && key === "ArrowLeft") {
      e.preventDefault();
      changeProject(-1);
      return;
    }

    if (sectionProjects && sectionProjects.checked && key === "ArrowRight") {
      e.preventDefault();
      changeProject(1);
      return;
    }
  }

  // ---------- FILTER BUTTON + DROPDOWN BEHAVIOR ----------

  if (filterRoot && filterMenu && filterToggle) {
    filterRoot.addEventListener("mouseenter", () => {
      openMenu();
    });

    filterRoot.addEventListener("mouseleave", () => {
      if (!menuPinned) {
        closeMenu();
      }
    });

    filterToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menuPinned = true;
      openMenu();
    });

    document.addEventListener("click", (e) => {
      if (!filterRoot.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // ---------- INIT ----------

  function init() {
    visibleProjects = [...allProjects];
    if (filterLabel) filterLabel.textContent = "All";
    buildSkillFilterMenu();
    renderProjects();
    startAutoRotate();

    updateProjectBackground(null);
  }

  init();

  // Public API overlay/main can use
  return {
    handleKeydown,
    getAllProjects: () => allProjects,
    getVisibleProjects: () => visibleProjects,
    getSectionState: () => ({
      sectionBio,
      sectionProjects,
      sectionCV,
      sectionContact
    })
  };
}
