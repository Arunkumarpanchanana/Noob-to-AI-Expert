/* ===========================
   main.js — Nav injection, theme, mobile menu
   =========================== */
(async function () {
  // ---- Base path (GitHub Pages support) ----
  const BASE = document.querySelector('meta[name="base-path"]')?.content || '';

  // Rewrite all internal absolute links to include the base path.
  // Runs immediately so links work before any user interaction.
  function rewriteLinks(root) {
    if (!BASE) return;
    (root || document).querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      // Only rewrite absolute paths that don't already have the base prefix
      if (h && h.startsWith('/') && !h.startsWith('//') && !h.startsWith(BASE)) {
        a.setAttribute('href', BASE + h);
      }
    });
  }

  // Rewrite links already in the page
  document.addEventListener('DOMContentLoaded', () => rewriteLinks(document));
  // Also rewrite immediately in case DOM is already ready
  if (document.readyState !== 'loading') rewriteLinks(document);

  // ---- Theme toggle ----
  const THEME_KEY = 'noob2ai_theme';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
    document.querySelectorAll('.theme-icon').forEach(el => {
      el.className = 'theme-icon ' + (t === 'light' ? 'ri-sun-line' : 'ri-moon-line');
    });
  }

  // ---- Inject nav ----
  const navHolder = document.getElementById('nav-placeholder');
  if (navHolder) {
    try {
      const res = await fetch(BASE + '/components/nav.html');
      if (res.ok) {
        navHolder.innerHTML = await res.text();
        rewriteLinks(navHolder); // Fix nav links too
        initNav();
      }
    } catch {}
  }

  // ---- Inject footer ----
  const footerHolder = document.getElementById('footer-placeholder');
  if (footerHolder) {
    try {
      const res = await fetch(BASE + '/components/footer.html');
      if (res.ok) {
        footerHolder.innerHTML = await res.text();
        rewriteLinks(footerHolder); // Fix footer links too
      }
    } catch {}
  }

  function initNav() {
    // Theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      btn.querySelector('.theme-icon')?.classList.add(current === 'light' ? 'ri-sun-line' : 'ri-moon-line');
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
      });
    });

    // Mobile menu
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        const open = mobileMenu.style.display === 'flex';
        mobileMenu.style.display = open ? 'none' : 'flex';
      });
    }

    // Active link highlight
    const path = window.location.pathname;
    document.querySelectorAll('.navbar-links a, .mobile-menu a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && path.includes(href.replace(BASE, '').replace(/^\//, ''))) {
        a.classList.add('active');
      }
    });

    updateTopProgress();
  }

  // ---- Top progress bar ----
  function updateTopProgress() {
    const bar = document.getElementById('top-progress');
    if (!bar || !window.Progress) return;
    bar.style.width = Progress.getCompletionPercent() + '%';
  }

  // ---- Page scroll progress (for session pages) ----
  const scrollBar = document.getElementById('top-progress');
  if (scrollBar && document.querySelector('.session-main')) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) scrollBar.style.width = ((scrolled / total) * 100) + '%';
    });
  }

  // ---- Mark session viewed ----
  if (window.SESSION_META?.id && window.Progress) {
    Progress.markViewed(SESSION_META.id);
    updateTopProgress();
  }

  // Expose for use by session.js
  window.BASE_PATH = BASE;
  window.rewriteLinks = rewriteLinks;
})();
