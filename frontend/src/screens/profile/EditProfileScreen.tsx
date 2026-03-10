import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

const ORANGE = "#FF7825";

export default function EditProfileScreen() {

    const router = useRouter();

    const [name,setName] = useState("");
    const [bio,setBio] = useState("");
    const [link,setLink] = useState("");
    const [sex,setSex] = useState("");
    const [birthday,setBirthday] = useState("");

    const [showSex,setShowSex] = useState(false);
    const [showBirthday,setShowBirthday] = useState(false);
    const [showInfo,setShowInfo] = useState(false);
    const [showPhoto,setShowPhoto] = useState(false);

    const allFilled = name !== "" && bio !== "" && link !== "" && sex !== "" && birthday !== "";

    return (

        <SafeAreaView style={styles.container}>

            {/* HEADER */}

            <View style={styles.header}>

                <TouchableOpacity onPress={()=>router.back()}>
                    <Ionicons name="arrow-back" size={26} color="white"/>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Profile</Text>

                <TouchableOpacity disabled={!allFilled}>
                    <Text style={[styles.done, allFilled && {color:ORANGE}]}>
                        Done
                    </Text>
                </TouchableOpacity>

            </View>

            {/* AVATAR */}

            <View style={styles.avatarSection}>

                <Image
                    source={{uri:"https://i.pravatar.cc/150"}}
                    style={styles.avatar}
                />

                <TouchableOpacity onPress={()=>setShowPhoto(true)}>
                    <Text style={styles.changePic}>Change Picture</Text>
                </TouchableOpacity>

            </View>

            {/* PUBLIC DATA */}

            <Text style={styles.section}>Public profile data</Text>

            <TextInput
                placeholder="Your full name"
                placeholderTextColor="#888"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <TextInput
                placeholder="Describe yourself"
                placeholderTextColor="#888"
                style={styles.input}
                value={bio}
                onChangeText={setBio}
            />

            <TextInput
                placeholder="https://example.com"
                placeholderTextColor="#888"
                style={styles.input}
                value={link}
                onChangeText={setLink}
            />

            {/* PRIVATE DATA */}

            <View style={styles.privateHeader}>

                <Text style={styles.section}>Private data</Text>

                <TouchableOpacity onPress={()=>setShowInfo(true)}>
                    <Ionicons name="help-circle-outline" size={18} color="#888"/>
                </TouchableOpacity>

            </View>

            {/* SEX */}

            <TouchableOpacity
                style={styles.selectRow}
                onPress={()=>setShowSex(true)}
            >

                <Text style={styles.label}>Sex</Text>
                <Text style={styles.selectText}>{sex || "Select"}</Text>

            </TouchableOpacity>

            {/* BIRTHDAY */}

            <TouchableOpacity
                style={styles.selectRow}
                onPress={()=>setShowBirthday(true)}
            >

                <Text style={styles.label}>Birthday</Text>
                <Text style={styles.selectText}>{birthday || "Select"}</Text>

            </TouchableOpacity>

            {/* PHOTO MODAL */}

            <Modal visible={showPhoto} transparent animationType="slide">

                <View style={styles.modalBg}>
                    <View style={styles.modalBox}>

                        <TouchableOpacity style={styles.modalBtn}>
                            <Text style={styles.modalText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalBtn}>
                            <Text style={styles.modalText}>Select Library Photo</Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </Modal>

            {/* SEX MODAL */}

            <Modal visible={showSex} transparent animationType="slide">

                <View style={styles.modalBg}>
                    <View style={styles.modalBox}>

                        {["Male","Female","Other"].map(item=>(
                            <TouchableOpacity
                                key={item}
                                style={styles.modalBtn}
                                onPress={()=>{setSex(item); setShowSex(false)}}
                            >
                                <Text style={styles.modalText}>{item}</Text>
                            </TouchableOpacity>
                        ))}

                    </View>
                </View>

            </Modal>

            {/* INFO MODAL */}

            <Modal visible={showInfo} transparent animationType="fade">

                <View style={styles.infoBg}>

                    <View style={styles.infoBox}>

                        <Text style={styles.infoTitle}>Private Data</Text>

                        <Text style={styles.infoText}>
                            Your private data will not be displayed on your public profile.
                            We use this to personalize your experience.
                        </Text>

                        <TouchableOpacity
                            style={styles.okBtn}
                            onPress={()=>setShowInfo(false)}
                        >
                            <Text style={{color:"white"}}>Ok</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

            {/* DATE PICKER */}

            {showBirthday && (

                <DateTimePicker
                    mode="date"
                    display="spinner"
                    value={new Date()}
                    onChange={(e,date)=>{
                        setShowBirthday(false)
                        if(date) setBirthday(date.toDateString())
                    }}
                />

            )}

        </SafeAreaView>

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
        justifyContent:"space-between",
        alignItems:"center",
        marginBottom:20
    },

    headerTitle:{
        color:"white",
        fontSize:18
    },

    done:{
        color:"#777",
        fontSize:16
    },

    avatarSection:{
        alignItems:"center",
        marginBottom:20
    },

    avatar:{
        width:90,
        height:90,
        borderRadius:45,
        backgroundColor:"#444"
    },

    changePic:{
        color:ORANGE,
        marginTop:10
    },

    section:{
        color:"#888",
        marginTop:20
    },

    input:{
        borderBottomWidth:1,
        borderBottomColor:"#333",
        color:"white",
        paddingVertical:10
    },

    privateHeader:{
        flexDirection:"row",
        alignItems:"center",
        gap:6,
        marginTop:20
    },

    selectRow:{
        flexDirection:"row",
        justifyContent:"space-between",
        paddingVertical:14,
        borderBottomWidth:1,
        borderBottomColor:"#333"
    },

    label:{
        color:"white"
    },

    selectText:{
        color:ORANGE
    },

    modalBg:{
        flex:1,
        justifyContent:"flex-end",
        backgroundColor:"rgba(0,0,0,0.5)"
    },

    modalBox:{
        backgroundColor:"#222",
        padding:20,
        borderTopLeftRadius:20,
        borderTopRightRadius:20
    },

    modalBtn:{
        paddingVertical:16,
        borderBottomWidth:1,
        borderBottomColor:"#333"
    },

    modalText:{
        color:"white",
        fontSize:16
    },

    infoBg:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"rgba(0,0,0,0.6)"
    },

    infoBox:{
        backgroundColor:"#222",
        padding:24,
        borderRadius:16,
        width:"80%"
    },

    infoTitle:{
        color:"white",
        fontSize:18,
        marginBottom:10
    },

    infoText:{
        color:"#aaa",
        marginBottom:20
    },

    okBtn:{
        backgroundColor:ORANGE,
        padding:12,
        borderRadius:10,
        alignItems:"center"
    }

});