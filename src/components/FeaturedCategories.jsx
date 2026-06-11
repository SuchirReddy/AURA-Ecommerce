import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/productService';
import './FeaturedCategories.css';

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // Take up to 4 categories for the featured grid
        setCategories(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <section className="section featured-categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
        </div>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              to="/shop" 
              key={category.id} 
              className="category-card"
            >
              <div className="category-image-wrapper">
                <img src={category.image_url || category.banner_url || 'https://via.placeholder.com/800x400?text=Category'} alt={category.name} className="category-image" />
                <div className="category-overlay"></div>
              </div>
              <div className="category-content">
                <h3 className="category-name">{category.name}</h3>
                <span className="category-link">Explore &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
