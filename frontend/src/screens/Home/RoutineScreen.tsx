import React from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

const ROUTINES = [
    {
        id: "1",
        title: "Back + Stuff",
        image: "https://picsum.photos/900",
    },
    {
        id: "2",
        title: "Loose Belly Fat",
        image: "https://picsum.photos/901",
    },
];

export default function RoutineScreen() {
    const [modalVisible, setModalVisible] = React.useState(false);

    const scale = useSharedValue(0.9);

    React.useEffect(() => {
        scale.value = withSpring(1);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const renderItem = ({ item }: any) => (
        <Animated.View entering={FadeInUp.duration(600)} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Glassmorphism Bottom Card */}
            <BlurView intensity={40} tint="dark" style={styles.glassContainer}>
                <TouchableOpacity style={styles.row}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
            </BlurView>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
                <TouchableOpacity>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Media</Text>

                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.menu}>⋯</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* List */}
            <FlatList
                data={ROUTINES}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 120 }}
            />

            {/* Bottom Sheet Modal */}
            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalWrapper}>
                    <BlurView intensity={50} tint="dark" style={styles.modalContent}>
                        {["Save As Routine", "Copy Workout", "Report Workout"].map(
                            (item, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.modalItem}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.modalText}>{item}</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </BlurView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B0B",
        paddingHorizontal: 12,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 20,
    },

    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },

    back: {
        color: "#FF7825",
        fontSize: 20,
    },

    menu: {
        color: "#FF7825",
        fontSize: 22,
    },

    card: {
        marginBottom: 16,
    },

    image: {
        width: "100%",
        height: 240,
        borderRadius: 16,
    },

    glassContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: "hidden",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 14,
        alignItems: "center",
    },

    title: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },

    arrow: {
        color: "#FF7825",
        fontSize: 18,
    },

    modalWrapper: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },

    modalContent: {
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    modalItem: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
    },

    modalText: {
        color: "white",
        fontSize: 14,
    },
});