/* ===== MAIN SITE CONTROLLER ===== */

// Detect base path for GitHub Pages compatibility.
// On GitHub Pages the repo is at /Noob-to-AI-Expert/
// Locally it's at /
// Strategy: find the /assets/ segment in any script src to determine root.
(function () {
  let base = '';
  document.querySelectorAll('script[src]').forEach(s => {
    const m = s.src.match(/^(https?:\/\/[^/]+)(\/.*?)\/assets\//);
    if (m) base = m[2]; // e.g. '/Noob-to-AI-Expert' or ''
  });
  window.BASE_PATH = base; // '' for local, '/Noob-to-AI-Expert' for GH Pages
})();

function resolveUrl(path) {
  // path must start with '/', e.g. '/components/nav.html'
  return window.BASE_PATH + path;
}

// Rewrite all internal absolute href/src attributes after injecting HTML fragments
function rewriteLinks(el) {
  if (!window.BASE_PATH) return; // no prefix needed on local
  el.querySelectorAll('a[href], link[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (h && h.startsWith('/') && !h.startsWith('//') && !h.startsWith(window.BASE_PATH)) {
      a.setAttribute('href', window.BASE_PATH + h);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('nav-placeholder', resolveUrl('/components/nav.html'), initNav);
  loadComponent('footer-placeholder', resolveUrl('/components/footer.html'), null);
  updateProgressPill();
});

async function loadComponent(placeholderId, url, callback) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    el.innerHTML = await res.text();
    rewriteLinks(el); // Fix any absolute paths injected via HTML fragment
    if (callback) callback();
  } catch (e) {
    console.warn(`Could not load component: ${url}`, e);
  }
}

function initNav() {
  // Highlight active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    // Strip base path prefix for comparison
    const normalHref = href.replace(window.BASE_PATH, '') || '/';
    const normalPath = path.replace(window.BASE_PATH, '') || '/';
    const isActive = normalPath === normalHref || (normalHref !== '/' && normalPath.startsWith(normalHref));
    link.classList.toggle('active', isActive);
  });

  // Mobile menu toggle
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
  }

  updateProgressPill();
}

function updateProgressPill() {
  if (!window.Progress) return;
  const count = Progress.getCompletedCount();
  document.querySelectorAll('.nav-progress-count').forEach(p => {
    p.textContent = `${count}/20 completed`;
  });
}

// Smooth scroll for anchor links
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

window.loadComponent = loadComponent;
window.resolveUrl = resolveUrl;
window.rewriteLinks = rewriteLinks;
