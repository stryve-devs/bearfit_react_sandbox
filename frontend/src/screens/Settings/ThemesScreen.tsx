import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const orange = "#FF7A00";

export default function ThemesScreen() {
    const router = useRouter();

    const [selectedTheme, setSelectedTheme] = useState("Use OS Setting");
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#FF7825" />
                </TouchableOpacity>

                <Text style={styles.title}>Theme</Text>

                <View style={{ width: 26 }} />
            </View>

            {/* MAIN ROW */}
            <View style={styles.rowContainer}>
                <Text style={styles.label}>Theme</Text>

                <TouchableOpacity
                    style={styles.rightRow}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.selectedText}>{selectedTheme}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#aaa" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* MODAL (BOTTOM SHEET) */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        {/* HANDLE */}
                        <View style={styles.handle} />

                        <ThemeOption
                            icon="settings"
                            text="Use OS Setting"
                            onPress={() => {
                                setSelectedTheme("Use OS Setting");
                                setModalVisible(false);
                            }}
                        />

                        <ThemeOption
                            icon="dark-mode"
                            text="Dark 😈"
                            onPress={() => {
                                setSelectedTheme("Dark 😈");
                                setModalVisible(false);
                            }}
                        />

                        <ThemeOption
                            icon="light-mode"
                            text="Light 💡"
                            onPress={() => {
                                setSelectedTheme("Light 💡");
                                setModalVisible(false);
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* OPTION COMPONENT */
const ThemeOption = ({ icon, text, onPress }: any) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <MaterialIcons name={icon} size={22} color={orange} />
        <Text style={styles.optionText}>{text}</Text>
    </TouchableOpacity>
);

/* STYLES */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        backgroundColor: "#2A1608",
    },

    title: {
        color: "white",
        fontSize: 20, // 🔥 bigger
        fontWeight: "600",
    },

    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
    },

    label: {
        color: orange,
        fontSize: 17, // 🔥 bigger
        fontWeight: "600",
    },

    rightRow: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: "auto",
        gap: 6,
    },

    selectedText: {
        color: "#ccc",
        fontSize: 15,
    },

    divider: {
        height: 1,
        backgroundColor: "#333",
    },

    /* MODAL */

    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },

    modalBox: {
        backgroundColor: "black",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: orange,
    },

    handle: {
        width: 40,
        height: 4,
        backgroundColor: orange,
        alignSelf: "center",
        borderRadius: 4,
        marginBottom: 16,
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2E2E2E",
        paddingVertical: 16,
        borderRadius: 18,
        marginBottom: 10,
        gap: 10,
    },

    optionText: {
        color: orange,
        fontSize: 17, // 🔥 bigger
        fontWeight: "600",
    },
});