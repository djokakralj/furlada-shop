'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { updateOrderStatus } from '@/app/actions/admin';
import { useToast } from '@/components/providers/toast';
import type { OrderStatus } from '@/db/schema';
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from '@/lib/constants';
import { cx } from '@/lib/utils';
import styles from './order-admin.module.css';

export function StatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const change = (next: OrderStatus) => {
    if (next === status) return;
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, next);
      if (res.ok) {
        showToast(`Status promenjen: ${ORDER_STATUS_LABEL[next]}`);
        router.refresh();
      } else {
        showToast(res.error ?? 'Greška pri promeni statusa.', 'error');
      }
    });
  };

  return (
    <div className={styles.statuses} aria-busy={pending}>
      {ORDER_STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          disabled={pending}
          onClick={() => change(s)}
          className={cx(styles.statusBtn, s === status && styles.statusActive)}
          aria-pressed={s === status}
        >
          <span className={styles.radio} />
          {ORDER_STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}
