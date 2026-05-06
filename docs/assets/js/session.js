/* ===========================
   session.js — Sidebar, TOC, prev/next links
   =========================== */
(async function () {

  const base = document.querySelector('meta[name="base-path"]')?.content || '';

  // ---- Load sessions.json ----
  let sessions = [];
  try {
    const res = await fetch(base + '/data/sessions.json');
    if (res.ok) sessions = await res.json();
  } catch {}

  if (!sessions.length) return;

  const meta = window.SESSION_META;

  // ---- Build sidebar ----
  buildSidebar(sessions, meta);

  // ---- Build TOC ----
  buildTOC();

  // ---- Build prev/next ----
  if (meta) buildPrevNext(sessions, meta);

  // ---- Scroll-spy for TOC ----
  initScrollSpy();

  function buildSidebar(sessions, meta) {
    const sidebar = document.getElementById('session-sidebar');
    if (!sidebar) return;

    const sections = [
      { id: 'beginner', label: 'Beginner', sessions: sessions.filter(s => s.section === 'beginner') },
      { id: 'intermediate', label: 'Intermediate', sessions: sessions.filter(s => s.section === 'intermediate') },
      { id: 'expert', label: 'Expert', sessions: sessions.filter(s => s.section === 'expert') },
    ];

    sidebar.innerHTML = sections.map(sec => `
      <div class="sidebar-section">
        <div class="sidebar-section-title">${sec.label}</div>
        <ul class="sidebar-session-list">
          ${sec.sessions.map(s => {
            const passed = window.Progress ? Progress.isQuizPassed(s.id) : false;
            const active = meta && s.id === meta.id;
            return `<li class="sidebar-session-item${active ? ' active' : ''}">
              <a href="${base}/sessions/${s.section}/${s.slug}.html">
                <span class="s-check${passed ? ' done' : ''}"><i class="ri-check-line"></i></span>
                <span class="s-num">${String(s.id).padStart(2,'0')}</span>
                <span>${s.title}</span>
              </a>
            </li>`;
          }).join('')}
        </ul>
      </div>
    `).join('');
  }

  function buildTOC() {
    const tocEl = document.getElementById('session-toc');
    if (!tocEl) return;

    const headings = document.querySelectorAll('.session-main h2, .session-main h3');
    if (!headings.length) return;

    let html = '<p class="toc-title">On This Page</p><ul class="toc-list">';
    headings.forEach((h, i) => {
      if (!h.id) h.id = 'heading-' + i;
      const isH3 = h.tagName === 'H3';
      html += `<li><a href="#${h.id}" class="${isH3 ? 'toc-h3' : ''}">${h.textContent.replace(/[#⚡🔧📌✅]/g, '').trim()}</a></li>`;
    });
    html += '</ul>';
    tocEl.innerHTML = html;
  }

  function buildPrevNext(sessions, meta) {
    const navEl = document.getElementById('session-nav');
    if (!navEl) return;

    const idx = sessions.findIndex(s => s.id === meta.id);
    const prev = idx > 0 ? sessions[idx - 1] : null;
    const next = idx < sessions.length - 1 ? sessions[idx + 1] : null;

    navEl.innerHTML = `
      <div class="session-nav">
        ${prev
          ? `<a href="${base}/sessions/${prev.section}/${prev.slug}.html" class="session-nav-btn">
               <i class="ri-arrow-left-line"></i>
               <div><span class="nav-label">Previous</span><span class="nav-title">${prev.title}</span></div>
             </a>`
          : '<span></span>'}
        ${next
          ? `<a href="${base}/sessions/${next.section}/${next.slug}.html" class="session-nav-btn next">
               <i class="ri-arrow-right-line"></i>
               <div><span class="nav-label">Next</span><span class="nav-title">${next.title}</span></div>
             </a>`
          : '<span></span>'}
      </div>
    `;
  }

  function initScrollSpy() {
    const tocLinks = document.querySelectorAll('.toc-list a');
    if (!tocLinks.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const link = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-60px 0px -70% 0px' });

    document.querySelectorAll('.session-main h2, .session-main h3').forEach(h => observer.observe(h));
  }

})();
