import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, TextInput, FlatList, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import Header from './Header'
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import QrCodeScanner from './QrCodeScanner';
import ToastManager, { Toast } from 'toastify-react-native'



const PickingListDetailPage = ({ route }) => {

    const navigation = useNavigation()

    const { PickNo } = route.params

    const [searchItem, setSearchItem] = useState('')

    const [selectedValue, setSelectedValue] = useState('')

    const [cartonNumber, setCartonNumber] = useState('')

    const [qty, setQty] = useState('')

    const [isCallingAPI, setISCalllingAPI] = useState(false);

    const [packingListDetails, setPackingListDetails] = useState(null)

    const [showQrScanner, setShowQrScanner] = useState(false)

    const [qrScannedData, setQrScannedData] = useState(null)

    const [quantityExceededMessage, setQuantityExceededMessage] = useState("")

    const [isCalllingCartonListAPI, setISCalllingCartonListAPI] = useState(false)

    const [cartonListArray, setCartonListArray] = useState(null)

    const [filteredCartonListArray, setFilteredCartonListArray] = useState(null)

    const fetchPackingListDetails = async () => {

        setISCalllingAPI(true)

        let deptNo = 'BR1';

        let encodedDeptNo = encodeURIComponent(deptNo)

        let url = `https://cubixweberp.com:199/api/Pick/ShowPickItem?cmpcode=autoland&guid=425cc3d5-8e70-4502-a3a2-dc85e4bfbd83&mod=PICK_ITEM&deptno=BR1&pickno=${PickNo}`;

        // console.log(url)

        await axios.get(url).then((res) => {
            setISCalllingAPI(false)
            setPackingListDetails(res.data)
        }).catch(
            (err) => {
                console.log("fetchPackingListDetails Error", err)
                setISCalllingAPI(false)
            }
        )
    }

    const getCartonListOfThispicklist = () => {

        setISCalllingCartonListAPI(true)

        let deptNo = 'BR1';

        let encodedDeptNo = encodeURIComponent(deptNo)

        let url = `https://cubixweberp.com:199/api/Pick/ShowCarton?cmpcode=autoland&guid=425cc3d5-8e70-4502-a3a2-dc85e4bfbd83&mod=PICK_CARTON&deptno=${encodedDeptNo}&pickno=${PickNo}`

        console.log(url)

        axios.get(url).then((res) => {
            setISCalllingCartonListAPI(false)
            setCartonListArray(res.data)
            groupitemsWithSameObject(res.data)
        }).catch(
            (err) => {
                console.log("err is ", err)
                setISCalllingCartonListAPI(false)
            }
        )
    }

    const groupitemsWithSameObject = (dataFromApi) => {


        let ans = dataFromApi.reduce((agg, curr) => {

            // console.log(" agg is ", agg)
            // console.log(" curr is ", curr)

            let found = agg.find((x) => {
                // console.log(" x is ", x)
                return x.cartonno === curr.cartonno
            });

            // console.log(" found is ", found)

            if (found) {
                found.itemWiseArray.push(curr);
            }
            else {
                agg.push({
                    cartonno: curr.cartonno,
                    itemWiseArray: [curr]
                });
            }
            return agg;

        }, []);

        //console.log("filtered array " + ans.map((item) => console.log(" item is ", item)));

        setFilteredCartonListArray(ans)

        // groupitemsWithSamepartName(ans)
    }

    const groupitemsWithSamepartName = (dataFromApi) => {

        console.log(" groupitemsWithSamepartName array ", dataFromApi)

        let newArray = dataFromApi.map((item) => {

            let cartonRowArray = item.itemWiseArray.reduce((agg, curr) => {

                // console.log(" agg is ", agg)
                // console.log(" curr is ", curr)

                let found = agg.find((x) => {
                    // console.log(" x is ", x)
                    return x.code === curr.code
                });

                // console.log(" found is ", found)

                if (found) {
                    found.entryByStaffArray.push(curr);
                }
                else {
                    agg.push({
                        code: curr.code,
                        entryByStaffArray: [curr]
                    });
                }
                return agg;

            }, []);

            return ({ ...item, itemWiseArray: cartonRowArray })

        })


        setFilteredCartonWithPartname(newArray)

        copyofFilteredCartonWithPartnameRef.current = newArray
    }



    const validateAfterSavingPartQty = () => {
        console.log("selectedPartNumber, cartonNumber, packingQuantity ", selectedValue[1], cartonNumber, qty);

        let filteredItems = itemsInThisPickingList.filter((item) => {
            return item.Code == selectedPartNumber
        })

        console.log("filteredItems ", filteredItems)
        if (filteredItems[0]['Inv Qty'] >= (qty + filteredItems[0]['Pck Qty'])) {
            // call API 
            // sendQuantityToApi(filteredItems[0]['Inv Qty'],)
        } else {
            setQuantityExceededMessage("Please enter quantity less than ordered")
        }


    }

    useEffect(() => {

        if (qrScannedData != null) {
            if (qrScannedData != "") {

                let filteredItem = packingListDetails.filter((item) => {
                    return item.Code == qrScannedData
                })

                if (filteredItem.length > 0) {
                    setSelectedValue(filteredItem)
                } else {
                    showScannedItemNotList()
                    return
                }
            }

        }

    }, [qrScannedData])


    useEffect(() => {
        fetchPackingListDetails()
        getCartonListOfThispicklist()
    }, [])

    // toasts

    const showScannedItemNotList = () => {
        Toast.error('Scanned item not in Picking List')
    }

    // console.log('PickNo', PickNo)

    // console.log('packingListDetails', packingListDetails)

    console.log('cartonListArray', cartonListArray)

    // console.log('qrScannedData', qrScannedData)
    return (
        <>
            {
                !showQrScanner &&

                <View style={styles.HomeWrap}>
                    <Header />

                    <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />

                    <View style={styles.HomeCont}>

                        <View style={styles.HomeTextCont}>
                            <TouchableOpacity onPress={() => navigation.navigate('PickingList')}>
                                <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                            </TouchableOpacity>
                            <Text style={styles.HomeText}>Pickinglist details</Text>
                        </View>

                        <ScrollView style={styles.ScrollView}>

                            <View style={styles.InputCont}>
                                <TextInput
                                    style={styles.TextInput}
                                    // placeholder='Enter item name'
                                    value={searchItem}
                                    onChangeText={text => setSearchItem(text)}
                                    placeholderTextColor="#aaa"
                                />
                                {/* <View style={styles.InputImageCont}>
                                <Image style={styles.SearchIcon} source={require('../images/searchIcon.png')} />
                            </View> */}
                            </View>

                            <View style={styles.ScanDropWrap}>
                                {/* <TouchableOpacity style={styles.ScanButton} onPress={() => navigation.navigate('QrCodeScanner')}> */}
                                <TouchableOpacity style={styles.ScanButton} onPress={() => setShowQrScanner(true)}>
                                    <Text style={styles.ScanButtonText}>Scan</Text>
                                </TouchableOpacity>

                                <Text style={styles.OrText}>Or</Text>

                                <View style={styles.PickerWrap}>
                                    <Picker
                                        selectedValue={selectedValue}
                                        style={styles.picker}
                                        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                                    >
                                        <Picker.Item label={'-----'} value={0} />
                                        {
                                            packingListDetails && packingListDetails.map((item, index) => (
                                                <Picker.Item label={item.Description} value={[item.Description, item.Code]} key={index} />

                                            ))
                                        }


                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.PickNoCont}>
                                {
                                    selectedValue &&
                                    <Text style={styles.PickNotext}>
                                        {`Selected Item: ${selectedValue[0]}`}
                                    </Text>
                                }
                            </View>

                            <View style={styles.CartoonQtyInpWrap}>

                                <View style={styles.CQInputCont}>
                                    <TextInput
                                        style={styles.TextInput}
                                        placeholder='carton number'
                                        value={cartonNumber}
                                        onChangeText={text => setCartonNumber(text)}
                                        placeholderTextColor="#aaa"
                                    />
                                </View>
                                <View style={styles.CQInputCont}>
                                    <TextInput
                                        style={styles.TextInput}
                                        placeholder='enter qty'
                                        value={qty}
                                        onChangeText={text => setQty(text)}
                                        placeholderTextColor="#aaa"
                                    />
                                </View>
                            </View>

                            {
                                selectedValue && cartonNumber && qty &&
                                <View style={styles.SaveButtonWrap}>
                                    <TouchableOpacity style={styles.SaveButton}>
                                        <Text style={styles.SaveButtontext}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            }


                            <View style={styles.PickNoCont}>
                                <Text style={styles.PickNotext}>
                                    {
                                        `Picking list number ${PickNo}`
                                    }
                                </Text>
                            </View>

                            <View style={styles.TableBannerWrap}>
                                <Text style={styles.TableBannerText}>Item List</Text>
                            </View>

                            {
                                packingListDetails && packingListDetails.length === 0 &&
                                <View style={styles.NoDataWrap}>
                                    <Text style={styles.NoDataText}>No data available</Text>
                                </View>
                            }

                            <View style={{
                                marginTop: 8,
                                height: 500,
                                marginBottom: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3,
                                elevation: 5,
                            }}>
                                {
                                    packingListDetails && packingListDetails.length > 0 &&
                                    <ScrollView horizontal={true}>

                                        <View style={styles.TableContainer}>
                                            <View style={styles.tableRow}>
                                                <Text style={[styles.headerCell, { borderTopLeftRadius: 4 }]}>Code</Text>
                                                <Text style={styles.headerCell}>Description</Text>
                                                <Text style={styles.headerCell}>Inv.Qty.</Text>
                                                <Text style={styles.headerCell}>Pck.Qty.</Text>
                                                <Text style={[styles.headerCell, { borderTopRightRadius: 4 }]}>Cartons</Text>
                                            </View>

                                            <ScrollView nestedScrollEnabled={true}>
                                                <FlatList
                                                    data={packingListDetails}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    contentContainerStyle={{ paddingBottom: 50 }}
                                                    renderItem={({ item }) => (
                                                        <View style={styles.tableRow}>
                                                            <Text style={styles.dataCell}>{item.Code}</Text>
                                                            <Text style={styles.dataCell}>{item.Description}</Text>
                                                            <Text style={styles.dataCell}>{item['Inv Qty']}</Text>
                                                            <Text style={styles.dataCell}>{item['Pck Qty']}</Text>
                                                            <Text style={styles.dataCell}>{item['Carton']}</Text>
                                                        </View>
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


                            <View style={styles.TableBannerWrap}>
                                <Text style={styles.TableBannerText}>Cartons</Text>
                            </View>

                            <View style={styles.SelectCartonWrap}>
                                <Text style={styles.PickNotext}>Select carton</Text>
                                <View style={styles.CartonPickerWrap}>
                                    <Picker
                                        selectedValue={selectedValue}
                                        style={styles.picker}
                                        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                                    >
                                        {
                                            packingListDetails && packingListDetails.map((item, index) => (
                                                <Picker.Item label={item} value={item.Code} key={index} />

                                            ))
                                        }
                                    </Picker>
                                </View>
                            </View>


                        </ScrollView>
                    </View>

                </View>
            }
            {
                showQrScanner &&
                <QrCodeScanner setQrScannedData={setQrScannedData} setShowQrScanner={setShowQrScanner} />
            }


        </>
    )
}

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
        height: Dimensions.get('window').height - 70,
        paddingBottom: 50
        // height: 'auto',
        // paddingBottom: 200
        // height: Dimensions.get('window').height

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
    HeadIcon: {
        width: 25,
        height: 25
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
        backgroundColor: '#EAEDF5',
        padding: 8,
        borderRadius: 6,
        position: 'absolute',
        right: 10
    },
    SearchIcon: {
        width: 25,
        height: 25
    },
    TextInput: {
        width: '100%',
        fontFamily: 'Lexend-Bold'
    },

    PickerWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        borderColor: '#5A55CA',  // Change this to your desired border color
        borderWidth: 1,
        borderRadius: 5,
        overflow: 'hidden',
        // marginTop: 12
    },
    picker: {
        // height: 50,
        width: '100%',
    },

    ScanDropWrap: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 12,
        marginTop: 12
    },
    ScanButton: {
        backgroundColor: '#5A55CA',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 4
    },
    ScanButtonText: {
        fontFamily: 'Lexend-Regular',
        color: 'white',
        fontSize: 16
    },
    OrText: {
        fontFamily: 'Lexend-Bold',
        color: '#5A55CA',
        fontSize: 16
    },

    NoDataWrap: {
        width: '100%',
        paddingVertical: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'

    },
    NoDataText: {
        fontFamily: 'Lexend-Bold',
        color: 'red',
        fontSize: 16
    },

    TableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
        // paddingBottom: 50,
        // height: 500
    },
    tableRow: {
        flexDirection: 'row',
        // width: '100%',
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        // flex: 1,
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: '20%',
        color: 'white',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',

    },
    dataCell: {
        // flex: 1,
        // backgroundColor: '#F3F3F3',
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: '20%',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },
    ScrollView: {
        height: Dimensions.get('window').height - 300,
        // marginBottom: 8
    },

    CartoonQtyInpWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 12
    },
    CQInputCont: {
        width: '48%',
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

    SaveButtonWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginVertical: 12
    },
    SaveButton: {
        backgroundColor: 'green',
        padding: 12,
        borderRadius: 4
    },
    SaveButtontext: {
        fontFamily: 'Lexend-Regular',
        color: 'white',
        fontSize: 16
    },

    PickNoCont: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        marginVertical: 12
    },
    PickNotext: {
        fontFamily: 'Lexend-Regular',
        color: 'black',
        fontSize: 16
    },

    TableBannerWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        marginVertical: 12
    },
    TableBannerText: {
        fontFamily: 'Lexend-Bold',
        color: 'black',
        fontSize: 18
    },

    SelectCartonWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    CartonPickerWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        borderColor: '#5A55CA',  // Change this to your desired border color
        borderWidth: 1,
        borderRadius: 5,
        overflow: 'hidden',
        // marginTop: 12
        marginLeft: 18
    },
    picker: {
        height: 50,
        width: '100%',
    },




})

export default PickingListDetailPage