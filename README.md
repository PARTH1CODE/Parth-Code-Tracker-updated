# 🚀 Parth's Coding Tracker — PWA

## Files in this folder
```
parth-pwa/
├── index.html       ← Main app
├── sw.js            ← Service Worker (background notifications)
├── manifest.json    ← Makes it installable
├── icon-192.png     ← App icon
├── icon-512.png     ← App icon (large)
└── README.md        ← This file
```

---

## 📡 Step 1 — Host it FREE on GitHub Pages

1. Go to **github.com** and create a free account (if you don't have one)
2. Click **"New Repository"** → name it `parth-tracker` → set to **Public** → click Create
3. Upload ALL 5 files (index.html, sw.js, manifest.json, icon-192.png, icon-512.png)
4. Go to **Settings → Pages → Source → Deploy from branch → main → / (root)**
5. Click Save. Wait 1-2 minutes.
6. Your app will be live at: `https://YOUR_USERNAME.github.io/parth-tracker`

---

## 📲 Step 2 — Install on Your Phone (Android)

1. Open **Chrome** on your Android phone
2. Go to your GitHub Pages URL
3. Tap the **3-dot menu (⋮)** → **"Add to Home Screen"** → **Install**
4. The app now appears on your home screen like a real app! ✅

### For iPhone (iOS Safari):
1. Open **Safari** (must be Safari, not Chrome)
2. Go to your URL
3. Tap the **Share button (□↑)** → **"Add to Home Screen"** → **Add**

---

## 🔔 Step 3 — Enable Notifications

1. Open the installed app from your home screen
2. Tap **"🔕 Enable"** button at the top
3. When Chrome asks "Allow notifications?" → tap **Allow**
4. Select your timetable mode (School / Holiday / Free Day)
5. You'll now get a notification at the start of EVERY scheduled activity — even when the app is closed! ✅

### What notifications you'll receive:
- ⏰ A reminder at the start of EVERY timetable slot
- 🌅 Good Morning message at 6:25 AM
- 💻 "Did you code today?" nudge at 8:00 PM if not checked

---

## 🛠️ Troubleshooting

**Notifications not working?**
- Make sure you're using Chrome (Android) or Safari (iPhone)
- Check your phone's notification settings for Chrome/Safari
- The app MUST be installed (added to home screen) for background notifications

**App not installing?**
- Must be hosted on HTTPS (GitHub Pages gives you this automatically)
- Must open in Chrome on Android

---

## 🔄 Updating the app
Just re-upload the files to GitHub. The service worker will auto-update within 24 hours,
or immediately if you open the app and refresh.
