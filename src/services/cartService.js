import { supabase } from '../lib/supabase';

// Helper to get or create an anonymous session ID for guest carts
export const getCartSessionId = () => {
  let sessionId = localStorage.getItem('aura_cart_session');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('aura_cart_session', sessionId);
  }
  return sessionId;
};

// Fetch cart items for a user (or session if not logged in)
export const getCartItems = async (userId = null) => {
  if (!userId) {
    const localCart = JSON.parse(localStorage.getItem('aura_guest_cart') || '[]');
    if (localCart.length === 0) return [];
    
    const productIds = localCart.map(item => item.product_id);
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, sale_price, featured_image')
      .in('id', productIds);
      
    if (error) {
      console.error("Error fetching guest cart products:", error);
      return [];
    }
    
    return localCart.map(item => ({
      ...item,
      products: products.find(p => p.id === item.product_id)
    }));
  }
  
  let query = supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      size,
      color,
      product_id,
      products (
        id,
        name,
        price,
        sale_price,
        featured_image
      )
    `);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data || [];
};

export const addToCart = async (userId, productId, quantity = 1, size = null, color = null) => {
  if (!userId) {
    let localCart = JSON.parse(localStorage.getItem('aura_guest_cart') || '[]');
    const existing = localCart.find(item => 
      item.product_id === productId &&
      JSON.stringify(item.size) === JSON.stringify(size) &&
      JSON.stringify(item.color) === JSON.stringify(color)
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      localCart.push({
        id: 'guest_' + Math.random().toString(36).substr(2, 9),
        product_id: productId,
        quantity,
        size,
        color
      });
    }
    localStorage.setItem('aura_guest_cart', JSON.stringify(localCart));
    window.dispatchEvent(new Event('cartUpdated'));
    return localCart;
  }

  // Check if item already exists
  const { data: existingItems, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId);
    
  if (fetchError) throw fetchError;

  const existing = existingItems?.find(item => 
    JSON.stringify(item.size) === JSON.stringify(size) && 
    JSON.stringify(item.color) === JSON.stringify(color)
  );

  let result;
  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select();
    if (error) throw error;
    result = data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('cart_items')
      .insert([
        { user_id: userId, product_id: productId, quantity, size, color }
      ])
      .select();
    if (error) throw error;
    result = data;
  }
  
  window.dispatchEvent(new Event('cartUpdated'));
  return result;
};

export const updateCartItemQuantity = async (id, quantity) => {
  if (typeof id === 'string' && id.startsWith('guest_')) {
    let localCart = JSON.parse(localStorage.getItem('aura_guest_cart') || '[]');
    const item = localCart.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('aura_guest_cart', JSON.stringify(localCart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
    return;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .select();
  if (error) throw error;
  window.dispatchEvent(new Event('cartUpdated'));
  return data;
};

export const removeCartItem = async (id) => {
  if (typeof id === 'string' && id.startsWith('guest_')) {
    let localCart = JSON.parse(localStorage.getItem('aura_guest_cart') || '[]');
    localCart = localCart.filter(i => i.id !== id);
    localStorage.setItem('aura_guest_cart', JSON.stringify(localCart));
    window.dispatchEvent(new Event('cartUpdated'));
    return;
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
  window.dispatchEvent(new Event('cartUpdated'));
};

export const clearCart = async (userId) => {
  if (!userId) {
    localStorage.removeItem('aura_guest_cart');
    window.dispatchEvent(new Event('cartUpdated'));
    return;
  }
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
  window.dispatchEvent(new Event('cartUpdated'));
};
