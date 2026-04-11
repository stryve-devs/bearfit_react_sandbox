import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { AppColors } from '../../constants/colors';

interface ToastProps {
    visible: boolean;
    message: string;
    onClose: () => void;
    duration?: number;
    buttonText?: string;
}

export default function Toast({
                                  visible,
                                  message,
                                  onClose,
                                  duration = 3000,
                                  buttonText = 'OK',
                              }: ToastProps) {
    useEffect(() => {
        if (visible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onClose]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.toastContainer}>
                    <Text style={styles.message}>{message}</Text>

                    {duration === 0 && (
                        <>
                            <View style={styles.spacing} />
                            <PressableToastButton text={buttonText} onPress={onClose} />
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

// ✅ Pressable button for Toast
function PressableToastButton({
                                  text,
                                  onPress,
                              }: {
    text: string;
    onPress: () => void;
}) {
    const [pressed, setPressed] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[styles.button, pressed && styles.buttonActive]}
        >
            <Text style={[styles.buttonText, pressed && styles.buttonTextActive]}>{text}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastContainer: {
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 20,
        width: '80%',
        maxWidth: 337,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    message: {
        fontSize: 16,
        fontWeight: '400',
        color: AppColors.white,
        textAlign: 'center',
    },
    spacing: { height: 12 },
    button: {
        paddingHorizontal: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    buttonActive: {
        backgroundColor: AppColors.orange,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    buttonTextActive: {
        color: AppColors.black,
    },
});