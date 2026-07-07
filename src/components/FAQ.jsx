import React, { useState } from 'react';
import './FAQ.css';

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unworn and unwashed items with tags attached. Premium collection items have a 14-day return window."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship worldwide! Shipping costs and delivery times vary depending on the destination. You can view the exact shipping cost at checkout."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, you will receive an email with a tracking number and a link to track your package on our website."
  },
  {
    question: "Are your materials sustainable?",
    answer: "Sustainability is at the core of our brand. We use organic cotton, recycled polyester, and ethically sourced materials for our entire collection."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section section container">
      <div className="faq-header">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">Everything you need to know about the product and billing.</p>
      </div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'active' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              <h3>{faq.question}</h3>
              <span className="faq-icon">
                {openIndex === index ? '−' : '+'}
              </span>
            </div>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
