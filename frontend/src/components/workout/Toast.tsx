import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppColors } from '../../constants/colors';

interface ToastProps {
    visible: boolean;
    message: string;
    onClose: () => void;
    duration?: number;
    buttonText?: string;
}

export default function Toast({ visible, message, onClose, duration = 3000, buttonText = 'OK' }: ToastProps) {
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
                            <TouchableOpacity style={styles.button} onPress={onClose}>
                                <Text style={styles.buttonText}>{buttonText}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastContainer: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16,
        width: '80%',
        maxWidth: 337,
    },
    message: {
        fontSize: 16,
        fontWeight: '400',
        color: AppColors.white,
        textAlign: 'center',
    },
    spacing: { height: 12 },
    button: {
        backgroundColor: AppColors.orange,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.black,
    },
});