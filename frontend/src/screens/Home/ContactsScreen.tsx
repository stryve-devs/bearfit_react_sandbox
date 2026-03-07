import React, { useMemo, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Contact = { id: string; name: string; username: string; avatarUrl: string };

type CountryCode = {
    id: string;
    flag: string;
    name: string;
    code: string;
};

const ORANGE = "#FF7825";
const BG = "#000000";
const CARD_BG = "#1A1A1A";
const GREY = "#B0B0B0";
const PLACEHOLDER = "#2A2A2A";
const HEADER_BG = "#111111";
const DIVIDER = "#1B1B1B";

const IS_ANDROID = Platform.OS === "android";

function randomContacts(): Contact[] {
    const names = [
        "Aisha",
        "Nihal",
        "Zara",
        "Hanan",
        "Maya",
        "Noah",
        "Alex",
        "Sara",
        "Hamza",
        "Rayan",
        "Danish",
        "Liya",
        "Ami",
        "Baba",
    ];

    return Array.from({ length: 16 }).map((_, i) => {
        const name = names[Math.floor(Math.random() * names.length)];
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
    { id: "in", flag: "🇮🇳", name: "India", code: "+91" },
    { id: "sa", flag: "🇸🇦", name: "Saudi Arabia", code: "+966" },
    { id: "qa", flag: "🇶🇦", name: "Qatar", code: "+974" },
    { id: "om", flag: "🇴🇲", name: "Oman", code: "+968" },
    { id: "kw", flag: "🇰🇼", name: "Kuwait", code: "+965" },
    { id: "bh", flag: "🇧🇭", name: "Bahrain", code: "+973" },
    { id: "us", flag: "🇺🇸", name: "United States", code: "+1" },
    { id: "uk", flag: "🇬🇧", name: "United Kingdom", code: "+44" },
    { id: "pk", flag: "🇵🇰", name: "Pakistan", code: "+92" },
    { id: "bd", flag: "🇧🇩", name: "Bangladesh", code: "+880" },
    { id: "lk", flag: "🇱🇰", name: "Sri Lanka", code: "+94" },
    { id: "af", flag: "🇦🇫", name: "Afghanistan", code: "+93" },
    { id: "de", flag: "🇩🇪", name: "Germany", code: "+49" },
    { id: "fr", flag: "🇫🇷", name: "France", code: "+33" },
];

export default function ContactsScreen() {
    const { width } = useWindowDimensions();
    const params = useLocalSearchParams<{ mode?: string }>();
    const mode = params?.mode === "invite" ? "invite" : "connect";

    const data = useMemo(() => randomContacts(), []);
    const [query, setQuery] = useState("");

    const [invited, setInvited] = useState<Set<string>>(new Set());
    const [connected, setConnected] = useState<Set<string>>(new Set());

    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [countryPickerOpen, setCountryPickerOpen] = useState(false);

    const [permissionGranted, setPermissionGranted] = useState(mode === "invite");
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);

    const filteredData = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter((item) => {
            return item.name.toLowerCase().includes(q) || item.username.toLowerCase().includes(q);
        });
    }, [query, data]);

    const toggleInvite = (id: string) => {
        setInvited((prev) => {
            const next = new Set(prev);
            const willInvite = !next.has(id);

            if (willInvite) {
                next.add(id);
                Alert.alert("Invited ✅");
            } else {
                next.delete(id);
            }

            return next;
        });
    };

    const toggleConnect = (id: string) => {
        setConnected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const startConnectFlow = () => {
        setPermissionModalOpen(true);
    };

    const grantPermission = () => {
        setPermissionModalOpen(false);
        setPermissionGranted(true);
    };

    const dismissPermission = () => {
        setPermissionModalOpen(false);
    };

    const openVerify = () => {
        setVerifyModalOpen(true);
    };

    const closeVerify = () => {
        setVerifyModalOpen(false);
    };

    const continueVerify = () => {
        if (!phoneNumber.trim()) return;
        setPhoneVerified(true);
        setVerifyModalOpen(false);
    };

    const selectCountry = (country: CountryCode) => {
        setSelectedCountry(country);
        setCountryPickerOpen(false);
    };

    const renderInviteList = () => {
        return (
            <FlatList
                contentContainerStyle={styles.inviteList}
                data={filteredData}
                keyExtractor={(x) => x.id}
                ItemSeparatorComponent={() => <View style={styles.lineDivider} />}
                renderItem={({ item }) => {
                    const isInvited = invited.has(item.id);

                    return (
                        <View style={styles.simpleRow}>
                            <Image source={{ uri: item.avatarUrl }} style={styles.simpleAvatar} />
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={styles.simpleName}>{item.name}</Text>
                            </View>

                            <Pressable onPress={() => toggleInvite(item.id)}>
                                <Text allowFontScaling={false} style={styles.actionText}>
                                    {isInvited ? "Invited" : "Invite"}
                                </Text>
                            </Pressable>
                        </View>
                    );
                }}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    const renderConnectStart = () => {
        return (
            <View style={styles.emptyStateWrap}>
                <Ionicons
                    name="book-outline"
                    size={IS_ANDROID ? 44 : 56}
                    color={GREY}
                />
                <Text allowFontScaling={false} style={styles.emptyStateText}>
                    See which of your contacts are on BearFit.
                </Text>

                <Pressable onPress={startConnectFlow} style={styles.orangeBtnLarge}>
                    <Text allowFontScaling={false} style={styles.orangeBtnText}>Connect Contacts</Text>
                </Pressable>
            </View>
        );
    };

    const renderConnectContent = () => {
        return (
            <ScrollView
                contentContainerStyle={styles.connectContent}
                showsVerticalScrollIndicator={false}
            >
                <Text allowFontScaling={false} style={styles.sectionHeading}>Contact Discovery</Text>

                {!phoneVerified && (
                    <View style={styles.verifyCard}>
                        <Text allowFontScaling={false} style={styles.verifyText}>
                            Verify your phone number so your friends can find you on BearFit
                        </Text>

                        <Pressable onPress={openVerify} style={styles.orangeBtnLarge}>
                            <Text allowFontScaling={false} style={styles.orangeBtnText}>Verify</Text>
                        </Pressable>
                    </View>
                )}

                <Text allowFontScaling={false} style={styles.sectionHeading}>Invite your contacts</Text>

                {filteredData.map((item) => {
                    const isConnected = connected.has(item.id);

                    return (
                        <View key={item.id} style={styles.contactListRow}>
                            <Image source={{ uri: item.avatarUrl }} style={styles.contactAvatar} />

                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={styles.contactName}>{item.name}</Text>
                            </View>

                            <Pressable onPress={() => toggleConnect(item.id)}>
                                <Text allowFontScaling={false} style={styles.actionText}>
                                    {isConnected ? "Connected" : "Connect"}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.topHeader}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons
                        name="arrow-back"
                        size={IS_ANDROID ? 20 : 22}
                        color={GREY}
                    />
                </Pressable>

                <View style={styles.searchBar}>
                    <Ionicons
                        name="search"
                        size={IS_ANDROID ? 18 : 20}
                        color={GREY}
                    />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search"
                        placeholderTextColor={GREY}
                        style={styles.searchInput}
                        allowFontScaling={false}
                    />
                </View>
            </View>

            <View style={styles.tabHeader}>
                <Text allowFontScaling={false} style={styles.tabText}>Contacts</Text>
                <View style={styles.tabUnderline} />
            </View>

            {mode === "invite" ? (
                renderInviteList()
            ) : permissionGranted ? (
                renderConnectContent()
            ) : (
                renderConnectStart()
            )}

            <Modal visible={permissionModalOpen} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, { width: Math.min(width - 36, IS_ANDROID ? 360 : 430) }]}>
                        <Text allowFontScaling={false} style={styles.modalTitle}>
                            Give BearFit permissions to access your contacts in Settings.
                        </Text>

                        <View style={styles.permissionRow}>
                            <View style={styles.permissionIconBox}>
                                <Ionicons
                                    name="settings-outline"
                                    size={IS_ANDROID ? 20 : 24}
                                    color="white"
                                />
                            </View>
                            <Text allowFontScaling={false} style={styles.permissionText}>
                                To give BearFit access to your contacts, open Settings on your phone.
                            </Text>
                        </View>

                        <View style={styles.permissionRow}>
                            <View style={styles.permissionIconBox}>
                                <Ionicons
                                    name="people-outline"
                                    size={IS_ANDROID ? 20 : 24}
                                    color="white"
                                />
                            </View>
                            <Text allowFontScaling={false} style={styles.permissionText}>
                                Search for BearFit and tap on Contacts. Then select Full Access.
                            </Text>
                        </View>

                        <Pressable onPress={grantPermission} style={styles.orangeBtnLarge}>
                            <Text allowFontScaling={false} style={styles.orangeBtnText}>Open Settings</Text>
                        </Pressable>

                        <View style={{ height: 10 }} />

                        <Pressable onPress={dismissPermission} style={styles.dismissBtn}>
                            <Text allowFontScaling={false} style={styles.dismissText}>Dismiss</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal visible={verifyModalOpen} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, { width: Math.min(width - 36, IS_ANDROID ? 360 : 430) }]}>
                        <Text allowFontScaling={false} style={styles.modalTitle}>Enter your phone number</Text>

                        <View style={styles.phoneRow}>
                            <Pressable onPress={() => setCountryPickerOpen(true)} style={styles.countryBox}>
                                <Text allowFontScaling={false} style={styles.countryText}>
                                    {selectedCountry.flag} {selectedCountry.code}
                                </Text>
                            </Pressable>

                            <TextInput
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Enter Number"
                                placeholderTextColor={GREY}
                                keyboardType="phone-pad"
                                style={styles.phoneInput}
                                allowFontScaling={false}
                            />
                        </View>

                        <View style={styles.modalDivider} />

                        <Text allowFontScaling={false} style={styles.modalSubtext}>
                            A 6 digit code will be sent via SMS to verify your phone.
                        </Text>

                        <View style={styles.modalButtonRow}>
                            <Pressable onPress={closeVerify} style={styles.cancelBtn}>
                                <Text allowFontScaling={false} style={styles.cancelText}>Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={continueVerify}
                                style={[
                                    styles.continueBtn,
                                    !phoneNumber.trim() && styles.continueBtnDisabled,
                                ]}
                                disabled={!phoneNumber.trim()}
                            >
                                <Text allowFontScaling={false} style={styles.continueText}>Continue</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={countryPickerOpen} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.countryModalCard, { width: Math.min(width - 36, IS_ANDROID ? 360 : 430) }]}>
                        <Text allowFontScaling={false} style={styles.countryModalTitle}>
                            Choose Country Code
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.countryList}>
                            {COUNTRY_CODES.map((country) => (
                                <Pressable
                                    key={country.id}
                                    onPress={() => selectCountry(country)}
                                    style={styles.countryItem}
                                >
                                    <Text allowFontScaling={false} style={styles.countryItemText}>
                                        {country.flag} {country.name} ({country.code})
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        <Pressable onPress={() => setCountryPickerOpen(false)} style={styles.dismissBtn}>
                            <Text allowFontScaling={false} style={styles.dismissText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },

    topHeader: {
        backgroundColor: HEADER_BG,
        paddingHorizontal: 12,
        paddingTop: IS_ANDROID ? 4 : 8,
        paddingBottom: IS_ANDROID ? 8 : 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    backBtn: {
        width: IS_ANDROID ? 28 : 32,
        height: IS_ANDROID ? 28 : 32,
        alignItems: "center",
        justifyContent: "center",
    },
    searchBar: {
        flex: 1,
        height: IS_ANDROID ? 38 : 44,
        borderRadius: 12,
        backgroundColor: BG,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: "white",
        fontSize: IS_ANDROID ? 13 : 15,
        paddingVertical: 0,
    },

    tabHeader: {
        backgroundColor: HEADER_BG,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 2,
    },
    tabText: {
        color: "white",
        fontSize: IS_ANDROID ? 14 : 16,
        marginBottom: 6,
        textAlign: "center",
    },
    tabUnderline: {
        width: IS_ANDROID ? 100 : 120,
        height: 3,
        backgroundColor: ORANGE,
        borderRadius: 3,
    },

    emptyStateWrap: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: IS_ANDROID ? 60 : 80,
    },
    emptyStateText: {
        color: GREY,
        fontSize: IS_ANDROID ? 13 : 15,
        textAlign: "center",
        marginTop: 12,
        marginBottom: 18,
    },

    orangeBtnLarge: {
        width: "100%",
        height: IS_ANDROID ? 40 : 46,
        borderRadius: 14,
        backgroundColor: ORANGE,
        alignItems: "center",
        justifyContent: "center",
    },
    orangeBtnText: {
        color: "white",
        fontSize: IS_ANDROID ? 14 : 15,
        fontWeight: "600",
    },

    inviteList: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 16,
    },

    simpleRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: IS_ANDROID ? 10 : 12,
    },
    simpleAvatar: {
        width: IS_ANDROID ? 42 : 48,
        height: IS_ANDROID ? 42 : 48,
        borderRadius: IS_ANDROID ? 21 : 24,
        backgroundColor: PLACEHOLDER,
        marginRight: 10,
    },
    simpleName: {
        color: "white",
        fontSize: IS_ANDROID ? 14 : 15,
    },

    connectContent: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 16,
    },
    sectionHeading: {
        color: GREY,
        fontSize: IS_ANDROID ? 12 : 14,
        marginBottom: 8,
    },
    verifyCard: {
        backgroundColor: CARD_BG,
        borderRadius: 18,
        padding: IS_ANDROID ? 12 : 14,
        marginBottom: 14,
    },
    verifyText: {
        color: "white",
        fontSize: IS_ANDROID ? 13 : 14,
        textAlign: "center",
        marginBottom: 12,
        lineHeight: IS_ANDROID ? 20 : 22,
    },

    contactListRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: IS_ANDROID ? 10 : 12,
        borderBottomWidth: 1,
        borderBottomColor: DIVIDER,
    },
    contactAvatar: {
        width: IS_ANDROID ? 42 : 48,
        height: IS_ANDROID ? 42 : 48,
        borderRadius: IS_ANDROID ? 21 : 24,
        backgroundColor: PLACEHOLDER,
        marginRight: 10,
    },
    contactName: {
        color: "white",
        fontSize: IS_ANDROID ? 14 : 15,
    },
    actionText: {
        color: ORANGE,
        fontSize: IS_ANDROID ? 13 : 14,
        fontWeight: "600",
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    modalCard: {
        backgroundColor: "#1C1C22",
        borderRadius: 20,
        padding: IS_ANDROID ? 16 : 18,
    },
    modalTitle: {
        color: "white",
        fontSize: IS_ANDROID ? 15 : 17,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: IS_ANDROID ? 22 : 26,
        marginBottom: 14,
    },
    permissionRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    permissionIconBox: {
        width: IS_ANDROID ? 36 : 40,
        height: IS_ANDROID ? 36 : 40,
        borderRadius: 10,
        backgroundColor: "#2A2A30",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    permissionText: {
        flex: 1,
        color: GREY,
        fontSize: IS_ANDROID ? 13 : 14,
        lineHeight: IS_ANDROID ? 20 : 22,
    },

    dismissBtn: {
        height: IS_ANDROID ? 40 : 44,
        borderRadius: 14,
        backgroundColor: "#2A2A30",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    dismissText: {
        color: "white",
        fontSize: IS_ANDROID ? 14 : 15,
        fontWeight: "500",
    },

    phoneRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    countryBox: {
        height: IS_ANDROID ? 40 : 44,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#2A2A30",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    countryText: {
        color: "white",
        fontSize: IS_ANDROID ? 13 : 14,
    },
    phoneInput: {
        flex: 1,
        height: IS_ANDROID ? 40 : 44,
        color: "white",
        fontSize: IS_ANDROID ? 13 : 14,
        paddingVertical: 0,
    },
    modalDivider: {
        height: 1,
        backgroundColor: "#34343A",
        marginBottom: 12,
    },
    modalSubtext: {
        color: GREY,
        fontSize: IS_ANDROID ? 13 : 14,
        textAlign: "center",
        lineHeight: IS_ANDROID ? 20 : 22,
        marginBottom: 16,
    },

    modalButtonRow: {
        flexDirection: "row",
        gap: 10,
    },
    cancelBtn: {
        flex: 1,
        height: IS_ANDROID ? 42 : 46,
        borderRadius: 14,
        backgroundColor: "#2A2A30",
        alignItems: "center",
        justifyContent: "center",
    },
    continueBtn: {
        flex: 1,
        height: IS_ANDROID ? 42 : 46,
        borderRadius: 14,
        backgroundColor: ORANGE,
        alignItems: "center",
        justifyContent: "center",
    },
    continueBtnDisabled: {
        opacity: 0.55,
    },
    cancelText: {
        color: "white",
        fontSize: IS_ANDROID ? 14 : 15,
        fontWeight: "500",
    },
    continueText: {
        color: "white",
        fontSize: IS_ANDROID ? 14 : 15,
        fontWeight: "500",
    },

    lineDivider: {
        height: 1,
        backgroundColor: DIVIDER,
    },

    countryModalCard: {
        backgroundColor: "#1C1C22",
        borderRadius: 20,
        padding: IS_ANDROID ? 16 : 18,
        maxHeight: IS_ANDROID ? 420 : 500,
    },
    countryModalTitle: {
        color: "white",
        fontSize: IS_ANDROID ? 15 : 17,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 14,
    },
    countryList: {
        maxHeight: IS_ANDROID ? 300 : 360,
    },
    countryItem: {
        paddingVertical: IS_ANDROID ? 12 : 14,
    },
    countryItemText: {
        color: "white",
        fontSize: IS_ANDROID ? 14 : 16,
    },
});