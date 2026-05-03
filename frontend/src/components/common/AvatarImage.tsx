import React, { useEffect, useRef, useState } from 'react';
import { Image, View, StyleProp, ImageStyle } from 'react-native';
import api from '@/api/client';

const DEFAULT_AVATAR_URL = 'https://www.gravatar.com/avatar/?d=mp&s=240';

// AvatarImage: encapsulates image probing/validation and provides a consistent
// default avatar whenever a profile image is missing or invalid.
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
  const initial = src ?? uriProp ?? DEFAULT_AVATAR_URL;
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
        setUri(DEFAULT_AVATAR_URL);
        return () => { mounted = false; };
      }
    } catch (err) {}
    if (!incoming) {
      setUri(DEFAULT_AVATAR_URL);
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
          // No resolvable image -- fallback to default avatar.
          setImageError('Could not fetch image (network or invalid URL)');
          setUri(DEFAULT_AVATAR_URL);
        }
      } catch (err: any) {
        if (mounted) {
          setImageError(String(err?.message || err));
          setUri(DEFAULT_AVATAR_URL);
        }
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

  // Defensive fallback in case uri is somehow emptied at runtime.
  if (!uri) {
    return <Image source={{ uri: DEFAULT_AVATAR_URL }} style={style} />;
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
      {/* Intentionally no inline spinner for avatars to avoid UI flicker/noise while lists render. */}
    </View>
  );
}
