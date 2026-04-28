import React, { useMemo, useState, useEffect } from "react";
import {
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withRepeat,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const BG         = AppColors.black;
const IS_ANDROID = Platform.OS === "android";

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: "1", label: "Strength", icon: "barbell-outline",   color: "#FF6B35", bg: "rgba(255,107,53,0.12)"  },
    { id: "2", label: "Cardio",   icon: "heart-outline",     color: "#FF4D6D", bg: "rgba(255,77,109,0.12)"  },
    { id: "3", label: "HIIT",     icon: "flash-outline",     color: "#FFD60A", bg: "rgba(255,214,10,0.12)"  },
    { id: "4", label: "Yoga",     icon: "body-outline",      color: "#80B918", bg: "rgba(128,185,24,0.12)"  },
    { id: "5", label: "Running",  icon: "walk-outline",      color: "#4CC9F0", bg: "rgba(76,201,240,0.12)"  },
    { id: "6", label: "CrossFit", icon: "trophy-outline",    color: "#F77F00", bg: "rgba(247,127,0,0.12)"   },
    { id: "7", label: "Swimming", icon: "water-outline",     color: "#48CAE4", bg: "rgba(72,202,228,0.12)"  },
    { id: "8", label: "Cycling",  icon: "bicycle-outline",   color: "#A8DADC", bg: "rgba(168,218,220,0.12)" },
];

const TRENDING = [
    { id: "t1", title: "30-Day Push Challenge",  category: "Strength", duration: "45 min", level: "Advanced",     image: "https://picsum.photos/seed/t1/600/400", likes: 2400 },
    { id: "t2", title: "Morning HIIT Burn",       category: "HIIT",     duration: "20 min", level: "Intermediate", image: "https://picsum.photos/seed/t2/600/400", likes: 1800 },
    { id: "t3", title: "5K Runner Program",       category: "Running",  duration: "30 min", level: "Beginner",     image: "https://picsum.photos/seed/t3/600/400", likes: 3100 },
    { id: "t4", title: "Core Destroyer",          category: "Strength", duration: "25 min", level: "Advanced",     image: "https://picsum.photos/seed/t4/600/400", likes: 940  },
];

const ATHLETES = [
    { id: "a1", name: "Alex",  username: "alexfit",   sport: "Sprinter", avatarUrl: "https://i.pravatar.cc/150?img=12", workouts: 124 },
    { id: "a2", name: "Maya",  username: "mayalifts", sport: "Lifter",   avatarUrl: "https://i.pravatar.cc/150?img=32", workouts: 98  },
    { id: "a3", name: "Noah",  username: "noahrun",   sport: "Runner",   avatarUrl: "https://i.pravatar.cc/150?img=56", workouts: 210 },
    { id: "a4", name: "Sara",  username: "sarahit",   sport: "Cyclist",  avatarUrl: "https://i.pravatar.cc/150?img=3",  workouts: 76  },
    { id: "a5", name: "Hamza", username: "hamzafit",  sport: "Fighter",  avatarUrl: "https://i.pravatar.cc/150?img=20", workouts: 155 },
];

const LEVEL_COLORS: Record<string, string> = {
    Beginner:     "#80B918",
    Intermediate: "#FFD60A",
    Advanced:     "#FF4D6D",
};

// ─── Pressable helper ─────────────────────────────────────────────────────────
function usePressScale(amount = 0.96) {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const onIn  = () => { scale.value = withTiming(amount, { duration: 80 }); };
    const onOut = () => { scale.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }); };
    return { style, onIn, onOut };
}

// ─── Category Tile ────────────────────────────────────────────────────────────
function CategoryTile({ item, index }: { item: typeof CATEGORIES[0]; index: number }) {
    const { style, onIn, onOut } = usePressScale(0.92);
    return (
        <Animated.View entering={FadeInDown.delay(index * 35).duration(340).easing(Easing.out(Easing.cubic))}>
            <TouchableOpacity
                onPressIn={() => { Haptics.selectionAsync(); onIn(); }}
                onPressOut={onOut}
                activeOpacity={1}
            >
                <Animated.View style={[styles.categoryTile, { backgroundColor: item.bg }, style]}>
                    <View style={[styles.categoryIconWrap, { borderColor: `${item.color}30` }]}>
                        <Ionicons name={item.icon as any} size={IS_ANDROID ? 20 : 22} color={item.color} />
                    </View>
                    <Text allowFontScaling={false} style={[styles.categoryLabel, { color: item.color }]}>
                        {item.label}
                    </Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Trending Card ────────────────────────────────────────────────────────────
function TrendingCard({ item, index }: { item: typeof TRENDING[0]; index: number }) {
    const { style, onIn, onOut } = usePressScale(0.97);
    const levelColor = LEVEL_COLORS[item.level] ?? ORANGE;

    return (
        <Animated.View entering={FadeInDown.delay(index * 55).duration(380).easing(Easing.out(Easing.cubic))}>
            <TouchableOpacity
                onPressIn={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onIn(); }}
                onPressOut={onOut}
                activeOpacity={1}
                style={{ marginRight: 14 }}
            >
                <Animated.View style={[styles.trendingCard, style]}>
                    {/* Image */}
                    <View style={styles.trendingImageWrap}>
                        <Image source={{ uri: item.image }} style={styles.trendingImage} resizeMode="cover" />
                        <View style={styles.trendingGradient} />

                        {/* Level badge */}
                        <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20`, borderColor: `${levelColor}40` }]}>
                            <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
                            <Text allowFontScaling={false} style={[styles.levelText, { color: levelColor }]}>
                                {item.level}
                            </Text>
                        </View>

                    {/* Duration badge */}
                    <View style={styles.durationBadge}>
                        <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.8)" />
                        <Text allowFontScaling={false} style={styles.durationText}>{item.duration}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.trendingInfo}>
                    <View style={styles.trendingCategoryTag}>
                        <Text allowFontScaling={false} style={styles.trendingCategoryText}>{item.category}</Text>
                    </View>
                    <Text allowFontScaling={false} style={styles.trendingTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.trendingMeta}>
                        <Ionicons name="heart" size={11} color="#FF4D6D" />
                        <Text allowFontScaling={false} style={styles.trendingLikes}>
                            {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
                        </Text>
                    </View>
                </View>
        </Animated.View>
</TouchableOpacity>
</Animated.View>
);
}

// ─── Athlete Card ─────────────────────────────────────────────────────────────
function AthleteCard({ item, index }: { item: typeof ATHLETES[0]; index: number }) {
    const [followed, setFollowed] = useState(false);
    const followedVal = useSharedValue(0);
    const { style, onIn, onOut } = usePressScale(0.96);

    const handleFollow = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        followedVal.value = withTiming(followed ? 0 : 1, { duration: 220, easing: Easing.out(Easing.cubic) });
        setFollowed((v) => !v);
    };

    const btnStyle = useAnimatedStyle(() => ({
        backgroundColor: followedVal.value > 0.5 ? "rgba(255,120,37,0.15)" : ORANGE,
        borderWidth: 1,
        borderColor: ORANGE,
        opacity: 1,
    }));

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(360).easing(Easing.out(Easing.cubic))}>
            <TouchableOpacity
                onPressIn={() => { Haptics.selectionAsync(); onIn(); }}
                onPressOut={onOut}
                onPress={() => router.push({ pathname: "/(tabs)/home/userid", params: { userId: item.username, name: item.name, image: item.avatarUrl } })}
                activeOpacity={1}
            >
                <Animated.View style={[styles.athleteCard, style]}>
                    {/* Avatar */}
                    <View style={styles.athleteAvatarRing}>
                        <Image source={{ uri: item.avatarUrl }} style={styles.athleteAvatar} />
                        <View style={styles.athleteOnline} />
                    </View>

                    {/* Info */}
                    <Text allowFontScaling={false} style={styles.athleteName} numberOfLines={1}>{item.name}</Text>
                    {/* sport removed */}

                    {/* Workouts count */}
                    <View style={styles.athleteStatRow}>
                        <Ionicons name="barbell-outline" size={10} color={AppColors.grey} />
                        <Text allowFontScaling={false} style={styles.athleteStatText}>{item.workouts} workouts</Text>
                    </View>

                    <View style={styles.athleteDivider} />

                    {/* Follow btn */}
                    <TouchableOpacity onPress={handleFollow} activeOpacity={1} style={{ width: "100%" }}>
                        <Animated.View style={[styles.athleteFollowBtn, btnStyle]}>
                            {followed
                                ? <Ionicons name="checkmark" size={11} color={ORANGE} style={{ marginRight: 3 }} />
                                : null
                            }
                            <Text allowFontScaling={false} style={[styles.athleteFollowText, followed && { color: ORANGE }]}>
                                {followed ? "Following" : "Follow"}
                            </Text>
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Search Result Row ────────────────────────────────────────────────────────
function SearchResultRow({ item, index, onPress }: { item: typeof ATHLETES[0]; index: number; onPress: () => void }) {
    const { style, onIn, onOut } = usePressScale(0.98);
    return (
        <Animated.View entering={FadeInDown.delay(index * 35).duration(280).easing(Easing.out(Easing.cubic))}>
            <TouchableOpacity onPressIn={onIn} onPressOut={onOut} onPress={onPress} activeOpacity={1}>
                <Animated.View style={[styles.searchResultRow, style]}>
                    <Image source={{ uri: item.avatarUrl }} style={styles.searchResultAvatar} />
                    <View style={{ flex: 1 }}>
                        <Text allowFontScaling={false} style={styles.searchResultName}>{item.name}</Text>
                        <Text allowFontScaling={false} style={styles.searchResultSub}>@{item.username} · {item.sport}</Text>
                    </View>
                    <View style={styles.searchResultTag}>
                        <Text allowFontScaling={false} style={styles.searchResultTagText}>{item.sport}</Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── ExploreScreen ────────────────────────────────────────────────────────────
export default function ExploreScreen() {
    const [query,     setQuery]     = useState("");
    const [focused,   setFocused]   = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "workouts" | "athletes">("all");

    // Search bar animation
    const searchWidth = useSharedValue(0);
    const searchStyle = useAnimatedStyle(() => ({
        borderColor: `rgba(255,107,53,${searchWidth.value * 0.6})`,
        backgroundColor: `rgba(255,255,255,${0.055 + searchWidth.value * 0.02})`,
    }));

    useEffect(() => {
        searchWidth.value = withTiming(focused ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
    }, [focused]);

    const filteredAthletes = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ATHLETES;
        return ATHLETES.filter((a) =>
            a.name.toLowerCase().includes(q) ||
            a.username.toLowerCase().includes(q) ||
            a.sport.toLowerCase().includes(q)
        );
    }, [query]);

    const filteredTrending = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return TRENDING;
        return TRENDING.filter((t) =>
            t.title.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        );
    }, [query]);

    const isSearching = query.trim().length > 0;
    const hasResults  = filteredAthletes.length > 0 || filteredTrending.length > 0;

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.bgAccent1} />
            <View style={styles.bgAccent2} />

            {/* ── Header ── */}
            <Animated.View entering={FadeInDown.duration(380).easing(Easing.out(Easing.cubic))} style={styles.header}>
                <View>
                    <Text allowFontScaling={false} style={styles.headerEyebrow}>BEARFIT</Text>
                    <Text allowFontScaling={false} style={styles.headerTitle}>Explore</Text>
                </View>
                <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); router.push("/(tabs)/home/notifications"); }}
                    style={styles.notifBtn}
                    activeOpacity={0.7}
                >
                    <Ionicons name="notifications-outline" size={IS_ANDROID ? 19 : 21} color={ORANGE} />
                    <View style={styles.notifBadge} />
                </TouchableOpacity>
            </Animated.View>

            {/* ── Search Bar ── */}
            <Animated.View entering={FadeInDown.delay(60).duration(360).easing(Easing.out(Easing.cubic))} style={styles.searchWrap}>
                <Animated.View style={[styles.searchBar, searchStyle]}>
                    <Ionicons name="search" size={IS_ANDROID ? 16 : 17} color={focused ? ORANGE : AppColors.grey} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Search athletes, workouts..."
                        placeholderTextColor={AppColors.grey}
                        style={styles.searchInput}
                        allowFontScaling={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery("")}>
                            <Ionicons name="close-circle" size={16} color={AppColors.grey} />
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </Animated.View>

            {/* ── Tabs (only when not searching) ── */}
            {!isSearching && (
                <Animated.View entering={FadeIn.delay(80).duration(300)} style={styles.tabs}>
                    {(["all", "workouts", "athletes"] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            activeOpacity={0.7}
                        >
                            <Text allowFontScaling={false} style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}

            {/* ── Search Results ── */}
            {isSearching ? (
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.searchResults}
                    showsVerticalScrollIndicator={false}
                >
                    {!hasResults ? (
                        <Animated.View entering={FadeIn.duration(300)} style={styles.emptyWrap}>
                            <Ionicons name="search" size={40} color={AppColors.darkGrey} />
                            <Text allowFontScaling={false} style={styles.emptyText}>No results for "{query}"</Text>
                        </Animated.View>
                    ) : (
                        <>
                            {filteredAthletes.length > 0 && (
                                <>
                                    <Text allowFontScaling={false} style={styles.resultsLabel}>ATHLETES</Text>
                                    {filteredAthletes.map((item, index) => (
                                        <SearchResultRow
                                            key={item.id} item={item} index={index}
                                            onPress={() => router.push({ pathname: "/(tabs)/home/userid", params: { userId: item.username, name: item.name, image: item.avatarUrl } })}
                                        />
                                    ))}
                                </>
                            )}
                            {filteredTrending.length > 0 && (
                                <>
                                    <Text allowFontScaling={false} style={[styles.resultsLabel, { marginTop: 16 }]}>WORKOUTS</Text>
                                    {filteredTrending.map((item, index) => (
                                        <Animated.View key={item.id} entering={FadeInDown.delay(index * 35).duration(280).easing(Easing.out(Easing.cubic))}>
                                            <TouchableOpacity style={styles.workoutResultRow} activeOpacity={0.7}>
                                                <Image source={{ uri: item.image }} style={styles.workoutResultImage} />
                                                <View style={{ flex: 1 }}>
                                                    <Text allowFontScaling={false} style={styles.workoutResultTitle} numberOfLines={1}>{item.title}</Text>
                                                    <Text allowFontScaling={false} style={styles.workoutResultMeta}>{item.category} · {item.duration}</Text>
                                                </View>
                                                <View style={[styles.levelBadge, { backgroundColor: `${LEVEL_COLORS[item.level]}20`, borderColor: `${LEVEL_COLORS[item.level]}40` }]}>
                                                    <Text allowFontScaling={false} style={[styles.levelText, { color: LEVEL_COLORS[item.level] }]}>{item.level}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </ScrollView>
            ) : (
                /* ── Main Content ── */
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* ── Categories ── */}
                    {(activeTab === "all" || activeTab === "workouts") && (
                        <>
                            <Animated.View entering={FadeInDown.delay(100).duration(340).easing(Easing.out(Easing.cubic))} style={styles.sectionHeader}>
                                <View>
                                    <Text allowFontScaling={false} style={styles.sectionEyebrow}>BROWSE</Text>
                                    <Text allowFontScaling={false} style={styles.sectionTitle}>Categories</Text>
                                </View>
                            </Animated.View>

                            <View style={styles.categoriesGrid}>
                                {CATEGORIES.map((cat, i) => (
                                    <View key={cat.id} style={styles.categoryCell}>
                                        <CategoryTile item={cat} index={i} />
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* ── Trending ── */}
                    {(activeTab === "all" || activeTab === "workouts") && (
                        <>
                            <Animated.View entering={FadeInDown.delay(140).duration(340).easing(Easing.out(Easing.cubic))} style={[styles.sectionHeader, { marginTop: 24 }]}>
                                <View>
                                    <Text allowFontScaling={false} style={styles.sectionEyebrow}>HOT RIGHT NOW</Text>
                                    <Text allowFontScaling={false} style={styles.sectionTitle}>Trending Workouts</Text>
                                </View>
                                <View style={styles.trendingFlameBadge}>
                                    <Text style={styles.trendingFlame}>🔥</Text>
                                </View>
                            </Animated.View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.trendingList}
                            >
                                {TRENDING.map((item, i) => (
                                    <TrendingCard key={item.id} item={item} index={i} />
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* ── Featured Athletes ── */}
                    {(activeTab === "all" || activeTab === "athletes") && (
                        <>
                            <Animated.View entering={FadeInDown.delay(180).duration(340).easing(Easing.out(Easing.cubic))} style={[styles.sectionHeader, { marginTop: 24 }]}>
                                <View>
                                    <Text allowFontScaling={false} style={styles.sectionEyebrow}>TOP PERFORMERS</Text>
                                    <Text allowFontScaling={false} style={styles.sectionTitle}>Featured Athletes</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push("/(tabs)/home/discover")}
                                    style={styles.seeAllBtn}
                                    activeOpacity={0.7}
                                >
                                    <Text allowFontScaling={false} style={styles.seeAllText}>See all</Text>
                                    <Ionicons name="arrow-forward" size={12} color={ORANGE} />
                                </TouchableOpacity>
                            </Animated.View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.athletesList}
                            >
                                {ATHLETES.map((item, i) => (
                                    <AthleteCard key={item.id} item={item} index={i} />
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* ── Discover CTA ── */}
                    {activeTab === "all" && (
                        <Animated.View entering={FadeInUp.delay(220).duration(360).easing(Easing.out(Easing.cubic))} style={styles.ctaCard}>
                            <View style={styles.ctaAccent} />
                            <View style={styles.ctaContent}>
                                <View style={styles.ctaIconWrap}>
                                    <Ionicons name="compass" size={IS_ANDROID ? 24 : 28} color={ORANGE} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={styles.ctaTitle}>Ready to discover more?</Text>
                                    <Text allowFontScaling={false} style={styles.ctaSubtext}>Browse the full workout feed</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/(tabs)/home/discover"); }}
                                style={styles.ctaBtn}
                                activeOpacity={0.85}
                            >
                                <Text allowFontScaling={false} style={styles.ctaBtnText}>Open Discover</Text>
                                <Ionicons name="arrow-forward" size={14} color={BG} style={{ marginLeft: 6 }} />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    bgAccent1: { position: "absolute", width: 260, height: 260, borderRadius: 130, top: -80, right: -80, backgroundColor: "rgba(255,107,53,0.05)" },
    bgAccent2: { position: "absolute", width: 200, height: 200, borderRadius: 100, bottom: 100, left: -60, backgroundColor: "rgba(255,107,53,0.03)" },

    // Header
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: IS_ANDROID ? 4 : 6, paddingBottom: 6 },
    headerEyebrow: { fontSize: 9, fontWeight: "700", color: ORANGE, letterSpacing: 2.5, marginBottom: 2 },
    headerTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 24 : 26, fontWeight: "800", letterSpacing: -0.5 },
    notifBtn: { width: IS_ANDROID ? 38 : 40, height: IS_ANDROID ? 38 : 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    notifBadge: { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE, borderWidth: 1.5, borderColor: BG },

    // Search
    searchWrap: { paddingHorizontal: 14, marginBottom: 12 },
    searchBar: { flexDirection: "row", alignItems: "center", height: IS_ANDROID ? 44 : 48, borderRadius: 14, paddingHorizontal: 14, gap: 10, borderWidth: 1 },
    searchInput: { flex: 1, color: AppColors.white, fontSize: IS_ANDROID ? 14 : 15, paddingVertical: 0 },

    // Tabs
    tabs: { flexDirection: "row", paddingHorizontal: 14, marginBottom: 16, gap: 8 },
    tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    tabActive: { backgroundColor: "rgba(255,107,53,0.15)", borderColor: "rgba(255,107,53,0.3)" },
    tabText: { color: "rgba(255,255,255,0.5)", fontSize: IS_ANDROID ? 12 : 13, fontWeight: "600" },
    tabTextActive: { color: ORANGE },

    // Content
    content: { paddingHorizontal: 14, paddingBottom: 100 },

    // Section headers
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
    sectionEyebrow: { fontSize: 9, fontWeight: "700", color: ORANGE, letterSpacing: 2.5, marginBottom: 3 },
    sectionTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "700" },
    seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    seeAllText: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "600" },

    // Categories grid
    categoriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    categoryCell: { width: "22.5%" },
    categoryTile: { borderRadius: 14, padding: IS_ANDROID ? 10 : 12, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
    categoryIconWrap: { width: IS_ANDROID ? 38 : 42, height: IS_ANDROID ? 38 : 42, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1 },
    categoryLabel: { fontSize: IS_ANDROID ? 10 : 11, fontWeight: "700", textAlign: "center" },

    // Trending
    trendingFlameBadge: { backgroundColor: "rgba(247,127,0,0.12)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(247,127,0,0.25)" },
    trendingFlame: { fontSize: 14 },
    trendingList: { paddingBottom: 4, paddingLeft: 2 },
    trendingCard: { width: IS_ANDROID ? 190 : 210, backgroundColor: AppColors.darkBg, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    trendingImageWrap: { position: "relative" },
    trendingImage: { width: "100%", height: IS_ANDROID ? 120 : 130 },
    trendingGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 50, backgroundColor: "rgba(0,0,0,0.4)" },
    levelBadge: { position: "absolute", top: 8, left: 8, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    levelDot: { width: 5, height: 5, borderRadius: 3 },
    levelText: { fontSize: 10, fontWeight: "700" },
    durationBadge: { position: "absolute", bottom: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
    durationText: { color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: "600" },
    trendingInfo: { padding: IS_ANDROID ? 10 : 12 },
    trendingCategoryTag: { backgroundColor: "rgba(255,107,53,0.1)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6, borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    trendingCategoryText: { color: ORANGE, fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
    trendingTitle: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 12 : 13, lineHeight: IS_ANDROID ? 18 : 19, marginBottom: 6 },
    trendingMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
    trendingLikes: { color: "#FF4D6D", fontSize: IS_ANDROID ? 11 : 12, fontWeight: "600" },

    // Athletes
    athletesList: { paddingBottom: 4, paddingLeft: 2 },
    athleteCard: { width: IS_ANDROID ? 118 : 128, backgroundColor: AppColors.darkBg, borderRadius: 16, padding: IS_ANDROID ? 12 : 14, alignItems: "center", marginRight: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    athleteAvatarRing: { width: IS_ANDROID ? 60 : 66, height: IS_ANDROID ? 60 : 66, borderRadius: IS_ANDROID ? 30 : 33, borderWidth: 2, borderColor: "rgba(255,107,53,0.45)", marginBottom: IS_ANDROID ? 8 : 10, padding: 2, position: "relative" },
    athleteAvatar: { width: "100%", height: "100%", borderRadius: IS_ANDROID ? 28 : 31, backgroundColor: AppColors.darkBg },
    athleteOnline: { position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: AppColors.green, borderWidth: 2, borderColor: AppColors.darkBg },
    athleteName: { color: AppColors.white, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "700", textAlign: "center", marginBottom: 2 },
    athleteSport: { color: ORANGE, fontSize: 10, fontWeight: "600", letterSpacing: 0.3, marginBottom: 4 },
    athleteStatRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 8 },
    athleteStatText: { color: AppColors.grey, fontSize: 10 },
    athleteDivider: { width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 8 },
    athleteFollowBtn: { width: "100%", borderRadius: 20, paddingVertical: IS_ANDROID ? 6 : 7, alignItems: "center", flexDirection: "row", justifyContent: "center" },
    athleteFollowText: { color: BG, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "800" },

    // CTA card
    ctaCard: { marginTop: 24, backgroundColor: AppColors.darkBg, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)", padding: IS_ANDROID ? 14 : 16 },
    ctaAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: ORANGE },
    ctaContent: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
    ctaIconWrap: { width: IS_ANDROID ? 44 : 48, height: IS_ANDROID ? 44 : 48, borderRadius: 14, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.22)" },
    ctaTitle: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    ctaSubtext: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },
    ctaBtn: { height: IS_ANDROID ? 44 : 48, borderRadius: 13, backgroundColor: ORANGE, flexDirection: "row", alignItems: "center", justifyContent: "center" },
    ctaBtnText: { color: BG, fontWeight: "800", fontSize: IS_ANDROID ? 14 : 15 },

    // Search results
    searchResults: { paddingHorizontal: 14, paddingBottom: 100 },
    resultsLabel: { fontSize: 9, fontWeight: "700", color: ORANGE, letterSpacing: 2.5, marginBottom: 8 },
    searchResultRow: { flexDirection: "row", alignItems: "center", paddingVertical: IS_ANDROID ? 10 : 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", gap: 12 },
    searchResultAvatar: { width: IS_ANDROID ? 42 : 46, height: IS_ANDROID ? 42 : 46, borderRadius: IS_ANDROID ? 21 : 23, backgroundColor: AppColors.darkBg, borderWidth: 1.5, borderColor: "rgba(255,107,53,0.3)" },
    searchResultName: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    searchResultSub: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },
    searchResultTag: { backgroundColor: "rgba(255,107,53,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    searchResultTagText: { color: ORANGE, fontSize: 10, fontWeight: "700" },
    workoutResultRow: { flexDirection: "row", alignItems: "center", paddingVertical: IS_ANDROID ? 10 : 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", gap: 12 },
    workoutResultImage: { width: IS_ANDROID ? 52 : 56, height: IS_ANDROID ? 52 : 56, borderRadius: 12, backgroundColor: AppColors.darkBg },
    workoutResultTitle: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    workoutResultMeta: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 3 },
    emptyWrap: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
    emptyText: { color: AppColors.grey, fontSize: IS_ANDROID ? 14 : 15 },
});
