import { supabase } from '../lib/supabase';

// ==========================================
// SHIPPING ZONES
// ==========================================
export const getShippingZones = async () => {
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*, shipping_methods(*)')
    .order('name');
  if (error) throw error;
  return data;
};

export const getShippingZoneById = async (id) => {
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*, shipping_methods(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createShippingZone = async (zoneData) => {
  const { data, error } = await supabase
    .from('shipping_zones')
    .insert([zoneData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateShippingZone = async (id, zoneData) => {
  const { data, error } = await supabase
    .from('shipping_zones')
    .update(zoneData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteShippingZone = async (id) => {
  const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// ==========================================
// SHIPPING METHODS
// ==========================================
export const getShippingMethods = async (zoneId) => {
  let query = supabase.from('shipping_methods').select('*');
  if (zoneId) query = query.eq('zone_id', zoneId);
  const { data, error } = await query.order('price');
  if (error) throw error;
  return data;
};

export const createShippingMethod = async (methodData) => {
  const { data, error } = await supabase
    .from('shipping_methods')
    .insert([methodData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateShippingMethod = async (id, methodData) => {
  const { data, error } = await supabase
    .from('shipping_methods')
    .update(methodData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteShippingMethod = async (id) => {
  const { error } = await supabase.from('shipping_methods').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// ==========================================
// RETURN POLICIES
// ==========================================
export const getReturnPolicies = async () => {
  const { data, error } = await supabase
    .from('return_policies')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getReturnPolicyById = async (id) => {
  const { data, error } = await supabase
    .from('return_policies')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createReturnPolicy = async (policyData) => {
  const { data, error } = await supabase
    .from('return_policies')
    .insert([policyData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateReturnPolicy = async (id, policyData) => {
  const { data, error } = await supabase
    .from('return_policies')
    .update(policyData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteReturnPolicy = async (id) => {
  const { error } = await supabase.from('return_policies').delete().eq('id', id);
  if (error) throw error;
  return true;
};
