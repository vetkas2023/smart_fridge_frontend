import { useFocusEffect } from '@react-navigation/native';
import { Linking } from 'react-native';
import { useCallback } from 'react';

import { bot_name } from '../config';
import apiService from '../api';

export const TGBotButton = ({ navigation }) => {
  const getURL = async () => {
    const response = await apiService.getUser()
    const { id } = response.data

    const url = `https://t.me/${bot_name}/?start=${id}`
    return url
  }


  useFocusEffect(
    useCallback(() => {
      const openTelegramBot = async () => {
        const url = await getURL();
        if (url) {
          Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
        }
      };

      openTelegramBot(); // Call the function to open the URL
      navigation.navigate("Home")
    }, []),
  );

  return null;
};
