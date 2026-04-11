import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
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
                            <PressableButton
                                key={index}
                                text={button.text}
                                onPress={button.onPress}
                                isDestructive={button.style === 'destructive'}
                            />
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ✅ Pressable button for glass + active feedback
function PressableButton({
                             text,
                             onPress,
                             isDestructive = false,
                         }: {
    text: string;
    onPress: () => void;
    isDestructive?: boolean;
}) {
    const [pressed, setPressed] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[
                styles.button,
                isDestructive && styles.destructiveButton,
                pressed && styles.buttonActive,
            ]}
        >
            <Text
                style={[
                    styles.buttonText,
                    isDestructive && styles.destructiveButtonText,
                    pressed && styles.buttonTextActive,
                ]}
            >
                {text}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
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
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
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
        color: AppColors.white,
    },
    buttonTextActive: {
        color: AppColors.black,
    },
    destructiveButton: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    destructiveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
});