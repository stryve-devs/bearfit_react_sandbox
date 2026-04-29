import { useEffect, useRef, useState } from 'react';
import api from '@/api/client';

// Hook: given a raw image URI, probe several fallbacks (encodeURI, per-segment encode)
// and optionally return a backend proxy URL if probes fail. Mirrors logic in EditProfileScreen.
// Important: this hook DOES NOT immediately return the raw URI — it waits for validation
// so RN Image won't attempt a potentially-broken URL and produce a black/empty image.
const DEFAULT_PLACEHOLDER = 'https://i.pravatar.cc/150?img=12';

export default function useResolvedImageUri(rawUri: string | null | undefined) {
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const triedProxyRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    if (!rawUri) {
      // No image provided — keep null (caller can show placeholder)
      setResolvedUri(null);
      return () => { mounted = false; };
    }

    (async () => {
      setIsValidating(true);
      try {
        const proxyBase = api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + '/uploads/proxy' : null;

        // If already a proxy URL for our backend, accept it without extra probing
        if (proxyBase && rawUri.startsWith(proxyBase)) {
          if (mounted) {
            console.debug('[useResolvedImageUri] proxy URL provided, using as-is:', rawUri);
            setResolvedUri(rawUri);
          }
          return;
        }

        const tryFetch = async (url: string) => {
          try {
            const res = await fetch(url, { method: 'GET' });
            return res.ok;
          } catch (err) {
            return false;
          }
        };

        // 1) try original
        if (await tryFetch(rawUri)) {
          if (mounted) setResolvedUri(rawUri);
          return;
        }

        // 2) try encodeURI
        const enc1 = encodeURI(rawUri);
        if (enc1 !== rawUri && await tryFetch(enc1)) {
          if (mounted) setResolvedUri(enc1);
          return;
        }

        // 3) per-segment encodeURIComponent
        const parts = rawUri.split('/');
        const encParts = parts.map((s) => encodeURIComponent(s));
        const enc2 = encParts.join('/');
        if (enc2 !== rawUri && await tryFetch(enc2)) {
          if (mounted) setResolvedUri(enc2);
          return;
        }

        // 4) backend proxy fallback
        if (proxyBase && !triedProxyRef.current) {
          triedProxyRef.current = true;
          const proxyUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?url=${encodeURIComponent(rawUri)}`;
          if (mounted) {
            setResolvedUri(proxyUrl);
            return;
          }
        }

        // 5) nothing worked — default to placeholder so UI shows something instead of black
        if (mounted) setResolvedUri(DEFAULT_PLACEHOLDER);
      } catch (err) {
        if (mounted) setResolvedUri(DEFAULT_PLACEHOLDER);
      } finally {
        if (mounted) setIsValidating(false);
      }
    })();

    return () => { mounted = false; };
  }, [rawUri]);

  return { resolvedUri, isValidating };
}
