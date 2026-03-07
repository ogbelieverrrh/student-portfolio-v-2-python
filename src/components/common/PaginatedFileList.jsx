// Paginated File List Component
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginatedFileList = ({ 
  files, 
  itemsPerPage = 10,
  renderItem,
  emptyMessage = "No files found",
  darkMode = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset to page 1 when files change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [files.length]);
  
  const totalPages = Math.ceil(files.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFiles = files.slice(startIndex, endIndex);
  
  if (files.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {/* Current page items */}
      {currentFiles.map((file, index) => (
        <div key={file.id || index}>
          {renderItem(file, startIndex + index)}
        </div>
      ))}
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, files.length)} of {files.length}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1 
                  ? 'opacity-50 cursor-not-allowed' 
                  : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages 
                  ? 'opacity-50 cursor-not-allowed' 
                  : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginatedFileList;
