import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../../utils/auth';
import { isSessionValid, clearSession } from '../../../utils/session';

const API_URL = import.meta.env.VITE_API_URL;

export const useProductos = () => {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [openBulkModal, setOpenBulkModal] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  const fetchWithAuth = async (url, options = {}) => {
    if (!isSessionValid()) return handleLogout();

    const token = localStorage.getItem('access_token');
    if (!token) return handleLogout();

    options.headers = { ...getAuthHeaders(), ...(options.headers || {}) };
    let res = await fetch(url, options);

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return handleLogout();
      options.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, options);
    }
    return res;
  };

  const fetchProductos = async () => {
    const res = await fetchWithAuth(`${API_URL}/api/productos/`);
    if (res && res.ok) {
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } else setProductos([]);
  };

  const fetchMarcas = async () => {
    const res = await fetchWithAuth(`${API_URL}/api/marcas/`);
    if (res && res.ok) setMarcas(await res.json());
    else setMarcas([]);
  };

  useEffect(() => {
    const init = async () => {
      if (!isSessionValid()) return handleLogout();
      await fetchProductos();
      await fetchMarcas();
    };
    init();
  }, []);

  const handleOpenModal = (producto = null) => {
    setProductoEditar(producto);
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleSaveProducto = async (nuevoProducto) => {
    const body = {
      nombre_producto: nuevoProducto.nombre_producto || '',
      marca: nuevoProducto.marca || null,
      desc: nuevoProducto.desc || '',
      color: nuevoProducto.color || '',
      aroma: nuevoProducto.aroma || '',
      cantidad: nuevoProducto.cantidad ? parseInt(nuevoProducto.cantidad) : 0,
      peso_neto: nuevoProducto.peso_neto || '',
      codigo: nuevoProducto.codigo ? parseInt(nuevoProducto.codigo) : 0,
      precio: nuevoProducto.precio ? parseFloat(nuevoProducto.precio) : 0,
    };

    try {
      let res;
      if (productoEditar) {
        res = await fetchWithAuth(`${API_URL}/api/productos/${productoEditar.id}/`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        res = await fetchWithAuth(`${API_URL}/api/productos/`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      if (res && res.ok) {
        await fetchProductos();
        handleCloseModal();
        setToastMsg(productoEditar ? 'Producto editado correctamente' : 'Producto creado');
      } else if (res) {
        const errorData = await res.json();
        setToastMsg(
          errorData.non_field_errors?.[0] ||
            errorData.nombre_producto?.[0] ||
            errorData.marca?.[0] ||
            'Error al guardar producto'
        );
      }
    } catch (err) {
      setToastMsg('Error al comunicarse con el servidor');
    }
  };

  const handleSaveBulkProductos = async (productosArray) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/productos/bulk/`, {
        method: 'POST',
        body: JSON.stringify(productosArray),
      });
      if (res && res.ok) {
        await fetchProductos();
        setToastMsg('Productos cargados correctamente');
        setOpenBulkModal(false);
      } else if (res) {
        const data = await res.json();
        setToastMsg(JSON.stringify(data));
      }
    } catch (err) {
      setToastMsg('Error al cargar productos masivos');
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const cumpleNombre = p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleMarca = marcaSeleccionada ? p.marca === marcaSeleccionada : true;
    return cumpleNombre && cumpleMarca;
  });

  const formatPrecio = (valor) => {
    if (valor === null || valor === undefined) return '$ 0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(valor);
  };

  return {
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
  };
};

export default useProductos;
