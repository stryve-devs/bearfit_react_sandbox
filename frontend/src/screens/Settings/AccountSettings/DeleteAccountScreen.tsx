import React,{useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

export default function DeleteAccountScreen(){

    const navigation = useNavigation<any>();
    const [deleted,setDeleted]=useState(false);

    return(

        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#ff9d00"/>
                </TouchableOpacity>
                <Text style={styles.title}>Delete Account</Text>
                <View style={{width:24}}/>
            </View>

            <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>Warning !</Text>
                <Text style={styles.warningText}>
                    When you choose to deactivate your account, it will remain deactivated for 14 days. During this period you may reactivate your account at any time. If no action is taken within 14 days, the account will be permanently deleted.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={()=>setDeleted(true)}
            >
                <Text style={styles.deleteText}>
                    {deleted ? "Deactivated" : "Deactivate Account"}
                </Text>
            </TouchableOpacity>

        </View>

    );

}

const styles = StyleSheet.create({

    container:{flex:1,backgroundColor:"#000",padding:20},

    header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:30},

    title:{color:"#fff",fontSize:22},

    warningBox:{backgroundColor:"#2c2c2c",padding:20,borderRadius:20,marginBottom:40},

    warningTitle:{color:"#ff9d00",fontSize:18,marginBottom:10},

    warningText:{color:"#ddd"},

    button:{backgroundColor:"#333",padding:18,borderRadius:30,alignItems:"center"},

    deleteText:{color:"#ff3b30",fontSize:18}

});