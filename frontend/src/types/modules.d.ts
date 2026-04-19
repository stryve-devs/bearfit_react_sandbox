declare module '@react-native-async-storage/async-storage' {
    const AsyncStorage: any;
    export default AsyncStorage;
}

// Fallback typing when IDE/TS resolution cannot locate the installed package.
declare module '@react-navigation/material-top-tabs' {
    export function createMaterialTopTabNavigator<T extends Record<string, object | undefined>>(): any;
}
