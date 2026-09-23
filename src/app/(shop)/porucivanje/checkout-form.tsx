'use client';

import { Banknote, Lock, Store, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { placeOrder } from '@/app/actions/checkout';
import { useCartSync } from '@/components/cart/use-cart-sync';
import { useCart } from '@/components/providers/cart';
import { TextField } from '@/components/ui/text-field';
import { DELIVERY_COST } from '@/lib/constants';
import { capitalize, cx, formatPrice, omit } from '@/lib/utils';
import styles from './checkout.module.css';

export type CheckoutDefaults = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
};

const EMPTY: CheckoutDefaults = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  streetNumber: '',
  postalCode: '',
  city: '',
};

export function CheckoutForm({ defaults, loggedIn }: { defaults: CheckoutDefaults | null; loggedIn: boolean }) {
  const cart = useCart();
  const synced = useCartSync();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ ...EMPTY, ...defaults, note: '' });
  const [delivery, setDelivery] = useState<'kurir' | 'preuzimanje'>('kurir');
  const [saveAddress, setSaveAddress] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [placed, setPlaced] = useState(false);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => omit(prev, name));
  };

  const deliveryCost = delivery === 'kurir' ? DELIVERY_COST : 0;
  const total = cart.subtotal + deliveryCost;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    startTransition(async () => {
      const res = await placeOrder({
        ...form,
        delivery,
        saveAddress: loggedIn && saveAddress,
        items: cart.items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error ?? 'Došlo je do greške. Pokušajte ponovo.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setPlaced(true);
      cart.clear();
      router.push(`/porudzbina/${res.data.orderId}?nova=1`);
    });
  };

  if (!cart.hydrated || (!synced && cart.items.length > 0)) {
    return <div className={cx('container', 'page', styles.loading)} />;
  }

  if (cart.items.length === 0 && !placed) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>Korpa je prazna</h2>
          <p>Dodajte proizvode u korpu pre poručivanja.</p>
          <Link href="/prodavnica" className="btn">
            Pogledajte ponudu
          </Link>
        </div>
      </div>
    );
  }

  const field = (name: keyof typeof form, label: string, extra: Partial<React.ComponentProps<typeof TextField>> = {}) => (
    <TextField label={label} name={name} value={form[name]} onChange={set} error={errors[name]} {...extra} />
  );

  return (
    <div className={cx('container', 'page')}>
      <h1 className="page-title">Poručivanje</h1>
      {!loggedIn && (
        <p className={styles.loginHint}>
          Imate nalog?{' '}
          <Link href="/prijava?next=/porucivanje" className="link">
            Prijavite se
          </Link>{' '}
          da biste pratili porudžbine i brže poručivali. Možete poručiti i bez naloga.
        </p>
      )}

      <form className={styles.layout} onSubmit={submit} noValidate>
        <div className={styles.main}>
          {formError && <div className="alert alert-error">{formError}</div>}

          <section className={styles.section}>
            <h2>
              <span>1</span> Kontakt podaci
            </h2>
            <div className="form-grid">
              {field('firstName', 'Ime', { autoComplete: 'given-name' })}
              {field('lastName', 'Prezime', { autoComplete: 'family-name' })}
              {field('email', 'Email', {
                type: 'email',
                autoComplete: 'email',
                hint: 'Na ovu adresu šaljemo potvrdu porudžbine.',
              })}
              {field('phone', 'Telefon', {
                type: 'tel',
                autoComplete: 'tel',
                placeholder: '06x xxx xxxx',
                hint: 'Kurir vas zove pre isporuke.',
              })}
            </div>
          </section>

          <section className={styles.section}>
            <h2>
              <span>2</span> Način dostave
            </h2>
            <div className={styles.options}>
              <label className={cx(styles.option, delivery === 'kurir' && styles.optionActive)}>
                <input type="radio" name="delivery" checked={delivery === 'kurir'} onChange={() => setDelivery('kurir')} />
                <Truck size={22} strokeWidth={1.4} />
                <span className={styles.optionText}>
                  <strong>Kurirska dostava</strong>
                  <small>Na adresu, 2–4 radna dana</small>
                </span>
                <span className={styles.optionPrice}>{formatPrice(DELIVERY_COST)}</span>
              </label>
              <label className={cx(styles.option, delivery === 'preuzimanje' && styles.optionActive)}>
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === 'preuzimanje'}
                  onChange={() => setDelivery('preuzimanje')}
                />
                <Store size={22} strokeWidth={1.4} />
                <span className={styles.optionText}>
                  <strong>Lično preuzimanje</strong>
                  <small>Javljamo vam kada je paket spreman</small>
                </span>
                <span className={styles.optionPrice}>Besplatno</span>
              </label>
            </div>

            {delivery === 'kurir' && (
              <div className={cx('form-grid', styles.address)}>
                {field('street', 'Ulica', { autoComplete: 'address-line1' })}
                {field('streetNumber', 'Broj', { autoComplete: 'address-line2', placeholder: 'npr. 12a / 4' })}
                {field('postalCode', 'Poštanski broj', { inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 5 })}
                {field('city', 'Grad', { autoComplete: 'address-level2' })}
              </div>
            )}
            {loggedIn && (
              <label className={styles.check}>
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                Sačuvaj podatke u mom nalogu za sledeću kupovinu
              </label>
            )}
          </section>

          <section className={styles.section}>
            <h2>
              <span>3</span> Plaćanje
            </h2>
            <div className={cx(styles.option, styles.optionActive, styles.optionStatic)}>
              <Banknote size={22} strokeWidth={1.4} />
              <span className={styles.optionText}>
                <strong>Plaćanje pouzećem</strong>
                <small>Plaćate gotovinom kuriru ili pri preuzimanju</small>
              </span>
            </div>
            {field('note', 'Napomena', {
              multiline: true,
              optional: true,
              maxLength: 500,
              placeholder: 'npr. interfon, najbolje vreme za dostavu…',
              className: styles.note,
            })}
          </section>
        </div>

        <aside className={styles.summary}>
          <h2>Vaša porudžbina</h2>
          <ul className={styles.lines}>
            {cart.items.map((i) => (
              <li key={`${i.productId}-${i.size}`}>
                <div className={styles.lineImg}>
                  {i.image && <Image src={i.image} alt="" fill sizes="64px" />}
                  <span>{i.quantity}</span>
                </div>
                <div className={styles.lineText}>
                  <strong>{i.name}</strong>
                  <small>
                    {[i.size && `Veličina ${i.size}`, capitalize(i.color)].filter(Boolean).join(' · ')}
                  </small>
                </div>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.row}>
            <span>Međuzbir</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className={styles.row}>
            <span>Dostava</span>
            <span>{deliveryCost ? formatPrice(deliveryCost) : 'Besplatno'}</span>
          </div>
          <div className={cx(styles.row, styles.total)}>
            <span>Ukupno za plaćanje</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button type="submit" className="btn btn-block" disabled={pending}>
            {pending ? 'Slanje porudžbine…' : 'Potvrdi porudžbinu'}
          </button>
          <p className={styles.secure}>
            <Lock size={12} /> Potvrdom prihvatate{' '}
            <Link href="/uslovi" className="link">
              uslove korišćenja
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}
