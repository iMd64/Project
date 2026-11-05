/**
 * nav.js — Shared Collapsible Navigation Sidebar for MEN412 Project Management HTML Notes
 * Standardized under the project-html-notes skill.
 * 
 * Features:
 * - Dynamic Left-Side Collapsible Sidebar (Desktop persistent rail + Mobile drawer)
 * - Auto-detection of active lesson from filename or body data-lesson
 * - Automatic In-Page Table of Contents (TOC) with ScrollSpy for section anchors (#sec1, etc.)
 * - Integrated Dark/Light Study Mode Theme Controller (synced with localStorage & page toggles)
 * - Remembers collapsed/expanded preference across pages
 * - Smooth desktop margin-shift so content is never obscured
 * - Pure vanilla JS, zero external dependencies
 */

(function () {
  "use strict";

  // Course Curriculum Definition
  const LESSONS = [
    {
      id: "index",
      file: "index.html",
      week: "Hub",
      title: "Course Portal & Roadmap",
      icon: "🏛️",
      summary: "Syllabus, 14-week roadmap & lesson index"
    },
    {
      id: "week01",
      file: "lesson_01_introduction_to_project_management_exam_study_notes.html",
      week: "W01",
      title: "Introduction to Project Management",
      icon: "📌",
      summary: "Definitions, volume vs. variety, line vs. PM, 5 generations"
    },
    {
      id: "week02",
      file: "lesson_02_structures_and_frameworks_exam_study_notes.html",
      week: "W02",
      title: "Structures & Frameworks",
      icon: "📐",
      summary: "5-C model, PESTEL, 7-S, ICOM, 4-D, S-curve, ATF case"
    },
    {
      id: "week03",
      file: "Week_03_Projects_and_Organisations.html",
      week: "W03",
      title: "Projects & Organisations",
      icon: "🏢",
      summary: "Functional, matrix, projectized structures & governance"
    },
    {
      id: "week04",
      file: "lesson_04_setting_up_for_success_exam_study_notes.html",
      week: "W04",
      title: "Setting up for Success",
      icon: "🎯",
      summary: "Scope, WBS hierarchies, Iron Triangle trade-offs"
    },
    {
      id: "week05",
      file: "lesson_05_planning_for_success_exam_study_notes.html",
      week: "W05",
      title: "Planning for Success",
      icon: "📋",
      summary: "Activity definition, sequencing & dependency logic"
    },
    {
      id: "week06",
      file: "lesson_06_time_planning_scheduling_exam_study_notes.html",
      week: "W06",
      title: "Time Planning & Scheduling",
      icon: "⏱️",
      summary: "Critical Path Method (CPM), forward/backward pass, float"
    },
    {
      id: "week06_quiz",
      file: "week_06_quiz_midterm_prep_short_course_network_gantt_chart.html",
      week: "Prep",
      title: "Quiz & Midterm Prep (Network & Gantt)",
      icon: "🎯",
      summary: "Table 6.5 Short Course 10-Activity AoN & interactive Gantt"
    }
  ];

  // Upcoming Weeks (for course roadmap context in sidebar)
  const UPCOMING_WEEKS = [
    { week: "W07", title: "PERT Analysis under Uncertainty" },
    { week: "W08", title: "Midterm Examination" },
    { week: "W09", title: "Resource Allocation & Crashing" },
    { week: "W10", title: "Cost Estimating & EVM (Earned Value)" },
    { week: "W11", title: "Risk Management & Mitigation" },
    { week: "W12", title: "Quality & Procurement Management" },
    { week: "W13", title: "Leadership, Team Dynamics & Ethics" },
    { week: "W14", title: "Monitoring, Control & Project Closure" }
  ];

  // Helper: Detect active page
  function getActiveLesson() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf("/") + 1).toLowerCase();
    const bodyLesson = (document.body.getAttribute("data-lesson") || "").toLowerCase();

    for (const l of LESSONS) {
      if (currentFile && currentFile === l.file.toLowerCase()) {
        return l;
      }
      if (bodyLesson && (bodyLesson === l.id.toLowerCase() || bodyLesson === l.week.toLowerCase())) {
        return l;
      }
    }
    // Default to index if on root / or empty
    if (!currentFile || currentFile === "" || currentFile === "index.html") {
      return LESSONS[0];
    }
    return null;
  }

  // Inject Navigation CSS
  function injectStyles() {
    if (document.getElementById("pm-nav-styles")) return;

    const style = document.createElement("style");
    style.id = "pm-nav-styles";
    style.textContent = `
      :root {
        --pm-sidebar-w: 290px;
        --pm-sidebar-bg: rgba(255, 255, 255, 0.94);
        --pm-sidebar-border: #e2dcd0;
        --pm-sidebar-ink: #1e293b;
        --pm-sidebar-muted: #64748b;
        --pm-sidebar-hover: #f1ebd8;
        --pm-sidebar-active-bg: #eef2ff;
        --pm-sidebar-active-border: #4f46e5;
        --pm-sidebar-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      }

      [data-theme="dark"] {
        --pm-sidebar-bg: rgba(26, 28, 34, 0.96);
        --pm-sidebar-border: #2e323b;
        --pm-sidebar-ink: #f1f5f9;
        --pm-sidebar-muted: #94a3b8;
        --pm-sidebar-hover: #262932;
        --pm-sidebar-active-bg: rgba(99, 102, 241, 0.16);
        --pm-sidebar-active-border: #818cf8;
        --pm-sidebar-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
      }

      /* Desktop Layout Transition */
      @media (min-width: 1200px) {
        body.pm-sidebar-expanded {
          padding-left: var(--pm-sidebar-w) !important;
          transition: padding-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        body.pm-sidebar-collapsed {
          padding-left: 0 !important;
          transition: padding-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }

      /* Sidebar Container */
      #pm-sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: var(--pm-sidebar-w);
        background-color: var(--pm-sidebar-bg);
        border-right: 1px solid var(--pm-sidebar-border);
        box-shadow: var(--pm-sidebar-shadow);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }

      #pm-sidebar.collapsed {
        transform: translateX(-100%);
      }

      /* Floating Toggle Button (visible when collapsed or on mobile) */
      #pm-sidebar-toggle-btn {
        position: fixed;
        top: 14px;
        left: 14px;
        z-index: 9998;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 9999px;
        background: var(--pm-sidebar-bg);
        border: 1px solid var(--pm-sidebar-border);
        color: var(--pm-sidebar-ink);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(8px);
        cursor: pointer;
        font-size: 12px;
        font-weight: 700;
        transition: all 0.2s ease;
      }
      #pm-sidebar-toggle-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
      }

      /* Backdrop Overlay on Mobile */
      #pm-sidebar-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(4px);
        z-index: 9990;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      #pm-sidebar-backdrop.active {
        opacity: 1;
        pointer-events: auto;
      }

      /* Custom Scrollbar for Nav */
      #pm-sidebar-nav-scroll::-webkit-scrollbar {
        width: 5px;
      }
      #pm-sidebar-nav-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      #pm-sidebar-nav-scroll::-webkit-scrollbar-thumb {
        background-color: var(--pm-sidebar-border);
        border-radius: 9999px;
      }

      /* Nav Link Items */
      .pm-nav-link {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 10px;
        color: var(--pm-sidebar-ink);
        text-decoration: none;
        font-size: 13px;
        line-height: 1.4;
        transition: all 0.15s ease;
        border-left: 3px solid transparent;
      }
      .pm-nav-link:hover {
        background-color: var(--pm-sidebar-hover);
        transform: translateX(2px);
      }
      .pm-nav-link.active {
        background-color: var(--pm-sidebar-active-bg);
        border-left-color: var(--pm-sidebar-active-border);
        font-weight: 700;
        color: var(--pm-sidebar-active-border);
      }

      /* In-Page TOC jump links */
      .pm-toc-sublink {
        display: block;
        padding: 5px 10px 5px 28px;
        font-size: 11.5px;
        color: var(--pm-sidebar-muted);
        text-decoration: none;
        border-left: 2px solid var(--pm-sidebar-border);
        margin-left: 18px;
        line-height: 1.35;
        transition: all 0.15s ease;
      }
      .pm-toc-sublink:hover {
        color: var(--pm-sidebar-ink);
        border-left-color: #f59e0b;
        background-color: var(--pm-sidebar-hover);
      }
      .pm-toc-sublink.active-toc {
        color: #e11d48;
        border-left-color: #e11d48;
        font-weight: 700;
      }
    `;
    document.head.appendChild(style);
  }

  // Scan in-page sections for Table of Contents
  function getInPageSections() {
    const sections = [];
    // Search sections with IDs
    const sectionEls = document.querySelectorAll("main section[id], section[id], article section[id]");
    sectionEls.forEach((el) => {
      const id = el.getAttribute("id");
      if (!id) return;
      // Get heading
      const h = el.querySelector("h1, h2, h3, h4");
      let title = h ? h.textContent.trim() : id;
      // Clean up common badge prefixes like numbers
      title = title.replace(/^[0-9IVX]+\s*[•·\-\.]\s*/, "").trim();
      if (title.length > 40) {
        title = title.substring(0, 38) + "…";
      }
      sections.push({ id, title });
    });
    return sections;
  }

  // Build Sidebar HTML
  function renderSidebar(activeLesson) {
    const inPageSections = getInPageSections();

    let linksHtml = "";
    LESSONS.forEach((item) => {
      const isActive = activeLesson && activeLesson.id === item.id;
      linksHtml += `
        <li>
          <a href="${item.file}" class="pm-nav-link ${isActive ? "active" : ""}" data-lesson-id="${item.id}">
            <span style="font-size: 15px; flex-shrink: 0; margin-top: 1px;">${item.icon}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                <span style="font-size: 12.5px; font-weight: ${isActive ? "700" : "600"};" class="truncate">${item.title}</span>
                <span style="font-size: 9.5px; font-weight: 800; padding: 1px 5px; border-radius: 4px; background: ${isActive ? "rgba(79, 70, 229, 0.15)" : "var(--pm-sidebar-border)"}; text-transform: uppercase;">${item.week}</span>
              </div>
              <p style="font-size: 11px; color: var(--pm-sidebar-muted); margin: 2px 0 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.summary}</p>
            </div>
          </a>
          ${
            isActive && inPageSections.length > 0
              ? `
            <div class="pm-in-page-toc" style="margin: 4px 0 6px 0;">
              ${inPageSections
                .map(
                  (s) => `
                <a href="#${s.id}" class="pm-toc-sublink" data-target="${s.id}">
                  ${s.title}
                </a>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
        </li>
      `;
    });

    // Upcoming weeks collapsible accordion
    const upcomingHtml = `
      <details style="margin-top: 12px; font-size: 11.5px; border-top: 1px dashed var(--pm-sidebar-border); padding-top: 10px;">
        <summary style="cursor: pointer; font-weight: 700; color: var(--pm-sidebar-muted); display: flex; align-items: center; justify-content: space-between;">
          <span>⏳ Weeks 07–14 Roadmap</span>
          <span style="font-size: 10px;">▼</span>
        </summary>
        <ul style="list-style: none; padding: 6px 0 0 4px; margin: 0; display: flex; flex-direction: column; gap: 4px;">
          ${UPCOMING_WEEKS.map(
            (u) => `
            <li style="color: var(--pm-sidebar-muted); display: flex; align-items: center; gap: 6px; padding: 3px 6px; border-radius: 4px;">
              <span style="font-weight: 800; font-size: 9.5px; opacity: 0.8;">${u.week}</span>
              <span class="truncate">${u.title}</span>
            </li>
          `
          ).join("")}
        </ul>
      </details>
    `;

    const sidebarHtml = `
      <!-- Backdrop for mobile -->
      <div id="pm-sidebar-backdrop"></div>

      <!-- Floating Open Button (Visible when sidebar is collapsed) -->
      <button id="pm-sidebar-toggle-btn" type="button" aria-label="Toggle navigation menu">
        <span>📖</span>
        <span id="pm-toggle-btn-text">Course Menu</span>
      </button>

      <!-- Sidebar -->
      <aside id="pm-sidebar" aria-label="Course navigation">
        <!-- Sidebar Header -->
        <div style="padding: 14px 16px; border-bottom: 1px solid var(--pm-sidebar-border); display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <a href="index.html" style="text-decoration: none; display: flex; align-items: center; gap: 8px; color: var(--pm-sidebar-ink);">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #4f46e5, #e11d48); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 13px;">
              PM
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #4f46e5;">MEN412 • IAU</div>
              <div style="font-size: 13px; font-weight: 700; line-height: 1.1;">Study Notes Hub</div>
            </div>
          </a>
          <button id="pm-sidebar-close-btn" type="button" style="background: transparent; border: none; font-size: 16px; cursor: pointer; color: var(--pm-sidebar-muted); padding: 4px; border-radius: 6px;" title="Collapse sidebar">
            ✕
          </button>
        </div>

        <!-- Instructor & Book Credit Pill -->
        <div style="padding: 8px 16px; background-color: rgba(148, 163, 184, 0.08); border-bottom: 1px solid var(--pm-sidebar-border); font-size: 11px; color: var(--pm-sidebar-muted); display: flex; align-items: center; justify-content: space-between;">
          <span>Prof. Dr. Naghdali Choupani</span>
          <span style="font-weight: 700;">Fall 2026</span>
        </div>

        <!-- Scrollable Links Container -->
        <div id="pm-sidebar-nav-scroll" style="flex: 1; overflow-y: auto; padding: 12px 10px;">
          <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--pm-sidebar-muted); padding: 4px 8px 6px 8px;">
            Semester Lessons
          </div>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 3px;">
            ${linksHtml}
          </ul>

          ${upcomingHtml}
        </div>

        <!-- Sidebar Footer: Theme Toggle & Links -->
        <div style="padding: 12px 16px; border-top: 1px solid var(--pm-sidebar-border); display: flex; items-center; justify-content: space-between; gap: 8px; font-size: 12px;">
          <button id="pm-sidebar-theme-toggle" type="button" style="display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--pm-sidebar-border); background: transparent; color: var(--pm-sidebar-ink); cursor: pointer; font-size: 12px; font-weight: 600;">
            <span id="pm-theme-icon">🌙</span>
            <span id="pm-theme-label">Dark Mode</span>
          </button>

          <a href="index.html" style="display: flex; align-items: center; gap: 4px; color: var(--pm-sidebar-muted); text-decoration: none; font-size: 12px; font-weight: 600; padding: 6px;">
            <span>Syllabus</span> ➔
          </a>
        </div>
      </aside>
    `;

    // Inject into document body
    const mountDiv = document.createElement("div");
    mountDiv.id = "pm-navigation-mount";
    mountDiv.innerHTML = sidebarHtml;
    document.body.prepend(mountDiv);
  }

  // Setup Theme Controller
  function setupTheme() {
    const root = document.documentElement;
    const themeBtn = document.getElementById("pm-sidebar-theme-toggle");
    const themeIcon = document.getElementById("pm-theme-icon");
    const themeLabel = document.getElementById("pm-theme-label");

    // Also look for page-level toggle if present
    const pageThemeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
      if (theme === "dark") {
        root.setAttribute("data-theme", "dark");
        root.classList.add("dark");
        localStorage.setItem("pm_theme", "dark");
        if (themeIcon) themeIcon.textContent = "☀️";
        if (themeLabel) themeLabel.textContent = "Light Mode";
      } else {
        root.removeAttribute("data-theme");
        root.classList.remove("dark");
        localStorage.setItem("pm_theme", "light");
        if (themeIcon) themeIcon.textContent = "🌙";
        if (themeLabel) themeLabel.textContent = "Dark Mode";
      }
    }

    // Initialize from storage or system preference
    const saved = localStorage.getItem("pm_theme");
    const currentAttr = root.getAttribute("data-theme");
    if (saved === "dark" || currentAttr === "dark") {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const isDark = root.getAttribute("data-theme") === "dark";
        applyTheme(isDark ? "light" : "dark");
      });
    }

    // Sync with existing page toggle if any
    if (pageThemeToggle) {
      pageThemeToggle.addEventListener("click", () => {
        setTimeout(() => {
          const isDark = root.getAttribute("data-theme") === "dark";
          if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
          if (themeLabel) themeLabel.textContent = isDark ? "Light Mode" : "Dark Mode";
        }, 50);
      });
    }
  }

  // Setup Sidebar Toggle Behaviors (Mobile + Desktop)
  function setupSidebarInteractions() {
    const sidebar = document.getElementById("pm-sidebar");
    const toggleBtn = document.getElementById("pm-sidebar-toggle-btn");
    const closeBtn = document.getElementById("pm-sidebar-close-btn");
    const backdrop = document.getElementById("pm-sidebar-backdrop");
    const body = document.body;

    const isDesktop = () => window.innerWidth >= 1200;

    // Load saved state (on desktop defaults to open unless user closed it)
    const savedCollapsed = localStorage.getItem("pm_nav_collapsed");
    let isCollapsed = isDesktop() ? savedCollapsed === "true" : true;

    function updateState() {
      if (isCollapsed) {
        sidebar.classList.add("collapsed");
        body.classList.remove("pm-sidebar-expanded");
        body.classList.add("pm-sidebar-collapsed");
        toggleBtn.style.display = "inline-flex";
        backdrop.classList.remove("active");
      } else {
        sidebar.classList.remove("collapsed");
        if (isDesktop()) {
          body.classList.add("pm-sidebar-expanded");
          body.classList.remove("pm-sidebar-collapsed");
          toggleBtn.style.display = "none";
          backdrop.classList.remove("active");
        } else {
          toggleBtn.style.display = "none";
          backdrop.classList.add("active");
        }
      }
    }

    toggleBtn.addEventListener("click", () => {
      isCollapsed = false;
      if (isDesktop()) localStorage.setItem("pm_nav_collapsed", "false");
      updateState();
    });

    closeBtn.addEventListener("click", () => {
      isCollapsed = true;
      if (isDesktop()) localStorage.setItem("pm_nav_collapsed", "true");
      updateState();
    });

    backdrop.addEventListener("click", () => {
      isCollapsed = true;
      updateState();
    });

    window.addEventListener("resize", () => {
      if (!isDesktop() && !isCollapsed) {
        backdrop.classList.add("active");
        body.classList.remove("pm-sidebar-expanded");
      } else if (isDesktop() && !isCollapsed) {
        backdrop.classList.remove("active");
        body.classList.add("pm-sidebar-expanded");
        toggleBtn.style.display = "none";
      }
    });

    updateState();
  }

  // ScrollSpy for in-page TOC anchors
  function setupScrollSpy() {
    const tocLinks = document.querySelectorAll(".pm-toc-sublink");
    if (!tocLinks.length) return;

    const sections = Array.from(tocLinks)
      .map((link) => {
        const id = link.getAttribute("data-target");
        return document.getElementById(id);
      })
      .filter(Boolean);

    function onScroll() {
      const scrollPos = window.scrollY + 140;
      let activeId = null;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.offsetTop <= scrollPos) {
          activeId = sec.getAttribute("id");
          break;
        }
      }

      tocLinks.forEach((link) => {
        if (link.getAttribute("data-target") === activeId) {
          link.classList.add("active-toc");
        } else {
          link.classList.remove("active-toc");
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Init
  function init() {
    injectStyles();
    const activeLesson = getActiveLesson();
    renderSidebar(activeLesson);
    setupTheme();
    setupSidebarInteractions();
    setupScrollSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
