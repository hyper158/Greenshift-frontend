/**
 * Local development session management.
 *
 * This is a temporary frontend-only sign-in mechanism intended for development.
 * Replace this module with a proper authentication service (e.g. OAuth, JWT)
 * before deploying to production.
 *
 * Sessions are stored in sessionStorage so they clear on tab/browser close.
 */

const SESSION_KEY = 'greenshift_dev_session';

export interface DevSession {
  email: string;
  signedInAt: string;
}

/** Returns the active session, or null if the user is not signed in. */
export function getDevSession(): DevSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DevSession) : null;
  } catch {
    return null;
  }
}

/** Creates a new session for the given email address. */
export function createDevSession(email: string): DevSession {
  const session: DevSession = {
    email: email.trim().toLowerCase(),
    signedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/** Removes the active session. */
export function clearDevSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Basic email format check. Does not validate domain existence. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
