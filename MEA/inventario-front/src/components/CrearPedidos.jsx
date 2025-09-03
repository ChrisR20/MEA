import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { ArrowBack, Delete } from "@mui/icons-material";
import NavbarPrincipal from "./NavbarPrincipal";

import { refreshAccessToken } from "./utils/auth"; // Ajustá el path según corresponda

const colorPrimary = "#c5892a";

function CrearPedido() {
  const { pedidoId } = useParams();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [pago, setPago] = useState("");
  const [nota, setNota] = useState("");
  const [entregado, setEntregado] = useState(false);
  const [pagado, setPagado] = useState(false);
  const [tipoPago, setTipoPago] = useState("unico");

  const [productosPedido, setProductosPedido] = useState([
    { producto: "", cantidad: 1, precio_unitario: 0 },
  ]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [cuotas, setCuotas] = useState([
    { numero: 1, monto: "", pagado: false },
    { numero: 2, monto: "", pagado: false },
    { numero: 3, monto: "", pagado: false },
  ]);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const navigate = useNavigate();

  const formatoARS = (valor) =>
    parseFloat(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 });

  // Función para obtener headers con token Bearer
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Función para fetch con refresh token si recibe 401
  const fetchConRefresh = async (url, options = {}) => {
    let res = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      // Intentar refrescar token
      const newToken = await refreshAccessToken();
      if (!newToken) {
        localStorage.clear();
        navigate("/login");
        return null;
      }
      // Reintentar con nuevo token
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

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const token = localStorage.getItem("access_token");
    if (isAuth !== "true" || !token) {
      navigate("/login");
      return;
    }

    // Cargar clientes y productos paralelamente con token
    const cargarClientes = async () => {
      try {
        const res = await fetchConRefresh(
          "http://127.0.0.1:8000/api/clientes/"
        );
        if (!res) return; // Ya redirigió
        if (!res.ok) throw new Error("Error al cargar clientes");
        const data = await res.json();
        setClientes(data);
      } catch (err) {
        console.error(err);
        setErrorGeneral("Error al cargar clientes");
      }
    };

    const cargarProductos = async () => {
      try {
        const res = await fetchConRefresh(
          "http://127.0.0.1:8000/api/productos/"
        );
        if (!res) return;
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        console.error(err);
        setErrorGeneral("Error al cargar productos");
      }
    };

    cargarClientes();
    cargarProductos();
  }, [navigate]);

  useEffect(() => {
    if (!pedidoId) {
      setCuotas([
        { numero: 1, monto: "", pagado: false },
        { numero: 2, monto: "", pagado: false },
        { numero: 3, monto: "", pagado: false },
      ]);
      return;
    }

    const cargarPedido = async () => {
      try {
        const res = await fetchConRefresh(
          `http://127.0.0.1:8000/api/pedidos/${pedidoId}/`
        );
        if (!res) return;
        if (!res.ok) throw new Error("Error al cargar el pedido");
        const data = await res.json();

        setClienteSeleccionado(data.cliente);
        setPago(data.pago);
        setNota(data.nota || "");
        setEntregado(Boolean(data.entregado));
        setPagado(
          data.pagado === true ||
            data.pagado === "true" ||
            data.pagado === 1 ||
            data.pagado === "1"
        );
        setTipoPago(data.tipo_pago || "unico");

        const productosIniciales =
          data.productos && data.productos.length > 0
            ? data.productos.map((p) => ({
                producto: p.producto,
                cantidad: p.cantidad,
                precio_unitario: parseFloat(p.precio_unitario) || 0,
              }))
            : [{ producto: "", cantidad: 1, precio_unitario: 0 }];
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
        } else {
          setCuotas([
            { numero: 1, monto: "", pagado: false },
            { numero: 2, monto: "", pagado: false },
            { numero: 3, monto: "", pagado: false },
          ]);
        }
      } catch (err) {
        console.error(err);
        alert("Error al cargar el pedido para editar.");
      }
    };

    cargarPedido();
  }, [pedidoId]);

  const handleProductoChange = (index, field, value) => {
    setProductosPedido((prevProductos) => {
      const nuevosProductos = [...prevProductos];
      if (field === "producto") {
        nuevosProductos[index] = { ...nuevosProductos[index], [field]: value };
        const productoSeleccionado = productos.find(
          (prod) => prod.id === parseInt(value)
        );
        nuevosProductos[index].precio_unitario = productoSeleccionado
          ? parseFloat(productoSeleccionado.precio)
          : 0;
      } else if (field === "cantidad") {
        nuevosProductos[index] = {
          ...nuevosProductos[index],
          [field]: parseInt(value) || 1,
        };
      }
      return nuevosProductos;
    });
  };

  const agregarProducto = () => {
    setProductosPedido((prevProductos) => [
      ...prevProductos,
      { producto: "", cantidad: 1, precio_unitario: 0 },
    ]);
  };

  const eliminarProducto = (index) => {
    setProductosPedido((prevProductos) =>
      prevProductos.filter((_, i) => i !== index)
    );
  };

  const productosModificados = () => {
    if (productosPedido.length !== productosOriginales.length) return true;
    for (let i = 0; i < productosPedido.length; i++) {
      const p1 = productosPedido[i];
      const p2 = productosOriginales[i];
      if (
        parseInt(p1.producto) !== parseInt(p2.producto) ||
        parseInt(p1.cantidad) !== parseInt(p2.cantidad)
      ) {
        return true;
      }
    }
    return false;
  };

  const calcularMontoTotal = () => {
    return productosPedido.reduce((acc, p) => {
      const subtotal = p.precio_unitario * p.cantidad;
      return acc + (isNaN(subtotal) ? 0 : subtotal);
    }, 0);
  };

  const montoPagadoCuotas = () => {
    return cuotas.reduce((acc, c) => {
      const monto = parseFloat(c.monto);
      return acc + (isNaN(monto) ? 0 : monto);
    }, 0);
  };

  const montoPendiente = () => {
    const montoTotal = calcularMontoTotal();
    if (tipoPago === "unico") {
      const pagoNum = parseFloat(pago);
      const pendiente = montoTotal - (isNaN(pagoNum) ? 0 : pagoNum);
      return pendiente > 0 ? formatoARS(pendiente) : formatoARS(0);
    } else if (tipoPago === "cuotas") {
      const pagado = montoPagadoCuotas();
      const pendiente = montoTotal - pagado;
      return pendiente > 0 ? formatoARS(pendiente) : formatoARS(0);
    }
    return formatoARS(0);
  };

  const handleCuotaChange = (index, field, value) => {
    setCuotas((prevCuotas) => {
      const nuevasCuotas = [...prevCuotas];
      if (field === "monto") {
        nuevasCuotas[index].monto = value;
      } else if (field === "pagado") {
        nuevasCuotas[index].pagado = value;
      }
      return nuevasCuotas;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      cliente: parseInt(clienteSeleccionado),
      pago: tipoPago === "unico" ? parseFloat(pago) : 0,
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

    if (tipoPago === "cuotas") {
      payload.cuotas = cuotas.map((c) => ({
        numero: c.numero,
        monto: parseFloat(c.monto) || 0,
        pagado: c.pagado,
      }));
    } else {
      payload.pago = parseFloat(pago);
    }

    const url = pedidoId
      ? `http://127.0.0.1:8000/api/pedidos/${pedidoId}/`
      : "http://127.0.0.1:8000/api/pedidos/";

    const method = pedidoId ? "PATCH" : "POST";

    try {
      const res = await fetchConRefresh(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res) return; // Ya redirigió en fetchConRefresh

      if (!res.ok) {
        const errorData = await res.json();
        const mensajes = [];
        for (const campo in errorData) {
          const valor = errorData[campo];
          if (Array.isArray(valor)) {
            valor.forEach((msg) => {
              mensajes.push(
                ["non_field_errors", "productos"].includes(campo)
                  ? msg
                  : `${campo}: ${msg}`
              );
            });
          } else if (typeof valor === "string") {
            mensajes.push(
              ["non_field_errors", "productos"].includes(campo)
                ? valor
                : `${campo}: ${valor}`
            );
          }
        }
        throw new Error(mensajes.join(" | "));
      }

      await res.json();
      setToastMsg(
        pedidoId
          ? "Pedido actualizado correctamente"
          : "Pedido creado correctamente"
      );
      setTimeout(() => {
        setToastMsg("");
        navigate("/pedidos");
      }, 2500);
    } catch (err) {
      console.error("Error:", err);
      setErrorGeneral(err.message || "Error al guardar el pedido.");
    }
  };

  const montoTotal = calcularMontoTotal();
  const cuotaSugerida = (montoTotal / 3).toFixed(2);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "white",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Navbar */}
      <NavbarPrincipal />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 600,
          backgroundColor: "#fff",
          p: 4,
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          fontFamily: "'Montserrat', sans-serif",
          boxSizing: "border-box",
        }}
        noValidate
      >
        <Typography variant="h5" component="h2" fontWeight={600} mb={3}>
          {pedidoId ? "Edita tu Pedido" : "Crea un nuevo pedido"}
        </Typography>

        {errorGeneral && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral}
          </Alert>
        )}

        {/* Cliente */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="cliente-label">Cliente</InputLabel>
          <Select
            labelId="cliente-label"
            id="cliente"
            value={clienteSeleccionado}
            label="Cliente"
            onChange={(e) => {
              setClienteSeleccionado(e.target.value);
              setErrorGeneral("");
            }}
          >
            <MenuItem value="">
              <em>Selecciona un cliente</em>
            </MenuItem>
            {clientes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box mt={4}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Productos
          </Typography>

          {productosPedido.map((p, index) => (
            <Grid
              container
              spacing={2}
              alignItems="center"
              key={index}
              sx={{ mb: 2 }}
            >
              <Grid item xs={7} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id={`producto-label-${index}`}>
                    Producto
                  </InputLabel>
                  <Select
                    labelId={`producto-label-${index}`}
                    value={p.producto}
                    label="Producto"
                    onChange={(e) =>
                      handleProductoChange(index, "producto", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>Selecciona un producto</em>
                    </MenuItem>
                    {productos.map((prod) => (
                      <MenuItem key={prod.id} value={prod.id}>
                        {prod.nombre_producto}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={3} sm={3}>
                <TextField
                  type="number"
                  label="Cantidad"
                  inputProps={{ min: 1 }}
                  value={p.cantidad}
                  onChange={(e) =>
                    handleProductoChange(index, "cantidad", e.target.value)
                  }
                  required
                />
              </Grid>

              <Grid
                item
                xs={2}
                sm={3}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  ${formatoARS(p.precio_unitario)}
                </Typography>
                {productosPedido.length > 1 && (
                  <IconButton
                    color="error"
                    aria-label="eliminar producto"
                    onClick={() => eliminarProducto(index)}
                    size="small"
                    sx={{ ml: 1 }}
                  >
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
              "&:hover": {
                backgroundColor: colorPrimary,
                color: "#fff",
                borderColor: colorPrimary,
              },
            }}
          >
            + Agregar Producto
          </Button>

          <Typography
            variant="h6"
            fontWeight={700}
            mt={3}
            textAlign="right"
            color="text.primary"
          >
            Monto Total: ${formatoARS(montoTotal)}
          </Typography>
        </Box>

        <Box mt={4}>
          <FormControl fullWidth required>
            <InputLabel id="tipo-pago-label">Forma de pago</InputLabel>
            <Select
              labelId="tipo-pago-label"
              id="tipoPago"
              value={tipoPago}
              label="Forma de pago"
              onChange={(e) => setTipoPago(e.target.value)}
            >
              <MenuItem value="unico">Pago único</MenuItem>
              <MenuItem value="cuotas">3 cuotas</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {tipoPago === "unico" && (
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

        {tipoPago === "cuotas" && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Cuotas
            </Typography>
            {cuotas.map((cuota, index) => (
              <Grid
                container
                spacing={2}
                key={cuota.numero}
                alignItems="center"
                mb={1}
              >
                <Grid item xs={4}>
                  <Typography variant="body1">Cuota {cuota.numero}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    type="number"
                    step="0.01"
                    value={cuota.monto}
                    onChange={(e) =>
                      handleCuotaChange(index, "monto", e.target.value)
                    }
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
                        onChange={(e) =>
                          handleCuotaChange(index, "pagado", e.target.checked)
                        }
                      />
                    }
                    label="Pagado"
                  />
                </Grid>
              </Grid>
            ))}

            <Typography variant="body2" color="text.secondary" mt={1}>
              Monto pendiente: ${montoPendiente()}
            </Typography>
          </Box>
        )}

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

        <Box mt={3} display="flex" justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                checked={entregado}
                onChange={(e) => setEntregado(e.target.checked)}
              />
            }
            label="Entregado"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={pagado}
                onChange={(e) => setPagado(e.target.checked)}
              />
            }
            label="Pagado"
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3, backgroundColor: colorPrimary }}
        >
          {pedidoId ? "Actualizar Pedido" : "Crear Pedido"}
        </Button>
      </Box>

      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={2500}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // lo forzamos acá
        sx={{
          top: "50% !important", // Forzamos la posición
          left: "50% !important",
          transform: "translate(-50%, -50%) !important",
        }}
      />
    </Box>
  );
}

export default CrearPedido;
