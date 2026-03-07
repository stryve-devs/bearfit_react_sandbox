import React, { useMemo, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Athlete = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
};

const ORANGE = "#FF7825";
const BG = "#000000";
const MENU_BG = "#121212";
const CARD_BG = "#1A1A1A";
const PLACEHOLDER = "#2A2A2A";
const SMALL_GREY = "#B0B0B0";
const HINT_GREY = "#7A7A7A";

const IS_ANDROID = Platform.OS === "android";

export default function HomeScreen() {
    const { width } = useWindowDimensions();

    const [followed, setFollowed] = useState<Set<string>>(new Set());
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");

    const allAthletes: Athlete[] = useMemo(
        () => [
            { name: "Alex", username: "alexfit", avatarUrl: "https://i.pravatar.cc/150?img=12" },
            { name: "Maya", username: "mayalifts", avatarUrl: "https://i.pravatar.cc/150?img=32" },
            { name: "Noah", username: "noahrun", avatarUrl: "https://i.pravatar.cc/150?img=56" },
            { name: "Sara", username: "sarahit", avatarUrl: "https://i.pravatar.cc/150?img=3" },
            { name: "Hamza", username: "hamzafit", avatarUrl: "https://i.pravatar.cc/150?img=20" },
            { name: "Liya", username: "liyamove", avatarUrl: "https://i.pravatar.cc/150?img=24" },
            { name: "Rayan", username: "rayanrun", avatarUrl: "https://i.pravatar.cc/150?img=45" },
            { name: "Zara", username: "zaraflex", avatarUrl: "https://i.pravatar.cc/150?img=18" },
            { name: "Aisha", username: "aishastrong", avatarUrl: "https://i.pravatar.cc/150?img=28" },
            { name: "Nihadha", username: "nihalfit", avatarUrl: "https://i.pravatar.cc/150?img=36" },
        ],
        []
    );

    const athletes = useMemo(() => allAthletes, [allAthletes]);

    const openProfile = (athlete: Athlete) => {
        router.push("/(tabs)/profile");
    };

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
        if (!q) return allAthletes;
        return allAthletes.filter((a) => {
            const name = a.name.toLowerCase();
            const username = a.username.toLowerCase();
            return name.includes(q) || username.includes(q);
        });
    }, [query, allAthletes]);

    const cardWidth = Math.min(IS_ANDROID ? 108 : 116, Math.max(IS_ANDROID ? 98 : 102, (width - 64) / 3));
    const lineWideWidth = Math.min(240, width * 0.62);
    const lineNarrowWidth = Math.min(200, width * 0.52);

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.header}>
                <Pressable onPress={() => setMenuOpen(true)} style={styles.titleRow}>
                    <Text allowFontScaling={false} style={styles.title}>Home</Text>
                    <Ionicons name="chevron-down" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                </Pressable>

                <View style={styles.actions}>
                    <Pressable onPress={() => setSearchOpen(true)} style={styles.iconBtn}>
                        <Ionicons name="search" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push("/(tabs)/home/notifications")}
                        style={styles.iconBtn}
                    >
                        <Ionicons name="notifications-outline" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                    </Pressable>

                    <View style={{ width: 6 }} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.body}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.row}>
                    <Text allowFontScaling={false} style={styles.sectionTitle}>Suggested Athletes</Text>
                    <View style={{ flex: 1 }} />

                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: "/(tabs)/home/contacts",
                                params: { mode: "invite" },
                            });
                        }}
                        style={styles.inviteBtn}
                    >
                        <Ionicons name="add" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                        <Text allowFontScaling={false} style={styles.inviteText}>Invite a friend</Text>
                    </Pressable>
                </View>

                <View style={{ height: IS_ANDROID ? 8 : 10 }} />

                <View style={{ height: IS_ANDROID ? 160 : 170 }}>
                    <FlatList
                        horizontal
                        data={athletes}
                        keyExtractor={(item) => item.username}
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                        renderItem={({ item }) => {
                            const athleteKey = item.username;
                            const isFollowed = followed.has(athleteKey);

                            return (
                                <Pressable onPress={() => openProfile(item)} style={[styles.card, { width: cardWidth }]}>
                                    <Pressable onPress={() => openProfile(item)} style={styles.cardTop}>
                                        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                                    </Pressable>

                                    <View style={{ height: IS_ANDROID ? 6 : 8 }} />

                                    <Pressable onPress={() => openProfile(item)} style={styles.cardTextWrap}>
                                        <Text allowFontScaling={false} numberOfLines={1} style={styles.name}>
                                            {item.name}
                                        </Text>
                                    </Pressable>

                                    <Text allowFontScaling={false} style={styles.smallGrey}>Feature</Text>

                                    <View style={{ flex: 1 }} />

                                    <Pressable
                                        onPress={() => toggleFollow(athleteKey)}
                                        style={styles.followBtn}
                                    >
                                        <Text allowFontScaling={false} style={styles.followText}>
                                            {isFollowed ? "Followed" : "Follow"}
                                        </Text>
                                    </Pressable>
                                </Pressable>
                            );
                        }}
                    />
                </View>

                <View style={{ height: IS_ANDROID ? 14 : 18 }} />

                <View style={styles.center}>
                    <View style={styles.circlePlaceholder} />
                    <View style={{ height: IS_ANDROID ? 10 : 12 }} />
                    <View style={[styles.lineWide, { width: lineWideWidth }]} />
                    <View style={{ height: 10 }} />
                    <View style={[styles.lineNarrow, { width: lineNarrowWidth }]} />
                </View>

                <View style={{ height: IS_ANDROID ? 16 : 20 }} />

                <Text allowFontScaling={false} style={styles.hint}>
                    Follow People To See Their Workouts In Your Feed.
                </Text>

                <View style={styles.bottomActions}>
                    <Pressable
                        onPress={() => router.push("/(tabs)/home/discover")}
                        style={styles.bigBtn}
                    >
                        <Text allowFontScaling={false} style={styles.bigBtnText}>Discover Athletes</Text>
                    </Pressable>

                    <View style={{ height: 10 }} />

                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: "/(tabs)/home/contacts",
                                params: { mode: "connect" },
                            });
                        }}
                        style={styles.bigBtn}
                    >
                        <Text allowFontScaling={false} style={styles.bigBtnText}>Connect Contacts</Text>
                    </Pressable>
                </View>
            </ScrollView>

            <Modal visible={menuOpen} transparent animationType="fade">
                <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
                <View style={styles.menu}>
                    <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                            setMenuOpen(false);
                            router.push("/(tabs)/home");
                        }}
                    >
                        <Ionicons name="home" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                        <Text allowFontScaling={false} style={styles.menuText}>Home (Following)</Text>
                        <Ionicons name="checkmark" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                    </Pressable>

                    <View style={styles.divider} />

                    <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                            setMenuOpen(false);
                            router.push("/(tabs)/home/discover");
                        }}
                    >
                        <Ionicons name="compass" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                        <Text allowFontScaling={false} style={styles.menuText}>Discover</Text>
                    </Pressable>
                </View>
            </Modal>

            <Modal visible={searchOpen} animationType="slide">
                <SafeAreaView style={styles.searchWrap} edges={["top", "left", "right"]}>
                    <View style={styles.searchHeader}>
                        <Pressable
                            onPress={() => {
                                setSearchOpen(false);
                                setQuery("");
                            }}
                            style={styles.iconBtn}
                        >
                            <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                        </Pressable>

                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search athletes"
                            placeholderTextColor="#777"
                            style={styles.searchInput}
                            autoFocus
                            allowFontScaling={false}
                        />

                        {query.length > 0 ? (
                            <Pressable onPress={() => setQuery("")} style={styles.iconBtn}>
                                <Ionicons name="close" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                            </Pressable>
                        ) : (
                            <View style={{ width: 42 }} />
                        )}
                    </View>

                    {filtered.length === 0 ? (
                        <View style={styles.empty}>
                            <Text allowFontScaling={false} style={{ color: "white" }}>No athletes found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item.username}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setSearchOpen(false);
                                        setQuery("");
                                        openProfile(item);
                                    }}
                                    style={styles.searchRow}
                                >
                                    <Image source={{ uri: item.avatarUrl }} style={styles.searchAvatar} />
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={styles.searchName}>
                                            {item.name}
                                        </Text>
                                        <Text allowFontScaling={false} style={styles.searchUsername}>{item.username}</Text>
                                    </View>
                                </Pressable>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },

    header: {
        height: IS_ANDROID ? 52 : 56,
        backgroundColor: BG,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    title: { color: ORANGE, fontWeight: "800", fontSize: IS_ANDROID ? 20 : 22 },
    actions: { flexDirection: "row", alignItems: "center" },
    iconBtn: { padding: IS_ANDROID ? 8 : 10 },

    body: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingTop: IS_ANDROID ? 6 : 8,
        paddingBottom: 100,
    },

    row: { flexDirection: "row", alignItems: "center" },
    sectionTitle: {
        color: "white",
        fontSize: IS_ANDROID ? 13 : 14,
        fontWeight: "400",
    },
    inviteBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 6 },
    inviteText: { color: ORANGE, fontSize: IS_ANDROID ? 13 : 14 },

    card: {
        padding: IS_ANDROID ? 8 : 10,
        backgroundColor: CARD_BG,
        borderRadius: 14,
        alignItems: "center",
    },
    cardTop: {
        alignItems: "center",
        width: "100%",
    },
    avatar: {
        width: IS_ANDROID ? 54 : 60,
        height: IS_ANDROID ? 54 : 60,
        borderRadius: IS_ANDROID ? 27 : 30,
        backgroundColor: PLACEHOLDER,
    },
    cardTextWrap: {
        width: "100%",
        alignItems: "center",
    },
    name: {
        color: "white",
        fontSize: IS_ANDROID ? 11 : 12,
        textAlign: "center",
    },
    smallGrey: {
        color: SMALL_GREY,
        fontSize: IS_ANDROID ? 11 : 12,
        textAlign: "center",
    },

    followBtn: {
        width: "100%",
        height: IS_ANDROID ? 26 : 28,
        borderWidth: 1,
        borderColor: ORANGE,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    followText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },

    center: { alignItems: "center" },
    circlePlaceholder: {
        width: IS_ANDROID ? 42 : 46,
        height: IS_ANDROID ? 42 : 46,
        borderRadius: IS_ANDROID ? 21 : 23,
        backgroundColor: PLACEHOLDER,
    },
    lineWide: {
        height: IS_ANDROID ? 9 : 10,
        borderRadius: 20,
        backgroundColor: PLACEHOLDER,
    },
    lineNarrow: {
        height: IS_ANDROID ? 9 : 10,
        borderRadius: 20,
        backgroundColor: PLACEHOLDER,
    },

    hint: {
        color: HINT_GREY,
        fontSize: IS_ANDROID ? 9 : 10,
        textAlign: "center",
        alignSelf: "center",
    },

    bottomActions: {
        marginTop: "auto",
        paddingTop: IS_ANDROID ? 12 : 14,
    },

    bigBtn: {
        height: IS_ANDROID ? 40 : 42,
        borderWidth: 1,
        borderColor: ORANGE,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    bigBtnText: { color: ORANGE, fontWeight: "600", fontSize: IS_ANDROID ? 14 : 15 },

    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
    menu: {
        position: "absolute",
        top: IS_ANDROID ? 66 : 72,
        left: 12,
        width: 250,
        backgroundColor: MENU_BG,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1F1F1F",
    },
    menuItem: {
        paddingHorizontal: 12,
        paddingVertical: IS_ANDROID ? 10 : 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    menuText: { color: "white", flex: 1, fontSize: IS_ANDROID ? 13 : 14 },
    divider: { height: 1, backgroundColor: "#232323" },

    searchWrap: { flex: 1, backgroundColor: BG },
    searchHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingTop: 6,
        paddingBottom: 10,
        gap: 6,
    },
    searchInput: {
        flex: 1,
        height: IS_ANDROID ? 40 : 42,
        borderRadius: 10,
        backgroundColor: MENU_BG,
        color: "white",
        paddingHorizontal: 12,
        fontSize: IS_ANDROID ? 14 : 16,
        paddingVertical: 0,
    },
    empty: { flex: 1, alignItems: "center", justifyContent: "center" },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: IS_ANDROID ? 10 : 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1B1B1B",
    },
    searchAvatar: {
        width: IS_ANDROID ? 34 : 36,
        height: IS_ANDROID ? 34 : 36,
        borderRadius: IS_ANDROID ? 17 : 18,
        backgroundColor: PLACEHOLDER,
    },
    searchName: {
        color: "white",
        fontWeight: "600",
        textAlign: "left",
        fontSize: IS_ANDROID ? 14 : 15,
    },
    searchUsername: {
        color: SMALL_GREY,
        fontSize: IS_ANDROID ? 12 : 13,
    },
});
