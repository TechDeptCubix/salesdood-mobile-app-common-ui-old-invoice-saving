import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, FlatList, Modal, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { TextInput } from 'react-native-paper'
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import FastImage from 'react-native-fast-image';
import { Button } from 'react-native-share';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { it } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';


const GoodsCollectionDelivery = ({ }) => {

    const [user_typed_delivered_to, setUser_typed_delivered_to] = useState("")
    const [showHideDriverList, setShowHideDriverList] = useState(false)
    const [currentChoosenDriver, setCurrentChoosenDriver] = useState(null)
    const [driverList, setDriverList] = useState(null)
    const navigation = useNavigation()
    const [received_from_typed_by_user, setReceived_from_typed_by_user] = useState("")
    const [package_type_by_user, setPackage_type_by_user] = useState("Bag")

    const [user_typed_comment_delivery, setUser_typed_comment_delivery] = useState("")

    const [package_condition_by_user, setPackage_condition_by_user] = useState("Good")
    const [loginUser, setLoginUser] = useState('')
    const initialuserTypedValues = {
        number_of_packages: "0"
    }
    const [userTypedValues, setUserTypedValues] = useState(initialuserTypedValues)
    const [callingDeliveryDetailsAPI, setcallingDeliveryDetailsAPI] = useState(false)
    const [callingSalesDetailsAPI, setcallingSalesDetailsAPI] = useState(false)

    const [salesDetails, setSalesDetails] = useState(null)
    const [deliveryDetails, setDeliveryDetails] = useState(null)
    const [cmpCode, setCmpCode] = useState('')
    const [deptno, setDeptno] = useState('')

    const [appUrl, setAppUrl] = useState('')
    const route = useRoute();
    const { listItem } = route.params;

    console.log("lisItem in GCD", listItem)

    const handleInput = (e, nameOfField) => {

        setUserTypedValues({ ...userTypedValues, [nameOfField]: e })


    }

    const handleUserTypedDeliveredTo = (text)=>{
        setUser_typed_delivered_to(text)
    }
    const handleInputReceivedFrom = (text) => {
        setReceived_from_typed_by_user(text)
    }

    const handleInputComment = (text) => {
        setUser_typed_comment_delivery(text)
    }

    const getDriverList = () => {

        const apiurl = `${appUrl}MasterCount/${cmpCode}/driverlist/${loginUser}/${deptno}`

        console.log("apiurl getsaledetails++ listItem", apiurl, listItem)

        setcallingSalesDetailsAPI(true)

        axios.get(apiurl).then((res) => {
            console.log("res -> ", res.data)

            setcallingSalesDetailsAPI(false)

            let filteredList = res.data?.filter((item) => {
                return item.SMAN_KEY != ""
            })
            setDriverList(filteredList)

        }).catch((err) => {
            setcallingSalesDetailsAPI(false)
        })
    }

    const fetchAppUrl = async () => {

        console.log("fetchappUrl")

        const appUrl = await AsyncStorage.getItem('appUrl')
        console.log("fetchappUrl appUrl", appUrl)

        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        const deptNo = await AsyncStorage.getItem('DEPTNO')

        const loginUserName = await AsyncStorage.getItem('loginUserName')



        if (loginUserName) {

            setLoginUser(loginUserName.trim())
        }

        if (deptNo) {
            setDeptno(deptNo)
        }

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }

        if (appUrl) {
            setAppUrl(appUrl)
        }


    }

    const [tabNumber, setTabNumber] = useState(1)

    const [selectedItems, setSelectedItems] = useState([]);

    const [deliveryToCustomerCheck, setDeliveryToCustomerCheck] = useState(false)

    const [taskDetailState, setTaskDetailState] = useState({
        primaryDoc: '',
        docDate: '',
        lineItems: '',
        docOwner: '',
        branch: '',
        supplier: '',
        supplierInv: '',
        supplierDo: '',
        packages: '',
        typesOfPackages: '',
        condition: ''
    })

    const [showIncomingGoodsList, setShowIncomingGoodsList] = useState(false)
    const [showIOutGoingGoodsList, setShowOutGoingGoodsList] = useState(false)


    const [selectedRadio, setSelectedRadio] = useState('')
    const [selectedRadioRight, setSelectedRadioRight] = useState('')

    // camerStates
    const device = useCameraDevice('back');

    const [showCamera, setShowCamera] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const cameraRef = useRef(null);

    const [takePhotoLoader, setTakePhotoLoader] = useState(false)

    // State to control the image modal
    const [showImageModal, setShowImageModal] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const [photoFiles, setPhotoFiles] = useState([]);

    // audio

    const [audioFiles, setAudioFiles] = useState([]);

    const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current; // Audio recorder instance


    const requestPermissions = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);

                if (
                    granted['android.permission.RECORD_AUDIO'] === 'granted' &&
                    granted['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted' &&
                    granted['android.permission.READ_EXTERNAL_STORAGE'] === 'granted'
                ) {
                    console.log('Permissions granted');
                } else {
                    console.log('Permissions denied');
                }
            }
        } catch (err) {
            console.warn(err);
        }
    };

    // Start recording audio
    const startRecording = async (rowId) => {
        try {
            // Ensure permissions are granted before starting the recording
            await requestPermissions();

            // Ensure the rowId is valid before using it
            if (rowId === null) {
                console.error('No row selected for recording!');
                return;
            }

            const path = `${RNFS.DocumentDirectoryPath}/${rowId}_audio.m4a`; // Use a valid path for storage
            console.log('Recording to path:', path); // For debugging

            // Update the isRecording flag for the selected row to true
            setSelectedItems((prevData) =>
                prevData.map((item) =>
                    item.slNo === rowId ? { ...item, isRecording: true } : item
                )
            );

            // Start recording
            await audioRecorderPlayer.startRecorder(path);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    // Stop recording audio
    const stopRecording = async (rowId) => {
        try {
            const result = await audioRecorderPlayer.stopRecorder();
            audioRecorderPlayer.removeRecordBackListener(); // Ensure cleanup of listeners
            // setAudioFile(result);

            // Create a file object for the audio
            const fileObject = {
                uri: `file://${result}`,
                name: `audio_${Date.now()}.m4a`,
                type: 'audio/m4a',
            };

            console.log('Audio File Object:', fileObject);

            setSelectedItems((prevData) =>
                prevData.map((item) =>
                    item.slNo === rowId
                        ? { ...item, isRecording: false, audio: result }
                        : item
                )
            );

            // Update audioFiles state with the file object
            setAudioFiles((prevFiles) => {
                const existingFileIndex = prevFiles.findIndex((file) => file.id === rowId);
                if (existingFileIndex > -1) {
                    // Replace the file if it already exists
                    const updatedFiles = [...prevFiles];
                    updatedFiles[existingFileIndex] = { id: rowId, file: fileObject };
                    return updatedFiles;
                } else {
                    // Add a new file
                    return [...prevFiles, { id: rowId, file: fileObject }];
                }
            });


        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    };


    // Format time into MM:SS
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };

    // Play the recorded audio and show the timer
    const playAudio = async (filePath, rowId) => {
        try {
            await audioRecorderPlayer.startPlayer(filePath);

            // Update state to show playing status
            setSelectedItems((prevData) =>
                prevData.map((item) =>
                    item.slNo === rowId ? { ...item, isPlaying: true } : item
                )
            );

            // Listen for playback events and update the timer
            audioRecorderPlayer.addPlayBackListener((e) => {
                // const currentPosition = e.current_position;
                const currentPosition = e.currentPosition;
                const duration = e.duration;

                console.log('currentPosition', currentPosition)
                console.log('duration', duration)
                // Check if the values are valid numbers(not NaN)
                // if (!isNaN(currentPosition) && !isNaN(duration)) {
                //     const currentTime = formatTime(currentPosition);
                //     setSelectedItems((prevData) =>
                //         prevData.map((item) =>
                //             item.slNo === rowId ? { ...item, playTime: currentTime } : item
                //         )
                //     );
                // }

                // Use a threshold to determine if playback is complete
                if (duration - currentPosition <= 500) { // Allow a 500ms threshold
                    console.log('Playback complete');
                    audioRecorderPlayer.stopPlayer();
                    audioRecorderPlayer.removePlayBackListener();

                    // Update state to stop playing
                    setSelectedItems((prevData) =>
                        prevData.map((item) =>
                            item.slNo === rowId ? { ...item, isPlaying: false } : item
                        )
                    );
                }

                // Stop the listener when the playback is finished
                // if (currentPosition === duration) {
                //     audioRecorderPlayer.removePlayBackListener();

                //     stopPlayingAudio(rowId);
                // }
            });
        } catch (error) {
            console.error('Error playing audio:', error);

            // Ensure `isPlaying` is reset on error
            setSelectedItems((prevData) =>
                prevData.map((item) =>
                    item.slNo === rowId ? { ...item, isPlaying: false } : item
                )
            );
        }
    };

    const stopPlayingAudio = (rowId) => {
        try {
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();

            // Update state to stop playing
            setSelectedItems((prevData) =>
                prevData.map((item) =>
                    item.slNo === rowId ? { ...item, isPlaying: false } : item
                )
            );
        } catch (error) {
            console.error('Error stopping playback:', error);
        }
    };

    useEffect(() => {
        fetchAppUrl()
        requestPermissions(); // Request permissions when the component is mounted

        setReceived_from_typed_by_user(listItem?.receivedfrom ? listItem?.receivedfrom : "")


        setUserTypedValues({ ...userTypedValues, number_of_packages: listItem?.packagecount })

        setPackage_condition_by_user(listItem?.packagecondition)

        setPackage_type_by_user(listItem?.packagetype)
        setCurrentChoosenDriver(listItem?.handedto)
        setCurrentChoosenDriver(listItem.deliveryto)
        
    }, []);

    // camersFunctions
    const handleImagePreview = (imageUri) => {
        if (imageUri) {
            setPreviewImage(imageUri);
            setShowImageModal(true);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const cameraPermission = await Camera.requestCameraPermission();
            console.log('Camera Permission>>>:', cameraPermission); // Check permission status
            if (cameraPermission !== 'granted') {
                alert('Camera access denied');
                return;
            }

            if (device) {
                setShowCamera(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };


    const capturePhoto = async () => {
        setTakePhotoLoader(true)
        try {
            if (cameraRef.current) {
                const photo = await cameraRef.current.takePhoto({
                    qualityPrioritization: 'quality',
                    skipMetadata: true,
                });
                console.log('Photo taken:', photo);

                if (photo && photo.path) {
                    const filePath = `file://${photo.path}`;
                    console.log('Formatted Photo Path:', filePath);

                    // Create a file object
                    const fileObject = {
                        uri: filePath,
                        name: `photo_${Date.now()}.jpg`,
                        type: 'image/jpeg',
                    };

                    console.log('Original File:', fileObject);

                    // Update selectedItems with the file path
                    const updatedData = selectedItems.map((item) =>
                        item.slNo === selectedRowId ? { ...item, label: filePath } : item
                    );

                    // Update photoFiles with the file object
                    setPhotoFiles((prevFiles) => {
                        const existingFileIndex = prevFiles.findIndex((file) => file.id === selectedRowId);
                        if (existingFileIndex > -1) {
                            // Replace the file if it already exists
                            const updatedFiles = [...prevFiles];
                            updatedFiles[existingFileIndex] = { id: selectedRowId, file: fileObject };
                            return updatedFiles;
                        } else {
                            // Add a new file
                            return [...prevFiles, { id: selectedRowId, file: fileObject }];
                        }
                    });
                    setSelectedItems(updatedData);
                    setTakePhotoLoader(false)

                } else {
                    console.error('Photo capture failed: No URI returned.');
                    setTakePhotoLoader(false)

                }

                setShowCamera(false);
                setTakePhotoLoader(false)

            } else {
                console.error('Camera reference is null.');
                setTakePhotoLoader(false)

            }
        } catch (error) {
            console.error('Error capturing photo:', error);
            setTakePhotoLoader(false)

        }
    };




    const dummyData = [
        {
            slNo: 1,
            partName: "Oil Filter",
            detail: "High-performance oil filter for diesel engines.",
            brand: "Bosch",
            qtyOr: 25,
            partNumber: "OF1234",
        },
        {
            slNo: 2,
            partName: "Air Filter",
            detail: "Durable air filter for all-weather use.",
            brand: "K&N",
            qtyOr: 40,
            partNumber: "AF5678",
        },
        {
            slNo: 3,
            partName: "Brake Pad",
            detail: "OEM certified ceramic brake pads.",
            brand: "Brembo",
            qtyOr: 15,
            partNumber: "BP9012",
        },
        {
            slNo: 4,
            partName: "Spark Plug",
            detail: "Platinum spark plug for increased engine performance.",
            brand: "NGK",
            qtyOr: 50,
            partNumber: "SP3456",
        },
        {
            slNo: 5,
            partName: "Battery",
            detail: "Maintenance-free automotive battery with high capacity.",
            brand: "Exide",
            qtyOr: 10,
            partNumber: "BT7890",
        },
    ];

    const handleToggle = (item) => {
        if (selectedItems.some((selected) => selected.slNo === item.slNo)) {
            // Deselect the item
            setSelectedItems(selectedItems.filter((selected) => selected.slNo !== item.slNo));
        } else {
            // Select the item
            setSelectedItems([
                ...selectedItems,
                {
                    ...item, // Spread existing properties of the item
                    audio: '', // Add additional properties
                    isRecording: false,
                    isPlaying: false,
                    label: '',
                    Phy_qty_by_user: item.Doc_Qty + ""
                }
            ]);
        }
    };

    const renderTaskListRow = ({ item, index }) => {
        const isSelected = selectedItems.some((selected) => selected.slNo === item.slNo);

        return (
            <View style={styles.rowContainer} key={item.Part_Name}>
                <Text style={[styles.cell, { width: 50 }]}>{index + 1}</Text>
                <Text style={styles.cell}>{item.Part_Name}</Text>
                <Text style={styles.cell}>{item.Brand}</Text>
                <Text style={[styles.cell, { width: 50 }]}>{item.Doc_Qty}</Text>
                <Text style={[styles.cell]}>{item.Part_Number}</Text>

                {
                    listItem?.status == "ACCEPTED" &&

                    < View style={styles.ActionCont}>
                        <TouchableOpacity onPress={() => handleToggle(item)} style={styles.circleContainer}>
                            {isSelected ? (
                                <Image
                                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Check_green_icon.svg/1024px-Check_green_icon.svg.png' }}
                                    style={styles.tickImage}
                                />
                            ) : (
                                <View style={styles.circle} />
                            )}
                        </TouchableOpacity>
                    </View>
                }
            </View >
        );
    };

    const handleInputEditSelectedRow = (text, item, itemPartNumber) => {

        if (text > item.Doc_Qty) {
            Alert.alert("Cannot enter more than Doc Qty")
            return
        }

        let newArray = selectedItems.map((item) => {
            if (item.Part_Number == itemPartNumber) {
                return { ...item, Phy_qty_by_user: text }
            } else {
                return item
            }
        })

        setSelectedItems(newArray)
    }

    const handleInputEditDeliveryListRow = (text, item, Partnumber) => {

        if (text > item.DocQty) {
            Alert.alert("Cannot enter more than Doc Qty")
            return
        }

        let newArray = deliveryDetails.map((item) => {

            // now for testing only partname change to partnumber , here check whether sir given part number in api no only part name coming
            if (item.partname == Partnumber) {
                return { ...item, Phy_qty_by_user: text }
            } else {
                return item
            }
        })

        setDeliveryDetails(newArray)
    }


    const renderSelectedTaskListRow = ({ item, index }) => {

        console.log("listItem renderSelectedTaskListRow", listItem, tabNumber)

        return (
            <View style={styles.rowContainer} key={item.Part_Number}>
                {/* <Text style={[styles.cell, { width: 50 }]}>{item.slNo}</Text> */}
                <Text style={styles.cell}>{item.Part_Number}</Text>
                <Text style={styles.cell}>{item.Brand}</Text>
                <Text style={styles.cell}>{item.Part_Name}</Text>

                <Text style={[styles.cell, { width: 50 }]}>{item.Unit}</Text>
                <Text style={[styles.cell, { width: 50 }]}>{item.Doc_Qty}</Text>


                <TextInput onChangeText={(text) => handleInputEditSelectedRow(text, item, item.Part_Number)} value={item.Phy_qty_by_user}></TextInput>

                <Text style={{ padding: 4, textAlign: "center", width: 70 }}>{item.Doc_Qty - item.Phy_qty_by_user}</Text>

                <View style={styles.LabelCell}>
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedRowId(item.slNo);
                            handleTakePhoto();
                        }}
                    >
                        <Image source={require('../images/cameraTasra.png')} style={{ width: 25, height: 25 }} />
                    </TouchableOpacity>

                    {
                        item.label &&
                        <TouchableOpacity onPress={() => handleImagePreview(item.label)}>
                            <Image source={{ uri: item.label ? item.label : '' }} style={styles.imagePreview} />
                        </TouchableOpacity>
                    }

                </View>

                {/* Image Modal */}
                {showImageModal && (
                    <Modal visible={true} transparent={true} animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.ImagemodalContent}>
                                <Image source={{ uri: previewImage }} style={styles.modalImage} />
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowImageModal(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Camera Modal */}
                {showCamera && (
                    <Modal visible={true} animationType="slide">
                        <View style={{ flex: 1 }}>
                            {device && (
                                <Camera
                                    ref={cameraRef}
                                    style={StyleSheet.absoluteFill}
                                    device={device}
                                    isActive={showCamera}
                                    photo
                                />
                            )}
                            <View style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 32, marginTop: 'auto'
                            }}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={capturePhoto}
                                    disabled={takePhotoLoader}
                                >
                                    {
                                        takePhotoLoader ?
                                            <ActivityIndicator color={'white'} /> :

                                            <Text style={styles.captureButtonText}>Capture</Text>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.CameraCancelButton}
                                    onPress={() => setShowCamera(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}


                <View style={styles.LabelCell}>

                    {
                        item.isRecording ? (
                            <>
                                <FastImage
                                    style={{ width: 50, height: 50 }}
                                    source={require('../images/recWaveTasra.gif')}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                                <TouchableOpacity onPress={() => stopRecording(item.slNo)}>
                                    <Image source={require('../images/stopRecTasra.png')} style={{ width: 25, height: 25 }} />
                                </TouchableOpacity>
                            </>
                        ) : item.isPlaying ? (
                            <>
                                <FastImage
                                    style={{ width: 25, height: 25 }}
                                    source={require('../images/recWaveTasra.gif')} // Your GIF for playing audio
                                    resizeMode={FastImage.resizeMode.contain}
                                />


                                <TouchableOpacity
                                // onPress={() => playAudio(item.audio, item.slNo)}
                                >
                                    <Image source={require('../images/playTasra.png')} style={{ width: 25, height: 25 }} />
                                </TouchableOpacity>
                            </>
                        ) : item.audio ? (
                            <>
                                <TouchableOpacity onPress={() => startRecording(item.slNo)}>
                                    <Image source={require('../images/micTasra.png')} style={{ width: 25, height: 25 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => playAudio(item.audio, item.slNo)}>
                                    <Image source={require('../images/playTasra.png')} style={{ width: 25, height: 25 }} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={() => startRecording(item.slNo)}>
                                <Image source={require('../images/micTasra.png')} style={{ width: 25, height: 25 }} />
                            </TouchableOpacity>
                        )
                    }

                </View>
            </View>
        );
    };

    const renderDeliveryListRow = ({ item, index }) => {

        console.log("listItem renderSelectedTaskListRow", listItem, tabNumber)

        return (
            <View style={styles.rowContainer} key={item.Partnumber}>
                {/* <Text style={[styles.cell, { width: 50 }]}>{item.slNo}</Text> */}
                <Text style={styles.cell}>{item.Partnumber}</Text>
                <Text style={styles.cell}>{item.brand}</Text>
                <Text style={styles.cell}>{item.partname}</Text>

                <Text style={[styles.cell, { width: 50 }]}>{item.Unit}</Text>
                <Text style={[styles.cell, { width: 50 }]}>{item.DocQty}</Text>


                <TextInput keyboardType="numeric" style={{ height: 20, backgroundColor: "#ffffff", borderColor: "#dedede", borderWidth: 1 }} onChangeText={(text) => handleInputEditDeliveryListRow(text, item, item.Partnumber)} value={item.Phy_qty_by_user}></TextInput>

                <Text style={{ padding: 4, textAlign: "center", width: 70 }}>{item.DocQty - item.Phy_qty_by_user}</Text>

                <View style={styles.LabelCell}>
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedRowId(item.slNo);
                            handleTakePhoto();
                        }}
                    >
                        <Image source={require('../images/cameraTasra.png')} style={{ width: 25, height: 25 }} />
                    </TouchableOpacity>

                    {
                        item.label &&
                        <TouchableOpacity onPress={() => handleImagePreview(item.label)}>
                            <Image source={{ uri: item.label ? item.label : '' }} style={styles.imagePreview} />
                        </TouchableOpacity>
                    }

                </View>

                {/* Image Modal */}
                {showImageModal && (
                    <Modal visible={true} transparent={true} animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.ImagemodalContent}>
                                <Image source={{ uri: previewImage }} style={styles.modalImage} />
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowImageModal(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Camera Modal */}
                {showCamera && (
                    <Modal visible={true} animationType="slide">
                        <View style={{ flex: 1 }}>
                            {device && (
                                <Camera
                                    ref={cameraRef}
                                    style={StyleSheet.absoluteFill}
                                    device={device}
                                    isActive={showCamera}
                                    photo
                                />
                            )}
                            <View style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 32, marginTop: 'auto'
                            }}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={capturePhoto}
                                    disabled={takePhotoLoader}
                                >
                                    {
                                        takePhotoLoader ?
                                            <ActivityIndicator color={'white'} /> :

                                            <Text style={styles.captureButtonText}>Capture</Text>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.CameraCancelButton}
                                    onPress={() => setShowCamera(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}



                <TextInput onChangeText={(text) => handleInputComment(text)} value={user_typed_comment_delivery} />


                <View style={styles.LabelCell}>

                    {
                        item.isRecording ? (
                            <>
                                <FastImage
                                    style={{ width: 50, height: 50 }}
                                    source={require('../images/recWaveTasra.gif')}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                                <TouchableOpacity onPress={() => stopRecording(item.slNo)}>
                                    <Image source={require('../images/stopRecTasra.png')} style={{ width: 25, height: 25 }} />
                                </TouchableOpacity>
                            </>
                        ) : item.isPlaying ? (
                            <>
                                <FastImage
                                    style={{ width: 25, height: 25 }}
                                    source={require('../images/recWaveTasra.gif')} // Your GIF for playing audio
                                    resizeMode={FastImage.resizeMode.contain}
                                />


                                <TouchableOpacity
                                // onPress={() => playAudio(item.audio, item.slNo)}
                                >
                                    <Image source={require('../images/playTasra.png')} style={{ width: 25, height: 25 }} />
                                </TouchableOpacity>
                            </>
                        ) : item.audio ? (
                            <>
                                <TouchableOpacity onPress={() => startRecording(item.slNo)}>
                                    <Image source={require('../images/micTasra.png')} style={{ width: 25, height: 25 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => playAudio(item.audio, item.slNo)}>
                                    <Image source={require('../images/playTasra.png')} style={{ width: 25, height: 25 }} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={() => startRecording(item.slNo)}>
                                <Image source={require('../images/micTasra.png')} style={{ width: 25, height: 25 }} />
                            </TouchableOpacity>
                        )
                    }

                </View>
            </View>
        );
    };

    const renderDriverList = ({ item }) => {

        return (
            <View style={styles.driverRow} key={item.SMAN_KEY}>
                <TouchableOpacity onPress={() => {setCurrentChoosenDriver(item.SMAN_KEY); setShowHideDriverList(false)}}>
                    <Text style={styles.cell}>{item.SMAN_name}</Text>
                </TouchableOpacity>

            </View>
        );
    };

    console.log('selectedItems', selectedItems)

    const getTabStyle = (currentTabNumber) => {

        if (currentTabNumber == tabNumber) {
            return {
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: 10,
            }
        } else {
            return {
                backgroundColor: "#f7f7f7",
                color: "#ffffff",
                padding: 10,
            }
        }
    }

    const getTextColor = (currentTabNumber) => {

        if (currentTabNumber == tabNumber) {
            return {
                color: "#ffffff",
            }
        } else {
            return {
                color: "#000000",
            }
        }

    }

    const getSaleDetails = () => {


        const apiurl = `${appUrl}TaskItemList/${cmpCode}/sales/${listItem.primarydoc}/${deptno}/-/-`

        console.log("apiurl getsaledetails++ listItem", apiurl, listItem)

        setcallingSalesDetailsAPI(true)

        axios.get(apiurl).then((res) => {
            console.log("res -> ", res.data)

            setcallingSalesDetailsAPI(false)
            setSalesDetails(res.data)

        }).catch((err) => {
            setcallingSalesDetailsAPI(false)
        })

    }

    const getDeliveryDetails = () => {


        const apiurl = `${appUrl}CRMTaskMainListFilter/TASRA/DELIVERYITEM/-/-/-/${listItem.task_id}/${deptno}/1900-01-01/1900-01-01/-/-/-`

        console.log("apiurl getDeliveryDetails>>>++", apiurl)


        setcallingDeliveryDetailsAPI(true)

        axios.get(apiurl).then((res) => {

            setcallingDeliveryDetailsAPI(false)
            console.log("res -> deliverydetails", res.data)

            let newMappedArray = res.data?.map((item) => {
                return { ...item, Phy_qty_by_user: item.PhyQty + "" }
            })
            setDeliveryDetails(newMappedArray)


        }).catch((err) => {
            setcallingDeliveryDetailsAPI(false)
        })
    }





    useEffect(() => {
        if (appUrl && cmpCode) {
            getSaleDetails()
            getDeliveryDetails()
            getDriverList()
        } else {
            console.log("apiurl getDeliveryDetails else", appUrl, cmpCode)
        }
    }, [appUrl, cmpCode])

    const saveTheSelectedRows = () => {


        

        if (package_type_by_user?.length == 0) {
            Alert.alert("Please select Package type")
            return
        }

        if (package_condition_by_user?.length == 0) {
            Alert.alert("Please select Package condition")
            return
        }

        if (userTypedValues.number_of_packages == "0" || userTypedValues.number_of_packages == 0 || userTypedValues.number_of_packages?.trim() == "") {
            Alert.alert("Please enter number of packages")
            return
        }

        if (selectedItems?.length == 0) {
            Alert.alert("Please choose atleast 1 row")
            return
        }

        if (received_from_typed_by_user?.length == 0) {
            Alert.alert("Please enter text in received from field ")
            return
        }

        let apiurl = `${appUrl}DeliveryApp`

        console.log("apiurl To Save>>++pp [[[", apiurl, listItem)
        console.log("apiurl To Save>>++pp>>", selectedItems)

        let arrayToPass = selectedItems?.map((item) => {

            return {
                cmpcode: cmpCode,
                operation: "STARTED",
                doc_no: listItem.task_id,
                doc_type: "SALES",
                deptno: listItem.Branch,
                user: loginUser,
                packageno: listItem.packageno,
                packagetype: package_type_by_user,
                packagecount: userTypedValues.number_of_packages,
                packagecondition: package_condition_by_user,
                receivedfrom: received_from_typed_by_user,
                handedto: "",
                deliveryto: "",
                partnumber: item.Part_Number,
                brand: item.Brand,
                Docqty: item.Doc_Qty,
                Phyqty: item.Phy_qty_by_user,
                Comments: "",
                imgpath: "",
                vnpath: "",
                signaturepath: ""
            }
        })



        let stringified = JSON.stringify(arrayToPass)

        console.log("arrayToPass saveTheSelectedRows", arrayToPass)


        console.log("arrayToPass stringified saveTheSelectedRows", stringified)




        axios.post(apiurl, stringified, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {

            console.log("res-->++", res.data)
            if (res.data.result == "Saved") {
                Alert.alert("Success")



                navigation.goBack()
            }


        }).catch((err) => {
            console.log("err++", err)
        })
    }

    const acceptTheTask = (status_user_selected) => {


        let apiurl = `${appUrl}DeliveryApp`

        console.log("apiurl To Save>>++", apiurl, listItem, status_user_selected)



        let arrayToPass = [
            {
                cmpcode: cmpCode,
                operation: status_user_selected,
                doc_no: listItem.task_id,
                doc_type: "SALES",
                deptno: listItem.Branch,
                user: loginUser,
                packageno: "",
                packagetype: "",
                packagecount: "",
                packagecondition: "",
                receivedfrom: "",
                handedto: "",
                deliveryto: "",
                partnumber: "",
                brand: "",
                Docqty: "0",
                Phyqty: "0",
                Comments: "",
                imgpath: "",
                vnpath: "",
                signaturepath: ""
            }
        ]



        let stringified = JSON.stringify(arrayToPass)

        console.log("arrayToPass>>++lll", arrayToPass, listItem)





        console.log("arrayToPass stringified >>++>>>>++", stringified)

        axios.post(apiurl, stringified, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {

            console.log("res-->", res.data)
            if (res.data.result == "Saved") {
                Alert.alert("Success")
                setShowRejectPopup(false)

                navigation.goBack()


            }


        }).catch((err) => {
            console.log("err", err)
        })
    }
    const clickedOnAcceptButton = async (item, status_user_selected) => {

        console.log("resultOfDeliveryDetails >>++")

        if (status_user_selected == "REJECTED") {

            setRejectObject(item)

            setShowRejectPopup(true)

        } else {
            acceptTheTask(status_user_selected)
        }


    }

    const save_delivery_items = () => {



        let apiurl = `${appUrl}DeliveryApp`

        console.log("apiurl To Save>>++pp [[[", apiurl)

        let arrayToPass = selectedItems?.map((item) => {

            return {
                cmpcode: cmpCode,
                operation: "STARTED",
                doc_no: listItem.task_id,
                doc_type: "SALES",
                deptno: listItem.Branch,
                user: loginUser,
                packageno: listItem.packageno,
                packagetype: "",
                packagecount: userTypedValues.number_of_packages,
                packagecondition: "",
                receivedfrom: "",
                handedto: "",
                deliveryto: "",
                partnumber: item.Part_Number,
                brand: item.Brand,
                Docqty: item.Doc_Qty,
                Phyqty: item.Phy_qty_by_user,
                Comments: "",
                imgpath: "",
                vnpath: "",
                signaturepath: ""
            }
        })



        let stringified = JSON.stringify(arrayToPass)

        console.log("arrayToPass>>++ppPP", arrayToPass)


        console.log("arrayToPass TO API", stringified)

        axios.post(apiurl, stringified, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {

            console.log("res-->++", res.data)
            if (res.data.result == "Saved") {
                Alert.alert("Success")
                setShowRejectPopup(false)


                if (tabNumber) {
                    if (tabNumber == 1) {
                        fetchPickList("-")
                    } else {
                        fetchPickList("accepted")
                    }
                }
            }


        }).catch((err) => {
            console.log("err++", err)
        })

    }


    const save_delivery_items_last_step = (stage_name) => {

        let apiurl = `${appUrl}DeliveryApp`

        if (stage_name == "HANDEDOVER") {
            if (currentChoosenDriver?.length == 0) {
                Alert.alert("Please select person in handed to field")
                return
            }

        }

        if (stage_name == "DELIVERED") {
            if (user_typed_delivered_to?.length == 0) {
                Alert.alert("Please enter text in delivered to field")
                return
            }

        }


        let arrayToPass = deliveryDetails?.map((item) => {

            return {
                cmpcode: cmpCode,
                operation: stage_name,
                doc_no: listItem.task_id,
                doc_type: "SALES",
                deptno: listItem.Branch,
                user: loginUser,
                packageno: listItem.packageno,
                packagetype: "",
                packagecount: listItem.status == "ACCEPTED" ? userTypedValues.number_of_packages : listItem.packagecount,
                packagecondition: "",
                receivedfrom: listItem.receivedfrom,
                handedto: currentChoosenDriver,
                deliveryto: user_typed_delivered_to,
                partnumber: item.Partnumber,
                brand: item.brand,
                Docqty: item.DocQty,
                Phyqty: stage_name == "HANDEDOVER" ? item.PhyQty : item.Phy_qty_by_user,
                Comments: user_typed_comment_delivery,
                imgpath: "",
                vnpath: "",
                signaturepath: ""
            }
        })


        let stringified = JSON.stringify(arrayToPass)


        console.log("array to pass delivery", arrayToPass)

        console.log("arrayToPass TO API delivery stringified", stringified)



        axios.post(apiurl, stringified, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {

            console.log("res-->++", res.data)
            if (res.data.result == "Saved") {
                Alert.alert("Success")
            }


        }).catch((err) => {
            console.log("err++", err)
        })

    }

    return (
        <ScrollView style={styles.StockCountWrap}>

            <View style={styles.HeadCont}>
                <Text style={styles.TaskListHeadText}>Logistics - Goods Collections & Delivery</Text>
            </View>

            {
                callingDeliveryDetailsAPI &&
                <View style={{ flexDirection: "column", alignItems: "center" }}>
                    <ActivityIndicator></ActivityIndicator>
                    <Text>Loading Data, Please Wait...</Text>

                </View>
            }

            {
                callingSalesDetailsAPI &&
                <View style={{ flexDirection: "column", alignItems: "center" }}>
                    <ActivityIndicator></ActivityIndicator>
                    <Text>Loading Item Details, Please Wait...</Text>

                </View>
            }

            <View style={{ flexDirection: "row", marginTop: 10 }}>
                <View style={[styles.HeadRightBox]}>
                    <Text style={{}}>User</Text>
                    <TextInput value={listItem.Creator} style={{ width: "50%", backgroundColor: "#ffffff", height: 20, marginLeft: 8, }} />
                </View>
                <View style={[styles.HeadRightBox]}>
                    <Text style={{}}>Branch</Text>
                    <TextInput value={listItem.deptno} style={{ width: "50%", backgroundColor: "#ffffff", height: 20, marginLeft: 8 }} />
                </View>

            </View>

            <View style={styles.RadioHeadCont}>

                <TouchableOpacity
                    // onPress={() => setDeliveryToCustomerCheck(!deliveryToCustomerCheck)}
                    style={[styles.RadionButtonWrap, {
                        backgroundColor: 'white',
                        padding: 8,
                        borderRadius: 4
                    }]}
                >
                    <View
                        style={styles.circleContainer}
                    >
                        {deliveryToCustomerCheck ? (
                            <Image
                                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Check_green_icon.svg/1024px-Check_green_icon.svg.png' }}
                                style={styles.tickImage}
                            />
                        ) : (
                            <View style={styles.circle} />
                        )}
                    </View>
                    <Text style={styles.RadioHeadText}>Parts Delivery to customer</Text>
                </TouchableOpacity>

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    width: "100%"
                }}>

                    <View style={[styles.HeadRightBox, { gap: 4 }]}>
                        <Text>Pick From</Text>
                        <TextInput style={{ height: 20, backgroundColor: "#ffffff" }} value={listItem && listItem?.pickfrom} />
                        <TouchableOpacity style={styles.AddLocationButton}>
                            <Image style={styles.AddLocationIcon} source={require('../images/tasraAddLocation.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.HeadRightBox, { gap: 4 }]}>
                        <Text >Deliver To</Text>
                        <TextInput style={{ height: 20, backgroundColor: "#ffffff" }} value={listItem && listItem?.deliverto} />
                        <TouchableOpacity style={styles.AddLocationButton}>
                            <Image style={styles.AddLocationIcon} source={require('../images/tasraAddLocation.png')} />
                        </TouchableOpacity>

                    </View>
                </View>

            </View>

            <View style={styles.TaskDetailTopInpCont}>

                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Primary Doc#</Text>
                    <TextInput style={[styles.input]} value={listItem && listItem?.primarydoc} />
                </View>

                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Doc Date</Text>
                    <TextInput style={styles.input} value={listItem && listItem?.pdocdate} />
                </View>

                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Package#</Text>
                    <TextInput style={styles.input} value={listItem && listItem?.task_id} />

                </View>

            </View>

            <View style={styles.TaskDetailMidInpCont}>

                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Doc Owner</Text>
                    <TextInput style={styles.input} value={listItem && listItem?.sender} />
                </View>
                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Branch</Text>
                    <TextInput style={styles.input} value={listItem && listItem?.Branch} />
                </View>
                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>SKU</Text>
                    <TextInput style={styles.input} value={listItem && listItem?.SKU + ""} />
                </View>

                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Package Type</Text>
                    {/* <TextInput style={styles.input} value={listItem.packagetype} /> */}

                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => {
                            setPackage_type_by_user("Bag")
                        }} style={{ padding: 8, flexDirection: "row" }}>

                            {
                                package_type_by_user?.trim().toUpperCase() == "BAG" ?
                                    <View style={[styles.circle_filled]} />
                                    :
                                    <View style={[styles.circle]} />
                            }

                            <Text style={{ marginLeft: 4 }}>Bag</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setPackage_type_by_user("Carton")
                            }}
                            style={{ padding: 8, flexDirection: "row", marginLeft: 10 }}>

                            {
                                package_type_by_user?.trim().toUpperCase() == "CARTON" ?
                                    <View style={[styles.circle_filled]} />
                                    :
                                    <View style={[styles.circle]} />
                            }
                            <Text style={{ marginLeft: 4 }}>Carton </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setPackage_type_by_user("Pallet")
                            }}
                            style={{ padding: 8, flexDirection: "row", marginLeft: 10 }}>

                            {
                                package_type_by_user?.trim().toUpperCase() == "PALLET" ?
                                    <View style={[styles.circle_filled]} />
                                    :
                                    <View style={[styles.circle]} />
                            }
                            <Text style={{ marginLeft: 4 }}>Pallet </Text>
                        </TouchableOpacity>
                    </View>


                </View>

                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}># of Packages</Text>
                    <TextInput keyboardType="numeric" style={styles.input} onChangeText={(text) => handleInput(text, "number_of_packages")} value={userTypedValues.number_of_packages} />
                </View>

                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Package Condition</Text>
                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => {
                            setPackage_condition_by_user("Good")
                        }} style={{ padding: 8, flexDirection: "row" }}>

                            {
                                package_condition_by_user?.trim().toUpperCase() == "GOOD" ?
                                    <View style={[styles.circle_filled]} />
                                    :
                                    <View style={[styles.circle]} />
                            }

                            <Text style={{ marginLeft: 4 }}>Good</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setPackage_condition_by_user("Pressed")
                            }}
                            style={{ padding: 8, flexDirection: "row", marginLeft: 10 }}>

                            {
                                package_condition_by_user?.trim().toUpperCase() == "PRESSED" ?
                                    <View style={[styles.circle_filled]} />
                                    :
                                    <View style={[styles.circle]} />
                            }
                            <Text style={{ marginLeft: 4 }}>Pressed </Text>
                        </TouchableOpacity>
                    </View>
                </View>


            </View>

            <View style={styles.TaskDetailBottInpCont}>

                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Party</Text>
                    <TextInput style={[styles.input,
                        // { width: '100%' }
                    ]} value={listItem.To} />
                </View>
                <View style={[styles.TaskViewBox, {
                    width: "100%"
                }]}>
                    <Text style={styles.label}>Received From</Text>
                    <TextInput style={[styles.input,
                        // { width: '100%' }
                    ]} value={received_from_typed_by_user} onChangeText={(text) => handleInputReceivedFrom(text)} />
                </View>

                {
                    listItem.status != "" && listItem.status != "ACCEPTED" &&

                    <>
                        <View style={[styles.TaskViewBox, {
                            width: "100%"
                        }]}>
                            <Text style={[styles.label, { marginTop: 5 }]}>Handed To</Text>

                            <View style={{ padding: 5 }}>
                                <View style={{ flexDirection: "row", padding: 4 }}>

                                    {
                                        (currentChoosenDriver == null || currentChoosenDriver == "") ?
                                            <Text>Not Selected</Text>
                                            :
                                            <Text>{
                                                driverList?.filter((item) => {
                                                    return item.SMAN_KEY == currentChoosenDriver
                                                })[0].SMAN_name
                                            }</Text>
                                    }


                                    <TouchableOpacity style={{ padding: 4, backgroundColor: "#f00", marginLeft: 12 }} onPress={() => setShowHideDriverList(prev => !prev)}><Text style={{ color: "#ffffff" }}>Select</Text></TouchableOpacity>

                                </View>
                                {
                                    driverList && showHideDriverList &&
                                    <FlatList
                                        nestedScrollEnabled={true}
                                        style={{ height: 100 }}
                                        data={driverList}
                                        renderItem={renderDriverList}
                                        keyExtractor={(item) => item.SMAN_KEY}
                                    />
                                }
                            </View>



                        </View>
                        <View style={[styles.TaskViewBox, {
                            width: "100%"
                        }]}>
                            <Text style={styles.label}>Delivered To</Text>
                            <TextInput style={styles.input} onChangeText={(text)=>handleUserTypedDeliveredTo(text)} value={user_typed_delivered_to} />

                        </View>
                    </>
                }


            </View>



            <View style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: "100%",
                marginTop: 20
            }}>
                <View style={{ flexDirection: "row", borderBottomWidth: 1 }}>
                    <TouchableOpacity style={getTabStyle(1)} onPress={() => { setTabNumber(1); console.log("button 1 clicked") }}><Text style={getTextColor(1)}>Document</Text></TouchableOpacity>
                    <TouchableOpacity style={getTabStyle(2)} onPress={() => { setTabNumber(2); console.log("button 2 clicked") }}><Text style={getTextColor(2)}>Physical IN/OUT</Text></TouchableOpacity>
                </View>
                {
                    tabNumber == 1 &&
                    <ScrollView horizontal style={styles.TaskListContainer}>

                        <ScrollView nestedScrollEnabled style={{
                            // height: '100%',
                            // marginBottom: 200
                        }}>
                            <View>
                                <View style={styles.headerContainer}>
                                    <Text style={[styles.headerCell, { width: 50 }]}>SlNo</Text>
                                    <Text style={styles.headerCell}>PART NAME</Text>
                                    <Text style={styles.headerCell}>BRAND</Text>
                                    <Text style={[styles.headerCell, { width: 50 }]}>DOC QTY</Text>
                                    <Text style={[styles.headerCell]}>PART NUMBER</Text>
                                    {
                                        listItem.status == "ACCEPTED" &&
                                        <Text style={styles.headerCell}>SELECT</Text>
                                    }

                                </View>

                                {/* Table Data */}
                                <FlatList
                                    data={salesDetails}
                                    renderItem={renderTaskListRow}
                                    keyExtractor={(item) => item.Part_Number}
                                />
                            </View>
                        </ScrollView>
                    </ScrollView>
                }


                {
                    listItem?.status == "ACCEPTED" && tabNumber == 2 &&
                    <ScrollView horizontal style={styles.TaskListContainer}>

                        <ScrollView nestedScrollEnabled style={{
                            // height: '100%',
                            // marginBottom: 200
                        }}>
                            <View>
                                <View style={styles.headerContainer}>

                                    <Text style={styles.headerCell}>PART NUMBER</Text>
                                    <Text style={styles.headerCell}>BRAND</Text>
                                    <Text style={styles.headerCell}>PART NAME</Text>
                                    <Text style={[styles.headerCell, { width: 50 }]}>UNIT</Text>
                                    <Text style={[styles.headerCell, { width: 50 }]}>DOC QTY</Text>

                                    <Text style={[styles.headerCell, { width: 50 }]}>PHY QTY</Text>
                                    <Text style={[styles.headerCell, { width: 70 }]}>Variation</Text>
                                    <Text style={styles.headerCell}>Image</Text>
                                    <Text style={styles.headerCell}>Comment</Text>

                                </View>

                                {/* Table Data */}
                                <FlatList
                                    data={selectedItems && selectedItems}
                                    renderItem={renderSelectedTaskListRow}
                                    keyExtractor={(item) => item.Part_Number}
                                />
                            </View>
                        </ScrollView>
                    </ScrollView>
                }

                {
                    listItem?.status == "STARTED" && tabNumber == 2 &&
                    <ScrollView horizontal style={styles.TaskListContainer}>

                        <ScrollView nestedScrollEnabled style={{
                            // height: '100%',
                            // marginBottom: 200
                        }}>
                            <View>
                                <View style={styles.headerContainer}>

                                    <Text style={styles.headerCell}>PART NUMBER</Text>
                                    <Text style={styles.headerCell}>BRAND</Text>
                                    <Text style={styles.headerCell}>PART NAME</Text>
                                    <Text style={[styles.headerCell, { width: 50 }]}>UNIT</Text>
                                    <Text style={[styles.headerCell, { width: 50 }]}>DOC QTY</Text>

                                    <Text style={[styles.headerCell, { width: 50 }]}>PHY QTY</Text>
                                    <Text style={[styles.headerCell, { width: 70 }]}>Variation</Text>
                                    <Text style={styles.headerCell}>Image</Text>
                                    <Text style={styles.headerCell}>Comment</Text>
                                    <Text style={styles.headerCell}>Voice</Text>

                                </View>

                                {/* Table Data */}
                                <FlatList
                                    data={deliveryDetails && deliveryDetails}
                                    renderItem={renderDeliveryListRow}
                                    keyExtractor={(item) => item.partname}
                                />
                            </View>
                        </ScrollView>
                    </ScrollView>
                }

                {
                    listItem?.status == "DELIVERED" && tabNumber == 2 &&
                    <ScrollView horizontal style={styles.TaskListContainer}>

                        <ScrollView nestedScrollEnabled style={{
                            // height: '100%',
                            // marginBottom: 200
                        }}>
                            <View>
                                <View style={styles.headerContainer}>

                                    <Text style={styles.headerCell}>PART NUMBER</Text>
                                    <Text style={styles.headerCell}>BRAND</Text>
                                    <Text style={styles.headerCell}>PART NAME</Text>
                                    <Text style={[styles.headerCell, { width: 50 }]}>UNIT</Text>
                                    <Text style={[styles.headerCell, { width: 50 }]}>DOC QTY</Text>

                                    <Text style={[styles.headerCell, { width: 50 }]}>PHY QTY</Text>
                                    <Text style={[styles.headerCell, { width: 70 }]}>Variation</Text>
                                    <Text style={styles.headerCell}>Image</Text>
                                    <Text style={styles.headerCell}>Comment</Text>
                                    <Text style={styles.headerCell}>Voice</Text>

                                </View>

                                {/* Table Data */}
                                <FlatList
                                    data={deliveryDetails && deliveryDetails}
                                    renderItem={renderDeliveryListRow}
                                    keyExtractor={(item) => item.partname}
                                />
                            </View>
                        </ScrollView>
                    </ScrollView>
                }




            </View>

            {
                listItem?.status == "" &&

                <View style={[styles.buttonRow,
                    // { marginVertical: 12 }
                ]}>

                    <TouchableOpacity style={[styles.TaskCompleteButton, { width: '50%' }]}
                        onPress={() => clickedOnAcceptButton(listItem, "ACCEPTED")}
                    // disabled={updateLoader}
                    >
                        <Text style={{ color: "#ffffff", fontSize: 18 }}>Accept</Text>
                    </TouchableOpacity>

                </View>
            }

            {
                listItem?.status == "ACCEPTED" &&

                <View style={[styles.buttonRow,
                    // { marginVertical: 12 }
                ]}>

                    <TouchableOpacity style={[styles.TaskCompleteButton, { width: '50%' }]}
                        onPress={() => saveTheSelectedRows()}
                    // disabled={updateLoader}
                    >
                        <Text style={{ color: "#ffffff", fontSize: 18 }}>SAVE</Text>
                    </TouchableOpacity>

                </View>
            }

            {
                listItem?.status == "STARTED" &&

                <View style={[styles.buttonRow,
                    // { marginVertical: 12 }
                ]}>

                    <TouchableOpacity style={[styles.TaskCompleteButton, { width: '40%' }]}
                        onPress={() => save_delivery_items_last_step("HANDEDOVER")}
                    // disabled={updateLoader}
                    >
                        <Text style={{ color: "#ffffff", fontSize: 16 }}>HANDED OVER</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.TaskCompleteButton, { width: '40%', marginLeft: 10 }]}
                        onPress={() => save_delivery_items_last_step("DELIVERED")}
                    // disabled={updateLoader}
                    >
                        <Text style={{ color: "#ffffff", fontSize: 16 }}>DELIVERED</Text>
                    </TouchableOpacity>

                </View>
            }


        </ScrollView>
    )
}

const styles = StyleSheet.create({
    StockCountWrap: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9f9f9',
        padding: 16,
        height: Dimensions.get('window').height
    },

    HeadCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: 'orange',
        borderBottomWidth: 1,
        paddingBottom: 8
        // paddingVertical: 8
    },

    HeadRightCont: {
        width: '50%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: "space-between"
    },

    HeadRightBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: "center"
    },

    TaskListHeadText: {
        fontFamily: 'Lexend-Bold',
        fontSize: 16,
    },

    label: {
        fontSize: 12,
        // fontWeight: 'bold',
        fontFamily: 'Lexend-Regular',
        // marginBottom: 4,
        width: "40%"
    },

    RadioHeadCont: {
        width: '100%',
        display: 'flex',
        marginVertical: 8
        // gap: 12,
        // paddingVertical: 12
    },

    RadioHeadBoxes: {
        // width: '48%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8
    },

    RadioHeadText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 10
    },


    input: {
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 0,
        backgroundColor: '#fff',
        height: 20,
        width: '100%'

    },

    TaskDetailTopInpCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: "wrap",
        alignItems: 'center',

        width: "100%",

        marginTop: 1
    },

    TaskDetailMidInpCont: {
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'space-between',
        flexWrap: "wrap",
        // justifyContent: 'center',
        alignItems: 'center',
        // paddingHorizontal: 120,

        width: "100%",

        marginBottom: 0
    },

    TaskDetailBottInpCont: {
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

        width: "100%",

    },

    TaskViewBox: {
        display: 'flex',
        flexDirection: 'row',
        // alignItems: 'center',

    },

    TaskCameraIcon: {
        width: 30,
        height: 30,
    },

    TableAboveHeaderCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12
    },

    TableAboveHeadBox: {
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 8
    },

    TableAboveHeadText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 13
    },


    TaskListContainer: {
        width: '100%',
        height: 350,
        backgroundColor: '#f9f9f9',
        // padding: 10,

        // overflow: 'scroll',

        elevation: 5,
        borderRadius: 8,

        marginBottom: 25,
        margin: 8
    },
    headerContainer: {
        flexDirection: 'row',
        // backgroundColor: '#007BFF',
        // backgroundColor: '#908CEE',
        backgroundColor: '#dedede',
        paddingVertical: 10,
        // paddingHorizontal: 5,
    },
    headerCell: {
        fontFamily: 'Lexend-Bold',
        fontSize: 12,
        color: '#fff',
        color: 'black',
        width: 120,
        textAlign: 'center',
        padding: 5,

    },

    rowContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    driverRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: "#dedede"
    },
    cell: {
        width: 120,
        textAlign: 'center',
        padding: 5,
        fontSize: 12,
        fontFamily: 'Lexend-Light',
        color: "#000000"
    },


    circleContainer: {
        width: 24,
        height: 24,
    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#fff',
    },
    circle_filled: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#FFA500',
    },
    tickImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },

    ActionCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: 120
        // alignItems: 'center',
        // padding: 5,
        // gap: 12,
        // width: 160
    },

    LabelCell: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        width: 120,
    },


    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    logoutButton: {
        backgroundColor: '#FF5C5C',
    },
    cancelButton: {
        backgroundColor: '#909090',
    },
    // buttonText: {
    //     color: 'white',
    //     fontSize: 16,
    // },

    imagePreview: {
        width: 30,
        height: 30,
        borderRadius: 50,
    },

    captureButton: {
        // position: 'absolute',
        // bottom: 50,
        // left: '50%',
        // transform: [{ translateX: -50 }],
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#FF5C5C',
        borderRadius: 5,
    },
    captureButtonText: {
        color: 'white',
        fontSize: 16,
    },
    cancelButton: {
        // position: 'absolute',
        // bottom: 20,
        // left: '50%',
        // transform: [{ translateX: -50 }],
        // paddingVertical: 10,
        // paddingHorizontal: 20,
        backgroundColor: '#909090',
        borderRadius: 5,
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
    },

    CameraCancelButton: {
        // position: 'absolute',
        // bottom: 20,
        // left: '50%',
        // transform: [{ translateX: -50 }],
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#909090',
        borderRadius: 5,
    },

    ImagemodalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        width: '80%',
    },

    modalImage: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
    },

    closeButton: {
        backgroundColor: '#ff4040',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    ErrorView: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: "center"
    },

    ErrorText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 14,
        color: 'red'
    },

    CloseView: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },

    CloseIcon: {
        width: 25,
        height: 25
    },

    buttonRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        paddingBottom: 50
    },
    button: {
        // backgroundColor: '#007BFF',
        backgroundColor: '#908CEE',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        // flex: 1,
        marginHorizontal: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Lexend-Regular'
    },

    TaskCompleteButton: {
        backgroundColor: '#1A6CF6',
        borderRadius: 4,
        padding: 8,
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "center"
    },
    GoodsDataCont: {
        width: "100%",
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    GoodLeftDataCont: {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        padding: 12
    },

    GoodsHeadCont: {
        width: '45%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },

    GoodsHeadText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 14,
        color: 'red'
    },

    GoodsText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 14,
    },

    RadioBottomCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12
    },

    RadionButtonWrap: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },

    AddLocationButton: {
        padding: 4,
        borderRadius: 50,
        borderColor: 'grey',
        borderWidth: 0.5
    },

    AddLocationIcon: {
        width: 30,
        height: 30
    },


})

export default GoodsCollectionDelivery