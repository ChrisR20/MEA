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

const mostazaColor = "#b8860b";

const Layout = ({ onLogout, username }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/productos", "/pedidos", "/crear-pedido"];
  const hideNavbar =
    hideNavbarRoutes.some((path) => location.pathname.startsWith(path)) ||
    location.pathname.startsWith("/crear-pedido/");

  return (
    <>
      <CssBaseline />
      {!hideNavbar && (
        <AppBar position="static" sx={{ backgroundColor: mostazaColor }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Bienvenido {username}
            </Typography>

            <Button
              color="inherit"
              onClick={onLogout}
              sx={{
                borderColor: "white",
                borderWidth: 1,
                borderStyle: "solid",
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
          backgroundColor: "#fafafa",
          width: "100vw",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

const Dashboard = ({ username }) => (
  <Box sx={{ textAlign: "center" }}>
    <Typography
      variant="h4"
      sx={{ color: mostazaColor, fontWeight: "bold", mb: 4 }}
    >
      Bienvenido al sistema
    </Typography>

    <Grid container spacing={3} justifyContent="center">
      {[
        {
          label: "Productos",
          to: "/productos",
          icon: <InventoryIcon sx={{ ml: 1 }} />,
        },
        {
          label: "Pedidos",
          to: "/pedidos",
          icon: <LocalShippingIcon sx={{ ml: 1 }} />,
        },
        {
          label: "Crear Pedidos",
          to: "/crear-pedido",
          icon: <ShoppingCartIcon sx={{ ml: 1 }} />,
        },
      ].map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Box display="flex" justifyContent="center">
            <Button
              component={RouterLink}
              to={item.to}
              variant="contained"
              sx={{
                bgcolor: mostazaColor,
                color: "white",
                height: 100,
                width: 250,
                fontSize: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                "&:hover": { bgcolor: "#f4ce75", color: "white" },
              }}
            >
              {item.label}
              {item.icon}
            </Button>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const PrivateRoute = ({ children }) => {
  const isAuth =
    localStorage.getItem("isAuthenticated") === "true" && isSessionValid();
  if (!isAuth) clearSession();
  return isAuth ? children : <Navigate to="/login" replace />;
};

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
        <Route path="/dashboard" element={<Dashboard username={username} />} />
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

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
