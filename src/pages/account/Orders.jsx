import React, { useState, useEffect } from 'react';
import { Download, Package, Truck, Check, XCircle, AlertTriangle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile } from '../../services/userService';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import toast from 'react-hot-toast';
import './Orders.css';

// Custom confirm modal
const CancelConfirmModal = ({ orderNumber, onConfirm, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
  }} onClick={onClose}>
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: '20px', padding: '36px 32px', width: '100%', maxWidth: '420px',
      textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
    }} onClick={e => e.stopPropagation()}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'rgba(255, 59, 48, 0.12)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
      }}>
        <AlertTriangle size={30} color="#ff3b30" />
      </div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px' }}>Cancel Order?</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
        Are you sure you want to cancel order <strong style={{ color: 'var(--text-primary)' }}>#{orderNumber}</strong>?
        <br />This action <strong>cannot be undone</strong>.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onClose} style={{
          flex: 1, padding: '14px', borderRadius: '12px',
          background: 'var(--bg-primary)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem'
        }}>
          Keep Order
        </button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '14px', borderRadius: '12px',
          background: '#ff3b30', border: 'none',
          color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem'
        }}>
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

const Orders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null); // { id, order_number }

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const profile = await syncUserProfile(user);
        if (profile?.id) {
          const data = await getOrders(profile.id);
          setOrders(data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    const { id } = cancelTarget;
    setCancelTarget(null);
    try {
      await updateOrderStatus(id, { status: 'cancelled' });
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div className="orders-page fade-in">
      {cancelTarget && (
        <CancelConfirmModal
          orderNumber={cancelTarget.order_number || cancelTarget.id?.substring(0, 8)}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}

      <h1 className="account-section-title">My Orders</h1>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>You have no orders yet.</div>
        ) : (
          orders.map((order) => {
            const isCancelled = order.status === 'cancelled';
            return (
              <div key={order.id} className="order-detailed-card" style={isCancelled ? { opacity: 0.8, borderColor: 'rgba(255,59,48,0.3)' } : {}}>
                <div className="order-card-header">
                  <div className="order-header-left">
                    <div className="header-block">
                      <span className="block-label">Order Number</span>
                      <span className="block-value">#{order.order_number || order.id.substring(0, 8)}</span>
                    </div>
                    <div className="header-block">
                      <span className="block-label">Date Placed</span>
                      <span className="block-value">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="header-block">
                      <span className="block-label">Total Amount</span>
                      <span className="block-value">₹{order.total_amount}</span>
                    </div>
                  </div>
                  <div className="order-header-right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isCancelled && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: '#ff3b30', fontSize: '0.85rem', fontWeight: '600',
                        background: 'rgba(255,59,48,0.1)', padding: '6px 12px',
                        borderRadius: '999px', border: '1px solid rgba(255,59,48,0.25)'
                      }}>
                        <XCircle size={14} /> Cancelled
                      </span>
                    )}
                    {(order.status === 'processing' || order.status === 'pending') && (
                      <button
                        className="btn-secondary small-btn invoice-btn"
                        style={{ color: '#ff3b30', borderColor: 'rgba(255,59,48,0.4)' }}
                        onClick={() => setCancelTarget(order)}
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    )}
                    <button className="btn-secondary small-btn invoice-btn">
                      <Download size={16} /> Invoice
                    </button>
                  </div>
                </div>

                <div className="order-status-tracker">
                  <div className="tracker-header">
                    <h3 style={{ textTransform: 'capitalize', color: isCancelled ? '#ff3b30' : 'var(--text-primary)' }}>
                      {order.status}
                    </h3>
                  </div>

                  {isCancelled ? (
                    /* Cancelled banner instead of normal timeline */
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 20px', borderRadius: '12px',
                      background: 'rgba(255,59,48,0.07)', border: '1px dashed rgba(255,59,48,0.3)',
                      margin: '8px 0 12px'
                    }}>
                      <XCircle size={28} color="#ff3b30" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#ff3b30', marginBottom: '2px' }}>Order Cancelled</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          This order has been cancelled. If any payment was made, a refund will be processed within 5–7 business days.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="status-timeline horizontal">
                      <div className={`timeline-step ${order.status !== 'failed' ? 'active completed' : 'active'}`}>
                        <div className="step-icon"><Check size={16} /></div>
                        <span>Confirmed</span>
                      </div>
                      <div className={`timeline-line ${order.status !== 'failed' ? 'completed' : ''}`}></div>
                      <div className={`timeline-step ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'active completed' : ''}`}>
                        <div className="step-icon"><Package size={16} /></div>
                        <span>Preparing</span>
                      </div>
                      <div className={`timeline-line ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}></div>
                      <div className={`timeline-step ${['shipped', 'delivered'].includes(order.status) ? 'active completed' : ''}`}>
                        <div className="step-icon"><Truck size={16} /></div>
                        <span>Shipped</span>
                      </div>
                      <div className={`timeline-line ${order.status === 'delivered' ? 'completed' : ''}`}></div>
                      <div className={`timeline-step ${order.status === 'delivered' ? 'active completed' : ''}`}>
                        <div className="step-icon"><Check size={16} /></div>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="order-items-list" style={{ padding: '0 20px 20px 20px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Items in this order</h4>
                  {order.order_items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--border)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img src={item.products?.featured_image || 'https://via.placeholder.com/60'} alt={item.products?.name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', opacity: isCancelled ? 0.5 : 1 }} />
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.products?.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Qty: {item.quantity} | Size: {typeof item.size === 'string' ? item.size : item.size?.size}
                            {item.color && ` | Color: ${item.color.name}`}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: '500', color: isCancelled ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;
