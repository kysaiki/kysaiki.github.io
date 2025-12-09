// ========== PROJECT DATA ==========

const allProjects = [
  {
    id: "gearbox-tools",
    title: "Gearbox Tools & Pipeline",
    short: "Internal Unreal tooling and production pipelines at Gearbox.",
    detail: [
      "Contributed to internal Gearbox tooling focused on Unreal Engine editor extensions, data workflows, and studio-specific pipelines.",
      "Built and extended Slate-based tools that streamlined asset authoring, validation, and iteration for designers and artists.",
      "Collaborated with engineers and content teams to improve reliability, debuggability, and UX of editor-facing systems."
    ],
    variant: "alt",  // uses the blue-ish alt card style
    skills: ["Gearbox", "Unreal Engine", "Slate", "Tools", "Pipelines"],
    bgGif: "media/bg-gbx.jpg" // optional if you later add a Gearbox-specific background
  },
  // 🔥 NBA 2K26 project
  {
    id: "nba2k26",
    title: "NBA 2K26 — Engineering",
    short: "Production tools & game systems for NBA 2K26.",
    detail: [
      "Contributed to NBA 2K26 engineering, focusing on tools, workflows, and systems that support large-scale sports development.",
      "Built and refined pipelines that improve iteration speed for designers, artists, and gameplay engineers."
    ],
    variant: "primary",
    skills: ["2K", "Tools", "Production", "C++"],
    bgGif: "media/bg-nba-2k26.jpg"   // 👈 exact filename & path
  }
  // Add more projects here with skills[], and optionally image/video/bgGif.
];


// ========== CAROUSEL + FILTER + KEYBOARD ==========

(function () {
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

  if (!dotsEl || !previewEl || !detailEl || !sectionProjects || !projectsNav) return;

  const sectionOrder = [
    sectionBio,
    sectionProjects,
    sectionCV,
    sectionContact
  ];

  let visibleProjects = [...allProjects];
  let activeIndex = 0;
  let activeSkill = null; // null = All
  let userLocked = false; // stops auto-rotate on interaction
  let autoRotateTimer = null;

  let menuOpen = false;
  let menuPinned = false;

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

  // ---------- PROJECT BACKGROUND OVERLAY ----------

  function updateProjectBackground(projectOrNull) {
    if (!projectBgEl) return;

    const project = projectOrNull || null;

    if (project && project.bgGif) {
      const url = project.bgGif;
      projectBgEl.style.backgroundImage =
        `radial-gradient(circle at center, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.9) 100%), url("${url}")`;
      projectBgEl.classList.add("project-bg-overlay--visible");
    } else {
      projectBgEl.classList.remove("project-bg-overlay--visible");
      projectBgEl.style.backgroundImage = "";
    }
  }

  // ---------- FILTER ----------

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

    // Replace button label with selected filter text (still prefixed with "Filter:" in HTML)
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

      dot.addEventListener("mouseenter", () => {
        userLocked = true; // user interacted → stop auto-rotate
        setActiveProject(index);
        showThumbnail(index);
      });

      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        userLocked = true;
        setActiveProject(index);
        showThumbnail(index);
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
  }

  // ---------- THUMBNAIL (CROSSFADE) ----------
  // Currently just title + short. You can plug in image/video media if you want.

  function showThumbnail(index) {
    const project = visibleProjects[index];
    if (!project) {
      updateProjectBackground(null);
      return;
    }

    // Update project-specific background only while on Projects
    if (sectionProjects && sectionProjects.checked) {
      updateProjectBackground(project);
    } else {
      updateProjectBackground(null);
    }

    const prev = previewEl.querySelector(".project-preview__card.is-active");
    if (prev) {
      prev.classList.remove("is-active");
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

    const title = document.createElement("div");
    title.className = "project-preview__title";
    title.textContent = project.title;

    const desc = document.createElement("div");
    desc.className = "project-preview__desc";
    desc.textContent = project.short;

    card.appendChild(title);
    card.appendChild(desc);

    previewEl.appendChild(card);

    requestAnimationFrame(() => {
      card.classList.add("is-active");
    });
  }

  // ---------- AUTO-ROTATE ----------

  function startAutoRotate() {
    if (autoRotateTimer) return;

    autoRotateTimer = setInterval(() => {
      if (!sectionProjects.checked) return;
      if (userLocked) return;
      if (visibleProjects.length <= 1) return;

      const next = (activeIndex + 1) % visibleProjects.length;
      setActiveProject(next);
      showThumbnail(next);
    }, 5000);
  }

  // When projects tab is reselected, allow auto-rotation again
  if (sectionProjects) {
    sectionProjects.addEventListener("change", () => {
      userLocked = false;
      // Ensure background matches current project when returning
      const project = visibleProjects[activeIndex] || null;
      updateProjectBackground(project);
    });
  }

  // ---------- FILTER BUTTON + DROPDOWN BEHAVIOR ----------

  if (filterRoot && filterMenu && filterToggle) {
    // Hover opens the menu
    filterRoot.addEventListener("mouseenter", () => {
      openMenu();
    });

    // Mouse leaving closes the menu only if not pinned by click
    filterRoot.addEventListener("mouseleave", () => {
      if (!menuPinned) {
        closeMenu();
      }
    });

    // Clicking filter pins it open (stays open until click outside)
    filterToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menuPinned = true;
      openMenu();
    });

    // Clicking anywhere outside filterRoot closes and unpins
    document.addEventListener("click", (e) => {
      if (!filterRoot.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // ---------- KEYBOARD NAVIGATION ----------

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

    // Show project background if we land on Projects; otherwise hide it
    if (nextRadio === sectionProjects) {
      const project = visibleProjects[activeIndex] || null;
      updateProjectBackground(project);
    } else {
      updateProjectBackground(null);
    }
  }

  function changeProject(delta) {
    if (!sectionProjects.checked) return;
    if (visibleProjects.length === 0) return;

    userLocked = true;
    const len = visibleProjects.length;
    const next = (activeIndex + delta + len) % len;
    setActiveProject(next);
    showThumbnail(next);
  }

  window.addEventListener("keydown", (e) => {
    const key = e.key;

    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      return;
    }

    // Don't hijack typing in inputs/textareas/contentEditable
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

    if (sectionProjects.checked && key === "ArrowLeft") {
      e.preventDefault();
      changeProject(-1);
      return;
    }

    if (sectionProjects.checked && key === "ArrowRight") {
      e.preventDefault();
      changeProject(1);
      return;
    }
  });

  // ---------- INIT ----------

  function init() {
    visibleProjects = [...allProjects];
    if (filterLabel) filterLabel.textContent = "All";
    buildSkillFilterMenu();
    renderProjects();
    startAutoRotate();

    // Start with no project-specific background (Bio is default)
    updateProjectBackground(null);
  }

  init();
})();
