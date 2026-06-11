import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data: coupons } = await supabase.from('coupons').select('*');
  if (coupons && coupons.length > 0) {
    const c = coupons[0];
    const payload = { ...c, usage_limit: 20 };
    const { data, error } = await supabase.from('coupons').update(payload).eq('id', c.id).select().single();
    if (error) console.error("UPDATE ERROR", error);
    else console.log("UPDATE SUCCESS", data);
  }
}
test();
