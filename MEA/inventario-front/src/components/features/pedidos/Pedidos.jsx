import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  Box,
  Stack,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import NavbarPrincipal from '../../NavbarPrincipal';
import { refreshAccessToken } from '../../utils/auth';
import { isSessionValid, clearSession } from '../../../utils/session';

const API_URL = import.meta.env.VITE_API_URL;

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarEntregados, setMostrarEntregados] = useState(false);

  const navigate = useNavigate();

  const formatoARS = (valor) =>
    parseFloat(valor).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
    });

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!isSessionValid()) {
        clearSession();
        navigate('/login', { replace: true });
        return;
      }

      const isAuth = localStorage.getItem('isAuthenticated');
      const token = localStorage.getItem('access_token');

      if (isAuth !== 'true' || !token) {
        clearSession();
        navigate('/login', { replace: true });
        return;
      }

      await cargarPedidosPendientes();
    };

    fetchPedidos();
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchConRefresh = async (url) => {
    let response = await fetch(url, { headers: getAuthHeaders() });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();

      if (!newToken) {
        clearSession();
        navigate('/login', { replace: true });
        return null;
      }

      response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    return response;
  };

  const cargarPedidosPendientes = async () => {
    try {
      setLoading(true);

      const res = await fetchConRefresh(`${API_URL}/api/pedidos/`);
      if (!res) return;

      if (!res.ok) throw new Error('Error al cargar pedidos pendientes');

      const data = await res.json();
      setPedidos(data);
      setMostrarEntregados(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarPedidosEntregadosPagados = async () => {
    try {
      setLoading(true);

      const res = await fetchConRefresh(`${API_URL}/api/pedidos-entregados-pagados/`);
      if (!res) return;

      if (!res.ok) throw new Error('Error al cargar pedidos entregados y pagados');

      const data = await res.json();
      setPedidos(data);
      setMostrarEntregados(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFiltro = () => {
    mostrarEntregados ? cargarPedidosPendientes() : cargarPedidosEntregadosPagados();
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading)
    return (
      <Typography align="center" sx={{ mt: 4, fontWeight: 600 }}>
        Cargando pedidos...
      </Typography>
    );

  if (error)
    return (
      <Typography align="center" color="error" sx={{ mt: 4, fontWeight: 600 }} role="alert">
        {error}
      </Typography>
    );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: '100%', md: 1200, lg: 1400, xl: 1600 },
        minHeight: '100vh',
        color: '#333',
        backgroundColor: '#fff',
        p: 2,
        mx: 'auto',
      }}
    >
      <NavbarPrincipal />

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
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={() => navigate('/crear-pedido')}
                sx={{
                  bgcolor: '#a8d5ba',
                  color: '#2f4f4f',
                  '&:hover': { bgcolor: '#8bc39f' },
                }}
              >
                Crear Pedido
              </Button>

              <Button
                variant="contained"
                onClick={toggleFiltro}
                sx={{
                  bgcolor: mostrarEntregados ? '#f8d7a0' : '#e2b6cf',
                  color: mostrarEntregados ? '#5e4630' : '#4b3832',
                  '&:hover': {
                    bgcolor: mostrarEntregados ? '#f4ce75' : '#d39ebf',
                  },
                }}
              >
                {mostrarEntregados ? 'Pendientes' : 'Finalizados'}
              </Button>
            </Stack>

            <TextField
              variant="outlined"
              placeholder="Buscar por cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              size="small"
              sx={{ maxWidth: 300, width: '100%' }}
              inputProps={{ 'aria-label': 'Buscar por cliente' }}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      <Typography variant="h4" align="center" sx={{ my: 4, fontWeight: 600, color: '#333' }}>
        {mostrarEntregados ? 'Pedidos Entregados y Pagados' : 'Pedidos Pendientes'}
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ maxWidth: '95%', mx: 'auto', boxShadow: 3, borderRadius: 2 }}
      >
        <Table aria-label="tabla de pedidos">
          <TableHead sx={{ bgcolor: '#eae7a4' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nº Pedido</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Pago</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Debe</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Monto Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cuotas</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nota</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Entregado
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Pagado
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pedidosFiltrados.length > 0 ? (
              pedidosFiltrados.map((pedido) => (
                <TableRow key={pedido.id} hover>
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>{pedido.cliente_nombre}</TableCell>
                  <TableCell>${formatoARS(pedido.pago_actual)}</TableCell>
                  <TableCell>${formatoARS(pedido.monto_pendiente)}</TableCell>
                  <TableCell>${formatoARS(pedido.monto_total)}</TableCell>

                  <TableCell>
                    {pedido.cantidad_cuotas > 0 ? (
                      pedido.cuotas.map((cuota) => (
                        <Box key={cuota.id} sx={{ mb: 0.5 }}>
                          {cuota.numero}° cuota: ${formatoARS(cuota.monto)}{' '}
                          {cuota.pagado ? '(Pagado)' : '(Pendiente)'}
                        </Box>
                      ))
                    ) : (
                      <Box>Pago único</Box>
                    )}
                  </TableCell>

                  <TableCell>{pedido.nota || '-'}</TableCell>

                  <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>

                  <TableCell align="center" sx={{ fontSize: '1.25rem' }}>
                    {pedido.entregado ? (
                      <CheckCircleOutlineIcon color="success" />
                    ) : (
                      <CancelOutlinedIcon color="error" />
                    )}
                  </TableCell>

                  <TableCell align="center" sx={{ fontSize: '1.25rem' }}>
                    {pedido.pagado ? (
                      <CheckCircleOutlineIcon color="success" />
                    ) : (
                      <CancelOutlinedIcon color="error" />
                    )}
                  </TableCell>

                  {/* --------------- ACCIONES (EDITAR + DETALLE) --------------- */}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {pedido.entregado && pedido.pagado ? (
                        <Button
                          variant="outlined"
                          size="small"
                          disabled
                          title="No editable al estar entregado"
                        >
                          Editar
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/crear-pedido/${pedido.id}`)}
                        >
                          Editar
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/pedido-detalle/${pedido.id}`)}
                      >
                        Detalle
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No se encontraron pedidos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Pedidos;
