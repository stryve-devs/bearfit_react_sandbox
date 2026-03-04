import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../src/constants/colors';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: AppColors.black,
                },
                headerTintColor: AppColors.white,
                headerTitleStyle: {
                    color: AppColors.orange,
                    fontWeight: '600',
                },
                headerShadowVisible: false,
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
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    title: 'Workout',
                    headerTitle: 'Workout',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="barbell-outline" size={size} color={color} />
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