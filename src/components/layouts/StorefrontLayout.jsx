import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import MobileFloatingBar from './MobileFloatingBar';

const StorefrontLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <MobileFloatingBar />
    </>
  );
};

export default StorefrontLayout;
