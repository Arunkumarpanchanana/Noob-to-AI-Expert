/* ===== PROGRESS TRACKING ===== */
const Progress = (() => {
  const KEY = 'noob2ai_progress';
  const VERSION = 1;

  function _default() {
    return { version: VERSION, lastVisited: null, sessions: {} };
  }

  function get() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return _default();
      const data = JSON.parse(raw);
      if (data.version !== VERSION) return _default();
      return data;
    } catch {
      return _default();
    }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }

  function getSession(id) {
    const data = get();
    return data.sessions[String(id)] || {};
  }

  function markViewed(id) {
    const data = get();
    const sid = String(id);
    data.sessions[sid] = { ...data.sessions[sid] || {}, viewed: true };
    data.lastVisited = sid;
    save(data);
  }

  function markLabStarted(id) {
    const data = get();
    const sid = String(id);
    data.sessions[sid] = { ...data.sessions[sid] || {}, labStarted: true };
    save(data);
  }

  function markQuizPassed(id, score) {
    const data = get();
    const sid = String(id);
    const existing = data.sessions[sid] || {};
    const attempts = (existing.attempts || 0) + 1;
    data.sessions[sid] = {
      ...existing,
      quizPassed: true,
      quizScore: score,
      attempts,
      completedAt: new Date().toISOString().split('T')[0]
    };
    save(data);
    document.dispatchEvent(new CustomEvent('quizPassed', { detail: { id, score } }));
  }

  function markQuizAttempted(id, score) {
    const data = get();
    const sid = String(id);
    const existing = data.sessions[sid] || {};
    const attempts = (existing.attempts || 0) + 1;
    data.sessions[sid] = {
      ...existing,
      quizScore: Math.max(existing.quizScore || 0, score),
      attempts,
      quizPassed: existing.quizPassed || false
    };
    save(data);
  }

  function getCompletionPercent() {
    const data = get();
    const passed = Object.values(data.sessions).filter(s => s.quizPassed).length;
    return Math.round((passed / 20) * 100);
  }

  function getCompletedCount() {
    const data = get();
    return Object.values(data.sessions).filter(s => s.quizPassed).length;
  }

  function getLastVisitedId() {
    return get().lastVisited;
  }

  function reset() {
    if (confirm('Reset all course progress? This cannot be undone.')) {
      localStorage.removeItem(KEY);
      document.dispatchEvent(new Event('progressReset'));
      location.reload();
    }
  }

  return { get, getSession, markViewed, markLabStarted, markQuizPassed, markQuizAttempted, getCompletionPercent, getCompletedCount, getLastVisitedId, reset };
})();

window.Progress = Progress;
