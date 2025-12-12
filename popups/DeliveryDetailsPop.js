import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { ImagePickerModal } from '../pages/ImagePickerModal'

import { Camera, useCameraDevice } from 'react-native-vision-camera';

import * as ImagePicker from 'react-native-image-picker';
import ToastManager, { Toast } from 'toastify-react-native'
import mime from "mime";
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeliveryDetailsPop = ({
    setDetailsPop, detailsPopItem, portNo,
    cmpCode, selectedValue, loginUser, deptno, appUrl, driverCompletedTab
}) => {


    const [imageUploadloading, setImageUploadloading] = useState(false)
    const device = useCameraDevice('back');


    console.log("driverCompletedTab>> ", driverCompletedTab,)

    const [URI, setURI] = useState(null)
    const [details, setDetails] = useState('')
    const [cubotDetails, setCubotDetails] = useState(null)

    const dono = detailsPopItem.do_no

    const itemDeptno = detailsPopItem.deptno.trim()




    const uploadImage = async () => {

        setImageUploadloading(true)

        console.log("Response:---> image apiUrl-->", cubotDetails, cubotDetails[0].IMG_POST_PATH)


        if (cubotDetails) {

            if (cubotDetails.length > 0) {

                const apiUrl = cubotDetails[0].IMG_POST_PATH + "/api/Image/upload"

                console.log("Response:---> image apiUrl +++", apiUrl)

                let pathToStoreImage = cubotDetails[0].IMG_SERVERPATH

                try {
                    // Create a FormData instance
                    const formData = new FormData();
                    formData.append('DOC_CODE', detailsPopItem.do_no);
                    formData.append('DOC_TYPE', 'DOCIMAGE');
                    formData.append('IMAGEPATH', pathToStoreImage); // here we have added one more slash else this is result and 405 status error when sending to api "C:ileupload_commonBONDTIME_DOC_IMG"
                    formData.append('IMGBASE64', 'test')
                    formData.append('cmpcode', cmpCode)

                    formData.append('file', {
                        uri: URI,
                        name: pickerResponse.assets[0].fileName,
                        type: mime.getType(URI),
                    })

                    // Axios configuration
                    const config = {
                        headers: {
                            'content-type': 'multipart/form-data'
                        },

                    };

                    console.log('formData +++>>>>.', formData, config)

                    // Send the POST request
                    const response = await axios.post(apiUrl, formData, config);

                    // Handle response
                    console.log('Response:---> image', response.data);

                    if (response.status === 200) {
                        Toast.success(response.data.message)
                        setURI(null)
                        setPickerResponse(null)
                    }

                    setImageUploadloading(false)

                } catch (error) {

                    setImageUploadloading(false)
                    // Handle error
                    console.error('Error uploading data:>>>>+++', error);
                    Toast.error('Some error occured')
                    // throw error;

                    if (error.response) {

                        console.log("err is text 1 ++ ", error.response);
                        //do something

                    } else if (error.request) {

                        //do something else
                        console.log("err is text 2 ++ >>>>>>>>>++++", error.request);

                    } else if (error.message) {

                        console.log("err is text 3 ++ ", error.message);
                        //do something other than the other two

                    }
                }

            } else {
                setImageUploadloading(false)
                console.log("Response:---> image No Server Details Found");
                Alert.alert("No Server Details Found")
                return
            }


        } else {
            setImageUploadloading(false)
            return

        }


    };

    const fetchDetails = async () => {
        try {
            console.log('fetchDetailsUrl', `https://cubixweberp.com:${portNo}/${cmpCode}/DO_DETAILS/${selectedValue}/${loginUser}/${itemDeptno}/${dono}/`)
            const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/DO_DETAILS/${selectedValue}/${loginUser}/${itemDeptno}/${dono}/`)

            if (response.status === 200) {
                setDetails(response.data)
            }
        } catch (error) {
            console.log('fetchDetailsError', error)
        }
    }

    useEffect(() => {
        if (portNo && cmpCode && selectedValue && loginUser && deptno && detailsPopItem) {
            fetchDetails()
        }
    }, [portNo, cmpCode, selectedValue, loginUser, deptno, detailsPopItem])

    console.log('details', details)
    console.log('detailsPopItem', detailsPopItem)

    const [pickerResponse, setPickerResponse] = useState(null);
    const [visible, setVisible] = useState(false);


    const handleTakePhoto = async () => {
        try {
            const cameraPermission = await Camera.requestCameraPermission();
            console.log('Camera Permission:', cameraPermission); // Check permission status
            if (cameraPermission !== 'granted') {
                alert('Camera access denied');
                return;
            }

            if (device) {
                // setShowCamera(true);
                onCameraPress()
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const onImageLibraryPress = useCallback(() => {
        const options = {
            selectionLimit: 1,
            mediaType: 'photo',
            includeBase64: false,
        };
        ImagePicker.launchImageLibrary(options, setPickerResponse);
    }, []);

    const onCameraPress = useCallback(() => {
        const options = {
            saveToPhotos: true,
            mediaType: 'photo',
            includeBase64: false,
        };
        ImagePicker.launchCamera(options, setPickerResponse);
    }, []);



    useEffect(() => {

        console.log("pickerResponse>>++", pickerResponse)
        if (pickerResponse?.assets) {
            if (pickerResponse.assets[0].uri) {
                setURI(pickerResponse.assets[0].uri)
            }

            setVisible(false)
        }

    }, [pickerResponse])

    useEffect(() => {

        console.log("pickerResponse>>++ URI", URI)

    }, [URI])

    const getCubotDetails = async () => {
        let cubot_details = await AsyncStorage.getItem("portNoData")
        let cubotArray = JSON.parse(cubot_details)
        console.log("cubot_details--->+ ", cubotArray)
        setCubotDetails(cubotArray)
    }
    useEffect(() => {
        getCubotDetails()

    }, [])

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

                <View style={styles.HomeTextCont}>
                    <TouchableOpacity style={styles.SettingsWrap} onPress={() => setDetailsPop(false)}>
                        <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                    </TouchableOpacity>
                    <Text style={styles.HomeText}>Details</Text>
                </View>



                <View style={styles.StockDescWrap}>

                    {

                        <View style={{ flexDirection: "row", justifyContent: "center", padding: 4 }}><TouchableOpacity onPress={() => setVisible(true)} style={styles.AcceptButton}><Text style={{ color: "#000000" }}>Select Image</Text></TouchableOpacity></View>
                    }


                    {
                        URI != null && URI != '' &&
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image
                                style={{
                                    width: 100, height: 100,
                                    borderColor: '#ffffff',
                                    borderWidth: 4,
                                }}
                                source={{ uri: URI }}
                            />
                            <View style={{ flexDirection: "row", justifyContent: "center", padding: 4 }}><TouchableOpacity onPress={() => uploadImage()} style={styles.AcceptButton}><Text style={styles.AcceptText}>Upload</Text></TouchableOpacity></View>

                            {
                                imageUploadloading &&

                                <ActivityIndicator size="large" color="#007AFF" />
                            }
                        </View>
                    }

                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Customer</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.Customer}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Area Code</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.area_code}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Delivery Site</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.deliv_site}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Driver name</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.drivername}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Carton Nos</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem['Carton Nos']}</Text>
                    </View>
                </View>

                <View style={styles.BottomListCont}>

                    <View style={styles.BottomListBanner}>
                        <View style={styles.ItemBannerCont}>
                            <Text style={styles.BannerText}>Item</Text>
                        </View>
                        <View style={styles.QtyBannerCont}>
                            <Text style={[styles.BannerText, { textAlign: 'right' }]}>Qty</Text>
                        </View>
                    </View>

                </View>

                <FlatList
                    // contentContainerStyle={styles.ScrollView}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 8 }}

                    data={details}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (

                        <>
                            <View style={styles.BottomListWrap}>
                                <View style={styles.ItemBannerCont}>
                                    <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 16 }]}>{item.Code}</Text>
                                    <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 16 }]}>{item.Description}</Text>
                                </View>
                                <View style={styles.QtyBannerCont}>
                                    <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 16, textAlign: 'right' }]}>{item.Quanity}</Text>
                                </View>
                            </View>
                        </>

                    )}
                    ListEmptyComponent={
                        <View>
                            <Text style={{ color: 'red' }}>No data available</Text>
                        </View>
                    }

                />

            </View>

            <ImagePickerModal
                isVisible={visible}
                onClose={() => setVisible(false)}
                onImageLibraryPress={onImageLibraryPress}
                // onCameraPress={onCameraPress}
                handleTakePhoto={handleTakePhoto}
            />

            <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 5,
        width: '95%',
        maxHeight: Dimensions.get('window').height - 100
    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#DCDBDB',
        paddingVertical: 10,
        paddingHorizontal: 6
    },
    HomeText: {
        fontSize: 18,
        color: '#1A6CF6',
        // borderBottomColor: 'gold',
        // borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Regular'
    },
    SettingsWrap: {
        // backgroundColor: '#189A2E',
        // backgroundColor: 'red',
        // borderRadius: 50,
        padding: 6
    },
    HeadIcon: {
        width: 20,
        height: 20
    },

    StockDescWrap: {
        flexDirection: 'column',
        width: '100%',
        marginTop: 8,
        backgroundColor: 'white',
        padding: 18
    },
    StockItem: {
        padding: 4,
        marginBottom: 2
    },
    StockLabel: {
        fontFamily: 'Lexend-Regular',
        color: "#2B2B2B",
        fontSize: 16
    },
    StockTextValue: {
        fontFamily: 'Lexend-Bold',
        color: "black",
        fontSize: 16
    },

    TableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
    },

    BottomListCont: {
        flexDirection: 'column',
        justifyContent: 'center',
        // alignItems: 'center',
        width: '100%',
        paddingHorizontal: 8
    },
    BottomListBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomColor: 'grey',
        borderBottomWidth: 1
    },
    ItemBannerCont: {
        width: '80%'
    },
    QtyBannerCont: {
        width: '20%',
        textAlign: 'right'
    },
    BannerText: {
        fontFamily: 'Lexend-Regular',
        color: "#2B2B2B",
        fontSize: 16
    },
    ScrollView: {
        maxHeight: 200
    },

    BottomListWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    AcceptButton: {
        backgroundColor: '#30B3A4',
        padding: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    AcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },
})

export default DeliveryDetailsPop