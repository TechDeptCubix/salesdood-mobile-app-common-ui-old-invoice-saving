import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, ScrollViewComponent, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import ChangeStatusPop from '../popups/ChangeStatusPop'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import EditItemPop from '../popups/EditItemPop'


const EditQuotation = ({ route }) => {
    const { orderId } = route.params
    const navigation = useNavigation()

    const [showChangeStatusPop, setShowChangeStatus] = useState(false)
    const [data, setData] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);
    const [itemList, setItemList] = useState(null)

    const [showEditPop, setShowEditPop] = useState(false)
    const [editItemData, setEditItemData] = useState(null)

    const fetchPreviousOrders = async () => {
        try {
            const response = await axios.get('https://cubixweberp.com:208/api/Sales_Order/automax/Salesall/ALL');
            const allOrders = response.data.data;
            const filteredOrder = allOrders.filter(order => order.so_no === orderId);
            setData(filteredOrder);
        } catch (error) {
            console.log('fetchPreviousOrdersError', error);
            setError(error);
        }
    };

    const fetchItemList = async () => {
        try {
            const response = await axios.get(`http://tanoof.dyndns.org:92/api/Sales_Order/salesall/details/${orderId}`);
            setItemList(response.data);
        } catch (error) {
            console.log('fetchItemListError', error)
            setError(error);
        }
    };

    const subTotal = itemList && itemList.reduce((sum, item) => sum + (item.line_total || 0), 0)

    console.log('subTotal', subTotal)

    const EditItem = (item) => {
        setShowEditPop(true)
        setEditItemData(item)
    }

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

        fetchData();
    }, []);

    // console.log('filteredData', data)
    // console.log('orderId', orderId)
    // console.log('filDATA', data)
    // console.log('itemList', itemList)

    console.log('editItemData', editItemData)

    return (
        <View style={styles.HomeWrap}>
            <Header />

            <TouchableOpacity style={styles.HomeCont} onPress={() => navigation.navigate('PreviousOrders')}>
                <View>
                    <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                </View>
                <View style={styles.HomeTextCont}>
                    <Text style={styles.HomeText}>Edit Quotation</Text>
                </View>
            </TouchableOpacity>

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
                data && itemList && data.length > 0 && itemList.length > 0 &&
                <ScrollView style={styles.OrderDetailsWrap}>

                    {/* <View style={styles.TopButtonsWrap}>
                        <TouchableOpacity style={styles.ChngStatusOrderButton} onPress={() => setShowChangeStatus(!showChangeStatusPop)}>
                            <Text style={styles.TopButtonText}>Change status of Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.ViewPdfButton}>
                            <Text style={styles.TopButtonText}>View PDF</Text>
                        </TouchableOpacity>
                    </View> */}

                    <View style={styles.TopButtonsWrap}>
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
                    </View>

                    <View style={styles.CustomerSection}>
                        <View style={styles.CustomerItemWrap}>
                            <Text style={styles.CustomerTagText}>ItemList</Text>
                        </View>
                    </View>

                    <ScrollView nestedScrollEnabled={true} style={styles.InnerScroll}>

                        <View style={styles.InnerView}>

                            {
                                itemList && itemList.map((item, index) => (
                                    <View style={styles.SelectedItemCont} key={index}>
                                        {/* <View style={styles.totalTag}>
                                            <Text style={styles.itemCountText}>
                                                {item.line_total}
                                            </Text>
                                        </View> */}
                                        <Text style={styles.DescText}>{item.idesc}</Text>
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

                                        <View style={styles.UpdateWrap}>
                                            <TouchableOpacity style={styles.EditButton} onPress={() => EditItem(item)}>
                                                <Text style={styles.EditText}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.DeleteButton} onPress={() => handleRemoveItem(item.Code)}>
                                                <Text style={styles.DeleteText}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            }

                        </View>
                    </ScrollView>


                </ScrollView>
            }


            {
                showEditPop &&
                <EditItemPop editItemData={editItemData} setShowEditPop={setShowEditPop} />
            }
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
        fontFamily: 'InriaSans-Bold'
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
        fontFamily: 'InriaSans-Regular',
    },
    CustomerValueText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'InriaSans-Bold',
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
        fontFamily: 'InriaSans-Bold',
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
        backgroundColor: '#5A55CA'
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
        fontFamily: 'InriaSans-Bold',
    },
    DescCont: {
        flexDirection: 'row',
        marginVertical: 2
    },
    DescSubText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
    },
    DescSubTextValue: {
        color: 'blue',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
        marginLeft: 8
    },
    UpdateWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 6,
        width: '100%'
    },
    EditButton: {
        backgroundColor: 'green',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 6
        // marginLeft: 35
    },
    EditText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
    },
    DeleteButton: {
        backgroundColor: 'red',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        // marginRight: 6
        marginLeft: 20
    },
    DeleteText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
    },
    OrderDetailsWrap: {
        width: '100%',
        flexDirection: 'column',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 12,
        height: Dimensions.get('window').height - 150
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
        fontFamily: 'InriaSans-Regular',
    },
    CustomerOrderCont: {
        flexDirection: 'column'
    },
    CustomerOrderText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
    },
    CustomerOrderValue: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'InriaSans-Bold',
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },


})

export default EditQuotation