import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, Package, MapPin, Truck } from 'lucide-react';
import { getOrderById } from '../services/orderService';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchOrder = async () => {
      const orderId = location.state?.orderId;
      if (!orderId) {
        navigate('/');
        return;
      }
      
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [location, navigate]);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!order) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Order not found.</div>;
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        
        {/* Success Header */}
        <div className="success-header">
          <div className="check-icon-wrapper scale-in">
            <Check size={32} strokeWidth={3} />
          </div>
          <div className="fade-in-up delay-1">
            <span className="order-number">Order #{order.order_number}</span>
            <h1 className="thank-you-title">Thank you!</h1>
          </div>
        </div>

        {/* Status Card */}
        <div className="status-card fade-in-up delay-2">
          <h2>Your order is confirmed</h2>
          <p>We've accepted your order, and we're getting it ready. A confirmation email has been sent to <strong>{order.profiles?.email || 'your email'}</strong>.</p>
          <div className="status-timeline">
            <div className="timeline-step active">
              <div className="step-icon"><Check size={16} /></div>
              <span>Confirmed</span>
            </div>
            <div className={`timeline-line ${order.status !== 'processing' ? 'active' : ''}`}></div>
            <div className={`timeline-step ${order.status !== 'processing' ? 'active' : ''}`}>
              <div className="step-icon"><Package size={16} /></div>
              <span>Preparing</span>
            </div>
            <div className={`timeline-line ${order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}></div>
            <div className={`timeline-step ${order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
              <div className="step-icon"><Truck size={16} /></div>
              <span>Shipped</span>
            </div>
          </div>
        </div>

        {/* Customer Info Grid */}
        <div className="info-grid fade-in-up delay-3">
          <div className="info-block">
            <h3><MapPin size={18} /> Shipping Address</h3>
            <p>
              {order.shipping_address?.firstName} {order.shipping_address?.lastName}<br/>
              {order.shipping_address?.address}<br/>
              {order.shipping_address?.apartment && <>{order.shipping_address.apartment}<br/></>}
              {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pinCode}<br/>
              {order.shipping_address?.country}
            </p>
          </div>
          <div className="info-block">
            <h3><Truck size={18} /> Shipping Method</h3>
            <p>Standard Shipping<br/>(3-5 Business Days)</p>
          </div>
        </div>
        
        {/* Ordered Items Summary */}
        <div className="order-summary-box fade-in-up delay-3" style={{ marginTop: '32px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Order Summary</h3>
          <div className="ordered-items-list" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
            {order.order_items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.products?.featured_image || 'https://via.placeholder.com/60'} alt={item.products?.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.products?.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Size: {typeof item.size === 'string' ? item.size : item.size?.size} 
                      {item.color && ` | Color: ${item.color.name}`} | Qty: {item.quantity}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: '500' }}>₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1.1rem' }}>
            <span>Total</span>
            <span>₹{order.total_amount}</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
            Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}
          </div>
        </div>

        {/* Actions */}
        <div className="confirmation-actions fade-in-up delay-4">
          <Link to="/shop" className="btn-primary continue-btn">Continue Shopping</Link>
          <Link 
            to={`/track?order_number=${order.order_number}&email=${encodeURIComponent(order.profiles?.email || '')}`} 
            className="btn-secondary track-btn"
          >
            Track Order
          </Link>
        </div>

        <div className="support-link fade-in-up delay-4">
          Need help? <Link to="#">Contact Support</Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
