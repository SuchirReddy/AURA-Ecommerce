import React from 'react';
import { Star } from 'lucide-react';
import './TestimonialMarquee.css';

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    initial: "P",
    text: "The quality of the trench coat is absolutely stunning. It feels like a true luxury piece without the outrageous price tag. Will definitely shop here again!",
    role: "Verified Buyer"
  },
  {
    id: 2,
    name: "Arjun Desai",
    initial: "A",
    text: "Customer service is top-notch and the delivery was incredibly fast. The sustainable materials they use are a huge plus for me.",
    role: "Verified Buyer"
  },
  {
    id: 3,
    name: "Sneha Reddy",
    initial: "S",
    text: "I am obsessed with the premium leather tote! It easily fits my laptop and looks incredibly chic for the office. Five stars.",
    role: "Verified Buyer"
  },
  {
    id: 4,
    name: "Vikram Singh",
    initial: "V",
    text: "Perfect fit and amazing fabric quality. I've washed the ribbed turtleneck several times and it still looks brand new.",
    role: "Verified Buyer"
  },
  {
    id: 5,
    name: "Ananya Patel",
    initial: "A",
    text: "The AURA Collection completely exceeded my expectations. Beautiful packaging, ethically sourced, and just gorgeous apparel.",
    role: "Verified Buyer"
  }
];

const TestimonialMarquee = () => {
  // Duplicate the array to create a seamless infinite scroll effect
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="testimonial-marquee-section">
      <div className="tm-header">
        <h2 className="tm-title">Loved by Thousands</h2>
      </div>
      
      <div className="tm-track-container">
        <div className="tm-track">
          {doubledTestimonials.map((t, index) => (
            <div key={`${t.id}-${index}`} className="tm-card">
              <div className="tm-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" color="var(--accent)" />
                ))}
              </div>
              <p className="tm-text">"{t.text}"</p>
              <div className="tm-author">
                <div className="tm-avatar">{t.initial}</div>
                <div className="tm-author-info">
                  <span className="tm-author-name">{t.name}</span>
                  <span className="tm-author-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialMarquee;
