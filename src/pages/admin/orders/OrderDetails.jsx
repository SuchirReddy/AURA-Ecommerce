import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Package, CreditCard, User, Truck, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrderById, updateOrderStatus } from '../../../services/orderService';
import '../AdminDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateOrderStatus(id, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const handleUpdatePaymentStatus = async (newStatus) => {
    try {
      await updateOrderStatus(id, { payment_status: newStatus });
      setOrder({ ...order, payment_status: newStatus });
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status.");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading order details...</div>;
  if (!order) return <div style={{ padding: '40px', textAlign: 'center' }}>Order not found.</div>;

  return (
    <div className="admin-order-details fade-in">
      <div className="admin-details-header" style={{ marginBottom: '32px' }}>
        <div className="admin-details-header-left">
          <Link to="/admin/orders" className="back-btn" style={{ width: 'fit-content', marginBottom: '12px' }}><ChevronLeft size={20} /></Link>
          <h1>Order #{order.order_number || id.substring(0,8)}</h1>
          <div className="admin-details-subtitle">
            <Calendar size={14} /> {new Date(order.created_at).toLocaleString()}
            <span className={`admin-badge ${order.status !== 'failed' ? 'completed' : 'pending'}`} style={{ marginLeft: '12px' }}>{order.payment_method || 'Paid'}</span>
            <span className={`admin-badge ${order.status === 'delivered' ? 'completed' : 'processing'}`}>{order.status}</span>
          </div>
        </div>
        <div className="admin-form-actions">
          <select 
            className="checkout-input" 
            style={{ width: 'auto', padding: '8px 12px' }} 
            value={order.status} 
            onChange={(e) => handleUpdateStatus(e.target.value)}
          >
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="admin-details-layout">
        {/* Main Content (Left) */}
        <div className="admin-details-main">
          {/* Products */}
          <div className="admin-details-section">
            <div className="admin-details-section-header">
              <h2>Items ({order.order_items?.length || 0})</h2>
            </div>
            <table className="admin-data-table" style={{ border: 'none', backgroundColor: 'transparent' }}>
              <tbody>
                {order.order_items?.map(item => (
                  <tr key={item.id}>
                    <td style={{ paddingLeft: 0 }}>
                      <div className="table-product-cell">
                        <img src={item.products?.featured_image || 'https://via.placeholder.com/150'} alt={item.products?.name} className="table-product-image" />
                        <div>
                          <Link to={`/admin/products/edit/${item.product_id}`} className="table-product-name">{item.products?.name}</Link>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {item.size && `Size: ${typeof item.size === 'string' ? item.size : item.size?.size}`}
                            {item.size && item.color && ' | '}
                            {item.color && `Color: ${item.color.name}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>₹{item.price} × {item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: '500', paddingRight: 0 }}>₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Summary */}
          <div className="admin-details-section">
            <div className="admin-details-section-header">
              <h2>Payment Summary</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontWeight: '600' }}>Total</span>
                <span style={{ fontWeight: '600' }}>₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="admin-details-sidebar">
          <div className="admin-details-section">
            <div className="admin-details-section-header">
              <h2>Customer</h2>
            </div>

            {/* Customer Name */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Name</div>
              <Link to={`/admin/customers/${order.user_id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
                {order.profiles?.full_name || order.profiles?.email || 'Unknown User'}
              </Link>
            </div>

            {/* Contact */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Contact</div>
              <div style={{ fontSize: '0.95rem' }}>{order.profiles?.email}</div>
            </div>

            {/* Payment */}
            <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Payment</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Method</span>
                <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit Card'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</span>
                <select
                  className={`admin-badge ${order.payment_status === 'paid' ? 'completed' : order.payment_status === 'failed' ? 'cancelled' : 'pending'}`}
                  style={{ border: 'none', cursor: 'pointer', background: 'transparent', outline: 'none', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.75rem' }}
                  value={order.payment_status || 'pending'}
                  onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Shipping Address</div>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                <strong>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</strong><br/>
                {order.shipping_address?.address}<br/>
                {order.shipping_address?.apartment && <>{order.shipping_address.apartment}<br/></>}
                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pinCode}<br/>
                {order.shipping_address?.country}<br/>
                <span style={{ color: 'var(--text-secondary)' }}>{order.shipping_address?.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
