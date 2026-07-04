import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page container section">

      {/* Header */}
      <div className="contact-header text-center">
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-subtitle">Whether you have a question about our collections, sizing, or an existing order, our team is here to help.</p>
      </div>

      <div className="contact-grid">

        {/* Left Side: Contact Information & Map */}
        <div className="contact-info-column">

          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon-wrapper">
                <MapPin size={24} />
              </div>
              <div className="info-content">
                <h3>AURA Headquarters</h3>
                <p>HITEC City<br />Hyderabad, Telangana 500081<br />India</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-wrapper">
                <Phone size={24} />
              </div>
              <div className="info-content">
                <h3>Phone</h3>
                <p>+91 9898XX0000</p>
                <span className="info-subtext">Mon-Sat, 10am to 7pm IST</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-wrapper">
                <Mail size={24} />
              </div>
              <div className="info-content">
                <h3>Email</h3>
                <p>support@aura.in</p>
                <span className="info-subtext">We'll respond within 24 hours</span>
              </div>
            </div>
          </div>

          <div className="map-container">
            <iframe
              src="https://maps.google.com/maps?q=HITEC%20City,%20Hyderabad,%20Telangana&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="AURA Headquarters Map"
            ></iframe>
          </div>

        </div>

        {/* Right Side: Contact Form */}
        <div className="contact-form-column">
          <div className="contact-form-card">
            <h2>Send us a Message</h2>
            <p className="form-description">Fill out the form below and we will get back to you as soon as possible.</p>

            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" placeholder="John Doe" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="john@example.com" required />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" required>
                  <option value="">Select a subject...</option>
                  <option value="order">Order Inquiry</option>
                  <option value="returns">Returns & Exchanges</option>
                  <option value="sizing">Sizing & Fit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="How can we help you?" required></textarea>
              </div>

              <button type="submit" className="btn-primary form-submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
