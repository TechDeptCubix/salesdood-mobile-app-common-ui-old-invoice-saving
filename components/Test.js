import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Button } from 'react-native';
import { PieChart } from 'react-native-svg-charts';


const PieChartExample = () => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSlice, setSelectedSlice] = useState(null);

    const data = [50, 10, 40, 95, 85, 91, 35, 53, 24, 50];

    const randomColor = () => ('#' + ((Math.random() * 0xffffff) << 0).toString(16) + '000000').slice(0, 7);

    const handleSlicePress = (index) => {
        console.log('Slice pressed:', index); // Debug log
        setSelectedSlice(index);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedSlice(null);
    };

    const pieData = data.map((value, index) => ({
        value,
        svg: {
            fill: randomColor(),
            onPress: () => handleSlicePress(index),
        },
        key: `pie-${index}`,
    }));

    return (
        <>
            <PieChart style={{ height: 200, width: '100%' }} data={pieData} />
            {/* <View style={styles.container}>

                <Modal
                    transparent={true}
                    visible={isModalVisible}
                    animationType="slide"
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.toolbarText}>Toolbar for slice {selectedSlice + 1}</Text>
                            <Button title="Close" onPress={closeModal} />
                        </View>
                    </View>
                </Modal>
            </View> */}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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

export default PieChartExample;
