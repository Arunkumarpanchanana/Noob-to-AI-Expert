/* ===== QUIZ ENGINE ===== */
const QuizEngine = (() => {

  let _questions = [];
  let _sessionId = null;
  let _answers = {}; // { qId: answer }
  let _submitted = false;
  let _container = null;

  function init(sessionId, questions, containerEl) {
    _sessionId = sessionId;
    _questions = questions;
    _container = containerEl;
    _answers = {};
    _submitted = false;
    _render();
  }

  function _render() {
    _container.innerHTML = '';

    // Intro card
    const intro = document.createElement('div');
    intro.className = 'quiz-intro';
    const totalPts = _questions.reduce((s, q) => s + (q.points || 1), 0);
    intro.innerHTML = `
      <div class="quiz-intro-icon">🧠</div>
      <div>
        <h3>Session Quiz</h3>
        <p>${_questions.length} questions · ${totalPts} points · Pass mark: 70%</p>
      </div>`;
    _container.appendChild(intro);

    // Questions
    _questions.forEach((q, idx) => {
      const el = _renderQuestion(q, idx);
      _container.appendChild(el);
    });

    // Submit
    const submitArea = document.createElement('div');
    submitArea.className = 'quiz-submit-area';
    submitArea.id = 'quiz-submit-area';
    submitArea.innerHTML = `<button class="quiz-submit-btn" id="quiz-submit-btn" disabled>Submit Quiz</button>`;
    _container.appendChild(submitArea);

    // Result panel
    const resultPanel = document.createElement('div');
    resultPanel.className = 'quiz-result-panel';
    resultPanel.id = 'quiz-result-panel';
    _container.appendChild(resultPanel);

    // Wire submit
    document.getElementById('quiz-submit-btn').addEventListener('click', _submitQuiz);
    _updateSubmitState();
  }

  function _renderQuestion(q, idx) {
    const div = document.createElement('div');
    div.className = 'quiz-question';
    div.dataset.qid = q.id;

    const typeLabel = { mcq: 'Single choice', multi: 'Multi select', truefalse: 'True / False', ordering: 'Ordering' };

    div.innerHTML = `
      <div class="quiz-q-header">
        <span class="quiz-q-num">Question ${idx + 1}</span>
        <span class="quiz-q-type">${typeLabel[q.type] || 'Question'}</span>
      </div>
      <p class="quiz-q-text">${q.question}</p>
      <div class="quiz-options-wrap" id="opts-${q.id}"></div>
      ${q.hint ? `<button class="hint-btn" onclick="this.nextElementSibling.classList.toggle('show')">💡 Show hint</button><div class="quiz-hint">${q.hint}</div>` : ''}
      <div class="quiz-explanation" id="exp-${q.id}"></div>`;

    const optsWrap = div.querySelector(`#opts-${q.id}`);

    if (q.type === 'mcq') {
      optsWrap.className = 'quiz-options';
      q.options.forEach(opt => {
        const lbl = document.createElement('label');
        lbl.className = 'quiz-option';
        lbl.dataset.qid = q.id;
        lbl.dataset.val = opt.id;
        lbl.innerHTML = `
          <span class="option-indicator">${opt.id.toUpperCase()}</span>
          <span class="option-text">${opt.text}</span>
          <input type="radio" name="q-${q.id}" value="${opt.id}" style="display:none">`;
        lbl.addEventListener('click', () => _selectMCQ(q.id, opt.id));
        optsWrap.appendChild(lbl);
      });
    } else if (q.type === 'multi') {
      optsWrap.className = 'quiz-options';
      q.options.forEach(opt => {
        const lbl = document.createElement('label');
        lbl.className = 'quiz-option';
        lbl.dataset.qid = q.id;
        lbl.dataset.val = opt.id;
        lbl.innerHTML = `
          <span class="option-indicator checkbox">${opt.id.toUpperCase()}</span>
          <span class="option-text">${opt.text}</span>
          <input type="checkbox" name="q-${q.id}" value="${opt.id}" style="display:none">`;
        lbl.addEventListener('click', () => _selectMulti(q.id, opt.id));
        optsWrap.appendChild(lbl);
      });
    } else if (q.type === 'truefalse') {
      optsWrap.className = 'quiz-tf-options';
      ['true', 'false'].forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'quiz-tf-btn';
        btn.textContent = val === 'true' ? '✓ True' : '✗ False';
        btn.dataset.qid = q.id;
        btn.dataset.val = val;
        btn.addEventListener('click', () => _selectTF(q.id, val));
        optsWrap.appendChild(btn);
      });
    }

    return div;
  }

  function _selectMCQ(qid, val) {
    if (_submitted) return;
    _answers[qid] = val;
    const opts = document.querySelectorAll(`[data-qid="${qid}"].quiz-option`);
    opts.forEach(o => { o.classList.remove('selected'); });
    const sel = document.querySelector(`[data-qid="${qid}"][data-val="${val}"]`);
    if (sel) sel.classList.add('selected');
    _updateSubmitState();
  }

  function _selectMulti(qid, val) {
    if (_submitted) return;
    if (!_answers[qid]) _answers[qid] = [];
    const idx = _answers[qid].indexOf(val);
    if (idx === -1) { _answers[qid].push(val); }
    else { _answers[qid].splice(idx, 1); }
    const opts = document.querySelectorAll(`[data-qid="${qid}"].quiz-option`);
    opts.forEach(o => { o.classList.toggle('selected', _answers[qid].includes(o.dataset.val)); });
    _updateSubmitState();
  }

  function _selectTF(qid, val) {
    if (_submitted) return;
    _answers[qid] = val;
    const btns = document.querySelectorAll(`[data-qid="${qid}"].quiz-tf-btn`);
    btns.forEach(b => { b.classList.remove('selected-true', 'selected-false'); });
    const sel = document.querySelector(`[data-qid="${qid}"][data-val="${val}"]`);
    if (sel) sel.classList.add(val === 'true' ? 'selected-true' : 'selected-false');
    _updateSubmitState();
  }

  function _updateSubmitState() {
    const btn = document.getElementById('quiz-submit-btn');
    if (!btn) return;
    const allAnswered = _questions.every(q => {
      if (q.type === 'multi') return _answers[q.id] && _answers[q.id].length > 0;
      return _answers[q.id] !== undefined;
    });
    btn.disabled = !allAnswered;
  }

  function _submitQuiz() {
    if (_submitted) return;
    _submitted = true;

    let earned = 0;
    let total = 0;

    _questions.forEach(q => {
      const pts = q.points || 1;
      total += pts;
      const answer = _answers[q.id];
      let correct = false;

      if (q.type === 'mcq') {
        const correctOpt = q.options.find(o => o.correct);
        correct = correctOpt && answer === correctOpt.id;
        q.options.forEach(opt => {
          const el = document.querySelector(`[data-qid="${q.id}"][data-val="${opt.id}"]`);
          if (!el) return;
          el.classList.remove('selected');
          if (opt.correct) el.classList.add('correct');
          else if (answer === opt.id && !opt.correct) el.classList.add('wrong');
        });
      } else if (q.type === 'multi') {
        const correctIds = q.options.filter(o => o.correct).map(o => o.id).sort().join(',');
        const givenIds = (answer || []).sort().join(',');
        correct = correctIds === givenIds;
        q.options.forEach(opt => {
          const el = document.querySelector(`[data-qid="${q.id}"][data-val="${opt.id}"]`);
          if (!el) return;
          el.classList.remove('selected');
          if (opt.correct && (answer || []).includes(opt.id)) el.classList.add('correct');
          else if (!opt.correct && (answer || []).includes(opt.id)) el.classList.add('wrong');
          else if (opt.correct && !(answer || []).includes(opt.id)) el.classList.add('correct-missed');
        });
      } else if (q.type === 'truefalse') {
        const correctVal = String(q.correctAnswer);
        correct = answer === correctVal;
        const btns = document.querySelectorAll(`[data-qid="${q.id}"].quiz-tf-btn`);
        btns.forEach(b => {
          b.classList.remove('selected-true', 'selected-false');
          if (b.dataset.val === correctVal) b.classList.add('correct');
          else if (b.dataset.val === answer) b.classList.add('wrong');
        });
      }

      if (correct) earned += pts;

      // Show explanation
      const expEl = document.getElementById(`exp-${q.id}`);
      if (expEl && q.explanation) {
        expEl.className = `quiz-explanation show ${correct ? 'correct-exp' : 'wrong-exp'}`;
        expEl.innerHTML = `<strong>${correct ? '✓ Correct!' : '✗ Incorrect'}</strong>${q.explanation}`;
      }

      // Mark question card
      const qCard = document.querySelector(`[data-qid="${q.id}"].quiz-question`);
      if (qCard) qCard.classList.add(correct ? 'answered-correct' : 'answered-wrong');
    });

    const score = Math.round((earned / total) * 100);
    const passed = score >= 70;

    // Save progress
    if (passed) Progress.markQuizPassed(_sessionId, score);
    else Progress.markQuizAttempted(_sessionId, score);

    // Show result
    _showResult(score, earned, total, passed);

    // Update submit button
    const submitBtn = document.getElementById('quiz-submit-btn');
    if (submitBtn) submitBtn.style.display = 'none';
  }

  function _showResult(score, earned, total, passed) {
    const panel = document.getElementById('quiz-result-panel');
    if (!panel) return;

    const nextSession = window.SESSION_META?.nextPath || null;

    panel.innerHTML = `
      <div class="score-circle ${passed ? 'pass' : 'fail'}">${score}%</div>
      <div class="quiz-result-title ${passed ? 'pass' : 'fail'}">${passed ? '🎉 Passed!' : 'Not quite yet'}</div>
      <p class="quiz-result-subtitle">${earned} / ${total} points · ${passed ? 'Great work! You\'ve completed this session.' : 'Score 70% or higher to pass. Review the material and try again!'}</p>
      <div class="quiz-result-actions">
        <button class="btn-retake" id="quiz-retake-btn">↩ Retake Quiz</button>
        ${nextSession ? `<a href="${nextSession}" class="btn-next-session">Next Session →</a>` : ''}
      </div>`;

    panel.classList.add('show');

    document.getElementById('quiz-retake-btn').addEventListener('click', () => {
      panel.classList.remove('show');
      panel.innerHTML = '';
      const submitBtn = document.getElementById('quiz-submit-btn');
      if (submitBtn) submitBtn.style.display = '';
      _render();
    });

    if (passed) _launchConfetti();
  }

  function _launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const colors = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];
    for (let i = 0; i < 60; i++) {
      const bit = document.createElement('div');
      bit.className = 'confetti-bit';
      bit.style.cssText = `
        left: ${Math.random() * 100}%;
        top: -20px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        width: ${6 + Math.random() * 6}px;
        height: ${6 + Math.random() * 6}px;
        animation-duration: ${1 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.5}s;`;
      container.appendChild(bit);
    }
    setTimeout(() => container.remove(), 3500);
  }

  return { init };
})();

window.QuizEngine = QuizEngine;
