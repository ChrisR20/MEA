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
} from "@mui/material";
import NavbarPrincipal from "./NavbarPrincipal";
import { refreshAccessToken } from "./utils/auth";
import { isSessionValid, clearSession } from "../utils/session"; // <-- importamos las funciones de session.js

function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      // Validar sesión
      if (!isSessionValid()) {
        clearSession();
        navigate("/login");
        return;
      }

      const isAuth = localStorage.getItem("isAuthenticated");
      let token = localStorage.getItem("access_token");

      if (isAuth !== "true" || !token) {
        clearSession();
        navigate("/login");
        return;
      }

      let response = await fetch("http://127.0.0.1:8000/api/productos/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          clearSession();
          navigate("/login");
          return;
        }

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
        Array.isArray(data) ? setProductos(data) : setProductos([]);
      } else {
        console.error("Error al cargar productos:", response.status);
        setProductos([]);
      }
    };

    fetchProductos();
  }, [navigate]);

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre_producto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: {
          xs: "95%",
          sm: "90%",
          md: 1200,
          lg: 1400,
          xl: 1600,
        },
        minHeight: "100vh",
        color: "#333",
        backgroundColor: "#fff",
        p: 2,
        mx: "auto",
      }}
    >
      <NavbarPrincipal />

      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #ddd",
          color: "#333",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "flex-end",
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            size="small"
            sx={{ maxWidth: 300, width: "100%" }}
            inputProps={{ "aria-label": "Buscar producto" }}
          />
        </Toolbar>
      </AppBar>

      <Typography variant="h4" align="center" sx={{ my: 4, fontWeight: 600 }}>
        Listado de Productos
      </Typography>

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
              productosFiltrados.map((producto) => (
                <TableRow key={producto.id} hover>
                  <TableCell>{producto.nombre_producto}</TableCell>
                  <TableCell>{producto.desc}</TableCell>
                  <TableCell>{producto.color || "-"}</TableCell>
                  <TableCell>{producto.aroma || "-"}</TableCell>
                  <TableCell>{producto.cantidad}</TableCell>
                  <TableCell>{producto.peso_neto || "-"}</TableCell>
                  <TableCell>{producto.codigo || "-"}</TableCell>
                  <TableCell>
                    $
                    {parseFloat(producto.precio).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>{producto.marca}</TableCell>
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
