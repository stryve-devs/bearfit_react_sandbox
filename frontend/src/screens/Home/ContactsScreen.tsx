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
    withDelay,
    interpolate,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    ZoomIn,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type Contact    = { id: string; name: string; username: string; avatarUrl: string };
type CountryCode = { id: string; flag: string; name: string; code: string };

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const BG         = AppColors.black;
const IS_ANDROID = Platform.OS === "android";
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
            avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
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
function ActionButton({
                          label,
                          onPress,
                          done,
                          doneLabel,
                      }: {
    label: string;
    onPress: () => void;
    done: boolean;
    doneLabel: string;
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
        backgroundColor: `rgba(255,107,53,${interpolate(filled.value, [0, 1], [0, 0.15])})`,
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
                <Text allowFontScaling={false} style={styles.actionBtnText}>
                    {done ? doneLabel : label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Contact Row ──────────────────────────────────────────────────────────────
function ContactRow({
                        item,
                        index,
                        isDone,
                        onAction,
                        actionLabel,
                        doneLabel,
                    }: {
    item: Contact;
    index: number;
    isDone: boolean;
    onAction: () => void;
    actionLabel: string;
    doneLabel: string;
}) {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 40).duration(380).springify().damping(18)}
            style={styles.contactRow}
        >
            <View style={styles.contactAvatarWrap}>
                <Image source={{ uri: item.avatarUrl }} style={styles.contactAvatar} />
            </View>
            <View style={{ flex: 1 }}>
                <Text allowFontScaling={false} style={styles.contactName}>{item.name}</Text>
                <Text allowFontScaling={false} style={styles.contactUsername}>@{item.username}</Text>
            </View>
            <ActionButton
                label={actionLabel}
                doneLabel={doneLabel}
                done={isDone}
                onPress={onAction}
            />
        </Animated.View>
    );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
function PrimaryButton({ label, onPress, outline }: { label: string; onPress: () => void; outline?: boolean }) {
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
    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={{ width: "100%" }}>
            <Animated.View style={[styles.primaryBtn, outline && styles.primaryBtnOutline, animStyle]}>
                <Text allowFontScaling={false} style={[styles.primaryBtnText, outline && styles.primaryBtnTextOutline]}>
                    {label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Modal Card ───────────────────────────────────────────────────────────────
function AnimatedModalCard({ children, width }: { children: React.ReactNode; width: number }) {
    return (
        <Animated.View
            entering={ZoomIn.duration(260).springify().damping(18)}
            style={[styles.modalCard, { width: Math.min(width - 36, IS_ANDROID ? 360 : 430) }]}
        >
            <BlurView intensity={20} tint="dark" style={styles.modalBlur}>
                {children}
            </BlurView>
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

    // ── Empty State (Connect) ─────────────────────────────────────────────────
    const renderConnectStart = () => (
        <Animated.View entering={FadeIn.duration(500)} style={styles.emptyStateWrap}>
            <View style={styles.emptyIconWrap}>
                <View style={styles.emptyIconOuter} />
                <View style={styles.emptyIconInner} />
                <Ionicons name="people-outline" size={IS_ANDROID ? 28 : 32} color={ORANGE} />
            </View>
            <Text allowFontScaling={false} style={styles.emptyTitle}>Connect with Friends</Text>
            <Text allowFontScaling={false} style={styles.emptySubtext}>
                See which of your contacts are on BearFit and follow their fitness journey.
            </Text>
            <PrimaryButton label="Connect Contacts" onPress={() => setPermissionModalOpen(true)} />
        </Animated.View>
    );

    // ── Invite List ───────────────────────────────────────────────────────────
    const renderInviteList = () => (
        <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredData}
            keyExtractor={(x) => x.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            renderItem={({ item, index }) => (
                <ContactRow
                    item={item}
                    index={index}
                    isDone={invited.has(item.id)}
                    onAction={() => toggleInvite(item.id)}
                    actionLabel="Invite"
                    doneLabel="Invited"
                />
            )}
        />
    );

    // ── Connect Content ───────────────────────────────────────────────────────
    const renderConnectContent = () => (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {/* Section: Contact Discovery */}
            <Animated.View entering={FadeInDown.duration(400).springify()}>
                <Text allowFontScaling={false} style={styles.sectionEyebrow}>DISCOVERY</Text>
                <Text allowFontScaling={false} style={styles.sectionHeading}>Contact Discovery</Text>
            </Animated.View>

            {/* Verify Card */}
            {!phoneVerified && (
                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.verifyCard}>
                    <View style={styles.verifyCardAccent} />
                    <View style={styles.verifyCardInner}>
                        <View style={styles.verifyIconWrap}>
                            <Ionicons name="shield-checkmark-outline" size={IS_ANDROID ? 22 : 26} color={ORANGE} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text allowFontScaling={false} style={styles.verifyTitle}>Verify Phone Number</Text>
                            <Text allowFontScaling={false} style={styles.verifySubtext}>
                                So your friends can find you on BearFit
                            </Text>
                        </View>
                    </View>
                    <PrimaryButton label="Verify Now" onPress={() => setVerifyModalOpen(true)} />
                </Animated.View>
            )}

            {phoneVerified && (
                <Animated.View entering={ZoomIn.duration(300)} style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={AppColors.green} />
                    <Text allowFontScaling={false} style={styles.verifiedText}>Phone Verified</Text>
                </Animated.View>
            )}

            {/* Section: Invite */}
            <Animated.View entering={FadeInDown.delay(150).duration(400).springify()}>
                <Text allowFontScaling={false} style={[styles.sectionEyebrow, { marginTop: 20 }]}>YOUR CONTACTS</Text>
                <Text allowFontScaling={false} style={styles.sectionHeading}>Invite your contacts</Text>
            </Animated.View>

            {filteredData.map((item, index) => (
                <ContactRow
                    key={item.id}
                    item={item}
                    index={index}
                    isDone={connected.has(item.id)}
                    onAction={() => {
                        setConnected((prev) => {
                            const next = new Set(prev);
                            next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                            return next;
                        });
                    }}
                    actionLabel="Connect"
                    doneLabel="Connected"
                />
            ))}
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.bgAccent1} />

            {/* ── Header ── */}
            <Animated.View entering={FadeInDown.duration(400).springify().damping(18)} style={styles.topHeader}>
                <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); router.back(); }}
                    style={styles.backBtn}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                </TouchableOpacity>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={IS_ANDROID ? 15 : 16} color={AppColors.grey} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search contacts..."
                        placeholderTextColor={AppColors.grey}
                        style={styles.searchInput}
                        allowFontScaling={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery("")}>
                            <Ionicons name="close-circle" size={15} color={AppColors.grey} />
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            {/* ── Tab Header ── */}
            <Animated.View entering={FadeInDown.delay(80).duration(400).springify()} style={styles.tabHeader}>
                <Text allowFontScaling={false} style={styles.tabText}>Contacts</Text>
                <View style={styles.tabUnderline} />
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
                <View style={styles.modalBackdrop}>
                    <AnimatedModalCard width={width}>
                        <Text allowFontScaling={false} style={styles.modalTitle}>
                            Allow Contacts Access
                        </Text>

                        <View style={styles.permissionRow}>
                            <View style={styles.permissionIconBox}>
                                <Ionicons name="settings-outline" size={IS_ANDROID ? 18 : 22} color={ORANGE} />
                            </View>
                            <Text allowFontScaling={false} style={styles.permissionText}>
                                Open Settings on your phone and find BearFit.
                            </Text>
                        </View>

                        <View style={styles.permissionRow}>
                            <View style={styles.permissionIconBox}>
                                <Ionicons name="people-outline" size={IS_ANDROID ? 18 : 22} color={ORANGE} />
                            </View>
                            <Text allowFontScaling={false} style={styles.permissionText}>
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
                <View style={styles.modalBackdrop}>
                    <AnimatedModalCard width={width}>
                        <Text allowFontScaling={false} style={styles.modalTitle}>Enter your phone number</Text>

                        <View style={styles.phoneRow}>
                            <TouchableOpacity
                                onPress={() => { Haptics.selectionAsync(); setCountryPickerOpen(true); }}
                                style={styles.countryBox}
                            >
                                <Text allowFontScaling={false} style={styles.countryText}>
                                    {selectedCountry.flag} {selectedCountry.code}
                                </Text>
                                <Ionicons name="chevron-down" size={12} color={AppColors.grey} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>

                            <TextInput
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Enter Number"
                                placeholderTextColor={AppColors.grey}
                                keyboardType="phone-pad"
                                style={styles.phoneInput}
                                allowFontScaling={false}
                            />
                        </View>

                        <View style={styles.modalDivider} />

                        <Text allowFontScaling={false} style={styles.modalSubtext}>
                            A 6-digit code will be sent via SMS to verify your phone.
                        </Text>

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity
                                onPress={() => setVerifyModalOpen(false)}
                                style={styles.cancelBtn}
                            >
                                <Text allowFontScaling={false} style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={continueVerify}
                                style={[styles.continueBtn, !phoneNumber.trim() && { opacity: 0.5 }]}
                                disabled={!phoneNumber.trim()}
                            >
                                <Text allowFontScaling={false} style={styles.continueText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedModalCard>
                </View>
            </Modal>

            {/* ── Country Picker Modal ── */}
            <Modal visible={countryPickerOpen} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        entering={ZoomIn.duration(260).springify().damping(18)}
                        style={[styles.countryModalCard, { width: Math.min(width - 36, IS_ANDROID ? 360 : 430) }]}
                    >
                        <BlurView intensity={20} tint="dark" style={styles.modalBlur}>
                            <Text allowFontScaling={false} style={styles.modalTitle}>Choose Country</Text>
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.countryList}>
                                {COUNTRY_CODES.map((country, index) => (
                                    <Animated.View
                                        key={country.id}
                                        entering={FadeInDown.delay(index * 20).duration(200)}
                                    >
                                        <TouchableOpacity
                                            onPress={() => { Haptics.selectionAsync(); setSelectedCountry(country); setCountryPickerOpen(false); }}
                                            style={[
                                                styles.countryItem,
                                                selectedCountry.id === country.id && styles.countryItemActive,
                                            ]}
                                        >
                                            <Text allowFontScaling={false} style={styles.countryItemText}>
                                                {country.flag}  {country.name}
                                            </Text>
                                            <Text allowFontScaling={false} style={styles.countryCode}>{country.code}</Text>
                                            {selectedCountry.id === country.id && (
                                                <Ionicons name="checkmark" size={14} color={ORANGE} style={{ marginLeft: 8 }} />
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </ScrollView>
                            <View style={{ height: 10 }} />
                            <PrimaryButton label="Close" onPress={() => setCountryPickerOpen(false)} outline />
                        </BlurView>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    bgAccent1: { position: "absolute", width: 260, height: 260, borderRadius: 130, top: -80, right: -80, backgroundColor: "rgba(255,107,53,0.05)" },

    // Header
    topHeader: { paddingHorizontal: 14, paddingTop: IS_ANDROID ? 6 : 10, paddingBottom: IS_ANDROID ? 10 : 12, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(0,0,0,0.6)" },
    backBtn: { width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, borderRadius: 11, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    searchBar: { flex: 1, height: IS_ANDROID ? 40 : 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.055)", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    searchInput: { flex: 1, color: AppColors.white, fontSize: IS_ANDROID ? 13 : 15, paddingVertical: 0 },

    // Tab
    tabHeader: { alignItems: "center", justifyContent: "center", paddingBottom: 4, paddingTop: 2, backgroundColor: "rgba(0,0,0,0.4)", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
    tabText: { color: AppColors.white, fontSize: IS_ANDROID ? 14 : 16, fontWeight: "700", marginBottom: 8, letterSpacing: 0.3 },
    tabUnderline: { width: IS_ANDROID ? 80 : 100, height: 3, backgroundColor: ORANGE, borderRadius: 3 },

    // Empty state
    emptyStateWrap: { flex: 1, alignItems: "center", paddingHorizontal: 28, paddingTop: IS_ANDROID ? 70 : 90 },
    emptyIconWrap: { width: 80, height: 80, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyIconOuter: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,107,53,0.08)", borderWidth: 1, borderColor: "rgba(255,107,53,0.18)" },
    emptyIconInner: { position: "absolute", width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(255,107,53,0.13)" },
    emptyTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 18 : 20, fontWeight: "800", letterSpacing: -0.4, marginBottom: 10 },
    emptySubtext: { color: AppColors.grey, fontSize: IS_ANDROID ? 13 : 14, textAlign: "center", lineHeight: IS_ANDROID ? 20 : 22, marginBottom: 28 },

    // List
    listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 100 },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },

    // Contact row
    contactRow: { flexDirection: "row", alignItems: "center", paddingVertical: IS_ANDROID ? 10 : 12, gap: 12 },
    contactAvatarWrap: { borderWidth: 1.5, borderColor: "rgba(255,107,53,0.35)", borderRadius: IS_ANDROID ? 24 : 26, padding: 1.5 },
    contactAvatar: { width: IS_ANDROID ? 44 : 48, height: IS_ANDROID ? 44 : 48, borderRadius: IS_ANDROID ? 22 : 24, backgroundColor: AppColors.darkBg },
    contactName: { color: AppColors.white, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "700" },
    contactUsername: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 2 },
    actionBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },

    // Sections
    sectionEyebrow: { fontSize: 9, fontWeight: "700", color: ORANGE, letterSpacing: 2.5, marginBottom: 3, marginTop: 4 },
    sectionHeading: { color: AppColors.white, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "700", marginBottom: 12 },

    // Verify card
    verifyCard: { backgroundColor: AppColors.darkBg, borderRadius: 16, overflow: "hidden", marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: IS_ANDROID ? 14 : 16 },
    verifyCardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: ORANGE },
    verifyCardInner: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
    verifyIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    verifyTitle: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    verifySubtext: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },

    verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(76,175,80,0.12)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: "rgba(76,175,80,0.25)", marginBottom: 16 },
    verifiedText: { color: AppColors.green, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "700" },

    // Primary button
    primaryBtn: { height: IS_ANDROID ? 44 : 48, borderRadius: 12, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center", width: "100%" },
    primaryBtnOutline: { backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
    primaryBtnText: { color: BG, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "700" },
    primaryBtnTextOutline: { color: AppColors.white },

    // Modal
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", padding: 16 },
    modalCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    modalBlur: { padding: IS_ANDROID ? 18 : 20 },
    modalTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 16 : 18, fontWeight: "800", textAlign: "center", letterSpacing: -0.3, marginBottom: 18 },

    permissionRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14, gap: 12 },
    permissionIconBox: { width: IS_ANDROID ? 36 : 40, height: IS_ANDROID ? 36 : 40, borderRadius: 10, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    permissionText: { flex: 1, color: AppColors.grey, fontSize: IS_ANDROID ? 13 : 14, lineHeight: IS_ANDROID ? 20 : 22 },

    phoneRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
    countryBox: { height: IS_ANDROID ? 42 : 46, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    countryText: { color: AppColors.white, fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600" },
    phoneInput: { flex: 1, height: IS_ANDROID ? 42 : 46, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", color: AppColors.white, paddingHorizontal: 14, fontSize: IS_ANDROID ? 13 : 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    modalDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginBottom: 14 },
    modalSubtext: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, textAlign: "center", lineHeight: IS_ANDROID ? 19 : 21, marginBottom: 18 },
    modalBtnRow: { flexDirection: "row", gap: 10 },
    cancelBtn: { flex: 1, height: IS_ANDROID ? 44 : 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    cancelText: { color: AppColors.white, fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600" },
    continueBtn: { flex: 1, height: IS_ANDROID ? 44 : 48, borderRadius: 12, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
    continueText: { color: BG, fontSize: IS_ANDROID ? 13 : 14, fontWeight: "700" },

    // Country picker
    countryModalCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", maxHeight: IS_ANDROID ? 460 : 520 },
    countryList: { maxHeight: IS_ANDROID ? 320 : 380 },
    countryItem: { flexDirection: "row", alignItems: "center", paddingVertical: IS_ANDROID ? 12 : 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
    countryItemActive: { backgroundColor: "rgba(255,107,53,0.08)", borderRadius: 8 },
    countryItemText: { flex: 1, color: AppColors.white, fontSize: IS_ANDROID ? 13 : 15 },
    countryCode: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "700" },
});
