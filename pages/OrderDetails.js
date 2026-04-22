import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, ScrollViewComponent, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import ChangeStatusPop from '../popups/ChangeStatusPop'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import REACT_APP_BASE_URL from '../url/AppUrl'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ViewPdfPop from '../popups/ViewPdfPop'
import PdfPopTest from '../popups/PdfPopTest'
import HeaderUiNew from './HeaderUiNew'
import { sub } from 'date-fns'

const OrderDetails = ({ route }) => {
    const { orderId } = route.params
    const navigation = useNavigation()
    const [showChangeStatusPop, setShowChangeStatus] = useState(false)
    const [data, setData] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    const [itemList, setItemList] = useState(null)
    const [salesMan, setSalesMan] = useState('')

    const [showPdf, setShowPdf] = useState(false)

    const [appUrl, setAppUrl] = useState('')

    const [cmpcode, setCmpCode] = useState('')

    const fetchAppUrl = async () => {

        const appUrl = await AsyncStorage.getItem('appUrl')
        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }
        if (appUrl) {
            setAppUrl(appUrl)
        }
    }



    const fetchPreviousOrders = async () => {
        try {
            // const response = await axios.get('http://tanoof.dyndns.org:92/api/Sales_Order/Salesall/ALL');


            

            const deptno = await AsyncStorage.getItem('DEPTNO')

            console.log("fetch previous order api+++-->>>><<<", `${appUrl}Sales_Order/${cmpcode}/Salesall/ALL/${deptno}`)
            
            const response = await axios.get(`${appUrl}Sales_Order/${cmpcode}/Salesall/ALL/${deptno}`);
            const allOrders = response.data;
            const filteredOrder = allOrders.filter(order => order.so_no === orderId);
            const salesMan = await AsyncStorage.getItem('sales_man')
            setSalesMan(salesMan)

            console.log("filteredOrder >> fetchPreviousOrders allOrders orderId" ,allOrders,orderId, filteredOrder)
            setData(filteredOrder);
        } catch (error) {
            console.log('fetchPreviousOrdersError[[[', error);
            setError(error);
        }
    };

    const fetchItemList = async () => {
        try {
            // const response = await axios.get(`http://tanoof.dyndns.org:92/api/Sales_Order/salesall/details/${orderId}`);
            // const response = await axios.get(`${REACT_APP_BASE_URL}Sales_Order/salesall/details/${orderId}`);


            const deptno = await AsyncStorage.getItem('DEPTNO')

            console.log("order details-->++[[[", `${appUrl}Sales_Order/${cmpcode}/details/${orderId}/${deptno}`)
            const response = await axios.get(`${appUrl}Sales_Order/${cmpcode}/details/${orderId}/${deptno}`);
            setItemList(response.data);
        } catch (error) {
            console.log('fetchItemListError', error)
            setError(error);
        }
    };

    const subTotal = itemList && itemList.reduce((sum, item) => sum + (item.line_total || 0), 0)

    console.log('subTotal', subTotal)

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([fetchPreviousOrders(), fetchItemList()]);
            } catch (error) {
                console.log('fetchDataError', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        if (appUrl && cmpcode) {
            fetchData();
        }

    }, [appUrl, cmpcode]);

    useEffect(() => {
        fetchAppUrl()
    }, [])


    // console.log('data', data)
    // console.log('itemList', itemList)

    console.log('orderId', orderId)
    // console.log('filDATA', data)
    // console.log('itemList', itemList)

    return (
        <View style={styles.HomeWrap}>
            {/* <Header /> */}

            <HeaderUiNew name={'Order Details'} />

            {/* <TouchableOpacity style={styles.HomeCont} onPress={() => navigation.navigate('PreviousOrders')}>
                <View>
                    <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                </View>
                <View style={styles.HomeTextCont}>
                    <Text style={styles.HomeText}>Order Details</Text>
                </View>
            </TouchableOpacity> */}

            {
                loading &&
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            }

            {
                error &&
                <View style={styles.centered}>
                    <Text>Error fetching data: {error.message}</Text>
                </View>
            }

            {
                itemList && itemList.length > 0 &&
                <ScrollView style={styles.OrderDetailsWrap}>

                    {/* <View style={styles.TopButtonsWrap}>
                        <TouchableOpacity style={styles.ChngStatusOrderButton} onPress={() => setShowChangeStatus(!showChangeStatusPop)}>
                            <Text style={styles.TopButtonText}>Change status of Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.ViewPdfButton} onPress={() => navigation.navigate('PdfTest', { data, itemList })}>
                            <Text style={styles.TopButtonText}>View PDF</Text>
                        </TouchableOpacity>
                    </View> */}

                    {/* hidden because data is empty array have to check what problem now hidden for demo for icelab */}

                    {/* <View style={styles.TopButtonsWrap}>
                        <View style={styles.CustomerOrderCont}>
                            <Text style={styles.CustomerOrderText}>Customer Code</Text>
                            <Text style={styles.CustomerOrderValue}>{data.length > 0 && data[0].cust_acc}</Text>
                        </View>
                        <View style={styles.CustomerOrderCont}>
                            <Text style={styles.CustomerOrderText}>Order Numner</Text>
                            <Text style={styles.CustomerOrderValue}>{data.length > 0 && data[0].so_no}</Text>
                        </View>
                    </View>

                    <View style={styles.CustomerSection}>
                        <View style={styles.CustomerItemWrap}>
                            <Text style={styles.CustomerTagText}>Customer</Text>
                        </View>
                        <View style={styles.CustomerItemWrap}>
                            <Text style={styles.CustomerValueText}>{data.length > 0 && data[0].accdesc}</Text>
                        </View>
                    </View>

                    <View style={styles.CustomerSection}>
                        <View style={styles.CustomerItemWrap}>
                            <Text style={styles.CustomerTagText}>Order Remark</Text>
                        </View>
                        <View style={styles.CustomerItemWrap}>
                            <Text style={styles.CustomerValueText}>---</Text>
                        </View>
                    </View> */}

                    <View style={styles.CustomerSection}>
                        <View style={styles.CustomerItemWrap}>
                            <Text style={styles.CustomerTagText}>ItemList</Text>
                        </View>
                    </View>

                   

                    <ScrollView nestedScrollEnabled={true} style={styles.InnerScroll}>

                        <View style={styles.InnerView}>
                            {
                                itemList && itemList.map((item, index) => (
                                    <View style={styles.loopCont}>
                                        <View style={styles.indexCont}>
                                            <Text style={styles.indexText}>{index + 1}.</Text>
                                        </View>
                                        <View key={index} style={styles.SelectedItemCont}>
                                            <View style={styles.itemDescToTHead}>
                                                <Text style={styles.DescText}>{item.idesc}</Text>
                                                <Text style={styles.TotalText}>{item.line_total}</Text>
                                            </View>
                                            <View style={styles.DescCont}>
                                                <Text style={styles.DescSubText}>Item Code :</Text>
                                                <Text style={styles.DescSubTextValue}>{item.so_icode}</Text>
                                            </View>
                                            <View style={styles.DescCont}>
                                                <Text style={styles.DescSubText}>Unit Price :</Text>
                                                <Text style={styles.DescSubTextValue}>{item.so_cost}</Text>
                                            </View>
                                            <View style={styles.DescCont}>
                                                <Text style={styles.DescSubText}>Quantity :</Text>
                                                <Text style={styles.DescSubTextValue}>{item.tr_qty2}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            }

                        </View>
                    </ScrollView>

                    <View style={styles.SubTotalCont}>
                        <Text style={styles.CustomerValueText}>Subtotal</Text>
                        <Text style={styles.CustomerValueText}>{subTotal && (subTotal).toFixed(2)}</Text>
                    </View>

                    <View style={styles.TaxBox}>
                        <View style={styles.TaxCont}>
                            <Text style={styles.CustomerValueText}>VAT% :</Text>
                            <Text style={styles.CustomerValueText}>5%</Text>
                        </View>
                        <View style={styles.TaxCont}>
                            <Text style={styles.CustomerValueText}>VAT :</Text>
                            <Text style={styles.CustomerValueText}>{subTotal && (subTotal * 0.05).toFixed(2)}</Text>
                        </View>
                        <View style={styles.TaxCont}>
                            <Text style={styles.CustomerValueText}>Amount Incl.VAT</Text>
                            <Text style={styles.CustomerValueText}>{itemList[0].so_amount}</Text>
                        </View>
                    </View>
                </ScrollView>
            }

            {
                (!data || !itemList) && !loading &&
                <View style={styles.OrderDetailsWrap}>
                    <Text style={styles.ErrorText}>No data available</Text>
                </View>
            }


            {
                showChangeStatusPop &&
                <ChangeStatusPop setShowChangeStatus={setShowChangeStatus} orderId={orderId} salesMan={salesMan} />
            }

            {/* {
                showPdf &&
                // <ViewPdfPop setShowPdf={setShowPdf} data={data} itemList={itemList} />
                // <PdfPopTest />
            } */}
        </View>
    )
}

const styles = StyleSheet.create({
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
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
    SettingsWrap: {
        backgroundColor: '#189A2E',
        backgroundColor: 'red',
        borderRadius: 50,
        padding: 6
    },
    HeadIcon: {
        width: 25,
        height: 25
    },
    CustomerSection: {
        flexDirection: 'column',
        paddingVertical: 10,
        paddingHorizontal: 8
    },
    CustomerItemWrap: {
        paddingVertical: 2
    },
    AdressWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 2
    },
    CustomerTagText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    CustomerValueText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },
    InnerScroll: {
        minHeight: 'auto',
        maxHeight: 400,
        borderBottomWidth: 1,
        borderBottomColor: 'grey'
    },
    InnerView: {
        paddingHorizontal: 12,
        marginBottom: 8
    },
    totalTag: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#5A55CA',
        // padding: 2,
        borderRadius: 50,
        width: 40,
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemCountText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Lexend-Bold',
    },
    SubTotalCont: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
        paddingHorizontal: 8
    },
    TaxBox: {
        width: '100%',
        flexDirection: 'column',
        marginVertical: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#e9ecef'

    },
    TaxBox2: {
        width: '100%',
        flexDirection: 'column',
        marginVertical: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#dee2e6'

    },
    TaxCont: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2
    },

    // 
    HomeWrap: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#5A55CA'
    },
    HomeCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: '#F0F4FD',
        // height: Dimensions.get('window').height - 70

    },

    SelectedItemCont: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        marginVertical: 6
    },
    DescText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },
    DescCont: {
        flexDirection: 'row',
        marginVertical: 2
    },
    DescSubText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    DescSubTextValue: {
        color: 'blue',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        marginLeft: 8
    },
    UpdateWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 6
    },
    EditButton: {
        backgroundColor: 'green',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 4,
        // marginRight: 6
        marginLeft: 35
    },
    EditText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    DeleteButton: {
        backgroundColor: 'red',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 6
    },
    DeleteText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    OrderDetailsWrap: {
        width: '100%',
        flexDirection: 'column',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 12,
        height: Dimensions.get('window').height - 100
    },
    TopButtonsWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8
    },
    ChngStatusOrderButton: {
        backgroundColor: 'red',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 4
    },
    ViewPdfButton: {
        backgroundColor: 'green',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 4
    },
    TopButtonText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },
    CustomerOrderCont: {
        flexDirection: 'column'
    },
    CustomerOrderText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    CustomerOrderValue: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 24
    },
    ErrorText: {
        color: 'red',
        fontSize: 18,
        fontFamily: 'Lexend-Bold',
    },

    InnerScroll: {
        minHeight: 'auto',
        maxHeight: 400,
        borderBottomWidth: 1,
        borderBottomColor: 'grey'
    },
    InnerView: {
        paddingHorizontal: 12,
        marginBottom: 8
    },

    loopCont: {
        flexDirection: 'row',
        // justifyContent: 'space-between'
    },
    indexCont: {
        width: '5%',
        paddingTop: 18
    },
    indexText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },
    itemDescToTHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '98%',
        // marginRight: 8
    },
    TotalText: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginBottom: 8,
        // width: '20%'
    },
    UpdateIcons: {
        width: 25,
        height: 25
    },

    SelectedItemCont: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 8,
        // borderWidth: 1,
        // borderColor: '#dbdbdb',
        // borderRadius: 6,
        marginVertical: 6
    },
    DescText: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginBottom: 8,
        width: '75%'
    },
    DescCont: {
        flexDirection: 'row',
        marginVertical: 2
    },
    DescSubText: {
        color: '#aaa',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },
    DescSubTextValue: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginLeft: 8
    },


    TotalValueTexts: {
        color: '#1A6CF6',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        marginLeft: 8
    },





})

export default OrderDetails