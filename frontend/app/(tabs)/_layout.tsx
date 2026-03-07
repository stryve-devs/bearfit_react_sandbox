import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../src/constants/colors';


export default function TabLayout() {

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: AppColors.darkBg,
                    borderBottomWidth: 0,
                },
                headerTitleStyle: {
                    color: AppColors.orange,
                    fontSize: 18,
                    fontWeight: '700',
                },
                headerTitleAlign: 'center',
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
                    name="Workout"
                    options={{
                        title: 'Workout',
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