// Productos.jsx
import React from 'react';
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
import BulkProductos from './BulkProductos';
import { useProductos } from './useProductos';

function Productos() {
  const {
    marcas,
    busqueda,
    setBusqueda,
    marcaSeleccionada,
    setMarcaSeleccionada,
    openModal,
    productoEditar,
    toastMsg,
    setToastMsg,
    openBulkModal,
    setOpenBulkModal,
    handleOpenModal,
    handleCloseModal,
    handleSaveProducto,
    handleSaveBulkProductos,
    productosFiltrados,
    formatPrecio,
  } = useProductos();

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
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            sx={{ width: '100%' }}
          >
            {/* Botones a la izquierda */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                onClick={() => setOpenBulkModal(true)}
                sx={{
                  bgcolor: '#a8d5ba', // verde pastel
                  color: '#2f4f4f',
                  '&:hover': { bgcolor: '#8bc39f' },
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Agregar Productos
              </Button>

              <BulkProductos
                open={openBulkModal}
                onClose={() => setOpenBulkModal(false)}
                onSave={handleSaveBulkProductos}
                marcas={marcas}
              />
            </Stack>

            {/* Filtros a la derecha */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <TextField
                variant="outlined"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                size="small"
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
              <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', sm: 'auto' } }}>
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
                'Marca',
                'Producto',
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
                <TableRow
                  key={p.id}
                  hover
                  sx={{
                    backgroundColor: p.cantidad === 0 ? '#ffcccc' : 'inherit', // rojo si cantidad 0
                  }}
                >
                  <TableCell>{p.marca_nombre}</TableCell>
                  <TableCell>{p.nombre_producto}</TableCell>
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
