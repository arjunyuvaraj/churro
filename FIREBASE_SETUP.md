# Firebase Auth + MCP Setup

## 1. Firebase CLI login

Run:

```bash
npm run firebase:login
```

If you need to switch accounts:

```bash
npm run firebase:logout
npm run firebase:login
```

To keep multiple signed-in accounts:

```bash
npm run firebase:login:add
npm run firebase:whoami
```

## 2. Select your Firebase project

Run:

```bash
npm run firebase:use
```

If this is the first time, create `.firebaserc` from `.firebaserc.example` and set your project id.

## 3. Enable Email/Password auth in Firebase Console

Go to:

Authentication -> Sign-in method -> Email/Password -> Enable

The app uses Firebase Auth email/password in signup and login views.

## 4. Add web app config values

Create `.env` using `.env.example`:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

## 5. Configure MCP client

This repo includes `mcp.json` with Firebase MCP configured via:

- command: `npx`
- args: `-y firebase-tools mcp --dir .`

If your MCP client expects `mcpServers`, this file already includes it.
If your client expects `servers`, this file already includes it.

## 6. Optional local emulator testing

Run:

```bash
npm run firebase:emulators
```

## 7. Run the app

```bash
npm run dev
```

Then open the URL shown by Vite.
