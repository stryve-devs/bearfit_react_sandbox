import React,{useState} from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

export default function NotificationsScreen(){

    const navigation = useNavigation<any>();

    const Toggle = ({text}:any)=>{
        const [enabled,setEnabled]=useState(false);

        return(
            <View style={styles.row}>
                <Text style={styles.rowText}>{text}</Text>
                <Switch value={enabled} onValueChange={()=>setEnabled(!enabled)} />
            </View>
        );
    };

    return(

        <View style={styles.container}>

            <View style={styles.header}>
                <Feather name="arrow-left" size={24} color="#ff9d00" onPress={()=>navigation.goBack()}/>
                <Text style={styles.title}>Push Notifications</Text>
                <View style={{width:24}}/>
            </View>

            <Toggle text="Rest Timer"/>
            <Toggle text="Follows"/>
            <Toggle text="Monthly Report"/>
            <Toggle text="Subscribe to Stryve emails"/>
            <Toggle text="Likes on your workouts"/>
            <Toggle text="Likes on your comments"/>
            <Toggle text="Comments on your workouts"/>
            <Toggle text="Comment Replies"/>
            <Toggle text="Comment Mentions"/>
            <Toggle text="Workout Discussions"/>

        </View>

    );

}

const styles = StyleSheet.create({

    container:{flex:1,backgroundColor:"#000",padding:20},

    header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:20},

    title:{color:"#fff",fontSize:22},

    row:{backgroundColor:"#2c2c2c",padding:18,borderRadius:18,marginBottom:12,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},

    rowText:{color:"#fff"}

});