import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '../../../src/constants/colors';
import { useAuth } from '../../../src/context/AuthContext';

export default function ProfileScreen() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.black,
    },
    title: {
        color: AppColors.white,
        fontSize: 24,
        marginBottom: 32,
    },
    logoutButton: {
        backgroundColor: '#E53935',
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 12,
    },
    logoutText: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

