import { useId } from 'react';
import { cx } from '@/lib/utils';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  multiline?: boolean;
};

export function TextField({ label, error, hint, optional, className, multiline, ...input }: Props) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const common = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  };

  return (
    <div className={cx('field', className)}>
      <label htmlFor={id} className="label">
        {label} {optional && <span className="optional">(opciono)</span>}
      </label>
      {multiline ? (
        <textarea
          {...common}
          className="textarea"
          name={input.name}
          value={input.value as string | undefined}
          defaultValue={input.defaultValue as string | undefined}
          onChange={input.onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={input.placeholder}
          maxLength={input.maxLength}
          rows={3}
        />
      ) : (
        <input {...common} {...input} className="input" />
      )}
      {error ? (
        <span id={`${id}-err`} className="field-error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="field-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
