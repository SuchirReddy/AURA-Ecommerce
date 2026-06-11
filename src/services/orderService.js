import { supabase } from '../lib/supabase';
import { incrementCouponUsage } from './couponService';
import { notifyNewOrder, notifyLowStock, notifyOrderStatusChange } from './notificationService';

// ==========================================
// ORDERS
// ==========================================
export const getOrders = async (userId = null) => {
  let query = supabase.from('orders').select(`
    *,
    profiles ( full_name, email ),
    order_items ( *, products (name, featured_image) )
  `);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
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
  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: orderData.user_id,
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
  await supabase.from('cart_items').delete().eq('user_id', orderData.user_id);

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
  if (!profileEmail || profileEmail.toLowerCase() !== email.toLowerCase()) {
    throw new Error('Email address does not match our records for this order.');
  }

  return data;
};

// ==========================================
// ANALYTICS
// ==========================================
export const getAnalyticsStats = async () => {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, total_amount, created_at');
  if (ordersError) throw ordersError;

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('quantity, price, product_id, products(name, categories(name)), order_id');
  if (itemsError) throw itemsError;

  // Date boundaries
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const isThisMonth = o => new Date(o.created_at) >= thisMonthStart;
  const isLastMonth = o => new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) <= lastMonthEnd;

  const thisMonthOrders = orders.filter(isThisMonth);
  const lastMonthOrders = orders.filter(isLastMonth);

  const thisMonthOrderIds = new Set(thisMonthOrders.map(o => o.id));
  const lastMonthOrderIds = new Set(lastMonthOrders.map(o => o.id));

  const thisMonthItems = orderItems.filter(i => thisMonthOrderIds.has(i.order_id));
  const lastMonthItems = orderItems.filter(i => lastMonthOrderIds.has(i.order_id));

  // Totals
  const totalRevenue = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;
  const productsSold = orderItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  // This month
  const thisRevenue = thisMonthOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
  const thisOrders = thisMonthOrders.length;
  const thisProducts = thisMonthItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  // Last month
  const lastRevenue = lastMonthOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
  const lastOrders = lastMonthOrders.length;
  const lastProducts = lastMonthItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  // Trend helper: positive = up, negative = down, null = no previous data
  const trend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : null;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  };

  // Top selling products & Categories
  const productSales = {};
  const categorySalesMap = {};
  let totalValidItemsRevenue = 0;

  orderItems.forEach(item => {
    if (!item.products?.name) return;
    const name = item.products.name;
    const categoryName = item.products.categories?.name || 'Uncategorized';
    const itemRevenue = item.quantity * item.price;

    // Products
    if (!productSales[name]) productSales[name] = { name, quantity: 0, revenue: 0 };
    productSales[name].quantity += item.quantity;
    productSales[name].revenue += itemRevenue;

    // Categories
    if (!categorySalesMap[categoryName]) categorySalesMap[categoryName] = 0;
    categorySalesMap[categoryName] += itemRevenue;
    totalValidItemsRevenue += itemRevenue;
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Format Sales by Category into percentages
  const salesByCategory = Object.keys(categorySalesMap).map(cat => ({
    name: cat,
    revenue: categorySalesMap[cat],
    percentage: totalValidItemsRevenue > 0 ? Math.round((categorySalesMap[cat] / totalValidItemsRevenue) * 100) : 0
  })).sort((a, b) => b.revenue - a.revenue);

  // Daily Revenue (last 30 days)
  const dailyMap = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    dailyMap[dateStr] = 0;
  }

  orders.forEach(o => {
    const d = new Date(o.created_at);
    // Only include if it's within the last 30 days
    if (now.getTime() - d.getTime() <= 30 * 24 * 60 * 60 * 1000) {
      const dateStr = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr] += (Number(o.total_amount) || 0);
      }
    }
  });

  const dailyRevenue = Object.keys(dailyMap).map(date => ({
    date,
    revenue: dailyMap[date]
  }));

  return {
    totalRevenue,
    totalOrders,
    aov,
    productsSold,
    topProducts,
    dailyRevenue,
    salesByCategory,
    trends: {
      revenue: trend(thisRevenue, lastRevenue),
      orders: trend(thisOrders, lastOrders),
      products: trend(thisProducts, lastProducts),
      aov: trend(aov, lastOrders > 0 ? (lastRevenue / lastOrders).toFixed(0) : 0)
    }
  };
};
