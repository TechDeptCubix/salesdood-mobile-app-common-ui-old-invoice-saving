import React, { useEffect, useState, useCallback, useRef } from "react";
import { TouchableOpacity, View, Text, FlatList, StyleSheet, Dimensions, Image, Alert, ScrollView, Linking, KeyboardAvoidingView, Platform, Modal } from "react-native";
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
import RNFS from 'react-native-fs';

import ToastManager, { Toast } from 'toastify-react-native'

import { ImagePickerModal } from '../pages/ImagePickerModal'

import { Camera, useCameraDevice } from 'react-native-vision-camera';

import * as ImagePicker from 'react-native-image-picker';
import CheckBox from '@react-native-community/checkbox';
import TableScreen from './fire_and_safety/TableScreen';
import TableRecyclerView from './fire_and_safety/TableRecyclerView';
import TableScreenBackup from "./fire_and_safety/TableScreenBackup"
import EquipmentItem from "../pages/EquipmentItem.js"
import SignaturePad from "../pages/SignaturePad.js"
import { da } from "date-fns/locale";
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

function ScopeAndBOQ({ route, navigation }) {

    const [showPreview, setShowPreview] = useState(false)
    const [currentSignPersonNumber, setCurrentSignPersonNumber] = useState(0)
    const [signature_1, setSignature_1] = useState(null)
    const [signature_2, setSignature_2] = useState(null)
    const [signature_3, setSignature_3] = useState(null)
    const [signature_4, setSignature_4] = useState(null)
    const [modalVisibleFault, setModalVisibleFault] = useState(false);
    const [modalVisibleReport, setModalVisibleReport] = useState(false);
    const [modalVisibleSignature, setModalVisibleSignature] = useState(false);

    const [imageDescription, setImageDescription] = useState(null)

    const pickerResponseRef = useRef()
    const URIref = useRef()

    const [pickerResponse, setPickerResponse] = useState(null);

    const device = useCameraDevice('back');

    const [URI, setURI] = useState(null)

    const [visible, setVisible] = useState(false);

    const [reference_number, setReferenceNumber] = useState("");

    const [listOfStaticDetails, setListOfStaticDetails] = useState(null)

    const [list_of_equipments, setListOfEquipments] = useState(null)

    const [listOfFaultsComments, setListOfFaultsComments] = useState(null)

    const { listItem, department_from_parent } = route.params


    // starting  .....

    const initialTopPanelObject = {
        date: listItem?.scheduledDate,
        survey_no: listItem.survey_no,
        survey_report_for: "",
        building_name: "",
        contact_person: "",
        owner_real_estate: "",
        mobile_number: "",
        location: "",
        e_mail: "",
        building_details: "",
        number_of_rooms: "",
        number_of_kitchens: "",
        number_of_other_rooms: "",
        watchman_name: "",
        watchman_mobile: "",
        survey_done_by_name_1: "",
        survey_done_by_signature_1: "",
        survey_done_by_name_2: "",
        survey_done_by_signature_2: "",
        survey_done_by_name_3: "",
        survey_done_by_signature_3: "",
        checked_and_verified_by_name_of_supervisor: "",
        checked_and_verified_by_signature_of_supervisor: "",
        notes_number_type_of_rooms_in_each_floor: "",
        notes_any_other_comments: "",

    }
    const [topPanelObject, setTopPanelObject] = useState(initialTopPanelObject)

    const handleInputTopPanel = (name, text) => {



        let newObject = { ...topPanelObject, [name]: text }

        console.log("name, text ", name, text, newObject)

        setTopPanelObject(prev => ({ ...prev, [name]: text }))

    }

    useEffect(()=>{

        console.log("URI updated-->>" , URI)

    },[URI])




    // const handleInputFirstTable = (mainSlno, subSlno, name_from_typing, text) => {

    //     console.log("mainSlno subSlno text", mainSlno, subSlno, name_from_typing, text)

    //     let filteredMainSlno = list_of_equipments.map((item) => {
    //         if (item.mainSlno == mainSlno) {

    //             if (item.subSlno == subSlno) {
    //                 return { ...item, [name_from_typing]: text }
    //             } else {
    //                 return item
    //             }

    //         } else {
    //             return item
    //         }
    //     })

    //     console.log("filteredMainSlno -->", filteredMainSlno)

    //     setListOfEquipments(filteredMainSlno)


    // }

    const handleInputFirstTable = useCallback(
        (mainSlno, subSlno, name_from_typing, text) => {
            console.log("mainSlno subSlno text", mainSlno, subSlno, name_from_typing, text);

            const updatedList = list_of_equipments.map((item) => {
                if (item.mainSlno === mainSlno) {
                    if (item.subSlno === subSlno) {
                        return { ...item, [name_from_typing]: text };
                    }
                }
                return item;
            });

            console.log("filteredMainSlno -->", updatedList);

            setListOfEquipments(updatedList);
        },
        [list_of_equipments, setListOfEquipments]
    );


    useEffect(() => {

        console.log("pickerResponse>>++==", pickerResponse)
        if (pickerResponse?.assets) {

            pickerResponseRef.current = pickerResponse

            if (pickerResponse.assets[0].uri) {
                setURI(pickerResponse.assets[0].uri)
                URIref.current = pickerResponse.assets[0].uri
            }

            setVisible(false)
        }

    }, [pickerResponse])

    const checkIfSurveyHasDetails = () => {

        axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_DETAILSMAIN/${listItem.survey_no}/main`).then((res) => {

            setListOfEquipments(res.data)
            setReferenceNumber((res.data[0]).Ref_no)

            console.log("res data get details of main------>>++>>>>", (res.data[0]).Ref_no, listItem.survey_no, res.data)


            axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_DETAILSSUB/${listItem.survey_no}/MAIN`).then((res) => {
                setListOfFaultsComments(res.data)





                axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_DETAILSSUB2/${listItem.survey_no}/MAIN`).then((res) => {
                    setListOfStaticDetails(res.data)





                }).catch((err) => {


                })


            }).catch((err) => {


            })
        }).catch((err) => {


        })
    }

    const startingMethods = async () => {

        checkIfSurveyHasDetails()

    }

    useEffect(() => {

        if (listOfStaticDetails) {
            if (listOfStaticDetails[0]) {

                let detailsFromAPI = listOfStaticDetails[0]

                console.log("detailsFromAPI--->", detailsFromAPI)

                let ourObject = {
                    date: listItem?.scheduledDate,

                    survey_no: listItem.survey_no,
                    survey_report_for: detailsFromAPI.survey_report_for,
                    building_name: detailsFromAPI.building_name,
                    contact_person: detailsFromAPI.contact_person,
                    owner_real_estate: detailsFromAPI.owner_real_estate,
                    mobile_number: detailsFromAPI.mobile_number,
                    location: detailsFromAPI.location,
                    e_mail: detailsFromAPI.e_mail,
                    building_details: detailsFromAPI.building_details,
                    number_of_rooms: detailsFromAPI.number_of_rooms,
                    number_of_kitchens: detailsFromAPI.number_of_kitchens,
                    number_of_other_rooms: detailsFromAPI.number_of_other_rooms,
                    watchman_name: detailsFromAPI.watchman_name,
                    watchman_mobile: detailsFromAPI.watchman_mobile,
                    survey_done_by_name_1: detailsFromAPI.survey_done_by_name_1,
                    survey_done_by_signature_1: detailsFromAPI.survey_done_by_signature_1,
                    survey_done_by_name_2: detailsFromAPI.survey_done_by_name_2,
                    survey_done_by_signature_2: detailsFromAPI.survey_done_by_signature_2,
                    survey_done_by_name_3: detailsFromAPI.survey_done_by_name_3,
                    survey_done_by_signature_3: detailsFromAPI.survey_done_by_signature_3,
                    checked_and_verified_by_name_of_supervisor: detailsFromAPI.checked_and_verified_by_name_of_supervisor,
                    checked_and_verified_by_signature_of_supervisor: detailsFromAPI.checked_and_verified_by_signature_of_supervisor,
                    notes_number_type_of_rooms_in_each_floor: detailsFromAPI.notes_number_type_of_rooms_in_each_floor,
                    notes_any_other_comments: detailsFromAPI.notes_any_other_comments,

                }
                setTopPanelObject(ourObject)

                let newCheckbox_survey_for = checkboxList_survey_for.map((item) => {
                    if (item.name == detailsFromAPI.survey_report_for) {
                        return { ...item, status: true }
                    } else {
                        return item
                    }
                })

                setCheckboxList_survey_for(newCheckbox_survey_for)


            }
        }

    }, [listOfStaticDetails])
    useEffect(() => {

        startingMethods()

    }, [])

    const initial_checkboxList = [

        {
            name: "fire alarm system -addressable",
            status: false,
            category: "A"
        },
        {
            name: "conventional",
            status: false,
            category: "A"
        },
        {
            name: "aman/weqayah/hassantik status:connected",
            status: false,
            category: "A"
        },
        {
            name: "not connected",
            status: false,
            category: "A"
        },
        {
            name: "face description- common for whole plot",
            status: false,
            category: "A"
        },
        {
            name: "exclusive to the unit/shop",
            status: false,
            category: "A"
        },

        {
            name: "emergency lighting system-self contained",
            status: false,
            category: "B"
        },
        {
            name: "self monitoring",
            status: false,
            category: "B"
        },
        {
            name: "central battery",
            status: false,
            category: "B"
        },
        {
            name: "FIRE PUMP SET CAPACITY: UL LISTED:",
            status: false,
            category: "C"
        },

        {
            name: "NON UL:",
            status: false,
            category: "C"
        },

        {
            name: "BRAND PUMP ROOM LOCATION-ABOVE GROUND",
            status: false,
            category: "C"
        },

        {
            name: "UNDER GROUND",
            status: false,
            category: "C"
        },

        {
            name: "PUMP TYPE-HORIZONTAL END SUCTION",
            status: false,
            category: "C"
        },
        {
            name: "HORIZONTAL SPLIT CASE",
            status: false,
            category: "C"
        },
        {
            name: "VERTICAL TURBINE",
            status: false,
            category: "C"
        },
        {
            name: "PUMP ORIENATION -POSITIVE SUCTION",
            status: false,
            category: "C"
        },
        {
            name: "NEGATIVE",
            status: false,
            category: "C"
        },
        {
            name: "NEGATIVE",
            status: false,
            category: "C"
        },
        {
            name: "SPARE SPRINKLER CABINET AVAILABILITY & PARTS INSIDE:",
            status: false,
            category: "C"
        },


    ]



    const [checkboxList, setCheckboxList] = useState(initial_checkboxList)

    const initial_checkboxList_survey_for =
        [{
            name: "RESIDENTIAL & COMMERCIAL BUILDING",
            status: false
        },
        {
            name: "LABOUR ACCOMODATION",
            status: false
        },
        {
            name: "SINGLE WAREHOUSE, SHOP & OFFICES WITH FIRE PROTECTION SYSTEM CONNECTED TO COMMON PUMP",
            status: false
        },
        {
            name: "WAREHOUSE COMPLEX",
            status: false
        },
        {
            name: "FUEL AND OIL",
            status: false
        },

        ]


    const [checkboxList_survey_for, setCheckboxList_survey_for] = useState(initial_checkboxList_survey_for)


    const clickedOnCheckBox = useCallback((name_of_checkbox) => {
        console.log("category_name, name_of_checkbox", name_of_checkbox);

        setCheckboxList(prevList =>
            prevList.map(itemFind => {
                if (itemFind.name?.trim() === name_of_checkbox?.trim()) {
                    return { ...itemFind, status: !itemFind.status };
                }
                return itemFind;
            })
        );
    }, []);

    const clickedOnCheckBox_survey_for = (name_from_click) => {

        console.log("name_from_click", name_from_click)

        let newCheckList = checkboxList_survey_for.map((itemFind) => {
            if (itemFind.name == name_from_click) {
                return { ...itemFind, status: !itemFind.status }
            } else {
                return { ...itemFind, status: false }
            }
        })

        console.log("newCheckList_survey_for >>>+++", JSON.stringify(newCheckList, null, 2))

        setCheckboxList_survey_for(newCheckList)

    }





    // ending


    const postSurveyJson = () => {

        const surveyData = list_of_equipments.map((item) => {

            return {
                CmpCode: "SAFEFIRE",
                mode: "EDIT", // AFTER ACCEPT ONLY EDIT  ACCEPT JUST AFTER ACCEPTING 
                survey_no: topPanelObject.survey_no,
                deptno: "MAIN",
                ref_no: reference_number,
                mainSlno: item.mainSlno,
                subSlno: item.subSlno,
                heading: item.heading ? item.heading : "",
                equipment_details: item.equipment_details,
                type_of_question: item.type_of_question,
                value: checkboxList.filter((itemFilCat) => itemFilCat.category == item.mainSlno && item.subSlno == "1.1").filter((item) => item.status) ? (checkboxList.filter((itemFilCat) => itemFilCat.category == item.mainSlno && item.subSlno == "1.1").filter((item) => item.status)).map(item => item.name).join(',') : "",
                brand: item.brand,
                Qty: item.Qty,
                spec: item.spec,
                remarks: item.remarks,
                imagepath: "/images/survey/gen1.jpg"
            }
        })


        let arrayToSend = JSON.stringify(surveyData)

        console.log("serializedData main>>>>", arrayToSend)



        axios.post(`https://cubixweberp.com:213/api/Survey_DetailsMain`, arrayToSend, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {

            console.log("res main success-->>+++", res)

            // call api to save second table 

            const bottomTableDataToPass = listOfFaultsComments.map((item) => {

                return {
                    CmpCode: "SAFEFIRE",
                    mode: "EDIT",
                    survey_no: topPanelObject.survey_no,
                    deptno: "MAIN",
                    mainSlno: item.mainSlno,
                    Ref_no: reference_number,
                    item_description: item.item_description,
                    location: item.location,
                    reason_for_fault: item.reason_for_fault,
                    rectification_time: item.rectification_time,
                    remarks_install_replace_materials_required: item.remarks_install_replace_materials_required,
                    materials_required_photo: item.materials_required_photo
                }
            });

            let serializedData = JSON.stringify(bottomTableDataToPass)

            console.log("serializedData sub>>>>", serializedData)

            axios.post(`https://cubixweberp.com:213/api/Survey_DetailsSub`, serializedData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then((res) => {


                console.log("res SUB success-->>+++", res.data)

                const emptySurveyData = [
                    {
                        CmpCode: "SAFEFIRE",
                        mode: "EDIT",
                        survey_no: listItem.survey_no,
                        deptno: "MAIN",
                        Ref_no: reference_number,
                        mainSlno: listOfStaticDetails[0].mainSlno,
                        survey_report_for: (checkboxList_survey_for.filter((item) => item.status))[0].name,
                        building_name: topPanelObject.building_name,
                        contact_person: topPanelObject.contact_person,
                        owner_real_estate: topPanelObject.owner_real_estate,
                        mobile_number: topPanelObject.mobile_number,
                        location: topPanelObject.location,
                        e_mail: topPanelObject.e_mail,
                        building_details: topPanelObject.building_details,
                        number_of_rooms: topPanelObject.number_of_rooms,
                        number_of_kitchens: topPanelObject.number_of_kitchens,
                        number_of_other_rooms: topPanelObject.number_of_other_rooms,
                        watchman_name: topPanelObject.watchman_name,
                        watchman_mobile: topPanelObject.watchman_mobile,
                        survey_done_by_name_1: topPanelObject.survey_done_by_name_1,
                        survey_done_by_signature_1: topPanelObject.survey_done_by_signature_1,
                        survey_done_by_name_2: topPanelObject.survey_done_by_name_2,
                        survey_done_by_signature_2: topPanelObject.survey_done_by_signature_2,
                        survey_done_by_name_3: topPanelObject.survey_done_by_name_3,
                        survey_done_by_signature_3: topPanelObject.survey_done_by_signature_3,
                        checked_and_verified_by_name_of_supervisor: topPanelObject.checked_and_verified_by_name_of_supervisor,
                        checked_and_verified_by_signature_of_supervisor: topPanelObject.checked_and_verified_by_signature_of_supervisor,
                        notes_number_type_of_rooms_in_each_floor: topPanelObject.notes_number_type_of_rooms_in_each_floor,
                        notes_any_other_comments: topPanelObject.notes_any_other_comments,
                    }
                ];

                console.log("emptySurveyData --->>>", emptySurveyData)

                let serializedDataEmptyForm = JSON.stringify(emptySurveyData)

                axios.post(`https://cubixweberp.com:213/api/Survey_DetailsSub2`, serializedDataEmptyForm, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then((res) => {
                    Toast.success("Successfully Saved");
                    console.log("res sub 2-->>+++ success", res.data)

                }).catch((err) => {

                })


            }).catch((err) => {
                console.log("error failure static-->>+++", err)
            })


            // now main data


        }).catch((err) => {
            console.log("error failure main-->>+++", err)
        })

    }


    const keyExtractor = useCallback(
        (item) => (item.mainSlno + item.subSlno).toString(),
        []
    );


    const renderEquipmentItem = useCallback(
        ({ item }) => (
            <EquipmentItem
                item={item}
                styles={styles}
                checkboxList={checkboxList}
                clickedOnCheckBox={clickedOnCheckBox}
                handleInputFirstTable={handleInputFirstTable}
                uploadImage={uploadImage}
                setVisible={setVisible}
                URI={URI}
            />
        ),
        [styles, checkboxList, clickedOnCheckBox, handleInputFirstTable,URI]
    );

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

    const handleTakePhoto = async () => {
        try {
            const cameraPermission = await Camera.requestCameraPermission();
            console.log('Camera Permission:', cameraPermission); // Check permission status
            if (cameraPermission !== 'granted') {
                Alert.alert('Camera access denied');
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

    // const uploadImage = async (mainNumber, subNumber) => {

    //     console.log("imageDescription>>>> mainNumber, subNumber", mainNumber, subNumber)

    //     const apiUrl = `http://safefire.dyndns.org:90/api/Image/upload`


    //     let pathToStoreImage = `D:\\SALESDOOD_UPLOADED_IMAGES`


    //     console.log("imageDescription>>>>", imageDescription)

    //     try {
    //         // Create a FormData instance
    //         const formData = new FormData();
    //         formData.append('DOC_CODE', listItem.survey_no + "_"+ mainNumber + subNumber);
    //         formData.append('DOC_TYPE', 'DOCIMAGE');
    //         formData.append('IMAGEPATH', pathToStoreImage); // here we have added one more slash else this is result and 405 status error when sending to api "C:ileupload_commonBONDTIME_DOC_IMG"
    //         formData.append('IMGBASE64', "test")
    //         formData.append('cmpcode', "SAFEFIRE")

    //         formData.append('file', {
    //             uri: URI,
    //             name: pickerResponse.assets[0].fileName,
    //             type: mime.getType(URI),
    //         })

    //         // Axios configuration
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data'
    //             },

    //         };

    //         console.log('formData +++>>>>.', formData, config)


    //         return

    //         // Send the POST request
    //         const response = await axios.post(apiUrl, formData, config);

    //         // Handle response
    //         console.log('Response:', response.data);

    //         if (response.status === 200) {
    //             Toast.success(response.data.message)
    //             setURI(null)
    //             setImageDescription("")
    //             setPickerResponse(null)
    //         }
    //         // return response.data;
    //     } catch (error) {
    //         // Handle error
    //         console.error('Error uploading data:>>>>+++', error);
    //         Toast.error('Some error occured')
    //         // throw error;

    //         if (error.response) {

    //             console.log("err is text 1 ++ ", error.response);
    //             //do something

    //         } else if (error.request) {

    //             //do something else
    //             console.log("err is text 2 ++ >>>>>>>>>++++", error.request);

    //         } else if (error.message) {

    //             console.log("err is text 3 ++ ", error.message);
    //             //do something other than the other two

    //         }
    //     }
    // };

    const base64ToPickerFile = async (base64Data, fileName = 'image.jpg') => {
        const [meta, base64] = base64Data.split(',');
        const mime = meta.match(/data:(.*);base64/)[1];

        const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

        try {
            await RNFS.writeFile(filePath, base64, 'base64');

            return {
                assets: [
                    {
                        uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
                        type: mime,
                        fileName,
                        fileSize: base64.length * (3 / 4), // approximate
                        base64,
                        width: null, // optional: you can get it using Image.getSize
                        height: null,
                    },
                ],
            };
        } catch (err) {
            console.error('Error writing file', err);
            throw err;
        }
    };

    const base64ToPickerMock = async (base64Data, originalPath = null) => {
        const [meta, base64] = base64Data.split(',');
        const mimeMatch = meta.match(/data:(.*);base64/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const ext = mime.split('/')[1] || 'jpg';


        const fileName = `rn_image_picker_lib_temp_.${ext}`;
        const cacheDir = `${RNFS.CachesDirectoryPath}`;
        const filePath = `${cacheDir}/${fileName}`;
        const uri = Platform.OS === 'android' ? `file://${filePath}` : filePath;

        try {
            // Save base64 image to file
            await RNFS.writeFile(filePath, base64, 'base64');

            // Get dimensions
            const dimensions = await new Promise((resolve) => {
                Image.getSize(
                    uri,
                    (width, height) => resolve({ width, height }),
                    () => resolve({ width: null, height: null })
                );
            });

            // Calculate file size
            const fileStat = await RNFS.stat(filePath);
            const fileSize = parseInt(fileStat.size, 10);

            // Mock originalPath if not passed
            const fallbackOriginalPath = `/sdcard/DCIM/Camera/${fileName}`;

            return {
                assets: [
                    {
                        fileName,
                        fileSize,
                        width: dimensions.width,
                        height: dimensions.height,
                        type: mime,
                        uri,
                        originalPath: originalPath || fallbackOriginalPath,
                    },
                ],
            };
        } catch (error) {
            console.error('Error converting base64 to picker mock:', error);
            throw error;
        }
    };

    const uploadImage = useCallback((mainNumber, subNumber) => {
        console.log("imageDescription>>>> mainNumber, subNumber", mainNumber, subNumber);

        const apiUrl = `http://safefire.dyndns.org:90/api/Image/upload`;
        const pathToStoreImage = `D:\\SALESDOOD_UPLOADED_IMAGES`;

        console.log("imageDescription>>>>", imageDescription);

        console.log("pickerResponseRef.current++ URIref", pickerResponseRef.current, URIref.current)

        try {
            if (!(pickerResponseRef.current?.assets?.[0])) {
                Toast.error("No image selected");
                console.log("imageDescription>>>> No image selected", imageDescription);
                return;
            }

            const formData = new FormData();

            formData.append('DOC_CODE', listItem.survey_no + "_" + mainNumber + "_" + subNumber);
            formData.append('DOC_TYPE', 'DOCIMAGE');
            formData.append('IMAGEPATH', pathToStoreImage);
            formData.append('IMGBASE64', 'test'); // Adjust as needed
            formData.append('cmpcode', 'SAFEFIRE');

            formData.append('file', {
                uri: URIref.current, // earlier URI
                name: pickerResponseRef.current.assets[0].fileName,
                type: mime.getType(URIref.current),
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            console.log("file.uri Scope and BOQ", URIref.current, pickerResponseRef.current.assets[0].fileName, mime.getType(URIref.current) )

            console.log('formData +++>>>>.', formData, config);

            //return; // ← If testing only, keep this; else remove to continue

            axios.post(apiUrl, formData, config).then((response) => {

                if (response.data.message?.trim() == "Image uploaded successfully.") {

                    console.log('Response:>>>++ inside++', response.data.message);
                    Toast.success(response.data.message);
                    Alert.alert("Image uploaded successfully.")
                    setURI(null);
                    setImageDescription("");
                    setPickerResponse(null);

                    pickerResponseRef.current = null
                    URIref.current = null
                }
            }).catch((err) => {
                console.log('err inside++>>', err.message);
            })


        } catch (error) {
            console.error('Error uploading data:>>>>+++....', error);
            Toast.error('Some error occurred');

            if (error.response) {
                console.log("Error response:", error.response);
            } else if (error.request) {
                console.log("Error request:", error.request);
            } else if (error.message) {
                console.log("Error message:", error.message);
            }
        }
    }, []);


    

    const uploadSignature = async (numberFromUpload) => {
        try {

            let signature = ""

            if (numberFromUpload == 1) {
                signature = signature_1
            }

            if (numberFromUpload == 2) {
                signature = signature_2
            }

            if (numberFromUpload == 3) {
                signature = signature_3
            }

            if (numberFromUpload == 4) {
                signature = signature_4
            }

            

            pickerResponseRef.current = await base64ToPickerMock(signature)

            console.log("pickerResponseRef.current.uri >>", pickerResponseRef.current.assets[0].uri)

            URIref.current = pickerResponseRef.current.assets[0].uri

            console.log(JSON.stringify(pickerResponseRef.current, null, 2));

            uploadImage(`numberFromUpload_${numberFromUpload}`, "")

            // Prepare FormData
            // const formData = new FormData();
            // formData.append('file', {
            //     uri: Platform.OS === 'ios' ? filePath : `file://${filePath}`, // iOS doesn't need "file://"
            //     name: fileName,
            //     type: 'image/png',
            // });

            // // Upload to your API
            // const res = await axios.post('https://your-server.com/upload', formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });

            // Alert.alert('Upload Success ✅', JSON.stringify(res.data));
        } catch (err) {
            console.error('Upload failed:', err);
            Alert.alert('Upload Failed ❌', err.message);
        }
    };

    const createPDF = async () => {
        const htmlContent = `
        <div style="background-color: #ffffff; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 20px; color: #000000; font-weight: bold; text-decoration: underline; text-align: center; display: block; width: 100%; box-sizing: border-box;">
          SURVEY REPORT
        </span>
           
          </div>
      
          <div>
            <p><strong>Date:</strong> ${  format(new Date(topPanelObject.date), 'dd-MM-yyyy') }</p>
            <p><strong>Survey Number:</strong> ${topPanelObject.survey_no}</p>
            <p><strong>Survey Report For:</strong> ${topPanelObject.survey_report_for}</p>
            <p><strong>Building Name:</strong> ${topPanelObject.building_name}</p>
            <p><strong>Contact Person:</strong> ${topPanelObject.contact_person}</p>
            <p><strong>Owner Real Estate:</strong> ${topPanelObject.owner_real_estate}</p>
            <p><strong>Mobile Number:</strong> ${topPanelObject.mobile_number}</p>
            <p><strong>Location:</strong> ${topPanelObject.location}</p>
            <p><strong>Email:</strong> ${topPanelObject.e_mail}</p>
            <p><strong>Building Details:</strong> ${topPanelObject.building_details}</p>
            <p><strong>Number of Rooms:</strong> ${topPanelObject.number_of_rooms}</p>
            <p><strong>Number Of Kitchens:</strong> ${topPanelObject.number_of_kitchens}</p>
            <p><strong>Number of Other Rooms:</strong> ${topPanelObject.number_of_other_rooms}</p>
            <p><strong>Watchman Name:</strong> ${topPanelObject.watchman_name}</p>
            <p><strong>Watchman Mobile:</strong> ${topPanelObject.watchman_mobile}</p>
            <p><strong>Survey Done By Name 1:</strong> ${topPanelObject.survey_done_by_name_1}</p>
            <p><strong>Survey Done By Name 2:</strong> ${topPanelObject.survey_done_by_name_2}</p>
            <p><strong>Survey Done By Name 3:</strong> ${topPanelObject.survey_done_by_name_3}</p>
            <p><strong>Checked And Verified By:</strong> ${topPanelObject.checked_and_verified_by_name_of_supervisor}</p>
            <p><strong>Notes and type of rooms in each floor:</strong> ${topPanelObject.notes_number_type_of_rooms_in_each_floor}</p>
            <p><strong>Any other comments:</strong> ${topPanelObject.notes_any_other_comments}</p>
          </div>
      
          <div style="font-size: 16px; color: #009688; margin-top: 10px;">
            <strong>List Of Equipments:</strong>
          </div>
          ${list_of_equipments?.filter(item => item.brand || item.Qty || item.spec || item.remarks)
            .map(item => `
              <div>
                <p><strong>Brand:</strong> ${item.brand}</p>
                <p><strong>Qty:</strong> ${item.Qty}</p>
                <p><strong>Spec:</strong> ${item.spec}</p>
                <p><strong>Remarks:</strong> ${item.remarks}</p>
              </div>
            `).join('')}
            
          <div style="font-size: 16px; color: #009688; margin-top: 10px;">
            <strong>Fault/Comments:</strong>
          </div>
          ${listOfFaultsComments?.filter(item => item.location || item.reason_for_fault || item.rectification_time || item.remarks_install_replace_materials_required)
            .map(item => `
              <div>
                <p><strong>Item Description:</strong> ${item.item_description}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Reason for Fault:</strong> ${item.reason_for_fault}</p>
                <p><strong>Rectification Time:</strong> ${item.rectification_time}</p>
                <p><strong>Remarks:</strong> ${item.remarks_install_replace_materials_required}</p>
              </div>
            `).join('')}
        </div>
      `;
        const options = {
            html: htmlContent,
            fileName: 'test',
            directory: 'Documents',
        };

        try {
            const file = await RNHTMLtoPDF.convert(options);
            await Share.open({
                title: 'Share Order Details PDF',
                url: `file://${file.filePath}`,
            });
            console.log('PDF created at: ', file.filePath);
        } catch (error) {
            console.log("error when sharing pdf",error)
        } finally {
            console.log("inside finally")
        }

    };

    return (
        <View style={{ height: "100%" }}>

            <HeaderUiNew name={'Details'}
            />

            <View style={{ flexDirection: "row", borderBottomWidth: 1 }}>
                {/* <TouchableOpacity onPress={() => setCurrentTab(1)} style={["#000000", { padding: 8 }]}>
                    <Text style={{ color: "#ffffff" }}>Scope Of Work</Text>
                </TouchableOpacity> */}
                {/* <TouchableOpacity onPress={() => setCurrentTab(2)} style={[getBackGroundColor(2), { padding: 8 }]}>
                    <Text style={getTextColor(2)}>BOQ</Text>
                </TouchableOpacity> */}
            </View>


            <View style={{ padding: 10 }}>



                <ScrollView style={{ height: "75%", paddingBottom: 60 }}>

                    <View style={{ flexDirection: 'row' , justifyContent:"space-between"}}>
                        <Text style={{ fontWeight: 600, color: "#000000" }}>{listItem?.survey_no}</Text>
                        <TouchableOpacity style={{ backgroundColor: "#000000", flexDirection: "row", alignItems: "center", borderRadius: 4 }} onPress={createPDF}><Text style={{ marginLeft: 4, padding: 4, color: "#ffffff", fontWeight: 500 }}>Share PDF</Text></TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 3 }}>
                        {/* <TouchableOpacity style={{ backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#000000", borderRadius: 4 }} onPress={() => setVisible(prev => !prev)}><Image style={{ width: 20, height: 20 }} source={ic_camera} /><Text style={{ marginLeft: 4, padding: 4, color: "#000000", fontWeight: 500 }}>Select Image</Text></TouchableOpacity> */}
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
                           
                        </View>
                    }

                    <View style={{ flex: 1 }}>

                        <View contentContainerStyle={{ flexGrow: 1, flexDirection: "row", flexWrap: "wrap" }}>

                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>

                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>DATE</Text>
                                    {/* <TextInput
                                        onChangeText={(text) => handleInputTopPanel("date", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`date`] ? topPanelObject[`date`] : ""}
                                    /> */}
                                    <Text style={{fontSize:18, fontWeight:"600",color:"#000000"}}>{format(new Date(topPanelObject[`date`]), 'dd-MM-yyyy')}</Text>
                                </View>

                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>REF_NO</Text>
                                    <TextInput
                                        onChangeText={(text) => setReferenceNumber(text)}
                                        style={[styles.inputCell]}
                                        value={reference_number}
                                    />
                                </View>

                            </View>

                            <Text style={{ fontSize: 18, color: "#000000", fontWeight: "700", marginTop: 20, marginLeft: 10 }}>SURVEY REPORT FOR</Text>
                            <View style={[styles.cell_equipment_mcq, { flexDirection: "row", flexWrap: "wrap", marginTop: 10 }]}>


                                {
                                    checkboxList_survey_for.map((item, index) => {
                                        return (
                                            <View key={item.name} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#d7d7d7", borderRadius: 5, margin: 2, padding: 8 }}>
                                                <Text onPress={() => clickedOnCheckBox_survey_for(item.name)} style={{ fontWeight: "600", color: "#000000" }}>{item.name}</Text>

                                                <CheckBox
                                                    value={item.status}
                                                    onValueChange={(newValue) => clickedOnCheckBox_survey_for(item.name)}
                                                    tintColors={{ true: '#000000', false: '#000000' }}
                                                />
                                            </View>
                                        )
                                    })
                                }


                            </View>
                            {/* Each row represents a label and its corresponding input */}
                            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>



                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>BUILDING NAME</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("building_name", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`building_name`]}
                                    />
                                </View>
                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>CONTACT PERSON</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("contact_person", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`contact_person`]}
                                    />
                                </View>

                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>



                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>OWNER/REAL ESTATE</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("owner_real_estate", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`owner_real_estate`]}
                                    />
                                </View>
                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>MOBILE NO</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("mobile_number", text)}
                                        style={[styles.inputCell]}
                                        keyboardType="phone-pad"
                                        value={topPanelObject[`mobile_number`]}
                                    />
                                </View>

                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>



                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>LOCATION</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("location", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`location`]}
                                    />
                                </View>
                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>E-mail</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("e_mail", text)}
                                        style={[styles.inputCell]}
                                        keyboardType="email-address"
                                        value={topPanelObject[`e_mail`]}
                                    />
                                </View>

                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>



                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>BUILDING DETAILS</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("building_details", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`building_details`]}
                                    />
                                </View>
                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>NUMBER OF ROOMS</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("number_of_rooms", text)}
                                        style={[styles.inputCell]}
                                        keyboardType="numeric"
                                        value={topPanelObject[`number_of_rooms`]}
                                    />
                                </View>

                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>



                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>NUMBER OF KITCHENS</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("number_of_kitchens", text)}
                                        style={[styles.inputCell]}
                                        keyboardType="numeric"
                                        value={topPanelObject[`number_of_kitchens`]}
                                    />
                                </View>
                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>NUMBER OF OTHER ROOMS</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("number_of_other_rooms", text)}
                                        style={[styles.inputCell]}
                                        keyboardType="numeric"
                                        value={topPanelObject[`number_of_other_rooms`]}
                                    />
                                </View>

                            </View>
                            <View style={{ flexDirection: "row", padding: 5 }}>


                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>WATCHMAN NAME </Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("watchman_name", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`watchman_name`]}
                                    />
                                </View>
                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>WATCHMAN MOBILE </Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("watchman_mobile", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`watchman_mobile`]}
                                    />
                                </View>



                            </View>
                        </View>

                        {/* start */}

                        <TouchableOpacity style={[styles.button, { width: "50%" }]} onPress={() => setModalVisibleReport(prev => !prev)}><Text style={{ color: "#ffffff" }}>Enter Equipment Details</Text></TouchableOpacity>

                        {/* end */}



                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <Text style={{ width: "4%", color: "#000000", fontWeight: "700" }}>1</Text>
                            <TextInput value={topPanelObject.survey_done_by_name_1} onChangeText={(text) => handleInputTopPanel("survey_done_by_name_1", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="NAME"></TextInput>

                            <View style={{ width: "48%", flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: "#009688" }]} activeOpacity={0.8} onPress={() => { setModalVisibleSignature(prev => !prev); setCurrentSignPersonNumber(1) }}>
                                    <Text style={styles.text}>SIGNATURE</Text>
                                </TouchableOpacity>
                                {
                                    signature_1 &&
                                    <Image
                                        source={{ uri: signature_1 }} // base64 string
                                        style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", width: 80, height: 40, objectFit: "contain", marginLeft: 8, }}
                                    />
                                }

                                <TouchableOpacity onPress={() => uploadSignature(1)}
                                    style={{ width: "50px", backgroundColor: "red", flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 5, marginHorizontal: 3, marginHorizontal: "auto", flexDirection: "row", justifyContent: "center" }} >
                                    <Text style={styles.text}>UPLOAD</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <Text style={{ width: "4%", color: "#000000", fontWeight: "700" }}>2</Text>
                            <TextInput value={topPanelObject.survey_done_by_name_2} onChangeText={(text) => handleInputTopPanel("survey_done_by_name_2", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="NAME"></TextInput>

                            <View style={{ width: "48%", flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: "#009688" }]} activeOpacity={0.8} onPress={() => { setModalVisibleSignature(prev => !prev); setCurrentSignPersonNumber(2) }}>
                                    <Text style={styles.text}>SIGNATURE</Text>
                                </TouchableOpacity>
                                {
                                    signature_2 &&
                                    <Image
                                        source={{ uri: signature_2 }} // base64 string
                                        style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", width: 80, height: 40, objectFit: "contain", marginLeft: 8, }}
                                    />
                                }

                                <TouchableOpacity onPress={() => uploadSignature(2)}
                                    style={{ width: "50px", backgroundColor: "red", flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 5, marginHorizontal: 3, marginHorizontal: "auto", flexDirection: "row", justifyContent: "center" }} >
                                    <Text style={styles.text}>UPLOAD</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <Text style={{ width: "4%", color: "#000000", fontWeight: "700" }}>3</Text>
                            <TextInput value={topPanelObject.survey_done_by_name_3} onChangeText={(text) => handleInputTopPanel("survey_done_by_name_3", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="NAME"></TextInput>

                            <View style={{ width: "48%", flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: "#009688" }]} activeOpacity={0.8} onPress={() => { setModalVisibleSignature(prev => !prev); setCurrentSignPersonNumber(3) }}>
                                    <Text style={styles.text}>SIGNATURE</Text>
                                </TouchableOpacity>
                                {
                                    signature_3 &&
                                    <Image
                                        source={{ uri: signature_3 }} // base64 string
                                        style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", width: 80, height: 40, objectFit: "contain", marginLeft: 8, }}
                                    />
                                }

                                <TouchableOpacity onPress={() => uploadSignature(3)}
                                    style={{ width: "50px", backgroundColor: "red", flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 5, marginHorizontal: 3, marginHorizontal: "auto", flexDirection: "row", justifyContent: "center" }}>
                                    <Text style={styles.text}>UPLOAD</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", marginTop: 20 }}>
                            <Text style={{ width: "4%" }}></Text><Text style={{ color: "#000000", fontWeight: "700" }} >CHECKED AND VERIFIED BY (NAME & SIGNATURE OF SUPERVISOR)</Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ width: "4%" }}></Text><TextInput value={topPanelObject.checked_and_verified_by_name_of_supervisor} onChangeText={(text) => handleInputTopPanel("checked_and_verified_by_name_of_supervisor", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="NAME"></TextInput>

                            <View style={{ width: "48%", flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: "#009688" }]} activeOpacity={0.8} onPress={() => { setModalVisibleSignature(prev => !prev); setCurrentSignPersonNumber(4) }}>
                                    <Text style={styles.text}>SIGNATURE</Text>
                                </TouchableOpacity>
                                {
                                    signature_4 &&
                                    <Image
                                        source={{ uri: signature_4 }} // base64 string
                                        style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dedede", width: 80, height: 40, objectFit: "contain", marginLeft: 8, }}
                                    />
                                }

                                <TouchableOpacity onPress={() => uploadSignature(4)}
                                    style={{ width: "50px", backgroundColor: "red", flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 5, marginHorizontal: 3, marginHorizontal: "auto", flexDirection: "row", justifyContent: "center" }} >
                                    <Text style={styles.text}>UPLOAD</Text>
                                </TouchableOpacity>
                            </View>

                        </View>

                        <Text style={{ fontSize: 18, color: "#000000", fontWeight: "700", marginTop: 20, marginLeft: 10, }}>FAULTS/COMMENTS</Text>

                        <TouchableOpacity style={[styles.button, { width: "50%" }]} onPress={() => setModalVisibleFault(prev => !prev)}><Text style={{ color: "#ffffff" }}>Enter Fault Or Comments</Text></TouchableOpacity>



                        <Text style={{ fontSize: 18, color: "#000000", fontWeight: "700", marginTop: 20, marginLeft: 10 }}>NOTES</Text>

                        <Text style={{ fontSize: 18, color: "#000000", fontWeight: "400", marginTop: 20, marginLeft: 10 }}>Number & type of rooms in each floor </Text>

                        <TextInput value={topPanelObject.notes_number_type_of_rooms_in_each_floor} onChangeText={(text) => handleInputTopPanel("notes_number_type_of_rooms_in_each_floor", text)} style={[styles.cellInput, styles.textArea, { marginBottom: 10, width: "95%", marginLeft: "2%" }]} multiline></TextInput>

                        <Text style={{ fontSize: 18, color: "#000000", fontWeight: "400", marginTop: 20, marginLeft: 10 }}>Any Other Comments </Text>

                        <TextInput value={topPanelObject.notes_any_other_comments} onChangeText={(text) => handleInputTopPanel("notes_any_other_comments", text)} style={[styles.cellInput, styles.textArea, { marginBottom: 10, width: "95%", marginLeft: "2%" }]} multiline></TextInput>


                        <TouchableOpacity onPress={() => setShowPreview(prev => !prev)} style={[styles.button, { backgroundColor: "#000000" }]} ><Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 20 }}>PREVIEW</Text></TouchableOpacity>


                        <TouchableOpacity onPress={() => postSurveyJson()} style={[styles.button, { backgroundColor: "#009688" }]} ><Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 20 }}>SAVE</Text></TouchableOpacity>

                    </View>

                </ScrollView>
            </View>


            


            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleFault}
                onRequestClose={() => setModalVisibleFault(false)} // Android back button handler
            >

                <TableScreenBackup listOfFaultsComments={listOfFaultsComments} setListOfFaultsComments={setListOfFaultsComments} uploadImage={uploadImage} setVisible={setVisible} URI={URI} />
            </Modal>

            <Modal animationType="slide"
                transparent={true}
                visible={modalVisibleReport}
                onRequestClose={() => setModalVisibleReport(false)}>
                <ScrollView horizontal>
                    <View style={styles.container}>


                        {/* Table Header */}
                        <View style={[styles.row, styles.header]}>
                            <Text style={styles.headerCell_sl_no}>Sl. No</Text>
                            <Text style={styles.headerCell_equipment}>Equipment Details</Text>
                            <Text style={styles.headerCell}>Brand</Text>
                            <Text style={styles.headerCell}>Qty</Text>
                            <Text style={styles.headerCell}>Spec</Text>
                            <Text style={styles.headerCell}>Remarks</Text>
                            <Text style={styles.headerCell}></Text>
                        </View>

                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                        >
                            {/* Sections */}
                            {
                                list_of_equipments &&
                                <FlatList
                                    data={list_of_equipments}
                                    keyExtractor={keyExtractor}
                                    renderItem={renderEquipmentItem}
                                    keyboardShouldPersistTaps="handled"
                                    initialNumToRender={10} //  Controls initial render
                                    maxToRenderPerBatch={10} //  Improves scrolling perf
                                    windowSize={5} //  Number of items rendered outside viewport
                                    removeClippedSubviews={true} //  Unmounts items outside viewport
                                />
                            }

                        </KeyboardAvoidingView>

                    </View>
                </ScrollView>
            </Modal>

            <Modal animationType="slide"
                transparent={true}
                visible={modalVisibleSignature}
                onRequestClose={() => setModalVisibleSignature(false)}>
                <SignaturePad currentSignPersonNumber={currentSignPersonNumber} setSignature_1={setSignature_1}
                    setSignature_2={setSignature_2}
                    setSignature_3={setSignature_3}
                    setSignature_4={setSignature_4}
                />
            </Modal>

            <Modal animationType="slide"
                transparent={true}
                visible={showPreview}
                onRequestClose={() => setShowPreview(false)}>


                <ScrollView style={{ margin: 10, borderWidth: 1, borderColor: "#000000", backgroundColor: "#ffffff" }}>
                    <View style={{ backgroundColor: "#ffffff", padding: 20 }}>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={{ fontSize: 20, color: "#000000" }}>Preview</Text>
                            <TouchableOpacity onPress={() => setShowPreview(false)} style={[styles.button, { backgroundColor: "#009688", marginVertical: 0, paddingVertical: 0 }]} ><Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 20 }}>Close</Text></TouchableOpacity>
                        </View>

                        <Text> Date</Text>
                        <Text style={styles.textValue}> {topPanelObject.date}</Text>
                        <Text > Survey Number</Text>
                        <Text style={styles.textValue}> {topPanelObject.survey_no}</Text>
                        <Text> Survey Report For</Text>
                        <Text style={styles.textValue}> {topPanelObject.survey_report_for}</Text>
                        <Text> Building Name</Text>
                        <Text style={styles.textValue}> {topPanelObject.building_name}</Text>
                        <Text> Contact Person</Text>
                        <Text style={styles.textValue}>{topPanelObject.contact_person}</Text>
                        <Text> Owner Real Estate</Text>
                        <Text style={styles.textValue}> {topPanelObject.owner_real_estate}</Text>
                        <Text> Mobile Number</Text>
                        <Text style={styles.textValue}> {topPanelObject.mobile_number}</Text>
                        <Text> Location</Text>
                        <Text style={styles.textValue}> {topPanelObject.location}</Text>
                        <Text> Email</Text>
                        <Text style={styles.textValue}> {topPanelObject.e_mail}</Text>
                        <Text> Building Details</Text>
                        <Text style={styles.textValue}> {topPanelObject.building_details}</Text>
                        <Text> Number of Rooms</Text>
                        <Text style={styles.textValue}> {topPanelObject.number_of_rooms}</Text>
                        <Text> Number Of Kitchens</Text>
                        <Text style={styles.textValue}> {topPanelObject.number_of_kitchens}</Text>
                        <Text> Number of Other Rooms</Text>
                        <Text style={styles.textValue}> {topPanelObject.number_of_other_rooms}</Text>
                        <Text> Watchman Name</Text>
                        <Text style={styles.textValue}> {topPanelObject.watchman_name}</Text>
                        <Text> Watchman Mobile</Text>
                        <Text style={styles.textValue}> {topPanelObject.watchman_mobile}</Text>
                        <Text> Survey Done By Name 1</Text>
                        <Text style={styles.textValue}> {topPanelObject.survey_done_by_name_1}</Text>
                        <Text> Survey Done By Name 2</Text>
                        <Text style={styles.textValue}> {topPanelObject.survey_done_by_name_2}</Text>
                        <Text> Survey Done By Name 3</Text>
                        <Text style={styles.textValue}> {topPanelObject.survey_done_by_name_3}</Text>
                        <Text> Checked And Verified By </Text>
                        <Text style={styles.textValue}> {topPanelObject.checked_and_verified_by_name_of_supervisor}</Text>
                        <Text> Notesand type of rooms in each floor </Text>
                        <Text style={styles.textValue}> {topPanelObject.notes_number_type_of_rooms_in_each_floor}</Text>
                        <Text> Any other comments </Text>
                        <Text style={styles.textValue}> {topPanelObject.notes_any_other_comments}</Text>




                        <Text style={{ fontSize: 16, color: "#009688", marginTop: 10 }}>List Of Equipments</Text>
                        {
                            list_of_equipments?.filter((itemFilter) => itemFilter.brand || itemFilter.Qty || itemFilter.spec || itemFilter.remarks).map((itemMap) => {

                                return <View>
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Brand -" + itemMap.brand}</Text>
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Qty - " + itemMap.Qty}</Text>
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Spec - " + itemMap.spec}</Text>
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Remarks - " + itemMap.remarks}</Text>

                                </View>

                            })
                        }

                        <Text style={{ fontSize: 16, color: "#009688", marginTop: 10 }}>Fault/Comments</Text>
                        {
                            listOfFaultsComments?.filter((itemFilter) => itemFilter.location || itemFilter.reason_for_fault || itemFilter.rectification_time || itemFilter.remarks_install_replace_materials_required).map((itemMap) => {
                                return <View >
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Item Description -" + itemMap.item_description}</Text>
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Location - " + itemMap.location}</Text>
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Reason for Fault - " + itemMap.reason_for_fault}</Text>
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Rectification Time - " + itemMap.rectification_time}</Text>
                                    <Text style={{ fontSize: 16, color: "#000000" }}>{"Remarks - " + itemMap.remarks_install_replace_materials_required}</Text>
                                </View>
                            })
                        }

                    </View>

                </ScrollView>

            </Modal>

            <ToastManager />

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
    container: {
        minWidth: 600,
        maxWidth: 600,
        backgroundColor: "#d7d7d7",
        margin: 10,
        borderRadius: 10
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sectionHeader: {
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: '#e0e0e0',
        padding: 6,
        marginBottom: 5,
    },
    column: {
        flexDirection: 'column',
        paddingVertical: 5,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
        paddingVertical: 5,
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#000000',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#ffffff"
    },
    headerCell_sl_no: {
        flex: 0.6,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#ffffff",
        padding: 10
    },
    headerCell_equipment: {
        flex: 2,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#ffffff"
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    cell_sl_no: {
        flex: 0.6,
        textAlign: 'center',
        paddingHorizontal: 4,
        fontWeight: "900",
        color: "#000000"
    },
    cell_equipment: {
        flex: 2,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    cell_equipment_mcq: {
        flex: 6,
        paddingHorizontal: 4,
    },
    inputCell: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#000000',
        backgroundColor: "#ffffff",
        paddingHorizontal: 5,
        marginHorizontal: 2,
        height: 40,
        color: "#000000"
    },
    label: {
        flex: 1,
        fontWeight: '600',
        fontSize: 14,
        color: '#333',
        paddingRight: 8,
        minWidth: 130,
    },
    input: {
        flex: 2,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        fontSize: 14,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    cellInput: {
        width: 160,
        borderWidth: 1,
        padding: 6,
        fontSize: 13,
        borderRadius: 4,
        borderColor: '#000000',
        backgroundColor: "#ffffff",
        paddingHorizontal: 5,
        marginHorizontal: 2
    },
    textArea: {
        borderColor: 'gray',
        borderWidth: 1,
    },
    button: {
        backgroundColor: '#fb923c', // 
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // Android shadow
        marginVertical: 10,
    },
    text: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    textValue: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600'
    },

})

export default ScopeAndBOQ