import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper, Grid } from "@mui/material";
import { setSession } from "../utils/session"; // <-- importamos sesión

const Login = ({ setIsAuthenticated, setUsername }) => {
  const navigate = useNavigate();
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8000/accounts/api/token/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("username", username);
        localStorage.setItem("isAuthenticated", "true");

        setSession(); // <-- guardamos el tiempo de expiración

        setUsername(username);
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        setError(data.detail || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <Grid
      container
      component="main"
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        component={Paper}
        elevation={6}
        square
        sx={{ p: 4, borderRadius: 2, backgroundColor: "#fff" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Iniciar sesión
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Usuario"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!username || !password}
            >
              Entrar
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
