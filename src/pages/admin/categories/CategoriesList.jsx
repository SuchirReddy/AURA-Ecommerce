import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { getCategories, deleteCategory } from '../../../services/productService';
import Loader from '../../../components/Loader';
import '../AdminTables.css';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <div className="admin-categories-list fade-in">
      <div className="admin-list-header">
        <h1>Categories</h1>
        <Link to="/admin/categories/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <Plus size={18} /> Add Category
        </Link>
      </div>

      <div className="admin-filters-bar">
        <div className="admin-search-input-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input type="text" placeholder="Search categories..." />
        </div>
        <select className="admin-filter-select">
          <option>Status</option>
          <option>active</option>
          <option>inactive</option>
        </select>
      </div>

      <div className="admin-data-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" className="table-checkbox" /></th>
              <th>Category Name</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '40px 0' }}><Loader /></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No categories found.</td></tr>
            ) : (
              categories.map(category => (
                <tr key={category.id}>
                  <td><input type="checkbox" className="table-checkbox" /></td>
                  <td>
                    <div className="table-product-cell">
                      <div className="table-product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                        {category.name.substring(0, 3)}
                      </div>
                      <div>
                        <Link to={`/admin/categories/edit/${category.id}`} className="table-product-name">{category.name}</Link>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{category.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${category.status === 'active' ? 'completed' : 'pending'}`}>
                      {category.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/admin/categories/edit/${category.id}`} className="table-action-btn" title="Edit"><Edit size={16} /></Link>
                      <button onClick={() => handleDelete(category.id)} className="table-action-btn delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesList;
