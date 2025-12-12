import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert, Image, ActivityIndicator, Pressable, Modal, Button } from 'react-native'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import HeaderUiNew from './HeaderUiNew'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ToastManager, { Toast } from 'toastify-react-native'
import RadioGroup from 'react-native-radio-buttons-group';
import { useNavigation } from '@react-navigation/native';
import { format, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale'
import { differenceInSeconds, parseISO, isAfter } from 'date-fns';
import Icon from 'react-native-vector-icons/FontAwesome';
import SignatureScreen from 'react-native-signature-canvas';

import { Camera, useCameraDevice } from 'react-native-vision-camera';

const GoodsCollectionDeliveryPoolList = ({ fetchMyPickListLength, showAcceptDetailsPopItem }) => {


    const [takePhotoLoader, setTakePhotoLoader] = useState(false)
    const cameraRef = useRef(null);
    const [imageFileObjectTaken, setImageFileObjectTaken] = useState(null)
    const [showCamera, setShowCamera] = useState(false);

    const device = useCameraDevice('back');

    const signatureRef = useRef(null);

    const handleSignature = (signature) => {
        // ✅ Base64 signature
        console.log('Signature base64:', signature);

        Alert.alert('Signature Captured');

        // ✅ Manually clear only after saving
        signatureRef.current.clearSignature();
    };

    const handleClear = () => {
        signatureRef.current.clearSignature();
    };

    const handleEmpty = () => {
        Alert.alert('No Signature', 'Please draw something first.');
    };

    // ✅ JavaScript to fix first-stroke bug when autoClear is false
    const injectedJS = `
    setTimeout(() => {
      if (window.signaturePad) {
        window.signaturePad.clear();
      }
    }, 300);
    true;
  `;

    const [showHideDeliveredToBox, setShowHideDeliveredToBox] = useState(false)
    const [currentListItemToSave, setCurrentListItemToSave] = useState(null)
    const [user_typed_delivered_to, setUser_typed_delivered_to] = useState("")
    const [user_typed_comment_delivery, setUser_typed_comment_delivery] = useState("")
    const [driverList, setDriverList] = useState(null)
    const [showHideDriverList, setShowHideDriverList] = useState(false)
    const [currentChoosenDriver, setCurrentChoosenDriver] = useState(null)

    const [countOfHeaders, setCountOfHeaders] = useState(null)
    const [reason_To_Reject, setReasonToReject] = useState(0)
    const [reason_To_Reject_text, setReasonToRejectText] = useState("")
    const [rejectClicked, setRejectClicked] = useState(false)
    const [currentObjectToReject, setCurrentObjectToReject] = useState(null)

    const calculatePDDTimer = (taskDateFromList) => {
        const targetDate = parseISO(taskDateFromList);
        const now = new Date();

        // Get absolute difference in total seconds
        const totalSeconds = Math.abs(differenceInSeconds(now, targetDate));

        // Convert to hh:mm:ss format
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');

        const formattedDiff = `${hours}:${minutes}:${seconds}`;

        console.log("formattedDiff " + formattedDiff);

        return formattedDiff

    }

    const [isThick, setIsThick] = useState(false);

    // Converts HH:mm:ss string to total seconds
    const parseTimeString = (timeStr) => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    // Converts total seconds back to HH:mm:ss format
    const formatTime = (totalSeconds) => {
        const days = Math.floor(totalSeconds / 86400); // 1 day = 86400 seconds
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');

        return days > 0
            ? `${days}d ${hoursStr}:${minutesStr}:${secondsStr}`
            : `${hoursStr}:${minutesStr}:${secondsStr}`;
    };


    const [elapsedSeconds, setElapsedSeconds] = useState(parseTimeString("00:00:00"));
    const intervalRef = useRef(null);

    const [rejectComment, setRejectComment] = useState("")
    const [showRejectPopup, setShowRejectPopup] = useState(false)
    const [rejectObject, setRejectObject] = useState(null)
    const [tabNumber, setTabNumber] = useState(1)
    const navigation = useNavigation()
    const [switchValues, setSwitchValues] = useState({})

    const [cmpCode, setCmpCode] = useState('')

    const [appUrl, setAppUrl] = useState('')

    const [deptno, setDeptno] = useState('')

    const [loginUser, setLoginUser] = useState('')

    const [pickData, setPickData] = useState('')

    const [pickListDetails, setPickListDetails] = useState('')

    const [error, setError] = useState('')

    const [acceptError, setAcceptError] = useState('')

    const [inputValues, setInputValues] = useState({});

    const [showLoader, setShowLoader] = useState(false)

    const handleInputChange = (code, so_qty, text) => {
        const numericText = text.replace(/[^0-9.]/g, ''); // This removes any non-numeric characters

        if (numericText > so_qty) {
            Alert.alert("Pick Qty exceeed SO Qty.")
            return
        }
        setInputValues({
            ...inputValues,
            [code]: numericText
        });
    };

    const handleInputChangeReturn = (text) => {

        console.log("text entered", text)

        setRejectComment(text)
    }

    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy hh:mm a');
    }

    useEffect(() => {
        console.log("inputValues", inputValues)
    }, [inputValues])

    // useEffect(() => {
    //     console.log("elapsedSeconds ", elapsedSeconds)
    // }, [elapsedSeconds])

    const fetchAppUrl = async () => {
        const appUrl = await AsyncStorage.getItem('appUrl')

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

    const fetchCountOfHeaderModes = async () => {


        const loginUserName = await AsyncStorage.getItem('loginUserName')

        let apiUrLDeleivered = `${appUrl}CpaysCount/TASRA/DELCOUNT/${loginUserName}/DELIVERED`

        console.log("apiUrLDeleivered", apiUrLDeleivered)

        const responseDelivered = await axios.get(apiUrLDeleivered)


        let apiUrLOpen = `${appUrl}CpaysCount/TASRA/DELCOUNT/${loginUserName}/-`

        console.log("apiUrLOpen", apiUrLOpen)

        const responseOpen = await axios.get(apiUrLOpen)


        let apiUrLAccepted = `${appUrl}CpaysCount/TASRA/DELCOUNT/${loginUserName}/accepted`
        const responseAccepted = await axios.get(apiUrLAccepted)



        let apiUrLStarted = `${appUrl}CpaysCount/TASRA/DELCOUNT/${loginUserName}/started`
        const responseStarted = await axios.get(apiUrLStarted)


        let apiUrLRejected = `${appUrl}CpaysCount/TASRA/DELCOUNT/${loginUserName}/rejected`
        const responseRejected = await axios.get(apiUrLRejected)



        let apiUrLEscalated = `${appUrl}CpaysCount/TASRA/DELCOUNT/${loginUserName}/escalated`
        const responseEscalated = await axios.get(apiUrLEscalated)

        console.log("responseDelivered", responseDelivered.data[0]?.cnt)

        setCountOfHeaders(
            {
                open_count: responseOpen.data?.length > 0 ? responseOpen.data[0]?.cnt : "0",
                delivered_count: responseDelivered.data?.length > 0 ? responseDelivered.data[0]?.cnt : "0",
                accepted_count: responseAccepted.data?.length > 0 ? responseAccepted.data[0]?.cnt : "0",
                started_count: responseStarted.data?.length > 0 ? responseStarted.data[0]?.cnt : "0",
                rejected_count: responseRejected.data?.length > 0 ? responseRejected.data[0]?.cnt : "0",
                escalated_count: responseEscalated.data?.length > 0 ? responseEscalated.data[0]?.cnt : "0",

            })


    }

    const radioButtons = useMemo(() => ([
        {
            id: true,
            label: 'yes',
            value: true,
            labelStyle: styles.radioButtonText
        },
        {
            id: false,
            label: 'no',
            value: false,
            labelStyle: styles.radioButtonText
        },
    ]), []);

    const fetchPickList = async (typeofList) => {

        setShowLoader(true)
        try {

            let apiUrl = `${appUrl}CRMTaskMainListFilter/${cmpCode}/DELIVERYTASK/${loginUser}/-/-/-/-/1900-01-01/1900-01-01/-/-/${typeofList}`

            console.log("goodcollectionurl", apiUrl)
            const response = await axios.get(apiUrl)


            setPickData(response.data)
            setShowLoader(false)

        } catch (error) {
            console.log('fetchPickListError', error)
            setError('Some Error Occured')
            setShowLoader(false)

        }
    }

    const fetchPickListDetail = async (sono) => {
        try {
            console.log(`${appUrl}Sales_Order/${cmpCode}/STARTED_PICKING_ITEM/-/${deptno}/${sono}`)
            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/STARTED_PICKING_ITEM/-/${deptno}/${sono}`)
            setPickListDetails(response.data)

            let arrayOfCodeWithPickedQuantity = response.data.map((item) => {
                return { code: [item.Code], pqty: item.Pick_Qty }
            })

            console.log("arrayOfCodeWithPickedQuantity-->", arrayOfCodeWithPickedQuantity)

            let spreaded = arrayOfCodeWithPickedQuantity.reduce((acc, curr) => {
                return { ...acc, [curr.code]: "" + curr.pqty }

            }, {})
            console.log("arrayOfCodeWithPickedQuantity--> spread", spreaded)

            setInputValues(spreaded)


        } catch (error) {
            console.log('fetchPickListDetailError', error)
            setError('Some Error Occured')
        }
    }



    const showSaveSuccess = () => {
        Toast.success(`Successfully Saved`)
    }
    const showDraftSuccess = () => {
        Toast.success(`Successfully Saved Draft`)
    }
    const showSaveError = () => {
        Toast.error(`Some Error Occured`)
    }
    const showDraftError = () => {
        Toast.error(`Some Error Occured`)
    }

    const showAcceptSuccess = () => {
        Toast.success(`Successfully Accepted`)
    }
    const showAcceptError = () => {
        Toast.error(`Some Error Occured`)
    }

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

    const clickedOnRejectInPopup = () => {

        console.log("rejectComment>>++", rejectComment)

        if (rejectComment) {
            if (rejectComment.trim().length == 0) {
                Alert.alert("Please enter comment")
            } else {
                acceptTheTask(rejectObject, "REJECTED")
            }
        } else {
            Alert.alert("Please enter comment")
        }

    }


    useEffect(() => {
        if (appUrl && cmpCode) {
            if (tabNumber == 1) {
                fetchPickList("-")
            } else if (tabNumber == 2) {
                fetchPickList("accepted")
            } else if (tabNumber == 3) {
                fetchPickList("started")
            } else if (tabNumber == 4) {
                fetchPickList("delivered")
            }
            else if (tabNumber == 5) {
                fetchPickList("rejected")
            }
            else if (tabNumber == 6) {
                fetchPickList("escalated")
            }


            fetchCountOfHeaderModes()
        }
    }, [appUrl, cmpCode])

    useEffect(() => {
        fetchAppUrl()



        intervalRef.current = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
            setIsThick((prev) => !prev);
        }, 1000);

        return () => clearInterval(intervalRef.current); // Cleanup on unmount

    }, [])

    console.log('pickData', pickData)
    console.log('pickListDetails', pickListDetails)
    // console.log('deptno', deptno)

    const handleSwitchChange = (code, value, pck_qty) => {
        setSwitchValues(prevValues => ({
            ...prevValues,
            [code]: value,
        }));

        if (value) {
            setInputValues(prevValues => ({
                ...prevValues,
                [code]: pck_qty,
            }));
        } else {
            setInputValues(prevValues => {
                const updatedValues = { ...prevValues };
                delete updatedValues[code];
                return updatedValues;
            });
        }

    };







    useEffect(() => {

        if (tabNumber) {
            console.log("tabnumber ", tabNumber)
            if (tabNumber == 1) {
                fetchPickList("-")
            } else if (tabNumber == 2) {
                fetchPickList("accepted")
            } else if (tabNumber == 3) {
                fetchPickList("started")
                getDriverList()
            } else if (tabNumber == 4) {
                fetchPickList("delivered")
            } else if (tabNumber == 5) {
                fetchPickList("rejected")
            } else if (tabNumber == 6) {
                fetchPickList("escalated")
            }
        }
    }, [tabNumber])


    const acceptTheTask = (item) => {

        let apiurl = `${appUrl}DeliveryApp`

        let arrayToPass = [
            {
                cmpcode: cmpCode,
                operation: "ACCEPTED",
                doc_no: item.task_id,
                doc_type: "SALES",
                deptno: item.Branch,
                user: loginUser,
                packageno: item.packageno ? item.packageno : "0",
                packagetype: item.package_type_by_user ? item.package_type_by_user : "",
                packagecount: item.number_of_packages ? item.number_of_packages : "0",
                packagecondition: item.packagecondition ? item.packagecondition : "",
                receivedfrom: item.receivedfrom ? item.receivedfrom : "",
                handedto: "",
                deliveryto: "",
                partnumber: item.Part_Number ? item.Part_Number : "",
                brand: item.Brand ? item.Brand : "",
                Docqty: item.Doc_Qty ? item.Doc_Qty : "0",
                Phyqty: item.Phy_qty_by_user ? item.Phy_qty_by_user : "0",
                Comments: "",
                imgpath: "",
                vnpath: "",
                signaturepath: ""
            }
        ]

        let stringified = JSON.stringify(arrayToPass)

        console.log("arrayToPass >>>", arrayToPass)


        console.log("arrayToPass stringified >>>>", stringified)


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


    const rejectTheTask = () => {

        let item = currentObjectToReject

        let apiurl = `${appUrl}DeliveryApp`

        let arrayToPass = [
            {
                cmpcode: cmpCode,
                operation: "REJECTED",
                doc_no: item.task_id,
                doc_type: "SALES",
                deptno: item.Branch,
                user: loginUser,
                packageno: item.packageno ? item.packageno : "0",
                packagetype: item.package_type_by_user ? item.package_type_by_user : "",
                packagecount: item.number_of_packages ? item.number_of_packages : "0",
                packagecondition: item.packagecondition ? item.packagecondition : "",
                receivedfrom: item.receivedfrom ? item.receivedfrom : "",
                handedto: "",
                deliveryto: "",
                partnumber: item.Part_Number ? item.Part_Number : "",
                brand: item.Brand ? item.Brand : "",
                Docqty: item.Doc_Qty ? item.Doc_Qty : "0",
                Phyqty: item.Phy_qty_by_user ? item.Phy_qty_by_user : "0",
                Comments: reason_To_Reject_text,
                imgpath: "",
                vnpath: "",
                signaturepath: ""
            }
        ]

        let stringified = JSON.stringify(arrayToPass)

        console.log("arrayToPass >>>", arrayToPass)


        console.log("arrayToPass stringified reject >>>>", stringified)


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

    const changeTaskStatusCommmonMethod = (item, status_name) => {

        let apiurl = `${appUrl}DeliveryApp`

        let arrayToPass = [
            {
                cmpcode: cmpCode,
                operation: status_name,
                doc_no: item.task_id,
                doc_type: "SALES",
                deptno: item.Branch,
                user: loginUser,
                packageno: item.packageno ? item.packageno : "0",
                packagetype: item.package_type_by_user ? item.package_type_by_user : "",
                packagecount: item.number_of_packages ? item.number_of_packages : "0",
                packagecondition: item.packagecondition ? item.packagecondition : "",
                receivedfrom: item.receivedfrom ? item.receivedfrom : "",
                handedto: "",
                deliveryto: "",
                partnumber: item.Part_Number ? item.Part_Number : "",
                brand: item.Brand ? item.Brand : "",
                Docqty: item.Doc_Qty ? item.Doc_Qty : "0",
                Phyqty: item.Phy_qty_by_user ? item.Phy_qty_by_user : "0",
                Comments: "",
                imgpath: "",
                vnpath: "",
                signaturepath: ""
            }
        ]

        let stringified = JSON.stringify(arrayToPass)

        console.log("arrayToPass >>>", arrayToPass)


        console.log("arrayToPass stringified >>>>", stringified)


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

    const renderDriverList = ({ item }) => {

        return (
            <View style={styles.driverRow} key={item.SMAN_KEY}>
                <TouchableOpacity onPress={() => { setCurrentChoosenDriver(item.SMAN_KEY) }}>
                    <Text style={currentChoosenDriver == item.SMAN_KEY ? styles.listItemSelected : styles.listItem}>{item.SMAN_name}</Text>
                </TouchableOpacity>

            </View>
        );
    };


    const getDeliveryDetails = async (listItem) => {


        const apiurl = `${appUrl}CRMTaskMainListFilter/TASRA/DELIVERYITEM/-/-/-/${listItem.task_id}/${listItem.Branch?.trim()}/1900-01-01/1900-01-01/-/-/-`

        console.log("apiurl getDeliveryDetails>>>++", apiurl)




        return axios.get(apiurl).then((res) => {


            console.log("res -> deliverydetails", res.data)

            let newMappedArray = res.data?.map((item) => {
                return { ...item, Phy_qty_by_user: item.PhyQty + "" }
            })
            return (newMappedArray)


        }).catch((err) => {
            return []
        })
    }

    const save_delivery_items_last_step = async (listItem, stage_name) => {

        console.log("resultOfDeliveryList")

        let apiurl = `${appUrl}DeliveryApp`

        let resultOfDeliveryList = await getDeliveryDetails(listItem)

        console.log("resultOfDeliveryList", resultOfDeliveryList)


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


        let arrayToPass = resultOfDeliveryList?.map((item) => {

            return {
                cmpcode: cmpCode,
                operation: stage_name,
                doc_no: listItem.task_id,
                doc_type: "SALES",
                deptno: listItem.Branch,
                user: loginUser,
                packageno: listItem.packageno,
                packagetype: "",
                packagecount: listItem.packagecount,
                packagecondition: "",
                receivedfrom: listItem.receivedfrom,
                handedto: currentChoosenDriver,
                deliveryto: user_typed_delivered_to,
                partnumber: item.Partnumber,
                brand: item.brand,
                Docqty: item.DocQty,
                Phyqty: item.PhyQty, //earlier like this  stage_name == "HANDEDOVER" ? item.PhyQty : item.Phy_qty_by_user,
                Comments: user_typed_comment_delivery,
                imgpath: "",
                vnpath: "",
                signaturepath: ""
            }
        })



        let stringified = JSON.stringify(arrayToPass)


        console.log("array to pass delivery--->>", arrayToPass)

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

    const callPreviousDayAPI = async () => {

        const yesterday = subDays(new Date(), 1);
        const formattedYesterday = format(yesterday, 'yyyy-MM-dd');

        let typeofList = "-"

        if (appUrl && cmpCode) {
            if (tabNumber == 1) {
                typeofList = "-"
            } else if (tabNumber == 2) {
                typeofList = "accepted"
            } else if (tabNumber == 3) {
                typeofList = "started"
            } else if (tabNumber == 4) {
                typeofList = "delivered"
            }

        }

        setShowLoader(true)
        try {

            let apiUrl = `${appUrl}CRMTaskMainListFilter/${cmpCode}/DELIVERYTASK/${loginUser}/-/-/-/-/${formattedYesterday}/1900-01-01/-/-/${typeofList}`

            console.log("goodcollectionurl", apiUrl)
            const response = await axios.get(apiUrl)

            console.log("response.data----->>>", response.data)

            setPickData(response.data)
            setShowLoader(false)

        } catch (error) {
            console.log('fetchPickListError', error)
            setError('Some Error Occured')
            setShowLoader(false)

        }
    }

    const callNextDayAPI = async () => {

        const nextDay = addDays(new Date(), 1);
        const formattedNextDay = format(nextDay, 'yyyy-MM-dd');

        let typeofList = "-"

        if (appUrl && cmpCode) {
            if (tabNumber == 1) {
                typeofList = "-"
            } else if (tabNumber == 2) {
                typeofList = "accepted"
            } else if (tabNumber == 3) {
                typeofList = "started"
            } else if (tabNumber == 4) {
                typeofList = "delivered"
            }

        }

        setShowLoader(true)
        try {

            let apiUrl = `${appUrl}CRMTaskMainListFilter/${cmpCode}/DELIVERYTASK/${loginUser}/-/-/-/-/1900-01-01/${formattedNextDay}/-/-/${typeofList}`

            console.log("goodcollectionurl----->>>+++>>", apiUrl)
            const response = await axios.get(apiUrl)
            console.log("response.data----->>>+++>>", response.data)

            setPickData(response.data)
            setShowLoader(false)

        } catch (error) {
            console.log('fetchPickListError', error)
            setError('Some Error Occured')
            setShowLoader(false)

        }
    }


    const reasonToReject = (numberFromClick) => {
        setReasonToReject(numberFromClick)
    }

    const reasonToRejectTextValue = (value) => {
        setReasonToRejectText(value)

    }


    const getDriverList = () => {

        const apiurl = `${appUrl}MasterCount/${cmpCode}/driverlist/${loginUser}/${deptno}`

        console.log("apiurl getsaledetails++ listItem", apiurl)



        axios.get(apiurl).then((res) => {
            console.log("res -> ", res.data)



            let filteredList = res.data?.filter((item) => {
                return item.SMAN_KEY != ""
            })
            setDriverList(filteredList)

        }).catch((err) => {

        })
    }


    const handleUserTypedDeliveredTo = (text) => {
        setUser_typed_delivered_to(text)
    }

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


                    setImageFileObjectTaken(fileObject)

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

    return (

        <>
            {
                pickData && !pickListDetails &&

                <>
                    <View style={[styles.TopBanner, { display: "flex", justifyContent: "space-between" }]}>
                        <Text style={styles.TopBannerText}>
                            <Text style={{ color: "red" }}> Logistics</Text> - Goods Collection and Delivery
                        </Text>

                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingRight: "10px" }}>

                            <TouchableOpacity onPress={() => callPreviousDayAPI()} style={{ padding: 4 }}><Text style={{ color: "#000000", fontSize: 20, fontWeight: "700" }}>-</Text></TouchableOpacity>
                            <Text style={{ color: "#000000", fontSize: 18, fontWeight: "700" }}>Today</Text>
                            <TouchableOpacity onPress={() => callNextDayAPI()} style={{ padding: 4 }}><Text style={{ color: "#000000", fontSize: 20, fontWeight: "700" }}>+</Text></TouchableOpacity>

                        </View>
                    </View>



                    <View style={{ flexDirection: "row", borderBottomWidth: 1 }}>
                        <TouchableOpacity style={getTabStyle(1)} onPress={() => { setTabNumber(1); console.log("button 1 clicked") }}><Text style={getTextColor(1)}>Open <Text style={{ backgroundColor: "#000000", color: "#ffffff", padding: "4px" }}>{"   " + pickData?.length + "  "}</Text></Text></TouchableOpacity>
                        <TouchableOpacity style={getTabStyle(2)} onPress={() => { setTabNumber(2); console.log("button 2 clicked") }}><Text style={getTextColor(2)}>Alloted <Text style={{ backgroundColor: "#000000", color: "#ffffff", padding: "4px" }}>{"   " + countOfHeaders?.accepted_count + "  "}</Text></Text></TouchableOpacity>
                        <TouchableOpacity style={getTabStyle(3)} onPress={() => { setTabNumber(3); console.log("button 3 clicked") }}><Text style={getTextColor(3)}>Started <Text style={{ backgroundColor: "#000000", color: "#ffffff", padding: "4px" }}>{"   " + countOfHeaders?.started_count + "  "}</Text> </Text></TouchableOpacity>
                        <TouchableOpacity style={getTabStyle(4)} onPress={() => { setTabNumber(4); console.log("button 4 clicked") }}><Text style={getTextColor(4)}>Completed <Text style={{ backgroundColor: "#000000", color: "#ffffff", padding: "4px" }}>{"   " + countOfHeaders?.delivered_count + "  "}</Text></Text></TouchableOpacity>
                        <TouchableOpacity style={getTabStyle(5)} onPress={() => { setTabNumber(5); console.log("button 5 clicked") }}><Text style={getTextColor(5)}>Rejected <Text style={{ backgroundColor: "#000000", color: "#ffffff", padding: "4px" }}>{"   " + countOfHeaders?.rejected_count + "  "}</Text>  </Text></TouchableOpacity>
                        <TouchableOpacity style={getTabStyle(6)} onPress={() => { setTabNumber(6); console.log("button 6 clicked") }}><Text style={getTextColor(6)}>Escalate <Text style={{ backgroundColor: "#000000", color: "#ffffff", padding: "4px" }}>{"   " + countOfHeaders?.escalated_count + "  "}</Text> </Text></TouchableOpacity>
                        <TouchableOpacity style={getTabStyle(7)} onPress={() => { setTabNumber(7); console.log("button 7 clicked") }}><Text style={getTextColor(7)}>View</Text></TouchableOpacity>
                    </View>

                    {
                        tabNumber == 7 &&

                        <View style={{ flexDirection: "row", padding: 10 }}>

                            <Text>Sort by</Text>
                            <TouchableOpacity style={{ backgroundColor: "#d7d7d7", padding: 4, paddingHorizontal: 10, marginLeft: 10 }}><Text style={{ color: "#000000" }}>PT</Text></TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: "#d7d7d7", padding: 4, paddingHorizontal: 10, marginLeft: 10 }}><Text style={{ color: "#000000" }}>FR</Text></TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: "#d7d7d7", padding: 4, paddingHorizontal: 10, marginLeft: 10 }}><Text style={{ color: "#000000" }}>TO</Text></TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: "#d7d7d7", padding: 4, paddingHorizontal: 10, marginLeft: 10 }}><Text style={{ color: "#000000" }}>Area Code</Text></TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: "#d7d7d7", padding: 4, paddingHorizontal: 10, marginLeft: 10 }}><Text style={{ color: "#000000" }}>Branch</Text></TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: "#d7d7d7", padding: 4, paddingHorizontal: 10, marginLeft: 10 }}><Text style={{ color: "#000000" }}>User</Text></TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: "#d7d7d7", padding: 4, paddingHorizontal: 10, marginLeft: 10 }}><Text style={{ color: "#000000" }}>Mode</Text></TouchableOpacity>
                        </View>
                    }



                    {
                        showLoader &&
                        <View style={{
                            position: "absolute",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            width: "100%",
                            zIndex: 3,
                            top: 0,
                            left: 0,
                            backgroundColor: "#00000090"
                        }}>
                            <ActivityIndicator size="large" color="#0000ff" backgroundColor="#ffffff" />
                        </View>
                    }

                    {
                        showRejectPopup &&

                        <View style={{
                            position: "absolute",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            width: "100%",
                            zIndex: 3,
                            top: 0,
                            left: 0,
                            backgroundColor: "#00000090"
                        }}>
                            <View style={{
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "#ffffff",
                                width: "80%",
                                padding: 10
                            }}>
                                <Text>Enter comment</Text>
                                <TextInput onChangeText={(text) => handleInputChangeReturn(text)} style={{ backgroundColor: "#f7f7f7", width: "100%", borderWidth: 1, borderColor: "#dedede" }} value={rejectComment}></TextInput>

                                <View style={{ flexDirection: "row", marginLeft: "auto", marginTop: 10 }}>
                                    <TouchableOpacity style={styles.DetailsButton} onPress={() => setShowRejectPopup(false)} >
                                        <Text style={styles.DetailsText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.RejectButton} onPress={() => clickedOnRejectInPopup()} >
                                        <Text style={styles.AcceptText}>Reject</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>

                    }



                    <FlatList
                        data={pickData}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingBottom: 250 }}
                        renderItem={({ item }) => (

                            <View style={{ backgroundColor: "#ffffff", borderWidth: 3, borderColor: "#dedede" }}>

                                <View>
                                    <Text style={{ backgroundColor: "#d7d7d7", color: "#000000", width: 70, textAlign: "center" }}>{item.task_id}</Text>
                                </View>


                                <View style={styles.TaskCont}>

                                    {
                                        item.Priority === 'high' &&
                                        <>
                                            <View style={{
                                                position: "absolute",
                                                left: 5,
                                                top: -8,
                                                padding: 6,
                                                backgroundColor: '#CCE5CC',
                                                borderRadius: 50
                                            }}>
                                                <Image source={require('../images/alert.png')} style={{
                                                    width: 20,
                                                    height: 20
                                                }} />

                                                <View style={{
                                                    position: 'absolute',
                                                    width: 75,
                                                    left: 25,
                                                    top: 5,
                                                    padding: 2,
                                                    backgroundColor: '#CCE5CC',
                                                    borderRadius: 4
                                                }}>
                                                    <Text style={{
                                                        fontFamily: 'Lexend-Bold',
                                                        color: 'red',
                                                        fontSize: 10
                                                    }}>High Priority</Text>
                                                </View>
                                            </View>
                                        </>
                                    }



                                    <View style={styles.TaskItemLeft}>
                                        <View style={styles.TitleDescBox} >
                                            {/* <View style={{ flexDirection: "row" }}>
                                                <Text style={[styles.TitleText, { color: "#008000" }]}>incoming goods |</Text>
                                                <Text style={[styles.TitleText, { color: "#f00" }]}> outgoing goods</Text>
                                            </View> */}

                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={[styles.TitleText, { color: "#000000" }]}>{item["Tasl Type"]}</Text>
                                                <Text style={[styles.TitleText, { color: "#000000" }]}> {(new Date(item.created_date)).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: true
                                                })}</Text>
                                            </View>




                                            <View style={{ flexDirection: "row" }}>
                                                {/* <Text style={[styles.TitleText, { color: "#000000" }]}>{item.SKU}</Text> */}
                                                <Text style={[styles.TitleText, { color: "#000000" }]}>{item.Branch?.trim()}</Text>
                                                <Text style={[styles.TitleText, { color: "#000000", marginLeft: 8 }]}> | {item.Creator}</Text>
                                                <Text style={[styles.TitleText, { color: "#000000", marginLeft: 8 }]}> | {item.Mode}</Text>
                                            </View>

                                            <View style={{ flexDirection: "row" }}>
                                                <View style={{ flexDirection: "row" }}>
                                                    {/* <Text style={[styles.TitleText, { color: "#000000" }]}>{item.SKU}</Text> */}
                                                    <Text style={[styles.TitleText, { color: "#000000" }]}>SKU </Text>
                                                    <Text style={[styles.TitleText, { color: "#000000" }]}>{item.SKU}</Text>
                                                </View>
                                                <View style={{ flexDirection: "column", marginLeft: 4 }}>

                                                    <View style={{ flexDirection: "row" }}><Text style={[styles.TitleText, { color: "#000000", marginLeft: 8 }]}> | {item.weight} kg</Text><Text style={[styles.TitleText, { color: "#000000", marginLeft: 8 }]}> | {item.cbm} cbm</Text></View>

                                                </View>

                                            </View>
                                            <View style={{ flexDirection: "column" }}>

                                                <Text style={[styles.TitleText, { color: "#000000" }]}>{item.task_doc == "SALES" && "Pay"}  AED {item.piamount}</Text>
                                                <Text style={[styles.TitleText, { color: "#000000" }]}> {item.paymentinstruction}</Text>
                                            </View>




                                            {/* This should be in warehouse section i think */}
                                            {/* <View style={{ flexDirection: "row", margin: 4 }}>
                                                <Text style={{ backgroundColor: "#dedede", padding: 4, color: "#000000" }}>Binned</Text>
                                                <Text style={{ backgroundColor: "#dedede", padding: 4, marginLeft: 4, color: "#000000" }}>Packed</Text>
                                            </View> */}

                                        </View>
                                    </View>

                                    <View style={styles.TaskItemRight}>
                                        {/* <Text style={styles.TitleText}>{item.do_date.split('T')[0]}</Text> */}
                                        <View style={{ flexDirection: "row" }}>
                                            <Text style={[styles.TitleText, { fontSize: 12, color: "#000000", fontWeight: "700" }]}>
                                                PDDT:
                                                {(item["PDD &Time"].split(" ")[0])}{" "}
                                            </Text>

                                            <Text> |   </Text>

                                            <Text style={[styles.TitleText, { fontSize: 12, color: "#000000", fontWeight: "700" }]}>
                                                {(item["PDD &Time"].split(" ").slice(1).join(" "))}
                                            </Text>

                                        </View>
                                        <Text style={[styles.TitleText, { fontSize: 12, color: "#000000", fontWeight: "700" }]}>ED: 18 mins</Text>

                                        <Text style={[styles.TitleText, { fontSize: 12, color: "#000000", fontWeight: "700" }]}>FR: {item.pickfrom}  | {item.From}</Text>
                                        <Text style={[styles.TitleText, { fontSize: 12, color: "#000000", fontWeight: "700" }]}>TO: {item.deliverto} | {item.To}</Text>

                                    </View>


                                </View>

                                <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#ffffff", paddingBottom: 10, paddingHorizontal: 10 }}>

                                    {
                                        tabNumber == 4 &&
                                        <View style={{ flexDirection: "row" }}>

                                            {
                                                item.task_date > item.pdocdate2 &&
                                                <View style={{ flexDirection: "column", alignItems: 'center', padding: 2, borderWidth: 1, borderRadius: 4, justifyContent: "center" }}>
                                                    <Text style={{ fontSize: 20, fontWeight: "600", color: "#008000" }}>+1</Text>
                                                    <Text style={{ color: "#008000" }}>before time</Text>
                                                </View>
                                            }

                                            {
                                                item.task_date == item.pdocdate2 &&

                                                <View style={{ flexDirection: "column", alignItems: 'center', padding: 2, borderWidth: 1, borderRadius: 4, justifyContent: "center" }}>
                                                    <Text style={{ fontSize: 20, fontWeight: "600", color: "#008000" }}>On</Text>
                                                    <Text style={{ color: "#008000" }}>time</Text>
                                                </View>
                                            }
                                            {
                                                item.task_date < item.pdocdate2 &&
                                                <View style={{ flexDirection: "column", alignItems: 'center', padding: 2, borderWidth: 1, borderRadius: 4, justifyContent: "center" }}>
                                                    <Text style={{ fontSize: 20, fontWeight: "600", color: "#f00" }}>-1</Text>
                                                    <Text style={{ color: "#f00" }} >missed time</Text>
                                                </View>
                                            }

                                        </View>
                                    }

                                    <View style={[styles.BottomButtonCont, { backgroundColor: "#ffffff", width: "100%", alignItems: "center", justifyContent: "space-between" }]}>

                                        {
                                            tabNumber == 2 &&

                                            <View style={{ flexDirection: "row", alignItems: "center" }}>

                                                <View>
                                                    <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4, fontWeight: "100", fontSize: 12 }]}> Time Passed </Text>
                                                    <View style={[styles.timerBox, isThick ? styles.pulseThick : styles.pulseThin]}>

                                                        <View>
                                                            <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4, fontSize: 18 }]}>{formatTime(parseTimeString(item["Time Passed"]) + elapsedSeconds)}</Text>
                                                        </View>

                                                    </View>


                                                </View>


                                                <View style={{ marginLeft: 6 }}>
                                                    <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4, fontSize: 12 }]}>PDDT Timer</Text>


                                                    {isAfter(parseISO(item.task_date), new Date()) ?
                                                        <View style={[styles.timerBox, { borderWidth: 1, borderColor: "#7c7c7c" }]}>

                                                            <View>
                                                                <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4, fontSize: 18 }]}>00:00:00</Text>
                                                            </View>

                                                        </View>
                                                        :
                                                        <View style={[styles.timerBox, isThick ? styles.pulseThick : styles.pulseThin]}>

                                                            <View>
                                                                <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4, fontSize: 18 }]}>{formatTime(parseTimeString(calculatePDDTimer(item.task_date)) + elapsedSeconds)}</Text>
                                                            </View>

                                                        </View>
                                                    }



                                                </View>

                                                <View style={{ marginLeft: 6 }}>
                                                    <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4, fontSize: 12 }]}>Document #</Text>


                                                    {item.primarydoc ?
                                                        <View style={[styles.timerBox, { borderWidth: 1, borderColor: "#7c7c7c" }]}>

                                                            <View>
                                                                <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4, fontSize: 18 }]}>{item.primarydoc}</Text>
                                                            </View>

                                                        </View>
                                                        :
                                                        <View style={[styles.timerBox, isThick ? styles.pulseThick : styles.pulseThin]}>

                                                            <View>
                                                                <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4, fontSize: 18 }]}>{"no data"}</Text>
                                                            </View>

                                                        </View>
                                                    }



                                                </View>


                                            </View>
                                        }

                                        <View style={{ flexDirection: "row", alignItems: "baseline" }}>

                                            <TouchableOpacity style={styles.DetailsButton} onPress={() => navigation.navigate("GoodsCollectionDelivery", {
                                                listItem: item
                                            })}>
                                                <Text style={styles.DetailsText}>Details</Text>
                                            </TouchableOpacity>

                                            {
                                                tabNumber == 6 &&
                                                <View style={{ flexDirection: "row" }}>

                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#9fc5e8", marginLeft: 10 }]} onPress={() => { changeTaskStatusCommmonMethod(item, "REOPEN") }}>
                                                        <Text style={{ color: "#000000" }}>ReOpen</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#E69500", marginLeft: 10 }]} onPress={() => { changeTaskStatusCommmonMethod(item, "ARCHIVE") }}>
                                                        <Text style={{ color: "#000000" }}>Archive</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#F3654C", marginLeft: 10 }]} onPress={() => { changeTaskStatusCommmonMethod(item, "DELETE") }}>
                                                        <Text style={{ color: "#000000" }}>Delete</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            }


                                            {
                                                tabNumber == 5 &&
                                                <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#add0b3", marginLeft: 4 }]}
                                                    onPress={() => acceptTheTask(item)}>
                                                    <Text style={{ color: "#000000" }}>Accept</Text>
                                                </TouchableOpacity>
                                            }

                                            {
                                                tabNumber == 3 &&
                                                <View style={{ flexDirection: "row" }}>

                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#FFB6C1", marginLeft: 10 }]} onPress={() => { setRejectClicked(prev => !prev); setCurrentObjectToReject(item) }}>
                                                        <Text style={{ color: "#000000" }}>Reject</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#9fc5e8", marginLeft: 10 }]} onPress={() => { changeTaskStatusCommmonMethod(item, "ESCALATED") }}>
                                                        <Text style={{ color: "#000000" }}>Escalated</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#FFFFC5", marginLeft: 10 }]} onPress={() => { setCurrentListItemToSave(item); save_delivery_items_last_step(item, "HANDEDOVER"); setShowHideDriverList(prev => !prev) }}>
                                                        <Text style={{ color: "#000000" }}>Handed To</Text>
                                                    </TouchableOpacity>

                                                    {/* {
                                                        driverList && showHideDriverList &&
                                                        <FlatList
                                                            nestedScrollEnabled={true}
                                                            style={{ height: 100 }}
                                                            data={driverList}
                                                            renderItem={renderDriverList}
                                                            keyExtractor={(item) => item.SMAN_KEY}
                                                        />
                                                    } */}
                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#FFFFC5", marginLeft: 10 }]} onPress={() => { setCurrentListItemToSave(item); setShowHideDeliveredToBox(prev => !prev) }}>
                                                        <Text style={{ color: "#000000" }}>Delivered To</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            }

                                            {
                                                tabNumber == 2 &&
                                                <View style={{ flexDirection: "row" }}>
                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#d1ffbd" }]} onPress={() => { changeTaskStatusCommmonMethod(item, "STARTED") }}>
                                                        <Text style={{ color: "#000000" }}>Start</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#FFB6C1", marginLeft: 10 }]} onPress={() => { setRejectClicked(prev => !prev); setCurrentObjectToReject(item) }}>
                                                        <Text style={{ color: "#000000" }}>Reject</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            }

                                            {
                                                tabNumber == 1 &&
                                                <TouchableOpacity style={[styles.RejectButton, { backgroundColor: "#add0b3", marginLeft: 4 }]}
                                                    onPress={() => acceptTheTask(item)}>
                                                    <Text style={{ color: "#000000" }}>Accept</Text>
                                                </TouchableOpacity>
                                            }

                                        </View>

                                    </View>
                                </View>




                            </View>


                        )}
                        ListEmptyComponent={
                            <View>
                                <Text style={{ color: 'red' }}>No data available</Text>
                            </View>
                        }
                    />
                </>
            }



            {
                rejectClicked &&
                <View style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, backgroundColor: "#00000090", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ backgroundColor: "#ffffff", padding: 20 }}>
                        <Text style={{ fontSize: 20 }}>Are you sure</Text>

                        <Text style={{ fontSize: 15, color: "#000000" }}>Select reason to reject</Text>

                        <Pressable style={styles.container} onPress={() => { reasonToReject(1); reasonToRejectTextValue("Work Overload") }}>

                            <Icon
                                name={reason_To_Reject == 1 ? 'check-square' : 'square-o'}
                                size={24}
                                color="#FFA500" // orange
                            />

                            <Text style={{ marginLeft: 8 }}>Work Overload</Text>
                        </Pressable>
                        <Pressable style={styles.container} onPress={() => { reasonToReject(2); reasonToRejectTextValue("Vehicle breakdown") }}>
                            <Icon
                                name={reason_To_Reject == 2 ? 'check-square' : 'square-o'}
                                size={24}
                                color="#FFA500" // orange
                            />
                            <Text style={{ marginLeft: 8 }}>Vehicle breakdown</Text>
                        </Pressable>

                        <Pressable style={styles.container} onPress={() => { reasonToReject(3); reasonToRejectTextValue("Stuck in traffic") }}>
                            <Icon
                                name={reason_To_Reject == 3 ? 'check-square' : 'square-o'}
                                size={24}
                                color="#FFA500" // orange
                            />
                            <Text style={{ marginLeft: 8 }}>Stuck in traffic</Text>
                        </Pressable>

                        <Pressable style={styles.container} onPress={() => { reasonToReject(4); reasonToRejectTextValue("Items not ready") }}>
                            <Icon
                                name={reason_To_Reject == 4 ? 'check-square' : 'square-o'}
                                size={24}
                                color="#FFA500" // orange
                            />
                            <Text style={{ marginLeft: 8 }}>Items not ready</Text>
                        </Pressable>


                        <Pressable style={styles.container} onPress={() => { reasonToReject(5); reasonToRejectTextValue("Incomplete Docs") }}>
                            <Icon
                                name={reason_To_Reject == 5 ? 'check-square' : 'square-o'}
                                size={24}
                                color="#FFA500" // orange
                            />
                            <Text style={{ marginLeft: 8 }}>Incomplete Docs</Text>
                        </Pressable>



                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
                            <TouchableOpacity style={{ padding: 10, backgroundColor: "#f7f7f7" }} onPress={() => setRejectClicked(prev => !prev)}><Text style={{ color: "#000000" }}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={{ padding: 10, backgroundColor: "#f00", marginLeft: 10 }}><Text style={{ color: "#ffffff" }} onPress={() => rejectTheTask()}>Reject</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            }

            <Modal
                animationType="fade" // Controls how the modal appears
                transparent={true}  // Allows the background (screen behind the modal) to show
                visible={showHideDriverList} // Linked to state for visibility
                onRequestClose={() => setShowHideDriverList(false)} // Handles closing on hardware back button (Android)
            >
                {/* Full-screen dark overlay with centered content */}
                <View style={styles.centeredView}>
                    {/* The actual popup container */}
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Select</Text>

                        <FlatList
                            data={driverList}
                            renderItem={renderDriverList}
                            keyExtractor={item => item.SMAN_KEY}
                            // Ensures the list is scrollable within the popup view
                            style={styles.listContainer}
                        />

                        <View style={{ flexDirection: "row", marginTop: 10 }}>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => { setCurrentListItemToSave(null); setShowHideDriverList(false) }}
                            >
                                <Text style={styles.textStyleCancel}>Cancel</Text>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose, { marginLeft: 10 }]}
                                onPress={() => { save_delivery_items_last_step(currentListItemToSave, "HANDEDOVER"); setShowHideDriverList(false) }}
                            >
                                <Text style={styles.textStyle}>Save</Text>

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade" // Controls how the modal appears
                transparent={true}  // Allows the background (screen behind the modal) to show
                visible={showHideDeliveredToBox} // Linked to state for visibility
                onRequestClose={() => setShowHideDeliveredToBox(false)} // Handles closing on hardware back button (Android)
            >
                {/* Full-screen dark overlay with centered content */}
                <View style={styles.centeredView}>
                    {/* The actual popup container */}
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Delivered To</Text>

                        <TextInput style={styles.input} onChangeText={(text) => handleUserTypedDeliveredTo(text)} value={user_typed_delivered_to} />

                        <View style={{ flexDirection: "row", paddingBottom:20, width: '100%'}}>
                            <View style={{ width: "70%", height: 80, flexDirection: "row" }}>
                                
                                <SignatureScreen
                                    ref={signatureRef}
                                    style={{ flex: 1 }}
                                    onOK={handleSignature}
                                    onEmpty={handleEmpty}
                                    onClear={() => console.log('Signature manually cleared')}
                                    autoClear={false} // ✅ Keeps drawing after save
                                    descriptionText="Sign above"
                                    webStyle={`
          .m-signature-pad--footer { display: none; }
          .m-signature-pad { flex: 1; }
        `}
                                    injectedJavaScript={injectedJS} // ✅ Fixes first stroke
                                />
                                <View style={{ flexDirection: 'row', alignItems:"center", justifyContent: 'space-around'}}>
                                    <Button title="Save" onPress={() => signatureRef.current.readSignature()} />
                                    <Button title="Clear" onPress={handleClear} />
                                </View>
                            </View>

                            <View style={{ width: "30%" ,justifyContent:"center",alignItems:"center"}}>


                                <View style={styles.LabelCell}>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row" }}
                                        onPress={() => {

                                            handleTakePhoto();
                                        }}
                                    >
                                        
                                        <Image source={require('../images/cameraTasra.png')} style={{ width: 25, height: 25 }} />
                                        <Text style={{color:"#000000"}}>Take Photo</Text>
                                    </TouchableOpacity>

                                    {
                                        imageFileObjectTaken &&
                                        // <TouchableOpacity onPress={() => handleImagePreview(item.label)}>
                                        <TouchableOpacity>
                                            <Image source={{ uri: imageFileObjectTaken.uri ? imageFileObjectTaken.uri : '' }} style={styles.imagePreview} />
                                        </TouchableOpacity>
                                    }

                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", marginTop: 10 }}>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => { setCurrentListItemToSave(null); setShowHideDeliveredToBox(false) }}
                            >
                                <Text style={styles.textStyleCancel}>Cancel</Text>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose, { marginLeft: 10 }]}
                                onPress={() => { save_delivery_items_last_step(currentListItemToSave, "DELIVERED"); setShowHideDeliveredToBox(false) }}
                            >
                                <Text style={styles.textStyle}>Save</Text>

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


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

        </>
    )
}

const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFEFEF'
    },
    HomeCont: {
        width: '98%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#EFEFEF',
        height: Dimensions.get('window').height - 70

    },

    CheckStockListView: {
        // backgroundColor: '#FDFDFD',
        width: '95%',
        display: 'flex',
        flexDirection: 'column',
        padding: 8
    },

    CollTableContainer: {
        width: "100%",
        marginTop: 8,
        alignItems: 'center',
        flex: 1,
    },
    ColltableRow: {
        flexDirection: 'row',
        width: '100%',
    },
    CollheaderCell: {
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 125,
        color: 'white',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',

    },
    CollheaderCell_SO_Qty: {
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 90,
        color: 'white',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
    },
    ColldataCell_SO_Qty: {
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: 90,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },
    ColldataCell: {
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: 125,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },

    MainScroll: {
        // width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
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


    itemCountText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },
    RemarkInputCont: {
        width: '90%',
        backgroundColor: '#F6F6F6',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    PlaceHolderInput: {
        width: '100%',
        fontFamily: 'Lexend-Light',
        color: '#2B2B2B'
    },

    DetailsButtonWrap: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingBottom: 52
    },
    DraftButton: {
        backgroundColor: 'orange',
        borderRadius: 4,
        padding: 8
    },
    SaveButton: {
        backgroundColor: 'green',
        borderRadius: 4,
        padding: 8
    },
    ButtonLabel: {
        fontFamily: 'Lexend-Regular',
        color: "white",
        fontSize: 14
    },

    inputContainer: {
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
    },
    inputBox: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '100%',
        color: 'black'
    },


    TopBanner: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 4,
        width: '100%'
    },

    TopBannerText: {
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Bold',
        padding: 10,
    },

    TaskCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'white',
        marginVertical: 6,
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 4
    },

    TaskItemLeft: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // width: '60%'
        width: 'auto',
        maxWidth: '55%'
    },

    ImageCont: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    ImageWrap: {
        backgroundColor: 'grey',
        borderRadius: 50,
        padding: 6
    },
    Image: {
        width: 28,
        height: 28,
    },

    Time: {
        width: 28,
        height: 28,
    },
    TitleDescBox: {
        flexDirection: 'column',
        marginLeft: 8,
    },
    TitleText: {
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
    },
    DescText: {
        fontSize: 12,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
    },

    TaskItemRight: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: "flex-start",
        width: "30%"
    },
    AcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },

    BottomButtonCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8
        // paddingHorizontal: 12
    },

    DetailsButton: {
        backgroundColor: '#D8D8DA',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 0.5,
        borderColor: 'grey',
        marginLeft: 5
    },
    DetailsText: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Lexend-Regular',
    },
    AcceptButton: {
        backgroundColor: '#30B3A4',
        padding: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    RejectButton: {
        backgroundColor: '#f00',
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

    SettingsWrap: {
        padding: 6
    },
    HeadIcon: {
        width: 20,
        height: 20
    },
    timerBox: {
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderStyle: 'solid',
        borderRadius: 10,
        borderColor: '#007bff',
        fontFamily: 'monospace',
        fontSize: 32, // 2rem ≈ 32px
        alignSelf: 'flex-start', // similar to inline-block
    },
    pulseThin: {
        borderWidth: 2,
        borderColor: '#007bff',
    },
    pulseThick: {
        borderWidth: 2,
        borderColor: '#AA4A44',
    },

    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        color: '#333',
    },
    displayValue: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#007aff',
    },
    openButton: {
        backgroundColor: '#007aff',
        padding: 10,
        borderRadius: 5,
        elevation: 2,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textStyleCancel: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // --- Modal Styles ---
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark transparent background (the overlay)
    },
    modalView: {
        width: '80%',
        maxHeight: '90%', // Limit the height of the popup itself
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    listContainer: {
        width: '100%',
        maxHeight: 200, // Explicit max height for the list within the modal
    },
    listItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: '100%',
        alignItems: 'flex-start',
        color: "#000000"
    },
    listItemSelected: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: '100%',
        alignItems: 'flex-start',
        backgroundColor: "#000000",
        color: "#ffffff"
    },
    listItemText: {
        fontSize: 16,
        color: '#333',
    },
    buttonCancel: {
        backgroundColor: '#000000',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    buttonClose: {
        backgroundColor: '#f44336',
        paddingHorizontal: 20,
        paddingVertical: 5
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


    imagePreview: {
        width: 30,
        height: 30,
        borderRadius: 50,
    },


})

export default GoodsCollectionDeliveryPoolList