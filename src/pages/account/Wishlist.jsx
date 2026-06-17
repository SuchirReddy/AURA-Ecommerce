import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile, getWishlist, toggleWishlist } from '../../services/userService';
import Loader from '../../components/Loader';

const Wishlist = () => {
  const { user } = useUser();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const userProfile = await syncUserProfile(user);
        setProfileId(userProfile?.id);
        if (userProfile?.id) {
          const data = await getWishlist(userProfile.id);
          setWishlistItems(data || []);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId) => {
    if (!profileId) return;
    try {
      await toggleWishlist(profileId, productId);
      setWishlistItems(wishlistItems.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="wishlist-page fade-in">
      <h1 className="account-section-title">Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Your wishlist is empty.</div>
      ) : (
        <div className="product-grid" style={{ marginTop: '0' }}>
          {wishlistItems.map((item) => {
            const product = item.products;
            if (!product) return null;
            return (
              <div key={item.id} className="product-card">
                <div className="product-image-container">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.featured_image || 'https://via.placeholder.com/400x500?text=No+Image'} alt={product.name} className="product-image primary" />
                  </Link>
                  <button 
                    className="wishlist-btn active" 
                    aria-label="Remove from wishlist"
                    onClick={() => handleRemove(product.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                  {product.sale_price && <span className="product-badge sale">Sale</span>}
                </div>
                
                <div className="product-info">
                  <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
                  <div className="product-price">
                    {product.sale_price ? (
                      <>
                        <span className="current-price">₹{product.sale_price}</span>
                        <span className="original-price">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="current-price">₹{product.price}</span>
                    )}
                  </div>
                </div>

                <button className="btn-secondary" style={{ width: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
