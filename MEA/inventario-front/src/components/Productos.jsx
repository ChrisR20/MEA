// Productos.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppBar,
  Toolbar,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';

import NavbarPrincipal from './NavbarPrincipal';
import { refreshAccessToken } from './utils/auth';
import { isSessionValid, clearSession } from '../utils/session';

function Productos() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [productoEditar, setProductoEditar] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: '',
    marca: '',
    desc: '',
    color: '',
    aroma: '',
    cantidad: '',
    peso_neto: '',
    codigo: '',
    precio: '',
  });

  // --- Manejo de Logout ---
  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  // --- Fetch Productos ---
  const fetchProductos = async () => {
    if (!isSessionValid()) return handleLogout();

    const token = localStorage.getItem('access_token');
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuth || !token) return handleLogout();

    let res = await fetch('http://127.0.0.1:8000/api/productos/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return handleLogout();

      res = await fetch('http://127.0.0.1:8000/api/productos/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    if (res.ok) {
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } else {
      setProductos([]);
    }
  };

  // --- Fetch Marcas ---
  const fetchMarcas = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('http://127.0.0.1:8000/api/marcas/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setMarcas(await res.json());
    } else {
      setMarcas([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!isSessionValid()) return handleLogout();
      await fetchProductos();
      await fetchMarcas();
    };

    init();
  }, []);

  // -------------------------
  // MODAL
  // -------------------------
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setProductoEditar(null);
    resetNuevoProducto();
    setErrorMsg('');
  };

  const resetNuevoProducto = () => {
    setNuevoProducto({
      nombre_producto: '',
      marca: '',
      desc: '',
      color: '',
      aroma: '',
      cantidad: '',
      peso_neto: '',
      codigo: '',
      precio: '',
    });
  };

  const handleChange = (e) => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const handleEditProducto = (p) => {
    setProductoEditar(p);
    setNuevoProducto({ ...p });
    handleOpenModal();
  };

  // --------------------------
  // GUARDAR PRODUCTO
  // --------------------------
  const handleSaveProducto = async () => {
    const token = localStorage.getItem('access_token');

    const body = {
      ...nuevoProducto,
      codigo: nuevoProducto.codigo ? parseInt(nuevoProducto.codigo) : null,
      cantidad: nuevoProducto.cantidad ? parseInt(nuevoProducto.cantidad) : null,
      precio: nuevoProducto.precio ? parseFloat(nuevoProducto.precio) : null,
    };

    let res;
    try {
      if (productoEditar) {
        res = await fetch(`http://127.0.0.1:8000/api/productos/${productoEditar.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('http://127.0.0.1:8000/api/productos/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        await fetchProductos();
        handleCloseModal();
        setToastMsg(productoEditar ? 'Producto editado correctamente' : 'Producto creado');
      } else {
        const errorData = await res.json();
        setErrorMsg(
          errorData.non_field_errors?.[0] ||
            errorData.nombre_producto?.[0] ||
            'Error al guardar producto'
        );
      }
    } catch (err) {
      setErrorMsg('Error al comunicarse con el servidor');
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ===============================================================
  //  RENDER (MISMA ESTRUCTURA QUE PEDIDOS)
  // ===============================================================
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '95%', sm: '90%', md: 1200, lg: 1400, xl: 1600 },
        minHeight: '100vh',
        backgroundColor: '#fff',
        p: 2,
        mx: 'auto',
      }}
    >
      <NavbarPrincipal />

      {/* APPBAR IGUAL QUE PEDIDOS */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #ddd',
          color: '#333',
        }}
      >
        <Toolbar>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: '100%' }}
          >
            {/* Botón agregar */}
            <Button
              variant="contained"
              onClick={handleOpenModal}
              sx={{
                bgcolor: '#a8d5ba',
                color: '#2f4f4f',
                '&:hover': { bgcolor: '#8bc39f' },
                width: 150,
                paddingY: 0.6,
              }}
            >
              Agregar Producto
            </Button>

            {/* Buscador */}
            <TextField
              variant="outlined"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              size="small"
              sx={{ maxWidth: 300, width: '100%' }}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* TÍTULO */}
      <Typography variant="h4" align="center" sx={{ my: 4, fontWeight: 600 }}>
        Listado de Productos
      </Typography>

      {/* TABLA (Misma estructura visual que Pedidos) */}
      <TableContainer
        component={Paper}
        sx={{ maxWidth: '95%', mx: 'auto', boxShadow: 3, borderRadius: 2 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#eae7a4' }}>
            <TableRow>
              {[
                'Producto',
                'Descripción',
                'Color',
                'Aroma',
                'Cantidad',
                'Peso Neto',
                'Código',
                'Precio',
                'Marca',
                'Acciones',
              ].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 'bold' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {productosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              productosFiltrados.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.nombre_producto}</TableCell>
                  <TableCell>{p.desc}</TableCell>
                  <TableCell>{p.color || '-'}</TableCell>
                  <TableCell>{p.aroma || '-'}</TableCell>
                  <TableCell>{p.cantidad || '-'}</TableCell>
                  <TableCell>{p.peso_neto || '-'}</TableCell>
                  <TableCell>{p.codigo || '-'}</TableCell>
                  <TableCell>${p.precio}</TableCell>
                  <TableCell>{p.marca}</TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleEditProducto(p)}>
                        Editar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Productos;
