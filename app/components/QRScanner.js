import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

import { URL } from '../config';

// ID для области сканирования
const qrcodeRegionId = "html5qr-code-full-region";

// Компонент сканера QR-кодов
const QRCodeScanner = () => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };

    // Обработчик успешного сканирования
    const onScanSuccess = async (decodedText, decodedResult) => {
      try {
        // Парсим полученный JSON
        const data = JSON.parse(decodedText);

        // Отправляем данные на сервер
        const response = await fetch(`${URL}/qr-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

      } catch (error) {
        console.error("Error processing QR code: ", error);
      }
    };

    scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, false);
    scannerRef.current.render(onScanSuccess);

    return () => {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return (
    <div id={qrcodeRegionId} style={{ width: '100%', height: '90%' }}></div>
  );
};

export default QRCodeScanner;
