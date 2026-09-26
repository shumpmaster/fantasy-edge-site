(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AnglesOnboarding = api;
})(typeof globalThis === 'object' ? globalThis : null, function () {
  'use strict';

  const PREFERENCE_KEY = 'angles.onboarding.v1';
  const FINISHED_VALUES = new Set(['completed', 'skipped']);

  function createController({ host, view, steps, eventTarget } = {}) {
    if (!host || !view || !Array.isArray(steps) || steps.length === 0) {
      throw new TypeError('Onboarding needs a host, a view, and nonempty steps');
    }
    const events = eventTarget || (typeof window === 'object' ? window : null);
    let session = null;
    let finishedInMemory = false;
    let destroyed = false;

    function storedPreference() {
      try {
        return host.storage?.get(PREFERENCE_KEY);
      } catch (_) {
        return null;
      }
    }

    function savePreference(value) {
      finishedInMemory = true;
      try {
        host.storage?.set(PREFERENCE_KEY, value);
      } catch (_) {
        // Unavailable browser storage must never trap the user in the tour.
      }
    }

    function detach(current) {
      if (!events) return;
      events.removeEventListener('keydown', current.onKeydown);
      events.removeEventListener('popstate', current.onPopstate);
    }

    function exit(current, preference) {
      if (!current || current !== session) return Promise.resolve(false);
      if (current.exitPromise) return current.exitPromise;
      current.exiting = true;
      current.generation += 1;
      detach(current);
      if (preference) savePreference(preference);
      current.exitPromise = (async () => {
        let cleanupError;
        try {
          view.unmount();
        } catch (error) {
          cleanupError = error;
        }
        // A late route mount cannot overwrite the restored inbound destination.
        await current.entryPromise.catch(() => {});
        await current.queue;
        try {
          await host.leavePreview(current.context);
        } finally {
          if (session === current) session = null;
        }
        if (cleanupError) throw cleanupError;
        return true;
      })();
      return current.exitPromise;
    }

    function transition(current, index) {
      current.requestedIndex = index;
      const generation = ++current.generation;
      const operation = current.queue.then(async () => {
        if (current !== session || current.exiting || generation !== current.generation) return false;
        const step = steps[index];
        await host.navigate(step.route);
        if (current !== session || current.exiting || generation !== current.generation) return false;
        const target = step.targetKey ? host.target(step.targetKey) : null;
        view.mount({
          step,
          index,
          total: steps.length,
          target,
          onNext: next,
          onBack: back,
          onSkip: skip,
          onChapter: jumpToChapter,
        });
        current.index = index;
        return true;
      });
      current.queue = operation.catch(() => {});
      return operation.catch(async error => {
        await exit(current, null);
        throw error;
      });
    }

    function start({ replay = false } = {}) {
      if (destroyed) return Promise.resolve(false);
      if (session?.exiting) return session.exitPromise.then(() => false);
      if (session) return session.startPromise;
      if (!replay && (finishedInMemory || FINISHED_VALUES.has(storedPreference()))) {
        return Promise.resolve(false);
      }

      let context;
      try {
        context = host.captureContext();
      } catch (error) {
        return Promise.reject(error);
      }
      const current = {
        context,
        generation: 0,
        index: -1,
        requestedIndex: 0,
        queue: Promise.resolve(),
        entryPromise: null,
        exitPromise: null,
        exiting: false,
      };
      current.onKeydown = event => {
        if (event.key !== 'Escape') return;
        event.preventDefault?.();
        void skip().catch(error => console.error('Onboarding exit failed', error));
      };
      current.onPopstate = () => {
        void skip().catch(error => console.error('Onboarding exit failed', error));
      };
      session = current;
      events?.addEventListener('keydown', current.onKeydown);
      events?.addEventListener('popstate', current.onPopstate);

      let entry;
      try {
        entry = host.enterPreview();
      } catch (error) {
        entry = Promise.reject(error);
      }
      current.entryPromise = Promise.resolve(entry);
      current.startPromise = (async () => {
        try {
          await current.entryPromise;
          if (current.exiting || session !== current) return false;
          return await transition(current, 0);
        } catch (error) {
          await exit(current, null);
          throw error;
        }
      })();
      return current.startPromise;
    }

    function next() {
      const current = session;
      if (!current || current.exiting) return Promise.resolve(false);
      // A stop only advances after it has actually mounted. Repeated taps
      // during a route change cannot skip it or finish the tour early.
      if (current.index < 0 || current.requestedIndex !== current.index) return Promise.resolve(false);
      const index = current.index + 1;
      if (index >= steps.length) return exit(current, 'completed');
      return transition(current, index);
    }

    function back() {
      const current = session;
      if (!current || current.exiting || current.index < 0) return Promise.resolve(false);
      // Back may cancel an in-flight forward navigation. A second Back
      // during a pending reverse navigation waits for that stop to mount.
      if (current.requestedIndex > current.index) return transition(current, current.index);
      if (current.requestedIndex < current.index || current.index === 0) return Promise.resolve(false);
      return transition(current, current.index - 1);
    }

    function skip() { return exit(session, 'skipped'); }

    function cancel() { return exit(session, null); }

    function jumpToChapter(chapter) {
      const current = session;
      if (!current || current.exiting || !Number.isInteger(chapter)) return Promise.resolve(false);
      const index = steps.findIndex(step => step.chapter === chapter);
      if (index < 0 || current.index < 0 || steps[current.index].chapter === chapter) {
        return Promise.resolve(false);
      }
      return transition(current, index);
    }

    function destroy() {
      destroyed = true;
      return exit(session, null);
    }

    return { start, next, back, skip, cancel, jumpToChapter, destroy };
  }

  return { createController, PREFERENCE_KEY };
});
