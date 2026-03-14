import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export default function AccountSettingsScreen() {

    const navigation = useNavigation<any>();

    const Row = ({ icon, text, screen, danger=false }: any) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate(screen)}
        >
            <View style={styles.left}>
                {icon}
                <Text style={[styles.text, danger && {color:"#ff3b30"}]}>{text}</Text>
            </View>

            <Feather name="chevron-right" size={20} color="#888" />
        </TouchableOpacity>
    );

    return (

        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#ff9d00"/>
                </TouchableOpacity>

                <Text style={styles.title}>Account Settings</Text>

                <View style={{width:24}}/>
            </View>

            <Row
                icon={<Feather name="user" size={20} color="#ff9d00"/>}
                text="Change Username"
                screen="ChangeUsername"
            />

            <Row
                icon={<MaterialIcons name="email" size={20} color="#ff9d00"/>}
                text="Change Email"
                screen="ChangeEmail"
            />

            <Row
                icon={<Feather name="lock" size={20} color="#ff9d00"/>}
                text="Update Password"
                screen="UpdatePassword"
            />

            <Row
                icon={<MaterialIcons name="delete" size={20} color="#ff3b30"/>}
                text="Delete Account"
                screen="DeleteAccount"
                danger
            />

        </View>

    );
}

const styles = StyleSheet.create({

    container:{
        flex:1,
        backgroundColor:"#000",
        padding:20
    },

    header:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-between",
        marginBottom:20
    },

    title:{
        color:"#fff",
        fontSize:22
    },

    row:{
        backgroundColor:"#2c2c2c",
        padding:18,
        borderRadius:18,
        marginBottom:12,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
    },

    left:{
        flexDirection:"row",
        alignItems:"center",
        gap:15
    },

    text:{
        color:"#fff",
        fontSize:16
    }

});