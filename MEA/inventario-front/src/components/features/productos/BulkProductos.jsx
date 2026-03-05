// BulkProductos.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Grid,
  Box,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const colorPrimary = '#c5892a';

function BulkProductos({ open, onClose, onSave, marcas = [] }) {
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
  const [productos, setProductos] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) {
      setMarcaSeleccionada('');
      setProductos([
        {
          nombre_producto: '',
          desc: '',
          color: '',
          aroma: '',
          cantidad: '',
          peso_neto: '',
          codigo: '',
          precio: '',
        },
      ]);
      setErrorMsg('');
    }
  }, [open]);

  const handleChangeMarca = (e) => setMarcaSeleccionada(parseInt(e.target.value, 10));

  const handleProductoChange = (index, e) => {
    const value = e.target.value;
    const name = e.target.name;
    const newProductos = [...productos];
    newProductos[index][name] = value;
    setProductos(newProductos);
  };

  const agregarFila = () => {
    setProductos([
      ...productos,
      {
        nombre_producto: '',
        desc: '',
        color: '',
        aroma: '',
        cantidad: '',
        peso_neto: '',
        codigo: '',
        precio: '',
      },
    ]);
  };

  const eliminarFila = (index) => {
    const newProductos = productos.filter((_, i) => i !== index);
    setProductos(newProductos);
  };

  const handleSave = () => {
    if (!marcaSeleccionada) {
      setErrorMsg('Debe seleccionar una marca');
      return;
    }

    for (let p of productos) {
      if (!p.nombre_producto) {
        setErrorMsg('Todos los productos deben tener un nombre');
        return;
      }
    }

    const payload = productos.map((p) => ({
      ...p,
      marca: marcaSeleccionada,
      cantidad: p.cantidad ? parseInt(p.cantidad, 10) : 0,
      codigo: p.codigo ? parseInt(p.codigo, 10) : null,
      precio: p.precio ? parseFloat(p.precio) : 0,
    }));

    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Agregar Productos Masivos</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Marca</InputLabel>
          <Select value={marcaSeleccionada} onChange={handleChangeMarca}>
            {marcas.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {productos.map((p, i) => (
          <Box key={i} sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Nombre"
                  name="nombre_producto"
                  value={p.nombre_producto}
                  onChange={(e) => handleProductoChange(i, e)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Descripción"
                  name="desc"
                  value={p.desc}
                  onChange={(e) => handleProductoChange(i, e)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  label="Color"
                  name="color"
                  value={p.color}
                  onChange={(e) => handleProductoChange(i, e)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  label="Aroma"
                  name="aroma"
                  value={p.aroma}
                  onChange={(e) => handleProductoChange(i, e)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3} md={1.5}>
                <TextField
                  label="Cantidad"
                  name="cantidad"
                  type="number"
                  value={p.cantidad}
                  onChange={(e) => handleProductoChange(i, e)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3} md={1.5}>
                <TextField
                  label="Peso Neto"
                  name="peso_neto"
                  value={p.peso_neto}
                  onChange={(e) => handleProductoChange(i, e)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3} md={1.5}>
                <TextField
                  label="Código"
                  name="codigo"
                  type="number"
                  value={p.codigo}
                  onChange={(e) => handleProductoChange(i, e)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3} md={1.5}>
                <TextField
                  label="Precio"
                  name="precio"
                  type="number"
                  value={p.precio}
                  onChange={(e) => handleProductoChange(i, e)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12} md={12} textAlign="right">
                <IconButton onClick={() => eliminarFila(i)} color="error">
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Button variant="outlined" onClick={agregarFila}>
          + Agregar otro producto
        </Button>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            borderColor: '#999',
            color: '#555',
            fontWeight: 600,
            minWidth: 120,
            '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#777' },
          }}
          variant="outlined"
        >
          Volver
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            backgroundColor: colorPrimary,
            '&:hover': { backgroundColor: '#a87422' },
            fontWeight: 600,
          }}
        >
          Guardar Masivo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BulkProductos;
