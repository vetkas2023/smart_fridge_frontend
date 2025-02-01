import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from "@react-navigation/native";

export const ProductInfo = ({ navigation }) => {
  const route = useRoute();
  const { product } = route.params; // Product data passed from QRCodeScanner

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Information</Text>
      <Text>Name: {product.product.product_type.name}</Text>
      <Text>ID: {product.id}</Text>
      <Text>Expiry Date: {product.product.manufactured_at}</Text>
      {/* Add more product details as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
