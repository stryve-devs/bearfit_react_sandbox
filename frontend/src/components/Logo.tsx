import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

export default function Logo({ size = 'medium', style }: LogoProps) {
    const fontSize = size === 'small' ? 28 : size === 'medium' ? 40 : 56;
    const letterSpacing = size === 'small' ? 2 : size === 'medium' ? 3 : 4;

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.text, { fontSize, letterSpacing }]}>
                <Text style={styles.bear}>BEAR</Text>
                <Text style={styles.bear}> </Text>
                <Text style={styles.fit}>FIT</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '400',
        fontFamily: 'CalSans',  // Add this line
    },
    bear: {
        color: '#D3D3D3',
    },
    fit: {
        color: '#FF7825',
    },
});