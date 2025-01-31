import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native'

const Header = () => {
    const navigation = useNavigation();

    const isFocused = useIsFocused();
    const route = useRoute();

    const [showSidePanel, setShowSidePanel] = useState(false)

    const [showLogOutPoP, setshowLogoutPoP] = useState(false)

    const toggleSidePanel = () => {
        setShowSidePanel(!showSidePanel);
    };

    useEffect(() => {
        if (isFocused && route.name === 'EmployeeHome') {
            setShowSidePanel(false);
            // setshowLogoutPoP(false);
        }
    }, [isFocused]);

    // // // Function to get all data from AsyncStorage
    // const getAllDataFromAsyncStorage = async () => {
    //     try {
    //         // Get all keys from AsyncStorage
    //         const keys = await AsyncStorage.getAllKeys();

    //         // Get the corresponding values for the keys
    //         const data = await AsyncStorage.multiGet(keys);

    //         // Log the data
    //         console.log("Data in AsyncStorage:", data);

    //         // Alternatively, you can iterate over the data and log individual items
    //         // data.forEach(([key, value]) => {
    //         //   console.log(`${key}: ${value}`);
    //         // });

    //     } catch (error) {
    //         console.error("Error fetching data from AsyncStorage:", error);
    //     }
    // };

    // // Call the function to get all data from AsyncStorage
    // getAllDataFromAsyncStorage();


    const handleLogOut = async () => {

        try {
            // Remove the item from AsyncStorage
            await AsyncStorage.removeItem('userData');

            // Navigate to the login page
            navigation.navigate('LoginPage');
            setshowLogoutPoP(false)
        } catch (error) {
            console.error("Error logging out:", error);
            // Handle error if necessary
        }
    };


    // console.log(showSidePanel, 'showSidePanel')
    // console.log(showLogOutPoP, 'showLogOutPoP')
    return (
        <>
            <View style={{
                width: '100%',
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
                elevation: 5,
            }}>

                {/* HeaderNav */}
                <View style={styles.THHeaderNav}>
                    <TouchableOpacity onPress={() => navigation.navigate('EmployeeHome')}>
                        <View>
                            <Image source={require('../taskEmpImages/xpertLogo.png')} style={{ height: 40, width: 120 }}></Image>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleSidePanel} style={styles.hamburgerButton}>
                        <Image source={require('../taskEmpImages/ic_hamburger.png')}></Image>
                    </TouchableOpacity>
                </View>
            </View>

            {
                showSidePanel &&
                <View style={styles.sidePanelWrapper}>

                    <TouchableOpacity style={styles.sidePanelLeft} onPress={toggleSidePanel}>
                        {/* <Text>sideleft</Text> */}
                    </TouchableOpacity>

                    <View style={styles.sidePanelRight}>
                        <TouchableOpacity onPress={() => navigation.navigate('EmployeeHome')}>
                            <View style={{
                                padding: 8,
                                margin: 4,
                            }}>
                                <Text style={{
                                    fontWeight: 'bold'
                                }}>Home</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('CompletedTask')}>
                            <View style={{
                                padding: 8,
                                margin: 4,
                            }}>
                                <Text style={{
                                    fontWeight: 'bold'
                                }}>My completed Tasks</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            padding: 8,
                            margin: 4,
                        }} onPress={() => setshowLogoutPoP(!showLogOutPoP)}>
                            <Text style={{
                                width: '50%',
                                padding: 4,
                                fontWeight: 'bold',
                                backgroundColor: '#f8f9fa',
                                textAlign: 'center'
                            }}>LogOut</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }

            {
                showLogOutPoP &&
                <View style={styles.LogOutModalWrapper}>

                    <View style={styles.LogOutModal}>
                        <View>
                            <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold', padding: 8, margin: 4 }}>LogOut</Text>
                        </View>
                        <View>
                            <Text style={{ color: 'black', fontSize: 16, padding: 8, margin: 4 }}>Are you sure ?</Text>
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
                                    color: 'white'
                                }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                backgroundColor: 'red',
                                padding: 8,
                                borderRadius: 4
                            }}
                                onPress={handleLogOut}
                            >
                                <Text style={{
                                    color: 'white'
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
    THHeaderNav: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 14
    },
    hamburgerButton: {
        // backgroundColor: 'red',
        padding: 12,
        width: 40, // Width of the TouchableOpacity
        height: 40, // Height of the TouchableOpacity
    },
    sidePanelWrapper: {
        backgroundColor: '#00000080',
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        flexDirection: 'row'
    },
    sidePanelLeft: {
        backgroundColor: '#00000080',
        width: '100%',
    },
    sidePanelRight: {
        backgroundColor: 'white',
        marginLeft: 'auto',
        width: '50%',
        height: '100%',
        padding: 12
    },
    LogOutModalWrapper: {
        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    LogOutModal: {
        backgroundColor: 'white',
        position: 'absolute',
        top: '40%',
        left: '10%',
        width: '80%',
        height: 160,
        borderRadius: 8
    }
})

export default Header