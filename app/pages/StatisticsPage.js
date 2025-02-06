import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import apiService from '../api';

export const StatisticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [addedData, setAdded] = useState([]);
  const [deletedData, setDeleted] = useState([]);
  const [exceededData, setExceeded] = useState([]);

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStatistics({
        date_from: dateFrom,
        date_to: dateTo,
      });
      const { added, deleted, exceeded } = response.data;

      setAdded(added.sort((a, b) => b.amount - a.amount));
      setDeleted(deleted.sort((a, b) => b.amount - a.amount));
      setExceeded(exceeded.sort((a, b) => b.amount - a.amount));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [dateFrom, dateTo]),
  );

  const handleDateChange = (day) => {
    if (!dateFrom || (dateFrom && dateTo)) {
      setDateFrom(day.dateString);
      setDateTo(null); // Reset dateTo when a new dateFrom is selected
    } else {
      setDateTo(day.dateString);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Выберите диапазон дат</Text>
      <Calendar
        onDayPress={handleDateChange}
        markedDates={{
          [dateFrom]: { selected: true, marked: true, selectedColor: 'blue' },
          [dateTo]: { selected: true, marked: true, selectedColor: 'blue' },
        }}
      />

      <TouchableOpacity style={styles.button} onPress={fetchData}>
        <Text style={styles.buttonText}>Получить статистику</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Добавленные товары</Text>
      <FlatList
        data={addedData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.product_type.name}</Text>
            <Text style={styles.listItemText}>Количество: {item.amount}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      <Text style={styles.sectionTitle}>Удаленные товары</Text>
      <FlatList
        data={deletedData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.product_type.name}</Text>
            <Text style={styles.listItemText}>Количество: {item.amount}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      <Text style={styles.sectionTitle}>Истекшие товары</Text>
      <FlatList
        data={exceededData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.product_type.name}</Text>
            <Text style={styles.listItemText}>Количество: {item.amount}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  listItem: {
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listItemText: {
    fontSize: 14,
  },
  itemSeparator: {
    height: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default StatisticsScreen;
