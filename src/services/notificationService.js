import { supabase } from '../lib/supabase';
import { getSiteSettings } from './contentService';

// ==========================================
// IN-APP NOTIFICATIONS (admin_notifications table)
// ==========================================
export const getNotifications = async (limit = 20) => {
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('admin_notifications table may not exist:', error.message);
    return [];
  }
  return data || [];
};

export const getUnreadCount = async () => {
  const { count, error } = await supabase
    .from('admin_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) return 0;
  return count || 0;
};

export const markAsRead = async (id) => {
  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
  return true;
};

export const markAllAsRead = async () => {
  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error) throw error;
  return true;
};

export const deleteNotification = async (id) => {
  const { error } = await supabase
    .from('admin_notifications')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

export const clearAllNotifications = async () => {
  const { error } = await supabase
    .from('admin_notifications')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows
  if (error) throw error;
  return true;
};

// ==========================================
// CREATE NOTIFICATION (in-app)
// ==========================================
const createNotification = async ({ type, title, message, metadata = {} }) => {
  // Save to DB (in-app)
  const { error } = await supabase
    .from('admin_notifications')
    .insert([{ type, title, message, metadata, is_read: false }]);
  
  if (error) {
    console.warn('Failed to save notification:', error.message);
  }
};

// ==========================================
// NOTIFICATION TRIGGERS (called from other services)
// ==========================================

/** Call after a new order is placed */
export const notifyNewOrder = async (order) => {
  await createNotification({
    type: 'new_order',
    title: `New Order #${order.order_number}`,
    message: `A new order of ₹${order.total_amount} has been placed.`,
    metadata: { order_id: order.id, order_number: order.order_number, amount: order.total_amount },
  });
};

/** Call when a product stock drops below threshold */
export const notifyLowStock = async (product, quantity) => {
  await createNotification({
    type: 'low_stock',
    title: `Low Stock: ${product.name}`,
    message: `"${product.name}" (SKU: ${product.sku || 'N/A'}) has only ${quantity} units left.`,
    metadata: { product_id: product.id, product_name: product.name, stock: quantity },
  });
};

/** Call when order status changes */
export const notifyOrderStatusChange = async (order, newStatus) => {
  await createNotification({
    type: 'order_status',
    title: `Order #${order.order_number} Updated`,
    message: `Order #${order.order_number} status changed to "${newStatus}".`,
    metadata: { order_id: order.id, order_number: order.order_number, status: newStatus },
  });
};
