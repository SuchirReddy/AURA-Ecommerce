import { supabase } from '../lib/supabase';

const DEFAULTS = {
  hero_badge: 'New Collection',
  hero_title: 'Elevate Your Everyday Style.',
  hero_subtitle: 'Discover the new standard of modern minimalism. Designed for those who appreciate the finer details.',
  hero_cta_primary: 'Shop the Collection',
  hero_cta_primary_url: '/shop',
  hero_cta_secondary: 'Explore Lookbook',
  hero_banner_image: '',
  announcement_text: 'Free shipping on orders over ₹5000',
  announcement_enabled: 'true'
};

export const getSiteSettings = async () => {
  const { data, error } = await supabase.from('site_settings').select('*');
  
  // If table doesn't exist, return defaults silently
  if (error) {
    console.warn('site_settings table not found, using defaults:', error.message);
    return { ...DEFAULTS };
  }

  // Convert rows to { key: value }
  const settings = (data || []).reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  return { ...DEFAULTS, ...settings };
};

export const updateSiteSetting = async (key, value) => {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date() }, { onConflict: 'key' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateSiteSettings = async (settings) => {
  const rows = Object.entries(settings).map(([key, value]) => ({
    key, value: String(value), updated_at: new Date()
  }));
  const { error } = await supabase
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });
  if (error) throw error;
  return true;
};
