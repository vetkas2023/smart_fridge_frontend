import { Html5QrcodeScanner } from 'html5-qrcode';
import React from 'react';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import apiService from '../api';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const qrcodeRegionId = "html5qr-code-full-region";

const QRCodeScanner = ({ navigation }) => {
  const scannerRef = useRef(null);
  const route = useRoute();
  const { fridge } = route.params;
  const [isScanning, setIsScanning] = useState(true); // Flag to control scanning

  const checkAlreadyExists = async (decodedText) => {
    const productId = JSON.parse(decodedText).id;
    try {
      const responseFr = await apiService.getFridgeProducts({ product_id_eq: productId });
      const data = responseFr.data;

      if (data.items && data.items.length > 0) {
        console.log(`Such fridge item already exists (${productId}), moving to product info`, data.items[0]);
        cleanup();
        navigation.navigate("ProductInfo", { product: data.items[0] }); // Navigate to ProductInfo screen
      } else {
        // create it otherwise
        await apiService.createFridgeProduct({ fridge_id: fridge.id, product_id: productId });
        console.log("Create new fridge product, as it doesn't exist")
        cleanup();
        navigation.goBack();
      }
    } catch (e) {
      alert(`Error checking product: ${e.message}. f_id=${fridge.id}, p_id=${productId}`);
    }
  };

  // Callback for successful scan
  const onScanSuccess = async (decodedText, decodedResult) => {
    if (!isScanning) return; // Stop if scanning is already completed

    try {
      setIsScanning(false); // Disable further scans
      await checkAlreadyExists(decodedText);
    } catch (e) {
      alert(`Scan error: ${e.message}`);
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      };

      // Initialize the scanner
      scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, false);
      scannerRef.current.render(onScanSuccess);

      // Cleanup function
      return cleanup;
    }, [fridge, navigation])
  );

  return (
    <View
      id={qrcodeRegionId}
      style={{ width: '100%', height: '90%' }}
    />
  );
};

export default QRCodeScanner;
