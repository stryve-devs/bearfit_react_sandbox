import React, { useMemo, useState, useEffect } from "react";
import {
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    interpolate,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";
import AvatarImage from "@/components/common/AvatarImage";

// ─── Types ────────────────────────────────────────────────────────────────────
type Athlete  = { name: string; username: string; avatarUrl?: string };
type Post     = { id: string; athlete: Athlete; caption: string; imageUrl: string; comments: string[]; exercises: string[] };
type MediaItem = { title: string; imageUrl: string; route: string };

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const BG         = AppColors.black;
const IS_ANDROID = Platform.OS === "android";
const SMOOTH     = { duration: 200, easing: Easing.out(Easing.cubic) };

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
    return (
        <View style={styles.statPill}>
            <Text allowFontScaling={false} style={styles.statPillValue}>{value}</Text>
            <Text allowFontScaling={false} style={styles.statPillLabel}>{label}</Text>
        </View>
    );
}

// ─── Media Card ───────────────────────────────────────────────────────────────
function MediaCard({ item, index, imageHeight, onPress }: {
    item: MediaItem; index: number; imageHeight: number; onPress: () => void;
}) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withTiming(0.98, { duration: 80 }),
            withTiming(1,    { duration: 160, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onPress)();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).duration(400).easing(Easing.out(Easing.cubic))}
            style={{ marginBottom: 14 }}
        >
            <TouchableOpacity onPress={press} activeOpacity={1}>
                <Animated.View style={[styles.mediaCard, animStyle]}>
                    {/* Image */}
                    <View style={styles.mediaImageWrap}>
                        <Image source={{ uri: item.imageUrl }} style={[styles.mediaImage, { height: imageHeight }]} resizeMode="cover" />
                        {/* Gradient overlay */}
                        <View style={styles.mediaImageOverlay} />
                        {/* Play hint */}
                        <View style={styles.playHint}>
                            <Ionicons name="play-circle-outline" size={32} color="rgba(255,255,255,0.8)" />
                        </View>
                    </View>
                    {/* Bottom bar */}
                    <View style={styles.mediaBottomBar}>
                        <View style={styles.mediaBottomLeft}>
                            <View style={styles.mediaTitleIconWrap}>
                                <Ionicons name="barbell-outline" size={14} color={ORANGE} />
                            </View>
                            <Text allowFontScaling={false} numberOfLines={1} style={styles.mediaTitle}>{item.title}</Text>
                        </View>
                        <View style={styles.mediaArrow}>
                            <Ionicons name="arrow-forward" size={14} color={ORANGE} />
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── ProfileMediaScreen ───────────────────────────────────────────────────────
export default function ProfileMediaScreen() {
    const { width } = useWindowDimensions();
    const params    = useLocalSearchParams<{ athleteName?: string; athleteUsername?: string; athleteAvatarUrl?: string }>();

    const athlete: Athlete = useMemo(() => ({
        name:      params.athleteName     ?? "Athlete",
        username:  params.athleteUsername ?? "athlete01",
        avatarUrl: params.athleteAvatarUrl,
    }), [params]);

    const [menuOpen,   setMenuOpen]   = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);

    const media: MediaItem[] = useMemo(() => ([
        { title: "Back + Stuff",     imageUrl: `https://picsum.photos/seed/${athlete.username}_m1/900/900`, route: "/(tabs)/home/home18" },
        { title: "Loose Belly fat",  imageUrl: `https://picsum.photos/seed/${athlete.username}_m2/900/900`, route: "/(tabs)/home/home19" },
        { title: "Leg Day Routine",  imageUrl: `https://picsum.photos/seed/${athlete.username}_m3/900/900`, route: "/(tabs)/home/home20" },
    ]), [athlete.username]);

    // Menu animation
    const menuY       = useSharedValue(300);
    const menuOpacity = useSharedValue(0);

    useEffect(() => {
        if (menuOpen) {
            menuOpacity.value = withTiming(1,   SMOOTH);
            menuY.value       = withTiming(0,   { duration: 300, easing: Easing.out(Easing.cubic) });
        } else {
            menuOpacity.value = withTiming(0,   { duration: 200, easing: Easing.in(Easing.cubic) });
            menuY.value       = withTiming(300, { duration: 240, easing: Easing.in(Easing.cubic) });
        }
    }, [menuOpen]);

    const menuStyle = useAnimatedStyle(() => ({ transform: [{ translateY: menuY.value }] }));

    // Follow animation
    const followedVal = useSharedValue(0);
    useEffect(() => {
        followedVal.value = withTiming(isFollowed ? 1 : 0, SMOOTH);
    }, [isFollowed]);
    const followBtnStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(255,107,53,${interpolate(followedVal.value, [0, 1], [1, 0])})`,
        borderColor: ORANGE,
        borderWidth: 1.5,
    }));

    const openWorkoutDetail = (item: MediaItem, index: number) => {
        const post: Post = {
            id: `${athlete.username}_media_${index}`,
            athlete,
            caption: item.title,
            imageUrl: item.imageUrl,
            comments: ["Nice!", "🔥🔥", "Good work!"],
            exercises: ["Bench Press (Barbell)","Back Extension","Knee Raise Parallel Bars"],
        };
        router.push({ pathname: item.route as any, params: { post: JSON.stringify(post) } });
    };

    const imageHeight = Math.min(240, Math.max(190, width * 0.58));

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.bgAccent1} />
            <View style={styles.bgAccent2} />

            {/* ── Header ── */}
            <Animated.View
                entering={FadeInDown.duration(380).easing(Easing.out(Easing.cubic))}
                style={styles.header}
            >
                <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); router.back(); }}
                    style={styles.headerBtn}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                </TouchableOpacity>

                <Text allowFontScaling={false} numberOfLines={1} style={styles.headerTitle}>
                    {athlete.name}
                </Text>

                <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.headerBtn} activeOpacity={0.7}>
                    <Ionicons name="ellipsis-horizontal" size={IS_ANDROID ? 20 : 22} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

                {/* ── Profile Header Card ── */}
                <Animated.View
                    entering={FadeInDown.delay(60).duration(400).easing(Easing.out(Easing.cubic))}
                    style={styles.profileCard}
                >
                    <View style={styles.profileCardAccent} />

                    <View style={styles.profileRow}>
                        {/* Avatar */}
                        <View style={styles.avatarOuter}>
                            <View style={styles.avatarRing}>
                                {athlete.avatarUrl ? (
                                    <AvatarImage src={athlete.avatarUrl} style={styles.avatar} />
                                ) : (
                                     <View style={[styles.avatar, styles.avatarFallback]}>
                                         <Ionicons name="person" size={IS_ANDROID ? 28 : 32} color={AppColors.grey} />
                                     </View>
                                 )}
                            </View>
                            {/* Online dot */}
                            <View style={styles.onlineDot} />
                        </View>

                        {/* Info */}
                        <View style={styles.profileInfo}>
                            <Text allowFontScaling={false} style={styles.profileName}>{athlete.name}</Text>
                            <Text allowFontScaling={false} style={styles.profileUsername}>@{athlete.username}</Text>
                            <View style={styles.profileTags}>
                                <View style={styles.profileTag}>
                                    <Ionicons name="location-outline" size={10} color={ORANGE} />
                                    <Text allowFontScaling={false} style={styles.profileTagText}>Dubai, UAE</Text>
                                </View>
                                <View style={styles.profileTag}>
                                    <Ionicons name="barbell-outline" size={10} color={ORANGE} />
                                    <Text allowFontScaling={false} style={styles.profileTagText}>Athlete</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <StatPill value="124"  label="Workouts" />
                        <View style={styles.statDivider} />
                        <StatPill value="3.2k" label="Followers" />
                        <View style={styles.statDivider} />
                        <StatPill value="218"  label="Following" />
                    </View>

                    {/* Follow Button */}
                    <TouchableOpacity
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsFollowed((v) => !v); }}
                        activeOpacity={1}
                        style={{ width: "100%" }}
                    >
                        <Animated.View style={[styles.followBtn, followBtnStyle]}>
                            {isFollowed
                                ? <Ionicons name="checkmark" size={14} color={ORANGE} style={{ marginRight: 6 }} />
                                : <Ionicons name="add"       size={14} color={BG}     style={{ marginRight: 6 }} />
                            }
                            <Text allowFontScaling={false} style={[styles.followBtnText, isFollowed && { color: ORANGE }]}>
                                {isFollowed ? "Following" : "Follow"}
                            </Text>
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Media Section Header ── */}
                <Animated.View
                    entering={FadeInDown.delay(120).duration(380).easing(Easing.out(Easing.cubic))}
                    style={styles.mediaSectionHeader}
                >
                    <View>
                        <Text allowFontScaling={false} style={styles.mediaEyebrow}>CONTENT</Text>
                        <Text allowFontScaling={false} style={styles.mediaSectionTitle}>Workout Media</Text>
                    </View>
                    <View style={styles.mediaCountBadge}>
                        <Text allowFontScaling={false} style={styles.mediaCountText}>{media.length}</Text>
                    </View>
                </Animated.View>

                {/* ── Media Cards ── */}
                {media.map((item, i) => (
                    <MediaCard
                        key={`${item.title}-${i}`}
                        item={item}
                        index={i}
                        imageHeight={imageHeight}
                        onPress={() => openWorkoutDetail(item, i)}
                    />
                ))}
            </ScrollView>

            {/* ── More Menu Sheet ── */}
            <Modal visible={menuOpen} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
                <Animated.View style={[styles.menuSheet, menuStyle]}>
                    <View style={styles.sheetHandle} />
                    {[
                        { label: "Save As Routine", icon: "bookmark-outline" },
                        { label: "Copy Workout",    icon: "copy-outline"     },
                        { label: "Report Workout",  icon: "flag-outline"     },
                    ].map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuOpen(false); Alert.alert(`${item.label} ✅`); }}
                            activeOpacity={0.7}
                        >
                            <Animated.View entering={FadeInUp.delay(i * 40).duration(260)} style={styles.menuSheetItem}>
                                <View style={styles.menuSheetIcon}>
                                    <Ionicons name={item.icon as any} size={18} color={ORANGE} />
                                </View>
                                <Text allowFontScaling={false} style={styles.menuSheetText}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
                            </Animated.View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    bgAccent1: { position: "absolute", width: 240, height: 240, borderRadius: 120, top: -70, right: -70, backgroundColor: "rgba(255,107,53,0.05)" },
    bgAccent2: { position: "absolute", width: 180, height: 180, borderRadius: 90, bottom: 120, left: -50, backgroundColor: "rgba(255,107,53,0.03)" },

    header: { height: IS_ANDROID ? 52 : 58, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerBtn: { width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.055)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    headerTitle: { flex: 1, color: AppColors.white, fontSize: IS_ANDROID ? 16 : 17, fontWeight: "800", textAlign: "center", letterSpacing: -0.3 },

    body: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 40 },

    // Profile Card
    profileCard: { backgroundColor: AppColors.darkBg, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 20, padding: IS_ANDROID ? 14 : 16 },
    profileCardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: ORANGE },
    profileRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
    avatarOuter: { position: "relative" },
    avatarRing: { width: IS_ANDROID ? 72 : 80, height: IS_ANDROID ? 72 : 80, borderRadius: IS_ANDROID ? 36 : 40, borderWidth: 2.5, borderColor: "rgba(255,107,53,0.5)", padding: 2.5 },
    avatar: { width: "100%", height: "100%", borderRadius: IS_ANDROID ? 32 : 36, backgroundColor: AppColors.darkBg },
    avatarFallback: { alignItems: "center", justifyContent: "center" },
    onlineDot: { position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: AppColors.green, borderWidth: 2, borderColor: AppColors.darkBg },
    profileInfo: { flex: 1 },
    profileName: { color: AppColors.white, fontSize: IS_ANDROID ? 17 : 19, fontWeight: "800", letterSpacing: -0.3 },
    profileUsername: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2, marginBottom: 8 },
    profileTags: { flexDirection: "row", gap: 6 },
    profileTag: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(255,107,53,0.1)", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(255,107,53,0.18)" },
    profileTagText: { color: ORANGE, fontSize: 10, fontWeight: "600" },

    statsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: IS_ANDROID ? 12 : 14, marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
    statPill: { flex: 1, alignItems: "center" },
    statPillValue: { color: AppColors.white, fontWeight: "800", fontSize: IS_ANDROID ? 17 : 19, letterSpacing: -0.3 },
    statPillLabel: { color: AppColors.grey, fontSize: IS_ANDROID ? 10 : 11, marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.07)" },

    followBtn: { height: IS_ANDROID ? 44 : 48, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
    followBtnText: { color: BG, fontWeight: "800", fontSize: IS_ANDROID ? 14 : 15 },

    // Media Section
    mediaSectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 },
    mediaEyebrow: { fontSize: 9, fontWeight: "700", color: ORANGE, letterSpacing: 2.5, marginBottom: 3 },
    mediaSectionTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "700" },
    mediaCountBadge: { backgroundColor: "rgba(255,107,53,0.12)", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,107,53,0.22)" },
    mediaCountText: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "700" },

    // Media Card
    mediaCard: { borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    mediaImageWrap: { position: "relative", backgroundColor: AppColors.darkBg },
    mediaImage: { width: "100%" },
    mediaImageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "rgba(0,0,0,0.4)" },
    playHint: { position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -16 }, { translateY: -16 }] },
    mediaBottomBar: { flexDirection: "row", alignItems: "center", backgroundColor: AppColors.darkBg, paddingHorizontal: 14, paddingVertical: IS_ANDROID ? 12 : 14 },
    mediaBottomLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
    mediaTitleIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    mediaTitle: { flex: 1, color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    mediaArrow: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center" },

    // Menu Sheet
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    menuSheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#0E0E0E", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: IS_ANDROID ? 24 : 34, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
    sheetHandle: { width: 40, height: 4, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 16 },
    menuSheetItem: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: IS_ANDROID ? 12 : 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
    menuSheetIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center" },
    menuSheetText: { color: AppColors.white, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "600", flex: 1 },
});
