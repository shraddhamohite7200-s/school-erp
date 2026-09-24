import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 8,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(totalItems, currentPage * pageSize);

  if (totalItems <= pageSize && totalPages === 1) {
    return (
      <div className="p-3.5 sm:p-4 bg-[#f0f3ff]/60 border-t border-[#c5c5d3]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#444651]">
        <div>
          Showing <span className="font-semibold text-[#111c2d]">{totalItems}</span> of{' '}
          <span className="font-semibold text-[#111c2d]">{totalItems}</span> records
        </div>
        <div className="text-xs text-[#757682]">Page 1 of 1</div>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-4 bg-[#f0f3ff]/60 border-t border-[#c5c5d3]/30 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-2 text-xs text-[#444651]">
        <span>
          Showing <span className="font-semibold text-[#111c2d]">{startRecord}–{endRecord}</span> of{' '}
          <span className="font-semibold text-[#111c2d]">{totalItems}</span> records
        </span>
        <span className="text-[#c5c5d3]">•</span>
        <span className="text-[#757682]">Page {currentPage} of {totalPages}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5 rounded-lg bg-white text-[#444651] text-xs font-semibold border border-[#c5c5d3]/40 shadow-2xs hover:bg-[#f0f3ff] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span>Prev</span>
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors shadow-2xs ${
                isActive
                  ? 'bg-[#1e3a8a] text-white'
                  : 'bg-white text-[#111c2d] border border-[#c5c5d3]/40 hover:bg-[#f0f3ff]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {totalPages > 5 && (
          <>
            <span className="px-1 text-xs text-[#757682] font-bold">...</span>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors shadow-2xs ${
                currentPage === totalPages
                  ? 'bg-[#1e3a8a] text-white'
                  : 'bg-white text-[#111c2d] border border-[#c5c5d3]/40 hover:bg-[#f0f3ff]'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5 rounded-lg bg-white text-[#111c2d] text-xs font-semibold border border-[#c5c5d3]/40 shadow-2xs hover:bg-[#f0f3ff] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        >
          <span>Next</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
