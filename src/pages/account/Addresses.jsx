import React, { useState, useEffect } from 'react';
import { Plus, Star, Pencil, Trash2, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile, getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../services/userService';
import toast from 'react-hot-toast';
import './Addresses.css';

const EMPTY_FORM = { firstName: '', lastName: '', address: '', apartment: '', city: '', state: '', pinCode: '', phone: '', country: 'India' };

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh'];

const AddressModal = ({ address, userId, isFirst, onClose, onSaved }) => {
  const [form, setForm] = useState(address || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (address?.id) {
        const updated = await updateAddress(address.id, form);
        toast.success('Address updated');
        onSaved('update', updated);
      } else {
        const created = await addAddress({ ...form, user_id: userId, is_default: isFirst });
        toast.success('Address added');
        onSaved('add', created);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{address?.id ? 'Edit Address' : 'Add New Address'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>First Name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required className="checkout-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Last Name *</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required className="checkout-input" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Street Address *</label>
            <input name="address" value={form.address} onChange={handleChange} required className="checkout-input" style={{ width: '100%' }} placeholder="House no., Street name" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Apartment / Landmark</label>
            <input name="apartment" value={form.apartment} onChange={handleChange} className="checkout-input" style={{ width: '100%' }} placeholder="Optional" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>City *</label>
              <input name="city" value={form.city} onChange={handleChange} required className="checkout-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>PIN Code *</label>
              <input name="pinCode" value={form.pinCode} onChange={handleChange} required className="checkout-input" style={{ width: '100%' }} maxLength="6" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>State *</label>
            <select name="state" value={form.state} onChange={handleChange} required className="checkout-input" style={{ width: '100%' }}>
              <option value="">Select State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className="checkout-input" style={{ width: '100%' }} type="tel" />
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={{ marginTop: '8px', height: '50px', fontSize: '1rem' }}>
            {saving ? 'Saving...' : address?.id ? 'Update Address' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Addresses = () => {
  const { user } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [modal, setModal] = useState(null); // null | 'add' | address object

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      try {
        const profile = await syncUserProfile(user);
        if (profile?.id) {
          setUserId(profile.id);
          const data = await getUserAddresses(profile.id);
          setAddresses(data || []);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [user]);

  const handleSaved = (type, data) => {
    if (type === 'add') setAddresses(prev => [...prev, data]);
    if (type === 'update') setAddresses(prev => prev.map(a => a.id === data.id ? data : a));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(userId, id);
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading addresses...</div>;

  return (
    <div className="addresses-page fade-in">
      {modal !== null && (
        <AddressModal
          address={modal === 'add' ? null : modal}
          userId={userId}
          isFirst={addresses.length === 0}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="section-header-flex">
        <h1 className="account-section-title">Saved Addresses</h1>
        <button className="btn-primary small-btn" onClick={() => setModal('add')}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Add New Address
        </button>
      </div>

      <div className="addresses-grid">
        {addresses.length === 0 ? (
          <div style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
            You haven't added any addresses yet.
          </div>
        ) : (
          addresses.map(address => (
            <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
              <div className="address-header">
                {address.is_default ? (
                  <span className="address-badge"><Star size={12} style={{ marginRight: '4px' }} /> Default</span>
                ) : (
                  <span className="address-badge secondary">Address</span>
                )}
              </div>
              <div className="address-body">
                <h3>{address.firstName} {address.lastName}</h3>
                <p>
                  {address.address}<br />
                  {address.apartment && <>{address.apartment}<br /></>}
                  {address.city}, {address.state} {address.pinCode}<br />
                  {address.country || 'India'}
                </p>
                <p className="address-phone">{address.phone}</p>
              </div>
              <div className="address-actions">
                <button className="text-btn" onClick={() => setModal(address)}>
                  <Pencil size={13} style={{ marginRight: '4px' }} /> Edit
                </button>
                {!address.is_default && (
                  <>
                    <button className="text-btn" onClick={() => handleSetDefault(address.id)}>
                      <Star size={13} style={{ marginRight: '4px' }} /> Set Default
                    </button>
                    <button className="text-btn delete" onClick={() => handleDelete(address.id)}>
                      <Trash2 size={13} style={{ marginRight: '4px' }} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Addresses;
