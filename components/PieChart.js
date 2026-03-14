import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Button } from 'react-native';

const PieChartComp = () => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSlice, setSelectedSlice] = useState(null);

    const data = [
        { key: 1, amount: 50, svg: { fill: '#600080', onPress: () => handleSlicePress(1) } },
        { key: 2, amount: 50, svg: { fill: '#9900cc', onPress: () => handleSlicePress(2) } },
        { key: 3, amount: 40, svg: { fill: '#c61aff', onPress: () => handleSlicePress(3) } },
        { key: 4, amount: 95, svg: { fill: '#d966ff', onPress: () => handleSlicePress(4) } },
        { key: 5, amount: 35, svg: { fill: '#ecb3ff', onPress: () => handleSlicePress(5) } },
    ];

    const handleSlicePress = (index) => {
        setSelectedSlice(index);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedSlice(null);
    };

    return (
        <>
           
            <View style={styles.container}>
                <Text>DATATA</Text>

                <Modal
                    transparent={true}
                    visible={isModalVisible}
                    animationType="slide"
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.toolbarText}>Toolbar for slice {selectedSlice}</Text>
                            <Button title="Close" onPress={closeModal} />
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'green'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 250,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    toolbarText: {
        marginBottom: 20,
        fontSize: 18,
    },
});

export default PieChartComp;
