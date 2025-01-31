import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderUiNew from './HeaderUiNew'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ToastManager, { Toast } from 'toastify-react-native'
import { format } from 'date-fns'
import MyPickingList from './MyPickList'
import PickCheckDetailsPop from '../popups/PickCheckDetailsPop'

const PickListNew = () => {

    const [cmpCode, setCmpCode] = useState('')

    const [appUrl, setAppUrl] = useState('')

    const [deptno, setDeptno] = useState('')

    const [loginUser, setLoginUser] = useState('')

    const [pickData, setPickData] = useState('')

    const [selectedButton, setSelectedButton] = useState('Pending Accept');

    const [error, setError] = useState('')

    const [acceptError, setAcceptError] = useState('')

    const [inputValues, setInputValues] = useState({});

    const [acceptSono, setAcceptSono] = useState('')

    const [showButtonLoader, setShowButtonLoader] = useState(false)

    const [myPickListLength, setMyPickListLength] = useState('')

    const [showDetailsPop, setDetailsPop] = useState(false)

    const [detailsPopItem, setDetailsPopItem] = useState('')

    const [acceptPage, setAcceptPage] = useState(false)

    const [showLoader, setShowLoader] = useState(false)


    const handleInputChange = (code, text) => {
        const numericText = text.replace(/[^0-9.]/g, ''); // This removes any non-numeric characters
        setInputValues({
            ...inputValues,
            [code]: numericText
        });
    };

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
        const deptno = await AsyncStorage.getItem('DEPTNO')
        console.log('fetchPickList--', `${appUrl}Sales_Order/${cmpCode}/PICKING/-/${deptno}/-`)

        try {
            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/PICKING/-/${deptno}/-`)
            setPickData(response.data)
            setShowLoader(false)
        } catch (error) {
            console.log('fetchPickListError', error)
            setError('Some Error Occured')
            setShowLoader(false)
        }
    }

    const fetchMyPickListLength = async () => {
        try {

            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/STARTED_PICKING/${loginUser}/${deptno}/-`)
            setMyPickListLength(response.data.length)
        } catch (error) {
            console.log('fetchMyPickListLengthError', error)
            setError('Some Error Occured')
        }
    }



    const acceptItem = async (sono) => {
        setAcceptSono(sono)
        setShowButtonLoader(true)
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
                    setAcceptSono('')
                    setShowButtonLoader(false)
                    fetchMyPickListLength()
                } else {
                    Alert.alert("Something went wrong please try later")
                    setAcceptSono('')
                    setShowButtonLoader(false)
                }

            }



        } catch (error) {
            console.log('acceptItemError', error)
            setAcceptError('Some Error On accepting the item')
            showAcceptError()
            setAcceptSono('')
            setShowButtonLoader(false)
        }
    }

    const checkIfAlreadyAcceptItem = async (sono) => {
        setAcceptSono(sono)
        setShowButtonLoader(true)
        try {

            console.log('acceptItemUrl', `${appUrl}Sales_Order/automax/CHECK_PICKING/-/${deptno}/1233`)

            const response = await axios.get(`${appUrl}Sales_Order/automax/CHECK_PICKING/-/${deptno}/${sono}`);

            if (response.data?.length > 0) {

                console.log(response.data)

                if (response.data[0].STATUS == "CONFIRM PICKING") {
                    acceptItem(sono)
                } else {
                    Alert.alert("Already accepted By another person")
                    fetchPickList()
                    setAcceptSono('')
                    setShowButtonLoader(false)
                }

            }



        } catch (error) {
            Alert.alert("Something went wrong please try later")
            setAcceptSono('')
            setShowButtonLoader(false)
        }
    }

    const showDetailsPopItem = (item) => {
        console.log('showDetailsPopItem', item)
        setDetailsPopItem(item)
        setDetailsPop(true)
        setAcceptPage(false)

    }

    const showAcceptDetailsPopItem = (item) => {
        console.log('showDetailsPopItem', item)
        setDetailsPopItem(item)
        setDetailsPop(true)
        setAcceptPage(true)
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

            console.log('DraftItempostData', postData)


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

    // const SaveItem = async () => {
    //     try {
    //         const data = [
    //             {
    //                 cmpcode: cmpCode,
    //                 operation: 'PICKING_COMPLETED',
    //                 so_no: setPickListDetails.SO_NO,
    //                 user: loginUser,
    //                 deptno: deptno,
    //                 qty: '',
    //                 uid: ''

    //             }
    //         ]

    //         const postData = JSON.stringify(data)

    //         const response = await axios.post(`${appUrl}Picking`, postData, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             }
    //         });

    //         if (response.status === 200) {

    //         }



    //     } catch (error) {
    //         console.log('acceptItemError', error)
    //         setAcceptError('Some Error On accepting the item')
    //     }
    // }

    const SaveItem = async () => {
        try {
            const data = pickListDetails && pickListDetails.map(item => ({
                cmpcode: cmpCode, // replace with your actual cmpCode
                operation: 'PICKING_COMPLETED',
                so_no: item.so_no,
                user: loginUser, // replace with your actual loginUser
                deptno: deptno, // replace with your actual deptno
                qty: inputValues[item.Code] || '',
                uid: item.soUid
            }));

            const postData = JSON.stringify(data);

            console.log('postData', postData)

            const response = await axios.post('https://your-api-url.com/Picking', postData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                console.log('Items saved successfully');
                showSaveSuccess()
                setInputValues({})
            }
        } catch (error) {
            console.log('acceptItemError', error);
            showSaveError()
            // Handle error
        }
    };

    const handlePress = (buttonName) => {
        setSelectedButton(buttonName);
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



    useEffect(() => {
        if (appUrl && cmpCode) {
            fetchPickList()
            fetchMyPickListLength()
        }
    }, [appUrl, cmpCode])

    useEffect(() => {
        fetchAppUrl()
    }, [])


    console.log('deptno', deptno)

    console.log('pickData', pickData)

    return (
        <>
            <View style={styles.HomeWrap}>

                <HeaderUiNew name={'Picking List'} />

                <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />


                <KeyboardAvoidingView
                    behavior='padding'
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                    style={styles.HomeCont}>

                    {
                        error &&
                        <View style={{ marginHorizontal: 12, marginVertical: 12, justifyContent: 'flex-start' }}>
                            <Text style={[styles.StockLabel, { color: 'red' }]}>{error}</Text>
                        </View>
                    }

                    {
                        pickData &&
                        <>
                          

                            <View style={styles.ActionTabBox}>
                                <TouchableOpacity
                                    style={[
                                        styles.ActionButtons,
                                        selectedButton === 'Pending Accept' && styles.SelectedButton, { backgroundColor: '#AEADB2' }
                                    ]}
                                    onPress={() => handlePress('Pending Accept')}
                                >
                                    <Text style={styles.ButtonText}>Pending Accept</Text>
                                    <Text style={[styles.ButtonText, { marginTop: 12 }]}>
                                        {pickData && pickData.length}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.ActionButtons,
                                        selectedButton === 'My Task List' && styles.SelectedButton, { backgroundColor: '#FF9402' }
                                    ]}
                                    onPress={() => handlePress('My Task List')}
                                >
                                    <Text style={styles.ButtonText}>My Pick List</Text>
                                    <Text style={[styles.ButtonText, { marginTop: 12 }]}>
                                        {myPickListLength && myPickListLength}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {
                                selectedButton === 'Pending Accept' &&
                                <>
                                    <View style={styles.TopBanner}>
                                        <Text style={styles.TopBannerText}>
                                            Pending Accept
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
                                                            <Image style={styles.Image} source={require('../images/pendingPick.png')}></Image>
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
                                                        <TouchableOpacity style={styles.DetailsButton} onPress={() => showDetailsPopItem(item)}>
                                                            <Text style={styles.DetailsText}>Details</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={styles.AcceptButton} onPress={() => checkIfAlreadyAcceptItem(item.SO_NO)}>
                                                            {/* <Text style={styles.AcceptText}>Accept</Text> */}

                                                            {
                                                                showButtonLoader && (item.SO_NO === acceptSono) ?
                                                                    <ActivityIndicator color={'white'} size={'large'} /> :
                                                                    <Text style={styles.AcceptText}>Accept</Text>
                                                            }
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
                                selectedButton === 'My Task List' &&
                                <MyPickingList
                                    fetchMyPickListLength={fetchMyPickListLength}
                                    showAcceptDetailsPopItem={showAcceptDetailsPopItem} />
                            }


                            {/* <ScrollView horizontal={true} style={{ width: '100%', minHeight: 'auto', maxHeight: Dimensions.get('window').height - 85 }}>
    
    
                                <View style={styles.CollTableContainer}>
    
    
                                    <View style={styles.ColltableRow}>
                                        <Text style={[styles.CollheaderCell, { borderTopLeftRadius: 4 }]}>SO_NO</Text>
                                        <Text style={styles.CollheaderCell}>Customer</Text>
                                        <Text style={styles.CollheaderCell}>Sales Man</Text>
                                        <Text style={[styles.CollheaderCell, { borderTopRightRadius: 4 }]}>Date</Text>
                                    </View>
                                    <ScrollView nestedScrollEnabled={true}>
    
                                        <FlatList
                                            data={pickData}
                                            keyExtractor={(item, index) => index.toString()}
                                            contentContainerStyle={{}}
                                            renderItem={({ item }) => (
                                                <>
                                                    <View style={[
                                                        styles.ColltableRow,
                                                    ]} >
                                                        <View style={{ backgroundColor: "#ffffff" }}>
                                                            <Text style={[styles.ColldataCell,]}>{item.SO_NO}</Text>
                                                            <TouchableOpacity style={styles.AcceptButton} onPress={() => checkIfAlreadyAcceptItem(item.SO_NO)}>
                                                                <Text style={styles.itemCountText}>Accept</Text>
                                                            </TouchableOpacity>
                                                        </View>
    
                                                        <Text style={[styles.ColldataCell,]}>{(item.Customer)}</Text>
                                                        <Text style={[styles.ColldataCell,]}>{(item.sale_man)}</Text>
                                                        <Text style={[styles.ColldataCell,]}>{item.so_date.split('T')[0]}</Text>
    
    
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
                            </ScrollView> */}
                        </>
                    }

                    {
                        showLoader &&
                        <ActivityIndicator />
                    }


                </KeyboardAvoidingView>
            </View>

            {
                showDetailsPop &&
                <PickCheckDetailsPop
                    detailsPopItem={detailsPopItem}
                    setDetailsPop={setDetailsPop}
                    appUrl={appUrl}
                    cmpCode={cmpCode}
                    deptno={deptno}

                    acceptPage={acceptPage}
                />
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
        width: '100%'
    },


    ActionTabBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 12,
        // backgroundColor: 'red'
    },
    ActionButtons: {
        width: '45%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 6,
        backgroundColor: 'white',
        marginHorizontal: 4,
        borderRadius: 4,
    },
    SelectedButton: {
        borderBottomColor: 'green',
        borderBottomWidth: 4,
    },
    ButtonText: {
        fontSize: 13,
        color: '#2B2B2B',
        color: 'white',
        fontFamily: 'Lexend-Bold',
    },
    picker: {
        // height: 50,
        width: 150,
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





})

export default PickListNew