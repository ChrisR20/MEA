import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import NavbarPrincipal from '../../NavbarPrincipal';
import { refreshAccessToken } from '../../utils/auth';
import { isSessionValid, clearSession } from '../../../utils/session';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = import.meta.env.VITE_API_URL;

export default function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatoARS = (valor) =>
    parseFloat(valor).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  // === Helper fetch con refresh token ===
  const fetchConRefresh = async (url, options = {}) => {
    try {
      if (!isSessionValid()) {
        clearSession();
        navigate('/login', { replace: true });
        return null;
      }

      let token = localStorage.getItem('access_token');
      let res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        token = await refreshAccessToken();
        if (!token) {
          clearSession();
          navigate('/login', { replace: true });
          return null;
        }

        res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (!res.ok) throw new Error('Error al cargar los datos');
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const fetchPedido = async () => {
    setLoading(true);
    const data = await fetchConRefresh(`${API_URL}/api/pedidodetalle/${id}/`);
    if (data) setPedido(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPedido();
  }, [id]);

  const handlePrint = () => {
    if (!pedido) return;

    const facturaHTML = document.getElementById('factura')?.outerHTML;
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Por favor permita ventanas emergentes para imprimir la factura.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Factura Pedido #${pedido.id}</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
          <style>
            body { font-family: 'Roboto', sans-serif; padding: 20px; background-color: #fff; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f4ce75; }
            table, th, td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .factura-footer { text-align: left !important; margin-top: 30px; font-size: 0.85rem; color: #555; }
            @media print {
              svg.MuiSvgIcon-root {
                width: 16px !important;
                height: 16px !important;
                vertical-align: middle;
              }
            }
          </style>
        </head>
        <body>
          ${facturaHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 50);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  const handleDownloadPDF = async () => {
    if (!pedido) return;
    const factura = document.getElementById('factura');
    if (!factura) return;

    try {
      const canvas = await html2canvas(factura, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Factura_Pedido_${pedido.id}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Ocurrió un error al generar el PDF');
    }
  };

  // ================================
  // 🟢 COMPARTIR POR WHATSAPP
  // ================================
  const handleShareWhatsApp = () => {
    if (!pedido) return;

    const totalProductos = pedido.productos.reduce(
      (sum, p) => sum + p.precio_unitario * p.cantidad,
      0
    );

    const productosTexto = pedido.productos
      .map(
        (p) =>
          `• ${p.producto_nombre} x${p.cantidad} - $${formatoARS(p.precio_unitario * p.cantidad)}`
      )
      .join('\n');

    const cuotasTexto =
      pedido.cuotas.length > 0
        ? pedido.cuotas
            .map(
              (c) =>
                `• *Cuota* ${c.numero}: $${formatoARS(c.monto)} - ${
                  c.pagado ? ' *Pagada*' : ' *Pendiente*'
                }`
            )
            .join('\n')
        : '*Pago único*';

    // === Solo mostrar "Entregado" si es verdadero ===
    const estadoEntregadoTexto = pedido.entregado ? '*Estado:* Entregado' : '*Estado:* Pendiente';

    const mensaje = `
    *Detalle de tu pedido*
    *Cliente*: ${pedido.cliente_nombre}
    *Fecha del pedido*: ${new Date(pedido.fecha).toLocaleDateString()}
    ${estadoEntregadoTexto}
    *Productos:*
    ${productosTexto}

    *Total*: $${formatoARS(totalProductos)}
    *Pago Actual*: $${formatoARS(pedido.pago_actual)}
    *Monto pendiente*: $${formatoARS(pedido.monto_pendiente)}

    *Cuotas:*
    ${cuotasTexto}

    *Gracias por tu compra*
    `;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (loading)
    return (
      <Typography align="center" sx={{ mt: 4, fontWeight: 600 }}>
        Cargando detalle del pedido...
      </Typography>
    );

  if (error)
    return (
      <Typography align="center" color="error" sx={{ mt: 4, fontWeight: 600 }}>
        {error}
      </Typography>
    );

  if (!pedido) return null;

  const totalProductos = pedido.productos.reduce(
    (sum, p) => sum + p.precio_unitario * p.cantidad,
    0
  );

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <NavbarPrincipal />
      </Box>

      <Typography variant="h4" sx={{ mb: 3 }} align="center">
        Detalle de tu pedido {pedido.cliente_nombre}
      </Typography>

      <Box
        sx={{
          p: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
          boxShadow: 2,
          bgcolor: '#fff',
        }}
        id="factura"
      >
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography>
              <strong>Cliente:</strong> {pedido.cliente_nombre || '-'}
            </Typography>
            <Typography>
              <strong>Nota:</strong> {pedido.nota || '-'}
            </Typography>
            <Typography>
              <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}
            </Typography>
            <Typography>
              <strong>Entregado:</strong>{' '}
              {pedido.entregado ? (
                <CheckCircleOutlineIcon color="success" />
              ) : (
                <CancelOutlinedIcon color="error" />
              )}
            </Typography>
            <Typography>
              <strong>Pagado:</strong>{' '}
              {pedido.pagado ? (
                <CheckCircleOutlineIcon color="success" />
              ) : (
                <CancelOutlinedIcon color="error" />
              )}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Pago Actual:</strong> ${formatoARS(pedido.pago_actual)}
            </Typography>
            <Typography>
              <strong>Monto Total:</strong> ${formatoARS(pedido.monto_total)}
            </Typography>
            <Typography>
              <strong>Monto Pendiente:</strong> ${formatoARS(pedido.monto_pendiente)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          Productos
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f4ce75' }}>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Precio Unitario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedido.productos.map((p) => (
                <TableRow key={p.producto}>
                  <TableCell>{p.producto_nombre}</TableCell>
                  <TableCell>{p.producto_descripcion}</TableCell>
                  <TableCell>{p.cantidad}</TableCell>
                  <TableCell>${formatoARS(p.precio_unitario)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <strong>Total</strong>
                </TableCell>
                <TableCell>
                  <strong>${formatoARS(totalProductos)}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Cuotas
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f4ce75' }}>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Pagado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedido.cuotas.length > 0 ? (
                pedido.cuotas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>Cuota {c.numero}</TableCell>
                    <TableCell>${formatoARS(c.monto)}</TableCell>
                    <TableCell>{c.pagado ? 'Sí' : 'No'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Pago único
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography className="factura-footer" sx={{ mt: 3 }}>
          Comprobante no válido como factura
        </Typography>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Volver
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<WhatsAppIcon />}
          onClick={handleShareWhatsApp}
        >
          Compartir
        </Button>

        <Button variant="outlined" onClick={handleDownloadPDF}>
          Descargar PDF
        </Button>

        <Button variant="outlined" onClick={handlePrint}>
          Imprimir
        </Button>
      </Box>
    </Box>
  );
}
