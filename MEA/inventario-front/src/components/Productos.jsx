import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";

import NavbarPrincipal from "./NavbarPrincipal";
import { refreshAccessToken } from "./utils/auth";
import { isSessionValid, clearSession } from "../utils/session";

function Productos() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    marca: "",
    desc: "",
    color: "",
    aroma: "",
    cantidad: "",
    peso_neto: "",
    codigo: "",
    precio: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // 🔹 Fetch productos con refresco de token
  const fetchProductos = async () => {
    if (!isSessionValid()) return handleLogout();

    const token = localStorage.getItem("access_token");
    const isAuth = localStorage.getItem("isAuthenticated");

    if (isAuth !== "true" || !token) return handleLogout();

    let response = await fetch("http://127.0.0.1:8000/api/productos/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return handleLogout();

      response = await fetch("http://127.0.0.1:8000/api/productos/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    if (response.ok) {
      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
    } else {
      console.error("Error al cargar productos:", response.status);
      setProductos([]);
    }
  };

  // 🔹 Fetch marcas
  const fetchMarcas = async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch("http://127.0.0.1:8000/api/marcas/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setMarcas(data);
    } else {
      console.error("Error al cargar marcas:", response.status);
      setMarcas([]);
    }
  };

  // 🔹 Logout y redirección
  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    fetchProductos();
    fetchMarcas();
  }, [navigate]);

  // 🔹 Modal
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // 🔹 Guardar producto
  const handleSaveProducto = async () => {
    const token = localStorage.getItem("access_token");

    const productoEnviar = {
      ...nuevoProducto,
      codigo:
        nuevoProducto.codigo === "" ? null : parseInt(nuevoProducto.codigo, 10),
      cantidad:
        nuevoProducto.cantidad === ""
          ? null
          : parseInt(nuevoProducto.cantidad, 10),
      precio:
        nuevoProducto.precio === "" ? null : parseFloat(nuevoProducto.precio),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/productos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productoEnviar),
      });

      if (response.ok) {
        await fetchProductos();
        handleCloseModal();
        resetNuevoProducto();
        setToastMsg("Producto creado correctamente");
        setErrorMsg("");
      } else {
        const errorData = await response.json();
        const mensajeError =
          errorData.non_field_errors?.[0] ||
          errorData?.nombre_producto?.[0] ||
          "Error al crear producto";
        setErrorMsg(mensajeError);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al comunicarse con el servidor");
    }
  };

  const resetNuevoProducto = () => {
    setNuevoProducto({
      nombre_producto: "",
      marca: "",
      desc: "",
      color: "",
      aroma: "",
      cantidad: "",
      peso_neto: "",
      codigo: "",
      precio: "",
    });
  };

  const handleChange = (e) => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1600,
        minHeight: "100vh",
        color: "#333",
        backgroundColor: "#fff",
        p: 2,
        mx: "auto",
      }}
    >
      <NavbarPrincipal />

      {/* 🔹 Barra superior */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #ddd",
          color: "#333",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            size="small"
            sx={{ flex: "1 1 200px", minWidth: 150 }}
          />
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{
              bgcolor: "#a8d5ba",
              color: "#2f4f4f",
              "&:hover": { bgcolor: "#8bc39f" },
              flex: "1 1 120px", // ancho mínimo en móvil
              minWidth: 120,
            }}
          >
            Agregar Producto
          </Button>
        </Toolbar>
      </AppBar>

      <Typography variant="h4" align="center" sx={{ my: 4, fontWeight: 600 }}>
        Listado de Productos
      </Typography>

      {/* 🔹 Tabla de productos */}
      <TableContainer
        component={Paper}
        sx={{ maxWidth: "95%", mx: "auto", boxShadow: 3, borderRadius: 2 }}
      >
        <Table aria-label="tabla de productos">
          <TableHead sx={{ bgcolor: "#eae7a4" }}>
            <TableRow>
              {[
                "Producto",
                "Descripción",
                "Color",
                "Aroma",
                "Cantidad",
                "Peso Neto",
                "Código",
                "Precio",
                "Marca",
              ].map((header) => (
                <TableCell key={header} sx={{ fontWeight: "bold" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {productosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              productosFiltrados.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.nombre_producto}</TableCell>
                  <TableCell>{p.desc}</TableCell>
                  <TableCell>{p.color || "-"}</TableCell>
                  <TableCell>{p.aroma || "-"}</TableCell>
                  <TableCell>{p.cantidad}</TableCell>
                  <TableCell>{p.peso_neto || "-"}</TableCell>
                  <TableCell>{p.codigo || "-"}</TableCell>
                  <TableCell>
                    $
                    {parseFloat(p.precio).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>{p.marca_nombre}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🔹 Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Agregar Nuevo Producto</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Nombre Producto"
            name="nombre_producto"
            value={nuevoProducto.nombre_producto}
            onChange={handleChange}
          />
          <FormControl fullWidth>
            <InputLabel id="marca-label">Marca</InputLabel>
            <Select
              labelId="marca-label"
              name="marca"
              value={nuevoProducto.marca}
              onChange={handleChange}
            >
              {marcas.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Descripción"
            name="desc"
            value={nuevoProducto.desc}
            onChange={handleChange}
          />
          <TextField
            label="Color"
            name="color"
            value={nuevoProducto.color}
            onChange={handleChange}
          />
          <TextField
            label="Aroma"
            name="aroma"
            value={nuevoProducto.aroma}
            onChange={handleChange}
          />
          <TextField
            label="Cantidad"
            type="number"
            name="cantidad"
            value={nuevoProducto.cantidad}
            onChange={handleChange}
          />
          <TextField
            label="Peso Neto"
            name="peso_neto"
            value={nuevoProducto.peso_neto}
            onChange={handleChange}
          />
          <TextField
            label="Código"
            type="number"
            name="codigo"
            value={nuevoProducto.codigo}
            onChange={handleChange}
          />
          <TextField
            label="Precio"
            type="number"
            name="precio"
            value={nuevoProducto.precio}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleSaveProducto}
            variant="contained"
            color="primary"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Snackbars */}
      {errorMsg && (
        <Snackbar
          open={Boolean(errorMsg)}
          autoHideDuration={4000}
          onClose={() => setErrorMsg("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setErrorMsg("")}
            severity="error"
            sx={{ width: "100%" }}
          >
            {errorMsg}
          </Alert>
        </Snackbar>
      )}

      {toastMsg && (
        <Snackbar
          open={Boolean(toastMsg)}
          autoHideDuration={2500}
          onClose={() => setToastMsg("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToastMsg("")}
            severity="success"
            sx={{ width: "100%" }}
          >
            {toastMsg}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default Productos;
