import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AuthTextField from '../../components/auth/AuthTextField';
import PrimaryButton from '../../components/auth/PrimaryButton';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import AppleSignInButton from '../../components/auth/AppleSignInButton';
import { AppColors } from '../../constants/colors';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login({ email, password });
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        Alert.alert('Coming Soon', 'Google Sign-In will be available soon!');
    };

    const handleAppleSignIn = () => {
        Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Combined Logo / Title Header */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>
                        <Text style={styles.bear}>BEAR</Text>
                        <Text style={styles.bear}> </Text>
                        <Text style={styles.fit}>FIT</Text>
                    </Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    {/* Email Field */}
                    <AuthTextField
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {/* Password Field */}
                    <AuthTextField
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => router.push("/(auth)/forgotpassword")}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Sign In Button */}
                    <PrimaryButton
                        label="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                    />

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Sign In */}
                    <GoogleSignInButton onPress={handleGoogleSignIn} />
                    <View style={styles.socialButtonSpacing} />
                    <AppleSignInButton onPress={handleAppleSignIn} />
                </View>

                {/* Bottom Section - Sign Up Link */}
                <TouchableOpacity
                    style={styles.signUpContainer}
                    onPress={() => router.push('/(auth)/register')}
                >
                    <Text style={styles.signUpText}>
                        Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        paddingTop: 120,
        paddingBottom: 40,
    },
    logoText: {
        fontFamily: 'Cal Sans',
        fontSize: 32,  // Reduced from 40
        fontWeight: 400,
        letterSpacing: 2,  // Reduced from 3
    },
    bear: {
        color: '#D3D3D3',
    },
    fit: {
        color: '#FF7825',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
        marginTop: -8,
    },
    forgotPasswordText: {
        color: AppColors.orange,
        fontSize: 13,
        fontWeight: '500',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: AppColors.darkGrey,
    },
    dividerText: {
        color: AppColors.grey,
        marginHorizontal: 16,
        fontSize: 13,
    },
    socialButtonSpacing: {
        height: 12,
    },
    signUpContainer: {
        marginTop: 32,  // Reduced from 24 to move it higher
        alignItems: 'center',
    },
    signUpText: {
        color: AppColors.grey,
        fontSize: 14,
    },
    signUpLink: {
        color: AppColors.orange,
        fontWeight: '600',
    },
});