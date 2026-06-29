'use client';

import { useState } from 'react';
import styles from './ExpandingOptions.module.css';

export interface OptionItem {
  id: number;
  background: string;
  icon: string;       // lucide or any SVG JSX — passed as className string for FA icons
  main: string;
  sub: string;
  color: string;      // fallback background color
}

const DEFAULT_OPTIONS: OptionItem[] = [
  {
    id: 1,
    background: '/jerseys/jersey1.jpeg',
    icon: 'fas fa-futbol',
    main: 'Maillot 1',
    sub: 'Collection 2025',
    color: '#1a1a2e',
  },
  {
    id: 2,
    background: '/jerseys/jersey2.jpeg',
    icon: 'fas fa-futbol',
    main: 'Maillot 2',
    sub: 'Collection 2025',
    color: '#16213e',
  },
  {
    id: 3,
    background: '/jerseys/jersey3.jpeg',
    icon: 'fas fa-futbol',
    main: 'Maillot 3',
    sub: 'Collection 2025',
    color: '#0f3460',
  },
  {
    id: 4,
    background: '/jerseys/jersey4.jpeg',
    icon: 'fas fa-futbol',
    main: 'Maillot 4',
    sub: 'Collection 2025',
    color: '#533483',
  },
  {
    id: 5,
    background: '/jerseys/jersey5.jpeg',
    icon: 'fas fa-futbol',
    main: 'Maillot 5',
    sub: 'Collection 2025',
    color: '#e94560',
  },
];

interface Props {
  options?: OptionItem[];
}

export default function ExpandingOptions({ options = DEFAULT_OPTIONS }: Props) {
  const [activeId, setActiveId] = useState(options[0]?.id ?? 1);

  return (
    <div className={styles.options}>
      {options.map((opt) => {
        const isActive = opt.id === activeId;
        return (
          <div
            key={opt.id}
            className={`${styles.option} ${isActive ? styles.active : ''}`}
            style={
              {
                '--optionBackground': `url(${opt.background})`,
                '--defaultBackground': opt.color,
              } as React.CSSProperties
            }
            onClick={() => setActiveId(opt.id)}
          >
            <div className={styles.shadow} />
            <div className={styles.label}>
              <div className={styles.icon}>
                <i className={opt.icon} />
              </div>
              <div className={styles.info}>
                <div className={styles.main}>{opt.main}</div>
                <div className={styles.sub}>{opt.sub}</div>
                <a
                  href={`https://wa.me/212620786961?text=${encodeURIComponent(`Salam, bghit n-commander: ${opt.main} (${opt.sub})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.orderBtn}
                  onClick={(e) => e.stopPropagation()}
                >
                  Commander
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
