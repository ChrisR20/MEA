// App.jsx
import React, { useEffect, useState } from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
  Grid,
  Card,
  CardContent,
} from '@mui/material';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';

import Login from './components/Login';
import Productos from './components/features/productos/Productos';
import Pedidos from './components/features/pedidos/Pedidos';
import CrearPedido from './components/features/pedidos/CrearPedidos';
import PedidoDetalle from './components/features/pedidos/PedidoDetalle';
import Clientes from './components/features/clientes/Clientes';
import { refreshAccessToken } from './components/utils/auth';

import { isSessionValid, clearSession } from './utils/session';

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL;

// 🎨 Paleta de colores por defecto
const defaultPrimaryColor = '#d4af37'; // dorado por defecto
const hoverColor = '#cdaa25';
const backgroundColor = '#fafafa';
const cardBg = '#ffffff';

// ------------------------
// Función para formatear URLs externas de forma segura
// ------------------------
const formatExternalUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

// ------------------------
// Layout con Navbar Dinámico
// ------------------------
const Layout = ({ onLogout, username }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);

  // 🏢 Estado para la información de la Empresa
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let token = localStorage.getItem('accessToken');

        if (!token) {
          token = await refreshAccessToken();
        }

        if (!token) {
          setCanAccessAdmin(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // 1. Verificación de permisos de admin
        const resPerms = await fetch(`${API_URL}/accounts/api/is-permission/`, {
          method: 'GET',
          headers,
        });

        if (resPerms.ok) {
          const dataPerms = await resPerms.json();
          setCanAccessAdmin(dataPerms.hasPermission);
        } else {
          setCanAccessAdmin(false);
        }

        // 2. Consulta de los datos de la Empresa
        const resEmpresa = await fetch(`${API_URL}/api/empresa/`, {
          method: 'GET',
          headers,
        });

        if (resEmpresa.ok) {
          const dataEmpresa = await resEmpresa.json();
          setEmpresa(Array.isArray(dataEmpresa) ? dataEmpresa[0] : dataEmpresa);
        }
      } catch (err) {
        console.error('Error al cargar datos en el Layout:', err);
        setCanAccessAdmin(false);
      }
    };

    fetchData();
  }, []);

  const hideNavbarRoutes = ['/login'];
  const hideNavbar = hideNavbarRoutes.some((path) => location.pathname.startsWith(path));

  // Determinar color de la Navbar (color guardado en BD o fallback)
  const navbarBgColor = empresa?.color || defaultPrimaryColor;

  // Lógica para saber a qué URL redirigir al hacer clic en el botón
  const targetUrl = empresa?.url ? formatExternalUrl(empresa.url) : ADMIN_URL;

  // Renderizar la imagen del logo (Soporta Base64, URLs completas o rutas relativas de Django)
  const getLogoSrc = (logo) => {
    if (!logo) return '';
    if (logo.startsWith('data:') || logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    return `${API_URL}${logo.startsWith('/') ? '' : '/'}${logo}`;
  };

  return (
    <>
      <CssBaseline />
      {!hideNavbar && (
        <AppBar position="static" sx={{ backgroundColor: navbarBgColor }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* IZQUIERDA: Logo + Nombre de la empresa + Botón a la URL de la Empresa */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Botón redirige a la URL configurada en el backend */}
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: hoverColor,
                  color: 'white',
                  '&:hover': { bgcolor: hoverColor },
                  ml: 1,
                }}
                onClick={() => window.open(targetUrl, '_blank')}
              >
                ADMIN
              </Button>
            </Box>

            {/* CENTRO: Saludo usuario */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h6">Bienvenido {username}</Typography>
            </Box>

            {/* DERECHA: Botón Salir */}
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: hoverColor,
                  color: 'white',
                  '&:hover': { bgcolor: hoverColor },
                }}
                onClick={onLogout}
              >
                Salir
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <Box
        sx={{
          p: 3,
          backgroundColor: backgroundColor,
          width: '100vw',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

// ------------------------
// Dashboard (moderno)
// ------------------------
const Dashboard = () => {
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Productos',
      subtitle: 'Ver y gestionar inventario',
      to: '/productos',
      icon: <InventoryIcon sx={{ fontSize: 40, color: defaultPrimaryColor }} />,
    },
    {
      label: 'Pedidos',
      subtitle: 'Ver y crear pedidos',
      to: '/pedidos',
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: defaultPrimaryColor }} />,
    },
    {
      label: 'Clientes',
      subtitle: 'Lista de clientes',
      to: '/clientes',
      icon: <PeopleIcon sx={{ fontSize: 40, color: defaultPrimaryColor }} />,
    },
  ];

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Grid container spacing={3} justifyContent="center">
        {navItems.map((item, index) => (
          <Grid item key={index}>
            <Card
              onClick={() => navigate(item.to)}
              sx={{
                width: 250,
                height: 250,
                backgroundColor: cardBg,
                borderRadius: '20px',
                boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 10px 22px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    backgroundColor: `${defaultPrimaryColor}15`,
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                    mx: 'auto',
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'gray', fontSize: '0.9rem' }}>
                  {item.subtitle}
                </Typography>
              </CardContent>
            </Card>
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
  const isAuth = localStorage.getItem('isAuthenticated') === 'true' && isSessionValid();
  if (!isAuth) clearSession();
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

// ------------------------
// App Wrapper
// ------------------------
const AppWrapper = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
    const storedUsername = localStorage.getItem('username');

    if (!storedAuth || !isSessionValid()) {
      clearSession();
      setIsAuthenticated(false);
      setUsername('');
    } else {
      setIsAuthenticated(true);
      setUsername(storedUsername || 'Usuario');
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setUsername('');
    navigate('/login', { replace: true });
  };

  if (isAuthenticated === null) {
    return <Typography sx={{ mt: 2, textAlign: 'center' }}>Cargando autenticación...</Typography>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />}
      />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout onLogout={handleLogout} username={username} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/crear-pedido" element={<CrearPedido />} />
          <Route path="/crear-pedido/:pedidoId" element={<CrearPedido />} />
          <Route path="/pedido-detalle/:id" element={<PedidoDetalle />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route
            path="*"
            element={
              <Typography sx={{ mt: 4, textAlign: 'center' }}>Página no encontrada</Typography>
            }
          />
        </Route>
      </Route>

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
