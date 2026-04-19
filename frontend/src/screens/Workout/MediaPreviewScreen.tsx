import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { AppColors } from '../../constants/colors';

export default function MediaPreviewScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ uri?: string; type?: string }>();
    const uri = typeof params.uri === 'string' ? params.uri : '';
    const mediaType = params.type === 'video' ? 'video' : 'photo';

    const player = useVideoPlayer(uri || '');

    useEffect(() => {
        if (!player) return;
        player.loop = true;
        player.currentTime = 0;
        player.play();
    }, [player]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={AppColors.orange} />
            </TouchableOpacity>

            {!uri ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No media selected.</Text>
                </View>
            ) : mediaType === 'video' ? (
                <VideoView
                    player={player}
                    style={styles.previewMedia}
                    nativeControls
                    contentFit="contain"
                />
            ) : (
                <Image source={{ uri }} style={styles.previewMedia} resizeMode="contain" />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },
    backButton: {
        marginLeft: 12,
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        zIndex: 10,
    },
    previewMedia: {
        flex: 1,
        width: '100%',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: AppColors.grey,
        fontSize: 16,
        fontWeight: '500',
    },
});
