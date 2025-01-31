import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, ScrollViewComponent, Image } from 'react-native'
import React from 'react'
import PopHeads from '../pages/PopHeads'
import formatPrice3Decimal from '../utils'

const SelectedStockPop = ({
    savedItemData,
    setShowSelectedStockPop,
    showSelectedStockPop,
    handleRemoveItem,
    EditItem,
    setShowQuotationPop,

    page,
    cmpcode

}) => {

    console.log('cmpcode', cmpcode)
    console.log('savedItemData', savedItemData)
    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

                <View style={styles.HomeWrap}>
                    <PopHeads setShowSelectedStockPop={setShowSelectedStockPop} showSelectedStockPop={showSelectedStockPop} setShowQuotationPop={setShowQuotationPop} page={page} />

                    <View style={styles.HomeCont}>
                        <ScrollView style={{ paddingBottom: 24 }}>

                            <View>
                                <Text style={styles.CustHeadText}>Items</Text>
                            </View>

                            {
                                savedItemData && savedItemData.map((item, index) => (
                                    <>
                                        <View style={styles.loopCont}>
                                            <View style={styles.indexCont}>
                                                <Text style={styles.indexText}>{index + 1}.</Text>
                                            </View>
                                            <View key={index} style={styles.SelectedItemCont}>
                                                <View style={styles.itemDescToTHead}>
                                                    <Text style={styles.DescText}>{item.Description}</Text>
                                                    {
                                                        cmpcode === 'AUTOMAX' ?
                                                            <Text style={styles.TotalText}>{(item.unitPrice * item.quantity).toFixed(3)}</Text>
                                                            :
                                                            <Text style={styles.TotalText}>{(item.unitPrice * item.quantity).toFixed(2)}</Text>
                                                    }
                                                </View>
                                                <View style={styles.DescCont}>
                                                    <Text style={styles.DescSubText}>Item Code :</Text>
                                                    <Text style={styles.DescSubTextValue}>{item.Code}</Text>
                                                </View>
                                                <View style={styles.DescCont}>
                                                    <Text style={styles.DescSubText}>Unit Price :</Text>
                                                    {
                                                        cmpcode === 'AUTOMAX' ?
                                                            <Text style={styles.DescSubTextValue}>{formatPrice3Decimal(item.unitPrice)}</Text>
                                                            :
                                                            <Text style={styles.DescSubTextValue}>{(item.unitPrice)}</Text>
                                                    }

                                                </View>
                                                <View style={styles.DescCont}>
                                                    <Text style={styles.DescSubText}>Quantity :</Text>
                                                    {
                                                        cmpcode === 'AUTOMAX' ?
                                                            <Text style={styles.DescSubTextValue}>{parseFloat(item.quantity).toFixed(0)}</Text>
                                                            :
                                                            <Text style={styles.DescSubTextValue}>{item.quantity}</Text>
                                                    }
                                                </View>

                                            </View>
                                        </View>
                                        <View style={styles.UpdateWrap}>

                                            <TouchableOpacity style={styles.EditButton} onPress={() => EditItem(item)}>
                                                <Image style={styles.UpdateIcons} source={require('../images/editPen.png')} />
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.DeleteButton} onPress={() => handleRemoveItem(item.Code)}>
                                                <Image style={styles.UpdateIcons} source={require('../images/deleteBin.png')} />
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ))
                            }

                            {
                                savedItemData.length === 0 &&
                                <View>
                                    <Text style={{
                                        color: 'red',
                                        fontSize: 16,
                                        fontFamily: 'Lexend-Bold',
                                    }}>No Item Selected</Text>
                                </View>
                            }

                        </ScrollView>
                    </View>

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
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
        width: '98%',
        minHeight: 300,
        maxHeight: Dimensions.get('window').height - 200,
        bottom: 25
    },

    HomeWrap: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5A55CA'
    },
    HomeCont: {
        width: '100%',
        flexDirection: 'column',
        // alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        // borderTopLeftRadius: 18,
        // borderTopRightRadius: 18,
        backgroundColor: 'white',
        // height: Dimensions.get('window').height - 70

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
        // marginVertical: 2
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
    UpdateWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        // width: '100%',
        // paddingVertical: 6
        // marginRight: 28,
        // position: 'absolute',
        // bottom: 0,
        // right: 0
    },
    EditButton: {
        backgroundColor: '#E5E5E5',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginRight: 6
    },
    EditText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    DeleteButton: {
        backgroundColor: '#F7CFCF',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginLeft: 16
    },
    DeleteText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },

    CustHeadText: {
        color: 'grey',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },

    loopCont: {
        flexDirection: 'row',
        // justifyContent: 'space-between'
    },
    indexCont: {
        width: '7%',
        paddingTop: 18
    },
    indexText: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },
    itemDescToTHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 8
    },
    TotalText: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginBottom: 8,
        // marginRight: 8
        // width: '20%'
    },
    UpdateIcons: {
        width: 25,
        height: 25
    }
})


export default SelectedStockPop