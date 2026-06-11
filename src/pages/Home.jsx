import React from 'react';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductGrid from '../components/ProductGrid';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import PromoCarousel from '../components/PromoCarousel';

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <PromoCarousel settingsKey="homepage_promo_banners" />
      <ProductGrid title="New Arrivals" />
      <PromoCarousel settingsKey="homepage_promo_banners_middle" />
      <ProductGrid title="Best Sellers" />
      <Testimonials />
      <Newsletter />
    </>
  );
};

export default Home;
