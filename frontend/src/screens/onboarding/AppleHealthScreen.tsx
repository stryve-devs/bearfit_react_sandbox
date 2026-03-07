import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AppColors } from "../../constants/colors";

export default function AppleHealthScreen() {

    const router = useRouter();

    const handleNext = () => {
        router.replace("/(onboarding)/email-permission");
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Apple Health</Text>

            <Text style={styles.description}>
                Enable permissions to Apple Health so BearFit can read and report data
                about your workouts and measurements.
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryText}>Enable Apple Health</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleNext}>
                <Text style={styles.secondaryText}>Not now</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container:{
        flex:1,
        backgroundColor: AppColors.black,
        padding:24,
        justifyContent:"center"
    },

    title:{
        color:AppColors.orange,
        fontSize:20,
        textAlign:"center",
        marginBottom:40
    },

    description:{
        color:"#ccc",
        textAlign:"center",
        marginBottom:60
    },

    primaryButton:{
        backgroundColor:AppColors.orange,
        padding:16,
        borderRadius:10,
        alignItems:"center",
        marginBottom:14
    },

    primaryText:{
        color:"white",
        fontWeight:"600"
    },

    secondaryButton:{
        backgroundColor:"#333",
        padding:16,
        borderRadius:10,
        alignItems:"center"
    },

    secondaryText:{
        color:"#ccc"
    }

});