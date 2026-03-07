import React from "react";
import { Image, Pressable, StyleSheet, Text, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BG = "#000000";
const BTN_BG = "#1A1A1A";
const GREY = "#B0B0B0";

export default function Home5FullImage() {
    // Expecting: router.push({ pathname: "/(tabs)/home/full-image", params: { imageUrl } })
    const params = useLocalSearchParams<{ imageUrl?: string }>();
    const imageUrl = typeof params.imageUrl === "string" ? params.imageUrl : "";

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.container}>
                {/* Image center (basic zoom/pan alternative) */}
                <View style={styles.imageWrap}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.fallback}>
                            <Ionicons name="image-outline" size={44} color={GREY} />
                            <Text style={styles.fallbackText}>Image not found</Text>
                        </View>
                    )}
                </View>

                {/* Close button (top-right) */}
                <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="white" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    container: { flex: 1, backgroundColor: BG },
    imageWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
    image: { width: "100%", height: "100%", backgroundColor: BG },

    closeBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: BTN_BG,
        alignItems: "center",
        justifyContent: "center",
    },

    fallback: { alignItems: "center", justifyContent: "center" },
    fallbackText: { color: GREY, marginTop: 10 },
});