/* THE SERVICE WORKER, AND IT HAS ONE JOB (m4.3 A3).
 *
 * A browser will not hand out a push subscription to a page that has
 * no service worker, and it will not deliver a push to one that
 * cannot display it. That is the whole reason this file exists.
 *
 * NOTHING SENDS YET. `ops/reads_service/push.py` stores subscriptions
 * and has no send path at all: what may push, what it says and how
 * often is the notification catalog, and the catalog is its own owner
 * ruling (ACCOUNTS_LITE_SPEC sec 4 and sec 9, under D-130). So this
 * worker is written for the day the first message arrives and does
 * nothing on any other day.
 *
 * IT DOES NOT TOUCH THE NETWORK AND IT CACHES NOTHING. There is no
 * fetch handler here on purpose: a worker that served this app from a
 * cache could show somebody yesterday's numbers, which is the one
 * thing this product must never do.
 *
 * The title and body are whatever the message carries. This file
 * invents no wording, because it cannot know what the message is
 * about until the catalog says. */

self.addEventListener("push", function (event) {
  var said = {};
  try {
    said = event.data ? event.data.json() : {};
  } catch (err) {
    /* a message that is not JSON is a message this worker cannot
     * read, and it says nothing rather than guessing */
    said = {};
  }
  if (!said || !said.title) return;
  event.waitUntil(self.registration.showNotification(said.title, {
    body: said.body || "",
    tag: said.tag || "fantasy-edge",
    data: { url: said.url || "./" }
  }));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url)
    || "./";
  event.waitUntil(self.clients.openWindow(url));
});
