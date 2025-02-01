import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import apiService from '../api';
import { useRoute } from '@react-navigation/native';

const qrcodeRegionId = "html5qr-code-full-region";

const QRCodeScanner = ({ navigation }) => {
  const scannerRef = useRef(null)
  const route = useRoute()
  const { fridge } = route.params

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };

    const checkAlreadyExists = async (decodedText) => {
      const productId = parseFloat(decodedText);
      try {
        const responseFr = await apiService.getFridgeProducts({ product_id_eq: productId });
        const data = responseFr.data;

        console.log(data)
        if (data.items && data.items.length > 0) {
          scannerRef.current.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner. ", error);
          });
          navigation.navigate('ProductInfo', { product: data.items[0] }); // Navigate to ProductInfo screen
        } else {
          // create it otherwise
          await apiService.createFridgeProduct({ fridge_id: fridge.id, product_id: productId });
          alert('Product created successfully!');
          scannerRef.current.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner. ", error);
          });
          navigation.navigate("OneFridge", { fridge })
        }
      } catch (e) {
        alert(`Error checking product: ${e.message}. f_id=${fridge.id}, p_id=${productId}`);
      }
    };

    // Callback for successful scan
    const onScanSuccess = async (decodedText, decodedResult) => {
      try {
        await checkAlreadyExists(decodedText);
      } catch (e) {
        alert(`Scan error: ${e.message}`);
      }
    };

    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, false);
    scannerRef.current.render(onScanSuccess);

    // Cleanup function
    return () => {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [fridge.id, navigation]);

  return (
    <View
      id={qrcodeRegionId}
      style={{ width: '100%', height: '90%' }}
    />
  );
};

export default QRCodeScanner;
