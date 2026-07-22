import React from 'react';
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

import NavbarPrincipal from '../../NavbarPrincipal';
import { useClientes } from './useClientes';

export default function Clientes() {
  const { busqueda, setBusqueda, clientesFiltrados } = useClientes();

  return (
    <Box sx={{ p: 2, backgroundColor: '#fff' }}>
      <Box sx={{ mb: 3, backgroundColor: '#fff' }}>
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
