// App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
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
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";

import Login from "./components/Login";
import Productos from "./components/Productos";
import Pedidos from "./components/Pedidos";
import CrearPedido from "./components/CrearPedidos";

import { isSessionValid, clearSession } from "./utils/session";

// 🎨 Paleta de colores
const primaryColor = "#d4af37"; // dorado
const hoverColor = "#cdaa25";
const backgroundColor = "#fafafa";
const cardBg = "#ffffff";

// ------------------------
// Layout con Navbar
// ------------------------
const Layout = ({ onLogout, username }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [anchorEl, setAnchorEl] = useState(null);

  const hideNavbarRoutes = ["/login"];
  const hideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <>
      <CssBaseline />
      {!hideNavbar && (
        <AppBar position="static" sx={{ backgroundColor: primaryColor }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Hola {username}
            </Typography>

            {isMobile ? (
              <>
                <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => handleNavigate("/crear-pedido")}
                    sx={{
                      color: primaryColor,
                      "& .MuiSvgIcon-root": { color: primaryColor },
                    }}
                  >
                    <ShoppingCartIcon sx={{ mr: 1 }} /> Crear Pedido
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      onLogout();
                      handleMenuClose();
                    }}
                    sx={{
                      color: primaryColor,
                      "& .MuiSvgIcon-root": { color: primaryColor },
                    }}
                  >
                    Salir
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  startIcon={<ShoppingCartIcon />}
                  variant="contained"
                  sx={{
                    bgcolor: primaryColor,
                    color: "white",
                    mr: 2,
                    "&:hover": { bgcolor: hoverColor },
                  }}
                  onClick={() => navigate("/crear-pedido")}
                >
                  Crear Pedido
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: hoverColor,
                    color: "white",
                    "&:hover": { bgcolor: hoverColor },
                  }}
                  onClick={onLogout}
                >
                  Salir
                </Button>
              </>
            )}
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

// ------------------------
// Dashboard
// ------------------------
const Dashboard = () => {
  const navItems = [
    {
      label: "Productos",
      to: "/productos",
      icon: <InventoryIcon sx={{ fontSize: 40, color: primaryColor }} />,
    },
    {
      label: "Pedidos",
      to: "/pedidos",
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: primaryColor }} />,
    },
  ];

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h4"
        sx={{ color: primaryColor, fontWeight: "bold", mb: 4 }}
      >
        Bienvenido
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {navItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={5} key={index}>
            <Box
              sx={{
                width: "100%",
                maxWidth: 300,
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                aspectRatio: "1 / 1",
                margin: "0 auto",
              }}
            >
              <Button
                component={RouterLink}
                to={item.to}
                variant="outlined"
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: primaryColor,
                  bgcolor: cardBg,
                  boxShadow: 2,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: backgroundColor,
                    borderColor: hoverColor,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box sx={{ fontSize: 50, color: primaryColor }}>
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: "1.2rem",
                    color: "#333",
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Typography>
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// ------------------------
// Private Route Wrapper
// ------------------------
const PrivateRoute = () => {
  const isAuth =
    localStorage.getItem("isAuthenticated") === "true" && isSessionValid();
  if (!isAuth) clearSession();
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

// ------------------------
// App Wrapper
// ------------------------
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
      {/* Login */}
      <Route
        path="/login"
        element={
          <Login
            setIsAuthenticated={setIsAuthenticated}
            setUsername={setUsername}
          />
        }
      />

      {/* Rutas privadas */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout onLogout={handleLogout} username={username} />}>
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
      </Route>

      {/* Redirección global */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// ------------------------
// App Principal
// ------------------------
export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
