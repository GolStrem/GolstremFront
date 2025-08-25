import React from "react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  maxToShow = 5,
  className = "",
  activeClassName = "activePagin",
  inactiveClassName = "pagin"
}) => {
  const handlePage = (page) => {
    const pageNum = Number(page);
    if (!Number.isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
      onPageChange(pageNum);
    }
  };

  const renderPagination = () => {
    const pages = [];
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (end - start < maxToShow - 1) {
      if (start === 0) end = Math.min(totalPages - 1, start + (maxToShow - 1));
      else if (end === totalPages - 1) start = Math.max(0, end - (maxToShow - 1));
    }

    if (start > 0) {
      pages.push(
        <button 
          key={0} 
          onClick={() => handlePage(0)} 
          className={currentPage === 0 ? activeClassName : inactiveClassName}
        >
          1
        </button>
      );
      if (start > 1) pages.push(<span key="start-ellipsis">...</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => handlePage(i)} 
          className={currentPage === i ? activeClassName : inactiveClassName}
        >
          {i + 1}
        </button>
      );
    }

    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push(<span key="end-ellipsis">...</span>);
      pages.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePage(totalPages - 1)}
          className={currentPage === totalPages - 1 ? activeClassName : inactiveClassName}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`pagination ${className}`}>
      {renderPagination()}
    </div>
  );
};

export default Pagination;
