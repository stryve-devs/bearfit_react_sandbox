import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#FF7825";

export default function WorkoutSettingsScreen() {
    const router = useRouter();

    const [keepAwake, setKeepAwake] = useState(false);
    const [plate, setPlate] = useState(false);
    const [rpe, setRpe] = useState(false);
    const [smart, setSmart] = useState(false);
    const [inline, setInline] = useState(false);
    const [pr, setPr] = useState(false);

    const [showPicker, setShowPicker] = useState(false);
    const [restTime, setRestTime] = useState("60 sec");

    const times = [
        "5 sec","10 sec","15 sec","30 sec",
        "45 sec","60 sec","90 sec",
        "2 min","3 min","4 min","5 min"
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <ScrollView style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={ORANGE} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Workout Settings</Text>

                    <View style={{ width: 26 }} />
                </View>

                {/* NAV */}
                <Nav text="Sounds" onPress={() => router.push("/settings/sounds")} />

                <Nav
                    text="Default Rest Timer"
                    value={restTime}
                    onPress={() => setShowPicker(true)}
                />

                <Nav text="First day of the week" onPress={() => router.push("/settings/first-day")} />
                <Nav text="Previous Workout Values" onPress={() => router.push("/settings/previous-workout")} />
                <Nav text="Warm up Sets" onPress={() => router.push("/settings/warmup")} />

                {/* SWITCHES */}
                <SwitchRow title="Keep Awake During Workout" desc="Enable this if you don't want your phone to sleep" value={keepAwake} setValue={setKeepAwake} />
                <SwitchRow title="Plate Calculator" desc="Calculate plates for barbell exercises" value={plate} setValue={setPlate} />
                <SwitchRow title="RPE Tracking" desc="Log perceived exertion for each set" value={rpe} setValue={setRpe} />
                <SwitchRow title="Smart Superset Scrolling" desc="Auto scroll to next exercise" value={smart} setValue={setSmart} />
                <SwitchRow title="Inline Timer" desc="Built-in stopwatch for duration exercises" value={inline} setValue={setInline} />
                <SwitchRow title="Live Personal Record Notification" desc="Notify when you hit a PR" value={pr} setValue={setPr} />

            </ScrollView>

            {/* SCROLL PICKER MODAL */}
            <Modal visible={showPicker} transparent animationType="slide">
                <View style={styles.modal}>
                    <View style={styles.sheet}>

                        <Text style={styles.sheetTitle}>Select Rest Time</Text>

                        <ScrollView>
                            {times.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.option}
                                    onPress={() => {
                                        setRestTime(item);
                                        setShowPicker(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity onPress={() => setShowPicker(false)}>
                            <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* COMPONENTS */

const Nav = ({ text, onPress, value }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
        <Text style={styles.rowText}>{text}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            {value && <Text style={styles.value}>{value}</Text>}
            <Ionicons name="chevron-forward" size={20} color="white" />
        </View>
    </TouchableOpacity>
);

const SwitchRow = ({ title, desc, value, setValue }: any) => (
    <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>{title}</Text>
            <Text style={styles.desc}>{desc}</Text>
        </View>
        <Switch value={value} onValueChange={setValue} thumbColor={ORANGE} />
    </View>
);

/* STYLES */

const styles = StyleSheet.create({
    container: { padding: 16 },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#2b2b2b",
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },

    rowText: {
        color: ORANGE,
        fontSize: 18, // ✅ bigger like language
    },

    value: {
        color: "#aaa",
        marginRight: 6,
    },

    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2b2b2b",
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },

    desc: {
        color: "#aaa",
        fontSize: 14,
        marginTop: 4,
    },

    modal: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.6)",
    },

    sheet: {
        backgroundColor: "#2b2b2b",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "60%",
    },

    sheetTitle: {
        color: ORANGE,
        fontSize: 18,
        textAlign: "center",
        marginBottom: 10,
    },

    option: {
        padding: 14,
    },

    optionText: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
    },

    cancel: {
        color: "red",
        textAlign: "center",
        marginTop: 10,
    },
});