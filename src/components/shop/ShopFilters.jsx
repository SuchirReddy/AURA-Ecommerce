import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { getCategories } from '../../services/productService';
import './ShopFilters.css';

const FilterSection = ({ title, defaultExpanded = true, children }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="filter-section">
      <button 
        className="filter-section-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="filter-title">{title}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="filter-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

const ShopFilters = ({ filters, onFilterChange, onClearAll }) => {
  const [categories, setCategories] = useState([]);
  const [priceMin, setPriceMin] = useState(filters.price_min);
  const [priceMax, setPriceMax] = useState(filters.price_max);
  const [priceTimer, setPriceTimer] = useState(null);

  // Load categories from DB
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

  // Sync local price state when filters are reset externally
  useEffect(() => {
    setPriceMin(filters.price_min);
    setPriceMax(filters.price_max);
  }, [filters.price_min, filters.price_max]);

  // Category toggle
  const handleCategoryToggle = (categoryId) => {
    const current = filters.category_ids;
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    onFilterChange({ category_ids: updated });
  };

  // Debounced price change
  const handlePriceChange = (field, value) => {
    if (field === 'price_min') setPriceMin(value);
    if (field === 'price_max') setPriceMax(value);

    if (priceTimer) clearTimeout(priceTimer);
    const timer = setTimeout(() => {
      onFilterChange({ [field]: value });
    }, 500);
    setPriceTimer(timer);
  };

  // In-stock toggle
  const handleStockToggle = () => {
    onFilterChange({ in_stock_only: !filters.in_stock_only });
  };

  const hasActiveFilters = filters.category_ids.length > 0 
    || filters.price_min !== '' 
    || filters.price_max !== '' 
    || filters.in_stock_only;

  return (
    <div className="shop-filters">
      {/* Clear All Button */}
      {hasActiveFilters && (
        <button className="filters-clear-all" onClick={onClearAll}>
          <RotateCcw size={14} />
          <span>Reset All Filters</span>
        </button>
      )}

      <FilterSection title="Categories">
        {categories.length === 0 && (
          <span className="filter-empty">No categories available</span>
        )}
        {categories.map((cat) => (
          <label key={cat.id} className="filter-checkbox-label">
            <input 
              type="checkbox" 
              checked={filters.category_ids.includes(cat.id)} 
              onChange={() => handleCategoryToggle(cat.id)} 
            />
            <span>{cat.name}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="price-inputs">
          <div className="price-input-group">
            <span className="currency">₹</span>
            <input 
              type="number" 
              placeholder="Min" 
              className="price-input" 
              value={priceMin}
              onChange={(e) => handlePriceChange('price_min', e.target.value)}
              min="0"
            />
          </div>
          <span className="price-separator">–</span>
          <div className="price-input-group">
            <span className="currency">₹</span>
            <input 
              type="number" 
              placeholder="Max" 
              className="price-input" 
              value={priceMax}
              onChange={(e) => handlePriceChange('price_max', e.target.value)}
              min="0"
            />
          </div>
        </div>
        {priceMin !== '' && priceMax !== '' && Number(priceMin) > Number(priceMax) && (
          <span className="price-error">Min price must be less than max</span>
        )}
      </FilterSection>

      <FilterSection title="Availability">
        <label className="filter-toggle-label">
          <span>In Stock Only</span>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              className="toggle-input" 
              checked={filters.in_stock_only} 
              onChange={handleStockToggle} 
            />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </FilterSection>
    </div>
  );
};

export default ShopFilters;
