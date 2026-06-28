/**
 * Kovin Interaction Engine
 * One centralized motion system — replaces the scattered, hand-rolled
 * GSAP calls that used to live inside individual pages (sheet drag,
 * dock hide-on-scroll, ripple-less buttons) with a single shared API.
 *
 * Motion law: every animation here exists to explain a change of state
 * (opened, dismissed, selected, loading) — never decoration. Timing is
 * fixed to three steps and never exceeds 450ms. Gesture-released motion
 * (a sheet let go mid-drag) uses real spring physics, driven by the
 * velocity captured at release — not a canned easing curve, because a
 * curve can't know how fast you flicked it.
 *
 * Exposes window.KovinMotion.
 */
(function () {
  'use strict';

  /* ── Timing law (Phase 3): three steps, never more than 450ms ── */
  var T = { FAST: 120, NORMAL: 220, LARGE: 320, MAX: 450 };

  /* A spring-shaped easing curve for entrance/exit tweens that aren't
     gesture-driven (GSAP tweens a curve, it doesn't simulate physics —
     true spring simulation below is reserved for drag-release motion,
     where a real velocity exists to feed into it). */
  var SPRING_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

  function reducedMotion() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ══════════════════════════════════════════════════
     Shared CSS — injected once, so no page needs to hand-author
     ripple/shimmer/press CSS again.
  ══════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('kovin-motion-styles')) return;
    var style = document.createElement('style');
    style.id = 'kovin-motion-styles';
    style.textContent =
      '.kovin-ripple-wrap{position:relative;overflow:hidden;}' +
      '.kovin-ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,0.45);' +
        'transform:scale(0);pointer-events:none;opacity:0.6;}' +
      '.kovin-ripple.is-dark{background:rgba(26,22,18,0.16);}' +
      '.kovin-ripple-go{animation:kovin-ripple-anim 0.5s ease-out forwards;}' +
      '@keyframes kovin-ripple-anim{to{transform:scale(2.6);opacity:0;}}' +
      '.kovin-skeleton{background:linear-gradient(100deg,var(--paper-warm,#EDE8E0) 30%,rgba(26,22,18,0.04) 50%,var(--paper-warm,#EDE8E0) 70%);' +
        'background-size:200% 100%;animation:kovin-shimmer 1.4s infinite ease-in-out;}' +
      '@keyframes kovin-shimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}' +
      '.kovin-card-lift{transition:transform 0.12s cubic-bezier(0.22,1,0.36,1),box-shadow 0.12s ease;}' +
      '.kovin-card-lift:active{transform:translateY(-2px) scale(0.985);box-shadow:0 10px 22px -8px rgba(26,22,18,0.18);}' +
      '@media (prefers-reduced-motion: reduce){.kovin-ripple-go{animation:none!important;}' +
        '.kovin-card-lift:active{transform:none!important;}.kovin-skeleton{animation:none!important;}}';
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════════
     Spring physics — used only where a real velocity exists
     (drag release). Critically/under-damped mass-spring-damper,
     stepped on requestAnimationFrame.
  ══════════════════════════════════════════════════ */
  function springTo(from, to, velocity, onUpdate, onComplete, opts) {
    opts = opts || {};
    if (reducedMotion()) { onUpdate(to); if (onComplete) onComplete(); return; }
    var stiffness = opts.stiffness || 280;
    var damping = opts.damping || 28;
    var mass = opts.mass || 1;
    var restDelta = opts.restDelta || 0.4;
    var pos = from;
    var v = velocity || 0;
    var lastTime = null;

    function step(now) {
      if (lastTime == null) lastTime = now;
      var dt = Math.min((now - lastTime) / 1000, 0.032);
      lastTime = now;
      var springForce = -stiffness * (pos - to);
      var damperForce = -damping * v;
      var accel = (springForce + damperForce) / mass;
      v += accel * dt;
      pos += v * dt;
      if (Math.abs(pos - to) < restDelta && Math.abs(v) < restDelta) {
        onUpdate(to);
        if (onComplete) onComplete();
        return;
      }
      onUpdate(pos);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ══════════════════════════════════════════════════
     Ripple + card-lift — delegated, lazy (one listener, attached
     on first pointer interaction, not per-element).
  ══════════════════════════════════════════════════ */
  var rippleBound = false;
  function bindRipple(selector) {
    selector = selector || '.btn, .product-card, [data-kovin-ripple]';
    injectStyles();
    if (rippleBound) return;
    rippleBound = true;
    document.addEventListener('pointerdown', function (e) {
      if (reducedMotion()) return;
      var target = e.target.closest(selector);
      if (!target) return;
      target.classList.add('kovin-ripple-wrap');
      var rect = target.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var size = Math.max(rect.width, rect.height) * 1.5;
      var dark = (getComputedStyle(target).color || '').indexOf('255') === -1;
      var ripple = document.createElement('span');
      ripple.className = 'kovin-ripple kovin-ripple-go' + (dark ? ' is-dark' : '');
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (x - size / 2) + 'px';
      ripple.style.top = (y - size / 2) + 'px';
      target.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    }, { passive: true });
  }

  function enableCardLift(selectorOrEl) {
    injectStyles();
    var els = typeof selectorOrEl === 'string' ? document.querySelectorAll(selectorOrEl) : [selectorOrEl];
    Array.prototype.forEach.call(els, function (el) { if (el) el.classList.add('kovin-card-lift'); });
  }

  /* ══════════════════════════════════════════════════
     Bottom Sheet engine (Phase 6) — open/close timing + drag-to-
     dismiss with velocity close and spring snap-back. Replaces every
     page's hand-rolled sheet-drag function with one shared one.
  ══════════════════════════════════════════════════ */
  function openSheet(panel, overlay) {
    injectStyles();
    if (!panel) return;
    if (reducedMotion() || !window.gsap) {
      panel.style.transform = ''; panel.style.opacity = '1';
      if (overlay) overlay.style.opacity = '1';
      return;
    }
    gsap.fromTo(panel, { y: '100%' }, { y: 0, duration: T.LARGE / 1000, ease: SPRING_EASE, overwrite: true });
    if (overlay) gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: T.NORMAL / 1000, ease: 'power2.out', overwrite: true });
  }

  function closeSheet(panel, overlay, onComplete) {
    if (!panel) { if (onComplete) onComplete(); return; }
    if (reducedMotion() || !window.gsap) { if (onComplete) onComplete(); return; }
    gsap.to(panel, { y: '100%', duration: T.NORMAL / 1000, ease: 'power3.in', overwrite: true, onComplete: onComplete });
    if (overlay) gsap.to(overlay, { opacity: 0, duration: T.FAST / 1000, ease: 'power2.in', overwrite: true });
  }

  /**
   * Attaches drag-to-dismiss to a sheet handle. Tracks real velocity
   * (px/ms) through the gesture; a fast flick closes even if the
   * distance threshold wasn't crossed, exactly like a native sheet.
   * Letting go short of either threshold springs back using that same
   * captured velocity, not a fresh easing curve.
   */
  function attachSheetDrag(handle, panel, overlay, opts) {
    if (!handle || !panel) return function () {};
    opts = opts || {};
    var onClose = opts.onClose || function () {};
    var closeDistance = opts.closeDistance || 120;
    var closeVelocity = opts.closeVelocity || 0.65;
    var isEnabled = opts.enabled || function () { return true; };

    var startY = 0, lastY = 0, lastT = 0, velocity = 0, dragging = false, currentY = 0;

    function down(e) {
      if (!isEnabled()) return;
      var p = e.touches ? e.touches[0] : e;
      startY = lastY = p.clientY;
      lastT = performance.now();
      velocity = 0; dragging = true; currentY = 0;
      panel.style.transition = 'none';
    }
    function move(e) {
      if (!dragging) return;
      var p = e.touches ? e.touches[0] : e;
      var now = performance.now();
      var dt = now - lastT || 16;
      velocity = (p.clientY - lastY) / dt;
      lastY = p.clientY; lastT = now;
      currentY = Math.max(0, p.clientY - startY);
      panel.style.transform = 'translate3d(0,' + currentY + 'px,0)';
      if (overlay) overlay.style.opacity = String(Math.max(0, 1 - currentY / 420));
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      var shouldClose = currentY > closeDistance || velocity > closeVelocity;
      if (shouldClose) {
        onClose(velocity);
      } else {
        springTo(currentY, 0, velocity * 1000, function (v) {
          panel.style.transform = 'translate3d(0,' + v + 'px,0)';
        }, function () { panel.style.transform = ''; }, { stiffness: 320, damping: 30 });
        if (overlay) gsap && gsap.to(overlay, { opacity: 1, duration: T.FAST / 1000 });
      }
      currentY = 0;
    }

    handle.addEventListener('touchstart', down, { passive: true });
    handle.addEventListener('touchmove', move, { passive: true });
    handle.addEventListener('touchend', up);
    handle.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', function (e) { if (dragging && e.pointerType !== 'touch') move(e); });
    window.addEventListener('pointerup', function (e) { if (e.pointerType !== 'touch') up(); });

    return function destroy() {
      handle.removeEventListener('touchstart', down);
      handle.removeEventListener('touchmove', move);
      handle.removeEventListener('touchend', up);
    };
  }

  /* ══════════════════════════════════════════════════
     Adaptive nav (Phase 8/9) — hide on intentional downward scroll,
     show immediately on any upward movement or return-to-top. One
     primitive, reusable for a header, a dock, or a floating button.
  ══════════════════════════════════════════════════ */
  function adaptiveNav(el, opts) {
    if (!el) return { destroy: function () {} };
    opts = opts || {};
    var hideAfter = opts.hideAfter != null ? opts.hideAfter : 64;
    var threshold = opts.threshold != null ? opts.threshold : 10;
    var hideY = opts.hideY != null ? opts.hideY : 110;
    var visible = true, lastY = 0, ticking = false;

    function show() {
      if (visible) return; visible = true;
      el.style.pointerEvents = '';
      if (window.gsap && !reducedMotion()) gsap.to(el, { y: 0, opacity: 1, duration: T.NORMAL / 1000, ease: 'power3.out', overwrite: true });
      else { el.style.transform = ''; el.style.opacity = '1'; }
    }
    function hide() {
      if (!visible) return; visible = false;
      if (window.gsap && !reducedMotion()) {
        gsap.to(el, { y: hideY, opacity: 0, duration: T.FAST / 1000, ease: 'power3.in', overwrite: true, onComplete: function () { el.style.pointerEvents = 'none'; } });
      } else { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
    }
    function onScroll() {
      var y = window.pageYOffset;
      if (y <= 0) { show(); lastY = y; return; }
      var delta = y - lastY;
      if (y > hideAfter && delta > threshold) hide();
      else if (delta < -threshold) show();
      lastY = y;
    }
    function raf() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { onScroll(); ticking = false; });
    }
    window.addEventListener('scroll', raf, { passive: true });
    return { destroy: function () { window.removeEventListener('scroll', raf); }, show: show, hide: hide };
  }

  /* ══════════════════════════════════════════════════
     Swipe back (Phase 7) — edge-pan gesture. A real previous page
     can't be revealed underneath on a static multi-page site (there's
     no router), so this gives honest gesture feedback — a deliberate
     slide-and-release — then navigates, rather than faking a reveal
     that isn't really there.
  ══════════════════════════════════════════════════ */
  function enableSwipeBack(opts) {
    opts = opts || {};
    var edgeWidth = opts.edgeWidth || 28;
    var threshold = opts.threshold || 90;
    var href = opts.href || null;
    var target = document.getElementById('app-shell') || document.body;
    var startX = 0, startY = 0, dragging = false, active = false;

    function down(e) {
      var t = e.touches[0];
      if (t.clientX > edgeWidth) return;
      startX = t.clientX; startY = t.clientY; dragging = true; active = false;
    }
    function move(e) {
      if (!dragging) return;
      var t = e.touches[0];
      var dx = t.clientX - startX, dy = t.clientY - startY;
      if (!active && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4) active = true;
      if (active) {
        target.style.transition = 'none';
        target.style.transform = 'translate3d(' + Math.max(0, dx) + 'px,0,0)';
        target.style.opacity = String(1 - Math.min(dx, 200) / 500);
      }
    }
    function up(e) {
      if (!dragging) return;
      dragging = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX;
      target.style.transition = 'transform ' + (T.NORMAL / 1000) + 's ' + SPRING_EASE + ', opacity ' + (T.NORMAL / 1000) + 's ease';
      if (active && dx > threshold) {
        target.style.transform = 'translate3d(100%,0,0)';
        target.style.opacity = '0';
        setTimeout(function () { if (href) window.location.href = href; else history.back(); }, T.NORMAL);
      } else {
        target.style.transform = ''; target.style.opacity = '1';
      }
      active = false;
    }
    document.addEventListener('touchstart', down, { passive: true });
    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('touchend', up);
  }

  /* ══════════════════════════════════════════════════
     Shared element transition (Phase 5) — FLIP: clone the source
     image at its current rect, animate the clone to the destination
     rect, then hand off. Used for product card → modal/detail image.
  ══════════════════════════════════════════════════ */
  function flipImage(sourceImg, targetImg, opts) {
    opts = opts || {};
    if (reducedMotion() || !sourceImg || !targetImg || !window.gsap) {
      if (opts.onComplete) opts.onComplete();
      return;
    }
    var startRect = sourceImg.getBoundingClientRect();
    var clone = sourceImg.cloneNode(true);
    var computed = getComputedStyle(sourceImg);
    clone.style.position = 'fixed';
    clone.style.margin = '0';
    clone.style.left = startRect.left + 'px';
    clone.style.top = startRect.top + 'px';
    clone.style.width = startRect.width + 'px';
    clone.style.height = startRect.height + 'px';
    clone.style.objectFit = computed.objectFit;
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.borderRadius = computed.borderRadius;
    clone.style.filter = computed.filter;
    document.body.appendChild(clone);
    targetImg.style.opacity = '0';

    requestAnimationFrame(function () {
      var endRect = targetImg.getBoundingClientRect();
      gsap.to(clone, {
        left: endRect.left, top: endRect.top, width: endRect.width, height: endRect.height,
        duration: T.LARGE / 1000, ease: SPRING_EASE,
        onComplete: function () {
          targetImg.style.opacity = '1';
          clone.remove();
          if (opts.onComplete) opts.onComplete();
        },
      });
    });
  }

  /* ══════════════════════════════════════════════════
     Image skeleton (Phase 11) — shared shimmer-while-loading utility.
  ══════════════════════════════════════════════════ */
  function bindImageSkeleton(wrapEl, imgEl) {
    if (!wrapEl || !imgEl) return;
    injectStyles();
    wrapEl.classList.add('kovin-skeleton');
    function done() { wrapEl.classList.remove('kovin-skeleton'); }
    function fail() { wrapEl.classList.remove('kovin-skeleton'); wrapEl.classList.add('img-error'); }
    if (imgEl.complete && imgEl.naturalWidth) { done(); return; }
    imgEl.addEventListener('load', done, { once: true });
    imgEl.addEventListener('error', fail, { once: true });
  }

  /* ── Auto-bootstrap (Phase 7) ──
     Every secondary page in this codebase uses the same convention —
     a single `<a href="index.html" class="xx-back">` in its header.
     Detect it and wire swipe-back automatically, so no page needs its
     own bootstrap script. The `[href]` requirement is what keeps this
     from matching in-page "previous step" buttons (e.g. `.guided-back`,
     `.lm-stage-back`), which are plain <button>s with no href. */
  function autoBootstrap() {
    var backLink = document.querySelector('a[class*="-back"][href]');
    if (backLink) enableSwipeBack({ href: backLink.getAttribute('href') });
  }

  window.KovinMotion = {
    T: T,
    SPRING_EASE: SPRING_EASE,
    reducedMotion: reducedMotion,
    springTo: springTo,
    bindRipple: bindRipple,
    enableCardLift: enableCardLift,
    openSheet: openSheet,
    closeSheet: closeSheet,
    attachSheetDrag: attachSheetDrag,
    adaptiveNav: adaptiveNav,
    enableSwipeBack: enableSwipeBack,
    flipImage: flipImage,
    bindImageSkeleton: bindImageSkeleton,
  };

  injectStyles();
  bindRipple();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBootstrap);
  } else {
    autoBootstrap();
  }
})();
