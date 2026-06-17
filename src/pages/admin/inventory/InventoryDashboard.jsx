import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Eye, X, Save } from 'lucide-react';
import { getInventory, updateInventoryStock } from '../../../services/productService';
import { updateProduct } from '../../../services/productService';
import Loader from '../../../components/Loader';
import toast from 'react-hot-toast';
import '../AdminTables.css';
import './Inventory.css';

// Parse sizes from the products.sizes TEXT[] column (each entry may be a JSON string)
const parseSizes = (rawSizes) => {
  if (!Array.isArray(rawSizes)) return [];
  return rawSizes.map(s => {
    if (typeof s === 'string' && s.startsWith('{')) {
      try { return JSON.parse(s); } catch { return { size: s, stock: 0 }; }
    }
    if (typeof s === 'object' && s !== null) return s;
    return { size: s, stock: 0 };
  });
};

// Size Stock Modal
const SizeStockModal = ({ item, onClose, onSave }) => {
  const [sizes, setSizes] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const parsed = parseSizes(item.products?.sizes);
    setSizes(parsed.length > 0 ? parsed : []);
  }, [item]);

  const handleChange = (index, val) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], stock: Math.max(0, Number(val) || 0) };
    setSizes(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Serialize sizes back to TEXT[] of JSON strings
      const serialized = sizes.map(s => JSON.stringify(s));
      // Compute total stock from sizes sum
      const totalStock = sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
      await updateProduct(item.product_id, { sizes: serialized, stock_quantity: totalStock });
      await updateInventoryStock(item.product_id, totalStock);
      toast.success('Stock updated successfully');
      onSave(item.product_id, sizes, totalStock);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px',
        maxHeight: '80vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={item.products?.featured_image || 'https://via.placeholder.com/40'} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
            <div>
              <h3 style={{ fontWeight: '600', marginBottom: '2px' }}>{item.products?.name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SKU: {item.products?.sku || 'N/A'}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {sizes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0' }}>
            No sizes defined for this product.<br/>
            <span style={{ fontSize: '0.85rem' }}>Add sizes from the product edit page.</span>
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {sizes.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg-primary)', borderRadius: '10px', padding: '12px 16px',
                  border: '1px solid var(--border)'
                }}>
                  <span style={{ fontWeight: '600', fontSize: '1rem', minWidth: '40px' }}>{s.size}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleChange(i, s.stock - 1)}
                      disabled={s.stock === 0}
                      style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        border: 'none',
                        background: s.stock === 0 ? '#444' : '#e74c3c',
                        cursor: s.stock === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: s.stock === 0 ? 0.4 : 1, color: '#fff', flexShrink: 0
                      }}
                    ><Minus size={14} /></button>
                    <input
                      type="number"
                      min="0"
                      value={s.stock}
                      onChange={e => handleChange(i, e.target.value)}
                      style={{
                        width: '64px', textAlign: 'center', padding: '6px',
                        borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        fontSize: '1rem', fontWeight: '600'
                      }}
                    />
                    <button
                      onClick={() => handleChange(i, s.stock + 1)}
                      style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        border: 'none',
                        background: '#27ae60',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', flexShrink: 0
                      }}
                    ><Plus size={14} /></button>
                    <span style={{ fontSize: '0.8rem', color: s.stock === 0 ? '#ff3b30' : s.stock <= 5 ? '#ff9500' : '#34c759', minWidth: '60px', textAlign: 'right' }}>
                      {s.stock === 0 ? 'Out' : s.stock <= 5 ? 'Low' : 'In Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)', marginBottom: '20px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Stock</span>
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{sizes.reduce((s, x) => s + (x.stock || 0), 0)}</span>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px',
                background: 'var(--text-primary)', color: 'var(--bg-primary)',
                border: 'none', cursor: 'pointer', fontWeight: '600',
                fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Main Inventory Dashboard
const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      // Fetch product sizes by joining — getInventory already joins products
      setInventory(data || []);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async (productId, delta) => {
    const item = inventory.find(i => i.product_id === productId);
    if (!item) return;
    const newQty = Math.max(0, item.stock_quantity + delta);
    handleSetStock(productId, newQty);
  };

  const handleSetStock = async (productId, newQty) => {
    setUpdating(productId);
    try {
      await updateInventoryStock(productId, newQty);
      setInventory(prev => prev.map(i => i.product_id === productId ? { ...i, stock_quantity: newQty } : i));
      toast.success('Stock updated');
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setUpdating(null);
    }
  };

  const handleModalSave = (productId, newSizes, totalStock) => {
    setInventory(prev => prev.map(i => {
      if (i.product_id !== productId) return i;
      return {
        ...i,
        stock_quantity: totalStock,
        products: { ...i.products, sizes: newSizes.map(s => JSON.stringify(s)) }
      };
    }));
  };

  const filtered = inventory.filter(item => {
    const matchesSearch =
      item.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.products?.sku?.toLowerCase().includes(search.toLowerCase());
    const qty = item.stock_quantity;
    const matchesFilter =
      filter === 'all' ||
      (filter === 'low' && qty > 0 && qty <= 10) ||
      (filter === 'out' && qty === 0);
    return matchesSearch && matchesFilter;
  });

  const totalItems = inventory.length;
  const lowStock = inventory.filter(i => i.stock_quantity > 0 && i.stock_quantity <= 10).length;
  const outOfStock = inventory.filter(i => i.stock_quantity === 0).length;

  return (
    <div className="admin-inventory-dashboard fade-in">
      {modalItem && (
        <SizeStockModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSave={handleModalSave}
        />
      )}

      <div className="admin-page-header" style={{ marginBottom: '32px' }}>
        <h1>Inventory Management</h1>
      </div>

      {/* KPI Grid */}
      <div className="inventory-kpi-grid">
        <div className="admin-details-section" style={{ padding: 'var(--spacing-lg)' }}>
          <span className="inventory-kpi-label">Total Products</span>
          <span className="inventory-kpi-value">{totalItems}</span>
        </div>
        <div className="admin-details-section" style={{ padding: 'var(--spacing-lg)' }}>
          <span className="inventory-kpi-label">Low Stock (≤10)</span>
          <span className="inventory-kpi-value" style={{ color: '#ff9500' }}>{lowStock}</span>
        </div>
        <div className="admin-details-section" style={{ padding: 'var(--spacing-lg)' }}>
          <span className="inventory-kpi-label">Out of Stock</span>
          <span className="inventory-kpi-value" style={{ color: '#ff3b30' }}>{outOfStock}</span>
        </div>
        <div className="admin-details-section" style={{ padding: 'var(--spacing-lg)' }}>
          <span className="inventory-kpi-label">In Stock</span>
          <span className="inventory-kpi-value" style={{ color: '#34c759' }}>{totalItems - outOfStock}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters-bar" style={{ marginTop: '32px' }}>
        <div className="admin-search-input-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input type="text" placeholder="Search products or SKUs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="admin-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Products</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-data-table-container">
        <table className="admin-data-table inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Stock</th>
              <th style={{ textAlign: 'center' }}>Size Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '40px 0' }}><Loader /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td></tr>
            ) : (
              filtered.map((item) => {
                const qty = item.stock_quantity;
                const isUpdating = updating === item.product_id;
                const hasSizes = parseSizes(item.products?.sizes).length > 0;
                return (
                  <tr key={item.id} style={{ opacity: isUpdating ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <td>
                      <div className="table-product-cell">
                        <img src={item.products?.featured_image || 'https://via.placeholder.com/40'} alt={item.products?.name} className="table-product-image" />
                        <span className="table-product-name">{item.products?.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.products?.sku || 'N/A'}</td>
                    <td>
                      <span className={`admin-badge ${qty > 10 ? 'completed' : qty > 0 ? 'pending' : 'cancelled'}`}>
                        {qty > 10 ? 'In Stock' : qty > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <button
                          onClick={() => handleAdjust(item.product_id, -1)}
                          disabled={isUpdating || qty === 0}
                          style={{
                            width: '30px', height: '30px', borderRadius: '6px',
                            border: 'none',
                            background: qty === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)',
                            cursor: qty === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-primary)', opacity: qty === 0 ? 0.3 : 1,
                            transition: 'background 0.15s'
                          }}
                        ><Minus size={14} /></button>
                        <span style={{ fontWeight: '700', fontSize: '1.05rem', minWidth: '32px', textAlign: 'center' }}>{qty}</span>
                        <button
                          onClick={() => handleAdjust(item.product_id, 1)}
                          disabled={isUpdating}
                          style={{
                            width: '30px', height: '30px', borderRadius: '6px',
                            border: 'none',
                            background: 'rgba(255,255,255,0.12)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-primary)',
                            transition: 'background 0.15s'
                          }}
                        ><Plus size={14} /></button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setModalItem(item)}
                        title={hasSizes ? 'View & edit stock by size' : 'No sizes defined'}
                        style={{
                          background: hasSizes ? 'var(--bg-primary)' : 'transparent',
                          border: `1px solid ${hasSizes ? 'var(--border)' : 'transparent'}`,
                          borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          color: hasSizes ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '0.8rem', opacity: hasSizes ? 1 : 0.4
                        }}
                      >
                        <Eye size={15} />
                        {hasSizes ? `${parseSizes(item.products?.sizes).length} sizes` : 'No sizes'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryDashboard;
