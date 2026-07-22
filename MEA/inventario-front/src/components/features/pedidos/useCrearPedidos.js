import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { refreshAccessToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

export const useCrearPedidos = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [pago, setPago] = useState('');
  const [nota, setNota] = useState('');
  const [entregado, setEntregado] = useState(false);
  const [pagado, setPagado] = useState(false);
  const [tipoPago, setTipoPago] = useState('unico');

  const [productosPedido, setProductosPedido] = useState([
    { producto: '', cantidad: 1, precio_unitario: 0 },
  ]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [cuotas, setCuotas] = useState([
    { numero: 1, monto: '', pagado: false },
    { numero: 2, monto: '', pagado: false },
    { numero: 3, monto: '', pagado: false },
  ]);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const formatoARS = (valor) =>
    parseFloat(valor).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchConRefresh = async (url, options = {}) => {
    let res = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...(options.headers || {}) },
    });

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        localStorage.clear();
        navigate('/login');
        return null;
      }
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
    return res;
  };

  // Cargar clientes y productos iniciales
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    const token = localStorage.getItem('access_token');
    if (isAuth !== 'true' || !token) {
      navigate('/login');
      return;
    }

    const cargarClientes = async () => {
      try {
        const res = await fetchConRefresh(`${API_URL}/api/clientes/`);
        if (!res) return;
        if (!res.ok) throw new Error('Error al cargar clientes');
        const data = await res.json();
        setClientes(data);
      } catch (err) {
        console.error(err);
        setErrorGeneral('Error al cargar clientes');
      }
    };

    const cargarProductos = async () => {
      try {
        const res = await fetchConRefresh(`${API_URL}/api/productos/`);
        if (!res) return;
        if (!res.ok) throw new Error('Error al cargar productos');
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        console.error(err);
        setErrorGeneral('Error al cargar productos');
      }
    };

    cargarClientes();
    cargarProductos();
  }, [navigate]);

  // Cargar pedido para editar si existe pedidoId
  useEffect(() => {
    if (!pedidoId) {
      setCuotas([
        { numero: 1, monto: '', pagado: false },
        { numero: 2, monto: '', pagado: false },
        { numero: 3, monto: '', pagado: false },
      ]);
      return;
    }

    const cargarPedido = async () => {
      try {
        const res = await fetchConRefresh(`${API_URL}/api/pedidos/${pedidoId}/`);
        if (!res) return;
        if (!res.ok) throw new Error('Error al cargar el pedido');
        const data = await res.json();

        setClienteSeleccionado(data.cliente);
        setPago(data.pago);
        setNota(data.nota || '');
        setEntregado(Boolean(data.entregado));
        setPagado(Boolean(data.pagado));
        setTipoPago(data.tipo_pago || 'unico');

        const productosIniciales =
          data.productos && data.productos.length > 0
            ? data.productos.map((p) => ({
                producto: p.producto,
                cantidad: p.cantidad,
                precio_unitario: parseFloat(p.precio_unitario) || 0,
              }))
            : [{ producto: '', cantidad: 1, precio_unitario: 0 }];

        setProductosPedido(productosIniciales);
        setProductosOriginales(JSON.parse(JSON.stringify(productosIniciales)));

        if (data.cuotas && data.cuotas.length > 0) {
          setCuotas(
            data.cuotas.map((c) => ({
              numero: c.numero,
              monto: c.monto.toString(),
              pagado: c.pagado,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        alert('Error al cargar el pedido para editar.');
      }
    };

    cargarPedido();
  }, [pedidoId]);

  const handleProductoChange = (index, field, value) => {
    setProductosPedido((prevProductos) => {
      const nuevos = [...prevProductos];
      if (field === 'producto') {
        nuevos[index].producto = value;
        const prod = productos.find((p) => p.id === parseInt(value));
        nuevos[index].precio_unitario = prod ? parseFloat(prod.precio) : 0;
      } else if (field === 'cantidad') {
        nuevos[index].cantidad = parseInt(value) || 1;
      }
      return nuevos;
    });
  };

  const agregarProducto = () => {
    setProductosPedido((prev) => [...prev, { producto: '', cantidad: 1, precio_unitario: 0 }]);
  };

  const eliminarProducto = (index) => {
    setProductosPedido((prev) => prev.filter((_, i) => i !== index));
  };

  const productosModificados = () => {
    if (productosPedido.length !== productosOriginales.length) return true;
    for (let i = 0; i < productosPedido.length; i++) {
      const p1 = productosPedido[i];
      const p2 = productosOriginales[i];
      if (
        parseInt(p1.producto) !== parseInt(p2.producto) ||
        parseInt(p1.cantidad) !== parseInt(p2.cantidad)
      )
        return true;
    }
    return false;
  };

  const calcularMontoTotal = () => {
    return productosPedido.reduce((acc, p) => {
      const subtotal = p.precio_unitario * p.cantidad;
      return acc + (isNaN(subtotal) ? 0 : subtotal);
    }, 0);
  };

  const montoPagadoCuotas = () =>
    cuotas.reduce((acc, c) => acc + (isNaN(parseFloat(c.monto)) ? 0 : parseFloat(c.monto)), 0);

  const montoPendiente = () => {
    const total = calcularMontoTotal();
    if (tipoPago === 'unico') {
      const pagoNum = parseFloat(pago) || 0;
      return formatoARS(Math.max(total - pagoNum, 0));
    }
    const pagadoCalc = montoPagadoCuotas();
    return formatoARS(Math.max(total - pagadoCalc, 0));
  };

  const handleCuotaChange = (index, field, value) => {
    setCuotas((prev) => {
      const nuevas = [...prev];
      if (field === 'monto') nuevas[index].monto = value;
      else if (field === 'pagado') nuevas[index].pagado = value;
      return nuevas;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      cliente: parseInt(clienteSeleccionado),
      pago: tipoPago === 'unico' ? parseFloat(pago) || 0 : 0,
      nota,
      entregado,
      pagado,
      tipo_pago: tipoPago,
    };

    if (!pedidoId || productosModificados()) {
      payload.productos = productosPedido.map((p) => ({
        producto: parseInt(p.producto),
        cantidad: p.cantidad,
      }));
    }

    if (tipoPago === 'cuotas') {
      payload.cuotas = cuotas.map((c) => ({
        numero: c.numero,
        monto: parseFloat(c.monto) || 0,
        pagado: c.pagado,
      }));
    }

    const url = pedidoId ? `${API_URL}/api/pedidos/${pedidoId}/` : `${API_URL}/api/pedidos/`;
    const method = pedidoId ? 'PATCH' : 'POST';

    try {
      const res = await fetchConRefresh(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const mensajes = [];
        for (const campo in errorData) {
          const valor = errorData[campo];
          if (Array.isArray(valor)) valor.forEach((msg) => mensajes.push(msg));
          else if (typeof valor === 'string') mensajes.push(valor);
        }
        throw new Error(mensajes.join(' | '));
      }

      await res.json();
      setToastMsg(pedidoId ? 'Pedido actualizado correctamente' : 'Pedido creado correctamente');
      setTimeout(() => {
        setToastMsg('');
        navigate('/pedidos');
      }, 2500);
    } catch (err) {
      console.error('Error:', err);
      setErrorGeneral(err.message || 'Error al guardar el pedido.');
    }
  };

  const montoTotal = calcularMontoTotal();
  const cuotaSugerida = (montoTotal / 3).toFixed(2);

  return {
    pedidoId,
    clientes,
    productos,
    clienteSeleccionado,
    setClienteSeleccionado,
    pago,
    setPago,
    nota,
    setNota,
    entregado,
    setEntregado,
    pagado,
    setPagado,
    tipoPago,
    setTipoPago,
    productosPedido,
    cuotas,
    errorGeneral,
    setErrorGeneral,
    toastMsg,
    setToastMsg,
    navigate,
    formatoARS,
    handleProductoChange,
    agregarProducto,
    eliminarProducto,
    montoPendiente,
    handleCuotaChange,
    handleSubmit,
    montoTotal,
    cuotaSugerida,
  };
};

export default useCrearPedidos;
