import Link from 'next/link';

export function NotFoundContent() {
  return (
    <div className="container page">
      <div className="empty-state" style={{ padding: '80px 24px' }}>
        <span
          style={{ fontFamily: 'var(--font-heading)', fontSize: '6rem', lineHeight: 1, color: 'var(--line-strong)' }}
        >
          404
        </span>
        <h2>Stranica nije pronađena</h2>
        <p>Stranica koju tražite ne postoji ili je premeštena.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" className="btn">
            Početna
          </Link>
          <Link href="/prodavnica" className="btn btn-outline">
            Prodavnica
          </Link>
        </div>
      </div>
    </div>
  );
}
