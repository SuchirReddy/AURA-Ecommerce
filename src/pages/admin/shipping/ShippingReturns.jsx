import React, { useState, useEffect } from 'react';
import { 
  Truck, RotateCcw, Plus, Pencil, Trash2, X, 
  MapPin, Package, Clock, IndianRupee, Check, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getShippingZones, createShippingZone, updateShippingZone, deleteShippingZone,
  createShippingMethod, updateShippingMethod, deleteShippingMethod,
  getReturnPolicies, createReturnPolicy, updateReturnPolicy, deleteReturnPolicy
} from '../../../services/shippingService';
import '../../admin/AdminTables.css';
import '../../admin/AdminForms.css';
import Loader from '../../../components/Loader';
import './ShippingReturns.css';

// ============================================================
// SHIPPING ZONE MODAL
// ============================================================
const ZoneModal = ({ zone, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: zone?.name || '',
    regions: zone?.regions || '',
    is_active: zone?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Zone name is required');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast.error('Failed to save zone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sr-modal-overlay" onClick={onClose}>
      <div className="sr-modal" onClick={e => e.stopPropagation()}>
        <div className="sr-modal-header">
          <h3>{zone ? 'Edit Shipping Zone' : 'New Shipping Zone'}</h3>
          <button className="sr-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="sr-modal-body">
            <div className="form-group">
              <label className="form-label">Zone Name *</label>
              <input 
                className="form-input" 
                placeholder="e.g. Domestic, International" 
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Regions / Countries</label>
              <textarea 
                className="form-textarea" 
                placeholder="e.g. India, Sri Lanka, Nepal (comma separated)"
                value={form.regions}
                onChange={e => setForm(prev => ({ ...prev, regions: e.target.value }))}
                style={{ minHeight: '80px' }}
              />
            </div>
            <div className="form-group">
              <label className="sr-toggle-row">
                <span>Active</span>
                <div className="sr-toggle">
                  <input 
                    type="checkbox" 
                    checked={form.is_active}
                    onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="sr-toggle-slider"></span>
                </div>
              </label>
            </div>
          </div>
          <div className="sr-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// SHIPPING METHOD MODAL
// ============================================================
const MethodModal = ({ method, zoneId, onClose, onSave }) => {
  const [form, setForm] = useState({
    zone_id: zoneId,
    name: method?.name || '',
    description: method?.description || '',
    price: method?.price || '',
    min_delivery_days: method?.min_delivery_days || '',
    max_delivery_days: method?.max_delivery_days || '',
    is_active: method?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Method name is required');
    if (form.price === '' || Number(form.price) < 0) return toast.error('Valid price is required');
    setSaving(true);
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        min_delivery_days: form.min_delivery_days ? Number(form.min_delivery_days) : null,
        max_delivery_days: form.max_delivery_days ? Number(form.max_delivery_days) : null,
      });
      onClose();
    } catch (err) {
      toast.error('Failed to save method');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sr-modal-overlay" onClick={onClose}>
      <div className="sr-modal" onClick={e => e.stopPropagation()}>
        <div className="sr-modal-header">
          <h3>{method ? 'Edit Shipping Method' : 'New Shipping Method'}</h3>
          <button className="sr-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="sr-modal-body">
            <div className="form-group">
              <label className="form-label">Method Name *</label>
              <input 
                className="form-input" 
                placeholder="e.g. Standard Shipping, Express"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input 
                className="form-input" 
                placeholder="e.g. 5-7 business days"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input 
                  className="form-input" 
                  type="number" 
                  min="0" 
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Days</label>
                <input 
                  className="form-input" 
                  type="number" 
                  min="0"
                  placeholder="e.g. 3"
                  value={form.min_delivery_days}
                  onChange={e => setForm(prev => ({ ...prev, min_delivery_days: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Days</label>
                <input 
                  className="form-input" 
                  type="number" 
                  min="0"
                  placeholder="e.g. 7"
                  value={form.max_delivery_days}
                  onChange={e => setForm(prev => ({ ...prev, max_delivery_days: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="sr-toggle-row">
                <span>Active</span>
                <div className="sr-toggle">
                  <input 
                    type="checkbox" 
                    checked={form.is_active}
                    onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="sr-toggle-slider"></span>
                </div>
              </label>
            </div>
          </div>
          <div className="sr-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// RETURN POLICY MODAL
// ============================================================
const PolicyModal = ({ policy, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: policy?.name || '',
    description: policy?.description || '',
    return_window_days: policy?.return_window_days || 30,
    refund_type: policy?.refund_type || 'full',
    conditions: policy?.conditions || '',
    is_active: policy?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Policy name is required');
    setSaving(true);
    try {
      await onSave({
        ...form,
        return_window_days: Number(form.return_window_days),
      });
      onClose();
    } catch (err) {
      toast.error('Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sr-modal-overlay" onClick={onClose}>
      <div className="sr-modal sr-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="sr-modal-header">
          <h3>{policy ? 'Edit Return Policy' : 'New Return Policy'}</h3>
          <button className="sr-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="sr-modal-body">
            <div className="form-group">
              <label className="form-label">Policy Name *</label>
              <input 
                className="form-input" 
                placeholder="e.g. Standard Return Policy"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-textarea" 
                placeholder="Describe the return policy details..."
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Return Window (days)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  min="0"
                  value={form.return_window_days}
                  onChange={e => setForm(prev => ({ ...prev, return_window_days: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Refund Type</label>
                <select 
                  className="form-select"
                  value={form.refund_type}
                  onChange={e => setForm(prev => ({ ...prev, refund_type: e.target.value }))}
                >
                  <option value="full">Full Refund</option>
                  <option value="partial">Partial Refund</option>
                  <option value="store_credit">Store Credit</option>
                  <option value="exchange">Exchange Only</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Conditions</label>
              <textarea 
                className="form-textarea" 
                placeholder="e.g. Item must be unused, in original packaging, with tags attached..."
                value={form.conditions}
                onChange={e => setForm(prev => ({ ...prev, conditions: e.target.value }))}
                style={{ minHeight: '80px' }}
              />
            </div>
            <div className="form-group">
              <label className="sr-toggle-row">
                <span>Active</span>
                <div className="sr-toggle">
                  <input 
                    type="checkbox" 
                    checked={form.is_active}
                    onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="sr-toggle-slider"></span>
                </div>
              </label>
            </div>
          </div>
          <div className="sr-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
const ShippingReturns = () => {
  const [activeTab, setActiveTab] = useState('shipping');
  const [zones, setZones] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [expandedZone, setExpandedZone] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [zonesData, policiesData] = await Promise.all([
        getShippingZones(),
        getReturnPolicies()
      ]);
      setZones(zonesData || []);
      setPolicies(policiesData || []);
    } catch (err) {
      console.error('Error fetching shipping/returns data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Zone handlers ----
  const handleSaveZone = async (formData) => {
    if (editingZone) {
      await updateShippingZone(editingZone.id, formData);
      toast.success('Zone updated');
    } else {
      await createShippingZone(formData);
      toast.success('Zone created');
    }
    fetchData();
  };

  const handleDeleteZone = async (id) => {
    if (!confirm('Delete this zone and all its methods?')) return;
    try {
      await deleteShippingZone(id);
      toast.success('Zone deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete zone');
    }
  };

  // ---- Method handlers ----
  const handleSaveMethod = async (formData) => {
    if (editingMethod) {
      await updateShippingMethod(editingMethod.id, formData);
      toast.success('Method updated');
    } else {
      await createShippingMethod(formData);
      toast.success('Method added');
    }
    fetchData();
  };

  const handleDeleteMethod = async (id) => {
    if (!confirm('Delete this shipping method?')) return;
    try {
      await deleteShippingMethod(id);
      toast.success('Method deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete method');
    }
  };

  // ---- Policy handlers ----
  const handleSavePolicy = async (formData) => {
    if (editingPolicy) {
      await updateReturnPolicy(editingPolicy.id, formData);
      toast.success('Policy updated');
    } else {
      await createReturnPolicy(formData);
      toast.success('Policy created');
    }
    fetchData();
  };

  const handleDeletePolicy = async (id) => {
    if (!confirm('Delete this return policy?')) return;
    try {
      await deleteReturnPolicy(id);
      toast.success('Policy deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete policy');
    }
  };

  const tabs = [
    { id: 'shipping', label: 'Shipping Zones', icon: <Truck size={18} /> },
    { id: 'returns', label: 'Return Policies', icon: <RotateCcw size={18} /> },
  ];

  return (
    <div className="sr-page fade-in">
      {/* Header */}
      <div className="admin-list-header">
        <h1>Shipping & Returns</h1>
      </div>

      {/* Tab Navigation */}
      <div className="sr-tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`sr-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ============ SHIPPING TAB ============ */}
      {activeTab === 'shipping' && (
        <div className="sr-tab-content fade-in">
          <div className="sr-section-header">
            <div>
              <h2>Shipping Zones</h2>
              <p>Define geographic zones and configure shipping methods for each</p>
            </div>
            <button 
              className="btn-primary sr-add-btn" 
              onClick={() => { setEditingZone(null); setShowZoneModal(true); }}
            >
              <Plus size={16} /> Add Zone
            </button>
          </div>

          {loading ? (
            <div className="sr-loading" style={{ padding: '40px 0' }}><Loader /></div>
          ) : zones.length === 0 ? (
            <div className="sr-empty-state">
              <MapPin size={48} strokeWidth={1.2} />
              <h3>No shipping zones yet</h3>
              <p>Create your first shipping zone to get started</p>
              <button 
                className="btn-primary" 
                onClick={() => { setEditingZone(null); setShowZoneModal(true); }}
              >
                <Plus size={16} /> Create Zone
              </button>
            </div>
          ) : (
            <div className="sr-zones-list">
              {zones.map(zone => (
                <div key={zone.id} className="sr-zone-card">
                  <div className="sr-zone-header" onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}>
                    <div className="sr-zone-info">
                      <div className="sr-zone-title-row">
                        <MapPin size={18} />
                        <h3>{zone.name}</h3>
                        <span className={`admin-badge ${zone.is_active ? 'completed' : 'cancelled'}`}>
                          {zone.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {zone.regions && (
                        <span className="sr-zone-regions">{zone.regions}</span>
                      )}
                    </div>
                    <div className="sr-zone-meta">
                      <span className="sr-method-count">
                        {zone.shipping_methods?.length || 0} method{(zone.shipping_methods?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <div className="sr-zone-actions">
                        <button 
                          className="table-action-btn" 
                          title="Edit Zone"
                          onClick={(e) => { e.stopPropagation(); setEditingZone(zone); setShowZoneModal(true); }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          className="table-action-btn delete" 
                          title="Delete Zone"
                          onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id); }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Methods */}
                  <div className={`sr-zone-methods ${expandedZone === zone.id ? 'expanded' : ''}`}>
                    <div className="sr-zone-methods-inner">
                      <div className="sr-methods-header">
                        <span className="sr-methods-title">Shipping Methods</span>
                        <button 
                          className="sr-add-method-btn"
                          onClick={() => { setEditingMethod(null); setActiveZoneId(zone.id); setShowMethodModal(true); }}
                        >
                          <Plus size={14} /> Add Method
                        </button>
                      </div>
                      
                      {(!zone.shipping_methods || zone.shipping_methods.length === 0) ? (
                        <div className="sr-no-methods">No shipping methods configured for this zone</div>
                      ) : (
                        <div className="sr-methods-grid">
                          {zone.shipping_methods.map(method => (
                            <div key={method.id} className={`sr-method-card ${!method.is_active ? 'inactive' : ''}`}>
                              <div className="sr-method-top">
                                <div className="sr-method-name">
                                  <Package size={16} />
                                  <span>{method.name}</span>
                                </div>
                                <div className="sr-method-actions">
                                  <button 
                                    className="table-action-btn" 
                                    title="Edit"
                                    onClick={() => { setEditingMethod(method); setActiveZoneId(zone.id); setShowMethodModal(true); }}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button 
                                    className="table-action-btn delete" 
                                    title="Delete"
                                    onClick={() => handleDeleteMethod(method.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              {method.description && (
                                <p className="sr-method-desc">{method.description}</p>
                              )}
                              <div className="sr-method-details">
                                <span className="sr-method-price">
                                  <IndianRupee size={14} />
                                  {Number(method.price) === 0 ? 'Free' : method.price}
                                </span>
                                {(method.min_delivery_days || method.max_delivery_days) && (
                                  <span className="sr-method-days">
                                    <Clock size={14} />
                                    {method.min_delivery_days && method.max_delivery_days 
                                      ? `${method.min_delivery_days}–${method.max_delivery_days} days`
                                      : method.min_delivery_days 
                                        ? `${method.min_delivery_days}+ days` 
                                        : `Up to ${method.max_delivery_days} days`
                                    }
                                  </span>
                                )}
                                {!method.is_active && (
                                  <span className="sr-method-inactive-tag">Inactive</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ RETURNS TAB ============ */}
      {activeTab === 'returns' && (
        <div className="sr-tab-content fade-in">
          <div className="sr-section-header">
            <div>
              <h2>Return Policies</h2>
              <p>Configure return and refund policies for your store</p>
            </div>
            <button 
              className="btn-primary sr-add-btn" 
              onClick={() => { setEditingPolicy(null); setShowPolicyModal(true); }}
            >
              <Plus size={16} /> Add Policy
            </button>
          </div>

          {loading ? (
            <div className="sr-loading">Loading return policies...</div>
          ) : policies.length === 0 ? (
            <div className="sr-empty-state">
              <RotateCcw size={48} strokeWidth={1.2} />
              <h3>No return policies yet</h3>
              <p>Create your first return policy to get started</p>
              <button 
                className="btn-primary" 
                onClick={() => { setEditingPolicy(null); setShowPolicyModal(true); }}
              >
                <Plus size={16} /> Create Policy
              </button>
            </div>
          ) : (
            <div className="sr-policies-grid">
              {policies.map(policy => (
                <div key={policy.id} className={`sr-policy-card ${!policy.is_active ? 'inactive' : ''}`}>
                  <div className="sr-policy-header">
                    <div className="sr-policy-title-row">
                      <h3>{policy.name}</h3>
                      <span className={`admin-badge ${policy.is_active ? 'completed' : 'cancelled'}`}>
                        {policy.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="sr-policy-actions">
                      <button 
                        className="table-action-btn" 
                        title="Edit"
                        onClick={() => { setEditingPolicy(policy); setShowPolicyModal(true); }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        className="table-action-btn delete" 
                        title="Delete"
                        onClick={() => handleDeletePolicy(policy.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {policy.description && (
                    <p className="sr-policy-desc">{policy.description}</p>
                  )}

                  <div className="sr-policy-meta">
                    <div className="sr-policy-tag">
                      <Clock size={14} />
                      <span>{policy.return_window_days} day{policy.return_window_days !== 1 ? 's' : ''} return window</span>
                    </div>
                    <div className="sr-policy-tag">
                      <IndianRupee size={14} />
                      <span>
                        {policy.refund_type === 'full' && 'Full Refund'}
                        {policy.refund_type === 'partial' && 'Partial Refund'}
                        {policy.refund_type === 'store_credit' && 'Store Credit'}
                        {policy.refund_type === 'exchange' && 'Exchange Only'}
                      </span>
                    </div>
                  </div>

                  {policy.conditions && (
                    <div className="sr-policy-conditions">
                      <div className="sr-conditions-header">
                        <AlertCircle size={14} />
                        <span>Conditions</span>
                      </div>
                      <p>{policy.conditions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showZoneModal && (
        <ZoneModal 
          zone={editingZone} 
          onClose={() => { setShowZoneModal(false); setEditingZone(null); }}
          onSave={handleSaveZone}
        />
      )}
      {showMethodModal && (
        <MethodModal 
          method={editingMethod}
          zoneId={activeZoneId}
          onClose={() => { setShowMethodModal(false); setEditingMethod(null); }}
          onSave={handleSaveMethod}
        />
      )}
      {showPolicyModal && (
        <PolicyModal 
          policy={editingPolicy}
          onClose={() => { setShowPolicyModal(false); setEditingPolicy(null); }}
          onSave={handleSavePolicy}
        />
      )}
    </div>
  );
};

export default ShippingReturns;
