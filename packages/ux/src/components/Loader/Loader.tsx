import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
// Load the Constellation palette augmentation (palette.brand/surface/...)
import type {} from '../../theme/createConstellationTheme';

export interface LoaderProps {
  /** Mark height in px (width is `size * 0.56`). @default 32 */
  size?: number;
  /**
   * Whether the arc light-up sequence is playing. When `false` all arcs
   * rest dimmed. @default true
   */
  running?: boolean;
  /** Accessible label announced to screen readers. @default 'Loading' */
  'aria-label'?: string;
  className?: string;
}

interface ArcState {
  outer: boolean;
  middle: boolean;
  inner: boolean;
}

const ARCS_OFF: ArcState = { outer: false, middle: false, inner: false };

/**
 * Sequenced arc light-up loop ported from the original app's
 * `ConstellationArcMark` / `useConstellationAnim` (projects/agent).
 */
function useConstellationAnim(running: boolean): ArcState {
  const [arcs, setArcs] = useState<ArcState>(ARCS_OFF);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clearAll = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    if (!running) {
      clearAll();
      setArcs(ARCS_OFF);
      return;
    }
    let cancelled = false;
    const all = (lit: boolean) => setArcs({ outer: lit, middle: lit, inner: lit });
    const setO = (lit: boolean) => setArcs((s) => ({ ...s, outer: lit }));
    const setM = (lit: boolean) => setArcs((s) => ({ ...s, middle: lit }));
    const setI = (lit: boolean) => setArcs((s) => ({ ...s, inner: lit }));

    function loop() {
      if (cancelled) return;
      const timers: ReturnType<typeof setTimeout>[] = [];
      let t = 80;
      const q = (delay: number, fn: () => void) => {
        t += delay;
        timers.push(
          setTimeout(() => {
            if (!cancelled) fn();
          }, t),
        );
      };
      all(false);
      q(80, () => setO(true));
      q(240, () => setM(true));
      q(240, () => setI(true));
      q(600, () => {});
      q(180, () => all(false));
      q(380, () => {});
      q(140, () => all(true));
      q(280, () => all(false));
      q(200, () => all(true));
      q(280, () => all(false));
      q(320, () => {});
      q(80, () => {
        all(false);
        setO(true);
      });
      q(220, () => {
        setO(false);
        setM(true);
      });
      q(220, () => {
        setM(false);
        setI(true);
      });
      q(220, () => setI(false));
      q(140, () => all(true));
      q(420, () => all(false));
      q(380, () => loop());
      timersRef.current = timers;
    }
    loop();
    return () => {
      cancelled = true;
      clearAll();
      setArcs(ARCS_OFF);
    };
  }, [running]);

  return arcs;
}

/**
 * Constellation Loader — the animated three-arc Constellation mark used by
 * the original app while the agent is "thinking". Arcs light up in sequence
 * using `brand.accent`, `brand.mid` and `brand.light` from the theme.
 */
export const Loader = forwardRef<HTMLSpanElement, LoaderProps>(function Loader(
  { size = 32, running = true, 'aria-label': ariaLabel = 'Loading', className },
  ref,
) {
  const theme = useTheme();
  const arcs = useConstellationAnim(running);
  const arcStyle = (lit: boolean, on: number, off: number) => ({
    opacity: lit ? on : off,
    transition: 'opacity 120ms ease',
  });

  return (
    <span
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      className={className}
      style={{ display: 'inline-flex', lineHeight: 0 }}
    >
      <svg
        width={size * 0.56}
        height={size}
        viewBox="0 0 18 33"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.22422 16.0471C2.22422 7.57204 8.61025 0.631495 16.6988 0.0413128C16.332 0.0118036 15.9594 0 15.5867 0C6.97648 0 0 7.18252 0 16.0471C0 24.9116 6.97648 32.0941 15.5867 32.0941C15.9594 32.0941 16.332 32.0823 16.6988 32.0528C8.61025 31.4626 2.22422 24.5221 2.22422 16.0471Z"
          fill={theme.palette.brand.accent}
          style={arcStyle(arcs.outer, 0.92, 0.22)}
        />
        <path
          d="M6.12227 16.047C6.12227 9.69073 10.9089 4.48533 16.9796 4.04269C16.7045 4.02498 16.4236 4.01318 16.1427 4.01318C9.6879 4.01318 4.4541 9.40154 4.4541 16.047C4.4541 22.6924 9.6879 28.0808 16.1427 28.0808C16.4236 28.0808 16.7045 28.069 16.9796 28.0513C10.9146 27.6086 6.12227 22.4032 6.12227 16.047Z"
          fill={theme.palette.brand.mid}
          style={arcStyle(arcs.middle, 0.82, 0.18)}
        />
        <path
          d="M17.2605 8.04407C17.0771 8.03227 16.8937 8.02637 16.7045 8.02637C12.3994 8.02637 8.9082 11.6206 8.9082 16.0529C8.9082 20.4851 12.3994 24.0793 16.7045 24.0793C16.8937 24.0793 17.0771 24.0734 17.2605 24.0557C13.2134 23.7606 10.0261 20.2904 10.0261 16.0529C10.0261 11.8154 13.2191 8.34507 17.2605 8.04998V8.04407Z"
          fill={theme.palette.brand.light}
          style={arcStyle(arcs.inner, 0.72, 0.12)}
        />
      </svg>
    </span>
  );
});
