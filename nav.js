/**
 * nav.js — Shared Dynamic Collapsible Navigation & Mobile Responsive Engine
 * for MEN412 Project Management in Engineering HTML Study Notes
 * Standardized under the project-html-notes skill.
 *
 * Features:
 * - Dynamic Left-Side Collapsible Sidebar (Desktop persistent rail + Mobile slide-over drawer)
 * - Auto-detection of active lesson from filename or body data-lesson
 * - Automatic In-Page Table of Contents (TOC) with ScrollSpy for section anchors (#sec1, #s1, etc.)
 * - Integrated Dark/Light Study Mode Theme Controller (synced with localStorage & page toggles)
 * - Universal Mobile / Phone Layout Engine:
 *     * Injects integrated hamburger menu into top bar on mobile (no button overlap)
 *     * Automatically wraps all bare tables in responsive horizontal touch-scroll containers
 *     * Automatically wraps wide SVG diagrams in pinch/swipe-friendly containers with swipe hints
 *     * Sticky activity column for complex Gantt charts on mobile
 *     * Eliminates mobile horizontal blowouts with strict viewport bounding
 *     * Auto-dismisses mobile drawer on link navigation
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
    },
    {
      id: "figures_w1_w6",
      file: "figures_w1_w6.html",
      week: "Atlas",
      title: "Figures & Shapes W1–W6",
      icon: "📊",
      summary: "All course diagrams, models & figures from Weeks 1 to 6"
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

  // Inject Comprehensive Navigation & Responsive Mobile Styles
  function injectStyles() {
    if (document.getElementById("pm-nav-styles")) return;

    const style = document.createElement("style");
    style.id = "pm-nav-styles";
    style.textContent = `
      :root {
        --pm-sidebar-w: 290px;
        --pm-sidebar-bg: rgba(255, 255, 255, 0.95);
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

      /* ===================================================================
         Universal SVG & Diagram Contrast Overrides for Dark Study Mode
         ==================================================================== */
      /* Global Dark Mode Arrowheads and Markers */
      html.dark svg marker path[fill="#1e293b"],
      html.dark svg marker path[fill="#334155"],
      html.dark svg marker path[fill="#475569"],
      html.dark svg marker path[fill="#0f172a"],
      html.dark svg marker path[fill="#000000"],
      [data-theme="dark"] svg marker path[fill="#1e293b"],
      [data-theme="dark"] svg marker path[fill="#334155"],
      [data-theme="dark"] svg marker path[fill="#475569"],
      [data-theme="dark"] svg marker path[fill="#0f172a"],
      [data-theme="dark"] svg marker path[fill="#000000"] {
        fill: #94a3b8 !important;
      }

      /* Global Dark Mode Connector Lines and Dependency Arrows */
      html.dark svg line[stroke="#1e293b"],
      html.dark svg line[stroke="#334155"],
      html.dark svg line[stroke="#475569"],
      html.dark svg line[stroke="#0f172a"],
      html.dark svg line[stroke="#000000"],
      html.dark svg path.dep-arrow,
      html.dark svg line.dep-arrow,
      html.dark svg line.sg-arr-line,
      html.dark svg line.seq-arr-line,
      html.dark svg path.seq-arr-line,
      [data-theme="dark"] svg line[stroke="#1e293b"],
      [data-theme="dark"] svg line[stroke="#334155"],
      [data-theme="dark"] svg line[stroke="#475569"],
      [data-theme="dark"] svg line[stroke="#0f172a"],
      [data-theme="dark"] svg line[stroke="#000000"],
      [data-theme="dark"] svg path.dep-arrow,
      [data-theme="dark"] svg line.dep-arrow,
      [data-theme="dark"] svg line.sg-arr-line,
      [data-theme="dark"] svg line.seq-arr-line,
      [data-theme="dark"] svg path.seq-arr-line {
        stroke: #94a3b8 !important;
      }

      /* Named Marker Overrides in Dark Mode */
      html.dark #arr65 path, [data-theme="dark"] #arr65 path,
      html.dark #fsA path, [data-theme="dark"] #fsA path,
      html.dark #sgArr path, [data-theme="dark"] #sgArr path,
      html.dark #seqArr path, [data-theme="dark"] #seqArr path,
      html.dark #seqStart path, [data-theme="dark"] #seqStart path,
      html.dark #f57Arr path, [data-theme="dark"] #f57Arr path,
      html.dark #arrFunnel path, [data-theme="dark"] #arrFunnel path {
        fill: #94a3b8 !important;
      }

      html.dark #seqArrRed path, [data-theme="dark"] #seqArrRed path,
      html.dark #seqStartRed path, [data-theme="dark"] #seqStartRed path {
        fill: #fb7185 !important;
      }

      /* Figure 3.1 Dark Mode Overrides (Strategy Cascade) */
      html.dark .w3-role-box, [data-theme="dark"] .w3-role-box { fill: rgba(59, 130, 246, 0.18) !important; stroke: #60a5fa !important; }
      html.dark .w3-role-text text, html.dark .w3-role-text, [data-theme="dark"] .w3-role-text text, [data-theme="dark"] .w3-role-text { fill: #93c5fd !important; }
      html.dark .w3-hier-box, [data-theme="dark"] .w3-hier-box { fill: rgba(16, 185, 129, 0.18) !important; stroke: #34d399 !important; }
      html.dark .w3-hier-text text, html.dark .w3-hier-text, [data-theme="dark"] .w3-hier-text text, [data-theme="dark"] .w3-hier-text { fill: #6ee7b7 !important; }
      html.dark .w3-input-box, [data-theme="dark"] .w3-input-box { fill: rgba(245, 158, 11, 0.18) !important; stroke: #fbbf24 !important; }
      html.dark .w3-input-text text, html.dark .w3-input-text, [data-theme="dark"] .w3-input-text text, [data-theme="dark"] .w3-input-text { fill: #fde68a !important; }
      html.dark .w3-arr-down line, html.dark .w3-arr-down, [data-theme="dark"] .w3-arr-down line, [data-theme="dark"] .w3-arr-down { stroke: #34d399 !important; }
      html.dark #arrD path, [data-theme="dark"] #arrD path { fill: #34d399 !important; }
      html.dark .w3-text-down text, html.dark .w3-text-down, [data-theme="dark"] .w3-text-down text, [data-theme="dark"] .w3-text-down { fill: #a7f3d0 !important; }
      html.dark .w3-arr-up line, html.dark .w3-arr-up, [data-theme="dark"] .w3-arr-up line, [data-theme="dark"] .w3-arr-up { stroke: #fbbf24 !important; }
      html.dark #arrU path, [data-theme="dark"] #arrU path { fill: #fbbf24 !important; }
      html.dark .w3-text-up text, html.dark .w3-text-up, [data-theme="dark"] .w3-text-up text, [data-theme="dark"] .w3-text-up { fill: #fde68a !important; }
      html.dark .w3-arr-horiz line, html.dark .w3-arr-horiz, [data-theme="dark"] .w3-arr-horiz line, [data-theme="dark"] .w3-arr-horiz { stroke: #60a5fa !important; }
      html.dark #arrB path, html.dark #arrBL path, [data-theme="dark"] #arrB path, [data-theme="dark"] #arrBL path { fill: #60a5fa !important; }

      /* Global Mobile Safety */
      html, body {
        max-width: 100vw;
        overflow-x: hidden;
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
        width: min(var(--pm-sidebar-w), 86vw);
        background-color: var(--pm-sidebar-bg);
        border-right: 1px solid var(--pm-sidebar-border);
        box-shadow: var(--pm-sidebar-shadow);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }

      #pm-sidebar.collapsed {
        transform: translateX(-100%);
      }

      /* Backdrop Overlay on Mobile */
      #pm-sidebar-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 9990;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      #pm-sidebar-backdrop.active {
        opacity: 1;
        pointer-events: auto;
      }

      /* Integrated Menu Button in Topbar */
      .pm-topbar-menu-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 9px;
        border-radius: 7px;
        background: var(--pm-sidebar-active-bg);
        border: 1px solid var(--pm-sidebar-active-border);
        color: var(--pm-sidebar-active-border);
        cursor: pointer;
        font-size: 11.5px;
        font-weight: 700;
        transition: all 0.15s ease;
        flex-shrink: 0;
        margin-right: 6px;
      }
      .pm-topbar-menu-btn:hover {
        opacity: 0.9;
        transform: scale(0.98);
      }

      /* Floating Fallback Button (visible when no topbar is present or on desktop collapse) */
      #pm-sidebar-toggle-btn {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 9980;
        display: none;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 9999px;
        background: var(--pm-sidebar-bg);
        border: 1px solid var(--pm-sidebar-border);
        color: var(--pm-sidebar-ink);
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(8px);
        cursor: pointer;
        font-size: 12px;
        font-weight: 700;
        transition: all 0.2s ease;
      }
      #pm-sidebar-toggle-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
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
        padding: 9px 12px;
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

      /* Table Scroll Wrap & Indicator */
      .pm-table-scroll-wrap {
        width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        margin: 1.25rem 0 !important;
        border-radius: 0.75rem !important;
        position: relative;
      }
      .pm-swipe-hint {
        display: none;
        align-items: center;
        gap: 5px;
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--pm-sidebar-muted);
        margin-bottom: 5px;
        padding: 2px 6px;
      }

      /* SVG Diagram Touch Scroll Wrapper */
      .pm-svg-scroll-wrap {
        width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        border-radius: 0.75rem !important;
        margin: 1.25rem 0 !important;
        padding: 4px 0 !important;
      }

      /* Sticky Gantt Activity Label Column on Mobile */
      .gantt-grid-table td.act-label {
        position: sticky !important;
        left: 0 !important;
        z-index: 5 !important;
        background-color: var(--bg-card, #ffffff) !important;
        box-shadow: 2px 0 6px rgba(0, 0, 0, 0.06);
      }

      /* ========================================================
         MOBILE PHONE RESPONSIVE ENHANCEMENTS (< 768px & < 640px)
         ======================================================== */
      @media (max-width: 768px) {
        .pm-swipe-hint {
          display: inline-flex !important;
        }

        /* Topbar Header Text Truncation on Phone */
        .sticky.top-0 .truncate,
        .topbar .truncate {
          max-width: calc(100vw - 180px) !important;
          font-size: 12.5px !important;
        }

        /* Section horizontal scroll pill list without chunky scrollbar */
        .sticky.top-0 div[class*="overflow-x-auto"],
        .topbar div[class*="overflow-x-auto"] {
          scrollbar-width: none !important;
          -webkit-overflow-scrolling: touch !important;
        }
        .sticky.top-0 div[class*="overflow-x-auto"]::-webkit-scrollbar,
        .topbar div[class*="overflow-x-auto"]::-webkit-scrollbar {
          display: none !important;
        }

        /* Table cell touch density */
        .study-table th, .study-table td,
        .roadmap-table th, .roadmap-table td {
          padding: 7px 9px !important;
          font-size: 12px !important;
        }
      }

      @media (max-width: 640px) {
        /* Mobile note-card padding compression */
        .note-card, article.note-card {
          padding: 1rem !important;
          border-radius: 0.85rem !important;
        }

        /* Header hero responsive compression */
        header.max-w-6xl {
          padding-top: 1rem !important;
          padding-bottom: 0.75rem !important;
        }
        header h1 {
          font-size: 1.65rem !important;
          line-height: 1.2 !important;
          margin-bottom: 0.5rem !important;
        }
        header p {
          font-size: 0.92rem !important;
          line-height: 1.5 !important;
        }

        /* Callouts on phone */
        .callout-quote, .callout-teach, .callout-read, .callout-trap {
          padding: 0.75rem 0.9rem !important;
          margin: 0.75rem 0 !important;
          font-size: 0.88rem !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
        }

        /* Section Numbers */
        .sec-num {
          width: 1.9rem !important;
          height: 1.9rem !important;
          font-size: 0.95rem !important;
          margin-right: 0.5rem !important;
        }

        /* Spacing in Main */
        main.space-y-12 {
          gap: 1.75rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Scan in-page sections for Table of Contents
  function getInPageSections() {
    const sections = [];
    const sectionEls = document.querySelectorAll("main section[id], section[id], article section[id]");
    sectionEls.forEach((el) => {
      const id = el.getAttribute("id");
      if (!id) return;
      const h = el.querySelector("h1, h2, h3, h4");
      let title = h ? h.textContent.trim() : id;
      title = title.replace(/^[0-9IVX]+\s*[•·\-\.]\s*/, "").trim();
      if (title.length > 38) {
        title = title.substring(0, 36) + "…";
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

      <!-- Floating Open Button (Fallback when topbar button is scrolled or absent) -->
      <button id="pm-sidebar-toggle-btn" type="button" aria-label="Toggle navigation menu">
        <span>📖</span>
        <span id="pm-toggle-btn-text">Course Menu</span>
      </button>

      <!-- Sidebar -->
      <aside id="pm-sidebar" class="collapsed" aria-label="Course navigation">
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
          <button id="pm-sidebar-close-btn" type="button" style="background: transparent; border: none; font-size: 18px; cursor: pointer; color: var(--pm-sidebar-muted); padding: 4px 8px; border-radius: 6px;" title="Collapse sidebar">
            ✕
          </button>
        </div>

        <!-- Instructor & Term Credit -->
        <div style="padding: 8px 16px; background-color: rgba(148, 163, 184, 0.08); border-bottom: 1px solid var(--pm-sidebar-border); font-size: 11px; color: var(--pm-sidebar-muted); display: flex; align-items: center; justify-content: space-between;">
          <span>Prof. Dr. Naghdali Choupani</span>
          <span style="font-weight: 700;">Fall Semester</span>
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
        <div style="padding: 12px 16px; border-top: 1px solid var(--pm-sidebar-border); display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px;">
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

    const mountDiv = document.createElement("div");
    mountDiv.id = "pm-navigation-mount";
    mountDiv.innerHTML = sidebarHtml;
    document.body.prepend(mountDiv);
  }

  // Setup Dynamic Mobile Topbar Integration
  function setupTopbarIntegration(toggleAction) {
    const topbar = document.querySelector(".sticky.top-0, .topbar");
    if (!topbar) return;

    const flexContainer = topbar.querySelector("div[class*='flex'], .topbar-inner");
    if (!flexContainer) return;

    if (document.getElementById("pm-topbar-menu-btn")) return;

    const btn = document.createElement("button");
    btn.id = "pm-topbar-menu-btn";
    btn.className = "pm-topbar-menu-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Toggle course navigation sidebar");
    btn.innerHTML = `<span style="font-size:14px;">☰</span><span>Menu</span>`;
    btn.addEventListener("click", toggleAction);

    const leftTarget = flexContainer.querySelector("div[class*='flex'], .flex") || flexContainer;
    leftTarget.prepend(btn);
  }

  // Setup Theme Controller
  function setupTheme() {
    const root = document.documentElement;
    const themeBtn = document.getElementById("pm-sidebar-theme-toggle");
    const themeIcon = document.getElementById("pm-theme-icon");
    const themeLabel = document.getElementById("pm-theme-label");
    const pageThemeToggle = document.getElementById("themeToggle");
    const pageThemeIcon = document.getElementById("themeIcon");
    const pageThemeText = document.getElementById("themeText");

    function syncUI(isDark) {
      if (isDark) {
        if (themeIcon) themeIcon.textContent = "☀️";
        if (themeLabel) themeLabel.textContent = "Light Mode";
        if (pageThemeIcon) pageThemeIcon.textContent = "☀️";
        if (pageThemeText) pageThemeText.textContent = "Light Notebook Mode";
      } else {
        if (themeIcon) themeIcon.textContent = "🌙";
        if (themeLabel) themeLabel.textContent = "Dark Mode";
        if (pageThemeIcon) pageThemeIcon.textContent = "🌙";
        if (pageThemeText) pageThemeText.textContent = "Dark Study Mode";
      }
    }

    function applyTheme(theme) {
      const isDark = theme === "dark";
      if (isDark) {
        root.setAttribute("data-theme", "dark");
        root.classList.add("dark");
        localStorage.setItem("pm_theme", "dark");
      } else {
        root.removeAttribute("data-theme");
        root.classList.remove("dark");
        localStorage.setItem("pm_theme", "light");
      }
      syncUI(isDark);
    }

    function toggleTheme(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      const isDark = root.getAttribute("data-theme") === "dark";
      applyTheme(isDark ? "light" : "dark");
    }

    // Initialize from storage or attribute
    const saved = localStorage.getItem("pm_theme");
    const currentAttr = root.getAttribute("data-theme");
    if (saved === "dark" || currentAttr === "dark") {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }

    // Set tooltips explaining the "T" shortcut
    if (themeBtn) {
      themeBtn.title = "Toggle Light / Dark Study Mode (Press 'T')";
      themeBtn.onclick = toggleTheme;
    }

    if (pageThemeToggle) {
      pageThemeToggle.title = "Toggle Light / Dark Study Mode (Press 'T')";
      pageThemeToggle.onclick = toggleTheme;
    }

    // Observe data-theme changes to keep UI synchronized
    if (window.MutationObserver) {
      const observer = new MutationObserver(() => {
        const isDark = root.getAttribute("data-theme") === "dark";
        syncUI(isDark);
      });
      observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    }

    // Keyboard Shortcut: Press "T" or "t" to toggle dark mode
    document.addEventListener("keydown", (e) => {
      const target = e.target;
      const tag = target && target.tagName ? target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select" || (target && target.isContentEditable)) {
        return;
      }
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }
      if (e.key === "t" || e.key === "T") {
        toggleTheme(e);
      }
    });
  }

    // Setup Sidebar Toggle Behaviors (Mobile + Desktop)
  function setupSidebarInteractions() {
    const sidebar = document.getElementById("pm-sidebar");
    const toggleBtn = document.getElementById("pm-sidebar-toggle-btn");
    const closeBtn = document.getElementById("pm-sidebar-close-btn");
    const backdrop = document.getElementById("pm-sidebar-backdrop");
    const body = document.body;

    const isDesktop = () => window.innerWidth >= 1200;

    const savedCollapsed = localStorage.getItem("pm_nav_collapsed");
    let isCollapsed = isDesktop() ? savedCollapsed === "true" : true;

    function updateState() {
      if (isCollapsed) {
        sidebar.classList.add("collapsed");
        body.classList.remove("pm-sidebar-expanded");
        body.classList.add("pm-sidebar-collapsed");
        backdrop.classList.remove("active");
        if (isDesktop() && toggleBtn) {
          toggleBtn.style.display = "inline-flex";
        } else if (toggleBtn) {
          toggleBtn.style.display = "none";
        }
      } else {
        sidebar.classList.remove("collapsed");
        if (isDesktop()) {
          body.classList.add("pm-sidebar-expanded");
          body.classList.remove("pm-sidebar-collapsed");
          backdrop.classList.remove("active");
        } else {
          backdrop.classList.add("active");
        }
        if (toggleBtn) toggleBtn.style.display = "none";
      }
    }

    function toggleOpen() {
      isCollapsed = !isCollapsed;
      if (isDesktop()) {
        localStorage.setItem("pm_nav_collapsed", isCollapsed ? "true" : "false");
      }
      updateState();
    }

    function closeSidebar() {
      isCollapsed = true;
      if (isDesktop()) {
        localStorage.setItem("pm_nav_collapsed", "true");
      }
      updateState();
    }

    if (toggleBtn) toggleBtn.addEventListener("click", toggleOpen);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    if (backdrop) backdrop.addEventListener("click", closeSidebar);

    // Auto-close on mobile when any link is clicked
    document.querySelectorAll(".pm-nav-link, .pm-toc-sublink").forEach((link) => {
      link.addEventListener("click", () => {
        if (!isDesktop()) {
          closeSidebar();
        }
      });
    });

    setupTopbarIntegration(toggleOpen);

    window.addEventListener("resize", () => {
      if (!isDesktop() && !isCollapsed) {
        backdrop.classList.add("active");
        body.classList.remove("pm-sidebar-expanded");
      } else if (isDesktop() && !isCollapsed) {
        backdrop.classList.remove("active");
        body.classList.add("pm-sidebar-expanded");
      }
      updateState();
    });

    updateState();
  }

  // Dynamic Mobile Content Enhancer (Tables & Wide SVGs)
  function enhanceMobileContent() {
    // 1. Wrap all bare tables in responsive touch-scroll wrappers
    const tables = document.querySelectorAll("table:not(.pm-wrapped)");
    tables.forEach((tbl) => {
      const parent = tbl.parentElement;
      if (parent && (parent.classList.contains("overflow-x-auto") || parent.classList.contains("pm-table-scroll-wrap"))) {
        return;
      }
      tbl.classList.add("pm-wrapped");
      const wrapper = document.createElement("div");
      wrapper.className = "pm-table-scroll-wrap";

      const hint = document.createElement("div");
      hint.className = "pm-swipe-hint";
      hint.innerHTML = "<span>↔</span><span>Scroll table horizontally</span>";

      tbl.parentNode.insertBefore(wrapper, tbl);
      wrapper.appendChild(tbl);
      wrapper.parentNode.insertBefore(hint, wrapper);
    });

    // 2. Wrap wide SVGs in touch-scroll wrappers with swipe hints
    const svgs = document.querySelectorAll("svg:not(.pm-wrapped)");
    svgs.forEach((svg) => {
      const vb = svg.getAttribute("viewBox") || svg.getAttribute("viewbox") || "";
      let vbW = 0;
      if (vb) {
        const parts = vb.split(/[\s,]+/);
        if (parts.length >= 3) {
          vbW = parseFloat(parts[2]);
        }
      }

      if (vbW >= 480) {
        const parent = svg.parentElement;
        if (parent && (parent.classList.contains("overflow-x-auto") || parent.classList.contains("pm-svg-scroll-wrap"))) {
          return;
        }
        svg.classList.add("pm-wrapped");

        const wrapper = document.createElement("div");
        wrapper.className = "pm-svg-scroll-wrap";

        const inner = document.createElement("div");
        inner.style.minWidth = Math.min(vbW, 640) + "px";

        const hint = document.createElement("div");
        hint.className = "pm-swipe-hint";
        hint.innerHTML = "<span>👆</span><span>Swipe to inspect full diagram ↔</span>";

        svg.parentNode.insertBefore(wrapper, svg);
        wrapper.appendChild(hint);
        wrapper.appendChild(inner);
        inner.appendChild(svg);
      }
    });
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
    enhanceMobileContent();
    setupScrollSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
