import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// This file handles the route "/(tabs)" and immediately redirects to "/(tabs)/home".
// We explicitly declare it in _layout.tsx with href: null to prevent it appearing
// in the tab bar.

export default function TabsIndexRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/(tabs)/home');
    }, []);

    return null;
}
