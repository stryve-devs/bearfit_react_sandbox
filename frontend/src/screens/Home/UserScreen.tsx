import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
    FadeInDown,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

import { useState, useEffect } from 'react';
import { AppColors } from '../../constants/colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');


// ─── MOCK DATA ─────────────────────────────────────────────
const PHOTO_GRID = [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
];

const GRAPH_DATA = [
    { label: 'Jan 12', value: 1.2 },
    { label: 'Jan 26', value: 0.8 },
    { label: 'Feb 9', value: 3.0 },
    { label: 'Feb 23', value: 2.2 },
    { label: 'Mar 9', value: 3.5 },
    { label: 'Mar 23', value: 2.7 },
];

const POSTS = [
    {
        id: '1',
        title: 'Random Upper',
        desc: 'At a mates place and they asked if we could workout, which worked well!',
        time: '40min',
        volume: '2,181 kg',
        records: '3',
        bpm: '103',
        date: 'Monday, Mar 9, 2026',
        images: [
            'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
            'https://images.unsplash.com/photo-1571902943202-507ec2618e8f',
        ],
        likes: 116,
        comments: 3,
    },
];

const ROUTINES = [
    { id: 'cardio', title: 'Cardio 🏃‍♀️' },
    { id: 'muaythai', title: 'Muay Thai 🥊' },
];


// ─── GLASS CARD ───────────────────────────────────────────
const GlassCard = ({ children, style }: any) => {
    return (
        <View style={[styles.glassCard, style]}>
            <BlurView
                intensity={25}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.glassInner}>
                {children}
            </View>
        </View>
    );
};

// ─── GRAPH BAR ────────────────────────────────────────────
const AnimatedBar = ({ value, label, index }: any) => {
    const heightVal = useSharedValue(0);
    const maxBarHeight = 90;

    useEffect(() => {
        heightVal.value = withSpring((value / 4) * maxBarHeight);
    }, []);

    const style = useAnimatedStyle(() => ({
        height: heightVal.value,
    }));

    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ height: maxBarHeight, justifyContent: 'flex-end' }}>
                <Animated.View style={[styles.bar, style]} />
            </View>
            <Text style={styles.barLabel}>{label}</Text>
        </View>
    );
};


// ─── FOLLOW BUTTON ────────────────────────────────────────
const FollowButton = ({ isFollowing, onPress }: any) => {
    const scale = useSharedValue(1);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={style}>
            <TouchableOpacity
                onPress={() => {
                    scale.value = withSpring(0.9, {}, () => {
                        scale.value = withSpring(1);
                    });
                    onPress();
                }}
                style={styles.followBtn}
            >
                <Text style={styles.followText}>
                    {isFollowing ? 'Following' : 'Follow'}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};


// ─── POST CARD ────────────────────────────────────────────
const PostCard = ({ post }: any) => {
    return (
        <GlassCard style={{ marginBottom: 16, padding: 0 }}>

            {/* HEADER */}
            <View style={styles.postHeader}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' }}
                    style={styles.postAvatar}
                />
                <View>
                    <Text style={styles.postUser}>jadewolfe</Text>
                    <Text style={styles.postDate}>{post.date}</Text>
                </View>
            </View>

            {/* TEXT */}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postDesc}>{post.desc}</Text>

            {/* STATS */}
            <View style={styles.postStats}>
                <Text style={styles.stat}>⏱ {post.time}</Text>
                <Text style={styles.stat}>🏋️ {post.volume}</Text>
                <Text style={styles.stat}>🏅 {post.records}</Text>
            </View>

            {/* IMAGE */}
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                {post.images.map((img: string, i: number) => (
                    <Image key={i} source={{ uri: img }} style={styles.postImage} />
                ))}
            </ScrollView>

            {/* ACTIONS */}
            <View style={styles.actions}>
                <Text style={styles.action}>❤️ {post.likes}</Text>
                <Text style={styles.action}>💬 {post.comments}</Text>
                <Text style={styles.action}>🔗 Share</Text>
            </View>

            {/* COMMENT */}
            <Text style={styles.comment}>
                <Text style={{ color: 'white', fontWeight: '600' }}>
                    davefergs
                </Text>{' '}
                Hell yeah awesome stuff ❤️💪
            </Text>

        </GlassCard>
    );
};


// ─── MAIN SCREEN ──────────────────────────────────────────
export default function UserScreen() {
    const { name } = useLocalSearchParams();
    const [isFollowing, setIsFollowing] = useState(false);

    return (
        <View style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
            <StatusBar barStyle="light-content" />

            <ScrollView>

                {/* PHOTO GRID */}
                <View style={styles.grid}>
                    {PHOTO_GRID.map((img, i) => (
                        <Image key={i} source={{ uri: img }} style={styles.gridImg} />
                    ))}
                </View>

                {/* PROFILE */}
                <View style={{ padding: 16 }}>
                    <Text style={styles.name}>{name || 'Jessica'}</Text>
                    <Text style={styles.bio}>
                        I want to be strong enough to fight a bear
                    </Text>

                    <FollowButton
                        isFollowing={isFollowing}
                        onPress={() => setIsFollowing(!isFollowing)}
                    />

                    {/* GRAPH */}
                    <View style={styles.graph}>
                        {GRAPH_DATA.map((d, i) => (
                            <AnimatedBar key={i} {...d} index={i} />
                        ))}
                    </View>

                    {/* ROUTINES */}
                    <Text style={styles.section}>Routines</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {ROUTINES.map(r => (
                            <GlassCard key={r.id}>
                                <Text style={{ color: 'white' }}>{r.title}</Text>
                            </GlassCard>
                        ))}
                    </View>

                    {/* POSTS */}
                    <Text style={styles.section}>Posts</Text>
                    {POSTS.map(p => (
                        <PostCard key={p.id} post={p} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}


// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
    grid: { flexDirection: 'row', height: 140 },
    gridImg: { flex: 1 },

    name: { color: 'white', fontSize: 20, fontWeight: '700' },
    bio: { color: 'gray', marginBottom: 10 },

    followBtn: {
        backgroundColor: '#FF7825',
        padding: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    followText: { color: 'white', fontWeight: '700' },

    graph: { flexDirection: 'row', height: 120 },

    bar: {
        width: 10,
        backgroundColor: '#FF7825',
        borderRadius: 6,
    },

    barLabel: { color: 'gray', fontSize: 10 },

    section: {
        color: 'white',
        fontSize: 16,
        marginTop: 20,
        marginBottom: 10,
    },

    glassCard: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    glassInner: { padding: 12 },

    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
    },

    postAvatar: { width: 36, height: 36, borderRadius: 18 },

    postUser: { color: 'white', fontWeight: '700' },
    postDate: { color: 'gray', fontSize: 12 },

    postTitle: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
        paddingHorizontal: 10,
    },

    postDesc: {
        color: 'gray',
        paddingHorizontal: 10,
        marginBottom: 10,
    },

    postStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },

    stat: { color: 'white' },

    postImage: {
        width: width,
        height: 220,
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },

    action: { color: 'white' },

    comment: {
        color: 'gray',
        padding: 10,
    },
});