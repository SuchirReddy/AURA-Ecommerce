import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data: coupons } = await supabase.from('coupons').select('*');
  console.log("ALL COUPONS:", coupons);
  
  if (coupons && coupons.length > 0) {
    const coupon = coupons[0];
    console.log("TESTING COUPON:", coupon.code);
    try {
      if (!coupon.active) throw new Error('Inactive');
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) throw new Error('Expired. Expiry: ' + coupon.expiry_date + ', Now: ' + new Date().toISOString());
      if (coupon.usage_limit !== null && coupon.usage_limit <= 0) throw new Error('Usage limit');
      if (coupon.minimum_order && 1000 < coupon.minimum_order) throw new Error('Min order');
      console.log("VALID!");
    } catch (e) {
      console.error("INVALID:", e.message);
    }
  }
}
test();
