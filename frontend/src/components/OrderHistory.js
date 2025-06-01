import React, { useEffect, useState } from 'react';
import OrderMap from './OrderMap';
import 'leaflet/dist/leaflet.css';
import './OrderHistory.css';

const STATUS_COLORS = {
  approved: '#43aa8b',
  pending: '#f9c846',
  in_process: '#f9c846',
  rejected: '#e57373',
  cancelled: '#e57373',
  refunded: '#bcbcbc',
  charged_back: '#bcbcbc',
  no_payment_found: '#bcbcbc',
  other: '#219ebc',
};

function statusBadge(status, detail) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.other;
  let label = status;
  if (status === 'pending' && detail === 'no_payment_found') label = 'Pendiente (sin pago)';
  else if (status === 'approved') label = 'Aprobado';
  else if (status === 'pending') label = 'Pendiente';
  else if (status === 'rejected') label = 'Rechazado';
  else if (status === 'cancelled') label = 'Cancelado';
  else if (status === 'refunded') label = 'Reembolsado';
  else if (status === 'in_process') label = 'En proceso';
  else label = status;
  return <span className="status-badge" style={{background: color}}>{label}</span>;
}

function toCSV(orders) {
  const header = ['Fecha','Productos','Total','Estado','Dirección','País','Ciudad','Código Postal','ID de pago'];
  const rows = orders.map(order => [
    new Date(order.timestamp).toLocaleString(),
    order.items.map(item => item.name || item.title).join(' | '),
    order.items.reduce((acc, item) => acc + (item.price || item.unit_price || 0), 0),
    order._statusLabel || order._status || '',
    order.user?.direccion || '',
    order.user?.pais || '',
    order.user?.ciudad || '',
    order.user?.codigoPostal || '',
    order.preferenceId || ''
  ]);
  return [header, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
}

const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/orders/${user.username}`);
        let data = await res.json();
        data = data.reverse();
        setOrders(data);
        // Consultar estados de pago
        const statusResults = {};
        await Promise.all(data.map(async (order) => {
          if (!order.preferenceId) return;
          try {
            const res2 = await fetch(`${apiUrl}/api/order-status/${order.preferenceId}`);
            const status = await res2.json();
            statusResults[order.preferenceId] = status;
          } catch {}
        }));
        setStatusMap(statusResults);
      } catch (e) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const status = statusMap[order.preferenceId]?.status || 'pending';
    if (filter !== 'all' && status !== filter) return false;
    if (search && !order.items.some(item => (item.name || item.title || '').toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      const csv = toCSV(filteredOrders);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historial_compras.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloading(false);
    }, 200);
  };

  if (!user) return <div className="order-history"><p>Inicia sesión para ver tus compras.</p></div>;

  return (
    <div className="order-history">
      <h2>Historial de compras</h2>
      <div style={{display:'flex',gap:10,marginBottom:10,alignItems:'center'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto..." style={{padding:'6px 10px',borderRadius:6,border:'1px solid #cce3ec',fontSize:'1em'}} />
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:'6px 10px',borderRadius:6,border:'1px solid #cce3ec',fontSize:'1em'}}>
          <option value="all">Todos</option>
          <option value="approved">Aprobado</option>
          <option value="pending">Pendiente</option>
          <option value="rejected">Rechazado</option>
        </select>
        <button onClick={handleDownload} disabled={downloading} style={{background:'#8ecae6',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:600,cursor:'pointer'}}>Descargar CSV</button>
      </div>
      {loading ? <p>Cargando...</p> : (
        filteredOrders.length === 0 ? <p>No tienes compras registradas aún.</p> : (
          <ul className="order-list">
            {filteredOrders.map((order, idx) => {
              const status = statusMap[order.preferenceId]?.status || 'pending';
              const status_detail = statusMap[order.preferenceId]?.status_detail || '';
              const payment = statusMap[order.preferenceId] || {};
              return (
                <li key={order.preferenceId || idx} className="order-item">
                  <div className="order-summary" onClick={()=>setExpanded(expanded===idx?null:idx)} style={{cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <b>Fecha:</b> {new Date(order.timestamp).toLocaleString()}<br/>
                      <b>Productos:</b> {order.items.map(item => item.name || item.title).join(', ')}<br/>
                      <b>Total:</b> ${order.items.reduce((acc, item) => acc + (item.price || item.unit_price || 0), 0)}
                    </div>
                    <div>
                      {statusBadge(status, status_detail)}
                    </div>
                  </div>
                  {expanded===idx && (
                    <div className="order-details" style={{animation:'fadeIn 0.4s'}}>
                      <hr style={{margin:'12px 0'}}/>
                      <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                        <div style={{flex:'1 1 160px'}}>
                          <b>Productos:</b>
                          <ul style={{paddingLeft:16}}>
                            {order.items.map((item,i)=>(
                              <li key={i} style={{marginBottom:6}}>
                                {item.image && <img src={item.image} alt={item.name||item.title} style={{width:40,height:40,objectFit:'cover',borderRadius:6,marginRight:8,verticalAlign:'middle'}}/>}
                                <span>{item.name||item.title}</span> x1 <span style={{color:'#888'}}>${item.price||item.unit_price||0}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={{flex:'1 1 300px', minWidth:300}}>
                          <b>Dirección de envío:</b>
                          <div>{order.user?.nombre} {order.user?.apellido}</div>
                          <div>{order.user?.direccion}</div>
                          <div>{order.user?.ciudad}, {order.user?.pais}</div>
                          <div>Código Postal: {order.user?.codigoPostal}</div>
                          <div>Tel: {order.user?.telefono}</div>
                          <div style={{marginTop: 12}}>
                            <OrderMap coords={order.user?.coords} />
                          </div>
                        </div>
                        <div style={{flex:'1 1 160px'}}>
                          <b>Pago:</b>
                          <div>ID de pago: {order.preferenceId}</div>
                          <div>Método: {payment.payment_method || '-'}</div>
                          <div>Monto: ${payment.amount || order.items.reduce((acc, item) => acc + (item.price || item.unit_price || 0), 0)}</div>
                          <div>Estado: {statusBadge(status, status_detail)}</div>
                          <div>Creado: {payment.date_created ? new Date(payment.date_created).toLocaleString() : '-'}</div>
                          {order.init_point && status==='pending' && <a href={order.init_point} target="_blank" rel="noopener noreferrer" style={{color:'#219ebc',textDecoration:'underline',display:'block',marginTop:6}}>Volver a pagar</a>}
                        </div>
                      </div>
                      <div style={{marginTop:14,display:'flex',gap:10}}>
                        <button style={{background:'#e57373',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:600,cursor:'pointer'}} onClick={()=>window.open('mailto:soporte@tutienda.com?subject=Reclamo%20sobre%20compra%20'+(order.preferenceId||''),'_blank')}>Reclamar compra</button>
                        {/* Si tienes comprobante, puedes mostrar link aquí */}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )
      )}
      <style>{`
      @keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;}}
      .status-badge { display:inline-block; padding:2px 10px; border-radius:14px; color:#fff; font-weight:600; font-size:0.95em; margin-left:4px; }
      .order-item { transition: box-shadow 0.2s; }
      .order-item:hover { box-shadow: 0 4px 16px #8ecae633; }
      `}</style>
    </div>
  );
};

export default OrderHistory;
