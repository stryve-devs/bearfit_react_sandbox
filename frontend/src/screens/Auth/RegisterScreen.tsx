import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AuthTextField from '../../components/auth/AuthTextField';
import PrimaryButton from '../../components/auth/PrimaryButton';
import ValidationRow from '../../components/auth/ValidationRow';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import AppleSignInButton from '../../components/auth/AppleSignInButton';
import { AppColors } from '../../constants/colors';
import { authService } from '../../api/services/auth.service';
export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { register } = useAuth();
    // Username validation
    const isValidUsername = (username: string) => {
        // 3-20 characters, alphanumeric, underscores, hyphens only
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(username);
    };
    // Password validation checks
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    const isUsernameValid = isValidUsername(username);
    const canSubmit = isUsernameValid && email && isPasswordValid && passwordsMatch;
    const handleRegister = async () => {
        if (!canSubmit) {
            Alert.alert('Error', 'Please complete all requirements');
            return;
        }
        if (!isUsernameValid) {
            Alert.alert('Invalid Username', 'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens');
            return;
        }
        console.log('🚀 Starting registration...');
        console.log('👤 Username:', username);
        console.log('📧 Email:', email);
        console.log('🔒 Password length:', password.length);
        setLoading(true);
        try {
            const emailExists = await authService.checkEmailExists(email);
            console.log('📧 Email exists?', emailExists);
            if (emailExists) {
                Alert.alert('Error', 'Email already in use');
                setLoading(false);
                return;
            }
            console.log('✅ Calling register function...');
            await register({ username, email, password });
            console.log('✅ Registration successful!');
        } catch (error: any) {
            console.error('❌ Registration error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
            Alert.alert('Registration Failed', errorMessage);
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
        <View style={styles.container}>
            <View style={styles.content}>
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
                    {/* Username Field */}
                    <AuthTextField
                        label="Username"
                        placeholder="Choose a username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {/* Username Validation */}
                    {username.length > 0 && (
                        <View style={styles.validationContainer}>
                            <ValidationRow
                                text="3-20 characters"
                                isValid={username.length >= 3 && username.length <= 20}
                            />
                            <ValidationRow
                                text="Only letters, numbers, _, -"
                                isValid={/^[a-zA-Z0-9_-]+$/.test(username)}
                            />
                        </View>
                    )}
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
                        placeholder="Create a password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    {/* Password Validation */}
                    {password.length > 0 && (
                        <View style={styles.validationContainer}>
                            <ValidationRow text="At least 8 characters" isValid={hasMinLength} />
                            <ValidationRow text="One uppercase letter" isValid={hasUpperCase} />
                            <ValidationRow text="One lowercase letter" isValid={hasLowerCase} />
                            <ValidationRow text="One number" isValid={hasNumber} />
                            <ValidationRow text="One special character" isValid={hasSpecialChar} />
                        </View>
                    )}
                    {/* Confirm Password Field */}
                    <AuthTextField
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                    {/* Password Match Validation */}
                    {confirmPassword.length > 0 && (
                        <View style={styles.matchValidation}>
                            <ValidationRow text="Passwords match" isValid={passwordsMatch} />
                        </View>
                    )}
                    {/* Sign Up Button */}
                    <PrimaryButton
                        label="Create Account"
                        onPress={handleRegister}
                        loading={loading}
                        disabled={!canSubmit || loading}
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
                {/* Bottom Section - Sign In Link */}
                <TouchableOpacity
                    style={styles.signInContainer}
                    onPress={() => router.back()}
                >
                    <Text style={styles.signInText}>
                        Already have an account? <Text style={styles.signInLink}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoText: {
        fontFamily: 'Cal Sans',
        fontSize: 28,
        fontWeight: 400,
        letterSpacing: 2,
    },
    bear: {
        color: '#D3D3D3',
    },
    fit: {
        color: '#FF7825',
    },
    formSection: {
        // Form section container
    },
    validationContainer: {
        marginBottom: 12,
        marginTop: -6,
    },
    matchValidation: {
        marginTop: -6,
        marginBottom: 12,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: AppColors.darkGrey,
    },
    dividerText: {
        color: AppColors.grey,
        marginHorizontal: 16,
        fontSize: 12,
    },
    socialButtonSpacing: {
        height: 10,
    },
    signInContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    signInText: {
        color: AppColors.grey,
        fontSize: 13,
    },
    signInLink: {
        color: AppColors.orange,
        fontWeight: '600',
    },
});
