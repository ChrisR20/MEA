import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

export const useClientes = () => {
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

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return {
    busqueda,
    setBusqueda,
    clientesFiltrados,
  };
};

export default useClientes;
