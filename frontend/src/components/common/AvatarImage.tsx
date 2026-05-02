import React, { useEffect, useRef, useState } from 'react';
import { Image, ActivityIndicator, View, StyleProp, ImageStyle } from 'react-native';
import api from '@/api/client';

// AvatarImage: encapsulates image probing/validation. We deliberately do NOT use any
// dummy placeholder images; when no image is available we render an empty View so
// the caller's styling (e.g. backgroundColor) determines the visible box (black/empty).
// Props: src or uri (string | null) - the raw URL from backend; style - Image style;
// skipResolve (boolean) - when true, accept the src/uri as-is and skip probing.
export default function AvatarImage({
  src, // preferred prop
  uri: uriProp, // alias
  style,
  skipResolve = false,
}: {
  src?: string | null;
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  skipResolve?: boolean;
}) {
  const initial = src ?? uriProp ?? null;
  const [uri, setUri] = useState<string | null>(initial);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFinalError, setImageFinalError] = useState(false);
  const [imageProxyTried, setImageProxyTried] = useState(false);
  const [validatingImage, setValidatingImage] = useState(false);
  const [pendingImageError, setPendingImageError] = useState<string | null>(null);
  const [pendingErrorWaiting, setPendingErrorWaiting] = useState(false);

  const pendingErrorTimerRef = useRef<number | null>(null);
  const imageRequestIdRef = useRef(0);
  const imageLoadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    const incoming = src ?? uriProp ?? null;
    // Explicitly block known dev/dummy avatar providers — treat them as absent.
    try {
      const L = String(incoming || '').toLowerCase();
      if (L.includes('pravatar.cc') || L.includes('i.pravatar.cc')) {
        console.debug('[AvatarImage] incoming is pravatar placeholder, treating as null', incoming);
        setUri(null);
        return () => { mounted = false; };
      }
    } catch (err) {}
    if (!incoming) {
      // No URL provided: ensure we render an empty box (no dummy avatar)
      setUri(null);
      return () => { mounted = false; };
    }

    // If caller requests skipping internal resolve/probe, accept incoming as-is
    if (skipResolve) {
      setUri(incoming);
      return () => { mounted = false; };
    }

    (async () => {
      imageLoadedRef.current = false;
      imageRequestIdRef.current += 1;
      const myRequestId = imageRequestIdRef.current;
      setValidatingImage(true);
      setImageLoading(true);
      setImageError(null);
      setPendingImageError(null);

      try {
        const proxyBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + '/uploads/proxy' : null;
        if (proxyBase && incoming && incoming.startsWith(proxyBase)) {
          setImageLoading(false);
          setUri(incoming);
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
        if (incoming && await tryFetch(incoming)) {
          if (mounted) {
            console.debug('[AvatarImage] original OK', incoming);
            setUri(incoming);
          }
          return;
        }

        // 2) encodeURI
        const enc1 = encodeURI(incoming);
        if (incoming && enc1 !== incoming && await tryFetch(enc1)) {
          if (mounted) {
            console.debug('[AvatarImage] encodeURI OK', enc1);
            setUri(enc1);
          }
          return;
        }

        // 3) per-segment encode
        const parts = incoming.split('/');
        const encParts = parts.map((p: string) => encodeURIComponent(p));
        const enc2 = encParts.join('/');
        if (incoming && enc2 !== incoming && await tryFetch(enc2)) {
          if (mounted) {
            console.debug('[AvatarImage] encodeURIComponent per-segment OK', enc2);
            setUri(enc2);
          }
          return;
        }

        // 4) try backend proxy once
        if (!imageProxyTried && proxyBase) {
          try {
            setImageProxyTried(true);
            const proxyUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?url=${encodeURIComponent(incoming)}`;
            if (mounted) {
              console.debug('[AvatarImage] using backend proxy', proxyUrl);
              setUri(proxyUrl);
            }
            return;
          } catch (err) {
            // ignore
          }
        }

        // nothing worked
        if (mounted) {
          // No resolvable image -- leave uri null so caller will see an empty box
          setImageError('Could not fetch image (network or invalid URL)');
          setUri(null);
        }
      } catch (err: any) {
        if (mounted) setImageError(String(err?.message || err));
      } finally {
        if (mounted) {
          setImageLoading(false);
          setValidatingImage(false);
          if (pendingImageError && !imageLoadedRef.current && imageRequestIdRef.current === myRequestId) {
            setImageError(pendingImageError);
            setImageFinalError(true);
            setPendingImageError(null);
          } else {
            setPendingImageError(null);
          }
        }
      }
    })();

    return () => { mounted = false; if (pendingErrorTimerRef.current) { clearTimeout(pendingErrorTimerRef.current as unknown as number); pendingErrorTimerRef.current = null; } };
  }, [src, skipResolve]);

  // If we don't have any URI to render, show an empty View (so caller's style background shows)
  if (!uri) {
    return <View style={style} />;
  }

  return (
    <View>
      <Image
        source={{ uri }}
        style={style}
        onLoadStart={() => { setImageLoading(true); setImageError(null); }}
        onLoad={() => {
          if (pendingErrorTimerRef.current) {
            clearTimeout(pendingErrorTimerRef.current as unknown as number);
            pendingErrorTimerRef.current = null;
          }
          imageLoadedRef.current = true;
          setImageLoaded(true);
          setImageFinalError(false);
          setPendingImageError(null);
          setPendingErrorWaiting(false);
          setImageError(null);
          setImageLoading(false);
        }}
        onError={(e: any) => {
          setImageLoading(false);
          const msg = (e.nativeEvent && (e.nativeEvent as any).error) || JSON.stringify(e);
          setPendingImageError(String(msg));

          if (imageLoadedRef.current) return;
          if (validatingImage) return;

          const delayMs = 1500;
          setPendingErrorWaiting(true);
          const myReqId = imageRequestIdRef.current;
          pendingErrorTimerRef.current = setTimeout(() => {
            if (!imageLoadedRef.current && imageRequestIdRef.current === myReqId) {
              setImageError(String(msg));
              setImageFinalError(true);
            }
            setPendingImageError(null);
            setPendingErrorWaiting(false);
            pendingErrorTimerRef.current = null;
          }, delayMs) as unknown as number;
        }}
      />
      {(imageLoading || validatingImage || pendingErrorWaiting) && (
        <ActivityIndicator style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
      )}
    </View>
  );
}
