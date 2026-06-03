/* =====================================================
   Parth's Coding Tracker — Service Worker v2
   Fix: use periodic sync + push check instead of
   setTimeout (which gets killed by Android)
   ===================================================== */

const CACHE_NAME = 'parth-tracker-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

/* ── INSTALL ── */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

/* ── ACTIVATE ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  notifyClients({ type: 'SW_READY' });
});

/* ── FETCH: offline support ── */
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});

/* ── NOTIFICATION CLICK ── */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});

/* ── MESSAGES FROM PAGE ── */
self.addEventListener('message', e => {
  if (!e.data) return;
  switch (e.data.type) {
    case 'SCHEDULE_NOTIFICATIONS':
      saveTasks(e.data.tasks, e.data.mode);
      checkAndNotify();               // check immediately on schedule
      break;
    case 'TEST_NOTIFICATION':
      self.registration.showNotification('🔔 Test — Parth\'s Tracker', {
        body: 'Notifications are working! You\'ll get reminders at each schedule slot. ✅',
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [300, 100, 300],
        tag: 'test'
      });
      break;
    case 'CHECK_NOW':
      checkAndNotify();
      break;
  }
});

/* ── PERIODIC SYNC (Android Chrome supports this) ── */
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-schedule') {
    e.waitUntil(checkAndNotify());
  }
});

/* ── PUSH (fallback) ── */
self.addEventListener('push', e => {
  e.waitUntil(checkAndNotify());
});

/* ═══════════════════════════════════════════
   CORE LOGIC
═══════════════════════════════════════════ */

function notifyClients(msg) {
  self.clients.matchAll().then(list => list.forEach(c => c.postMessage(msg)));
}

/* Save tasks to SW cache storage */
async function saveTasks(tasks, mode) {
  const data = { tasks, mode, savedAt: Date.now() };
  const cache = await caches.open(CACHE_NAME);
  cache.put('/__sw_tasks__', new Response(JSON.stringify(data)));
}

/* Load tasks from SW cache storage */
async function loadTasks() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match('/__sw_tasks__');
    if (!res) return null;
    return await res.json();
  } catch { return null; }
}

/* Load which notifications were already sent today */
async function loadSentToday() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match('/__sw_sent__');
    if (!res) return {};
    return await res.json();
  } catch { return {}; }
}

async function saveSentToday(sent) {
  const cache = await caches.open(CACHE_NAME);
  cache.put('/__sw_sent__', new Response(JSON.stringify(sent)));
}

/* Main check — called on every SW wake-up */
async function checkAndNotify() {
  const data = await loadTasks();
  if (!data) return;

  const { tasks, mode } = data;
  const now = new Date();
  const todayKey = now.toDateString();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  let sent = await loadSentToday();

  // Reset sent log on new day
  if (sent.__date__ !== todayKey) {
    sent = { __date__: todayKey };
  }

  const modeLabel = mode === 'school' ? '🏫 School Day'
                  : mode === 'summer' ? '🌞 Holiday'
                  : '🌴 Free Day';

  for (const task of tasks) {
    const taskMins = task.hour * 60 + task.min;
    const key = `${task.hour}-${task.min}`;

    // Fire if within 2-minute window and not yet sent today
    if (nowMins >= taskMins && nowMins <= taskMins + 2 && !sent[key]) {
      sent[key] = true;
      await self.registration.showNotification(`⏰ ${task.label}`, {
        body: `${task.time} • ${modeLabel}`,
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: `task-${key}`,
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data: { url: './' }
      });
    }
  }

  // Good morning at 6:25–6:27
  if (nowMins >= 385 && nowMins <= 387 && !sent['goodmorning']) {
    sent['goodmorning'] = true;
    await self.registration.showNotification('🚀 Good Morning, Parth!', {
      body: `Today: ${modeLabel}. Let\'s crush it! 💪`,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'good-morning',
      vibrate: [300, 100, 300],
      data: { url: './' }
    });
  }

  // Coding nudge at 8:00 PM (1200 mins)
  if (nowMins >= 1200 && nowMins <= 1202 && !sent['codingnudge']) {
    sent['codingnudge'] = true;
    await self.registration.showNotification('💻 Did you code today, Parth?', {
      body: 'Open the tracker and log your coding practice! 🔥',
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'coding-nudge',
      vibrate: [200, 100, 200],
      data: { url: './' }
    });
  }

  await saveSentToday(sent);
}
