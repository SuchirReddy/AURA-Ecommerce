import { supabase } from '../lib/supabase';
import { incrementCouponUsage } from './couponService';
import { notifyNewOrder, notifyLowStock, notifyOrderStatusChange } from './notificationService';

import { getOrCreateGuestProfile } from './userService';

// ==========================================
// ORDERS
// ==========================================
export const getOrders = async (userId = null, page = 1, limit = 50) => {
  let query = supabase.from('orders').select(`
    *,
    profiles ( full_name, email ),
    order_items ( *, products (name, featured_image) )
  `, { count: 'exact' });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw error;
  return { data, count };
};

export const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles ( full_name, email ),
      order_items (
        *,
        products ( name, featured_image, sku )
      )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createOrder = async (orderData, cartItems) => {
  let userId = orderData.user_id;
  if (!userId) {
    userId = await getOrCreateGuestProfile();
  }

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: userId,
      order_number: orderData.order_number,
      total_amount: orderData.total_amount,
      status: orderData.status,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_status || 'pending',
      shipping_address: orderData.shipping_address,
      razorpay_order_id: orderData.razorpay_order_id || null,
      razorpay_payment_id: orderData.razorpay_payment_id || null,
      razorpay_signature: orderData.razorpay_signature || null
    }])
    .select()
    .single();
  
  if (orderError) throw orderError;

  // Insert order items
  const orderItemsData = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.products?.sale_price || item.products?.price,
    size: item.size,
    color: item.color || null
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
  if (itemsError) throw itemsError;

  // Increment coupon usage if a coupon was used
  if (orderData.coupon_id) {
    incrementCouponUsage(orderData.coupon_id).catch(console.error);
  }

  // Decrement stock for each product
  // In a real production system, this should be an RPC call or Postgres function to avoid race conditions.
  for (const item of cartItems) {
    const { data: product } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity')
      .eq('id', item.product_id)
      .single();
    
    if (product) {
      const newQty = Math.max(0, product.stock_quantity - item.quantity);
      await supabase
        .from('products')
        .update({ stock_quantity: newQty })
        .eq('id', item.product_id);
      
      // Trigger low stock alert if below threshold
      if (newQty > 0 && newQty <= 10) {
        notifyLowStock(product, newQty).catch(() => {});
      }
    }
  }

  // Clear cart
  if (orderData.user_id) {
    await supabase.from('cart_items').delete().eq('user_id', orderData.user_id);
  }

  // Trigger new order notification (async, non-blocking)
  notifyNewOrder(order).catch(() => {});

  return order;
};

export const updateOrderStatus = async (id, statusUpdates) => {
  // Fetch current order state to prevent double-restocking
  const { data: currentOrder } = await supabase
    .from('orders')
    .select('fulfillment_status, status, payment_status')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('orders')
    .update(statusUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  // Check if we are transitioning to a cancelled or refunded state
  const wasAlreadyRestocked = 
    currentOrder?.fulfillment_status === 'cancelled' || 
    currentOrder?.status === 'cancelled' || 
    currentOrder?.payment_status === 'refunded';

  const isNowRestocked = 
    statusUpdates.fulfillment_status === 'cancelled' || 
    statusUpdates.status === 'cancelled' || 
    statusUpdates.payment_status === 'refunded';

  // Restore inventory only if it's newly cancelled or refunded
  if (isNowRestocked && !wasAlreadyRestocked) {
    // Fetch the order items to know what to restock
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', id);

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.product_id) {
          const { data: invData } = await supabase
            .from('inventory')
            .select('stock_quantity')
            .eq('product_id', item.product_id)
            .single();

          if (invData) {
            await supabase
              .from('inventory')
              .update({ stock_quantity: invData.stock_quantity + item.quantity })
              .eq('product_id', item.product_id);
          }
        }
      }
    }
  }

  // Trigger order status notification (async, non-blocking)
  if (statusUpdates.fulfillment_status || statusUpdates.status) {
    const status = statusUpdates.fulfillment_status || statusUpdates.status;
    notifyOrderStatusChange(data, status).catch(() => {});
  }

  return data;
};

export const trackOrder = async (orderNumber, email) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles ( email ),
      order_items (
        *,
        products ( name, featured_image, sku )
      )
    `)
    .eq('order_number', orderNumber)
    .single();

  if (error || !data) {
    throw new Error('Order not found. Please check your order number.');
  }

  const profileEmail = data.profiles?.email;
  const guestEmail = data.shipping_address?.email;

  if (
    (!profileEmail || profileEmail.toLowerCase() !== email.toLowerCase()) &&
    (!guestEmail || guestEmail.toLowerCase() !== email.toLowerCase())
  ) {
    throw new Error('Email address does not match our records for this order.');
  }

  return data;
};

// ==========================================
// ANALYTICS
// ==========================================
export const getAnalyticsStats = async () => {
  const { data, error } = await supabase.rpc('get_dashboard_analytics');
  if (error) {
    console.error("RPC Error:", error);
    throw new Error("Failed to fetch analytics from database. Ensure the get_dashboard_analytics RPC function is installed.");
  }
  return data;
};
