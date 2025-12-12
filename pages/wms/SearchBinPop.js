import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Modal,
    Text,
    FlatList,
    StyleSheet,
    Button,
    ScrollView,
    Image,
    TouchableOpacity,
    Keyboard,
    TextInput,
    TouchableWithoutFeedback
} from 'react-native';



const SearchBinPop = ({ showBinPop, setShowBinPop, BinItems, setBinValue }) => {

    const [itemSearchText, setItemSearchText] = useState('')

    const [filteredItems, setFilteredItems] = useState(BinItems)

    const inputRef = useRef(null);

    useEffect(() => {

        if (itemSearchText.length > 0 && (!BinItems || BinItems.length === 0)) {
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


        if (BinItems && itemSearchText.length > 0 && BinItems.length > 0) {

            const filteredItems = BinItems?.filter(item =>
                item.label.toLowerCase().includes(itemSearchText.toLowerCase())
            );

            setFilteredItems(filteredItems)
        }


    }, [itemSearchText])

    useEffect(() => {
        if (showBinPop && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100); // Small delay to ensure modal renders before focusing
        }
    }, [showBinPop]);

    console.log('BinItems', BinItems[0])

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showBinPop}
            onRequestClose={() => setShowBinPop(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 10,

                    }}>
                        <Text style={styles.modalTitle}>Search Bin</Text>

                        <TouchableOpacity
                            onPress={() => setShowBinPop(false)}
                        >
                            <Image style={{
                                width: 25,
                                height: 25
                            }} source={require('../images/closeImg.png')} />
                        </TouchableOpacity>
                    </View>


                    <View style={styles.SearchCont}>

                        <View style={[styles.inputContainer, {
                            width: '100%',
                            marginBottom: 0
                        }]}>
                            <TextInput
                                ref={inputRef}
                                style={styles.input}
                                value={itemSearchText}
                                onChangeText={text => setItemSearchText(text)}
                                placeholder="Search Bin"
                                placeholderTextColor="grey"
                            />
                        </View>


                    </View>

                    {/* Filtered List */}
                    {
                        // itemSearchText.length > 0 &&
                        (
                            <View style={styles.listContainer}>

                                {filteredItems?.length === 0 ? (
                                    <View style={styles.noDataContainer}>
                                        <Text style={styles.noDataText}>No Data</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={filteredItems}
                                        keyExtractor={(item) => item.label}
                                        renderItem={({ item }) => (

                                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                                <TouchableOpacity
                                                    style={styles.listItem}
                                                    onPress={() => {
                                                        Keyboard.dismiss()
                                                        setBinValue(item.value)
                                                        setShowBinPop(false)
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

                    {/* Table Header */}
                    {/* <View style={styles.tableHeader}>
                        <Text style={styles.headerText}>Code</Text>
                        <Text style={styles.headerText}>Description</Text>
                        <Text style={styles.headerText}>Qty</Text>
                    </View> */}

                    {/* Scrollable Table Content */}
                    {/* <View style={styles.scrollContainer}>
                        <FlatList
                            data={selectedUnBinnedItemList}
                            keyExtractor={(item) => item.Code}
                            renderItem={({ item }) => (
                                <View style={styles.listItem}>
                                    <Text style={styles.itemText}>{item.Code}</Text>
                                    <Text style={styles.itemText}>{item.Description}</Text>
                                    <Text style={styles.itemText}>{item.Qty}</Text>
                                </View>
                            )}
                        />
                    </View> */}

                    {/* Close Button */}
                    {/* <Button title="Close" onPress={() => setModalVisible(false)} /> */}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: 500, // Fixed height
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
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
        color: 'black',
        fontFamily: 'Lexend-Regular',
        flex: 1,
        textAlign: 'center',
    },
    scrollContainer: {
        height: 300, // Scrollable content inside fixed height
        width: '100%',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    itemText: {
        fontSize: 12,
        color: 'black',
        fontFamily: 'Lexend-Regular',
        flex: 1,
        textAlign: 'center',
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
        width: '100%',
        height: 350, // Fixed height for scrollable list
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
        color: 'grey',
        fontFamily: 'Lexend-Regular'
    },
});


export default SearchBinPop