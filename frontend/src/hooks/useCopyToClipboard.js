import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

//Hook for copy to clipboard functionalities
export function useCopyToClipboard(options = {}) {
  const { resetAfterMs = 1500 } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasModern = !!(navigator.clipboard && navigator.clipboard.writeText);
    const hasLegacy = typeof document !== 'undefined' && typeof document.execCommand === 'function';
    return hasModern || hasLegacy;
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopied(false);
  }, []);

  const copy = useCallback(async (text) => {
    if (typeof text !== 'string' || text.length === 0) return false;
    setError(null);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (resetAfterMs > 0) timerRef.current = window.setTimeout(reset, resetAfterMs);
        return true;
      }
    } catch (e) {
      setError(e);
    }

    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        setCopied(true);
        if (resetAfterMs > 0) timerRef.current = window.setTimeout(reset, resetAfterMs);
        return true;
      }
      return false;
    } catch (e) {
      setError(e);
      return false;
    }
  }, [reset, resetAfterMs]);

  useEffect(() => () => reset(), [reset]);

  return { copied, isSupported, error, copy };
}
