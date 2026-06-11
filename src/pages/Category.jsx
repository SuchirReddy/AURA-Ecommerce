import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import Breadcrumbs from '../components/shop/Breadcrumbs';
import { getCategories, getProducts } from '../services/productService';
import ShopGrid from '../components/shop/ShopGrid';
import ShopFilters from '../components/shop/ShopFilters';
import './Shop.css'; // Use Shop.css for guaranteed layout consistency

const Category = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shop Layout State
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Newest');
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [filters, setFilters] = useState({
    category_ids: [],
    price_min: '',
    price_max: '',
    in_stock_only: false,
  });

  const toggleMobileFilters = () => setIsMobileFiltersOpen(!isMobileFiltersOpen);

  // Initialize category filter when slug changes
  useEffect(() => {
    const initCategory = async () => {
      const categories = await getCategories();
      const currentCategory = categories.find(c => c.slug === slug);
      if (currentCategory) {
        setCategory(currentCategory);
        // Force the filter to include this category
        setFilters(prev => ({
          ...prev,
          category_ids: [currentCategory.id]
        }));
      } else {
        setCategory(null);
      }
    };
    initCategory();
  }, [slug]);

  useEffect(() => {
    let count = 0;
    if (filters.price_min !== '') count++;
    if (filters.price_max !== '') count++;
    if (filters.in_stock_only) count++;
    setActiveFilterCount(count);
  }, [filters]);

  const fetchProducts = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    try {
      const data = await getProducts({
        status: 'published',
        category_ids: filters.category_ids.length > 0 ? filters.category_ids : [category.id],
        price_min: filters.price_min,
        price_max: filters.price_max,
        in_stock_only: filters.in_stock_only,
        sort: sortOption,
      });
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching category products:", error);
    } finally {
      setLoading(false);
    }
  }, [category, filters, sortOption]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearAll = () => {
    setFilters({
      category_ids: [category.id], // Keep current category
      price_min: '',
      price_max: '',
      in_stock_only: false,
    });
  };

  if (!category && !loading) {
    return <div className="shop-page container fade-in"><div className="empty-state">Category not found.</div></div>;
  }

  return (
    <div className="shop-page container fade-in">
      {/* Top Bar: Breadcrumbs & Header */}
      {category && (
        <div className="shop-header">
          <Breadcrumbs paths={[{ name: 'Home', link: '/' }, { name: 'Shop', link: '/shop' }]} current={category.name} />
          <h1 className="shop-title">{category.name}</h1>
          {category.description && <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>{category.description}</p>}
        </div>
      )}

      {/* Toolbar */}
      <div className="shop-toolbar">
        <button className="mobile-filters-btn" onClick={toggleMobileFilters}>
          <Filter size={18} />
          Filters
          {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
        </button>
        
        <div className="shop-results-count">
          {products.length} Product{products.length !== 1 ? 's' : ''}
        </div>

        <div className="shop-sort">
          <span className="sort-label desktop-only">Sort by:</span>
          <select 
            className="sort-select" 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="Newest">New Arrivals</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="active-filters-bar">
          {(filters.price_min !== '' || filters.price_max !== '') && (
            <span className="active-filter-tag">
              Price: {filters.price_min || '0'} – {filters.price_max || '∞'}
              <button onClick={() => handleFilterChange({ price_min: '', price_max: '' })}>&times;</button>
            </span>
          )}
          {filters.in_stock_only && (
            <span className="active-filter-tag">
              In Stock
              <button onClick={() => handleFilterChange({ in_stock_only: false })}>&times;</button>
            </span>
          )}
          <button className="clear-all-btn" onClick={handleClearAll}>Clear Filters</button>
        </div>
      )}

      {/* Main Layout: Sidebar & Grid */}
      <div className="shop-layout">
        {/* Desktop Sidebar */}
        <aside className="shop-sidebar desktop-only">
          <ShopFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearAll={handleClearAll}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        <div className={`mobile-filter-overlay ${isMobileFiltersOpen ? 'open' : ''}`} onClick={toggleMobileFilters}>
          <div className="mobile-filter-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Filters</h3>
              <button className="close-drawer-btn" onClick={toggleMobileFilters}>&times;</button>
            </div>
            <div className="drawer-content">
              <ShopFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onClearAll={handleClearAll}
              />
            </div>
            <div className="drawer-footer">
              <button className="btn-primary w-100" onClick={toggleMobileFilters}>
                View {products.length} Results
              </button>
            </div>
          </div>
        </div>

        <main className="shop-main-content">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : products.length > 0 ? (
            <ShopGrid products={products} />
          ) : (
            <div className="empty-state">No products match your filters.</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Category;
