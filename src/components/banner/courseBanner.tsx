import Image from 'next/image';

type Props = {
  slug: string;
  className?: string;
  height?: number;
};

export default function CourseBanner({ slug, className, height = 310 }: Props) {
  const src = `/course-page/${slug}.jpg`;

  return (
    <div
      className={className}
      style={{ position: 'relative', height, borderRadius: 20, overflow: 'hidden' }}
    >
      <Image src={src} alt={`Баннер курса ${slug}`} fill style={{ objectFit: 'cover' }} priority />
    </div>
  );
}
