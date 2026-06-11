import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data: coupons } = await supabase.from('coupons').select('*');
  if (coupons && coupons.length > 0) {
    const data = coupons[0];
    
    // Simulate what CouponForm does
    const form = {
      ...data,
      expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString().split('T')[0] : '',
      usage_limit: data.usage_limit === null ? '' : data.usage_limit
    };
    
    let parsedExpiry = null;
    if (form.expiry_date) {
      const d = new Date(form.expiry_date);
      d.setUTCHours(23, 59, 59, 999);
      parsedExpiry = d.toISOString();
    }

    const payload = {
      ...form,
      discount_value: form.discount_type === 'free_shipping' ? 0 : Number(form.discount_value),
      minimum_order: Number(form.minimum_order) || 0,
      usage_limit: form.usage_limit === '' ? null : Number(form.usage_limit),
      expiry_date: parsedExpiry
    };

    console.log("PAYLOAD:", payload);

    if (payload.code) payload.code = payload.code.toUpperCase();
    const res = await supabase.from('coupons').update(payload).eq('id', data.id).select().single();
    
    if (res.error) console.error("UPDATE ERROR", res.error);
    else console.log("UPDATE SUCCESS", res.data);
  }
}
test();
