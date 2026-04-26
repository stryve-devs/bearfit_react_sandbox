import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppColors } from '../../constants/colors';

interface AlertButton {
    text: string;
    onPress: () => void;
    style?: 'default' | 'destructive';
}

interface AlertDialogProps {
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
}

export default function AlertDialog({ visible, title, message, buttons }: AlertDialogProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.alertContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <View key={index} style={styles.buttonWrapper}>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        button.style === 'destructive' ? styles.destructiveButton : styles.defaultButton,
                                    ]}
                                    onPress={button.onPress}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            button.style === 'destructive' ? styles.destructiveButtonText : styles.defaultButtonText,
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
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
    alertContainer: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 16,
        width: '80%',
        maxWidth: 337,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        fontWeight: '400',
        color: AppColors.white,
        textAlign: 'center',
        marginBottom: 16,
    },
    buttonContainer: {
        gap: 12,
    },
    buttonWrapper: {
        width: '100%',
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    defaultButton: {
        backgroundColor: AppColors.darkBg,
        borderWidth: 1.5,
        borderColor: AppColors.orange,
    },
    destructiveButton: {
        backgroundColor: AppColors.orange,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    defaultButtonText: {
        color: AppColors.orange,
    },
    destructiveButtonText: {
        color: AppColors.black,
    },
});