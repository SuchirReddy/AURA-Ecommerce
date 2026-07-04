import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, UploadCloud, X } from 'lucide-react';
import { createProduct, updateProduct, getProductById, getCategories } from '../../../services/productService';
import ImageUploader from '../../../components/ImageUploader';
import '../AdminForms.css';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    sale_price: '',
    sku: '',
    stock_quantity: 0,
    status: 'draft',
    category_id: '',
    sizes: [],
    colors: [],
    featured_image: '',
    gallery_images: []
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  async function loadCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  async function loadProduct() {
    try {
      const p = await getProductById(id);
      
      // Ensure sizes is an array of objects
      let loadedSizes = [];
      if (Array.isArray(p.sizes)) {
        loadedSizes = p.sizes.map(sizeStr => {
          if (typeof sizeStr === 'string' && sizeStr.startsWith('{')) {
            try { return JSON.parse(sizeStr); } catch (e) { return { size: sizeStr, stock: 0 }; }
          }
          if (typeof sizeStr === 'string') return { size: sizeStr, stock: 0 };
          return sizeStr;
        });
      }
      
      // Ensure colors is an array of objects
      let loadedColors = [];
      if (Array.isArray(p.colors)) {
        loadedColors = p.colors.map(cStr => {
          if (typeof cStr === 'string' && cStr.startsWith('{')) {
            try { return JSON.parse(cStr); } catch (e) { return { name: cStr, hex: '#000000' }; }
          }
          if (typeof cStr === 'string') return { name: cStr, hex: '#000000' };
          return cStr;
        });
      }

      setFormData({
        name: p.name || '',
        slug: p.slug || '',
        description: p.description || '',
        price: p.price || '',
        sale_price: p.sale_price || '',
        sku: p.sku || '',
        stock_quantity: p.stock_quantity || 0,
        status: p.status || 'draft',
        category_id: p.category_id || '',
        sizes: loadedSizes,
        colors: loadedColors,
        featured_image: p.featured_image || '',
        gallery_images: p.gallery_images || []
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = field === 'stock' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const addSize = () => {
    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { size: '', stock: 0 }] }));
  };

  const removeSize = (index) => {
    const newSizes = [...formData.sizes];
    newSizes.splice(index, 1);
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const addColor = () => {
    setFormData(prev => ({ ...prev, colors: [...prev.colors, { name: '', hex: '#000000' }] }));
  };

  const removeColor = (index) => {
    const newColors = [...formData.colors];
    newColors.splice(index, 1);
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  // Removed handleUploadFeatured and handleUploadGallery since ImageUploader handles it natively

  const removeGalleryImage = (index) => {
    const newGallery = [...formData.gallery_images];
    newGallery.splice(index, 1);
    setFormData(prev => ({ ...prev, gallery_images: newGallery }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Filter out sizes that have no name and stringify for TEXT[] column
      const cleanSizesObjs = formData.sizes.filter(s => s.size && s.size.trim() !== '');
      const cleanSizes = cleanSizesObjs.map(s => JSON.stringify(s));

      const cleanColors = formData.colors
        .filter(c => c.name && c.name.trim() !== '')
        .map(c => JSON.stringify(c));

      const calculatedStock = cleanSizesObjs.length > 0 
        ? cleanSizesObjs.reduce((sum, s) => sum + (parseInt(s.stock, 10) || 0), 0)
        : (parseInt(formData.stock_quantity, 10) || 0);

      const productPayload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock_quantity: calculatedStock,
        sizes: cleanSizes,
        colors: cleanColors,
        category_id: formData.category_id || null // Ensure empty string becomes null for database constraint
      };

      if (isEdit) {
        await updateProduct(id, productPayload);
      } else {
        await createProduct(productPayload);
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-product-form fade-in">
      <div className="admin-form-header">
        <div className="admin-form-header-left">
          <Link to="/admin/products" className="back-btn"><ChevronLeft size={20} /></Link>
          <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        </div>
        <div className="admin-form-actions">
          <Link to="/admin/products" className="btn-secondary" style={{ textDecoration: 'none' }}>Discard</Link>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="admin-form-layout">
        
        {/* Main Column */}
        <div className="admin-form-main">
          <div className="admin-form-section">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="e.g. Signature Knit Sweater" required />
            </div>
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="form-input" placeholder="e.g. signature-knit-sweater" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" placeholder="Write a compelling description..."></textarea>
            </div>
          </div>

          <div className="admin-form-section">
            <h2>Media</h2>
            <div className="form-group">
              <label className="form-label">Featured Image</label>
              <div style={{ position: 'relative', minHeight: formData.featured_image ? 'auto' : '150px' }}>
                {formData.featured_image ? (
                  <div style={{ position: 'relative', width: '200px', margin: '0 auto' }}>
                    <img src={formData.featured_image} alt="Featured" style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, featured_image: '' })); }}
                      style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: 'var(--shadow-sm)' }}
                      title="Remove Image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <ImageUploader 
                    folder="products"
                    buttonText="Upload Featured Image"
                    onUploadComplete={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                  />
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="form-label">Gallery Images</label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {formData.gallery_images.map((url, index) => (
                  <div key={index} style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <img src={url} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    <button 
                      type="button" 
                      onClick={() => removeGalleryImage(index)}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: 'var(--shadow-sm)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {formData.gallery_images.length < 5 && (
                  <div style={{ width: '200px' }}>
                    <ImageUploader 
                      folder="products"
                      compact={true}
                      multiple={true}
                      maxFiles={5 - formData.gallery_images.length}
                      buttonText="Add Image"
                      onUploadComplete={(urls) => {
                        const newUrls = Array.isArray(urls) ? urls : [urls];
                        setFormData(prev => ({ 
                          ...prev, 
                          gallery_images: [...prev.gallery_images, ...newUrls].slice(0, 5) 
                        }));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <h2>Pricing</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="form-input" placeholder="₹ 0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Compare at price (Sale Price)</label>
                <input type="number" step="0.01" name="sale_price" value={formData.sale_price} onChange={handleChange} className="form-input" placeholder="₹ 0.00" />
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <h2>Inventory & Variants</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SKU (Stock Keeping Unit)</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="form-input" placeholder="e.g. SWTR-GRY-M" />
              </div>
              <div className="form-group">
                <label className="form-label">Global Stock</label>
                <input 
                  type="number" 
                  name="stock_quantity" 
                  value={formData.sizes.length > 0 ? formData.sizes.reduce((sum, s) => sum + (parseInt(s.stock, 10) || 0), 0) : formData.stock_quantity} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="0" 
                  disabled={formData.sizes.length > 0}
                  style={{ opacity: formData.sizes.length > 0 ? 0.6 : 1, cursor: formData.sizes.length > 0 ? 'not-allowed' : 'text' }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {formData.sizes.length > 0 ? 'Auto-calculated from size variants.' : 'Used if no specific sizes are defined.'}
                </p>
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label" style={{ marginBottom: '12px' }}>Size Variants & Stock</label>
              {formData.sizes.map((sizeObj, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input 
                    type="text" 
                    value={sizeObj.size} 
                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)} 
                    className="form-input" 
                    placeholder="Size (e.g. M)" 
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="number" 
                    value={sizeObj.stock} 
                    onChange={(e) => handleSizeChange(index, 'stock', e.target.value)} 
                    className="form-input" 
                    placeholder="Stock Qty" 
                    style={{ width: '120px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeSize(index)} 
                    className="btn-secondary" 
                    style={{ padding: '0 15px', color: 'var(--error)' }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSize} className="btn-secondary" style={{ marginTop: '10px', width: 'auto' }}>
                + Add Size
              </button>
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label" style={{ marginBottom: '12px' }}>Color Variants</label>
              {formData.colors.map((colorObj, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input 
                    type="text" 
                    value={colorObj.name} 
                    onChange={(e) => handleColorChange(index, 'name', e.target.value)} 
                    className="form-input" 
                    placeholder="Color Name (e.g. Charcoal)" 
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="color" 
                    value={colorObj.hex} 
                    onChange={(e) => handleColorChange(index, 'hex', e.target.value)} 
                    className="form-input" 
                    style={{ width: '60px', padding: '2px', cursor: 'pointer' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeColor(index)} 
                    className="btn-secondary" 
                    style={{ padding: '0 15px', color: 'var(--error)' }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button type="button" onClick={addColor} className="btn-secondary" style={{ marginTop: '10px', width: 'auto' }}>
                + Add Color
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="admin-form-sidebar">
          <div className="admin-form-section">
            <h2>Status</h2>
            <div className="form-group">
              <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="admin-form-section">
            <h2>Organization</h2>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} className="form-select">
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductForm;
