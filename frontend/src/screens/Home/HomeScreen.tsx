import React, { useMemo, useState, useEffect } from "react";
import {
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withRepeat,
    interpolate,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type Athlete = {
    name: string;
    username: string;
    avatarUrl: string;
    sport?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const BG         = AppColors.black;
const IS_ANDROID = Platform.OS === "android";

// Smooth config — no bounce, just clean spring
const SMOOTH = { damping: 22, stiffness: 180, mass: 1 };

const ALL_ATHLETES: Athlete[] = [
    { name: "Alex",   username: "alexfit",     avatarUrl: "https://i.pravatar.cc/150?img=12", sport: "Sprinter" },
    { name: "Maya",   username: "mayalifts",   avatarUrl: "https://i.pravatar.cc/150?img=32", sport: "Lifter"   },
    { name: "Noah",   username: "noahrun",     avatarUrl: "https://i.pravatar.cc/150?img=56", sport: "Runner"   },
    { name: "Sara",   username: "sarahit",     avatarUrl: "https://i.pravatar.cc/150?img=3",  sport: "Cyclist"  },
    { name: "Hamza",  username: "hamzafit",    avatarUrl: "https://i.pravatar.cc/150?img=20", sport: "Fighter"  },
    { name: "Liya",   username: "liyamove",    avatarUrl: "https://i.pravatar.cc/150?img=24", sport: "Dancer"   },
    { name: "Rayan",  username: "rayanrun",    avatarUrl: "https://i.pravatar.cc/150?img=45", sport: "Swimmer"  },
    { name: "Zara",   username: "zaraflex",    avatarUrl: "https://i.pravatar.cc/150?img=18", sport: "Gymnast"  },
    { name: "Aisha",  username: "aishastrong", avatarUrl: "https://i.pravatar.cc/150?img=28", sport: "CrossFit" },
    { name: "Nihal",  username: "nihalfit",    avatarUrl: "https://i.pravatar.cc/150?img=36", sport: "Boxer"    },
];
// ─── Pulsing Orb ──────────────────────────────────────────────────────────────
function PulsingOrb() {
    const scale   = useSharedValue(1);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.16, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(1,    { duration: 1800, easing: Easing.inOut(Easing.sin) })
            ), -1, false
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.9,  { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.35, { duration: 1800, easing: Easing.inOut(Easing.sin) })
            ), -1, false
        );
    }, []);

    const outerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));
    const innerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value * 0.8 }],
    }));
    return (
        <View style={styles.orbStack}>
            <Animated.View style={[styles.orbOuter, outerStyle]} />
            <Animated.View style={[styles.orbInner, innerStyle]} />
            <View style={styles.orbCore} />
        </View>
    );
}
// ─── Athlete Card ─────────────────────────────────────────────────────────────
function AthleteCard({ item, index, isFollowed, onToggle, onPress, cardWidth }: {
    item: Athlete; index: number; isFollowed: boolean;
    onToggle: () => void; onPress: () => void; cardWidth: number;
}) {
    const cardScale   = useSharedValue(1);
    const followed    = useSharedValue(isFollowed ? 1 : 0);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        // Smooth color transition, no bounce
        followed.value = withTiming(isFollowed ? 1 : 0, { duration: 300, easing: Easing.out(Easing.cubic) });
        if (isFollowed) {
            glowOpacity.value = withSequence(
                withTiming(1, { duration: 150 }),
                withTiming(0, { duration: 500 })
            );
        }
    }, [isFollowed]);

    const cardAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const btnAnimStyle = useAnimatedStyle(() => ({
        backgroundColor: followed.value > 0.5 ? "transparent" : ORANGE,
        borderWidth: 1,
        borderColor: ORANGE,
        opacity: interpolate(followed.value, [0, 1], [1, 0.75]),
    }));

    const handlePressIn  = () => {
        // Subtle scale, no bounce
        cardScale.value = withTiming(0.97, { duration: 120, easing: Easing.out(Easing.cubic) });
    };
    const handlePressOut = () => {
        cardScale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    };

    const handleFollow = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        // Smooth scale transition on button, no bounce
        followed.value = withTiming(isFollowed ? 0 : 1, { duration: 250, easing: Easing.out(Easing.cubic) });
        runOnJS(onToggle)();
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).duration(400).easing(Easing.out(Easing.cubic))}>
            <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
                <Animated.View style={[styles.cardGlow, glowStyle]} />
                <Animated.View style={[cardAnimStyle, { width: cardWidth }]}>
                    <BlurView intensity={IS_ANDROID ? 10 : 18} tint="dark" style={[styles.card, { width: cardWidth }]}>
                        <View style={styles.avatarRing}>
                            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                        </View>
                        <Text allowFontScaling={false} numberOfLines={1} style={styles.cardName}>{item.name}</Text>
                        <Text allowFontScaling={false} style={styles.cardSport}>{item.sport ?? "Feature"}</Text>
                        <View style={styles.cardDivider} />
                        <TouchableOpacity onPress={handleFollow} activeOpacity={0.85} style={{ width: "100%" }}>
                            <Animated.View style={[styles.followBtn, btnAnimStyle]}>
                                {isFollowed && <Ionicons name="checkmark" size={11} color={ORANGE} style={{ marginRight: 3 }} />}
                                <Text allowFontScaling={false} style={[styles.followText, isFollowed && { color: ORANGE }]}>
                                    {isFollowed ? "Following" : "Follow"}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </BlurView>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconButton({ name, onPress, badge }: { name: any; onPress: () => void; badge?: boolean }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        // Smooth press, no bounce
        scale.value = withSequence(
            withTiming(0.85, { duration: 80, easing: Easing.out(Easing.cubic) }),
            withTiming(1,    { duration: 150, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onPress)();
    };

    return (
        <TouchableOpacity onPress={press} activeOpacity={1}>
            <Animated.View style={[styles.iconBtn, animStyle]}>
                <Ionicons name={name} size={IS_ANDROID ? 19 : 21} color={ORANGE} />
                {badge && <View style={styles.badge} />}
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Premium Button ───────────────────────────────────────────────────────────
function PremiumButton({ label, onPress, filled }: { label: string; onPress: () => void; filled?: boolean }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withTiming(0.97, { duration: 80, easing: Easing.out(Easing.cubic) }),
            withTiming(1,    { duration: 160, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onPress)();
    };

    return (
        <TouchableOpacity onPress={press} activeOpacity={1}>
            <Animated.View style={[styles.bigBtn, filled && styles.bigBtnFilled, animStyle]}>
                <Text allowFontScaling={false} style={[styles.bigBtnText, filled && styles.bigBtnTextFilled]}>
                    {label}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={filled ? BG : ORANGE} style={{ marginLeft: 6 }} />
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────
function MenuItem({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress: () => void }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        scale.value = withSequence(
            withTiming(0.96, { duration: 80 }),
            withTiming(1,    { duration: 140 })
        );
        runOnJS(onPress)();
    };

    return (
        <TouchableOpacity onPress={press} activeOpacity={0.8}>
            <Animated.View style={[styles.menuItem, animStyle]}>
                <View style={[styles.menuIconWrap, active && styles.menuIconActive]}>
                    <Ionicons name={icon} size={16} color={active ? ORANGE : "#aaa"} />
                </View>
                <Text allowFontScaling={false} style={[styles.menuText, active && styles.menuTextActive]}>
                    {label}
                </Text>
                {active && (
                    <View style={styles.activeDot} />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
    const { width } = useWindowDimensions();
    const [followed,   setFollowed]   = useState<Set<string>>(new Set());
    const [menuOpen,   setMenuOpen]   = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query,      setQuery]      = useState("");

    // Menu — smooth fade + scale, no bounce
    const menuScale   = useSharedValue(0.92);
    const menuOpacity = useSharedValue(0);

    useEffect(() => {
        if (menuOpen) {
            menuOpacity.value = withTiming(1,    { duration: 200, easing: Easing.out(Easing.cubic) });
            menuScale.value   = withTiming(1,    { duration: 220, easing: Easing.out(Easing.cubic) });
        } else {
            menuOpacity.value = withTiming(0,    { duration: 160, easing: Easing.in(Easing.cubic) });
            menuScale.value   = withTiming(0.92, { duration: 160, easing: Easing.in(Easing.cubic) });
        }
    }, [menuOpen]);

    const menuAnimStyle = useAnimatedStyle(() => ({
        opacity:   menuOpacity.value,
        transform: [{ scale: menuScale.value }],
    }));

    const toggleFollow = (username: string) => {
        setFollowed((prev) => {
            const next = new Set(prev);
            if (next.has(username)) next.delete(username);
            else next.add(username);
            return next;
        });
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ALL_ATHLETES;
        return ALL_ATHLETES.filter(
            (a) => a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q)
        );
    }, [query]);

    const cardWidth = Math.min(
        IS_ANDROID ? 110 : 118,
        Math.max(IS_ANDROID ? 100 : 104, (width - 64) / 3)
    );

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.bgAccent1} />
            <View style={styles.bgAccent2} />

            {/* ── Header ── */}
            <Animated.View
                entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))}
                style={styles.header}
            >
                <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); setMenuOpen(true); }}
                    style={styles.titleRow}
                    activeOpacity={0.7}
                >
                    <Text allowFontScaling={false} style={styles.title}>Home</Text>
                    <View style={styles.chevronWrap}>
                        <Ionicons name="chevron-down" size={13} color={ORANGE} />
                    </View>
                </TouchableOpacity>

                <View style={styles.actions}>
                    <IconButton name="search-outline"        onPress={() => setSearchOpen(true)} />
                    <IconButton name="notifications-outline" onPress={() => router.push("/(tabs)/home/notifications")} badge />
                </View>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

                {/* ── Section Header — NO "DISCOVER" eyebrow ── */}
                <Animated.View
                    entering={FadeInDown.delay(80).duration(400).easing(Easing.out(Easing.cubic))}
                    style={styles.sectionRow}
                >
                    <Text allowFontScaling={false} style={styles.sectionTitle}>Suggested Athletes</Text>

                    <TouchableOpacity
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push({ pathname: "/(tabs)/home/contacts", params: { mode: "invite" } });
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.invitePill}>
                            <Ionicons name="add" size={13} color={ORANGE} />
                            <Text allowFontScaling={false} style={styles.inviteText}>Invite a friend</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Cards ── */}
                <View style={{ height: IS_ANDROID ? 182 : 196, marginTop: 10 }}>
                    <FlatList
                        horizontal
                        data={ALL_ATHLETES}
                        keyExtractor={(item) => item.username}
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                        contentContainerStyle={styles.listPadding}
                        renderItem={({ item, index }) => (
                            <AthleteCard
                                item={item} index={index} cardWidth={cardWidth}
                                isFollowed={followed.has(item.username)}
                                onToggle={() => toggleFollow(item.username)}
                                onPress={() => router.push("/(tabs)/profile")}
                            />
                        )}
                    />
                </View>

                {/* ── Placeholder Orb ── */}
                <Animated.View
                    entering={FadeIn.delay(350).duration(500).easing(Easing.out(Easing.cubic))}
                    style={styles.center}
                >
                    <PulsingOrb />
                    <View style={styles.placeholderLines}>
                        <View style={[styles.placeholderLine, { width: width * 0.55 }]} />
                        <View style={[styles.placeholderLine, { width: width * 0.44, opacity: 0.5 }]} />
                    </View>
                    <Text allowFontScaling={false} style={styles.hint}>
                        FOLLOW PEOPLE TO SEE THEIR{"\n"}WORKOUTS IN YOUR FEED.
                    </Text>
                </Animated.View>

                {/* ── Footer Buttons ── */}
                <Animated.View
                    entering={FadeInUp.delay(450).duration(400).easing(Easing.out(Easing.cubic))}
                    style={styles.bottomActions}
                >
                    <PremiumButton
                        label="Discover Athletes"
                        onPress={() => router.push("/(tabs)/home/discover")}
                        filled
                    />
                    <View style={{ height: 10 }} />
                    <PremiumButton
                        label="Connect Contacts"
                        onPress={() => router.push({ pathname: "/(tabs)/home/contacts", params: { mode: "connect" } })}
                    />
                </Animated.View>
            </ScrollView>

            {/* ── Dropdown Menu ── */}
            <Modal visible={menuOpen} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
                <Animated.View style={[styles.menu, menuAnimStyle]}>
                    <BlurView intensity={60} tint="dark" style={styles.menuBlur}>
                        {/* Higher blur + more opaque bg for readability */}
                        <MenuItem
                            icon="home-outline"
                            label="Home (Following)"
                            active
                            onPress={() => { setMenuOpen(false); router.push("/(tabs)/home"); }}
                        />
                        <View style={styles.menuDivider} />
                        <MenuItem
                            icon="compass-outline"
                            label="Discover"
                            onPress={() => { setMenuOpen(false); router.push("/(tabs)/home/discover"); }}
                        />
                    </BlurView>
                </Animated.View>
            </Modal>

            {/* ── Search Modal ── */}
            <Modal visible={searchOpen} animationType="slide">
                <SafeAreaView style={styles.searchWrap} edges={["top", "left", "right"]}>
                    <Animated.View
                        entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))}
                        style={styles.searchHeader}
                    >
                        <TouchableOpacity
                            onPress={() => { setSearchOpen(false); setQuery(""); }}
                            style={styles.backBtn}
                        >
                            <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                        </TouchableOpacity>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={16} color={AppColors.grey} />
                            <TextInput
                                value={query} onChangeText={setQuery}
                                placeholder="Search athletes..."
                                placeholderTextColor={AppColors.grey}
                                style={styles.searchInput} autoFocus allowFontScaling={false}
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery("")}>
                                    <Ionicons name="close-circle" size={16} color={AppColors.grey} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>

                    {filtered.length === 0 ? (
                        <Animated.View entering={FadeIn.duration(260)} style={styles.emptySearch}>
                            <Ionicons name="search" size={40} color={AppColors.darkGrey} />
                            <Text allowFontScaling={false} style={styles.emptySearchText}>No athletes found</Text>
                        </Animated.View>
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item.username}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item, index }) => (
                                <Animated.View
                                    entering={FadeInDown.delay(index * 35).duration(280).easing(Easing.out(Easing.cubic))}
                                >
                                    <TouchableOpacity
                                        onPress={() => { setSearchOpen(false); setQuery(""); router.push("/(tabs)/profile"); }}
                                        activeOpacity={0.7}
                                        style={styles.searchRow}
                                    >
                                        <Image source={{ uri: item.avatarUrl }} style={styles.searchAvatar} />
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={styles.searchName}>{item.name}</Text>
                                            <Text allowFontScaling={false} style={styles.searchUsername}>@{item.username}</Text>
                                        </View>
                                        <View style={styles.searchSportTag}>
                                            <Text style={styles.searchSportText}>{item.sport}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    bgAccent1: { position: "absolute", width: 260, height: 260, borderRadius: 130, top: -80, right: -80, backgroundColor: "rgba(255,107,53,0.05)" },
    bgAccent2: { position: "absolute", width: 200, height: 200, borderRadius: 100, bottom: 140, left: -60, backgroundColor: "rgba(255,107,53,0.03)" },

    header: { height: IS_ANDROID ? 52 : 58, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    title: { color: AppColors.white, fontWeight: "800", fontSize: IS_ANDROID ? 22 : 24, letterSpacing: -0.4 },
    chevronWrap: { backgroundColor: "rgba(255,107,53,0.18)", borderRadius: 7, padding: 5 },
    actions: { flexDirection: "row", alignItems: "center", gap: 6 },
    iconBtn: { width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    badge: { position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE, borderWidth: 1.5, borderColor: BG },

    body: { flexGrow: 1, paddingHorizontal: 14, paddingTop: IS_ANDROID ? 4 : 6, paddingBottom: 110 },

    // Section — NO eyebrow, just title + invite
    sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    sectionTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "700" },
    invitePill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,107,53,0.12)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(255,107,53,0.25)", gap: 4 },
    inviteText: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "600" },

    listPadding: { paddingLeft: 2, paddingRight: 14, paddingTop: 6, paddingBottom: 4 },
    cardGlow: { position: "absolute", inset: -2, borderRadius: 18, zIndex: -1, borderWidth: 1.5, borderColor: ORANGE },
    card: { borderRadius: 16, padding: IS_ANDROID ? 10 : 12, alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)", height: IS_ANDROID ? 172 : 186 },
    avatarRing: { width: IS_ANDROID ? 58 : 64, height: IS_ANDROID ? 58 : 64, borderRadius: IS_ANDROID ? 29 : 32, borderWidth: 2, borderColor: "rgba(255,107,53,0.5)", marginBottom: IS_ANDROID ? 7 : 9, padding: 2 },
    avatar: { width: IS_ANDROID ? 54 : 60, height: IS_ANDROID ? 54 : 60, borderRadius: IS_ANDROID ? 27 : 30, backgroundColor: AppColors.darkBg },
    cardName: { color: AppColors.white, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700", textAlign: "center" },
    cardSport: { color: ORANGE, fontSize: 10, fontWeight: "600", letterSpacing: 0.4, marginTop: 2 },
    cardDivider: { width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 9 },
    followBtn: { borderRadius: 20, paddingVertical: IS_ANDROID ? 6 : 7, width: "100%", alignItems: "center", flexDirection: "row", justifyContent: "center" },
    followText: { color: BG, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "800" },

    orbStack: { width: 60, height: 60, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    orbOuter: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,107,53,0.09)", borderWidth: 1, borderColor: "rgba(255,107,53,0.18)" },
    orbInner: { position: "absolute", width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,107,53,0.14)" },
    orbCore: { width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(255,107,53,0.45)" },

    center: { alignItems: "center", paddingTop: IS_ANDROID ? 20 : 28 },
    placeholderLines: { alignItems: "center", gap: 8, marginBottom: 18 },
    placeholderLine: { height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.07)" },
    hint: { color: "rgba(255,255,255,0.22)", fontSize: IS_ANDROID ? 9 : 10, fontWeight: "700", textAlign: "center", letterSpacing: 1.6, lineHeight: 18 },

    bottomActions: { paddingTop: IS_ANDROID ? 22 : 28 },
    bigBtn: { height: IS_ANDROID ? 44 : 50, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.3)", backgroundColor: "rgba(255,107,53,0.07)" },
    bigBtnFilled: { backgroundColor: ORANGE, borderColor: ORANGE },
    bigBtnText: { color: ORANGE, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    bigBtnTextFilled: { color: BG },

    // Menu — increased opacity + blur for readability
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
    menu: { position: "absolute", top: IS_ANDROID ? 62 : 70, left: 14, width: 248, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
    menuBlur: { padding: 6, backgroundColor: "rgba(12,12,12,0.96)" },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10 },
    menuIconWrap: { width: 32, height: 32, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginRight: 10 },
    menuIconActive: { backgroundColor: "rgba(255,107,53,0.18)" },
    menuText: { color: "rgba(255,255,255,0.75)", flex: 1, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "600" },
    menuTextActive: { color: AppColors.white, fontWeight: "700" },
    activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE },
    menuDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 10 },

    searchWrap: { flex: 1, backgroundColor: BG },
    searchHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12, gap: 10 },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.055)", alignItems: "center", justifyContent: "center" },
    searchBar: { flex: 1, height: IS_ANDROID ? 40 : 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.055)", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    searchInput: { flex: 1, color: AppColors.white, fontSize: IS_ANDROID ? 13 : 15, paddingVertical: 0 },
    searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: IS_ANDROID ? 11 : 13, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", gap: 12 },
    searchAvatar: { width: IS_ANDROID ? 40 : 44, height: IS_ANDROID ? 40 : 44, borderRadius: IS_ANDROID ? 20 : 22, backgroundColor: AppColors.darkBg, borderWidth: 1.5, borderColor: "rgba(255,107,53,0.3)" },
    searchName: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    searchUsername: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },
    searchSportTag: { backgroundColor: "rgba(255,107,53,0.12)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    searchSportText: { color: ORANGE, fontSize: 11, fontWeight: "600" },
    emptySearch: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptySearchText: { color: AppColors.grey, fontSize: IS_ANDROID ? 14 : 15 },
});
