import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'

const CashBalancePop = ({ setShowCashBalancePop, cashBalanceData }) => {

    console.log('cashBalanceData', cashBalanceData)
    return (
        <View style={styles.modalContainer}>

            <View style={styles.modalContent}>

                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center'
                }}>
                    <Text style={{ fontSize: 18 }}>Cash Balance</Text>
                    <TouchableOpacity style={{ backgroundColor: 'red', borderRadius: 4 }} onPress={() => setShowCashBalancePop(false)}>
                        <Text style={{ color: 'white', fontSize: 18, paddingHorizontal: 8, paddingVertical: 4 }}>Close</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView>
                    <ScrollView horizontal={true}>
                        <View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                                <Text style={styles.headerCell}>Account</Text>
                                <Text style={styles.headerCell}>Name</Text>
                                <Text style={styles.headerCell}>Cash</Text>
                                <Text style={styles.headerCell}>Deptno</Text>
                            </View>

                            {
                                cashBalanceData && cashBalanceData.length > 0 && cashBalanceData.map((item, index) => (
                                    <View style={styles.tableRow} key={index}>
                                        <Text style={styles.dataCell}>{item.Account}</Text>
                                        <Text style={styles.dataCell}>{item.Name}</Text>
                                        <Text style={styles.dataCell}>{item.CASH}</Text>
                                        <Text style={styles.dataCell}>{item.Deptno.trim() !== '' ? item.Deptno : 'Nil'}</Text>
                                    </View>

                                ))
                            }

                            {
                                cashBalanceData === null &&

                                <ActivityIndicator />
                            }

                            {
                                cashBalanceData.length === 0 &&
                                <View>
                                    <Text style={{
                                        color: 'red'
                                    }}>No data available</Text>
                                </View>
                            }

                        </View>
                    </ScrollView>
                </ScrollView>

                <View>

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
        backgroundColor: '#F7F7F7',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '94%',
        maxHeight: 500
    },

    container: {
        width: '100%',
        marginTop: 10,
        // borderWidth: 1,
        // borderColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    cell: {
        flex: 1,
        padding: 10,
        fontSize: 16,
    },
    header: {
        fontWeight: 'bold',

    },
    rightAlign: {
        textAlign: 'right',
    },
    tableBody: {
        backgroundColor: '#f3f3f3',

    },

    TableContainer: {
        width: "100%",
        padding: 10,
        marginTop: 8
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        // flex: 1,
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 150
    },
    dataCell: {
        // flex: 1,
        backgroundColor: '#F3F3F3',
        padding: 10,
        textAlign: 'center',
        width: 150,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'white',
        color: "black"
    },
})

export default CashBalancePop