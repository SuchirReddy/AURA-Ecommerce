import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import Breadcrumbs from '../components/shop/Breadcrumbs';
import ShopFilters from '../components/shop/ShopFilters';
import ShopGrid from '../components/shop/ShopGrid';
import Pagination from '../components/shop/Pagination';
import { getProducts, getCategories } from '../services/productService';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Newest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(20); // Number of products per page

  // Filter state
  const [filters, setFilters] = useState({
    category_ids: [],
    price_min: '',
    price_max: '',
    in_stock_only: false,
  });

  // Fetch categories for mobile dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleMobileCategorySelect = (categoryId) => {
    if (categoryId === '') {
      handleFilterChange({ category_ids: [] });
    } else {
      handleFilterChange({ category_ids: [categoryId] });
    }
  };

  const toggleMobileFilters = () => setIsMobileFiltersOpen(!isMobileFiltersOpen);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Count active filters for the badge
  useEffect(() => {
    let count = 0;
    if (filters.category_ids.length > 0) count++;
    if (filters.price_min !== '') count++;
    if (filters.price_max !== '') count++;
    if (filters.in_stock_only) count++;
    setActiveFilterCount(count);
  }, [filters]);

  // Fetch products whenever filters, sort or page change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProducts({
        status: 'published',
        category_ids: filters.category_ids,
        price_min: filters.price_min,
        price_max: filters.price_max,
        in_stock_only: filters.in_stock_only,
        sort: sortOption,
        search: searchQuery,
        page,
        limit,
      });
      setProducts(result.data || []);
      setTotalProducts(result.count || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortOption, searchQuery, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters({
      category_ids: [],
      price_min: '',
      price_max: '',
      in_stock_only: false,
    });
    setPage(1);
    clearSearch();
  };

  const clearSearch = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      return next;
    });
  };

  return (
    <div className="shop-page container">
      {/* Top Bar: Breadcrumbs & Header */}
      <div className="shop-header">
        <Breadcrumbs paths={[{ name: 'Home', link: '/' }, { name: 'Shop', link: '/shop' }]} current={searchQuery ? `Search: "${searchQuery}"` : 'All Products'} />
        <h1 className="shop-title">{searchQuery ? `Results for "${searchQuery}"` : 'All Products'}</h1>
      </div>

      {/* Mobile Category Selector */}
      <div className="mobile-category-bar">
        <div className="mobile-category-scroll">
          <button
            className={`mobile-category-pill ${filters.category_ids.length === 0 ? 'active' : ''}`}
            onClick={() => handleMobileCategorySelect('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`mobile-category-pill ${filters.category_ids.includes(cat.id) ? 'active' : ''}`}
              onClick={() => handleMobileCategorySelect(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar: Mobile Filters Toggle & Sort Dropdown */}
      <div className="shop-toolbar">
        <button className="mobile-filters-btn" onClick={toggleMobileFilters}>
          <Filter size={18} /> Filters
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>
        
        <div className="shop-results-count">
          {!loading && <span>Showing {products.length} of {totalProducts} product{totalProducts !== 1 ? 's' : ''}</span>}
        </div>

        <div className="shop-sort">
          <span className="sort-label">Show:</span>
          <select 
            className="sort-select limit-select" 
            value={limit} 
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            style={{ marginRight: '16px' }}
          >
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
          </select>

          <span className="sort-label">Sort by:</span>
          <select 
            className="sort-select" 
            value={sortOption} 
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
          >
            <option value="Newest">Newest</option>
            <option value="Best Selling">Best Selling</option>
            <option value="Price Low to High">Price: Low to High</option>
            <option value="Price High to Low">Price: High to Low</option>
            <option value="Most Popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="active-filters-bar">
          {searchQuery && (
            <span className="active-filter-tag">
              Search: "{searchQuery}"
              <button onClick={clearSearch}>&times;</button>
            </span>
          )}
          {filters.category_ids.length > 0 && (
            <span className="active-filter-tag">
              {filters.category_ids.length} categor{filters.category_ids.length > 1 ? 'ies' : 'y'}
              <button onClick={() => handleFilterChange({ category_ids: [] })}>&times;</button>
            </span>
          )}
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
          <button className="clear-all-btn" onClick={handleClearAll}>Clear All</button>
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

        {/* Mobile Filter Drawer Overlay */}
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
              <button className="btn-primary full-width" onClick={toggleMobileFilters}>
                Show {totalProducts} Result{totalProducts !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <main className="shop-main-content">
          <ShopGrid products={products} loading={loading} />
          
          {!loading && totalProducts > limit && (
            <Pagination 
              currentPage={page}
              totalPages={Math.ceil(totalProducts / limit)}
              onPageChange={setPage}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
