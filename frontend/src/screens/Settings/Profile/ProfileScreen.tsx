import React, {useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";

export default function ProfileScreen() {

    const navigation = useNavigation();

    const [photoModal,setPhotoModal] = useState(false);
    const [genderModal,setGenderModal] = useState(false);
    const [birthdayModal,setBirthdayModal] = useState(false);

    return (

        <View style={styles.container}>

            {/* HEADER */}

            <View style={styles.header}>

                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#ffa000"/>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Profile</Text>

                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <Text style={styles.done}>Done</Text>
                </TouchableOpacity>

            </View>


            {/* PROFILE IMAGE */}

            <View style={styles.imageContainer}>
                <View style={styles.avatar}/>
                <TouchableOpacity onPress={()=>setPhotoModal(true)}>
                    <Text style={styles.change}>Change Picture</Text>
                </TouchableOpacity>
            </View>


            {/* PUBLIC DATA */}

            <Text style={styles.section}>Public profile data</Text>

            <TextInput
                placeholder="Name"
                placeholderTextColor="#777"
                style={styles.input}
            />

            <TextInput
                placeholder="Bio"
                placeholderTextColor="#777"
                style={styles.input}
            />

            <TextInput
                placeholder="Link"
                placeholderTextColor="#777"
                style={styles.input}
            />


            {/* PRIVATE DATA */}

            <Text style={styles.section}>Private data</Text>

            <TouchableOpacity onPress={()=>setGenderModal(true)}>
                <Text style={styles.select}>Select</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>setBirthdayModal(true)}>
                <Text style={styles.select}>Select</Text>
            </TouchableOpacity>



            {/* CHANGE PHOTO MODAL */}

            <Modal visible={photoModal} transparent animationType="slide">

                <View style={styles.modal}>

                    <View style={styles.sheet}>

                        <TouchableOpacity style={styles.sheetBtn}>
                            <Text style={styles.sheetText}>📷 Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sheetBtn}>
                            <Text style={styles.sheetText}>🖼 Select Library Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sheetBtn}>
                            <Text style={styles.delete}>Delete Profile Picture</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setPhotoModal(false)}>
                            <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>



            {/* GENDER MODAL */}

            <Modal visible={genderModal} transparent animationType="slide">

                <View style={styles.modal}>

                    <View style={styles.sheet}>

                        <Text style={styles.modalTitle}>Select your gender</Text>

                        <TouchableOpacity style={styles.genderBtn}>
                            <Text style={styles.genderText}>Male</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.genderBtn}>
                            <Text style={styles.genderText}>Female</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.genderBtn}>
                            <Text style={styles.genderText}>Rather not say</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setGenderModal(false)}>
                            <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>



            {/* BIRTHDAY MODAL */}

            <Modal visible={birthdayModal} transparent animationType="slide">

                <View style={styles.modal}>

                    <View style={styles.sheet}>

                        <Text style={styles.modalTitle}>Enter your birthday</Text>

                        <TouchableOpacity style={styles.genderBtn}>
                            <Text style={styles.genderText}>Submit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setBirthdayModal(false)}>
                            <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>



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
        justifyContent:"space-between",
        alignItems:"center",
        marginBottom:20
    },

    headerTitle:{
        color:"#ffa000",
        fontSize:18,
        fontWeight:"600"
    },

    done:{
        color:"#ffa000",
        fontSize:16
    },

    imageContainer:{
        alignItems:"center",
        marginBottom:20
    },

    avatar:{
        width:100,
        height:100,
        borderRadius:50,
        backgroundColor:"#555"
    },

    change:{
        color:"#1e90ff",
        marginTop:10
    },

    section:{
        color:"#888",
        marginTop:20
    },

    input:{
        borderBottomWidth:1,
        borderBottomColor:"#333",
        color:"#fff",
        paddingVertical:10,
        marginBottom:15
    },

    select:{
        color:"#1e90ff",
        marginTop:15
    },

    modal:{
        flex:1,
        justifyContent:"flex-end",
        backgroundColor:"rgba(0,0,0,0.5)"
    },

    sheet:{
        backgroundColor:"#111",
        padding:20,
        borderTopLeftRadius:20,
        borderTopRightRadius:20
    },

    sheetBtn:{
        padding:15,
        backgroundColor:"#333",
        borderRadius:12,
        marginBottom:10
    },

    sheetText:{
        color:"#ffa000",
        textAlign:"center"
    },

    delete:{
        color:"red",
        textAlign:"center"
    },

    cancel:{
        textAlign:"center",
        color:"#aaa",
        marginTop:10
    },

    modalTitle:{
        color:"#fff",
        textAlign:"center",
        marginBottom:15
    },

    genderBtn:{
        backgroundColor:"#333",
        padding:15,
        borderRadius:12,
        marginBottom:10
    },

    genderText:{
        color:"#ffa000",
        textAlign:"center"
    }

});