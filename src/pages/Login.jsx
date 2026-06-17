import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import './Auth.css';

const Login = () => {
  return (
    <div className="auth-page">

      {/* Floating Particles */}
      <div className="auth-particles">
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
      </div>

      {/* Mobile Brand Badge */}
      <div className="auth-brand-badge">
        <span className="auth-brand-name">AURA</span>
      </div>

      <div className="auth-split-layout">
        
        {/* Image Column */}
        <div className="auth-image-column">
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" 
            alt="Fashion Model" 
            className="auth-image" 
          />
          <div className="auth-image-overlay">
            <h2>Welcome back to AURA.</h2>
            <p>Log in to access your personalized shopping experience, track orders, and discover new arrivals.</p>
          </div>
        </div>

        {/* Form Column */}
        <div className="auth-form-column" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SignIn 
            routing="path" 
            path="/login"
            fallbackRedirectUrl="/" 
            signUpUrl="/signup" 
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: 'transparent',
                colorPrimary: '#6366f1',
                colorTextOnPrimaryBackground: '#ffffff',
                colorText: '#f5f5f7',
                colorTextSecondary: '#86868b',
                colorInputBackground: 'rgba(255, 255, 255, 0.04)',
                colorInputText: '#f5f5f7',
                borderRadius: '8px',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              },
              elements: {
                rootBox: {
                  width: '100%',
                  maxWidth: '420px',
                },
                cardBox: {
                  boxShadow: 'none',
                },
                card: {
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                  padding: '0',
                },
                headerTitle: {
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  letterSpacing: '-0.03em',
                },
                headerSubtitle: {
                  color: '#86868b',
                  fontSize: '1rem',
                },
                formButtonPrimary: {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                  borderRadius: '8px',
                  height: '48px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                },
                formFieldInput: {
                  borderRadius: '8px',
                  height: '48px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                },
                footerActionLink: {
                  color: '#6366f1',
                  fontWeight: '600',
                },
                socialButtonsBlockButton: {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  height: '48px',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)',
                },
                dividerLine: {
                  background: 'rgba(255, 255, 255, 0.08)',
                },
                dividerText: {
                  color: '#86868b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.8rem',
                },
                formFieldLabel: {
                  color: '#86868b',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                },
                identityPreviewEditButton: {
                  color: '#6366f1',
                },
              }
            }}
          />
        </div>
        
      </div>
    </div>
  );
};

export default Login;
