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
} from '@mui/material';

import { refreshAccessToken } from './utils/auth'; // usa tu función actual
import NavbarPrincipal from './NavbarPrincipal';

const API_URL = import.meta.env.VITE_API_URL;

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <NavbarPrincipal />
      </Box>

      <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
        Lista de Clientes
      </Typography>

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
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nombre}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
