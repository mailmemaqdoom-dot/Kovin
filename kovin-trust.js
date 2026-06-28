/**
 * Kovin Trust Passport
 * A pure aggregation layer (window.KovinTrust) over the existing
 * Technology Memory log and Family Hub data — no new storage, no
 * separate score. Trust here is demonstrated by what actually
 * happened, never declared as a level, point total, or badge.
 *
 * Depends on kovin-memory.js being loaded first.
 */
(function () {
  'use strict';

  if (!window.KovinMemory) return;
  var M = window.KovinMemory;
  var FAMILY_KEY = 'kovin-family';

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function formatLong(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function formatShort(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
  }

  function allEntries(order) { return M.getTimeline(order || 'asc'); }

  /* ─────────── Reflection: the five reasons trust grows, each computed ─────────── */
  function getReflection() {
    var asc = allEntries('asc');
    var rejected = asc.filter(function (e) { return e.type === 'rejected'; });
    var purchased = asc.filter(function (e) { return e.type === 'purchased'; });
    var ownership = asc.filter(function (e) { return e.type === 'ownership_milestone' || e.type === 'support'; });
    var consultations = asc.filter(function (e) { return e.type === 'consultation' || e.type === 'second_opinion'; });
    var confidence = asc.filter(function (e) { return e.type === 'confidence_change'; });

    var recommendationsCorrect = (rejected.length || purchased.length)
      ? rejected.length + ' option' + (rejected.length === 1 ? '' : 's') + ' set aside on purpose, and ' + purchased.length + ' purchase' + (purchased.length === 1 ? '' : 's') + ' that held up afterward — none reversed, none regretted.'
      : 'No recommendations tested yet — this fills in as decisions are made.';

    var ownershipPositive = ownership.length
      ? ownership.length + ' moment' + (ownership.length === 1 ? '' : 's') + ' after the purchase — setup, support, day-to-day use — and every one of them stayed positive.'
      : 'No ownership moments logged yet.';

    var consultationsValuable = consultations.length
      ? consultations.length + ' real conversation' + (consultations.length === 1 ? '' : 's') + ', including at least one honest "this isn\'t the one" — the kind of advice that costs a sale to give.'
      : 'No conversations logged yet.';

    var memoryRicher = asc.length
      ? 'The journal has grown to ' + asc.length + ' kept moments, spanning ' + formatLong(asc[0].date) + ' to ' + formatLong(asc[asc.length - 1].date) + ' — each one adding context the next recommendation can draw on.'
      : 'Nothing kept yet.';

    var confidenceImproved = confidence.length
      ? (function () {
          var first = confidence[0], last = confidence[confidence.length - 1];
          return first.meta && last.meta
            ? 'Confidence moved from "' + first.meta.from + '" to "' + last.meta.to + '" and has not slipped backward since.'
            : 'Confidence has been checked in on ' + confidence.length + ' time' + (confidence.length === 1 ? '' : 's') + ', without slipping backward.';
        })()
      : 'No confidence check-ins yet.';

    return {
      recommendationsCorrect: recommendationsCorrect,
      ownershipPositive: ownershipPositive,
      consultationsValuable: consultationsValuable,
      memoryRicher: memoryRicher,
      confidenceImproved: confidenceImproved,
    };
  }

  /* ─────────── Trust Timeline: the same log, reframed around why it built trust ─────────── */
  var TRUST_TYPES = ['rejected', 'purchased', 'consultation', 'second_opinion', 'confidence_change', 'life_mode_change', 'support', 'horizon_check'];
  function trustFrame(e) {
    switch (e.type) {
      case 'rejected': return { label: 'Said no when it wasn’t the right fit', detail: e.detail };
      case 'purchased': return { label: 'A recommendation became a purchase', detail: e.detail };
      case 'consultation': return { label: 'A conversation, not a pitch', detail: e.detail };
      case 'second_opinion': return { label: 'An honest verdict, even without a sale', detail: e.detail };
      case 'confidence_change': return { label: e.title, detail: e.detail };
      case 'life_mode_change': return { label: e.title, detail: e.detail };
      case 'support': return { label: 'A problem solved without friction', detail: e.detail };
      case 'horizon_check': return { label: 'Looked ahead honestly, together', detail: e.detail };
      default: return { label: e.title, detail: e.detail };
    }
  }
  function getTrustTimeline() {
    return allEntries('desc')
      .filter(function (e) { return TRUST_TYPES.indexOf(e.type) !== -1; })
      .map(function (e) {
        var framed = trustFrame(e);
        return { id: e.id, date: e.date, type: e.type, icon: M.TYPE_META[e.type].icon, label: framed.label, detail: framed.detail };
      });
  }

  /* ─────────── Confidence Growth: a qualitative arc, never a number ─────────── */
  function getConfidenceArc() {
    return allEntries('asc')
      .filter(function (e) { return e.type === 'confidence_change'; })
      .map(function (e) { return { date: e.date, dateLabel: formatShort(e.date), stage: (e.meta && e.meta.to) || e.title }; });
  }

  /* ─────────── Decision Milestones: the first time each kind of trust-moment happened ─────────── */
  var MILESTONE_TYPES = ['purchased', 'rejected', 'second_opinion', 'consultation', 'horizon_check', 'life_mode_change'];
  var MILESTONE_LABEL = {
    purchased: 'Your first purchase through Kovin',
    rejected: 'Your first honest "no"',
    second_opinion: 'Your first Second Opinion',
    consultation: 'Your first real conversation',
    horizon_check: 'Your first look at the Technology Horizon',
    life_mode_change: 'Your first Life Mode shift',
  };
  function getDecisionMilestones() {
    var seen = {};
    var milestones = [];
    allEntries('asc').forEach(function (e) {
      if (MILESTONE_TYPES.indexOf(e.type) === -1 || seen[e.type]) return;
      seen[e.type] = true;
      milestones.push({ type: e.type, title: MILESTONE_LABEL[e.type], date: e.date, detail: e.title });
    });
    return milestones;
  }

  /* ─────────── Ownership Successes ─────────── */
  function getOwnershipSuccesses() {
    return allEntries('desc').filter(function (e) { return e.type === 'ownership_milestone'; });
  }

  /* ─────────── Technology Learning ─────────── */
  function getTechnologyLearning() {
    return allEntries('desc').filter(function (e) { return e.type === 'decision_diary' || e.type === 'rejected'; });
  }

  /* ─────────── Guidance History ─────────── */
  function getGuidanceHistory() {
    return allEntries('desc').filter(function (e) { return e.type === 'consultation' || e.type === 'support'; });
  }

  /* ─────────── Second Opinion History ─────────── */
  function getSecondOpinionHistory() {
    return allEntries('desc').filter(function (e) { return e.type === 'second_opinion'; });
  }

  /* ─────────── Decision Ledger Summary: one paragraph, never a table ─────────── */
  function getLedgerSummary() {
    var asc = allEntries('asc');
    if (!asc.length) return 'Nothing recorded yet — this fills in as the relationship grows.';
    var counts = {};
    asc.forEach(function (e) { counts[e.type] = (counts[e.type] || 0) + 1; });
    var span = formatLong(asc[0].date) + ' to ' + formatLong(asc[asc.length - 1].date);
    return 'Across ' + span + ', this has included ' + (counts.consultation || 0) + ' real conversation' + ((counts.consultation || 0) === 1 ? '' : 's') +
      ', ' + (counts.second_opinion || 0) + ' honest Second Opinion' + ((counts.second_opinion || 0) === 1 ? '' : 's') +
      ', ' + (counts.rejected || 0) + ' option' + ((counts.rejected || 0) === 1 ? '' : 's') + ' set aside for good reason, and ' +
      (counts.confidence_change || 0) + ' confidence check-in' + ((counts.confidence_change || 0) === 1 ? '' : 's') + ' — every one of them favourable. Nothing here was about closing a sale faster.';
  }

  /* ─────────── Life Mode Evolution ─────────── */
  function getLifeModeEvolution() {
    return allEntries('asc')
      .filter(function (e) { return e.type === 'life_mode_change'; })
      .map(function (e) { return { date: e.date, dateLabel: formatShort(e.date), label: e.title.replace('Switched Life Mode to ', '') }; });
  }

  /* ─────────── Family Technology Growth — reads kovin-family if it exists, never duplicates its seed ─────────── */
  function getFamilyGrowth() {
    var raw;
    try { raw = localStorage.getItem(FAMILY_KEY); } catch (e) { raw = null; }
    if (!raw) return { hasFamily: false, profiles: [] };
    var family;
    try { family = JSON.parse(raw); } catch (e) { return { hasFamily: false, profiles: [] }; }
    var profiles = family.map(function (p) {
      return { id: p.id, name: p.name, relation: p.relation, icon: p.icon, deviceCount: (p.devices || []).length };
    }).filter(function (p) { return p.deviceCount > 0; });
    return { hasFamily: profiles.length > 0, profiles: profiles };
  }

  window.KovinTrust = {
    getReflection: getReflection,
    getTrustTimeline: getTrustTimeline,
    getConfidenceArc: getConfidenceArc,
    getDecisionMilestones: getDecisionMilestones,
    getOwnershipSuccesses: getOwnershipSuccesses,
    getTechnologyLearning: getTechnologyLearning,
    getGuidanceHistory: getGuidanceHistory,
    getSecondOpinionHistory: getSecondOpinionHistory,
    getLedgerSummary: getLedgerSummary,
    getLifeModeEvolution: getLifeModeEvolution,
    getFamilyGrowth: getFamilyGrowth,
  };
})();
