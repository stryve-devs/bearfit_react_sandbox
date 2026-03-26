import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#FF7825"; // ✅ SAME AS SETTINGS
const BLUE = "#007AFF";   // ✅ DARKER SYSTEM BLUE

export default function ProfileScreen() {
    const router = useRouter();

    const [showPictureSheet, setShowPictureSheet] = useState(false);
    const [showGenderSheet, setShowGenderSheet] = useState(false);

    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState("");

    const formatDate = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = cleaned;

        if (cleaned.length > 2 && cleaned.length <= 4) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        } else if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
                2,
                4
            )}/${cleaned.slice(4, 8)}`;
        }

        setBirthday(formatted);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={ORANGE} />
                </TouchableOpacity>

                <Text style={styles.title}>Edit Profile</Text>

                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.done}>Done</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 18 }}>
                {/* IMAGE */}
                <View style={styles.center}>
                    <View style={styles.avatar} />

                    <TouchableOpacity onPress={() => setShowPictureSheet(true)}>
                        <Text style={styles.changePic}>Change Picture</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.section}>Public profile data</Text>

                <Input label="Name" placeholder="Your full name" />
                <Input label="Bio" placeholder="Describe yourself" />
                <Input label="Link" placeholder="https://example.com" />

                <Text style={styles.section}>Private data</Text>

                {/* SEX */}
                <TouchableOpacity
                    style={styles.rowInput}
                    onPress={() => setShowGenderSheet(true)}
                >
                    <Text
                        style={[
                            styles.rowText,
                            { color: gender ? "white" : BLUE },
                        ]}
                    >
                        {gender || "Sex"}
                    </Text>
                </TouchableOpacity>

                {/* BIRTHDAY */}
                <View style={styles.rowInput}>
                    <TextInput
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={BLUE}
                        style={styles.rowText}
                        value={birthday}
                        onChangeText={formatDate}
                        keyboardType="numeric"
                    />
                </View>
            </ScrollView>

            {/* CHANGE PICTURE */}
            <Modal visible={showPictureSheet} transparent animationType="slide">
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowPictureSheet(false)}
                >
                    <View style={styles.sheet}>
                        <Row icon="camera" text="Take Picture" />
                        <Row icon="image" text="Upload from Photos" />
                        <Row icon="delete" text="Delete Picture" />
                    </View>
                </Pressable>
            </Modal>

            {/* GENDER */}
            <Modal visible={showGenderSheet} transparent animationType="slide">
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowGenderSheet(false)}
                >
                    <View style={styles.sheet}>
                        <GenderRow text="Male" selected={gender === "Male"} onPress={() => { setGender("Male"); setShowGenderSheet(false); }} />
                        <GenderRow text="Female" selected={gender === "Female"} onPress={() => { setGender("Female"); setShowGenderSheet(false); }} />
                        <GenderRow text="Rather not say" selected={gender === "Rather not say"} onPress={() => { setGender("Rather not say"); setShowGenderSheet(false); }} />
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

/* INPUT */
const Input = ({ label, placeholder }: any) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            placeholder={placeholder}
            placeholderTextColor="#888"
            style={styles.input}
        />
    </View>
);

/* ROW */
const Row = ({ icon, text }: any) => (
    <View style={styles.optionRow}>
        <MaterialIcons name={icon} size={24} color="white" />
        <Text style={styles.optionText}>{text}</Text>
    </View>
);

/* GENDER */
const GenderRow = ({ text, selected, onPress }: any) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
        <Text style={[styles.optionText, selected && { color: BLUE }]}>
            {text}
        </Text>
        {selected && <Ionicons name="checkmark" size={22} color={BLUE} />}
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
        backgroundColor: "#1C120A",
    },

    title: {
        color: ORANGE,
        fontSize: 20,
        fontWeight: "700", // ✅ BOLD
    },

    done: {
        color: ORANGE,
        fontSize: 17,
        fontWeight: "600",
    },

    center: { alignItems: "center", marginBottom: 24 },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#333",
    },

    changePic: {
        color: BLUE,
        marginTop: 12,
        fontSize: 17,
    },

    section: {
        color: "#aaa",
        fontSize: 15,
        marginTop: 22,
        marginBottom: 12,
    },

    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: "#444",
        marginBottom: 16,
    },

    label: {
        color: "white",
        fontSize: 16,
    },

    input: {
        color: "white",
        paddingVertical: 8,
        fontSize: 16,
    },

    rowInput: {
        borderBottomWidth: 1,
        borderBottomColor: "#444",
        paddingVertical: 18,
        marginBottom: 12,
    },

    rowText: {
        fontSize: 16,
        color: "white",
    },

    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },

    sheet: {
        backgroundColor: "#1c1c1c",
        padding: 26,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },

    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 18,
    },

    optionText: {
        color: "white",
        fontSize: 17,
    },
});