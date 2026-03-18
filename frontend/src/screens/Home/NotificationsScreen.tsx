import React, { useMemo, useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    View,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
    FadeInDown,
    FadeIn,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type Notif = {
    id: string;
    type: "like" | "comment" | "follow" | "streak" | "challenge" | "reminder" | "friend";
    title: string;
    subtitle: string;
    time: string;
    read: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const BG         = AppColors.black;
const IS_ANDROID = Platform.OS === "android";
const SMOOTH     = { duration: 200, easing: Easing.out(Easing.cubic) };

// ─── Data ─────────────────────────────────────────────────────────────────────
const ICON_MAP: Record<Notif["type"], { name: any; color: string; bg: string }> = {
    like:      { name: "heart",              color: "#FF4D6D", bg: "rgba(255,77,109,0.12)"  },
    comment:   { name: "chatbubble",         color: ORANGE,    bg: "rgba(255,107,53,0.12)"  },
    follow:    { name: "person-add",         color: "#4CC9F0", bg: "rgba(76,201,240,0.12)"  },
    streak:    { name: "flame",              color: "#F77F00", bg: "rgba(247,127,0,0.12)"   },
    challenge: { name: "trophy",             color: "#FFD60A", bg: "rgba(255,214,10,0.12)"  },
    reminder:  { name: "alarm",              color: "#A8DADC", bg: "rgba(168,218,220,0.12)" },
    friend:    { name: "people",             color: "#80B918", bg: "rgba(128,185,24,0.12)"  },
};

function makeNotifications(): Notif[] {
    return [
        { id: "1",  type: "like",      title: "alexfit liked your workout",          subtitle: "Bench Press · Push Day",          time: "2m ago",        read: false },
        { id: "2",  type: "comment",   title: "mayalifts commented on your post",    subtitle: "\"Great form! Keep it up 💪\"",   time: "8m ago",        read: false },
        { id: "3",  type: "follow",    title: "noahrun started following you",        subtitle: "Runner · Dubai",                  time: "15m ago",       read: false },
        { id: "4",  type: "streak",    title: "You hit a 7-day streak! 🔥",          subtitle: "Keep going — you're on fire",     time: "1h ago",        read: true  },
        { id: "5",  type: "like",      title: "sarahit and 3 others liked your post", subtitle: "Leg Day · 4.5 km",               time: "2h ago",        read: true  },
        { id: "6",  type: "challenge", title: "New challenge available",              subtitle: "30-Day Core Challenge",           time: "3h ago",        read: true  },
        { id: "7",  type: "friend",    title: "A friend joined BearFit",              subtitle: "hamzafit is now on BearFit",      time: "5h ago",        read: true  },
        { id: "8",  type: "reminder",  title: "Workout reminder",                    subtitle: "Time for your Warmup session",    time: "Yesterday",     read: true  },
        { id: "9",  type: "comment",   title: "zaraflex replied to your comment",     subtitle: "\"Totally agree with you!\"",    time: "Yesterday",     read: true  },
        { id: "10", type: "like",      title: "aishastrong liked your workout",       subtitle: "CrossFit · Morning session",      time: "2 days ago",    read: true  },
        { id: "11", type: "challenge", title: "Challenge completed! 🏆",              subtitle: "You finished the Push Challenge", time: "2 days ago",    read: true  },
        { id: "12", type: "follow",    title: "nihalfit started following you",       subtitle: "Boxer · Abu Dhabi",               time: "3 days ago",    read: true  },
    ];
}

// ─── Notif Card ───────────────────────────────────────────────────────────────
function NotifCard({ item, index, onPress }: { item: Notif; index: number; onPress: () => void }) {
    const scale = useSharedValue(1);
    const iconMeta = ICON_MAP[item.type];

    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        scale.value = withSequence(
            withTiming(0.97, { duration: 80, easing: Easing.out(Easing.cubic) }),
            withTiming(1,    { duration: 160, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onPress)();
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 45).duration(380).easing(Easing.out(Easing.cubic))}>
            <TouchableOpacity onPress={press} activeOpacity={1}>
                <Animated.View style={[styles.card, !item.read && styles.cardUnread, animStyle]}>
                    {/* Unread indicator */}
                    {!item.read && <View style={styles.unreadDot} />}

                    {/* Icon */}
                    <View style={[styles.iconWrap, { backgroundColor: iconMeta.bg }]}>
                        <Ionicons name={iconMeta.name} size={IS_ANDROID ? 18 : 20} color={iconMeta.color} />
                    </View>

                    {/* Content */}
                    <View style={styles.cardContent}>
                        <Text allowFontScaling={false} style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
                            {item.title}
                        </Text>
                        <Text allowFontScaling={false} style={styles.cardSubtitle} numberOfLines={1}>
                            {item.subtitle}
                        </Text>
                        <Text allowFontScaling={false} style={styles.cardTime}>{item.time}</Text>
                    </View>

                    {/* Chevron */}
                    <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
    return (
        <Animated.View entering={FadeIn.duration(300)} style={styles.sectionLabel}>
            <Text allowFontScaling={false} style={styles.sectionLabelText}>{label}</Text>
        </Animated.View>
    );
}

// ─── NotificationsScreen ──────────────────────────────────────────────────────
export default function NotificationsScreen() {
    const allNotifs = useMemo(() => makeNotifications(), []);
    const [readIds, setReadIds] = useState<Set<string>>(
        new Set(allNotifs.filter((n) => n.read).map((n) => n.id))
    );

    const unread = useMemo(() => allNotifs.filter((n) => !readIds.has(n.id)), [allNotifs, readIds]);
    const read   = useMemo(() => allNotifs.filter((n) =>  readIds.has(n.id)), [allNotifs, readIds]);

    const markAllRead = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setReadIds(new Set(allNotifs.map((n) => n.id)));
    };

    const markRead = (id: string) => {
        setReadIds((prev) => new Set([...prev, id]));
    };

    // Back button
    const backScale = useSharedValue(1);
    const backStyle = useAnimatedStyle(() => ({ transform: [{ scale: backScale.value }] }));
    const goBack = () => {
        runOnJS(Haptics.selectionAsync)();
        backScale.value = withSequence(
            withTiming(0.85, { duration: 80 }),
            withTiming(1,    { duration: 150 })
        );
        runOnJS(router.back)();
    };

    type ListItem =
        | { kind: "section"; label: string; id: string }
        | { kind: "notif"; data: Notif };

    const listData: ListItem[] = useMemo(() => {
        const items: ListItem[] = [];
        if (unread.length > 0) {
            items.push({ kind: "section", label: "NEW", id: "sec-new" });
            unread.forEach((n) => items.push({ kind: "notif", data: n }));
        }
        if (read.length > 0) {
            items.push({ kind: "section", label: "EARLIER", id: "sec-earlier" });
            read.forEach((n) => items.push({ kind: "notif", data: n }));
        }
        return items;
    }, [unread, read]);

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.bgAccent} />

            {/* ── Header ── */}
            <Animated.View
                entering={FadeInDown.duration(380).easing(Easing.out(Easing.cubic))}
                style={styles.header}
            >
                <TouchableOpacity onPress={goBack} activeOpacity={1}>
                    <Animated.View style={[styles.backBtn, backStyle]}>
                        <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                    </Animated.View>
                </TouchableOpacity>

                <Text allowFontScaling={false} style={styles.headerTitle}>Notifications</Text>

                {unread.length > 0 ? (
                    <TouchableOpacity onPress={markAllRead} activeOpacity={0.7} style={styles.markAllBtn}>
                        <Text allowFontScaling={false} style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 90 }} />
                )}
            </Animated.View>

            {/* Unread count badge */}
            {unread.length > 0 && (
                <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.unreadBanner}>
                    <View style={styles.unreadBadge}>
                        <Text allowFontScaling={false} style={styles.unreadBadgeText}>{unread.length}</Text>
                    </View>
                    <Text allowFontScaling={false} style={styles.unreadBannerText}>
                        {unread.length} unread notification{unread.length > 1 ? "s" : ""}
                    </Text>
                </Animated.View>
            )}

            {/* ── List ── */}
            <FlatList
                data={listData}
                keyExtractor={(item) => item.kind === "section" ? item.id : item.data.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    if (item.kind === "section") {
                        return <SectionLabel label={item.label} />;
                    }
                    return (
                        <NotifCard
                            item={{ ...item.data, read: readIds.has(item.data.id) }}
                            index={index}
                            onPress={() => markRead(item.data.id)}
                        />
                    );
                }}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                ListEmptyComponent={() => (
                    <Animated.View entering={FadeIn.duration(400)} style={styles.emptyWrap}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name="notifications-off-outline" size={36} color={AppColors.grey} />
                        </View>
                        <Text allowFontScaling={false} style={styles.emptyTitle}>All caught up!</Text>
                        <Text allowFontScaling={false} style={styles.emptySubtext}>
                            No notifications right now.{"\n"}Check back later.
                        </Text>
                    </Animated.View>
                )}
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    bgAccent: { position: "absolute", width: 220, height: 220, borderRadius: 110, top: -60, right: -60, backgroundColor: "rgba(255,107,53,0.05)" },

    header: { height: IS_ANDROID ? 54 : 60, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    backBtn: { width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, borderRadius: 11, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    headerTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 17 : 18, fontWeight: "800", letterSpacing: -0.3 },
    markAllBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(255,107,53,0.1)", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    markAllText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },

    unreadBanner: { flexDirection: "row", alignItems: "center", marginHorizontal: 14, marginBottom: 8, gap: 8 },
    unreadBadge: { backgroundColor: ORANGE, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    unreadBadgeText: { color: BG, fontSize: 11, fontWeight: "800" },
    unreadBannerText: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13 },

    list: { paddingHorizontal: 14, paddingBottom: 100 },

    sectionLabel: { paddingTop: 14, paddingBottom: 6 },
    sectionLabelText: { color: ORANGE, fontSize: 9, fontWeight: "700", letterSpacing: 2.5 },

    card: { flexDirection: "row", alignItems: "center", backgroundColor: AppColors.darkBg, borderRadius: 14, padding: IS_ANDROID ? 12 : 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 12 },
    cardUnread: { backgroundColor: "rgba(255,107,53,0.06)", borderColor: "rgba(255,107,53,0.15)" },
    unreadDot: { position: "absolute", top: 14, left: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE },
    iconWrap: { width: IS_ANDROID ? 40 : 44, height: IS_ANDROID ? 40 : 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    cardContent: { flex: 1 },
    cardTitle: { color: "rgba(255,255,255,0.65)", fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600", marginBottom: 3 },
    cardTitleUnread: { color: AppColors.white, fontWeight: "700" },
    cardSubtitle: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginBottom: 4 },
    cardTime: { color: "rgba(255,255,255,0.3)", fontSize: IS_ANDROID ? 10 : 11 },

    emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100 },
    emptyIconWrap: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    emptyTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 16 : 17, fontWeight: "700", marginBottom: 8 },
    emptySubtext: { color: AppColors.grey, fontSize: IS_ANDROID ? 13 : 14, textAlign: "center", lineHeight: IS_ANDROID ? 20 : 22 },
});
