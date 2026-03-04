import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';

const colorPrimary = '#c5892a'; // color naranja para el botón

function ProductoModal({ open, onClose, onSave, marcas = [], producto = null }) {
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: '',
    marca: '',
    desc: '',
    color: '',
    aroma: '',
    cantidad: '',
    peso_neto: '',
    codigo: '',
    precio: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (producto) {
      setNuevoProducto({
        ...producto,
        marca: producto.marca?.id || producto.marca || '',
      });
    } else {
      setNuevoProducto({
        nombre_producto: '',
        marca: '',
        desc: '',
        color: '',
        aroma: '',
        cantidad: '',
        peso_neto: '',
        codigo: '',
        precio: '',
      });
    }
    setErrorMsg('');
  }, [producto, open]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'marca') value = parseInt(value, 10);
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: value });
  };

  const handleSave = () => {
    if (!nuevoProducto.nombre_producto || !nuevoProducto.marca) {
      setErrorMsg('Nombre y Marca son obligatorios');
      return;
    }
    onSave(nuevoProducto);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{producto ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Marca</InputLabel>
            <Select name="marca" value={nuevoProducto.marca} onChange={handleChange}>
              {marcas.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Nombre"
            name="nombre_producto"
            value={nuevoProducto.nombre_producto}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Descripción"
            name="desc"
            value={nuevoProducto.desc}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Color"
            name="color"
            value={nuevoProducto.color}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Aroma"
            name="aroma"
            value={nuevoProducto.aroma}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Cantidad"
            name="cantidad"
            type="number"
            value={nuevoProducto.cantidad}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Peso Neto"
            name="peso_neto"
            value={nuevoProducto.peso_neto}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Código"
            name="codigo"
            type="number"
            value={nuevoProducto.codigo}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Precio"
            name="precio"
            type="number"
            value={nuevoProducto.precio}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
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
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductoModal;
