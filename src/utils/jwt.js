// src/utils/jwt.js
// Decodage et verification de validite du token JWT cote client

export const decodeToken = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const jsonPayload = decodeURIComponent(
      atob(base64 + padding)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded) return true;
  if (!decoded.exp) return false;
  return decoded.exp * 1000 <= Date.now();
};
