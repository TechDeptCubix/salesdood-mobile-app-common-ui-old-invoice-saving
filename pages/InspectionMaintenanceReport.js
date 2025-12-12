import React, { useEffect, useState, useCallback } from "react";
import { TouchableOpacity, View, Text, FlatList, StyleSheet, Dimensions, Image, Alert, ScrollView, Linking } from "react-native";
import HeaderUiNew from './HeaderUiNew'
import { TextInput } from "react-native-paper";
import { format } from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ic_edit from "../images/ic_edit.png"
import ic_delete from "../images/ic_delete.png"
import ic_view_location from "../images/ic_view_location.png"
import ic_camera from "../images/ic_camera.png"
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from "axios";
import mime from "mime";

import ToastManager, { Toast } from 'toastify-react-native'

import { ImagePickerModal } from '../pages/ImagePickerModal'

import { Camera, useCameraDevice } from 'react-native-vision-camera';

import * as ImagePicker from 'react-native-image-picker';

function InspectionMaintenanceReport({ route, navigation }) {


    const device = useCameraDevice('back');

    const [imageDescription, setImageDescription] = useState(null)

    const [URI, setURI] = useState(null)

    const [pickerResponse, setPickerResponse] = useState(null);
    const [visible, setVisible] = useState(false);
    const [type_of_job, set_type_of_job] = useState("")
    const [type_of_detection_system, set_type_of_detection_system] = useState("")
    const { listItem, department_from_parent } = route.params

    console.log("department_from_parent", department_from_parent)

    const [editRow, setEditRow] = useState(null)
    const [showActivity, setShowActivity] = useState(false)

    const [appUrl, setAppUrl] = useState('')

    const [cmpCode, setCmpCode] = useState('')

    const [bOQStockData, setBOQStockData] = useState(null)
    const [currentTypingBOQ, setCurrentTypingBOQ] = useState("")
    const [currentTypingScopeOfWork, setCurrentTypingScopeOfWork] = useState("")
    const [showScopeOfWorkList, setShowScopeOfWorkList] = useState(false)
    const [showBOQList, setShowBOQList] = useState(false)
    const initialCheckBoxObject = {
        maintenance: false,
        inspection: false,
        installation: false,
        rectification: false,
        call_out: false,
        others: false,

        fire_extinguisher: false,
        hose_reel: false,
        gas_sippression: false,
        fire_pump: false,
        spinkler: false,
        wet_dry_riser: false,
        others_fire_fighting_system: false,

        make_fire_alarm_detection_system: "",
        make_fire_alarm_detection_system_add: false,
        make_fire_alarm_detection_system_conv: false,

        quantity_fire_alarm_detection_system: "0",
        no_of_zone_loops_fire_alarm_detection_system_add: "0",
        cbu_qty: "0",
        cbu_exit: false,
        cbu_emergency: false

    }

    const [checkBoxObject, setCheckboxObject] = useState(initialCheckBoxObject)

    const todaysdate = format(new Date(), 'yyyy-MM-dd')
    const [fromData, setFromData] = useState(todaysdate);
    const [toData, setToData] = useState(todaysdate);

    const [timeArrived, setTimeArrived] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
    const [isToDatePickerVisibility, setToDatePickerVisibility] = useState(false);
    const [isTimeArrivedPickerVisibility, setTimeArrivedPickerVisibility] = useState(false);
    const [isTimeLeftPickerVisibility, setTimeLeftPickerVisibility] = useState(false);


    const [arrayOfScopeOfWork, setArrayOfScopeOfWork] = useState(null)
    const [arrayOfBOQ, setArrayOfBOQ] = useState(null)

    const [currentTab, setCurrentTab] = useState(1)

    const getBackGroundColor = (valueFromChild) => {

        if (currentTab == valueFromChild) {
            return { backgroundColor: "#000000" }
        } else {
            return { backgroundColor: "#ffffff" }
        }

    }

    const getTextColor = (valueFromChild) => {

        if (currentTab == valueFromChild) {
            return { color: "#ffffff" }
        } else {
            return { color: "#000000" }
        }

    }



    const addNewScopeRow = () => {

        if (currentTypingScopeOfWork?.length == 0) {
            Alert.alert("Please enter text and save")
        }

        let nextId = 1

        if (arrayOfScopeOfWork) {
            nextId = arrayOfScopeOfWork?.length + 1
        }


        let newObject = { id: nextId, description: currentTypingScopeOfWork }

        let newArray = []

        if (arrayOfScopeOfWork) {
            newArray = [...arrayOfScopeOfWork, newObject]
        } else {
            newArray = [newObject]
        }


        setArrayOfScopeOfWork(newArray)

        Toast.success('Saved')
        setCurrentTypingScopeOfWork("")

    }

    const addNewBOQRow = (selectedRow) => {


        console.log("arrayOfBOQ]]]]] ++ before", arrayOfBOQ)

        if (arrayOfBOQ) {
            let duplicatecheckedArray = arrayOfBOQ.filter((item) => {
                return item.code == selectedRow.Code
            })

            console.log("arrayOfBOQ]]]]] ++ ", selectedRow, arrayOfBOQ, duplicatecheckedArray)

            if (duplicatecheckedArray?.length > 0) {
                Toast.error('Item Already Added')
                return
            }
        }

        console.log("arrayOfBOQ]]]]] ++  after", arrayOfBOQ)


        if (currentTypingBOQ?.length == 0) {
            Alert.alert("Please enter text and save")
        }

        let nextId = 1

        if (arrayOfBOQ) {
            nextId = arrayOfBOQ?.length + 1
        }


        let newObject = { id: nextId, code: selectedRow.Code, description: selectedRow.Description, group: selectedRow.Group, category: selectedRow.Category, qty_needed: "1" }

        let newArray = []

        if (arrayOfBOQ) {
            newArray = [...arrayOfBOQ, newObject]
        } else {
            newArray = [newObject]
        }


        setArrayOfBOQ(newArray)

        Toast.success('Item Added')


    }

    useEffect(() => {

        console.log("pickerResponse>>++", pickerResponse)
        if (pickerResponse?.assets) {
            if (pickerResponse.assets[0].uri) {
                setURI(pickerResponse.assets[0].uri)
            }

            setVisible(false)
        }

    }, [pickerResponse])


    const handleFromDateConfirm = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        setFromData(formattedDate);
        toggleFromDatePickerView();
    };

    const handleToDateConfirm = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        setToData(formattedDate);
        toggleToDatePickerView();
    };

    const handleTimeArrivedConfirm = (date) => {
        const formattedDate = format(date, 'HH:mm:ss');
        setTimeArrived(formattedDate);
        toggleTimeArrivedPickerView();
    };


    const handleTimeLeftConfirm = (date) => {
        const formattedDate = format(date, 'HH:mm:ss');
        setTimeLeft(formattedDate);
        toggleTimeLeftPickerView();
    };

    const toggleFromDatePickerView = () => {
        setFromDatePickerVisibility(prev => !prev);
    }

    const toggleToDatePickerView = () => {
        setToDatePickerVisibility(prev => !prev);
    }


    const toggleTimeArrivedPickerView = () => {
        setTimeArrivedPickerVisibility(prev => !prev);
    }


    const toggleTimeLeftPickerView = () => {
        setTimeLeftPickerVisibility(prev => !prev);
    }

    useEffect(() => {
        fetchAppUrl()
    }, [])

    const handleChangeInputScope = (text) => {

        setCurrentTypingScopeOfWork(text)

    }


    const handleChangeInputMake_fire_alarm_detection_system = (text) => {

        setCheckboxObject({ ...checkBoxObject, make_fire_alarm_detection_system: text })

    }

    const handleChangeInputMake_fire_alarm_detection_system_qty = (text) => {
        setCheckboxObject({ ...checkBoxObject, quantity_fire_alarm_detection_system: text })
    }

    const handleChangeInputCBU = (text) => {
        setCheckboxObject({ ...checkBoxObject, cbu_qty: text })
    }



    const handleChangeInputMake_fire_alarm_detection_system_no_zone = (text) => {
        setCheckboxObject({ ...checkBoxObject, no_of_zone_loops_fire_alarm_detection_system_add: text })
    }

    const searchBOQAPI = async (value) => {
        setShowActivity(true)
        try {

            let encodedvalue = encodeURIComponent(value)

            console.log(`searchStock -- ${appUrl}Search_Items/${cmpCode}/Sitem/${encodedvalue}`)

            await axios.get(`${appUrl}Search_Items/${cmpCode}/Sitem/${encodedvalue}`)
                .then((res) => {
                    setBOQStockData(res.data)
                })
            setShowActivity(false)
        } catch (error) {
            console.log('searchStockerror', error)
            setShowActivity(false)
        }
    }

    const handleChangeInputBOQ = (text) => {

        setCurrentTypingBOQ(text)
        searchBOQAPI(text)
    }

    const sendScopeAndBOQToAPI = () => {

        if (type_of_job == "") {
            Toast.error("Please select type of job")
            return
        }

        if (fromData == null || toData == null) {
            Toast.error("Please select date")
            return
        }


        if (timeArrived == null || timeLeft == null) {
            Toast.error("Please select time")
            return
        }


        let arrayAfterScope = []

        if (arrayOfScopeOfWork?.length > 0) {

            arrayAfterScope = arrayOfScopeOfWork.map((item) => {
                return (
                    {
                        cmpcode: cmpCode,
                        opmode: "SAVE",
                        survey_no: listItem.survey_no,
                        survey_date: "2025-07-05",
                        Ref_no: "REF123",
                        jobtype: type_of_job, //choose maintenance 
                        account: "00000000",
                        CustomerName: listItem.Customer,
                        CustomerType: listItem.CustomerType,
                        SiteName: listItem.SiteName,
                        SiteAddress1: listItem.SiteAddress1,
                        SiteAddress2: listItem.SiteAddress2,
                        Country: listItem.Country,
                        City: listItem.City,
                        ContactPerson: listItem.ContactPerson,
                        ContactNo: listItem.ContactNo,
                        email: listItem.email,
                        gps: listItem.gps,
                        area: listItem.area,
                        Assignee: listItem.AssignedTo,
                        visit_period_From: fromData + " 12:04:00", // else error nvarchar to date so put this dummy 
                        visit_period_To: toData + " 12:04:00",
                        Time_Arrived: todaysdate + " " + timeArrived+ "",
                        Time_Left:todaysdate + " " + timeLeft + "",
                        FA_Make: checkBoxObject.make_fire_alarm_detection_system,
                        FA_Type: type_of_detection_system,
                        FA_Qty: checkBoxObject.quantity_fire_alarm_detection_system + "",
                        FA_NoOfZoneLoops: checkBoxObject.no_of_zone_loops_fire_alarm_detection_system_add + "",
                        FA_Others: item.others ? "Yes" : "No",
                        FF_extinguisher: checkBoxObject.fire_extinguisher ? "Yes" : "No",
                        FF_Hose_reel: checkBoxObject.hose_reel ? "Yes" : "No",
                        FF_Spinkler: checkBoxObject.spinkler ? "Yes" : "No",
                        FF_Gas_Suppression: checkBoxObject.gas_sippression ? "Yes" : "No",
                        FF_Fire_Pump: checkBoxObject.fire_pump ? "Yes" : "No",
                        FF_Wet_Dry_Riser: checkBoxObject.wet_dry_riser ? "Yes" : "No",
                        FF_Others: "",
                        CBU_Qty: checkBoxObject.cbu_qty,
                        CBU_Exit: checkBoxObject.cbu_exit ? "Yes" : "No",
                        CBU_Emergency: checkBoxObject.cbu_emergency ? "Yes" : "No",
                        Material_Req_Type: "Standard",
                        Client_Feedback: "Site is ready. Proceed with installation.",
                        status: "Completed",
                        deptno: department_from_parent,
                        Remarks: "All good.",
                        code: "XX",
                        description: item.description,
                        Brand: "",
                        Qty: "0"
                    }
                )
            })
        }

        let arrayAfterBOQ = []


        if (arrayOfBOQ?.length > 0) {

            arrayAfterBOQ = arrayOfBOQ.map((item) => {
                return (
                    {
                        cmpcode: cmpCode,
                        opmode: "SAVE",
                        survey_no: listItem.survey_no,
                        survey_date: "2025-07-05",
                        Ref_no: "REF123",
                        jobtype: type_of_job, //choose maintenance 
                        account: "00000000",
                        CustomerName: listItem.Customer,
                        CustomerType: listItem.CustomerType,
                        SiteName: listItem.SiteName,
                        SiteAddress1: listItem.SiteAddress1,
                        SiteAddress2: listItem.SiteAddress2,
                        Country: listItem.Country,
                        City: listItem.City,
                        ContactPerson: listItem.ContactPerson,
                        ContactNo: listItem.ContactNo,
                        email: listItem.email,
                        gps: listItem.gps,
                        area: listItem.area,
                        Assignee: listItem.AssignedTo,
                        visit_period_From: fromData + " 12:04:00", // else error nvarchar to date so put this dummy 
                        visit_period_To: toData + " 12:04:00",
                        Time_Arrived: todaysdate + " " + timeArrived + "",
                        Time_Left: todaysdate + " " + timeLeft + "",
                        FA_Make: checkBoxObject.make_fire_alarm_detection_system, // typed
                        FA_Type: type_of_detection_system, // add or conv only one
                        FA_Qty: checkBoxObject.quantity_fire_alarm_detection_system + "",
                        FA_NoOfZoneLoops: checkBoxObject.no_of_zone_loops_fire_alarm_detection_system_add + "",
                        FA_Others: checkBoxObject.others ? "Yes" : "No",
                        FF_extinguisher: checkBoxObject.fire_extinguisher ? "Yes" : "No",
                        FF_Hose_reel: checkBoxObject.hose_reel ? "Yes" : "No",
                        FF_Spinkler: checkBoxObject.spinkler ? "Yes" : "No",
                        FF_Gas_Suppression: checkBoxObject.gas_sippression ? "Yes" : "No",
                        FF_Fire_Pump: checkBoxObject.fire_pump ? "Yes" : "No",
                        FF_Wet_Dry_Riser: checkBoxObject.wet_dry_riser ? "Yes" : "No",
                        FF_Others: "",
                        CBU_Qty: checkBoxObject.cbu_qty,
                        CBU_Exit: checkBoxObject.cbu_exit ? "Yes" : "No",
                        CBU_Emergency: checkBoxObject.cbu_emergency ? "Yes" : "No",
                        Material_Req_Type: "Standard",
                        Client_Feedback: "Site is ready. Proceed with installation.",
                        status: "Completed",
                        deptno: department_from_parent,
                        Remarks: "All good.",
                        code: item.code,
                        description: item.description,
                        Brand: item.group,
                        Qty: item.qty_needed
                    }
                )
            })

        }

        let postData = [
            {
                cmpcode: cmpCode?.trim().toUpperCase(),
                opmode: "SAVE",
                survey_no: listItem.survey_no,
                survey_date: "2025-07-05",
                Ref_no: "REF123",
                jobtype: type_of_job, //choose maintenance 
                account: "00000000",
                CustomerName: listItem.Customer,
                CustomerType: listItem.CustomerType,
                SiteName: listItem.SiteName,
                SiteAddress1: listItem.SiteAddress1,
                SiteAddress2: listItem.SiteAddress2,
                Country: listItem.Country,
                City: listItem.City,
                ContactPerson: listItem.ContactPerson,
                ContactNo: listItem.ContactNo,
                email: listItem.email,
                gps: listItem.gps,
                area: listItem.area,
                Assignee: listItem.AssignedTo,
                visit_period_From: fromData + " 12:04:00", // else error nvarchar to date so put this dummy 
                visit_period_To: toData + " 12:04:00",
                Time_Arrived: todaysdate + " " + timeArrived + "",
                Time_Left: todaysdate + " " + timeLeft + "",
                FA_Make: checkBoxObject.make_fire_alarm_detection_system, // typed
                FA_Type: type_of_detection_system, // add or conv only one
                FA_Qty: checkBoxObject.quantity_fire_alarm_detection_system + "",
                FA_NoOfZoneLoops: checkBoxObject.no_of_zone_loops_fire_alarm_detection_system_add + "",
                FA_Others: checkBoxObject.others ? "Yes" : "No",
                FF_extinguisher: checkBoxObject.fire_extinguisher ? "Yes" : "No",
                FF_Hose_reel: checkBoxObject.hose_reel ? "Yes" : "No",
                FF_Spinkler: checkBoxObject.spinkler ? "Yes" : "No",
                FF_Gas_Suppression: checkBoxObject.gas_sippression ? "Yes" : "No",
                FF_Fire_Pump: checkBoxObject.fire_pump ? "Yes" : "No",
                FF_Wet_Dry_Riser: checkBoxObject.wet_dry_riser ? "Yes" : "No",
                FF_Others: "",
                CBU_Qty: checkBoxObject.cbu_qty,
                CBU_Exit: checkBoxObject.cbu_exit ? "Yes" : "No",
                CBU_Emergency: checkBoxObject.cbu_emergency ? "Yes" : "No",
                Material_Req_Type: "Standard",
                Client_Feedback: "Site is ready. Proceed with installation.",
                status: "Completed",
                deptno: department_from_parent,
                Remarks: "All good.",
                code: "",
                description: "",
                Brand: "",
                Qty: "0"
            }
        ]

        if (arrayAfterScope?.length == 0 && arrayAfterBOQ?.length == 0) {

            postData = JSON.stringify(postData)

            console.log("2 array empty ", postData)
        } else {
            postData = JSON.stringify([...arrayAfterScope, ...arrayAfterBOQ])
            console.log("2  array not empty ", postData)
        }






        axios.post(`${appUrl}SiteSurveyReg`, postData, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {
            console.log("res>>>>>>>>>", res)
            if (res.data.result == "Saved") {
                Toast.success("Saved Successfully")
                navigation.goBack()
            }
        }).catch((err) => {
            console.log("err>>>>>>>>>", err)
            Toast.error("could not save, please try later")
        })
    }


    const toggleCheckboxvalues_type_of_job = (field_name) => {

        set_type_of_job(field_name)


    }

    const toggleCheckboxvaluesDetectionSystem = (field_name) => {

        set_type_of_detection_system(field_name)


    }

    const toggleCheckboxvalues = (field_name) => {

        let newObject = { ...checkBoxObject, [field_name]: !(checkBoxObject[field_name]) }

        setCheckboxObject(newObject)

    }

    const fetchAppUrl = async () => {
        const appUrl = await AsyncStorage.getItem('appUrl')

        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }

        if (appUrl) {
            setAppUrl(appUrl)
        }
    }

    const handleChangeInputQtyInBOQList = (text, itemFromClick) => {
        let mappedArray = arrayOfBOQ.map((item) => {
            if (item.code == itemFromClick.code) {
                return { ...item, qty_needed: text }
            } else {
                return item
            }
        })

        setArrayOfBOQ(mappedArray)
    }

    const handleChangeDescriptionInScopeList = (text, itemFromClick) => {
        let mappedArray = arrayOfScopeOfWork.map((item) => {
            if (item.id == itemFromClick.id) {
                return { ...item, description: text }
            } else {
                return item
            }
        })

        setArrayOfScopeOfWork(mappedArray)
    }

    const deleteItemInBOQList = (itemFromClick) => {
        let mappedArray = arrayOfBOQ.filter((item) => {
            return item.code != itemFromClick.code
        })

        let mappedArrayWithNewId = mappedArray.map((item, index) => {
            return { ...item, id: index + 1 }
        })

        setArrayOfBOQ(mappedArrayWithNewId)
    }

    const deleteItemInScopeList = (itemFromClick) => {
        let mappedArray = arrayOfScopeOfWork.filter((item) => {
            return item.id != itemFromClick.id
        })

        let mappedArrayWithNewId = mappedArray.map((item, index) => {
            return { ...item, id: index + 1 }
        })

        setArrayOfScopeOfWork(mappedArrayWithNewId)
    }

    const acceptSurveyTask = () => {

        objectTopass = {
            cmpcode: cmpCode,
            opmode: "ACCEPTED",
            survey_no: listItem.survey_no,
            survey_date: "2025-07-05",
            Ref_no: "REF123",
            jobtype: type_of_job, //choose maintenance 
            account: "00000000",
            CustomerName: listItem.Customer,
            CustomerType: listItem.CustomerType,
            SiteName: listItem.SiteName,
            SiteAddress1: listItem.SiteAddress1,
            SiteAddress2: listItem.SiteAddress2,
            Country: listItem.Country,
            City: listItem.City,
            ContactPerson: listItem.ContactPerson,
            ContactNo: listItem.ContactNo,
            email: listItem.email,
            gps: listItem.gps,
            area: listItem.area,
            Assignee: listItem.AssignedTo,
            visit_period_From: fromData,
            visit_period_To: toData,
            Time_Arrived: timeArrived,
            Time_Left: timeLeft,
            FA_Make: "",
            FA_Type: "",
            FA_Qty: "0",
            FA_NoOfZoneLoops: "0",
            FA_Others: "No",
            FF_extinguisher: "No",
            FF_Hose_reel: "No",
            FF_Spinkler: "No",
            FF_Gas_Suppression: "No",
            FF_Fire_Pump: "No",
            FF_Wet_Dry_Riser: "No",
            FF_Others: "",
            CBU_Qty: "0",
            CBU_Exit: "No",
            CBU_Emergency: "No",
            Material_Req_Type: "Standard",
            Client_Feedback: "Site is ready. Proceed with installation.",
            status: "Completed",
            deptno: deptno,
            Remarks: "All good.",
            code: "XX",
            description: "",
            Brand: "",
            Qty: "0"
        }

        postData = JSON.stringify(objectTopass)

        axios.post(`${appUrl}SiteSurveyReg`, postData, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {

            console.log("res ", res)

        }).catch((err) => {
            console.log("err", err)
        })

    }

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


    function sendXmlHttpRequest(data) {

        const apiUrl = `https://api-ftp.premierauto.ae/api/Image/upload`

        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhr.onreadystatechange = e => {
                if (xhr.readyState !== 4) {
                    return;
                }

                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    resolve("Request Failed-->", xhr.status);
                }
            };
            xhr.open("POST", apiUrl);
            xhr.setRequestHeader("Content-Type", "multipart/form-data");
            xhr.send(data);
        });
    }

    const handleDescriptionImage = (text) => {
        setImageDescription(text)
    }


    const uploadImage = async () => {




        // //const apiUrl = `https://api.escuelajs.co/api/v1/files/upload`
        //  const apiUrl = `https://api-ftp.premierauto.ae/api/Image/upload`
        // //const apiUrl = `https://cubixweberp.com:300/api/Image/upload`
        // //const apiUrl = `https://localhost:7063/api/Image/upload`

        const apiUrl = `http://safefire.dyndns.org:90/api/Image/upload`
        // console.log("apiUrl>>>>>[[[]]] ", apiUrl)

        let pathToStoreImage = `D:\\SALESDOOD_UPLOADED_IMAGES`
        // let pathToStoreImage = `C:\\fileupload_common\\BONDTIME_DOC_IMG`

        // const photoData = new FormData();
        // photoData.append('DOC_CODE', listItem.survey_no + "");
        // photoData.append('DOC_TYPE', 'DOCIMAGE');
        // photoData.append('IMAGEPATH', pathToStoreImage); // here we have added one more slash else this is result and 405 status error when sending to api "C:ileupload_commonBONDTIME_DOC_IMG"
        // photoData.append('IMGBASE64', 'test')
        // photoData.append('cmpcode', "premier")

        // photoData.append('file', {
        //     uri: URI,
        //     name: pickerResponse.assets[0].fileName,
        //     type:  mime.getType(URI),
        // })

        // const response = await sendXmlHttpRequest(photoData);

        // console.log("response =======", response, photoData)

        if (imageDescription == null) {

            Toast.error("Please enter description")
            return

        }

        console.log("imageDescription>>>>", imageDescription)

        try {
            // Create a FormData instance
            const formData = new FormData();
            formData.append('DOC_CODE', listItem.survey_no + "");
            formData.append('DOC_TYPE', 'DOCIMAGE');
            formData.append('IMAGEPATH', pathToStoreImage); // here we have added one more slash else this is result and 405 status error when sending to api "C:ileupload_commonBONDTIME_DOC_IMG"
            formData.append('IMGBASE64', imageDescription)
            formData.append('cmpcode', cmpCode)

            formData.append('file', {
                uri: URI,
                name: pickerResponse.assets[0].fileName,
                type: mime.getType(URI),
            })

            // Axios configuration
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },

            };

            console.log('formData +++>>>>.', formData, config)



            // Send the POST request
            const response = await axios.post(apiUrl, formData, config);

            // Handle response
            console.log('Response:', response.data);

            if (response.status === 200) {
                Toast.success(response.data.message)
                setURI(null)
                setImageDescription("")
                setPickerResponse(null)
            }
            // return response.data;
        } catch (error) {
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
    };

   


    return (
        <View style={{ height: "100%" }}>

            <HeaderUiNew name={'Sales Order'}
            />

            <View style={{ flexDirection: "row", borderBottomWidth: 1 }}>
                <TouchableOpacity onPress={() => setCurrentTab(1)} style={[getBackGroundColor(1), { padding: 8 }]}>
                    <Text style={getTextColor(1)}>Scope Of Work</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentTab(2)} style={[getBackGroundColor(2), { padding: 8 }]}>
                    <Text style={getTextColor(2)}>BOQ</Text>
                </TouchableOpacity>
            </View>

            {
                currentTab == 1 &&

                <View style={{ padding: 10 }}>



                    <ScrollView style={{ height: "75%", paddingBottom: 60 }}>

                        <Text style={{ fontWeight: 600, color: "#000000" }}>{listItem?.survey_no}</Text>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 3 }}>
                            <TouchableOpacity style={{ backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#000000", borderRadius: 4 }} onPress={() => setVisible(true)}><Image style={{ width: 20, height: 20 }} source={ic_camera} /><Text style={{ marginLeft: 4, padding: 4, color: "#000000", fontWeight: 500 }}>Select Image</Text></TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#4CAF50", borderRadius: 4 }} onPress={() => listItem.gps ? Linking.openURL(listItem.gps) : Toast.error("Location details not found")}><Image style={{ width: 20, height: 20 }} source={ic_view_location} /><Text style={{ marginLeft: 4, padding: 4, color: "#4CAF50", fontWeight: 500 }}>Navigate Location</Text></TouchableOpacity>
                        </View>

                        {
                            URI != null && URI != '' &&
                            <View style={{ flexDirection: "column" }}>
                                <Image
                                    style={{
                                        width: 100, height: 100,
                                        borderColor: '#ffffff',
                                        borderWidth: 4,
                                    }}
                                    source={{ uri: URI }}
                                />
                                <View style={{ flexDirection: "column" }}>
                                    <TextInput onChangeText={(text) => handleDescriptionImage(text)} placeholder="Enter description (mandatory)" style={{ marginLeft: 5 }}></TextInput>
                                    <View style={{ flexDirection: "row" }}>
                                        <TouchableOpacity onPress={() => uploadImage()} style={[styles.AcceptButton, { marginLeft: 15 }]}><Text style={styles.AcceptText}>Upload</Text></TouchableOpacity>
                                    </View>

                                </View>
                            </View>
                        }

                        <Text style={{ marginTop: 20, fontSize: 16, color: "#000000", fontWeight: "600" }}>TYPE OF JOB</Text>

                        <View style={{ backgroundColor: "#dedede", padding: 10, borderRadius: 5 }}>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                                <TouchableOpacity onPress={() => toggleCheckboxvalues_type_of_job("MAINTENANCE")} style={{ flexDirection: "row" }}>
                                    <View style={type_of_job == "MAINTENANCE" ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>MAINTENANCE</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues_type_of_job("INSPECTION")} style={{ flexDirection: "row" }}>
                                    <View style={type_of_job == "INSPECTION" ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>INSPECTION</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues_type_of_job("INSTALLATION")} style={{ flexDirection: "row" }}>
                                    <View style={type_of_job == "INSTALLATION" ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>INSTALLATION</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues_type_of_job("RECTIFICATION")} style={{ flexDirection: "row" }}>
                                    <View style={type_of_job == "RECTIFICATION" ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>RECTIFICATION</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues_type_of_job("CALL OUT")} style={{ flexDirection: "row" }}>
                                    <View style={type_of_job == "CALL OUT" ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>CALL OUT</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues_type_of_job("OTHERS")} style={{ flexDirection: "row" }}>
                                    <View style={type_of_job == "OTHERS" ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>OTHERS</Text>
                                </TouchableOpacity>

                            </View>

                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ color: "#000000" }}>FROM</Text>

                                    <TouchableOpacity style={{
                                        marginLeft: 10,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }} onPress={toggleFromDatePickerView}>
                                        <Text style={styles.TopHeaderText}>{fromData ? fromData : "--/--/--"}</Text>
                                        <Image style={styles.DropImg} source={require('../images/drop.png')}></Image>
                                    </TouchableOpacity>

                                    <DateTimePickerModal
                                        isVisible={isFromDatePickerVisible}
                                        mode="date"
                                        onConfirm={handleFromDateConfirm}
                                        onCancel={toggleFromDatePickerView}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ color: "#000000" }}>TO</Text>

                                    <TouchableOpacity style={{
                                        marginLeft: 10,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }} onPress={toggleToDatePickerView}>
                                        <Text style={styles.TopHeaderText}>{toData ? toData : "--/--/--"}</Text>
                                        <Image style={styles.DropImg} source={require('../images/drop.png')}></Image>
                                    </TouchableOpacity>

                                    <DateTimePickerModal
                                        isVisible={isToDatePickerVisibility}
                                        mode="date"
                                        onConfirm={handleToDateConfirm}
                                        onCancel={toggleToDatePickerView}
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ color: "#000000" }}>TIME ARRIVED</Text>

                                    <TouchableOpacity style={{
                                        marginLeft: 10,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }} onPress={toggleTimeArrivedPickerView}>
                                        <Text style={styles.TopHeaderText}>{timeArrived ? timeArrived : "--:--:--"}</Text>
                                        <Image style={styles.DropImg} source={require('../images/drop.png')}></Image>
                                    </TouchableOpacity>

                                    <DateTimePickerModal
                                        isVisible={isTimeArrivedPickerVisibility}
                                        mode="time"
                                        onConfirm={handleTimeArrivedConfirm}
                                        onCancel={toggleTimeArrivedPickerView}
                                    />
                                </View>

                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ color: "#000000" }}>TIME LEFT</Text>

                                    <TouchableOpacity style={{
                                        marginLeft: 10,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }} onPress={toggleTimeLeftPickerView}>
                                        <Text style={styles.TopHeaderText}>{timeLeft ? timeLeft : "--:--:--"}</Text>
                                        <Image style={styles.DropImg} source={require('../images/drop.png')}></Image>
                                    </TouchableOpacity>

                                    <DateTimePickerModal
                                        isVisible={isTimeLeftPickerVisibility}
                                        mode="time"
                                        onConfirm={handleTimeLeftConfirm}
                                        onCancel={toggleTimeLeftPickerView}
                                    />
                                </View>
                            </View>

                        </View>



                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ marginTop: 20, fontSize: 16, color: "#000000", fontWeight: "600" }}>ENGINEER/TECHNICIAN</Text>

                        </View>

                        <View style={{ backgroundColor: "#dedede", padding: 10, borderRadius: 5 }}>

                            <Text style={{ marginTop: 20, fontSize: 13, color: "#000000", fontWeight: "600" }}>FIRE ALARM/DETECTION SYSTEM</Text>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={{ flexDirection: "row", alignItems: "center", width: "60%" }}>
                                    <Text style={{ marginRight: 10, color: "#000000" }}>MAKE</Text>
                                    <View style={{ flexGrow: 1 }}>
                                        <TextInput onChangeText={(text) => handleChangeInputMake_fire_alarm_detection_system(text)} style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", height: 20, marginLeft: 0, marginTop: 5 }} value={setCheckboxObject.make_fire_alarm_detection_system}></TextInput>
                                    </View>
                                </View>

                                <TouchableOpacity style={{ width: "20%", flexDirection: "row", padding: 10 }} onPress={() => toggleCheckboxvaluesDetectionSystem("ADD")}>
                                    <View style={type_of_detection_system == "ADD" ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ marginLeft: 4, color: "#000000" }}>ADD</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ width: "20%", flexDirection: "row", padding: 10 }} onPress={() => toggleCheckboxvaluesDetectionSystem("CONV")}>
                                    <View style={type_of_detection_system == "CONV" ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ marginLeft: 4, color: "#000000" }}>CONV</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", width: "40%" }} >
                                    <Text style={{ color: "#000000" }}>QUANTITY</Text>
                                    <TextInput onChangeText={(text) => handleChangeInputMake_fire_alarm_detection_system_qty(text)} style={{ flexGrow: 1, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", height: 20, marginLeft: 10 }} value={setCheckboxObject.quantity_fire_alarm_detection_system} ></TextInput>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", width: "58%" }} >
                                    <Text style={{ color: "#000000" }}>NO. OF ZONE LOOPS</Text>
                                    <TextInput onChangeText={(text) => handleChangeInputMake_fire_alarm_detection_system_no_zone(text)} style={{ flexGrow: 1, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", height: 20, marginLeft: 10 }} value={setCheckboxObject.no_of_zone_loops_fire_alarm_detection_system_add} ></TextInput>
                                </View>
                            </View>

                            <Text style={{ marginTop: 20, fontSize: 13, color: "#000000", fontWeight: "600" }}>FIRE FIGHTING SYSTEM</Text>

                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                                <TouchableOpacity onPress={() => toggleCheckboxvalues("fire_extinguisher")} style={{ flexDirection: "row" }}>
                                    <View style={checkBoxObject.fire_extinguisher ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>FIRE EXTINGUISHER</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues("gas_sippression")} style={{ flexDirection: "row" }}>
                                    <View style={checkBoxObject.gas_sippression ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>GAS SIPPRESSION</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues("hose_reel")} style={{ flexDirection: "row" }}>
                                    <View style={checkBoxObject.hose_reel ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>HOSE REEL</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues("fire_pump")} style={{ flexDirection: "row" }}>
                                    <View style={checkBoxObject.fire_pump ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>FIRE PUMP</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues("spinkler")} style={{ flexDirection: "row" }}>
                                    <View style={checkBoxObject.spinkler ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>SPINKLER</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues("wet_dry_riser")} style={{ flexDirection: "row" }}>
                                    <View style={checkBoxObject.wet_dry_riser ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>WET/DRY RISER</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleCheckboxvalues("others_fire_fighting_system")} style={{ flexDirection: "row" }}>
                                    <View style={checkBoxObject.others_fire_fighting_system ? styles.checked : styles.not_checked}></View>
                                    <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>OTHERS</Text>
                                </TouchableOpacity>

                            </View>

                            <View style={{ marginTop: 10 }}>
                                <Text style={{ marginTop: 20, fontSize: 13, color: "#000000", fontWeight: "600" }}>CBU</Text>

                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ color: "#000000" }}>QTY</Text>
                                    <TextInput keyboardType="numeric" onChangeText={(text) => handleChangeInputCBU(text)} style={{ width: "30%", marginLeft: 10, backgroundColor: "#ffffff", height: 30 }} value={checkBoxObject.cbu_qty}></TextInput>
                                </View>

                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                                    <TouchableOpacity onPress={() => toggleCheckboxvalues("cbu_exit")} style={{ flexDirection: "row" }}>
                                        <View style={checkBoxObject.cbu_exit ? styles.checked : styles.not_checked}></View>
                                        <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>EXIT</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleCheckboxvalues("cbu_emergency")} style={{ flexDirection: "row" }}>
                                        <View style={checkBoxObject.cbu_emergency ? styles.checked : styles.not_checked}></View>
                                        <Text style={{ fontSize: 16, marginLeft: 10, color: "#000000" }}>EMERGENCY</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, }}>
                            <Text style={{ fontSize: 16, color: "#000000", fontWeight: "600" }}>JOB DETAILS</Text>
                            <TouchableOpacity onPress={() => setShowScopeOfWorkList(prev => !prev)} style={{ padding: 4, paddingHorizontal: 8, backgroundColor: "#dedede", marginLeft: 10, borderRadius: 4, flexDirection: "row", alignItems: "center" }}>
                                <Text style={{ color: "#000000", fontSize: 20, fontWeight: 700 }}>{arrayOfScopeOfWork?.length}</Text>
                                <Text style={{ color: "#000000", fontSize: 16, marginLeft: 10 }}>View List</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput onChangeText={(text) => handleChangeInputScope(text)} style={{ width: "100%", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", height: 40, marginLeft: 0, marginTop: 5 }} value={currentTypingScopeOfWork}></TextInput>
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>

                            <TouchableOpacity onPress={() => addNewScopeRow()} style={{ padding: 4, paddingHorizontal: 10, backgroundColor: "#000000", borderRadius: 4 }}>
                                <Text style={{ color: "#ffffff" }}>Add</Text>
                            </TouchableOpacity>

                        </View>

                    </ScrollView>
                </View>
            }

            {
                currentTab == 2 &&

                <View style={{ padding: 10 }}>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                        <Text style={{ fontSize: 16, color: "#000000", fontWeight: "600" }}>ADD NEW MATERIAL</Text>
                        <TouchableOpacity onPress={() => setShowBOQList(prev => !prev)} style={{ padding: 4, paddingHorizontal: 8, backgroundColor: "#dedede", marginLeft: 10, borderRadius: 4, flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ color: "#000000", fontWeight: 700, fontSize: 20 }}>{arrayOfBOQ?.length}</Text>
                            <Text style={{ color: "#000000", marginLeft: 10, fontSize: 16 }}>View List</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TextInput onChangeText={(text) => handleChangeInputBOQ(text)} style={{ width: "100%", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", height: 40, marginLeft: 0, marginTop: 5 }} value={currentTypingBOQ}></TextInput>
                    </View>
                    {bOQStockData && currentTypingBOQ &&
                        <FlatList
                            data={bOQStockData}
                            keyExtractor={(item) => item.Code}
                            style={{ height: 200, backgroundColor: "#f7f7f7" }}
                            ListHeaderComponent={() => {
                                return <View style={{ flexDirection: "row", backgroundColor: "#000000" }}>
                                    <Text style={{ width: "50%", padding: 4, color: "#ffffff" }}>Code & Description</Text>
                                    <Text style={{ width: "50%", padding: 4, color: "#ffffff" }}>Brand & Category</Text>
                                </View>
                            }}
                            renderItem={({ item, index }) => {
                                return (
                                    <TouchableOpacity onPress={() => addNewBOQRow(item)} style={{ padding: 8, flexDirection: "row", backgroundColor: index % 2 == 0 ? "#dedede" : "#f7f7f7" }}>
                                        <View style={{ width: "50%" }}>
                                            <View style={{ display: "flex" }}>
                                                <Text style={{ padding: 4, color: "#4CAF50", fontWeight: 700 }}>{item.Code} </Text>
                                            </View>
                                            <Text style={{ padding: 4, color: "#000000" }}>{item.Description} </Text>
                                        </View>
                                        <View style={{ width: "50%" }}>

                                            <Text style={{ padding: 4, color: "#4CAF50", fontWeight: 700 }}>{item.Group}</Text>
                                            <Text style={{ padding: 4, color: "#000000" }}>{item.Category}</Text>
                                        </View>

                                    </TouchableOpacity>
                                )
                            }}
                        />
                    }




                </View>
            }

            {
                showScopeOfWorkList &&
                <View style={{ position: "absolute", zIndex: 3, padding: 10, height: "100%", backgroundColor: "#00000080" }}>
                    <View style={{ flexDirection: "row", backgroundColor: "#ffffff", justifyContent: "space-between", alignItems: "center", padding: 8 }}>
                        <Text style={{ color: "#000000", fontWeight: 700 }}>JOB DETAILS LIST</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowScopeOfWorkList(prev => !prev)}><Text style={{ color: "#ffffff" }}>Close</Text></TouchableOpacity>
                    </View>
                    <FlatList data={arrayOfScopeOfWork}
                        keyExtractor={(item) => item.id}
                        style={{ backgroundColor: "#ffffff", height: 100 }}
                        renderItem={({ item }) => (

                            <View style={{ flexDirection: "row", backgroundColor: "#ffffff", marginVertical: 4 }}>
                                <Text style={{ width: "15%", backgroundColor: "#ffffff", padding: 4 }}>{item.id}</Text>

                                {
                                    editRow?.id == item.id ?
                                        <View style={{ width: "65%" }}>
                                            <TextInput onChangeText={(text) => handleChangeDescriptionInScopeList(text, item)} style={{ padding: 4, backgroundColor: "#ffffff", borderWidth: 1, height: 30 }} value={item.description}></TextInput>
                                            <View style={{ flexDirection: "row", justifyContent: "flex-end", width: "100%", padding: 4 }}>
                                                <TouchableOpacity onPress={() => setEditRow(null)} style={{ backgroundColor: "#dedede", paddingVertical: 5, paddingHorizontal: 10 }}><Text style={{ color: "#000000" }}>Close</Text></TouchableOpacity>

                                            </View>
                                        </View>

                                        :
                                        <Text style={{ width: "65%", padding: 4 }}>{item.description}</Text>
                                }
                                <View style={{ width: "20%", flexDirection: "row", padding: 4 }}>
                                    <TouchableOpacity onPress={() => setEditRow(item)}><Image style={{ width: 20, height: 20, padding: 10 }} source={require('../images/ic_edit.png')} /></TouchableOpacity>
                                    <TouchableOpacity onPress={() => deleteItemInScopeList(item)}><Image style={{ width: 20, height: 20, padding: 10, marginLeft: 10 }} source={ic_delete} /></TouchableOpacity>
                                </View>
                            </View>
                        )}
                        ListHeaderComponent={() => {
                            return <View style={{ flexDirection: "row", backgroundColor: "#dedede" }}>
                                <Text style={{ width: "15%", padding: 4 }}>Sl.No.</Text>
                                <Text style={{ width: "65%", padding: 4 }}>Description</Text>
                                <Text style={{ width: "20%", padding: 4 }}>Actions</Text>
                            </View>
                        }}
                    />
                </View>
            }
            {
                showBOQList &&

                <View style={{ position: "absolute", zIndex: 3, height: "100%", padding: 20, backgroundColor: "#00000080" }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#ffffff", padding: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: 700, color: "#000000" }}>BOQ</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowBOQList(prev => !prev)}><Text style={{ color: "#ffffff" }}>Close</Text></TouchableOpacity>
                    </View>
                    <FlatList data={arrayOfBOQ}
                        keyExtractor={(item) => item.id}
                        style={{ backgroundColor: "#ffffff", height: "50%" }}
                        renderItem={({ item }) => (

                            <View style={{ flexDirection: "row", backgroundColor: "#ffffff", margin: 2, borderWidth: 1, borderRadius: 5, borderColor: "#4CAF50" }}>
                                <View style={{ width: "15%", backgroundColor: "#4CAF50", flexDirection: "column", alignItems: "center", paddingVertical: 10 }}>
                                    <Text style={{ display: "flex", alignItems: "center", color: "#ffffff" }}>{item.id}</Text>
                                    {/* <TouchableOpacity style={{ width: 26, height: 26, backgroundColor: "#ffffff", borderRadius: 13, flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 5 }}><Image style={{ width: 20, height: 20, padding: 10 }} source={require('../images/ic_edit.png')} /></TouchableOpacity> */}
                                    <TouchableOpacity onPress={() => deleteItemInBOQList(item)} style={{ width: 26, height: 26, backgroundColor: "#ffffff", borderRadius: 13, flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 5 }}><Image style={{ width: 20, height: 20, padding: 10 }} source={ic_delete} /></TouchableOpacity>
                                </View>

                                <View style={{ width: "85%", paddingHorizontal: 4, paddingVertical: 10 }}>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}><Text style={{ width: "27%", color: "#000000" }}>Code :</Text><Text style={{ color: "#000000", fontWeight: 500, width: "73%" }}>{item.code}</Text></View>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}><Text style={{ width: "27%", color: "#000000" }}>Description :</Text><Text style={{ color: "#000000", fontWeight: 500, width: "73%" }}>{item.description}</Text></View>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}><Text style={{ width: "27%", color: "#000000" }}>Group :</Text><Text style={{ color: "#000000", fontWeight: 500, width: "73%" }}>{item.group}</Text></View>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}><Text style={{ width: "27%", color: "#000000" }}>Category :</Text><Text style={{ color: "#000000", fontWeight: 500, width: "73%" }}>{item.category}</Text></View>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}><Text style={{ width: "27%", color: "#000000" }}>Qty :</Text><TextInput onChangeText={(text) => handleChangeInputQtyInBOQList(text, item)} style={{ width: "73%", height: 20, backgroundColor: "#ffffff", borderWidth: 1, width: 100, padding: 0 }} value={item.qty_needed}></TextInput></View>
                                </View>

                            </View>
                        )}
                        ListHeaderComponent={() => {
                            return <View style={{ flexDirection: "row", width: "100%" }}>
                                <Text style={{ width: "15%", padding: 4, fontWeight: 700, fontSize: 16, color: "#000000" }}>Sl.No.</Text>
                                <Text style={{ width: "85%", padding: 4, textAlign: "center", fontWeight: 700, fontSize: 16, color: "#000000" }}>Item</Text>
                            </View>
                        }}
                    />
                </View>
            }

            <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />





            <View style={{ backgroundColor: "#dedede", position: "absolute", bottom: 0, width: "100%", padding: 10, flexDirection: "row", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => sendScopeAndBOQToAPI()} style={{ backgroundColor: "#2196F3", width: "50%", flexDirection: "row", justifyContent: "center", borderRadius: 4 }}>
                    <Text style={{ color: "#ffffff", padding: 10, fontWeight: 700, fontSize: 16 }}>SUBMIT</Text>
                </TouchableOpacity>
            </View>

            <ImagePickerModal
                isVisible={visible}
                onClose={() => setVisible(false)}
                onImageLibraryPress={onImageLibraryPress}
                // onCameraPress={onCameraPress}
                handleTakePhoto={handleTakePhoto}
            />

        </View>
    )

}

const styles = StyleSheet.create({
    checked: {
        borderWidth: 1,
        borderColor: "#000000",
        backgroundColor: "#ffa500",
        width: 20,
        height: 20
    },
    not_checked: {
        borderWidth: 1,
        borderColor: "#000000",
        width: 20,
        height: 20

    },
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
        // borderTopLeftRadius: 18,
        // borderTopRightRadius: 18,
        backgroundColor: '#EFEFEF',
        height: Dimensions.get('window').height - 70

    },

    TopHeader: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    TopHeaderCols: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6
    },
    TopHeaderText: {
        fontSize: 16,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
    },
    AcceptButton: {
        backgroundColor: '#30B3A4',
        padding: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
        right: 10,
        bottom: 0
    },
    AcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },

    TableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        width: '100%',
        // backgroundColor: 'red'
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        // flex: 1,
        backgroundColor: '#D0D0D0',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 85,
        color: '#2b2b2b',
        fontFamily: 'Lexend-Bold',
        // borderTopWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        // borderColor: '#dbdbdb',

    },
    dataCell: {
        // flex: 1,
        // backgroundColor: '#F3F3F3',
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: 85,
        // borderTopWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        // borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },
    ScrollView: {
        // height: Dimensions.get('window').height - 300,
        // marginBottom: 8,
        width: '100%',

        paddingBottom: 250,
        // backgroundColor: 'green'
    },

    CashChequeText: {
        color: '#2b2b2b',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
        paddingVertical: 6
    },

    DropImg: {
        width: 25,
        height: 25, marginHorizontal: 4
    },


    closeButton: {
        backgroundColor: '#000000',
        // padding: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },

    PrintAcceptButton: {
        backgroundColor: '#30B3A4',
        // padding: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    PrintAcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },


})

export default InspectionMaintenanceReport