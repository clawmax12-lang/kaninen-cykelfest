import { useState, useCallback } from 'react';

export function useAsyncButton() {
  const [loading, setLoading] = useState(false);

  const press = useCallback(async (fn: () => Promise<void>) => {
    if (loading) return;
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { loading, press };
}
