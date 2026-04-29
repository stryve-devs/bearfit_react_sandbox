import React, { useState, useEffect } from "react";
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
    Animated,
    Alert,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "@/components/profile/Toast";
import * as ImagePicker from "expo-image-picker";
import { profileService } from "@/api/services/profile.service";
import api from '@/api/client';

const ORANGE = "#ff7a00";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// ─── Glass card wrapper ───────────────────────────────────────────────────────
type GlassCardProps = React.PropsWithChildren<{ style?: any } & { [key: string]: any }>;
const GlassCard: React.FC<GlassCardProps> = ({ children, style, ...rest }: GlassCardProps) => (
    <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[cardSt.card, style]}
        {...rest}
    >
        <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.1)", "transparent"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={cardSt.shine}
            pointerEvents="none"
        />
        {children}
    </LinearGradient>
);
// ─── Input row with Animated Focus Line ───────────────────────────────────────
const InputRow = ({
                      label,
                      last = false,
                      multiline = false,
                      ...inputProps
                  }: {
    label: string;
    last?: boolean;
    multiline?: boolean;
    [key: string]: any;
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const scaleX = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    return (
        <View style={[inSt.row, last && { borderBottomWidth: 0 }]}>
            <Text style={inSt.label}>{label}</Text>
            <TextInput
                style={[inSt.input, multiline && { height: 52 }]}
                placeholderTextColor="rgba(240,237,232,0.2)"
                multiline={multiline}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...inputProps}
            />
            <Animated.View style={[inSt.focusLine, { opacity: focusAnim, transform: [{ scaleX }] }]}>
                <LinearGradient
                    colors={["transparent", ORANGE, "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState("Alex Rivera");
    const [bio, setBio] = useState("");
    const [link, setLink] = useState("");
    const [sex, setSex] = useState("");
    const [profilePicUri, setProfilePicUri] = useState("https://i.pravatar.cc/150?img=12");
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const [profilePicR2Key, setProfilePicR2Key] = useState<string | null>(null);
    const [showProfilePicModal, setShowProfilePicModal] = useState(false);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    // Reactive state to indicate image has successfully loaded (causes a render)
    const [imageLoaded, setImageLoaded] = useState(false);
    // Only true when an error is final (debounced and not recovered). Used to show red text.
    const [imageFinalError, setImageFinalError] = useState(false);
    const [imageProxyTried, setImageProxyTried] = useState(false);
    // When we probe/validate URLs we want to suppress immediate Image error UI until probing finishes
    const [validatingImage, setValidatingImage] = useState(false);
    const [pendingImageError, setPendingImageError] = useState<string | null>(null);
    const [pendingErrorWaiting, setPendingErrorWaiting] = useState(false);
    // Debounce timer ref: when an Image onError occurs, wait a short time before showing red error
    const pendingErrorTimerRef = React.useRef<number | null>(null);
    // Per-URI request id — incremented whenever profilePicUri changes. Used to ignore stale timers/promotions.
    const imageRequestIdRef = React.useRef(0);
    // Track whether the Image actually loaded successfully (to ignore stale onError events)
    const imageLoadedRef = React.useRef(false);

    // Validate image URL when it changes and attempt encoded fallbacks automatically
    useEffect(() => {
        let mounted = true;
        if (!profilePicUri) return;

        (async () => {
             // New URI -> mark as not yet loaded (prevents stale onError promotions)
             imageLoadedRef.current = false;
             // bump request id so any previous timers/promotions are considered stale
             imageRequestIdRef.current += 1;
             const myRequestId = imageRequestIdRef.current;
             setValidatingImage(true);
             setImageLoading(true);
             setImageError(null);
             setPendingImageError(null);
            // If this URI already points to our backend proxy, skip further retry/encoding logic
            try {
                const proxyBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + '/uploads/proxy' : null;
                if (proxyBase && profilePicUri && profilePicUri.startsWith(proxyBase)) {
                    // Ensure it's well-formed and let RN Image attempt to load it
                    setImageLoading(false);
                    return;
                }
            } catch (e) {
                // ignore and continue
            }

            const tryFetch = async (url: string) => {
                try {
                    const res = await fetch(url, { method: 'GET' });
                    return res.ok;
                } catch (err) {
                    return false;
                }
            };

            try {
                // 1) Try original
                if (await tryFetch(profilePicUri)) {
                    if (mounted) setImageLoading(false);
                    return;
                }

                // 2) Try encodeURI
                const enc1 = encodeURI(profilePicUri);
                if (enc1 !== profilePicUri && await tryFetch(enc1)) {
                    if (mounted) { setProfilePicUri(enc1); setImageLoading(false); }
                    return;
                }

                // 3) Try per-segment encoding
                const parts = profilePicUri.split('/');
                const encParts = parts.map((p: string) => encodeURIComponent(p));
                const enc2 = encParts.join('/');
                if (enc2 !== profilePicUri && await tryFetch(enc2)) {
                    if (mounted) { setProfilePicUri(enc2); setImageLoading(false); }
                    return;
                }

                // Not reachable
                if (mounted) {
                    // If we haven't tried proxying yet, attempt proxy via backend once
                    if (!imageProxyTried) {
                        try {
                            const proxyUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?url=${encodeURIComponent(profilePicUri)}`;
                            console.log('Attempting backend proxy for image:', proxyUrl);
                            setImageProxyTried(true);
                            setProfilePicUri(proxyUrl);
                            return;
                        } catch (err) {
                            console.error('Failed to build proxy URL', err);
                        }
                    }

                    if (!imageLoadedRef.current) {
                        setImageError('Could not fetch image (network or invalid URL)');
                    }
                }
            } catch (err: any) {
                if (mounted && !imageLoadedRef.current && imageRequestIdRef.current === myRequestId) setImageError(String(err?.message || err));
            } finally {
                if (mounted) {
                    setImageLoading(false);
                    setValidatingImage(false);
                    // If an Image onError occurred while we were validating, promote pending error now
                    if (pendingImageError && !imageLoadedRef.current && imageRequestIdRef.current === myRequestId) {
                        setImageError(pendingImageError);
                        setImageFinalError(true);
                        setPendingImageError(null);
                    } else {
                        // clear pending if image already loaded or request changed
                        setPendingImageError(null);
                    }
                }
            }
        })();

        return () => {
            mounted = false;
            if (pendingErrorTimerRef.current) {
                clearTimeout(pendingErrorTimerRef.current as unknown as number);
                pendingErrorTimerRef.current = null;
            }
        };
    }, [profilePicUri]);

    // Load profile from backend on mount and populate fields
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const profile = await profileService.getProfile();
                console.log('🎯 fetched profile for EditProfileScreen:', profile);
                if (!mounted || !profile) return;

                if (profile.name) setName(profile.name);
                if (profile.bio) setBio(profile.bio);
                if (profile.link_url) setLink(profile.link_url);
                if (profile.sex) setSex(profile.sex);

                // If profile_pic_url is stored in DB, use it as the displayed avatar
                if (profile.profile_pic_url) {
                    console.log('🎯 profile_pic_url:', profile.profile_pic_url);
                    setProfilePicUri(profile.profile_pic_url);
                    setProfilePicUrl(profile.profile_pic_url);
                    // reset image error state when new URL set
                    setImageError(null);
                    setImageProxyTried(false);
                }
            } catch (err) {
                console.error('Failed to load profile', err);
            } finally {
                if (mounted) setLoadingProfile(false);
            }
        })();

        return () => { mounted = false; };
    }, []);

    // Calendar & Birthday state
    const [hasBirthday, setHasBirthday] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1));
    const [viewDate, setViewDate] = useState(new Date(2000, 0, 1));

    // Date Typing State
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [inputMonth, setInputMonth] = useState("");
    const [inputYear, setInputYear] = useState("");

    const [showSex, setShowSex] = useState(false);
    const [showBirthday, setShowBirthday] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const birthdayLabel = hasBirthday
        ? `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
        : "";

    const openBirthday = () => {
        setViewDate(new Date(selectedDate));
        setIsEditingDate(false); // Reset edit state
        setShowBirthday(true);
    };

    const handlePickProfilePicture = async (source: 'camera' | 'gallery') => {
        try {
            if (source === 'camera') {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (permission.status !== 'granted') {
                    Alert.alert('Permission Denied', 'Camera permission is required');
                    return;
                }

                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

                if (!result.canceled && result.assets?.length > 0) {
                    const uri = result.assets[0].uri;
                    setProfilePicUri(uri);
                    // Start upload
                    await uploadProfilePic(uri);
                }
            } else {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (permission.status !== 'granted') {
                    Alert.alert('Permission Denied', 'Gallery permission is required');
                    return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

                if (!result.canceled && result.assets?.length > 0) {
                    const uri = result.assets[0].uri;
                    setProfilePicUri(uri);
                    // Start upload
                    await uploadProfilePic(uri);
                }
            }
            setShowProfilePicModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            console.error(error);
        }
    };

    const uploadProfilePic = async (uri: string) => {
        try {
            setUploadingProfilePic(true);
            setUploadProgressPercent(0);

            const onProgress = (p: number) => {
                // p expected between 0 and 1
                const percent = Math.round(Math.max(0, Math.min(1, p)) * 100);
                setUploadProgressPercent(percent);
            };

            const { url, key } = await profileService.uploadProfilePicture(uri, onProgress);

            // When done, set the profile pic URL (public) and keep key if needed
            setProfilePicUrl(url);
            setProfilePicR2Key(key);

            // Update local displayed avatar to the uploaded URL
            setProfilePicUri(url);

            setUploadProgressPercent(100);
        } catch (error) {
            console.error('Upload failed', error);
            Alert.alert('Upload failed', 'Could not upload profile picture. Please try again.');
        } finally {
            // small delay so user can see 100%
            setTimeout(() => {
                setUploadingProfilePic(false);
            }, 400);
        }
    };

    const confirmBirthday = () => {
        setHasBirthday(true);
        setShowBirthday(false);
    };

    const handleDone = async () => {
        try {
            // Only save profile picture URL if it was uploaded
            const updatePayload: any = {
                name,
                bio,
                link_url: link,
            };

            // Only include profile_pic_url if it has been uploaded to R2
            if (profilePicUrl) {
                updatePayload.profile_pic_url = profilePicUrl;
            }

            // Send update to backend
            await profileService.updateProfile(updatePayload);

            setToastMessage("Profile updated successfully.");
            setToastVisible(true);
            setTimeout(() => {
                router.back();
            }, 500);
        } catch (error) {
            console.error('Error updating profile:', error);
            setToastMessage("Failed to update profile. Please try again.");
            setToastVisible(true);
        }
    };

    // ─── Calendar Logic ───
    const changeMonth = (diff: number) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + diff, 1));
    };
    const changeYear = (diff: number) => {
        setViewDate(new Date(viewDate.getFullYear() + diff, viewDate.getMonth(), 1));
    };

    const handleEditDatePress = () => {
        setInputMonth(String(viewDate.getMonth() + 1).padStart(2, "0"));
        setInputYear(String(viewDate.getFullYear()));
        setIsEditingDate(true);
    };

    const handleDateSubmit = () => {
        let m = parseInt(inputMonth, 10);
        let y = parseInt(inputYear, 10);

        // Auto-correct invalid entries bounds
        if (isNaN(m) || m < 1) m = 1;
        if (m > 12) m = 12;

        const currentYear = new Date().getFullYear();
        if (isNaN(y) || y < 1900) y = 1900;
        if (y > currentYear) y = currentYear;

        setViewDate(new Date(y, m - 1, 1));
        setIsEditingDate(false);
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay() - 1;
        return day < 0 ? 6 : day;
    };

    const renderCalendarGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const prevMonthDays = getDaysInMonth(year, month - 1);

        const grid = [];

        for (let i = 0; i < firstDay; i++) {
            grid.unshift({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }
        const remaining = grid.length % 7;
        if (remaining !== 0) {
            for (let i = 1; i <= 7 - remaining; i++) {
                grid.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
            }
        }

        return grid.map((cell, index) => {
            const isSelected = selectedDate.getDate() === cell.day &&
                selectedDate.getMonth() === cell.date.getMonth() &&
                selectedDate.getFullYear() === cell.date.getFullYear();

            return (
                <TouchableOpacity
                    key={index}
                    style={[calSt.dayCell, isSelected && calSt.selectedCell]}
                    onPress={() => {
                        setSelectedDate(cell.date);
                        setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        calSt.dayTxt,
                        !cell.isCurrentMonth && calSt.mutedTxt,
                        isSelected && calSt.selectedTxt
                    ]}>
                        {cell.day}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }} end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={["rgba(255,100,20,0.06)", "transparent"]}
                start={{ x: 1, y: 0 }} end={{ x: 0.3, y: 0.4 }}
                style={StyleSheet.absoluteFill} pointerEvents="none"
            />
            <LinearGradient
                colors={["rgba(80,50,200,0.03)", "transparent"]}
                start={{ x: 0, y: 1 }} end={{ x: 0.5, y: 0.6 }}
                style={StyleSheet.absoluteFill} pointerEvents="none"
            />

            <SafeAreaView style={st.safe}>
                {/* ── Header ── */}
                <View style={st.header}>
                    <TouchableOpacity style={st.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={16} color="#f0ede8" />
                    </TouchableOpacity>
                    <Text style={st.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity style={st.doneBtn} onPress={handleDone} activeOpacity={0.8}>
                        <Text style={st.doneTxt}>Done</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
                    {/* ── Avatar ── */}
                    <View style={st.avatarSection}>
                        <View style={st.avatarWrap}>
                            <AvatarRing />
                            <Image
                                source={{ uri: profilePicUri }}
                                style={st.avatarImg}
                                resizeMode="cover"
                                onLoadStart={() => { setImageLoading(true); setImageError(null); console.log('Image load start', profilePicUri); }}
                                onLoad={() => {
                                     // Cancel any pending error promotion and clear states
                                     if (pendingErrorTimerRef.current) {
                                         clearTimeout(pendingErrorTimerRef.current as unknown as number);
                                         pendingErrorTimerRef.current = null;
                                     }
                                     imageLoadedRef.current = true;
                                     setImageLoaded(true);
                                     setImageFinalError(false);
                                     setPendingImageError(null);
                                     setPendingErrorWaiting(false);
                                     setImageError(null);
                                     setImageLoading(false);
                                     console.log('Image loaded successfully');
                                }}
                                onError={(e: any) => {
                                    setImageLoading(false);
                                    const msg = (e.nativeEvent && (e.nativeEvent as any).error) || JSON.stringify(e);
                                    // Always store the pending error (so it can be promoted later if validation finishes)
                                    setPendingImageError(String(msg));

                                    // Clear any existing timer
                                    if (pendingErrorTimerRef.current) {
                                        clearTimeout(pendingErrorTimerRef.current as unknown as number);
                                        pendingErrorTimerRef.current = null;
                                    }

                                    // If image already loaded (stale error), ignore entirely
                                    if (imageLoadedRef.current) {
                                        return;
                                    }

                                    // If we're validating/probing alternative URLs, defer showing the red error (don't log yet)
                                    if (validatingImage) {
                                        // pendingImageError will be promoted when validation completes
                                        return;
                                    }

                                    // Otherwise, wait briefly before showing the error to avoid flashing transient network errors
                                    const delayMs = 1500; // 1.5s
                                    setPendingErrorWaiting(true);
                                    // capture the request id at this moment so the timer can detect staleness
                                    const myReqId = imageRequestIdRef.current;
                                    pendingErrorTimerRef.current = setTimeout(() => {
                                        // Only promote if image still not loaded and request hasn't changed
                                        if (!imageLoadedRef.current && imageRequestIdRef.current === myReqId) {
                                            setImageError(String(msg));
                                            setImageFinalError(true);
                                        }
                                        setPendingImageError(null);
                                        setPendingErrorWaiting(false);
                                        pendingErrorTimerRef.current = null;
                                    }, delayMs) as unknown as number;
                            }}
                            />
                            <TouchableOpacity style={st.cameraBtn} activeOpacity={0.8} onPress={() => setShowProfilePicModal(true)}>
                                <Feather name="camera" size={12} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {/* Show loading while either the Image component is loading or we are probing/validating URLs */}
                        {(imageLoading || validatingImage || pendingErrorWaiting) && (
                            <ActivityIndicator size="small" color={ORANGE} style={{ marginTop: 8 }} />
                        )}
                        {/* Only show error after validation finished and only if image hasn't successfully loaded */}
                        {(!validatingImage && imageError && !imageLoaded) && <Text style={{ color: '#ff6b6b', fontSize: 11 }}>Image error: {imageError}</Text>}
                        <Text style={st.username}>{name || "Your Name"}</Text>
                        <Text style={st.handle}>@{(name || "yourname").toLowerCase().replace(/\s+/g, "")}</Text>
                        <TouchableOpacity onPress={() => setShowProfilePicModal(true)}>
                            <Text style={st.changePic}>Change Picture</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Stats pills ── */}
                    <View style={st.statsRow}>
                        {[["284", "Workouts"], ["12.4k", "Following"], ["3.1k", "Followers"]].map(([num, lbl]) => (
                            <GlassCard key={lbl} style={st.statPill}>
                                <Text style={st.statNum}>{num}</Text>
                                <Text style={st.statLbl}>{lbl}</Text>
                            </GlassCard>
                        ))}
                    </View>

                    {/* ── Public profile ── */}
                    <Text style={st.sectionLabel}>Public Profile</Text>
                    <GlassCard style={{ marginBottom: 24 }}>
                        <InputRow label="Name" placeholder="Your full name" value={name} onChangeText={setName} />
                        <InputRow label="Bio" placeholder="Describe yourself" value={bio} onChangeText={setBio} multiline />
                        <InputRow label="Link" placeholder="https://example.com" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" last />
                    </GlassCard>

                    {/* ── Private data ── */}
                    <View style={st.privateHeader}>
                        <Text style={st.sectionLabel}>Private Data</Text>
                        <TouchableOpacity style={st.infoBtn} onPress={() => setShowInfo(true)} hitSlop={8}>
                            <Ionicons name="help-circle-outline" size={14} color="rgba(240,237,232,0.4)" />
                        </TouchableOpacity>
                    </View>
                    <GlassCard>
                        <TouchableOpacity style={st.selectRow} onPress={() => setShowSex(true)} activeOpacity={0.7}>
                            <Text style={st.selectLabel}>Sex</Text>
                            <View style={st.selectRight}>
                                <Text style={[st.selectValue, !sex && st.selectPlaceholder]}>{sex || "Select"}</Text>
                                <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.25)" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[st.selectRow, { borderBottomWidth: 0 }]} onPress={openBirthday} activeOpacity={0.7}>
                            <Text style={st.selectLabel}>Birthday</Text>
                            <View style={st.selectRight}>
                                <Text style={[st.selectValue, !hasBirthday && st.selectPlaceholder]}>{birthdayLabel || "Select"}</Text>
                                <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.25)" />
                            </View>
                        </TouchableOpacity>
                    </GlassCard>
                </ScrollView>

                {/* ── Calendar / Birthday Modal ── */}
                <Modal visible={showBirthday} transparent animationType="slide">
                    <View style={sh.overlay}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowBirthday(false)}>
                            <View style={sh.backdrop} />
                        </Pressable>
                        <LinearGradient colors={["rgba(22,22,26,0.98)", "rgba(14,14,16,0.99)"]} style={sh.sheet}>
                            <View style={sh.shine} pointerEvents="none" />
                            <View style={sh.handle} />

                            {/* Calendar Header with Edit Toggle */}
                            <View style={calSt.headerRow}>
                                {isEditingDate ? (
                                    <View style={calSt.editDateWrap}>
                                        <TextInput
                                            style={calSt.dateInput}
                                            value={inputMonth}
                                            onChangeText={setInputMonth}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            placeholder="MM"
                                            placeholderTextColor="rgba(240,237,232,0.3)"
                                            autoFocus
                                        />
                                        <Text style={calSt.slash}>/</Text>
                                        <TextInput
                                            style={[calSt.dateInput, { minWidth: 64 }]}
                                            value={inputYear}
                                            onChangeText={setInputYear}
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            placeholder="YYYY"
                                            placeholderTextColor="rgba(240,237,232,0.3)"
                                        />
                                        <TouchableOpacity onPress={handleDateSubmit} style={calSt.checkBtn} activeOpacity={0.8}>
                                            <Feather name="check" size={18} color={ORANGE} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={handleEditDatePress} activeOpacity={0.7} style={calSt.titleTouch}>
                                        <Text style={calSt.monthYearTxt}>
                                            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                                        </Text>
                                        <Feather name="edit-2" size={14} color="rgba(240,237,232,0.4)" />
                                    </TouchableOpacity>
                                )}

                                {!isEditingDate && (
                                    <View style={calSt.arrowsWrap}>
                                        <TouchableOpacity style={calSt.arrowBtn} onPress={() => changeYear(-1)}>
                                            <Feather name="chevrons-left" size={18} color="#f0ede8" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={calSt.arrowBtn} onPress={() => changeMonth(-1)}>
                                            <Feather name="chevron-left" size={18} color="#f0ede8" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={calSt.arrowBtn} onPress={() => changeMonth(1)}>
                                            <Feather name="chevron-right" size={18} color="#f0ede8" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={calSt.arrowBtn} onPress={() => changeYear(1)}>
                                            <Feather name="chevrons-right" size={18} color="#f0ede8" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Days of week */}
                            <View style={calSt.weekdaysRow}>
                                {DAYS_OF_WEEK.map((d, i) => (
                                    <Text key={i} style={calSt.weekdayTxt}>{d}</Text>
                                ))}
                            </View>

                            {/* Grid */}
                            <View style={calSt.grid}>
                                {renderCalendarGrid()}
                            </View>

                            <TouchableOpacity activeOpacity={0.85} onPress={confirmBirthday} style={{ marginTop: 24 }}>
                                <LinearGradient colors={["#ff7a00", "#ff5500"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sh.confirmBtn}>
                                    <Text style={sh.confirmTxt}>Confirm Date</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>

                {/* ── Sex Modal ── */}
                <Modal visible={showSex} transparent animationType="slide">
                    <View style={sh.overlay}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSex(false)}>
                            <View style={sh.backdrop} />
                        </Pressable>
                        <LinearGradient colors={["rgba(22,22,26,0.98)", "rgba(14,14,16,0.99)"]} style={sh.sheet}>
                            <View style={sh.shine} pointerEvents="none" />
                            <View style={sh.handle} />
                            <Text style={sh.title}>Select Sex</Text>
                            {["Male", "Female", "Other"].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={sh.sexRow}
                                    onPress={() => { setSex(item); setShowSex(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[sh.sexTxt, sex === item && { color: ORANGE }]}>{item}</Text>
                                    {sex === item && <Feather name="check" size={16} color={ORANGE} />}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={sh.cancelBtn} onPress={() => setShowSex(false)} activeOpacity={0.7}>
                                <Text style={sh.cancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>

                {/* ── Info Modal ── */}
                <Modal visible={showInfo} transparent animationType="fade">
                    <View style={infoSt.overlay}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowInfo(false)}>
                            <View style={{ flex: 1 }} />
                        </Pressable>
                        <LinearGradient colors={["rgba(28,28,32,0.98)", "rgba(18,18,22,0.99)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={infoSt.box}>
                            <View style={infoSt.shine} pointerEvents="none" />
                            <Text style={infoSt.icon}>🔒</Text>
                            <Text style={infoSt.title}>Private Data</Text>
                            <Text style={infoSt.body}>
                                Your private data is used to personalise your experience. Having your age and sex
                                allows you to compare yourself to athletes in your specific demographic.
                            </Text>
                            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowInfo(false)}>
                                <LinearGradient colors={["#ff7a00", "#ff5500"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sh.confirmBtn}>
                                    <Text style={sh.confirmTxt}>Got it</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>

                {/* Profile Picture Selection Modal */}
                <Modal visible={showProfilePicModal} transparent animationType="slide">
                    <View style={sh.overlay}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowProfilePicModal(false)}>
                            <View style={sh.backdrop} />
                        </Pressable>
                        <LinearGradient colors={["rgba(22,22,26,0.98)", "rgba(14,14,16,0.99)"]} style={sh.sheet}>
                            <View style={sh.shine} pointerEvents="none" />
                            <View style={sh.handle} />
                            <Text style={sh.title}>Select Photo</Text>

                            <TouchableOpacity
                                style={sh.photoRow}
                                onPress={() => handlePickProfilePicture('camera')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="camera-outline" size={20} color={ORANGE} />
                                <Text style={sh.photoText}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={sh.photoRow}
                                onPress={() => handlePickProfilePicture('gallery')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="image-outline" size={20} color={ORANGE} />
                                <Text style={sh.photoText}>Choose from Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={sh.cancelBtn} onPress={() => setShowProfilePicModal(false)} activeOpacity={0.7}>
                                <Text style={sh.cancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>

                {/* Upload Progress Modal */}
                <Modal visible={uploadingProfilePic} transparent animationType="fade">
                    <View style={progressSt.overlay}>
                        <View style={progressSt.box}>
                            <Text style={progressSt.title}>Uploading</Text>
                            <ActivityIndicator size="large" color={ORANGE} style={{ marginVertical: 12 }} />
                            <Text style={progressSt.percent}>{uploadProgressPercent}%</Text>
                        </View>
                    </View>
                </Modal>

                <Toast
                    visible={toastVisible}
                    message={toastMessage}
                    onClose={() => setToastVisible(false)}
                    duration={3000}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

// ─── Static avatar ring ─────────────────────────────────────────────────────
function AvatarRing() {
    return (
        <View style={ringst.ring} pointerEvents="none">
            <View style={ringst.staticLayer}>
                <LinearGradient
                    colors={["transparent", ORANGE, "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    locations={[0.2, 0.5, 0.8]}
                    style={ringst.beam}
                />
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
    safe: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingBottom: 60 },

    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
        zIndex: 1,
    },
    backBtn: {
        width: 36, height: 36,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 12, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 16, fontWeight: "600", color: "#e46011", letterSpacing: -0.2 },
    doneBtn: {
        backgroundColor: "rgba(255,122,0,0.15)",
        borderWidth: 0.5, borderColor: "rgba(255,122,0,0.3)",
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
    },
    doneTxt: { fontSize: 14, fontWeight: "600", color: ORANGE },

    avatarSection: { alignItems: "center", marginTop: 32, marginBottom: 28 },
    avatarWrap: { width: 96, height: 96, position: "relative" },
    avatarImg: {
        width: 92, height: 92, borderRadius: 46, backgroundColor: "#1a1a1a",
        position: "absolute", top: 2, left: 2,
        zIndex: 2,
    },
    cameraBtn: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: ORANGE,
        alignItems: "center", justifyContent: "center",
        borderWidth: 2, borderColor: "#080808",
        position: "absolute", bottom: 0, right: 0,
        zIndex: 3,
    },
    username: { marginTop: 16, fontSize: 18, fontWeight: "600", color: "#f0ede8", letterSpacing: -0.3 },
    handle: { fontSize: 13, color: "rgba(240,237,232,0.4)", marginTop: 2 },
    changePic: { fontSize: 13, fontWeight: "500", color: ORANGE, marginTop: 12 },

    statsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
    statPill: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14 },
    statNum: { fontSize: 18, fontWeight: "600", color: "#f0ede8", letterSpacing: -0.5 },
    statLbl: { fontSize: 10, color: "rgba(240,237,232,0.4)", marginTop: 2, letterSpacing: 0.3 },

    sectionLabel: {
        fontSize: 10, fontWeight: "600",
        color: "rgba(240,237,232,0.4)", letterSpacing: 1,
        textTransform: "uppercase", marginBottom: 10,
    },
    privateHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, flex: 1 },
    infoBtn: {
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)",
        alignItems: "center", justifyContent: "center",
        marginBottom: 10,
    },

    selectRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 16, paddingHorizontal: 18,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.04)",
    },
    selectLabel: { fontSize: 15, fontWeight: "500", color: "#f0ede8" },
    selectRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    selectValue: { fontSize: 14, fontWeight: "500", color: ORANGE },
    selectPlaceholder: { color: "rgba(240,237,232,0.2)", fontWeight: "400" },
});

const cardSt = StyleSheet.create({
    card: {
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 20, overflow: "hidden", position: "relative",
    },
    shine: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
});

const inSt = StyleSheet.create({
    row: {
        flexDirection: "row",
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.04)",
        paddingVertical: 14, paddingHorizontal: 18, gap: 14, position: "relative",
    },
    label: {
        fontSize: 13, fontWeight: "500",
        color: "rgba(240,237,232,0.4)", width: 46, paddingTop: 2,
        flexShrink: 0, letterSpacing: -0.1,
    },
    input: { flex: 1, fontSize: 15, color: "#f0ede8" },
    focusLine: { position: "absolute", bottom: 0, left: 18, right: 18, height: 1 }
});

// Calendar Picker Styles
const calSt = StyleSheet.create({
    headerRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: 20, paddingHorizontal: 4, height: 40,
    },
    titleTouch: { flexDirection: "row", alignItems: "center", gap: 8 },
    monthYearTxt: { fontSize: 18, fontWeight: "700", color: "#f0ede8", letterSpacing: -0.2 },

    // Edit mode typing styles
    editDateWrap: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
    dateInput: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.15)",
        borderRadius: 8, color: "#f0ede8",
        fontSize: 16, fontWeight: "600", textAlign: "center",
        paddingVertical: 6, paddingHorizontal: 10, minWidth: 44,
    },
    slash: { color: "rgba(240,237,232,0.4)", fontSize: 18, fontWeight: "600" },
    checkBtn: {
        padding: 6, marginLeft: 4, borderRadius: 8,
        backgroundColor: "rgba(255,122,0,0.15)",
    },

    arrowsWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
    arrowBtn: {
        padding: 6,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 8,
    },
    weekdaysRow: {
        flexDirection: "row", justifyContent: "space-around", marginBottom: 12,
    },
    weekdayTxt: {
        fontSize: 12, fontWeight: "600", color: "rgba(240,237,232,0.4)", width: "14.28%", textAlign: "center",
    },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
    dayCell: {
        width: "14.28%", height: 42,
        justifyContent: "center", alignItems: "center",
        marginBottom: 4, borderRadius: 21,
    },
    selectedCell: { backgroundColor: ORANGE },
    dayTxt: { fontSize: 15, fontWeight: "500", color: "#f0ede8" },
    mutedTxt: { color: "rgba(240,237,232,0.2)" },
    selectedTxt: { color: "#fff", fontWeight: "700" },
});

// Sheet / modals
const sh = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end" },
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
    sheet: {
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10, position: "relative", overflow: "hidden",
        borderTopWidth: 0.5, borderColor: "rgba(255,255,255,0.1)",
    },
    shine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    handle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignSelf: "center", marginBottom: 20,
    },
    title: {
        fontSize: 16, fontWeight: "600", color: "#f0ede8",
        textAlign: "center", marginBottom: 24, letterSpacing: -0.2,
    },
    sexRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 16, paddingHorizontal: 4,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    sexTxt: { fontSize: 16, color: "#f0ede8" },
    cancelBtn: {
        marginTop: 12, paddingVertical: 14, borderRadius: 14,
        backgroundColor: "rgba(255,59,48,0.08)",
        borderWidth: 0.5, borderColor: "rgba(255,59,48,0.2)",
        alignItems: "center",
    },
    cancelTxt: { fontSize: 15, fontWeight: "600", color: "#ff3b30" },
    confirmBtn: {
        paddingVertical: 15, borderRadius: 14, alignItems: "center",
        ...Platform.select({
            ios: { shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 20 },
            android: { elevation: 10 },
        }),
    },
    confirmTxt: { fontSize: 15, fontWeight: "700", color: "#fff", letterSpacing: -0.2 },
    photoRow: {
        flexDirection: "row", alignItems: "center", gap: 16,
        paddingVertical: 16, paddingHorizontal: 4,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    photoText: { fontSize: 16, color: "#f0ede8", fontWeight: "500" },
});

// Info modal
const infoSt = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.8)",
        alignItems: "center", justifyContent: "center", padding: 40,
    },
    box: {
        borderRadius: 24, paddingHorizontal: 24, paddingVertical: 28,
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)",
        width: "100%", position: "relative", overflow: "hidden",
    },
    shine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.15)" },
    icon: { fontSize: 28, marginBottom: 12 },
    title: { fontSize: 17, fontWeight: "700", color: "#f0ede8", marginBottom: 10 },
    body: { fontSize: 14, color: "rgba(240,237,232,0.4)", lineHeight: 23, marginBottom: 20 },
});

// Avatar ring
const ringst = StyleSheet.create({
    ring: {
        width: 96, height: 96, borderRadius: 48,
        overflow: "hidden", backgroundColor: "#080808",
        position: "absolute", top: 0, left: 0, zIndex: 1,
    },
    staticLayer: {
        position: "absolute",
        width: "200%", height: "200%",
        top: "-50%", left: "-50%",
        alignItems: "center",
        transform: [{ rotate: "45deg" }],
    },
    beam: { width: "100%", height: "50%" },
});

// Upload progress styles
const progressSt = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
    box: { width: 200, padding: 18, borderRadius: 12, backgroundColor: '#121212', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)' },
    title: { color: '#fff', fontSize: 16, fontWeight: '700' },
    percent: { color: '#fff', marginTop: 8, fontSize: 14, fontWeight: '600' },
});

export {};

