import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, Search, MapPin, Truck, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { trackOrder } from '../services/orderService';
import './TrackOrder.css';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get('order_number') || searchParams.get('order') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-search if both params are present on load
  useEffect(() => {
    if (initialOrder && initialEmail) {
      handleSearch();
    }
  }, [initialOrder, initialEmail]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      setError('Please provide both Order Number and Email Address.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const data = await trackOrder(orderNumber.trim(), email.trim());
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    return statuses.indexOf(status?.toLowerCase()) >= 0 ? statuses.indexOf(status?.toLowerCase()) : 0;
  };

  return (
    <div className="track-page">
      <div className="container">
        <div className="track-header">
          <h1>Track Your Order</h1>
          <p>Enter your order details below to see the latest shipping updates.</p>
        </div>

        {!order && (
          <div className="track-form-container">
            <form className="track-form" onSubmit={handleSearch}>
              {error && (
                <div className="track-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="form-group">
                <label>Order Number</label>
                <div className="input-wrapper">
                  <Package className="input-icon" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. ORD-20231024-8192" 
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="Email used during checkout" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary track-submit-btn" disabled={loading}>
                {loading ? 'Searching...' : <><Search size={18} /> Track Order</>}
              </button>
            </form>
          </div>
        )}

        {order && (
          <div className="track-results fade-in">
            <button className="back-to-search" onClick={() => setOrder(null)}>
              ← Track another order
            </button>

            <div className="order-status-card">
              <div className="order-status-header">
                <div className="status-header-left">
                  <h2>Order #{order.order_number}</h2>
                  <span className="order-date">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className={`status-badge ${order.status?.toLowerCase()}`}>
                  {order.status?.toUpperCase()}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="tracking-timeline">
                <div className="timeline-progress-bg"></div>
                <div 
                  className="timeline-progress-fill" 
                  style={{ width: `${(getStatusIndex(order.status) / 3) * 100}%` }}
                ></div>

                <div className={`timeline-step ${getStatusIndex(order.status) >= 0 ? 'completed' : ''} ${getStatusIndex(order.status) === 0 ? 'active' : ''}`}>
                  <div className="step-icon"><Package size={20} /></div>
                  <span className="step-label">Order Placed</span>
                </div>
                
                <div className={`timeline-step ${getStatusIndex(order.status) >= 1 ? 'completed' : ''} ${getStatusIndex(order.status) === 1 ? 'active' : ''}`}>
                  <div className="step-icon"><CheckCircle2 size={20} /></div>
                  <span className="step-label">Processing</span>
                </div>

                <div className={`timeline-step ${getStatusIndex(order.status) >= 2 ? 'completed' : ''} ${getStatusIndex(order.status) === 2 ? 'active' : ''}`}>
                  <div className="step-icon"><Truck size={20} /></div>
                  <span className="step-label">Shipped</span>
                </div>

                <div className={`timeline-step ${getStatusIndex(order.status) >= 3 ? 'completed' : ''} ${getStatusIndex(order.status) === 3 ? 'active' : ''}`}>
                  <div className="step-icon"><MapPin size={20} /></div>
                  <span className="step-label">Delivered</span>
                </div>
              </div>
            </div>

            <div className="order-details-grid">
              <div className="details-card">
                <h3>Items in this Shipment</h3>
                <div className="track-items-list">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="track-item">
                      <img 
                        src={item.products?.featured_image || 'https://via.placeholder.com/100'} 
                        alt={item.products?.name} 
                        className="track-item-img"
                      />
                      <div className="track-item-info">
                        <span className="track-item-name">{item.products?.name}</span>
                        <span className="track-item-meta">
                          Qty: {item.quantity} 
                          {item.size && ` • Size: ${typeof item.size === 'string' ? item.size : item.size.size}`}
                          {item.color && ` • Color: ${item.color.name}`}
                        </span>
                      </div>
                      <span className="track-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="details-card summary-info-card">
                <h3>Shipping Address</h3>
                <div className="address-display">
                  <strong>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</strong>
                  <p>{order.shipping_address?.address}</p>
                  {order.shipping_address?.apartment && <p>{order.shipping_address?.apartment}</p>}
                  <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pinCode}</p>
                  <p>{order.shipping_address?.country}</p>
                  <p className="contact-phone">{order.shipping_address?.phone}</p>
                </div>

                <div className="divider"></div>

                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Total Amount</span>
                  <strong>₹{Number(order.total_amount).toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Payment Method</span>
                  <span style={{ textTransform: 'uppercase' }}>{order.payment_method?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
