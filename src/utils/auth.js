// 简单的本地鉴权工具：保存账号/密码与模拟 token，并在路由切换时校验

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// 生成一个简单的 mock token（包含过期时间）
export function generateMockToken(username, ttlMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  return {
    username,
    issuedAt: now,
    expiresAt: now + ttlMs,
    // 简单签名（仅用于演示，非安全实现）
    sign: btoa(`${username}:${now}`)
  };
}

export function saveAuth({ username, password, ttlMs }) {
  const token = generateMockToken(username, ttlMs);
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  localStorage.setItem(USER_KEY, JSON.stringify({ username, password }));
  return token;
}

export function getToken() {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  if (!token || typeof token !== 'object') return false;
  if (!token.expiresAt || !token.username) return false;
  return Date.now() < token.expiresAt;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
