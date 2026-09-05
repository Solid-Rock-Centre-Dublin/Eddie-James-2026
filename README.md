# Solid Rock Dublin — Live Prayer Invitation Wall

Built for **Sounds of Revival**, 17–18 September 2026. The supplied church logo is used without redesign; only the outer black square around the circular artwork was made transparent.

## What is included
- `index.html` — phone submission page. Each anonymous participant can submit up to 3 invitee names.
- `display.html` — 16:9 LED display. Names appear live and gently drift; the QR panel remains top-right and always overlays names.
- `admin.html` — moderator page for reviewing/removing/downloading names.
- `database.rules.json` — Firebase Realtime Database rules that enforce the 3-submission limit per anonymous Firebase user.
- `js/profanity.js` — editable client-side profanity/slur filter.

## Preview first (no Firebase required)
`js/config.js` starts with `DEMO_MODE: true`.

Run a local web server from this folder, for example:

```bash
python -m http.server 8080
```

Then open:
- phone: `http://localhost:8080/`
- LED: `http://localhost:8080/display.html`
- moderator: `http://localhost:8080/admin.html`

Demo mode uses browser localStorage + BroadcastChannel. It is only for previewing the design on one computer/browser profile.

## Go live with Firebase
### 1. Create a Firebase project
1. Visit Firebase Console and create a project, e.g. `solid-rock-prayer-wall`.
2. Add a **Web app**.
3. Copy the Firebase config values into `js/config.js`.
4. Create a **Realtime Database**. For Dublin/Ireland, choose an available European region where possible.
5. In **Authentication → Sign-in method**, enable **Anonymous**.
6. Also enable **Email/Password** for the moderator account.

### 2. Add an admin account
1. Authentication → Users → Add user.
2. Create the church/media admin email + password.
3. Copy that user's Firebase UID.
4. Replace `REPLACE_WITH_YOUR_FIREBASE_ADMIN_UID` in BOTH:
   - `js/config.js`
   - `database.rules.json`

### 3. Publish the database rules
Open Realtime Database → Rules and paste the contents of `database.rules.json`, then publish.

The rules enforce a maximum of **3 child submissions per anonymous UID**. The UI also blocks the fourth submission.

### 4. Switch production mode on
In `js/config.js`:

```js
DEMO_MODE: false,
```

### 5. Host on GitHub Pages
1. Create a new GitHub repository, e.g. `solid-rock-prayer-wall`.
2. Upload all files/folders in this package to the repository root.
3. Repository → **Settings → Pages**.
4. Source: **Deploy from a branch**.
5. Branch: `main`, folder `/ (root)`.
6. Save. GitHub gives you a URL similar to:
   `https://YOUR-GITHUB-USERNAME.github.io/solid-rock-prayer-wall/`
7. Put that exact URL in `SUBMISSION_URL` inside `js/config.js`.
8. Commit the change. The QR on `display.html` will now point to the live phone page.

## LED screen use
- Open `display.html` in Chrome/Edge on the computer feeding the LED processor.
- Press **F11** for full screen.
- The design is built for **16:9 / 1920×1080**, but scales to other 16:9 resolutions.
- QR panel width is approximately 15% of the screen. Its z-index is deliberately above all names.
- Up to 135 names are shown at once; older names fade out as new ones arrive. All submissions remain stored in Firebase until an admin clears them.

## Moderation and profanity
The browser checks names before they are submitted. It normalises common obfuscations (punctuation / simple number substitutions) and blocks a configurable list in `js/profanity.js`.

Important: a determined technical user can bypass any client-side filter. For this church event, the moderator page provides a second layer so a media-team member can immediately remove anything inappropriate. If you need server-side profanity enforcement later, add a Firebase Cloud Function or move submission through a server endpoint.

## Name rules
- Maximum 3 submissions per anonymous participant/account.
- One or two words only.
- Maximum 40 characters.
- Letters, apostrophes, and hyphens.
- No numbers, URLs, emoji spam, or arbitrary punctuation.

## Before the event
Test with at least 5–10 phones on the actual venue Wi-Fi/mobile data and the actual LED PC. Also make sure the Firebase Realtime Database usage is appropriate for your expected attendance and plan limits.
