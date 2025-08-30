import React, { useState } from 'react';
import { Search, Filter, X } from 'react-feather';
import './SearchFilters.css';

const SearchFilters = ({ onSearch, onFilter, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({ language: '', status: '' });
    setSearchTerm('');
    onFilter({ language: '', status: '' });
    onSearch('');
  };

  const hasActiveFilters = searchTerm || filters.language || filters.status;

  return (
    <div className="search-filters">
      <form onSubmit={handleSearch} className="search-box">
        <div className="search-input-group">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search transcriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            disabled={loading}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); onSearch(''); }}
              className="clear-search-btn"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" className="search-btn" disabled={loading}>
          Search
        </button>
      </form>

      <div className="filters-section">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-toggle-btn"
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && <span className="active-dot"></span>}
        </button>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Language</label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="filter-select"
                disabled={loading}
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="kn">Kannada</option>
                <option value="ml">Malayalam</option>
                <option value="bn">Bengali</option>
                <option value="mr">Marathi</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
                disabled={loading}
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;