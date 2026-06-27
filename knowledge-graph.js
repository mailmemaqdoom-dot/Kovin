/**
 * Kovin Knowledge Graph
 * The shared reasoning layer behind every recommendation, explanation,
 * and ownership experience across the platform.
 *
 * This is deliberately rule-based and transparent — every sentence it
 * produces traces back to a specific, readable weight or note in the
 * data below. Nothing here is a black box; that's the point.
 *
 * Exposes window.KovinGraph = { PRODUCTS, LIFE_MODES, ATTR_META, reasonFor, compareFor }
 */
(function () {
  'use strict';

  /* ─────────── What every recommendation is reasoned against ─────────── */
  var ATTR_META = {
    battery:         { label: 'Battery Life',       icon: '🔋' },
    camera:          { label: 'Camera Behaviour',   icon: '📷' },
    repairability:   { label: 'Repairability',      icon: '🛠' },
    softwareSupport: { label: 'Software Support',   icon: '💻' },
    travel:          { label: 'Travel Suitability', icon: '✈️' },
    family:          { label: 'Family Use',         icon: '👪' },
    business:        { label: 'Business Use',       icon: '💼' },
    student:         { label: 'Student Use',        icon: '🎓' },
    creator:         { label: 'Creator Use',        icon: '🎬' },
    price:           { label: 'Budget Fit',         icon: '₹'  },
  };

  /* ─────────── Product nodes ─────────── */
  var IMG = {
    s23fe: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663562145517/fWEumNteCudVVPuo.png',
    pixel7a: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663562145517/AeIhJBFyYYuVXncG.png',
    bravia: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663562145517/PNuLvudbHcTmKOpp.png',
    xm5: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663562145517/XIJzeXSRHorEqzFw.png',
  };

  var PRODUCTS = {
    1: {
      id: 1, name: 'Samsung Galaxy S23 FE', category: 'Phone', price: '₹34,999', priceTier: 'mid', image: IMG.s23fe,
      battery:         { rating: 4, note: 'A full day under normal use, closer to two with light use.' },
      camera:          { rating: 4, note: 'Strong in daylight and indoor light — low light needs a steady hand.' },
      repairability:   { rating: 3, note: 'Authorized service centers across Tamil Nadu; screen and battery are replaceable parts.' },
      softwareSupport: { years: 4, note: 'Four years of OS updates, five years of security patches.' },
      travel:          { rating: 4, note: 'Battery and build hold up well across long travel days.' },
      family:          { rating: 5, note: 'Simple enough for parents, capable enough for almost anyone else.' },
      business:        { rating: 4, note: 'Dependable enough to never become the story in a meeting.' },
      student:         { rating: 5, note: 'Camera good enough for assignments and memories without flagship pricing.' },
      creator:         { rating: 3, note: 'Capable, but not built specifically for editing-free shooting.' },
      accessories: [6, 7, 8, 12, 13],
      tradeoffs: [{ against: 2, reason: "The Pixel 7a's camera processing is more consistent in tricky light, but this has a bigger, brighter display and noticeably longer battery life." }],
      upgradePath: { window: '2026–2027', note: 'Software support runs through then; battery health is the natural trigger before that point.' },
      warrantyMonths: 12,
    },
    2: {
      id: 2, name: 'Google Pixel 7a', category: 'Phone', price: '₹39,999', priceTier: 'mid-high', image: IMG.pixel7a,
      battery:         { rating: 3, note: 'Comfortably lasts a day; heavy camera use shortens that.' },
      camera:          { rating: 5, note: 'Best-in-class processing — consistently good shots with no editing needed.' },
      repairability:   { rating: 3, note: 'Authorized repair available, though parts can take a little longer to source.' },
      softwareSupport: { years: 5, note: 'Five years of OS and security updates — among the longest available at this price.' },
      travel:          { rating: 3, note: 'Reliable, though battery life is the one thing to plan around on longer days.' },
      family:          { rating: 3, note: 'Capable for anyone, though not specifically tuned for simplicity.' },
      business:        { rating: 3, note: 'Handles calls and email well without being built around them.' },
      student:         { rating: 4, note: 'A genuinely excellent camera for documenting coursework and life on a tighter budget than flagships.' },
      creator:         { rating: 5, note: 'Editing-free results straight out of the camera — built for this.' },
      accessories: [6, 7, 8, 10, 14],
      tradeoffs: [{ against: 1, reason: "The Galaxy S23 FE has a bigger screen and longer battery life, but this camera is significantly more consistent and its software support runs a year longer." }],
      upgradePath: { window: '2028', note: 'One of the longest software runways available — little urgency to revisit this soon.' },
      warrantyMonths: 12,
    },
    3: {
      id: 3, name: 'Sony Bravia 4K LED', category: 'TV', price: '₹54,990', priceTier: 'mid', image: IMG.bravia,
      repairability:   { rating: 2, note: 'Panel and board repairs need an authorized technician visit — not a same-day fix.' },
      softwareSupport: { years: 3, note: "Smart TV software updates typically slow after three years; picture quality itself doesn't age." },
      travel:          { rating: 1, note: 'Not built to move — this is a settled, single-room device.' },
      family:          { rating: 5, note: 'The one screen the whole household actually shares.' },
      business:        { rating: 2, note: 'Useful for presentations at home, but not its primary purpose.' },
      student:         { rating: 2, note: "Rarely the first purchase for a student living alone." },
      creator:         { rating: 2, note: 'A good monitor for reviewing footage, not a working tool on its own.' },
      accessories: [],
      tradeoffs: [],
      upgradePath: { window: '2027–2028', note: 'TVs are usually the longest-held device in a home — no reason to revisit this for years.' },
      warrantyMonths: 12,
    },
    4: {
      id: 4, name: 'Sony WH-1000XM5', category: 'Audio', price: '₹26,990', priceTier: 'mid', image: IMG.xm5,
      battery:         { rating: 5, note: 'Around 30 hours of playback with noise cancellation on.' },
      repairability:   { rating: 3, note: 'Ear cushions and cable are replaceable; the core unit needs an authorized center.' },
      softwareSupport: { years: 4, note: 'Firmware updates continue through Sony Headphones Connect for several years.' },
      travel:          { rating: 5, note: 'Genuine noise cancellation built for long flights and daily commutes.' },
      family:          { rating: 3, note: 'A personal device more than a shared one.' },
      business:        { rating: 5, note: 'Eight microphones keep calls clear even in noisy rooms.' },
      student:         { rating: 3, note: 'A meaningful investment rather than an essential — worth it for focus, not required for it.' },
      creator:         { rating: 4, note: 'Reliable monitoring quality for voiceover and review work on the move.' },
      accessories: [8],
      tradeoffs: [],
      upgradePath: { window: '2026', note: 'Battery health across daily charge cycles is the main thing worth watching.' },
      warrantyMonths: 12,
    },
  };

  /* ─────────── Life Mode nodes — what each situation actually weighs ─────────── */
  /* Weight scale: 0 (irrelevant) – 3 (decisive) */
  var LIFE_MODES = [
    { id: 'college', icon: '🎓', title: 'Starting College',
      weights: { battery: 2, camera: 1, repairability: 1, softwareSupport: 1, travel: 1, family: 0, business: 0, student: 3, creator: 1, price: 3 } },
    { id: 'parents', icon: '👪', title: 'Buying For Parents',
      weights: { battery: 2, camera: 1, repairability: 2, softwareSupport: 1, travel: 0, family: 3, business: 0, student: 0, creator: 0, price: 2 } },
    { id: 'salary', icon: '💼', title: 'First Salary',
      weights: { battery: 2, camera: 2, repairability: 2, softwareSupport: 2, travel: 1, family: 0, business: 1, student: 0, creator: 1, price: 1 } },
    { id: 'wfh', icon: '🏠', title: 'Work From Home',
      weights: { battery: 1, camera: 0, repairability: 1, softwareSupport: 1, travel: 0, family: 0, business: 3, student: 0, creator: 1, price: 1 } },
    { id: 'travel', icon: '✈️', title: 'Travelling Frequently',
      weights: { battery: 3, camera: 1, repairability: 1, softwareSupport: 1, travel: 3, family: 0, business: 0, student: 0, creator: 1, price: 1 } },
    { id: 'creator', icon: '🎬', title: 'Content Creation',
      weights: { battery: 2, camera: 3, repairability: 1, softwareSupport: 1, travel: 1, family: 0, business: 0, student: 0, creator: 3, price: 1 } },
    { id: 'business', icon: '📈', title: 'Business Essentials',
      weights: { battery: 2, camera: 0, repairability: 1, softwareSupport: 1, travel: 1, family: 0, business: 3, student: 0, creator: 0, price: 1 } },
    { id: 'entertainment', icon: '🎥', title: 'Entertainment Upgrade',
      weights: { battery: 0, camera: 0, repairability: 1, softwareSupport: 1, travel: 0, family: 3, business: 0, student: 0, creator: 0, price: 1 } },
    { id: 'newhome', icon: '🏡', title: 'Moving Into A New Home',
      weights: { battery: 1, camera: 0, repairability: 1, softwareSupport: 1, travel: 0, family: 2, business: 0, student: 0, creator: 0, price: 2 } },
  ];

  /* ─────────── Reasoning ─────────── */
  function getMode(modeId) {
    return LIFE_MODES.filter(function (m) { return m.id === modeId; })[0] || LIFE_MODES[0];
  }

  function scoreAttributes(product, weights) {
    var keys = Object.keys(ATTR_META).filter(function (k) { return k !== 'price'; });
    var scored = [];
    keys.forEach(function (k) {
      var attr = product[k];
      if (!attr) return;
      var rating = attr.rating != null ? attr.rating : (attr.years != null ? Math.min(5, attr.years) : 0);
      scored.push({ key: k, weight: weights[k] || 0, rating: rating, note: attr.note });
    });
    return scored;
  }

  function buildOwnershipArc(product) {
    var dayOne = product.camera
      ? 'First impressions usually center on the camera — ' + product.camera.note.toLowerCase()
      : 'First impressions settle within the first week of normal, everyday use.';
    var sixMonths = product.battery
      ? 'Battery behaviour becomes familiar. ' + product.battery.note
      : 'The device settles fully into the daily routine — nothing left to discover.';
    var yearOne = 'Warranty coverage (' + product.warrantyMonths + ' months) is the main thing worth checking in on around now.';
    return [
      { stage: 'Day One', note: dayOne },
      { stage: 'Six Months', note: sixMonths },
      { stage: 'Year One', note: yearOne },
      { stage: product.upgradePath.window, note: product.upgradePath.note },
    ];
  }

  /**
   * The full reasoning behind recommending `productId` within `modeId`.
   * Every field traces back to a readable weight or authored note —
   * nothing here is generated without a visible source.
   */
  function reasonFor(productId, modeId) {
    var product = PRODUCTS[productId];
    if (!product) return null;
    var mode = getMode(modeId);
    var w = mode.weights;
    var scored = scoreAttributes(product, w);

    var fits = scored
      .filter(function (s) { return s.weight >= 2 && s.rating >= 3; })
      .sort(function (a, b) { return (b.weight * b.rating) - (a.weight * a.rating); })
      .slice(0, 3)
      .map(function (s) { return { key: s.key, label: ATTR_META[s.key].label, icon: ATTR_META[s.key].icon, note: s.note }; });

    if ((w.price || 0) >= 2 && (product.priceTier === 'mid' || product.priceTier === 'budget')) {
      fits.push({ key: 'price', label: ATTR_META.price.label, icon: ATTR_META.price.icon, note: 'Priced to make sense without stretching the budget this situation usually has.' });
    }

    var weak = scored
      .filter(function (s) { return s.weight >= 2 && s.rating <= 2; })
      .sort(function (a, b) { return b.weight - a.weight; })[0];

    var changeIf = weak
      ? 'If ' + ATTR_META[weak.key].label.toLowerCase() + ' mattered more here than it does for ' + mode.title.toLowerCase() + ', this recommendation would shift.'
      : 'This holds steady unless your priorities move away from what ' + mode.title.toLowerCase() + ' usually calls for.';

    var tradeoff = (product.tradeoffs || [])[0];
    var whyNotAlternative = tradeoff
      ? { productId: tradeoff.against, productName: PRODUCTS[tradeoff.against].name, reason: tradeoff.reason }
      : null;

    return {
      productId: product.id,
      productName: product.name,
      modeId: mode.id,
      modeTitle: mode.title,
      fits: fits,
      whyNotAlternative: whyNotAlternative,
      changeIf: changeIf,
      validUntil: product.upgradePath,
      warrantyMonths: product.warrantyMonths,
      accessories: product.accessories,
      ownershipArc: buildOwnershipArc(product),
    };
  }

  /**
   * A direct, transparent comparison between two products for a given
   * situation — the same logic Second Opinion draws on.
   */
  function compareFor(productIdA, productIdB, modeId) {
    var a = PRODUCTS[productIdA], b = PRODUCTS[productIdB];
    if (!a || !b) return null;
    var mode = getMode(modeId);

    /* Decide the winner by weighted fit for THIS situation first —
       a hardcoded tradeoff note is never allowed to override what the
       situation actually calls for. */
    var scoredA = scoreAttributes(a, mode.weights).reduce(function (s, x) { return s + x.weight * x.rating; }, 0);
    var scoredB = scoreAttributes(b, mode.weights).reduce(function (s, x) { return s + x.weight * x.rating; }, 0);
    var winner = scoredA >= scoredB ? a : b;
    var other = winner === a ? b : a;

    var winnerTradeoff = (winner.tradeoffs || []).filter(function (t) { return t.against === other.id; })[0];
    var otherTradeoff = (other.tradeoffs || []).filter(function (t) { return t.against === winner.id; })[0];

    var reason;
    if (winnerTradeoff) {
      reason = winnerTradeoff.reason;
    } else if (otherTradeoff) {
      reason = 'For ' + mode.title.toLowerCase() + ', ' + winner.name + ' edges ahead — though it is worth knowing: ' + otherTradeoff.reason;
    } else {
      reason = winner.name + ' and ' + other.name + ' are built for different priorities — for ' + mode.title.toLowerCase() + ', the balance leans toward ' + winner.name + '.';
    }

    return { winnerId: winner.id, winnerName: winner.name, otherId: other.id, otherName: other.name, reason: reason, mode: mode.title };
  }

  window.KovinGraph = {
    PRODUCTS: PRODUCTS,
    LIFE_MODES: LIFE_MODES,
    ATTR_META: ATTR_META,
    reasonFor: reasonFor,
    compareFor: compareFor,
  };
})();
