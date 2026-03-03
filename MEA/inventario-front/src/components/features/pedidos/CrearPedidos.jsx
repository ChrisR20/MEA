import React, { useState, useEffect } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
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
import { refreshAccessToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

const colorPrimary = '#c5892a';

function CrearPedido() {
  const { pedidoId } = useParams();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [pago, setPago] = useState('');
  const [nota, setNota] = useState('');
  const [entregado, setEntregado] = useState(false);
  const [pagado, setPagado] = useState(false);
  const [tipoPago, setTipoPago] = useState('unico');

  const [productosPedido, setProductosPedido] = useState([
    { producto: '', cantidad: 1, precio_unitario: 0 },
  ]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [cuotas, setCuotas] = useState([
    { numero: 1, monto: '', pagado: false },
    { numero: 2, monto: '', pagado: false },
    { numero: 3, monto: '', pagado: false },
  ]);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const navigate = useNavigate();

  const formatoARS = (valor) =>
    parseFloat(valor).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchConRefresh = async (url, options = {}) => {
    let res = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...(options.headers || {}) },
    });

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        localStorage.clear();
        navigate('/login');
        return null;
      }
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
    return res;
  };

  // ---------------- CARGAR CLIENTES Y PRODUCTOS ----------------
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    const token = localStorage.getItem('access_token');
    if (isAuth !== 'true' || !token) {
      navigate('/login');
      return;
    }

    const cargarClientes = async () => {
      try {
        const res = await fetchConRefresh(`${API_URL}/api/clientes/`);
        if (!res) return;
        if (!res.ok) throw new Error('Error al cargar clientes');
        const data = await res.json();
        setClientes(data);
      } catch (err) {
        console.error(err);
        setErrorGeneral('Error al cargar clientes');
      }
    };

    const cargarProductos = async () => {
      try {
        const res = await fetchConRefresh(`${API_URL}/api/productos/`);

        if (!res) return;
        if (!res.ok) throw new Error('Error al cargar productos');
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        console.error(err);
        setErrorGeneral('Error al cargar productos');
      }
    };

    cargarClientes();
    cargarProductos();
  }, [navigate]);

  // ---------------- CARGAR PEDIDO PARA EDITAR ----------------
  useEffect(() => {
    if (!pedidoId) {
      setCuotas([
        { numero: 1, monto: '', pagado: false },
        { numero: 2, monto: '', pagado: false },
        { numero: 3, monto: '', pagado: false },
      ]);
      return;
    }

    const cargarPedido = async () => {
      try {
        const res = await fetchConRefresh(`${API_URL}/api/pedidos/${pedidoId}/`);
        if (!res) return;
        if (!res.ok) throw new Error('Error al cargar el pedido');
        const data = await res.json();

        setClienteSeleccionado(data.cliente);
        setPago(data.pago);
        setNota(data.nota || '');
        setEntregado(Boolean(data.entregado));
        setPagado(Boolean(data.pagado));
        setTipoPago(data.tipo_pago || 'unico');

        const productosIniciales =
          data.productos && data.productos.length > 0
            ? data.productos.map((p) => ({
                producto: p.producto,
                cantidad: p.cantidad,
                precio_unitario: parseFloat(p.precio_unitario) || 0,
              }))
            : [{ producto: '', cantidad: 1, precio_unitario: 0 }];

        setProductosPedido(productosIniciales);
        setProductosOriginales(JSON.parse(JSON.stringify(productosIniciales)));

        if (data.cuotas && data.cuotas.length > 0) {
          setCuotas(
            data.cuotas.map((c) => ({
              numero: c.numero,
              monto: c.monto.toString(),
              pagado: c.pagado,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        alert('Error al cargar el pedido para editar.');
      }
    };

    cargarPedido();
  }, [pedidoId]);

  // ---------------- HANDLE PRODUCTOS ----------------
  const handleProductoChange = (index, field, value) => {
    setProductosPedido((prevProductos) => {
      const nuevos = [...prevProductos];
      if (field === 'producto') {
        nuevos[index].producto = value;
        const prod = productos.find((p) => p.id === parseInt(value));
        nuevos[index].precio_unitario = prod ? parseFloat(prod.precio) : 0;
      } else if (field === 'cantidad') {
        nuevos[index].cantidad = parseInt(value) || 1;
      }
      return nuevos;
    });
  };

  const agregarProducto = () => {
    setProductosPedido((prev) => [...prev, { producto: '', cantidad: 1, precio_unitario: 0 }]);
  };

  const eliminarProducto = (index) => {
    setProductosPedido((prev) => prev.filter((_, i) => i !== index));
  };

  const productosModificados = () => {
    if (productosPedido.length !== productosOriginales.length) return true;
    for (let i = 0; i < productosPedido.length; i++) {
      const p1 = productosPedido[i];
      const p2 = productosOriginales[i];
      if (
        parseInt(p1.producto) !== parseInt(p2.producto) ||
        parseInt(p1.cantidad) !== parseInt(p2.cantidad)
      )
        return true;
    }
    return false;
  };

  // ---------------- CALCULOS ----------------
  const calcularMontoTotal = () => {
    return productosPedido.reduce((acc, p) => {
      const subtotal = p.precio_unitario * p.cantidad;
      return acc + (isNaN(subtotal) ? 0 : subtotal);
    }, 0);
  };

  const montoPagadoCuotas = () =>
    cuotas.reduce((acc, c) => acc + (isNaN(parseFloat(c.monto)) ? 0 : parseFloat(c.monto)), 0);

  const montoPendiente = () => {
    const total = calcularMontoTotal();
    if (tipoPago === 'unico') {
      const pagoNum = parseFloat(pago) || 0;
      return formatoARS(Math.max(total - pagoNum, 0));
    }
    const pagado = montoPagadoCuotas();
    return formatoARS(Math.max(total - pagado, 0));
  };

  const handleCuotaChange = (index, field, value) => {
    setCuotas((prev) => {
      const nuevas = [...prev];
      if (field === 'monto') nuevas[index].monto = value;
      else if (field === 'pagado') nuevas[index].pagado = value;
      return nuevas;
    });
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      cliente: parseInt(clienteSeleccionado),
      pago: tipoPago === 'unico' ? parseFloat(pago) || 0 : 0,
      nota,
      entregado,
      pagado,
      tipo_pago: tipoPago,
    };

    if (!pedidoId || productosModificados()) {
      payload.productos = productosPedido.map((p) => ({
        producto: parseInt(p.producto),
        cantidad: p.cantidad,
      }));
    }

    if (tipoPago === 'cuotas') {
      payload.cuotas = cuotas.map((c) => ({
        numero: c.numero,
        monto: parseFloat(c.monto) || 0,
        pagado: c.pagado,
      }));
    }

    const url = pedidoId ? `${API_URL}/api/pedidos/${pedidoId}/` : `${API_URL}/api/pedidos/`;
    const method = pedidoId ? 'PATCH' : 'POST';

    try {
      const res = await fetchConRefresh(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const mensajes = [];
        for (const campo in errorData) {
          const valor = errorData[campo];
          if (Array.isArray(valor)) valor.forEach((msg) => mensajes.push(msg));
          else if (typeof valor === 'string') mensajes.push(valor);
        }
        throw new Error(mensajes.join(' | '));
      }

      await res.json();
      setToastMsg(pedidoId ? 'Pedido actualizado correctamente' : 'Pedido creado correctamente');
      setTimeout(() => {
        setToastMsg('');
        navigate('/pedidos');
      }, 2500);
    } catch (err) {
      console.error('Error:', err);
      setErrorGeneral(err.message || 'Error al guardar el pedido.');
    }
  };

  const montoTotal = calcularMontoTotal();
  const cuotaSugerida = (montoTotal / 3).toFixed(2);

  // ---------------- RENDER ----------------
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
          maxWidth: 600,
          backgroundColor: '#fff',
          p: 4,
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
                  color: colorPrimary, // color del borde
                  '&.Mui-checked': {
                    color: colorPrimary, // color cuando está checked
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
