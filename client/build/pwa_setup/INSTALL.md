# PWA Setup Instructions

## Step 1 — Copy files
- pwa_setup/public/* → client/public/
- pwa_setup/src/serviceWorkerRegistration.js → client/src/serviceWorkerRegistration.js

## Step 2 — Update client/src/index.js
Add these 2 lines:

  // At the top of index.js:
  import * as serviceWorkerRegistration from './serviceWorkerRegistration';

  // At the bottom of index.js:
  serviceWorkerRegistration.register();

## Step 3 — Update client/src/App.js
Change redirect to New Bill on login:
  <Route path="*" element={<Navigate to="/bills/new" />} />

## Step 4 — Build and deploy
  cd client
  npm run build

## Step 5 — iPhone install (Safari only)
1. Open your Vercel URL in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Name: "Chintamani Electricals"
5. Tap Add

The app opens full screen like a native app!
