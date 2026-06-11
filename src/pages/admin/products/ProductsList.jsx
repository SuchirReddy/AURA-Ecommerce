import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { getProducts, deleteProduct } from '../../../services/productService';
import '../AdminTables.css';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="admin-products-list fade-in">
      <div className="admin-list-header">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="admin-filters-bar">
        <div className="admin-search-input-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input type="text" placeholder="Search products..." />
        </div>
        <select className="admin-filter-select">
          <option>All Categories</option>
        </select>
        <select className="admin-filter-select">
          <option>Status</option>
          <option>published</option>
          <option>draft</option>
          <option>archived</option>
        </select>
        <button className="btn-secondary" style={{ marginLeft: 'auto' }}>More Filters</button>
      </div>

      <div className="admin-data-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" className="table-checkbox" /></th>
              <th>Product</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Category</th>
              <th>Price</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td><input type="checkbox" className="table-checkbox" /></td>
                  <td>
                    <div className="table-product-cell">
                      {product.featured_image ? (
                        <img src={product.featured_image} alt={product.name} className="table-product-image" />
                      ) : (
                        <div className="table-product-image" style={{ backgroundColor: '#333' }}></div>
                      )}
                      <Link to={`/admin/products/edit/${product.id}`} className="table-product-name">{product.name}</Link>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${product.status === 'published' ? 'completed' : 'pending'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>{product.stock_quantity} in stock</td>
                  <td>{product.categories?.name || 'Uncategorized'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {product.sale_price ? (
                        <>
                          <span style={{ fontWeight: '600', color: '#34c759' }}>₹{product.sale_price}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>₹{product.price}</span>
                        </>
                      ) : (
                        <span style={{ fontWeight: '500' }}>₹{product.price}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/admin/products/edit/${product.id}`} className="table-action-btn" title="Edit"><Edit size={16} /></Link>
                      <button onClick={() => handleDelete(product.id)} className="table-action-btn delete" title="Delete"><Trash2 size={16} /></button>
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

export default ProductsList;
