import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage - 1 <= 2) {
    endPage = Math.min(totalPages, 5);
  }
  if (totalPages - currentPage <= 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handleScrollToTop = (page) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pagination-container">
      <button 
        className="pagination-btn" 
        disabled={currentPage === 1}
        onClick={() => handleScrollToTop(currentPage - 1)}
        aria-label="Previous Page"
      >
        <ChevronLeft size={18} />
      </button>
      
      {startPage > 1 && (
        <>
          <button className="pagination-page-btn" onClick={() => handleScrollToTop(1)}>1</button>
          {startPage > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}

      {pages.map(page => (
        <button 
          key={page}
          className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => handleScrollToTop(page)}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
          <button className="pagination-page-btn" onClick={() => handleScrollToTop(totalPages)}>{totalPages}</button>
        </>
      )}

      <button 
        className="pagination-btn" 
        disabled={currentPage === totalPages}
        onClick={() => handleScrollToTop(currentPage + 1)}
        aria-label="Next Page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
