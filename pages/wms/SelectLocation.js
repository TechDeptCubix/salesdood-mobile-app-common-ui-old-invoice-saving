import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard, ScrollView, Dimensions, TextInput, FlatList, Image, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DropDownPicker from 'react-native-dropdown-picker'
import { base_url } from '../config/baseUrl'
import { fetchItemBinWiseData, fetchItemBinWiseDataFromQrCode, fetchLoadUnbinnedData, fetchLocation } from '../config/SelectLocationApiConfig'
import axios from 'axios'
import ItemListModal from '../components/ItemListModal'
import PushScanner from '../components/PushScanner'
import LogOutPop from '../popups/LogOutPop'
import SelectLocPushScanner from '../popups/SelectLocPushScanner'


const SelectLocation = () => {

    const navigation = useNavigation()
    // locationDropstate
    const [locationDropOpen, setLocationDropOpen] = useState(false)
    const [locationValue, setLocationValue] = useState(null)
    const [locationItems, setLocationItems] = useState(
        // [
        //     { label: 'LOC A', value: 'A' },
        //     { label: 'LOC B', value: 'B' },
        //     { label: 'LOC C', value: 'C' },
        //     { label: 'LOC D', value: 'D' },
        //     { label: 'LOC E', value: 'E' },
        //     { label: 'LOC F', value: 'F' },
        // ]
    )

    const [UnBinnedDropOpen, setUnBinnedDropOpen] = useState(false)
    const [UnBinnedValue, setUnBinnedValue] = useState(null)
    const [UnBinnedItems, setUnBinnedItems] = useState([
        { label: 'UNBINNED', value: 'UNBINNED' },
        // { label: 'UNBINNED2', value: 'UNBINNED2' },
    ])

    const [loadUnbinnedData, setLoadUnbinnedData] = useState()

    const [itemSearchText, setItemSearchText] = useState('')

    const [filteredItems, setFilteredItems] = useState()

    const [selectedItem, setSelectedItem] = useState('')

    const [itemBinWiseData, setItemBinWiseData] = useState('')

    const [unBinnedItemCounter, setUnBinnedItemCounter] = useState(0)

    const [modalVisible, setModalVisible] = useState(false);

    const [showQrScanner, setShowQrScanner] = useState(false)

    const [qrCodeText, setQrCodeText] = useState('')

    const [removeQtyFromCode, setRemoveQtyFromCode] = useState(null)

    const [showLogOutPop, setShowLogOutPop] = useState(false)

    const toggleSwitch = () => {
        setRemoveQtyFromCode(previousState => !previousState)
    }

    useEffect(() => {
        fetchLocation(setLocationItems)
    }, [])

    useEffect(() => {
        if (selectedItem && locationValue) {
            fetchItemBinWiseData(locationValue, selectedItem, setItemBinWiseData)
        }
    }, [selectedItem, locationValue])

    useEffect(() => {
        if (qrCodeText && locationValue && !removeQtyFromCode) {
            fetchItemBinWiseDataFromQrCode(locationValue, qrCodeText.data, setItemBinWiseData)
        }
    }, [qrCodeText, locationValue])

    useEffect(() => {
        if (qrCodeText && locationValue && removeQtyFromCode) {
            fetchItemBinWiseDataFromQrCode(locationValue, qrCodeText.itemCode, setItemBinWiseData)
        }
    }, [qrCodeText, locationValue])

    useEffect(() => {
        if (locationValue && UnBinnedValue) {
            console.log('CallingfetchLoadUnbinnedData')
            fetchLoadUnbinnedData(locationValue, UnBinnedValue, setLoadUnbinnedData)
        }
    }, [locationValue, UnBinnedValue])

    useEffect(() => {
        AsyncStorage.getItem('WMSSelectedLoc')
            .then(value => {
                if (value) {
                    setLocationValue(value);
                }
            })
            .catch(error => console.error("Error loading location:", error));
    }, []);

    useEffect(() => {
        AsyncStorage.getItem('WMSUnbinnedLoc')
            .then(value => {
                if (value) {
                    setUnBinnedValue(value);
                }
            })
            .catch(error => console.error("Error loading UnbinnedLoc:", error));
    }, []);

    useEffect(() => {
        if (locationValue) {
            console.log('Calling GetAsyncLocValue')
            AsyncStorage.setItem('WMSSelectedLoc', locationValue)
                .catch(error => console.error("Error saving location:", error));
        }
    }, [locationValue]);


    useEffect(() => {
        if (UnBinnedValue) {
            console.log('Calling GetAsynCUnbinnedLocValue')
            AsyncStorage.setItem('WMSUnbinnedLoc', UnBinnedValue)
                .catch(error => console.error("Error saving UnbinnedLoc:", error));
        }
    }, [UnBinnedValue]);


    useEffect(() => {
        if (removeQtyFromCode !== null) {
            console.log('settingRemoveCodeQty')
            AsyncStorage.setItem('WMSRemoveQtyFromCode', removeQtyFromCode.toString())
                .catch(error => console.error("Error saving WMSRemoveQtyFromCode:", error));
        }
    }, [removeQtyFromCode]);


    useEffect(() => {
        // Fetch the stored value on component mount
        const fetchAsyncRemoveCodeQty = async () => {
            try {
                const storedValue = await AsyncStorage.getItem('WMSRemoveQtyFromCode');
                if (storedValue !== null) {
                    console.log('storedValue:', storedValue);
                    setRemoveQtyFromCode(storedValue === "true"); // Convert string to boolean
                } else {
                    setRemoveQtyFromCode(false); // Default if no value stored
                }
            } catch (error) {
                console.error("Error retrieving WMSRemoveQtyFromCode:", error);
            }
        };

        fetchAsyncRemoveCodeQty();
    }, []);


    useEffect(() => {

        if (itemSearchText.length > 0 && (!loadUnbinnedData || loadUnbinnedData.length === 0)) {
            Alert.alert(
                'Warning',
                'Please choose an Unbinned Loc First',
                [
                    {
                        text: 'OK',
                        onPress: () => setItemSearchText('') // Clears the search text
                    }
                ]
            );
            return;  // Prevent further execution
        }


        if (loadUnbinnedData && itemSearchText.length > 1 && loadUnbinnedData.length > 0) {

            const filteredItems = loadUnbinnedData?.filter(item =>
                item.Description.toLowerCase().includes(itemSearchText.toLowerCase()) ||
                item.Code.toLowerCase().includes(itemSearchText.toLowerCase())
            );

            setFilteredItems(filteredItems)
        }


    }, [itemSearchText])


    useEffect(() => {
        if (loadUnbinnedData && loadUnbinnedData.length > 0) {
            setUnBinnedItemCounter(loadUnbinnedData.length)
        } else {
            setUnBinnedItemCounter(0)
        }
    }, [loadUnbinnedData])

    const renderItemBinWiseData = ({ item }) => (
        <View style={styles.BinWiselistItem}>
            <Text style={styles.BinWiseitemText}>{item.Bin}</Text>
            <Text style={styles.BinWiseitemText}>{item.Qty}</Text>
        </View>
    );

    const logout = async () => {
        try {
            // Remove user data from AsyncStorage
            await AsyncStorage.removeItem("WMSUserDataArray");

            // Navigate to the Login screen
            navigation.navigate("LoginPage");  // Ensure "Login" matches your screen name
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // console.log('locationValue', locationValue)

    // console.log('loadUnbinnedData', loadUnbinnedData && loadUnbinnedData[0])

    // console.log('locationItems', locationItems)

    // console.log('selectedItem', selectedItem)

    console.log('qrCodeText', qrCodeText)

    console.log('removeQtyFromCode', removeQtyFromCode)

    // console.log('UnBinnedValue', UnBinnedValue)

    console.log('filteredItems', filteredItems && filteredItems)

    return (
        <>

            {
                !showQrScanner &&
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}
                >
                    <>
                        <ScrollView style={styles.WmsHomeWrap} keyboardShouldPersistTaps="handled">

                            <View style={styles.WmsHead}>
                                <Text style={styles.WmsHeadText}>PUTAWAY</Text>


                                <TouchableOpacity
                                    onPress={() => setShowLogOutPop(true)}
                                    style={[
                                        styles.ListImgWrap, {
                                            // position: 'relative'
                                        }
                                    ]}>
                                    <Image style={styles.ListImg} source={require('../images/logOutWms.png')} />

                                </TouchableOpacity>


                                <TouchableOpacity
                                    onPress={() => {
                                        if (loadUnbinnedData?.length > 0) {
                                            setModalVisible(true)
                                        }
                                    }}
                                    style={[styles.ListImgWrap, {
                                        position: 'relative'
                                    }]}>
                                    <Image style={styles.ListImg} source={require('../images/BinItemList.png')} />


                                    <View style={styles.UnbinnedItemCounter}>
                                        <Text style={styles.UnbinnedItemCounterText}>{unBinnedItemCounter}</Text>
                                    </View>

                                </TouchableOpacity>
                            </View>


                            <View style={styles.LocUnBinCont}>

                                <View style={styles.LocationDropCont}>
                                    <DropDownPicker
                                        open={locationDropOpen}
                                        value={locationValue && locationValue}
                                        items={locationItems && locationItems}
                                        setOpen={setLocationDropOpen}
                                        setValue={setLocationValue}
                                        setItems={setLocationItems}
                                        placeholder={'Location'}
                                    />
                                </View>

                                <View style={styles.LocationDropCont}>
                                    <DropDownPicker
                                        open={UnBinnedDropOpen}
                                        value={UnBinnedValue && UnBinnedValue}
                                        items={UnBinnedItems && UnBinnedItems}
                                        setOpen={setUnBinnedDropOpen}
                                        setValue={setUnBinnedValue}
                                        setItems={setUnBinnedItems}
                                        placeholder={'UnBinned Loc'}
                                    />
                                </View>

                            </View>

                            {
                                locationValue && UnBinnedValue && loadUnbinnedData && loadUnbinnedData.length > 0 &&

                                <>

                                    <View style={styles.NextButtonWrap}>
                                        <TouchableOpacity style={styles.NextButton} onPress={() => navigation.navigate('WmsHome')}>
                                            <Text style={styles.ButtonText}>Next</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {
                                        removeQtyFromCode !== '' &&

                                        <View style={styles.SwitchCont}>
                                            <Text style={styles.SwitchLabel}>
                                                SKU-Qty Pair Scan
                                            </Text>
                                            <Switch
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={removeQtyFromCode ? 'green' : 'white'}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={toggleSwitch}
                                                value={removeQtyFromCode}
                                            />
                                        </View>
                                    }



                                    {
                                        loadUnbinnedData && loadUnbinnedData.length > 0 &&

                                        <>
                                            <View>

                                                <View style={styles.SearchCont}>

                                                    <View style={[styles.inputContainer, {
                                                        // width: '70%',
                                                        marginBottom: 0
                                                    }]}>
                                                        <TextInput
                                                            style={styles.input}
                                                            value={itemSearchText}
                                                            onChangeText={text => setItemSearchText(text)}
                                                            placeholder="Search Item"
                                                            placeholderTextColor="grey"
                                                        />
                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => setShowQrScanner(true)}
                                                        // onPress={() => navigation.navigate('QrScanner')}
                                                        style={[styles.ListImgWrapQr]}
                                                    >
                                                        <Image style={styles.ListImg} source={require('../images/BinQrScan.png')} />
                                                    </TouchableOpacity>


                                                </View>

                                                <View>
                                                    <Text style={styles.itemText}>{selectedItem?.Description}</Text>
                                                </View>


                                                {
                                                    removeQtyFromCode ?
                                                        <View>
                                                            <Text style={styles.itemText}>Code: {qrCodeText?.itemCode}</Text>
                                                        </View>
                                                        :
                                                        <View>
                                                            <Text style={styles.itemText}>Code: {qrCodeText?.data}</Text>
                                                        </View>
                                                }

                                                {/* Filtered List */}

                                                {itemSearchText.length > 0 && (
                                                    <View style={styles.listContainer}>

                                                        {filteredItems?.length === 0 ? (
                                                            <View style={styles.noDataContainer}>
                                                                <Text style={styles.noDataText}>No Data</Text>
                                                            </View>
                                                        ) : (
                                                            <FlatList
                                                                data={filteredItems}
                                                                keyExtractor={(item) => item.Code}
                                                                renderItem={({ item }) => (

                                                                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                                                        <TouchableOpacity
                                                                            style={styles.listItem}
                                                                            onPress={() => {
                                                                                Keyboard.dismiss()
                                                                                setSelectedItem(item)
                                                                                // setSelectedUnbinnedItem({
                                                                                //     selectedCode: item.Code,
                                                                                // })
                                                                                // setBinItemRemainingQty(item.qty.toString())
                                                                                setItemSearchText('')
                                                                            }}
                                                                        >
                                                                            <Text style={styles.itemText}>{item.Description}</Text>

                                                                            <View style={{
                                                                                display: 'flex',
                                                                                flexDirection: 'row',
                                                                                justifyContent: 'space-between'
                                                                            }}>
                                                                                <Text style={styles.itemQty}>Code: {item.Code}</Text>
                                                                                <Text style={styles.itemQty}>Qty: {item.Qty}</Text>
                                                                            </View>

                                                                            {/* <Text style={styles.itemQty}>Qty: {item.Qty}</Text> */}
                                                                        </TouchableOpacity>
                                                                    </TouchableWithoutFeedback>
                                                                )}
                                                                nestedScrollEnabled={true}
                                                                keyboardShouldPersistTaps="handled"
                                                            />
                                                        )}

                                                    </View>
                                                )}

                                            </View>


                                            {
                                                itemBinWiseData &&
                                                <View>
                                                    {/* Table Header */}
                                                    <View style={styles.tableHeader}>
                                                        <Text style={styles.headerText}>Bin</Text>
                                                        <Text style={styles.headerText}>Qty</Text>
                                                    </View>

                                                    {/* Scrollable FlatList */}
                                                    <FlatList
                                                        data={itemBinWiseData?.filter(item => Number(item.Qty) > 0)} // Filter items where Qty is a valid number > 0
                                                        keyExtractor={(item, index) => index.toString()}
                                                        renderItem={renderItemBinWiseData}
                                                        style={styles.scrollContainer}
                                                    />
                                                </View>
                                            }


                                        </>
                                    }


                                </>
                            }


                            {
                                locationValue && UnBinnedValue && loadUnbinnedData && loadUnbinnedData.length === 0 &&

                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>No Unbinned Items on this Location</Text>
                                </View>
                            }




                        </ScrollView>

                        <View style={styles.NextButtonWrap}>
                            <TouchableOpacity style={[styles.NextButton, { width: 150 }]} onPress={() => navigation.navigate('PickingList')}>
                                <Text style={styles.ButtonText}>Picking List</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.NextButton, { width: 150 }]} onPress={() => navigation.navigate('BinToBin')}>
                                <Text style={styles.ButtonText}>Bin To Bin</Text>
                            </TouchableOpacity>
                        </View>

                    </>
                </TouchableWithoutFeedback>

            }

            {
                modalVisible &&

                <ItemListModal modalVisible={modalVisible} setModalVisible={setModalVisible} selectedUnBinnedItemList={loadUnbinnedData} />
            }


            {
                showQrScanner &&

                <SelectLocPushScanner setShowQrScanner={setShowQrScanner} setQrCodeText={setQrCodeText} removeQtyFromCode={removeQtyFromCode} />

            }

            {
                showLogOutPop &&
                <LogOutPop setShowLogOutPop={setShowLogOutPop} showLogOutPop={showLogOutPop} logout={logout} />
            }
        </>
    )
}

const styles = StyleSheet.create({
    WmsHomeWrap: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: Dimensions.get('window').height - 50,
        padding: 12
    },

    WmsHead: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
        marginBottom: 24
    },

    WmsHeadText: {
        fontSize: 16,
        color: 'black',
        fontFamily: 'Lexend-Regular'
    },

    LocUnBinCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginBottom: 10
        // alignItems: 'center',
    },

    LocationDropCont: {
        width: '48%',
    },

    NextButtonWrap: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: "center",
        marginVertical: 12,

        gap: 25
    },


    NextButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'green',
        width: 100
    },

    ButtonText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 15,
        color: 'white',
        textAlign: 'center'
    },

    MainWmsForm: {
        width: '100%',
        display: "flex",
        flexDirection: 'column',
        marginVertical: 10
    },

    SearchCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10
    },

    inputContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#BDBDBD',
        borderColor: 'black',
        borderRadius: 12,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },

    input: {
        backgroundColor: 'white',
        paddingLeft: 10,
        borderBottomWidth: 1,
        borderColor: 'white',
        // marginBottom: 12, marginTop: 12,
        borderRadius: 12,
        color: '#2b2b2b',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        width: '100%'
    },

    listContainer: {
        height: 200, // Fixed height for scrollable list
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: 'white',
        padding: 5
    },
    listItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    itemText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular'
    },
    itemQty: {
        fontSize: 14,
        color: 'grey',
        fontFamily: 'Lexend-Regular'
    },

    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 100, // Adjust based on your layout
    },
    noDataText: {
        fontSize: 16,
        color: 'gray',
        fontFamily: 'Lexend-Regular'
    },

    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#ddd',
        paddingVertical: 8,
        paddingHorizontal: 10,
        width: '100%',
    },
    headerText: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        flex: 1,
        textAlign: 'center',
    },
    scrollContainer: {
        height: 300, // Scrollable content inside fixed height
        width: '100%',
    },
    BinWiselistItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    BinWiseitemText: {
        fontSize: 12,
        fontFamily: 'Lexend-Regular',
        flex: 1,
        textAlign: 'center',
    },

    UnbinnedItemCounter: {
        position: 'absolute',
        top: -20,
        right: 0,

        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        padding: 8,
        width: 50,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#4608ad'
    },

    UnbinnedItemCounterText: {
        color: 'white',
        fontFamily: 'Lexend-Regular',
        fontSize: 10
    },

    ListImgWrap: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        borderColor: 'black',
        borderWidth: 0.5,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },

    ListImgWrapQr: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 12,
        borderColor: 'black',
        borderWidth: 0.5,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 1
    },

    ListImg: {
        width: 25,
        height: 25
    },

    SwitchCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        width: '100%'
    },

    SwitchLabel: {
        fontSize: 15,
        fontFamily: 'Lexend-Regular',
        color: 'black'
    },


})

export default SelectLocation