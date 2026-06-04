import { AUTH_STORAGE_KEY } from '../constants';
import type { AuthSession, LoginResponse } from '../types';

function parseStoredSession(value: string | null): AuthSession | null {
  if (value === null) {
    return null;
  }

  try {
    const session = JSON.parse(value) as Partial<AuthSession>;

    if (typeof session.token !== 'string' || session.token.trim() === '') {
      return null;
    }

    return {
      token: session.token.trim(),
      type: typeof session.type === 'string' ? session.type.trim() : undefined,
      expiresAt: session.expiresAt,
      authenticatedAt: session.authenticatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function isExpired(session: AuthSession) {
  return typeof session.expiresAt === 'number' && Date.now() >= session.expiresAt;
}

export function saveAuthSession(response: LoginResponse) {
  const session: AuthSession = {
    token: response.token.trim(),
    type: response.type?.trim(),
    expiresAt: typeof response.expiresIn === 'number' ? Date.now() + response.expiresIn : undefined,
    authenticatedAt: new Date().toISOString(),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

  return session;
}

export function getAuthSession() {
  const session = parseStoredSession(localStorage.getItem(AUTH_STORAGE_KEY));

  if (session === null) {
    return null;
  }

  if (isExpired(session)) {
    clearAuthSession();
    return null;
  }

  return session;
}

export function hasAuthSession() {
  return getAuthSession() !== null;
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
