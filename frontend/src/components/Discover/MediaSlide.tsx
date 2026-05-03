import React, { useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import st from './styles';

function VideoMedia({ uri, isActive }: { uri: string; isActive: boolean }) {
  const player = useVideoPlayer(uri as any);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    console.log('[MediaSlide] VideoMedia effect:', uri, 'isActive=', isActive);
    player.loop = true;

    if (isActive) {
      player.muted = isMuted;
      try {
        if (typeof (player as any).play === 'function') (player as any).play();
        if (typeof (player as any).playAsync === 'function') (player as any).playAsync();
      } catch (e) {
        console.warn('Video play call failed', e);
      }
      return;
    }

    player.muted = true;
    try {
      if (typeof (player as any).pause === 'function') (player as any).pause();
      if (typeof (player as any).pauseAsync === 'function') (player as any).pauseAsync();
    } catch (e) {
      console.warn('Video pause call failed', e);
    }
    try {
      if (typeof (player as any).setCurrentTime === 'function') (player as any).setCurrentTime(0);
      // fallback
      (player as any).currentTime = 0;
    } catch (e) {
      // ignore
    }
  }, [isActive, isMuted, player]);

  return (
    <View>
      <VideoView player={player} style={st.postImage} contentFit="cover" nativeControls={false} />
      <TouchableOpacity
        style={st.videoMuteBtn}
        activeOpacity={0.8}
        onPress={() => setIsMuted((prev) => !prev)}
      >
        <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={14} color="#f0ede8" />
      </TouchableOpacity>
    </View>
  );
}

export function MediaSlide({ media, isActive }: { media: { url: string; type: 'IMAGE' | 'VIDEO' }; isActive: boolean }) {
  if (!media.url) {
    return (
      <View style={st.mediaEmptyWrap}>
        <View style={st.mediaEmptyIconWrap}>
          <Ionicons name="image-outline" size={20} color={"rgba(240,237,232,0.42)"} />
        </View>
        <Text allowFontScaling={false} style={st.mediaEmptyText}>
          Missing media URL
        </Text>
      </View>
    );
  }

  if (media.type === 'VIDEO') {
    return (
      <View>
        <VideoMedia uri={media.url} isActive={isActive} />
      </View>
    );
  }

  return <Image source={{ uri: media.url }} style={st.postImage} />;
}

export default MediaSlide;

