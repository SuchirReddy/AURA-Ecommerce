import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ArrowRight, ChevronLeft } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile } from '../services/userService';
import { getCartItems, removeCartItem, updateCartItemQuantity } from '../services/cartService';
import { getSiteSettings } from '../services/contentService';
import Loader from '../components/Loader';
import './Cart.css';

const Cart = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      fetchCart();
    }
  }, [user, isLoaded]);

  async function fetchCart() {
    setLoading(true);
    try {
      if (user) {
        const profile = await syncUserProfile(user);
        if (profile?.id) {
          const items = await getCartItems(profile.id);
          setCartItems(items);
        }
      } else {
        const items = await getCartItems(null);
        setCartItems(items);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      await updateCartItemQuantity(item.id, newQty);
      fetchCart(); // Re-fetch to ensure sync
    } catch (error) {
      console.error("Error updating qty:", error);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeCartItem(id);
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.products?.sale_price || item.products?.price || 0;
    return acc + (itemPrice * item.quantity);
  }, 0);

  const taxRate = settings?.tax_enabled === 'true' && settings?.tax_inclusive !== 'true' 
    ? (Number(settings.tax_gst_rate) || 0) / 100 
    : 0;
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">Your Cart</h1>
        
        {loading ? (
          <div style={{ padding: '60px 0' }}><Loader /></div>
        ) : cartItems.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ marginBottom: '16px' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Looks like you haven't added anything yet.</p>
            <Link to="/shop" className="btn-primary" style={{ textDecoration: 'none' }}>Shop Now</Link>
          </div>
        ) : (
          <>
            <div className="cart-header-actions">
              <p className="cart-subtitle" style={{ marginBottom: 0 }}>{cartItems.length} items in your cart.</p>
              <Link to="/shop" className="continue-shopping-btn">
                <ChevronLeft size={16} /> Continue Shopping
              </Link>
            </div>
            
            <div className="cart-layout">
              {/* Cart Items Column */}
              <div className="cart-items-column">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <Link to={`/product/${item.product_id}`} className="cart-item-image-container">
                      <img src={item.products?.featured_image || 'https://via.placeholder.com/400?text=No+Image'} alt={item.products?.name} className="cart-item-image" />
                    </Link>
                    
                    <div className="cart-item-details">
                      <div className="cart-item-header">
                        <Link to={`/product/${item.product_id}`} className="cart-item-name">{item.products?.name}</Link>
                        <div className="cart-item-price-wrap">
                          {item.products?.sale_price ? (
                            <>
                              <span className="cart-item-price">₹{item.products.sale_price}</span>
                              <span className="cart-item-original-price" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '8px' }}>₹{item.products.price}</span>
                            </>
                          ) : (
                            <span className="cart-item-price">₹{item.products?.price}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="cart-item-variants">
                        {(item.size || item.color) && (
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                            {item.size && `Size: ${typeof item.size === 'string' ? item.size : item.size?.size || 'N/A'}`}
                            {item.size && item.color && ' | '}
                            {item.color && `Color: ${item.color.name || 'Standard'}`}
                          </div>
                        )}
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-qty-controls">
                          <button className="qty-btn" aria-label="Decrease quantity" onClick={() => handleUpdateQty(item, -1)}>-</button>
                          <span className="qty-value">{item.quantity}</span>
                          <button className="qty-btn" aria-label="Increase quantity" onClick={() => handleUpdateQty(item, 1)}>+</button>
                        </div>

                        <div className="cart-item-links">
                          <button className="action-link"><Heart size={16} /> Save</button>
                          <button className="action-link remove" onClick={() => handleRemove(item.id)}><Trash2 size={16} /> Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Column */}
              <div className="cart-summary-column">
                <div className="order-summary-card">
                  <h2 className="summary-title">Order Summary</h2>
                  
                  <div className="summary-row">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Taxes {settings?.tax_enabled === 'true' && settings?.tax_inclusive !== 'true' ? `(${settings?.tax_gst_rate || 0}%)` : '(Inclusive)'}</span>
                    <span>₹{taxes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="promo-code-section">
                    <input type="text" placeholder="Promo code" className="promo-input" />
                    <button className="promo-btn">Apply</button>
                  </div>

                  <Link to="/checkout" className="btn-primary checkout-btn" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center', alignItems: 'center' }}>
                    Proceed to Checkout <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                  </Link>
                  
                  <div className="secure-checkout">
                    <span>Secure Checkout powered by AURA</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
