import { supabase } from '../lib/supabase';

// Admin operations
export const getCoupons = async () => {
  const { data, error } = await supabase.from('coupons').select('*');
  if (error) throw error;
  return data;
};

export const getCouponById = async (id) => {
  const { data, error } = await supabase.from('coupons').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createCoupon = async (couponData) => {
  const { data, error } = await supabase.from('coupons').insert([{
    ...couponData,
    code: couponData.code.toUpperCase()
  }]).select().single();
  if (error) throw error;
  return data;
};

export const updateCoupon = async (id, updates) => {
  if (updates.code) {
    updates.code = updates.code.toUpperCase();
  }
  const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteCoupon = async (id) => {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Storefront operations
export const validateCoupon = async (code, subtotal) => {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !coupon) {
    throw new Error('Invalid coupon code.');
  }

  if (!coupon.active) {
    throw new Error('This coupon is no longer active.');
  }

  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    throw new Error('This coupon has expired.');
  }

  if (coupon.usage_limit !== null && coupon.usage_limit <= 0) {
    throw new Error('This coupon has reached its usage limit.');
  }

  if (coupon.minimum_order && subtotal < coupon.minimum_order) {
    throw new Error(`Minimum order amount for this coupon is ₹${coupon.minimum_order}.`);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = subtotal * (coupon.discount_value / 100);
  } else if (coupon.discount_type === 'fixed') {
    discountAmount = Math.min(coupon.discount_value, subtotal);
  } else if (coupon.discount_type === 'free_shipping') {
    discountAmount = 0; // Handled separately
  }

  return { ...coupon, discountAmount };
};

export const incrementCouponUsage = async (id) => {
  const { data: coupon } = await supabase.from('coupons').select('usage_limit').eq('id', id).single();
  if (coupon && coupon.usage_limit !== null && coupon.usage_limit > 0) {
    await supabase.from('coupons').update({ usage_limit: coupon.usage_limit - 1 }).eq('id', id);
  }
};
