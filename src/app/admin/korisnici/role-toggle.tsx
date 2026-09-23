'use client';

import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { setUserRole } from '@/app/actions/admin';
import { useToast } from '@/components/providers/toast';
import { cx } from '@/lib/utils';
import ui from '../ui.module.css';

export function RoleToggle({ userId, isAdmin, self, name }: { userId: string; isAdmin: boolean; self: boolean; name: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [on, setOn] = useOptimistic(isAdmin);

  const toggle = () => {
    const next = !on;
    startTransition(async () => {
      setOn(next);
      const res = await setUserRole(userId, next ? 'admin' : 'user');
      if (res.ok) showToast(next ? `${name} je sada administrator.` : `${name} više nije administrator.`);
      else showToast(res.error ?? 'Greška.', 'error');
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      className={cx(ui.switch, on && ui.switchOn)}
      onClick={toggle}
      disabled={self || pending}
      aria-pressed={on}
      aria-label={on ? 'Ukloni administratorska prava' : 'Dodeli administratorska prava'}
      title={self ? 'Ne možete menjati sopstvenu ulogu' : undefined}
    />
  );
}
