import React from 'react';
import {
  Typography,
  Button,
  IconButton,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import NavbarPrincipal from '../../NavbarPrincipal';
import { useCrearPedidos } from './useCrearPedidos';

const colorPrimary = '#c5892a';

function CrearPedido() {
  const {
    pedidoId,
    clientes,
    productos,
    clienteSeleccionado,
    setClienteSeleccionado,
    pago,
    setPago,
    nota,
    setNota,
    entregado,
    setEntregado,
    pagado,
    setPagado,
    tipoPago,
    setTipoPago,
    productosPedido,
    cuotas,
    errorGeneral,
    setErrorGeneral,
    toastMsg,
    setToastMsg,
    navigate,
    formatoARS,
    handleProductoChange,
    agregarProducto,
    eliminarProducto,
    montoPendiente,
    handleCuotaChange,
    handleSubmit,
    montoTotal,
    cuotaSugerida,
  } = useCrearPedidos();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'white',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <NavbarPrincipal />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          backgroundColor: '#fff',
          p: 1,
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
        }}
        noValidate
      >
        <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
          {pedidoId ? 'Edita tu Pedido' : 'Crea un nuevo pedido'}
        </Typography>

        {errorGeneral && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral}
          </Alert>
        )}

        {/* CLIENTE */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="cliente-label">Cliente</InputLabel>
          <Select
            labelId="cliente-label"
            value={clienteSeleccionado}
            onChange={(e) => {
              setClienteSeleccionado(e.target.value);
              setErrorGeneral('');
            }}
            sx={{
              '& .MuiSelect-select': {
                maxWidth: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              },
            }}
          >
            <MenuItem value="">
              <em>Selecciona un cliente</em>
            </MenuItem>

            {clientes.map((c) => (
              <MenuItem
                key={c.id}
                value={c.id}
                sx={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* PRODUCTOS */}
        <Box mt={4}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Productos
          </Typography>

          {productosPedido.map((p, index) => (
            <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 2 }}>
              {/* PRODUCTO */}
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel id={`producto-label-${index}`}>Producto</InputLabel>
                  <Select
                    labelId={`producto-label-${index}`}
                    value={p.producto}
                    onChange={(e) => handleProductoChange(index, 'producto', e.target.value)}
                    sx={{
                      '& .MuiSelect-select': {
                        maxWidth: '100%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Selecciona un producto</em>
                    </MenuItem>

                    {productos.map((prod) => (
                      <MenuItem
                        key={prod.id}
                        value={prod.id}
                        sx={{
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {prod.nombre_producto} - {prod.desc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* CANTIDAD */}
              <Grid item xs={2.5}>
                <TextField
                  type="number"
                  label="Cant."
                  sx={{ width: '60px' }}
                  inputProps={{ min: 1 }}
                  value={p.cantidad}
                  onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                  required
                />
              </Grid>

              {/* PRECIO */}
              <Grid item xs={3}>
                <Typography fontWeight={600} textAlign="center">
                  ${formatoARS(p.precio_unitario)}
                </Typography>
              </Grid>

              {/* ELIMINAR */}
              <Grid
                item
                xs={1.5}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {productosPedido.length > 1 && (
                  <IconButton color="error" onClick={() => eliminarProducto(index)} size="small">
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}

          <Button
            variant="outlined"
            fullWidth
            onClick={agregarProducto}
            sx={{
              borderColor: colorPrimary,
              color: colorPrimary,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: colorPrimary,
                color: '#fff',
                borderColor: colorPrimary,
              },
            }}
          >
            + Agregar Producto
          </Button>

          <Typography variant="h6" fontWeight={700} mt={3} textAlign="right">
            Monto Total: ${formatoARS(montoTotal)}
          </Typography>
        </Box>

        {/* TIPO DE PAGO */}
        <Box mt={4}>
          <FormControl fullWidth required>
            <InputLabel id="tipo-pago-label">Forma de pago</InputLabel>
            <Select
              labelId="tipo-pago-label"
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  maxWidth: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              <MenuItem value="unico">Pago único</MenuItem>
              <MenuItem value="cuotas">3 cuotas</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* PAGO ÚNICO */}
        {tipoPago === 'unico' && (
          <Box mt={3}>
            <TextField
              label="Pago"
              type="number"
              step="0.01"
              fullWidth
              value={pago}
              onChange={(e) => setPago(e.target.value)}
              placeholder="Ingrese el pago"
              required
              helperText={`Monto pendiente: $${montoPendiente()}`}
            />
          </Box>
        )}

        {/* CUOTAS */}
        {tipoPago === 'cuotas' && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Cuotas
            </Typography>

            {cuotas.map((cuota, index) => (
              <Grid container spacing={2} key={cuota.numero} alignItems="center" mb={1}>
                <Grid item xs={4}>
                  <Typography>Cuota {cuota.numero}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    type="number"
                    step="0.01"
                    value={cuota.monto}
                    onChange={(e) => handleCuotaChange(index, 'monto', e.target.value)}
                    placeholder={`Monto sugerido: ${cuotaSugerida}`}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cuota.pagado}
                        onChange={(e) => handleCuotaChange(index, 'pagado', e.target.checked)}
                      />
                    }
                    label="Pagado"
                  />
                </Grid>
              </Grid>
            ))}
            <Typography color="text.secondary" mt={1}>
              Monto pendiente: ${montoPendiente()}
            </Typography>
          </Box>
        )}

        {/* NOTAS */}
        <Box mt={3}>
          <TextField
            label="Notas"
            multiline
            rows={3}
            fullWidth
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Notas adicionales..."
          />
        </Box>

        {/* CHECKBOXES */}
        <Box mt={3} display="flex" justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                checked={entregado}
                onChange={(e) => setEntregado(e.target.checked)}
                sx={{
                  color: colorPrimary,
                  '&.Mui-checked': {
                    color: colorPrimary,
                  },
                }}
              />
            }
            label="Entregado"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={pagado}
                onChange={(e) => setPagado(e.target.checked)}
                sx={{
                  color: colorPrimary,
                  '&.Mui-checked': {
                    color: colorPrimary,
                  },
                }}
              />
            }
            label="Pagado"
          />
        </Box>

        {/* BOTONES ACCIÓN */}
        <Box
          mt={4}
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
          gap={2}
        >
          <Button
            variant="outlined"
            size="medium"
            fullWidth={{ xs: true, sm: false }}
            onClick={() => navigate('/pedidos')}
            sx={{
              borderColor: '#999',
              color: '#555',
              fontWeight: 600,
              minWidth: { sm: 120 },
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#777',
              },
            }}
          >
            Volver
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="medium"
            fullWidth={{ xs: true, sm: false }}
            sx={{
              backgroundColor: colorPrimary,
              fontWeight: 600,
              minWidth: { sm: 160 },
              '&:hover': {
                backgroundColor: '#a87422',
              },
            }}
          >
            {pedidoId ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={2500}
        onClose={() => setToastMsg('')}
        message={toastMsg}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '50% !important',
          left: '50% !important',
          transform: 'translate(-50%, -50%) !important',
        }}
      />
    </Box>
  );
}

export default CrearPedido;
