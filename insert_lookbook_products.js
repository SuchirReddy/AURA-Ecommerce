import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
  const formData = new FormData();
  formData.append('file', fileBlob, path.basename(filePath));
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

async function run() {
  try {
    const { data: categories } = await supabase.from('categories').select('*');
    let womensCategory = categories.find(c => c.name.toLowerCase().includes('women')) || categories[0];
    let accessoriesCategory = categories.find(c => c.name.toLowerCase().includes('access')) || womensCategory;
    
    const productsToInsert = [
      {
        name: 'Oversized Trench Coat',
        slug: 'oversized-trench-coat',
        description: 'A classic oversized beige trench coat with premium tailoring. A versatile outerwear staple.',
        short_description: 'Classic premium trench coat.',
        price: 155.00, // Roughly ₹12,999
        sku: 'AURA-LB-001',
        category_id: womensCategory?.id,
        localPath: '/Users/suchirreddy/.gemini/antigravity-ide/brain/ee8dcb10-1981-4146-b57e-09c01b8a2464/aura_trench_coat_1783774627428.png',
        sizes: ['XS', 'S', 'M', 'L'],
        status: 'published'
      },
      {
        name: 'Ribbed Turtleneck',
        slug: 'ribbed-turtleneck',
        description: 'A cozy, premium ribbed white turtleneck sweater. Perfect for layering.',
        short_description: 'Premium white turtleneck.',
        price: 45.00, // Roughly ₹3,499
        sku: 'AURA-LB-002',
        category_id: womensCategory?.id,
        localPath: '/Users/suchirreddy/.gemini/antigravity-ide/brain/ee8dcb10-1981-4146-b57e-09c01b8a2464/aura_turtleneck_1783774718002.png',
        sizes: ['XS', 'S', 'M', 'L'],
        status: 'published'
      },
      {
        name: 'Premium Leather Tote',
        slug: 'premium-leather-tote',
        description: 'A premium black leather tote bag with minimal gold hardware and subtle AURA branding.',
        short_description: 'Black leather tote.',
        price: 105.00, // Roughly ₹8,999
        sku: 'AURA-LB-003',
        category_id: accessoriesCategory?.id,
        localPath: '/Users/suchirreddy/.gemini/antigravity-ide/brain/ee8dcb10-1981-4146-b57e-09c01b8a2464/aura_tote_bag_1783774831740.png',
        sizes: ['One Size'],
        status: 'published'
      },
      {
        name: 'Tailored Trousers',
        slug: 'tailored-trousers',
        description: 'Tailored black trousers, premium quality, straight leg.',
        short_description: 'Premium black trousers.',
        price: 60.00, // Roughly ₹4,999
        sku: 'AURA-LB-004',
        category_id: womensCategory?.id,
        localPath: '/Users/suchirreddy/.gemini/antigravity-ide/brain/ee8dcb10-1981-4146-b57e-09c01b8a2464/aura_trousers_1783774821806.png',
        sizes: ['24', '26', '28', '30', '32'],
        status: 'published'
      }
    ];
    
    const results = {};
    
    for (const product of productsToInsert) {
      const imageUrl = await uploadToCloudinary(product.localPath);
      
      const dbProduct = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        sku: product.sku,
        category_id: product.category_id,
        featured_image: imageUrl,
        sizes: product.sizes,
        status: product.status
      };
      
      const { data: pData, error: pError } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();
        
      if (pError) {
        console.error(`Failed to insert ${dbProduct.name}:`, pError.message);
        continue;
      }
      
      results[product.slug] = pData.id;
      
      await supabase.from('inventory').insert([{ product_id: pData.id, stock_quantity: 30 }]);
    }
    
    console.log("=== JSON RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
    
  } catch (err) {
    console.error("Script failed:", err);
  }
}

run();
