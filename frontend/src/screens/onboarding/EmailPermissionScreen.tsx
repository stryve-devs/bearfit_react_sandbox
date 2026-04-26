import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppColors } from "../../constants/colors";

export default function EmailPermissionScreen(){

    const router = useRouter();

    const finishOnboarding = () => {
        router.replace("/(onboarding)/referral");
    };

    return(

        <SafeAreaView style={styles.container} edges={["top","bottom"]}>

            <View style={styles.content}>

                <Text style={styles.title}>Can we send you emails?</Text>

                <Text style={styles.description}>
                    No spam, promise. We hate it too.
                </Text>

                <View style={styles.list}>
                    <Text style={styles.item}>✓ Tips for getting the most out of BearFit</Text>
                    <Text style={styles.item}>✓ New feature announcements</Text>
                    <Text style={styles.item}>✓ Promotion offers</Text>
                    <Text style={styles.item}>✓ Opt out anytime</Text>
                </View>

            </View>

            <View style={styles.buttonContainer}>

                <TouchableOpacity style={styles.primaryButton} onPress={finishOnboarding}>
                    <Text style={styles.primaryText}>Sure</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={finishOnboarding}>
                    <Text style={styles.secondaryText}>No, thanks</Text>
                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container:{
        flex:1,
        backgroundColor:AppColors.black
    },

    content:{
        flex:1,
        paddingHorizontal:24,
        justifyContent:"center"
    },

    title:{
        color:"white",
        fontSize:20,
        textAlign:"center",
        marginBottom:10
    },

    description:{
        color:"#aaa",
        textAlign:"center",
        marginBottom:30
    },

    list:{
        marginBottom:20
    },

    item:{
        color:"#ddd",
        marginBottom:8
    },

    buttonContainer:{
        paddingHorizontal:24,
        paddingBottom:20
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