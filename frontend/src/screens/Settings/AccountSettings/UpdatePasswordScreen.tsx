import React,{useState} from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

export default function UpdatePasswordScreen(){

    const navigation = useNavigation<any>();
    const [password,setPassword]=useState("");
    const [secure,setSecure]=useState(true);

    return(

        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#ff9d00"/>
                </TouchableOpacity>
                <Text style={styles.title}>Update Password</Text>
                <View style={{width:24}}/>
            </View>

            <Text style={styles.label}>Password</Text>

            <TextInput
                style={styles.input}
                secureTextEntry={secure}
                placeholder="minimum 6 characters"
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={()=>Alert.alert("Updated")}
            >
                <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>

        </View>

    );

}

const styles = StyleSheet.create({

    container:{flex:1,backgroundColor:"#000",padding:20},

    header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:30},

    title:{color:"#fff",fontSize:22},

    label:{color:"#ff9d00",marginBottom:10},

    input:{borderBottomWidth:1,borderBottomColor:"#666",color:"#fff",marginBottom:40,paddingVertical:8},

    button:{backgroundColor:"#333",padding:18,borderRadius:30,alignItems:"center"},

    buttonText:{color:"#ff9d00",fontSize:18}

});