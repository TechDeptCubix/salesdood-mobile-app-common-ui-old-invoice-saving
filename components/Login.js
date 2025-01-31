import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, View, TextInput, TouchableOpacity, Text, Image, KeyboardAvoidingView, ActivityIndicator } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import footerBg from '../images/footer_bg.png'
import cloud from '../images/cloud_svg.png'
import cbxLogo from '../images/cbxLogo.png'
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ToastManager, { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const Login = () => {

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);

    const navigation = useNavigation()

    const [cmpcode, setCmpCode] = useState('')
    const [publick, setpublick] = useState('')
    const [privatek, setprivatek] = useState('')

    const [loginError, setLoginError] = useState(null)
    const [loginClick, setLoginClick] = useState(false)

    const [userDataArray, setUserDataArray] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)

    const [userData, setUserData] = useState({
        username: "",
        password: ""
    })


    // useEffect(() => {
    //     const fetchData = async () => {
    //         // Retrieve the selected company details from local storage
    //         const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

    //         console.log('selectedCompanyfromLogin', selectedCompanyString)

    //         // Check if a selected company is stored in local storage
    //         if (selectedCompanyString) {
    //             const selectedCompany = JSON.parse(selectedCompanyString);

    //             // Access the company details and set them as states
    //             setCmpCode(selectedCompany.cmpcode);
    //             setpublick(selectedCompany.publick);
    //             setprivatek(selectedCompany.privatek);
    //         } else {
    //             // Handle the case where no selected company is found
    //             console.error("No selected company found in local storage");
    //         }
    //     };

    //     fetchData();
    // }, []);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    // Retrieve the selected company details from AsyncStorage
                    const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

                    console.log('selectedCompanyfromLogin', selectedCompanyString);

                    // Check if a selected company is stored in AsyncStorage
                    if (selectedCompanyString) {
                        const selectedCompany = JSON.parse(selectedCompanyString);

                        setSelectedCompany(selectedCompany)

                        // Access the company details and set them as states
                        setCmpCode(selectedCompany.cmpcode);
                        setpublick(selectedCompany.publick);
                        setprivatek(selectedCompany.privatek);

                        if (selectedCompany && selectedCompany.User) {
                            console.log(selectedCompany, selectedCompany.User);

                            // ToastAndroid.show(`Welcome ${selectedCompany.User}`, ToastAndroid.SHORT);
                            navigation.navigate('Home');
                        } else {
                            console.log('not Logged in')
                        }
                    } else {
                        // Handle the case where no selected company is found
                        console.error("No selected company found in local storage");
                    }
                } catch (error) {
                    console.error("Error fetching data from AsyncStorage:", error);
                }
            };

            fetchData();
        }, [navigation])
    );

    useEffect(() => {
        const checkValidation = async () => {
            const storedUserDataArray = JSON.parse(await AsyncStorage.getItem("userDataArray")) || [];

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
        Toast.error('Incorrect userId or passowrd')
    }

    const showFormEmptyToast = () => {
        Toast.error('UserId and Password cant be empty')
    }

    const [userDataExists, setUserDataExists] = useState(false);

    // useFocusEffect(
    //     React.useCallback(() => {
    //         const checkUserData = async () => {
    //             try {
    //                 const userDataJson = await AsyncStorage.getItem('userData');
    //                 if (userDataJson) {
    //                     const userData = JSON.parse(userDataJson);
    //                     // If userData exists, navigate to Home screen
    //                     navigation.navigate('Home');
    //                 }
    //             } catch (error) {
    //                 console.error('Error checking user data:', error);
    //             }
    //         };

    //         checkUserData();
    //     }, [navigation])
    // );

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
                    const parsedUserDataArray = JSON.parse(storedUserDataArray) || [];

                    setUserDataArray(parsedUserDataArray)

                    if (parsedUserDataArray.length === 0) {
                        // setDeviceValidation('INVALID')
                        navigation.navigate('MachineValidation');
                        console.log("not validated");
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };

            fetchData();
        }, [navigation])
    );

    // useFocusEffect(
    //     React.useCallback(() => {
    //         const fetchData = async () => {
    //             try {
    //                 // const userDataArrayString = await AsyncStorage.getItem("userDataArray");
    //                 // const userDataArray = JSON.parse(userDataArrayString) || [];
    //                 // const selectedCompany = userDataArray.find(company => company.cmpcode === cmpcode);

    //                 if (selectedCompany && selectedCompany.User) {
    //                     console.log(selectedCompany, selectedCompany.User);

    //                     // ToastAndroid.show(`Welcome ${selectedCompany.User}`, ToastAndroid.SHORT);
    //                     navigation.navigate('Home');
    //                 }

    //                 // bypass
    //                 // navigation.navigate('Home');
    //             } catch (error) {
    //                 console.error("Error fetching data:", error);


    //             }
    //         };

    //         if (selectedCompany) {
    //             fetchData();
    //         }

    //     }, [selectedCompany, navigation])
    // );


    const handleLogin = async () => {
        // Here you can implement your login logic
        console.log('UserId:', userId);
        console.log('Password:', password);
        setLoading(true)

        setUserId('')
        setPassword('')

        if (userId !== '' && password !== '') {
            try {

                // const url = `https://cubixweberp.com:164/api/Login/UserLogin?cmpcode=PENDULUM&guid=E42B163B-C03A-43D6-AFE1-31FBCEEAEB81&user=${userData.username}&pass=${userData.password}`;
                const response = await axios.get(`https://cubixweberp.com:199/api/EmpLogin/EmpLogin`, {
                    params: {
                        cmpcode: 'CPAYS',
                        guid: '425cc3d5-8e70-4502-a3a2-dc85e4bfbd83',
                        empid: userId,
                        pass: password
                    }
                });
                console.log('API response:', response.data);
                if (response.data.length > 0 && userId.toLowerCase() == response.data[0].empid.toLowerCase()) {

                    const userData = {
                        Division: response.data[0].Division,
                        Name: response.data[0].Name,
                        empid: response.data[0].empid,
                        jobtitle: response.data[0].jobtitle,
                        onlineallow: response.data[0].onlineallow,
                        photo: response.data[0].photo
                    };

                    await AsyncStorage.setItem('userData', JSON.stringify(userData));

                    setLoading(false);
                    console.log('inside success route')
                    showLoginSuccessToast()
                    navigation.navigate('Home')

                } else if (response.data.length == 0) {
                    showLoginFailedToast()
                    setLoading(false);
                }
                // Handle API response here (e.g., redirect to dashboard on successful login)
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
                // Handle error (e.g., display error message to the user)
            }
        } else {
            showFormEmptyToast()
            setLoading(false);
        }

    };

    const handleLogin2 = async (e) => {
        e.preventDefault();

        setLoading(true)

        setUserId('')
        setPassword('')

        if (userId !== '' && password !== '') {
            setLoginClick(true);
            setUserData({
                username: "",
                password: ""
            });

            const url = `https://cubixweberp.com:199/api/Login/UserLogin?cmpcode=${cmpcode}&guid=${privatek}&user=${userId}&pass=${password}`;

            console.log(url);
            axios.get(url)
                .then(async response => {
                    // Handle the response data here
                    console.log(response.data);
                    if (response.data[0].UserInfo === null) {
                        setLoginError("Invalid Username or Password")
                        setLoginClick(false)

                        showLoginFailedToast()
                        setLoading(false);

                        // navigation.navigate('Home')

                    } else {
                        const newdata = response.data;
                        // setData(response.data)
                        const startPattern = '[{"UserInfo":"';
                        const endPattern = '"}]';

                        // Check if data is defined
                        if (newdata) {
                            // Find the start position
                            const startIndex = newdata.indexOf(startPattern);

                            if (startIndex !== -1) {
                                // Find the end position
                                const endIndex = newdata.lastIndexOf(endPattern);

                                if (endIndex !== -1) {
                                    // Extract the desired substring
                                    const extractedData = newdata.substring(startIndex + startPattern.length, endIndex);

                                    // Now, extractedData contains the cleaned JSON string
                                    // console.log(extractedData);
                                    const parseData = JSON.parse(extractedData)
                                    // setExData(parseData)

                                    // Retrieve the existing array from local storage
                                    // let userDataArray = JSON.parse(localStorage.getItem("userDataArray")) || [];

                                    // let storedUserDataArrayJson = await AsyncStorage.getItem("userDataArray") || [];

                                    let storedUserDataArray = userDataArray

                                    // Find the index of the selected company in userDataArray (assuming cmpcode is unique)
                                    const selectedCompanyIndex = storedUserDataArray && storedUserDataArray.findIndex(company => company.cmpcode === cmpcode);

                                    // Check if the selected company is found in the array
                                    if (selectedCompanyIndex !== -1) {
                                        // Update the properties of the selected company with new values
                                        storedUserDataArray[selectedCompanyIndex].Roles = parseData.UserList[0].Roles;
                                        storedUserDataArray[selectedCompanyIndex].User = parseData.UserList[0].User;
                                        storedUserDataArray[selectedCompanyIndex].Image = parseData.UserList[0].Image;
                                        storedUserDataArray[selectedCompanyIndex].CmpName = parseData.UserList[0].CmpName;
                                        storedUserDataArray[selectedCompanyIndex].AllowDept = parseData.UserList[0].AllowDept;

                                        // Update the properties of the selected company with new values
                                        selectedCompany.Roles = parseData.UserList[0].Roles;
                                        selectedCompany.User = parseData.UserList[0].User;
                                        selectedCompany.Image = parseData.UserList[0].Image;
                                        selectedCompany.CmpName = parseData.UserList[0].CmpName;
                                        selectedCompany.AllowDept = parseData.UserList[0].AllowDept;

                                        // Save the updated array back to local storage
                                        await AsyncStorage.setItem("userDataArray", JSON.stringify(storedUserDataArray));

                                        await AsyncStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));

                                        // toast.success(`Welcome ${exData.UserList[0].User}`, {
                                        //     autoClose: 1500
                                        // })
                                        navigation.navigate('Home')

                                        setLoading(false);

                                        // // Update the component states with the modified company details
                                        // setCmpCode(userDataArray[selectedCompanyIndex].cmpcode);
                                        // setpublick(userDataArray[selectedCompanyIndex].publick);
                                        // setprivatek(userDataArray[selectedCompanyIndex].privatek);
                                    } else {
                                        console.error("Selected company not found in userDataArray");
                                        setLoading(false);
                                    }

                                    // // console.log(parseData.UserList[0].User)
                                    // localStorage.setItem('Roles', parseData.UserList[0].Roles)
                                    // localStorage.setItem('User', parseData.UserList[0].User)
                                    // localStorage.setItem('Image', parseData.UserList[0].Image)
                                } else {
                                    console.error(`End pattern "${endPattern}" not found`);
                                    setLoading(false);
                                }
                            } else {
                                console.error(`Start pattern "${startPattern}" not found`);
                                setLoading(false);
                            }
                        } else {
                            console.error('newdata is undefined');
                            setLoading(false);
                        }

                    }


                    // If you want to convert it to a JavaScript object
                    // const parsedData = JSON.parse(extractedData);
                    // console.log(parsedData);
                })
                .catch(error => {
                    // Handle errors
                    console.error('Error fetching data:', error);
                    showLoginFailedToast()
                    setLoading(false);


                });
        } else {
            showFormEmptyToast()
            setLoading(false);
        }
    };

    console.log('userDataArray', userDataArray)
    console.log('selectedCompany', selectedCompany)


    // #E9EBE6

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.LoginWrapper}>

                <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />

                {/* cloudImg */}
                {/* <View>
                        <Image source={cloud}></Image>
                    </View> */}

                <View style={{
                    justifyContent: 'center',
                    width: "100%",
                    margin: 12,
                    alignItems: 'center'
                }}>
                    {/* <View
                        style={{
                            width: "44%",
                            // backgroundColor: "white",
                            marginLeft: 28,
                            padding: 8,
                            borderRadius: 4,
                        }}
                    >
                    </View> */}
                    <Image source={cbxLogo} style={styles.cbxLogo}></Image>
                </View>

                {/* <View style={{
                    margin: 12, justifyContent: 'center',
                    width: "100%",
                    alignItems: 'center'
                }}>
                    {
                        cmpcode && publick && privatek ? <Text style={{
                            color: 'green',
                            fontSize: 18,
                            fontWeight: 'bold'
                        }}>Machine Validated</Text> : ""
                    }
                </View> */}

                <View style={{
                    marginTop: 12
                }}>
                    <Text style={{
                        fontSize: 15
                    }}>Sign in with your username and password</Text>
                </View>

                {/* <View style={{
                    // backgroundColor: 'white',
                    padding: 12,
                    borderRadius: 4,
                    // margin: 12
                }}>
                    {
                        cmpcode ? <Text style={{
                            color: 'orange',
                            fontSize: 18,
                            fontWeight: 'bold'
                        }}>Company Code: {cmpcode}</Text> : ""
                    }

                </View> */}

                {/* login form */}
                <View style={styles.Logincontainer}>
                    <Text style={styles.label}>Username</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => setUserId(text)}
                            value={userId}
                            placeholder="username"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={true}
                            onChangeText={text => setPassword(text)}
                            value={password}
                            placeholder="password"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleLogin2}>
                        {
                            loading ? <ActivityIndicator size="large" color="white" /> :
                                <Text style={styles.buttonText}>Login</Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* bottomImg */}
                {/* <View>
                        <Image source={footerBg}></Image>
                    </View> */}

                <View style={{
                    width: '100%',
                    marginTop: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        width: '80%',
                        marginLeft: 16
                    }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Admin Dashboard, Developed by Cubix IT Solutions LLC</Text>

                    </View>
                </View>


                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 15
                }}>
                    {
                        cmpcode ? <Text style={{
                            color: 'grey',
                            fontSize: 15,
                        }}>{cmpcode}</Text> : ""
                    }
                </View>
            </View>
            {/* <LinearGradient
                // colors={['#98b2e5', 'rgba(10, 184, 149, 0.057)']}
                colors={['#E9EBE6', 'rgba(10, 184, 149, 0.057)']}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={styles.container}
            >
            </LinearGradient> */}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFBF5'
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
        paddingVertical: 32,
        borderRadius: 8,
        // margin: 12
    },
    inputContainer: {
        width: '90%',
        // borderBottomWidth: 1,
        // borderBottomColor: 'grey',
        // marginBottom: 20,
    },
    input: {
        // width: '100%',
        // height: 40,
        // backgroundColor: 'white',
        paddingLeft: 10,

        // width: '100%',
        // height: 50,
        // backgroundColor: 'white',
        // borderRadius: 12,
        // paddingHorizontal: 20,
        // marginBottom: 20,
        // borderWidth: 1,
        // borderColor: '#ccc',

        backgroundColor: 'white',
        marginBottom: 12, marginTop: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
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
        width: '80%',
        backgroundColor: '#0D6EFD',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 12
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
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
    }
})

export default Login