/* ===== SESSION PAGE CONTROLLER ===== */

document.addEventListener('DOMContentLoaded', async () => {
  const meta = window.SESSION_META;
  if (!meta) return;

  // Mark session viewed
  if (window.Progress) Progress.markViewed(meta.id);

  // Load sessions data and build sidebar
  try {
    const res = await fetch('/data/sessions.json');
    const data = await res.json();
    buildSidebar(data, meta);
    buildNavButtons(data, meta);
  } catch (e) {
    console.warn('Could not load sessions.json', e);
  }

  // Build TOC
  buildTOC();

  // Init tabs
  initTabs();

  // Init quiz
  const quizContainer = document.getElementById('quiz-container');
  if (quizContainer && meta.quizData && meta.quizData.length > 0) {
    QuizEngine.init(meta.id, meta.quizData, quizContainer);
  }
});

function buildSidebar(data, meta) {
  const sidebar = document.getElementById('session-sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = '';
  data.sections.forEach(section => {
    const label = document.createElement('div');
    label.className = 'sidebar-section-label';
    const colors = { beginner: '#22c55e', intermediate: '#3b82f6', expert: '#a855f7' };
    label.style.color = colors[section.id] || '#64748b';
    label.textContent = section.label;
    sidebar.appendChild(label);

    section.sessions.forEach(s => {
      const state = window.Progress ? Progress.getSession(s.id) : {};
      const isActive = s.id === meta.id;
      const isPassed = state.quizPassed;

      const link = document.createElement('a');
      link.href = s.path;
      link.className = `sidebar-session-link ${isActive ? 'active' : ''} ${isPassed ? 'completed' : ''}`;

      const check = document.createElement('span');
      check.className = `sidebar-check ${isPassed ? 'done' : isActive ? 'active-dot' : ''}`;
      check.innerHTML = isPassed ? '✓' : isActive ? '•' : '';

      const num = document.createElement('span');
      num.className = 'sidebar-num';
      num.textContent = String(s.id).padStart(2, '0');

      const title = document.createElement('span');
      title.style.cssText = 'flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.82rem;';
      title.textContent = s.title;

      link.appendChild(check);
      link.appendChild(num);
      link.appendChild(title);
      sidebar.appendChild(link);
    });
  });
}

function buildTOC() {
  const toc = document.getElementById('toc');
  if (!toc) return;

  const headings = document.querySelectorAll('.learn-content h2, .learn-content h3');
  if (headings.length === 0) return;

  headings.forEach(h => {
    if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const link = document.createElement('a');
    link.href = `#${h.id}`;
    link.className = `toc-link ${h.tagName === 'H3' ? 'h3' : ''}`;
    link.textContent = h.textContent;
    toc.appendChild(link);
  });

  // Highlight active TOC entry on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = toc.querySelector(`a[href="#${id}"]`);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
}

function buildNavButtons(data, meta) {
  const allSessions = data.sections.flatMap(s => s.sessions);
  const idx = allSessions.findIndex(s => s.id === meta.id);

  const prevBtn = document.getElementById('prev-session');
  const nextBtn = document.getElementById('next-session');

  if (prevBtn && idx > 0) {
    const prev = allSessions[idx - 1];
    prevBtn.href = prev.path;
    prevBtn.querySelector('.nav-label') && (prevBtn.querySelector('.nav-label').textContent = `Session ${prev.id}`);
    prevBtn.querySelector('.nav-title') && (prevBtn.querySelector('.nav-title').textContent = prev.title);
  } else if (prevBtn) {
    prevBtn.style.visibility = 'hidden';
  }

  if (nextBtn && idx < allSessions.length - 1) {
    const next = allSessions[idx + 1];
    nextBtn.href = next.path;
    if (window.SESSION_META) window.SESSION_META.nextPath = next.path;
    nextBtn.querySelector('.nav-label') && (nextBtn.querySelector('.nav-label').textContent = `Session ${next.id}`);
    nextBtn.querySelector('.nav-title') && (nextBtn.querySelector('.nav-title').textContent = next.title);
  } else if (nextBtn) {
    nextBtn.style.visibility = 'hidden';
  }
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === target));
      tabPanels.forEach(p => {
        p.style.display = p.dataset.panel === target ? 'block' : 'none';
        if (p.dataset.panel === target) {
          // Re-run Prism on newly visible code blocks
          if (window.Prism) Prism.highlightAllUnder(p);
          if (window.LabEngine) LabEngine.initCopyButtons();
        }
      });
    });
  });
}
