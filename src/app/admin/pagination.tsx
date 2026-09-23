import Link from 'next/link';
import ui from './ui.module.css';

export function Pagination({
  page,
  total,
  pageSize,
  href,
}: {
  page: number;
  total: number;
  pageSize: number;
  href: (page: number) => string;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className={ui.pagination}>
      <span>
        {from}–{to} od {total}
      </span>
      <div>
        {page > 1 && (
          <Link href={href(page - 1)} className="btn btn-outline btn-sm">
            ← Prethodna
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="btn btn-outline btn-sm">
            Sledeća →
          </Link>
        )}
      </div>
    </div>
  );
}
