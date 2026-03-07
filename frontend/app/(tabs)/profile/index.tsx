import { View, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AppColors } from '../../../src/constants/colors';

export default function ProfileScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.black }}>
            <Text style={{ color: AppColors.white, fontSize: 24 }}>Profile</Text>
        </View>
    );
}
