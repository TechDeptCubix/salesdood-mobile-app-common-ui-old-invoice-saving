import {
    View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, Keyboard,
    ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, Image
} from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchItemBinWiseData, fetchPickingListData } from '../config/PickingListApiConfig'
import BinWiseItemPop from '../popups/BinWiseItemPop'
import { base_url } from '../config/baseUrl'
import axios from 'axios'
import PushScannerModal from '../popups/PushScannerModal'
import InvoiceNoPushScanner from '../popups/InvoiceNoPushScanner'
import PickListItemScanner from '../popups/PickListItemScanner'
import { company_code } from '../config/companyCode';


const PickingList = () => {

    const [searchCode, setSearchCode] = useState('')

    const [locationValue, setLocationValue] = useState(null)

    const [pickingListData, setPickingListData] = useState('')

    const [pickListApiLoader, setPickListAPiLoader] = useState(false)

    const [noPickListData, setNoPickListData] = useState(false)

    const [binWiseItemModelVisible, setBinWiseItemModalVisible] = useState(false)

    const [binWiseItemData, setBinWiseItemData] = useState('')

    const [editItem, setEditItem] = useState(null)

    const [saveItemLoader, setSaveItemLoader] = useState(false)

    // qr
    const [showQrScanner, setShowQrScanner] = useState(false)
    const [qrCodeText, setQrCodeText] = useState('')
    const [removeQtyFromCode, setRemoveQtyFromCode] = useState(null)

    const [showInvoiceScanner, setShowInvoiceScanner] = useState(false)

    const [loggedUser, setLoggedUser] = useState('')

    const [showPickListItemScanner, setShowPickListItemScanner] = useState(false)

    const [pickListScannerItem, setPickListScannerItem] = useState('')

    const [pickListqrCodeText, setPickListQrCodeText] = useState('')

    const [pickListqrCodeTextCopy, setPickListQrCodeTextCopy] = useState('')


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

    useEffect(() => {
        loadUserDataArray()
    }, [])


    const handlePickQtyChange = (item, value) => {
        const enteredQty = parseFloat(value) || 0;

        if (enteredQty === 0) {
            Alert.alert("Warning", "Qty cannot be 0");
            setEditItem({ ...item, PickQty: '' })
            return
        }

        // Validation: Ensure entered quantity does not exceed limits
        if (enteredQty > item.RequiredQty) {
            Alert.alert('Error', 'PickQty exceeds Required Quantity!');
            setEditItem({ ...item, PickQty: '' })
            return;
        }
        if (enteredQty > item.BinQty) {
            Alert.alert('Error', 'PickQty exceeds Bin Quantity!');
            setEditItem({ ...item, PickQty: '' })
            return;
        }

        // If editing is not started OR if the same Code and Bin are being edited
        if (!editItem || (editItem.Code === item.Code && editItem.Bin === item.Bin)) {
            setEditItem({ ...item, PickQty: value }); // Update the editing item
        }
    };

    useEffect(() => {
        if (!pickListqrCodeText) return;

        // Check if scanned item matches the pick list item
        if (pickListqrCodeText.itemCode !== pickListScannerItem.Code) {
            Alert.alert("Item Code Mismatch", "Scanned item does not match the expected item.", [{ text: "OK" }]);
            return;
        }

        let enteredQty = pickListqrCodeText.quantity; // Scanned QR code quantity
        let totalQty = (editItem?.PickQty || 0) + enteredQty; // Total quantity after adding new scan

        console.log("enteredQty:", enteredQty);
        console.log("Previous PickQty:", editItem?.PickQty || 0);
        console.log("Total Qty:", totalQty);

        // Validation: Total Quantity cannot be 0
        if (totalQty === 0) {
            Alert.alert("Warning", "Qty cannot be 0");
            setEditItem({ ...pickListScannerItem, PickQty: '' });
            return;
        }

        // Validation: Total PickQty cannot exceed Required Quantity
        if (totalQty > pickListScannerItem.RequiredQty) {
            Alert.alert("Error", "PickQty exceeds Required Quantity!");
            setEditItem({ ...pickListScannerItem, PickQty: '' });
            return;
        }

        // Validation: Total PickQty cannot exceed Bin Quantity
        if (totalQty > pickListScannerItem.BinQty) {
            Alert.alert("Error", "PickQty exceeds Bin Quantity!");
            setEditItem({ ...pickListScannerItem, PickQty: '' });
            return;
        }

        if (totalQty > (pickListScannerItem.RequiredQty - pickListScannerItem.PickQty)) {
            Alert.alert("Error", "PickQty exceeds Required Quantity!");
            setEditItem({ ...pickListScannerItem, PickQty: '' });
            return;
        }

        // Update PickQty with accumulated value
        setEditItem({
            ...pickListScannerItem,
            PickQty: totalQty
        });

    }, [pickListqrCodeText]);



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



    const handleSearch = async () => {
        if (!searchCode) {
            Alert.alert('Input Code cant be empty!')
            return
        }
        fetchPickingListData(locationValue, searchCode, setPickingListData, setPickListAPiLoader, setNoPickListData)
    }

    const handleViewBinClick = async (Code) => {
        fetchItemBinWiseData(locationValue, Code, setBinWiseItemData)

        setBinWiseItemModalVisible(true)
    }

    useEffect(() => {
        const saveSearchCode = async () => {
            if (pickingListData && pickingListData.length > 0 && searchCode) {
                try {
                    await AsyncStorage.setItem('WMSsearchCode', searchCode);
                } catch (error) {
                    console.error("Error saving searchCode:", error);
                }
            }
        };

        saveSearchCode();
    }, [pickingListData, searchCode]);

    // useEffect to retrieve searchCode on app refresh
    useEffect(() => {
        const loadSearchCode = async () => {
            try {
                const storedSearchCode = await AsyncStorage.getItem('WMSsearchCode');
                if (storedSearchCode) {
                    setSearchCode(storedSearchCode);
                    fetchPickingListData(locationValue, storedSearchCode, setPickingListData, setPickListAPiLoader, setNoPickListData);
                }
            } catch (error) {
                console.error("Error retrieving searchCode:", error);
            }
        };

        loadSearchCode();
    }, []);


    // Handle Save action
    // Handle Save action
    const handleSave = async () => {
        if (!editItem || !editItem.PickQty) {
            Alert.alert('Invalid Input', 'Please enter a valid PickQty.');
            return;
        }

        setSaveItemLoader(true)

        const data = {
            Mod: "PICKITEM",
            TrDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            Loc: editItem.Locn.trim(),
            User: loggedUser,
            BinFrom: editItem.Bin,
            Doctype: editItem.DocType,
            Docno: editItem.DocNo.toString(),
            BinItems: [
                {
                    Code: editItem.Code,
                    Bin: editItem.Bin,
                    Qty: editItem.PickQty.toString(),
                }
            ]
        };

        const postData = JSON.stringify(data)

        console.log('postData', postData)

        try {
            console.log(`handleSaveDataApi==> ${base_url}/api/BinTransfer?cmpcode=${company_code}`)

            const response = await axios.post(`${base_url}/api/BinTransfer?cmpcode=${company_code}`, postData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                Alert.alert('Success', 'PickQty saved successfully!');
                setEditItem(null); // Reset editing state
                setSaveItemLoader(false)

                setQrCodeText('')
                setPickListScannerItem('')
                setPickListQrCodeText('')
                setPickListQrCodeTextCopy('')

                fetchPickingListData(locationValue, searchCode, setPickingListData, setPickListAPiLoader, setNoPickListData)

            } else {
                Alert.alert('Error', 'Failed to save PickQty. Try again.');
                setSaveItemLoader(false)

            }
        } catch (error) {
            console.error('Save API Error:', error);
            Alert.alert('Error', 'Something went wrong.');
            setSaveItemLoader(false)

        }
    };

    useEffect(() => {
        if (qrCodeText && editItem) {
            if (qrCodeText?.data.toUpperCase() !== editItem.Bin?.toUpperCase()) {
                Alert.alert('Bin and QrCodeBin Mismatch!')
            }
        }
    }, [qrCodeText])


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


    console.log('qrCodeText', qrCodeText)
    // console.log('pickingListData', pickingListData[0])
    console.log('editItem', editItem)

    console.log('pickListqrCodeText', pickListqrCodeText)
    console.log('pickListqrCodeTextCopy', pickListqrCodeTextCopy)
    console.log('pickListScannerItem', pickListScannerItem)

    return (
        <>

            {
                // !showQrScanner &&
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}
                >
                    <>
                        <ScrollView style={styles.WmsHomeWrap} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>

                            <View style={styles.WmsHead}>
                                <Text style={styles.WmsHeadText}>PickingList</Text>
                            </View>


                            <View style={styles.SearchCont}>

                                <View style={[styles.inputContainer, {
                                    width: '100%',
                                    marginBottom: 0
                                }]}>
                                    <TextInput
                                        style={styles.input}
                                        value={searchCode}
                                        onChangeText={text => setSearchCode(text)}
                                        placeholder="Search Code"
                                        placeholderTextColor="grey"
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={() => setShowInvoiceScanner(true)}
                                    // onPress={() => navigation.navigate('QrScanner')}
                                    style={[styles.ListImgWrapQrInput]}
                                >
                                    <Image style={styles.ListImg} source={require('../images/BinQrScan.png')} />
                                </TouchableOpacity>


                                <TouchableOpacity
                                    disabled={pickListApiLoader}
                                    onPress={() => handleSearch()}
                                    style={[styles.ViewButtonWrap]}
                                >
                                    <Text style={styles.ViewButtonText}>
                                        {
                                            pickListApiLoader ?
                                                <ActivityIndicator color={'white'} />
                                                :
                                                'View'
                                        }
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {
                                pickListApiLoader &&
                                <ActivityIndicator color={'blue'} />
                            }

                            {
                                !pickListApiLoader && pickingListData.length === 0 && searchCode && noPickListData &&

                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>No Data</Text>
                                </View>
                            }

                            {
                                pickingListData && pickingListData.length > 0 && !pickListApiLoader &&


                                <ScrollView style={styles.container} nestedScrollEnabled={true}>
                                    {pickingListData && pickingListData.length > 0 && !pickListApiLoader && (
                                        <ScrollView horizontal={true} style={styles.horizontalScroll}>

                                            <View style={{
                                                position: 'relative'
                                            }}>
                                                <View style={{
                                                    padding: 12,
                                                    borderRadius: 50,
                                                    height: 30,
                                                    width: 30,
                                                    backgroundColor: 'white',
                                                    borderColor: 'grey',
                                                    borderWidth: 1,

                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',

                                                    position: 'absolute',

                                                    top: 30,
                                                    left: -5,
                                                    zIndex: 5
                                                }}>
                                                    <Image style={{
                                                        width: 20,
                                                        height: 20
                                                    }} source={require('../images/doorIn.png')} />
                                                </View>

                                                {/* Table Header */}
                                                <View style={styles.tableHeader}>
                                                    <Text style={[styles.headerText, { width: 150 }]}>Code</Text>
                                                    <Text style={[styles.headerText, { width: 180 }]}>Description</Text>
                                                </View>

                                                {/* Scrollable Table Content */}

                                                <FlatList
                                                    // data={pickingListData}
                                                    data={[...pickingListData].sort((a, b) => {
                                                        const aNotPicked = a.PickQty !== a.RequiredQty; // Items not fully picked
                                                        const bNotPicked = b.PickQty !== b.RequiredQty;
                                                        const aNoBinQty = !a.BinQty; // Items with no stock in Bin
                                                        const bNoBinQty = !b.BinQty;

                                                        // Sorting Order:
                                                        // 1. Non-picked items first
                                                        // 2. Items with no BinQty in the middle
                                                        // 3. Fully picked items last
                                                        return (bNotPicked - aNotPicked) || (aNoBinQty - bNoBinQty);
                                                    })}
                                                    keyExtractor={(item) => item.Code}
                                                    nestedScrollEnabled={true} // Allows FlatList to scroll inside ScrollView
                                                    style={styles.flatList}
                                                    renderItem={({ item }) => {
                                                        const isPicked = item.PickQty === item.RequiredQty; // Check if fully picked
                                                        return (
                                                            <View
                                                                style={[
                                                                    styles.listItem,
                                                                    isPicked ? { backgroundColor: '#d4edda' } : {}, // Light green background
                                                                ]}
                                                            >
                                                                <View style={{ display: 'flex', flexDirection: 'column', width: 150 }}>
                                                                    <Text style={[styles.itemText]}>{item.Code}</Text>
                                                                    <View>
                                                                        <View style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'row',
                                                                            alignItems: 'center'
                                                                        }}>
                                                                            <Text style={styles.itemText}>Bin - {item.Bin}</Text>

                                                                            {
                                                                                item.PickQty > 0 &&

                                                                                <Image style={{
                                                                                    width: 25,
                                                                                    height: 25
                                                                                }} source={require('../images/alertBadgeWms.png')} />
                                                                            }

                                                                            {
                                                                                item.BinQty && !isPicked &&
                                                                                <TouchableOpacity
                                                                                    onPress={() => {
                                                                                        setShowQrScanner(true)
                                                                                        // setEditItem(item)

                                                                                        setEditItem(prevEditItem =>
                                                                                            prevEditItem && prevEditItem.Code === item.Code && prevEditItem.Bin === item.Bin
                                                                                                ? prevEditItem // Keep existing editItem (with PickQty)
                                                                                                : { ...item, PickQty: "" } // Set new editItem with empty PickQty
                                                                                        );
                                                                                    }}
                                                                                    // onPress={() => navigation.navigate('QrScanner')}
                                                                                    // style={[
                                                                                    //     styles.ListImgWrapQr,
                                                                                    //     item.Bin?.toUpperCase() === qrCodeText?.data.toUpperCase() ? { backgroundColor: '#d4edda' } : {} // Correct way
                                                                                    // ]}
                                                                                    style={[
                                                                                        styles.ListImgWrapQr,
                                                                                        item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase() && editItem?.Code === item.Code ? { backgroundColor: '#d4edda' } : {}
                                                                                    ]}

                                                                                >
                                                                                    <Image style={styles.ListImg} source={require('../images/BinQrScan.png')} />
                                                                                </TouchableOpacity>
                                                                            }
                                                                        </View>
                                                                        <View style={{
                                                                            // padding: 1,
                                                                            marginVertical: 6,
                                                                            backgroundColor: 'white',
                                                                            borderRadius: 4,
                                                                            borderWidth: 0.5,
                                                                            borderColor: 'grey',
                                                                            width: 120,
                                                                        }}>
                                                                            <Text style={styles.itemText}>RequiredQty  {item.RequiredQty}</Text>
                                                                        </View>
                                                                        <Text style={styles.itemText}>Remaining Qty  {item.RequiredQty - item.PickQty}</Text>
                                                                        <Text style={styles.itemText}>BinQty  {item.BinQty}</Text>
                                                                        <Text style={styles.itemText}>PickQty  {item.PickQty}</Text>
                                                                    </View>
                                                                </View>

                                                                <View style={{ width: 180 }}>
                                                                    <View style={{
                                                                        // display: 'flex',
                                                                        // flexDirection: 'row',
                                                                        // justifyContent: 'space-between'
                                                                    }}>
                                                                        <Text style={[styles.itemText]}>{item.Description}</Text>


                                                                        {
                                                                            item.BinQty && !isPicked && removeQtyFromCode && (item.Bin ?? "").toUpperCase() === (qrCodeText?.data ?? "").toUpperCase() &&
                                                                            <TouchableOpacity
                                                                                onPress={() => {
                                                                                    setShowPickListItemScanner(true)
                                                                                    setPickListScannerItem(item)
                                                                                    setEditItem(prevEditItem =>
                                                                                        prevEditItem && prevEditItem.Code === item.Code && prevEditItem.Bin === item.Bin
                                                                                            ? prevEditItem // Keep existing editItem (with PickQty)
                                                                                            : { ...item, PickQty: "" } // Set new editItem with empty PickQty
                                                                                    );
                                                                                }}
                                                                                style={[
                                                                                    styles.ListImgWrapQr,
                                                                                    {
                                                                                        width: 50
                                                                                    },
                                                                                    // item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase() ? { backgroundColor: '#d4edda' } : {}
                                                                                ]}

                                                                            >
                                                                                <Image style={styles.ListImg} source={require('../images/BinQrScan.png')} />
                                                                            </TouchableOpacity>
                                                                        }

                                                                    </View>

                                                                    {item.BinQty && (
                                                                        <View style={[styles.inputContainer, { width: '60%', marginTop: 'auto' }]}>
                                                                            {isPicked ? (
                                                                                <Text style={{ color: 'green', fontFamily: 'Lexend-Regular' }}>Item Picked</Text>
                                                                            ) : (
                                                                                <TouchableOpacity
                                                                                    // onPress={() => {
                                                                                    //     if (item.Bin?.toUpperCase() !== qrCodeText?.data.toUpperCase()) {
                                                                                    //         Alert.alert('Bin and QrCodeBin Mismatch!')
                                                                                    //     }
                                                                                    // }}
                                                                                    onPress={() => {
                                                                                        if (item.Bin?.toUpperCase() !== qrCodeText?.data?.toUpperCase() && editItem?.Code !== item.Code) {
                                                                                            Alert.alert('Bin and QrCodeBin Mismatch!');
                                                                                        }
                                                                                    }}

                                                                                    style={{
                                                                                        width: '100%'
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        removeQtyFromCode ?
                                                                                            <TextInput

                                                                                                style={[
                                                                                                    styles.input,
                                                                                                    editItem
                                                                                                        ? (item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase() && editItem?.Code === item.Code)
                                                                                                            ? {} // Disable other rows when editItem exists
                                                                                                            : { backgroundColor: '#eee', color: '#999' }
                                                                                                        : (item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase())
                                                                                                            ? {} // Disable row when editItem is not present
                                                                                                            : { backgroundColor: '#eee', color: '#999' }
                                                                                                ]}


                                                                                                value={editItem?.Code === item.Code && editItem?.Bin === item.Bin && pickListqrCodeText ? editItem.PickQty.toString() : ""}
                                                                                                onChangeText={(text) => handlePickQtyChange(item, text)}
                                                                                                placeholder="PickQty"
                                                                                                keyboardType="numeric"
                                                                                                placeholderTextColor="grey"
                                                                                                editable={editItem
                                                                                                    ? (item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase() && editItem?.Code === item.Code)
                                                                                                    : (item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase())
                                                                                                }

                                                                                            />
                                                                                            :
                                                                                            <TextInput

                                                                                                style={[
                                                                                                    styles.input,
                                                                                                    editItem
                                                                                                        ? (item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase() && editItem?.Code === item.Code)
                                                                                                            ? {}
                                                                                                            : { backgroundColor: '#eee', color: '#999' }
                                                                                                        : (item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase())
                                                                                                            ? {}
                                                                                                            : { backgroundColor: '#eee', color: '#999' }
                                                                                                ]}

                                                                                                value={editItem?.Code === item.Code && editItem?.Bin === item.Bin ? editItem.PickQty.toString() : ""}
                                                                                                onChangeText={(text) => handlePickQtyChange(item, text)}
                                                                                                placeholder="PickQty"
                                                                                                keyboardType="numeric"
                                                                                                placeholderTextColor="grey"
                                                                                                editable={editItem
                                                                                                    ? (item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase() && editItem?.Code === item.Code)
                                                                                                    : (item.Bin?.toUpperCase() === qrCodeText?.data?.toUpperCase())
                                                                                                }

                                                                                            />
                                                                                    }
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        </View>
                                                                    )}

                                                                    {
                                                                        !item.BinQty && (
                                                                            <View style={{ width: '60%', marginTop: 'auto' }}>
                                                                                <Text style={{ color: 'red', fontFamily: 'Lexend-Regular' }}>No Item in Bin</Text>
                                                                            </View>
                                                                        )
                                                                    }


                                                                    {
                                                                        (item.Bin ?? "").toUpperCase() === (qrCodeText?.data ?? "").toUpperCase() && !isPicked && editItem?.Code === item.Code &&

                                                                        <TouchableOpacity style={[styles.NextButton, { width: 120 }]}
                                                                            // onPress={() => navigation.navigate('PickingList')}
                                                                            onPress={() => handleSave()}
                                                                        >
                                                                            <Text style={styles.ButtonText}>
                                                                                {
                                                                                    saveItemLoader ?
                                                                                        <ActivityIndicator color={'white'} /> :
                                                                                        'Save'
                                                                                }

                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    }

                                                                </View>
                                                            </View>
                                                        );
                                                    }}
                                                />


                                                <View style={{
                                                    padding: 12,
                                                    borderRadius: 50,
                                                    height: 30,
                                                    width: 30,
                                                    backgroundColor: 'white',
                                                    borderColor: 'grey',
                                                    borderWidth: 1,

                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',

                                                    position: 'absolute',

                                                    bottom: -1,
                                                    left: -5,
                                                    zIndex: 5
                                                }}>
                                                    <Image style={{
                                                        width: 20,
                                                        height: 20
                                                    }} source={require('../images/doorOut.png')} />
                                                </View>

                                            </View>
                                        </ScrollView>
                                    )}
                                </ScrollView>

                                // <View style={styles.NextButtonWrap}>
                                //     <TouchableOpacity style={[styles.NextButton, { width: 150 }]}
                                //         onPress={() => handleSave()}
                                //     >
                                //         <Text style={styles.ButtonText}>
                                //             {
                                //                 saveItemLoader ?
                                //                     <ActivityIndicator color={'white'} /> :
                                //                     'Save'
                                //             }

                                //         </Text>
                                //     </TouchableOpacity>
                                // </View>

                            }


                        </ScrollView>
                    </>
                </TouchableWithoutFeedback>
            }

            {binWiseItemModelVisible &&
                <BinWiseItemPop binWiseItemModelVisible={binWiseItemModelVisible} setBinWiseItemModalVisible={setBinWiseItemModalVisible} binWiseItemData={binWiseItemData} />
            }

            {
                showQrScanner &&

                <PushScannerModal setShowQrScanner={setShowQrScanner} setQrCodeText={setQrCodeText} removeQtyFromCode={false} />

            }

            {
                showPickListItemScanner && pickListScannerItem &&

                <PickListItemScanner
                    showPickListItemScanner={showPickListItemScanner}
                    setShowPickListItemScanner={setShowPickListItemScanner}
                    setPickListQrCodeText={setPickListQrCodeText}
                    setPickListQrCodeTextCopy={setPickListQrCodeTextCopy}
                    removeQtyFromCode={removeQtyFromCode}
                    pickListqrCodeTextCopy={pickListqrCodeTextCopy}
                    pickListScannerItem={pickListScannerItem}
                />
            }


            {
                showInvoiceScanner &&
                <InvoiceNoPushScanner
                    showInvoiceScanner={showInvoiceScanner}
                    setShowInvoiceScanner={setShowInvoiceScanner}
                    setSearchCode={setSearchCode}

                    locationValue={locationValue}
                    setPickingListData={setPickingListData}
                    setPickListAPiLoader={setPickListAPiLoader}
                    setNoPickListData={setNoPickListData}
                />
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
        marginBottom: 12
    },

    WmsHeadText: {
        fontSize: 16,
        color: 'black',
        fontFamily: 'Lexend-Regular'
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

    ViewButtonWrap: {
        // backgroundColor: 'white',

        backgroundColor: '#4608ad',
        width: 80,

        padding: 11,
        borderRadius: 12,
        borderColor: 'black',
        borderWidth: 0.5,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0
    },

    ListImg: {
        width: 25,
        height: 25
    },

    ViewButtonText: {
        fontFamily: 'Lexend-Regular',
        color: 'white',
        fontSize: 14
    },


    container: {
        flex: 1,
        marginTop: 12
    },
    horizontalScroll: {
        flexDirection: "row",
    },
    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#ddd",
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginLeft: 5
        // width: 800, // Ensure width fits all columns
    },
    headerText: {
        fontSize: 14,
        color: "black",
        fontFamily: "Lexend-Regular",
        // flex: 1,
        textAlign: "left",
        paddingVertical: 8,
        paddingHorizontal: 8,
        width: 130,

        marginHorizontal: 8,
    },
    flatList: {
        maxHeight: 500, // Limits height for vertical scrolling
        marginLeft: 5,
        borderLeftColor: 'blue',
        borderLeftWidth: 1.5,
        borderStyle: 'dashed',

    },
    listItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        // width: 800, // Ensure it matches header width
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    itemText: {
        fontSize: 13,
        color: "black",
        fontFamily: "Lexend-Regular",
        // flex: 1,
        textAlign: "left",
        paddingVertical: 8,
        paddingHorizontal: 8,
        // width: 130,

        // marginHorizontal: 8,
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

    NextButtonWrap: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: "center",
        marginVertical: 12
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

    ListImgWrapQrInput: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 12,
        borderColor: 'black',
        borderWidth: 0.5,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 85
    },


    ListImgWrapQr: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 12,
        borderColor: 'black',
        borderWidth: 0.5,
        marginLeft: 4,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // position: 'absolute',
        // right: 1
    },

    ListImg: {
        width: 20,
        height: 20
    },

})

export default PickingList