import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { useIsFocused, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';


const Header = ({ setShowSidePanel, showSidePanel, setShowApprovals, showApprovals, setShowSwitchCmp }) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const route = useRoute();

    // const [showSidePanel, setShowSidePanel] = useState(false)

    const [showLogOutPoP, setshowLogoutPoP] = useState(false)
    const [userDataArray, setUserDataArray] = useState(null)

    const [selectedCompany, setSelectedCompany] = useState(null)
    const [cmpcode, setCmpCode] = useState(null)
    const [publick, setpublick] = useState(null)
    const [privatek, setprivatek] = useState(null)

    const [cmpName, setCmpName] = useState('')

    // const [showSidePanel, setShowSidePanel] = useState(false)

    // const toggleSidePanel = () => {
    //     setShowSidePanel(!showSidePanel);
    // };

    useEffect(() => {
        if (isFocused && route.name === 'Home') {
            setShowSidePanel(false);
            // setshowLogoutPoP(false);
        }
    }, [isFocused]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
                const parsedUserDataArray = JSON.parse(storedUserDataArray) || [];
                const portNoData = await AsyncStorage.getItem('portNoData')

                setUserDataArray(parsedUserDataArray)

                if (portNoData) {
                    // setCmpName(portNoData[0].COMPNAME)
                    const dataArray = JSON.parse(portNoData);
                    setCmpName(dataArray[0].COMPNAME)
                }

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
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            // Retrieve the selected company details from local storage
            const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

            const userDataArray = await AsyncStorage.getItem('userDataArray')

            console.log('userDataArray', userDataArray)

            console.log('selectedCompanyString', selectedCompanyString)

            // Check if a selected company is stored in local storage
            if (selectedCompanyString) {
                const selectedCompany = JSON.parse(selectedCompanyString);

                setSelectedCompany(selectedCompany)

                // Access the company details and set them as states
                setCmpCode(selectedCompany.cmpcode);
                setpublick(selectedCompany.publick);
                setprivatek(selectedCompany.privatek);
            } else {
                // Handle the case where no selected company is found
                console.error("No selected company found in local storage");
            }
        };

        fetchData();
    }, []);

    // useEffect(() => {
    //     if (cmpcode && userDataArray) {
    //         const selectedCompanyIndex = userDataArray && userDataArray.findIndex(company => company.cmpcode === cmpcode);

    //         console.log('selectedCompanyIndex', selectedCompanyIndex)

    //     }
    // }, [cmpcode, userDataArray])

    // Function to handle logout and remove specific user data properties
    const handleLogout = async () => {
        let storedUserDataArray = userDataArray;

        // Find the index of the selected company in userDataArray (assuming cmpcode is unique)
        const selectedCompanyIndex = storedUserDataArray && storedUserDataArray.findIndex(company => company.cmpcode === cmpcode);

        // Check if the selected company is found in the array
        if (selectedCompanyIndex !== -1) {
            // Remove specific user data properties
            delete storedUserDataArray[selectedCompanyIndex].Roles;
            delete storedUserDataArray[selectedCompanyIndex].User;
            delete storedUserDataArray[selectedCompanyIndex].Image;
            delete storedUserDataArray[selectedCompanyIndex].CmpName;
            delete storedUserDataArray[selectedCompanyIndex].AllowDept;

            // Save the updated array back to local storage
            await AsyncStorage.setItem("userDataArray", JSON.stringify(storedUserDataArray));
        }

        if (selectedCompany) {
            // const selectedCompany = JSON.parse(selectedCompany);

            // Remove specific user data properties
            delete selectedCompany.Roles;
            delete selectedCompany.User;
            delete selectedCompany.Image;
            delete selectedCompany.CmpName;
            delete selectedCompany.AllowDept;

            // Save the updated selected company back to AsyncStorage
            await AsyncStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));
        }

        // Perform other logout operations like clearing tokens, navigating to login screen, etc.
        navigation.navigate('LoginPage');
    };


    // console.log(showSidePanel)

    // console.log('selectedCompanyfromHead', selectedCompany)

    return (
        <>
            <View style={{
                backgroundColor: '#2887F3'
            }}>


                <View style={styles.UserProfileWrap}>

                    <View style={styles.HeadWrapper}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 50,
                                padding: 4,
                            }}
                            onPress={() => navigation.navigate('Home')}>
                            <Image style={{ width: 150, height: 30 }} source={require('../dashImages/cbxFreeLogo.png')} />
                        </TouchableOpacity>

                        <View style={styles.HeadRight}>
                            <TouchableOpacity onPress={() => setShowApprovals(!showApprovals)}><Image style={{
                                width: 24, height: 24,
                            }} source={require('../dashImages/bell.png')} /></TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => setShowSidePanel(!showSidePanel)}><Image source={require('../images/Burg.png')} /></TouchableOpacity> */}
                        </View>

                    </View>

                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 50,
                        padding: 6,
                        position: 'absolute',
                        right: 10,
                        top: 84,

                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3,
                        elevation: 5,
                    }}>
                        <TouchableOpacity onPress={() => setShowSidePanel(!showSidePanel)}><Image source={require('../dashImages/Burg.png')} /></TouchableOpacity>
                    </View>



                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 50
                    }}>
                        <Image source={require('../dashImages/userAvatar.png')} />
                    </View>
                    {/* <View style={{ padding: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>{selectedCompany && selectedCompany.User}</Text>
                    </View> */}
                    <View style={styles.CompanyTag}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>{cmpName}</Text>
                    </View>

                </View>
            </View>

            {
                showSidePanel &&
                <View style={styles.sidePanelWrapper}>

                    <TouchableOpacity style={styles.sidePanelLeft} onPress={() => setShowSidePanel(!showSidePanel)}>
                        {/* <Text>sideleft</Text> */}
                    </TouchableOpacity>

                    <View style={styles.sidePanelRight}>

                        {/* <View style={styles.UserProfileWrap}>

                            <View>
                                <Image source={require('../images/userAvatar.png')} />
                            </View>
                            <View style={{ padding: 8 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{selectedCompany && selectedCompany.User}</Text>
                            </View>
                            <View style={styles.CompanyTag}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>{selectedCompany && selectedCompany.CmpName}</Text>
                            </View>

                        </View> */}

                        <View style={{
                            width: '100%',
                            justifyContent: 'center',
                            marginVertical: 12,
                            paddingVertical: 12,

                        }}>

                            {/* <TouchableOpacity style={styles.SideOptionWrap} onPress={() => navigation.navigate('AddMachine')}>
                                <Text style={{
                                    fontSize: 16, color: 'black', marginRight: 12,
                                }}>Add Company</Text>
                                <Image style={{ width: 20, height: 20 }} source={require('../dashImages/addIcon.png')} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.SideOptionWrap} onPress={() => setShowSwitchCmp(true)}>
                                <Text style={{
                                    fontSize: 16, color: 'black', marginRight: 12
                                }}>Switch Company</Text>
                                <Image style={{ width: 20, height: 20 }} source={require('../dashImages/loopIcon.png')} />
                            </TouchableOpacity> */}

                            <TouchableOpacity style={styles.SideOptionWrap} onPress={() => navigation.navigate('DashBoardCreation')}>
                                <Text style={{
                                    fontSize: 16, color: 'black', marginRight: 12
                                }}>Dashboard Creation</Text>
                                <Image style={{ width: 20, height: 20 }} source={require('../dashImages/dashIcon.png')} />
                            </TouchableOpacity>
                        </View>

                        {/* <View style={{
                            marginTop: 'auto',
                            marginBottom: 25,
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity style={styles.LogoutButton} onPress={() => setshowLogoutPoP(!showLogOutPoP)}>
                                <Text style={{ color: 'white', marginRight: 6 }}>LogOut</Text>
                                <Image style={{ width: 20, height: 20 }} source={require('../dashImages/logOutLight.png')} />
                            </TouchableOpacity>
                        </View> */}

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
                                onPress={handleLogout}
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
    HeadWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        // padding: 12,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20

        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3,
        // elevation: 5,

        // backgroundColor: '#2887F3',
    },
    HeadRight: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // width: '20%',
        backgroundColor: 'white',
        borderRadius: 50,
        padding: 6,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
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
        width: '55%',
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

    UserProfileWrap: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        // borderBottomColor: 'grey',
        // borderBottomWidth: 1,
        paddingBottom: 12,
        backgroundColor: '#CAF4FF',
        backgroundColor: '#2887F3',
        padding: 14,
        borderRadius: 8,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    CompanyTag: {
        padding: 6,
        // backgroundColor: '#685CFE',
        borderRadius: 4,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3,
        // elevation: 5,
    },
    SideOptionWrap: {
        width: '100%',
        flexDirection: 'row',
        marginVertical: 4,
        backgroundColor: '#e9ecef',
        paddingVertical: 12,
        paddingLeft: 8,
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    LogoutButton: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'red',
        borderRadius: 4,
        alignItems: 'center'
    },
    ApprovalsWrapper: {
        backgroundColor: 'white',
        flex: 1,
        position: 'absolute',
        top: 50,
        left: 0,
        width: '100%',
        height: Dimensions.get('window').height - 50,
        // height: 800,
        // height: Dimensions.get('window').height,
        zIndex: 2,
        flexDirection: 'column',
        padding: 12
    },
    closeIcon: {
        position: 'absolute',
        right: 0,
        backgroundColor: '#D9D9D9',
        padding: 8

        // #ECECEC
    },
    ApprovalCont: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        height: 25
        // paddingVertical: 24
    },
    ApprovalListCont: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 8,
        marginTop: 18,
        borderRadius: 4
    },
    ApprovalsOptions: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ApprovalsButtons: {
        flexDirection: 'row',
        // width: '30%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    RejectButton: {
        backgroundColor: 'white',
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginRight: 12
    },
    ApproveButton: {
        backgroundColor: '#5355B4',
        paddingHorizontal: 14,
        paddingVertical: 6
    },
    ApprovalItemCont: {
        marginBottom: 12,
        marginTop: 4,
        backgroundColor: '#ECECEC',
        paddingVertical: 12,
        paddingHorizontal: 10
    },


    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

        zIndex: 4,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '94%',
        maxHeight: 500
    },


    SwitchCmpModalWrapper: {
        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: Dimensions.get('window').height,
    },
    SwitchCmpModal: {
        backgroundColor: 'white',
        position: 'absolute',
        top: '10%',
        left: '5%',
        right: '5%',
        width: '90%',
        height: 500,
        borderRadius: 8
    },
    TopBanner: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12
    },
    closeIcon: {
        backgroundColor: '#D9D9D9',
        padding: 8
    },
    CmpListWrap: {
        width: '100%',
        padding: 8
    },
    CmpItems: {
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#D9D9D9",
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    SelectBanner: {
        justifyContent: 'center',
        flexDirection: 'row'
    },
    SelectText: {
        backgroundColor: 'purple',
        color: 'white',
        padding: 8,
        borderRadius: 4
    }
})

export default Header