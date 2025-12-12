import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert, Image, ActivityIndicator, Modal } from 'react-native'
import React, { useEffect, useState, useMemo, } from 'react'
import HeaderUiNew from './HeaderUiNew'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ToastManager, { Toast } from 'toastify-react-native'
import { format } from 'date-fns'
import RadioGroup from 'react-native-radio-buttons-group';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import PreviewAfterComplete from './PreviewAfterComplete'



const SiteSurvey = () => {

    const [currentCompletedItem, setCurrentCompletedItem] = useState(null)
    const [showPreview, setShowPreview] = useState(false)

    const [currentSurveyToComplete, setCurrentSurveyToComplete] = useState(null)

    const [showPopupSaveAndComplete, setShowPopupSaveAndComplete] = useState(false)
    const [list_of_equipments, setListOfEquipments] = useState(null)
    const [listOfFaults, setListOfFaults] = useState(null)

    const isFocused = useIsFocused();

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


    const fetchPickList = async (typeofList) => {

        setShowLoader(true)
        try {

            // let apiUrl = `${appUrl}CRMTaskMainListFilter/${cmpCode}/DELIVERYTASK/${loginUser}/-/-/-/-/1900-01-01/1900-01-01/-/-/${typeofList}`
            let apiUrl = `${appUrl}CRMTaskMainListFilter/${cmpCode}/SURVEYTASK/SF-01/-/-/-/${deptno}/1900-01-01/1900-01-01/-/-/${typeofList}`

            console.log("goodcollectionurl>>++", apiUrl)
            const response = await axios.get(apiUrl)


            setPickData(response.data)
            setShowLoader(false)

        } catch (error) {
            console.log('fetchPickListError', error)
            setError('Some Error Occured')
            setShowLoader(false)

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
                confirmedRejection(rejectObject)
            }
        } else {
            Alert.alert("Please enter comment")
        }

    }


    useEffect(() => {
        if (appUrl && cmpCode && deptno) {
            if (tabNumber == 1) {
                fetchPickList("assigned")
            } else if (tabNumber == 2) {
                fetchPickList("accepted")
            } else if (tabNumber == 3) {
                fetchPickList("completed")
            }

        }
    }, [appUrl, cmpCode, deptno])

    useEffect(() => {
        fetchAppUrl()

        axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_TEMPL_MAIN/-/-`).then((res) => {
            setListOfEquipments(res.data)
        }).catch((err) => {

        })

        axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_TEMPL_SUB/-/-`).then((res) => {
            setListOfFaults(res.data)
        }).catch((err) => {

        })


    }, [])

    console.log('pickData', pickData)
    console.log('pickListDetails', pickListDetails)

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
                fetchPickList("assigned")
            } else if (tabNumber == 2) {
                fetchPickList("accepted")
            } else if (tabNumber == 3) {
                fetchPickList("completed")
            }
        }
    }, [tabNumber])

    const acceptSurveyTask = (listItem) => {

        objectTopass = [
            {
                cmpcode: cmpCode,
                mode: "SURVEYSTATUS",
                docno: listItem.survey_no,
                deptno: deptno,
                status: "ACCEPTED",
                comments: "",
                userid: loginUser,
                createdon: "1900-01-01"
            }
        ]

        postData = JSON.stringify(objectTopass)


        console.log("postData before accepting", postData)

        axios.post(`${appUrl}ProposalStatus`, postData, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {

            console.log("res affter accept >> ", res.data)

            if (res.data.result == "Saved") {
                Toast.success("Saved Successfully")

                // first main table
                const surveyData = list_of_equipments.map((item) => {

                    return {
                        CmpCode: "SAFEFIRE",
                        mode: "ENTRY", // AFTER ACCEPT ONLY EDIT  ACCEPT JUST AFTER ACCEPTING 
                        survey_no: listItem.survey_no,
                        deptno: "MAIN",
                        ref_no: "",
                        mainSlno: item.mainSlno,
                        subSlno: item.subSlno,
                        heading: item.heading ? item.heading : "",
                        equipment_details: item.equipment_details,
                        type_of_question: item.type_of_question,
                        value: item.value,
                        brand: item.brand,
                        Qty: item.Qty,
                        spec: item.spec,
                        remarks: item.remarks,
                        imagepath: item.imagepath
                    }
                })



                console.log("surveyData---->>entry", surveyData)

                let arrayToSend = JSON.stringify(surveyData)

                axios.post(`https://cubixweberp.com:213/api/Survey_DetailsMain`, arrayToSend, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then((res) => {

                    console.log("res -->>+++ success", res.data)



                }).catch((err) => {
                    console.log("err -->>+++ failure", err)
                })

                // now fault table
                const surveyDataFault = listOfFaults.map((item) => {

                    return {
                        CmpCode: "SAFEFIRE",
                        mode: "ENTRY",
                        survey_no: listItem.survey_no,
                        deptno: "MAIN",
                        mainSlno: "0", // PASS DUMMY ON ENTRY TIME
                        Ref_no: "",
                        item_description: item.item_description,
                        location: "",
                        reason_for_fault: "",
                        rectification_time: "",
                        remarks_install_replace_materials_required: "",
                        materials_required_photo: ""
                    }
                })



                console.log("surveyDataFault---->>entry", surveyDataFault)

                let arrayToSendfaults = JSON.stringify(surveyDataFault)

                axios.post(`https://cubixweberp.com:213/api/Survey_DetailsSub`, arrayToSendfaults, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then((res) => {

                    console.log("res -->>+++ success", res.data)



                }).catch((err) => {
                    console.log("err -->>+++ failure", err)
                })


                // now static details
                const emptySurveyData = [
                    {
                        CmpCode: "SAFEFIRE",
                        mode: "ENTRY",
                        survey_no: listItem.survey_no,
                        deptno: "MAIN",
                        Ref_no: "",
                        mainSlno: 0,
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
                        notes_any_other_comments: ""
                    }
                ];




                console.log("emptySurveyData---->>entry", emptySurveyData)

                let emptySurveyDataToPass = JSON.stringify(emptySurveyData)

                axios.post(`https://cubixweberp.com:213/api/Survey_DetailsSub2`, emptySurveyDataToPass, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then((res) => {

                    console.log("res sub 2-->>+++ success", res.data)

                }).catch((err) => {
                    console.log("err -->>+++ failure", err)
                })

                fetchPickList("assigned")
            } else {
                Toast.success("Something went wrong , please try later ")
            }

        }).catch((err) => {
            console.log("err", err)
        })

    }

    const rejectSurveyTask = (listItem) => {

        setRejectObject(listItem)

        setShowRejectPopup(true)

        // if(rejectComment)

        // objectTopass = [
        //     {
        //         cmpcode: cmpCode,
        //         mode: "SURVEYSTATUS",
        //         docno: listItem.survey_no,
        //         deptno: deptno,
        //         status: "REJECTED",
        //         comments: "",
        //         userid: loginUser,
        //         createdon: "1900-01-01"
        //     }
        // ]

        // postData = JSON.stringify(objectTopass)


        // console.log("postData before accepting", postData)

        // axios.post(`${appUrl}ProposalStatus`, postData, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // }).then((res) => {

        //     console.log("res affter accept >> ", res)

        //     if (res.data.result == "Saved") {
        //         Toast.success("Saved Successfully")
        //         fetchPickList("assigned")
        //     } else {
        //         Toast.success("Something went wrong , please try later ")
        //     }

        // }).catch((err) => {
        //     console.log("err", err)
        // })

    }

    const confirmedRejection = (listItem) => {


        if (rejectComment)

            objectTopass = [
                {
                    cmpcode: cmpCode,
                    mode: "SURVEYSTATUS",
                    docno: listItem.survey_no,
                    deptno: deptno,
                    status: "REJECTED",
                    comments: "",
                    userid: loginUser,
                    createdon: "1900-01-01"
                }
            ]

        postData = JSON.stringify(objectTopass)


        console.log("postData before rejecting", postData)

        axios.post(`${appUrl}ProposalStatus`, postData, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {

            console.log("res affter accept >> ", res)

            if (res.data.result == "Saved") {
                setShowRejectPopup(false)
                Toast.success("Saved Successfully")
                fetchPickList("assigned")
            } else {
                Toast.success("Something went wrong , please try later ")
            }

        }).catch((err) => {
            console.log("err", err)
        })

    }

    useEffect(() => {
        if (isFocused) {
            // Screen is focused (active again)
            console.log('MyScreen is focused! again 2');
            // Perform actions like data fetching or UI updates

            if (appUrl && cmpCode && deptno) {
                if (tabNumber == 1) {
                    fetchPickList("assigned")
                } else if (tabNumber == 2) {
                    fetchPickList("accepted")
                } else if (tabNumber == 3) {
                    fetchPickList("completed")
                }

            }

        } else {
            // Screen is unfocused
            console.log('MyScreen is unfocused!');
        }
    }, [isFocused]);


    const clickedOnSaveAndComplete = (itemFromClick) => {

        setCurrentSurveyToComplete(itemFromClick)
        setShowPopupSaveAndComplete(prev => !prev)
    }


    const confirmedSaveAndComplete = () => {

        setShowPopupSaveAndComplete(false)

        objectTopass = [
            {
                cmpcode: cmpCode,
                mode: "SURVEYSTATUS",
                docno: currentSurveyToComplete?.survey_no,
                deptno: deptno,
                status: "COMPLETED",
                comments: "",
                userid: loginUser,
                createdon: "1900-01-01"
            }
        ]

        postData = JSON.stringify(objectTopass)

        console.log("postData confirmedSaveAndComplete", postData)



        axios.post(`${appUrl}ProposalStatus`, postData, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {
            if (res.data.result == "Saved") {
                Toast.success("Saved Successfully")
                setCurrentSurveyToComplete(null)
                fetchPickList("accepted")
            }
            else {
                Toast.success("Something went wrong, Could not Save")
            }
        })
    }

    return (

        <>
            {
                pickData && !pickListDetails &&

                <>
                    <View style={styles.TopBanner}>
                        <Text style={styles.TopBannerText}>
                            Site Survey
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", borderBottomWidth: 1 }}>
                        <TouchableOpacity style={getTabStyle(1)} onPress={() => { setTabNumber(1); console.log("button 1 clicked") }}><Text style={getTextColor(1)}>Pending</Text></TouchableOpacity>
                        <TouchableOpacity style={getTabStyle(2)} onPress={() => { setTabNumber(2); console.log("button 2 clicked") }}><Text style={getTextColor(2)}>Accepted</Text></TouchableOpacity>
                        <TouchableOpacity style={getTabStyle(3)} onPress={() => { setTabNumber(3); console.log("button 3 clicked") }}><Text style={getTextColor(3)}>Completed</Text></TouchableOpacity>
                    </View>

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
                                    <View style={styles.ImageCont}>
                                        <View style={styles.ImageWrap}>
                                            <Image style={styles.Image} source={require('../images/myPick.png')}></Image>
                                        </View>
                                    </View>
                                    <View style={styles.TitleDescBox} >


                                        <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.survey_no}</Text>
                                        <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item["Tasl Type"]}</Text>
                                        <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.Customer}</Text>
                                        <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.SiteName}</Text>
                                        <View>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, backgroundColor: "#f7f7f7", }}>
                                                <Image style={styles.Time} source={require('../images/time_passed.png')}></Image>
                                                <View>
                                                    <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4 }]}>Time Passed</Text>
                                                    <Text style={[styles.TitleText, { marginVertical: 0, marginLeft: 4 }]}>{item["Time Passed"]}</Text>
                                                </View>

                                            </View>


                                        </View>



                                    </View>
                                </View>

                                <View style={styles.TaskItemRight}>
                                    {/* <Text style={styles.TitleText}>{item.do_date.split('T')[0]}</Text> */}
                                    <Text style={[styles.TitleText, { fontSize: 11 }]}>{"PDD & Time " + item["PDD &Time"]}</Text>

                                    <View style={styles.BottomButtonCont}>

                                        {
                                            item.status?.trim().toUpperCase() == "ASSIGNED" ?

                                                <View style={{ flexDirection: "row" }}>
                                                    <TouchableOpacity onPress={() => rejectSurveyTask(item)} style={styles.RejectButton}>
                                                        <Text style={styles.AcceptText}>Reject</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => acceptSurveyTask(item)} style={[styles.AcceptButton, { marginLeft: 4 }]}>
                                                        <Text style={styles.AcceptText}>Accept</Text>
                                                    </TouchableOpacity>
                                                </View>


                                                :
                                                <>
                                                    {
                                                        item.status?.trim().toUpperCase() != "COMPLETED" &&
                                                        <View style={{ flexDirection: "column" }}>
                                                            <TouchableOpacity style={styles.DetailsButton} onPress={() => navigation.navigate("ScopeAndBOQ", {
                                                                listItem: item, department_from_parent: deptno
                                                            })}>

                                                                <Text style={styles.DetailsText}>Details</Text>

                                                            </TouchableOpacity>

                                                            <TouchableOpacity style={[styles.DetailsButton, { marginTop: 10 }]} onPress={() => clickedOnSaveAndComplete(item)}>
                                                                <Text style={styles.DetailsText}>Save and Complete</Text>
                                                            </TouchableOpacity>

                                                            {/* they confirmed this not needed as sir said */}
                                                            {/* <TouchableOpacity style={[styles.DetailsButton, {marginTop:10,flexDirection:"column"}]} onPress={() => navigation.navigate("InspectionMaintenanceReport", {
                                                                listItem: item, department_from_parent: deptno
                                                            })}>

                                                                <Text style={styles.DetailsText}>Inspection/Maintenance</Text>
                                                                <Text style={styles.DetailsText}>Report</Text>

                                                            </TouchableOpacity> */}
                                                        </View>
                                                    }
                                                </>
                                        }

                                        <>
                                            {
                                                item.status?.trim().toUpperCase() == "COMPLETED" &&
                                                <View style={{ flexDirection: "column" }}>
                                                    <TouchableOpacity style={styles.DetailsButton} onPress={() => { setShowPreview(prev => !prev); setCurrentCompletedItem(item) }}>

                                                        <Text style={styles.DetailsText}>PREVIEW</Text>

                                                    </TouchableOpacity>



                                                </View>
                                            }
                                        </>

                                        {/* <TouchableOpacity style={styles.AcceptButton} onPress={() => fetchPickListDetail(item.SO_NO)}>
                                            <Text style={styles.DetailsText}>Update</Text>
                                        </TouchableOpacity> */}
                                        {/* <TouchableOpacity style={styles.AcceptButton} onPress={() => checkIfAlreadyAcceptItem(item.SO_NO)}>
    
                                                    {
                                                        showButtonLoader && (item.SO_NO === acceptSono) ?
                                                            <ActivityIndicator color={'white'} size={'large'} /> :
                                                            <Text style={styles.AcceptText}>Details</Text>
                                                    }
                                                </TouchableOpacity> */}
                                    </View>

                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                <Text style={{ color: 'red', padding: 10, fontSize: 20 }}>No data available</Text>
                            </View>
                        }
                    />
                </>
            }



            <ToastManager />
            {
                showPopupSaveAndComplete &&

                <Modal transparent={true}>
                    <View style={{ backgroundColor: "#00000090", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
                        <View style={{ backgroundColor: "#ffffff", width: "80%", padding: 20 }}>
                            <Text style={{ fontSize: 20, color: "#000000", fontWeight: "600" }}>Are you sure?</Text>
                            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
                                <TouchableOpacity onPress={() => setShowPopupSaveAndComplete(prev => !prev)}><Text style={{ color: "#899499", fontWeight: "400", fontSize: 20 }}>Cancel</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => confirmedSaveAndComplete()}><Text style={{ color: "#006400", fontWeight: "400", fontSize: 20, marginLeft: 10 }}>Save and Confirm</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            }


            <Modal animationType="slide"
                transparent={true}
                visible={showPreview}
                onRequestClose={() => setShowPreview(false)}>
                <PreviewAfterComplete setShowPreview={setShowPreview} currentCompletedItem={currentCompletedItem} />
            </Modal>



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
        marginTop: 8
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
        alignItems: 'center'
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





})

export default SiteSurvey