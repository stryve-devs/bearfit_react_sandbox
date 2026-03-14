import Constants from 'expo-constants';

type GoogleSigninModule = {
    GoogleSignin: {
        configure: (options?: { webClientId?: string; offlineAccess?: boolean }) => void;
        hasPlayServices: (options?: { showPlayServicesUpdateDialog?: boolean }) => Promise<boolean>;
        signIn: () => Promise<{ data?: { idToken?: string | null } }>;

        getTokens?: () => Promise<{ idToken?: string | null; accessToken?: string | null }>;
    };
};

let isConfigured = false;

const GOOGLE_NATIVE_UNAVAILABLE_MESSAGE =
    'Google Sign-In native module is unavailable. Use a development build (not Expo Go) and rebuild the app after adding the plugin.';

function assertGoogleNativeRuntime() {
    const appOwnership = (Constants as any)?.appOwnership;
    const executionEnvironment = (Constants as any)?.executionEnvironment;

    // Expo Go (store client) does not include this native module.
    if (appOwnership === 'expo' || executionEnvironment === 'storeClient') {
        throw new Error(GOOGLE_NATIVE_UNAVAILABLE_MESSAGE);
    }
}

function getGoogleSigninNative() {
    assertGoogleNativeRuntime();

    try {
        const mod = require('@react-native-google-signin/google-signin') as GoogleSigninModule;
        return mod.GoogleSignin;
    } catch {
        throw new Error(GOOGLE_NATIVE_UNAVAILABLE_MESSAGE);
    }
}

export function configureGoogleSignIn() {
    if (isConfigured) return;

    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const googleSignin = getGoogleSigninNative();

    if (webClientId) {
        googleSignin.configure({
            webClientId,
            offlineAccess: true,
        });
    } else {
        // Android-only setup can still proceed without webClientId and use accessToken fallback.
        googleSignin.configure({});
    }

    isConfigured = true;
}

export async function getGoogleAuthPayload(): Promise<{ idToken?: string; accessToken?: string }> {
    configureGoogleSignIn();

    const googleSignin = getGoogleSigninNative();
    await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const signInResult = await googleSignin.signIn();
    const signInIdToken = signInResult.data?.idToken ?? undefined;

    let accessToken: string | undefined;
    let tokenIdToken: string | undefined;

    try {
        const tokens = await googleSignin.getTokens?.();
        accessToken = tokens?.accessToken ?? undefined;
        tokenIdToken = tokens?.idToken ?? undefined;
    } catch {
        // Ignore token retrieval failures here; we validate below.
    }

    const idToken = signInIdToken || tokenIdToken;

    if (!idToken && !accessToken) {
        throw new Error('Google sign-in did not return a usable token');
    }

    return { idToken, accessToken };
}
