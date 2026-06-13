import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <img src="/logo-white.png" alt="AURA Logo" className="footer-logo-img" />
          </a>
          <p className="footer-description">
            Redefining modern minimalism. Premium quality apparel and accessories for the everyday.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-link" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" className="social-link" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="social-link" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Shop</h4>
          <a href="#" className="footer-link">New Arrivals</a>
          <a href="#" className="footer-link">Best Sellers</a>
          <a href="#" className="footer-link">Men</a>
          <a href="#" className="footer-link">Women</a>
          <a href="#" className="footer-link">Accessories</a>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Company</h4>
          <a href="#" className="footer-link">About Us</a>
          <a href="#" className="footer-link">Careers</a>
          <a href="#" className="footer-link">Stores</a>
          <a href="#" className="footer-link">Journal</a>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Support</h4>
          <a href="/track" className="footer-link">Track Order</a>
          <a href="#" className="footer-link">Contact</a>
          <a href="#" className="footer-link">FAQ</a>
          <a href="#" className="footer-link">Shipping & Returns</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Privacy Policy</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} AURA. All rights reserved.</p>
        <div className="footer-bottom-links">
        </div>
      </div>
    </footer>
  );
};

export default Footer;
