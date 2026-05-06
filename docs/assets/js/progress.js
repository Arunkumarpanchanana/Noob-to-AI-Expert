/* ===========================
   progress.js — localStorage API
   =========================== */
const Progress = (() => {
  const KEY = 'noob2ai_progress';
  const TOTAL = 20;

  function _load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { version: 1, sessions: {} };
      return JSON.parse(raw);
    } catch { return { version: 1, sessions: {} }; }
  }

  function _save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }

  function _get(id) {
    const data = _load();
    return data.sessions[String(id)] || {};
  }

  function _set(id, patch) {
    const data = _load();
    const key = String(id);
    data.sessions[key] = Object.assign(data.sessions[key] || {}, patch);
    _save(data);
  }

  return {
    markViewed(id) { _set(id, { viewed: true }); },
    markLabStarted(id) { _set(id, { labStarted: true }); },
    markQuizPassed(id, score) { _set(id, { quizPassed: true, quizScore: score }); },
    markQuizAttempt(id, score) {
      const s = _get(id);
      _set(id, { quizScore: score, quizAttempts: (s.quizAttempts || 0) + 1 });
    },
    getSession(id) { return _get(id); },
    getAll() { return _load().sessions; },
    isViewed(id) { return !!_get(id).viewed; },
    isQuizPassed(id) { return !!_get(id).quizPassed; },
    getCompletionPercent() {
      const sessions = _load().sessions;
      let done = 0;
      for (let i = 1; i <= TOTAL; i++) {
        if (sessions[String(i)]?.quizPassed) done++;
      }
      return Math.round((done / TOTAL) * 100);
    },
    getViewedCount() {
      const sessions = _load().sessions;
      let n = 0;
      for (const s of Object.values(sessions)) { if (s.viewed) n++; }
      return n;
    },
    getPassedCount() {
      const sessions = _load().sessions;
      let n = 0;
      for (const s of Object.values(sessions)) { if (s.quizPassed) n++; }
      return n;
    },
    reset() { localStorage.removeItem(KEY); },
  };
})();

window.Progress = Progress;
