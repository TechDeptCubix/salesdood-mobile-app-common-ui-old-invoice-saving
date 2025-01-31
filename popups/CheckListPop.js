import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'


const CheckListPop = ({
    setDetailsPop, detailsPopItem, portNo,
    cmpCode, selectedValue, loginUser, deptno, appUrl, acceptPage
}) => {

    const [details, setDetails] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    // const dono = detailsPopItem.do_no

    // const itemDeptno = detailsPopItem.deptno.trim()

    const fetchPickListDetail = async (sono) => {
        setShowLoader(true)
        try {
            console.log(`${appUrl}Sales_Order/${cmpCode}/CHECKING_ITEM/-/${deptno}/${sono}`)
            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/CHECKING_ITEM/-/${deptno}/${sono}`)
            setDetails(response.data)
            setShowLoader(false)


        } catch (error) {
            console.log('fetchPickListDetailError', error)
            setError('Some Error Occured')
            setShowLoader(false)

        }
    }

    const fetchAcceptedPickListDetail = async (sono) => {
        setShowLoader(true)
        try {
            console.log(`${appUrl}Sales_Order/${cmpCode}/STARTED_CHECKING_ITEM/-/${deptno}/${sono}`)
            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/STARTED_CHECKING_ITEM/-/${deptno}/${sono}`)
            setDetails(response.data)
            setShowLoader(false)


        } catch (error) {
            console.log('fetchPickListDetailError', error)
            setError('Some Error Occured')
            setShowLoader(false)

        }
    }

    // const fetchDetails = async () => {
    //     try {
    //         console.log('fetchDetailsUrl', `https://cubixweberp.com:${portNo}/${cmpCode}/DO_DETAILS/${selectedValue}/${loginUser}/${itemDeptno}/${dono}/`)
    //         const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/DO_DETAILS/${selectedValue}/${loginUser}/${itemDeptno}/${dono}/`)

    //         if (response.status === 200) {
    //             setDetails(response.data)
    //         }
    //     } catch (error) {
    //         console.log('fetchDetailsError', error)
    //     }
    // }

    useEffect(() => {
        if (appUrl && cmpCode && deptno && detailsPopItem) {

            if (acceptPage) {
                fetchAcceptedPickListDetail(detailsPopItem['SO_NO'])
            }
            if (!acceptPage) {
                fetchPickListDetail(detailsPopItem['SO_NO'])
            }
        }
    }, [appUrl, cmpCode, deptno, detailsPopItem, acceptPage])

    console.log('details', details)
    console.log('detailsPopItem', detailsPopItem)

    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy hh:mm a');
    }

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

                <View style={styles.HomeTextCont}>
                    <TouchableOpacity style={styles.SettingsWrap} onPress={() => setDetailsPop(false)}>
                        <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                    </TouchableOpacity>
                    <Text style={styles.HomeText}>Details</Text>
                </View>

                <View style={styles.StockDescWrap}>

                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Customer</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.Customer}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>SO_NO</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.SO_NO}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Sales Man</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.sale_man}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>SO_Date</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && formattedDate(detailsPopItem.so_date)}</Text>
                    </View>

                </View>

                <View style={styles.BottomListCont}>

                    <View style={styles.BottomListBanner}>
                        <View style={styles.ItemBannerCont}>
                            <Text style={styles.BannerText}>Item</Text>
                        </View>
                        <View style={styles.QtyBannerCont}>
                            <Text style={[styles.BannerText, { textAlign: 'right' }]}>Pick Qty</Text>
                        </View>
                        <View style={styles.QtyBannerCont}>
                            <Text style={[styles.BannerText, { textAlign: 'right' }]}>SO Qty</Text>
                        </View>
                    </View>

                </View>

                {
                    showLoader &&
                    <ActivityIndicator />
                }

                {
                    !showLoader &&
                    <FlatList
                        nestedScrollEnabled={true}
                        contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 8 }}

                        data={details}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (

                            <>
                                <View style={styles.BottomListWrap}>
                                    <View style={styles.ItemBannerCont}>
                                        <Text style={[styles.BannerText, { fontFamily: 'Lexend-Regular', fontSize: 14 }]}>{item.Code}</Text>
                                        <Text style={[styles.BannerText, { fontFamily: 'Lexend-Regular', fontSize: 14 }]}>{item.BIN}</Text>
                                        <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 14 }]}>{item.Description}</Text>
                                    </View>
                                    <View style={styles.QtyBannerCont}>
                                        <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 14, textAlign: 'right' }]}>{item.Pick_Qty}</Text>
                                    </View>
                                    <View style={styles.QtyBannerCont}>
                                        <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 14, textAlign: 'right' }]}>{item.SO_Qty}</Text>
                                    </View>
                                </View>
                            </>

                        )}
                        ListEmptyComponent={
                            <View>
                                <Text style={{ color: 'red' }}>No data available</Text>
                            </View>
                        }

                    />
                }



            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 5,
        width: '95%',
        maxHeight: Dimensions.get('window').height - 100
    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#DCDBDB',
        paddingVertical: 10,
        paddingHorizontal: 6
    },
    HomeText: {
        fontSize: 18,
        color: '#1A6CF6',
        // borderBottomColor: 'gold',
        // borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Regular'
    },
    SettingsWrap: {
        // backgroundColor: '#189A2E',
        // backgroundColor: 'red',
        // borderRadius: 50,
        padding: 6
    },
    HeadIcon: {
        width: 20,
        height: 20
    },

    StockDescWrap: {
        flexDirection: 'column',
        width: '100%',
        marginTop: 8,
        backgroundColor: 'white',
        padding: 18
    },
    StockItem: {
        padding: 4,
        marginBottom: 2
    },
    StockLabel: {
        fontFamily: 'Lexend-Regular',
        color: "#2B2B2B",
        fontSize: 14
    },
    StockTextValue: {
        fontFamily: 'Lexend-Bold',
        color: "black",
        fontSize: 14
    },

    TableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
    },

    BottomListCont: {
        flexDirection: 'column',
        justifyContent: 'center',
        // alignItems: 'center',
        width: '100%',
        paddingHorizontal: 8
    },
    BottomListBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomColor: 'grey',
        borderBottomWidth: 1
    },
    ItemBannerCont: {
        width: '70%'
    },
    QtyBannerCont: {
        width: '15%',
        textAlign: 'right'
    },
    BannerText: {
        fontFamily: 'Lexend-Bold',
        color: "#2B2B2B",
        fontSize: 12
    },
    ScrollView: {
        maxHeight: 200
    },

    BottomListWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
})

export default CheckListPop