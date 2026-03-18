import React, { useState } from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    StatusBar,
    TouchableOpacity,
    Share,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
    FadeIn,
    FadeInDown,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

const BG         = AppColors.black;
const ORANGE     = AppColors.orange;
const IS_ANDROID = Platform.OS === "android";
const SMOOTH     = { duration: 200, easing: Easing.out(Easing.cubic) };

function ActionBtn({ icon, label, onPress, color }: { icon: any; label: string; onPress: () => void; color?: string }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withTiming(0.88, { duration: 80, easing: Easing.out(Easing.cubic) }),
            withTiming(1,    { duration: 160, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onPress)();
    };

    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={styles.actionBtnWrap}>
            <Animated.View style={[styles.actionBtn, animStyle]}>
                <Ionicons name={icon} size={IS_ANDROID ? 20 : 22} color={color ?? "white"} />
            </Animated.View>
            <Text allowFontScaling={false} style={[styles.actionLabel, color ? { color } : {}]}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function Home5FullImage() {
    const params   = useLocalSearchParams<{ imageUrl?: string; caption?: string; username?: string }>();
    const imageUrl = typeof params.imageUrl === "string" ? params.imageUrl : "";
    const caption  = typeof params.caption  === "string" ? params.caption  : "";
    const username = typeof params.username === "string" ? params.username : "";

    const [isLiked, setIsLiked] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Header/footer fade
    const controlsOpacity = useSharedValue(1);
    const controlsStyle   = useAnimatedStyle(() => ({ opacity: controlsOpacity.value }));

    const toggleControls = () => {
        const next = !showControls;
        setShowControls(next);
        controlsOpacity.value = withTiming(next ? 1 : 0, SMOOTH);
    };

    const handleLike = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLiked((v) => !v);
    };

    const handleShare = async () => {
        Haptics.selectionAsync();
        try {
            await Share.share({ message: `Check out this workout on BearFit!\n${imageUrl}` });
        } catch {}
    };

    const handleClose = () => {
        Haptics.selectionAsync();
        router.back();
    };

    // Close button scale
    const closeScale = useSharedValue(1);
    const closeStyle = useAnimatedStyle(() => ({ transform: [{ scale: closeScale.value }] }));
    const pressClose = () => {
        closeScale.value = withSequence(
            withTiming(0.85, { duration: 80 }),
            withTiming(1,    { duration: 140 })
        );
        setTimeout(handleClose, 80);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={BG} hidden />

            {/* ── Image ── */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={toggleControls}
                style={styles.imageWrap}
            >
                <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.fallback}>
                            <Ionicons name="image-outline" size={48} color={AppColors.grey} />
                            <Text allowFontScaling={false} style={styles.fallbackText}>Image not found</Text>
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>

            {/* ── Top Bar ── */}
            <Animated.View style={[styles.topBar, controlsStyle]}>
                <SafeAreaView edges={["top"]} style={styles.topBarInner}>
                    <TouchableOpacity onPress={pressClose} activeOpacity={1}>
                        <Animated.View style={[styles.closeBtn, closeStyle]}>
                            <Ionicons name="close" size={IS_ANDROID ? 20 : 22} color="white" />
                        </Animated.View>
                    </TouchableOpacity>

                    {username ? (
                        <Animated.View entering={FadeInDown.duration(300)} style={styles.userTag}>
                            <Ionicons name="person-circle-outline" size={14} color={ORANGE} />
                            <Text allowFontScaling={false} style={styles.userTagText}>@{username}</Text>
                        </Animated.View>
                    ) : <View />}

                    {/* Zoom hint */}
                    <View style={styles.zoomHint}>
                        <Ionicons name="expand-outline" size={14} color="rgba(255,255,255,0.4)" />
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* ── Bottom Bar ── */}
            <Animated.View style={[styles.bottomBar, controlsStyle]}>
                <SafeAreaView edges={["bottom"]} style={styles.bottomBarInner}>
                    {caption ? (
                        <Text allowFontScaling={false} style={styles.caption} numberOfLines={2}>
                            {caption}
                        </Text>
                    ) : null}

                    <View style={styles.bottomActions}>
                        <ActionBtn
                            icon={isLiked ? "heart" : "heart-outline"}
                            label="Like"
                            onPress={handleLike}
                            color={isLiked ? "#FF4D6D" : undefined}
                        />
                        <ActionBtn
                            icon="share-outline"
                            label="Share"
                            onPress={handleShare}
                        />
                        <ActionBtn
                            icon="download-outline"
                            label="Save"
                            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
                        />
                        <ActionBtn
                            icon="ellipsis-horizontal"
                            label="More"
                            onPress={() => Haptics.selectionAsync()}
                        />
                    </View>
                </SafeAreaView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    imageWrap: { flex: 1 },
    image: { width: "100%", height: "100%", backgroundColor: BG },
    fallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    fallbackText: { color: AppColors.grey, fontSize: 14 },

    // Top bar
    topBar: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
    topBarInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
    closeBtn: { width: IS_ANDROID ? 38 : 40, height: IS_ANDROID ? 38 : 40, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    userTag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    userTagText: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "700" },
    zoomHint: { width: IS_ANDROID ? 38 : 40, alignItems: "center" },

    // Bottom bar
    bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
    bottomBarInner: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: IS_ANDROID ? 16 : 10, backgroundColor: "rgba(0,0,0,0.6)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
    caption: { color: "rgba(255,255,255,0.8)", fontSize: IS_ANDROID ? 13 : 14, lineHeight: IS_ANDROID ? 20 : 22, marginBottom: 14 },
    bottomActions: { flexDirection: "row", justifyContent: "space-around" },
    actionBtnWrap: { alignItems: "center", gap: 5 },
    actionBtn: { width: IS_ANDROID ? 44 : 48, height: IS_ANDROID ? 44 : 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    actionLabel: { color: "rgba(255,255,255,0.6)", fontSize: IS_ANDROID ? 10 : 11, fontWeight: "600" },
});
