import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize = 10,
  totalItems = 0,
  showPageSizeSelector = true,
  onPageSizeChange = null 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>每页显示: </span>
        {showPageSizeSelector && onPageSizeChange && (
          <select 
            value={pageSize} 
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="page-size-selector"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        )}
        <span> {pageSize} 条，共 {totalItems} 条记录</span>
      </div>
      
      <div className="pagination-controls">
        <button 
          onClick={handlePrev} 
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          上一页
        </button>
        
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && handlePageChange(page)}
            className={`pagination-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
        
        <button 
          onClick={handleNext} 
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default Pagination;