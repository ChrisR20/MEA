// session.js
export const SESSION_DURATION = 60 * 60 * 1000; // 1 hora en ms

export const setSession = () => {
  const now = new Date().getTime();
  const expiresAt = now + SESSION_DURATION;
  localStorage.setItem("expires_at", expiresAt);
};

export const isSessionValid = () => {
  const expiresAt = parseInt(localStorage.getItem("expires_at"), 10);
  const now = new Date().getTime();
  return expiresAt && now < expiresAt;
};

export const clearSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("expires_at");
};
