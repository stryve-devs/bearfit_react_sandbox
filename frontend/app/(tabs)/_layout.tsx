import { Tabs, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../src/constants/colors';
import { useEffect } from 'react';

export default function TabLayout() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname === '/(tabs)') {
            router.replace('/(tabs)/home');
        }
    }, [pathname]);

    return (
        <Tabs
            // start on the home tab and don't render a separate header at the tab level
            initialRouteName="home"
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: AppColors.black,
                    borderTopColor: AppColors.darkGrey,
                },
                tabBarActiveTintColor: AppColors.orange,
                tabBarInactiveTintColor: AppColors.grey,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    headerShown: false,
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Workout"
                options={{
                    title: 'Workouts',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="barbell" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}