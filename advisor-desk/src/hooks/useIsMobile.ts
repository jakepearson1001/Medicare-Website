import { useEffect, useState } from 'react';
import { MOBILE_BREAKPOINT } from '../config';

export function useIsMobile(): boolean {
  const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return mobile;
}
