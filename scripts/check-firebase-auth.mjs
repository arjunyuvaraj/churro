import fs from 'node:fs';
import process from 'node:process';

function readEnvValue(content, key) {
  const pattern = new RegExp(`^${key}=(.*)$`, 'm');
  const match = content.match(pattern);
  return match ? match[1].trim() : '';
}

async function main() {
  if (!fs.existsSync('.env')) {
    console.error('Missing .env file. Create it from .env.example first.');
    process.exit(1);
  }

  const envContent = fs.readFileSync('.env', 'utf8');
  const apiKey = readEnvValue(envContent, 'VITE_FIREBASE_API_KEY');
  if (!apiKey) {
    console.error('Missing VITE_FIREBASE_API_KEY in .env.');
    process.exit(1);
  }

  const email = `diag${Date.now()}@example.com`;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'TempPass123!',
      returnSecureToken: true
    })
  });

  const payload = await response.json();

  if (payload?.error?.message === 'CONFIGURATION_NOT_FOUND') {
    console.error('Firebase Auth is not initialized for this project. In Firebase Console open Authentication and click Get started.');
    process.exit(2);
  }

  if (payload?.error?.message === 'OPERATION_NOT_ALLOWED') {
    console.error('Email/Password provider is disabled. In Firebase Console -> Authentication -> Sign-in method, enable Email/Password.');
    process.exit(3);
  }

  if (!response.ok) {
    console.error(`Auth check failed: ${payload?.error?.message || response.statusText}`);
    process.exit(4);
  }

  console.log('Firebase Auth signup endpoint is configured and reachable.');
  console.log(`Diagnostic user created: ${payload.email}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
