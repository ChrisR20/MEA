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
    let value = e.target.value;

    // Si es marca, convertir a número
    if (e.target.name === 'marca') {
      value = parseInt(value, 10);
    }

    setNuevoProducto({ ...nuevoProducto, [e.target.name]: value });
  };

  const handleEditProducto = (p) => {
    setProductoEditar(p);
    setNuevoProducto({
      ...p,
      marca: p.marca?.id || p.marca || '', // Asegura ID numérico
    });
    handleOpenModal();
  };

  // --------------------------
  // GUARDAR PRODUCTO
  // --------------------------
  const handleSaveProducto = async () => {
    const token = localStorage.getItem('access_token');

    const body = {
      nombre_producto: nuevoProducto.nombre_producto || '',
      marca: nuevoProducto.marca || null, // Ya es número
      desc: nuevoProducto.desc || '',
      color: nuevoProducto.color || '',
      aroma: nuevoProducto.aroma || '',
      cantidad: nuevoProducto.cantidad ? parseInt(nuevoProducto.cantidad) : 0,
      peso_neto: nuevoProducto.peso_neto || '',
      codigo: nuevoProducto.codigo ? parseInt(nuevoProducto.codigo) : 0,
      precio: nuevoProducto.precio ? parseFloat(nuevoProducto.precio) : 0,
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
            errorData.marca?.[0] ||
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

  // -------------------------
  // RENDER
  // -------------------------
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

      {/* APPBAR */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #ddd', color: '#333' }}
      >
        <Toolbar>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: '100%' }}
          >
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

      <Typography variant="h4" align="center" sx={{ my: 4, fontWeight: 600 }}>
        Listado de Productos
      </Typography>

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
                  <TableCell>{p.marca_nombre || '-'}</TableCell>
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

      {/* MODAL */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{productoEditar ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              <InputLabel>Marca</InputLabel>
              <Select name="marca" value={nuevoProducto.marca} onChange={handleChange}>
                {marcas.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Nombre"
              name="nombre_producto"
              value={nuevoProducto.nombre_producto}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Descripción"
              name="desc"
              value={nuevoProducto.desc}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Color"
              name="color"
              value={nuevoProducto.color}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Aroma"
              name="aroma"
              value={nuevoProducto.aroma}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Cantidad"
              name="cantidad"
              type="number"
              value={nuevoProducto.cantidad}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Peso Neto"
              name="peso_neto"
              value={nuevoProducto.peso_neto}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Código"
              name="codigo"
              type="number"
              value={nuevoProducto.codigo}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Precio"
              name="precio"
              type="number"
              value={nuevoProducto.precio}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveProducto}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={3000}
        onClose={() => setToastMsg('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMsg('')} severity="success" sx={{ width: '100%' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Productos;
