import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLogin } from './useLogin';

const Login = ({ setIsAuthenticated, setUsername }) => {
  const {
    usernameInput,
    setUsernameInput,
    password,
    setPassword,
    error,
    showPassword,
    handleClickShowPassword,
    handleSubmit,
  } = useLogin({ setIsAuthenticated, setUsername });

  return (
    <Grid
      container
      component="main"
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
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
        sx={{ p: 4, borderRadius: 2, backgroundColor: '#fff' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Agregar el logo aquí */}
          <Avatar
            alt="Logo"
            src={`${import.meta.env.VITE_API_URL}/static/logo.jpeg`}
            sx={{ width: 150, height: 150, mb: 2 }}
          />
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Iniciar sesión
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Usuario"
              autoComplete="username"
              autoFocus
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              disabled={!usernameInput || !password}
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
