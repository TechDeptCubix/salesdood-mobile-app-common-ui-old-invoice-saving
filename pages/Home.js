import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import Header from './Header'
import { useNavigation } from '@react-navigation/native'
import HomeHead from './HomeHead'


const Home = () => {

    const navigation = useNavigation()

    return (
        <ScrollView contentContainerStyle={styles.HomeWrap}>
            <HomeHead />

            <View style={styles.HomeCont}>

                {/* <View style={styles.HomeTextCont}>
                    <Text style={styles.HomeText}>Options</Text>
                </View> */}

                <View style={styles.HomeOptionCont}>

                    <TouchableOpacity style={styles.Options} onPress={() => navigation.navigate('CheckStock')}>
                        <View style={[styles.IconCont, { backgroundColor: '#eafced' }]}>
                            {/* <Image style={styles.OptionIcon} source={require('../images/LensIcon.png')} /> */}
                            <Image style={styles.OptionIcon} source={require('../images/checkStock.png')} />
                        </View>
                        <Text style={styles.OptionText}>Check Stock</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options} onPress={() => navigation.navigate('MakeOrder')}>
                        <View style={[styles.IconCont, { backgroundColor: '#fadede' }]}>
                            {/* <Image style={styles.OptionIcon} source={require('../images/PenIcon.png')} /> */}
                            <Image style={styles.OptionIcon} source={require('../images/mkOrder2.png')} />
                        </View>
                        <Text style={styles.OptionText}>Make Quotation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options} onPress={() => navigation.navigate('PreviousOrders')}>
                        <View style={[styles.IconCont, { backgroundColor: '#e3f9ff' }]}>
                            {/* <Image style={styles.OptionIcon} source={require('../images/ClipBoardIcon.png')} /> */}
                            <Image style={styles.OptionIcon} source={require('../images/prevOrder.png')} />
                        </View>
                        <Text style={styles.OptionText}>Previous Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options} onPress={() => navigation.navigate('CustomerDetails')}>
                        <View style={[styles.IconCont, { backgroundColor: '#fffdd6' }]}>
                            {/* <Image style={styles.OptionIcon} source={require('../images/BagIcon.png')} /> */}
                            <Image style={styles.OptionIcon} source={require('../images/custDet.png')} />
                        </View>
                        <Text style={styles.OptionText}>Customer Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options} onPress={() => navigation.navigate('PickingList')}>
                        <View style={[styles.IconCont, { backgroundColor: '#f3eeed' }]}>
                            {/* <Image style={styles.OptionIcon} source={require('../images/pickListIcon.png')} /> */}
                            <Image style={styles.OptionIcon} source={require('../images/pickList.png')} />
                        </View>
                        <Text style={styles.OptionText}>Picking List</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options} onPress={() => navigation.navigate('Collections')}>
                        <View style={[styles.IconCont, { backgroundColor: '#fff8de' }]}>
                            {/* <Image style={styles.OptionIcon} source={require('../images/collections.png')} /> */}
                            <Image style={styles.OptionIcon} source={require('../images/coins.png')} />
                        </View>
                        <Text style={styles.OptionText}>Collections</Text>
                    </TouchableOpacity>

                </View>
            </View>

        </ScrollView>
    )
}
// 
const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5A55CA'
    },
    HomeCont: {
        width: '98%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: '#F0F4FD',
        height: Dimensions.get('window').height - 300

    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    HomeText: {
        fontSize: 16,
        // fontWeight: 'bold',
        color: 'black',
        borderBottomColor: 'gold',
        borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Bold'
    },
    HomeOptionCont: {
        flexDirection: 'row',
        width: '100%',
        paddingTop: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
        position: 'absolute',
        top: -80
    },
    Options: {
        width: '45%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        backgroundColor: 'white',
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        height: 160,
        margin: 8
    },
    OptionIcon: {
        width: 40,
        height: 40
    },
    IconCont: {
        backgroundColor: '#EAEDF5',
        padding: 10,
        // borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 50,
        marginBottom: 8
    },
    OptionText: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Lexend-Bold',
        marginTop: 8
    }
})

export default Home