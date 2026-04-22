import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';


const HeaderUiNew = ({ name,
    setShowSelectedStockPop,
    showSelectedStockPop,
    savedItemData,
    showCartPanel,
    totalUnitPrice }) => {

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

    const [selectedSalesName, setSelectedSalesName] = useState('')


    const handleLogout = async () => {
        try {
            // Remove the items from AsyncStorage
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
                const salesManDrop = await AsyncStorage.getItem('sales_man_drop') || ''
                const salesManNameDrop = await AsyncStorage.getItem('salesman_name_drop') || ''


                const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

                if (salesMan === '----') {
                    // setSalesMan(salesManDrop)
                    setSelectedSalesName(salesManNameDrop)
                } else {
                    setSalesMan(salesMan)

                }

                setUserDataArray(parsedUserDataArray)
                setUserLogin(userLogin)
                setAccessGrp(accessgrp)
                setSalesMan(salesMan)
                setSalesRole(salesRole)
                setSalesManName(salesman_name)

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
            <View style={styles.HomeTextCont}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    {
                        name === 'Order Details' ?

                            <TouchableOpacity onPress={() => navigation.navigate('PreviousOrders')}>
                                <Image style={styles.HeadIcon} source={require('../images/leftArrowDark.png')} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                                <Image style={styles.HeadIcon} source={require('../images/leftArrowDark.png')} />
                            </TouchableOpacity>

                    }
                    <Text style={styles.HomeText}>{name}</Text>
                </View>

                {
                    showCartPanel &&
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '25%'
                    }}>

                        <TouchableOpacity style={styles.stockBagCont} onPress={() => {
                            Keyboard.dismiss()
                            setShowSelectedStockPop(!showSelectedStockPop)
                        }}>
                            <Image style={styles.stockBagIcon} source={require('../images/goCart.png')} />

                            <View style={styles.itemCount}>
                                <Text style={styles.itemCountText}>{savedItemData && savedItemData.length}</Text>
                            </View>
                            
                            <View style={styles.TotalAmntCont}>
                                <Text style={styles.TotalText}>{totalUnitPrice && (totalUnitPrice).toFixed(2)}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowSidePanel(!showSidePanel)}>
                            <Image style={styles.HeadSettIcon} source={require('../images/ic_settings_filled.png')}></Image>
                        </TouchableOpacity>
                    </View>
                }

                {
                    !showCartPanel &&
                    <TouchableOpacity onPress={() => setShowSidePanel(!showSidePanel)}>
                        <Image style={styles.HeadSettIcon} source={require('../images/ic_settings_filled.png')}></Image>
                    </TouchableOpacity>
                }


            </View >

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
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // backgroundColor: '#1A6CF6',
        backgroundColor: '#EFEFEF',
        paddingVertical: 10,
        paddingHorizontal: 12
    },
    HomeText: {
        fontSize: 16,
        color: '#2B2B2B',
        // borderBottomColor: 'gold',
        // borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 12,
        paddingBottom: 8,
        fontFamily: 'Lexend-Bold'
    },
    HeadIcon: {
        width: 25,
        height: 25
    },

    HeadSettIcon: {
        width: 25,
        height: 25
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

    stockBagIcon: {
        width: 25,
        height: 25
    },
    stockBagCont: {
        backgroundColor: '#E0E9F7',
        padding: 8,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
        // borderRadius: 50,
    },
    stockBagText: {
        fontSize: 12,
        fontFamily: 'Lexend-Light',
        color: '#1A6CF6',
        marginLeft: 12,
        marginRight: 12
    },
    itemCount: {
        position: 'absolute',
        top: -15,
        right: -10,
        backgroundColor: '#1A6CF6',
        // padding: 2,
        borderRadius: 50,
        width: 30,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemCountText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },

    TotalAmntCont: {
        // position: 'absolute',
        // bottom: -12,
        // flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'center',
        // width: '100%'
    },
    TotalText: {
        color: 'grey',
        fontSize: 12,
        fontFamily: 'Lexend-Regular',
    },





})

export default HeaderUiNew