'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { cx } from '@/lib/utils';
import styles from './product.module.css';

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={cx(styles.mainImage, styles.noImage)}>Bez slike</div>
      </div>
    );
  }

  const select = (i: number) => {
    setActive(i);
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
  };

  // Na mobilnom se slike listaju prevlačenjem (scroll-snap) — pratimo aktivnu
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  };

  return (
    <div className={styles.gallery}>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={cx(styles.thumb, i === active && styles.thumbActive)}
              onClick={() => select(i)}
              aria-label={`Slika ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="80px" />
            </button>
          ))}
        </div>
      )}
      <div className={styles.track} ref={track} onScroll={onScroll}>
        {images.map((src, i) => (
          <div key={src} className={styles.mainImage}>
            <Image
              src={src}
              alt={i === 0 ? name : `${name} — slika ${i + 1}`}
              fill
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              sizes="(max-width: 900px) 100vw, 55vw"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className={styles.dots}>
          {images.map((src, i) => (
            <span key={src} className={cx(i === active && styles.dotActive)} />
          ))}
        </div>
      )}
    </div>
  );
}
