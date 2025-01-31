import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Button, ScrollView, FlatList, PermissionsAndroid, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import { format } from 'date-fns';
import data from '../url/statement.json';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';


const OutstandingPop = ({ setShowOutstandingPop, privateKey, accountNo, appUrl, cmpcode, setSelectedStock, selectedStock }) => {

    const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
    const [fromData, setFromData] = useState(null);

    const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
    const [toData, setToData] = useState(null);

    const [statementData, setStatementData] = useState(null)

    const [displayData, setDisplayData] = useState(null)
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    const [showLoader, setShowLoader] = useState(false)

    const [errorText, setErrorText] = useState('')

    const [pdfUri, setPdfUri] = useState(null);

    const getCurrentDate = () => {
        return format(new Date(), 'yyyy-MM-dd');
    };


    const generatePDF = async () => {
        // if (Platform.OS === 'android') {
        //     const granted = await PermissionsAndroid.request(
        //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        //         {
        //             title: 'Storage Permission',
        //             message: 'This app needs access to your storage to download the PDF',
        //             buttonNeutral: 'Ask Me Later',
        //             buttonNegative: 'Cancel',
        //             buttonPositive: 'OK',
        //         }
        //     );
        //     if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        //         console.log('Storage permission denied');
        //         return;
        //     }
        // }

        if (Platform.OS === 'android') {
            try {
                console.log('Requesting permission...');
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to download the PDF',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                console.log('Permission result:', granted);
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can use the storage');
                } else {
                    console.log('Storage permission denied');
                }
            } catch (err) {
                console.warn('Permission request error:', err);
            }
        }

        const htmlContent2 = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Table Example</title>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Lexend', sans-serif;
            margin: 0;
            padding: 0;
        }

       .statementHead {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items:center;
        }

        .dateText {
            margin-left:8px;
        }

        .CustomerDetails {
            display: flex;
            flex-direction: column;
            width: 100%;
            padding: 4px 12px;
        }

        .CustomerDetailsTab {
            display: flex;
            flex-direction: row;
            padding: 4px 12px;
        }

        .NameTag {
            width: 130px;
        }

        .ValueTag {
            margin-left: 12px;
        }



        .table-container {
            width: 100%;
            margin-top: 8px;
            align-items: center;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .table {
            width: 100%;
            overflow-x: auto;
            border-collapse: collapse;
        }

        .table-row {
            display: table-row;
        }

        .header-row {
            background-color: #5A55CA;
            color: white;
            font-weight: bold;
        }

        .header-cell, .data-cell {
            padding: 10px;
            text-align: center;
            border: 1px solid #dbdbdb;
           width: 100px;
        }

        .total-values-wrap {
            width: 100%;
            display: flex;
            flex-direction: column;
        }

        .total-cont {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            border: 1px solid #dbdbdb;
            padding-right: 12px;
        }

        .total-label {
            background-color: #5A55CA;
            color: white;
            font-weight: bold;
            text-align: center;
           width: 150px;
            padding: 10px;
        }

        .total-value-text {
            font-size: 16px;
            color: #1A6CF6;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="table-container">

    <div class="statementHead">
        <div><h3>Outstanding Statement of Account ${accountNo}</h3></div>
    </div>

    <div class="CustomerDetails">
        <div class="CustomerDetailsTab">
            <div class="NameTag">Account No</div>
            <div>:</div>
            <div class="ValueTag">${accountNo}</div>
        </div>
        <div class="CustomerDetailsTab">
            <div class="NameTag">Customer Name</div>
            <div>:</div>
            <div class="ValueTag">${selectedStock.Custname}</div>
        </div>
        <div class="CustomerDetailsTab">
            <div class="NameTag">Address</div>
            <div>:</div>
            <div class="ValueTag">
                ${selectedStock.address1} ${selectedStock.address2} ${selectedStock.address3}
            </div>
        </div>
        <div class="CustomerDetailsTab">
            <div class="NameTag">From Date</div>
            <div>:</div>
            <div class="ValueTag">${fromData}</div>
        </div>
        <div class="CustomerDetailsTab">
            <div class="NameTag">To Date</div>
            <div>:</div>
            <div class="ValueTag">${toData}</div>
        </div>
    </div>



        <table class="table">
            <thead>
                <tr class="table-row header-row">
                    <th class="header-cell">INVDATE</th>
                    <th class="header-cell">INV</th>
                    <th class="header-cell">NAME</th>
                    <th class="header-cell">DESCRIPTION</th>
                    <th class="header-cell">DEBIT</th>
                    <th class="header-cell">CREDIT</th>
                    <th class="header-cell">BALANCE</th>
                </tr>
            </thead>
            <tbody>
                ${displayData && displayData.map(item => `
                    <tr class="table-row">
                        <td class="data-cell">${item.INVDATE.split('T')[0]}</td>
                        <td class="data-cell">${item.INV}</td>
                        <td class="data-cell">${item.NAME}</td>
                        <td class="data-cell">${item.DESCRIPTION}</td>
                       <td class="data-cell">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(item.DEBIT)}</td>
                       <td class="data-cell">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(item.CREDIT)}</td>
                       <td class="data-cell">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(item.BALANCE)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="total-values-wrap">
           <div class="total-cont">
                <div class="total-label">Total Debit</div>
                <div class="total-value-text">${totalDebit && new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(totalDebit)}</div>
            </div>
            <div class="total-cont">
                <div class="total-label">Total Credit</div>
                <div class="total-value-text">${totalCredit && new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(totalCredit)}</div>
            </div>
            <div class="total-cont">
                <div class="total-label">Total Balance</div>
                <div class="total-value-text">${totalBalance && new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(totalBalance)}</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

        {/* <div class="total-values-wrap">
<div class="total-cont">
    <div class="total-label">Total Debit</div>
    <div class="total-value-text">${totalDebit && (totalDebit).toFixed(3)}</div>
</div>
<div class="total-cont">
    <div class="total-label">Total Credit</div>
    <div class="total-value-text">${totalCredit && (totalCredit).toFixed(3)}</div>
</div>
<div class="total-cont">
    <div class="total-label">Total Balance</div>
    <div class="total-value-text">${totalBalance && (totalBalance).toFixed(3)}</div>
</div>
</div> */}


        let options = {

            html: htmlContent2,
            fileName: 'oustanding',
            directory: 'Documents',
        };

        try {
            const file = await RNHTMLtoPDF.convert(options);
            setPdfUri(`file://${file.filePath}`);
            await Share.open({
                title: 'Share Order Details PDF',
                url: `file://${file.filePath}`,
            });
        } catch (error) {
            console.error(error);
        }
    };



    // setDisplayData(newData);
    // setTotalDebit(debitTotal);
    // setTotalCredit(creditTotal);
    // setTotalBalance(debitTotal - creditTotal);

    const showFromDatePicker = () => {
        setFromDatePickerVisibility(true);
    };

    const hideFromDatePicker = () => {
        setFromDatePickerVisibility(false);
    };

    const handleFromDateConfirm = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        setFromData(formattedDate);
        hideFromDatePicker();
    };


    const showToDatePicker = () => {
        setToDatePickerVisibility(true);
    };

    const hideToDatePicker = () => {
        setToDatePickerVisibility(false);
    };

    const handleToDateConfirm = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        setToData(formattedDate);
        hideToDatePicker();
    };

    const fetchStatementData = async () => {
        setShowLoader(true)
        console.log(`${appUrl}OutstandingStmt/${cmpcode}/OUT_ACC1/${accountNo}/-/${fromData}/${toData}/-`)
        try {
            const result = await axios.get(`${appUrl}OutstandingStmt/${cmpcode}/OUT_ACC1/${accountNo}/-/${fromData}/${toData}/-`)
            setStatementData(result.data)
            // setDisplayData(result.data);
            console.log('fetchStatementData', result.data)
            setShowLoader(false)
        } catch (error) {
            console.log('fetchStatementDataError', error)
            setShowLoader(false)
            setErrorText('Some Error Occured,Please Try again Later')
        }
    }

    const fetchRunningData = () => {
        try {
            // Calculate running balance
            let runningBalance = 0;
            let debitTotal = 0;
            let creditTotal = 0;

            const newData = statementData.map(entry => {
                debitTotal += entry.DEBIT;
                creditTotal += entry.CREDIT;
                runningBalance = runningBalance + entry.DEBIT - entry.CREDIT;

                return { ...entry, BALANCE: runningBalance };
            });

            setDisplayData(newData);
            setTotalDebit(debitTotal);
            setTotalCredit(creditTotal);
            setTotalBalance(debitTotal - creditTotal);
        } catch (error) {
            console.log('fetchRunningDataError', error)
        }
    }

    // useEffect(() => {
    //     if (fromData && toData) {
    //         fetchStatementData()
    //     }
    // }, [fromData, toData])

    useEffect(() => {
        if (statementData) {
            fetchRunningData()
        }
    }, [statementData])

    useEffect(() => {
        const currentDate = getCurrentDate();

        setFromData(currentDate)
        // setToData(currentDate)
    }, [])

    const goBack = () => {
        setSelectedStock(null)
        setShowOutstandingPop(false)
    }

    const formatNumber = (number, decimals = 2) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(number);
    };


    // console.log('privateKey', privateKey)
    // console.log('statementData', statementData)
    console.log('displayData', displayData)
    // console.log('debitTotal', totalDebit)
    // console.log('creditTotal', totalCredit)
    // console.log('totalBalance', totalBalance)
    // console.log('jsonfiledata', data)

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

                <View style={styles.HomeTextCont}>
                    <TouchableOpacity style={styles.SettingsWrap} onPress={() => goBack()}>
                        <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                    </TouchableOpacity>
                    <Text style={styles.HomeText}>Outstanding Statement</Text>
                </View>

                <View style={styles.FromToDateButtonWrap}>

                    {/* <View style={styles.DateButtonWrap}>
                        <TouchableOpacity style={styles.DetailsButton} onPress={showFromDatePicker}>
                            <Text style={styles.DetailsText}>FromDate</Text>
                        </TouchableOpacity>

                        {fromData && (
                            <Text style={styles.dateText}>
                                {fromData}
                            </Text>
                        )}
                    </View> */}

                    <View style={styles.DateButtonWrap}>
                        <TouchableOpacity style={styles.DetailsButton} onPress={showToDatePicker}>
                            <Text style={styles.DetailsText}>As on Date</Text>
                        </TouchableOpacity>

                        {toData && (
                            <Text style={styles.dateText}>
                                {toData}
                            </Text>
                        )}
                    </View>

                    <View>
                        <TouchableOpacity style={styles.ViewButton} onPress={() => fetchStatementData()}>
                            <Text style={styles.ViewText}>View</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 
                    <DateTimePickerModal
                        isVisible={isFromDatePickerVisible}
                        mode="date"
                        onConfirm={handleFromDateConfirm}
                        onCancel={hideFromDatePicker}
                    /> */}

                    <DateTimePickerModal
                        isVisible={isToDatePickerVisible}
                        mode="date"
                        onConfirm={handleToDateConfirm}
                        onCancel={hideToDatePicker}
                    />
                </View>

                {
                    showLoader &&
                    <View>
                        <ActivityIndicator />
                    </View>
                }

                {
                    errorText &&
                    <View>
                        <Text style={styles.ErrorText}>{errorText}</Text>
                    </View>

                }

                {
                    displayData && displayData.length === 0 && !showLoader &&
                    <View>
                        <Text style={styles.ErrorText}>No data available</Text>
                    </View>
                }

                <View style={{
                    marginTop: 8,
                    maxHeight: 560,
                    // minHeight: 200,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                    elevation: 5,
                    flex: 1
                }}>
                    {
                        displayData && displayData.length > 0 &&
                        <>
                            <ScrollView horizontal={true} style={{ width: '100%' }}>

                                <View style={styles.TableContainer}>
                                    <View style={styles.tableRow}>
                                        <Text style={[styles.headerCell, { borderTopLeftRadius: 4 }]}>INVDATE</Text>
                                        <Text style={styles.headerCell}>INV</Text>
                                        <Text style={styles.headerCell}>NAME</Text>
                                        <Text style={styles.headerCell}>DESCRIPTION</Text>
                                        <Text style={styles.headerCell}>DEBIT</Text>
                                        <Text style={styles.headerCell}>CREDIT</Text>
                                        <Text style={[styles.headerCell, { borderTopRightRadius: 4 }]}>BALANCE</Text>
                                    </View>
                                    <ScrollView nestedScrollEnabled={true}>

                                        <FlatList
                                            data={displayData}
                                            keyExtractor={(item, index) => index.toString()}
                                            contentContainerStyle={{}}
                                            renderItem={({ item }) => (
                                                <View style={styles.tableRow}>
                                                    <Text style={styles.dataCell}>{item.INVDATE.split('T')[0]}</Text>
                                                    <Text style={styles.dataCell}>{item.INV}</Text>
                                                    <Text style={styles.dataCell}>{item.NAME}</Text>
                                                    <Text style={styles.dataCell}>{item.DESCRIPTION}</Text>
                                                    <Text style={styles.dataCell}>{formatNumber(item.DEBIT, 3)}</Text>
                                                    <Text style={styles.dataCell}>{formatNumber(item.CREDIT, 3)}</Text>
                                                    <Text style={styles.dataCell}>{formatNumber(item.BALANCE, 3)}</Text>
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

                            <View style={styles.TotalValuesWrap}>
                                <View style={styles.TotalCont}>
                                    <Text style={styles.TotalLabel}>Total Debit</Text>
                                    <Text style={styles.TotalValueText}>{totalDebit && formatNumber(totalDebit, 3)}</Text>
                                </View>
                                <View style={styles.TotalCont}>
                                    <Text style={styles.TotalLabel}>Total Credit</Text>
                                    <Text style={styles.TotalValueText}>{totalCredit && formatNumber(totalCredit, 3)}</Text>
                                </View>
                                <View style={styles.TotalCont}>
                                    <Text style={styles.TotalLabel}>Total Balance</Text>
                                    <Text style={styles.TotalValueText}>{totalBalance && formatNumber(totalBalance, 3)}</Text>
                                </View>
                            </View>
                        </>
                    }
                </View>

                {
                    displayData && displayData.length > 0 &&
                    <View style={styles.PDFWrap}>
                        <TouchableOpacity style={styles.ViewButton} onPress={() => generatePDF()}>
                            <Text style={styles.ViewText}>PDF</Text>
                        </TouchableOpacity>
                    </View>

                }
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
        // paddingHorizontal: 8,
        borderRadius: 5,
        // alignItems: 'center',
        width: '95%',
        minHeight: 750,
        maxHeight: Dimensions.get('window').height - 80
    },

    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#DCDBDB',
        paddingVertical: 10,
        paddingHorizontal: 6
    },
    HomeText: {
        fontSize: 18,
        color: '#1A6CF6',
        // borderBottomColor: 'gold',
        // borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Regular'
    },
    SettingsWrap: {
        // backgroundColor: '#189A2E',
        // backgroundColor: 'red',
        // borderRadius: 50,
        padding: 6
    },
    HeadIcon: {
        width: 20,
        height: 20
    },

    FromToDateButtonWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 12,
        paddingVertical: 12
    },

    DateButtonWrap: {
        flexDirection: 'column',
        alignItems: 'center'

    },
    dateText: {
        fontSize: 14,
        color: '#1A6CF6',
        paddingBottom: 8,
        fontFamily: 'Lexend-Regular'
    },

    ViewButton: {
        backgroundColor: '#30B3A4',
        padding: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    ViewText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },

    TableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
        // paddingBottom: 50,
        // height: 500,

        flex: 1,
        // width: 1200,
    },
    tableRow: {
        flexDirection: 'row',
        width: '100%',
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        // flex: 1,
        // backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 150,
        color: '#2b2b2b',
        fontFamily: 'Lexend-Bold',
        // borderTopWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        // borderColor: '#dbdbdb',

    },
    dataCell: {
        // flex: 1,
        // backgroundColor: '#F3F3F3',
        backgroundColor: '#f1faee',
        padding: 10,
        textAlign: 'center',
        width: 150,
        // borderTopWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        // borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },

    TotalValuesWrap: {
        width: '100%',
        flexDirection: 'column',
        // paddingHorizontal: 8
    },
    TotalCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        paddingRight: 12
    },
    TotalLabel: {
        // backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 150,
        color: '#2b2b2b',
        fontFamily: 'Lexend-Bold',
        // borderTopWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        // borderColor: '#dbdbdb',
    },
    TotalValueText: {
        fontSize: 16,
        color: '#2b2b2b',
        fontFamily: 'Lexend-Bold'
    },


    PDFWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 32
    },
    PDFButton: {
        backgroundColor: '#1A6CF6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 4

    },
    PDFText: {
        fontFamily: 'Lexend-Regular',
        color: "white",
        fontSize: 14
    },

    ErrorText: {
        fontSize: 16,
        color: 'red',
        fontFamily: 'Lexend-Bold'
    },

    DetailsButton: {
        backgroundColor: '#D8D8DA',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    DetailsText: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Lexend-Regular',
    },



})

export default OutstandingPop