import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/productService';
import Marquee from './Marquee';
import './FeaturedCategories.css';

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);

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

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || isInteracting) return;

    let animationId;
    const scrollStep = 0.5; // pixels per frame
    let scrollAccumulator = 0; // stores sub-pixel values

    const autoScroll = () => {
      if (slider) {
        scrollAccumulator += scrollStep;
        if (scrollAccumulator >= 1) {
          const pixelsToScroll = Math.floor(scrollAccumulator);
          slider.scrollLeft += pixelsToScroll;
          scrollAccumulator -= pixelsToScroll;
        }
        
        // If scrolled past half (the first original set), reset to 0 seamlessly
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationId);
  }, [isInteracting, categories]);

  if (loading || categories.length === 0) {
    return null;
  }

  const categoryCards = categories.map((category, index) => {
    let imageSrc = '/assets/cat_lifestyle.png';
    const catName = category.name.toLowerCase();
    if (catName.includes('women')) {
      imageSrc = '/assets/cat_womens.png';
    } else if (catName.includes('men')) {
      imageSrc = '/assets/cat_mens.png';
    } else if (catName.includes('accessori')) {
      imageSrc = '/assets/cat_accessories.png';
    }
    return (
    <Link 
      to="/shop" 
      key={`${category.id}-${index}`} 
      className="category-card"
    >
      <div className="category-image-wrapper">
        <img src={imageSrc} alt={category.name} className="category-image" />
        <div className="category-overlay"></div>
      </div>
      <div className="category-content">
        <h3 className="category-name">{category.name}</h3>
        <span className="category-link">Explore &rarr;</span>
      </div>
    </Link>
    );
  });

  return (
    <section className="section featured-categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
        </div>
      </div>
      
      <div 
        className="categories-slider" 
        ref={sliderRef}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsInteracting(false), 2000); // Resume auto-scroll after 2s
        }}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
      >
        {/* Duplicate cards for seamless infinite scroll effect */}
        {categoryCards}
        {categoryCards}
        {categoryCards}
        {categoryCards}
      </div>
    </section>
  );
};

export default FeaturedCategories;
