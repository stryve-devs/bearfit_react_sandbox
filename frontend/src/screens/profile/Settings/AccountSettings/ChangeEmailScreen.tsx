import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ORANGE  = "#ff7a00";
const ORANGE2 = "#cc5500";

export default function ChangeEmailScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [focused, setFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    const onFocus = () => {
        setFocused(true);
        Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    };
    const onBlur = () => {
        setFocused(false);
        Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["rgba(255,255,255,0.12)", "rgba(255,122,0,0.6)"],
    });

    const handleUpdate = () => {
        if (!email.includes("@") || !email.includes(".")) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }
        Alert.alert("Success", "Email updated successfully.", [
            { text: "OK", onPress: () => router.back() },
        ]);
    };

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.safe}>
                <View style={styles.container}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.backBtn}
                        >
                            <Feather name="arrow-left" size={18} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Change Email</Text>
                        <View style={{ width: 36 }} />
                    </View>

                    {/* Input card */}
                    <LinearGradient
                        colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.shine}
                            pointerEvents="none"
                        />
                        <Text style={styles.label}>Email Address</Text>
                        <Animated.View style={[styles.inputWrap, { borderColor }]}>
                            <Feather
                                name="mail"
                                size={16}
                                color={focused ? ORANGE : "rgba(255,255,255,0.25)"}
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new email"
                                placeholderTextColor="rgba(240,237,232,0.20)"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="done"
                                onSubmitEditing={handleUpdate}
                                selectionColor={ORANGE}
                            />
                            {email.length > 0 && (
                                <TouchableOpacity onPress={() => setEmail("")} activeOpacity={0.7}>
                                    <Feather name="x" size={15} color="rgba(255,255,255,0.25)" />
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    </LinearGradient>

                    {/* Button */}
                    <TouchableOpacity onPress={handleUpdate} activeOpacity={0.85} style={styles.btnWrap}>
                        <LinearGradient
                            colors={[ORANGE, ORANGE2]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Update Email</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    container: { flex: 1, padding: 20 },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        marginTop: 8,
    },
    backBtn: {
        width: 36, height: 36,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.10)",
        borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    title: {
        color: "#f0ede8",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: -0.3,
    },

    card: {
        borderRadius: 22,
        padding: 20,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.08)",
        position: "relative",
        overflow: "hidden",
        marginBottom: 24,
    },
    shine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
    },

    label: {
        color: ORANGE,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 12,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        color: "#f0ede8",
        fontSize: 16,
    },

    btnWrap: { borderRadius: 30, overflow: "hidden" },
    button: {
        padding: 17,
        borderRadius: 30,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
});
