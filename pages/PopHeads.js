import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';


const PopHeads = ({ setShowSelectedStockPop, showSelectedStockPop, setShowQuotationPop, page }) => {

    const navigation = useNavigation()

    return (
        <View style={styles.HeadWrap}>

            <TouchableOpacity style={styles.HomeWrap} onPress={() => setShowSelectedStockPop(!showSelectedStockPop)}>
                <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                <Text style={styles.Text}>
                    Cart
                </Text>
            </TouchableOpacity>

            <View>
                <TouchableOpacity style={styles.SettingsWrap} onPress={() => setShowQuotationPop(true)}>
                    {
                        page === 'SALESINV' ?
                            <Text style={styles.ShowQuotText}>Invoice</Text>
                            :
                            <Text style={styles.ShowQuotText}>Order</Text>

                    }
                    <Image style={styles.HeadIcon} source={require('../images/rghArr.png')} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    HeadWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#DCDBDB',
        paddingHorizontal: 12,
        paddingVertical: 16,
        height: 80
        // borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
    },
    HeadIcon: {
        width: 25,
        height: 25
    },
    HomeWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    Text: {
        color: '#1A6CF6',
        marginLeft: 8,
        fontSize: 18,
        fontFamily: 'Lexend-Regular',
    },
    SettingsWrap: {
        backgroundColor: '#1A6CF6',
        borderRadius: 18,
        padding: 6,
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row'
    },
    ShowQuotText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    }
})


export default PopHeads