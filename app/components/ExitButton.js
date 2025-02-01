import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ExitButton = ({ navigation }) => {

  // сразу вызываем логику выхода из текущей сессии
  useFocusEffect(() => {
    const exit = async () => {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('expiresAt');
      await AsyncStorage.removeItem('UserId');

      exit();
      navigation.navigate('AuthStack');
    }
  }, []
  );

  return null;
}
