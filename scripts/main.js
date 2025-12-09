// ========== PROJECT DATA ==========

const allProjects = [
  {
    id: "hex",
    title: "Hex Tile World Generator",
    short: "Hex-based terrain, biomes, rivers, and towns.",
    detail: [
      "Unreal Engine editor tool that builds hex-based worlds with biomes, elevation, rivers, and settlement rules.",
      "Designed for rapid iteration and fast layout experimentation for strategy / roguelite maps."
    ],
    variant: "primary",
    skills: ["Unreal Engine", "C++", "Procedural Gen", "Tools"]
    // image: "media/projects/hex.jpg",
    // video: "media/projects/hex.mp4"
  },
  {
    id: "item",
    title: "Item Display Editor",
    short: "Unreal editor for authoring character item visuals.",
    detail: [
      "Slate-based asset editor for previewing equipment attachments and defining item display metadata.",
      "Centralizes loadout visuals so designers adjust gear without touching scenes or code."
    ],
    variant: "alt",
    skills: ["Unreal Engine", "Slate", "UI", "Tools"]
    // image: "media/projects/item.jpg"
  }
  // Add more projects here with skills[], and optionally image/video.
];


// ========== CAROUSEL + FILTER ==========

(function () {
  const dotsEl          = document.getElementById("project-dots");
  const previewEl       = document.getElementById("project-preview");
  const detailEl        = document.getElementById("project-detail");
  const sectionProjects = document.getElementById("section-projects");
  const projectsNav     = document.querySelector(".projects-nav");
  const filterRoot      = document.querySelector(".projects-filter-root");
  const filterMenu      = document.getElementById("skill-filter-menu");
  const filterLabel     = document.getElementById("skill-filter-label");
  const filterToggle    = document.getElementById("skill-filter-toggle");

  if (!dotsEl || !previewEl || !detailEl || !sectionProjects || !projectsNav) return;

  let visibleProjects = [...allProjects];
  let activeIndex = 0;
  let activeSkill = null; // null = All
  let userLocked = false; // stops auto-rotate on interaction
  let autoRotateTimer = null;

  let menuOpen = false;

  function openMenu() {
    if (!filterMenu) return;
    menuOpen = true;
    filterMenu.classList.add("is-open");
  }

  function closeMenu() {
    if (!filterMenu) return;
    menuOpen = false;
    filterMenu.classList.remove("is-open");
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
  // (right now it's title + short text; see notes below for how to plug in image/video)

  function showThumbnail(index) {
    const project = visibleProjects[index];
    if (!project) return;

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
  sectionProjects.addEventListener("change", () => {
    userLocked = false;
  });

  // ---------- FILTER BUTTON + DROPDOWN BEHAVIOR ----------

  if (filterRoot && filterMenu && filterToggle) {
    // Hover opens (and keeps) menu
    filterRoot.addEventListener("mouseenter", () => {
      openMenu();
    });

    // Clicking filter keeps it open (no toggle close)
    filterToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      openMenu();
    });

    // Clicking anywhere outside filterRoot closes the menu
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
  }

  init();
})();
