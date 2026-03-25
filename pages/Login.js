import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import cbxLogo from '../images/cbxLogo.png';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import ToastManager, {Toast} from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import Loader from '../popups/Loader';
import messaging from '@react-native-firebase/messaging';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const [localUser, setLocalUser] = useState('');

  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const [cmpcode, setCmpCode] = useState('');
  const [publick, setpublick] = useState('');
  const [privatek, setprivatek] = useState('');

  const [loginError, setLoginError] = useState(null);
  const [loginClick, setLoginClick] = useState(false);

  const [userDataArray, setUserDataArray] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [portNoData, setPortNoData] = useState('');

  const [showContinue, setShowContinue] = useState(false);

  const [userData, setUserData] = useState({
    username: '',
    password: '',
  });

  const [showLoader, setShowLoader] = useState(false);

  const handleGetPortNo = async () => {
    try {
      const response = await axios.get(
        `https://cubixweberp.com:301/api/clientmanager/${userDataArray[0].cmpcode}`,
      );
      if (response.status === 200) {
        setPortNoData(response.data);
        await AsyncStorage.setItem('portNoData', JSON.stringify(response.data));
      }
    } catch (error) {
      console.log('handleGetPortNo', error);
    }
  };

  useEffect(() => {
    if (userDataArray) {
      handleGetPortNo();
    }
  }, [userDataArray]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setShowLoader(true);
        try {
          // Retrieve the selected company details from AsyncStorage
          const selectedCompanyString = await AsyncStorage.getItem(
            'selectedCompany',
          );

          const userLoginStatus = await AsyncStorage.getItem('Userlogin');

          console.log('userLoginStatus', userLoginStatus);

          // console.log('selectedCompanyfromLogin', selectedCompanyString);

          // Check if a selected company is stored in AsyncStorage
          if (selectedCompanyString) {
            const selectedCompany = JSON.parse(selectedCompanyString);

            setSelectedCompany(selectedCompany);

            // Access the company details and set them as states
            setCmpCode(selectedCompany.cmpcode);
            setpublick(selectedCompany.publick);
            setprivatek(selectedCompany.privatek);

            if (userLoginStatus === 'Sucess') {
              setShowLoader(false);

              ReLogin();
              // navigation.navigate('Home');
            } else {
              console.log('not Logged in');
              setShowLoader(false);
            }
          } else {
            // Handle the case where no selected company is found
            console.error('No selected company found in local storage');
            setShowLoader(false);
          }
        } catch (error) {
          console.error('Error fetching data from AsyncStorage:', error);
          setShowLoader(false);
        }
      };

      fetchData();
    }, []),
  );

  useEffect(() => {
    const fetchData = async () => {
      setShowLoader(true);
      try {
        // Retrieve the selected company details from AsyncStorage
        const selectedCompanyString = await AsyncStorage.getItem(
          'selectedCompany',
        );

        const userLoginStatus = await AsyncStorage.getItem('Userlogin');

        console.log('userLoginStatus', userLoginStatus);

        // console.log('selectedCompanyfromLogin', selectedCompanyString);

        // Check if a selected company is stored in AsyncStorage
        if (selectedCompanyString) {
          const selectedCompany = JSON.parse(selectedCompanyString);

          setSelectedCompany(selectedCompany);

          // Access the company details and set them as states
          setCmpCode(selectedCompany.cmpcode);
          setpublick(selectedCompany.publick);
          setprivatek(selectedCompany.privatek);

          if (userLoginStatus === 'Sucess') {
            setShowLoader(false);

            ReLogin();
            // navigation.navigate('Home');
          } else {
            console.log('not Logged in');
            setShowLoader(false);
          }
        } else {
          // Handle the case where no selected company is found
          console.error('No selected company found in local storage');
          setShowLoader(false);
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
        setShowLoader(false);
      }
    };

    if (userDataArray) {
      fetchData();
    }
  }, [userDataArray]);

  useEffect(() => {
    const checkValidation = async () => {
      const storedUserDataArray =
        JSON.parse(await AsyncStorage.getItem('userDataArray')) || [];

      if (storedUserDataArray.length === 0) {
        // setDeviceValidation('INVALID')
        // navigation.navigate('MachineValidation');
        console.log('not validated');
      }
    };

    checkValidation();
  }, []);

  async function subscribeToTopic() {
    // here add company code + drivers else drivers of all company will get notification
    await messaging().subscribeToTopic(
      `${userDataArray[0].cmpcode?.trim().toUpperCase()}_drivers`,
    );

    console.log(
      'Subscribed to topic',
      `${userDataArray[0].cmpcode?.trim().toUpperCase()}_drivers`,
    );
  }

  async function unsubscribeFromTopic() {
    // here also company code + drivers
    await messaging().unsubscribeFromTopic(
      `${userDataArray[0].cmpcode?.trim().toUpperCase()}_drivers`,
    );
    console.log(
      'Unsubscribed from topic ',
      `${userDataArray[0].cmpcode?.trim().toUpperCase()}_drivers`,
    );
  }

  const showLoginSuccessToast = () => {
    Toast.success(`welcome, ${userId}`);
  };

  const showLoginFailedToast = () => {
    Toast.error('Some Error occured, Please try again later+++');
  };

  const showFormEmptyToast = () => {
    Toast.error('UserId and Password cant be empty');
  };

  const [userDataExists, setUserDataExists] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const storedUserDataArray = await AsyncStorage.getItem(
            'userDataArray',
          );
          const parsedUserDataArray = JSON.parse(storedUserDataArray) || [];

          setUserDataArray(parsedUserDataArray);

          let apiUrl = `${parsedUserDataArray[0].api_config}/api/`;

          await AsyncStorage.setItem('appUrl', apiUrl);

          if (parsedUserDataArray.length === 0) {
            // setDeviceValidation('INVALID')
            navigation.navigate('MachineValidation');
            console.log('not validated');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }, [navigation]),
  );

  const ReLogin = async () => {
    console.log('log clicked ReLogin----->');

    try {
      const locusername = await AsyncStorage.getItem('loginUserName');
      const locpassword = await AsyncStorage.getItem('loginPass');

      setLocalUser(locusername);

      const username = encodeURIComponent(locusername);
      const pass = encodeURIComponent(locpassword);

      const appUrl = await AsyncStorage.getItem('appUrl');

      const uri = `${appUrl}LoginUser?user=${username}&pass=${pass}&cmpcode=${userDataArray[0].cmpcode}`;

      console.log('reloginUrl>>++++', uri);

      const response = await axios.get(uri);
      // const result = response.data.result1.value[0];

      console.log('loginres', response.data);
      const result = response.data[0];
      console.log('result of relogin', result);

      if (result.Userlogin === 'Sucess') {
        setShowContinue(true);

        if (result.accessgrp === 'DRIVER') {
          subscribeToTopic();
        } else {
          unsubscribeFromTopic(); // Unsubscribe non-driver devices
        }

        const jsonValue = JSON.stringify(response.data);

        console.log('jsonValue', jsonValue);

        await AsyncStorage.setItem('loginData', jsonValue);

        await AsyncStorage.setItem('loginUserName', locusername);

        await AsyncStorage.setItem('loginPass', locpassword);

        await AsyncStorage.setItem('Userlogin', result.Userlogin?.trim());
        await AsyncStorage.setItem('accessgrp', result.accessgrp?.trim());
        await AsyncStorage.setItem('SalesRole', result.SalesRole?.trim());

        if (result.smankey) {
          await AsyncStorage.setItem('Smankey', result.smankey?.trim());

          console.log('smankey after login ', result.smankey?.trim());
        }

        console.log(
          'result.Mobile_User.trim()->-> RL ',
          result.Mobile_User?.trim(),
        );

        console.log('result.Sales_type.trim() RL ', result.Sales_type?.trim());

        await AsyncStorage.setItem(
          'mobileUserTypeAsyncStorage',
          result.Mobile_User?.trim(),
        );

        await AsyncStorage.setItem(
          'SalesTypeAsyncStorage',
          result.Sales_type?.trim(),
        );

        if (result.Fleet_Name === '') {
          await AsyncStorage.setItem('Fleet_Name', '----');
        } else {
          await AsyncStorage.setItem('Fleet_Name', result.Fleet_Name?.trim());
        }

        if (result.sales_man === '') {
          await AsyncStorage.setItem('sales_man', '----');
        } else {
          await AsyncStorage.setItem('sales_man', result.sales_man?.trim());
        }
        if (result.salesman_name === null) {
          await AsyncStorage.setItem('salesman_name', '----');
        } else {
          await AsyncStorage.setItem(
            'salesman_name',
            result.salesman_name?.trim(),
          );
        }

        if (result.DEPTNO === null) {
          await AsyncStorage.setItem('DEPTNO', '----');
        } else {
          await AsyncStorage.setItem('DEPTNO', result.DEPTNO?.trim());
        }
        if (result.VAN === null) {
          await AsyncStorage.setItem('VAN', '----');
        } else {
          await AsyncStorage.setItem('VAN', result.VAN?.trim());
        }

        setLoading(false);

        setUserId('');
        setPassword('');

        // navigation.navigate('Home')
      }
    } catch (error) {}
  };

  const login = async () => {
    console.log('log clicked ReLogin>>>>>');

    setLoading(true);

    if (userId !== '' && password !== '') {
      try {
        const username = encodeURIComponent(userId);
        const pass = encodeURIComponent(password);

        const appUrl = await AsyncStorage.getItem('appUrl');

        console.log('appUrl ', appUrl);

        console.log('encodePass', pass);

        const uri = `${appUrl}LoginUser?user=${username}&pass=${pass}&cmpcode=${userDataArray[0].cmpcode}`;

        console.log('login api url---->>', uri);

        const response = await axios.get(uri);
        // const result = response.data.result1.value[0];

        console.log('loginres>>>', response.data);
        const result = response.data[0];

        if (result.Userlogin === 'Sucess') {
          if (result.accessgrp === 'DRIVER') {
            subscribeToTopic();
          } else {
            unsubscribeFromTopic(); // Unsubscribe non-driver devices
          }

          const jsonValue = JSON.stringify(response.data);

          console.log('jsonValue', jsonValue);

          await AsyncStorage.setItem('loginData', jsonValue);

          await AsyncStorage.setItem('loginUserName', userId);

          await AsyncStorage.setItem('loginPass', password);

          await AsyncStorage.setItem('Userlogin', result.Userlogin?.trim());
          await AsyncStorage.setItem('accessgrp', result.accessgrp?.trim());
          await AsyncStorage.setItem('SalesRole', result.SalesRole?.trim());

          if (result.smankey) {
            await AsyncStorage.setItem('Smankey', result.smankey?.trim());

            console.log('smankey after login ', result.smankey?.trim());
          }

          console.log(
            'result.Mobile_User.trim()->-> L ',
            result.Mobile_User?.trim(),
          );

          console.log('result.Sales_type.trim() L ', result.Sales_type?.trim());

          if (result.Mobile_User) {
            await AsyncStorage.setItem(
              'mobileUserTypeAsyncStorage',
              result.Mobile_User?.trim(),
            );
          }

          if (result.Sales_type) {
            await AsyncStorage.setItem(
              'SalesTypeAsyncStorage',
              result.Sales_type?.trim(),
            );
          }

          if (result.Fleet_Name === '') {
            await AsyncStorage.setItem('Fleet_Name', '----');
          } else {
            await AsyncStorage.setItem('Fleet_Name', result.Fleet_Name?.trim());
          }

          if (result.sales_man === '') {
            await AsyncStorage.setItem('sales_man', '----');
          } else {
            await AsyncStorage.setItem('sales_man', result.sales_man?.trim());
          }
          if (result.salesman_name === null) {
            await AsyncStorage.setItem('salesman_name', '----');
          } else {
            await AsyncStorage.setItem(
              'salesman_name',
              result.salesman_name?.trim(),
            );
          }

          if (result.DEPTNO === null) {
            await AsyncStorage.setItem('DEPTNO', '----');
          } else {
            console.log('DEPTNO is issue');
            await AsyncStorage.setItem(
              'DEPTNO',
              result.DEPTNO?.trim() ? result.DEPTNO?.trim() : '',
            );
          }
          if (result.VAN === null) {
            await AsyncStorage.setItem('VAN', '----');
          } else {
            await AsyncStorage.setItem(
              'VAN',
              result.VAN?.trim() ? result.VAN?.trim() : '',
            );
          }
          setLoading(false);

          setUserId('');
          setPassword('');

          navigation.navigate('Home');
        } else {
          setLoginError('Some Error occured, Please try again later---');
          setLoginClick(false);

          showLoginFailedToast();
          setLoading(false);
        }
      } catch (error) {
        console.error('Error Login:--->>', error);
        console.error('Error Request:--->>', error.request);
        console.log('AXIOS ERROR:--->>', error.message);
        console.log('DETAILS:--->>', error.toJSON?.());

        showLoginFailedToast();
        setLoading(false);
      }
    } else {
      showFormEmptyToast();
      setLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={{
          flexGrow: 1,
          backgroundColor: 'white',
        }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            width: '100%',
            // justifyContent: 'center',
            // alignItems: 'center'
          }}
          bounces={false}>
          <ToastManager width={380} height={120} textStyle={{fontSize: 16}} />

          {/* <View style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height / 2,
                    }}>
                    </View> */}
          <ImageBackground
            source={require('../images/cloudsLogin.png')}
            style={{
              height: 350,
              width: Dimensions.get('window').width,
            }}
            imageStyle={{
              resizeMode: 'cover',
              width: Dimensions.get('window').width,
            }}>
            <View style={styles.SalesManImgWrap}>
              <Image
                style={styles.SalesManImg}
                source={require('../images/salesDoodN.png')}></Image>
              {/* <Image style={styles.SalesManImg} source={require('../images/salesmatenew.png')}></Image> */}
            </View>
          </ImageBackground>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'white',
              // position: 'absolute',
              // top: '48%'
              // marginTop: 8,
              // height: '90%'
            }}>
            {/* login form */}
            <View style={styles.Logincontainer}>
              {/* <Text style={styles.label}>Username</Text> */}
              <View style={styles.inputContainer}>
                <Image
                  style={styles.InputImage}
                  source={require('../images/lockN2b.png')}
                />
                <TextInput
                  style={styles.input}
                  onChangeText={text => setUserId(text)}
                  value={userId}
                  placeholder="Username"
                  placeholderTextColor="grey"
                />
              </View>
              {/* <Text style={styles.label}>Password</Text> */}
              <View style={styles.inputContainer}>
                <Image
                  style={styles.InputImage}
                  source={require('../images/lock2b.png')}
                />
                <TextInput
                  style={styles.input}
                  secureTextEntry={true}
                  onChangeText={text => setPassword(text)}
                  value={password}
                  placeholder="Password"
                  placeholderTextColor="grey"
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={login}>
                {loading ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
            {/* login form */}
          </View>
          <View style={styles.CmpSwtchWrap}>
            {showContinue && (
              <View style={styles.ContinueWrap}>
                <Text
                  style={[
                    styles.optionText,
                    {color: 'grey', padding: 0, marginTop: 0},
                  ]}>
                  Continue as user {localUser}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: 'white',
                      marginLeft: 4,
                      marginTop: 0,
                      padding: 0,
                      width: 'auto',
                    },
                  ]}
                  onPress={() => navigation.navigate('Home')}>
                  <Text style={[styles.buttonText, {color: 'grey'}]}>YES</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.cmpcodeText}>{cmpcode}</Text>

            <Text
              style={{
                color: 'grey',
                marginRight: 6,
                fontFamily: 'Lexend-Regular',
              }}>
              version number 6.0.0
            </Text>

            <View style={styles.CBXImgWrap}>
              {/* <Image style={styles.CBXImg} source={require('../images/cubix_logo_new.png')}></Image> */}
              <Image
                style={styles.CBXImg}
                source={require('../images/pwrByBg.png')}></Image>
              {/* <Image style={styles.CBXImgBottomRound} source={require('../images/ic_footer_round.png')}></Image> */}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Loader visible={showLoader} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FD',
  },
  LoginWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: "#F1F1FB",
  },
  Logincontainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '85%',
    // backgroundColor: "#F7F7F7",
    paddingVertical: 12,
    borderRadius: 8,
    // margin: 12
  },
  inputContainer: {
    width: '75%',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderColor: 'white',
    // marginBottom: 12, marginTop: 12,
    borderRadius: 12,
    color: '#2b2b2b',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    width: '95%',
  },

  InputImage: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  // input: {
  //     width: '80%',
  //     height: 40,
  //     border: "none",
  //     borderWidth: 1,
  //     borderRadius: 5,
  //     marginBottom: 20,
  //     paddingLeft: 10,
  // },
  button: {
    width: '40%',
    backgroundColor: '#2DB4A3',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  label: {
    // marginBottom: 5,
    alignSelf: 'flex-start',
    marginLeft: '5%',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerImg: {
    width: 100,
    height: 250,
  },
  cbxLogo: {
    width: 150,
    height: 25,
  },

  topCont: {
    width: '100%',
    height: Dimensions.get('window').height / 4,
  },
  topUserCont: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    position: 'absolute',
    top: '30%',
    left: '2%',
  },
  userAvatar: {
    width: 75,
    height: 75,
    marginBottom: 8,
  },
  userNameText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Lexend-Bold',
  },
  topCirclesCont: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  topCirclesImg: {
    width: 160,
    height: 150,
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
    // justifyContent: 'center'
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
    fontSize: 14,
    color: 'white',
    fontFamily: 'Lexend-Regular',
    marginTop: 8,
  },

  ItemCont: {
    paddingLeft: 16,
    paddingTop: 50,
    paddingRight: 30,
    paddingBottom: 16,
    borderRadius: 4,
    width: '46%',
    marginBottom: 25,
  },

  innerItem: {
    width: '100%',
  },
  innerText: {
    width: 75,
  },

  CmpSwtchWrap: {
    marginTop: 'auto',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cmpcodeText: {
    color: 'grey',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    marginLeft: 6,
  },

  SwtchCmpButtonWrap: {
    padding: 12,
    paddingHorizontal: 18,
    // width: '40%',
    backgroundColor: '#0D6EFD',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
  },
  SwtchIcon: {
    width: 25,
    height: 25,
  },
  SalesManImgWrap: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    height: 'auto',
  },
  SalesManImg: {
    width: 400,
    height: 80,
    resizeMode: 'cover',
  },
  CBXImgWrap: {
    // position: 'absolute',
    // top: '50%',
    // left: '10%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  CBXImg: {
    width: 100,
    height: 45,
    resizeMode: 'contain',
  },
  CBXImgBottomRound: {
    width: 50,
    height: 40,
    resizeMode: 'contain',
  },

  ContinueWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // backgroundColor: '#3B3831',
    // marginTop: 100,
    padding: 12,
    // paddingVertical: 12,
    // borderRadius: 8
  },
});

export default Login;
