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
import { LinearGradient } from "expo-linear-gradient";
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
const ORANGE2    = "#cc5500";
const BG         = "#080808";
const TEXT       = "#f0ede8";
const MUTED      = "rgba(240,237,232,0.42)";
const HINT       = "rgba(240,237,232,0.18)";
const IS_ANDROID = Platform.OS === "android";

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
                withTiming(1.2, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(1,   { duration: 1800, easing: Easing.inOut(Easing.sin) })
            ), -1, false
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.9, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.3, { duration: 1800, easing: Easing.inOut(Easing.sin) })
            ), -1, false
        );
    }, []);

    const outerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));
    const midStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value * 0.82 }],
        opacity: opacity.value * 0.7,
    }));
    const innerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value * 0.6 }],
    }));

    return (
        <View style={orbSt.stack}>
            <Animated.View style={[orbSt.outer, outerStyle]} />
            <Animated.View style={[orbSt.mid,   midStyle]}   />
            <Animated.View style={[orbSt.inner, innerStyle]} />
            <View style={orbSt.core} />
        </View>
    );
}

const orbSt = StyleSheet.create({
    stack: { width: 72, height: 72, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    outer: { position: "absolute", width: 72, height: 72, borderRadius: 36,
        backgroundColor: "rgba(255,120,37,0.06)", borderWidth: 0.5, borderColor: "rgba(255,120,37,0.18)" },
    mid:   { position: "absolute", width: 52, height: 52, borderRadius: 26,
        backgroundColor: "rgba(255,120,37,0.10)", borderWidth: 0.5, borderColor: "rgba(255,120,37,0.25)" },
    inner: { position: "absolute", width: 34, height: 34, borderRadius: 17,
        backgroundColor: "rgba(255,120,37,0.18)" },
    core:  { width: 16, height: 16, borderRadius: 8, backgroundColor: "rgba(255,120,37,0.55)" },
});

// ─── Athlete Card ─────────────────────────────────────────────────────────────
// Static glass card — no spinning animation, clean glassmorphism look
function AthleteCard({
                         item, index, isFollowed, onToggle, onPress, cardWidth,
                     }: {
    item: Athlete; index: number; isFollowed: boolean;
    onToggle: () => void; onPress: () => void; cardWidth: number;
}) {
    const cardScale   = useSharedValue(1);
    const followed    = useSharedValue(isFollowed ? 1 : 0);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        followed.value = withTiming(isFollowed ? 1 : 0, { duration: 280, easing: Easing.out(Easing.cubic) });
        if (isFollowed) {
            glowOpacity.value = withSequence(
                withTiming(1, { duration: 150 }),
                withTiming(0, { duration: 600 })
            );
        }
    }, [isFollowed]);

    const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
    const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
    const btnStyle  = useAnimatedStyle(() => ({
        backgroundColor: followed.value > 0.5 ? "rgba(255,120,37,0.12)" : ORANGE,
        borderColor: ORANGE,
        borderWidth: 1,
    }));

    const handlePressIn  = () => { cardScale.value = withTiming(0.96, { duration: 100 }); };
    const handlePressOut = () => { cardScale.value = withTiming(1,    { duration: 180 }); };
    const handleFollow   = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onToggle)();
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 60).duration(380).easing(Easing.out(Easing.cubic))}>
            <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
                {/* Orange glow flash on follow */}
                <Animated.View style={[cardSt.glowFlash, { width: cardWidth }, glowStyle]} />

                <Animated.View style={[{ width: cardWidth }, cardStyle]}>
                    <LinearGradient
                        colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[cardSt.card, { width: cardWidth }]}
                    >
                        {/* Top shine */}
                        <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={cardSt.shine}
                            pointerEvents="none"
                        />

                        {/* Orange border accent — static, matches glassmorphism style */}
                        <View style={[
                            cardSt.borderAccent,
                            isFollowed && { backgroundColor: ORANGE },
                        ]} />

                        {/* Avatar */}
                        <View style={cardSt.avatarRing}>
                            <Image source={{ uri: item.avatarUrl }} style={cardSt.avatar} />
                            <View style={cardSt.onlineDot} />
                        </View>

                        <Text allowFontScaling={false} style={cardSt.name}>
                            {item.name}
                        </Text>

                        <Text allowFontScaling={false} style={cardSt.sport}>
                            {item.sport ?? "Athlete"}
                        </Text>

                        <View style={cardSt.divider} />

                        {/* Follow button */}
                        <TouchableOpacity onPress={handleFollow} activeOpacity={0.85} style={{ width: "100%" }}>
                            <Animated.View style={[cardSt.followBtn, btnStyle]}>
                                {isFollowed && (
                                    <Ionicons name="checkmark" size={10} color={ORANGE} style={{ marginRight: 3 }} />
                                )}
                                <Text
                                    allowFontScaling={false}
                                    style={[cardSt.followTxt, isFollowed && { color: ORANGE }]}
                                >
                                    {isFollowed ? "Following" : "Follow"}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}

const cardSt = StyleSheet.create({
    glowFlash: {
        position: "absolute", inset: 0, borderRadius: 16,
        borderWidth: 1.5, borderColor: ORANGE, zIndex: -1,
    },
    card: {
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.09)",
        overflow: "hidden",
        padding: IS_ANDROID ? 10 : 12,
        alignItems: "center",
        height: IS_ANDROID ? 172 : 186,
        position: "relative",
    },
    shine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
    },
    // Thin orange top bar — replaces the spinning animation, still looks premium
    borderAccent: {
        position: "absolute", top: 0, left: 0, right: 0,
        height: 1.5,
        backgroundColor: "rgba(255,120,37,0.35)",
    },
    avatarRing: {
        width: IS_ANDROID ? 58 : 64,
        height: IS_ANDROID ? 58 : 64,
        borderRadius: IS_ANDROID ? 29 : 32,
        borderWidth: 2,
        borderColor: "rgba(255,120,37,0.45)",
        marginBottom: IS_ANDROID ? 8 : 10,
        padding: 2,
        position: "relative",
    },
    avatar: {
        width: "100%", height: "100%",
        borderRadius: IS_ANDROID ? 27 : 30,
        backgroundColor: "#1a1a1a",
    },
    onlineDot: {
        position: "absolute", bottom: 1, right: 1,
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: "#34c759",
        borderWidth: 2, borderColor: "#0e0e0e",
    },
    name: {
        color: TEXT, fontSize: IS_ANDROID ? 11 : 12,
        fontWeight: "700", textAlign: "center", letterSpacing: -0.2,
    },
    sport: {
        color: ORANGE, fontSize: 10,
        fontWeight: "600", letterSpacing: 0.3, marginTop: 2,
    },
    divider: {
        width: "100%", height: 0.5,
        backgroundColor: "rgba(255,255,255,0.07)",
        marginVertical: IS_ANDROID ? 8 : 10,
    },
    followBtn: {
        borderRadius: 20, paddingVertical: IS_ANDROID ? 6 : 7,
        width: "100%", alignItems: "center",
        flexDirection: "row", justifyContent: "center",
    },
    followTxt: {
        color: BG, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "800",
    },
});

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconButton({ name, onPress, badge }: { name: any; onPress: () => void; badge?: boolean }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        scale.value = withSequence(
            withTiming(0.85, { duration: 80  }),
            withTiming(1,    { duration: 150 })
        );
        runOnJS(onPress)();
    };

    return (
        <TouchableOpacity onPress={press} activeOpacity={1}>
            <Animated.View style={[st.iconBtn, animStyle]}>
                <Ionicons name={name} size={IS_ANDROID ? 18 : 20} color={ORANGE} />
                {badge && <View style={st.badge} />}
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
function CtaButton({ label, onPress, filled }: { label: string; onPress: () => void; filled?: boolean }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withTiming(0.97, { duration: 80  }),
            withTiming(1,    { duration: 160 })
        );
        runOnJS(onPress)();
    };

    if (filled) {
        return (
            <TouchableOpacity onPress={press} activeOpacity={1} style={{ width: "100%" }}>
                <Animated.View style={animStyle}>
                    <LinearGradient
                        colors={[ORANGE, ORANGE2]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={st.ctaBtnFilled}
                    >
                        <Ionicons name="compass-outline" size={16} color={BG} style={{ marginRight: 8 }} />
                        <Text allowFontScaling={false} style={st.ctaBtnTextFilled}>{label}</Text>
                        <Ionicons name="arrow-forward" size={14} color={BG} style={{ marginLeft: 6 }} />
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={{ width: "100%" }}>
            <Animated.View style={[st.ctaBtnOutline, animStyle]}>
                <LinearGradient
                    colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                <Ionicons name="people-outline" size={16} color={ORANGE} style={{ marginRight: 8 }} />
                <Text allowFontScaling={false} style={st.ctaBtnTextOutline}>{label}</Text>
                <Ionicons name="arrow-forward" size={14} color={ORANGE} style={{ marginLeft: 6 }} />
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────
function MenuItem({ icon, label, active, onPress }: {
    icon: any; label: string; active?: boolean; onPress: () => void;
}) {
    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        runOnJS(onPress)();
    };
    return (
        <TouchableOpacity onPress={press} activeOpacity={0.8}>
            <View style={[st.menuItem, active && st.menuItemActive]}>
                <View style={[st.menuIconWrap, active && st.menuIconActive]}>
                    <Ionicons name={icon} size={15} color={active ? ORANGE : "rgba(255,255,255,0.5)"} />
                </View>
                <Text allowFontScaling={false} style={[st.menuText, active && st.menuTextActive]}>
                    {label}
                </Text>
                {active && <View style={st.activeDot} />}
            </View>
        </TouchableOpacity>
    );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
    const { width }    = useWindowDimensions();
    const [followed,   setFollowed]   = useState<Set<string>>(new Set());
    const [menuOpen,   setMenuOpen]   = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query,      setQuery]      = useState("");

    const menuOpacity = useSharedValue(0);
    const menuScale   = useSharedValue(0.92);

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
        IS_ANDROID ? 112 : 120,
        Math.max(IS_ANDROID ? 100 : 106, (width - 64) / 3)
    );

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Subtle corner warmth */}
            <LinearGradient
                colors={["rgba(255,100,20,0.05)", "transparent"]}
                start={{ x: 1, y: 0 }} end={{ x: 0.3, y: 0.4 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <SafeAreaView style={st.safe} edges={["top", "left", "right"]}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                {/* ── Header ── */}
                <Animated.View
                    entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))}
                    style={st.header}
                >
                    <TouchableOpacity
                        onPress={() => { Haptics.selectionAsync(); setMenuOpen(true); }}
                        style={st.titleRow}
                        activeOpacity={0.7}
                    >
                        <Text allowFontScaling={false} style={st.title}>Home</Text>
                        <View style={st.chevronWrap}>
                            <Ionicons name="chevron-down" size={12} color={ORANGE} />
                        </View>
                    </TouchableOpacity>

                    <View style={st.headerActions}>
                        <IconButton name="search-outline"        onPress={() => setSearchOpen(true)} />
                        <IconButton name="notifications-outline" onPress={() => router.push("/(tabs)/home/notifications")} badge />
                    </View>
                </Animated.View>

                <ScrollView
                    contentContainerStyle={st.body}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Section header ── */}
                    <Animated.View
                        entering={FadeInDown.delay(80).duration(400).easing(Easing.out(Easing.cubic))}
                        style={st.sectionRow}
                    >
                        <View>
                            <Text allowFontScaling={false} style={st.sectionEyebrow}>DISCOVER</Text>
                            <Text allowFontScaling={false} style={st.sectionTitle}>Suggested Athletes</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.selectionAsync();
                                router.push({ pathname: "/(tabs)/home/contacts", params: { mode: "invite" } });
                            }}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={["rgba(255,120,37,0.14)", "rgba(255,120,37,0.06)"]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={st.invitePill}
                            >
                                <Ionicons name="add" size={13} color={ORANGE} />
                                <Text allowFontScaling={false} style={st.inviteText}>Invite a friend</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* ── Athlete cards ── */}
                    <View style={{ height: IS_ANDROID ? 188 : 202, marginTop: 12 }}>
                        <FlatList
                            horizontal
                            data={ALL_ATHLETES}
                            keyExtractor={(item) => item.username}
                            showsHorizontalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                            contentContainerStyle={st.listPad}
                            renderItem={({ item, index }) => (
                                <AthleteCard
                                    item={item}
                                    index={index}
                                    cardWidth={cardWidth}
                                    isFollowed={followed.has(item.username)}
                                    onToggle={() => toggleFollow(item.username)}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/(tabs)/home/userid",
                                            params: {
                                                userId: item.username,
                                                name: item.name,
                                                image: item.avatarUrl,
                                            },
                                        })
                                    }
                                />
                            )}
                        />
                    </View>

                    {/* ── Pulsing orb / empty feed ── */}
                    <Animated.View
                        entering={FadeIn.delay(350).duration(500).easing(Easing.out(Easing.cubic))}
                        style={st.orbSection}
                    >
                        <PulsingOrb />
                        <View style={st.placeholderLines}>
                            <View style={[st.phLine, { width: width * 0.52 }]} />
                            <View style={[st.phLine, { width: width * 0.40, opacity: 0.5 }]} />
                        </View>
                        <Text allowFontScaling={false} style={st.orbHint}>
                            FOLLOW PEOPLE TO SEE THEIR{"\n"}WORKOUTS IN YOUR FEED.
                        </Text>
                    </Animated.View>

                    {/* ── Divider ── */}
                    <View style={st.ctaDivider}>
                        <View style={st.ctaDividerLine} />
                        <Text style={st.ctaDividerText}>get started</Text>
                        <View style={st.ctaDividerLine} />
                    </View>

                    {/* ── CTA Buttons ── */}
                    <Animated.View
                        entering={FadeInUp.delay(450).duration(400).easing(Easing.out(Easing.cubic))}
                        style={st.ctaRow}
                    >
                        <CtaButton
                            label="Discover Athletes"
                            onPress={() => router.push("/(tabs)/home/discover")}
                            filled
                        />
                        <View style={{ height: 10 }} />
                        <CtaButton
                            label="Connect Contacts"
                            onPress={() => router.push({ pathname: "/(tabs)/home/contacts", params: { mode: "connect" } })}
                        />
                    </Animated.View>
                </ScrollView>

                {/* ── Dropdown Menu ── */}
                <Modal visible={menuOpen} transparent animationType="none">
                    <Pressable style={st.backdrop} onPress={() => setMenuOpen(false)} />
                    <Animated.View style={[st.menu, menuAnimStyle]}>
                        <BlurView intensity={60} tint="dark" style={st.menuBlur}>
                            <MenuItem
                                icon="home-outline"
                                label="Home (Following)"
                                active
                                onPress={() => { setMenuOpen(false); router.push("/(tabs)/home"); }}
                            />
                            <View style={st.menuDivider} />
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
                    <LinearGradient
                        colors={["#0e0e11", "#080808", "#0b0b0e"]}
                        start={{ x: 0.16, y: 0 }} end={{ x: 0.84, y: 1 }}
                        style={{ flex: 1 }}
                    >
                        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom", "left", "right"]}>
                            <Animated.View
                                entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))}
                                style={st.searchHeader}
                            >
                                <TouchableOpacity
                                    onPress={() => { setSearchOpen(false); setQuery(""); }}
                                    style={st.searchBackBtn}
                                >
                                    <Ionicons name="arrow-back" size={IS_ANDROID ? 18 : 20} color={TEXT} />
                                </TouchableOpacity>
                                <LinearGradient
                                    colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.04)"]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={st.searchBar}
                                >
                                    <Ionicons name="search" size={15} color={MUTED} />
                                    <TextInput
                                        value={query}
                                        onChangeText={setQuery}
                                        placeholder="Search athletes..."
                                        placeholderTextColor={HINT}
                                        style={st.searchInput}
                                        autoFocus
                                        allowFontScaling={false}
                                        selectionColor={ORANGE}
                                    />
                                    {query.length > 0 && (
                                        <TouchableOpacity onPress={() => setQuery("")}>
                                            <Ionicons name="close-circle" size={15} color={MUTED} />
                                        </TouchableOpacity>
                                    )}
                                </LinearGradient>
                            </Animated.View>

                            {filtered.length === 0 ? (
                                <Animated.View entering={FadeIn.duration(260)} style={st.emptySearch}>
                                    <View style={st.emptyIconWrap}>
                                        <Ionicons name="search" size={32} color={MUTED} />
                                    </View>
                                    <Text allowFontScaling={false} style={st.emptySearchText}>No athletes found</Text>
                                </Animated.View>
                            ) : (
                                <FlatList
                                    keyboardShouldPersistTaps="handled"
                                    data={filtered}
                                    keyExtractor={(item) => item.username}
                                    contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
                                    ItemSeparatorComponent={() => (
                                        <View style={{ height: 0.5, backgroundColor: "rgba(255,255,255,0.05)" }} />
                                    )}
                                    renderItem={({ item, index }) => (
                                        <Animated.View
                                            entering={FadeInDown.delay(index * 35).duration(280).easing(Easing.out(Easing.cubic))}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setSearchOpen(false);
                                                    setQuery("");
                                                    router.push({
                                                        pathname: "/(tabs)/home/userid",
                                                        params: {
                                                            userId: item.username,
                                                            name: item.name,
                                                            image: item.avatarUrl,
                                                        },
                                                    });
                                                }}
                                                activeOpacity={0.7}
                                                style={st.searchRow}
                                            >
                                                <View style={st.searchAvatarWrap}>
                                                    <Image source={{ uri: item.avatarUrl }} style={st.searchAvatar} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text allowFontScaling={false} style={st.searchName}>{item.name}</Text>
                                                    <Text allowFontScaling={false} style={st.searchUser}>@{item.username}</Text>
                                                </View>
                                                <LinearGradient
                                                    colors={["rgba(255,120,37,0.12)", "rgba(255,120,37,0.06)"]}
                                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                                    style={st.sportTag}
                                                >
                                                    <Text style={st.sportTagText}>{item.sport}</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    )}
                                />
                            )}
                        </SafeAreaView>
                    </LinearGradient>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        height: IS_ANDROID ? 54 : 60,
        paddingHorizontal: 18,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { color: TEXT, fontWeight: "800", fontSize: IS_ANDROID ? 22 : 24, letterSpacing: -0.5 },
    chevronWrap: {
        backgroundColor: "rgba(255,120,37,0.14)", borderRadius: 7, padding: 5,
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.25)",
    },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    iconBtn: {
        width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
        alignItems: "center", justifyContent: "center",
    },
    badge: {
        position: "absolute", top: 7, right: 7,
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: ORANGE, borderWidth: 1.5, borderColor: BG,
    },

    body: {
        paddingHorizontal: 16,
        paddingTop: IS_ANDROID ? 16 : 20,
        paddingBottom: 120,
    },

    sectionRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
    },
    sectionEyebrow: {
        fontSize: 9, fontWeight: "700", color: ORANGE,
        letterSpacing: 2.5, marginBottom: 3,
    },
    sectionTitle: {
        color: TEXT, fontSize: IS_ANDROID ? 15 : 16,
        fontWeight: "700", letterSpacing: -0.3,
    },
    invitePill: {
        flexDirection: "row", alignItems: "center",
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.25)", gap: 4,
        overflow: "hidden",
    },
    inviteText: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "600" },

    listPad: { paddingLeft: 2, paddingRight: 16, paddingTop: 4, paddingBottom: 4 },

    orbSection: {
        alignItems: "center",
        paddingTop: IS_ANDROID ? 28 : 36,
        paddingBottom: IS_ANDROID ? 8 : 12,
    },
    placeholderLines: { alignItems: "center", gap: 8, marginBottom: 16 },
    phLine: { height: 6, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.06)" },
    orbHint: {
        color: HINT, fontSize: IS_ANDROID ? 9 : 10,
        fontWeight: "700", textAlign: "center",
        letterSpacing: 1.6, lineHeight: 18,
    },

    ctaDivider: {
        flexDirection: "row", alignItems: "center",
        gap: 10, marginTop: IS_ANDROID ? 24 : 28, marginBottom: 16,
    },
    ctaDividerLine: { flex: 1, height: 0.5, backgroundColor: "rgba(255,255,255,0.07)" },
    ctaDividerText: {
        color: MUTED, fontSize: 10, fontWeight: "600",
        letterSpacing: 1, textTransform: "uppercase",
    },

    ctaRow: { gap: 0 },
    ctaBtnFilled: {
        height: IS_ANDROID ? 50 : 54, borderRadius: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        ...Platform.select({
            ios:     { shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    ctaBtnTextFilled: { color: BG, fontWeight: "800", fontSize: IS_ANDROID ? 14 : 15 },
    ctaBtnOutline: {
        height: IS_ANDROID ? 50 : 54, borderRadius: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.3)", overflow: "hidden",
    },
    ctaBtnTextOutline: { color: ORANGE, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },

    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
    menu: {
        position: "absolute", top: IS_ANDROID ? 64 : 72, left: 14,
        width: 250, borderRadius: 18, overflow: "hidden",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
    },
    menuBlur: { padding: 6, backgroundColor: "rgba(10,10,10,0.96)" },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12 },
    menuItemActive: { backgroundColor: "rgba(255,120,37,0.06)" },
    menuIconWrap: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center", justifyContent: "center", marginRight: 10,
    },
    menuIconActive: { backgroundColor: "rgba(255,120,37,0.14)" },
    menuText: { color: "rgba(255,255,255,0.6)", flex: 1, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "600" },
    menuTextActive: { color: TEXT, fontWeight: "700" },
    activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE },
    menuDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.07)", marginHorizontal: 10 },

    searchHeader: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, gap: 10,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    searchBackBtn: {
        width: 36, height: 36,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
        borderRadius: 12, alignItems: "center", justifyContent: "center",
    },
    searchBar: {
        flex: 1, height: IS_ANDROID ? 42 : 46, borderRadius: 14,
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 12, gap: 8,
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden",
    },
    searchInput: { flex: 1, color: TEXT, fontSize: IS_ANDROID ? 14 : 15, paddingVertical: 0 },
    searchRow: { flexDirection: "row", alignItems: "center", paddingVertical: IS_ANDROID ? 12 : 14, gap: 12 },
    searchAvatarWrap: {
        borderWidth: 1.5, borderColor: "rgba(255,120,37,0.3)",
        borderRadius: IS_ANDROID ? 22 : 24, padding: 1.5,
    },
    searchAvatar: {
        width: IS_ANDROID ? 40 : 44, height: IS_ANDROID ? 40 : 44,
        borderRadius: IS_ANDROID ? 20 : 22, backgroundColor: "#1a1a1a",
    },
    searchName: { color: TEXT, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    searchUser: { color: MUTED, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },
    sportTag: {
        borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5,
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.22)", overflow: "hidden",
    },
    sportTagText: { color: ORANGE, fontSize: 11, fontWeight: "600" },
    emptySearch: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingTop: 80 },
    emptyIconWrap: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center", justifyContent: "center",
    },
    emptySearchText: { color: MUTED, fontSize: IS_ANDROID ? 14 : 15 },
});
