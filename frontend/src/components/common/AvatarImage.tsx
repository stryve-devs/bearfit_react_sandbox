import React, { useEffect, useRef, useState } from 'react';
import { Image, ActivityIndicator, View, StyleProp, ImageStyle } from 'react-native';
import api from '@/api/client';

// AvatarImage: encapsulates the same image probing/validation logic used in EditProfileScreen
// Props: src (string | null) - the raw URL from backend; style - Image style; placeholder - optional placeholder URI
// When true, skip internal probing/validation and use src directly.
export default function AvatarImage({
  src,
  style,
  placeholder = 'https://i.pravatar.cc/150?img=12',
  skipResolve = false,
}: {
  src?: string | null;
  style?: StyleProp<ImageStyle>;
  placeholder?: string;
  skipResolve?: boolean;
}) {
  const [uri, setUri] = useState<string | null>(src ?? null);
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
    if (!src) {
      setUri(null);
      return () => { mounted = false; };
    }

    // If caller requests skipping internal resolve/probe (for example the caller
    // already used `useResolvedImageUri` and has a validated URL), just accept
    // the src immediately and skip additional probing to avoid flicker.
    if (skipResolve) {
      setUri(src);
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
        if (proxyBase && src && src.startsWith(proxyBase)) {
          setImageLoading(false);
          setUri(src);
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
        if (src && await tryFetch(src)) {
          if (mounted) {
            console.debug('[AvatarImage] original OK', src);
            setUri(src);
          }
          return;
        }

        // 2) encodeURI
        const enc1 = encodeURI(src);
        if (src && enc1 !== src && await tryFetch(enc1)) {
          if (mounted) {
            console.debug('[AvatarImage] encodeURI OK', enc1);
            setUri(enc1);
          }
          return;
        }

        // 3) per-segment encode
        const parts = src.split('/');
        const encParts = parts.map((p: string) => encodeURIComponent(p));
        const enc2 = encParts.join('/');
        if (src && enc2 !== src && await tryFetch(enc2)) {
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
            const proxyUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?url=${encodeURIComponent(src)}`;
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
          setImageError('Could not fetch image (network or invalid URL)');
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

  return (
    <View>
      <Image
        source={{ uri: uri || placeholder }}
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
