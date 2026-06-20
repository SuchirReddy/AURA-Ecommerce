import { supabase } from '../lib/supabase';

// ==========================================
// PRODUCTS
// ==========================================
export const getProducts = async (filters = {}) => {
  let query = supabase.from('products').select(`
    *,
    categories ( name, slug )
  `, { count: 'exact' });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.category_ids && filters.category_ids.length > 0) {
    query = query.in('category_id', filters.category_ids);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  if (filters.price_min != null && filters.price_min !== '') {
    query = query.gte('price', Number(filters.price_min));
  }
  if (filters.price_max != null && filters.price_max !== '') {
    query = query.lte('price', Number(filters.price_max));
  }
  if (filters.in_stock_only) {
    query = query.gt('stock_quantity', 0);
  }

  // Sorting
  switch (filters.sort) {
    case 'Price Low to High':
      query = query.order('price', { ascending: true });
      break;
    case 'Price High to Low':
      query = query.order('price', { ascending: false });
      break;
    case 'Best Selling':
    case 'Most Popular':
      query = query.order('created_at', { ascending: false });
      break;
    case 'Newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  if (filters.page && filters.limit) {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
};

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();
  if (error) throw error;
  
  // Create default inventory
  if (data) {
    await supabase.from('inventory').insert([{ product_id: data.id, stock_quantity: productData.stock_quantity || 0 }]);
  }
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// ==========================================
// CATEGORIES
// ==========================================
export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
};

export const createCategory = async (categoryData) => {
  const { data, error } = await supabase.from('categories').insert([categoryData]).select().single();
  if (error) throw error;
  return data;
};

export const updateCategory = async (id, categoryData) => {
  const { data, error } = await supabase.from('categories').update(categoryData).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// ==========================================
// INVENTORY
// ==========================================
export const getInventory = async () => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(name, sku, status, featured_image, sizes)')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateInventoryStock = async (product_id, quantity) => {
  const { data, error } = await supabase
    .from('inventory')
    .update({ stock_quantity: quantity, updated_at: new Date() })
    .eq('product_id', product_id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
