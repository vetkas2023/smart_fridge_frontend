import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import React, { useState, useCallback } from 'react';

import apiService from '../api';

export const ShoppingScreen = () => {
  const [products, setProducts] = useState([]);

  const fetchShop = async () => {
    try {
      const response = await apiService.getCartProducts()
      const data = response.data;

      // Group products by product_type.id
      const groupedProducts = data.reduce((acc, product) => {
        const key = product.product_type.id;
        if (!acc[key]) {
          acc[key] = { ...product, quantity: 1 }; // Initialize if not exists
        } else {
          acc[key].quantity += 1; // Increment quantity for duplicates
        }
        return acc;
      }, {});

      // Convert the grouped object back to an array
      const groupedArray = Object.values(groupedProducts);
      setProducts(groupedArray);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchShop(); // Загружаем продукты
    }, []),
  );

  const handleDelete = async item => {
    try {
      // Отправляем запрос на сервер для удаления
      await apiService.deleteCartProduct(item.id);

      // Обновляем локальный список
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => {
          if (product.id === item.id) {
            // Если количество больше 1, уменьшаем его на 1
            if (product.quantity > 1) {
              return { ...product, quantity: product.quantity - 1 };
            }
            // Если количество 1, возвращаем null для удаления
            return null;
          }
          return product;
        });

        // Фильтруем null значения (удаленные продукты)
        return updatedProducts.filter(product => product !== null);
      });
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Отображение кнопки удаления
  const renderRightActions = item => (
    <View style={styles.deleteButton}>
      <Text style={styles.deleteButtonText} onPress={() => handleDelete(item)}>
        Удалить
      </Text>
    </View>
  );

  const renderCartItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <View style={styles.productItem}>
        <Text style={styles.productName}>{item.product_type.name}</Text>
        <Text style={styles.productDetail}>Классификация: {item.product_type.slug}</Text>
        <Text style={styles.productDetail}>Калории: {item.product_type.calories}</Text>
        <Text style={styles.productName}>
          {item.quantity > 1 ? `${item.quantity}x` : ''}
        </Text>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCartItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Список покупок пуст</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },

  emptyText: {
    textAlign: 'center',
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

  deleteButton: {
    justifyContent: 'center',
    backgroundColor: 'red',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    flex: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
