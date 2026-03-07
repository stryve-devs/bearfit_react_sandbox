import { Stack } from 'expo-router';
import { AppColors } from "../../../src/constants/colors";

export default function HomeLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: AppColors.black },
                headerTintColor: AppColors.white,
                headerTitleStyle: { color: AppColors.orange },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: AppColors.black },
            }}
        >
            <Stack.Screen
                name="index"
                options={{ title: 'Home' }}
            />

            <Stack.Screen
                name="explore"
                options={{ title: 'Explore' }}
            />


            <Stack.Screen
                name="discover"
                options={{ title: 'Discover' }}
            />

            <Stack.Screen 
            name="post-detail" 
            options={{ title: "Post Detail" }}
             />
             
            <Stack.Screen
                name="home17" 
                options={{ title: "Media" }} 
            />

            {/* ✅ Added for Contacts */}
            <Stack.Screen
                name="contacts"
                options={{ title: 'Contacts' }}
            />

            {/* ✅ Added for Notifications */}
            <Stack.Screen
                name="notifications"
                options={{ title: 'Notifications' }}
            />
        </Stack>
    );
}