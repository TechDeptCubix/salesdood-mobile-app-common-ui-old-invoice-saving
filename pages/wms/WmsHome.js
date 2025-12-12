import { View, Text, StyleSheet, Dimensions, Switch, TextInput, TouchableOpacity, Image, ScrollView, FlatList, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { UnbinnedItems } from '../config/Dummy'
import ItemListModal from '../components/ItemListModal'
import QrCodeScanner from '../components/QrCodeScanner'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clearSelectedBinItemAndBinValue, fetchBinListData, fetchItemBinQty, fetchItemBinWiseData, fetchLoadUnbinnedData, loadBinValueFromStorage, loadStoredItemFromAsyncStorage } from '../config/WmsHomeApiConfig'
import SearchBinPop from '../components/SearchBinPop'
import PushScanner from '../components/PushScanner'
import ClearDataPop from '../popups/ClearDataPop'
import SaveDataPop from '../popups/SaveDataPop'
import axios from 'axios'
import { base_url } from '../config/baseUrl'
import BinPushScanner from '../popups/BinPushScanner'
import PutAwayItemScanner from '../popups/PutAwayItemScanner'
import { company_code } from '../config/companyCode';


const WmsHome = () => {

    const navigation = useNavigation()
    // locationDropstate
    const [locationDropOpen, setLocationDropOpen] = useState(false)
    const [locationValue, setLocationValue] = useState(null)
    const [locationItems, setLocationItems] = useState(
        // [
        //     { label: 'LOCA', value: 'LOCA' },
        //     { label: 'LOCB', value: 'LOCB' },
        //     { label: 'LOCC', value: 'LOCC' },
        //     { label: 'LOCD', value: 'LOCD' },
        //     { label: 'LOCE', value: 'LOCE' },
        //     { label: 'LOCF', value: 'LOCF' },
        // ]
    )
    // UNBINNEDDROP
    const [UnBinnedDropOpen, setUnBinnedDropOpen] = useState(false)
    const [UnBinnedValue, setUnBinnedValue] = useState(null)
    const [UnBinnedItems, setUnBinnedItems] = useState(
        // [
        //     { label: 'UNBINNED', value: 'UNBINNED' },
        // ]
    )

    // UnbinnedItemList
    const [selectedUnBinnedItemList, setSelectedUnBinnedItemList] = useState();

    const [filteredItems, setFilteredItems] = useState()

    const [itemSearchText, setItemSearchText] = useState('')

    const [unBinnedItemCounter, setUnBinnedItemCounter] = useState(0)


    // BinItemSearch
    const [binitemSearchText, setBinItemSearchText] = useState('')

    const [filteredBinItems, setFilteredBinItems] = useState()



    // bindrop
    const [BinDropOpen, setBinDropOpen] = useState(false)
    const [BinValue, setBinValue] = useState(null)
    const [BinItems, setBinItems] = useState(
        // [
        //     { label: 'BINA', value: 'BINA' },
        //     { label: 'BINB', value: 'BINB' },
        //     { label: 'BINC', value: 'BINC' },
        //     { label: 'BIND', value: 'BIND' },
        //     { label: 'BINE', value: 'BINE' },
        //     { label: 'BINF', value: 'BINF' },
        // ]
    )

    // SPLITQTY
    // const [splitQtyEnabled, setSplitQtyEnabled] = useState(false)
    // const toggleSwitch = () => setSplitQtyEnabled(previousState => !previousState);

    const [removeQtyFromCode, setRemoveQtyFromCode] = useState(null)



    // Code&&qTY

    const [selectedUnBinnedItem, setSelectedUnbinnedItem] = useState({
        selectedCode: '',
        Desc: '',
        selectedQty: ''
    })

    const [binItemRemainingQty, setBinItemRemainingQty] = useState(0)

    const [initialBinQty, setInitialBinQty] = useState(0);

    const [itemBinWiseData, setItemBinWiseData] = useState('')


    // const [selectedCode, setSelectedCode] = useState('')
    // const [selectedQty, setSelectedQty] = useState('')

    // modal
    const [modalVisible, setModalVisible] = useState(false);

    const [showBinPop, setShowBinPop] = useState(false)

    // qr
    const [showQrScanner, setShowQrScanner] = useState(false)
    const [qrCodeText, setQrCodeText] = useState('')

    const [qrCodeTextCopy, setQrCodeTextCopy] = useState('')


    const [showBinQrScanner, setShowBinQrScanner] = useState(false)
    const [qrCodeBinValue, setQrCodeBinValue] = useState('')


    const [showClearDataPop, setShowClearDataPop] = useState(false)

    const [showSaveDataPop, setShowSaveDataPop] = useState(false)

    const [saveApiLoader, setShowApiLoader] = useState(false)

    const [reverseCheck, setReverseCheck] = useState(false)

    const [toBinData, setToBinData] = useState('')

    const [loggedUser, setLoggedUser] = useState('')

    const handleToggle = () => {
        if (!toBinData || toBinData.Qty === 0) {
            Alert.alert('No Data to reverse on the Bin')
            return
        }
        setReverseCheck((prevState) => !prevState);

    };

    const loadUserDataArray = async () => {
        console.log('runningloadUserDataArray')
        try {
            const userDataArrayJSON = await AsyncStorage.getItem("WMSUserDataArray");
            if (userDataArrayJSON) {
                const parsedArray = JSON.parse(userDataArrayJSON);
                setLoggedUser(parsedArray && parsedArray[0]?.User.trim())
            } else {
                console.log("No data found in AsyncStorage.");
            }
        } catch (error) {
            console.error("Error loading userDataArray:", error);
        }
    };



    const handleSelectItem = async (item) => {
        Keyboard.dismiss();

        const selectedItem = {
            selectedCode: item.Code,
            Desc: item.Description,
            binItemRemainingQty: item.Qty.toString(),
            initialBinQty: item.Qty.toString()
        };

        try {
            await AsyncStorage.setItem('WMSselectedBinItem', JSON.stringify(selectedItem));
            console.log("Item saved to AsyncStorage:", selectedItem);
        } catch (error) {
            console.log("Error saving to AsyncStorage:", error);
        }

        setSelectedUnbinnedItem({
            selectedCode: item.Code,
            Desc: item.Description
        });
        setBinItemRemainingQty(item.Qty.toString());
        setInitialBinQty(item.Qty.toString());
        setItemSearchText('');
    };


    const handleSaveData = async () => {
        setShowApiLoader(true)
        try {

            const currentDate = new Date().toISOString().split('T')[0];

            const data = {
                "Mod": "PUTAWAY",
                "TrDate": currentDate,
                "Loc": locationValue,
                "User": loggedUser,
                "BinFrom": UnBinnedValue,
                "Doctype": "INV",
                "Docno": "123456",
                "BinItems": [
                    {
                        "Code": removeQtyFromCode ? qrCodeText.itemCode : selectedUnBinnedItem.selectedCode,
                        "Bin": BinValue,
                        "Qty": removeQtyFromCode
                            ? (reverseCheck ? -qrCodeTextCopy[0].quantity : qrCodeTextCopy[0].quantity)
                            : (reverseCheck ? -selectedUnBinnedItem.selectedQty : selectedUnBinnedItem.selectedQty)
                    }
                ]
            };


            // const data =
            // {
            //     "Mod": "PUTAWAY",
            //     "TrDate": currentDate,
            //     "Loc": locationValue,
            //     "User": loggedUser,
            //     "BinFrom": UnBinnedValue,
            //     "Doctype": "INV",
            //     "Docno": "123456",
            //     "BinItems": [
            //         {
            //             "Code": selectedUnBinnedItem.selectedCode,
            //             "Bin": BinValue,
            //             "Qty": reverseCheck ? -selectedUnBinnedItem.selectedQty : selectedUnBinnedItem.selectedQty
            //         }
            //     ]
            // }

            const postData = JSON.stringify(data);

            console.log('handleSaveData==>', postData)

            console.log(`handleSaveDataApi==> ${base_url}/api/BinTransfer?cmpcode=${company_code}`)

            const response = await axios.post(`${base_url}/api/BinTransfer?cmpcode=${company_code}`, postData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 && response.data?.result === 'Saved') {
                setShowApiLoader(false)
                setShowSaveDataPop(false)
                setReverseCheck(false)

                fetchLoadUnbinnedData(locationValue, UnBinnedValue, setSelectedUnBinnedItemList)

                handleReset()
                // fetchItemBinQty(locationValue, UnBinnedValue, selectedUnBinnedItem.selectedCode, setSelectedUnbinnedItem, setBinItemRemainingQty, setInitialBinQty, handleSelectItem)
                // fetchItemBinWiseData(locationValue, selectedUnBinnedItem.selectedCode, setItemBinWiseData)
                console.log('Data saved successfully:', response.data);
                Alert.alert('Data saved successfully')

            } else {
                setShowApiLoader(false)
                setShowSaveDataPop(false)
                Alert.alert('Some Error occured')
            }

        } catch (error) {
            setShowApiLoader(false)
            setShowSaveDataPop(false)
            console.log('handleSaveData Error:', error);
            Alert.alert('Some Error occured')

        }
    };


    const handleReset = () => {
        clearSelectedBinItemAndBinValue(setBinValue, setSelectedUnbinnedItem, setBinItemRemainingQty, setInitialBinQty);
        setShowClearDataPop(false)
        setItemBinWiseData('')
        setQrCodeText('')
        setQrCodeTextCopy('')
    };


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
        if (selectedUnBinnedItemList && selectedUnBinnedItemList.length > 0) {
            setUnBinnedItemCounter(selectedUnBinnedItemList.length)
        } else {
            setUnBinnedItemCounter(0)
        }
    }, [selectedUnBinnedItemList])

    useEffect(() => {
        AsyncStorage.getItem('WMSSelectedLoc')
            .then(value => {
                console.log("Retrieved WMSSelectedLoc:", value);
                if (value && value !== locationValue) {
                    console.log("Updating locationValue to:", value);
                    setLocationValue(value);
                }
            })
            .catch(error => console.error("Error loading location:", error));
    }, []);

    useEffect(() => {
        AsyncStorage.getItem('WMSUnbinnedLoc')
            .then(value => {
                console.log("Retrieved WMSUnbinnedLoc:", value);
                if (value && value !== UnBinnedValue) {
                    console.log("Updating unBinnedValue to:", value);
                    setUnBinnedValue(value);
                }
            })
            .catch(error => console.error("Error loading UnbinnedLoc:", error));
    }, []);


    useEffect(() => {
        if (locationValue) {
            console.log('Callling fetchBinListData')
            fetchBinListData(locationValue, setBinItems)
        }
    }, [locationValue])


    useEffect(() => {
        if (locationValue && UnBinnedValue) {
            fetchLoadUnbinnedData(locationValue, UnBinnedValue, setSelectedUnBinnedItemList)
        }
    }, [locationValue, UnBinnedValue])

    useEffect(() => {
        if (selectedUnBinnedItem && locationValue && selectedUnBinnedItem?.selectedCode) {
            fetchItemBinWiseData(locationValue, selectedUnBinnedItem?.selectedCode, setItemBinWiseData)
        }
    }, [selectedUnBinnedItem, locationValue])

    useEffect(() => {

        if (itemSearchText.length > 0 && (!selectedUnBinnedItemList || selectedUnBinnedItemList.length === 0)) {
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


        if (selectedUnBinnedItemList && itemSearchText.length > 1 && selectedUnBinnedItemList.length > 0) {

            const filteredItems = selectedUnBinnedItemList?.filter(item =>
                item.Description.toLowerCase().includes(itemSearchText.toLowerCase()) ||
                item.Code.toLowerCase().includes(itemSearchText.toLowerCase())
            );

            setFilteredItems(filteredItems)
        }


    }, [itemSearchText])


    useEffect(() => {
    
        console.log("binitemSearchText BinItems>> ",binitemSearchText,  BinItems)

        if (binitemSearchText.length > 0 && (!BinItems || BinItems.length === 0)) {
            Alert.alert(
                'Warning',
                'Please choose an Unbinned Loc First',
                [
                    {
                        text: 'OK',
                        onPress: () => setBinItemSearchText('') // Clears the search text
                    }
                ]
            );
            return;  // Prevent further execution
        }


        if (BinItems && binitemSearchText.length > 0 && BinItems.length > 0) {

            const filteredItems = BinItems?.filter(item =>
                item.label.toLowerCase().includes(binitemSearchText.toLowerCase())
            );

            setFilteredBinItems(filteredItems)
        }


    }, [binitemSearchText])


    useEffect(() => {
        if (itemBinWiseData && BinValue) {
            const toBinData = itemBinWiseData.find(bin => bin.Bin === BinValue);
            setToBinData(toBinData)
        }
    }, [itemBinWiseData, BinValue])

    useEffect(() => {
        if (reverseCheck && selectedUnBinnedItem.selectedQty) {
            if (toBinData.Qty < selectedUnBinnedItem.selectedQty) {
                Alert.alert('Exceeded reversing bin quantity')
                // setSelectedUnbinnedItem(prev => ({ ...prev, selectedQty: 0 }));
                return
            }
        }
    }, [reverseCheck, selectedUnBinnedItem.selectedQty])


    useEffect(() => {
        if (BinValue !== null) {
            const saveBinValueToStorage = async () => {
                try {
                    await AsyncStorage.setItem('WMSBinValue', JSON.stringify(BinValue));
                    console.log("WMSBinValue saved to AsyncStorage:", BinValue);
                } catch (error) {
                    console.log("Error saving WMSBinValue to AsyncStorage:", error);
                }
            };

            saveBinValueToStorage();
        }
    }, [BinValue]);

    useEffect(() => {
        if (qrCodeText && locationValue && UnBinnedValue && !removeQtyFromCode) {
            fetchItemBinQty(locationValue, UnBinnedValue, qrCodeText.data, setSelectedUnbinnedItem, setBinItemRemainingQty, setInitialBinQty, handleSelectItem)
        }
    }, [qrCodeText])

    useEffect(() => {
        if (qrCodeText && locationValue && UnBinnedValue && removeQtyFromCode) {
            fetchItemBinQty(locationValue, UnBinnedValue, qrCodeText.itemCode, setSelectedUnbinnedItem, setBinItemRemainingQty, setInitialBinQty, handleSelectItem)
        }
    }, [qrCodeText])


    // useEffect(() => {
    //     if (!qrCodeText) return;

    //     console.log("Processing Scanned Data:", qrCodeText);

    //     // If it's the first scan, set the initial item
    //     if (qrCodeTextCopy.length === 0) {
    //         setQrCodeTextCopy([qrCodeText]);
    //         return;
    //     }

    //     // Check if scanned item matches the first scanned item
    //     const existingItem = qrCodeTextCopy.find(item => item.itemCode === qrCodeText.itemCode);

    //     if (!existingItem) {
    //         Alert.alert("Item Code Mismatch"[{ text: "OK" }]);
    //         return;
    //     }

    //     // Update quantity if item already exists
    //     setQrCodeTextCopy(prev =>
    //         prev.map(item =>
    //             item.itemCode === qrCodeText.itemCode
    //                 ? { ...item, quantity: item.quantity + qrCodeText.quantity }
    //                 : item
    //         )
    //     );

    // }, [qrCodeText]);

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const storedQrText = await AsyncStorage.getItem('qrCodeText');
                const storedQrTextCopy = await AsyncStorage.getItem('qrCodeTextCopy');

                if (storedQrText) {
                    setQrCodeText(JSON.parse(storedQrText));
                }
                if (storedQrTextCopy) {
                    setQrCodeTextCopy(JSON.parse(storedQrTextCopy));
                }
            } catch (error) {
                console.error("Error loading data from AsyncStorage:", error);
            }
        };

        loadStoredData();
    }, []);

    // Update AsyncStorage whenever qrCodeTextCopy changes
    useEffect(() => {
        const saveData = async () => {
            try {
                await AsyncStorage.setItem('qrCodeText', JSON.stringify(qrCodeText));
                await AsyncStorage.setItem('qrCodeTextCopy', JSON.stringify(qrCodeTextCopy));
            } catch (error) {
                console.error("Error saving data to AsyncStorage:", error);
            }
        };

        if (qrCodeTextCopy.length > 0) {
            saveData();
        }
    }, [qrCodeTextCopy]);



    useEffect(() => {
        // Call the function from the config file to load the stored item
        loadStoredItemFromAsyncStorage(setSelectedUnbinnedItem, setBinItemRemainingQty, setInitialBinQty);
    }, []);

    useEffect(() => {
        loadBinValueFromStorage(setBinValue);  // Call the function from config
    }, []);

    useEffect(() => {
        loadUserDataArray()
    }, [])


    const renderItemBinWiseData = ({ item }) => (
        <View style={styles.BinWiselistItem}>
            <Text style={styles.BinWiseitemText}>{item.Bin}</Text>
            <Text style={styles.BinWiseitemText}>{item.Qty}</Text>
        </View>
    );


    // console.log('BinItems', BinItems && BinItems[0])

    // console.log('selectedUnBinnedItemList', selectedUnBinnedItemList && selectedUnBinnedItemList)
    // console.log('selectedCode', selectedCode)
    // console.log('selectedQty', selectedQty)

    // console.log('locationDropOpen', locationDropOpen)
    // console.log('UnBinnedDropOpen', UnBinnedDropOpen)

    // console.log('binItemRemainingQty', binItemRemainingQty)
    // console.log('initialBinQty', initialBinQty)

    // console.log('BinItems', BinItems)

    console.log('qrCodeText', qrCodeText)
    console.log('qrCodeTextCopy', qrCodeTextCopy)
    console.log('selectedUnBinnedItem', selectedUnBinnedItem)

    console.log('itemBinWiseData', itemBinWiseData)

    // console.log('itemBinWiseData', itemBinWiseData)

    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
        >
            <>

                {
                    !showQrScanner &&
                    <>
                        <ScrollView style={styles.WmsHomeWrap} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>

                            <View style={styles.WmsHead}>

                                <Text style={styles.WmsHeadText}>PUTAWAY</Text>

                                <TouchableOpacity
                                    onPress={() => {
                                        if (selectedUnBinnedItemList?.length > 0) {
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

                                    <Text style={styles.LocLabelsText}>Selected Location</Text>

                                    <Text style={styles.LocValuesText}>{locationValue ? locationValue : ''}</Text>
                                    {/* <View style={[styles.inputContainer, {
                                        // width: '70%',
                                        marginBottom: 0
                                    }]}>
                                        <TextInput
                                            editable={false}
                                            style={styles.input}
                                            value={locationValue ? locationValue : ''}
                                        />
                                    </View> */}

                                    {/* <DropDownPicker
                                    open={locationDropOpen}
                                    value={locationValue}
                                    items={locationItems}
                                    setOpen={setLocationDropOpen}
                                    setValue={setLocationValue}
                                    setItems={setLocationItems}
                                    placeholder={'Location'}
                                /> */}
                                </View>

                                <View style={styles.LocationDropCont}>

                                    <Text style={styles.LocLabelsText}>Unbinned Location</Text>
                                    <Text style={styles.LocValuesText}>{UnBinnedValue && UnBinnedValue}</Text>

                                    {/* <View style={[styles.inputContainer, {
                                        // width: '70%',
                                        marginBottom: 0
                                    }]}>
                                        <TextInput
                                            editable={false}
                                            style={styles.input}
                                            value={UnBinnedValue && UnBinnedValue}
                                        />
                                    </View> */}
                                    {/* <DropDownPicker
                                    open={UnBinnedDropOpen}
                                    value={UnBinnedValue}
                                    items={UnBinnedItems}
                                    setOpen={setUnBinnedDropOpen}
                                    // setValue={setUnBinnedValue}
                                    setValue={handleUnBinnedSelect}
                                    setItems={setUnBinnedItems}
                                    placeholder={'UnBinned Loc'}
                                /> */}
                                </View>

                            </View>

                            <View style={styles.MainWmsForm}>

                                <View style={styles.SearchCont}>

                                    <View style={[styles.inputContainer, {
                                        width: '100%',
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

                                    {/* <Text style={styles.OrText}>Or</Text> */}

                                    <TouchableOpacity
                                        onPress={() => setShowQrScanner(true)}
                                        // onPress={() => navigation.navigate('QrScanner')}
                                        style={[styles.ListImgWrapQr]}
                                    >
                                        <Image style={styles.ListImg} source={require('../images/BinQrScan.png')} />
                                    </TouchableOpacity>

                                </View>

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
                                                            onPress={() => handleSelectItem(item)}
                                                        // onPress={() => {
                                                        //     Keyboard.dismiss()
                                                        //     setSelectedUnbinnedItem({
                                                        //         selectedCode: item.Code,
                                                        //         Desc: item.Description
                                                        //     })
                                                        //     setBinItemRemainingQty(item.Qty.toString())
                                                        //     setInitialBinQty(item.Qty.toString())
                                                        //     setItemSearchText('')
                                                        // }}
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


                                <View style={styles.SearchCont}>

                                  
                                        <TextInput
                                            // ref={inputRef}
                                            style={styles.input}
                                            value={binitemSearchText}
                                            onChangeText={text => setBinItemSearchText(text)}
                                            placeholder="Select Bin"
                                            placeholderTextColor="grey"
                                        />
                                    

                                    <TouchableOpacity
                                        onPress={() => setShowBinQrScanner(true)}
                                        // onPress={() => navigation.navigate('QrScanner')}
                                        style={[styles.ListImgWrapQr]}
                                    >
                                        <Image style={styles.ListImg} source={require('../images/BinQrScan.png')} />
                                    </TouchableOpacity>


                                </View>

                                {/* Filtered List */}
                                {binitemSearchText.length > 0 && (
                                    <View style={styles.listContainer}>

                                        {filteredBinItems?.length === 0 ? (
                                            <View style={styles.noDataContainer}>
                                                <Text style={styles.noDataText}>No Data</Text>
                                            </View>
                                        ) : (
                                            <FlatList
                                                data={filteredBinItems}
                                                keyExtractor={(item) => item.label}
                                                renderItem={({ item }) => (

                                                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                                        <TouchableOpacity
                                                            style={styles.listItem}
                                                            onPress={() => {
                                                                Keyboard.dismiss()
                                                                setBinValue(item.value)
                                                                // setShowBinPop(false)
                                                                setBinItemSearchText('')
                                                            }}
                                                        >
                                                            <Text style={styles.itemText}>{item.label}</Text>
                                                        </TouchableOpacity>
                                                    </TouchableWithoutFeedback>
                                                )}
                                                nestedScrollEnabled={true}
                                                keyboardShouldPersistTaps="handled"
                                            />
                                        )}

                                    </View>
                                )}



                                <View style={styles.FormTopCont}>



                                    {
                                        (removeQtyFromCode && qrCodeTextCopy) ?

                                            <View style={styles.ItemQtyCont}>
                                                <Text style={styles.ItemQtyText}>
                                                    {qrCodeTextCopy[0].quantity}
                                                </Text>
                                            </View>
                                            :
                                            <View style={styles.ItemQtyCont}>
                                                <Text style={styles.ItemQtyText}>
                                                    {binItemRemainingQty}
                                                </Text>
                                            </View>
                                    }



                                </View>


                                <View style={styles.FormInpCont}>

                                    <View style={styles.SelectedItemCont}>
                                        <Text style={styles.SelectedItemText}>{selectedUnBinnedItem.Desc}</Text>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={BinValue}
                                            // onChangeText={text => setSelectedUnbinnedItem(prev => ({ ...prev, selectedCode: text }))}
                                            placeholder="Bin"
                                            placeholderTextColor="grey"
                                            editable={false}
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={selectedUnBinnedItem.selectedCode}
                                            // onChangeText={text => setSelectedUnbinnedItem(prev => ({ ...prev, selectedCode: text }))}
                                            placeholder="Code"
                                            placeholderTextColor="grey"
                                            editable={false}
                                        />
                                    </View>

                                    <View style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <View style={[styles.inputContainer,
                                        {
                                            width: '70%'
                                        }
                                        ]}>

                                            {
                                                (removeQtyFromCode && qrCodeTextCopy) ?

                                                    <TextInput
                                                        style={styles.input}
                                                        value={qrCodeTextCopy[0].quantity.toString()}
                                                        editable={false}
                                                    />
                                                    :

                                                    <TextInput
                                                        style={styles.input}
                                                        value={selectedUnBinnedItem.selectedQty}

                                                        onChangeText={text => {
                                                            const inputQty = parseFloat(text) || 0;  // Ensure numeric value
                                                            const remainingQty = parseFloat(binItemRemainingQty) || 0;

                                                            console.log("Input Quantity:", inputQty);
                                                            console.log("Remaining Quantity:", remainingQty);

                                                            if (!selectedUnBinnedItem.selectedCode) {
                                                                Alert.alert(
                                                                    'Warning',
                                                                    'Please choose an Item First',
                                                                );
                                                                return
                                                            }


                                                            // If the input is cleared, reset remaining qty to initial value
                                                            if (text === "") {
                                                                setBinItemRemainingQty(initialBinQty.toString());
                                                                setSelectedUnbinnedItem(prev => ({ ...prev, selectedQty: "" }));
                                                            }
                                                            else if (inputQty === 0) {
                                                                Alert.alert("Warning", "Qty cannot be 0");
                                                                setBinItemRemainingQty(initialBinQty.toString());
                                                                setSelectedUnbinnedItem(prev => ({ ...prev, selectedQty: "" }));
                                                            }
                                                            // If input exceeds remaining qty, show alert
                                                            else if (inputQty > initialBinQty) {
                                                                Alert.alert("Warning", "Qty cannot exceed bin quantity");
                                                            }
                                                            // Update the qty dynamically and update remaining qty
                                                            else {
                                                                const newRemainingQty = initialBinQty - inputQty;
                                                                console.log(`${initialBinQty} - ${inputQty} = ${newRemainingQty}`);

                                                                setSelectedUnbinnedItem(prev => ({ ...prev, selectedQty: text }));
                                                                setBinItemRemainingQty((initialBinQty - inputQty).toString());
                                                            }
                                                        }}

                                                        placeholder="Qty"
                                                        placeholderTextColor="grey"
                                                        keyboardType='numeric'
                                                    />
                                            }




                                        </View>


                                        <TouchableOpacity onPress={handleToggle} style={styles.PartRightInnerBox}>
                                            <Text style={styles.SelectedItemText}>Reverse</Text>

                                            <View style={styles.circleContainer}>
                                                {reverseCheck ? (
                                                    <Image
                                                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Check_green_icon.svg/1024px-Check_green_icon.svg.png' }}
                                                        style={styles.tickImage}
                                                    />
                                                ) : (
                                                    <View style={styles.circle} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                </View>



                                <View style={styles.ButtonCont}>

                                    <TouchableOpacity
                                        onPress={() => setShowClearDataPop(true)}
                                        style={styles.ClearButton}
                                    >
                                        <Text style={styles.ButtonText}>Clear</Text>
                                    </TouchableOpacity>

                                    {
                                        BinValue && selectedUnBinnedItem.selectedCode && selectedUnBinnedItem.selectedQty && !removeQtyFromCode &&

                                        <TouchableOpacity style={styles.SaveButton}
                                            // onPress={() => setShowSaveDataPop(true)}

                                            onPress={() => handleSaveData()}
                                        >
                                            <Text style={styles.ButtonText}>
                                                {
                                                    saveApiLoader ?
                                                        <ActivityIndicator color={'white'} /> :
                                                        'Save'
                                                }
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                    {
                                        BinValue && qrCodeText.itemCode && qrCodeText.quantity && removeQtyFromCode &&

                                        <TouchableOpacity style={styles.SaveButton}
                                            // onPress={() => setShowSaveDataPop(true)}

                                            onPress={() => handleSaveData()}
                                        >
                                            <Text style={styles.ButtonText}>
                                                {
                                                    saveApiLoader ?
                                                        <ActivityIndicator color={'white'} /> :
                                                        'Save'
                                                }
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                </View>

                                {
                                    itemBinWiseData &&
                                    <View style={{
                                        marginVertical: 12
                                    }}>
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



                            </View>

                        </ScrollView>

                        {
                            modalVisible &&

                            <ItemListModal modalVisible={modalVisible} setModalVisible={setModalVisible} selectedUnBinnedItemList={selectedUnBinnedItemList} />
                        }

                        {
                            showBinPop &&
                            <SearchBinPop showBinPop={showBinPop} setShowBinPop={setShowBinPop} BinItems={BinItems} setBinValue={setBinValue} />
                        }

                        {
                            showClearDataPop &&

                            <ClearDataPop showClearDataPop={showClearDataPop} setShowClearDataPop={setShowClearDataPop} handleReset={handleReset} />
                        }

                        {
                            showSaveDataPop &&
                            <SaveDataPop showSaveDataPop={showSaveDataPop} setShowSaveDataPop={setShowSaveDataPop} handleSaveData={handleSaveData} saveApiLoader={saveApiLoader} />
                        }

                        {/* {showQrScanner && <NewQrCode onQrRead={handleQrRead} onClose={() => setShowQrScanner(false)} />} */}



                        {/* {showQrScanner ? <QRScanner onRead={onQrRead} /> : null} */}
                    </>
                }

                {
                    showQrScanner &&

                    // <PushScanner
                    //     setShowQrScanner={setShowQrScanner}
                    //     setQrCodeText={setQrCodeText}
                    //     removeQtyFromCode={removeQtyFromCode}

                    //     qrCodeTextCopy={qrCodeTextCopy}
                    //     setQrCodeTextCopy={setQrCodeTextCopy}
                    // />
                    <PutAwayItemScanner
                        setShowQrScanner={setShowQrScanner}
                        setQrCodeText={setQrCodeText}
                        removeQtyFromCode={removeQtyFromCode}

                        qrCodeTextCopy={qrCodeTextCopy}
                        setQrCodeTextCopy={setQrCodeTextCopy}
                        itemBinWiseData={itemBinWiseData}
                    />

                }

                {
                    showBinQrScanner &&

                    <BinPushScanner
                        showBinQrScanner={showBinQrScanner}
                        setShowBinQrScanner={setShowBinQrScanner}
                        setQrCodeBinValue={setQrCodeBinValue}
                        setBinValue={setBinValue}
                    />

                }
            </>
        </TouchableWithoutFeedback >
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
        display: 'flex',
        flexDirection: 'column'
    },

    LocLabelsText: {
        fontFamily: 'Lexend-Light',
        color: 'black',
        fontSize: 13
    },

    LocValuesText: {
        fontFamily: 'Lexend-Regular',
        color: 'black',
        fontSize: 14
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

    OrText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 12,
        color: 'black'
    },

    FormTopCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        // marginBottom: 12
    },

    BinAndSwitchCont: {
        width: '45%',
        display: 'flex',
        flexDirection: 'column'
    },

    SwitchCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
        width: '65%'
    },

    SwitchLabel: {
        fontSize: 15,
        fontFamily: 'Lexend-Regular',
        color: 'black'
    },

    SearchImgCont: {
        padding: 20,
        borderRadius: 50,
        height: 25,
        width: 25,
        backgroundColor: 'white',

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

        borderColor: 'black',
        borderWidth: 1
    },


    ItemQtyCont: {
        width: '60%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'white'
    },

    ItemQtyText: {
        fontSize: 30,
        color: 'black',
        fontFamily: 'Lexend-Bold'
    },

    FormInpCont: {
        display: 'flex',
        flexDirection: 'column',
        marginVertical: 12
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

    ButtonCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },

    ClearButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'red',
        width: 100
    },

    SaveButton: {
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

    ListImgCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        marginVertical: 8
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

    SelectedItemCont: {
        marginVertical: 12
    },

    SelectedItemText: {
        fontSize: 13,
        fontFamily: 'Lexend-Regular',
        color: 'black'
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


    circleContainer: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#fff',
    },
    tickImage: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },

    PartRightInnerBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },



})

export default WmsHome