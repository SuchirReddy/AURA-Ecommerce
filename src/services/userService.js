import { supabase } from '../lib/supabase';

// ==========================================
// PROFILES (AUTH SYNC)
// ==========================================
export const syncUserProfile = async (clerkUser) => {
  if (!clerkUser) return null;

  const { id: clerk_user_id, primaryEmailAddress, fullName, imageUrl } = clerkUser;
  
  const adminClerkId = import.meta.env.VITE_ADMIN_CLERK_ID;
  const isTargetAdmin = adminClerkId && clerk_user_id === adminClerkId;

  console.log("DEBUG: syncUserProfile checking admin promotion");
  console.log("DEBUG: clerk_user_id =", clerk_user_id);
  console.log("DEBUG: adminClerkId from env =", adminClerkId);
  console.log("DEBUG: isTargetAdmin =", isTargetAdmin);

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .single();

  if (existingProfile) {
    let needsUpdate = false;
    let updates = {};

    if (existingProfile.full_name !== fullName) {
      updates.full_name = fullName;
      needsUpdate = true;
    }
    
    if (existingProfile.email !== primaryEmailAddress?.emailAddress) {
      updates.email = primaryEmailAddress?.emailAddress;
      needsUpdate = true;
    }

    if (isTargetAdmin && existingProfile.role !== 'admin') {
      updates.role = 'admin';
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { data: updated, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (!error && updated) {
        return updated;
      }
    }
    return existingProfile;
  }

  console.log("DEBUG: creating new profile with role =", isTargetAdmin ? 'admin' : 'user');
  // Create new profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert([{
      clerk_user_id,
      email: primaryEmailAddress?.emailAddress,
      full_name: fullName,
      avatar_url: imageUrl,
      role: isTargetAdmin ? 'admin' : 'user'
    }])
    .select()
    .single();

  if (error) {
    console.error("DEBUG: Insert error", error);
    throw error;
  }
  return newProfile;
};

export const getOrCreateGuestProfile = async () => {
  const guestClerkId = 'guest_checkout_user';
  
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', guestClerkId)
    .single();
    
  if (existing) return existing.id;
  
  const { data: newGuest, error } = await supabase
    .from('profiles')
    .insert([{
      clerk_user_id: guestClerkId,
      full_name: 'Guest User',
      email: 'guest@aura.com',
      role: 'user'
    }])
    .select('id')
    .single();
    
  if (error) {
    console.error('Failed to create guest profile', error);
    throw new Error('Failed to setup guest checkout database record.');
  }
  
  return newGuest.id;
};

export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      orders ( id, total_amount )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getCustomerById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      orders ( id, order_number, total_amount, status, payment_status, created_at ),
      addresses ( * )
    `)
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

// ==========================================
// ADDRESSES
// ==========================================
// Helper functions to map between frontend and backend schemas
const dbToFrontendAddress = (dbAddress) => {
  if (!dbAddress) return null;
  const parts = (dbAddress.full_name || '').split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  
  return {
    id: dbAddress.id,
    user_id: dbAddress.user_id,
    firstName,
    lastName,
    address: dbAddress.address_line_1 || '',
    apartment: dbAddress.address_line_2 || '',
    city: dbAddress.city || '',
    state: dbAddress.state || '',
    pinCode: dbAddress.postal_code || '',
    phone: dbAddress.phone || '',
    country: dbAddress.country || 'India',
    is_default: dbAddress.is_default
  };
};

const frontendToDbAddress = (form) => {
  return {
    ...(form.user_id ? { user_id: form.user_id } : {}),
    full_name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
    address_line_1: form.address || '',
    address_line_2: form.apartment || '',
    city: form.city || '',
    state: form.state || '',
    postal_code: form.pinCode || '',
    phone: form.phone || '',
    country: form.country || 'India',
    ...(form.is_default !== undefined ? { is_default: form.is_default } : {})
  };
};

export const getUserAddresses = async (userId) => {
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToFrontendAddress);
};

export const addAddress = async (addressData) => {
  const dbData = frontendToDbAddress(addressData);
  const { data, error } = await supabase.from('addresses').insert([dbData]).select().single();
  if (error) throw error;
  return dbToFrontendAddress(data);
};

export const updateAddress = async (id, updates) => {
  const dbData = frontendToDbAddress(updates);
  const { data, error } = await supabase.from('addresses').update(dbData).eq('id', id).select().single();
  if (error) throw error;
  return dbToFrontendAddress(data);
};

export const deleteAddress = async (id) => {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const setDefaultAddress = async (userId, addressId) => {
  // Clear all defaults for user
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
  // Set new default
  const { data, error } = await supabase.from('addresses').update({ is_default: true }).eq('id', addressId).select().single();
  if (error) throw error;
  return data;
};

// ==========================================
// WISHLIST
// ==========================================
export const getWishlist = async (userId) => {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, products(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const toggleWishlist = async (userId, productId) => {
  // Check if exists
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    await supabase.from('wishlist').delete().eq('id', existing.id);
    return false; // Removed
  } else {
    await supabase.from('wishlist').insert([{ user_id: userId, product_id: productId }]);
    return true; // Added
  }
};

// ==========================================
// REVIEWS
// ==========================================
export const getReviews = async (status = null) => {
  let query = supabase.from('reviews').select('*, profiles(full_name, avatar_url), products(name, featured_image)');
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateReviewStatus = async (id, status) => {
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw error;
  return true;
};
