import React, { useState, useRef, useLayoutEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    ScrollView,
    Pressable,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Animated,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#ff7a00";
const ITEM_H = 45;
const VISIBLE = 5;
const DRUM_H = ITEM_H * VISIBLE;

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

// ─── Drum Components ──────────────────────────────────────────────────────────

const DrumItem = ({ item, index, scrollY, localIdx }: any) => {
    const position = Animated.subtract(index * ITEM_H, scrollY);
    const rotateX = position.interpolate({
        inputRange: [-ITEM_H * 2, 0, ITEM_H * 2],
        outputRange: ['45deg', '0deg', '-45deg'],
        extrapolate: 'clamp',
    });
    const scale = position.interpolate({
        inputRange: [-ITEM_H * 2, 0, ITEM_H * 2],
        outputRange: [0.85, 1, 0.85],
        extrapolate: 'clamp',
    });
    const opacity = position.interpolate({
        inputRange: [-ITEM_H * 2, 0, ITEM_H * 2],
        outputRange: [0.3, 1, 0.3],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={[drumSt.item, { transform: [{ perspective: 1000 }, { rotateX }, { scale }], opacity }]}>
            <Text style={[drumSt.text, index === localIdx && drumSt.textSelected]}>{item}</Text>
        </Animated.View>
    );
};

function DrumColumn({ items, selectedIndex, onSelect, width }: any) {
    const scrollY = useRef(new Animated.Value(selectedIndex * ITEM_H)).current;
    const scrollRef = useRef<ScrollView>(null);
    const [localIdx, setLocalIdx] = useState(selectedIndex);

    useLayoutEffect(() => {
        const timer = setTimeout(() => {
            scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
        }, 50);
        return () => clearTimeout(timer);
    }, [selectedIndex]);

    const commit = (y: number) => {
        const idx = Math.max(0, Math.min(Math.round(y / ITEM_H), items.length - 1));
        setLocalIdx(idx);
        onSelect(idx);
        scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
    };

    return (
        <View style={[drumSt.wrap, { width }]}>
            <View style={drumSt.highlight} pointerEvents="none" />
            <Animated.ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_H}
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                onMomentumScrollEnd={(e: any) => commit(e.nativeEvent.contentOffset.y)}
                contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
            >
                {items.map((item: any, i: number) => (
                    <DrumItem key={i} item={item} index={i} scrollY={scrollY} localIdx={localIdx} />
                ))}
            </Animated.ScrollView>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [link, setLink] = useState("");
    const [sex, setSex] = useState("");

    // Committed Birthday
    const [monthIdx, setMonthIdx] = useState(0);
    const [dayIdx, setDayIdx] = useState(0);
    const [yearIdx, setYearIdx] = useState(0);
    const [hasBirthday, setHasBirthday] = useState(false);

    // Temp values for modal
    const [tmpMonth, setTmpMonth] = useState(0);
    const [tmpDay, setTmpDay] = useState(0);
    const [tmpYear, setTmpYear] = useState(0);

    const [showSex, setShowSex] = useState(false);
    const [showBirthday, setShowBirthday] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showPhoto, setShowPhoto] = useState(false);

    const birthdayLabel = hasBirthday
        ? `${MONTHS[monthIdx]} ${DAYS[dayIdx]}, ${YEARS[yearIdx]}`
        : "";

    const openBirthday = () => {
        setTmpMonth(monthIdx);
        setTmpDay(dayIdx);
        setTmpYear(yearIdx);
        setShowBirthday(true);
    };

    const confirmBirthday = () => {
        setMonthIdx(tmpMonth);
        setDayIdx(tmpDay);
        setYearIdx(tmpYear);
        setHasBirthday(true);
        setShowBirthday(false);
    };

    const handleDone = () => {
        Alert.alert("Profile Updated", "Changes saved successfully.");
        router.back();
    };

    return (
        <SafeAreaView style={st.safe}>
            {/* Header: Done button is now ALWAYS active */}
            <View style={st.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={st.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleDone}>
                    <Text style={[st.done, st.doneActive]}>Done</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
                {/* Avatar */}
                <View style={st.avatarSection}>
                    <View style={st.avatarWrapper}>
                        <Image source={{ uri: "https://i.pravatar.cc/150" }} style={st.avatar} />
                        <TouchableOpacity style={st.cameraBtn} onPress={() => setShowPhoto(true)}>
                            <Feather name="camera" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setShowPhoto(true)}>
                        <Text style={st.changePic}>Change Picture</Text>
                    </TouchableOpacity>
                </View>

                {/* Public Data */}
                <Text style={st.sectionLabel}>Public profile data</Text>
                <View style={[st.card, { marginTop: 12 }]}>
                    <View style={inSt.row}>
                        <Text style={inSt.label}>Name</Text>
                        <TextInput style={inSt.input} placeholder="Your full name" placeholderTextColor="#3a3a3a" value={name} onChangeText={setName}/>
                    </View>
                    <View style={inSt.row}>
                        <Text style={inSt.label}>Bio</Text>
                        <TextInput style={[inSt.input, { height: 56 }]} placeholder="Describe yourself" placeholderTextColor="#3a3a3a" value={bio} onChangeText={setBio} multiline/>
                    </View>
                    <View style={[inSt.row, { borderBottomWidth: 0 }]}>
                        <Text style={inSt.label}>Link</Text>
                        <TextInput style={inSt.input} placeholder="https://example.com" placeholderTextColor="#3a3a3a" value={link} onChangeText={setLink} autoCapitalize="none"/>
                    </View>
                </View>

                {/* Private Data */}
                <View style={st.privateTitleRow}>
                    <Text style={st.sectionLabel}>Private data</Text>
                    <TouchableOpacity onPress={() => setShowInfo(true)} hitSlop={8}>
                        <Ionicons name="help-circle-outline" size={16} color="#555" />
                    </TouchableOpacity>
                </View>

                <View style={st.card}>
                    <TouchableOpacity style={st.selectRow} onPress={() => setShowSex(true)} activeOpacity={0.7}>
                        <Text style={st.selectLabel}>Sex</Text>
                        <View style={st.selectRight}>
                            <Text style={[st.selectValue, !sex && st.selectPlaceholder]}>{sex || "Select"}</Text>
                            <Feather name="chevron-right" size={16} color="#444" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[st.selectRow, { borderBottomWidth: 0 }]} onPress={openBirthday} activeOpacity={0.7}>
                        <Text style={st.selectLabel}>Birthday</Text>
                        <View style={st.selectRight}>
                            <Text style={[st.selectValue, !hasBirthday && st.selectPlaceholder]}>{birthdayLabel || "Select"}</Text>
                            <Feather name="chevron-right" size={16} color="#444" />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modals */}
            <Modal visible={showBirthday} transparent animationType="slide">
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowBirthday(false)}><View style={st.backdropOverlay} /></Pressable>
                    <View style={st.sheet}>
                        <View style={st.handle} />
                        <Text style={st.sheetTitle}>Birthday</Text>
                        <View style={st.drumRow}>
                            <DrumColumn items={MONTHS} selectedIndex={tmpMonth} onSelect={setTmpMonth} width={130} />
                            <DrumColumn items={DAYS} selectedIndex={tmpDay} onSelect={setTmpDay} width={60} />
                            <DrumColumn items={YEARS} selectedIndex={tmpYear} onSelect={setTmpYear} width={80} />
                        </View>
                        <TouchableOpacity style={st.confirmBtn} onPress={confirmBirthday}><Text style={st.confirmText}>Confirm</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showSex} transparent animationType="slide">
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSex(false)}><View style={st.backdropOverlay} /></Pressable>
                    <View style={st.sheet}>
                        <View style={st.handle} />
                        <Text style={st.sheetTitle}>Select Sex</Text>
                        {["Male", "Female", "Other"].map(item => (
                            <TouchableOpacity key={item} style={st.sheetRow} onPress={() => { setSex(item); setShowSex(false); }}>
                                <Text style={[st.sheetRowText, sex === item && { color: ORANGE }]}>{item}</Text>
                                {sex === item && <Feather name="check" size={18} color={ORANGE} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={st.cancelBtn} onPress={() => setShowSex(false)}><Text style={st.cancelText}>Cancel</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showInfo} transparent animationType="fade">
                <View style={st.infoOverlay}><View style={st.infoBox}><Text style={st.infoTitle}>Private Data</Text><Text style={st.infoBody}>Your private data is used to personalise your experience. Having age and sex will allows you to compare yourself to athletes in your specific demographic.</Text><TouchableOpacity style={st.confirmBtn} onPress={() => setShowInfo(false)}><Text style={st.confirmText}>Got it</Text></TouchableOpacity></View></View>
            </Modal>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#000" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
    headerTitle: { color: "#fff", fontSize: 17, fontWeight: "600" },
    done: { fontSize: 16, fontWeight: "600" },
    doneActive: { color: ORANGE },
    scroll: { paddingHorizontal: 20, paddingBottom: 60 },
    avatarSection: { alignItems: "center", marginTop: 8, marginBottom: 28 },
    avatarWrapper: { position: "relative" },
    avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#1c1c1e" },
    cameraBtn: { position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#000" },
    changePic: { color: ORANGE, marginTop: 10, fontSize: 14, fontWeight: "500" },
    sectionLabel: { color: "#555", fontSize: 11, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" },
    privateTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 28, marginBottom: 10 },
    card: { backgroundColor: "#0d0d0d", borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: "#1a1a1a" },
    selectRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#1e1e1e" },
    selectLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
    selectRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    selectValue: { color: ORANGE, fontSize: 15 },
    selectPlaceholder: { color: "#3a3a3a" },
    backdropOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    sheet: { backgroundColor: "#111", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingBottom: 24 },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#333", alignSelf: "center", marginTop: 12, marginBottom: 16 },
    sheetTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 12, textAlign: 'center' },
    sheetRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#1c1c1c" },
    sheetRowText: { color: "#fff", fontSize: 16 },
    cancelBtn: { marginTop: 10, paddingVertical: 14, borderRadius: 14, backgroundColor: "#1c1c1e", alignItems: "center" },
    cancelText: { color: "#ff3b30", fontSize: 16, fontWeight: "600" },
    drumRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
    confirmBtn: { backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 16 },
    confirmText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    infoOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
    infoBox: { backgroundColor: "#111", padding: 24, borderRadius: 24, width: "82%", borderWidth: 1, borderColor: "#1e1e1e" },
    infoTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginBottom: 10 },
    infoBody: { color: "#888", fontSize: 14, lineHeight: 22, marginBottom: 20 },
});

const drumSt = StyleSheet.create({
    wrap: { height: DRUM_H, overflow: "hidden" },
    highlight: { position: "absolute", top: ITEM_H * 2, left: 0, right: 0, height: ITEM_H, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8 },
    item: { height: ITEM_H, justifyContent: "center", alignItems: "center" },
    text: { color: "#fff", fontSize: 16 },
    textSelected: { fontWeight: "bold", fontSize: 18, color: ORANGE },
});

const inSt = StyleSheet.create({
    row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1e1e1e", paddingVertical: 14, gap: 16 },
    label: { color: "#fff", fontSize: 15, fontWeight: "600", width: 52, paddingTop: 2 },
    input: { flex: 1, color: "#fff", fontSize: 15 },
});