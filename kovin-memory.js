/**
 * Kovin Technology Memory
 * A shared, dependency-free memory log (window.KovinMemory) that turns
 * scattered moments across the platform — a rejection, a consultation,
 * a life change — into one continuous journal.
 *
 * Kovin remembers decisions, not transactions. This module is the
 * place every page can write a decision to, and the place the Memory
 * page reads the whole journey back from.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'kovin-memory-log';

  var TYPE_META = {
    explored:              { label: 'Explored',               icon: '🔎', group: 'decisions' },
    rejected:              { label: 'Rejected',                icon: '✕',  group: 'decisions' },
    purchased:             { label: 'Purchased',                icon: '✓',  group: 'decisions' },
    consultation:          { label: 'Consultation',             icon: '💬', group: 'consultations' },
    life_mode_change:      { label: 'Life Mode Change',         icon: '◐',  group: 'diary' },
    confidence_change:     { label: 'Confidence Shift',         icon: '◎',  group: 'decisions' },
    ownership_milestone:   { label: 'Ownership Milestone',      icon: '✦',  group: 'milestones' },
    support:               { label: 'Support',                  icon: '🛟', group: 'consultations' },
    upgrade_recommendation:{ label: 'Upgrade Recommendation',   icon: '⏳', group: 'milestones' },
    second_opinion:        { label: 'Second Opinion',           icon: '⚖',  group: 'decisions' },
    horizon_check:         { label: 'Technology Horizon',       icon: '🧭', group: 'milestones' },
    decision_diary:        { label: 'Decision Diary',           icon: '📖', group: 'diary' },
  };

  /* ─────────── A believable, coherent journey — not a stock demo ─────────── */
  function seed() {
    return [
      { id: 'm1', type: 'explored', date: '2024-02-10', title: 'Explored Galaxy S23 FE and Pixel 7a', detail: 'Comparing a bigger, longer-lasting display against a noticeably stronger camera.' },
      { id: 'm2', type: 'rejected', date: '2024-02-14', title: 'Set aside the Pixel 7a', detail: 'The camera was genuinely excellent, but daily battery life mattered more for back-to-back days without a charger.', reason: 'Battery life weighed heavier than camera quality for daily reliability.' },
      { id: 'm3', type: 'consultation', date: '2024-03-02', title: 'Talked through Galaxy S23 FE vs Pixel 7a', detail: 'A direct WhatsApp conversation about which trade-off actually mattered, not a sales pitch.' },
      { id: 'm4', type: 'confidence_change', date: '2024-03-04', title: 'Confidence moved from Unsure to Confident', detail: 'Once battery and camera trade-offs were laid out plainly, the decision stopped feeling like a guess.', meta: { from: 'Unsure', to: 'Confident' } },
      { id: 'm5', type: 'purchased', date: '2024-03-08', title: 'Purchased Samsung Galaxy S23 FE', detail: 'Chosen for the screen, the battery, and four years of promised software support.', meta: { price: '₹34,999' } },
      { id: 'm6', type: 'ownership_milestone', date: '2024-03-09', title: 'Day Zero — set up and ready', detail: 'WhatsApp and Google account configured the same day. No second visit needed.' },
      { id: 'm7', type: 'decision_diary', date: '2024-04-15', title: 'A month in — no regrets about the camera trade', detail: 'Daylight shots have been more than enough; the longer battery life has mattered far more often than a sharper night shot would have.' },
      { id: 'm8', type: 'life_mode_change', date: '2024-07-02', title: 'Switched Life Mode to Work From Home', detail: 'Calls became a daily reality — recommendations shifted to favour call clarity and desk comfort.' },
      { id: 'm9', type: 'second_opinion', date: '2024-08-20', title: 'Second Opinion on a fitness smartwatch', detail: 'Honest verdict: skip it for now — the phone’s own health tracking already covered what was actually being used.' },
      { id: 'm10', type: 'support', date: '2024-09-11', title: 'Screen protector replaced', detail: 'Resolved free of charge under first-year care — a five-minute conversation, not a ticket number.' },
      { id: 'm11', type: 'horizon_check', date: '2024-10-05', title: 'Checked the Technology Horizon', detail: 'Upgrade window confirmed for 2026–2027, tied to when software support tapers off.' },
      { id: 'm12', type: 'upgrade_recommendation', date: '2024-12-18', title: 'No upgrade needed yet', detail: 'Still comfortably inside the software support window — Kovin said so plainly instead of suggesting an upgrade anyway.' },
      { id: 'm13', type: 'life_mode_change', date: '2025-03-11', title: 'Switched Life Mode to Travelling Frequently', detail: 'A run of business trips shifted priorities toward battery life and reliability over anything else.' },
      { id: 'm14', type: 'confidence_change', date: '2025-06-09', title: 'Confidence re-checked after a year of use', detail: 'Still rated Confident — nothing about daily use had changed the original trade-off.', meta: { from: 'Confident', to: 'Confident' } },
      { id: 'm15', type: 'ownership_milestone', date: '2025-09-08', title: '18 months in — battery health still strong', detail: 'No noticeable slowdown in daily charge cycles; nothing prompted a service visit.' },
      { id: 'm16', type: 'horizon_check', date: '2026-01-14', title: 'Technology Horizon revisited', detail: 'Upgrade window confirmed as still on track for 2026–2027 — nothing moved it earlier.' },
      { id: 'm17', type: 'explored', date: '2026-04-22', title: 'Explored the Galaxy S24 FE', detail: 'Just looking — curious what two years of progress actually changed, not ready to switch.' },
      { id: 'm18', type: 'second_opinion', date: '2026-05-30', title: 'Second Opinion on the Galaxy S24 FE', detail: 'Honest verdict: not yet — the current phone still has a comfortable year or more of life left in it.' },
    ];
  }

  function getLog() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var s = seed();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  function saveLog(entries) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch (e) {}
  }

  /**
   * Record a new moment. Any page on the platform can call this —
   * eliminate.html on a rejection, lifemode.html on a mode switch,
   * confidence.html on a score change, and so on.
   */
  function log(type, entry) {
    if (!TYPE_META[type]) return null;
    var entries = getLog();
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    var record = Object.assign({ id: 'log-' + Math.random().toString(36).slice(2, 10), type: type, date: dateStr }, entry);
    entries.push(record);
    saveLog(entries);
    return record;
  }

  function getTimeline(order) {
    var entries = getLog().slice();
    entries.sort(function (a, b) { return order === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date); });
    return entries;
  }

  function monthsSince(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    var now = new Date();
    return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  }

  /**
   * Three plain-language answers, computed from the actual log —
   * not fixed copy. Mirrors the questions the experience is meant to answer.
   */
  function getReflection() {
    var entries = getTimeline('asc');
    var modeChanges = entries.filter(function (e) { return e.type === 'life_mode_change'; });
    var rejections = entries.filter(function (e) { return e.type === 'rejected'; });
    var consultations = entries.filter(function (e) { return e.type === 'consultation' || e.type === 'second_opinion' || e.type === 'support'; });
    var horizonChecks = entries.filter(function (e) { return e.type === 'horizon_check'; });

    var needsChanged = modeChanges.length
      ? 'Your priorities have moved through ' + modeChanges.length + ' life change' + (modeChanges.length === 1 ? '' : 's') + ' — most recently toward "' + modeChanges[modeChanges.length - 1].title.replace('Switched Life Mode to ', '') + '."'
      : 'Your priorities have stayed steady since the start — nothing has pulled your needs in a new direction yet.';

    var learned = rejections.length
      ? 'You’ve ruled out ' + rejections.length + ' option' + (rejections.length === 1 ? '' : 's') + ' on purpose — most recently because ' + rejections[rejections.length - 1].detail.charAt(0).toLowerCase() + rejections[rejections.length - 1].detail.slice(1)
      : 'No options have needed ruling out yet — every choice so far has been a clear fit.';

    var kovinHelped = 'Kovin has been part of ' + consultations.length + ' real conversation' + (consultations.length === 1 ? '' : 's') + ' and ' + horizonChecks.length + ' Technology Horizon check' + (horizonChecks.length === 1 ? '' : 's') + ' along the way — context carried forward, never re-explained from zero.';

    return { needsChanged: needsChanged, learned: learned, kovinHelped: kovinHelped };
  }

  /**
   * Computed next steps — only suggested when the log actually supports them.
   */
  function getFutureSuggestions() {
    var entries = getTimeline('desc');
    var suggestions = [];

    var lastHorizon = entries.filter(function (e) { return e.type === 'horizon_check'; })[0];
    if (lastHorizon && monthsSince(lastHorizon.date) >= 5) {
      suggestions.push({ title: 'Revisit your Technology Horizon', detail: 'It has been ' + monthsSince(lastHorizon.date) + ' months since your last check — worth confirming the upgrade window still holds.', href: 'horizon.html' });
    }

    var recentExplored = entries.filter(function (e) { return e.type === 'explored'; })[0];
    var recentSecondOpinion = entries.filter(function (e) { return e.type === 'second_opinion'; })[0];
    if (recentExplored && (!recentSecondOpinion || recentExplored.date > recentSecondOpinion.date)) {
      suggestions.push({ title: 'Get a Second Opinion', detail: 'You explored something recently without a verdict yet — an honest read might settle it either way.', href: 'secondopinion.html' });
    }

    var lastConsultation = entries.filter(function (e) { return e.type === 'consultation' || e.type === 'second_opinion'; })[0];
    if (!lastConsultation || monthsSince(lastConsultation.date) >= 4) {
      suggestions.push({ title: 'Talk it through with Kovin', detail: 'It has been a while since your last conversation — a quick check-in costs nothing.', href: 'https://wa.me/917200006006' });
    }

    if (!suggestions.length) {
      suggestions.push({ title: 'Nothing urgent right now', detail: 'Everything in your journey is current — Kovin will speak up when something actually changes.', href: 'index.html' });
    }
    return suggestions;
  }

  window.KovinMemory = {
    TYPE_META: TYPE_META,
    log: log,
    getTimeline: getTimeline,
    getReflection: getReflection,
    getFutureSuggestions: getFutureSuggestions,
  };
})();
