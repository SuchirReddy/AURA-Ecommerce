import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { getProducts } from '../services/productService';
import './ProductGrid.css';

const ProductGrid = ({ title, maxItems = 4 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({ status: 'published' });
        setProducts(data.slice(0, maxItems));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [maxItems]);

  if (loading) {
    return (
      <section className="section product-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{title}</h2>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading products...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render empty grids
  }

  return (
    <section className="section product-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <Link to="/shop" className="view-all-link">View All</Link>
        </div>
        
        <div className="product-grid">
          {products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
              <div className="product-image-container">
                <img src={product.featured_image || 'https://via.placeholder.com/400x500?text=No+Image'} alt={product.name} className="product-image" />
                <button className="add-to-cart-btn" onClick={(e) => { e.preventDefault(); /* TODO Cart */ }}>
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>
              </div>
              <div className="product-info">
                <span className="product-category">{product.categories?.name || 'Uncategorized'}</span>
                <h3 className="product-name">{product.name}</h3>
                {product.sale_price ? (
                  <>
                    <span className="product-price" style={{ color: 'var(--error)' }}>₹{product.sale_price}</span>
                    <span className="product-price" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '0.9em' }}>₹{product.price}</span>
                  </>
                ) : (
                  <span className="product-price">₹{product.price}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
