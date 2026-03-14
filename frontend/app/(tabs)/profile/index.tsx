import { View, Text, StyleSheet } from "react-native";
import { AppColors } from "../../../src/constants/colors";

export default function ProfileScreen() {

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Profile</Text>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: AppColors.black
    },

    title: {
        color: AppColors.white,
        fontSize: 24
    }

});