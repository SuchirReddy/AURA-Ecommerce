import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function testInsert() {
  console.log("Attempting insert...");
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      clerk_user_id: process.env.VITE_ADMIN_CLERK_ID,
      email: 'test@example.com',
      full_name: 'Test Admin',
      role: 'admin'
    }])
    .select()
    .single();

  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert successful:", data);
  }
}
testInsert();
