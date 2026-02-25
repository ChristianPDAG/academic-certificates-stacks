"use client";

import { useState, useEffect } from "react";

interface PaginationProps {
  list_page: (page: number) => void;
  count: number;
  type: "small" | "medium" | "large";
}

function Pagination({ list_page, count, type }: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [, setListingsPerPage] = useState(5); // Default to small

  useEffect(() => {
    if (type === "small") {
      setListingsPerPage(5);
    } else if (type === "medium") {
      setListingsPerPage(9);
    } else if (type === "large") {
      setListingsPerPage(18);
    }
  }, [type]);

  const totalPages = count;

  const visitPage = (page: number) => {
    setCurrentPage(page);
    list_page(page);
  };

  const previous_number = () => {
    if (currentPage > 1) {
      visitPage(currentPage - 1);
    }
  };

  const next_number = () => {
    if (currentPage < totalPages) {
      visitPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 3; // Cuántos números de página mostrar al mismo tiempo
    let startPage = Math.max(currentPage - Math.floor(maxPageNumbers / 2), 2); // Empieza en 2, ya que siempre mostramos la primera
    const endPage = Math.min(startPage + maxPageNumbers - 1, totalPages - 1); // Termina antes de la última

    // Ajustar si el rango es menor que maxPageNumbers
    if (endPage - startPage < maxPageNumbers - 1) {
      startPage = Math.max(endPage - maxPageNumbers + 1, 2);
    }

    // Añadir siempre la primera página
    pageNumbers.push(
      <div
        key={1}
        onClick={() => visitPage(1)}
        className={`h-10 w-10 rounded-lg flex items-center justify-center mx-1 cursor-pointer transition-all ${
          currentPage === 1
            ? "bg-primary font-bold text-primary-foreground shadow-md"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
        data-oid="euvck5h"
      >
        1
      </div>,
    );

    // Añadir puntos suspensivos si hay un salto entre la primera página y el rango
    if (startPage > 2) {
      pageNumbers.push(
        <span key="dots-start" className="px-2" data-oid="hrz25ay">
          ...
        </span>,
      );
    }

    // Añadir el rango de páginas
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <div
          key={i}
          onClick={() => visitPage(i)}
          className={`h-10 w-10 rounded-lg flex items-center justify-center mx-1 cursor-pointer transition-all ${
            i === currentPage
              ? "bg-primary font-bold text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          data-oid="emcv-1y"
        >
          {i}
        </div>,
      );
    }

    // Añadir puntos suspensivos si hay un salto entre el rango y la última página
    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <span key="dots-end" className="px-2" data-oid="hewhgho">
          ...
        </span>,
      );
    }

    // Añadir siempre la última página
    if (totalPages > 1) {
      pageNumbers.push(
        <div
          key={totalPages}
          onClick={() => visitPage(totalPages)}
          className={`h-10 w-10 rounded-lg flex items-center justify-center mx-1 cursor-pointer transition-all ${
            currentPage === totalPages
              ? "bg-primary font-bold text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          data-oid="kkvpgux"
        >
          {totalPages}
        </div>,
      );
    }

    return pageNumbers;
  };

  return (
    <nav
      className="border-t border-gray-200 px-4 flex items-center justify-center sm:px-0 pt-2 gap-x-3"
      data-oid="v50063w"
    >
      <div className="z-10" data-oid="a8nz2.a">
        <button
          onClick={previous_number}
          disabled={currentPage === 1}
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed border border-border h-10 w-10 rounded-lg flex items-center justify-center transition-all"
          data-oid="c74bd7q"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left stroke-current"
            data-oid="vivox8-"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
              data-oid=".5h9j_p"
            />

            <path d="M15 6l-6 6l6 6" data-oid="xzw3s79" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center z-10" data-oid="nflus2-">
        {getPageNumbers()}
      </div>

      <div className="z-10" data-oid="5_sitfj">
        <button
          onClick={next_number}
          disabled={currentPage === totalPages}
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed border border-border h-10 w-10 rounded-lg flex items-center justify-center transition-all"
          data-oid="bwgmgn3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right stroke-current"
            data-oid="y.l.xz7"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
              data-oid="7u0-y24"
            />

            <path d="M9 6l6 6l-6 6" data-oid="vc8rp7t" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
