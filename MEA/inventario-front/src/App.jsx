import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
  Link as RouterLink,
} from "react-router-dom";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
  Grid,
} from "@mui/material";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";

import Productos from "./components/Productos";
import Pedidos from "./components/Pedidos";
import CrearPedido from "./components/CrearPedidos";
import Login from "./components/Login";

import { isSessionValid, clearSession } from "./utils/session";

// 🎨 Paleta moderna y suave
const primaryColor = "#d4af37"; // dorado elegante
const hoverColor = "#cdaa25"; // acento hover
const backgroundColor = "#fafafa"; // fondo muy claro
const cardBg = "#ffffff"; // fondo de card blanco

// Layout principal con botón de Crear Pedido arriba a la derecha
const Layout = ({ onLogout, username }) => {
  const location = useLocation();
  const navigate = useNavigate(); // <- IMPORTANTE, aquí obtenemos navigate
  const hideNavbarRoutes = ["/productos", "/pedidos", "/crear-pedido"];
  const hideNavbar =
    hideNavbarRoutes.some((path) => location.pathname.startsWith(path)) ||
    location.pathname.startsWith("/crear-pedido/");

  return (
    <>
      <CssBaseline />
      {!hideNavbar && (
        <AppBar position="static" sx={{ backgroundColor: primaryColor }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Hola {username}
            </Typography>

            {/* Botón Crear Pedido arriba a la derecha */}
            <Button
              startIcon={<ShoppingCartIcon />}
              variant="contained"
              sx={{
                bgcolor: hoverColor,
                color: "white",
                mr: 2,
                "&:hover, &:focus, &:active": {
                  bgcolor: hoverColor,
                  boxShadow: "none",
                },
              }}
              onClick={() => navigate("/crear-pedido")}
            >
              Crear Pedido
            </Button>

            <Button
              variant="contained"
              onClick={onLogout}
              sx={{
                bgcolor: hoverColor,
                color: "white",
                mr: 2,
                "&:hover, &:focus, &:active": {
                  bgcolor: hoverColor,
                  boxShadow: "none",
                },
              }}
            >
              Salir
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Box
        sx={{
          p: 3,
          backgroundColor: backgroundColor,
          width: "100vw",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

// Dashboard moderno
const Dashboard = () => {
  const navItems = [
    {
      label: "Productos",
      to: "/productos",
      icon: <InventoryIcon sx={{ fontSize: 40, color: primaryColor }} />,
      type: "section",
    },
    {
      label: "Pedidos",
      to: "/pedidos",
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: primaryColor }} />,
      type: "section",
    },
  ];

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h4"
        sx={{
          color: primaryColor,
          fontWeight: "bold",
          mb: 4,
          fontFamily: "Roboto, sans-serif",
        }}
      >
        Bienvenido
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {navItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Button
              component={RouterLink}
              to={item.to}
              variant="outlined"
              sx={{
                bgcolor: cardBg,
                borderColor: primaryColor,
                borderWidth: 2,
                borderRadius: 3,
                height: 140,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: backgroundColor,
                  borderColor: hoverColor,
                  transform: "translateY(-4px)",
                },
              }}
            >
              {item.icon}
              <Typography sx={{ mt: 1, fontSize: "1.1rem", color: "#333" }}>
                {item.label}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Ruta privada
const PrivateRoute = ({ children }) => {
  const isAuth =
    localStorage.getItem("isAuthenticated") === "true" && isSessionValid();
  if (!isAuth) clearSession();
  return isAuth ? children : <Navigate to="/login" replace />;
};

// App Wrapper
const AppWrapper = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    const storedUsername = localStorage.getItem("username");

    if (!storedAuth || !isSessionValid()) {
      clearSession();
      setIsAuthenticated(false);
      setUsername("");
    } else {
      setIsAuthenticated(true);
      setUsername(storedUsername || "Usuario");
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setUsername("");
    navigate("/login", { replace: true });
  };

  if (isAuthenticated === null) {
    return (
      <Typography sx={{ mt: 2, textAlign: "center" }}>
        Cargando autenticación...
      </Typography>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login
            setIsAuthenticated={setIsAuthenticated}
            setUsername={setUsername}
          />
        }
      />
      <Route
        element={
          <PrivateRoute>
            <Layout onLogout={handleLogout} username={username} />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/crear-pedido" element={<CrearPedido />} />
        <Route path="/crear-pedido/:pedidoId" element={<CrearPedido />} />
        <Route
          path="*"
          element={
            <Typography sx={{ mt: 4, textAlign: "center" }}>
              Página no encontrada
            </Typography>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// App principal
export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
