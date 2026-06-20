import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { getProducts } from '../services/productService';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addToCart } from '../services/cartService';
import { syncUserProfile } from '../services/userService';
import './ProductGrid.css';

const ProductGrid = ({ title, maxItems = 4 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      let uid = null;
      if (user) {
        const profile = await syncUserProfile(user);
        if (profile) uid = profile.id;
      }
      
      const sizeStr = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null;
      let size = sizeStr;
      if (typeof sizeStr === 'string' && sizeStr.startsWith('{')) {
        try { size = JSON.parse(sizeStr); } catch(err){}
      }
      
      const colorStr = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null;
      let color = colorStr;
      if (typeof colorStr === 'string' && colorStr.startsWith('{')) {
        try { color = JSON.parse(colorStr); } catch(err){}
      } else if (typeof colorStr === 'string') {
        color = { name: colorStr, hex: '#000000' };
      }

      await addToCart(uid, product.id, 1, size, color);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts({ status: 'published' });
        setProducts(result.data.slice(0, maxItems));
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
                <button className="add-to-cart-btn" onClick={(e) => handleAddToCart(e, product)}>
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
