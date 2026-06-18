import React, { useState, useEffect } from 'react';
import { Eye, Save, Loader, Upload, X, ImagePlus, ChevronDown, ChevronUp } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '../../../services/contentService';
import ImageUploader from '../../../components/ImageUploader';
import toast from 'react-hot-toast';
import '../AdminForms.css';

const CollapsibleSection = ({ title, desc, defaultCollapsed = false, children, headerRight }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div className="admin-form-section" style={{ marginBottom: '24px' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: collapsed ? '0' : '20px', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>{title}</h2>
          {desc && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{desc}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {headerRight && <div onClick={e => e.stopPropagation()}>{headerRight}</div>}
          <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
            {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>
      {!collapsed && <div>{children}</div>}
    </div>
  );
};

const ContentManager = () => {
  const [settings, setSettings] = useState({
    hero_badge: '',
    hero_title: '',
    hero_subtitle: '',
    hero_cta_primary: '',
    hero_cta_primary_url: '',
    hero_cta_secondary: '',
    hero_banner_image: '',
    hero_enabled: 'true',
    announcement_text: '',
    announcement_enabled: 'true'
  });
  const [promoBanners, setPromoBanners] = useState([]);
  const [promoBannersMiddle, setPromoBannersMiddle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(prev => ({ ...prev, ...data }));
        if (data.homepage_promo_banners) {
          try {
            setPromoBanners(JSON.parse(data.homepage_promo_banners));
          } catch(e) { console.error('Failed to parse promo banners'); }
        } else {
          setPromoBanners([
            { id: '1', title: 'Summer Collection 2026', subtitle: 'Discover our newest premium apparel designed for the modern minimalist. Enjoy up to 20% off selected summer styles.', linkText: 'Shop Summer', linkUrl: '/shop?category=summer', image: '/assets/banner_summer.png', reverseLayout: false }
          ]);
        }
        
        if (data.homepage_promo_banners_middle) {
          try {
            setPromoBannersMiddle(JSON.parse(data.homepage_promo_banners_middle));
          } catch(e) { console.error('Failed to parse middle promo banners'); }
        } else {
          setPromoBannersMiddle([
            { id: '2', title: 'Elevated Essentials', subtitle: 'Complete your look with our curated selection of luxury watches and designer sunglasses.', linkText: 'Explore Accessories', linkUrl: '/shop?category=accessories', image: '/assets/banner_accessories.png', reverseLayout: true }
          ]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load content settings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { 
        ...settings, 
        homepage_promo_banners: JSON.stringify(promoBanners),
        homepage_promo_banners_middle: JSON.stringify(promoBannersMiddle)
      };
      await updateSiteSettings(payload);
      toast.success('Content saved! Changes are live.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const handleAddBanner = (type) => {
    const setter = type === 'middle' ? setPromoBannersMiddle : setPromoBanners;
    setter(prev => [...prev, {
      id: Date.now().toString(),
      title: '', subtitle: '', linkText: '', linkUrl: '', image: '', reverseLayout: false
    }]);
  };

  const handleRemoveBanner = (type, id) => {
    const setter = type === 'middle' ? setPromoBannersMiddle : setPromoBanners;
    setter(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateBanner = (type, id, field, value) => {
    const setter = type === 'middle' ? setPromoBannersMiddle : setPromoBanners;
    setter(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  // Removed handleUploadBannerImage since ImageUploader handles it natively

  const renderCarouselEditor = (title, desc, type, bannersList) => (
    <CollapsibleSection 
      title={title} 
      desc={desc}
      defaultCollapsed={true}
      headerRight={<button className="btn-secondary" onClick={() => handleAddBanner(type)}>Add Banner</button>}
    >

      {bannersList.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
          No banners added yet. Click "Add Banner" to create one.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {bannersList.map((banner, index) => (
          <div key={banner.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500' }}>Slide {index + 1}</span>
              <button onClick={() => handleRemoveBanner(type, banner.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            
            {banner.image ? (
              <div style={{ position: 'relative', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <button onClick={() => handleUpdateBanner(type, banner.id, 'image', '')} style={{ padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer' }}><X size={14}/></button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <ImageUploader 
                  folder="banners"
                  compact={true}
                  buttonText="Upload banner image"
                  onUploadComplete={(url) => handleUpdateBanner(type, banner.id, 'image', url)}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <input type="text" className="form-input" placeholder="Title" value={banner.title} onChange={e => handleUpdateBanner(type, banner.id, 'title', e.target.value)} />
              <textarea className="form-input" placeholder="Subtitle" rows="2" value={banner.subtitle} onChange={e => handleUpdateBanner(type, banner.id, 'subtitle', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" className="form-input" placeholder="Button Text" value={banner.linkText} onChange={e => handleUpdateBanner(type, banner.id, 'linkText', e.target.value)} />
                <input type="text" className="form-input" placeholder="Button Link (/shop)" value={banner.linkUrl} onChange={e => handleUpdateBanner(type, banner.id, 'linkUrl', e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={banner.reverseLayout} onChange={e => handleUpdateBanner(type, banner.id, 'reverseLayout', e.target.checked)} />
                Reverse Layout (Image on Left)
              </label>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading content settings...</div>;

  return (
    <div className="admin-content-manager fade-in">
      <div className="admin-form-header">
        <div className="admin-form-header-left">
          <h1>Content Manager</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Edit your storefront content. Changes go live instantly after saving.
          </p>
        </div>
        <div className="admin-form-actions">
          <button className="btn-secondary" onClick={handlePreview} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={16} /> Preview
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {saving ? <Loader size={16} className="spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="admin-form-layout">

        {/* Main Column */}
        <div className="admin-form-main">

          {/* Hero Section */}
          <CollapsibleSection 
            title="Hero Banner" 
            desc="The main banner visitors see first on the homepage"
            defaultCollapsed={true}
            headerRight={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: settings.hero_enabled === 'true' ? '#34c759' : 'var(--text-secondary)' }}>
                  {settings.hero_enabled === 'true' ? 'Visible' : 'Hidden'}
                </span>
                <div
                  onClick={() => handleChange('hero_enabled', settings.hero_enabled === 'true' ? 'false' : 'true')}
                  style={{
                    width: '36px', height: '20px', borderRadius: '10px',
                    background: settings.hero_enabled === 'true' ? '#34c759' : 'var(--border)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px',
                    left: settings.hero_enabled === 'true' ? '18px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }} />
                </div>
              </div>
            }
          >

            {/* Banner Image Upload */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Banner Background Image</label>
              {settings.hero_banner_image ? (
                <>
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '12px' }}>
                    <img
                      src={settings.hero_banner_image}
                      alt="Banner"
                      style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleChange('hero_banner_image', '')}
                        style={{
                          padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          background: 'rgba(255,59,48,0.8)', color: '#fff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}
                      ><X size={14} /></button>
                    </div>
                  </div>
                  <ImageUploader 
                    folder="banners"
                    compact={true}
                    buttonText="Replace Banner Background"
                    onUploadComplete={(url) => {
                      handleChange('hero_banner_image', url);
                      toast.success('Banner uploaded');
                    }}
                  />
                </>
              ) : (
                <ImageUploader 
                  folder="banners"
                  buttonText="Click or drag to upload banner image"
                  onUploadComplete={(url) => {
                    handleChange('hero_banner_image', url);
                    toast.success('Banner uploaded');
                  }}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Badge Text</label>
              <input
                type="text" className="form-input"
                value={settings.hero_badge}
                onChange={e => handleChange('hero_badge', e.target.value)}
                placeholder="e.g. New Collection"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                Small label above the main headline
              </span>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Headline</label>
              <input
                type="text" className="form-input"
                value={settings.hero_title}
                onChange={e => handleChange('hero_title', e.target.value)}
                placeholder="e.g. Elevate Your Everyday Style."
              />
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Subtitle</label>
              <textarea
                className="form-input" rows="3"
                value={settings.hero_subtitle}
                onChange={e => handleChange('hero_subtitle', e.target.value)}
                placeholder="A short description below the headline"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px dashed var(--border)', paddingTop: '20px' }}>
              <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Call to Action Buttons</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Primary Button Text</label>
                  <input
                    type="text" className="form-input"
                    value={settings.hero_cta_primary}
                    onChange={e => handleChange('hero_cta_primary', e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Button Link</label>
                  <input
                    type="text" className="form-input"
                    value={settings.hero_cta_primary_url}
                    onChange={e => handleChange('hero_cta_primary_url', e.target.value)}
                    placeholder="/shop"
                  />
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Secondary Button Text</label>
                <input
                  type="text" className="form-input"
                  value={settings.hero_cta_secondary}
                  onChange={e => handleChange('hero_cta_secondary', e.target.value)}
                  placeholder="e.g. Explore Lookbook"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Promotional Carousel Top Section */}
          {renderCarouselEditor("Top Promotional Carousel", "Manage the sliding banners displayed below the Featured Categories", "top", promoBanners)}

          {/* Promotional Carousel Middle Section */}
          {renderCarouselEditor("Middle Promotional Carousel", "Manage the sliding banners displayed between New Arrivals and Best Sellers", "middle", promoBannersMiddle)}
        </div>

        {/* Sidebar Column */}
        <div className="admin-form-sidebar">

          {/* Announcement Bar */}
          <CollapsibleSection title="Announcement Bar" desc="Appears at the top of every page" defaultCollapsed={true}>
            <div className="form-group">
              <label className="form-label">Announcement Text</label>
              <input
                type="text" className="form-input"
                value={settings.announcement_text}
                onChange={e => handleChange('announcement_text', e.target.value)}
                placeholder="Free shipping on orders over ₹5000"
              />
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', fontSize: '0.95rem', userSelect: 'none'
              }}>
                <div
                  onClick={() => handleChange('announcement_enabled', settings.announcement_enabled === 'true' ? 'false' : 'true')}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    background: settings.announcement_enabled === 'true' ? '#34c759' : 'var(--border)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#fff', position: 'absolute', top: '2px',
                    left: settings.announcement_enabled === 'true' ? '22px' : '2px',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }} />
                </div>
                <span>Show Announcement Bar</span>
              </label>
            </div>
          </CollapsibleSection>

          {/* Quick Tips */}
          <div className="admin-form-section" style={{ background: 'rgba(0,122,255,0.05)', border: '1px solid rgba(0,122,255,0.15)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '8px', color: '#007aff' }}>💡 Tips</h3>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
              <li>Keep the headline under 8 words</li>
              <li>Use action verbs in CTAs</li>
              <li>Announcement bars boost engagement by 15%</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContentManager;
