import React, { useEffect, useState, useCallback } from "react";
import { TouchableOpacity, View, Text, FlatList, StyleSheet, Dimensions, Image, Alert, ScrollView, Linking, KeyboardAvoidingView, Platform } from "react-native";
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
import CheckBox from '@react-native-community/checkbox';
import TableScreen from './fire_and_safety/TableScreen';

function ScopeAndBOQ_backup_new({ route, navigation }) {

    const [reference_number, setReferenceNumber] = useState("");

    const [listOfStaticDetails, setListOfStaticDetails] = useState(null)

    const [list_of_equipments, setListOfEquipments] = useState(null)

    const [listOfFaultsComments, setListOfFaultsComments] = useState(null)

    const { listItem, department_from_parent } = route.params


    // starting 

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

    const handleInputFirstTable = (mainSlno, subSlno, name_from_typing, text) => {

        console.log("mainSlno subSlno text", mainSlno, subSlno, name_from_typing, text)

        let filteredMainSlno = list_of_equipments.map((item) => {
            if (item.mainSlno == mainSlno) {

                if (item.subSlno == subSlno) {
                    return { ...item, [name_from_typing]: text }
                } else {
                    return item
                }

            } else {
                return item
            }
        })

        console.log("filteredMainSlno -->", filteredMainSlno)

        setListOfEquipments(filteredMainSlno)


    }


    const checkIfSurveyHasDetails = () => {

        axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_DETAILSMAIN/${listItem.survey_no}/main`).then((res) => {

            setListOfEquipments(res.data)
            setReferenceNumber((res.data[0]).Ref_no)

            console.log("res data get details of main------>>++", (res.data[0]).Ref_no, listItem.survey_no, res.data)


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
                        return {...item, status:true}
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


    const clickedOnCheckBox = (name_of_checkbox) => {

        console.log("category_name, name_of_checkbox", name_of_checkbox)

        let newCheckList = checkboxList.map((itemFind) => {

            if (itemFind.name?.trim() == name_of_checkbox?.trim()) {
                return { ...itemFind, status: !itemFind.status }
            } else {
                return itemFind
            }

        })

        console.log("newCheckList >>>+++", JSON.stringify(newCheckList, null, 2))

        setCheckboxList(newCheckList)

    }

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



    return (
        <View style={{ height: "100%" }}>

            <HeaderUiNew name={'Sales Order'}
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

                    <Text style={{ fontWeight: 600, color: "#000000" }}>{listItem?.survey_no}</Text>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 3 }}>
                        <TouchableOpacity style={{ backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#000000", borderRadius: 4 }} onPress={() => setVisible(true)}><Image style={{ width: 20, height: 20 }} source={ic_camera} /><Text style={{ marginLeft: 4, padding: 4, color: "#000000", fontWeight: 500 }}>Select Image</Text></TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#4CAF50", borderRadius: 4 }} onPress={() => listItem.gps ? Linking.openURL(listItem.gps) : Toast.error("Location details not found")}><Image style={{ width: 20, height: 20 }} source={ic_view_location} /><Text style={{ marginLeft: 4, padding: 4, color: "#4CAF50", fontWeight: 500 }}>Navigate Location</Text></TouchableOpacity>
                    </View>

                    {/* {
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
                    } */}

                    <View style={{ flex: 1 }}>

                        <View contentContainerStyle={{ flexGrow: 1, flexDirection: "row", flexWrap: "wrap" }}>

                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>

                                <View style={[styles.column, { width: "48%" }]}>
                                    <Text style={styles.label}>DATE</Text>
                                    <TextInput
                                        onChangeText={(text) => handleInputTopPanel("date", text)}
                                        style={[styles.inputCell]}
                                        value={topPanelObject[`date`] ? topPanelObject[`date`] : ""}
                                    />
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
                                            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#d7d7d7", borderRadius: 5, margin: 2, padding: 8 }}>
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
                                            keyboardShouldPersistTaps="handled"
                                            keyExtractor={(item) => {
                                                console.log('Item key--->>:', item.mainSlno + item.subSlno); // Check for duplicates or nulls
                                                return (item.mainSlno + item.subSlno).toString();
                                            }}
                                            renderItem={({ item }) => (


                                                <View style={styles.row}>
                                                    <Text style={styles.cell_sl_no}>{item.subSlno == "1.1" ? item.mainSlno : item.subSlno}</Text>

                                                    {
                                                        item.type_of_question == "mcq" ?

                                                            <View style={[styles.cell_equipment_mcq, { flexDirection: "row", flexWrap: "wrap" }]}>


                                                                {
                                                                    item.equipment_details.split(",").map((itemString, index) => {
                                                                        return (
                                                                            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 5, margin: 2, padding: 8 }}>
                                                                                <Text onPress={() => clickedOnCheckBox(itemString)} style={{ fontWeight: "600", color: "#000000" }}>{itemString}</Text>
                                                                                {console.log(`checkbox ...++ ${index}`, (checkboxList?.find((itemFind) => itemFind.name == itemString))?.status)}
                                                                                <CheckBox
                                                                                    value={(checkboxList.find((itemFind) => itemFind.name == itemString?.trim()))?.status}
                                                                                    onValueChange={(newValue) => clickedOnCheckBox(itemString)}
                                                                                    tintColors={{ true: '#000000', false: '#000000' }}
                                                                                />
                                                                            </View>
                                                                        )
                                                                    })
                                                                }


                                                            </View>
                                                            :
                                                            <>
                                                                <View style={[styles.cell_equipment, { flexDirection: "row", flexWrap: "wrap" }]}>
                                                                    <View><Text style={{ fontWeight: "600", color: "#000000" }}>{item.heading}</Text></View>
                                                                    <View><Text style={{ fontWeight: "600", color: "#000000" }}>{item.equipment_details}</Text></View>
                                                                </View>
                                                                <TextInput value={item.brand} onChangeText={(text) => handleInputFirstTable(item.mainSlno, item.subSlno, "brand", text)} style={styles.inputCell} />
                                                                <TextInput value={item.Qty} onChangeText={(text) => handleInputFirstTable(item.mainSlno, item.subSlno, "Qty", text)} style={styles.inputCell} />
                                                                <TextInput value={item.spec} onChangeText={(text) => handleInputFirstTable(item.mainSlno, item.subSlno, "spec", text)} style={styles.inputCell} />
                                                                <TextInput value={item.remarks} onChangeText={(text) => handleInputFirstTable(item.mainSlno, item.subSlno, "remarks", text)} style={styles.inputCell} />
                                                            </>
                                                    }
                                                </View>

                                            )}
                                        />
                                    }

                                </KeyboardAvoidingView>

                            </View>
                        </ScrollView>

                        {/* end */}

                        <View style={{ flexDirection: "row", marginTop: 10 }}>
                            <Text style={{ width: "4%" }}></Text><Text style={[{ width: "50%" }]}>NAME</Text><Text style={{ width: "50%" }}>SIGNATURE</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <Text style={{ width: "4%" }}>1</Text><TextInput value={topPanelObject.survey_done_by_name_1} onChangeText={(text) => handleInputTopPanel("survey_done_by_name_1", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="NAME"></TextInput><TextInput value={topPanelObject.survey_done_by_signature_1} onChangeText={(text) => handleInputTopPanel("survey_done_by_signature_1", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="SIGNATURE"></TextInput>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ width: "4%" }}>2</Text><TextInput value={topPanelObject.survey_done_by_name_2} onChangeText={(text) => handleInputTopPanel("survey_done_by_name_2", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="NAME"></TextInput><TextInput value={topPanelObject.survey_done_by_signature_2} onChangeText={(text) => handleInputTopPanel("survey_done_by_signature_2", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="SIGNATURE"></TextInput>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ width: "4%" }}>3</Text><TextInput value={topPanelObject.survey_done_by_name_3} onChangeText={(text) => handleInputTopPanel("survey_done_by_name_3", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="NAME"></TextInput><TextInput value={topPanelObject.survey_done_by_signature_3} onChangeText={(text) => handleInputTopPanel("survey_done_by_signature_3", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="SIGNATURE"></TextInput>
                        </View>

                        <View style={{ flexDirection: "row", marginTop: 10 }}>
                            <Text style={{ width: "4%" }}></Text><Text >CHECKED AND VERIFIED BY (NAME & SIGNATURE OF SUPERVISOR)</Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ width: "4%" }}></Text><TextInput value={topPanelObject.checked_and_verified_by_name_of_supervisor} onChangeText={(text) => handleInputTopPanel("checked_and_verified_by_name_of_supervisor", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="NAME"></TextInput><TextInput value={topPanelObject.checked_and_verified_by_signature_of_supervisor} onChangeText={(text) => handleInputTopPanel("checked_and_verified_by_signature_of_supervisor", text)} style={[{ width: "48%" }, styles.inputCell]} placeholder="SIGNATURE"></TextInput>
                        </View>

                        <Text style={{ fontSize: 18, color: "#000000", fontWeight: "700", marginTop: 20, marginLeft: 10, }}>FAULTS/COMMENTS</Text>

                        <TableScreen listOfFaultsComments={listOfFaultsComments} setListOfFaultsComments={setListOfFaultsComments} />



                        <Text style={{ fontSize: 18, color: "#000000", fontWeight: "700", marginTop: 20, marginLeft: 10 }}>NOTES</Text>

                        <Text style={{ fontSize: 18, color: "#000000", fontWeight: "400", marginTop: 20, marginLeft: 10 }}>Number & type of rooms in each floor </Text>

                        <TextInput value={topPanelObject.notes_number_type_of_rooms_in_each_floor} onChangeText={(text) => handleInputTopPanel("notes_number_type_of_rooms_in_each_floor", text)} style={[styles.cellInput, styles.textArea, { marginBottom: 10, width: "95%", marginLeft: "2%" }]} multiline></TextInput>

                        <Text style={{ fontSize: 18, color: "#000000", fontWeight: "400", marginTop: 20, marginLeft: 10 }}>Any Other Comments </Text>

                        <TextInput value={topPanelObject.notes_any_other_comments} onChangeText={(text) => handleInputTopPanel("notes_any_other_comments", text)} style={[styles.cellInput, styles.textArea, { marginBottom: 10, width: "95%", marginLeft: "2%" }]} multiline></TextInput>


                        <TouchableOpacity onPress={() => postSurveyJson()} style={{ width: "40%", backgroundColor: "red", flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 5, marginHorizontal: 3, marginBottom: 100, marginHorizontal: "auto", flexDirection: "row", justifyContent: "center" }}><Text style={{ color: "#ffffff", fontWeight: "700" }}>SAVE</Text></TouchableOpacity>

                    </View>

                </ScrollView>
            </View>


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

})

export default ScopeAndBOQ_backup_new