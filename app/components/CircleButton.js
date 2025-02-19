// 
// Круглая кнопка навигации для того, чтобы добавить новый элемент
// Кнопка должна переводить человека на другую страницу
// 


import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export const CircleButton = ({ navigation }) => {
  const [pressed, setPressed] = useState(false);
  const route = useRoute();
  const { fridge } = route.params

  const handlePress = () => {
    navigation.navigate("QR", { fridge });
  };

  return (
    <TouchableOpacity
      style={[styles.button, pressed ? styles.pressed : null]}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={handlePress}
    >
      <View style={styles.buttonInner}>
        <Text style={styles.buttonText}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1976d2",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  pressed: {
    backgroundColor: "#ccc",
  },
  buttonInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 30,
    color: "#fff",
  },
});
