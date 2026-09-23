'use client';

import { useFormStatus } from 'react-dom';
import { cx } from '@/lib/utils';

export function SubmitButton({
  children,
  pendingText,
  className,
  variant,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: 'outline' | 'danger';
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={cx('btn', variant && `btn-${variant}`, className)}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (pendingText ?? 'Čuvanje…') : children}
    </button>
  );
}
