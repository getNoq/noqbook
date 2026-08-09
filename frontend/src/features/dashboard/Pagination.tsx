import { ChevronLeft, ChevronRight } from "lucide-react";
import { BRAND } from "../../lib/theme";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm" style={{ color: BRAND.inkSoft }}>
      <span>Page {page} of {totalPages}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg disabled:opacity-40"
          style={{ border: `1px solid ${BRAND.line}` }}
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg disabled:opacity-40"
          style={{ border: `1px solid ${BRAND.line}` }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}