import React from 'react';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductGrid from '../components/ProductGrid';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import PromoCarousel from '../components/PromoCarousel';
import PromoBanner from '../components/PromoBanner';

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <PromoCarousel settingsKey="homepage_promo_banners" />
      <ProductGrid title="New Arrivals" />
      <PromoCarousel settingsKey="homepage_promo_banners_middle" />
      <ProductGrid title="Best Sellers" />
      <PromoBanner 
        title="The AURA Collection"
        subtitle="Experience luxury redefined with our newest high-end apparel line."
        linkText="Explore Now"
        linkUrl="/shop"
        image="/premium_banner_bottom.png"
        reverse={true}
      />
      <Testimonials />
      <Newsletter />
    </>
  );
};

export default Home;
