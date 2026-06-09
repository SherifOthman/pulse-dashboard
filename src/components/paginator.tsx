import { Pagination } from "@heroui/react";

type PaginatorProps = {
  page: number;
  total: number;
  onChange: (page: number) => void;
};

export function Paginator({ page, total, onChange }: PaginatorProps) {
  if (total <= 1) return null;

  const pages: (number | "...")[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(total - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < total - 3) pages.push("...");
    pages.push(total);
  }

  return (
    <Pagination size="sm" className="justify-center" aria-label="pagination" dir="ltr">
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            isDisabled={page === 1}
            onPress={() => onChange(page - 1)}
            aria-label="الصفحة السابقة"
          >
            <Pagination.PreviousIcon />
          </Pagination.Previous>
        </Pagination.Item>

        {pages.map((p, i) =>
          p === "..." ? (
            <Pagination.Item key={`ellipsis-${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={p}>
              <Pagination.Link isActive={p === page} onPress={() => onChange(p)}>
                {p}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}

        <Pagination.Item>
          <Pagination.Next
            isDisabled={page === total}
            onPress={() => onChange(page + 1)}
            aria-label="الصفحة التالية"
          >
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
