import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import SettingsScreen from "./SettingsScreen";
import AccountSettingsScreen from "./AccountSettings/AccountScreen";
import ChangeEmailScreen from "./AccountSettings/ChangeEmailScreen";
import ChangeUsernameScreen from "./AccountSettings/ChangeUsernameScreen";
import UpdatePasswordScreen from "./AccountSettings/UpdatePasswordScreen";
import DeleteAccountScreen from "./AccountSettings/DeleteAccountScreen";

const Stack = createStackNavigator();

export default function SettingsNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsHome" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="AccountSettings" component={AccountScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />


            <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
            <Stack.Screen name="ChangeUsername" component={ChangeUsernameScreen} />
            <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
        </Stack.Navigator>
    );
}