/* ===== MAIN SITE CONTROLLER ===== */

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('nav-placeholder', '/components/nav.html', initNav);
  loadComponent('footer-placeholder', '/components/footer.html', null);
  updateProgressPill();
});

async function loadComponent(placeholderId, url, callback) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    el.innerHTML = await res.text();
    if (callback) callback();
  } catch (e) {
    console.warn(`Could not load component ${url}`, e);
  }
}

function initNav() {
  // Highlight active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const isActive = path === href || (href !== '/' && path.startsWith(href));
    link.classList.toggle('active', isActive);
  });

  // Mobile menu toggle
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
  }

  // Update progress pill in nav
  updateProgressPill();
}

function updateProgressPill() {
  if (!window.Progress) return;
  const count = Progress.getCompletedCount();
  const pills = document.querySelectorAll('.nav-progress-count');
  pills.forEach(p => { p.textContent = `${count}/20 completed`; });
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
