import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsScreen from "./SettingsScreen";
import ProfileScreen from "./Profile/ProfileScreen";
import AccountSettingsScreen from "./AccountSettings/AccountSettingsScreen";
import ChangeUsernameScreen from "./AccountSettings/ChangeUsernameScreen";
import ChangeEmailScreen from "./AccountSettings/ChangeEmailScreen";
import UpdatePasswordScreen from "./AccountSettings/UpdatePasswordScreen";
import DeleteAccountScreen from "./AccountSettings/DeleteAccountScreen";
import NotificationsScreen from "./Notifications/NotificationsScreen";

const Stack = createNativeStackNavigator();

export default function SettingsNavigator() {

    return (

        <Stack.Navigator screenOptions={{ headerShown:false }}>

            <Stack.Screen name="Settings" component={SettingsScreen}/>
            <Stack.Navigator>
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            </Stack.Navigator>
            <Stack.Screen name="AccountSettings" component={AccountSettingsScreen}/>
            <Stack.Screen name="ChangeUsername" component={ChangeUsernameScreen}/>
            <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen}/>
            <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen}/>
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen}/>
            <Stack.Screen name="Notifications" component={NotificationsScreen}/>

        </Stack.Navigator>

    );

}