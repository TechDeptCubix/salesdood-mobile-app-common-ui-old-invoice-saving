import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import axios from 'axios';
import {ImagePickerModal} from '../pages/ImagePickerModal';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import * as ImagePicker from 'react-native-image-picker';
import ToastManager, {Toast} from 'toastify-react-native';
import mime from 'mime';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const DeliveryDetailsPop = ({
  setDetailsPop,
  detailsPopItem,
  portNo,
  cmpCode,
  selectedValue,
  loginUser,
  deptno,
  appUrl,
  driverCompletedTab,
}) => {
  const [imageUploadloading, setImageUploadloading] = useState(false);
  const [URI, setURI] = useState(null);
  const [details, setDetails] = useState('');
  const [cubotDetails, setCubotDetails] = useState(null);
  const [pickerResponse, setPickerResponse] = useState(null);
  const [visible, setVisible] = useState(false);

  const device = useCameraDevice('back');
  const dono = detailsPopItem?.do_no;
  const itemDeptno = detailsPopItem?.deptno?.trim();

  // --- Logic Functions (Unchanged) ---
  const getCubotDetails = async () => {
    let cubot_details = await AsyncStorage.getItem('portNoData');
    let cubotArray = JSON.parse(cubot_details);
    setCubotDetails(cubotArray);
  };

  const fetchDetails = async () => {
    try {
      const response = await axios.get(
        `https://cubixweberp.com:${portNo}/${cmpCode}/DO_DETAILS/${selectedValue}/${loginUser}/${itemDeptno}/${dono}/`,
      );

      if (response.status === 200)
        console.log('Fetch Items of Response', response.data);
      setDetails(response.data);
    } catch (error) {
      console.log('fetchDetailsError', error);
    }
  };

  useEffect(() => {
    getCubotDetails();
    if (portNo && cmpCode && selectedValue && loginUser && itemDeptno && dono) {
      fetchDetails();
    }
  }, [portNo, cmpCode, selectedValue, loginUser, itemDeptno, dono]);

  const onImageLibraryPress = useCallback(() => {
    const options = {
      selectionLimit: 1,
      mediaType: 'photo',
      includeBase64: false,
    };
    ImagePicker.launchImageLibrary(options, setPickerResponse);
  }, []);

  const handleTakePhoto = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    if (cameraPermission === 'granted') {
      const options = {
        saveToPhotos: true,
        mediaType: 'photo',
        includeBase64: false,
      };
      ImagePicker.launchCamera(options, setPickerResponse);
    } else {
      Alert.alert('Camera access denied');
    }
  };

  useEffect(() => {
    if (pickerResponse?.assets) {
      setURI(pickerResponse.assets[0].uri);
      setVisible(false);
    }
  }, [pickerResponse]);

  const uploadImage = async () => {
    if (!cubotDetails || !URI) return;
    setImageUploadloading(true);
    const apiUrl = cubotDetails[0].IMG_POST_PATH + '/api/Image/upload';
    const formData = new FormData();
    formData.append('DOC_CODE', dono);
    formData.append('DOC_TYPE', 'DOCIMAGE');
    formData.append('IMAGEPATH', cubotDetails[0].IMG_SERVERPATH);
    formData.append('IMGBASE64', 'test');
    formData.append('cmpcode', cmpCode);
    formData.append('file', {
      uri: URI,
      name: pickerResponse.assets[0].fileName,
      type: mime.getType(URI),
    });

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {'content-type': 'multipart/form-data'},
      });
      if (response.status === 200) {
        Toast.success('Upload Successful');
        setURI(null);
      }
    } catch (error) {
      Toast.error('Upload failed');
    } finally {
      setImageUploadloading(false);
    }
  };

  // --- Render Functions ---
  const renderItem = ({item}) => (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemCode}>{item.Code}</Text>
        <Text style={styles.itemDesc}>{item.Description}</Text>
      </View>
      <View style={styles.qtyBadge}>
        <Text style={styles.qtyText}>{item.Quanity}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => setDetailsPop(false)}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.flexClose}
          onPress={() => setDetailsPop(false)}
        />

        <View style={styles.drawerContainer}>
          {/* Top Handle / Grabber */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Delivery Details</Text>
            <TouchableOpacity onPress={() => setDetailsPop(false)}>
              <Text style={styles.closeAction}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={details}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            ListHeaderComponent={
              <View style={styles.contentPadding}>
                {/* Image Section */}
                <View style={styles.imageUploadSection}>
                  {URI ? (
                    <View style={styles.previewContainer}>
                      <Image source={{uri: URI}} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={uploadImage}
                        disabled={imageUploadloading}>
                        {imageUploadloading ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Text style={styles.uploadBtnText}>
                            Confirm Upload
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.selectImageBtn}
                      onPress={() => setVisible(true)}>
                      <Text style={styles.selectImageText}>
                        + Add Delivery Photo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Info Grid */}
                <View style={styles.infoGrid}>
                  <InfoItem label="Customer" value={detailsPopItem?.Customer} />
                  <InfoItem label="DO Number" value={dono} />
                  <View style={styles.row}>
                    <InfoItem
                      label="Area"
                      value={detailsPopItem?.area_code}
                      half
                    />
                    <InfoItem
                      label="Site"
                      value={detailsPopItem?.deliv_site}
                      half
                    />
                  </View>
                  <View style={styles.row}>
                    <InfoItem
                      label="Driver"
                      value={detailsPopItem?.drivername}
                      half
                    />
                    <InfoItem
                      label="Cartons"
                      value={detailsPopItem?.['Carton Nos']}
                      half
                    />
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Items List</Text>
              </View>
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No items found</Text>
            }
            contentContainerStyle={{paddingBottom: 40}}
          />
        </View>

        <ImagePickerModal
          isVisible={visible}
          onClose={() => setVisible(false)}
          onImageLibraryPress={onImageLibraryPress}
          handleTakePhoto={handleTakePhoto}
        />
        <ToastManager />
      </View>
    </Modal>
  );
};

// Sub-component for clean organization
const InfoItem = ({label, value, half}) => (
  <View style={[styles.infoItem, half && {flex: 1}]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value} numberOfLines={1}>
      {value || '--'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  flexClose: {
    flex: 1,
  },
  drawerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.85,
    paddingTop: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Lexend-Bold',
  },
  closeAction: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 16,
  },
  contentPadding: {
    padding: 20,
  },
  imageUploadSection: {
    marginBottom: 20,
  },
  selectImageBtn: {
    height: 100,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  selectImageText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 12,
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  uploadBtn: {
    backgroundColor: '#2563EB',
    flex: 1,
    marginLeft: 15,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  infoGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  infoItem: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemCode: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 14,
    color: '#334155',
  },
  qtyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qtyText: {
    fontWeight: '800',
    color: '#1E293B',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#94A3B8',
  },
});

export default DeliveryDetailsPop;
