/**
 * Simple custom paginator – HeroUI v3 Pagination is a compound nav
 * component with no built-in page/total logic, so we build our own.
 */

type PaginatorProps = {
  page: number
  total: number
  onChange: (page: number) => void
}

export function Paginator({ page, total, onChange }: PaginatorProps) {
  if (total <= 1) return null

  const pages: (number | '...')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 4) pages.push('...')
    const start = Math.max(2, page - 1)
    const end = Math.min(total - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < total - 3) pages.push('...')
    pages.push(total)
  }

  return (
    <nav className="flex items-center gap-1" aria-label="pagination" dir="ltr">
      {/* Previous */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-default-500 hover:bg-default-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="الصفحة السابقة"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-default-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={[
              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-primary text-white'
                : 'text-default-600 hover:bg-default-100',
            ].join(' ')}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-default-500 hover:bg-default-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="الصفحة التالية"
      >
        ›
      </button>
    </nav>
  )
}
