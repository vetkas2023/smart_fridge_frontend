import React from 'react';
import { Duration, DateTime } from 'luxon';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from "@react-navigation/native";

export const ProductInfo = ({ navigation }) => {
  const route = useRoute();
  const { product } = route.params; // Product data passed from QRCodeScanner

  const getExpirationDays = item => {
    const expiresDuration = Duration.fromISO(item.product.product_type.exp_period_before_opening);
    const manufacturedDateTime = DateTime.fromISO(item.product.manufactured_at);
    const expiryDateTime = manufacturedDateTime.plus(expiresDuration);

    const daysLeft = expiryDateTime.diff(DateTime.now(), 'days').days;
    return Math.ceil(daysLeft);
  };

  const getBorderColor = item => {
    const daysLeft = getExpirationDays(item);
    if (daysLeft < 2) return 'red';
    if (daysLeft <= 5) return 'yellow';
    return 'green';
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          ...styles.productItem,
          borderColor: getBorderColor(product),
        }}
      >
        <Text style={styles.productName}>{product.product.product_type.name}</Text>
        <Text style={styles.productDetail}>Классификация: {product.product.product_type.slug}</Text>
        <Text style={styles.productDetail}>
          Дата изготовления: {new Date(product.product.manufactured_at).toLocaleDateString()}
        </Text>
        <Text style={styles.productDetail}>Количество: {product.product.amount}</Text>
        <Text style={styles.productDetail}>
          Пищевая ценность: {product.product.product_type.calories}
        </Text>
        <Text
          style={{
            ...styles.productDetail,
            color: getBorderColor(product),
          }}
        >
          Осталось дней: {getExpirationDays(product)}
        </Text>
      </View>
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
  productItem: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDetail: {
    fontSize: 14,
    color: '#555',
  },
});
