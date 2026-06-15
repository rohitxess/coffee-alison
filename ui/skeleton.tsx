'use client';

export function Skeleton({
  width = '100%',
  height = '16px',
  radius = '8px',
  style = {},
}: {
  width?: string;
  height?: string;
  radius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #f4f4f5 25%, #e4e4e7 37%, #f4f4f5 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        ...style,
      }}
    />
  );
}

// Pre-built skeleton layouts
export function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1.5px solid #f4f4f5',
        padding: '12px',
        backgroundColor: 'white',
      }}
    >
      <Skeleton height="140px" radius="10px" style={{ marginBottom: '10px' }} />
      <Skeleton height="14px" width="70%" style={{ marginBottom: '8px' }} />
      <Skeleton height="12px" width="40%" />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', alignItems: 'center' }}>
      <Skeleton width="40px" height="40px" radius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton height="14px" width="50%" />
        <Skeleton height="12px" width="30%" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}