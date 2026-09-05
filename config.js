// Solid Rock Prayer Wall configuration
// DEMO_MODE lets you preview the experience before connecting Firebase.
// Set DEMO_MODE to false after you paste your Firebase web app config below.
window.PRAYER_WALL_CONFIG = {
  EVENT_ID: "sounds-of-revival-2026",
  EVENT_NAME: "Sounds of Revival",
  EVENT_DATES: "17–18 September 2026 · 7PM Daily",
  VENUE: "Solid Rock Dublin · Goldenbridge Industrial Estate, Inchicore",
  MAX_SUBMISSIONS: 3,
  DEMO_MODE: true,
  SUBMISSION_URL: "https://YOUR-GITHUB-USERNAME.github.io/solid-rock-prayer-wall/",
  ADMIN_UIDS: ["REPLACE_WITH_YOUR_FIREBASE_ADMIN_UID"],
  FIREBASE: {
    apiKey: "PASTE_FIREBASE_API_KEY",
    authDomain: "PASTE_PROJECT.firebaseapp.com",
    databaseURL: "https://PASTE_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "PASTE_PROJECT",
    storageBucket: "PASTE_PROJECT.appspot.com",
    messagingSenderId: "PASTE_SENDER_ID",
    appId: "PASTE_APP_ID"
  }
};
