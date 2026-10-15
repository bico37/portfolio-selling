/**
 * Fallstudie: Editor-Leinwand (Pan/Zoom ohne Bibliothek) und Live-Vorschau im Dialog.
 * Leinwand ab 768 px; darunter Swipe-Galerie. Beide öffnen die Demo über [data-cs-open].
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Vorschau-Dialog ---------- */

  function initPreview() {
    var dialog = document.getElementById('cs-preview');
    if (!dialog) return;
    var browser = dialog.querySelector('[data-cs-browser]');
    var phone = dialog.querySelector('[data-cs-phone]');
    var title = dialog.querySelector('[data-cs-preview-title]');
    var url = dialog.querySelector('[data-cs-preview-url]');
    var external = dialog.querySelector('[data-cs-preview-external]');
    var frames = dialog.querySelectorAll('iframe');

    // Until the live page has loaded (a few seconds on a cold start), the matching
    // screenshot stands in, so the frame never sits there blank.
    frames.forEach(function (frame) {
      frame.addEventListener('load', function () {
        if (frame.getAttribute('src') === 'about:blank') return;
        var box = frame.parentElement;
        frame.classList.remove('opacity-0');
        box.querySelector('[data-cs-loading]').hidden = true;
        setTimeout(function () { box.querySelector('[data-cs-placeholder]').hidden = true; }, 300);
      });
    });

    function open(trigger) {
      var href = trigger.getAttribute('data-cs-open');
      var isPhone = trigger.getAttribute('data-cs-device') === 'mobile';
      var label = trigger.getAttribute('data-cs-label') || 'Live-Demo';
      // style.display, because the Tailwind display class on the frame beats [hidden].
      browser.style.display = isPhone ? 'none' : '';
      phone.hidden = !isPhone;
      var box = (isPhone ? phone : browser).querySelector('iframe').parentElement;
      var frame = box.querySelector('iframe');
      var placeholder = box.querySelector('[data-cs-placeholder]');
      var thumb = trigger.getAttribute('data-cs-thumb');
      if (thumb) placeholder.src = thumb;
      placeholder.hidden = !thumb;
      box.querySelector('[data-cs-loading]').hidden = false;
      frame.classList.add('opacity-0');
      frame.title = 'Live-Demo: ' + label;
      frame.setAttribute('src', href);
      title.textContent = label;
      url.textContent = href.replace(/^https?:\/\//, '');
      external.href = href;
      dialog.showModal();
    }

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-cs-open]');
      if (!trigger) return;
      event.preventDefault();
      open(trigger);
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', function () {
      frames.forEach(function (frame) { frame.setAttribute('src', 'about:blank'); });
    });
  }

  /* ---------- Leinwand ---------- */

  function initEditor(editor) {
    var viewport = editor.querySelector('[data-cs-viewport]');
    var world = editor.querySelector('[data-cs-world]');
    var zoomLabel = editor.querySelector('[data-cs-zoom-label]');
    var layers = Array.prototype.slice.call(editor.querySelectorAll('[data-cs-target]'));
    var MIN = 0.04;
    var MAX = 2;
    var START_ZOOM = 0.32;
    var state = { x: 0, y: 0, z: 1 };
    var active = false;
    var initialised = false;
    var frameId = 0;

    function render() {
      world.style.transform = 'translate(' + state.x + 'px,' + state.y + 'px) scale(' + state.z + ')';
      world.style.setProperty('--iz', String(1 / state.z));
      // Coarser dot grid when zoomed far out, so it does not turn into noise.
      var grid = 24 * state.z * (state.z < 0.25 ? 4 : 1);
      viewport.style.backgroundSize = grid + 'px ' + grid + 'px';
      viewport.style.backgroundPosition = state.x + 'px ' + state.y + 'px';
      zoomLabel.textContent = Math.round(state.z * 100) + ' %';
    }

    function clamp(z) { return Math.min(MAX, Math.max(MIN, z)); }
    function stop() { cancelAnimationFrame(frameId); }

    /** Tween over 280 ms; `step(t)` sets state for eased progress t in [0, 1]. */
    function tween(step) {
      stop();
      if (reduceMotion) { step(1); render(); return; }
      var start = performance.now();
      (function tick(now) {
        var t = Math.min(1, (now - start) / 280);
        step(1 - Math.pow(1 - t, 3));
        render();
        if (t < 1) frameId = requestAnimationFrame(tick);
      })(start);
    }

    function run(step, animate) {
      if (animate) tween(step);
      else { stop(); step(1); render(); }
    }

    /** Zoom so the world point under (cx, cy) stays exactly there during the whole tween. */
    function zoomAt(nextZ, cx, cy, animate) {
      nextZ = clamp(nextZ);
      var z0 = state.z;
      var wx = (cx - state.x) / z0;
      var wy = (cy - state.y) / z0;
      run(function (t) {
        state.z = z0 * Math.pow(nextZ / z0, t);
        state.x = cx - wx * state.z;
        state.y = cy - wy * state.z;
      }, animate);
    }

    /** Move the camera to a target view. */
    function moveTo(target, animate) {
      var from = { x: state.x, y: state.y, z: state.z };
      run(function (t) {
        state.z = from.z * Math.pow(target.z / from.z, t);
        state.x = from.x + (target.x - from.x) * t;
        state.y = from.y + (target.y - from.y) * t;
      }, animate);
    }

    function center() {
      return { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
    }

    /** Untransformed world position of an element, from layout offsets. */
    function worldRect(el) {
      var left = 0;
      var top = 0;
      var node = el;
      while (node && node !== world) {
        left += node.offsetLeft;
        top += node.offsetTop;
        node = node.offsetParent;
      }
      return { left: left, top: top, width: el.offsetWidth, height: el.offsetHeight };
    }

    function fitAll(animate) {
      var pad = 40;
      var w = world.offsetWidth;
      var h = world.offsetHeight;
      var z = clamp(Math.min((viewport.clientWidth - pad * 2) / w, (viewport.clientHeight - pad * 2) / h));
      moveTo({ z: z, x: (viewport.clientWidth - w * z) / 2, y: (viewport.clientHeight - h * z) / 2 }, animate);
    }

    function markLayer(id) {
      layers.forEach(function (layer) {
        layer.setAttribute('aria-current', layer.getAttribute('data-cs-target') === id ? 'true' : 'false');
      });
    }

    /** Bring an artboard into view: fit its width, show its top with room for the label. */
    function showArtboard(frame, animate) {
      var r = worldRect(frame);
      var share = frame.classList.contains('cs-frame--mobile') ? 0.35 : 0.8;
      var z = clamp(Math.min(1, (viewport.clientWidth * share) / r.width));
      moveTo({ z: z, x: viewport.clientWidth / 2 - (r.left + r.width / 2) * z, y: 56 - r.top * z }, animate);
      markLayer(frame.id);
    }

    /** Start view: first section at a readable zoom, section title and labels in view. */
    function initialView() {
      var first = world.querySelector('.cs-section');
      if (!first) return fitAll(false);
      var r = worldRect(first);
      var z = clamp(START_ZOOM);
      moveTo({ z: z, x: 24 - r.left * z, y: 48 - r.top * z }, false);
    }

    // Toolbar: always zoom around the centre of the visible area.
    editor.addEventListener('click', function (event) {
      var button = event.target.closest('[data-cs-zoom]');
      if (!button) return;
      var c = center();
      var action = button.getAttribute('data-cs-zoom');
      if (action === 'in') zoomAt(state.z * 1.25, c.x, c.y, true);
      if (action === 'out') zoomAt(state.z / 1.25, c.x, c.y, true);
      if (action === 'reset') zoomAt(1, c.x, c.y, true);
      if (action === 'fit') fitAll(true);
    });

    // Ebenen
    layers.forEach(function (layer) {
      layer.addEventListener('click', function () {
        var frame = document.getElementById(layer.getAttribute('data-cs-target'));
        if (!frame) return;
        showArtboard(frame, true);
        var button = frame.querySelector('.cs-artboard');
        if (button) {
          button.dataset.csSkipFocus = '1';
          button.focus({ preventScroll: true });
        }
      });
    });

    // Tastatur: Fokus auf ein Artboard holt es ins Bild (nur Tastaturfokus, kein Mausklick).
    world.addEventListener('focusin', function (event) {
      var button = event.target.closest('.cs-artboard');
      if (!button) return;
      if (button.dataset.csSkipFocus === '1') { delete button.dataset.csSkipFocus; return; }
      if (!button.matches(':focus-visible')) return;
      showArtboard(button.closest('.cs-frame'), true);
    });

    viewport.addEventListener('keydown', function (event) {
      var c = center();
      var step = 80;
      var handled = true;
      switch (event.key) {
        case 'ArrowLeft': stop(); state.x += step; render(); break;
        case 'ArrowRight': stop(); state.x -= step; render(); break;
        case 'ArrowUp': stop(); state.y += step; render(); break;
        case 'ArrowDown': stop(); state.y -= step; render(); break;
        case '+': case '=': zoomAt(state.z * 1.25, c.x, c.y, true); break;
        case '-': case '_': zoomAt(state.z / 1.25, c.x, c.y, true); break;
        case '0': zoomAt(1, c.x, c.y, true); break;
        case '1': case 'f': case 'F': fitAll(true); break;
        default: handled = false;
      }
      if (handled) event.preventDefault();
    });

    // Ziehen. Erst ab 4 px Bewegung, damit ein Klick auf ein Artboard ein Klick bleibt.
    // Nach dem Pointer-Capture landet der Klick auf der Leinwand und öffnet nichts.
    var drag = null;
    viewport.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      active = true;
      drag = { id: event.pointerId, sx: event.clientX, sy: event.clientY, x: state.x, y: state.y, moved: false };
    });
    viewport.addEventListener('pointermove', function (event) {
      if (!drag || drag.id !== event.pointerId) return;
      var dx = event.clientX - drag.sx;
      var dy = event.clientY - drag.sy;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      if (!drag.moved) {
        drag.moved = true;
        stop();
        drag.x = state.x;
        drag.y = state.y;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add('is-dragging');
      }
      state.x = drag.x + dx;
      state.y = drag.y + dy;
      render();
    });
    function endDrag(event) {
      if (!drag || drag.id !== event.pointerId) return;
      viewport.classList.remove('is-dragging');
      drag = null;
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // Scrollen: Strg/Cmd (und Trackpad-Pinch) zoomt immer. Normales Scrollen verschiebt die
    // Leinwand erst nach einem Klick hinein, damit die Seite weiter scrollbar bleibt.
    viewport.addEventListener('wheel', function (event) {
      var rect = viewport.getBoundingClientRect();
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        zoomAt(state.z * Math.exp(-event.deltaY * 0.0025), event.clientX - rect.left, event.clientY - rect.top, false);
        return;
      }
      if (!active) return;
      event.preventDefault();
      stop();
      state.x -= event.deltaX;
      state.y -= event.deltaY;
      render();
    }, { passive: false });
    viewport.addEventListener('focus', function () { active = true; });
    editor.addEventListener('pointerleave', function () { active = false; });
    // Focusing an artboard lets the browser scroll this overflow:hidden box; the camera owns
    // all movement, so undo it.
    viewport.addEventListener('scroll', function () {
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    });

    // Erst initialisieren, wenn die Leinwand sichtbar ist (Breakpoint ab 768 px).
    function maybeInit() {
      if (initialised || viewport.clientWidth === 0) return;
      initialised = true;
      initialView();
    }
    if ('ResizeObserver' in window) new ResizeObserver(maybeInit).observe(viewport);
    maybeInit();
  }

  initPreview();
  var editor = document.querySelector('[data-cs-editor]');
  if (editor) initEditor(editor);
})();
