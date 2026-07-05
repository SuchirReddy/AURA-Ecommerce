import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings } from '../services/contentService';
import './Hero.css';

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <section className="hero-split">
        <div className="hero-side hero-left">
          <img
            src="/hero-left.png"
            alt="Men's New Season"
            className="hero-img"
            style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.3)` }}
          />
        </div>
        <div className="hero-side hero-right">
          <img
            src="/hero-right.png"
            alt="Men's Essentials"
            className="hero-img"
            style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.7)` }}
          />
        </div>

        <div className="hero-center-content fade-up">
          <h1 className="hero-logo-text">aura<span className="hero-dot">.</span></h1>
        </div>

        <div className="hero-bottom-center fade-up-delayed">
          <Link to="/shop" className="btn-shop-now">
            Shop Now <ArrowRight size={20} className="btn-arrow" />
          </Link>
          <div className="hero-scroll-indicator" onClick={scrollToNext}>
            <span>Scroll down to see more</span>
            <ChevronDown size={20} />
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
