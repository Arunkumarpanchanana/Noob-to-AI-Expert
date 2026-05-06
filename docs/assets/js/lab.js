/* ===== LAB ENGINE ===== */

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initRevealBlocks();
  initLabTracking();
});

function initCopyButtons() {
  // Add copy buttons to all pre > code blocks that don't have one
  document.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    pre.style.position = 'relative';
    pre.appendChild(btn);
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      const text = code ? code.innerText : pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
      } catch {
        btn.textContent = 'Error';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    });
  });
}

function initRevealBlocks() {
  document.querySelectorAll('.reveal-question').forEach(q => {
    q.addEventListener('click', () => {
      const answer = q.nextElementSibling;
      if (!answer) return;
      const isOpen = answer.style.display === 'block';
      answer.style.display = isOpen ? 'none' : 'block';
      const icon = q.querySelector('.reveal-icon');
      if (icon) icon.textContent = isOpen ? '▼' : '▲';
    });
  });
}

function initLabTracking() {
  document.querySelectorAll('.btn-colab, [data-track="lab-start"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sid = window.SESSION_META?.id;
      if (sid && window.Progress) Progress.markLabStarted(sid);
    });
  });
}

// Reinit Prism for dynamically shown content
function reinitPrism() {
  if (window.Prism) Prism.highlightAll();
  initCopyButtons();
}

window.LabEngine = { reinitPrism, initCopyButtons };
