import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Calendar } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import apiService from '../api';

const formatDate = (date, format = 'DD-MM-YYYY') => {
  const [year, month, day] = date.split('-');
  if (format === 'DD-MM-YYYY') return `${day}.${month}.${year}`;
  return date; // По умолчанию возвращаем дату без изменений
};

export const QRCodeGenerator = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [productTypeId, setProductTypeId] = useState(null);
  const [manufactureDate, setManufactureDate] = useState('');
  const [amount, setAmount] = useState('');

  const [openDropdown, setOpenDropdown] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState(null);

  const qrCodeRef = useRef();

  const fetchProductTypes = async () => {
    const response = await apiService.getProductTypes();
    const types = await response.data.map(type => ({
      label: type.name,
      value: type.id,
    }));

    setProductTypes(types)
  }

  useFocusEffect(
    useCallback(() => {
      fetchProductTypes(); // Загружаем продукты
    }, []),
  );

  const generateQRCode = async () => {
    try {
      const response = await apiService.createProduct({
        product_type_id: productTypeId,
        manufactured_at: manufactureDate,
        amount: parseFloat(amount),
      })
      const data = await response.data
      setQrData(data.id)
    } catch (error) {
      alert(error)
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeRef.current) {
      alert('Сначала сгенерируйте QR-код!');
      return;
    }

    qrCodeRef.current.toDataURL((dataURL) => {
      const link = document.createElement('a');
      const imgWidth = 400;
      const imgHeight = 400;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = imgWidth;
      canvas.height = imgHeight;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, imgWidth, imgHeight);

      const qrImage = new Image();
      qrImage.onload = () => {
        const padding = 50;
        const qrSize = imgWidth - padding * 2;

        ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);

        const finalDataURL = canvas.toDataURL('image/png');
        link.href = finalDataURL;
        link.download = 'qrcode_with_padding.png';
        link.click();
      };
      qrImage.src = `data:image/png;base64,${dataURL}`;
    });
  };

  const onDateSelect = (date) => {
    if (selectedDateType === 'manufacture') {
      setManufactureDate(date.dateString);
    }
    setIsDatePickerVisible(false);
  };

  const openDatePicker = (type) => {
    setSelectedDateType(type);
    setIsDatePickerVisible(true);
  };

  const closeDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Генерация QR-кода для продукта</Text>

      <DropDownPicker
        open={openDropdown}
        value={productTypeId}
        items={productTypes}
        setOpen={setOpenDropdown}
        setValue={setProductTypeId}
        placeholder="Тип продукта"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <View style={styles.formGroup}>
        <Text style={styles.label}>Дата изготовления</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => openDatePicker('manufacture')}
        >
          <Text style={styles.dateText}>
            {manufactureDate
              ? formatDate(manufactureDate, 'DD-MM-YYYY')
              : 'Выберите дату'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Количество</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите кол-во товара"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <TouchableOpacity style={styles.generateButton} onPress={generateQRCode}>
        <Text style={styles.generateButtonText}>Сгенерировать</Text>
      </TouchableOpacity>

      {qrData && (
        <View style={styles.qrContainer}>
          <Text style={styles.label}>Ваш QR-код:</Text>
          <QRCode
            value={JSON.stringify(qrData)}
            size={200}
            getRef={qrCodeRef}
            backgroundColor="white"
          />
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.downloadButton} onPress={downloadQRCode}>
              <Text style={styles.downloadButtonText}>Скачать QR-код</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={isDatePickerVisible} transparent>
        <View style={styles.modalBackground}>
          <View style={styles.calendarWrapper}>
            <Calendar
              onDayPress={onDateSelect}
              markedDates={{
                [manufactureDate]: { selected: true, selectedColor: 'blue' },
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeDatePicker}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = {
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
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
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
  },
  dateText: {
    color: '#555',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  downloadButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
  },
  closeButton: {
    backgroundColor: '#FF5252',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
};

export default QRCodeGenerator;
