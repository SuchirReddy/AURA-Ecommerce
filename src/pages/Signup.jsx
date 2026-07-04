import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useTheme } from '../contexts/ThemeContext';
import './Auth.css';

const Signup = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200" 
            alt="Fashion Shopping" 
            className="auth-image" 
          />
          <div className="auth-image-overlay">
            <h2>Join the AURA community.</h2>
            <p>Create an account for faster checkout, personalized recommendations, and exclusive rewards.</p>
          </div>
        </div>

        {/* Form Column */}
        <div className="auth-form-column" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SignUp 
            routing="path" 
            path="/signup"
            fallbackRedirectUrl="/" 
            signInUrl="/login"
            appearance={{
              baseTheme: isDark ? dark : undefined,
              variables: {
                colorBackground: 'transparent',
                colorPrimary: '#6366f1',
                colorTextOnPrimaryBackground: '#ffffff',
                colorText: isDark ? '#f5f5f7' : '#1d1d1f',
                colorTextSecondary: '#86868b',
                colorInputBackground: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                colorInputText: isDark ? '#f5f5f7' : '#1d1d1f',
                borderRadius: '12px',
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
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
                  borderRadius: '12px',
                  height: '52px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  letterSpacing: '0.02em',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
                  border: 'none',
                },
                formFieldInput: {
                  borderRadius: '12px',
                  height: '52px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  color: isDark ? '#f5f5f7' : '#1d1d1f',
                },
                footerActionLink: {
                  color: '#6366f1',
                  fontWeight: '600',
                },
                socialButtonsBlockButton: {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  height: '52px',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)',
                  color: isDark ? '#f5f5f7' : '#1d1d1f',
                },
                dividerLine: {
                  background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
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

export default Signup;
