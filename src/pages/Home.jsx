import React from 'react';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductGrid from '../components/ProductGrid';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Marquee from '../components/Marquee';
import PromoBanner from '../components/PromoBanner';

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <ProductGrid title="New Arrivals" />
      
      <Marquee 
        items={[
          { image: '/assets/cat_mens.png', alt: 'Mens Collection' },
          { image: '/assets/cat_womens.png', alt: 'Womens Collection' },
          { image: '/assets/cat_accessories.png', alt: 'Accessories' },
          { image: '/assets/cat_lifestyle.png', alt: 'Lifestyle' },
          { image: '/assets/premium_banner.png', alt: 'Premium Collection' }
        ]} 
        speed={40} 
        reverse={true} 
      />
      
      <ProductGrid title="Best Sellers" />
      <PromoBanner 
        title="The AURA Collection"
        subtitle="Experience luxury redefined with our newest high-end apparel line."
        linkText="Explore Now"
        linkUrl="/shop"
        image="/assets/premium_banner.png"
        reverse={true}
      />
      <Testimonials />
    </>
  );
};

export default Home;
