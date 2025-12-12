import React from 'react';
import {
    View,
    Modal,
    Text,
    FlatList,
    StyleSheet,
    Button,
    ScrollView,
    Image,
    TouchableOpacity
} from 'react-native';

const ItemListModal = ({ modalVisible, setModalVisible, selectedUnBinnedItemList }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
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
                        <Text style={styles.modalTitle}>UnBinned Item List</Text>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                        >
                            <Image style={{
                                width: 25,
                                height: 25
                            }} source={require('../images/closeImg.png')} />
                        </TouchableOpacity>
                    </View>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.headerText}>Code</Text>
                        <Text style={styles.headerText}>Description</Text>
                        <Text style={styles.headerText}>Qty</Text>
                    </View>

                    {/* Scrollable Table Content */}
                    <View style={styles.scrollContainer}>
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
                    </View>

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
        height: 400, // Fixed height
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
});

export default ItemListModal;
