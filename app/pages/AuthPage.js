// Страница авторизации пользователей
//

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiService from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Экспортируемый экран авторизации
export const AuthScreen = ({ navigation }) => {
  const { width } = Dimensions.get('window');
  // Ширина основного блока в зависимости от ширины экрана
  const mainBlockWidth = width < 400 ? '85%' : '34%';

  // Состояния для управления вводом и авторизацией
  const [message, setMessage] = useState('ВВЕДИТЕ ЛОГИН И ПАРОЛЬ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка сохранённой сессии при монтировании
  useEffect(() => {
    const func = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const expiresAt = await AsyncStorage.getItem('expiresAt');

      if (token && expiresAt && Date.now() < expiresAt) {
        setIsAuthenticated(true);
        navigation.navigate('Home'); // Перенаправляем на главную страницу
      } else {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('expiresAt');
      }
    }
    func()
  }, []);

  const sendDataToServerAuth = async () => {
    if (email !== '' || password !== '') {
      try {
        const response = await apiService.login({ email, password }, navigator.userAgent)

        const data = await response.data
        console.log(data);
        const { access_token, refresh_token, access_token_expires_in } = data;

        if (access_token) {
          const expiresAt = Date.now() + access_token_expires_in * 1000 * 60;
          await AsyncStorage.setItem('authToken', access_token);
          await AsyncStorage.setItem('expiresAt', expiresAt.toString());

          console.log('Access token сохранён:', access_token);
          console.log('Refresh token получен и хранится в куках автоматически');
          console.log('Refresh token:', refresh_token);

          setIsAuthenticated(true);
          navigation.navigate('Home');
        } else {
          setMessage('Поля логина и пароля не могут быть пустыми');
        }
      } catch (error) {
        setMessage(error.message)
        console.log(error)
      }

      // Очистка полей после попытки авторизации
      setEmail('');
      setPassword('');
    };
  }

  // Интерфейс страницы
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.mainBlock, { width: mainBlockWidth }]}>
        <Text style={styles.topText}>{message}</Text>

        <View style={styles.blockTextInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Логин или почта:"
            autoFocus={true}
            onChangeText={login => setEmail(login)}
            value={email}
          />
        </View>

        <View style={styles.blockTextInput}>
          <TextInput
            secureTextEntry={!showPassword}
            style={styles.textInput}
            placeholder="Пароль:"
            onChangeText={passw => setPassword(passw)}
            value={password}
          />

          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={28}
            color="#aaa"
            style={styles.icon}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>

        <TouchableOpacity style={styles.button.active} onPressOut={sendDataToServerAuth}>
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button.inactive}
          onPressOut={() => {
            navigation.navigate('Reg');
          }}
        >
          <Text style={styles.buttonText}>Регистрация</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Конструктор стилей для экрана авторизации
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#21292c',
  },

  mainBlock: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },

  blockTextInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f3',

    borderWidth: 0.5,
  },

  textInput: {
    justifyContent: 'center',
    margin: 'auto',
    padding: '7%',
    backgroundColor: '#f3f3f3',
    color: 'black',
    width: '100%',

    fontFamily: 'Arial',
  },

  icon: {
    marginRight: '5%',
  },

  button: {
    active: {
      width: '100%',
      height: '10%',
      backgroundColor: '#007bb7',
    },

    inactive: {
      width: '100%',
      height: '10%',
      backgroundColor: '#374e59',
    },
  },

  buttonText: {
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'Arial',
    fontWeight: 'bold',
    margin: 'auto',

    color: '#e2e8e9',
    fontSize: 20,
  },

  topText: {
    textAlign: 'center',
    justifyContent: 'center',

    fontSize: 17,
    color: '#e2e8e9',
    margin: '5%',
    padding: 'auto',
    fontFamily: 'Arial',
  },
});
