import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { AppColors } from '../../constants/colors';

export default function GoogleSignInButton({ onPress }: { onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.content}>
                <Image
                    source={{ uri: 'https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' }}
                    style={styles.icon}
                />
                <Text style={styles.text}>Sign in with Google</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        backgroundColor: AppColors.inputBg,
        borderRadius: 8,
        paddingVertical: 14,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 20,        // Changed from 24 to 20
        height: 20,       // Changed from 24 to 20
        marginRight: 12,
        marginLeft: -2,  // Add this to shift icon left

    },
    text: {
        color: AppColors.white,
        fontSize: 15,
        fontWeight: '600',
    },
});