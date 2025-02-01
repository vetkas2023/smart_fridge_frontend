// 
// Страница сканирования
// Толком не используется, но требует в себе наличие объекта navigate!
// 

import QRCodeScanner from '../components/QRScanner';
import { useRoute } from "@react-navigation/native";

// основной экспортируемый компонент
export const QRScreen = ({ navigation }) => {
  const route = useRoute()
  const { fridge } = route.params
  return (
    <QRCodeScanner navigation={navigation} fridge={fridge} />
  );
}

