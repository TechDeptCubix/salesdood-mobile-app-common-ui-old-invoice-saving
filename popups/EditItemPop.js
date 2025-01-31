import { View, Text, StyleSheet, Dimensions, TextInput, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import REACT_APP_BASE_URL from '../url/AppUrl'


const EditItemPop = ({ editItemData, setShowEditPop }) => {

    const itemSearhUrl = `${REACT_APP_BASE_URL}Search_Items/Sitem/`

    const [description, setDescription] = useState(editItemData.idesc)
    const [unitPrice, setUnitPrice] = useState(editItemData.so_cost)
    const [quantity, setQuantity] = useState(editItemData.tr_qty2)

    const [searchItem, setSearchItem] = useState('')

    const [stockData, setStockData] = useState(null)

    const [selectedStock, setSelectedStock] = useState(null)


    const searchStock = async (value) => {
        try {
            await axios.get(`${itemSearhUrl}${value}`)
                .then((res) => {
                    setStockData(res.data.result)
                })
        } catch (error) {
            console.log('searchStockError', error)
        }
    }

    useEffect(() => {
        if (searchItem !== '') {
            searchStock(searchItem)
            // setSelectedStock(null)
            setSearchItem(searchItem)
        }
        if (searchItem == '') {
            setStockData(null)
            // setSelectedStock(null)
        }
    }, [searchItem])

    useEffect(() => {
        if (selectedStock) {
            setSearchItem('')
            setDescription(selectedStock.Description)
        }
    }, [selectedStock])

    const editOrder = async () => {
        console.log(first)
    }


    // console.log('editItemDataFromPop', editItemData)
    // console.log('unitPrice', unitPrice)
    // console.log('quantity', quantity)
    console.log('selectedStock', selectedStock)

    console.log('stockData', stockData)

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

                <View style={styles.HomeTextCont}>
                    <Text style={styles.HomeText}>Edit Item</Text>
                </View>

                <View style={styles.ItemDescWrap}>
                    <Text style={styles.ItemDescText}>{description && description}</Text>
                </View>

                <View>
                    <View style={styles.InputCont}>
                        <TextInput
                            style={styles.TextInput}
                            placeholder='Change Item'
                            value={searchItem}
                            onChangeText={text => setSearchItem(text)}
                            placeholderTextColor="#aaa"
                        />
                    </View>
                </View>

                {
                    stockData && !selectedStock &&
                    <View style={styles.StockTableContainer}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.StockheaderCell, {
                                borderTopLeftRadius: 4
                            }]}>Code</Text>
                            <Text style={[styles.StockheaderCell, {
                                borderTopRightRadius: 4
                            }]}>Description</Text>
                        </View>

                        <ScrollView style={styles.ScrollView} nestedScrollEnabled={true}>
                            {
                                stockData && stockData.length > 0 && stockData.map((item, index) => (
                                    <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedStock(item)}>
                                        <Text style={styles.StockdataCell}>{item.Code}</Text>
                                        <Text style={styles.StockdataCell}>{item.Description}</Text>
                                    </TouchableOpacity>

                                ))
                            }
                        </ScrollView>

                        {
                            stockData === null &&

                            <ActivityIndicator />
                        }

                        {
                            stockData && stockData.length === 0 &&
                            <View>
                                <Text style={{
                                    color: 'red'
                                }}>No data available</Text>
                            </View>
                        }

                    </View>
                }


                <View style={styles.StockItemQtyPriceWrap}>

                    <View style={styles.StockInputCont}>
                        <Text style={styles.SelectHeadText}>Qty</Text>
                        <View style={styles.QtyPriceInpCont}>
                            <TextInput
                                style={styles.QtyPriceTextInp}
                                // placeholder='Qty'
                                // placeholderTextColor="#aaa"
                                onChangeText={text => setQuantity(text)}
                                value={quantity.toString()}
                            />
                        </View>
                    </View>

                    <View style={styles.StockInputCont}>
                        <Text style={styles.SelectHeadText}>Unit Price</Text>
                        <View style={styles.QtyPriceInpCont}>
                            <TextInput
                                style={styles.QtyPriceTextInp}
                                // placeholder='Unit price'
                                // placeholderTextColor="#aaa"
                                onChangeText={text => setUnitPrice(text)}
                                value={unitPrice.toString()}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.UpdateWrap}>
                    <TouchableOpacity style={styles.DeleteButton} onPress={() => setShowEditPop(false)}>
                        <Text style={styles.DeleteText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.EditButton} onPress={() => editOrder()}>
                        <Text style={styles.EditText}>Edit</Text>
                    </TouchableOpacity>
                </View>




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
        // backgroundColor: '#F7F7F7',
        // backgroundColor: '#5A55CA',
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 5,
        // alignItems: 'center',
        // width: '95%',
        // minHeight: 750,
        // maxHeight: Dimensions.get('window').height,

        height: 'auto'
    },
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
    ItemDescWrap: {
        paddingVertical: 12,
        paddingHorizontal: 6,
        marginVertical: 10
    },
    ItemDescText: {
        fontSize: 16,
        color: 'black',
        // marginTop: 6,
        // marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'InriaSans-Bold'
    },
    InputCont: {
        width: '100%',
        backgroundColor: 'white',
        // paddingVertical: 2,
        // paddingHorizontal: 8,
        // marginTop: 16,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    TextInput: {
        width: '100%',
        fontFamily: 'InriaSans-Bold'
    },

    StockItemQtyPriceWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 16
    },
    StockInputCont: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    SelectHeadText: {
        color: '#aaa',
        fontSize: 14,
        fontFamily: 'InriaSans-Bold',
    },
    QtyPriceInpCont: {
        // width: '80%',
        backgroundColor: 'white',
        // paddingVertical: 2,
        // paddingHorizontal: 8,
        // marginTop: 16,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    QtyPriceTextInp: {
        width: '60%',
        fontFamily: 'InriaSans-Bold'
    },
    StockTableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        width: '100%',
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    StockheaderCell: {
        // flex: 1,
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: '50%',
        color: 'white',
        fontFamily: 'InriaSans-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
    },
    StockdataCell: {
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: '50%',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'InriaSans-Regular'
    },
    ScrollView: {
        height: Dimensions.get('window').height - 300,
        marginBottom: 8
    },

    UpdateWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 6,
        marginTop: 30
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
        fontFamily: 'InriaSans-Regular',
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
        fontFamily: 'InriaSans-Regular',
    },
    ErrorText: {
        color: 'red',
        fontSize: 16,
        fontFamily: 'InriaSans-Bold',
    }




})

export default EditItemPop