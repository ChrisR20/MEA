export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      "http://localhost:8000/accounts/api/token/refresh/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("access_token", data.access);
      return data.access;
    } else {
      localStorage.clear();
      return null;
    }
  } catch (err) {
    console.error("Error al refrescar el token:", err);
    localStorage.clear();
    return null;
  }
}
