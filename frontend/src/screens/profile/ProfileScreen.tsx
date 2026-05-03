import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Easing,
    Platform,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Pressable,
    FlatList,
    Linking,
    Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "@/api/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import AvatarImage from '@/components/common/AvatarImage';
import userService from '@/api/services/user.service';
import type { PublicProfileUser, MeProfileResponse } from '@/types/auth.types';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const ORANGE  = "#FF7825";
const ORANGE2 = "#ff5500";
const TEXT    = "#f0ede8";
const MUTED   = "rgba(240,237,232,0.42)";
const HINT    = "rgba(240,237,232,0.18)";
const GLASS_B = "rgba(255,255,255,0.07)";
const BG      = "#080808";
const { width: SW } = Dimensions.get("window");

const CARD_W   = (SW - 32 - 12) / 2;
const BORDER_R = 18;

// ─── Bar data ─────────────────────────────────────────────────────────────────
const BAR_DATA: Record<string, number[]> = {
    Duration: [25, 55, 40, 75, 60, 35, 50],
    Volume:   [60, 30, 80, 45, 70, 55, 20],
    Reps:     [40, 65, 30, 55, 80, 45, 60],
};
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PROFILE_BANNER = [
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600",
];
const BANNER_URI_KEY = "bearfit:profile-banner-uri";

type DashItem = {
    label: string;
    icon: string;
    startOffset: number;
    sub: string;
    route?: string;
};

// HTML animation-delay offsets for a 9s cycle
const DASH_ITEMS: DashItem[] = [
    { label: "Statistics", icon: "chart-line", startOffset: 0, sub: "", route: "/Profile/statistics" },
    { label: "Exercises", icon: "dumbbell", startOffset: 0.33, sub: "" },
    { label: "Measures", icon: "human-male-height", startOffset: 0.17, sub: "", route: "/Profile/measurements" },
    { label: "Calendar", icon: "calendar", startOffset: 0.56, sub: "", route: "/Profile/calendar" },
] as const;

// ─── AvatarRing ───────────────────────────────────────────────────────────────
function AvatarRing() {
    return (
        <View style={ringSt.container}>
            <View style={ringSt.staticLayer}>
                <LinearGradient
                    colors={["transparent", ORANGE, "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    locations={[0.2, 0.5, 0.8]}
                    style={ringSt.beam}
                />
            </View>
            <View style={ringSt.mask} />
        </View>
    );
}

// ─── GlowCard ────────────────────────────────────────────────────────────────
function GlowCard({
                      label, sub, icon, startOffset = 0, onPress,
                  }: {
    label: string; sub: string; icon: string; startOffset?: number; onPress?: () => void;
}) {
    const rot = useRef(new Animated.Value(startOffset)).current;
    const flash = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rot, {
                toValue: startOffset + 1,
                duration: 9000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotate = rot.interpolate({
        inputRange: [startOffset, startOffset + 1],
        outputRange: ["0deg", "360deg"],
    });

    const flashBg = flash.interpolate({
        inputRange: [0, 1],
        outputRange: ["rgba(255,120,37,0.00)", "rgba(255,120,37,0.12)"],
    });

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: false }),
            Animated.timing(flash, { toValue: 0, duration: 220, useNativeDriver: false }),
        ]).start();
        onPress?.();
    };

    return (
        <TouchableOpacity style={glowSt.wrap} activeOpacity={0.85} onPress={handlePress}>

            {/* Spinning beam — Simulates HTML conic-gradient exactly */}
            <View style={glowSt.spinContainer}>
                <Animated.View style={[glowSt.spinLayer, { transform: [{ rotate }] }]}>
                    <LinearGradient
                        colors={["transparent", ORANGE, "transparent"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        locations={[0.35, 0.5, 0.65]}
                        style={glowSt.beam}
                    />
                </Animated.View>
            </View>

            {/* Card inner — LinearGradient gives glassmorphism depth */}
            <LinearGradient
                colors={["rgba(22,22,26,0.98)", "rgba(12,12,14,0.99)"]}
                start={{ x: 0.145, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={glowSt.inner}
            >
                {/* Top shine line */}
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={glowSt.shineLine}
                    pointerEvents="none"
                />
                {/* Bottom orange warmth */}
                <LinearGradient
                    colors={["rgba(255,120,37,0.04)", "transparent"]}
                    start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }}
                    style={glowSt.bottomGlow}
                    pointerEvents="none"
                />
                {/* Press flash */}
                <Animated.View
                    style={[glowSt.flashOverlay, { backgroundColor: flashBg }]}
                    pointerEvents="none"
                />

                {/* Content */}
                <View style={glowSt.dashContent}>
                    <LinearGradient
                        colors={["rgba(255,120,37,0.15)", "rgba(255,120,37,0.06)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={glowSt.iconCircle}
                    >
                        <MaterialCommunityIcons name={icon as any} size={18} color={ORANGE} />
                    </LinearGradient>
                    <View>
                        <Text style={glowSt.dashText}>{label}</Text>
                        <Text style={glowSt.dashSub}>{sub}</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

// ─── SparkBars ────────────────────────────────────────────────────────────────
function SparkBars({ tab, selectedDay, setSelectedDay }: { tab: string; selectedDay: number | null; setSelectedDay: (day: number | null) => void }) {
    const heights = BAR_DATA[tab] ?? BAR_DATA.Duration;

    return (
        <View>
            <View style={chartSt.row}>
                {heights.map((h, i) => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => setSelectedDay(selectedDay === i ? null : i)}
                        style={{ flex: 1, alignItems: "center" }}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={
                                selectedDay === null || selectedDay === i
                                    ? ["rgba(255,120,37,0.20)", "rgba(255,120,37,0.65)"]
                                    : ["rgba(255,120,37,0.04)", "rgba(255,120,37,0.15)"]
                            }
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={[
                                chartSt.bar,
                                { height: (h / 100) * 80 },
                                (selectedDay === null || selectedDay === i) && chartSt.barActive,
                            ]}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            <View style={chartSt.labelsRow}>
                {DAY_LABELS.map((d) => (
                    <Text key={d} style={[chartSt.lbl, { flex: 1, textAlign: "center" }]}>{d}</Text>
                ))}
            </View>
        </View>
    );
}

function PeopleModal({
    visible,
    title,
    people,
    onClose,
    onUnfollow,
}: {
    visible: boolean;
    title: string;
    people: PublicProfileUser[];
    onClose: () => void;
    // onUnfollow will be called when the modal is closed with the list of confirmed unfollowed ids
    onUnfollow?: (unfollowedIds?: number[]) => Promise<void> | void;
}) {
    // Cache of user_id -> resolved profile_pic_url (nullable)
    const [avatarMap, setAvatarMap] = React.useState<Record<number, string | null>>({});

    React.useEffect(() => {
        if (!visible) return;
        let mounted = true;

        // Find IDs we haven't fetched yet
        const idsToFetch = people
            .map((p) => p.user_id)
            .filter((id) => typeof avatarMap[id] === 'undefined');

        if (idsToFetch.length === 0) return;

        (async () => {
            try {
                const results = await Promise.all(
                    idsToFetch.map((id) => userService.getUserById(id).catch(() => null))
                );

                if (!mounted) return;

                const next = { ...avatarMap };
                results.forEach((res, idx) => {
                    const id = idsToFetch[idx];
                    if (res && res.profile_pic_url) next[id] = res.profile_pic_url;
                    else next[id] = null;
                });

                setAvatarMap(next);
            } catch (err) {
                // ignore - we'll just show fallbacks
                console.warn('[PeopleModal] failed to fetch avatars', err);
            }
        })();

        return () => { mounted = false; };
    }, [visible, people]);

    // Local copy so UI can be updated (we won't remove rows immediately)
    const [localPeople, setLocalPeople] = React.useState<PublicProfileUser[]>(people);
    React.useEffect(() => setLocalPeople(people), [people]);

    // Track pending unfollow requests and confirmed unfollows
    const [pendingUnfollow, setPendingUnfollow] = React.useState<Record<number, boolean>>({});
    const [confirmedUnfollow, setConfirmedUnfollow] = React.useState<Record<number, boolean>>({});
    // Track pending remove requests and confirmed removals (for Followers list)
    const [pendingRemove, setPendingRemove] = React.useState<Record<number, boolean>>({});
    const [confirmedRemoved, setConfirmedRemoved] = React.useState<Record<number, boolean>>({});

    const handleUnfollow = async (targetId: number) => {
        if (pendingUnfollow[targetId] || confirmedUnfollow[targetId]) return;
        // mark pending
        setPendingUnfollow((p) => ({ ...p, [targetId]: true }));

        try {
            await userService.unfollowUser(targetId);
            // mark confirmed
            setConfirmedUnfollow((p) => ({ ...p, [targetId]: true }));
        } catch (err) {
            console.warn('[PeopleModal] unfollow failed', err);
            // clear pending flag
            setPendingUnfollow((p) => { const n = { ...p }; delete n[targetId]; return n; });
        }
    };

    const handleRemoveFollower = async (followerId: number) => {
        if (pendingRemove[followerId] || confirmedRemoved[followerId]) return;
        setPendingRemove((p) => ({ ...p, [followerId]: true }));
        try {
            await userService.removeFollower(followerId);
            setConfirmedRemoved((p) => ({ ...p, [followerId]: true }));
        } catch (err) {
            console.warn('[PeopleModal] removeFollower failed', err);
            setPendingRemove((p) => { const n = { ...p }; delete n[followerId]; return n; });
        }
    };

    // When modal closes, notify parent of confirmed unfollows then call onClose
    const handleClose = async () => {
        const unfollowedIds = Object.keys(confirmedUnfollow).map((k) => Number(k));
        try {
            await onUnfollow?.(unfollowedIds.length ? unfollowedIds : undefined);
        } catch (e) {
            // ignore parent errors
        }
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={peopleSt.overlay}>
                <Pressable style={peopleSt.backdrop} onPress={handleClose} />
                <View style={peopleSt.sheet}>
                    <View style={peopleSt.handle} />
                    <Text style={peopleSt.title}>{title}</Text>
                    <FlatList
                        data={localPeople}
                        keyExtractor={(item: PublicProfileUser) => String(item.user_id)}
                        contentContainerStyle={peopleSt.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={peopleSt.emptyText}>
                                {title === "Followers" ? "No followers yet" : "Not following anyone yet"}
                            </Text>
                        }
                        renderItem={({ item }: { item: PublicProfileUser }) => {
                            const resolved = avatarMap[item.user_id];
                            // Do not use dummy fallback images; show empty when no resolved avatar
                            const avatarUri = resolved ?? null;
                            const isFollowingList = title === 'Following';
                            const isFollowersList = title === 'Followers';
                            const isPending = !!pendingUnfollow[item.user_id];
                            const isConfirmed = !!confirmedUnfollow[item.user_id];
                            const isRemovePending = !!pendingRemove[item.user_id];
                            const isRemoved = !!confirmedRemoved[item.user_id];

                            // Debug: log follower row rendering so we can verify the button logic in runtime
                            if (isFollowersList) {
                                console.log('[PeopleModal] follower row', item.user_id, { isRemovePending, isRemoved });
                            }

                            return (
                                <View style={peopleSt.row}>
                                    <AvatarImage src={avatarUri} style={peopleSt.avatar} />
                                    <View style={peopleSt.textWrap}>
                                        <Text style={peopleSt.name}>{item.name || "-"}</Text>
                                        <Text style={peopleSt.username}>@{item.username || `user-${item.user_id}`}</Text>
                                    </View>
                                    {isFollowingList && (
                                        <TouchableOpacity
                                            style={[peopleSt.followingBtn, isConfirmed && peopleSt.unfollowedBtn]}
                                            activeOpacity={0.8}
                                            onPress={() => handleUnfollow(item.user_id)}
                                            disabled={isPending || isConfirmed}
                                        >
                                            <Text style={peopleSt.followingBtnText}>
                                                {isPending ? 'Unfollowing...' : isConfirmed ? 'Unfollowed' : 'Following'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {isFollowersList && (
                                        <TouchableOpacity
                                            style={[
                                                peopleSt.removeBtn,
                                                isRemoved ? peopleSt.removedBtn : peopleSt.removeBtnActive,
                                            ]}
                                            activeOpacity={0.8}
                                            onPress={() => handleRemoveFollower(item.user_id)}
                                            disabled={isRemovePending || isRemoved}
                                        >
                                            <Text style={[peopleSt.removeBtnText, isRemoved ? { color: MUTED } : { color: '#111' }]}>
                                                {isRemovePending ? 'Removing...' : isRemoved ? 'Removed' : 'Remove'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
}
// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const isAndroid = Platform.OS === "android";
    const topBarHeight = isAndroid ? 42 : 48;
    const router = useRouter();
    const { user: authUser } = useAuth();
    const [tab, setTab] = useState<"Duration" | "Volume" | "Reps">("Duration");
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [profile, setProfile] = useState<MeProfileResponse | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [savedBannerUri, setSavedBannerUri] = useState<string | null>(null);
    const [peopleModal, setPeopleModal] = useState<"Followers" | "Following" | null>(null);
    const [linksModalOpen, setLinksModalOpen] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = useCallback(async (force = false) => {
        setProfileLoading(true);
        setProfileError(null);

        try {
            const response = await authService.getMeProfile(force);
            setProfile(response);
        } catch (error: any) {
            setProfileError(error?.response?.data?.message || "Unable to load profile");
        } finally {
            setProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authUser) {
            setProfile(null);
            setProfileLoading(false);
            setProfileError("Sign in to view your profile");
            return;
        }

        // initial fetch without force
        fetchProfile();
    }, [authUser?.user_id, fetchProfile]);

    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(BANNER_URI_KEY);
                setSavedBannerUri(saved || null);
            } catch (err) {
                console.warn("[ProfileScreen] Failed to load banner URI", err);
            }
        })();
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // force bypass caches
            await fetchProfile(true);
        } finally {
            setRefreshing(false);
        }
    }, [fetchProfile]);

    const username = profile?.username || authUser?.username || "";
    const name = profile?.name || authUser?.name || username;
    const bio = (profile?.bio || "").trim();
    const labelFromUrl = (value: string) => {
        const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        try {
            const parsed = new URL(normalized);
            return parsed.host.replace(/^www\./i, "");
        } catch {
            return value.replace(/^https?:\/\//i, "");
        }
    };
    const parseProfileLinks = (raw: string | null | undefined): Array<{ name: string; url: string }> => {
        if (!raw) return [];
        try {
            if (String(raw).trim().startsWith("[")) {
                const arr = JSON.parse(String(raw));
                if (Array.isArray(arr)) {
                    return arr
                        .map((x: any) => ({ name: String(x?.name || "").trim(), url: String(x?.url || "").trim() }))
                        .filter((x: { name: string; url: string }) => x.name && x.url)
                        .slice(0, 3);
                }
            }
        } catch {
            // fallback to legacy plain URL format
        }
        const urls = Array.from(new Set(
            String(raw)
                .split(/[\s,\n]+/)
                .map((s) => s.trim())
                .filter(Boolean)
        )).slice(0, 3);
        return urls.map((url) => ({ name: labelFromUrl(url), url }));
    };
    const profileLinks = parseProfileLinks(profile?.link_url);
    const workoutsCount = profile?._count.workouts ?? 0;
    const followersCount = profile?._count.followers ?? 0;
    const followingCount = profile?._count.following ?? 0;
    const bannerImages = savedBannerUri ? [savedBannerUri, savedBannerUri, savedBannerUri] : PROFILE_BANNER;
    const bannerHeight = scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: [120, 0],
        extrapolate: "clamp",
    });
    const bannerOpacity = scrollY.interpolate({
        inputRange: [0, 80, 120],
        outputRange: [1, 0.4, 0],
        extrapolate: "clamp",
    });
    // Do not provide a dummy/pravatar fallback — prefer null so AvatarImage renders empty box when no image exists
    const avatarUri: null = null;
    const normalizeExternalUrl = (value: string) => {
        if (!value) return "";
        if (/^https?:\/\//i.test(value)) return value;
        return `https://${value}`;
    };
    const getHostLabel = (value: string) => {
        try {
            const parsed = new URL(normalizeExternalUrl(value));
            return parsed.host.replace(/^www\./i, "");
        } catch {
            return value.replace(/^https?:\/\//i, "");
        }
    };
    const openProfileLink = async (value: string) => {
        const url = normalizeExternalUrl(value);
        if (!url) return;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        } catch (err) {
            console.warn("[ProfileScreen] Failed opening profile link", err);
        }
    };

    return (
        <LinearGradient
            colors={[
                "#0e0e11",   // top — slightly blue-black
                "#0a0906",   // upper mid — very slightly warm
                "#080808",   // centre — pure dark
                "#0a0906",   // lower mid — warm again
                "#0b0b0e",   // bottom — slightly cool
            ]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Subtle corner glows */}
            <LinearGradient
                colors={["rgba(255,100,20,0.06)", "transparent"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.3, y: 0.4 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            <LinearGradient
                colors={["rgba(80,50,200,0.03)", "transparent"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0.5, y: 0.6 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <SafeAreaView style={st.safe} edges={["top"]}>
                <View style={[st.topHeader, { top: insets.top }]}>
                    <Text style={st.topName}>{username || "-"}</Text>
                    <View style={st.iconRow}>
                        <TouchableOpacity style={st.iconBtn} activeOpacity={0.7}
                                          onPress={() => router.push("/Profile/edit-profile")}>
                            <Ionicons name="pencil-outline" size={17} color={TEXT} />
                        </TouchableOpacity>
                        <TouchableOpacity style={st.iconBtn} activeOpacity={0.7}>
                            <Ionicons name="share-social-outline" size={17} color={TEXT} />
                        </TouchableOpacity>
                        <TouchableOpacity style={st.iconBtn} activeOpacity={0.7}
                                          onPress={() => router.push("/Profile/Settings")}>
                            <Ionicons name="settings-outline" size={17} color={TEXT} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Animated.ScrollView
                    style={st.scroll}
                    contentContainerStyle={[st.scrollContent, { paddingTop: topBarHeight }]}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[ORANGE]}
                            tintColor={ORANGE}
                        />
                    }
                >
                    <Animated.View style={[st.bannerWrap, { height: bannerHeight, opacity: bannerOpacity }]}>
                        <View style={st.bannerGrid}>
                            {bannerImages.map((img, i) => (
                                <Image key={i} source={{ uri: img }} style={st.bannerImg} />
                            ))}
                        </View>
                        <LinearGradient
                            colors={["transparent", BG]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={st.bannerFade}
                            pointerEvents="none"
                        />
                    </Animated.View>

                    {/* Profile row */}
                    <View style={st.profileRow}>
                        <View style={st.avatarWrap}>
                            <AvatarRing />
                            <AvatarImage src={profile?.profile_pic_url ?? null} style={st.avatarImg} />
                            <View style={st.onlineDot} />
                        </View>
                        <View style={st.userInfo}>
                            <Text style={st.username}>{name || "-"}</Text>
                            {profileLoading && (
                                <View style={st.profileStatusRow}>
                                    <ActivityIndicator size="small" color={ORANGE} />
                                    <Text style={st.profileStatusText}>Loading profile...</Text>
                                </View>
                            )}
                            {!profileLoading && profileError && (
                                <Text style={st.profileErrorText}>{profileError}</Text>
                            )}
                            <View style={st.statsRow}>
                                <View style={st.statBlock}>
                                    <Text style={st.statNum}>{workoutsCount}</Text>
                                    <Text style={st.statLbl}>Workouts</Text>
                                </View>
                                <View style={st.statDivider} />
                                <TouchableOpacity style={st.statBlock} activeOpacity={0.8} onPress={() => setPeopleModal("Followers")}>
                                    <Text style={st.statNum}>{followersCount}</Text>
                                    <Text style={st.statLbl}>Followers</Text>
                                </TouchableOpacity>
                                <View style={st.statDivider} />
                                <TouchableOpacity style={st.statBlock} activeOpacity={0.8} onPress={() => setPeopleModal("Following")}>
                                    <Text style={st.statNum}>{followingCount}</Text>
                                    <Text style={st.statLbl}>Following</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    {(bio.length > 0 || profileLinks.length > 0) && (
                        <View style={st.bioLinkWrap}>
                            {bio.length > 0 && (
                                <Text style={st.bioText}>{bio}</Text>
                            )}
                            {profileLinks.length > 0 && (
                                <TouchableOpacity style={st.linkChip} activeOpacity={0.8} onPress={() => setLinksModalOpen(true)}>
                                    <Feather name="link-2" size={13} color={ORANGE} />
                                    <Text style={st.linkText} numberOfLines={1}>
                                        {profileLinks.length === 1
                                            ? profileLinks[0].name
                                            : `${profileLinks[0].name} and ${profileLinks.length - 1} more`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Chart card */}
                    <LinearGradient
                        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={st.chartCard}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.09)", "transparent"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={st.chartShine}
                            pointerEvents="none"
                        />
                        <View style={st.chartInner}>
                            <Text style={st.chartLabel}>{tab} — This week</Text>
                            <SparkBars tab={tab} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
                        </View>
                    </LinearGradient>

                    {/* Toggle */}
                    <View style={st.toggleRow}>
                        {(["Duration", "Volume", "Reps"] as const).map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[st.toggleBtn, tab === item && st.toggleActive]}
                                onPress={() => setTab(item)}
                                activeOpacity={0.8}
                            >
                                {tab === item && (
                                    <LinearGradient
                                        colors={[ORANGE, ORANGE2]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                <Text style={[st.toggleTxt, tab === item && st.toggleActiveTxt]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Dashboard */}
                    <Text style={st.sectionTitle}>Dashboard</Text>
                    <View style={st.dashGrid}>
                        {DASH_ITEMS.map((item) => (
                            <View key={item.label}>
                                <GlowCard
                                    label={item.label}
                                    sub={item.sub}
                                    icon={item.icon}
                                    startOffset={item.startOffset}
                                    onPress={() => {
                                        if (item.route) {
                                            router.push(item.route);
                                        }
                                    }}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Recent sessions */}
                    <Text style={st.sectionTitle}>Recent Sessions</Text>
                    <LinearGradient
                        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={st.sessionCard}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={st.chartShine}
                            pointerEvents="none"
                        />
                        <Feather name="heart" size={38} color="rgba(255,255,255,0.12)" />
                        <Text style={st.noDataText}>No recent workouts yet</Text>
                    </LinearGradient>

                    {/* Start tracking */}
                    <TouchableOpacity style={st.startRow} activeOpacity={0.8} onPress={() => router.push("/(tabs)/workout")}>
                        <Text style={st.startText}>Start tracking here</Text>
                        <Feather name="chevron-down" size={16} color={ORANGE} />
                    </TouchableOpacity>
                </Animated.ScrollView>

                <PeopleModal
                    visible={!!peopleModal}
                    title={peopleModal || ""}
                    people={peopleModal === "Followers" ? (profile?.followers || []) : (profile?.following || [])}
                    onClose={() => setPeopleModal(null)}
                    onUnfollow={fetchProfile}
                />
                <Modal visible={linksModalOpen} transparent animationType="fade" onRequestClose={() => setLinksModalOpen(false)}>
                    <View style={peopleSt.overlay}>
                        <Pressable style={peopleSt.backdrop} onPress={() => setLinksModalOpen(false)} />
                        <View style={peopleSt.sheet}>
                            <View style={peopleSt.handle} />
                            <Text style={peopleSt.title}>Links</Text>
                            <View style={peopleSt.listContent}>
                                {profileLinks.map((item, idx) => (
                                    <TouchableOpacity
                                        key={`${item.url}-${idx}`}
                                        style={st.linkOptionRow}
                                        activeOpacity={0.85}
                                        onPress={() => {
                                            setLinksModalOpen(false);
                                            openProfileLink(item.url);
                                        }}
                                    >
                                        <Feather name="link-2" size={15} color={ORANGE} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={st.linkOptionText} numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            <Text style={st.linkOptionSubText} numberOfLines={1}>
                                                {getHostLabel(item.url)}
                                            </Text>
                                        </View>
                                        <Feather name="chevron-right" size={14} color={MUTED} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ─── Main styles ──────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    safe: { flex: 1 },
    bannerWrap: {
        height: 120,
        position: "relative",
        overflow: "hidden",
        marginHorizontal: -16,
    },
    bannerGrid: {
        flexDirection: "row",
        height: "100%",
    },
    bannerImg: {
        flex: 1,
    },
    bannerFade: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
    },

    topHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 18,
        paddingTop: Platform.OS === "android" ? 6 : 8,
        paddingBottom: Platform.OS === "android" ? 8 : 10,
        minHeight: Platform.OS === "android" ? 42 : 48,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        backgroundColor: "#080808",
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.04)",
    },
    topName: {
        fontSize: Platform.OS === "android" ? 22 : 26,
        fontWeight: "700",
        color: TEXT,
        letterSpacing: Platform.OS === "android" ? -0.4 : -0.6,
    },
    iconRow: { flexDirection: "row", alignItems: "center", gap: Platform.OS === "android" ? 12 : 18 },
    iconBtn: {
        width: Platform.OS === "android" ? 34 : 36,
        height: Platform.OS === "android" ? 34 : 36,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: Platform.OS === "android" ? 10 : 12,
        alignItems: "center",
        justifyContent: "center",
    },

    profileRow: {
        flexDirection: "row", alignItems: "center",
        gap: 20, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 0,
    },
    avatarWrap: { width: 84, height: 84, position: "relative", flexShrink: 0 },
    avatarImg: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: "#1a1a1a",
        position: "absolute", top: 2, left: 2, zIndex: 2,
    },
    onlineDot: {
        position: "absolute", bottom: 3, right: 3,
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: "#34c759", borderWidth: 2.5, borderColor: BG, zIndex: 3,
    },
    userInfo: { flex: 1 },
    username: {
        fontSize: 18, fontWeight: "700", color: TEXT,
        letterSpacing: -0.3, marginBottom: 12,
    },
    profileStatusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    profileStatusText: { fontSize: 11, color: MUTED },
    profileErrorText: { fontSize: 11, color: ORANGE, marginBottom: 10 },
    statsRow: { flexDirection: "row", alignItems: "center" },
    statBlock: { flex: 1, alignItems: "center" },
    statNum: { fontSize: 17, fontWeight: "700", color: ORANGE, letterSpacing: -0.3 },
    statLbl: { fontSize: 10, color: MUTED, marginTop: 2, letterSpacing: 0.3 },
    statDivider: { width: 0.5, height: 28, backgroundColor: "rgba(255,255,255,0.07)" },
    bioLinkWrap: {
        marginTop: 12,
        marginBottom: 2,
        paddingHorizontal: 22,
        gap: 10,
    },
    bioText: {
        color: "rgba(240,237,232,0.88)",
        fontSize: 13,
        lineHeight: 19,
        letterSpacing: -0.1,
    },
    linkChip: {
        alignSelf: "flex-start",
        maxWidth: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingVertical: 7,
        paddingHorizontal: 11,
        borderRadius: 999,
        backgroundColor: "rgba(255,122,0,0.10)",
        borderWidth: 0.5,
        borderColor: "rgba(255,122,0,0.34)",
    },
    linkText: {
        color: ORANGE,
        fontSize: 12,
        fontWeight: "600",
        maxWidth: 260,
    },
    linkOptionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 11,
        marginBottom: 10,
    },
    linkOptionText: {
        color: TEXT,
        fontSize: 13,
        fontWeight: "600",
    },
    linkOptionSubText: {
        color: MUTED,
        fontSize: 11,
        marginTop: 1,
    },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

    chartCard: {
        marginTop: 20,
        borderWidth: 0.5, borderColor: GLASS_B,
        borderRadius: 22, overflow: "hidden", position: "relative",
    },
    chartShine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
    },
    chartInner: { padding: 20 },
    chartLabel: {
        fontSize: 11, fontWeight: "600", color: MUTED,
        letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14,
    },

    toggleRow: { flexDirection: "row", gap: 6, marginTop: 18 },
    toggleBtn: {
        flex: 1, paddingVertical: 9,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 20, alignItems: "center",
        overflow: "hidden", position: "relative",
    },
    toggleActive: {
        borderColor: "transparent",
        ...Platform.select({
            ios: { shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    toggleTxt: { fontSize: 13, fontWeight: "500", color: MUTED },
    toggleActiveTxt: { color: "#fff", fontWeight: "700" },

    sectionTitle: {
        fontSize: 16, fontWeight: "700", color: TEXT,
        letterSpacing: -0.3, marginTop: 24, marginBottom: 14,
    },

    dashGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

    sessionCard: {
        borderWidth: 0.5, borderColor: GLASS_B,
        borderRadius: 22, paddingVertical: 32, paddingHorizontal: 20,
        alignItems: "center", gap: 10,
        position: "relative", overflow: "hidden",
    },
    noDataText: { fontSize: 13, color: HINT },

    startRow: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "center", gap: 5,
        marginTop: 22, paddingVertical: 12,
    },
    startText: { fontSize: 15, fontWeight: "600", color: ORANGE, letterSpacing: -0.2 },
});

const peopleSt = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "flex-end",
    },
    backdrop: { flex: 1 },
    sheet: {
        maxHeight: "70%",
        backgroundColor: "#111214",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.08)",
        paddingTop: 12,
        paddingBottom: 20,
    },
    handle: {
        width: 42,
        height: 4,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignSelf: "center",
        marginBottom: 14,
    },
    title: {
        color: TEXT,
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    listContent: {
        paddingHorizontal: 18,
        paddingBottom: 16,
    },
    emptyText: {
        color: MUTED,
        fontSize: 14,
        textAlign: "center",
        marginTop: 24,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255,255,255,0.06)",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#1a1a1a",
    },
    textWrap: {
        marginLeft: 12,
        flex: 1,
    },
    name: {
        color: TEXT,
        fontSize: 15,
        fontWeight: "600",
    },
    username: {
        color: MUTED,
        fontSize: 12,
        marginTop: 2,
    },
    followingBtn: {
        marginLeft: 'auto',
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.12)",
    },
    unfollowedBtn: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderColor: "rgba(255,255,255,0.18)",
    },
    removeBtn: {
        marginLeft: 'auto',
        backgroundColor: 'transparent',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: ORANGE,
        minWidth: 88,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removedBtn: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,0.12)',
    },
    removeBtnActive: {
        backgroundColor: ORANGE,
        borderColor: ORANGE,
    },
    followingBtnText: {
        color: TEXT,
        fontSize: 12,
        fontWeight: "500",
    },
    removeBtnText: {
        fontSize: 12,
        fontWeight: "500",
    },
});

// ─── Ring styles ──────────────────────────────────────────────────────────────
// ─── Ring styles ──────────────────────────────────────────────────────────────
const ringSt = StyleSheet.create({
    container: {
        position: "absolute",
        width: 84, height: 84, borderRadius: 200,
        overflow: "hidden", backgroundColor: "transparent", zIndex: 1,
    },
    staticLayer: {
        position: "absolute",
        width: "200%", height: "200%",
        top: "-50%", left: "-50%",
        alignItems: "center",
        transform: [{ rotate: "45deg" }], // Tilts the static glow
    },
    beam: {
        width: "100%", height: "100%"
    },
    mask: {
        position: "absolute",
        top: 2, left: 2, right: 2, bottom: 2,
        borderRadius: 200, backgroundColor: BG, zIndex: 2,
    },
});

// ─── Glow card styles ─────────────────────────────────────────────────────────
const glowSt = StyleSheet.create({
    wrap: {
        width: CARD_W,
        borderRadius: BORDER_R,
        overflow: "hidden",
        padding: 1.5,
        backgroundColor: "transparent", // No resting color. Matches HTML exactly.
        position: "relative",
    },
    spinContainer: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: BORDER_R, overflow: "hidden",
    },
    spinLayer: {
        position: "absolute",
        width: "200%", height: "200%",
        top: "-50%", left: "-50%",
        alignItems: "center", // Keeps the gradient centered horizontally
    },
    beam: {
        width: "100%",
        height: "50%" // Only covering half height ensures a single bright spot sweeps by
    },
    inner: {
        borderRadius: BORDER_R - 1.5,
        overflow: "hidden",
        position: "relative",
    },
    shineLine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1, zIndex: 1,
    },
    bottomGlow: {
        position: "absolute", bottom: 0, left: 0, right: 0, height: 40, zIndex: 1,
    },
    flashOverlay: {
        ...StyleSheet.absoluteFillObject, zIndex: 2,
    },
    dashContent: {
        padding: 12,
        paddingHorizontal: 12,
        flexDirection: "column",
        gap: 12,
    },
    iconCircle: {
        width: 38, height: 38, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.25)",
        overflow: "hidden",
    },
    dashText: {
        fontSize: 14, fontWeight: "600",
        color: TEXT, letterSpacing: -0.2,
    },
    dashSub: {
        fontSize: 11, color: MUTED, marginTop: -10,
    },
});

// ─── Chart styles ─────────────────────────────────────────────────────────────
const chartSt = StyleSheet.create({
    row: {
        flexDirection: "row", alignItems: "flex-end",
        gap: 5, height: 80, paddingHorizontal: 4,
    },
    bar: {
        width: "100%",
        borderTopLeftRadius: 4, borderTopRightRadius: 4,
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.15)",
        overflow: "hidden",
    },

    barActive: {
        borderColor: "rgba(255,120,37,0.4)",
        ...Platform.select({
            ios: { shadowColor: ORANGE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6 },
            android: { elevation: 4 },
        }),
    },
    labelsRow: {
        flexDirection: "row",
        paddingHorizontal: 4,
        marginTop: 6,
    },

    lbl: { fontSize: 9, color: HINT },
});
