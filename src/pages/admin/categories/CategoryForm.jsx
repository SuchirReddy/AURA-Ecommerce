import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, UploadCloud, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ImageUploader from '../../../components/ImageUploader';
import '../AdminForms.css';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    image_url: '',
    banner_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          status: data.status || 'active',
          image_url: data.image_url || '',
          banner_url: data.banner_url || ''
        });
      }
    } catch (error) {
      console.error("Error loading category:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Removed handleUploadImage and handleUploadBanner since ImageUploader handles it internally

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);
        if (error) throw error;
      }
      navigate('/admin/categories');
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-category-form fade-in">
      <div className="admin-form-header">
        <div className="admin-form-header-left">
          <Link to="/admin/categories" className="back-btn"><ChevronLeft size={20} /></Link>
          <h1>{isEdit ? 'Edit Category' : 'Add Category'}</h1>
        </div>
        <div className="admin-form-actions">
          <Link to="/admin/categories" className="btn-secondary" style={{ textDecoration: 'none' }}>Discard</Link>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>

      <div className="admin-form-layout">
        
        {/* Main Column */}
        <div className="admin-form-main">
          <div className="admin-form-section">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="e.g. Summer Collection" required />
            </div>
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="form-input" placeholder="e.g. summer-collection" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" placeholder="Write a description..."></textarea>
            </div>
          </div>

          <div className="admin-form-section">
            <h2>Media</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Thumbnail Image</label>
                <div style={{ position: 'relative', minHeight: formData.image_url ? 'auto' : '150px' }}>
                  {formData.image_url ? (
                    <div style={{ position: 'relative', width: '150px', margin: '0 auto' }}>
                      <img src={formData.image_url} alt="Thumbnail" style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image_url: '' })); }}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: 'var(--shadow-sm)' }}
                        title="Remove Image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <ImageUploader 
                      folder="categories"
                      buttonText="Upload Thumbnail"
                      onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    />
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image</label>
                <div style={{ position: 'relative', minHeight: formData.banner_url ? 'auto' : '150px' }}>
                  {formData.banner_url ? (
                    <div style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
                      <img src={formData.banner_url} alt="Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, banner_url: '' })); }}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: 'var(--shadow-sm)' }}
                        title="Remove Banner"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <ImageUploader 
                      folder="categories"
                      buttonText="Upload Banner"
                      onUploadComplete={(url) => setFormData(prev => ({ ...prev, banner_url: url }))}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="admin-form-sidebar">
          <div className="admin-form-section">
            <h2>Status</h2>
            <div className="form-group">
              <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryForm;
