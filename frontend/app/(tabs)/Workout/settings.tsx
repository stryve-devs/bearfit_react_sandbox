import { View, Text } from 'react-native';
import { AppColors } from '../../../src/constants/colors';

export default function WorkoutSettingsScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090909' }}>
            <Text style={{ color: AppColors.white, fontSize: 24 }}>Settings</Text>
        </View>
    );
}