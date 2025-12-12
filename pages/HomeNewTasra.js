import { View, Text, ScrollView, ImageBackground, StyleSheet, Image, Dimensions, TouchableOpacity, Alert, ActivityIndicator, Button } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { all } from 'axios';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import Home from '../dashPages/Home';
import { format } from 'date-fns';
import messaging from '@react-native-firebase/messaging';
import { AppState, AppStateStatus } from 'react-native';

import { SERVER_KEY } from "@env";


const HomeNewTasra = () => {

    const [accessGrp, setAccessGrp] = useState('')

    const getAccessGroup = async () => {
        const accessgrpFromLocal = await AsyncStorage.getItem('accessgrp')
        setAccessGrp(accessgrpFromLocal)
    }
    useEffect(() => {

        getAccessGroup()

    }, [])

    const navigation = useNavigation()

    return (
        <View style={{ flexDirection: "row", padding: 20 }}>

            {
                accessGrp == "Driver_Bike" ? <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5' }]} onPress={() => navigation.navigate('GoodsCollectionDeliveryPoolList')}>
                    <View style={styles.innerItem}>
                        <View style={styles.TouchablwWhiteBackg}>
                            <Image source={require('../images/srchDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}>
                            </Image>
                        </View>
                        <View style={styles.innerText}>
                            <Text style={styles.optionText}>Logistics</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                    :
                    <TouchableOpacity style={[styles.ItemCont, { backgroundColor: '#D4CFC5', marginLeft: 10 }]} onPress={() => navigation.navigate('WarehousePoolList')}>
                        <View style={styles.innerItem}>
                            <View style={styles.TouchablwWhiteBackg}>
                                <Image source={require('../images/srchDark.png')} style={[styles.optionIcon, { resizeMode: 'contain' }]}>
                                </Image>
                            </View>
                            <View style={styles.innerText}>
                                <Text style={styles.optionText}>Warehouse</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
            }


        </View>
    )
}

const styles = StyleSheet.create({
    topCont: {
        width: '100%',
        // height: Dimensions.get('window').height / 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingVertical: 12
    },
    topUserCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 8
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
        justifyContent: 'space-between'
        // paddingHorizontal: 8,
        // paddingVertical: 8
    },
    TRDateCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
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
        padding: 8
    },
    TRCollectionCont: {
        paddingVertical: 8
    },
    TRSCHead: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    TRSCData: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 4
    },
    userAvatar: {
        width: 25,
        height: 25,
        marginBottom: 8,
        resizeMode: "contain"
    },
    userNameText: {
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Bold',
    },
    topCirclesCont: {
        position: 'absolute',
        top: -8,
        right: 0
    },
    topCirclesImg: {
        width: 150,
        height: 150,
        resizeMode: 'contain'

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
        justifyContent: 'center',
        // position: 'relative',
        zIndex: 3
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
        marginTop: 8
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
        height: 110,

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
        position: "relative",
        justifyContent: "center"
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
        justifyContent: 'center'
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
        borderRadius: 8
    },
    LogoutButton: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'red',
        borderRadius: 4,
        alignItems: 'center'
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
        resizeMode: 'contain'
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
        alignItems: 'center'
    },
    CBXImg: {
        width: 100,
        height: 30,
        resizeMode: 'contain'
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
        justifyContent: 'space-between'
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
        alignItems: 'center'
    },
    GlobeImg: {
        width: 500,
        // height: 250,
        resizeMode: 'contain'
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
        zIndex: 5
    },

    BottomTabImg: {
        width: 25,
        height: 25
    },

    CBXImgBottomRound: {
        width: 60,
        height: 35,
        resizeMode: 'contain'
    },

    TopSalesWrap: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center'
    },
    TopSalesBox: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 16,
        flex: 1
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
        paddingHorizontal: 12
    },

    UserAvatarCont: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    TouchablwWhiteBackg: {
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    TouchableBlackOverlay: {
        padding: 8,
        backgroundColor: '#00000095',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        height: 110,
        width: "100%",
        right: 0,
        left: 0

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
        width: '94%'
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
    },






})

export default HomeNewTasra