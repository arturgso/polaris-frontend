import axios, { AxiosHeaders } from 'axios';
import { clearAuthSession, getAuthSession } from './authSession';
import { getVaultPassword, getVaultToken } from './vaultSession';

const apiIp =
  import.meta.env.VITE_API_IP ??
  import.meta.env.VITE_API_HOST ??
  'polaris:8089';

function getApiBaseUrl(value: string) {
  const normalizedValue = value.replace(/\/$/, '');

  if (/^https?:\/\//.test(normalizedValue)) {
    return normalizedValue;
  }

  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http';

  return `${protocol}://${normalizedValue}`;
}

export const api = axios.create({
  baseURL: `${getApiBaseUrl(apiIp)}/api/v1`,
});

function shouldSkipAuthHeader(url?: string) {
  return url === '/auth/login' || url === '/auth/signup';
}

function getAuthorizationHeader(token: string, type?: string) {
  if (/^Bearer\s+/i.test(token)) {
    return token;
  }

  return `${type || 'Bearer'} ${token}`;
}

api.interceptors.request.use((config) => {
  if (shouldSkipAuthHeader(config.url)) {
    return config;
  }

  const session = getAuthSession();

  if (session !== null) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', getAuthorizationHeader(session.token, session.type));

    const vToken = getVaultToken();
    const vPassword = getVaultPassword();
    if (vToken) {
      headers.set('X-Vault-Token', vToken);
    }
    if (vPassword) {
      headers.set('X-Vault-Password', vPassword);
    }

    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthSession();

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);
