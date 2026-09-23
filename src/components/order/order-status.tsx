import { Check } from 'lucide-react';
import type { OrderStatus } from '@/db/schema';
import { ORDER_STATUS_LABEL } from '@/lib/constants';
import { cx } from '@/lib/utils';
import styles from './order-status.module.css';

const STEPS: OrderStatus[] = ['primljena', 'u_obradi', 'poslata', 'isporucena'];

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cx('badge', `status-${status}`)}>{ORDER_STATUS_LABEL[status]}</span>;
}

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'otkazana') {
    return <div className="alert alert-error">Ova porudžbina je otkazana.</div>;
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className={styles.timeline}>
      {STEPS.map((s, i) => (
        <li key={s} className={cx(i <= current && styles.done, i === current && styles.current)}>
          <span className={styles.dot}>{i < current || status === 'isporucena' ? <Check size={12} /> : i + 1}</span>
          <span className={styles.label}>{ORDER_STATUS_LABEL[s]}</span>
        </li>
      ))}
    </ol>
  );
}
