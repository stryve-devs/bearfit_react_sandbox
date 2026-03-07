import React, { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Athlete = {
    name: string;
    username: string;
    avatarUrl?: string;
};

type Post = {
    id: string;
    athlete: Athlete;
    caption: string;
    imageUrl: string;
    comments: string[];
    exercises: string[];
};

type MediaItem = {
    title: string;
    imageUrl: string;
    route: string;
};

const BG = "#000000";
const CARD_BG = "#0B0B0B";
const ORANGE = "#FF7825";
const GREY = "#B0B0B0";
const MENU_BG = "#0B0B0B";

export default function ProfileMediaScreen() {
    const { width } = useWindowDimensions();

    const params = useLocalSearchParams<{
        athleteName?: string;
        athleteUsername?: string;
        athleteAvatarUrl?: string;
    }>();

    const athlete: Athlete = useMemo(
        () => ({
            name: params.athleteName ?? "Athlete",
            username: params.athleteUsername ?? "athlete01",
            avatarUrl: params.athleteAvatarUrl,
        }),
        [params.athleteName, params.athleteUsername, params.athleteAvatarUrl]
    );

    const [menuOpen, setMenuOpen] = useState(false);

    const media: MediaItem[] = useMemo(
        () => [
            {
                title: "Back + Stuff",
                imageUrl: `https://picsum.photos/seed/${athlete.username}_m1/900/900`,
                route: "/(tabs)/home/home18",
            },
            {
                title: "Loose Belly fat",
                imageUrl: `https://picsum.photos/seed/${athlete.username}_m2/900/900`,
                route: "/(tabs)/home/home19",
            },
        ],
        [athlete.username]
    );

    const onMenuItem = (title: string) => {
        setMenuOpen(false);
        Alert.alert(`${title} (demo) ✅`);
    };

    const openWorkoutDetail = (item: MediaItem, index: number) => {
        const post: Post = {
            id: `${athlete.username}_media_${index}`,
            athlete,
            caption: item.title,
            imageUrl: item.imageUrl,
            comments: ["Nice!", "🔥🔥", "Good work!"],
            exercises: [
                "Bench Press (Barbell)",
                "Back Extension (Hyperextension)",
                "Knee Raise Parallel Bars",
            ],
        };

        router.push({
            pathname: item.route as any,
            params: { post: JSON.stringify(post) },
        });
    };

    const imageHeight = Math.min(260, Math.max(210, width * 0.62));

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={22} color="white" />
                </Pressable>

                <Text numberOfLines={1} style={styles.title}>{`${athlete.name}'s Media`}</Text>

                <Pressable onPress={() => setMenuOpen(true)} style={styles.iconBtn}>
                    <Ionicons name="ellipsis-horizontal" size={22} color="white" />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            >
                {media.map((item, i) => (
                    <View key={`${item.title}-${i}`} style={styles.mediaCard}>
                        <View style={styles.imageWrap}>
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={[styles.image, { height: imageHeight }]}
                                resizeMode="cover"
                            />
                        </View>

                        <View style={styles.bottomBar}>
                            <Pressable
                                onPress={() => openWorkoutDetail(item, i)}
                                style={styles.bottomRow}
                            >
                                <Text numberOfLines={1} style={styles.itemTitle}>{item.title}</Text>
                                <Ionicons name="arrow-forward" size={18} color="white" />
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={menuOpen} transparent animationType="fade">
                <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />

                <View style={styles.sheet}>
                    <Pressable style={styles.sheetItem} onPress={() => onMenuItem("Save As Routine")}>
                        <Text style={styles.sheetText}>Save As Routine</Text>
                    </Pressable>

                    <View style={styles.sheetGap} />

                    <Pressable style={styles.sheetItem} onPress={() => onMenuItem("Copy Workout")}>
                        <Text style={styles.sheetText}>Copy Workout</Text>
                    </Pressable>

                    <View style={styles.sheetGap} />

                    <Pressable style={styles.sheetItem} onPress={() => onMenuItem("Report Workout")}>
                        <Text style={styles.sheetText}>Report Workout</Text>
                    </Pressable>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: BG,
    },

    header: {
        height: 56,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    iconBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        flex: 1,
        color: "white",
        fontSize: 16,
        fontWeight: "800",
        textAlign: "center",
    },

    list: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 18,
    },
    mediaCard: {
        marginBottom: 12,
    },

    imageWrap: {
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        overflow: "hidden",
        backgroundColor: "#1A1A1A",
    },
    image: {
        width: "100%",
    },

    bottomBar: {
        backgroundColor: CARD_BG,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        overflow: "hidden",
    },
    bottomRow: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    itemTitle: {
        flex: 1,
        color: "white",
        fontWeight: "800",
    },

    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 14,
        backgroundColor: MENU_BG,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#222",
    },
    sheetItem: {
        backgroundColor: "#7A7A7A",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    sheetText: {
        color: "white",
        fontSize: 14,
    },
    sheetGap: {
        height: 10,
    },
});