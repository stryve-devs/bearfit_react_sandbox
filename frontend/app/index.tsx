import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { ActivityIndicator, View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';

export default function Index() {
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        console.log('📱 Index screen - loading:', loading, 'isAuthenticated:', isAuthenticated);
    }, [loading, isAuthenticated]);

    if (loading) {
        console.log('⏳ Showing loading spinner');
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'left', 'right']}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={{ color: '#FF6B35', marginTop: 20 }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    console.log('🚀 Redirecting to:', isAuthenticated ? '/(tabs)' : '/(auth)/login');
    return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}