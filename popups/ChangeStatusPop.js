import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Picker } from '@react-native-picker/picker';
import REACT_APP_BASE_URL from '../url/AppUrl';
import axios from 'axios';


const ChangeStatusPop = ({ setShowChangeStatus, orderId, salesMan }) => {

    const [selectedValue, setSelectedValue] = useState('')
    const [statusList, setStatusList] = useState(null)

    const fetchOrderStatusList = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BASE_URL}OrderStatusChange/order`);
            console.log(response.data);
            if (response.status === 200) {
                setStatusList(response.data)
            }
        } catch (error) {
            console.error("fetchOrderStatusList Error", error);
        }
    }

    const saveStatus = async () => {
        const arrayToSend = [{
            So_no: orderId,
            changeuser: salesMan,
            statusto: selectedValue
        }]

        try {
            const response = await axios.post(`${REACT_APP_BASE_URL}OrderStatusChange/`, arrayToSend);
            console.log(response.data);
            if (response.status === 200) {
                setShowChangeStatus(false)
            }
        } catch (error) {
            console.error("saveStatus Error", error);
        }
    }

    useEffect(() => {
        fetchOrderStatusList()
    }, [])

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

                <View style={styles.ChangeStatusHead}>
                    <Text style={styles.HeadText}>
                        Change status
                    </Text>
                </View>

                <View style={styles.PickerWrap}>
                    <Picker
                        selectedValue={selectedValue}
                        style={styles.picker}
                        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                    >
                        {
                            statusList && statusList.map((item, index) => (
                                <Picker.Item label={item} value={item} key={index} />

                            ))
                        }
                        <Picker.Item label="" value="" />
                        <Picker.Item label="status1" value="1" />
                        <Picker.Item label="status2" value="2" />

                    </Picker>
                </View>

                <View style={styles.UpdateWrap}>
                    <TouchableOpacity style={styles.DeleteButton} onPress={() => setShowChangeStatus(false)}>
                        <Text style={styles.DeleteText}>Cancel</Text>
                    </TouchableOpacity>
                    {
                        selectedValue &&
                        <TouchableOpacity style={styles.EditButton} onPress={() => saveStatus()}>
                            <Text style={styles.EditText}>Save</Text>
                        </TouchableOpacity>
                    }
                </View>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContent: {
        // backgroundColor: '#F7F7F7',
        // backgroundColor: '#5A55CA',
        backgroundColor: 'white',
        // padding: 8,
        borderRadius: 5,
        alignItems: 'center',
        width: '95%',
        // minHeight: 500,
        // maxHeight: Dimensions.get('window').height
        height: 200
    },
    ChangeStatusHead: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#5A55CA',
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    },
    HeadText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    selectedValue: {
        marginTop: 20,
        fontSize: 16,
    },
    PickerWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        borderColor: '#5A55CA',  // Change this to your desired border color
        borderWidth: 1,
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 12
    },
    UpdateWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 6
    },
    EditButton: {
        backgroundColor: 'green',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 4,
        // marginRight: 6
        marginLeft: 35
    },
    EditText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
    },
    DeleteButton: {
        backgroundColor: 'red',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 6
    },
    DeleteText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
    }
})

export default ChangeStatusPop