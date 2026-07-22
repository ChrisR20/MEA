import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../../utils/auth';
import { isSessionValid, clearSession } from '../../../utils/session';

const API_URL = import.meta.env.VITE_API_URL;

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarEntregados, setMostrarEntregados] = useState(false);

  const navigate = useNavigate();

  const formatoARS = (valor) =>
    parseFloat(valor).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
    });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchConRefresh = async (url) => {
    let response = await fetch(url, { headers: getAuthHeaders() });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();

      if (!newToken) {
        clearSession();
        navigate('/login', { replace: true });
        return null;
      }

      response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    return response;
  };

  const cargarPedidosPendientes = async () => {
    try {
      setLoading(true);

      const res = await fetchConRefresh(`${API_URL}/api/pedidos/`);
      if (!res) return;

      if (!res.ok) throw new Error('Error al cargar pedidos pendientes');

      const data = await res.json();
      setPedidos(data);
      setMostrarEntregados(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarPedidosEntregadosPagados = async () => {
    try {
      setLoading(true);

      const res = await fetchConRefresh(`${API_URL}/api/pedidos-entregados-pagados/`);
      if (!res) return;

      if (!res.ok) throw new Error('Error al cargar pedidos entregados y pagados');

      const data = await res.json();
      setPedidos(data);
      setMostrarEntregados(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!isSessionValid()) {
        clearSession();
        navigate('/login', { replace: true });
        return;
      }

      const isAuth = localStorage.getItem('isAuthenticated');
      const token = localStorage.getItem('access_token');

      if (isAuth !== 'true' || !token) {
        clearSession();
        navigate('/login', { replace: true });
        return;
      }

      await cargarPedidosPendientes();
    };

    fetchPedidos();
  }, [navigate]);

  const toggleFiltro = () => {
    mostrarEntregados ? cargarPedidosPendientes() : cargarPedidosEntregadosPagados();
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return {
    pedidos,
    busqueda,
    setBusqueda,
    loading,
    error,
    mostrarEntregados,
    navigate,
    formatoARS,
    toggleFiltro,
    pedidosFiltrados,
  };
};

export default usePedidos;
