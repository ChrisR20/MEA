export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  const API_URL = import.meta.env.VITE_API_URL;

  if (!refreshToken) {
    return null;
  }

  try {
    // Usamos API_URL y aseguramos que la ruta quede correcta
    const url = `${API_URL.replace(/\/$/, '')}/accounts/api/token/refresh/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      localStorage.clear();
      return null;
    }
  } catch (err) {
    console.error('Error al refrescar el token:', err);
    localStorage.clear();
    return null;
  }
}
