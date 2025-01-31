import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image, ActivityIndicator, PermissionsAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderUiNew from './HeaderUiNew'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import data from '../url/statement.json';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';


const CollectionReport = () => {

    const [apiData, setApiData] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [showError, setShowError] = useState('')

    const [cashSum, setCashSum] = useState(0);
    const [chequeSum, setChequeSum] = useState(0);
    const [cashSalesSum, setCashSalesSum] = useState(0);

    const [salesperson, setSalesPerson] = useState('')
    const [cmpCode, setCmpCode] = useState('')
    const [deptNo, setDeptno] = useState('')
    const [van, setVan] = useState('')
    const [salesName, setSalseName] = useState('')

    const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
    const [fromData, setFromData] = useState(null);

    const [appUrl, setAppUrl] = useState('')

    const [pdfUri, setPdfUri] = useState(null);

    const [pdfUriColl, setPdfUriColl] = useState(null);

    const [salesManName, setSalesManName] = useState('')

    const [cmpName, setCmopName] = useState('')

    const [selectedStock, setSelectedStock] = useState(null)


    const getCurrentFormattedDateTime = () => {
        const currentDate = new Date();
        return format(currentDate, 'dd-mm-yyyy');
    };

    const formattedDateTime = getCurrentFormattedDateTime();

    const generatePDFColl = async () => {

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


        const htmlNew = `
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
            align-items: center;
        }

        .dateText {
            margin-left: 8px;
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
            /* padding: 12px; */
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

        .header-cell,
        .data-cell {
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
            align-items: center;
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
            margin-left: 24px;
        }

        .RcptVouch {
            display: flex;
            width: 100%;
            flex-direction: row;
            justify-content: flex-end;
        }

        .TextAlignRight {
            text-align: right;
            margin: 6px;
        }

        .RcptVouchDate {
            display: flex;
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
        }

        .RxcWithThanks {
            display: flex;
            justify-content: flex-start;
            width: 100%;
        }

        .margin8 {
            margin: 8px;
        }

        .CollAmnt {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .AmntBox {
            display: flex;
            justify-content: center;
            width: 20%;
        }

        .AmntBorder {
            border: 1px solid grey;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 4px;
        }

        .SignatureBox {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-top: 200px;
            margin-right: 40px;
        }

        .SignCont {
            display: flex;
            flex-direction: column;
        }

          .TopBottBorder {
            border-top: 1px solid black;
            border-bottom: 1px solid black;
            width: 100%;
            padding: 24px 0PX;
        }
    </style>
</head>

<body>
    <div class="table-container">

       <div class="statementHead">
            <div>
                <h4 class="margin8">${cmpName}</h4>
            </div>
        </div>
       <div class="statementHead">
            <div>
                <h4 class="margin8">Receipt</h4>
            </div>
        </div>


      <div class="TopBottBorder">
            <div class="RcptVouch">   
                <span>
                    <h4 class="TextAlignRight"> Receipt Voucher</h4>
                </span>   
            </div>
    
            <div class="RcptVouch">
                <span class="TextAlignRight">Date: </span>
                <span class="TextAlignRight">${formattedDateTime}</span>    
            </div>
    
            <div class="RxcWithThanks">
                <span class="margin8">Received with Thanks from : ${selectedStock['Customer Name']}</span>
            </div>
           
            <div class="CollAmnt">
                <span class="margin8">Collection Type : ${selectedStock.Type === 'cash-collection' ? 'CASH' : selectedStock.Type === 'cheque-collection' ? 'CHEQUE' : ""}</span>
    
                <div class="AmntBox">
                    <span class="margin8 ">Amount:</span>
                    <span class="AmntBorder">${(selectedStock.rv_no).toFixed(3)}</span>
                </div>
            </div>
      </div>

        <div class="SignatureBox">

            <div class="SignCont">
                <span style="margin:12px 0px;">Signature</span>

                <span>${salesManName}</span>
            </div>
        </div>


    </div>
</body>

</html>

`


        let options = {

            html: htmlNew,
            fileName: 'Collection',
            directory: 'Documents',
        };

        try {
            const file = await RNHTMLtoPDF.convert(options);
            setPdfUriColl(`file://${file.filePath}`);
            await Share.open({
                title: 'Share Order Details PDF',
                url: `file://${file.filePath}`,
            });
        } catch (error) {
            console.error(error);
        } finally {
            selectedStock('')
        }
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


        const htmlString = `
        <div style="padding: 10px;">
            <div style="display: flex; flex-direction: column; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; padding:8px;">
                    <span style="font-weight: bold;">Date</span>
                    <span style="margin: 0 6px;">:</span>
                    <span>${fromData}</span>
                </div>
                <div style="display: flex; align-items: center; padding:8px;">
                    <span style="font-weight: bold;">Location</span>
                    <span style="margin: 0 6px;">:</span>
                    <span>${van}</span>
                </div>
                <div style="display: flex; align-items: center; padding:8px;">
                    <span style="font-weight: bold;">Salesperson</span>
                    <span style="margin: 0 6px;">:</span>
                    <span>${salesName}</span>
                </div>
              
            </div>
        
            <div style="border: 1px solid #ccc; border-radius: 4px;">
                <div style="display: flex; background-color: #f0f0f0;">
                    <div style="padding: 8px; font-weight: bold; border-top-left-radius: 4px; width: 20%;">Rv No</div>
                    <div style="padding: 8px; font-weight: bold; width: 50%;">Customer</div>
                    <div style="padding: 8px; font-weight: bold; border-top-right-radius: 4px; width: 30%;">Amount</div>
                </div>
        
                ${apiData && apiData.length > 0 ? `
                    ${cashSum !== 0 ? `<div><span style="font-weight: bold; border-bottom:1px solid orange; margin: 4px 0px;">Cash Sales</span></div>` : ''}
                    ${apiData.filter(item => item.Type === "CASH-SALES").map((item, index) => `
                        <div style="display: flex;" key="${index}">
                            <div style="padding: 8px; width: 20%;">${item.rv_no}</div>
                            <div style="padding: 8px; width: 50%;">${item['Customer Name']}</div>
                            <div style="padding: 8px; width: 30%;">${(item.Amount).toFixed(3)}</div>
                        </div>
                    `).join('')}
                    ${cashSum !== 0 ? `
                        <div style="display: flex; font-weight: bold;">
                            <div style="padding: 8px; width: 20%;">Total</div>
                            <div style="padding: 8px; width: 50%;"></div>
                            <div style="padding: 8px; width: 30%;">${(cashSum).toFixed(3)}</div>
                        </div>
                    ` : ''}

                      ${cashSalesSum !== 0 ? `<div><span style="font-weight: bold; margin-top:24px; border-bottom:1px solid orange; margin: 4px 0px;">Cash Collection</span></div>` : ''}
                    ${apiData.filter(item => item.Type === "cash-collection").map((item, index) => `
                        <div style="display: flex;" key="${index}">
                            <div style="padding: 8px; width: 20%;">${item.rv_no}</div>
                            <div style="padding: 8px; width: 50%;">${item['Customer Name']}</div>
                            <div style="padding: 8px; width: 30%;">${(item.Amount).toFixed(3)}</div>
                        </div>
                    `).join('')}
                    ${cashSalesSum !== 0 ? `
                        <div style="display: flex; font-weight: bold;">
                            <div style="padding: 8px; width: 20%;">Total</div>
                            <div style="padding: 8px; width: 50%;"></div>
                            <div style="padding: 8px; width: 30%;">${(cashSalesSum).toFixed(3)}</div>
                        </div>
                    ` : ''}


                        <div style="display: flex; font-weight: bold;">
                            <div style="padding: 8px; width: 20%;"></div>
                            <div style="padding: 8px; width: 50%;">Balance</div>
                            <div style="padding: 8px; width: 30%;">${(cashSalesSum + cashSum).toFixed(3)}</div>
                        </div>


        
                    ${chequeSum !== 0 ? `<div><span style="font-weight: bold; margin-top:24px; border-bottom:1px solid orange; margin: 4px 0px;">Cheque Collection</span></div>` : ''}
                    ${apiData.filter(item => item.Type === "cheque-collection").map((item, index) => `
                        <div style="display: flex;" key="${index}">
                            <div style="padding: 8px; width: 20%;">${item.rv_no}</div>
                            <div style="padding: 8px; width: 50%;">${item['Customer Name']}</div>
                            <div style="padding: 8px; width: 30%;">${(item.Amount).toFixed(3)}</div>
                        </div>
                    `).join('')}
                    ${chequeSum !== 0 ? `
                        <div style="display: flex; font-weight: bold;">
                            <div style="padding: 8px; width: 20%;">Total</div>
                            <div style="padding: 8px; width: 50%;"></div>
                            <div style="padding: 8px; width: 30%;">${(chequeSum).toFixed(3)}</div>
                        </div>
                    ` : ''}
                ` : ''}
            </div>
        </div>
        `;

        // console.log(htmlString);



        let options = {

            html: htmlString,
            fileName: 'CollectionsReport',
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

    const handleCustomerCollectionPrint = async (item) => {
        setSelectedStock(item)
    }

    useEffect(() => {
        if (selectedStock) {
            generatePDFColl()
        }
    }, [selectedStock])

    const fetchAsyncData = async () => {
        try {
            const salesMan = await AsyncStorage.getItem('sales_man')
            const deptno = await AsyncStorage.getItem('DEPTNO')
            const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
            const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

            const van = await AsyncStorage.getItem('VAN')
            const salesName = await AsyncStorage.getItem('salesman_name')

            const appUrl = await AsyncStorage.getItem('appUrl')

            const salesManName = await AsyncStorage.getItem('salesman_name')

            const portNoData = await AsyncStorage.getItem('portNoData')

            if (portNoData) {
                // setCmpName(portNoData[0].COMPNAME)

                console.log('portNoData', portNoData)

                const dataArray = JSON.parse(portNoData);
                setCmpCode(dataArray[0].COMPID)
                setCmopName(dataArray[0].COMPNAME)
            }

            if (salesManName) {
                setSalesManName(salesManName)
            }


            // const loginData = await AsyncStorage.getItem('loginData')

            // if (loginData) {
            //     console.log('loginData', loginData)
            // }

            if (appUrl) {
                console.log('appUrl', appUrl)
                setAppUrl(appUrl)
            }

            if (van) {
                setVan(van)
            }

            if (salesName) {
                setSalseName(salesName)
            }

            if (parsedUserDataArray) {
                setCmpCode(parsedUserDataArray[0].cmpcode.trim())
            }
            if (deptno) {
                setDeptno(deptno)
            }
            if (salesMan) {
                setSalesPerson(salesMan)
            }

        } catch (error) {
            console.log('fetchAsyncDataError', error)
        }
    }

    const fetchCollectionData = async () => {
        setShowLoader(true)
        console.log('apiCollection', `${appUrl}DailyReport/${cmpCode}/COLLECTION/${deptNo}/${salesperson}/${fromData}`)
        try {
            const response = await axios.get(`${appUrl}DailyReport/${cmpCode}/COLLECTION/${deptNo}/${salesperson}/${fromData}`)


            if (response.status === 200) {
                setApiData(response.data)
                setShowLoader(false)
            }
        } catch (error) {
            console.log('fetchCollectionData', error)
            setShowLoader(false)
            setShowError('Some Error Occured')
        }
    }

    useEffect(() => {
        if (cmpCode && deptNo && salesperson && fromData && appUrl) {
            fetchCollectionData()
        }
    }, [cmpCode, deptNo, salesperson, fromData, appUrl])

    useEffect(() => {
        if (cmpCode && deptNo && salesperson) {
            const date = new Date();
            const formattedDate = format(date, 'yyyy-MM-dd');
            setFromData(formattedDate);
        }
    }, [cmpCode, deptNo, salesperson])

    useEffect(() => {
        if (apiData) {
            const cashItems = apiData.filter(item => item.Type === "CASH-SALES");
            const chequeItems = apiData.filter(item => item.Type === "cheque-collection");
            const cahsSalesItems = apiData.filter(item => item.Type === "cash-collection");

            const cashTotal = cashItems.reduce((sum, item) => sum + item.Amount, 0);
            const chequeTotal = chequeItems.reduce((sum, item) => sum + item.Amount, 0);
            const cashSaleTotal = cahsSalesItems.reduce((sum, item) => sum + item.Amount, 0);

            setCashSum(cashTotal)
            setChequeSum(chequeTotal)
            setCashSalesSum(cashSaleTotal)

        }
    }, [apiData])

    useEffect(() => {
        fetchAsyncData()
    }, [])

    console.log('fromData', fromData)

    console.log('apiData', apiData)

    console.log('cashSum', cashSum)
    console.log('chequeSum', chequeSum)

    return (
        <View style={styles.HomeWrap}>

            <HeaderUiNew name={'Collection Report'} />

            <View style={styles.HomeCont}>

                <View style={styles.TopHeader}>

                    <View style={styles.TopHeaderCols}>
                        <Text style={styles.TopHeaderText}>Date</Text>
                        <Text style={[styles.TopHeaderText, { marginHorizontal: 6 }]}>:</Text>
                        <TouchableOpacity style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }} onPress={showFromDatePicker}>
                            <Text style={styles.TopHeaderText}>{fromData}</Text>
                            <Image style={styles.DropImg} source={require('../images/drop.png')}></Image>
                        </TouchableOpacity>

                        <DateTimePickerModal
                            isVisible={isFromDatePickerVisible}
                            mode="date"
                            onConfirm={handleFromDateConfirm}
                            onCancel={hideFromDatePicker}
                        />
                    </View>

                    <View style={styles.TopHeaderCols}>
                        <Text style={styles.TopHeaderText}>Location</Text>
                        <Text style={[styles.TopHeaderText, { marginHorizontal: 6 }]}>:</Text>
                        <Text style={styles.TopHeaderText}>{van}</Text>
                    </View>

                    <View style={styles.TopHeaderCols}>
                        <Text style={styles.TopHeaderText}>Salesperson</Text>
                        <Text style={[styles.TopHeaderText, { marginHorizontal: 6 }]}>:</Text>
                        <Text style={styles.TopHeaderText}>{salesName}</Text>
                    </View>

                    <TouchableOpacity style={styles.AcceptButton} onPress={() => generatePDF()}>
                        <Text style={styles.AcceptText}>Print</Text>
                    </TouchableOpacity>

                </View>

                {
                    showLoader &&
                    <ActivityIndicator />
                }

                {
                    apiData && apiData.length === 0 &&
                    <View>
                        <Text style={{
                            color: 'red'
                        }}>No data available</Text>
                    </View>
                }

                {
                    showError &&
                    <View>
                        <Text style={{
                            color: 'red'
                        }}>{showError}</Text>
                    </View>
                }

                <ScrollView horizontal={true} style={{ width: '100%' }}>
                    <View style={styles.TableContainer}>

                        {
                            apiData && apiData.length > 0 &&

                            <ScrollView contentContainerStyle={styles.ScrollView} nestedScrollEnabled={true}>

                                <View style={styles.tableRow}>
                                    <Text
                                        style={[styles.headerCell, {
                                            borderTopLeftRadius: 4,

                                        }]}
                                    >
                                        Rv No
                                    </Text>
                                    <Text style={[styles.headerCell, { width: 150 }]}>
                                        Customer
                                    </Text>
                                    <Text style={[styles.headerCell, {}]}>
                                        Amount
                                    </Text>
                                    <Text
                                        style={[styles.headerCell, {
                                            // borderTopRightRadius: 4,

                                        }]}
                                    >
                                        Remarks
                                    </Text>
                                    <Text
                                        style={[styles.headerCell, {
                                            borderTopRightRadius: 4,

                                        }]}
                                    >
                                        print
                                    </Text>
                                </View>

                                {
                                    cashSum !== 0 &&
                                    <View>
                                        <Text style={styles.CashChequeText}>Cash Sales</Text>
                                    </View>
                                }
                                {
                                    apiData && apiData.length > 0 && apiData.map((item, index) => (
                                        item.Type === "CASH-SALES" &&
                                        (
                                            <>
                                                <View style={styles.tableRow} key={index}>
                                                    <Text style={[styles.dataCell, {}]}>{item.rv_no}</Text>
                                                    <Text style={[styles.dataCell, { width: 150 }]}>{item['Customer Name']}</Text>
                                                    <Text style={[styles.dataCell, {}]}>{parseFloat(item.Amount).toFixed(3)}</Text>
                                                    <Text style={[styles.dataCell, {}]}>{item.Remarks}</Text>
                                                    <View style={[styles.dataCell, {}]}>
                                                        <TouchableOpacity style={[styles.PrintAcceptButton,]} onPress={() => handleCustomerCollectionPrint(item)}>
                                                            <Text style={styles.PrintAcceptText}>Print</Text>
                                                        </TouchableOpacity>

                                                    </View>
                                                </View>

                                            </>
                                        )

                                    ))
                                }
                                {
                                    cashSum !== 0 &&
                                    <View style={styles.tableRow}>
                                        <Text style={[styles.dataCell, {}]}>Total</Text>
                                        <Text style={[styles.dataCell, { width: 150 }]}></Text>
                                        <Text style={[styles.dataCell, { borderTopColor: 'orange', borderTopWidth: 2 }, styles.CashChequeText]}>{parseFloat(cashSum).toFixed(3)}</Text>
                                        <Text style={[styles.dataCell, {}]}></Text>
                                        <Text style={[styles.dataCell, {}]}></Text>
                                    </View>
                                }


                                {
                                    cashSalesSum !== 0 &&
                                    <View>
                                        <Text style={styles.CashChequeText}>Cash Collection</Text>
                                    </View>
                                }

                                {
                                    apiData && apiData.length > 0 && apiData.map((item, index) => (
                                        item.Type === "cash-collection" && (
                                            <View style={styles.tableRow} key={index}>
                                                <Text style={[styles.dataCell, {}]}>{item.rv_no}</Text>
                                                <Text style={[styles.dataCell, { width: 150 }]}>{item['Customer Name']}</Text>
                                                <Text style={[styles.dataCell, {}]}>{parseFloat(item.Amount).toFixed(3)}</Text>
                                                <Text style={[styles.dataCell, {}]}>{item.Remarks}</Text>
                                                <View style={[styles.dataCell, {}]}>
                                                    <TouchableOpacity style={[styles.PrintAcceptButton,]} onPress={() => handleCustomerCollectionPrint(item)}>
                                                        <Text style={styles.PrintAcceptText}>Print</Text>
                                                    </TouchableOpacity>

                                                </View>
                                            </View>
                                        )

                                    ))
                                }
                                {
                                    cashSalesSum !== 0 &&
                                    <View style={styles.tableRow}>
                                        <Text style={[styles.dataCell, {}]}>Total</Text>
                                        <Text style={[styles.dataCell, { width: 150 }]}></Text>
                                        <Text style={[styles.dataCell, { borderTopColor: 'orange', borderTopWidth: 2 }, styles.CashChequeText]}>{parseFloat(cashSalesSum).toFixed(3)}</Text>
                                        <Text style={[styles.dataCell, {}]}></Text>
                                        <Text style={[styles.dataCell, {}]}></Text>

                                    </View>
                                }

                                {
                                    cashSalesSum !== 0 &&
                                    <View style={[styles.tableRow, { marginVertical: 6 }]}>
                                        <Text style={[styles.dataCell, {}]}>Cash Balance</Text>
                                        <Text style={[styles.dataCell, { width: 150 }]}></Text>
                                        <Text style={[styles.dataCell, {}, styles.CashChequeText]}>{parseFloat(cashSalesSum + cashSum).toFixed(3)}</Text>
                                        <Text style={[styles.dataCell, {},]}></Text>
                                        <Text style={[styles.dataCell, {},]}></Text>
                                    </View>
                                }



                                {
                                    chequeSum !== 0 &&
                                    <View>
                                        <Text style={styles.CashChequeText}>Cheque Collection</Text>
                                    </View>
                                }

                                {
                                    apiData && apiData.length > 0 && apiData.map((item, index) => (
                                        item.Type === "cheque-collection" && (
                                            <View style={styles.tableRow} key={index}>
                                                <Text style={[styles.dataCell, {}]}>{item.rv_no}</Text>
                                                <Text style={[styles.dataCell, { width: 150 }]}>{item['Customer Name']}</Text>
                                                <Text style={[styles.dataCell, {}]}>{parseFloat(item.Amount).toFixed(3)}</Text>
                                                <Text style={[styles.dataCell, {}]}>{item.Remarks}</Text>
                                                <View style={[styles.dataCell, {}]}>
                                                    <TouchableOpacity style={[styles.PrintAcceptButton,]} onPress={() => handleCustomerCollectionPrint(item)}>
                                                        <Text style={styles.PrintAcceptText}>Print</Text>
                                                    </TouchableOpacity>

                                                </View>
                                            </View>
                                        )

                                    ))
                                }
                                {
                                    chequeSum !== 0 &&
                                    <View style={styles.tableRow}>
                                        <Text style={[styles.dataCell, {}]}>Total</Text>
                                        <Text style={[styles.dataCell, { width: 150 }]}></Text>
                                        <Text style={[styles.dataCell, { borderTopColor: 'orange', borderTopWidth: 2 }, styles.CashChequeText]}>{parseFloat(chequeSum).toFixed(3)}</Text>
                                        <Text style={[styles.dataCell, {}]}></Text>
                                        <Text style={[styles.dataCell, {}]}></Text>
                                    </View>
                                }


                            </ScrollView>
                        }

                    </View>
                </ScrollView>

            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFEFEF'
    },
    HomeCont: {
        width: '98%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        // borderTopLeftRadius: 18,
        // borderTopRightRadius: 18,
        backgroundColor: '#EFEFEF',
        height: Dimensions.get('window').height - 70

    },

    TopHeader: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    TopHeaderCols: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6
    },
    TopHeaderText: {
        fontSize: 16,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
    },
    AcceptButton: {
        backgroundColor: '#30B3A4',
        padding: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',

        position: 'absolute',
        right: 10,
        bottom: 0
    },
    AcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },

    TableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        width: '100%',
        // backgroundColor: 'red'
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        // flex: 1,
        backgroundColor: '#D0D0D0',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 85,
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
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: 85,
        // borderTopWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        // borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },
    ScrollView: {
        // height: Dimensions.get('window').height - 300,
        // marginBottom: 8,
        width: '100%',

        paddingBottom: 250,
        // backgroundColor: 'green'
    },

    CashChequeText: {
        color: '#2b2b2b',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
        paddingVertical: 6
    },

    DropImg: {
        width: 25,
        height: 25, marginHorizontal: 4
    },

    PrintAcceptButton: {
        backgroundColor: '#30B3A4',
        // padding: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    PrintAcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },


})

export default CollectionReport