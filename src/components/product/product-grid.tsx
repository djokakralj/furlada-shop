import type { CardProduct } from '@/lib/product';
import { cx } from '@/lib/utils';
import { ProductCard, ProductCardSkeleton } from './product-card';
import styles from './product-grid.module.css';

export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 0,
}: {
  products: CardProduct[];
  columns?: 3 | 4;
  priorityCount?: number;
}) {
  return (
    <div className={cx(styles.grid, columns === 3 && styles.grid3)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: 3 | 4 }) {
  return (
    <div className={cx(styles.grid, columns === 3 && styles.grid3)}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
