import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Button,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { all } from 'axios';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import Home from '../dashPages/Home';
import { format } from 'date-fns';
import messaging from '@react-native-firebase/messaging';
import { AppState, AppStateStatus } from 'react-native';

import { SERVER_KEY } from '@env';

const HomeNew = () => {
  const [salesmanTarget, setSalesmanTarget] = useState(null);
  const [
    isCallingMenuListAvailabletoThisRole,
    setCallingMenuListAvailabletoThisRole,
  ] = useState(false);

  const [callingNotAvailableMenuList, setCallingNotAvailableMenuList] =
    useState(false);

  const [menuNotAllowedToThisCompany, setMenuNotAllowedToThisCompany] =
    useState(null);

  const [menuAllowedToThisRole, setMenuAllowedToThisRole] = useState(null);

  useEffect(() => {
    console.log('menuNotAllowedToThisCompany ', menuNotAllowedToThisCompany);
  }, [menuNotAllowedToThisCompany]);

  const [mobileUserType, setMobileUserType] = useState('');

  const [salesType, setSalesType] = useState('');

  const appState = useRef(AppState.currentState);

  const navigation = useNavigation();

  const [userDataArray, setUserDataArray] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [userLogin, setUserLogin] = useState('');
  const [accessGrp, setAccessGrp] = useState('');
  const [salesMan, setSalesMan] = useState('');
  const [salesRole, setSalesRole] = useState('');

  const [salesManName, setSalesManName] = useState('');

  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showLogOutPoP, setshowLogoutPoP] = useState(false);

  const [paramValue, setParamValue] = useState('');

  const [masterList, setMasterList] = useState(null);

  const [selectedSalesMan, setSelectedSalesMan] = useState('');

  const [showSalesDrop, setShowSalesDrop] = useState(false);

  const [salesManDrop, setSalesManDrop] = useState('');

  const [selectedSalesName, setSelectedSalesName] = useState('');

  const [appUrl, setAppUrl] = useState('');

  const [cmpName, setCmpName] = useState('');

  const [cmpCode, setCmpCode] = useState('');

  const [deptNo, setDeptNo] = useState('');

  const [van, setVan] = useState('');

  const [selectedBottomTab, setSelecetdBottomTab] = useState('Home');

  const [userLoginData, setUserLoginData] = useState('');

  const [locName, setLocName] = useState('');

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'dd-MMM-yyyy');
  const formattedTime = format(currentDate, 'h:mm a');

  const [salesInvoice, setSalesInvoice] = useState('');
  const [salesInvoiceCash, setSalesInvoiceCash] = useState('');

  const [salesCollection, setSalesCollection] = useState('');
  const [cashCollection, setCashCollection] = useState('');
  const [chequeCollection, setChequeCollection] = useState('');

  const [showSalesCollLoader, setShowSalesCollLoader] = useState(false);
  const [showCashCollLoader, setShowCashCollLoader] = useState(false);
  const [showChequeCollLoader, setShowChequeCollLoader] = useState(false);

  const [showCreditSalesLoader, setShowCreditSalesLoader] = useState(false);
  const [showCashSalesLoader, setShowCashSalesLoader] = useState(false);

  const [messageData, setMessageData] = useState(null);

  const [msgModal, setmsgModal] = useState(false);

  const handleAppStateChange = async nextAppState => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      await checkNavigation();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
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
    const salesManDrop = (await AsyncStorage.getItem('sales_man_drop')) || '';
    console.log('salesManDrop', salesManDrop);
    const salesManNameDrop =
      (await AsyncStorage.getItem('salesman_name_drop')) || '';
    console.log('salesManNameDrop', salesManNameDrop);

    const appUrl = await AsyncStorage.getItem('appUrl');

    console.log('appUrl in  home', appUrl);

    const portNoData = await AsyncStorage.getItem('portNoData');

    console.log('portNoData', portNoData);

    const deptNo = await AsyncStorage.getItem('DEPTNO');

    const van = await AsyncStorage.getItem('VAN');

    if (portNoData) {
      // setCmpName(portNoData[0].COMPNAME)

      const dataArray = JSON.parse(portNoData);
      setCmpCode(dataArray[0].COMPID);
      setCmpName(dataArray[0].COMPNAME);
    }

    if (salesManDrop) {
      setSelectedSalesMan(salesManDrop);
    }

    if (salesManNameDrop) {
      setSelectedSalesName(salesManNameDrop);
    }

    if (appUrl) {
      setAppUrl(appUrl);
    }

    if (deptNo) {
      setDeptNo(deptNo);
    }

    if (van) {
      setVan(van);
    }
  };

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
      await AsyncStorage.removeItem('useraccess');

      let smankey = await AsyncStorage.getItem('Smankey');

      if (smankey) {
        console.log('smankey present remove item');
        await AsyncStorage.removeItem('Smankey');
      }

      // Navigate to the MachineValidation page
      navigation.navigate('MachineValidation');
    } catch (error) {
      // Handle errors, if any
      console.error('Error logging out: ', error);
    }
  };

  const fetchSalesInvoice = async () => {
    console.log(
      'fetchSalesInvoice',
      `${appUrl}MasterCount/${cmpCode}/SALESINVOICE/${salesMan}/${deptNo}`,
    );
    setShowCreditSalesLoader(true);
    try {
      const response = await axios.get(
        `${appUrl}MasterCount/${cmpCode}/SALESINVOICE/${salesMan}/${deptNo}`,
      );

      // console.log(response.data)

      if (response.status === 200) {
        setSalesInvoice(response.data);
        setShowCreditSalesLoader(false);
      }
      setShowCreditSalesLoader(false);
    } catch (error) {
      console.log('fetchSalesInvoice', error);
      setShowCreditSalesLoader(false);
    }
  };

  const fetchSalesInvoiceCash = async () => {
    console.log(
      'fetchSalesInvoiceCash',
      `${appUrl}MasterCount/${cmpCode}/CASHSALES/${salesMan}/${deptNo}`,
    );
    setShowCashSalesLoader(true);
    try {
      const response = await axios.get(
        `${appUrl}MasterCount/${cmpCode}/CASHSALES/${salesMan}/${deptNo}`,
      );

      // console.log(response.data)

      if (response.status === 200) {
        setSalesInvoiceCash(response.data);
        setShowCashSalesLoader(false);
      }
      setShowCashSalesLoader(false);
    } catch (error) {
      console.log('fetchSalesInvoice', error);
      setShowCashSalesLoader(false);
    }
  };

  const fetchSalesCollection = async () => {
    console.log(
      'fetchSalesCollection 1',
      `${appUrl}MasterCount/${cmpCode}/SALESORDER/${salesMan}/${deptNo}`,
    );
    setShowSalesCollLoader(true);
    try {
      const response = await axios.get(
        `${appUrl}MasterCount/${cmpCode}/SALESORDER/${salesMan}/${deptNo}`,
      );

      // console.log(response.data)

      if (response.status === 200) {
        setSalesCollection(response.data);
        setShowSalesCollLoader(false);
      }
      setShowSalesCollLoader(false);
    } catch (error) {
      console.log('fetchSalesCollectionError', error);
      setShowSalesCollLoader(false);
    }
  };
  const fetchCashCollection = async () => {
    console.log(
      'fetchSalesCollection 2',
      `${appUrl}MasterCount/${cmpCode}/CASHCOLLECTION/${salesMan}/${deptNo}`,
    );
    setShowCashCollLoader(true);
    try {
      const response = await axios.get(
        `${appUrl}MasterCount/${cmpCode}/CASHCOLLECTION/${salesMan}/${deptNo}`,
      );

      // console.log(response.data)

      if (response.status === 200) {
        setCashCollection(response.data);
        setShowCashCollLoader(false);
      }
      setShowCashCollLoader(false);
    } catch (error) {
      console.log('fetchSalesCollectionError', error);
      setShowCashCollLoader(false);
    }
  };
  const fetchChequeCollection = async () => {
    console.log(
      'fetchSalesCollection 3',
      `${appUrl}MasterCount/${cmpCode}/CHEQUECOLLECTION/${salesMan}/${deptNo}`,
    );
    setShowChequeCollLoader(true);
    try {
      const response = await axios.get(
        `${appUrl}MasterCount/${cmpCode}/CHEQUECOLLECTION/${salesMan}/${deptNo}`,
      );

      // console.log(response.data)

      if (response.status === 200) {
        setChequeCollection(response.data);
        setShowChequeCollLoader(false);
      }
      setShowChequeCollLoader(false);
    } catch (error) {
      console.log('fetchSalesCollectionError', error);
      setShowChequeCollLoader(false);
    }
  };

  const fetchAllSalesCode = async () => {
    console.log(
      'fetchAllSalesCode',
      `${appUrl}MasterList/${userDataArray[0].cmpcode}/SALESMAN/${paramValue}`,
    );
    try {
      const response = await axios.get(
        `${appUrl}MasterList/${userDataArray[0].cmpcode}/SALESMAN/${paramValue}`,
      );
      setMasterList(response.data);
    } catch (error) {
      console.error('fetchAllSalesCodeError:SALESCODE ', error);
    }
  };

  const handlePickerClick = async itemValue => {
    console.log('handlePickerClick--->', itemValue);
    setSelectedSalesMan(itemValue.sales_man);

    fetchSalesmanDetailsOnClick(itemValue.sales_man);

    setDeptNo(itemValue.dept_no);

    await AsyncStorage.setItem('DEPTNO', itemValue.dept_no);

    // because different departments have different customer
    // so to clear that off we are putting null
    // else another department customer will be sent
    await AsyncStorage.setItem('selectedCustomer', JSON.stringify(null));
  };

  const fetchSalesmanDetailsOnLoad = async salesManId => {
    try {
      const apiUrl = `${appUrl}masterlist/${cmpCode}/salesman/${salesManId}`;
      console.log('apiUrl>> fetchSalesmanDetailsOnLoad', apiUrl);
      const response = await axios.get(apiUrl);
      console.log('fetchSalesmanDetailsOnLoad Response:>>', response.data);
      setVan(response.data[0].LOC_CODE);
      setLocName(response.data[0].LOC_Name);

      if (response.data[0].default_dept) {
        console.log('response.data[0].default_dept');
        setDeptNo(response.data[0].default_dept);
        await AsyncStorage.setItem('DEPTNO', response.data[0].default_dept);
      } else {
        // if no dept comes in result then no need to set here because we already do this in Login screen ie setting first dept in userlogin array
        // console.log("response.data[0].deptno>>++" , response.data[0])
        // setDeptNo(response.data[0].deptno)
        // await AsyncStorage.setItem('DEPTNO', response.data[0].deptno);
        // because of this issue picker was not coming when we click on dropdown image
      }
      setSelectedSalesName(response.data[0].Sman_Name);

      await AsyncStorage.setItem('VAN', response.data[0].LOC_CODE);
      await AsyncStorage.setItem('sales_man', response.data[0].Sman_code);
      await AsyncStorage.setItem('salesman_name', response.data[0].Sman_Name);

      // Handle response data as needed
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error
    }
  };

  const fetchSalesmanDetailsOnClick = async salesManId => {
    try {
      const response = await axios.get(
        `${appUrl}masterlist/${cmpCode}/salesman/${salesManId}`,
      );
      console.log('fetchSalesmanDetailsOnClick Response:', response.data);
      setVan(response.data[0].LOC_CODE);
      setLocName(response.data[0].LOC_Name);
      setSelectedSalesName(response.data[0].Sman_Name);

      await AsyncStorage.setItem('VAN', response.data[0].LOC_CODE);
      await AsyncStorage.setItem('sales_man', response.data[0].Sman_code);
      await AsyncStorage.setItem('salesman_name', response.data[0].Sman_Name);

      // Handle response data as needed
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error
    }
  };

  const salesInvoiceButtonClick = () => {
    if (van !== '----' && deptNo !== '----') {
      navigation.navigate('SalesInvoice');
    } else if (deptNo === '----') {
      Alert.alert(
        'No Department is set for this user, Please contact Administrator',
      );
    } else if (van === '----') {
      Alert.alert(
        'No Location is set for this user, Please contact Administrator',
      );
    }
  };

  useEffect(() => {
    if (userLoginData && userLoginData[0].sales_man && cmpCode && appUrl) {
      fetchSalesmanDetailsOnLoad(userLoginData[0].sales_man);
    }
  }, [userLoginData, cmpCode, appUrl]);

  const getNotAllowedmenuListForThisCustomer = () => {
    setCallingNotAvailableMenuList(true);

    let apiUrl = `https://cubixweberp.com:301/api/ClientMenuControl/CUBOT/${cmpCode}/MENU/SALESDOOD`;
    console.log('apiUrl Menu', apiUrl);

    axios
      .get(apiUrl)
      .then(res => {
        setCallingNotAvailableMenuList(false);
        setMenuNotAllowedToThisCompany(res.data);
        console.log('apiUrl Menu res.data', res.data);
      })
      .catch(err => {
        setCallingNotAvailableMenuList(false);
      });
  };

  const getMenuAllowedToThisRole = async () => {
    console.log('apiUrl Menu>>++>> getMenuAllowedToThisRole');

    const baseUrl = await AsyncStorage.getItem('appUrl');
    console.log('apiUrl Menu>>++>>++ baseUrl', baseUrl);
    const accessgrp = await AsyncStorage.getItem('accessgrp');

    setCallingMenuListAvailabletoThisRole(true);

    let apiUrl = `https://cubixweberp.com:301/api/clientmenucontrol/cubot/${cmpCode}/rolemenu/${accessgrp}`;
    console.log('apiUrl Menu>>++>>]]]]', apiUrl);

    axios
      .get(apiUrl)
      .then(res => {
        setCallingMenuListAvailabletoThisRole(false);

        setMenuAllowedToThisRole(res.data);

        console.log('apiUrl Menu res.data', res.data);
      })
      .catch(err => {
        console.log('apiUrl Menu>>++>>]]]] 500');

        setMenuAllowedToThisRole([]);
        setCallingMenuListAvailabletoThisRole(false);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
        const parsedUserDataArray =
          (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

        const userLogin = await AsyncStorage.getItem('UserLogin');
        const accessgrp = await AsyncStorage.getItem('accessgrp');
        const salesMan = await AsyncStorage.getItem('sales_man');
        const salesRole = await AsyncStorage.getItem('SalesRole');
        const salesman_name = await AsyncStorage.getItem('salesman_name');
        const mobileUserTypeFromLocal = await AsyncStorage.getItem(
          'mobileUserTypeAsyncStorage',
        );
        const salesTypeFromLocal = await AsyncStorage.getItem(
          'SalesTypeAsyncStorage',
        );

        console.log('mobileUserTypeFromLocal---> ', mobileUserTypeFromLocal);
        console.log(`salesTypeFromLocal--->${salesTypeFromLocal}`);

        const selectedCompanyString = await AsyncStorage.getItem(
          'selectedCompany',
        );

        const loginData = await AsyncStorage.getItem('loginData');

        if (loginData) {
          const parserData = JSON.parse(loginData);
          console.log('loginData HomeNew', loginData);
          setUserLoginData(parserData);
        }

        setUserDataArray(parsedUserDataArray);
        setUserLogin(userLogin);
        setAccessGrp(accessgrp);
        setSalesMan(salesMan);
        setSalesRole(salesRole);
        setSalesManName(salesman_name);

        setMobileUserType(mobileUserTypeFromLocal);
        setSalesType(salesTypeFromLocal);

        if (parsedUserDataArray && parsedUserDataArray.length === 0) {
          // setDeviceValidation('INVALID')
          navigation.navigate('MachineValidation');
          console.log('not validated');
        }

        if (selectedCompanyString) {
          const selectedCompany = JSON.parse(selectedCompanyString);

          setSelectedCompany(selectedCompany);
        }
      } catch (error) {
        console.error('Error fetching IN HEADER:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (salesMan === '----') {
      setParamValue('-');
      setShowSalesDrop(true);
    } else {
      setParamValue(salesMan);
    }
  }, [salesMan]);

  useEffect(() => {
    if (paramValue && appUrl) {
      fetchAllSalesCode();
    }
  }, [paramValue, appUrl]);

  useEffect(() => {
    if (selectedSalesMan) {
      AsyncStorage.setItem('sales_man_drop', selectedSalesMan)
        .then(() => {
          console.log('selectedSalesMan Data saved successfully');
        })
        .catch(error => console.log('Error saving data', error));
    }
  }, [selectedSalesMan]);

  useEffect(() => {
    if (cmpCode && salesMan && deptNo && appUrl) {
      fetchSalesInvoice();
      fetchSalesInvoiceCash();
      fetchSalesCollection();
      fetchCashCollection();
      fetchChequeCollection();
      getTargetAmount();
    }
  }, [cmpCode, salesMan, deptNo, appUrl]);

  useFocusEffect(
    React.useCallback(() => {
      if (cmpCode && salesMan && deptNo && appUrl) {
        fetchSalesCollection();
        fetchCashCollection();
        fetchChequeCollection();
        getTargetAmount();
      }
    }, [cmpCode, salesMan, deptNo, appUrl]),
  );

  useEffect(() => {
    if (masterList) {
      // setSelectedSalesMan(masterList[0].Sman_code)
    }
  }, [masterList]);

  useEffect(() => {
    fetchSalesManDrop();
  }, []);

  useEffect(() => {
    console.log('userLoginData>>', userLoginData);
  }, [userLoginData]);

  const checkNavigation = async () => {
    const gotoDriver = await AsyncStorage.getItem('gotoDriver');

    console.log('gotoDriverFromHome', gotoDriver);
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
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    checkNavigation(); // Check on component mount

    return () => {
      subscription.remove();
    };
  }, []);

  console.log('selectedBottomTab', selectedBottomTab);

  useEffect(() => {
    console.log('salesType value changed ', salesType);
  }, [salesType]);

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

  useEffect(() => {
    getNotAllowedmenuListForThisCustomer();

    getMenuAllowedToThisRole();

    if (cmpCode?.trim().toUpperCase() == 'TASRA') {
      // navigation.navigate("GoodsCollectionDeliveryPoolList")
      navigation.navigate('HomeNewTasra');
    }
  }, [cmpCode]);

  const getTargetAmount = async () => {
    console.log(
      'getTargetAmount>>>>>> url ++',
      `${appUrl}MasterCount/${cmpCode}/SMAN_TARGET/${salesMan}/-`,
    );

    try {
      const response = await axios.get(
        `${appUrl}MasterCount/${cmpCode}/SMAN_TARGET/${salesMan}/-`,
      );

      console.log('res----++++', response.data[0].TARGET);

      if (response.status === 200) {
        setSalesmanTarget(response.data[0].TARGET);
      }
    } catch (error) {
      console.log('getTargetAmount', error);
    }
  };

  return (
    <>
      {cmpCode != 'TASRA' && (
        <>
          {selectedBottomTab === 'Home' && (
            <LinearGradient
              colors={['#E4DFD7', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
              style={{
                flexGrow: 1,
                // backgroundColor: '#EFECE7'
              }}>
              <View style={styles.modernHeaderWrapper}>
                {/* TOP ROW: Welcome & Picker */}
                <View style={styles.headerTopRow}>
                  <View style={styles.welcomeSection}>
                    <Text style={styles.greetingText}>Welcome back,</Text>
                    <Text style={styles.userNameTextMain}>
                      {selectedSalesName
                        ? selectedSalesName.toUpperCase()
                        : salesManName.toUpperCase()}
                    </Text>
                  </View>

                  {/* DROPDOWN SECTION: Moved to the top right for better access */}
                  {userLoginData && (
                    <View style={styles.pickerContainer}>
                      {/* <Picker
                        style={styles.minimalPicker}
                        onValueChange={itemValue =>
                          handlePickerClick(itemValue)
                        }>
                        {userLoginData.map((item, index) => (
                          <Picker.Item
                            label={`${item.DEPTNO || ''} - ${
                              item.salesman_name || item.sales_man || ''
                            }`}
                            value={{
                              sales_man: item.sales_man,
                              dept_no: item.DEPTNO,
                            }}
                            key={index}
                          />
                        ))}
                      </Picker> */}
                      <Picker
                        // selectedValue={selectedSalesMan}

                        style={styles.picker}
                        onValueChange={itemValue =>
                          handlePickerClick(itemValue)
                        }>
                        {userLoginData &&
                          userLoginData.map((item, index) => (
                            <Picker.Item
                              label={[
                                item.DEPTNO ? item.DEPTNO : item.Column1,

                                item.sales_man,

                                item.salesman_name,
                              ]}
                              value={{
                                sales_man: item.sales_man,

                                dept_no: item.DEPTNO,
                              }}
                              key={index}
                            />
                          ))}
                      </Picker>
                    </View>
                  )}
                </View>

                {/* BOTTOM ROW: Just Company Name */}
                <View style={styles.headerBottomRow}>
                  <View style={styles.companyBadge}>
                    <Text style={styles.cmpSubtitle}>{cmpName}</Text>
                  </View>
                </View>

                {/* SALES STATS SECTION */}
                <View style={styles.TopSalesWrap}>
                  <View style={styles.modernContainer}>
                    {/* PRIMARY SALES BOX */}
                    <View
                      style={[
                        styles.modernSalesBox,
                        { borderLeftColor: '#AEADB2' },
                      ]}>
                      {/* {cmpCode?.toUpperCase() !== 'STARLINK' && ( */}
                      <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Sales Order</Text>
                        {showSalesCollLoader ? (
                          <ActivityIndicator size="small" color="#AEADB2" />
                        ) : (
                          <Text style={styles.metricValue}>
                            {(salesCollection && salesCollection[0]?.amount) ||
                              '0.00'}
                          </Text>
                        )}
                      </View>
                      {/* )}  */}

                      <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Credit Sales</Text>
                        {showCreditSalesLoader ? (
                          <ActivityIndicator size="small" color="#AEADB2" />
                        ) : (
                          <Text style={styles.metricValue}>
                            {(salesInvoice && salesInvoice[0]?.amount) ||
                              '0.00'}
                          </Text>
                        )}
                      </View>

                      <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Cash Sales</Text>
                        {showCashSalesLoader ? (
                          <ActivityIndicator size="small" color="#AEADB2" />
                        ) : (
                          <Text style={styles.metricValue}>
                            {(salesInvoiceCash &&
                              salesInvoiceCash[0]?.amount) ||
                              '0.00'}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* COLLECTIONS SECTION - Condition Intact */}
                    {cmpCode !== 'SUPERLAND' && (
                      <View style={styles.collectionsWrapper}>
                        <View
                          style={[
                            styles.modernSalesBox,
                            { borderLeftColor: '#FF9501', marginBottom: 8 },
                          ]}>
                          <Text style={styles.metricLabelSmall}>
                            Cash Collection
                          </Text>
                          {showCashCollLoader ? (
                            <ActivityIndicator size="small" color="#FF9501" />
                          ) : (
                            <Text
                              style={[
                                styles.metricValueMain,
                                { color: '#FF9501' },
                              ]}>
                              {(cashCollection && cashCollection[0].amount) ||
                                '0.00'}
                            </Text>
                          )}
                        </View>

                        <View
                          style={[
                            styles.modernSalesBox,
                            { borderLeftColor: '#FF3B2F' },
                          ]}>
                          <Text style={styles.metricLabelSmall}>
                            Cheque Collection
                          </Text>
                          {showChequeCollLoader ? (
                            <ActivityIndicator size="small" color="#FF3B2F" />
                          ) : (
                            <Text
                              style={[
                                styles.metricValueMain,
                                { color: '#FF3B2F' },
                              ]}>
                              {(chequeCollection &&
                                chequeCollection[0].amount) ||
                                '0.00'}
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View
                // source={require('../images/bottom_slant.png')}
                style={styles.bottomCont}>
                {userDataArray &&
                  userDataArray[0].cmpcode.trim().toUpperCase() != 'AUTOMAX' &&
                  userDataArray &&
                  userDataArray[0].cmpcode.trim().toUpperCase() != 'MALBAR' &&
                  userDataArray &&
                  userDataArray[0].cmpcode.trim().toUpperCase() != 'SUPERLAND' ? (
                  <ScrollView
                    contentContainerStyle={{
                      width: '100%',
                      // marginTop: 20,
                      paddingBottom: 300,
                      paddingTop: 25,
                      zIndex: 2,
                    }}
                    horizontal={false}>
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        paddingHorizontal: 18,
                      }}>
                      {/* <Text>
                        {console.log(
                          'refreshed menu list menuNotAllowedToThisCompany ',
                          menuNotAllowedToThisCompany,
                        )}
                      </Text> */}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Stock List'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Stock List'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => navigation.navigate('CheckStock')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/srchDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Stock List
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('CheckStock')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/srchDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Stock List</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Quotation'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Quotation'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('MakeQuotation')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/listDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>Quotation</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('MakeQuotation')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/listDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Quotation</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Quotation List'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Quotation List'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('QuotationList')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/listDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Quotation List
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('QuotationList')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/listDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Quotation List
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Sales Order'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Sales Order'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => navigation.navigate('MakeOrder')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/listDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Sales Order
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('MakeOrder')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/listDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Sales Order</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Order List'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Order List'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('PreviousOrders')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/clockDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Order List
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('PreviousOrders')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/clockDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Order List</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Customer'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Customer'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('CustomerDetails')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/bagDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>Customer</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() =>
                            navigation.navigate('CustomerDetails')
                          }>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/bagDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Customer</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Receipt'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Receipt'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => navigation.navigate('Receipt')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/cashDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>Receipt</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('Receipt')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/cashDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Receipt</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Material Request'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Material Request'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('MaterialRequest')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/cashDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Material Request
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() =>
                            navigation.navigate('MaterialRequest')
                          }>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/cashDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Material Request
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Collection'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Collection'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('NewCollections')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/cashDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Collection
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('NewCollections')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/cashDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Collection</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Sales Invoice'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Sales Invoice'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => salesInvoiceButtonClick()}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/listDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Sales Invoice
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => salesInvoiceButtonClick()}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/listDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Sales Invoice
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Invoice List'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Invoice List'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('PreviousSalesInvoice')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Invoice List
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() =>
                            navigation.navigate('PreviousSalesInvoice')
                          }>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Invoice List
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Picking'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Picking'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => navigation.navigate('PickListNew')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>Picking</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('PickListNew')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Picking</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Checking'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Checking'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('CheckingListNew')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>Checking</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() =>
                            navigation.navigate('CheckingListNew')
                          }>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Checking</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Delivery'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Delivery'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => navigation.navigate('DriversApp')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/driver.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>Delivery</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('DriversApp')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/driver.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Delivery</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Collection Report'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Collection Report'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('CollectionReport')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Collection Report
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() =>
                            navigation.navigate('CollectionReport')
                          }>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Collection Report
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Lead Entry'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Lead Entry'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => navigation.navigate('LeadEntry')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Lead Entry
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('LeadEntry')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Lead Entry</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Site Survey'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Site Survey'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => navigation.navigate('SiteSurvey')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Site Survey
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('SiteSurvey')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>Site Survey</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'WMS'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Site Survey'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('SelectLocation')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>WMS</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('SelectLocation')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>WMS</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Physical Stock'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Physical Stock'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('PhysicalStock')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Physical Stock
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('PhysicalStock')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Physical Stock
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Bin and Barcode Updater'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Bin and Barcode Updater'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('BarcodeLinking')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Bin & Barcode Updater
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('BarcodeLinking')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Bin & Barcode Updater
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Invoice Vs Receipt'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Invoice Vs Receipt'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('InvoiceVsReceipt')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Invoice Vs Receipt
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() =>
                            navigation.navigate('InvoiceVsReceipt')
                          }>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Invoice Vs Receipt
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Sales Return'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Sales Return'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() => navigation.navigate('SalesReturn')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Sales Return
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() => navigation.navigate('SalesReturn')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Sales Return
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Sales Return List'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Sales Return List'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('SalesReturnList')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Sales Return List
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() =>
                            navigation.navigate('SalesReturnList')
                          }>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Sales Return List
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Split Item Screen'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Split Item Screen'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              { backgroundColor: '#D4CFC5' },
                            ]}
                            onPress={() =>
                              navigation.navigate('SplitItemScreen')
                            }>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    { resizeMode: 'contain' },
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                  Split Item Screen
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            { backgroundColor: '#D4CFC5' },
                          ]}
                          onPress={() =>
                            navigation.navigate('SplitItemScreen')
                          }>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  { resizeMode: 'contain' },
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                                Split Item Screen
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Business Partners'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Business Partners'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              {backgroundColor: '#D4CFC5'},
                            ]}
                            onPress={() => navigation.navigate('BusinessPartners')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    {resizeMode: 'contain'},
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                Business Partners
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            {backgroundColor: '#D4CFC5'},
                          ]}
                          onPress={() => navigation.navigate('BusinessPartners')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  {resizeMode: 'contain'},
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                              Business Partners
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )} */}

                      {/* {menuNotAllowedToThisCompany ? (
                        menuNotAllowedToThisCompany.some(
                          itemSommy =>
                            itemSommy.MENUID.trim().toUpperCase() ==
                            'Price Updater'.trim().toUpperCase(),
                        ) ? null : menuAllowedToThisRole?.length == 0 ||
                          menuAllowedToThisRole?.some(
                            itemSommy =>
                              itemSommy.MENUID.trim().toUpperCase() ==
                              'Price Updater'.trim().toUpperCase(),
                          ) ? (
                          <TouchableOpacity
                            style={[
                              styles.ItemCont,
                              {backgroundColor: '#D4CFC5'},
                            ]}
                            onPress={() => navigation.navigate('PriceUpdater')}>
                            <View style={styles.innerItem}>
                              <View style={styles.TouchablwWhiteBackg}>
                                <Image
                                  source={require('../images/todoDark.png')}
                                  style={[
                                    styles.optionIcon,
                                    {resizeMode: 'contain'},
                                  ]}></Image>
                              </View>
                              <View style={styles.innerText}>
                                <Text style={styles.optionText}>
                                Price Updater
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : null
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.ItemCont,
                            {backgroundColor: '#D4CFC5'},
                          ]}
                          onPress={() => navigation.navigate('PriceUpdater')}>
                          <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                              <Image
                                source={require('../images/todoDark.png')}
                                style={[
                                  styles.optionIcon,
                                  {resizeMode: 'contain'},
                                ]}></Image>
                            </View>
                            <View style={styles.innerText}>
                              <Text style={styles.optionText}>
                              Price Updater
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )} */}
                    </View>
                  </ScrollView>
                ) : (
                  <>
                    {!callingNotAvailableMenuList &&
                      !isCallingMenuListAvailabletoThisRole && (
                        <ScrollView
                          contentContainerStyle={{
                            width: '100%',
                            // marginTop: 20,
                            paddingBottom: 300,
                            paddingTop: 25,
                            zIndex: 2,
                          }}
                          horizontal={false}>
                          {userDataArray &&
                            userDataArray[0].cmpcode.trim().toUpperCase() ==
                            'SUPERLAND' ? (
                            <View
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                flexWrap: 'wrap',
                                paddingHorizontal: 18,
                              }}>
                              <TouchableOpacity
                                style={[
                                  styles.ItemCont,
                                  { backgroundColor: '#D4CFC5' },
                                ]}
                                onPress={() =>
                                  navigation.navigate('MakeOrder')
                                }>
                                <View style={styles.innerItem}>
                                  <View style={styles.TouchablwWhiteBackg}>
                                    <Image
                                      source={require('../images/listDark.png')}
                                      style={[
                                        styles.optionIcon,
                                        { resizeMode: 'contain' },
                                      ]}></Image>
                                  </View>
                                  <View style={styles.innerText}>
                                    <Text style={styles.optionText}>
                                      Sales Order
                                    </Text>
                                  </View>
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.ItemCont,
                                  { backgroundColor: '#D4CFC5' },
                                ]}
                                onPress={() =>
                                  navigation.navigate('PreviousOrders')
                                }>
                                <View style={styles.innerItem}>
                                  <View style={styles.TouchablwWhiteBackg}>
                                    <Image
                                      source={require('../images/clockDark.png')}
                                      style={[
                                        styles.optionIcon,
                                        { resizeMode: 'contain' },
                                      ]}></Image>
                                  </View>
                                  <View style={styles.innerText}>
                                    <Text style={styles.optionText}>
                                      Order List
                                    </Text>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                paddingHorizontal: 18,
                              }}>
                              {/* <View style={styles.optionsCont}> */}

                              <TouchableOpacity
                                style={[
                                  styles.ItemCont,
                                  { backgroundColor: '#D4CFC5' },
                                ]}
                                onPress={() =>
                                  navigation.navigate('CheckStock')
                                }>
                                <View style={styles.innerItem}>
                                  <View style={styles.TouchablwWhiteBackg}>
                                    <Image
                                      source={require('../images/srchDark.png')}
                                      style={[
                                        styles.optionIcon,
                                        { resizeMode: 'contain' },
                                      ]}></Image>
                                  </View>
                                  <View style={styles.innerText}>
                                    <Text style={styles.optionText}>
                                      Stock List
                                    </Text>
                                  </View>
                                </View>
                              </TouchableOpacity>

                              {userDataArray &&
                                userDataArray[0].cmpcode
                                  .trim()
                                  .toUpperCase() !== 'MALBAR' && (
                                  <>
                                    {(salesType == 'ORDER' ||
                                      (userDataArray &&
                                        userDataArray[0].cmpcode
                                          .trim()
                                          .toUpperCase() == 'AUTOMAX')) && (
                                        <>
                                          {userDataArray &&
                                            userDataArray[0].cmpcode
                                              .trim()
                                              .toUpperCase() == 'AUTOMAX' &&
                                            (mobileUserType == 'Checking Staff' ||
                                              mobileUserType ==
                                              'Delivery Staff') ? (
                                            <TouchableOpacity
                                              style={[
                                                styles.ItemContOverlay,
                                                { backgroundColor: '#D4CFC5' },
                                              ]}
                                              onPress={() =>
                                                Alert.alert(
                                                  "You don't have access",
                                                )
                                              }>
                                              <View style={styles.innerItem}>
                                                <View
                                                  style={
                                                    styles.TouchablwWhiteBackg
                                                  }>
                                                  <Image
                                                    source={require('../images/listDark.png')}
                                                    style={[
                                                      styles.optionIcon,
                                                      { resizeMode: 'contain' },
                                                    ]}></Image>
                                                </View>
                                                <View style={styles.innerText}>
                                                  <Text style={styles.optionText}>
                                                    Sales Order
                                                  </Text>
                                                </View>
                                              </View>
                                              <View
                                                style={
                                                  styles.TouchableBlackOverlay
                                                }>
                                                <Image
                                                  source={require('../images/ic_locked.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                            </TouchableOpacity>
                                          ) : (
                                            <TouchableOpacity
                                              style={[
                                                styles.ItemCont,
                                                { backgroundColor: '#D4CFC5' },
                                              ]}
                                              onPress={() =>
                                                navigation.navigate('MakeOrder')
                                              }>
                                              <View style={styles.innerItem}>
                                                <View
                                                  style={
                                                    styles.TouchablwWhiteBackg
                                                  }>
                                                  <Image
                                                    source={require('../images/listDark.png')}
                                                    style={[
                                                      styles.optionIcon,
                                                      { resizeMode: 'contain' },
                                                    ]}></Image>
                                                </View>
                                                <View style={styles.innerText}>
                                                  <Text style={styles.optionText}>
                                                    Sales Order
                                                  </Text>
                                                </View>
                                              </View>
                                            </TouchableOpacity>
                                          )}
                                        </>
                                      )}
                                  </>
                                )}

                              {userDataArray &&
                                userDataArray[0].cmpcode
                                  .trim()
                                  .toUpperCase() !== 'MALBAR' && (
                                  <>
                                    {(salesType == 'ORDER' ||
                                      (userDataArray &&
                                        userDataArray[0].cmpcode
                                          .trim()
                                          .toUpperCase() == 'AUTOMAX')) && (
                                        <>
                                          {userDataArray &&
                                            userDataArray[0].cmpcode
                                              .trim()
                                              .toUpperCase() == 'AUTOMAX' &&
                                            (mobileUserType == 'Checking Staff' ||
                                              mobileUserType ==
                                              'Delivery Staff') ? (
                                            <TouchableOpacity
                                              style={[
                                                styles.ItemContOverlay,
                                                { backgroundColor: '#D4CFC5' },
                                              ]}
                                              onPress={() =>
                                                Alert.alert(
                                                  "You don't have access",
                                                )
                                              }>
                                              <View style={styles.innerItem}>
                                                <View
                                                  style={
                                                    styles.TouchablwWhiteBackg
                                                  }>
                                                  <Image
                                                    source={require('../images/clockDark.png')}
                                                    style={[
                                                      styles.optionIcon,
                                                      { resizeMode: 'contain' },
                                                    ]}></Image>
                                                </View>
                                                <View style={styles.innerText}>
                                                  <Text style={styles.optionText}>
                                                    Order List
                                                  </Text>
                                                </View>
                                              </View>
                                              <View
                                                style={
                                                  styles.TouchableBlackOverlay
                                                }>
                                                <Image
                                                  source={require('../images/ic_locked.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                            </TouchableOpacity>
                                          ) : (
                                            <TouchableOpacity
                                              style={[
                                                styles.ItemCont,
                                                { backgroundColor: '#D4CFC5' },
                                              ]}
                                              onPress={() =>
                                                navigation.navigate(
                                                  'PreviousOrders',
                                                )
                                              }>
                                              <View style={styles.innerItem}>
                                                <View
                                                  style={
                                                    styles.TouchablwWhiteBackg
                                                  }>
                                                  <Image
                                                    source={require('../images/clockDark.png')}
                                                    style={[
                                                      styles.optionIcon,
                                                      { resizeMode: 'contain' },
                                                    ]}></Image>
                                                </View>
                                                <View style={styles.innerText}>
                                                  <Text style={styles.optionText}>
                                                    Order List
                                                  </Text>
                                                </View>
                                              </View>
                                            </TouchableOpacity>
                                          )}
                                        </>
                                      )}
                                  </>
                                )}

                              {mobileUserType == 'Picking Staff' ||
                                mobileUserType == 'Checking Staff' ||
                                mobileUserType == 'Delivery Staff' ? (
                                <TouchableOpacity
                                  style={[
                                    styles.ItemContOverlay,
                                    { backgroundColor: '#D4CFC5' },
                                  ]}
                                  onPress={() =>
                                    Alert.alert("You don't have access")
                                  }>
                                  <View style={styles.innerItem}>
                                    <View style={styles.TouchablwWhiteBackg}>
                                      <Image
                                        source={require('../images/bagDark.png')}
                                        style={[
                                          styles.optionIcon,
                                          { resizeMode: 'contain' },
                                        ]}></Image>
                                    </View>
                                    <View style={styles.innerText}>
                                      <Text style={styles.optionText}>
                                        Customer
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={styles.TouchableBlackOverlay}>
                                    <Image
                                      source={require('../images/ic_locked.png')}
                                      style={[
                                        styles.optionIcon,
                                        { resizeMode: 'contain' },
                                      ]}></Image>
                                  </View>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={[
                                    styles.ItemCont,
                                    { backgroundColor: '#D4CFC5' },
                                  ]}
                                  onPress={() =>
                                    navigation.navigate('CustomerDetails')
                                  }>
                                  <View style={styles.innerItem}>
                                    <View style={styles.TouchablwWhiteBackg}>
                                      <Image
                                        source={require('../images/bagDark.png')}
                                        style={[
                                          styles.optionIcon,
                                          { resizeMode: 'contain' },
                                        ]}></Image>
                                    </View>
                                    <View style={styles.innerText}>
                                      <Text style={styles.optionText}>
                                        Customer
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              )}

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

                              {mobileUserType == 'Picking Staff' ||
                                mobileUserType == 'Checking Staff' ||
                                mobileUserType == 'Delivery Staff' ? (
                                <TouchableOpacity
                                  style={[
                                    styles.ItemContOverlay,
                                    { backgroundColor: '#D4CFC5' },
                                  ]}
                                  onPress={() =>
                                    Alert.alert("You don't have access")
                                  }>
                                  <View style={styles.innerItem}>
                                    <View style={styles.TouchablwWhiteBackg}>
                                      <Image
                                        source={require('../images/cashDark.png')}
                                        style={[
                                          styles.optionIcon,
                                          { resizeMode: 'contain' },
                                        ]}></Image>
                                    </View>
                                    <View style={styles.innerText}>
                                      <Text style={styles.optionText}>
                                        Collection
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={styles.TouchableBlackOverlay}>
                                    <Image
                                      source={require('../images/ic_locked.png')}
                                      style={[
                                        styles.optionIcon,
                                        { resizeMode: 'contain' },
                                      ]}></Image>
                                  </View>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={[
                                    styles.ItemCont,
                                    { backgroundColor: '#D4CFC5' },
                                  ]}
                                  onPress={() =>
                                    navigation.navigate('NewCollections')
                                  }>
                                  <View style={styles.innerItem}>
                                    <View style={styles.TouchablwWhiteBackg}>
                                      <Image
                                        source={require('../images/cashDark.png')}
                                        style={[
                                          styles.optionIcon,
                                          { resizeMode: 'contain' },
                                        ]}></Image>
                                    </View>
                                    <View style={styles.innerText}>
                                      <Text style={styles.optionText}>
                                        Collection
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              )}

                              {userDataArray &&
                                userDataArray[0].cmpcode
                                  .trim()
                                  .toUpperCase() !== 'AUTOMAX' && (
                                  <>
                                    {(salesType == 'SALES' ||
                                      (userDataArray &&
                                        userDataArray[0].cmpcode
                                          .trim()
                                          .toUpperCase() == 'MALBAR')) && (
                                        // <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('SalesInvoice')}>
                                        <>
                                          <TouchableOpacity
                                            style={[
                                              styles.ItemCont,
                                              { backgroundColor: '#D4CFC5' },
                                            ]}
                                            onPress={() =>
                                              salesInvoiceButtonClick()
                                            }>
                                            <View style={styles.innerItem}>
                                              <View
                                                style={
                                                  styles.TouchablwWhiteBackg
                                                }>
                                                <Image
                                                  source={require('../images/listDark.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                              <View style={styles.innerText}>
                                                <Text style={styles.optionText}>
                                                  Sales Invoice
                                                </Text>
                                              </View>
                                            </View>
                                          </TouchableOpacity>
                                          <TouchableOpacity
                                            style={[
                                              styles.ItemCont,
                                              { backgroundColor: '#D4CFC5' },
                                            ]}
                                            onPress={() =>
                                              navigation.navigate(
                                                'PreviousSalesInvoice',
                                              )
                                            }>
                                            <View style={styles.innerItem}>
                                              <View
                                                style={
                                                  styles.TouchablwWhiteBackg
                                                }>
                                                <Image
                                                  source={require('../images/todoDark.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                              <View style={styles.innerText}>
                                                <Text style={styles.optionText}>
                                                  Invoice List
                                                </Text>
                                              </View>
                                            </View>
                                          </TouchableOpacity>
                                        </>
                                      )}
                                  </>
                                )}

                              {
                                <>
                                  {userDataArray &&
                                    userDataArray[0].cmpcode
                                      .trim()
                                      .toUpperCase() === 'AUTOMAX' && (
                                      <>
                                        {mobileUserType == 'Checking Staff' ? (
                                          <TouchableOpacity
                                            style={[
                                              styles.ItemContOverlay,
                                              { backgroundColor: '#D4CFC5' },
                                            ]}
                                            onPress={() =>
                                              Alert.alert(
                                                "You don't have access",
                                              )
                                            }>
                                            <View style={styles.innerItem}>
                                              <View
                                                style={
                                                  styles.TouchablwWhiteBackg
                                                }>
                                                <Image
                                                  source={require('../images/todoDark.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                              <View style={styles.innerText}>
                                                <Text style={styles.optionText}>
                                                  Picking
                                                </Text>
                                              </View>
                                            </View>
                                            <View
                                              style={
                                                styles.TouchableBlackOverlay
                                              }>
                                              <Image
                                                source={require('../images/ic_locked.png')}
                                                style={[
                                                  styles.optionIcon,
                                                  { resizeMode: 'contain' },
                                                ]}></Image>
                                            </View>
                                          </TouchableOpacity>
                                        ) : (
                                          <TouchableOpacity
                                            style={[
                                              styles.ItemCont,
                                              { backgroundColor: '#D4CFC5' },
                                            ]}
                                            onPress={() =>
                                              navigation.navigate('PickListNew')
                                            }>
                                            <View style={styles.innerItem}>
                                              <View
                                                style={
                                                  styles.TouchablwWhiteBackg
                                                }>
                                                <Image
                                                  source={require('../images/todoDark.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                              <View style={styles.innerText}>
                                                <Text style={styles.optionText}>
                                                  Picking
                                                </Text>
                                              </View>
                                            </View>
                                          </TouchableOpacity>
                                        )}

                                        {mobileUserType == 'Picking Staff' ||
                                          mobileUserType == 'Sales Staff' ||
                                          mobileUserType == 'Delivery Staff' ? (
                                          <TouchableOpacity
                                            style={[
                                              styles.ItemContOverlay,
                                              { backgroundColor: '#D4CFC5' },
                                            ]}
                                            onPress={() =>
                                              Alert.alert(
                                                "You don't have access",
                                              )
                                            }>
                                            <View style={styles.innerItem}>
                                              <View
                                                style={
                                                  styles.TouchablwWhiteBackg
                                                }>
                                                <Image
                                                  source={require('../images/todoDark.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                              <View style={styles.innerText}>
                                                <Text style={styles.optionText}>
                                                  Checking
                                                </Text>
                                              </View>
                                            </View>
                                            <View
                                              style={
                                                styles.TouchableBlackOverlay
                                              }>
                                              <Image
                                                source={require('../images/ic_locked.png')}
                                                style={[
                                                  styles.optionIcon,
                                                  { resizeMode: 'contain' },
                                                ]}></Image>
                                            </View>
                                          </TouchableOpacity>
                                        ) : (
                                          <TouchableOpacity
                                            style={[
                                              styles.ItemCont,
                                              { backgroundColor: '#D4CFC5' },
                                            ]}
                                            onPress={() =>
                                              navigation.navigate(
                                                'CheckingListNew',
                                              )
                                            }>
                                            <View style={styles.innerItem}>
                                              <View
                                                style={
                                                  styles.TouchablwWhiteBackg
                                                }>
                                                <Image
                                                  source={require('../images/todoDark.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                              <View style={styles.innerText}>
                                                <Text style={styles.optionText}>
                                                  Checking
                                                </Text>
                                              </View>
                                            </View>
                                          </TouchableOpacity>
                                        )}
                                      </>
                                    )}
                                </>
                              }

                              {
                                <>
                                  {userDataArray &&
                                    userDataArray[0].cmpcode
                                      .trim()
                                      .toUpperCase() !== 'MALBAR' && (
                                      <>
                                        {userDataArray &&
                                          userDataArray[0].cmpcode
                                            .trim()
                                            .toUpperCase() !== 'MALBAR' &&
                                          mobileUserType == 'Picking Staff' ? (
                                          <TouchableOpacity
                                            style={[
                                              styles.ItemContOverlay,
                                              { backgroundColor: '#D4CFC5' },
                                            ]}
                                            onPress={() =>
                                              Alert.alert(
                                                "You don't have access",
                                              )
                                            }>
                                            <View style={styles.innerItem}>
                                              <View
                                                style={
                                                  styles.TouchablwWhiteBackg
                                                }>
                                                <Image
                                                  source={require('../images/driver.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                              <View style={styles.innerText}>
                                                <Text style={styles.optionText}>
                                                  Delivery
                                                </Text>
                                              </View>
                                            </View>
                                            <View
                                              style={
                                                styles.TouchableBlackOverlay
                                              }>
                                              <Image
                                                source={require('../images/ic_locked.png')}
                                                style={[
                                                  styles.optionIcon,
                                                  { resizeMode: 'contain' },
                                                ]}></Image>
                                            </View>
                                          </TouchableOpacity>
                                        ) : (
                                          <TouchableOpacity
                                            style={[
                                              styles.ItemCont,
                                              { backgroundColor: '#D4CFC5' },
                                            ]}
                                            onPress={() =>
                                              navigation.navigate('DriversApp')
                                            }>
                                            <View style={styles.innerItem}>
                                              <View
                                                style={
                                                  styles.TouchablwWhiteBackg
                                                }>
                                                <Image
                                                  source={require('../images/driver.png')}
                                                  style={[
                                                    styles.optionIcon,
                                                    { resizeMode: 'contain' },
                                                  ]}></Image>
                                              </View>
                                              <View style={styles.innerText}>
                                                <Text style={styles.optionText}>
                                                  Delivery
                                                </Text>
                                              </View>
                                            </View>
                                          </TouchableOpacity>
                                        )}
                                      </>
                                    )}
                                </>
                              }

                              {mobileUserType == 'Picking Staff' ||
                                mobileUserType == 'Checking Staff' ||
                                mobileUserType == 'Delivery Staff' ? (
                                <TouchableOpacity
                                  style={[
                                    styles.ItemContOverlay,
                                    { backgroundColor: '#D4CFC5' },
                                  ]}
                                  onPress={() =>
                                    Alert.alert("You don't have access")
                                  }>
                                  <View style={styles.innerItem}>
                                    <View style={styles.TouchablwWhiteBackg}>
                                      <Image
                                        source={require('../images/todoDark.png')}
                                        style={[
                                          styles.optionIcon,
                                          { resizeMode: 'contain' },
                                        ]}></Image>
                                    </View>
                                    <View style={styles.innerText}>
                                      <Text style={styles.optionText}>
                                        Collection Report
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={styles.TouchableBlackOverlay}>
                                    <Image
                                      source={require('../images/ic_locked.png')}
                                      style={[
                                        styles.optionIcon,
                                        { resizeMode: 'contain' },
                                      ]}></Image>
                                  </View>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={[
                                    styles.ItemCont,
                                    { backgroundColor: '#D4CFC5' },
                                  ]}
                                  onPress={() =>
                                    navigation.navigate('CollectionReport')
                                  }>
                                  <View style={styles.innerItem}>
                                    <View style={styles.TouchablwWhiteBackg}>
                                      <Image
                                        source={require('../images/todoDark.png')}
                                        style={[
                                          styles.optionIcon,
                                          { resizeMode: 'contain' },
                                        ]}></Image>
                                    </View>
                                    <View style={styles.innerText}>
                                      <Text style={styles.optionText}>
                                        Collection Report
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </ScrollView>
                      )}
                  </>
                )}
              </View>

              {/* bottomGlobe */}
              <View style={styles.BottomImgCont}>
                <Image
                  style={styles.GlobeImg}
                  source={require('../images/mapHome.png')}
                />
              </View>
              {/* bottomGlobe */}

              <View style={styles.CBXImgWrap}>
                {/* <View>
                            <Text style={[styles.cmpcodeText, { color: "grey" }]}>{cmpName}</Text>
                        </View> */}
                <View style={styles.SalesManImgWrap}>
                  <Image
                    style={styles.SalesManImg}
                    source={require('../images/salesDoodS.png')}></Image>
                </View>

                <Image
                  style={styles.CBXImg}
                  source={require('../images/pwrByBg.png')}></Image>

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
              </View>
            </LinearGradient>
          )}

          {selectedBottomTab === 'DashBoard' && <Home />}

          <View style={styles.BottomTab}>
            {/* <TouchableOpacity onPress={() => setSelecetdBottomTab('DashBoard')}> */}
            <TouchableOpacity>
              {selectedBottomTab === 'DashBoard' ? (
                <Image
                  style={styles.BottomTabImg}
                  source={require('../images/ic_dashboard_filled.png')}
                />
              ) : (
                <Image
                  style={styles.BottomTabImg}
                  source={require('../images/ic_dashboard_outline.png')}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelecetdBottomTab('Home')}>
              {selectedBottomTab === 'Home' ? (
                <Image
                  style={styles.BottomTabImg}
                  source={require('../images/ic_home_filled.png')}
                />
              ) : (
                <Image
                  style={styles.BottomTabImg}
                  source={require('../images/ic_home_outline.png')}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowSidePanel(!showSidePanel)}>
              {showSidePanel ? (
                <Image
                  style={styles.BottomTabImg}
                  source={require('../images/ic_settings_filled.png')}
                />
              ) : (
                <Image
                  style={styles.BottomTabImg}
                  source={require('../images/ic_settings_outline.png')}
                />
              )}
            </TouchableOpacity>
          </View>

          {showSidePanel && (
            <View style={styles.sidePanelWrapper}>
              <TouchableOpacity
                style={styles.sidePanelLeft}
                onPress={() => setShowSidePanel(!showSidePanel)}>
                {/* <Text>sideleft</Text> */}
              </TouchableOpacity>

              <View style={styles.sidePanelRight}>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: 12,
                    paddingVertical: 12,
                  }}>
                  <View
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 50,
                    }}>
                    <Image source={require('../images/userAvatar.png')} />
                  </View>
                  <View style={{ padding: 8 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: 'black',
                        fontFamily: 'Lexend-Bold',
                      }}>
                      {selectedSalesName
                        ? selectedSalesName.toUpperCase()
                        : salesManName.toUpperCase()}
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

                <View
                  style={{
                    marginTop: 'auto',
                    marginBottom: 25,
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    style={styles.LogoutButton}
                    onPress={() => setshowLogoutPoP(!showLogOutPoP)}>
                    <Text
                      style={{
                        color: 'white',
                        marginRight: 6,
                        fontFamily: 'Lexend-Regular',
                      }}>
                      LogOut
                    </Text>
                    {/* <Image style={{ width: 20, height: 20 }} source={require('../images/logOutLight.png')} /> */}
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    marginTop: 'auto',
                    paddingBottom: 50,
                    justifyContent: 'center',
                    width: '100%',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      marginRight: 6,
                      fontFamily: 'Lexend-Regular',
                    }}>
                    version 6.10.0
                  </Text>
                </View>
              </View>
            </View>
          )}

          {showLogOutPoP && (
            <View style={styles.LogOutModalWrapper}>
              <View style={styles.LogOutModal}>
                <View>
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 18,
                      fontWeight: 'bold',
                      padding: 8,
                      margin: 4,
                      fontFamily: 'Lexend-Regular',
                    }}>
                    LogOut
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 16,
                      padding: 8,
                      margin: 4,
                      fontFamily: 'Lexend-Regular',
                    }}>
                    Are you sure ?
                  </Text>
                </View>

                <View
                  style={{
                    // width: '100%',
                    padding: 8,
                    margin: 4,
                    paddingLeft: 12,
                    paddingRight: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: 'grey',
                      padding: 8,
                      borderRadius: 4,
                    }}
                    onPress={() => setshowLogoutPoP(!showLogOutPoP)}>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'Lexend-Regular',
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: 'red',
                      padding: 8,
                      borderRadius: 4,
                    }}
                    onPress={() => handleLogout()}>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'Lexend-Regular',
                      }}>
                      LogOut
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {msgModal && (
            <View
              // visible={modalVisible}
              // animationType="slide"
              // onRequestClose={closeModal}
              style={styles.mapmodalContainer}>
              {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> */}
              <View style={styles.mapmodalContent}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                  New Item Added to Delivery !
                </Text>

                <TouchableOpacity
                  style={styles.AcceptButton}
                  onPress={() => navigateToTaskDetails()}>
                  <Text style={styles.AcceptText}>Delivery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  topCont: {
    width: '100%',
    // height: Dimensions.get('window').height / 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  topUserCont: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
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
    justifyContent: 'space-between',
    // paddingHorizontal: 8,
    // paddingVertical: 8
  },
  TRDateCont: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    padding: 8,
  },
  TRCollectionCont: {
    paddingVertical: 8,
  },
  TRSCHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  TRSCData: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
  },
  userAvatar: {
    width: 25,
    height: 25,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  userNameText: {
    fontSize: 14,
    color: '#2B2B2B',
    fontFamily: 'Lexend-Bold',
  },
  topCirclesCont: {
    position: 'absolute',
    top: -8,
    right: 0,
  },
  topCirclesImg: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  settingsCont: {
    position: 'absolute',
    top: '20%',
    right: '5%',
  },
  settingsImg: {
    width: 40,
    height: 40,
  },

  bottomCont: {
    width: '100%',
    height: Dimensions.get('window').height,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // position: 'relative',
    zIndex: 3,
  },
  leftImgCont: {
    position: 'absolute',
    left: 0,
    bottom: 150,
  },
  leftImg: {
    width: 180,
    height: 400,
  },
  rightImgCont: {
    position: 'absolute',
    right: 0,
    bottom: 200,
  },
  rightImg: {
    width: 100,
    height: 420,
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
    marginTop: 8,
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
    height: 120,

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
    position: 'relative',
    justifyContent: 'center',
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
    justifyContent: 'center',
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
    flexDirection: 'row',
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
    padding: 12,
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
    borderRadius: 8,
  },
  LogoutButton: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'red',
    borderRadius: 4,
    alignItems: 'center',
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
    resizeMode: 'contain',
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
    alignItems: 'center',
  },
  CBXImg: {
    width: 100,
    height: 30,
    resizeMode: 'contain',
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
    justifyContent: 'space-between',
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
    alignItems: 'center',
  },
  GlobeImg: {
    width: 500,
    // height: 250,
    resizeMode: 'contain',
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
    zIndex: 5,
  },

  BottomTabImg: {
    width: 25,
    height: 25,
  },

  CBXImgBottomRound: {
    width: 60,
    height: 35,
    resizeMode: 'contain',
  },

  TopSalesWrap: {
    width: '100%',
    paddingHorizontal: '2%',
    marginTop: 10,
  },
  modernContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modernSalesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    // Accent border on the left for a modern look
    borderLeftWidth: 4,
    // Modern soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  collectionsWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Lexend-Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricLabelSmall: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Lexend-Bold',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 13,
    color: '#2B2B2B',
    fontFamily: 'Lexend-Bold',
  },
  metricValueMain: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  TopSalesBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    flex: 1,
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
    paddingHorizontal: 12,
  },

  UserAvatarCont: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  TouchablwWhiteBackg: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  TouchableBlackOverlay: {
    padding: 8,
    backgroundColor: '#00000095',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    height: 110,
    width: '100%',
    right: 0,
    left: 0,
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
    width: '94%',
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
  }, // Add these to your existing styles object
  modernHeaderWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Lexend-Regular',
  },
  userNameTextMain: {
    fontSize: 18,
    color: '#1C1C1E',
    fontFamily: 'Lexend-Bold',
  },
  profileActionSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
    marginRight: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#018ED1', // Corporate Blue
  },
  companyBadge: {
    flexDirection: 'column',
  },
  locationBadge: {
    backgroundColor: '#E5F6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  pickerContainer: {
    backgroundColor: '#F2F2F7', // Light grey professional background
    borderRadius: 10,
    width: '45%', // Wide enough to show Dept + Name
    height: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  minimalPicker: {
    width: '100%',
    color: '#018ED1', // Corporate Blue for the text
  },
  headerBottomRow: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  cmpSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    fontFamily: 'Lexend-Regular',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default HomeNew;
