import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function insertProducts() {
  console.log("Fetching categories...");
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.error("Error fetching categories", catError);
    return;
  }
  
  let mensCategory = categories.find(c => c.name.toLowerCase().includes('men')) || categories[0];
  let womensCategory = categories.find(c => c.name.toLowerCase().includes('women')) || categories[0];
  
  const productsToInsert = [
    {
      name: 'AURA Essential Black Hoodie',
      slug: 'aura-essential-black-hoodie',
      description: 'A sleek, premium black hoodie with a minimalist subtle typography AURA logo on the chest. Crafted from heavy-weight cotton for maximum comfort and modern street wear style.',
      short_description: 'Premium heavyweight black hoodie.',
      price: 120.00,
      sku: 'AURA-BH-001',
      category_id: mensCategory?.id || null,
      featured_image: '/assets/products/aura_black_hoodie.png',
      sizes: ['S', 'M', 'L', 'XL'],
      status: 'published'
    },
    {
      name: 'AURA Signature White T-Shirt',
      slug: 'aura-signature-white-tshirt',
      description: 'A clean, high-quality white t-shirt featuring a subtle iridescent AURA logo. Minimalist design for everyday wear.',
      short_description: 'Signature minimalist white tee.',
      price: 45.00,
      sku: 'AURA-WT-001',
      category_id: mensCategory?.id || null,
      featured_image: '/assets/products/aura_white_tshirt.png',
      sizes: ['S', 'M', 'L', 'XL'],
      status: 'published'
    },
    {
      name: 'AURA Technical Cargo Pants',
      slug: 'aura-technical-cargo-pants',
      description: 'Modern, technical cargo pants in dark olive green. Features multiple utilitarian pockets, adjustable cuffs, and high-quality durable fabric.',
      short_description: 'Modern olive green technical cargos.',
      price: 145.00,
      sku: 'AURA-CP-001',
      category_id: mensCategory?.id || null,
      featured_image: '/assets/products/aura_cargo_pants.png',
      sizes: ['28', '30', '32', '34', '36'],
      status: 'published'
    },
    {
      name: 'AURA Nova Windbreaker',
      slug: 'aura-nova-windbreaker',
      description: 'A lightweight, semi-transparent futuristic windbreaker jacket in light grey. Tech-wear street style with subtle AURA branding.',
      short_description: 'Lightweight futuristic tech-wear windbreaker.',
      price: 185.00,
      sku: 'AURA-WB-001',
      category_id: womensCategory?.id || null,
      featured_image: '/assets/products/aura_windbreaker.png',
      sizes: ['S', 'M', 'L'],
      status: 'published'
    }
  ];
  
  console.log("Inserting products...");
  
  for (const product of productsToInsert) {
    const { data: pData, error: pError } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
      
    if (pError) {
      console.error(`Failed to insert ${product.name}:`, pError.message);
    } else {
      console.log(`Inserted ${product.name}, ID: ${pData.id}`);
      
      // Also add to inventory table
      const { error: invError } = await supabase
        .from('inventory')
        .insert([{ product_id: pData.id, stock_quantity: 100 }]);
        
      if (invError) {
         console.error(`Failed to create inventory for ${product.name}:`, invError.message);
      } else {
         console.log(`Inventory created for ${product.name}`);
      }
    }
  }
  
  console.log("Done!");
}

insertProducts();
