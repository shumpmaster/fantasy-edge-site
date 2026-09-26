(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AnglesOnboardingView = api;
})(typeof globalThis === 'object' ? globalThis : null, function () {
  'use strict';

  const CHAPTERS = ['Welcome', 'Find your next play', 'Add your angle', 'See the impact', 'Make it yours', 'Follow the action', 'Improve'];
  const PAD = 6;

  function createView({ document: suppliedDocument, window: suppliedWindow } = {}) {
    const doc = suppliedDocument || (typeof document === 'object' ? document : null);
    const win = suppliedWindow || (typeof window === 'object' ? window : null);
    if (!doc || !win) throw new TypeError('Onboarding view needs a document and window');
    let current = null;
    let errorNotice = null;
    function styleValue(style, name) { return style.getPropertyValue ? style.getPropertyValue(name) : style[name]; }
    function setStyleValue(style, name, value) {
      if (style.setProperty) style.setProperty(name, value);
      else style[name] = value;
    }
    function removeStyleValue(style, name) {
      if (style.removeProperty) style.removeProperty(name);
      else delete style[name];
    }

    function element(tag, className, text) {
      const node = doc.createElement(tag);
      if (className) node.classList.add(className);
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function rect(node) { return node.getBoundingClientRect(); }
    function intersection(a, b) {
      return { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top),
        right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) };
    }
    function visibleBounds(state, node) {
      let visible = { left: 8, top: 8, right: win.innerWidth - 8, bottom: win.innerHeight - 8 };
      for (const parent of scrollParents(node)) visible = intersection(visible, rect(parent));
      if (win.innerWidth < 1200) {
        const guideTop = rect(state.guide).top;
        if (guideTop > 0) visible.bottom = Math.min(visible.bottom, guideTop - 12);
      }
      return visible;
    }
    function scrollParents(node) {
      const parents = [];
      for (let parent = node?.parentElement; parent && parent !== doc.documentElement; parent = parent.parentElement) {
        const style = win.getComputedStyle(parent);
        if (/(auto|scroll|hidden|clip)/.test(`${style.overflowX} ${style.overflowY}`)) parents.push(parent);
      }
      return parents;
    }
    function observe(state) {
      if (!state.observer) return;
      state.observer.disconnect();
      state.observer.observe(state.guide);
      if (state.target?.isConnected) {
        state.observer.observe(state.target);
        for (const parent of scrollParents(state.target)) state.observer.observe(parent);
      }
      if (state.touchTarget?.isConnected) {
        state.observer.observe(state.touchTarget);
        for (const parent of scrollParents(state.touchTarget)) state.observer.observe(parent);
      }
    }
    function setMissing(state, missing) {
      state.spot.hidden = missing;
      state.missing.hidden = !missing;
    }
    function reposition() {
      const state = current;
      if (!state) return;
      if (win.innerWidth < 1200) {
        const guideTop = rect(state.guide).top;
        if (guideTop > 0) setStyleValue(doc.body.style, '--angles-tour-reserve', `${Math.ceil(win.innerHeight - guideTop + 12)}px`);
      }
      refreshTouch(state);
      const target = state.target;
      if (!target?.isConnected || typeof target.getBoundingClientRect !== 'function') {
        setMissing(state, true);
        clearCue(state);
        return;
      }
      const box = rect(target);
      const visible = visibleBounds(state, target);
      const area = intersection(visible, {
        left: box.left - PAD, top: box.top - PAD,
        right: box.right + PAD, bottom: box.bottom + PAD,
      });
      const missing = area.right <= area.left || area.bottom <= area.top;
      setMissing(state, missing);
      if (!missing) {
        Object.assign(state.spot.style, {
          left: `${Math.round(area.left)}px`, top: `${Math.round(area.top)}px`,
          width: `${Math.round(area.right - area.left)}px`, height: `${Math.round(area.bottom - area.top)}px`,
        });
      }
      positionCue(state);
    }

    function clearCue(state, forget = false) {
      if (!state) return;
      if (state.cueTimer !== null) win.clearTimeout(state.cueTimer);
      state.cueTimer = null;
      if (state.touchTarget) {
        for (const type of ['pointerdown', 'click', 'keydown', 'input']) {
          state.touchTarget.removeEventListener(type, state.onTouch);
        }
        state.touchTarget.classList.remove('angles-tour-touch-target');
        state.touchTarget.classList.remove('angles-tour-touch-static');
      }
      state.cue?.remove();
      state.cue = null;
      state.touchTarget = null;
      if (forget) state.touchSource = null;
    }
    function positionCue(state) {
      if (!state.cue) return;
      if (!state.touchTarget?.isConnected) { clearCue(state); return; }
      const box = rect(state.touchTarget);
      const bounds = visibleBounds(state, state.touchTarget);
      const shown = intersection(bounds, box);
      const right = box.right + 8;
      const left = box.left - 36;
      const side = right + 28 <= bounds.right ? right : left >= bounds.left ? left : null;
      if (shown.right - shown.left < 12 || shown.bottom - shown.top < 12 ||
          bounds.bottom - bounds.top < 30 || side === null) {
        state.cue.hidden = true;
        return;
      }
      state.cue.style.left = `${Math.round(side)}px`;
      state.cue.style.top = `${Math.round(Math.max(bounds.top, Math.min(box.top - 3, bounds.bottom - 30)))}px`;
      state.cue.hidden = false;
    }
    function resolveTouch(state, value) {
      let control;
      try { control = typeof value === 'function' ? value() : typeof value === 'string' ? doc.querySelector(value) : value; }
      catch (_) { return null; }
      if (!control?.isConnected || state.guide.contains(control)) return null;
      if (!/^(BUTTON|INPUT|TEXTAREA|SELECT|A)$/.test(control.tagName) &&
          !['button', 'link', 'slider', 'textbox', 'switch'].includes(control.getAttribute?.('role'))) return null;
      return control;
    }
    function setTouch(state, value) {
      clearCue(state);
      const control = resolveTouch(state, value);
      if (!control) return;
      state.touchTarget = control;
      state.cue = element('span', 'angles-tour-touch');
      const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 28 30');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.7');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      for (const shape of ['M11 15V5a2 2 0 0 1 4 0v8l2-1 3 2 3 1v7l-4 6h-9l-7-9a2 2 0 0 1 3-3l5 4', 'M5 8a8 8 0 0 1 16 0']) {
        const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', shape);
        svg.append(path);
      }
      state.cue.append(svg);
      state.cue.setAttribute('aria-hidden', 'true');
      state.cue.style.pointerEvents = 'none';
      control.classList.add('angles-tour-touch-target');
      if (win.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        state.cue.classList.add('angles-tour-touch-static');
        control.classList.add('angles-tour-touch-static');
      }
      doc.body.append(state.cue);
      state.onTouch = () => clearCue(state, true);
      for (const type of ['pointerdown', 'click', 'keydown', 'input']) control.addEventListener(type, state.onTouch);
      state.observer?.observe(control);
      for (const parent of scrollParents(control)) state.observer?.observe(parent);
      positionCue(state);
      if (!state.cue.classList.contains('angles-tour-touch-static')) {
        state.cueTimer = win.setTimeout(() => clearCue(state, true), 1800);
      }
    }
    function refreshTouch(state) {
      if (!state.touchSource) return;
      const control = resolveTouch(state, state.touchSource);
      if (control !== state.touchTarget) setTouch(state, state.touchSource);
    }

    function showError(message, state) {
      const readable = message instanceof Error ? message.message : String(message || 'Please try again.');
      if (errorNotice) errorNotice.remove();
      const alert = element('p', 'angles-tour-error', `Something went wrong. ${readable}`);
      alert.setAttribute('role', 'alert');
      if (state === current && state.guide.isConnected) {
        state.errorSlot.append(alert);
      } else {
        errorNotice = element('div', 'angles-tour-error-notice');
        errorNotice.append(alert);
        const dismiss = element('button', 'angles-tour-error-dismiss', 'Dismiss');
        dismiss.addEventListener('click', () => { errorNotice?.remove(); errorNotice = null; });
        errorNotice.append(dismiss);
        doc.body.append(errorNotice);
      }
    }
    function action(state, callback) {
      return () => {
        if (state.busy) return;
        state.busy = true;
        Promise.resolve().then(() => callback?.()).catch(error => showError(error, state)).finally(() => {
          state.busy = false;
        });
      };
    }
    function button(className, label, handler) {
      const node = element('button', className, label);
      node.type = 'button';
      node.addEventListener('click', handler);
      return node;
    }

    function mount({ step = {}, index = 0, total = 1, target = null, title, body, onNext, onBack, onSkip, onChapter } = {}) {
      unmount();
      if (errorNotice) { errorNotice.remove(); errorNotice = null; }
      const state = { target, guide: element('aside', 'angles-tour-guide'), spot: element('div', 'angles-tour-spotlight'),
        observer: null, cue: null, cueTimer: null, touchTarget: null, touchSource: step.touchTarget,
        onTouch: null, busy: false, priorActive: doc.body.classList.contains('angles-tour-active'),
        priorReserve: styleValue(doc.body.style, '--angles-tour-reserve') };
      current = state;
      doc.body.classList.add('angles-tour-active');
      state.guide.setAttribute('aria-label', 'Angles introduction');
      state.spot.setAttribute('aria-hidden', 'true');
      const header = element('div', 'angles-tour-header');
      header.append(element('span', 'angles-tour-brand', 'Angles'));
      header.append(button('angles-tour-skip', 'Skip', action(state, onSkip)));
      state.guide.append(header);
      const progress = element('div', 'angles-tour-chapter');
      progress.setAttribute('aria-label', 'Introduction chapters');
      const chapter = Math.max(0, Math.min(6, Number(step.chapter) || 0));
      CHAPTERS.forEach((name, chapterIndex) => {
        const marker = onChapter ? button('angles-tour-chapter-marker', name, action(state, () => onChapter(chapterIndex)))
          : element('span', 'angles-tour-chapter-marker');
        marker.setAttribute('aria-label', `Chapter ${chapterIndex + 1}: ${name}`);
        if (chapterIndex === chapter) marker.setAttribute('aria-current', 'step');
        if (chapterIndex < chapter) marker.classList.add('angles-tour-chapter-done');
        progress.append(marker);
      });
      state.guide.append(progress);
      state.guide.append(element('p', 'angles-tour-chapter-name', `${chapter + 1} of 7 · ${CHAPTERS[chapter]}`));
      const heading = element('h2', 'angles-tour-title', title ?? step.title ?? 'Explore Angles');
      heading.tabIndex = -1;
      state.guide.append(heading);
      state.guide.append(element('p', 'angles-tour-body', body ?? step.body ?? ''));
      state.missing = element('p', 'angles-tour-missing', 'This part of the app isn’t available right now. You can continue or skip the introduction.');
      state.missing.hidden = true;
      state.guide.append(state.missing);
      state.errorSlot = element('div', 'angles-tour-error-slot');
      state.guide.append(state.errorSlot);
      const footer = element('div', 'angles-tour-footer');
      const back = button('angles-tour-back', 'Back', action(state, onBack));
      back.disabled = index <= 0;
      footer.append(back);
      footer.append(element('span', 'angles-tour-count', `${index + 1} of ${total}`));
      footer.append(button('angles-tour-next', index + 1 >= total ? 'Start exploring' : 'Next', action(state, onNext)));
      state.guide.append(footer);
      state.guide.append(element('small', 'angles-tour-disclosure', 'Sample tour · illustrative examples, not measured results or forecasts.'));
      doc.body.append(state.spot, state.guide);
      state.reposition = reposition;
      win.addEventListener('scroll', reposition, true);
      win.addEventListener('resize', reposition);
      if (win.ResizeObserver) state.observer = new win.ResizeObserver(reposition);
      observe(state);
      reposition();
      heading.focus({ preventScroll: true });
    }

    function updateTarget(target, touchTarget) {
      if (!current) return;
      current.target = target;
      if (arguments.length > 1) {
        current.touchSource = touchTarget;
        if (!touchTarget) clearCue(current);
      }
      observe(current);
      reposition();
    }

    function unmount() {
      const state = current;
      if (errorNotice) { errorNotice.remove(); errorNotice = null; }
      if (!state) return;
      current = null;
      win.removeEventListener('scroll', state.reposition, true);
      win.removeEventListener('resize', state.reposition);
      state.observer?.disconnect();
      clearCue(state);
      state.spot.remove();
      state.guide.remove();
      if (!state.priorActive) doc.body.classList.remove('angles-tour-active');
      if (state.priorReserve) setStyleValue(doc.body.style, '--angles-tour-reserve', state.priorReserve);
      else removeStyleValue(doc.body.style, '--angles-tour-reserve');
    }

    return { mount, updateTarget, unmount };
  }

  return { createView };
});
