import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'

const TaskFilterPop = () => {
    return (
        <View style={styles.TaskFilterWrapper}>
            <View style={styles.TaskFilterCont}>

                <View style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 8
                }}>
                    <Text>Filter</Text>
                    <TouchableOpacity>Reset</TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    TaskFilterWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
        // justifyContent: 'center',
        // alignItems: 'center',
        // top: '12%'
    },
    TaskFilterCont: {
        backgroundColor: '#F7F7F7',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '94%',
        height: 280
    },
})

export default TaskFilterPop