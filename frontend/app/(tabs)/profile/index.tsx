import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '../../../src/constants/colors';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.black }} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={AppColors.black} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: AppColors.white, fontSize: 24 }}>Profile</Text>
            </View>
        </SafeAreaView>
    );
}
