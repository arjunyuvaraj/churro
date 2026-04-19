# Parent Invitation Deploy Guide

## 1. Firebase auth check

```bash
npm run firebase:whoami
```

If not logged in:

```bash
npm run firebase:login
npm run firebase:use
```

## 2. Deploy Firestore rules

```bash
npx -y firebase-tools deploy --only firestore:rules
```

## 3. Configure Functions params/secrets

Set non-secret params:

```bash
npx -y firebase-tools functions:params:set APP_BASE_URL="https://YOUR_APP_DOMAIN"
npx -y firebase-tools functions:params:set SMTP_HOST="smtp.yourprovider.com"
npx -y firebase-tools functions:params:set SMTP_PORT="587"
npx -y firebase-tools functions:params:set SMTP_SECURE="false"
npx -y firebase-tools functions:params:set SMTP_FROM="noreply@yourdomain.com"
```

Set secret params:

```bash
npx -y firebase-tools functions:secrets:set SMTP_USER
npx -y firebase-tools functions:secrets:set SMTP_PASS
```

## 4. Deploy Functions

```bash
npx -y firebase-tools deploy --only functions
```

## 5. Validate flow

1. Create a teen account from signup.
2. Confirm invitation record appears in Firestore collection invitations with status pending.
3. Confirm parent email receives invitation link.
4. Open link while signed in as parent with matching email.
5. Confirm:
   - invitation status becomes accepted
   - teen user has linkedParentUid and parentApproved true
   - parent user has linkedTeenUid

## 6. Local emulator validation (optional)

```bash
npm run firebase:emulators
```

When SMTP params are not configured, the function logs the accept URL without sending email.
