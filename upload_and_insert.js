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
  console.log(`Uploading ${filePath} to Cloudinary...`);
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
  if (data.error) {
    throw new Error(`Cloudinary error: ${data.error.message}`);
  }
  console.log(`Successfully uploaded. URL: ${data.secure_url}`);
  return data.secure_url;
}

async function run() {
  try {
    console.log("Fetching categories...");
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) throw catError;
    
    let mensCategory = categories.find(c => c.name.toLowerCase().includes('men')) || categories[0];
    
    const productsToInsert = [
      {
        name: 'AURA Oversized Graphic Tee',
        slug: 'aura-oversized-graphic-tee',
        description: 'An oversized faded vintage grey t-shirt featuring a subtle abstract geometric AURA graphic on the back. Crafted for maximum comfort with a modern streetwear aesthetic.',
        short_description: 'Vintage wash oversized graphic tee.',
        price: 55.00,
        sku: 'AURA-OT-002',
        category_id: mensCategory?.id || null,
        localPath: '/Users/suchirreddy/.gemini/antigravity-ide/brain/ee8dcb10-1981-4146-b57e-09c01b8a2464/aura_graphic_tee_1783774128905.png',
        sizes: ['S', 'M', 'L', 'XL'],
        status: 'published'
      },
      {
        name: 'AURA Half-Zip Fleece Pullover',
        slug: 'aura-half-zip-fleece',
        description: 'A cozy, premium cream off-white half-zip fleece pullover. Features a small minimalist embroidered AURA logo on the chest. Perfect for winter streetwear.',
        short_description: 'Premium cream fleece pullover.',
        price: 135.00,
        sku: 'AURA-FL-001',
        category_id: mensCategory?.id || null,
        localPath: '/Users/suchirreddy/.gemini/antigravity-ide/brain/ee8dcb10-1981-4146-b57e-09c01b8a2464/aura_fleece_pullover_1783774138281.png',
        sizes: ['S', 'M', 'L', 'XL'],
        status: 'published'
      },
      {
        name: 'AURA Premium Denim Jacket',
        slug: 'aura-denim-jacket',
        description: 'A premium dark wash denim jacket with subtle minimalist branding on the buttons. A classic outerwear piece elevated with modern tailoring.',
        short_description: 'Dark wash classic denim jacket.',
        price: 160.00,
        sku: 'AURA-DJ-001',
        category_id: mensCategory?.id || null,
        localPath: '/Users/suchirreddy/.gemini/antigravity-ide/brain/ee8dcb10-1981-4146-b57e-09c01b8a2464/aura_denim_jacket_1783774160828.png',
        sizes: ['M', 'L', 'XL'],
        status: 'published'
      },
      {
        name: 'AURA Stealth Puffer Vest',
        slug: 'aura-puffer-vest',
        description: 'A matte black minimalist puffer vest. Sleek modern streetwear design with a subtle AURA logo. Lightweight but highly insulated.',
        short_description: 'Matte black modern puffer vest.',
        price: 150.00,
        sku: 'AURA-PV-001',
        category_id: mensCategory?.id || null,
        localPath: '/Users/suchirreddy/.gemini/antigravity-ide/brain/ee8dcb10-1981-4146-b57e-09c01b8a2464/aura_puffer_vest_1783774171471.png',
        sizes: ['S', 'M', 'L', 'XL'],
        status: 'published'
      }
    ];
    
    for (const product of productsToInsert) {
      // 1. Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(product.localPath);
      
      // 2. Prepare DB object
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
      
      // 3. Insert into Supabase
      console.log(`Inserting ${dbProduct.name} to Supabase...`);
      const { data: pData, error: pError } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();
        
      if (pError) {
        console.error(`Failed to insert ${dbProduct.name}:`, pError.message);
        continue;
      }
      
      console.log(`Inserted ${dbProduct.name}, ID: ${pData.id}`);
      
      // 4. Create inventory
      const { error: invError } = await supabase
        .from('inventory')
        .insert([{ product_id: pData.id, stock_quantity: 50 }]);
        
      if (invError) {
         console.error(`Failed to create inventory for ${dbProduct.name}:`, invError.message);
      } else {
         console.log(`Inventory created for ${dbProduct.name}`);
      }
      console.log('---');
    }
    
    console.log("All products uploaded and inserted successfully!");
    
  } catch (err) {
    console.error("Script failed:", err);
  }
}

run();
