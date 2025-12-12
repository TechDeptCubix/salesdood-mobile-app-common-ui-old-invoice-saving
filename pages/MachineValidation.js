import { View, Text, ScrollView, TextInput, Button, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Dimensions, ImageBackground, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import cbxLogo from '../images/cbxLogo.png'
import axios from 'axios';
import Loader from '../popups/Loader';



const MachineValidation = () => {

    const navigation = useNavigation()

    const [loginError, setLoginError] = useState('')

    const [cmpCode, setCmpCode] = useState('')

    const [cmpCodeView, setCmpCodeView] = useState(true)

    const [pubKey, setPubKey] = useState('')

    const [regView, setRegView] = useState(false)

    const [privateKey, setPrivateKey] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companyList, setCompanyList] = useState([]);
    const [isCompanySelectionModalOpen, setIsCompanySelectionModalOpen] = useState(false);
    const [companyStatus, setCompanyStatus] = useState([])

    const [loginClick, setLoginClick] = useState(false)

    const [portNoData, setPortNoData] = useState(null)

    const [cmnyDataForUseFocus, setCmpnyDataForUseFocus] = useState(null)



    const handleGetPortNo = async () => {

        console.log("calling port no ",`https://cubixweberp.com:301/api/clientmanager/${cmpCode?.trim()}`)
        try {
            const response = await axios.get(`https://cubixweberp.com:301/api/clientmanager/${cmpCode?.trim()}`)
            if (response.status === 200) {
                setPortNoData(response.data)
            }
        } catch (error) {
            console.log('handleGetPortNo', error)
        }
    }

    const handleGetPortNoWithCmpcode = async (cmpCode) => {
        try {

            console.log("handleGetPortNoWithCmpcode url", `https://cubixweberp.com:301/api/clientmanager/${cmpCode?.trim()}`)
            const response = await axios.get(`https://cubixweberp.com:301/api/clientmanager/${cmpCode?.trim()}`)
            if (response.status === 200) {
                setPortNoData(response.data)

            }
        } catch (error) {
            console.log('handleGetPortNo', error)
        }
    }

    const handleGetPubKey = () => {
        // e.preventDefault();
        // setDisplayDeviceValid(false)
        setLoginError('');

        if (cmpCode) {
            setLoginClick(true);

            handleGetPortNo()
            // setUserData({
            //     username: "",
            // });

            const url = `https://cubixweberp.com:199/GetPublicKey?cmpcode=${cmpCode?.trim()}`;

            console.log(url);
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log('Raw Response:', data);
                    if (data.length > 0) {
                        setPubKey(data[0].systemkey)
                        setCmpCodeView(false)
                        setRegView(true)
                        setLoginClick(false);
                    } else {
                        setPubKey('invalid company code')
                        setLoginError('Invalid Company Code. Please try again.');
                        setCmpCode('')
                        setLoginClick(false);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    setLoginError('Some error in the Backend');
                    setCmpCode('')
                    setLoginClick(false);
                });
        }
    };

    const handleRegistration = async () => {
        // e.preventDefault();
        // setDisplayDeviceValid(false);

        if (cmpCode && privateKey && pubKey) {
            setLoginClick(true);

            try {
                const storedUserDataArrayJson = await AsyncStorage.getItem("userDataArray");
                const storedUserDataArray = storedUserDataArrayJson ? JSON.parse(storedUserDataArrayJson) : [];

                const url = `https://cubixweberp.com:199/CheckStatus?cmpcode=${cmpCode?.trim()}&publick=${pubKey}&privatek=${privateKey}`;

                console.log(url);
                const response = await fetch(url);
                const data = await response.json();
                console.log('Raw Response:', data);

                if (data[0].Column1 === 'REGISTERED') {
                    const newCompanyData = {
                        cmpcode: cmpCode?.trim(),
                        publick: pubKey,
                        privatek: privateKey,
                        portNo: portNoData[0].PORTNO,
                        api_config: portNoData[0].API_CONFIG
                    };
                    storedUserDataArray.push(newCompanyData);

                    await AsyncStorage.setItem("userDataArray", JSON.stringify(storedUserDataArray));

                    // setPrivateKey('')
                    // setRegView(false)
                    // setCmpCodeView(true)
                    await AsyncStorage.setItem("selectedCompany", JSON.stringify(newCompanyData));

                    navigation.navigate('LoginPage');
                } else {
                    setLoginError("Invalid Private Key");
                    setPrivateKey('')
                    // navigation.navigate('LoginPage');

                    setLoginClick(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setLoginError('Error during login. Please try again.');
                setLoginClick(false);
            }
        }
    }

    const validateCompany = async (company) => {
        console.log('validateCmp')
        if (company.cmpcode && company.publick && company.privatek) {

            console.log("machine validation url", `https://cubixweberp.com:199/CheckStatus?cmpcode=${company.cmpcode?.trim()}&publick=${company.publick}&privatek=${company.privatek}`)
            const result = await fetch(`https://cubixweberp.com:199/CheckStatus?cmpcode=${company.cmpcode?.trim()}&publick=${company.publick}&privatek=${company.privatek}`)
            const data = await result.json()

            // handleGetPortNoWithCmpcode(company.cmpcode)

            // const storedUserDataArrayJson = await AsyncStorage.getItem("userDataArray");
            const storedUserDataArray = [];
            // console.log(data)
            // setDeviceValidation(data[0].Column1)
            if (data[0].Column1 === 'VALIDATED') {

                const newCompanyData = {
                    cmpcode: company.cmpcode?.trim(),
                    publick: company.publick,
                    privatek: company.privatek,
                    portNo: portNoData[0].PORTNO,
                    api_config: portNoData[0].API_CONFIG

                };

                console.log('newCompanyData', newCompanyData)
                storedUserDataArray.push(newCompanyData);

                await AsyncStorage.setItem("userDataArray", JSON.stringify(storedUserDataArray));
                await AsyncStorage.setItem("selectedCompany", JSON.stringify(newCompanyData));

                await AsyncStorage.setItem("selectedCompany", JSON.stringify(company));
                setSelectedCompany(company);

                setShowLoader(false)
                // localStorage.setItem("selectedCompany", JSON.stringify(company));
                navigation.navigate('LoginPage');
            }
        } else {
            setLoginError('not validated')
            setShowLoader(false)
            // navigate('/');
            console.log("not validated")
        }
    };

    const validateCompanyList = async (company) => {
        console.log('validateCmp');
        if (company.cmpcode && company.publick && company.privatek) {
            const result = await fetch(`https://cubixweberp.com:199/CheckStatus?cmpcode=${company.cmpcode?.trim()}&publick=${company.publick}&privatek=${company.privatek}`);
            const data = await result.json();
            // console.log(data)
            const status = data[0].Column1;
            // Set the status for the company
            const companyData = { cmpcode: company.cmpcode?.trim(), status };
            // Push the company's data object into the array
            setCompanyStatus(prevArray => [...prevArray, companyData]);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            setShowLoader(true)
            const checkUserData = async () => {
                try {
                    const storedUserDataArrayJson = await AsyncStorage.getItem("userDataArray");

                    console.log('storedUserDataArrayJson', storedUserDataArrayJson)
                    if (storedUserDataArrayJson) {

                        const storedUserDataArray = JSON.parse(storedUserDataArrayJson);
                        if (storedUserDataArray.length > 0) {

                            // if (storedUserDataArray.length === 0) {
                            //     setDeviceValidation('INVALID')
                            //     navigate('/');
                            //     console.log("not validated")
                            // }

                            // Check if there are multiple companies
                            if (storedUserDataArray.length > 1) {
                                console.log('grtLenght')
                                setCompanyList(storedUserDataArray)
                                // You can implement your UI logic to prompt the user to select a company
                                // For simplicity, let's assume you have a function openCompanySelectionPopup
                                // openCompanySelectionPopup(storedUserDataArray);
                                // openBootstrapModal()
                            } else if (storedUserDataArray.length === 1) {
                                // If there's only one company, automatically select it
                                const company = storedUserDataArray[0];
                                setSelectedCompany(company);
                                setCmpnyDataForUseFocus(company)
                                handleGetPortNoWithCmpcode(company.cmpcode?.trim())
                                // Save the selected company in local storage
                                // localStorage.setItem("selectedCompany", JSON.stringify(company));
                                // Validate the selected company

                                // if (portNoData) {

                                //     validateCompany(company);
                                // }

                                // navigation.navigate('LoginPage');
                                // navigation.navigate('Home');

                            }


                            const company = storedUserDataArray[0]
                            // validateCompany(company)
                            // Redirect to LoginPage if userDataArray exists and has values
                            // navigation.navigate('LoginPage');
                            // setShowLoader(false)

                            // Loop through all companies in the stored array and validate them
                            storedUserDataArray.forEach(validateCompanyList);
                        }
                    } else {
                        setShowLoader(false)

                        // navigation.navigate('LoginPage');

                        setLoginError('Device not Registered')
                        // navigate('/');
                        console.log("Machine not Validated")
                    }
                } catch (error) {
                    console.error('Error checking user data:', error);
                    setShowLoader(false)
                }
            };

            checkUserData(); // Call the function when the screen comes into focus
            return () => {
                // Clean-up function (optional)
            };
        }, [])
    );

    useEffect(() => {
        if (portNoData && cmnyDataForUseFocus) {
            validateCompany(cmnyDataForUseFocus)
        }
    }, [portNoData, cmnyDataForUseFocus])

    const handleCmpnyListClick = (cmp) => {
        validateCompany(cmp);
    }

    console.log('portNoData>', portNoData)
    // console.log('r', showLoader)

    return (
        <>


            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={{
                    flexGrow: 1,
                    backgroundColor: 'white',
                }}>

                {/* <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} /> */}

                <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} keyboardShouldPersistTaps="handled">
                    <View>
                        <ImageBackground
                            source={require('../images/cloudsLogin.png')}
                            // source={require('../images/top_slant.png')}
                            style={[styles.topCont, {
                                flexDirection: 'row', justifyContent: 'center', height: 400,
                                width: '100%',
                            }]}
                        // imageStyle={{ backgroundColor: 'transparent' }}
                        >

                            <View style={styles.SalesManImgWrap}>
                                <Image style={styles.SalesManImg} source={require('../images/salesDoodS.png')}></Image>
                            </View>
                            {/* <View style={styles.topCirclesCont}>
                                <Image source={require('../images/top_right_circles.png')} style={styles.topCirclesImg}></Image>
                            </View> */}
                        </ImageBackground>
                    </View>

                    <View style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        marginTop: 8,
                        // height: '90%'
                    }}>
                        <View style={styles.LoginWrapper}>

                            <View style={{
                                // backgroundColor: '#F0F8FF',
                                // backgroundColor: 'white',
                                padding: 28,
                                width: '100%',
                                // marginTop: 18,
                                borderRadius: 4
                            }}>

                                {
                                    companyList && companyList.length > 0 ?

                                        <View style={styles.cmnyListTableCont}>
                                            <TouchableOpacity style={styles.addNewCmp} onPress={() => navigation.navigate('AddMachine')}>
                                                <Text style={styles.addNewCmpText}>Add New Company</Text>
                                                <View style={styles.addNewCmpIcon}><Text style={{
                                                    color: 'white',
                                                    fontSize: 16
                                                }}>+</Text></View>
                                            </TouchableOpacity>

                                            {companyList && companyList.map((item, index) => {
                                                const companyData = companyStatus.find(data => data.cmpcode?.trim() === item.cmpcode?.trim());
                                                return (
                                                    <TouchableOpacity key={index} style={styles.cmpnyListCard} onPress={() => handleCmpnyListClick(item)}>
                                                        <Text>{item.cmpcode}</Text>
                                                        <Text style={companyData && companyData.status === 'VALIDATED' ? styles.validated : styles.notValidated}>
                                                            {companyData && companyData.status === 'VALIDATED' ? 'Active' : 'Inactive'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}

                                        </View>


                                        :
                                        <>
                                            {
                                                showLoader &&
                                                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: 12 }}>
                                                    <ActivityIndicator size={'large'} />
                                                    <Text style={{ color: '#FF5733', fontSize: 16 }}>Validating Machine, please wait ... ...</Text>
                                                </View>
                                            }

                                            {
                                                loginError !== '' &&
                                                <View style={{ marginTop: 24 }}>
                                                    <Text style={{
                                                        color: '#2b2b2b',
                                                        fontSize: 16,
                                                        fontFamily: 'Lexend-Regular'
                                                    }}>{loginError}</Text>
                                                </View>

                                            }

                                            {
                                                // cmpCodeView &&
                                                <>
                                                    <TextInput style={{
                                                        backgroundColor: 'white',
                                                        marginBottom: 12, marginTop: 12,
                                                        borderRadius: 6,
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 3,
                                                        elevation: 5,

                                                        borderBottomWidth: 1,
                                                        borderColor: 'white',
                                                        color: 'black',
                                                        fontSize: 16,
                                                        fontFamily: 'Lexend-Regular',
                                                        width: 350

                                                    }}
                                                        value={cmpCode}
                                                        onChangeText={(text) => setCmpCode(text)}
                                                        placeholder="Enter Company Code"
                                                        placeholderTextColor="#aaa"
                                                    ></TextInput>

                                                    <View style={{
                                                        width: '100%',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'row'
                                                    }}>
                                                        {
                                                            cmpCode !== '' &&
                                                            <TouchableOpacity style={{
                                                                backgroundColor: '#D9D9D9',
                                                                paddingVertical: 12,
                                                                paddingHorizontal: 20,
                                                                borderRadius: 20,
                                                                marginRight: 6
                                                            }} onPress={handleGetPubKey}>
                                                                {
                                                                    loginClick ? <ActivityIndicator size={'big'} color={'orange'} /> :
                                                                        <Text style={{
                                                                            color: '#6069B8',
                                                                            fontSize: 16,
                                                                            fontFamily: 'Lexend-Regular',
                                                                        }}>Generate Public Key </Text>
                                                                }
                                                            </TouchableOpacity>
                                                        }
                                                    </View>
                                                </>
                                            }

                                            {
                                                regView &&
                                                <>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <View style={{
                                                            width: '100%',
                                                            backgroundColor: '#1A6CF6',
                                                            marginTop: 24,
                                                            padding: 12,
                                                            borderRadius: 8,

                                                        }}>
                                                            <View style={{
                                                                width: '100%',
                                                                flexDirection: 'row',
                                                                justifyContent: 'center',
                                                                alignItems: 'center'
                                                            }}>
                                                                <Text style={{
                                                                    color: 'white',
                                                                    fontSize: 18,
                                                                    fontFamily: 'Lexend-Bold',
                                                                    marginVertical: 8
                                                                }}>{pubKey}</Text>
                                                            </View>

                                                            <Text style={{
                                                                color: '#aaa',
                                                                fontSize: 16,
                                                                fontFamily: 'Lexend-Regular',
                                                            }}>Ask your admin for the private key and save</Text>

                                                            <TextInput style={{
                                                                borderBottomColor: 'white',
                                                                borderBottomWidth: 2,
                                                                // backgroundColor: 'white',
                                                                marginBottom: 12, marginTop: 12,
                                                                borderRadius: 12,

                                                                color: 'white',
                                                                fontSize: 16,
                                                                fontFamily: 'Lexend-Regular'

                                                            }} value={privateKey}
                                                                onChangeText={(text) => setPrivateKey(text)}
                                                                placeholder="Enter Private Key"
                                                                placeholderTextColor="white"
                                                            ></TextInput>

                                                            <View style={{
                                                                width: '100%',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexDirection: 'row'
                                                            }}>
                                                                {
                                                                    cmpCode !== '' &&
                                                                    <TouchableOpacity style={{
                                                                        backgroundColor: 'white',
                                                                        paddingVertical: 12,
                                                                        paddingHorizontal: 20,
                                                                        borderRadius: 20,
                                                                        // marginRight: 6
                                                                        // marginLeft: 35
                                                                    }} onPress={handleRegistration}>

                                                                        {
                                                                            loginClick ? <ActivityIndicator size={'big'} color={'orange'} /> :
                                                                                <Text style={{
                                                                                    color: '#1A6CF6',
                                                                                    fontSize: 16,
                                                                                    fontFamily: 'Lexend-Regular',
                                                                                }}>Save</Text>
                                                                        }

                                                                    </TouchableOpacity>
                                                                }
                                                            </View>
                                                        </View>
                                                    </View>

                                                </>
                                            }
                                        </>

                                }



                            </View>


                        </View>

                        <View style={styles.CBXImgWrap}>
                            {/* <Image style={styles.CBXImg} source={require('../images/cubix_logo_new.png')}></Image> */}
                            <Image style={styles.CBXImg} source={require('../images/pwrByBg.png')}></Image>

                        </View>
                    </View>


                </ScrollView>
            </KeyboardAvoidingView>

            {
                <Loader visible={showLoader} />
            }


            {/* <SafeAreaView style={styles.container}>
                <ScrollView>

                    <View style={styles.LoginWrapper}>


                        <View style={{
                            
                            padding: 28,
                            width: '100%',

                            borderRadius: 4
                        }}>

                            {
                                companyList && companyList.length > 0 ?

                                    <View style={styles.cmnyListTableCont}>
                                        <TouchableOpacity style={styles.addNewCmp} onPress={() => navigation.navigate('AddMachine')}>
                                            <Text style={styles.addNewCmpText}>Add New Company</Text>
                                            <View style={styles.addNewCmpIcon}><Text style={{
                                                color: 'white',
                                                fontSize: 16
                                            }}>+</Text></View>
                                        </TouchableOpacity>

                                        {companyList && companyList.map((item, index) => {
                                            const companyData = companyStatus.find(data => data.cmpcode === item.cmpcode);
                                            return (
                                                <TouchableOpacity key={index} style={styles.cmpnyListCard} onPress={() => handleCmpnyListClick(item)}>
                                                    <Text>{item.cmpcode}</Text>
                                                    <Text style={companyData && companyData.status === 'VALIDATED' ? styles.validated : styles.notValidated}>
                                                        {companyData && companyData.status === 'VALIDATED' ? 'Active' : 'Inactive'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        })}


                                    </View>


                                    :
                                    <>
                                        {
                                            showLoader &&
                                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: 12 }}>
                                                <ActivityIndicator size={'large'} />
                                                <Text style={{ color: '#FF5733', fontSize: 16 }}>Validating Machine, please wait ...</Text>
                                            </View>
                                        }

                                        {
                                            loginError !== '' &&
                                            <View style={{ marginVertical: 12 }}>
                                                <Text style={{ color: 'red', fontWeight: 'bold' }}>{loginError}</Text>
                                            </View>

                                        }

                                        {
                                          
                                            <>
                                              
                                                <TextInput style={{
                                                    
                                                    backgroundColor: 'white',
                                                    marginBottom: 12, marginTop: 80,
                                                    borderRadius: 6,
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.25,
                                                    shadowRadius: 3,
                                                    elevation: 5,

                                                    borderBottomWidth: 1,
                                                    borderColor: 'white',
                                                    color: 'black',
                                                    fontSize: 16,
                                                    fontFamily: 'Lexend-Regular'

                                                }}
                                                    value={cmpCode}
                                                    onChangeText={(text) => setCmpCode(text)}
                                                    placeholder="Enter Company Code"
                                                    placeholderTextColor="#aaa"
                                                ></TextInput>

                                                <View style={{
                                                    width: '100%',
                                                    alignItems: 'center'
                                                }}>
                                                    {
                                                        cmpCode !== '' &&
                                                        <TouchableOpacity style={{
                                                            backgroundColor: '#D9D9D9',
                                                            paddingVertical: 12,
                                                            paddingHorizontal: 20,
                                                            borderRadius: 20,
                                                            marginRight: 6
                                                        }} onPress={handleGetPubKey}>
                                                            {
                                                                loginClick ? <ActivityIndicator size={'big'} color={'orange'} /> :
                                                                    <Text style={{
                                                                        color: '#6069B8',
                                                                        fontSize: 16,
                                                                        fontFamily: 'Lexend-Regular',
                                                                    }}>Generate Public Key</Text>
                                                            }
                                                        </TouchableOpacity>
                                                    }
                                                </View>
                                            </>
                                        }

                                        {
                                            regView &&
                                            <>

                                                <View style={{
                                                    width: '100%',
                                                    backgroundColor: '#1A6CF6',
                                                    marginTop: 42,
                                                    padding: 12,
                                                    borderRadius: 8
                                                }}>
                                                    <View style={{
                                                        width: '100%',
                                                        flexDirection: 'row',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            color: 'white',
                                                            fontSize: 18,
                                                            fontFamily: 'Lexend-Bold',
                                                            marginVertical: 8
                                                        }}>{pubKey}</Text>
                                                    </View>

                                                    <Text style={{
                                                        color: '#aaa',
                                                        fontSize: 16,
                                                        fontFamily: 'Lexend-Regular',
                                                    }}>Ask your admin for the private key and save</Text>

                                                    <TextInput style={{
                                                        borderBottomColor: 'white',
                                                        borderBottomWidth: 2,
                                                        marginBottom: 12, marginTop: 12,
                                                        borderRadius: 12,

                                                        color: 'black',
                                                        fontSize: 16,
                                                        fontFamily: 'Lexend-Regular'

                                                    }} value={privateKey}
                                                        onChangeText={(text) => setPrivateKey(text)}
                                                        placeholder="Enter Private Key"
                                                        placeholderTextColor="white"
                                                    ></TextInput>

                                                    <View style={{
                                                        width: '100%',
                                                        alignItems: 'center'
                                                    }}>
                                                        {
                                                            cmpCode !== '' &&
                                                            <TouchableOpacity style={{
                                                                backgroundColor: 'white',
                                                                paddingVertical: 12,
                                                                paddingHorizontal: 20,
                                                                borderRadius: 20,
                                                             
                                                            }} onPress={handleRegistration}>

                                                                {
                                                                    loginClick ? <ActivityIndicator size={'big'} color={'orange'} /> :
                                                                        <Text style={{
                                                                            color: '#1A6CF6',
                                                                            fontSize: 16,
                                                                            fontFamily: 'Lexend-Regular',
                                                                        }}>Save</Text>
                                                                }

                                                            </TouchableOpacity>
                                                        }
                                                    </View>
                                                </View>

                                            </>
                                        }
                                    </>

                            }



                        </View>

                    </View>

                </ScrollView>

            </SafeAreaView> */}
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
        // height: '100%'
        // backgroundColor: "#F1F1FB",
    },
    Logincontainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '85%',
        backgroundColor: "#F7F7F7",
        paddingVertical: 32,
        borderRadius: 8
    },
    inputContainer: {
        width: '80%',
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        backgroundColor: 'white',
        paddingLeft: 10,
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
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    label: {
        marginBottom: 5,
        alignSelf: 'flex-start',
        marginLeft: '10%',
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


    cmnyListTableCont: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addNewCmp: {
        width: '60%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        margin: 8,
        padding: 4,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    addNewCmpText: {
        color: '#52B788',
        // width: '75%',
        paddingVertical: 4,
    },
    addNewCmpIcon: {
        backgroundColor: '#52B788',
        color: 'white',
        width: '25%',
        paddingVertical: 4,
        textAlign: 'center',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cmpnyListCard: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        color: '#000',
        paddingVertical: 12,
        paddingHorizontal: 16,
        cursor: 'pointer',
        backgroundColor: 'white',
        // shadowColor: '#000',
        // shadowOpacity: 0.2,
        // shadowRadius: 1,
        // elevation: 2,
        marginVertical: 8,
        borderRadius: 5,
        borderColor: 'grey',
        borderWidth: 1
    },
    validated: {
        color: '#26cf61',
    },
    notValidated: {
        color: 'rgb(255, 90, 90)',
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
        borderBottomWidth: 1,
        borderColor: 'white',

        // backgroundColor: 'white',
        marginBottom: 12, marginTop: 12,
        borderRadius: 12,
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Bold'
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3,
        // elevation: 5,
    },


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

        paddingLeft: 10,
        borderBottomWidth: 1,
        borderColor: 'white',
        marginBottom: 12, marginTop: 12,
        borderRadius: 12,
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Bold'
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
        backgroundColor: '#0D6EFD',
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
        // marginTop: '52%',
        flexDirection: 'column',
        alignItems: 'center'
    },
    cmpcodeText: {
        color: 'white',
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
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%'
    },
    SalesManImg: {
        width: '100%',
        height: 50,
        resizeMode: 'contain'
    },
    CBXImgWrap: {
        // position: 'absolute',
        // bottom: '30%',
        // left: '30%',
    },
    CBXImg: {
        width: 150,
        height: 45,
        resizeMode: 'contain'
    }

})

export default MachineValidation