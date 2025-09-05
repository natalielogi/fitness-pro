'use client';
import React from 'react';
import styles from './banner.module.css';

type Props = {
  slug: string;
  className?: string;
  height?: number;
  mobileHeight?: number;
  alt?: string;
};

type BannerVars = React.CSSProperties & {
  ['--banner-height']?: string;
  ['--banner-height-mobile']?: string;
};

export default function CourseBanner({
  slug,
  className,
  height = 310,
  mobileHeight = 240,
  alt,
}: Props) {
  const desktopSrc = `/course-page/${slug}.jpg`;
  const mobileSrc = `/courses/${slug}.png`;
  const description = alt ?? `Баннер курса ${slug}`;

  const styleVars: BannerVars = {
    '--banner-height': `${height}px`,
    '--banner-height-mobile': `${mobileHeight}px`,
  };

  return (
    <div
      className={`${styles.course__banner}${className ? ` ${className}` : ''}`}
      style={styleVars}
    >
      <picture>
        <source media="(max-width: 375px)" srcSet={mobileSrc} />
        <img
          src={desktopSrc}
          alt={description}
          loading="eager"
          decoding="async"
          className={styles.image}
        />
      </picture>
    </div>
  );
}
