import { supabase } from '../lib/supabase';

export const getTopReviews = async (limit = 3) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      review_text,
      status,
      profiles (full_name, avatar_url)
    `)
    .eq('status', 'approved')
    .gte('rating', 4)
    .limit(limit);
    
  if (error) throw error;
  return data || [];
};

export const getProductReviewStats = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');
    
  if (error) throw error;
  
  if (!data || data.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }
  
  const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = (sum / data.length).toFixed(1);
  
  return {
    averageRating: parseFloat(averageRating),
    reviewCount: data.length
  };
};

export const getProductReviews = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      profiles (full_name)
    `)
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};
