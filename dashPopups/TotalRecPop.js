import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;

const TotalIssuedPop = ({ setShowTotalRecPop }) => {

    const [sortOrder, setSortOrder] = useState('asc')

    const [receivedPdcData, setReceivedPdcData] = useState(null)

    const [cmpcode, setCmpCode] = useState(null)
    const [publick, setpublick] = useState(null)
    const [privatek, setprivatek] = useState(null)

    const [showLoader, setShowLoader] = useState(false)

    const initialDate = new Date(2050, 0, 1);

    const [date, setDate] = useState(initialDate);

    const handleSort = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);

        // Sort your data based on ChqDate and sortOrder
        const sortedData = receivedPdcData.slice().sort((a, b) => {
            const dateA = new Date(a.ChqDate);
            const dateB = new Date(b.ChqDate);

            if (newOrder === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });

        sortedData && setReceivedPdcData(sortedData)
    }

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMMM d, yyyy'); // e.g., "May 14, 2024"
    };

    useEffect(() => {
        const fetchData = async () => {
            // Retrieve the selected company details from local storage
            const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

            // console.log('selectedCompanyString', selectedCompanyString)

            // Check if a selected company is stored in local storage
            if (selectedCompanyString) {
                const selectedCompany = JSON.parse(selectedCompanyString);

                // Access the company details and set them as states
                setCmpCode(selectedCompany.cmpcode);
                setpublick(selectedCompany.publick);
                setprivatek(selectedCompany.privatek);
            } else {
                // Handle the case where no selected company is found
                console.error("No selected company found in local storage");
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setShowLoader(true)

        if (cmpcode && privatek) {
            // Get today's date
            const today = new Date();

            // Format the date as 'MM-DD-YYYY'
            const formattedDateToday = format(today, 'MM-dd-yyyy');

            const initDate = format(date, 'MM-dd-yyyy')

            // console.log(formatteddate)
            const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_PDCR&s1=%27test%27&s2=%27test%27&s3=%27test%27&i1=100&i2=0&dt1=${formattedDateToday}&dt2=${initDate}`;
            // console.log('TotalRecPdc', url)
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // console.log('pdcr', data)
                    // Sort the data based on ChqDate in ascending order
                    const sortedData = data.slice().sort((a, b) => {
                        const dateA = new Date(a.ChqDate);
                        const dateB = new Date(b.ChqDate);
                        return dateA - dateB;
                    });

                    setReceivedPdcData(sortedData);
                    setShowLoader(false)
                })
                .catch(error => console.error('Error:', error));
            setShowLoader(false)
        }
    }, [cmpcode, privatek])

    // console.log('receivedPdcData', receivedPdcData)

    console.log(showLoader)


    return (
        <View style={styles.modalContainer}>

            <View style={styles.modalContent}>

                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center'
                }}>
                    <Text style={{ fontSize: 18 }}>Received PDC</Text>
                    <TouchableOpacity style={{ backgroundColor: 'red', borderRadius: 4 }} onPress={() => setShowTotalRecPop(false)}>
                        <Text style={{ color: 'white', fontSize: 18, paddingHorizontal: 8, paddingVertical: 4 }}>Close</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView>

                    <ScrollView horizontal={true}>
                        <View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                                <Text style={styles.headerCell}>Account</Text>
                                <Text style={styles.headerCell}>Amount</Text>
                                <Text style={styles.headerCell}>Bank</Text>
                                <TouchableOpacity style={{ ...styles.headerCell, ...styles.chqDateExtra }} onPress={() => handleSort()}>
                                    <Text style={{ color: 'grey', fontWeight: 'bold' }}>ChqDate</Text>
                                    <Text style={{ color: 'grey', fontSize: 18, fontWeight: 'bold' }}>{sortOrder === 'asc' ? '↑' : '↓'}</Text>
                                </TouchableOpacity>
                                <Text style={styles.headerCell}>Chqno</Text>
                                <Text style={styles.headerCell}>Customer</Text>
                            </View>

                            {/* <ActivityIndicator size={'large'} /> */}


                            <View>
                                {
                                    showLoader &&
                                    <ActivityIndicator size={'large'} />
                                }
                            </View>


                            {
                                receivedPdcData && receivedPdcData.map((item, id) => (
                                    <View style={styles.tableRow} key={id}>
                                        <Text style={styles.dataCell}>{item.Account}</Text>
                                        <Text style={styles.dataCell}>{item.Amount}</Text>
                                        <Text style={styles.dataCell}>{item.Bank}</Text>
                                        <Text style={styles.dataCell}>{formatDate(item.ChqDate)}</Text>
                                        <Text style={styles.dataCell}>{item.Chqno}</Text>
                                        <Text style={styles.dataCell}>{item.Customer}</Text>
                                    </View>
                                ))
                            }

                            {/* <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.dataCell}>ADCB(11816917820001)</Text>
                                <Text style={styles.dataCell}>33806.45</Text>
                                <Text style={styles.dataCell}>BANK123</Text>
                                <Text style={styles.dataCell}>01/01/2022</Text>
                                <Text style={styles.dataCell}>1005</Text>
                                <Text style={styles.dataCell}>ET TRADES</Text>
                            </View> */}

                            {/* {cashBalanceData.map((item, index) => (
                            <View key={index} style={styles.row}>
                            <Text style={styles.cell}>{item.Account}</Text>
                            <Text style={styles.cell}>{item.Name}</Text>
                            <Text style={[styles.cell, styles.rightAlign]}>{item.BANK}</Text>
                            <Text style={styles.cell}>{item.Deptno.trim() !== '' ? item.Deptno : 'Nil'}</Text>
                            </View>
                        ))} */}
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
        width: 150,
        // color: 'grey'
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
    chqDateExtra: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        color: 'grey',
        fontWeight: 'bold',
        alignItems: 'center'
    }
})

export default TotalIssuedPop