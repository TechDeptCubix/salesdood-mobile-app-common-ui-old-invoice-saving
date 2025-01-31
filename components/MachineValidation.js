import { View, Text, ScrollView, TextInput, Button, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import footerBg from '../images/footer_bg.png'
import cloud from '../images/cloud_svg.png'
import cbxLogo from '../images/cbxLogo.png'


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

    const handleGetPubKey = () => {
        // e.preventDefault();
        // setDisplayDeviceValid(false)
        setLoginError('');

        if (cmpCode) {
            setLoginClick(true);
            // setUserData({
            //     username: "",
            // });

            const url = `https://cubixweberp.com:199/GetPublicKey?cmpcode=${cmpCode}`;

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
                    setLoginError('Some error in the Backend.');
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

                const url = `https://cubixweberp.com:199/CheckStatus?cmpcode=${cmpCode}&publick=${pubKey}&privatek=${privateKey}`;

                console.log(url);
                const response = await fetch(url);
                const data = await response.json();
                console.log('Raw Response:', data);

                if (data[0].Column1 === 'REGISTERED') {
                    const newCompanyData = {
                        cmpcode: cmpCode,
                        publick: pubKey,
                        privatek: privateKey
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
            const result = await fetch(`https://cubixweberp.com:199/CheckStatus?cmpcode=${company.cmpcode}&publick=${company.publick}&privatek=${company.privatek}`)
            const data = await result.json()
            // console.log(data)
            // setDeviceValidation(data[0].Column1)
            if (data[0].Column1 === 'VALIDATED') {
                await AsyncStorage.setItem("selectedCompany", JSON.stringify(company));
                setSelectedCompany(company);
                // localStorage.setItem("selectedCompany", JSON.stringify(company));
                navigation.navigate('LoginPage');
            }
        } else {
            setLoginError('not validated')
            // navigate('/');
            console.log("not validated")
        }
    };

    const validateCompanyList = async (company) => {
        console.log('validateCmp');
        if (company.cmpcode && company.publick && company.privatek) {
            const result = await fetch(`https://cubixweberp.com:199/CheckStatus?cmpcode=${company.cmpcode}&publick=${company.publick}&privatek=${company.privatek}`);
            const data = await result.json();
            // console.log(data)
            const status = data[0].Column1;
            // Set the status for the company
            const companyData = { cmpcode: company.cmpcode, status };
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
                                // Save the selected company in local storage
                                // localStorage.setItem("selectedCompany", JSON.stringify(company));
                                // Validate the selected company
                                validateCompany(company);

                                navigation.navigate('LoginPage');
                                // navigation.navigate('Home');
                                setShowLoader(false)
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

    const handleCmpnyListClick = (cmp) => {
        validateCompany(cmp);
    }


    // console.log('r', showLoader)

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>

                <View style={styles.LoginWrapper}>

                    {/* <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} /> */}

                    {/* cloudImg */}
                    {/* <View>
                        <Image source={cloud}></Image>
                    </View> */}

                    {/* <View style={{
                        justifyContent: 'flex-start',
                        width: "100%"
                    }}>
                        <View
                            style={{
                                width: "44%",
                                backgroundColor: "white",
                                marginLeft: 28,
                                padding: 8,
                                borderRadius: 4,
                            }}
                        >
                            <Image source={cbxLogo} style={styles.cbxLogo}></Image>
                        </View>
                    </View> */}


                    <View style={{
                        justifyContent: 'center',
                        width: "100%",
                        margin: 12,
                        alignItems: 'center',
                        marginTop: 110
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
                        justifyContent: 'flex-start',
                        width: "100%"
                    }}>
                        <View
                            style={{
                                width: "44%",
                                backgroundColor: "white",
                                marginLeft: 28,
                                padding: 8,
                                borderRadius: 4,
                            }}
                        >
                            <Image source={cbxLogo} style={styles.cbxLogo}></Image>
                        </View>
                    </View> */}

                    {/* Validation form */}
                    <View style={{
                        padding: 8,
                        alignItems: 'center',
                        width: '100%',
                        marginTop: 18
                    }}>
                        <Text style={{
                            color: 'black',
                            fontSize: 20,
                            fontWeight: 'bold'

                        }}>Register your Device</Text>
                    </View>

                    <View style={{
                        // backgroundColor: '#F0F8FF',
                        // backgroundColor: 'white',
                        padding: 28,
                        width: '95%',
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


                                    {/* <View style={{ width: '100%', marginTop: 12 }}>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Admin Dashboard, Developed by Cubix IT Solutions LLC</Text>
                                    </View> */}

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
                                        cmpCodeView &&
                                        <>
                                            <Text>Enter Company Code</Text>
                                            <TextInput style={{
                                                // borderBottomColor: 'grey',
                                                // borderBottomWidth: 1,
                                                backgroundColor: 'white',
                                                marginBottom: 12, marginTop: 12,
                                                borderRadius: 12,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.25,
                                                shadowRadius: 3,
                                                elevation: 5,
                                            }}
                                                value={cmpCode}
                                                onChangeText={(text) => setCmpCode(text)}
                                                placeholder="company code"
                                                placeholderTextColor="#aaa"
                                            ></TextInput>
                                            {/* <Text>Enter Private Key</Text>
                                    <TextInput style={{ borderBottomColor: 'grey', borderBottomWidth: 1, backgroundColor: 'white', marginBottom: 12, marginTop: 12 }}></TextInput> */}

                                            <View style={{
                                                width: '100%',
                                                alignItems: 'center'
                                            }}>
                                                {
                                                    cmpCode !== '' &&
                                                    <TouchableOpacity style={{ padding: 12, backgroundColor: 'black', borderRadius: 4 }} onPress={handleGetPubKey}>
                                                        {
                                                            loginClick ? <ActivityIndicator size={'big'} color={'orange'} /> :
                                                                <Text style={{ color: 'white' }}>Get Public Key</Text>
                                                        }
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </>
                                    }

                                    {
                                        regView &&
                                        <>
                                            <Text>Enter Private Key</Text>
                                            <TextInput style={{
                                                // borderBottomColor: 'grey',
                                                //  borderBottomWidth: 1, 
                                                backgroundColor: 'white',
                                                marginBottom: 12, marginTop: 12, shadowColor: '#000',
                                                borderRadius: 12,
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.25,
                                                shadowRadius: 3,
                                                elevation: 5,
                                            }} value={privateKey}
                                                onChangeText={(text) => setPrivateKey(text)}
                                                placeholder="private key"
                                                placeholderTextColor="#aaa"
                                            ></TextInput>
                                            {/* <Text>Enter Private Key</Text>
                                    <TextInput style={{ borderBottomColor: 'grey', borderBottomWidth: 1, backgroundColor: 'white', marginBottom: 12, marginTop: 12 }}></TextInput> */}

                                            <View style={{
                                                width: '100%',
                                                alignItems: 'center'
                                            }}>
                                                {
                                                    cmpCode !== '' &&
                                                    <TouchableOpacity style={{ padding: 12, backgroundColor: 'black', borderRadius: 4 }} onPress={handleRegistration}>

                                                        {
                                                            loginClick ? <ActivityIndicator size={'big'} color={'orange'} /> :
                                                                <Text style={{ color: 'white' }}>Register</Text>
                                                        }

                                                    </TouchableOpacity>
                                                }
                                            </View>

                                            <View style={{
                                                width: '100%',
                                                backgroundColor: 'white',
                                                marginTop: 12
                                            }}>
                                                <Text style={{ padding: 8, color: 'darkgreen', fontSize: 16 }}>Your Public Key is: {pubKey}</Text>
                                                <Text style={{ padding: 8, color: 'darkgreen', fontSize: 16 }}>Your Company Code  is: {cmpCode}</Text>
                                                <Text style={{ padding: 8, color: 'orange', fontSize: 16 }}>You will receive Private Key from the company</Text>
                                            </View>

                                            {/* <View style={{ width: '100%', marginTop: 12 }}>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Admin Dashboard, Developed by Cubix IT Solutions LLC</Text>
                                            </View> */}
                                        </>
                                    }
                                </>

                        }



                    </View>


                    {/* bottomImg */}
                    {/* <View style={{
                        marginTop: '10%'
                    }}>
                        <Image style={{
                            width: 380, height: 200
                        }} source={footerBg}></Image>
                    </View> */}

                    <View style={{
                        width: '100%',
                        marginTop: 12,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <View style={{
                            width: '90%',
                            marginLeft: 16
                        }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Admin Dashboard, Developed by Cubix IT Solutions LLC</Text>

                        </View>
                    </View>

                </View>

            </ScrollView>

            {/* <LinearGradient
                colors={['#98b2e5', 'rgba(10, 184, 149, 0.057)']}
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
})

export default MachineValidation