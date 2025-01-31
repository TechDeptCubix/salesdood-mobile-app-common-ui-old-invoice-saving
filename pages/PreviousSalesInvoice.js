import { View, Text, StyleSheet, Dimensions, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderUiNew from './HeaderUiNew'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'


const PreviousSalesInvoice = () => {

    const [salesMan, setSalesMan] = useState('')
    const [deptNo, setDeptNo] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [listData, setListData] = useState(null)

    const [apiError, setApiError] = useState(false)

    const [appUrl, setAppUrl] = useState('')

    const [cmpcode, setCmpCode] = useState('')

    const [searchInv, setSearchInv] = useState('')

    const [searchError, setSearchError] = useState('')

    const fetchAsyncUser = async () => {
        const salesMan = await AsyncStorage.getItem('sales_man')

        const deptno = await AsyncStorage.getItem('DEPTNO')

        const appUrl = await AsyncStorage.getItem('appUrl')

        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }


        if (appUrl) {
            setAppUrl(appUrl)
        }

        if (salesMan === '----') {
            const salesManDrop = await AsyncStorage.getItem('sales_man_drop')
            setSalesMan(salesManDrop)
        } else {
            setSalesMan(salesMan)

        }
        if (deptno) {
            setDeptNo(deptno)
        } else {
            setDeptNo('----')
        }
    }

    useEffect(() => {
        fetchAsyncUser()
    }, [])



    useEffect(() => {

        if (salesMan && deptNo && appUrl && cmpcode) {
            setShowLoader(true)
            const fetchList = async () => {
                try {
                    console.log(`${appUrl}SalesInvoice/${cmpcode}/invoicelist/${deptNo}/${salesMan}/-`)
                    const response = await axios.get(`${appUrl}SalesInvoice/${cmpcode}/invoicelist/${deptNo}/${salesMan}/-`)

                    // console.log(response.data)

                    if (response.status === 200) {
                        setListData(response.data)
                        setShowLoader(false)
                    }
                    setShowLoader(false)

                } catch (error) {
                    console.log('fetchList', error)
                    setApiError('Some Error Occured')
                    setShowLoader(false)

                }
            }

            fetchList()

        }

    }, [salesMan, deptNo, appUrl, cmpcode])

    useEffect(() => {

        const invSearch = async () => {
            try {

            } catch (error) {
                console.log('invSearchError', error)
                setSearchError('No data found')
            }
        }

        if (searchInv) {

        }
    }, [searchInv])

    console.log('listData', listData[0])
    // console.log('salesMan', salesMan)
    // console.log('deptNo', deptNo)

    return (
        <View style={styles.HomeWrap}>

            <HeaderUiNew name={'Previous Sales Invoice'} />


            <View style={styles.InputCont}>
                <View style={styles.InputImageCont}>
                    <Image style={styles.SearchIcon} source={require('../images/srchIcon.png')} />
                </View>
                <TextInput
                    style={styles.PlaceHolderInput}
                    placeholder='Enter Invoice No'
                    value={searchInv}
                    onChangeText={text => setSearchInv(text)}
                    placeholderTextColor="#1A6CF6"
                />
            </View>

            {
                showLoader &&
                <View>
                    <ActivityIndicator size={'large'} />
                </View>
            }

            {
                !showLoader && apiError && !listData &&
                <View>
                    <Text style={styles.ErrorText}>{apiError}</Text>
                </View>
            }


            {
                listData && !showLoader &&
                <ScrollView horizontal={true} style={{ width: '95%', maxHeight: Dimensions.get('window').height - 100 }}>



                    <View style={styles.CollTableContainer}>
                        <View style={styles.ColltableRow}>
                            <Text style={[styles.CollheaderCell, { borderTopLeftRadius: 4 }]}>INVDATE</Text>
                            <Text style={styles.CollheaderCell}>INVNO</Text>
                            <Text style={styles.CollheaderCell}>CUSTOMER</Text>
                            <Text style={styles.CollheaderCell}>AMOUNT</Text>
                            <Text style={[styles.CollheaderCell, { borderTopRightRadius: 4 }]}>SALES MAN</Text>
                        </View>


                        <ScrollView nestedScrollEnabled={true}>

                            <FlatList
                                data={listData}
                                keyExtractor={(item, index) => index.toString()}
                                contentContainerStyle={{}}
                                renderItem={({ item }) => (
                                    <>
                                        <View style={[
                                            styles.ColltableRow
                                        ]}
                                        >
                                            <Text style={[styles.ColldataCell]}>{item.INV_DATE.split('T')[0]}</Text>
                                            <Text style={[styles.ColldataCell]}>{item.INVNO}</Text>
                                            <Text style={[styles.ColldataCell]}>{item.CUSTOMER}</Text>
                                            <Text style={[styles.ColldataCell]}>{item.AMOUNT}</Text>
                                            <Text style={[styles.ColldataCell]}>{item['SALES MAN']}</Text>
                                        </View>
                                    </>
                                )}
                                ListEmptyComponent={
                                    <View>
                                        <Text style={{ color: 'red' }}>No data available</Text>
                                    </View>
                                }
                            />


                        </ScrollView>


                    </View>
                </ScrollView>

            }



        </View>
    )
}

const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#5A55CA'
    },
    HomeCont: {
        width: '98%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        // borderTopLeftRadius: 18,
        // borderTopRightRadius: 18,
        backgroundColor: '#F0F4FD',
        height: Dimensions.get('window').height - 70

    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    HomeText: {
        fontSize: 18,
        color: 'black',
        borderBottomColor: 'gold',
        borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Bold'
    },
    InputCont: {
        width: '95%',
        backgroundColor: 'white',
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    InputImageCont: {
        // backgroundColor: '#EAEDF5',
        padding: 8,
        borderRadius: 6,
        // position: 'absolute',
        // right: 10
    },
    SearchIcon: {
        width: 25,
        height: 25
    },
    TextInput: {
        width: '100%',
        fontFamily: 'Lexend-Bold'
    },

    CollTableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
        // paddingBottom: 50,
        // height: 500,

        flex: 1,
        // width: 1200,
    },
    ColltableRow: {
        flexDirection: 'row',
        width: '100%',
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    CollheaderCell: {
        // flex: 1,
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 125,
        color: 'white',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',

    },
    ColldataCell: {
        // flex: 1,
        // backgroundColor: '#F3F3F3',
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: 125,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },

    ErrorText: {
        color: 'red',
        fontFamily: 'Lexend-Regular',
        fontSize: 16,
    },

    InputCont: {
        width: '100%',
        backgroundColor: 'white',
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    InputImageCont: {
        // backgroundColor: '#EAEDF5',
        padding: 8,
        borderRadius: 6,
        // position: 'absolute',
        // right: 10
    },
    SearchIcon: {
        width: 25,
        height: 25
    },
    PlaceHolderInput: {
        width: '100%',
        fontFamily: 'Lexend-Regular',
        color: "#3A80EA",
    },




})

export default PreviousSalesInvoice