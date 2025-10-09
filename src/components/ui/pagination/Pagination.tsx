import React, { useEffect, useRef, useState } from "react";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from "./PaginationContainer";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const PageButton = (page: number) => (
    <PaginationItem key={page}>
      <PaginationLink
        className={`h-7 w-7 text-sm rounded transition ${
          page === currentPage
            ? "border border-blue-500 bg-blue-50 font-medium"
            : "hover:bg-slate-100"
        }`}
        isActive={page === currentPage}
        onClick={() => onPageChange(page)}
      >
        {page}
      </PaginationLink>
    </PaginationItem>
  );

  const renderPageNumbers = () => {
    const totalVisible = 5;
    const pages: React.ReactNode[] = [];

    if (totalPages <= totalVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(PageButton(i));
    } else if (currentPage <= totalVisible - 1) {
      for (let i = 1; i <= totalVisible; i++) pages.push(PageButton(i));
      pages.push(<PaginationEllipsis key="e1" />);
      pages.push(PageButton(totalPages));
    } else if (currentPage >= totalPages - (totalVisible - 2)) {
      pages.push(PageButton(1));
      pages.push(<PaginationEllipsis key="e2" />);
      for (let i = totalPages - (totalVisible - 1); i <= totalPages; i++) {
        pages.push(PageButton(i));
      }
    } else {
      pages.push(PageButton(1));
      pages.push(<PaginationEllipsis key="e3" />);
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(PageButton(i));
      }
      pages.push(<PaginationEllipsis key="e4" />);
      pages.push(PageButton(totalPages));
    }

    return pages;
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if opening downward will overflow
      if (rect.bottom + 200 > windowHeight) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }

      if (isOpen) {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }

      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    }
  }, [isOpen]);

  const renderDropdown = () => (
    <div className="relative w-[80px]" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-sm border border-slate-300 rounded px-3 py-1.5 bg-white hover:border-slate-400 cursor-pointer flex justify-between items-center"
      >
        {currentPage}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 15l3.75 3.75 3.75-3.75m-7.5-6l3.75-3.75 3.75 3.75"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          className={`absolute w-full bg-white border border-slate-200 rounded shadow-md max-h-[150px] overflow-y-auto z-50 ${
            isOpen ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <ul className="text-sm">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <li
                  key={page}
                  onClick={() => {
                    onPageChange(page);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-slate-100 ${
                    page === currentPage ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  {page}
                  {page === currentPage && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <PaginationRoot className="flex items-center justify-center gap-2">
      <PaginationPrevious
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        className={`cursor-pointer h-7 px-8 flex items-center justify-center ${
          currentPage === 1 ? "opacity-40 pointer-events-none" : ""
        }`}
      />
      <PaginationContent className="flex items-center gap-1">
        {renderPageNumbers()}
      </PaginationContent>
      <PaginationNext
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        className={`cursor-pointer h-7 px-5 flex items-center justify-center ${
          currentPage === totalPages ? "opacity-40 pointer-events-none" : ""
        }`}
      />
      {renderDropdown()}
    </PaginationRoot>
  );
};

export default Pagination;
