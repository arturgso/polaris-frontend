let vaultToken: string | null = null;
let vaultPassword: string | null = null;

export function saveVaultSession(token: string, password: string) {
  vaultToken = token;
  vaultPassword = password;
  sessionStorage.setItem('polaris:vault-token', token);
  sessionStorage.setItem('polaris:vault-password', password);
}

export function getVaultToken() {
  if (!vaultToken) {
    vaultToken = sessionStorage.getItem('polaris:vault-token');
  }
  return vaultToken;
}

export function getVaultPassword() {
  if (!vaultPassword) {
    vaultPassword = sessionStorage.getItem('polaris:vault-password');
  }
  return vaultPassword;
}

export function clearVaultSession() {
  vaultToken = null;
  vaultPassword = null;
  sessionStorage.removeItem('polaris:vault-token');
  sessionStorage.removeItem('polaris:vault-password');
}

export function hasVaultSession() {
  return getVaultToken() !== null;
}
