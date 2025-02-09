import { View, Text, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Duration, DateTime } from 'luxon';
import { Swipeable } from 'react-native-gesture-handler';

import apiService from '../api';

export const HomeScreen = ({ navigation }) => {
  const swipeableRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [sortType, setSortType] = useState('expiry_date');
  const [openDropdown, setOpenDropdown] = useState(false);

  // Функция для получения данных с сервера
  const fetchProducts = async () => {
    try {
      const response = await apiService.getFridgeProducts();
      const data = await response.data;

      if (data) {
        setProducts(data.items);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Используем useFocusEffect для загрузки данных при активации экрана
  useFocusEffect(
    useCallback(() => {
      fetchProducts(); // Загружаем продукты
    }, []),
  );

  // Удаление элемента из списка
  const handleDelete = async item => {
    try {
      // Отправляем запрос на сервер для удаления
      await apiService.deleteFridgeProduct(item.id)

      // Удаляем из локального списка
      setProducts(prevProducts => prevProducts.filter(product => product.id !== item.id));
      Alert.alert('Успех', 'Продукт успешно удалён!');
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      Alert.alert('Ошибка', 'Не удалось удалить продукт.');
    }
  };

  // Добавление элемента в список покупок
  const AddShop = async item => {
    try {
      const response = await apiService.createCartProduct({ product_type_id: item.product.product_type_id })

      const data = await response.data
      console.log(data);

      if (!data) {
        throw new Error('Ошибка при добавлении в корзину');
      }

    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const getExpirationDays = item => {
    const expiresDuration = Duration.fromISO(item.product.product_type.exp_period_before_opening);

    const manufacturedDateTime = DateTime.fromISO(item.product.manufactured_at);

    const expiryDateTime = manufacturedDateTime.plus(expiresDuration);

    const daysLeft = expiryDateTime.diff(DateTime.now(), 'days').days;
    return Math.floor(daysLeft);
  };

  const getBorderColor = item => {
    const daysLeft = getExpirationDays(item);
    if (daysLeft < 2) return 'red';
    if (daysLeft <= 5) return 'yellow';
    return 'green';
  };

  // Сортировка продуктов
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortType) {
      case 'manufacture_date':
        return new Date(a.product.manufactured_at) - new Date(b.product.manufactured_at);
      case 'mass':
        return parseFloat(a.product.amount) - parseFloat(b.product.amount);
      case 'expiry_date':
        return getExpirationDays(a) - getExpirationDays(b);
    };
  });

  // Фильтрация продуктов по поисковому запросу
  const filteredProducts = sortedProducts.filter(item =>
    item.product.product_type.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Отображение кнопки удаления
  const renderRightActions = item => (
    <View style={styles.deleteButton}>
      <Text style={styles.deleteButtonText} onPress={() => handleDelete(item)}>
        Удалить
      </Text>
    </View>
  );

  // Отображение кнопки помещения в список покупок
  const renderLeftActions = item => (
    <View style={styles.addButton}>
      <Text style={styles.addButtonText} onPress={() => AddShop(item)}>
        В корзину
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      renderLeftActions={() => renderLeftActions(item)}
    >
      <View
        style={{
          ...styles.productItem,
          borderColor: getBorderColor(item),
        }}
      >
        <Text style={styles.productName}>{item.product.product_type.name}</Text>
        <Text style={styles.productDetail}>Классификация: {item.product.product_type.slug}</Text>
        <Text style={styles.productDetail}>
          Дата изготовления: {new Date(item.product.manufactured_at).toLocaleDateString()}
        </Text>
        <Text style={styles.productDetail}>Количество: {item.product.amount}</Text>
        <Text style={styles.productDetail}>
          Пищевая ценность: {item.product.product_type.calories}
        </Text>
        <Text
          style={{
            ...styles.productDetail,
            color: getBorderColor(item),
          }}
        >
          Осталось дней: {getExpirationDays(item)}
        </Text>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Продукты в холодильниках</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск продуктов по названию..."
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
      />

      <DropDownPicker
        open={openDropdown}
        value={sortType}
        items={[
          { label: 'Дата изготовления', value: 'manufacture_date' },
          { label: 'Срок годности', value: 'expiry_date' },
          { label: 'Масса', value: 'mass' },
        ]}
        setOpen={setOpenDropdown}
        setValue={setSortType}
        placeholder="Сортировать по..."
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      {/* Список продуктов */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredProducts}
          keyboardShouldPersistTaps="handled"
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center' }}>В этом холодильнике пусто</Text>
          }
          renderItem={renderItem}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  dropdown: {
    marginBottom: 16,
    borderColor: '#ccc',
    zIndex: -1,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    zIndex: -1,
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
  addButton: {
    justifyContent: 'center',
    backgroundColor: 'blue',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    flex: 1,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
