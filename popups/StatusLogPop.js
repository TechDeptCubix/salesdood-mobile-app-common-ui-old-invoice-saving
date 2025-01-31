import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import REACT_APP_BASE_URL from '../url/AppUrl';
import axios from 'axios';

const StatusLogPop = ({ orderIdPop, setShowStatusLogPop }) => {

    const [statusLog, setStatusLog] = useState(null)

    const fetchStatusLog = async (orderId) => {

        try {
            const response = await axios.get(`${REACT_APP_BASE_URL}PreviousOrderStatus/Get?type=asda&desc=${orderId}`);
            console.log(response.data); // You can handle the response data here
            if (response.status === 200) {
                setStatusLog(response.data)
            }
        } catch (error) {
            console.error("ViewStatusLogAction Error", error);
        }

        console.log(`${REACT_APP_BASE_URL}PreviousOrderStatus/Get?type=asda&desc=${orderId}`);
    }

    useEffect(() => {
        fetchStatusLog(orderIdPop)
    }, [orderIdPop])

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

                <View style={styles.ChangeStatusHead}>
                    <Text style={styles.HeadText}>
                        Status Log
                    </Text>

                    <View>
                        <TouchableOpacity style={styles.SettingsWrap} onPress={() => setShowStatusLogPop(false)}>
                            <Image style={styles.HeadIcon} source={require('../images/closeWhiteImg.png')} />
                        </TouchableOpacity>
                    </View>
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
    },
    SettingsWrap: {
        backgroundColor: '#189A2E',
        backgroundColor: 'red',
        borderRadius: 50,
        padding: 6
    },
    HeadIcon: {
        width: 20,
        height: 20
    },
})

export default StatusLogPop