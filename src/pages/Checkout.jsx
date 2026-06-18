import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, ShieldCheck, ChevronRight, ChevronLeft, CheckCircle2, Lock, X, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile } from '../services/userService';
import { getCartItems, clearCart, removeCartItem } from '../services/cartService';
import { createOrder } from '../services/orderService';
import { getSiteSettings } from '../services/contentService';
import { validateCoupon } from '../services/couponService';
import './Checkout.css';

const Checkout = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const [addressData, setAddressData] = useState({
    country: 'India',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: '',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Coupon states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        setAddressData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        }));
      }
      fetchCart();
    }
  }, [user, isLoaded]);

  async function fetchCart() {
    setLoading(true);
    try {
      if (user) {
        const profile = await syncUserProfile(user);
        setUserProfile(profile);
        if (profile?.id) {
          const items = await getCartItems(profile.id);
          setCartItems(items);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + ((item.products?.sale_price || item.products?.price || 0) * item.quantity), 0);
  const taxRate = settings?.tax_enabled === 'true' && settings?.tax_inclusive !== 'true'
    ? (Number(settings.tax_gst_rate) || 0) / 100
    : 0;
  const taxes = subtotal * taxRate;

  const standardRate = Number(settings?.shipping_standard_rate) || 0;
  const expressRate = Number(settings?.shipping_express_rate) || 400;
  const freeThreshold = Number(settings?.shipping_free_threshold) || 0;

  const isFreeStandard = freeThreshold > 0 && subtotal >= freeThreshold;
  // If a free_shipping coupon is applied, standard shipping is free. Express shipping is up to your business logic, but let's make all standard shipping free.
  const hasFreeShippingCoupon = appliedCoupon && appliedCoupon.discount_type === 'free_shipping';
  const actualStandardRate = (isFreeStandard || hasFreeShippingCoupon) ? 0 : standardRate;

  const shippingCost = step >= 2
    ? (shippingMethod === 'express' ? expressRate : actualStandardRate)
    : 0;

  const total = Math.max(0, subtotal - (appliedCoupon?.discountAmount || 0) + taxes + shippingCost);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const data = await validateCoupon(couponCodeInput.trim(), subtotal);
      setAppliedCoupon(data);
      setCouponCodeInput('');
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      const items = await getCartItems(user?.id || null);
      setCartItems(items);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (step === 1) {
      if (
        !addressData.firstName.trim() ||
        !addressData.lastName.trim() ||
        !addressData.address.trim() ||
        !addressData.city.trim() ||
        !addressData.state.trim() ||
        !addressData.pinCode.trim() ||
        !addressData.phone.trim()
      ) {
        setCheckoutError('Please fill in all mandatory fields (Name, Address, City, State, PIN code, Phone number).');
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!userProfile) {
        navigate('/login');
        return;
      }

      // Generate logical order number: ORD-YYYYMMDD-XXXX
      const date = new Date();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${yyyy}${mm}${dd}-${random4}`;

      // Build order payload
      const orderData = {
        user_id: userProfile.id,
        order_number: orderNumber,
        total_amount: total,
        status: 'processing',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        shipping_address: addressData,
        coupon_id: appliedCoupon ? appliedCoupon.id : null
      };

      try {
        const newOrder = await createOrder(orderData, cartItems);
        navigate('/confirmation', { state: { orderId: newOrder.id } });
      } catch (error) {
        console.error("Error creating order:", error);
        setCheckoutError(error.message || "Failed to place order. Please try again.");
      }
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* Left Column - Forms */}
        <div className="checkout-main">

          {/* Header & Breadcrumbs */}
          <div className="checkout-header">
            <Link to="/" className="checkout-logo">AURA</Link>
            <nav className="checkout-breadcrumbs">
              <Link to="/cart" className="breadcrumb-link">Cart</Link>
              <ChevronRight size={14} className="breadcrumb-icon" />
              <span className={`breadcrumb-step ${step >= 1 ? 'active' : ''}`}>Information</span>
              <ChevronRight size={14} className="breadcrumb-icon" />
              <span className={`breadcrumb-step ${step >= 2 ? 'active' : ''}`}>Shipping</span>
              <ChevronRight size={14} className="breadcrumb-icon" />
              <span className={`breadcrumb-step ${step === 3 ? 'active' : ''}`}>Payment</span>
            </nav>
          </div>

          {checkoutError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.95rem' }}>
              {checkoutError}
            </div>
          )}

          <form onSubmit={handleNextStep}>
            {/* Step 1: Information */}
            {step === 1 && (
              <div className="checkout-step fade-in">
                <div className="checkout-section">
                  <div className="section-header-flex">
                    <h2>Contact Information</h2>
                    {!user && <span>Already have an account? <Link to="/login">Log in</Link></span>}
                  </div>
                  <input type="email" placeholder="Email" defaultValue={user?.primaryEmailAddress?.emailAddress || ''} className="checkout-input" required />
                  <label className="checkbox-label mt-sm">
                    <input type="checkbox" /> Email me with news and offers
                  </label>
                </div>

                <div className="checkout-section">
                  <h2>Shipping Address</h2>
                  <select name="country" value={addressData.country} onChange={handleAddressChange} className="checkout-input">
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                  <div className="input-row">
                    <input type="text" name="firstName" value={addressData.firstName} onChange={handleAddressChange} placeholder="First name" className="checkout-input" required />
                    <input type="text" name="lastName" value={addressData.lastName} onChange={handleAddressChange} placeholder="Last name" className="checkout-input" required />
                  </div>
                  <input type="text" name="address" value={addressData.address} onChange={handleAddressChange} placeholder="Address" className="checkout-input" required />
                  <input type="text" name="apartment" value={addressData.apartment} onChange={handleAddressChange} placeholder="Apartment, suite, etc. (optional)" className="checkout-input" />
                  <div className="input-row">
                    <input type="text" name="city" value={addressData.city} onChange={handleAddressChange} placeholder="City" className="checkout-input" required />
                    <select name="state" value={addressData.state} onChange={handleAddressChange} className="checkout-input" required>
                      <option value="">State / Union Territory</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diuuhid</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Puducherry">Puducherry</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                    <input type="text" name="pinCode" value={addressData.pinCode} onChange={handleAddressChange} placeholder="PIN code" className="checkout-input" required />
                  </div>
                  <input type="tel" name="phone" value={addressData.phone} onChange={handleAddressChange} placeholder="Phone" className="checkout-input" required />
                </div>

                <div className="checkout-actions">
                  <Link to="/cart" className="return-link"><ChevronLeft size={16} /> Return to cart</Link>
                  <button type="submit" className="btn-primary checkout-next-btn">Continue to shipping</button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="checkout-step fade-in">
                <div className="info-review-box">
                  <div className="review-row">
                    <span className="review-label">Contact</span>
                    <span className="review-value">{user?.primaryEmailAddress?.emailAddress || 'user@example.com'}</span>
                    <button type="button" onClick={() => setStep(1)} className="review-change">Change</button>
                  </div>
                  <div className="review-divider"></div>
                  <div className="review-row">
                    <span className="review-label">Ship to</span>
                    <span className="review-value">Shipping address from Step 1</span>
                    <button type="button" onClick={() => setStep(1)} className="review-change">Change</button>
                  </div>
                </div>

                <div className="checkout-section">
                  <h2>Shipping Method</h2>
                  <div className="shipping-methods">
                    <label className={`shipping-method-card ${shippingMethod === 'standard' ? 'active' : ''}`}>
                      <div className="method-info">
                        <input type="radio" name="shipping" value="standard" checked={shippingMethod === 'standard'} onChange={(e) => setShippingMethod(e.target.value)} />
                        <span className="method-name">Standard Shipping (3-5 Business Days)</span>
                      </div>
                      <span className="method-price">{actualStandardRate === 0 ? 'Free' : `₹${actualStandardRate}`}</span>
                    </label>
                    <label className={`shipping-method-card ${shippingMethod === 'express' ? 'active' : ''}`}>
                      <div className="method-info">
                        <input type="radio" name="shipping" value="express" checked={shippingMethod === 'express'} onChange={(e) => setShippingMethod(e.target.value)} />
                        <span className="method-name">Express Shipping (1-2 Business Days)</span>
                      </div>
                      <span className="method-price">₹{expressRate}</span>
                    </label>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button type="button" onClick={() => setStep(1)} className="return-link"><ChevronLeft size={16} /> Return to information</button>
                  <button type="submit" className="btn-primary checkout-next-btn">Continue to payment</button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="checkout-step fade-in">
                <div className="info-review-box">
                  <div className="review-row">
                    <span className="review-label">Contact</span>
                    <span className="review-value">{user?.primaryEmailAddress?.emailAddress || 'user@example.com'}</span>
                    <button type="button" onClick={() => setStep(1)} className="review-change">Change</button>
                  </div>
                  <div className="review-divider"></div>
                  <div className="review-row">
                    <span className="review-label">Ship to</span>
                    <span className="review-value">{addressData.address}, {addressData.city}, {addressData.state} {addressData.pinCode}</span>
                    <button type="button" onClick={() => setStep(1)} className="review-change">Change</button>
                  </div>
                </div>

                <div className="checkout-section">
                  <h2>Payment</h2>
                  <span className="secure-payment-note"><Lock size={14} /> All transactions are secure and encrypted.</span>

                  <div className="payment-accordion">
                    {/* Credit Card */}
                    <div className={`payment-method ${paymentMethod === 'credit_card' ? 'active' : ''}`}>
                      <div className="payment-header">
                        <div className="method-info">
                          <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                          <span className="method-name">Credit / Debit Card</span>
                        </div>
                        <div className="payment-icons">
                          <CreditCard size={20} />
                        </div>
                      </div>
                      {paymentMethod === 'credit_card' && (
                        <div className="payment-body">
                          <div className="card-input-container">
                            <input type="text" placeholder="Card number" className="checkout-input" required />
                            <div className="input-row">
                              <input type="text" placeholder="Expiration date (MM / YY)" className="checkout-input" required />
                              <input type="text" placeholder="Security code" className="checkout-input" required />
                            </div>
                            <input type="text" placeholder="Name on card" className="checkout-input" required />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash on Delivery */}
                    <div className={`payment-method ${paymentMethod === 'cod' ? 'active' : ''}`}>
                      <div className="payment-header">
                        <div className="method-info">
                          <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                          <span className="method-name">Cash on Delivery (COD)</span>
                        </div>
                        <div className="payment-icons">
                          <Banknote size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button type="button" onClick={() => setStep(2)} className="return-link"><ChevronLeft size={16} /> Return to shipping</button>
                  <button type="submit" className="btn-primary checkout-next-btn">
                    {paymentMethod === 'cod' ? 'Place Order' : 'Pay now'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer links */}
          <div className="checkout-footer-links">
            <Link to="#">Refund policy</Link>
            <Link to="#">Shipping policy</Link>
            <Link to="#">Privacy policy</Link>
            <Link to="#">Terms of service</Link>
          </div>
        </div>

        {/* Right Column - Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <div className="sidebar-content">
            <div className="checkout-items">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading cart items...</div>
              ) : cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Your cart is empty.</div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item-image">
                      <img src={item.products?.featured_image || 'https://via.placeholder.com/200?text=No+Image'} alt={item.products?.name} />
                      <span className="item-badge">{item.quantity}</span>
                    </div>
                    <div className="checkout-item-info">
                      <span className="item-name">{item.products?.name}</span>
                      <span className="item-variant">
                        {item.size && `Size: ${typeof item.size === 'string' ? item.size : item.size?.size}`}
                        {item.size && item.color && ' | '}
                        {item.color && `Color: ${item.color.name}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className="item-price">
                          ₹{((item.products?.sale_price || item.products?.price) * item.quantity).toLocaleString()}
                        </span>
                        {item.products?.sale_price && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            ₹{(item.products.price * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="promo-code-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="var(--text-primary)" />
                    <span style={{ fontWeight: '500' }}>{appliedCoupon.code}</span>
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Discount code"
                      className="checkout-input"
                      style={{ marginBottom: 0 }}
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (couponCodeInput.trim()) {
                            handleApplyCoupon();
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0 20px', height: 'auto' }}
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCodeInput.trim()}
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '8px' }}>{couponError}</div>}
                </>
              )}
            </div>

            <div className="checkout-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="total-row" style={{ color: 'green' }}>
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{(appliedCoupon.discountAmount || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="total-row">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
              </div>
              <div className="total-row">
                <span>Taxes {settings?.tax_enabled === 'true' && settings?.tax_inclusive !== 'true' ? `(${settings?.tax_gst_rate || 0}%)` : '(Inclusive)'}</span>
                <span>₹{taxes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="total-divider"></div>
              <div className="total-row final-total">
                <span>Total</span>
                <span><span className="currency-label">{settings?.store_currency || 'INR'}</span> {settings?.store_currency_symbol || '₹'}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
