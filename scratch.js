import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('coupons').insert([
    {
      code: 'TESTEXPIRY2',
      discount_type: 'percentage',
      discount_value: 10,
      expiry_date: new Date('2026-12-31').toISOString(),
      active: true
    }
  ]).select().single();
  
  if (error) console.error("INSERT ERROR", error);
  else {
    console.log("INSERT SUCCESS", data);
    await supabase.from('coupons').delete().eq('id', data.id);
  }
}

test();
