import React from 'react';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductGrid from '../components/ProductGrid';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Marquee from '../components/Marquee';
import PromoBanner from '../components/PromoBanner';
import FAQ from '../components/FAQ';
import Lookbook from '../components/Lookbook';
import SocialWall from '../components/SocialWall';
import Reveal from '../components/Reveal';

const Home = () => {
  return (
    <>
      <Hero />
      <Reveal><FeaturedCategories /></Reveal>
      <Reveal><ProductGrid title="New Arrivals" /></Reveal>
      
      <Reveal>
        <Marquee 
          items={[
            { image: '/assets/cat_mens.png', alt: 'Mens Collection' },
            { image: '/assets/cat_womens.png', alt: 'Womens Collection' },
            { image: '/assets/cat_accessories.png', alt: 'Accessories' },
            { image: '/assets/cat_lifestyle.png', alt: 'Lifestyle' },
            { image: '/assets/premium_banner.png', alt: 'Premium Collection' }
          ]} 
          speed={20} 
          reverse={true} 
        />
      </Reveal>
      
      <Reveal><Lookbook /></Reveal>
      
      <Reveal><ProductGrid title="Best Sellers" /></Reveal>
      
      <Reveal>
        <PromoBanner 
          title="The AURA Collection"
          subtitle="Experience luxury redefined with our newest high-end apparel line."
          linkText="Explore Now"
          linkUrl="/shop"
          image="/assets/premium_banner.png"
          reverse={true}
        />
      </Reveal>
      
      <Reveal><Testimonials /></Reveal>
      <Reveal><SocialWall /></Reveal>
      <Reveal><FAQ /></Reveal>
      <Reveal><TrustBar /></Reveal>
    </>
  );
};

export default Home;
