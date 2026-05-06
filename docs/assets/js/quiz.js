/* ===========================
   quiz.js — Data-driven quiz engine
   =========================== */
(function () {
  const PASS_THRESHOLD = 70;

  function init() {
    const meta = window.SESSION_META;
    if (!meta?.quizData?.length) return;

    const container = document.getElementById('quiz-container');
    if (!container) return;

    render(container, meta);
  }

  function render(container, meta) {
    const questions = meta.quizData;
    let submitted = false;

    container.innerHTML = `
      <div class="quiz-section" id="quiz-section">
        <div class="quiz-header">
          <div class="quiz-title">
            <i class="ri-question-line"></i>
            Session Quiz
          </div>
          <div class="quiz-progress-text">${questions.length} question${questions.length > 1 ? 's' : ''} · 70% to pass</div>
        </div>
        <div class="quiz-body" id="quiz-body">
          ${questions.map((q, i) => renderQuestion(q, i)).join('')}
          <div class="quiz-submit-area">
            <button class="btn btn-primary" id="quiz-submit-btn" onclick="quizSubmit()">
              <i class="ri-check-line"></i> Submit Answers
            </button>
            <span id="quiz-validation-msg" class="text-sm text-muted" style="display:none">
              Please answer all questions first.
            </span>
          </div>
        </div>
        <div class="quiz-result" id="quiz-result"></div>
      </div>
    `;

    // Attach listeners
    container.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (submitted) return;
        const qIdx = opt.closest('[data-q]').dataset.q;
        const type = opt.dataset.type;

        if (type === 'multi') {
          opt.classList.toggle('selected');
          opt.querySelector('.option-marker').textContent = opt.classList.contains('selected') ? '✓' : '';
        } else {
          // Radio behaviour
          container.querySelectorAll(`[data-q="${qIdx}"] .quiz-option`).forEach(o => {
            o.classList.remove('selected');
            o.querySelector('.option-marker').textContent = '';
          });
          opt.classList.add('selected');
          opt.querySelector('.option-marker').textContent = '✓';
        }
      });
    });

    // Ordering drag
    container.querySelectorAll('.ordering-list').forEach(list => {
      initDragDrop(list);
    });

    window.quizSubmit = function () {
      if (submitted) return;

      // Validate all answered
      let allAnswered = true;
      questions.forEach((q, i) => {
        if (q.type === 'ordering') return;
        const answered = container.querySelectorAll(`[data-q="${i}"] .quiz-option.selected`).length > 0;
        if (!answered) allAnswered = false;
      });

      if (!allAnswered) {
        document.getElementById('quiz-validation-msg').style.display = 'inline';
        return;
      }

      document.getElementById('quiz-validation-msg').style.display = 'none';
      submitted = true;

      let totalPts = 0, earnedPts = 0;

      questions.forEach((q, i) => {
        totalPts += 1;
        const qEl = container.querySelector(`[data-q="${i}"]`);

        if (q.type === 'mcq' || q.type === 'truefalse') {
          const selected = qEl.querySelector('.quiz-option.selected');
          const correct = selected && selected.dataset.value === String(q.correct);
          if (correct) earnedPts += 1;

          qEl.querySelectorAll('.quiz-option').forEach(o => {
            o.setAttribute('disabled', '');
            if (o.dataset.value === String(q.correct)) o.classList.add('correct');
            else if (o.classList.contains('selected')) o.classList.add('wrong');
          });
        } else if (q.type === 'multi') {
          const correctSet = new Set(q.correct.map(String));
          const selectedEls = qEl.querySelectorAll('.quiz-option.selected');
          const selectedVals = new Set([...selectedEls].map(o => o.dataset.value));
          const isCorrect = setsEqual(correctSet, selectedVals);
          if (isCorrect) earnedPts += 1;

          qEl.querySelectorAll('.quiz-option').forEach(o => {
            o.setAttribute('disabled', '');
            const v = o.dataset.value;
            if (selectedVals.has(v) && correctSet.has(v)) o.classList.add('correct');
            else if (selectedVals.has(v) && !correctSet.has(v)) o.classList.add('wrong');
            else if (!selectedVals.has(v) && correctSet.has(v)) o.classList.add('missed');
          });
        } else if (q.type === 'ordering') {
          const items = qEl.querySelectorAll('.ordering-item');
          const order = [...items].map(el => el.dataset.value);
          const isCorrect = JSON.stringify(order) === JSON.stringify(q.correct);
          if (isCorrect) earnedPts += 1;
          items.forEach((el, idx) => {
            el.classList.add(el.dataset.value === q.correct[idx] ? 'correct' : 'wrong');
          });
        }

        // Show explanation
        const expEl = qEl.querySelector('.quiz-explanation');
        if (expEl) expEl.classList.add('visible');
      });

      const score = Math.round((earnedPts / totalPts) * 100);
      const passed = score >= PASS_THRESHOLD;

      // Save progress
      if (window.Progress && meta.id) {
        Progress.markQuizAttempt(meta.id, score);
        if (passed) Progress.markQuizPassed(meta.id, score);
      }

      // Disable submit
      document.getElementById('quiz-submit-btn').disabled = true;
      document.getElementById('quiz-submit-btn').textContent = 'Submitted';

      // Show result
      showResult(score, passed, earnedPts, totalPts, meta);

      if (passed) fireConfetti();
    };
  }

  function renderQuestion(q, i) {
    const typeLabel = { mcq: 'Multiple Choice', multi: 'Select All', truefalse: 'True / False', ordering: 'Ordering' }[q.type] || q.type;

    let optionsHtml = '';

    if (q.type === 'mcq' || q.type === 'truefalse') {
      optionsHtml = `<div class="quiz-options">
        ${q.options.map((opt, oi) => `
          <button class="quiz-option" data-value="${oi}" data-type="${q.type}">
            <span class="option-marker"></span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>`;
    } else if (q.type === 'multi') {
      optionsHtml = `<div class="quiz-options">
        ${q.options.map((opt, oi) => `
          <button class="quiz-option" data-value="${oi}" data-type="multi">
            <span class="option-marker"></span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>`;
    } else if (q.type === 'ordering') {
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      optionsHtml = `<ul class="ordering-list" id="order-list-${i}">
        ${shuffled.map((opt, oi) => `
          <li class="ordering-item" data-value="${opt}" draggable="true">
            <span class="drag-handle"><i class="ri-draggable"></i></span>
            <span class="order-num">${oi + 1}</span>
            <span>${opt}</span>
          </li>
        `).join('')}
      </ul>`;
    }

    return `
      <div class="quiz-question" data-q="${i}">
        <div class="question-number">
          Q${i + 1}
          <span class="question-type-tag">${typeLabel}</span>
        </div>
        <div class="question-text">${q.question}</div>
        ${optionsHtml}
        <div class="quiz-explanation">
          <strong><i class="ri-lightbulb-line"></i> Explanation</strong>
          ${q.explanation}
        </div>
      </div>
    `;
  }

  function showResult(score, passed, earned, total, meta) {
    const resultEl = document.getElementById('quiz-result');
    const nextLink = meta.nextSlug
      ? `<a href="${meta.nextSlug}" class="btn btn-primary"><i class="ri-arrow-right-line"></i> Next Session</a>`
      : `<a href="/" class="btn btn-primary"><i class="ri-home-line"></i> Back to Home</a>`;

    resultEl.innerHTML = `
      <div class="result-score ${passed ? 'pass' : 'fail'}">${score}%</div>
      <div class="result-label">${passed ? '🎉 Quiz Passed!' : '📚 Keep Practicing'}</div>
      <div class="result-subtext">${earned} of ${total} correct · ${passed ? 'You can move on to the next session.' : 'You need 70% to pass. Try again!'}</div>
      <div class="score-bar-wrap">
        <div class="score-bar-bg"><div class="score-bar-fill" style="width:${score}%"></div></div>
        <div class="score-bar-labels"><span>0%</span><span style="color:${passed?'var(--success)':'var(--error)'}">${score}%</span><span>100%</span></div>
      </div>
      ${passed ? `<div class="badge-earned"><span class="badge-emoji">🏅</span><span class="badge-name">Session ${meta.id} Complete</span></div>` : ''}
      <div class="result-actions">
        ${nextLink}
        <button class="btn btn-ghost" onclick="location.reload()">
          <i class="ri-refresh-line"></i> Retry
        </button>
      </div>
    `;
    resultEl.classList.add('visible');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function fireConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#818CF8','#38BDF8','#34D399','#FBBF24','#C084FC','#F87171'];
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${2 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.8}s;
      `;
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
  }

  function initDragDrop(list) {
    let dragged = null;

    list.addEventListener('dragstart', e => {
      dragged = e.target.closest('.ordering-item');
      setTimeout(() => dragged?.classList.add('dragging'), 0);
    });
    list.addEventListener('dragend', () => dragged?.classList.remove('dragging'));
    list.addEventListener('dragover', e => {
      e.preventDefault();
      const over = e.target.closest('.ordering-item');
      if (over && over !== dragged) {
        const rect = over.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (e.clientY < mid) list.insertBefore(dragged, over);
        else list.insertBefore(dragged, over.nextSibling);
        // Update order numbers
        list.querySelectorAll('.ordering-item').forEach((el, i) => {
          el.querySelector('.order-num').textContent = i + 1;
        });
      }
    });
  }

  function setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
