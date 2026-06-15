import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/shop/Breadcrumbs';
import ProductGallery from '../components/product/ProductGallery';
import ProductInfo from '../components/product/ProductInfo';
import ProductTabs from '../components/product/ProductTabs';
import ProductGrid from '../components/ProductGrid';
import { getProductById } from '../services/productService';
import { getProductReviewStats, getProductReviews } from '../services/reviewService';
import { syncUserProfile, toggleWishlist, getWishlist } from '../services/userService';
import { addToCart } from '../services/cartService';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      setLoading(true);
      try {
        const [data, reviewStats, reviewList] = await Promise.all([
          getProductById(id),
          getProductReviewStats(id),
          getProductReviews(id)
        ]);
        
        // Parse sizes if they are JSON strings (since DB column is TEXT[])
        let parsedSizes = [];
        if (Array.isArray(data.sizes) && data.sizes.length > 0) {
          parsedSizes = data.sizes.map(sizeStr => {
            if (typeof sizeStr === 'string' && sizeStr.startsWith('{')) {
              try {
                return JSON.parse(sizeStr);
              } catch (e) {
                return sizeStr;
              }
            }
            return sizeStr;
          });
        } else {
          parsedSizes = [{ size: 'One Size', stock: data.stock_quantity || 1 }];
        }

        // Parse colors from TEXT[] or JSON
        let parsedColors = [];
        if (Array.isArray(data.colors)) {
          parsedColors = data.colors.map(cStr => {
            if (typeof cStr === 'string' && cStr.startsWith('{')) {
              try { return JSON.parse(cStr); } catch (e) { return { name: cStr, hex: '#000000' }; }
            }
            if (typeof cStr === 'string') return { name: cStr, hex: '#000000' };
            return cStr;
          });
        }
        
        // Enrich data with placeholder UI elements that don't exist in schema yet
        const enrichedProduct = {
          ...data,
          rating: reviewStats.averageRating,
          reviewsCount: reviewStats.reviewCount,
          category: data.categories?.name || 'Uncategorized',
          images: [
            data.featured_image || 'https://via.placeholder.com/1000x1200?text=No+Image',
            ...(data.gallery_images || [])
          ],
          colors: parsedColors.length > 0 ? parsedColors : [{ name: 'Standard', hex: '#e2e2e2' }],
          sizes: parsedSizes
        };
        
        setProduct(enrichedProduct);
        setReviews(reviewList);

        // Fetch wishlist if user is logged in
        if (user) {
          const profile = await syncUserProfile(user);
          setUserProfile(profile);
          if (profile?.id) {
            const wishlistItems = await getWishlist(profile.id);
            setIsWishlisted(wishlistItems.some(item => item.product_id === id));
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductAndWishlist();
  }, [id, user]);

  const handleWishlistToggle = async () => {
    if (!user || !userProfile) {
      navigate('/login');
      return;
    }
    try {
      const added = await toggleWishlist(userProfile.id, id);
      setIsWishlisted(added);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleAddToCart = async (productId, quantity, size, color) => {
    const uid = userProfile ? userProfile.id : null;
    try {
      await addToCart(uid, productId, quantity, size, color);
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart: " + (error.message || "Unknown error"));
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      if (window.scrollY > 800) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  if (loading) {
    return <div style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading product details...</div>;
  }

  if (!product) {
    return <div style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Product not found. <Link to="/shop" style={{color: 'var(--accent)'}}>Return to shop</Link></div>;
  }

  return (
    <div className="pdp-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="pdp-breadcrumbs">
          <Breadcrumbs 
            paths={[{ name: 'Home', link: '/' }, { name: 'Shop', link: '/shop' }, { name: product.category, link: '/shop' }]} 
            current={product.name} 
          />
        </div>

        {/* Main Product Section */}
        <div className="pdp-main">
          <div className="pdp-gallery-column">
            <ProductGallery 
              images={product.images} 
              isWishlisted={isWishlisted} 
              onWishlistToggle={handleWishlistToggle} 
            />
          </div>
          <div className="pdp-info-column">
            <ProductInfo 
              product={product} 
              onAddToCart={handleAddToCart}
            />
            <ProductTabs product={product} reviews={reviews} />
          </div>
        </div>

      </div>

      {/* Cross-Selling Sections */}
      <div className="pdp-cross-sell">
        <ProductGrid title="Related Products" maxItems={4} />
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className={`pdp-mobile-sticky-bar ${showStickyBar ? 'visible' : ''}`}>
        <div className="sticky-bar-info">
          <span className="sticky-price">₹{product.sale_price || product.price}</span>
        </div>
        <button className="btn-primary sticky-add-btn">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductDetails;
