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
  Stack,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

import NavbarPrincipal from '../../NavbarPrincipal';
import ProductoModal from './ProductoModal';
import { refreshAccessToken } from '../../utils/auth';
import { isSessionValid, clearSession } from '../../../utils/session';

const API_URL = import.meta.env.VITE_API_URL;

function Productos() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(''); // NUEVO
  const [openModal, setOpenModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  const fetchWithAuth = async (url, options = {}) => {
    if (!isSessionValid()) return handleLogout();

    const token = localStorage.getItem('access_token');
    if (!token) return handleLogout();

    options.headers = { ...getAuthHeaders(), ...(options.headers || {}) };
    let res = await fetch(url, options);

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return handleLogout();
      options.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, options);
    }
    return res;
  };

  const fetchProductos = async () => {
    const res = await fetchWithAuth(`${API_URL}/api/productos/`);
    if (res.ok) {
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } else setProductos([]);
  };

  const fetchMarcas = async () => {
    const res = await fetchWithAuth(`${API_URL}/api/marcas/`);
    if (res.ok) setMarcas(await res.json());
    else setMarcas([]);
  };

  useEffect(() => {
    const init = async () => {
      if (!isSessionValid()) return handleLogout();
      await fetchProductos();
      await fetchMarcas();
    };
    init();
  }, []);

  const handleOpenModal = (producto = null) => {
    setProductoEditar(producto);
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  const handleSaveProducto = async (nuevoProducto) => {
    const body = {
      nombre_producto: nuevoProducto.nombre_producto || '',
      marca: nuevoProducto.marca || null,
      desc: nuevoProducto.desc || '',
      color: nuevoProducto.color || '',
      aroma: nuevoProducto.aroma || '',
      cantidad: nuevoProducto.cantidad ? parseInt(nuevoProducto.cantidad) : 0,
      peso_neto: nuevoProducto.peso_neto || '',
      codigo: nuevoProducto.codigo ? parseInt(nuevoProducto.codigo) : 0,
      precio: nuevoProducto.precio ? parseFloat(nuevoProducto.precio) : 0,
    };

    try {
      let res;
      if (productoEditar) {
        res = await fetchWithAuth(`${API_URL}/api/productos/${productoEditar.id}/`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        res = await fetchWithAuth(`${API_URL}/api/productos/`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        await fetchProductos();
        handleCloseModal();
        setToastMsg(productoEditar ? 'Producto editado correctamente' : 'Producto creado');
      } else {
        const errorData = await res.json();
        setToastMsg(
          errorData.non_field_errors?.[0] ||
            errorData.nombre_producto?.[0] ||
            errorData.marca?.[0] ||
            'Error al guardar producto'
        );
      }
    } catch (err) {
      setToastMsg('Error al comunicarse con el servidor');
    }
  };

  // FILTRADO por nombre y por marca
  const productosFiltrados = productos.filter((p) => {
    const cumpleNombre = p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleMarca = marcaSeleccionada ? p.marca === marcaSeleccionada : true;
    return cumpleNombre && cumpleMarca;
  });

  const formatPrecio = (valor) => {
    if (valor === null || valor === undefined) return '$ 0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(valor);
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1400,
        minHeight: '100vh',
        backgroundColor: '#fff',
        p: 2,
        mx: 'auto',
      }}
    >
      <NavbarPrincipal />

      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd', color: '#333' }}
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
              onClick={() => handleOpenModal()}
              sx={{ bgcolor: '#a8d5ba', color: '#2f4f4f', '&:hover': { bgcolor: '#8bc39f' } }}
            >
              Agregar Producto
            </Button>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <TextField
                variant="outlined"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                size="small"
                sx={{ maxWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Marca</InputLabel>
                <Select
                  value={marcaSeleccionada}
                  label="Marca"
                  onChange={(e) => setMarcaSeleccionada(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {marcas.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Typography variant="h4" align="center" sx={{ my: 4, fontWeight: 600 }}>
        Listado de Productos
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ maxWidth: '100%', mx: 'auto', boxShadow: 3, borderRadius: 2 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#eae7a4' }}>
            <TableRow>
              {[
                'Producto',
                'Marca',
                'Descripción',
                'Color',
                'Aroma',
                'Cantidad',
                'Peso Neto',
                'Código',
                'Precio',
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
                <TableCell colSpan={11} align="center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              productosFiltrados.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.nombre_producto}</TableCell>
                  <TableCell>{p.marca_nombre}</TableCell>
                  <TableCell>{p.desc}</TableCell>
                  <TableCell>{p.color || '-'}</TableCell>
                  <TableCell>{p.aroma || '-'}</TableCell>
                  <TableCell>{p.cantidad || '-'}</TableCell>
                  <TableCell>{p.peso_neto || '-'}</TableCell>
                  <TableCell>{p.codigo || '-'}</TableCell>
                  <TableCell>{formatPrecio(p.precio)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleOpenModal(p)}>
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

      <ProductoModal
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSaveProducto}
        marcas={marcas}
        producto={productoEditar}
      />

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
