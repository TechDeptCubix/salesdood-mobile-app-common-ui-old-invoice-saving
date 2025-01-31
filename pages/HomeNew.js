import { View, Text, ScrollView, ImageBackground, StyleSheet, Image, Dimensions, TouchableOpacity, Alert, ActivityIndicator, Button } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import Home from '../dashPages/Home';
import { format } from 'date-fns';
import messaging from '@react-native-firebase/messaging';
import { AppState, AppStateStatus } from 'react-native';

import { SERVER_KEY } from "@env";


const HomeNew = () => {

    const [mobileUserType, setMobileUserType] = useState("")

    const [salesType, setSalesType] = useState("")

    const appState = useRef(AppState.currentState);

    const navigation = useNavigation()

    const [userDataArray, setUserDataArray] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)

    const [userLogin, setUserLogin] = useState('')
    const [accessGrp, setAccessGrp] = useState('')
    const [salesMan, setSalesMan] = useState('')
    const [salesRole, setSalesRole] = useState('')

    const [salesManName, setSalesManName] = useState('')

    const [showSidePanel, setShowSidePanel] = useState(false)
    const [showLogOutPoP, setshowLogoutPoP] = useState(false)

    const [paramValue, setParamValue] = useState('')

    const [masterList, setMasterList] = useState(null)

    const [selectedSalesMan, setSelectedSalesMan] = useState('')

    const [showSalesDrop, setShowSalesDrop] = useState(false)

    const [salesManDrop, setSalesManDrop] = useState('')

    const [selectedSalesName, setSelectedSalesName] = useState('')

    const [appUrl, setAppUrl] = useState('')

    const [cmpName, setCmpName] = useState('')

    const [cmpCode, setCmpCode] = useState('')

    const [deptNo, setDeptNo] = useState('')

    const [van, setVan] = useState('')

    const [selectedBottomTab, setSelecetdBottomTab] = useState('Home')

    const [userLoginData, setUserLoginData] = useState('')

    const [locName, setLocName] = useState('')

    const currentDate = new Date();
    const formattedDate = format(currentDate, 'dd-MMM-yyyy');
    const formattedTime = format(currentDate, 'h:mm a');

    const [salesCollection, setSalesCollection] = useState('')
    const [cashCollection, setCashCollection] = useState('')
    const [chequeCollection, setChequeCollection] = useState('')

    const [showSalesCollLoader, setShowSalesCollLoader] = useState(false)
    const [showCashCollLoader, setShowCashCollLoader] = useState(false)
    const [showChequeCollLoader, setShowChequeCollLoader] = useState(false)

    const [messageData, setMessageData] = useState(null);

    const [msgModal, setmsgModal] = useState(false);

    const handleAppStateChange = async (nextAppState) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            await checkNavigation();
        }
        appState.current = nextAppState;
    };

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {

            setMessageData(remoteMessage.data);

            if (remoteMessage.notification.title === 'New Delivery') {
                setmsgModal(true);
            }

            // When a foreground message is received, set the message data and show the modal
        });

        return unsubscribe;
    }, []);

    const navigateToTaskDetails = () => {
        setmsgModal(false);
        navigation.navigate('DriversApp');
    };



    const fetchSalesManDrop = async () => {
        const salesManDrop = await AsyncStorage.getItem('sales_man_drop') || ''

        const salesManNameDrop = await AsyncStorage.getItem('salesman_name_drop') || ''

        const appUrl = await AsyncStorage.getItem('appUrl')

        const portNoData = await AsyncStorage.getItem('portNoData')

        console.log('portNoData', portNoData)

        const deptNo = await AsyncStorage.getItem('DEPTNO')

        const van = await AsyncStorage.getItem('VAN')

        if (portNoData) {
            // setCmpName(portNoData[0].COMPNAME)

            const dataArray = JSON.parse(portNoData);
            setCmpCode(dataArray[0].COMPID)
            setCmpName(dataArray[0].COMPNAME)
        }

        if (salesManDrop) {
            setSelectedSalesMan(salesManDrop)
        }

        if (salesManNameDrop) {
            setSelectedSalesName(salesManNameDrop)
        }

        if (appUrl) {
            setAppUrl(appUrl)
        }

        if (deptNo) {
            setDeptNo(deptNo)
        }

        if (van) {
            setVan(van)
        }
    }


    const handleLogout = async () => {
        try {
            // Remove the items from AsyncStorage
            await AsyncStorage.removeItem('loginData');
            await AsyncStorage.removeItem('Userlogin');
            await AsyncStorage.removeItem('accessgrp');
            await AsyncStorage.removeItem('sales_man');
            await AsyncStorage.removeItem('SalesRole');
            await AsyncStorage.removeItem('salesman_name');
            await AsyncStorage.removeItem('sales_man_drop');
            await AsyncStorage.removeItem('salesman_name_drop');

            // Navigate to the MachineValidation page
            navigation.navigate('MachineValidation');
        } catch (error) {
            // Handle errors, if any
            console.error('Error logging out: ', error);
        }
    };

    const fetchSalesCollection = async () => {

        console.log('fetchSalesCollection 1', `${appUrl}MasterCount/${cmpCode}/SALESORDER/${salesMan}/${deptNo}`)
        setShowSalesCollLoader(true)
        try {
            const response = await axios.get(`${appUrl}MasterCount/${cmpCode}/SALESORDER/${salesMan}/${deptNo}`)

            // console.log(response.data)

            if (response.status === 200) {
                setSalesCollection(response.data)
                setShowSalesCollLoader(false)

            }
            setShowSalesCollLoader(false)
        } catch (error) {
            console.log('fetchSalesCollectionError', error)
            setShowSalesCollLoader(false)
        }
    }
    const fetchCashCollection = async () => {
        console.log('fetchSalesCollection 2', `${appUrl}MasterCount/${cmpCode}/CASHCOLLECTION/${salesMan}/${deptNo}`)
        setShowCashCollLoader(true)
        try {
            const response = await axios.get(`${appUrl}MasterCount/${cmpCode}/CASHCOLLECTION/${salesMan}/${deptNo}`)

            // console.log(response.data)

            if (response.status === 200) {
                setCashCollection(response.data)
                setShowCashCollLoader(false)

            }
            setShowCashCollLoader(false)
        } catch (error) {
            console.log('fetchSalesCollectionError', error)
            setShowCashCollLoader(false)
        }
    }
    const fetchChequeCollection = async () => {
        console.log('fetchSalesCollection 3', `${appUrl}MasterCount/${cmpCode}/CHEQUECOLLECTION/${salesMan}/${deptNo}`)
        setShowChequeCollLoader(true)
        try {
            const response = await axios.get(`${appUrl}MasterCount/${cmpCode}/CHEQUECOLLECTION/${salesMan}/${deptNo}`)

            // console.log(response.data)

            if (response.status === 200) {
                setChequeCollection(response.data)
                setShowChequeCollLoader(false)

            }
            setShowChequeCollLoader(false)
        } catch (error) {
            console.log('fetchSalesCollectionError', error)
            setShowChequeCollLoader(false)
        }
    }



    const fetchAllSalesCode = async () => {
        console.log('fetchAllSalesCode', `${appUrl}MasterList/${userDataArray[0].cmpcode}/SALESMAN/${paramValue}`)
        try {
            const response = await axios.get(`${appUrl}MasterList/${userDataArray[0].cmpcode}/SALESMAN/${paramValue}`)
            setMasterList(response.data)
        } catch (error) {
            console.error('fetchAllSalesCodeError: ', error);
        }
    }

    const handlePickerClick = async (itemValue) => {
        setSelectedSalesMan(itemValue.sales_man);

        fetchSalesmanDetailsOnClick(itemValue.sales_man)

        setDeptNo(itemValue.dept_no)

        await AsyncStorage.setItem('DEPTNO', itemValue.dept_no);

        // because different departments have different customer
        // so to clear that off we are putting null
        // else another department customer will be sent
        await AsyncStorage.setItem('selectedCustomer', JSON.stringify(null))


    };

    const fetchSalesmanDetailsOnLoad = async (salesManId) => {
        try {
            const response = await axios.get(`${appUrl}masterlist/${cmpCode}/salesman/${salesManId}`);
            console.log("fetchSalesmanDetailsOnLoad Response:", response.data);
            setVan(response.data[0].LOC_CODE)
            setLocName(response.data[0].LOC_Name)

            if (response.data[0].default_dept) {
                setDeptNo(response.data[0].default_dept)
                await AsyncStorage.setItem('DEPTNO', response.data[0].default_dept);
            } else {
                setDeptNo(response.data[0].deptno)
                await AsyncStorage.setItem('DEPTNO', response.data[0].deptno);
            }
            setSelectedSalesName(response.data[0].Sman_Name)

            // await AsyncStorage.setItem('DEPTNO', response.data[0].default_dept);
            await AsyncStorage.setItem('VAN', response.data[0].LOC_CODE);
            await AsyncStorage.setItem('sales_man', response.data[0].Sman_code);
            await AsyncStorage.setItem('salesman_name', response.data[0].Sman_Name);

            // Handle response data as needed
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error
        }
    };

    const fetchSalesmanDetailsOnClick = async (salesManId) => {
        try {
            const response = await axios.get(`${appUrl}masterlist/${cmpCode}/salesman/${salesManId}`);
            console.log("fetchSalesmanDetailsOnClick Response:", response.data);
            setVan(response.data[0].LOC_CODE)
            setLocName(response.data[0].LOC_Name)
            setSelectedSalesName(response.data[0].Sman_Name)

            // await AsyncStorage.setItem('DEPTNO', response.data[0].default_dept);
            await AsyncStorage.setItem('VAN', response.data[0].LOC_CODE);
            await AsyncStorage.setItem('sales_man', response.data[0].Sman_code);
            await AsyncStorage.setItem('salesman_name', response.data[0].Sman_Name);


            // setDeptNo(response.data[0].default_dept)
            // Handle response data as needed
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error
        }
    };

    const salesInvoiceButtonClick = () => {
        if (van !== '----' && deptNo !== '----') {
            navigation.navigate('SalesInvoice')
        }

        else if (deptNo === '----') {
            Alert.alert('No Department is set for this user, Please contact Administrator')
        }
        else if (van === '----') {
            Alert.alert('No Location is set for this user, Please contact Administrator')
        }
    }

    useEffect(() => {
        if (userLoginData && userLoginData[0].sales_man && cmpCode && appUrl) {
            fetchSalesmanDetailsOnLoad(userLoginData[0].sales_man)
        }
    }, [userLoginData, cmpCode, appUrl])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
                const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

                const userLogin = await AsyncStorage.getItem('UserLogin')
                const accessgrp = await AsyncStorage.getItem('accessgrp')
                const salesMan = await AsyncStorage.getItem('sales_man')
                const salesRole = await AsyncStorage.getItem('SalesRole')
                const salesman_name = await AsyncStorage.getItem('salesman_name')
                const mobileUserTypeFromLocal = await AsyncStorage.getItem('mobileUserTypeAsyncStorage')
                const salesTypeFromLocal = await AsyncStorage.getItem('SalesTypeAsyncStorage')

                console.log("mobileUserTypeFromLocal---> ", mobileUserTypeFromLocal)
                console.log(`salesTypeFromLocal--->${salesTypeFromLocal}`)

                const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

                const loginData = await AsyncStorage.getItem('loginData')

                if (loginData) {
                    const parserData = JSON.parse(loginData)
                    setUserLoginData(parserData)
                }


                setUserDataArray(parsedUserDataArray)
                setUserLogin(userLogin)
                setAccessGrp(accessgrp)
                setSalesMan(salesMan)
                setSalesRole(salesRole)
                setSalesManName(salesman_name)

                setMobileUserType(mobileUserTypeFromLocal)
                setSalesType(salesTypeFromLocal)



                if (parsedUserDataArray && parsedUserDataArray.length === 0) {
                    // setDeviceValidation('INVALID')
                    navigation.navigate('MachineValidation');
                    console.log("not validated");
                }

                if (selectedCompanyString) {
                    const selectedCompany = JSON.parse(selectedCompanyString);

                    setSelectedCompany(selectedCompany)
                }
            } catch (error) {
                console.error("Error fetching IN HEADER:", error);
            }
        };

        fetchData();
    }, [])

    useEffect(() => {
        if (salesMan === '----') {
            setParamValue('-')
            setShowSalesDrop(true)
        } else {
            setParamValue(salesMan)
        }
    }, [salesMan])

    useEffect(() => {
        if (paramValue && appUrl) {
            fetchAllSalesCode()
        }
    }, [paramValue, appUrl])

    useEffect(() => {
        if (selectedSalesMan) {
            AsyncStorage.setItem('sales_man_drop', selectedSalesMan)
                .then(() => {

                    console.log('selectedSalesMan Data saved successfully')
                })
                .catch(error => console.log('Error saving data', error));
        }
        // if (selectedSalesMan[0].DEPTNO) {
        //     AsyncStorage.setItem('DEPTNO', selectedSalesMan[0].DEPTNO)
        //         .then(() => {

        //             console.log('DEPTNO saved successfully')
        //         })
        //         .catch(error => console.log('Error saving data', error));
        // }
        // if (selectedSalesMan[0].VAN) {
        //     AsyncStorage.setItem('VAN', selectedSalesMan[0].VAN)
        //         .then(() => {

        //             console.log('VAN saved successfully')
        //         })
        //         .catch(error => console.log('Error saving data', error));
        // }
    }, [selectedSalesMan])


    // useEffect(() => {
    //     if (selectedSalesMan) {
    //         const salesManName = masterList && masterList.filter((item) => item.Sman_code === selectedSalesMan)

    //         // console.log('salesManNameFromFilter', salesManName[0].Sman_Name)

    //         if (salesManName) {
    //             setSelectedSalesName(salesManName[0].Sman_Name)
    //             AsyncStorage.setItem('salesman_name_drop', salesManName[0].Sman_Name)
    //                 .then(() => {

    //                     console.log('selectedSalesMan Data saved successfully')
    //                 })
    //                 .catch(error => console.log('Error saving data', error));
    //         }
    //         if (salesManName) {
    //             setDeptNo(salesManName[0].deptno)
    //             AsyncStorage.setItem('DEPTNO', salesManName[0].deptno)
    //                 .then(() => {

    //                     console.log('DEPTNO Data saved successfully')
    //                 })
    //                 .catch(error => console.log('Error saving data', error));
    //         }
    //         if (salesManName) {
    //             setVan(salesManName[0].VAN)
    //             AsyncStorage.setItem('VAN', salesManName[0].VAN)
    //                 .then(() => {

    //                     console.log('VAN Data saved successfully')
    //                 })
    //                 .catch(error => console.log('Error saving data', error));
    //         }

    //     }
    // }, [selectedSalesMan])

    useEffect(() => {
        if (cmpCode && salesMan && deptNo && appUrl) {
            fetchSalesCollection()
            fetchCashCollection()
            fetchChequeCollection()


        }
    }, [cmpCode, salesMan, deptNo, appUrl])

    useFocusEffect(
        React.useCallback(() => {
            if (cmpCode && salesMan && deptNo && appUrl) {
                fetchSalesCollection()
                fetchCashCollection()
                fetchChequeCollection()
            }
        }, [cmpCode, salesMan, deptNo, appUrl])
    );

    useEffect(() => {
        if (masterList) {
            // setSelectedSalesMan(masterList[0].Sman_code)
        }
    }, [masterList])

    useEffect(() => {
        fetchSalesManDrop()
    }, [])

    const checkNavigation = async () => {
        const gotoDriver = await AsyncStorage.getItem('gotoDriver');

        console.log('gotoDriverFromHome', gotoDriver)
        if (gotoDriver === 'true') {
            // Clear the flag after reading
            await AsyncStorage.removeItem('gotoDriver');
            navigation.navigate('DriversApp');
        }
    };

    // useEffect(() => {
    //     checkNavigation();
    // }, [])

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        checkNavigation(); // Check on component mount

        return () => {
            subscription.remove();
        };
    }, []);



    // console.log('salesMan', salesMan)
    // console.log('salesManName', salesManName)

    // console.log('masterList', masterList)

    // console.log('appUrl', appUrl)

    // console.log('selectedSalesMan', selectedSalesMan)

    // console.log('userDataArrayFromHomeNew', userDataArray)

    // console.log('cmpName', cmpName)

    // console.log('userLoginData', userLoginData)

    // console.log('van', van)

    // console.log('deptNo', deptNo)

    // console.log('salesCollection', salesCollection)
    // console.log('cashCollection', cashCollection)
    // console.log('chequeCollection', chequeCollection)

    console.log('selectedBottomTab', selectedBottomTab)


    useEffect(() => {

        console.log("salesType value changed ", salesType)

    }, [salesType])

    async function sendNotification() {

        // console.log("notification to this channel ", `/topics/${cmpCode.trim().toUpperCase()}_drivers ${SERVER_KEY}`)

        // const notification = {
        //     notification: {
        //         title: 'New Delivery',
        //         body: 'An Item is ready to be delivered!'
        //     },
        //     to: `/topics/${cmpCode.trim().toUpperCase()}_drivers`
        // };

        // console.log('sendNotification', notification)

        // try {
        //     const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification, {
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `key=${SERVER_KEY}` // Replace with your actual server key
        //         }
        //     });

        //     console.log('FCM token sent to API:', response.data);
        // } catch (error) {
        //     console.error('Error sending FCM token to API:', error);
        // }
    }

    return (
        <>

            {
                selectedBottomTab === 'Home' &&
                <LinearGradient
                    colors={['#E4DFD7', '#FFFFFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.5, y: 0.5 }}
                    style={{
                        flexGrow: 1,
                        // backgroundColor: '#EFECE7'
                    }}>

                    <View
                        style={styles.topCont}
                    >
                        {/* <View>
                            <Button title='Send notification' onPress={()=>sendNotification()} />
                        </View> */}

                        <View style={styles.TopSalesWrap}>
                            <View style={{
                                width: '96%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                // paddingHorizontal: 12,
                                // paddingVertical: 8
                            }}>
                                <View style={[styles.TopSalesBox, { backgroundColor: '#AEADB2' }]}>
                                    <Text style={styles.TopBannerText}>Sales</Text>
                                    {
                                        showSalesCollLoader ?
                                            <ActivityIndicator color={'white'} />
                                            :
                                            <Text style={[styles.TopBannerText, { color: 'white' }]}>{salesCollection && salesCollection[0].amount || 'nil'}</Text>
                                    }
                                </View>

                                {
                                    cmpCode !== "SUPERLAND" &&
                                    <>
                                        <View style={[styles.TopSalesBox, { backgroundColor: '#FF9501' }]}>
                                            <Text style={styles.TopBannerText}>Cash Collection</Text>
                                            {
                                                showCashCollLoader ?
                                                    <ActivityIndicator color={'white'} />
                                                    :
                                                    <Text style={[styles.TopBannerText, { color: 'white' }]}>{cashCollection && cashCollection[0].amount || 'nil'}</Text>
                                            }
                                        </View>
                                        <View style={[styles.TopSalesBox, { backgroundColor: '#FF3B2F' }]}>
                                            <Text style={styles.TopBannerText}>Cheque Collections</Text>
                                            {
                                                showChequeCollLoader ?
                                                    <ActivityIndicator color={'white'} />
                                                    :
                                                    <Text style={[styles.TopBannerText, { color: 'white' }]}>{chequeCollection && chequeCollection[0].amount || 'nil'}</Text>
                                            }
                                        </View>
                                    </>
                                }

                            </View>
                        </View>

                        <View style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}>
                            <Text style={[styles.cmpcodeText, { color: "grey" }]}>{cmpName}</Text>
                        </View>

                        <View style={styles.TopUserBanner}>

                            <View style={styles.UserAvatarCont}>
                                <Image source={require('../images/ic_user_placeholder.png')} style={styles.userAvatar}></Image>
                                <Text style={styles.userNameText}>
                                    {selectedSalesName ? selectedSalesName.toUpperCase() : salesManName.toUpperCase()}
                                </Text>
                            </View>

                            <View style={styles.UserAvatarCont}>
                                <Text style={styles.userNameText}>{formattedDate}</Text>
                                <Text style={styles.userNameText}>{formattedTime}</Text>
                            </View>

                            <View style={{
                                flexDirection: 'column'
                            }}>
                                {
                                    userLoginData &&
                                    // <View style={styles.PickerWrap}>
                                    <View>
                                        <Picker
                                            // selectedValue={selectedSalesMan}
                                            style={styles.picker}
                                            onValueChange={(itemValue) => handlePickerClick(itemValue)}
                                        >

                                            {
                                                userLoginData && userLoginData.map((item, index) => (
                                                    <Picker.Item
                                                        label={[item.DEPTNO, item.sales_man, item.salesman_name]}
                                                        value={{ sales_man: item.sales_man, dept_no: item.DEPTNO }}
                                                        key={index}
                                                    />
                                                ))
                                            }
                                        </Picker>
                                    </View>
                                }
                                <View style={styles.deptVan}>
                                    <Text style={styles.userNameText}>{deptNo ? deptNo : ''}</Text>
                                    <Text style={styles.userNameText}>-</Text>
                                    <Text style={styles.userNameText}>{locName ? locName : ""}</Text>
                                </View>

                            </View>

                        </View>

                        {/* <View style={styles.SalesManImgWrap}>
                            <Image style={styles.SalesManImg} source={require('../images/salesmatenew.png')}></Image>
                        </View> */}


                        {/* <View style={styles.topUserCont}>
                            <View style={styles.TopLeftCont}>
                                <View style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Image source={require('../images/ic_user_placeholder.png')} style={styles.userAvatar}></Image>

                                    {
                                        userLoginData &&
                                        <View style={styles.PickerWrap}>
                                            <Picker
                                                selectedValue={selectedSalesMan}
                                                style={styles.picker}
                                                onValueChange={(itemValue) => handlePickerClick(itemValue)}
                                            >

                                                {
                                                    userLoginData && userLoginData.map((item, index) => (
                                                        <Picker.Item
                                                            label={[item.DEPTNO, item.sales_man, item.salesman_name]}
                                                            value={{ sales_man: item.sales_man, dept_no: item.DEPTNO }}
                                                            key={index}
                                                        />
                                                    ))
                                                }
                                            </Picker>
                                        </View>
                                    }

                                </View>
                                <Text style={styles.userNameText}>
                                    {selectedSalesName ? selectedSalesName.toUpperCase() : salesManName.toUpperCase()}
                                </Text>
                                <View style={styles.deptVan}>
                                    <Text style={{ color: '#2B2B2B' }}>{deptNo ? deptNo : ''}</Text>
                                    <Text>-</Text>
                                    <Text style={{ color: '#2B2B2B' }}>{locName ? locName : ""}</Text>
                                </View>


                            </View>



                        </View> */}

                    </View>

                    <View
                        // source={require('../images/bottom_slant.png')}
                        style={styles.bottomCont}
                    >


                        {userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() == 'SALESDOODDEMO' ?


                            <ScrollView contentContainerStyle={{
                                width: '100%',
                                // marginTop: 20,
                                paddingBottom: 300,
                                paddingTop: 25,
                                zIndex: 2,
                            }}
                                horizontal={false}
                            >

                              


                                < View style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    paddingHorizontal: 18
                                }}>
                                    {/* <View style={styles.optionsCont}> */}

                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('CheckStock')}>
                                        <View style={styles.innerItem}>
                                            <View style={styles.TouchablwWhiteBackg}>
                                                <Image source={require('../images/srchDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}>
                                                </Image>
                                            </View>
                                            <View style={styles.innerText}>
                                                <Text style={styles.optionText}>Stock List</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>



                                    <>
                                       


                                            <>
                                                
                                                        <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('MakeOrder')}>
                                                            <View style={styles.innerItem}>
                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                    <Image source={require('../images/listDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                </View>
                                                                <View style={styles.innerText}>
                                                                    <Text style={styles.optionText}>Sales Order</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                
                                            </>
                                        
                                    </>

                                    <>



                                        <>
                                           
                                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('PreviousOrders')}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/clockDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                            </View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Order List</Text></View>
                                                        </View>
                                                    </TouchableOpacity>
                                            
                                        </>

                                    </>


                                    {
                                        (mobileUserType == "Picking Staff" || mobileUserType == "Checking Staff" || mobileUserType == "Delivery Staff") ?
                                            (
                                                <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                    <View style={styles.innerItem}>
                                                        <View style={styles.TouchablwWhiteBackg}>
                                                            <Image source={require('../images/bagDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                        </View>
                                                        <View style={styles.innerText}>
                                                            <Text style={styles.optionText}>Customer</Text></View>
                                                    </View>
                                                    <View style={styles.TouchableBlackOverlay}>
                                                        <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                            :
                                            (
                                                <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('CustomerDetails')}>
                                                    <View style={styles.innerItem}>
                                                        <View style={styles.TouchablwWhiteBackg}>
                                                            <Image source={require('../images/bagDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                        </View>
                                                        <View style={styles.innerText}>
                                                            <Text style={styles.optionText}>Customer</Text></View>
                                                    </View>
                                                </TouchableOpacity>
                                            )


                                    }



                                   

                                    {
                                        (mobileUserType == "Picking Staff" || mobileUserType == "Checking Staff" || mobileUserType == "Delivery Staff") ?

                                            <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/cashDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                    </View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Collection</Text></View>
                                                </View>
                                                <View style={styles.TouchableBlackOverlay}>
                                                    <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                </View>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('NewCollections')}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/cashDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                    </View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Collection</Text></View>
                                                </View>
                                            </TouchableOpacity>
                                    }

                                   

                                        <>
                                           
                                               
                                                <>
                                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => salesInvoiceButtonClick()}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/listDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                            </View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Sales Invoice</Text></View>
                                                        </View>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('PreviousSalesInvoice')}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                            </View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Invoice List</Text></View>
                                                        </View>
                                                    </TouchableOpacity>
                                                </>
                                            
                                        </>
                                    

                                    {
                                        userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() != 'PREMIER' ?
                                            <>
                                                {
                                                    userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() === 'AUTOMAX' &&
                                                    <>

                                                        {
                                                            (mobileUserType == "Checking Staff") ?
                                                                <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                                    <View style={styles.innerItem}>
                                                                        <View style={styles.TouchablwWhiteBackg}>
                                                                            <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                        </View>
                                                                        <View style={styles.innerText}>
                                                                            <Text style={styles.optionText}>Picking</Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={styles.TouchableBlackOverlay}>
                                                                        <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                    </View>
                                                                </TouchableOpacity>
                                                                :
                                                                <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('PickListNew')}>
                                                                    <View style={styles.innerItem}>
                                                                        <View style={styles.TouchablwWhiteBackg}>
                                                                            <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                        </View>
                                                                        <View style={styles.innerText}>
                                                                            <Text style={styles.optionText}>Picking</Text>
                                                                        </View>
                                                                    </View>
                                                                </TouchableOpacity>
                                                        }
                                                      

                                                        {
                                                            (mobileUserType == "Picking Staff" || mobileUserType == "Sales Staff" || mobileUserType == "Delivery Staff") ?
                                                                <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                                    <View style={styles.innerItem}>
                                                                        <View style={styles.TouchablwWhiteBackg}>
                                                                            <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                                        <View style={styles.innerText}>
                                                                            <Text style={styles.optionText}>Checking</Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={styles.TouchableBlackOverlay}>
                                                                        <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                    </View>
                                                                </TouchableOpacity>
                                                                :
                                                                <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('CheckingListNew')}>
                                                                    <View style={styles.innerItem}>
                                                                        <View style={styles.TouchablwWhiteBackg}>
                                                                            <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                                        <View style={styles.innerText}>
                                                                            <Text style={styles.optionText}>Checking</Text>
                                                                        </View>
                                                                    </View>
                                                                </TouchableOpacity>
                                                        }

                                                        
                                                    </>

                                                }
                                            </>
                                            :
                                            <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                    </View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Picking</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.TouchableBlackOverlay}>
                                                    <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                </View>
                                            </TouchableOpacity>
                                    }

                                    {
                                        userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() != 'PREMIER' ?
                                            <>

                                                {
                                                    userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() !== 'MALBAR' &&

                                                    <>

                                                        {
                                                            userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() !== 'MALBAR' &&


                                                                (mobileUserType == "Picking Staff") ?
                                                                <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                                    <View style={styles.innerItem}>
                                                                        <View style={styles.TouchablwWhiteBackg}>
                                                                            <Image source={require('../images/driver.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                                        <View style={styles.innerText}>
                                                                            <Text style={styles.optionText}>Delivery</Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={styles.TouchableBlackOverlay}>
                                                                        <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                    </View>
                                                                </TouchableOpacity>
                                                                :

                                                                <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('DriversApp')}>
                                                                    <View style={styles.innerItem}>
                                                                        <View style={styles.TouchablwWhiteBackg}>
                                                                            <Image source={require('../images/driver.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                                        <View style={styles.innerText}>
                                                                            <Text style={styles.optionText}>Delivery</Text>
                                                                        </View>
                                                                    </View>
                                                                </TouchableOpacity>
                                                        }
                                                    </>
                                                }

                                            </>
                                            :
                                            <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/driver.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Delivery</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.TouchableBlackOverlay}>
                                                    <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                </View>
                                            </TouchableOpacity>
                                    }

                                    {
                                        (mobileUserType == "Picking Staff" || mobileUserType == "Checking Staff" || mobileUserType == "Delivery Staff") ?
                                            <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Collection Report</Text></View>
                                                </View>
                                                <View style={styles.TouchableBlackOverlay}>
                                                    <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                </View>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('CollectionReport')}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Collection Report</Text></View>
                                                </View>
                                            </TouchableOpacity>
                                    }


                                </View>


                            </ScrollView>
                            :
                            <ScrollView contentContainerStyle={{
                                width: '100%',
                                // marginTop: 20,
                                paddingBottom: 300,
                                paddingTop: 25,
                                zIndex: 2,
                            }}
                                horizontal={false}
                            >
                                {
                                    userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() == 'SUPERLAND' ?
                                        <View style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            justifyContent: 'space-around',
                                            flexWrap: 'wrap',
                                            paddingHorizontal: 18
                                        }}>
                                            <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('MakeOrder')}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/listDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                    </View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Sales Order</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('PreviousOrders')}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/clockDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                    </View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Order List</Text></View>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        :

                                        < View style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            paddingHorizontal: 18
                                        }}>
                                            {/* <View style={styles.optionsCont}> */}

                                            <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('CheckStock')}>
                                                <View style={styles.innerItem}>
                                                    <View style={styles.TouchablwWhiteBackg}>
                                                        <Image source={require('../images/srchDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}>
                                                        </Image>
                                                    </View>
                                                    <View style={styles.innerText}>
                                                        <Text style={styles.optionText}>Stock List</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>

                                            {
                                                userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() !== 'MALBAR' &&

                                                <>
                                                    {

                                                        (salesType == "ORDER" || userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() == 'AUTOMAX') &&


                                                        <>
                                                            {
                                                                (userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() == 'AUTOMAX' &&

                                                                    (mobileUserType == "Checking Staff" || mobileUserType == "Delivery Staff")) ?
                                                                    <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                                        <View style={styles.innerItem}>
                                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                                <Image source={require('../images/listDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                            </View>
                                                                            <View style={styles.innerText}>
                                                                                <Text style={styles.optionText}>Sales Order</Text>
                                                                            </View>
                                                                        </View>
                                                                        <View style={styles.TouchableBlackOverlay}>
                                                                            <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                    :
                                                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('MakeOrder')}>
                                                                        <View style={styles.innerItem}>
                                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                                <Image source={require('../images/listDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                            </View>
                                                                            <View style={styles.innerText}>
                                                                                <Text style={styles.optionText}>Sales Order</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                            }
                                                        </>
                                                    }
                                                </>
                                            }

                                            {
                                                userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() !== 'MALBAR' &&

                                                <>

                                                    {

                                                        (salesType == "ORDER" || userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() == 'AUTOMAX') &&

                                                        <>
                                                            {
                                                                (userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() == 'AUTOMAX' &&

                                                                    (mobileUserType == "Checking Staff" || mobileUserType == "Delivery Staff")) ?


                                                                    <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                                        <View style={styles.innerItem}>
                                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                                <Image source={require('../images/clockDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                            </View>
                                                                            <View style={styles.innerText}>
                                                                                <Text style={styles.optionText}>Order List</Text></View>
                                                                        </View>
                                                                        <View style={styles.TouchableBlackOverlay}>
                                                                            <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                    :
                                                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('PreviousOrders')}>
                                                                        <View style={styles.innerItem}>
                                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                                <Image source={require('../images/clockDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                            </View>
                                                                            <View style={styles.innerText}>
                                                                                <Text style={styles.optionText}>Order List</Text></View>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                            }
                                                        </>
                                                    }
                                                </>
                                            }

                                            {
                                                (mobileUserType == "Picking Staff" || mobileUserType == "Checking Staff" || mobileUserType == "Delivery Staff") ?
                                                    (
                                                        <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                            <View style={styles.innerItem}>
                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                    <Image source={require('../images/bagDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                </View>
                                                                <View style={styles.innerText}>
                                                                    <Text style={styles.optionText}>Customer</Text></View>
                                                            </View>
                                                            <View style={styles.TouchableBlackOverlay}>
                                                                <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                            </View>
                                                        </TouchableOpacity>
                                                    )
                                                    :
                                                    (
                                                        <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('CustomerDetails')}>
                                                            <View style={styles.innerItem}>
                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                    <Image source={require('../images/bagDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                </View>
                                                                <View style={styles.innerText}>
                                                                    <Text style={styles.optionText}>Customer</Text></View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    )


                                            }



                                            {/* {
                                    userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() === 'AUTOMAX' &&
                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('PickingList')}>
                                        <View style={styles.innerItem}>
                                            <Image source={require('../images/ic_picking_list.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                            <View style={styles.innerText}>
                                                <Text style={styles.optionText}>Picking List</Text></View>
                                        </View>
                                    </TouchableOpacity>
                                }
                                 */}

                                            {
                                                (mobileUserType == "Picking Staff" || mobileUserType == "Checking Staff" || mobileUserType == "Delivery Staff") ?

                                                    <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/cashDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                            </View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Collection</Text></View>
                                                        </View>
                                                        <View style={styles.TouchableBlackOverlay}>
                                                            <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                        </View>
                                                    </TouchableOpacity>
                                                    :
                                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('NewCollections')}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/cashDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                            </View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Collection</Text></View>
                                                        </View>
                                                    </TouchableOpacity>
                                            }

                                            {(userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() !== 'AUTOMAX') &&

                                                <>
                                                    {

                                                        (salesType == "SALES" || (userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() == 'MALBAR')) &&
                                                        // <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('SalesInvoice')}>
                                                        <>
                                                            <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => salesInvoiceButtonClick()}>
                                                                <View style={styles.innerItem}>
                                                                    <View style={styles.TouchablwWhiteBackg}>
                                                                        <Image source={require('../images/listDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                    </View>
                                                                    <View style={styles.innerText}>
                                                                        <Text style={styles.optionText}>Sales Invoice</Text></View>
                                                                </View>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('PreviousSalesInvoice')}>
                                                                <View style={styles.innerItem}>
                                                                    <View style={styles.TouchablwWhiteBackg}>
                                                                        <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                    </View>
                                                                    <View style={styles.innerText}>
                                                                        <Text style={styles.optionText}>Invoice List</Text></View>
                                                                </View>
                                                            </TouchableOpacity>
                                                        </>
                                                    }
                                                </>
                                            }

                                            {
                                                userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() != 'PREMIER' ?
                                                    <>
                                                        {
                                                            userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() === 'AUTOMAX' &&
                                                            <>

                                                                {
                                                                    (mobileUserType == "Checking Staff") ?
                                                                        <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                                            <View style={styles.innerItem}>
                                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                                    <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                                </View>
                                                                                <View style={styles.innerText}>
                                                                                    <Text style={styles.optionText}>Picking</Text>
                                                                                </View>
                                                                            </View>
                                                                            <View style={styles.TouchableBlackOverlay}>
                                                                                <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                        :
                                                                        <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('PickListNew')}>
                                                                            <View style={styles.innerItem}>
                                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                                    <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                                </View>
                                                                                <View style={styles.innerText}>
                                                                                    <Text style={styles.optionText}>Picking</Text>
                                                                                </View>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                }
                                                                {/* <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('MyPickingList')}>
                                            <View style={styles.innerItem}>
                                                <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                <View style={styles.innerText}>
                                                    <Text style={styles.optionText}>My Picking List</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity> */}

                                                                {
                                                                    (mobileUserType == "Picking Staff" || mobileUserType == "Sales Staff" || mobileUserType == "Delivery Staff") ?
                                                                        <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                                            <View style={styles.innerItem}>
                                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                                    <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                                                <View style={styles.innerText}>
                                                                                    <Text style={styles.optionText}>Checking</Text>
                                                                                </View>
                                                                            </View>
                                                                            <View style={styles.TouchableBlackOverlay}>
                                                                                <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                        :
                                                                        <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('CheckingListNew')}>
                                                                            <View style={styles.innerItem}>
                                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                                    <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                                                <View style={styles.innerText}>
                                                                                    <Text style={styles.optionText}>Checking</Text>
                                                                                </View>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                }

                                                                {/* <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('MyCheckingList')}>
                                            <View style={styles.innerItem}>
                                                <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                <View style={styles.innerText}>
                                                    <Text style={styles.optionText}>My Checking  List</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity> */}
                                                            </>

                                                        }
                                                    </>
                                                    :
                                                    <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                            </View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Picking</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.TouchableBlackOverlay}>
                                                            <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                        </View>
                                                    </TouchableOpacity>
                                            }

                                            {
                                                userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() != 'PREMIER' ?
                                                    <>

                                                        {
                                                            userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() !== 'MALBAR' &&

                                                            <>

                                                                {
                                                                    userDataArray && userDataArray[0].cmpcode.trim().toUpperCase() !== 'MALBAR' &&


                                                                        (mobileUserType == "Picking Staff") ?
                                                                        <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                                            <View style={styles.innerItem}>
                                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                                    <Image source={require('../images/driver.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                                                <View style={styles.innerText}>
                                                                                    <Text style={styles.optionText}>Delivery</Text>
                                                                                </View>
                                                                            </View>
                                                                            <View style={styles.TouchableBlackOverlay}>
                                                                                <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                        :

                                                                        <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('DriversApp')}>
                                                                            <View style={styles.innerItem}>
                                                                                <View style={styles.TouchablwWhiteBackg}>
                                                                                    <Image source={require('../images/driver.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                                                <View style={styles.innerText}>
                                                                                    <Text style={styles.optionText}>Delivery</Text>
                                                                                </View>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                }
                                                            </>
                                                        }

                                                    </>
                                                    :
                                                    <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/driver.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Delivery</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.TouchableBlackOverlay}>
                                                            <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                        </View>
                                                    </TouchableOpacity>
                                            }

                                            {
                                                (mobileUserType == "Picking Staff" || mobileUserType == "Checking Staff" || mobileUserType == "Delivery Staff") ?
                                                    <TouchableOpacity style={[styles.ItemContOverlay, { backgroundColor: '#D4CFC5' }]} onPress={() => Alert.alert("You don't have access")}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Collection Report</Text></View>
                                                        </View>
                                                        <View style={styles.TouchableBlackOverlay}>
                                                            <Image source={require('../images/ic_locked.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image>
                                                        </View>
                                                    </TouchableOpacity>
                                                    :
                                                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('CollectionReport')}>
                                                        <View style={styles.innerItem}>
                                                            <View style={styles.TouchablwWhiteBackg}>
                                                                <Image source={require('../images/todoDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}></Image></View>
                                                            <View style={styles.innerText}>
                                                                <Text style={styles.optionText}>Collection Report</Text></View>
                                                        </View>
                                                    </TouchableOpacity>
                                            }


                                        </View>

                                }
                            </ScrollView>
                        }


                    </View >

                    {/* bottomGlobe */}
                    < View style={styles.BottomImgCont} >
                        <Image style={styles.GlobeImg} source={require('../images/mapHome.png')} />
                    </View >
                    {/* bottomGlobe */}

                    < View style={styles.CBXImgWrap} >
                        {/* <View>
                            <Text style={[styles.cmpcodeText, { color: "grey" }]}>{cmpName}</Text>
                        </View> */}
                        < View style={styles.SalesManImgWrap} >
                            <Image style={styles.SalesManImg} source={require('../images/salesDoodS.png')}></Image>
                        </View >

                        <Image style={styles.CBXImg} source={require('../images/pwrByBg.png')}></Image>

                        {/* <View style={{
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 12, fontFamily: 'Lexend-Light', marginRight: 6
                            }}>POWERED BY</Text>
                            <Image style={styles.CBXImg} source={require('../images/cbxLogoN.png')}></Image>
                        </View> */}
                        {/* <Image style={styles.CBXImgBottomRound} source={require('../images/ic_footer_round.png')}></Image> */}

                    </View >


                </LinearGradient >
            }

            {
                selectedBottomTab === 'DashBoard' &&
                <Home />
            }

            <View style={styles.BottomTab}>
                {/* <TouchableOpacity onPress={() => setSelecetdBottomTab('DashBoard')}> */}
                <TouchableOpacity>
                    {
                        selectedBottomTab === 'DashBoard' ?
                            <Image style={styles.BottomTabImg} source={require('../images/ic_dashboard_filled.png')} />
                            :
                            <Image style={styles.BottomTabImg} source={require('../images/ic_dashboard_outline.png')} />

                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelecetdBottomTab('Home')}>
                    {
                        selectedBottomTab === 'Home' ?
                            <Image style={styles.BottomTabImg} source={require('../images/ic_home_filled.png')} />
                            :
                            <Image style={styles.BottomTabImg} source={require('../images/ic_home_outline.png')} />
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowSidePanel(!showSidePanel)}>
                    {
                        showSidePanel ?
                            <Image style={styles.BottomTabImg} source={require('../images/ic_settings_filled.png')} />
                            :
                            <Image style={styles.BottomTabImg} source={require('../images/ic_settings_outline.png')} />

                    }
                </TouchableOpacity>
            </View>

            {
                showSidePanel &&
                <View style={styles.sidePanelWrapper}>

                    <TouchableOpacity style={styles.sidePanelLeft} onPress={() => setShowSidePanel(!showSidePanel)}>
                        {/* <Text>sideleft</Text> */}
                    </TouchableOpacity>

                    <View style={styles.sidePanelRight}>

                        <View style={{
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginVertical: 12,
                            paddingVertical: 12,

                        }}>

                            <View style={{
                                backgroundColor: 'white',
                                borderRadius: 50
                            }}>
                                <Image source={require('../images/userAvatar.png')} />
                            </View>
                            <View style={{ padding: 8 }}>
                                <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Lexend-Bold' }}>
                                    {selectedSalesName ? selectedSalesName.toUpperCase() : salesManName.toUpperCase()}
                                </Text>
                            </View>
                            {/* <View style={styles.CompanyTag}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>eee</Text>
                            </View> */}

                        </View>

                        {/* <TouchableOpacity onPress={() => navigation.navigate('EmployeeHome')}>
                            <View style={{
                                padding: 8,
                                margin: 4,
                            }}>
                                <Text style={{
                                    fontWeight: 'bold'
                                }}>TaskManagement</Text>
                            </View>
                        </TouchableOpacity> */}

                        <View style={{
                            marginTop: 'auto',
                            marginBottom: 25,
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity style={styles.LogoutButton} onPress={() => setshowLogoutPoP(!showLogOutPoP)}>
                                <Text style={{ color: 'white', marginRight: 6, fontFamily: 'Lexend-Regular' }}>LogOut</Text>
                                {/* <Image style={{ width: 20, height: 20 }} source={require('../images/logOutLight.png')} /> */}
                            </TouchableOpacity>
                        </View>

                        <View style={{
                            marginTop: 'auto', paddingBottom: 50,
                            justifyContent: 'center', width: '100%', flexDirection: 'row'
                        }}>
                            <Text style={{ color: 'black', marginRight: 6, fontFamily: 'Lexend-Regular' }}>version 4</Text>
                        </View>

                    </View>
                </View>
            }

            {
                showLogOutPoP &&
                <View style={styles.LogOutModalWrapper}>

                    <View style={styles.LogOutModal}>
                        <View>
                            <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold', padding: 8, margin: 4, fontFamily: 'Lexend-Regular' }}>LogOut</Text>
                        </View>
                        <View>
                            <Text style={{ color: 'black', fontSize: 16, padding: 8, margin: 4, fontFamily: 'Lexend-Regular' }}>Are you sure ?</Text>
                        </View>

                        <View style={{
                            // width: '100%',
                            padding: 8, margin: 4,
                            paddingLeft: 12,
                            paddingRight: 12,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <TouchableOpacity style={{
                                backgroundColor: 'grey',
                                padding: 8,
                                borderRadius: 4
                            }}
                                onPress={() => setshowLogoutPoP(!showLogOutPoP)}
                            >
                                <Text style={{
                                    color: 'white',
                                    fontFamily: 'Lexend-Regular'
                                }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                backgroundColor: 'red',
                                padding: 8,
                                borderRadius: 4
                            }}
                                onPress={() => handleLogout()}
                            >
                                <Text style={{
                                    color: 'white',
                                    fontFamily: 'Lexend-Regular'
                                }}>LogOut</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View >
            }

            {
                msgModal &&
                <View
                    // visible={modalVisible}
                    // animationType="slide"
                    // onRequestClose={closeModal}
                    style={styles.mapmodalContainer}
                >
                    {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> */}
                    <View style={styles.mapmodalContent}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>New Item Added to Delivery !</Text>

                        <TouchableOpacity style={styles.AcceptButton} onPress={() => navigateToTaskDetails()}>
                            <Text style={styles.AcceptText}>Delivery</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            }
        </>
    )
}

const styles = StyleSheet.create({
    topCont: {
        width: '100%',
        // height: Dimensions.get('window').height / 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingVertical: 12
    },
    topUserCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 8
        // position: 'absolute',
        // top: '55%',
        // left: -30
    },
    TopLeftCont: {
        width: '40%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        // paddingLeft: 16,
        // paddingTop: 12
    },
    TopRightCont: {
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
        // paddingHorizontal: 8,
        // paddingVertical: 8
    },
    TRDateCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    TRTextStyle: {
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
    },
    SalesCollectionBanner: {
        backgroundColor: '#D3CFC4',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        padding: 8
    },
    TRCollectionCont: {
        paddingVertical: 8
    },
    TRSCHead: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    TRSCData: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 4
    },
    userAvatar: {
        width: 25,
        height: 25,
        marginBottom: 8,
        resizeMode: "contain"
    },
    userNameText: {
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Bold',
    },
    topCirclesCont: {
        position: 'absolute',
        top: -8,
        right: 0
    },
    topCirclesImg: {
        width: 150,
        height: 150,
        resizeMode: 'contain'

    },
    settingsCont: {
        position: 'absolute',
        top: '20%',
        right: '5%'
    },
    settingsImg: {
        width: 40,
        height: 40
    },

    bottomCont: {
        width: '100%',
        height: Dimensions.get('window').height,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // position: 'relative',
        zIndex: 3
    },
    leftImgCont: {
        position: 'absolute',
        left: 0,
        bottom: 150
    },
    leftImg: {
        width: 180,
        height: 400
    },
    rightImgCont: {
        position: 'absolute',
        right: 0,
        bottom: 200
    },
    rightImg: {
        width: 100,
        height: 420
    },

    OptionScroll: {
        flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'center',
        width: '100%',
    },

    optionsCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        // backgroundColor: 'white',
        marginTop: 55,
        width: '75%',
        paddingTop: 25,
        // height: 500
    },

    optionIcon: {
        width: 25,
        height: 25,
        // marginBottom: 8
    },

    optionText: {
        fontSize: 13,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
        marginTop: 8
    },

    ItemCont: {
        // paddingLeft: 16,
        // paddingTop: 50,
        // paddingRight: 30,
        // paddingBottom: 16,
        paddingVertical: 30,
        paddingHorizontal: 12,
        borderRadius: 12,
        width: '32%',
        marginBottom: 8,
        zIndex: 2,
        height: 110,

        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowOpacity: 0.25, // Shadow opacity for iOS
        shadowRadius: 3.84, // Shadow radius for iOS
        elevation: 3, // Elevation for Android

        borderColor: 'grey',
        borderWidth: 0.5,
    },
    ItemContOverlay: {
        // paddingLeft: 16,
        // paddingTop: 50,
        // paddingRight: 30,
        // paddingBottom: 16,
        borderRadius: 12,
        width: '32%',
        zIndex: 2,
        height: 110,

        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowOpacity: 0.25, // Shadow opacity for iOS
        shadowRadius: 3.84, // Shadow radius for iOS
        elevation: 3, // Elevation for Android

        borderColor: 'grey',
        borderWidth: 0.5,
        position: "relative",
        justifyContent: "center"
    },

    innerItem: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // padding: 30,

    },
    innerText: {
        // width: 75
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center'
    },


    sidePanelWrapper: {
        backgroundColor: '#00000080',
        // backgroundColor: '##C790C5',
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: Dimensions.get('window').height,
        zIndex: 5,
        flexDirection: 'row'
    },
    sidePanelLeft: {
        backgroundColor: '#00000080',
        width: '100%',
    },
    sidePanelRight: {
        backgroundColor: 'white',
        // backgroundColor: '#C790C5',
        marginLeft: 'auto',
        width: '45%',
        height: '100%',
        padding: 12
    },
    LogOutModalWrapper: {
        zIndex: 5,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: Dimensions.get('window').height,
    },
    LogOutModal: {
        backgroundColor: 'white',
        position: 'absolute',
        top: '40%',
        left: '10%',
        right: '10%',
        width: '80%',
        height: 160,
        borderRadius: 8
    },
    LogoutButton: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'red',
        borderRadius: 4,
        alignItems: 'center'
    },

    SalesManImgWrap: {
        // marginTop: 12
        // position: 'absolute',
        // top: '20%',
        // left: '4%',
        // zIndex: 2
    },
    SalesManImg: {
        width: 120,
        height: 40,
        resizeMode: 'contain'
    },
    CBXImgWrap: {
        position: 'absolute',
        bottom: '30%',
        zIndex: 2,
        // left: '24%',
        // paddingBottom: 800,

        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    CBXImg: {
        width: 100,
        height: 30,
        resizeMode: 'contain'
    },


    PickerWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        // borderColor: '#5A55CA',
        // borderWidth: 1,
        // borderRadius: 5,
        // overflow: 'hidden',

        // position: 'absolute',
        // left: '65%',
        // bottom: '50%'

        // marginTop: 12
    },
    picker: {
        // height: 50,
        width: '100%',
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Bold',
    },

    selectedDeptno: {
        fontSize: 14,
        color: 'brown',
        fontFamily: 'Lexend-Regular',
        marginTop: 8,
    },

    cmpcodeText: {
        color: 'brown',
        fontSize: 12,
        fontFamily: 'Lexend-Regular',
        // marginLeft: 6
    },

    deptVan: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    BottomImgCont: {
        position: 'absolute',
        bottom: 60,
        zIndex: 0,
        // left: '24%',
        // paddingBottom: 800,

        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    GlobeImg: {
        width: 500,
        // height: 250,
        resizeMode: 'contain'
    },

    BottomTab: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#E1E1E1',
        // height: 60,
        position: 'absolute',
        // top: '70%',
        bottom: 0,
        zIndex: 5
    },

    BottomTabImg: {
        width: 25,
        height: 25
    },

    CBXImgBottomRound: {
        width: 60,
        height: 35,
        resizeMode: 'contain'
    },

    TopSalesWrap: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center'
    },
    TopSalesBox: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 16,
        flex: 1
    },
    TopBannerText: {
        fontSize: 12,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Bold',
    },

    TopUserBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 12
    },

    UserAvatarCont: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    TouchablwWhiteBackg: {
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    TouchableBlackOverlay: {
        padding: 8,
        backgroundColor: '#00000095',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        height: 110,
        width: "100%",
        right: 0,
        left: 0

    },

    mapmodalContainer: {
        zIndex: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    mapmodalContent: {
        backgroundColor: '#F7F7F7',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '94%'
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

export default HomeNew