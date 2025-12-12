import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, View, TextInput, TouchableOpacity, Text, Image, KeyboardAvoidingView, ActivityIndicator, ImageBackground, Dimensions, ScrollView, Alert } from 'react-native'
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ToastManager, { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Loader from '../popups/Loader';
import { base_url } from '../config/baseUrl';
import { company_code } from '../config/companyCode';


const Login = () => {

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const [localUser, setLocalUser] = useState('')

    const [loading, setLoading] = useState(false);

    const navigation = useNavigation()

    const [cmpcode, setCmpCode] = useState(company_code)
    const [publick, setpublick] = useState('')
    const [privatek, setprivatek] = useState('')

    const [loginError, setLoginError] = useState(null)
    const [loginClick, setLoginClick] = useState(false)

    const [userDataArray, setUserDataArray] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)

    const [portNoData, setPortNoData] = useState('')

    const [showContinue, setShowContinue] = useState(false)

    const [isCallingApi, setIsCallingApi] = useState(false);

    const [userData, setUserData] = useState({
        username: "",
        password: ""
    })

    const [showLoader, setShowLoader] = useState(false)

    const handleGetPortNo = async () => {
        try {
            const response = await axios.get(`https://cubixweberp.com:301/api/clientmanager/${userDataArray[0].cmpcode}`)
            if (response.status === 200) {
                setPortNoData(response.data)
                await AsyncStorage.setItem('WMSportNoData', JSON.stringify(response.data))
            }
        } catch (error) {
            console.log('handleGetPortNo', error)
        }
    }

    useEffect(() => {
        if (userDataArray) {
            handleGetPortNo()
        }
    }, [userDataArray])


    // useFocusEffect(
    //     React.useCallback(() => {
    //         const fetchData = async () => {
    //             setShowLoader(true)
    //             try {
    //                 // Retrieve the selected company details from AsyncStorage
    //                 const selectedCompanyString = await AsyncStorage.getItem("WMSselectedCompany");

    //                 const userLoginStatus = await AsyncStorage.getItem("WMSUserlogin")

    //                 const userLogin = await AsyncStorage.getItem('PhStockcubix_employee_app_arrayOfLoginResult')

    //                 const userName = await AsyncStorage.getItem('PhStockloginUser')
    //                 const userPass = await AsyncStorage.getItem('PhStockloginPassword')

    //                 const userDataArray = await AsyncStorage.getItem('PhStockuserDataArray')

    //                 const parsedValue = JSON.parse(userDataArray)

    //                 if (parsedValue) {
    //                     setCmpCode(parsedValue[0].cmpcode)
    //                 }


    //                 console.log('userLoginStatus', userLogin)
    //                 console.log('userName', userName)
    //                 console.log('userPass', userPass)

    //                 if (userLogin && userName && userPass && userDataArray) {
    //                     reLoginN()

    //                 }

    //                 // if (userLogin) {
    //                 //     // navigation.navigate('Home');
    //                 //     reLoginN()
    //                 // }

    //                 // console.log('selectedCompanyfromLogin', selectedCompanyString);

    //                 // Check if a selected company is stored in AsyncStorage
    //                 if (selectedCompanyString) {
    //                     const selectedCompany = JSON.parse(selectedCompanyString);

    //                     setSelectedCompany(selectedCompany)

    //                     // Access the company details and set them as states
    //                     setCmpCode(selectedCompany.cmpcode);
    //                     setpublick(selectedCompany.publick);
    //                     setprivatek(selectedCompany.privatek);


    //                     if (userLoginStatus === 'Sucess') {
    //                         setShowLoader(false)

    //                         // reLoginN()

    //                         // ReLogin()
    //                         // navigation.navigate('Home');
    //                     }
    //                     else {
    //                         console.log('not Logged in')
    //                         setShowLoader(false)
    //                     }
    //                 } else {
    //                     // Handle the case where no selected company is found
    //                     console.error("No selected company found in local storage");
    //                     setShowLoader(false)

    //                 }
    //             } catch (error) {
    //                 console.error("Error fetching data from AsyncStorage:", error);
    //                 setShowLoader(false)

    //             }
    //         };

    //         fetchData();
    //     }, [])
    // );

    // useEffect(() => {
    //     const fetchData = async () => {
    //         setShowLoader(true)
    //         try {
    //             // Retrieve the selected company details from AsyncStorage
    //             const selectedCompanyString = await AsyncStorage.getItem("WMSselectedCompany");

    //             const userLoginStatus = await AsyncStorage.getItem("WMSUserlogin")

    //             console.log('userLoginStatus', userLoginStatus)

    //             // console.log('selectedCompanyfromLogin', selectedCompanyString);

    //             // Check if a selected company is stored in AsyncStorage
    //             if (selectedCompanyString) {
    //                 const selectedCompany = JSON.parse(selectedCompanyString);

    //                 setSelectedCompany(selectedCompany)

    //                 // Access the company details and set them as states
    //                 setCmpCode(selectedCompany.cmpcode);
    //                 setpublick(selectedCompany.publick);
    //                 setprivatek(selectedCompany.privatek);


    //                 if (userLoginStatus === 'Sucess') {
    //                     setShowLoader(false)

    //                     // ReLogin()
    //                     // navigation.navigate('Home');
    //                 }
    //                 else {
    //                     console.log('not Logged in')
    //                     setShowLoader(false)
    //                 }
    //             } else {
    //                 // Handle the case where no selected company is found
    //                 console.error("No selected company found in local storage");
    //                 setShowLoader(false)

    //             }
    //         } catch (error) {
    //             console.error("Error fetching data from AsyncStorage:", error);
    //             setShowLoader(false)

    //         }
    //     };

    //     if (userDataArray) {
    //         fetchData();
    //     }
    // }, [userDataArray])

    useEffect(() => {
        const checkValidation = async () => {
            const storedUserDataArray = JSON.parse(await AsyncStorage.getItem("WMSuserDataArray")) || [];

            if (storedUserDataArray.length === 0) {
                // setDeviceValidation('INVALID')
                // navigation.navigate('MachineValidation');
                console.log("not validated")
            }
        };

        checkValidation();
    }, []);


    const showLoginSuccessToast = () => {
        Toast.success(`welcome, ${userId}`)
    }

    const showLoginFailedToast = () => {
        Toast.error('Some Error occured, Please try again later')
    }

    const showFormEmptyToast = () => {
        Toast.error('UserId and Password cant be empty')
    }

    const [userDataExists, setUserDataExists] = useState(false);


    storeData = async (item) => {



        try {

            await AsyncStorage.setItem('WMScubix_employee_app_arrayOfLoginResult', JSON.stringify(item));

            await AsyncStorage.setItem('WMSloginUser', userId);
            await AsyncStorage.setItem('WMSloginPassword', password);
            navigation.navigate('SelectLocation')

        } catch (err) {
            // Error saving data
            console.log("err in async ==>", err)
        }
    };

    const callAPI = async () => {
        setIsCallingApi(true);

        if (userId === '') {
            Alert.alert("Please enter username");
            setIsCallingApi(false);
            return;
        }

        if (password === '') {
            Alert.alert("Please enter password");
            setIsCallingApi(false);
            return;
        }

        const username = encodeURIComponent(userId);
        const pass = encodeURIComponent(password);

        const appUrl = await AsyncStorage.getItem('PhStockappUrl');
        // const apiUrl = `${base_url}EmpLogin/EmpLogin?cmpcode=${cmpcode}&guid=AF507117-F151-4FB0-A910-916390457D63&empid=${username}&pass=${pass}`;



        const apiUrl = `${base_url}/LoginUser?user=${username}&pass=${pass}`;

        console.log("Loginapiurl", apiUrl);

        try {
            const response = await axios.get(apiUrl);
            console.log("res ", response.data);

            setIsCallingApi(false);

            if (response.data.length === 0) {
                Alert.alert("Please enter correct username and password");
            } else {
                await AsyncStorage.setItem('WMSLoginUserNAME', response.data[0].Name)
                storeData(response.data);
            }
        } catch (err) {
            setIsCallingApi(false);
            console.log("err ", err);

            if (cmpcode === 'CUBIX') {
                Alert.alert("Something went wrong, please try later", err.message);
            } else {
                Alert.alert("Something went wrong, please try later");
            }

        }
    };

    const handleLogin = async (e) => {
        setIsCallingApi(true);

        if (userId === '') {
            Alert.alert("Please enter username");
            setIsCallingApi(false);
            return;
        }

        if (password === '') {
            Alert.alert("Please enter password");
            setIsCallingApi(false);
            return;
        }


        const username = encodeURIComponent(userId);
        const pass = encodeURIComponent(password);

        const url = `${base_url}/api/Login/UserLogin?cmpcode=${company_code}&guid=48dd6156-0c6c-4065-bb8c-00260e82ce1e&user=${username}&pass=${pass}`;

        console.log('handleLoginApi', url);

        try {
            const response = await axios.get(url);

            if (response.data[0].UserInfo === null) {
                setLoginError("Invalid Username or Password");
                setLoginClick(false);
                setIsCallingApi(false);
            } else {
                const newdata = response.data;

                const startPattern = '[{"UserInfo":"';
                const endPattern = '"}]';

                // Ensure `newdata` exists
                if (newdata) {
                    // Find the start and end indices
                    const startIndex = newdata.indexOf(startPattern);
                    const endIndex = newdata.lastIndexOf(endPattern);

                    if (startIndex !== -1 && endIndex !== -1) {
                        const extractedData = newdata.substring(
                            startIndex + startPattern.length,
                            endIndex
                        );

                        const parseData = JSON.parse(extractedData);
                        // setExData(parseData);

                        // Retrieve existing array from AsyncStorage
                        const userDataArrayJSON = await AsyncStorage.getItem("WMSUserDataArray");

                        // Parse the existing data, but this is not necessary for overwriting
                        let userDataArray = JSON.parse(userDataArrayJSON) || [];

                        // Create a new company object to add to the array
                        const newCompanyData = {
                            Roles: parseData.UserList[0].Roles,
                            User: parseData.UserList[0].User,
                            Image: parseData.UserList[0].Image,
                            CmpName: parseData.UserList[0].CmpName,
                            AllowDept: parseData.UserList[0].AllowDept,
                            CmpCode: parseData.UserList[0].CmpCode,
                        };

                        console.log('newCompanyData', newCompanyData);

                        // Overwrite the array with the new company data
                        userDataArray = [newCompanyData];

                        // Save the updated array back to AsyncStorage
                        await AsyncStorage.setItem("WMSUserDataArray", JSON.stringify(userDataArray));



                        // Toast.success(`Welcome ${parseData.UserList[0].User}`)

                        navigation.navigate("SelectLocation");

                        setIsCallingApi(false);

                        setUserId('')
                        setPassword('')

                        setShowContinue(false)
                    } else {
                        console.log(
                            `Start or end pattern not found. startPattern: ${startPattern}, endPattern: ${endPattern}`
                        );

                        setIsCallingApi(false);
                        Toast.error('Some Error Occured')
                    }
                } else {
                    console.log("newdata is undefined");

                    setIsCallingApi(false);
                    Toast.error('Some Error Occured')
                }
            }
        } catch (error) {
            console.log("Error fetching data:", error);
            Toast.error('Some Error Occured')

            setIsCallingApi(false);
        }
    };

    // Function to load data from AsyncStorage
    const loadUserDataArray = async () => {
        console.log('runningloadUserDataArray')
        try {
            const userDataArrayJSON = await AsyncStorage.getItem("WMSUserDataArray");
            if (userDataArrayJSON) {
                const parsedArray = JSON.parse(userDataArrayJSON);
                setUserDataArray(parsedArray); // Update state with parsed array
                setLocalUser(parsedArray && parsedArray[0]?.User.trim())
                navigation.navigate("SelectLocation");
                setShowContinue(true)
            } else {
                console.log("No data found in AsyncStorage.");
                setShowContinue(false)
            }
        } catch (error) {
            console.error("Error loading userDataArray:", error);
            setShowContinue(false)
        }
    };

    // Use effect to fetch data on component mount
    // useEffect(() => {
    //     loadUserDataArray();
    // }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadUserDataArray();
        }, [])
    )

    // console.log('userDataArray', userDataArray)

    // console.log('portNoData', portNoData)

    // #E9EBE6

    return (
        <>

            {/* <ToastManager /> */}

            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={{
                    flexGrow: 1,
                    backgroundColor: 'white'
                }}>
                <ScrollView contentContainerStyle={{
                    flexGrow: 1,
                    width: '100%'
                    // justifyContent: 'center',
                    // alignItems: 'center'
                }}
                    bounces={false}
                >

                    <ToastManager width={380} height={120} textStyle={{ fontSize: 16 }} />

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
                            width: Dimensions.get('window').width
                        }}
                    >

                        {/* <View style={styles.SalesManImgWrap}>
                            <Image source={require('../images/appLogoN.png')} style={[{ width: 400, height: 95 }]} />
                        </View> */}
                    </ImageBackground>

                    <View style={{
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
                            <Text style={{fontSize:25, fontWeight:"600",marginBottom:10}}>WMS</Text>
                            <View style={styles.inputContainer}>
                                <Image style={styles.InputImage} source={require('../images/lockN2b.png')} />
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
                                <Image style={styles.InputImage} source={require('../images/lock2b.png')} />
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={true}
                                    onChangeText={text => setPassword(text)}
                                    value={password}
                                    placeholder="Password"
                                    placeholderTextColor="grey"
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.button}
                                // onPress={() => callAPI()}
                                onPress={() => handleLogin()}
                            >
                                {
                                    isCallingApi ? <ActivityIndicator size="large" color="white" animating={true} /> :
                                        <Text style={styles.buttonText}>Login</Text>
                                }
                            </TouchableOpacity>


                        </View>
                        {/* login form */}


                    </View>
                    <View style={styles.CmpSwtchWrap}>
                        {
                            showContinue &&
                            <View style={styles.ContinueWrap}>
                                <Text style={[styles.optionText, { color: 'grey', padding: 0, marginTop: 0 }]}>Continue as user {localUser}</Text>
                                <TouchableOpacity style={[styles.button, { backgroundColor: 'white', marginLeft: 4, marginTop: 0, padding: 0, width: 'auto' }]} onPress={() => navigation.navigate('SelectLocation')}>
                                    <Text style={[styles.buttonText, { color: 'grey' }]}>YES</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        <Text style={styles.cmpcodeText}>{cmpcode}</Text>

                        <View style={styles.CBXImgWrap}>
                            {/* <Image style={styles.CBXImg} source={require('../images/cubix_logo_new.png')}></Image> */}
                            {/* <Image source={require('../images/appLogoN.png')} style={[{ width: 250, height: 55 }]} /> */}
                            <Image style={styles.CBXImg} source={require('../images/pwrByBg.png')}></Image>
                        </View>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>

            <Loader visible={showLoader} />

        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4FD'
    },
    LoginWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        alignItems: 'center'
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
        width: '95%'
    },

    InputImage: {
        width: 20,
        height: 20,
        marginLeft: 8
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
        marginTop: 12
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular'
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
        height: 250
    },
    cbxLogo: {
        width: 150,
        height: 25
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
        left: '2%'
    },
    userAvatar: {
        width: 75,
        height: 75,
        marginBottom: 8
    },
    userNameText: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'Lexend-Bold',
    },
    topCirclesCont: {
        position: 'absolute',
        top: 0,
        right: 0
    },
    topCirclesImg: {
        width: 160,
        height: 150
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
        // justifyContent: 'center'
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

    optionsCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        // backgroundColor: 'white',
        marginTop: 55,
        width: '75%',
        paddingTop: 25
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
        marginTop: 8
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
        width: 75
    },

    CmpSwtchWrap: {
        marginTop: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 12
    },
    cmpcodeText: {
        color: 'grey',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginLeft: 6
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
        flexDirection: 'row'
    },
    SwtchIcon: {
        width: 25,
        height: 25
    },
    SalesManImgWrap: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        height: 'auto'
    },
    SalesManImg: {
        width: '50%',
        height: 60,
        resizeMode: 'cover'
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
        resizeMode: 'contain'
    },
    CBXImgBottomRound: {
        width: 50,
        height: 40,
        resizeMode: 'contain'
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
    }


})

export default Login