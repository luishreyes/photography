import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

type SmartImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  /** How many times to silently re-request a failed image before giving up. */
  maxRetries?: number;
};

// Photo pages fire a burst of image requests at once. On flaky clients (mobile
// data, iOS Safari WebP decode under memory pressure) a few of those requests
// intermittently fail and the browser paints its broken-image icon, forcing a
// manual page reload. A plain <img> never retries. SmartImg re-requests a failed
// image a few times with backoff, appending a cache-busting query so the browser
// actually re-fetches instead of reusing the poisoned cache entry.
export default function SmartImg({ src, maxRetries = 3, onError, ...rest }: SmartImgProps) {
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  // Reset when the underlying source changes (e.g. navigating between albums).
  useEffect(() => {
    setAttempt(0);
    return () => window.clearTimeout(timer.current);
  }, [src]);

  const effectiveSrc = attempt === 0
    ? src
    : `${src}${src.includes('?') ? '&' : '?'}r=${attempt}`;

  return (
    <img
      key={effectiveSrc}
      src={effectiveSrc}
      onError={e => {
        if (attempt < maxRetries) {
          const delay = 300 * Math.pow(2, attempt); // 300ms, 600ms, 1200ms
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setAttempt(a => a + 1), delay);
        }
        onError?.(e);
      }}
      {...rest}
    />
  );
}
