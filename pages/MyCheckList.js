import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert, Switch, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import HeaderUiNew from './HeaderUiNew'
import axios, { all } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ToastManager, { Toast } from 'toastify-react-native'
import RadioGroup from 'react-native-radio-buttons-group';
import { format } from 'date-fns'
import { SERVER_KEY } from "@env";



const MyCheckList = ({ fetchMyPickListLength, showAcceptDetailsPopItem }) => {

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

    const handleInputChange = (code, Pick_Qty, text) => {
        const numericText = text.replace(/[^0-9.]/g, ''); // This removes any non-numeric characters

        // if (numericText > Pick_Qty) {
        //     Alert.alert("Pick Qty exceeed SO Qty.")
        //     return
        // }

        setInputValues({
            ...inputValues,
            [code]: numericText
        });
    };

    // State to store the switch values
    // const [switchValues, setSwitchValues] = useState(
    //     pickListDetails && pickListDetails.reduce((acc, item) => {
    //         acc[item.Code] = false;
    //         return acc;
    //     }, {})
    // );

    const radioButtonsData = [
        { id: '1', label: 'No', value: false },
        { id: '2', label: 'Yes', value: true }
    ];

    const getRadioButtonsData = (code) => [
        { id: `${code}_no`, label: 'No', value: false, selected: switchValues[code] === false },
        { id: `${code}_yes`, label: 'Yes', value: true, selected: switchValues[code] === true },
    ];

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




    const [switchValues, setSwitchValues] = useState({})

    // Function to handle switch value change
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


    const fetchPickList = async () => {
        setShowLoader(true)
        try {

            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/STARTED_CHECKING/${loginUser}/${deptno}/-`)
            console.log(`${appUrl}Sales_Order/${cmpCode}/STARTED_CHECKING/${loginUser}/${deptno}/-`)
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
            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/STARTED_CHECKING_ITEM/-/${deptno}/${sono}`)
            console.log(`${appUrl}Sales_Order/${cmpCode}/STARTED_CHECKING_ITEM/-/${deptno}/${sono}`)
            setPickListDetails(response.data)

            // let arrayOfCodeWithPickedQuantity = response.data.map((item) => {
            //     return { code: [item.Code], pqty: item.Pick_Qty }
            // })

            // console.log("arrayOfCodeWithPickedQuantity-->", arrayOfCodeWithPickedQuantity)

            // let spreaded = arrayOfCodeWithPickedQuantity.reduce((acc, curr) => {
            //     return { ...acc, [curr.code]: "" + curr.pqty }

            // }, {})
            // console.log("arrayOfCodeWithPickedQuantity--> spread", spreaded)

            // setInputValues(spreaded)


            // setInputValues({
            //     ...inputValues,
            //     [code]: numericText
            // });

        } catch (error) {
            console.log('fetchPickListDetailError', error)
            setError('Some Error Occured')
        }
    }

    const acceptItem = async (sono) => {
        try {
            const data = [
                {
                    cmpcode: cmpCode,
                    operation: 'ACCEPTED',
                    so_no: sono,
                    user: loginUser,
                    deptno: deptno,
                    qty: '0',
                    uid: '2b83fb67-0cf7-44ac-af4c-d278e94b3363'

                }
            ]


            const postData = JSON.stringify(data)

            console.log('postData', postData)

            console.log('acceptItemUrl', `${appUrl}Picking`)

            const response = await axios.post(`${appUrl}Picking`, postData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {

                console.log(response.data)

                if (response.data.result == "Saved") {
                    showAcceptSuccess()
                    fetchPickList()
                } else {
                    Alert.alert("Something went wrong please try later")
                }

            }



        } catch (error) {
            console.log('acceptItemError', error)
            setAcceptError('Some Error On accepting the item')
            showAcceptError()
        }
    }

    const DraftItem = async () => {
        try {

            const data = pickListDetails && pickListDetails.map(item => ({
                cmpcode: cmpCode, // replace with your actual cmpCode
                operation: 'PICKING_DRAFT',
                so_no: item.so_no,
                user: loginUser, // replace with your actual loginUser
                deptno: deptno, // replace with your actual deptno
                qty: inputValues[item.Code] || '',
                uid: item.soUid
            }));

            const postData = JSON.stringify(data);

            console.log('DraftItempostData==>', postData)


            const response = await axios.post(`${appUrl}Picking`, postData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                showDraftSuccess()
                setInputValues({})
            }



        } catch (error) {
            console.log('acceptItemError', error)
            setAcceptError('Some Error On accepting the item')
            showDraftError()
        }
    }

    // notificationSend
    async function sendNotification() {
        const notification = {
            notification: {
                title: 'New Delivery',
                body: 'An Item is ready to be delivered!'
            },
            to: '/topics/drivers'
        };

        console.log('sendNotification', notification)

        try {
            const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${SERVER_KEY}` // Replace with your actual server key
                }
            });

            console.log('FCM token sent to API:', response.data);
        } catch (error) {
            console.error('Error sending FCM token to API:', error);
        }
    }



    const SaveItem = async () => {

        // Check if all items in pickListDetails are in inputValues
        const allItemsUpdated = pickListDetails.every(item => inputValues.hasOwnProperty(item.Code) && inputValues[item.Code] !== '');

        console.log('allItemsUpdated', allItemsUpdated)

        if (!allItemsUpdated) {
            Alert.alert("Check all items. Some items are not updated.");
            return
        }

        try {
            const data = pickListDetails && pickListDetails.map(item => ({
                cmpcode: cmpCode,
                operation: 'CHECKING_COMPLETED',
                so_no: item.so_no,
                user: loginUser,
                deptno: deptno,
                qty: inputValues[item.Code] || '',
                uid: item.soUid
            }));

            const postData = JSON.stringify(data);

            console.log('postData', postData)

            const response = await axios.post(`${appUrl}Picking`, postData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                console.log('Items saved successfully');

                sendNotification()
                showSaveSuccess()
                setInputValues({})
                setPickListDetails('')
                fetchPickList()
                fetchMyPickListLength()
            }
        } catch (error) {
            console.log('acceptItemError', error);
            showSaveError()

        }
    };

    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy hh:mm a');
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

    // useEffect(() => {

    //     if (pickListDetails) {
    //         // Initialize switch values to false for each item
    //         const initialSwitchValues = pickListDetails.reduce((acc, item) => {
    //             acc[item.Code] = false;
    //             return acc;
    //         }, {});
    //         setSwitchValues(initialSwitchValues);
    //     }
    // }, [pickListDetails]);



    useEffect(() => {
        if (appUrl && cmpCode) {
            fetchPickList()
        }
    }, [appUrl, cmpCode])

    useEffect(() => {
        fetchAppUrl()
    }, [])

    console.log('pickData', pickData)
    console.log('pickListDetails', pickListDetails)
    console.log('deptno', deptno)

    console.log('switchValues', switchValues)


    return (
        // <View style={styles.HomeWrap}>

        //     <HeaderUiNew name={'My Checking List'} />

        //     <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />


        //     <KeyboardAvoidingView
        //         behavior='padding'
        //         keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        //         style={styles.HomeCont}>

        //         {
        //             error &&
        //             <View style={{ marginHorizontal: 12, marginVertical: 12, justifyContent: 'flex-start' }}>
        //                 <Text style={[styles.StockLabel, { color: 'red' }]}>{error}</Text>
        //             </View>
        //         }


        //     </KeyboardAvoidingView>
        // </View>
        <>
            {
                pickData && !pickListDetails &&
                // <>
                //     <View style={{ marginHorizontal: 12, marginVertical: 12, justifyContent: 'flex-start' }}>
                //         <Text style={styles.StockLabel}>Item List</Text>
                //     </View>
                //     <ScrollView horizontal={true} style={{ width: '100%', minHeight: 'auto', maxHeight: Dimensions.get('window').height - 85 }}>


                //         <View style={styles.CollTableContainer}>


                //             <View style={styles.ColltableRow}>
                //                 <Text style={[styles.CollheaderCell, { borderTopLeftRadius: 4 }]}>SO_NO</Text>
                //                 <Text style={styles.CollheaderCell}>Customer</Text>
                //                 <Text style={styles.CollheaderCell}>Sales Man</Text>
                //                 <Text style={[styles.CollheaderCell, { borderTopRightRadius: 4 }]}>Date</Text>
                //             </View>
                //             <ScrollView nestedScrollEnabled={true}>

                //                 <FlatList
                //                     data={pickData}
                //                     keyExtractor={(item, index) => index.toString()}
                //                     contentContainerStyle={{}}
                //                     renderItem={({ item }) => (
                //                         <>
                //                             <TouchableOpacity style={[
                //                                 styles.ColltableRow,
                //                             ]} onPress={() => fetchPickListDetail(item.SO_NO)}>
                //                                 <View style={{ backgroundColor: "#ffffff" }}>
                //                                     <Text style={[styles.ColldataCell,]}>{item.SO_NO}</Text>
                //                                 </View>

                //                                 <Text style={[styles.ColldataCell,]}>{(item.Customer)}</Text>
                //                                 <Text style={[styles.ColldataCell,]}>{(item.sale_man)}</Text>
                //                                 <Text style={[styles.ColldataCell,]}>{item.so_date.split('T')[0]}</Text>


                //                             </TouchableOpacity>

                //                         </>
                //                     )}
                //                     ListEmptyComponent={
                //                         <View>
                //                             <Text style={{ color: 'red' }}>No data available</Text>
                //                         </View>
                //                     }
                //                 />


                //             </ScrollView>
                //         </View>
                //     </ScrollView>
                // </>
                <>
                    <View style={styles.TopBanner}>
                        <Text style={styles.TopBannerText}>
                            My Check List
                        </Text>
                    </View>

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
                                    <View style={styles.TitleDescBox}>
                                        <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.Customer}</Text>
                                        <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.sale_man}</Text>
                                        <Text style={[styles.TitleText, { marginVertical: 3 }]}>SO_NO: {item.SO_NO}</Text>
                                    </View>
                                </View>

                                <View style={styles.TaskItemRight}>
                                    {/* <Text style={styles.TitleText}>{item.do_date.split('T')[0]}</Text> */}
                                    <Text style={[styles.TitleText, { fontSize: 11 }]}>{formattedDate(item.so_date)}</Text>


                                    <View style={styles.BottomButtonCont}>

                                        <TouchableOpacity style={styles.DetailsButton} onPress={() => showAcceptDetailsPopItem(item)}>
                                            <Text style={styles.DetailsText}>Details</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.AcceptButton} onPress={() => fetchPickListDetail(item.SO_NO)}>
                                            <Text style={styles.DetailsText}>Update</Text>
                                        </TouchableOpacity>
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
                pickListDetails &&

                <>
                    {/* <ScrollView contentContainerStyle={styles.MainScroll}> */}

                    <View style={{ flexDirection: 'row', marginHorizontal: 12, marginVertical: 12, justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.SettingsWrap} onPress={() => setPickListDetails('')}>
                            <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                        </TouchableOpacity>
                        <Text style={styles.StockLabel}>Selected Item</Text>
                    </View>

                    <ScrollView horizontal={true} style={{ width: '100%', minHeight: 'auto', maxHeight: Dimensions.get('window').height - 85 }}>


                        <View style={styles.CollTableContainer}>


                            <View style={styles.ColltableRow}>
                                <Text style={[styles.CollheaderCell, { borderTopLeftRadius: 4 }]}>Code</Text>
                                <Text style={styles.CollheaderCell_SO_Qty}>SO_NO</Text>
                                <Text style={styles.CollheaderCell_SO_Qty}>Pick_Qty</Text>
                                <Text style={styles.CollheaderCell}>Check_Qty</Text>
                                <Text style={[styles.CollheaderCell, { width: 160 }]}>Match</Text>
                                <Text style={[styles.CollheaderCell, { borderTopRightRadius: 4 }]}>BIN</Text>
                            </View>
                            <ScrollView nestedScrollEnabled={true}>

                                <FlatList
                                    data={pickListDetails}
                                    keyExtractor={(item, index) => index.toString()}
                                    contentContainerStyle={{}}
                                    renderItem={({ item }) => (
                                        <>
                                            <View style={[
                                                styles.ColltableRow,
                                            ]}>
                                                <Text style={[styles.ColldataCell,]}>{item.Code}</Text>
                                                <Text style={[styles.ColldataCell_SO_Qty,]}>{(item.SO_Qty)}</Text>
                                                <Text style={[styles.ColldataCell_SO_Qty]}>{(item.Pick_Qty)}</Text>
                                                {/* <Text style={[styles.ColldataCell]}> */}

                                                {
                                                    switchValues[item.Code] ? (
                                                        <Text style={[styles.ColldataCell]}>
                                                            {inputValues[item.Code]}
                                                        </Text>
                                                    ) : (
                                                        // <Text style={[styles.ColldataCell]}>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput
                                                                style={styles.inputBox}
                                                                value={inputValues[item.Code] || ''}
                                                                onChangeText={(text) => handleInputChange(item.Code, item.Pick_Qty, text)}
                                                                placeholder="Enter qty"
                                                                keyboardType="numeric"
                                                            />
                                                        </View>
                                                        // </Text>
                                                    )
                                                }

                                                {/* </Text> */}

                                                <View style={[styles.ColldataCell, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 160 }]}>
                                                    <RadioGroup
                                                        radioButtons={radioButtons}
                                                        onPress={(radioButtonsArray) => {
                                                            // Debugging: Log radioButtonsArray to see its value and structure
                                                            console.log('radioButtonsArray:', radioButtonsArray);
                                                            handleSwitchChange(item.Code, radioButtonsArray, item.Pick_Qty);
                                                        }}
                                                        selectedId={switchValues[item.Code]}
                                                        layout="row"
                                                    />
                                                </View>

                                                <Text style={[styles.ColldataCell,]}>{item.BIN}</Text>

                                                {/* <View style={[styles.ColldataCell, {
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }]}>
                                                <Text style={styles.SwitchText}>No</Text>
                                                <Switch
                                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                    thumbColor={switchValues[item.Code] ? '#f5dd4b' : '#f4f3f4'}
                                                    ios_backgroundColor="#3e3e3e"
                                                    onValueChange={(value) => handleSwitchChange(item.Code, value, item.Pick_Qty)}
                                                    value={switchValues[item.Code]}
                                                />
                                                <Text style={styles.SwitchText}>Yes</Text>
                                            </View> */}

                                            </View>
                                        </>
                                    )}
                                    ListEmptyComponent={
                                        <View>
                                            <Text style={{ color: 'red' }}>No data available</Text>
                                        </View>
                                    }
                                />


                            </ScrollView>
                        </View>
                    </ScrollView>

                    {/* <View style={styles.StockDescWrap}>
    
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Code</Text>
                        <Text style={styles.StockTextValue}>{pickListDetails.Code}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Sono</Text>
                        <Text style={styles.StockTextValue}>{pickListDetails.so_no}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Description</Text>
                        <Text style={styles.StockTextValue}>{pickListDetails.Description}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>SO_Qty</Text>
                        <Text style={styles.StockTextValue}>{pickListDetails.SO_Qty}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Pick_Qty</Text>
                        <Text style={styles.StockTextValue}>{pickListDetails.Pick_Qty}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>BIN</Text>
                        <Text style={styles.StockTextValue}>{pickListDetails.BIN}</Text>
                    </View>
    
                </View> */}

                    <View style={styles.DetailsButtonWrap}>
                        {/* <TouchableOpacity style={styles.DraftButton} onPress={() => DraftItem()}>
                        <Text style={styles.ButtonLabel}>Save as Draft</Text>
                    </TouchableOpacity> */}
                        <TouchableOpacity style={styles.SaveButton} onPress={() => SaveItem()}>
                            <Text style={styles.ButtonLabel}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    {/* </ScrollView> */}

                </>
            }

            {
                showLoader &&
                <ActivityIndicator />
            }
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

    AcceptButton: {
        backgroundColor: '#1A6CF6',
        borderRadius: 4,
        padding: 8,
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "center"
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
        justifyContent: 'center',
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
        paddingVertical: 10,
        paddingHorizontal: 18
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
        width: '100%'
    },
    SwitchText: {
        fontFamily: 'Lexend-Light',
        color: '#2B2B2B',
        fontSize: 12
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
    TitleDescBox: {
        flexDirection: 'column',
        marginLeft: 8
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
    AcceptButton: {
        backgroundColor: '#30B3A4',
        padding: 12,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
        marginTop: 8
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


    radioButtonText: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Lexend-Light',
    },






})

export default MyCheckList