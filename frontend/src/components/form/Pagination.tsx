import FormButton from "./FormButton";
interface PaginationProps {
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  total,
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const generatePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 4) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);

      if (startPage > 2) pages.push("...");

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  return (
    <div className="flex justify-between items-center text-sm text-muted px-4 py-4 border-t border-border">
      <div>{`Showing page ${currentPage} of ${totalPages}`}</div>
      <div className="flex gap-2 flex-wrap">
        <FormButton
          label="Prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="paginate"
        />

        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-3 py-1 text-muted">
              ...
            </span>
          ) : (
            <FormButton
              key={page}
              label={String(page)}
              onClick={() => onPageChange(Number(page))}
              variant="paginate"
              className={`px-3 py-1 rounded-md border ${
                page === currentPage
                  ? "bg-primary text-white border-primary"
                  : "border-border hover:bg-muted/10"
              }`}
            />
          )
        )}

        <FormButton
          label="Next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="paginate"
        />
      </div>
    </div>
  );
}
