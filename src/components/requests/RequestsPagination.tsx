
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface RequestsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const RequestsPagination: React.FC<RequestsPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const isMobile = useIsMobile();
  const maxDisplayedPages = isMobile ? 3 : 5;

  // Generate array of page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // For small number of pages, show all
    if (totalPages <= maxDisplayedPages) {
      for (let i = 2; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
    
    // For larger number of pages, use ellipsis
    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - Math.floor(maxDisplayedPages / 2));
    const rangeEnd = Math.min(totalPages - 1, rangeStart + maxDisplayedPages - 3);
    
    // Add ellipsis before range if needed
    if (rangeStart > 2) {
      pageNumbers.push('ellipsis');
    }
    
    // Add range around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis after range if needed
    if (rangeEnd < totalPages - 1) {
      pageNumbers.push('ellipsis');
    }
    
    // Always show last page (if it's not already included)
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // If there's only one page, don't show pagination
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Showing {Math.min(totalItems, 1 + (currentPage - 1) * 10)}-
        {Math.min(totalItems, currentPage * 10)} of {totalItems} requests
      </p>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : undefined}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            />
          </PaginationItem>
          
          {!isMobile && pageNumbers.map((pageNumber, index) => (
            <PaginationItem key={`${pageNumber}-${index}`}>
              {pageNumber === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={pageNumber === currentPage}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              aria-disabled={currentPage === totalPages}
              tabIndex={currentPage === totalPages ? -1 : undefined}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default RequestsPagination;
