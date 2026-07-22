import React from 'react';
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
import { usePedidos } from './usePedidos';

function Pedidos() {
  const {
    busqueda,
    setBusqueda,
    loading,
    error,
    mostrarEntregados,
    navigate,
    formatoARS,
    toggleFiltro,
    pedidosFiltrados,
  } = usePedidos();

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
