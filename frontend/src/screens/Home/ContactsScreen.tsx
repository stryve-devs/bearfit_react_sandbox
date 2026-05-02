import React, { useMemo, useState, useEffect } from "react";
import {
    Alert,
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
    TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    interpolate,
    Easing,
    FadeIn,
    FadeInDown,
    ZoomIn,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type Contact     = { id: string; name: string; username: string; avatarUrl: string };
type CountryCode = { id: string; flag: string; name: string; code: string };

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE        = AppColors.orange;
const ORANGE2       = "#cc5500";
const BG            = "#080808";
const TEXT          = "#f0ede8";
const MUTED         = "rgba(240,237,232,0.42)";
const HINT          = "rgba(240,237,232,0.18)";
const IS_ANDROID    = Platform.OS === "android";
const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };
const SPRING_BOUNCY = { damping: 12, stiffness: 260, mass: 0.7 };

const NAMES = ["Aisha","Nihal","Zara","Hanan","Maya","Noah","Alex","Sara","Hamza","Rayan","Danish","Liya","Ami","Baba"];

function randomContacts(): Contact[] {
    return Array.from({ length: 16 }).map((_, i) => {
        const name     = NAMES[Math.floor(Math.random() * NAMES.length)];
        const username = `${name.toLowerCase()}${Math.floor(Math.random() * 90 + 10)}`;
        return {
            id: `${i}-${Date.now()}`,
            name,
            username,
            avatarUrl: null as any,
        };
    });
}

const COUNTRY_CODES: CountryCode[] = [
    { id: "ae", flag: "🇦🇪", name: "United Arab Emirates", code: "+971" },
    { id: "in", flag: "🇮🇳", name: "India",                code: "+91"  },
    { id: "sa", flag: "🇸🇦", name: "Saudi Arabia",         code: "+966" },
    { id: "qa", flag: "🇶🇦", name: "Qatar",                code: "+974" },
    { id: "om", flag: "🇴🇲", name: "Oman",                 code: "+968" },
    { id: "kw", flag: "🇰🇼", name: "Kuwait",               code: "+965" },
    { id: "bh", flag: "🇧🇭", name: "Bahrain",              code: "+973" },
    { id: "us", flag: "🇺🇸", name: "United States",        code: "+1"   },
    { id: "uk", flag: "🇬🇧", name: "United Kingdom",       code: "+44"  },
    { id: "pk", flag: "🇵🇰", name: "Pakistan",             code: "+92"  },
    { id: "bd", flag: "🇧🇩", name: "Bangladesh",           code: "+880" },
    { id: "lk", flag: "🇱🇰", name: "Sri Lanka",            code: "+94"  },
    { id: "af", flag: "🇦🇫", name: "Afghanistan",          code: "+93"  },
    { id: "de", flag: "🇩🇪", name: "Germany",              code: "+49"  },
    { id: "fr", flag: "🇫🇷", name: "France",               code: "+33"  },
];

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionButton({ label, onPress, done, doneLabel }: {
    label: string; onPress: () => void; done: boolean; doneLabel: string;
}) {
    const scale  = useSharedValue(1);
    const filled = useSharedValue(done ? 1 : 0);

    useEffect(() => {
        filled.value = withTiming(done ? 1 : 0, { duration: 260 });
        if (done) {
            scale.value = withSequence(
                withTiming(0.82, { duration: 90 }),
                withSpring(1, SPRING_BOUNCY)
            );
        }
    }, [done]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: `rgba(255,120,37,${interpolate(filled.value, [0, 1], [0, 0.15])})`,
        borderWidth: 1,
        borderColor: ORANGE,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 7,
        flexDirection: "row" as const,
        alignItems: "center" as const,
    }));

    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withTiming(0.82, { duration: 90 }),
            withSpring(1, SPRING_BOUNCY)
        );
        runOnJS(onPress)();
    };

    return (
        <TouchableOpacity onPress={press} activeOpacity={1}>
            <Animated.View style={animStyle}>
                {done && <Ionicons name="checkmark" size={11} color={ORANGE} style={{ marginRight: 4 }} />}
                <Text allowFontScaling={false} style={st.actionBtnText}>
                    {done ? doneLabel : label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Contact Row ──────────────────────────────────────────────────────────────
function ContactRow({ item, index, isDone, onAction, actionLabel, doneLabel }: {
    item: Contact; index: number; isDone: boolean;
    onAction: () => void; actionLabel: string; doneLabel: string;
}) {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 40).duration(380)}
            style={st.contactRow}
        >
            <View style={st.contactAvatarWrap}>
                <Image source={{ uri: item.avatarUrl }} style={st.contactAvatar} />
            </View>
            <View style={{ flex: 1 }}>
                <Text allowFontScaling={false} style={st.contactName}>{item.name}</Text>
                <Text allowFontScaling={false} style={st.contactUsername}>@{item.username}</Text>
            </View>
            <ActionButton
                label={actionLabel} doneLabel={doneLabel}
                done={isDone} onPress={onAction}
            />
        </Animated.View>
    );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
function PrimaryButton({ label, onPress, outline }: {
    label: string; onPress: () => void; outline?: boolean;
}) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withTiming(0.97, { duration: 80 }),
            withSpring(1, SPRING_CONFIG)
        );
        runOnJS(onPress)();
    };

    if (outline) {
        return (
            <TouchableOpacity onPress={press} activeOpacity={1} style={{ width: "100%" }}>
                <Animated.View style={[st.primaryBtnOutline, animStyle]}>
                    <LinearGradient
                        colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <Text allowFontScaling={false} style={st.primaryBtnTextOutline}>{label}</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={{ width: "100%" }}>
            <Animated.View style={animStyle}>
                <LinearGradient
                    colors={[ORANGE, ORANGE2]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={st.primaryBtn}
                >
                    <Text allowFontScaling={false} style={st.primaryBtnText}>{label}</Text>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Modal Card ───────────────────────────────────────────────────────────────
function AnimatedModalCard({ children, width }: { children: React.ReactNode; width: number }) {
    return (
        <Animated.View
            entering={ZoomIn.duration(260)}
            style={[st.modalCard, { width: Math.min(width - 36, IS_ANDROID ? 360 : 430) }]}
        >
            <LinearGradient
                colors={["rgba(22,22,26,0.98)", "rgba(12,12,14,0.99)"]}
                start={{ x: 0.15, y: 0 }} end={{ x: 1, y: 1 }}
                style={st.modalInner}
            >
                {/* Top shine */}
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.09)", "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={st.modalShine}
                    pointerEvents="none"
                />
                {children}
            </LinearGradient>
        </Animated.View>
    );
}

// ─── ContactsScreen ───────────────────────────────────────────────────────────
export default function ContactsScreen() {
    const { width } = useWindowDimensions();
    const params    = useLocalSearchParams<{ mode?: string }>();
    const mode      = params?.mode === "invite" ? "invite" : "connect";

    const data = useMemo(() => randomContacts(), []);
    const [query, setQuery] = useState("");

    const [invited,   setInvited]   = useState<Set<string>>(new Set());
    const [connected, setConnected] = useState<Set<string>>(new Set());

    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const [verifyModalOpen,     setVerifyModalOpen]     = useState(false);
    const [countryPickerOpen,   setCountryPickerOpen]   = useState(false);

    const [permissionGranted, setPermissionGranted] = useState(mode === "invite");
    const [phoneVerified,     setPhoneVerified]     = useState(false);
    const [phoneNumber,       setPhoneNumber]       = useState("");
    const [selectedCountry,   setSelectedCountry]   = useState<CountryCode>(COUNTRY_CODES[0]);

    const filteredData = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter(
            (item) => item.name.toLowerCase().includes(q) || item.username.toLowerCase().includes(q)
        );
    }, [query, data]);

    const toggleInvite = (id: string) => {
        setInvited((prev) => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); }
            else { next.add(id); Alert.alert("Invited ✅"); }
            return next;
        });
    };

    const continueVerify = () => {
        if (!phoneNumber.trim()) return;
        setPhoneVerified(true);
        setVerifyModalOpen(false);
    };

    // ── Empty State ───────────────────────────────────────────────────────────
    const renderConnectStart = () => (
        <Animated.View entering={FadeIn.duration(500)} style={st.emptyStateWrap}>
            <View style={st.emptyIconWrap}>
                <View style={st.emptyIconOuter} />
                <View style={st.emptyIconInner} />
                <Ionicons name="people-outline" size={IS_ANDROID ? 28 : 32} color={ORANGE} />
            </View>
            <Text allowFontScaling={false} style={st.emptyTitle}>Connect with Friends</Text>
            <Text allowFontScaling={false} style={st.emptySubtext}>
                See which of your contacts are on BearFit and follow their fitness journey.
            </Text>
            <PrimaryButton label="Connect Contacts" onPress={() => setPermissionModalOpen(true)} />
        </Animated.View>
    );

    // ── Invite List ───────────────────────────────────────────────────────────
    const renderInviteList = () => (
        <FlatList
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={st.listContent}
            data={filteredData}
            keyExtractor={(x) => x.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={st.divider} />}
            renderItem={({ item, index }) => (
                <ContactRow
                    item={item} index={index}
                    isDone={invited.has(item.id)}
                    onAction={() => toggleInvite(item.id)}
                    actionLabel="Invite" doneLabel="Invited"
                />
            )}
        />
    );

    // ── Connect Content ───────────────────────────────────────────────────────
    const renderConnectContent = () => (
        <ScrollView contentContainerStyle={st.listContent} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(400)}>
                <Text allowFontScaling={false} style={st.sectionEyebrow}>DISCOVERY</Text>
                <Text allowFontScaling={false} style={st.sectionHeading}>Contact Discovery</Text>
            </Animated.View>

            {!phoneVerified && (
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={st.verifyCard}>
                    <LinearGradient
                        colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={st.verifyCardShine}
                        pointerEvents="none"
                    />
                    <View style={st.verifyCardAccent} />
                    <View style={st.verifyCardInner}>
                        <View style={st.verifyIconWrap}>
                            <Ionicons name="shield-checkmark-outline" size={IS_ANDROID ? 22 : 26} color={ORANGE} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text allowFontScaling={false} style={st.verifyTitle}>Verify Phone Number</Text>
                            <Text allowFontScaling={false} style={st.verifySubtext}>
                                So your friends can find you on BearFit
                            </Text>
                        </View>
                    </View>
                    <PrimaryButton label="Verify Now" onPress={() => setVerifyModalOpen(true)} />
                </Animated.View>
            )}

            {phoneVerified && (
                <Animated.View entering={ZoomIn.duration(300)} style={st.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={AppColors.green} />
                    <Text allowFontScaling={false} style={st.verifiedText}>Phone Verified</Text>
                </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                <Text allowFontScaling={false} style={[st.sectionEyebrow, { marginTop: 20 }]}>YOUR CONTACTS</Text>
                <Text allowFontScaling={false} style={st.sectionHeading}>Invite your contacts</Text>
            </Animated.View>

            {filteredData.map((item, index) => (
                <ContactRow
                    key={item.id} item={item} index={index}
                    isDone={connected.has(item.id)}
                    onAction={() => {
                        setConnected((prev) => {
                            const next = new Set(prev);
                            next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                            return next;
                        });
                    }}
                    actionLabel="Connect" doneLabel="Connected"
                />
            ))}
        </ScrollView>
    );

    return (
        <LinearGradient
            colors={["#0e0e11", "#080808", "#050505"]}
            start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Corner warmth */}
            <LinearGradient
                colors={["rgba(255,100,20,0.06)", "rgba(255,100,20,0)"]}
                start={{ x: 1, y: 0 }} end={{ x: 0.1, y: 0.6 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <SafeAreaView style={st.safe} edges={["top", "left", "right"]}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                {/* ── Header ── */}
                <Animated.View
                    entering={FadeInDown.duration(400)}
                    style={st.topHeader}
                >
                    <TouchableOpacity
                        onPress={() => { Haptics.selectionAsync(); router.back(); }}
                        style={st.backBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={IS_ANDROID ? 18 : 20} color={TEXT} />
                    </TouchableOpacity>

                    <LinearGradient
                        colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.04)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={st.searchBar}
                    >
                        <Ionicons name="search" size={IS_ANDROID ? 14 : 15} color={MUTED} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search contacts..."
                            placeholderTextColor={HINT}
                            style={st.searchInput}
                            allowFontScaling={false}
                            selectionColor={ORANGE}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery("")}>
                                <Ionicons name="close-circle" size={15} color={MUTED} />
                            </TouchableOpacity>
                        )}
                    </LinearGradient>
                </Animated.View>

                {/* ── Tab Header ── */}
                <Animated.View
                    entering={FadeInDown.delay(80).duration(400)}
                    style={st.tabHeader}
                >
                    <Text allowFontScaling={false} style={st.tabText}>Contacts</Text>
                    <LinearGradient
                        colors={[ORANGE, ORANGE2]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={st.tabUnderline}
                    />
                </Animated.View>

                {/* ── Content ── */}
                {mode === "invite"
                    ? renderInviteList()
                    : permissionGranted
                        ? renderConnectContent()
                        : renderConnectStart()
                }

                {/* ── Permission Modal ── */}
                <Modal visible={permissionModalOpen} transparent animationType="fade">
                    <View style={st.modalBackdrop}>
                        <AnimatedModalCard width={width}>
                            <Text allowFontScaling={false} style={st.modalTitle}>
                                Allow Contacts Access
                            </Text>
                            <View style={st.permissionRow}>
                                <View style={st.permissionIconBox}>
                                    <Ionicons name="settings-outline" size={IS_ANDROID ? 18 : 22} color={ORANGE} />
                                </View>
                                <Text allowFontScaling={false} style={st.permissionText}>
                                    Open Settings on your phone and find BearFit.
                                </Text>
                            </View>
                            <View style={st.permissionRow}>
                                <View style={st.permissionIconBox}>
                                    <Ionicons name="people-outline" size={IS_ANDROID ? 18 : 22} color={ORANGE} />
                                </View>
                                <Text allowFontScaling={false} style={st.permissionText}>
                                    Tap Contacts and select Full Access.
                                </Text>
                            </View>
                            <View style={{ height: 8 }} />
                            <PrimaryButton label="Open Settings" onPress={() => { setPermissionModalOpen(false); setPermissionGranted(true); }} />
                            <View style={{ height: 10 }} />
                            <PrimaryButton label="Dismiss" onPress={() => setPermissionModalOpen(false)} outline />
                        </AnimatedModalCard>
                    </View>
                </Modal>

                {/* ── Verify Modal ── */}
                <Modal visible={verifyModalOpen} transparent animationType="fade">
                    <View style={st.modalBackdrop}>
                        <AnimatedModalCard width={width}>
                            <Text allowFontScaling={false} style={st.modalTitle}>Enter your phone number</Text>
                            <View style={st.phoneRow}>
                                <TouchableOpacity
                                    onPress={() => { Haptics.selectionAsync(); setCountryPickerOpen(true); }}
                                    style={st.countryBox}
                                >
                                    <Text allowFontScaling={false} style={st.countryText}>
                                        {selectedCountry.flag} {selectedCountry.code}
                                    </Text>
                                    <Ionicons name="chevron-down" size={12} color={MUTED} style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                                <TextInput
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder="Enter Number"
                                    placeholderTextColor={HINT}
                                    keyboardType="phone-pad"
                                    style={st.phoneInput}
                                    allowFontScaling={false}
                                    selectionColor={ORANGE}
                                />
                            </View>
                            <View style={st.modalDivider} />
                            <Text allowFontScaling={false} style={st.modalSubtext}>
                                A 6-digit code will be sent via SMS to verify your phone.
                            </Text>
                            <View style={st.modalBtnRow}>
                                <TouchableOpacity
                                    onPress={() => setVerifyModalOpen(false)}
                                    style={st.cancelBtn}
                                >
                                    <Text allowFontScaling={false} style={st.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={continueVerify}
                                    style={[st.continueBtn, !phoneNumber.trim() && { opacity: 0.5 }]}
                                    disabled={!phoneNumber.trim()}
                                >
                                    <LinearGradient
                                        colors={[ORANGE, ORANGE2]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Text allowFontScaling={false} style={st.continueText}>Continue</Text>
                                </TouchableOpacity>
                            </View>
                        </AnimatedModalCard>
                    </View>
                </Modal>

                {/* ── Country Picker Modal ── */}
                <Modal visible={countryPickerOpen} transparent animationType="fade">
                    <View style={st.modalBackdrop}>
                        <Animated.View
                            entering={ZoomIn.duration(260)}
                            style={[st.countryModalCard, { width: Math.min(width - 36, IS_ANDROID ? 360 : 430) }]}
                        >
                            <LinearGradient
                                colors={["rgba(22,22,26,0.98)", "rgba(12,12,14,0.99)"]}
                                start={{ x: 0.15, y: 0 }} end={{ x: 1, y: 1 }}
                                style={st.modalInner}
                            >
                                <LinearGradient
                                    colors={["transparent", "rgba(255,255,255,0.09)", "transparent"]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={st.modalShine}
                                    pointerEvents="none"
                                />
                                <Text allowFontScaling={false} style={st.modalTitle}>Choose Country</Text>
                                <ScrollView showsVerticalScrollIndicator={false} style={st.countryList}>
                                    {COUNTRY_CODES.map((country, index) => (
                                        <Animated.View
                                            key={country.id}
                                            entering={FadeInDown.delay(index * 20).duration(200)}
                                        >
                                            <TouchableOpacity
                                                onPress={() => { Haptics.selectionAsync(); setSelectedCountry(country); setCountryPickerOpen(false); }}
                                                style={[
                                                    st.countryItem,
                                                    selectedCountry.id === country.id && st.countryItemActive,
                                                ]}
                                            >
                                                <Text allowFontScaling={false} style={st.countryItemText}>
                                                    {country.flag}  {country.name}
                                                </Text>
                                                <Text allowFontScaling={false} style={st.countryCode}>{country.code}</Text>
                                                {selectedCountry.id === country.id && (
                                                    <Ionicons name="checkmark" size={14} color={ORANGE} style={{ marginLeft: 8 }} />
                                                )}
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </ScrollView>
                                <View style={{ height: 10 }} />
                                <PrimaryButton label="Close" onPress={() => setCountryPickerOpen(false)} outline />
                            </LinearGradient>
                        </Animated.View>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    safe: { flex: 1 },

    // Header
    topHeader: {
        paddingHorizontal: 14,
        paddingTop: IS_ANDROID ? 6 : 10,
        paddingBottom: IS_ANDROID ? 10 : 12,
        flexDirection: "row", alignItems: "center", gap: 10,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    backBtn: {
        width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
        alignItems: "center", justifyContent: "center",
    },
    searchBar: {
        flex: 1, height: IS_ANDROID ? 40 : 44, borderRadius: 13,
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 12, gap: 8,
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },
    searchInput: { flex: 1, color: TEXT, fontSize: IS_ANDROID ? 13 : 15, paddingVertical: 0 },

    // Tab
    tabHeader: {
        alignItems: "center", justifyContent: "center",
        paddingBottom: 4, paddingTop: 2,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    tabText: { color: TEXT, fontSize: IS_ANDROID ? 14 : 16, fontWeight: "700", marginBottom: 8, letterSpacing: 0.3 },
    tabUnderline: { width: IS_ANDROID ? 80 : 100, height: 3, borderRadius: 3 },

    // Empty state
    emptyStateWrap: { flex: 1, alignItems: "center", paddingHorizontal: 28, paddingTop: IS_ANDROID ? 70 : 90 },
    emptyIconWrap: { width: 80, height: 80, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyIconOuter: { position: "absolute", width: 80, height: 80, borderRadius: 40,
        backgroundColor: "rgba(255,120,37,0.08)", borderWidth: 1, borderColor: "rgba(255,120,37,0.18)" },
    emptyIconInner: { position: "absolute", width: 54, height: 54, borderRadius: 27,
        backgroundColor: "rgba(255,120,37,0.13)" },
    emptyTitle: { color: TEXT, fontSize: IS_ANDROID ? 18 : 20, fontWeight: "800", letterSpacing: -0.4, marginBottom: 10 },
    emptySubtext: { color: MUTED, fontSize: IS_ANDROID ? 13 : 14, textAlign: "center", lineHeight: IS_ANDROID ? 20 : 22, marginBottom: 28 },

    // List
    listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 100 },
    divider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },

    // Contact row
    contactRow: { flexDirection: "row", alignItems: "center", paddingVertical: IS_ANDROID ? 10 : 12, gap: 12 },
    contactAvatarWrap: {
        borderWidth: 1.5, borderColor: "rgba(255,120,37,0.35)",
        borderRadius: IS_ANDROID ? 24 : 26, padding: 1.5,
    },
    contactAvatar: {
        width: IS_ANDROID ? 44 : 48, height: IS_ANDROID ? 44 : 48,
        borderRadius: IS_ANDROID ? 22 : 24, backgroundColor: "#1a1a1a",
    },
    contactName: { color: TEXT, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "700" },
    contactUsername: { color: MUTED, fontSize: IS_ANDROID ? 11 : 12, marginTop: 2 },
    actionBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },

    // Sections
    sectionEyebrow: { fontSize: 9, fontWeight: "700", color: ORANGE, letterSpacing: 2.5, marginBottom: 3, marginTop: 4 },
    sectionHeading: { color: TEXT, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "700", marginBottom: 12 },

    // Verify card
    verifyCard: {
        borderRadius: 18, overflow: "hidden", marginBottom: 20,
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.04)",
        padding: IS_ANDROID ? 14 : 16, position: "relative",
    },
    verifyCardShine: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
    verifyCardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 1.5, backgroundColor: ORANGE },
    verifyCardInner: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
    verifyIconWrap: {
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: "rgba(255,120,37,0.12)",
        alignItems: "center", justifyContent: "center",
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.25)",
    },
    verifyTitle: { color: TEXT, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    verifySubtext: { color: MUTED, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },

    verifiedBadge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "rgba(76,175,80,0.12)", borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 6,
        alignSelf: "flex-start",
        borderWidth: 0.5, borderColor: "rgba(76,175,80,0.25)", marginBottom: 16,
    },
    verifiedText: { color: AppColors.green, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "700" },

    // Primary button
    primaryBtn: {
        height: IS_ANDROID ? 44 : 48, borderRadius: 14,
        alignItems: "center", justifyContent: "center", width: "100%",
    },
    primaryBtnText: { color: BG, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "700" },
    primaryBtnOutline: {
        height: IS_ANDROID ? 44 : 48, borderRadius: 14,
        alignItems: "center", justifyContent: "center", width: "100%",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)", overflow: "hidden",
    },
    primaryBtnTextOutline: { color: TEXT, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "600" },

    // Modal
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", padding: 16 },
    modalCard: { borderRadius: 22, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)" },
    modalInner: { padding: IS_ANDROID ? 18 : 20, position: "relative", overflow: "hidden" },
    modalShine: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
    modalTitle: { color: TEXT, fontSize: IS_ANDROID ? 16 : 18, fontWeight: "800", textAlign: "center", letterSpacing: -0.3, marginBottom: 18 },

    permissionRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14, gap: 12 },
    permissionIconBox: {
        width: IS_ANDROID ? 36 : 40, height: IS_ANDROID ? 36 : 40,
        borderRadius: 11, backgroundColor: "rgba(255,120,37,0.12)",
        alignItems: "center", justifyContent: "center",
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.25)",
    },
    permissionText: { flex: 1, color: MUTED, fontSize: IS_ANDROID ? 13 : 14, lineHeight: IS_ANDROID ? 20 : 22 },

    phoneRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
    countryBox: {
        height: IS_ANDROID ? 42 : 46, paddingHorizontal: 12, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        flexDirection: "row", alignItems: "center",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
    },
    countryText: { color: TEXT, fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600" },
    phoneInput: {
        flex: 1, height: IS_ANDROID ? 42 : 46, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)", color: TEXT,
        paddingHorizontal: 14, fontSize: IS_ANDROID ? 13 : 15,
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
    },
    modalDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
    modalSubtext: { color: MUTED, fontSize: IS_ANDROID ? 12 : 13, textAlign: "center", lineHeight: IS_ANDROID ? 19 : 21, marginBottom: 18 },
    modalBtnRow: { flexDirection: "row", gap: 10 },
    cancelBtn: {
        flex: 1, height: IS_ANDROID ? 44 : 48, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center", justifyContent: "center",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
    },
    cancelText: { color: TEXT, fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600" },
    continueBtn: {
        flex: 1, height: IS_ANDROID ? 44 : 48, borderRadius: 12,
        alignItems: "center", justifyContent: "center", overflow: "hidden",
        position: "relative",
    },
    continueText: { color: BG, fontSize: IS_ANDROID ? 13 : 14, fontWeight: "700" },

    // Country picker
    countryModalCard: {
        borderRadius: 22, overflow: "hidden",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
        maxHeight: IS_ANDROID ? 460 : 520,
    },
    countryList: { maxHeight: IS_ANDROID ? 320 : 380 },
    countryItem: {
        flexDirection: "row", alignItems: "center",
        paddingVertical: IS_ANDROID ? 12 : 14, paddingHorizontal: 4,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    countryItemActive: { backgroundColor: "rgba(255,120,37,0.08)", borderRadius: 8 },
    countryItemText: { flex: 1, color: TEXT, fontSize: IS_ANDROID ? 13 : 15 },
    countryCode: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "700" },
});

