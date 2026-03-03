import React, { useState, useEffect } from 'react';

import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Toolbar,
} from '@mui/material';

import { refreshAccessToken } from '../../utils/auth';
import NavbarPrincipal from '../../NavbarPrincipal';

const API_URL = import.meta.env.VITE_API_URL;

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const fetchClientes = async () => {
    try {
      const token = await refreshAccessToken();

      const response = await fetch(`${API_URL}/api/clientes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener clientes');

      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // 🔎 Filtrado en frontend
  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <NavbarPrincipal />
      </Box>

      <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
        Lista de Clientes
      </Typography>

      <Toolbar sx={{ mb: 2, backgroundColor: '#fff' }}>
        <TextField
          variant="outlined"
          placeholder="Buscar Cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          size="small"
          sx={{ maxWidth: 300, width: '100%' }}
        />
      </Toolbar>

      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Nombre</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nombre}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell align="center">No se encontraron clientes</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
