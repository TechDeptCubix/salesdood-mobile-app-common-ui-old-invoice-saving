import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';


const Header = () => {

    const navigation = useNavigation()

    const [userDataArray, setUserDataArray] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)

    const [userLogin, setUserLogin] = useState('')
    const [accessGrp, setAccessGrp] = useState('')
    const [salesMan, setSalesMan] = useState('')
    const [salesRole, setSalesRole] = useState('')

    const [showSidePanel, setShowSidePanel] = useState(false)
    const [showLogOutPoP, setshowLogoutPoP] = useState(false)

    const handleLogout = async () => {
        try {
            // Remove the items from AsyncStorage
            await AsyncStorage.removeItem('Userlogin');
            await AsyncStorage.removeItem('accessgrp');
            await AsyncStorage.removeItem('sales_man');
            await AsyncStorage.removeItem('SalesRole');

            // Navigate to the MachineValidation page
            navigation.navigate('MachineValidation');
        } catch (error) {
            // Handle errors, if any
            console.error('Error logging out: ', error);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
                const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

                const userLogin = await AsyncStorage.getItem('UserLogin')
                const accessgrp = await AsyncStorage.getItem('accessgrp')
                const salesMan = await AsyncStorage.getItem('sales_man')
                const salesRole = await AsyncStorage.getItem('SalesRole')

                const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

                setUserDataArray(parsedUserDataArray)
                setUserLogin(userLogin)
                setAccessGrp(accessgrp)
                setSalesMan(salesMan)
                setSalesRole(salesRole)

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

    // console.log('userDataArray', userDataArray)
    // console.log('selectedCompany', selectedCompany)

    // console.log('userLogin', userLogin)
    // console.log('accessGrp', accessGrp)
    // console.log('salesMan', salesMan)
    // console.log('salesRole', salesRole)

    return (
        <>
            <View style={styles.HeadWrap}>

                <TouchableOpacity style={styles.HomeWrap} onPress={() => navigation.navigate('Home')}>
                    <Image style={styles.HeadIcon} source={require('../images/HomeIcon.png')} />
                    <Text style={styles.Text}>
                        {salesMan && salesMan.toUpperCase()}

                    </Text>
                </TouchableOpacity>

                <View>
                    <TouchableOpacity style={styles.SettingsWrap} onPress={() => setShowSidePanel(!showSidePanel)}>
                        <Image style={styles.HeadIcon} source={require('../images/SettingsIcon.png')} />
                    </TouchableOpacity>
                </View>
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
                                <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Lexend-Bold' }}>{salesMan && salesMan}</Text>
                            </View>
                            {/* <View style={styles.CompanyTag}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>eee</Text>
                            </View> */}

                        </View>

                        <View style={{
                            // marginTop: 'auto',
                            marginBottom: 25,
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity style={styles.LogoutButton} onPress={() => setshowLogoutPoP(!showLogOutPoP)}>
                                <Text style={{ color: 'white', marginRight: 6, fontFamily: 'Lexend-Regular' }}>LogOut</Text>
                                {/* <Image style={{ width: 20, height: 20 }} source={require('../images/logOutLight.png')} /> */}
                            </TouchableOpacity>
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
        </>
    )
}

const styles = StyleSheet.create({
    HeadWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#5A55CA',
        paddingHorizontal: 12,
        paddingVertical: 16,
        height: 80
        // borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
    },
    HeadIcon: {
        width: 25,
        height: 25
    },
    HomeWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    Text: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontFamily: 'Lexend-Bold'
    },
    SettingsWrap: {
        backgroundColor: '#189A2E',
        borderRadius: 50,
        padding: 6
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
        zIndex: 2,
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
        zIndex: 2,
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


})

export default Header