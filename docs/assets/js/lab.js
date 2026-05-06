/* ===========================
   lab.js — Copy buttons, expandable labs, reveal blocks
   =========================== */
(function () {

  function init() {
    initCopyButtons();
    initLabSections();
    initRevealBlocks();
    if (window.SESSION_META?.id && window.Progress) {
      // Mark lab started when any lab section opened
      document.querySelectorAll('.lab-header').forEach(h => {
        h.addEventListener('click', () => {
          Progress.markLabStarted(SESSION_META.id);
        }, { once: true });
      });
    }
  }

  // ---- Copy buttons ----
  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const block = btn.closest('.code-block');
        const pre = block?.querySelector('pre');
        if (!pre) return;
        const text = pre.textContent || '';
        navigator.clipboard.writeText(text).then(() => {
          btn.classList.add('copied');
          const orig = btn.innerHTML;
          btn.innerHTML = '<i class="ri-check-line"></i> Copied!';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('copied');
          }, 2000);
        }).catch(() => {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 1500);
        });
      });
    });
  }

  // ---- Expandable lab sections ----
  function initLabSections() {
    document.querySelectorAll('.lab-section').forEach(section => {
      const header = section.querySelector('.lab-header');
      if (!header) return;

      // Only add JS click handler if no inline onclick exists
      if (!header.getAttribute('onclick')) {
        header.addEventListener('click', () => {
          section.classList.toggle('open');
        });
      }

      // Keyboard accessibility (always add)
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', 'false');
      header.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          section.classList.toggle('open');
        }
      });

      // Update aria-expanded on class change
      const obs = new MutationObserver(() => {
        header.setAttribute('aria-expanded', String(section.classList.contains('open')));
      });
      obs.observe(section, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // ---- Reveal blocks ----
  function initRevealBlocks() {
    document.querySelectorAll('.reveal-block').forEach(block => {
      const trigger = block.querySelector('.reveal-trigger');
      if (!trigger) return;

      if (!trigger.getAttribute('onclick')) {
        trigger.addEventListener('click', () => {
          block.classList.toggle('open');
        });
      }

      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          block.classList.toggle('open');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
