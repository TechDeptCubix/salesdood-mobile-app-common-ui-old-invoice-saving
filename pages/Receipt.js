import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Button, FlatList, KeyboardAvoidingView, PermissionsAndroid, Alert } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import Header from './Header'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import HeaderUiNew from './HeaderUiNew'
import StatementPop from '../popups/StatementPop'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OutstandingPop from '../popups/OutstandingPop'
import { format, subDays } from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RadioGroup from 'react-native-radio-buttons-group';
import ToastManager, { Toast } from 'toastify-react-native'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { getReadableDateYYYYMMDD } from './datesFunctions'
import ic_no_select from "../images/ic_no_select_round.png"
import ic_select_round from "../images/ic_select_round.png"
import ic_arrow_down from "../images/ic_arrow_down.png"
import { tr } from 'date-fns/locale'

const Receipt = ({ navigation }) => {


    const [salesManKey, setSalesManKey] = useState("")
    const [salesName, setSalseName] = useState('')
    const [isCallingListOfAccountsApi, setCallingListOfAccountsApi] = useState(false)
    const currentDate = new Date();
    const dnsDate = format(currentDate, 'yyyy-MM-dd');

    console.log('dnsDate', dnsDate)

    const formattedDateTime = getReadableDateYYYYMMDD(currentDate)

    const [currentCDetails, setCurrentCDetails] = useState(
        {
            bank: '',
            chqdate: formattedDateTime,
            chqno: "",
            amount: ""
        }
    )


    const [showListofAccounts, setShowListofAccounts] = useState(false)

    const [currentSelectedAccount, setCurrentSelectedAccount] = useState(null)

    const [listOfAccounts, setListOfAccounts] = useState(null)

    const [currentInvoiceUnderTyping, setCurrentInvoiceUnderTyping] = useState(0)

    // const searchUrl = 'https://cubixweberp.com:203/api/Search_Customer/Cust/'

    const searchUrl = 'https://cubixweberp.com:208/api/Search_Customer/automax/Cust/'

    const [searchItem, setSearchItem] = useState('')

    const [stockData, setStockData] = useState(null)

    const [selectedStock, setSelectedStock] = useState(null)

    const [showActivity, setShowActivity] = useState(false)

    const [top50Customers, setTop50Customers] = useState(null)

    const [showStatementPop, setShowStatementPop] = useState(false)

    const [showOutstandingPop, setShowOutstandingPop] = useState(false)

    const [privateKey, setPrivateKey] = useState('')

    const [accountNo, setAccountNo] = useState('')

    const [fromDate, setFromDate] = useState('')

    const [toDate, setToDate] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [statementData, setStatementData] = useState(null)

    const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);

    const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

    const [selectedtInv, setSelectedInv] = useState([])

    const [selectedtInvTransactions, setSelectedInvTransactions] = useState([])

    const [rvAmnt, setRvAmnt] = useState('')

    const [selectedId, setSelectedId] = useState();

    const [deptno, setDeptno] = useState('')

    const [van, setVan] = useState('')

    const [salesMan, setSalesMan] = useState('')

    const [loading, setLoading] = useState(false)

    const [selectedBalanceSum, setSelectedBalanceSum] = useState(0);

    const [appUrl, setAppUrl] = useState('')

    const [cmpcode, setCmpCode] = useState('')

    const [expandedItems, setExpandedItems] = useState([]);

    const [remarks, setRemarks] = useState('')

    const [result, setResult] = useState(false)

    const [pdfUri, setPdfUri] = useState(null);

    const [salesManName, setSalesManName] = useState('')

    const [cmpName, setCmopName] = useState('')

    // const getCurrentFormattedDateTime = () => {
    //     return format(currentDate, 'yyyy-mm-dd');
    // };




    // const formattedDateTime = getCurrentFormattedDateTime();

    console.log('formattedDateTimeNew', formattedDateTime)


    useEffect(() => {

        console.log("selectedtInvTransactions++++", selectedtInvTransactions)
    }, [selectedtInvTransactions])

    const generatePDF = async () => {

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
            margin-left:24px;
        }
    </style>
</head>
<body>
    <div class="table-container">

        <div class="statementHead">
            <div><h2>Collection Details</h2></div>
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
        </div>


        <table class="table">
            <thead>
                <tr class="table-row header-row">
                    <th class="header-cell">DATE</th>
                    <th class="header-cell">Customer Name</th>
                    <th class="header-cell">RV Amount</th>
                    <th class="header-cell">Type</th>
                </tr>
            </thead>
            <tbody>
            <tr class="table-row">
                <td class="data-cell">${formattedDateTime}</td>
                <td class="data-cell">${selectedStock.Custname}</td>
                <td class="data-cell">${rvAmnt}</td>
                <td class="data-cell">${selectedId === 'cash-collection' ? 'CASH' : selectedId === 'cheque-collection' ? 'CHEQUE' : ""}</td>
            </tr>
             
            </tbody>
        </table>
        <div class="total-values-wrap">
           <div class="total-cont">
                <div class="total-label">Remarks</div>
                <div class="total-value-text">${remarks}</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

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
                <span class="margin8">Received with Thanks from : ${selectedStock.Custname}</span>
            </div>
            <div class="RxcWithThanks">
                <span class="margin8">AccountNo : ${accountNo}</span>
            </div>
            <div class="CollAmnt">
                <span class="margin8">Collection Type : ${selectedId === 'cash-collection' ? 'CASH' : selectedId === 'cheque-collection' ? 'CHEQUE' : ""}</span>
    
                <div class="AmntBox">
                    <span class="margin8 ">Amount:</span>
                    <span class="AmntBorder">${rvAmnt}</span>
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
            setPdfUri(`file://${file.filePath}`);
            await Share.open({
                title: 'Share Order Details PDF',
                url: `file://${file.filePath}`,
            });
        } catch (error) {
            console.error(error);
        } finally {
            resultClosePress()
        }
    };


    const toggleExpand = (account) => {
        setExpandedItems(prevState => {
            if (prevState.includes(account)) {
                return prevState.filter(itemCode => itemCode !== account);
            } else {
                // return [...prevState, account];
                return [account];
            }
        });
    };




    const radioButtons = useMemo(() => ([
        {
            id: 'cash-collection', // acts as primary key, should be unique and non-empty string
            label: 'CASH',
            value: 'cash-collection',
            labelStyle: styles.radioButtonText
        },
        {
            id: 'cheque-collection',
            label: 'CHEQUE',
            value: 'cheque-collection',
            labelStyle: styles.radioButtonText
        }
    ]), []);

    const fetchAsyncData = async () => {
        try {
            const deptno = await AsyncStorage.getItem('DEPTNO')
            const van = await AsyncStorage.getItem('VAN')

            const salesMan = await AsyncStorage.getItem('sales_man')

            const salesManName = await AsyncStorage.getItem('salesman_name')

            const appUrl = await AsyncStorage.getItem('appUrl')

            const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
            const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

            const portNoData = await AsyncStorage.getItem('portNoData')

            const salesName = await AsyncStorage.getItem('salesman_name')

            const salesMankey = await AsyncStorage.getItem('Smankey')

            console.log('parsedUserDataArray appUrl', parsedUserDataArray, appUrl)

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

            if(salesMankey){
                setSalesManKey(salesMankey)
            }

            if (parsedUserDataArray) {
                setCmpCode(parsedUserDataArray[0].cmpcode.trim())
            }

            if (appUrl) {
                setAppUrl(appUrl)
            }

            if (deptno) {
                setDeptno(deptno)
            }
            if (van) {
                setVan(van)
            } else {
                console.log("van falsy value sales man", van, salesMan)

                setVan(salesMan?.trim())
            }
            if (salesMan === '----') {
                const salesManDrop = await AsyncStorage.getItem('sales_man_drop')
                setSalesMan(salesManDrop)
            } else {
                setSalesMan(salesMan)

            }

            if (salesName) {
                setSalseName(salesName)
            }
        } catch (error) {
            console.log('fetchAsyncDataError', error)
        }
    }

    const getListOfAccounts = async () => {

        setCallingListOfAccountsApi(true)
        console.log("inside getListOFAccounts")

        const portNoData = await AsyncStorage.getItem('portNoData')
        const dataArray = JSON.parse(portNoData);
        const companycodetopass = dataArray[0].COMPID

        let apiUrltoCall = `${appUrl}Search_Customer/${companycodetopass}?Mode=RECEIPT_DR&deptno=${deptno}&SEARCH=NA`

        console.log("apiUrltoCall getlistofaccounts >>>", apiUrltoCall)

        axios.get(apiUrltoCall).then((res) => {
            setCallingListOfAccountsApi(false)

            setListOfAccounts(res.data)
            console.log("apiUrltoCall getlistofaccounts >>>++", res.data)

        }).catch((err) => {
            setCallingListOfAccountsApi(false)
        })
    }


    useEffect(() => {
        fetchAsyncData()
        fetchAsyncUserDataArray()

        // fetchAppUrl()
    }, [])


    const postData = async () => {

        if (currentSelectedAccount == null) {
            Alert.alert("Error", "Please select account")
            return
        }

        console.log("if (!accountNo || !deptno || !salesMan  || !selectedId || !van)", !accountNo, !deptno, !salesMan, !selectedId, !van)



        // previously now we hide rv amount field
        // if (!accountNo || !deptno || !salesMan || !rvAmnt || !selectedId || !selectedtInv || !van) {
        //     return showCollectionErrorToast()
        // }

        // will uncomment and check after setting the post request ready
        // if (!accountNo || !deptno || !salesMan || !selectedId || !van) {

        //     console.log("some data missing>>")
        //     return showCollectionErrorToast()
        // }

        //const url = `${appUrl}CollectionRegister`; old

        const portNoData = await AsyncStorage.getItem('portNoData')


        const dataArray = JSON.parse(portNoData);
        const companycodetopass = dataArray[0].COMPID
        const API_CONFIG = dataArray[0].API_CONFIG
        console.log('collectionUrl-->-->company', dataArray, companycodetopass, API_CONFIG)



        const url = `${API_CONFIG}/api/receipt?CmpCode=${companycodetopass}`;

        console.log('collectionUrl-->', url, companycodetopass)



        let arrayToBeSend = selectedtInvTransactions.map((itemMap) => {
            return {
                account: "",
                reference: "", // here pass bill number
                entry_ref: "",
                type: "D",
                amount: Number(itemMap.amount), // here amount
                curno: "AED",
                rate: 0,
                curamount: 0,
                accounty: "1",
                job_code: "",
                sman_cod: "",
                costc: "",
                chqno: "",
                bank: "",
                pdcacc: "",
                chqdate: currentCDetails.chqdate, // here cheque date
                costcode: ""
            }
        })

        let addedCArray = [...arrayToBeSend, {
            account: currentSelectedAccount.Account,
            reference: "", // here pass bill number
            entry_ref: "",
            type: "C",
            amount: arrayToBeSend.reduce((acc, curr) => {

                return Number(curr.amount) + Number(acc)
            }, 0), // here amount
            curno: "AED",
            rate: 0,
            curamount: 0,
            accounty: "1",
            job_code: "",
            sman_cod: "",
            costc: "",
            chqno: currentCDetails.chqno,
            bank: currentCDetails.bank,
            pdcacc: "",
            chqdate: currentCDetails.chqdate, // here cheque date
            costcode: currentSelectedAccount.Accdesc
        }]


        const data = {
            mode: "SAVE",
            jvtype: "RV",
            jnum: " ",
            typE_NO: "121",
            jvdate: "2025-05-07",
            cusT_ACC: "",
            accdesc: "",
            amount: arrayToBeSend.reduce((acc, curr) => {

                return Number(curr.amount) + Number(acc)
            }, 0),
            descript: "",
            deptno: "HO",
            commen: "",
            userid: "",
            reason: "",
            transactions: addedCArray
        }


        const apiData = JSON.stringify(data)

        console.log('collectionData-->', apiData)

        try {
            setLoading(true);
            const response = await axios.post(url, apiData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            setLoading(false);

            console.log("response >>> ", response)

            if (response.status == "200") {
                Alert.alert('Success', 'posted successfully');
                console.log("response.data.result ", response.data.status);

                setResult(true)

                navigation.goBack()
                // setSelectedStock(null)
                // setSelectedInv([])
                // setRvAmnt('')
                // setSelectedId('')
                // setSelectedBalanceSum(0)
                // showCollectionSuccessToast()
            } else {
                // Alert.alert('Error', 'Failed to post data');
                console.log("collection error >>>", response.data);
            }
        } catch (error) {
            setLoading(false);
            showCollectionAPIErrorToast()
            // Alert.alert('Error', 'An error occurred while posting data');
            console.log("collection error >>> +++", error);
        }
    };

    const resultClosePress = () => {
        setResult(false)
        setRemarks('')
        setSelectedStock(null)
        setSelectedInv([])
        setRvAmnt('')
        setSelectedId('')
        setSelectedBalanceSum(0)
        setAccountNo('')
        showCollectionSuccessToast()
    }


    const showCollectionSuccessToast = () => {
        Toast.success(`Collection send Successfully`)
    }

    const showCollectionErrorToast = () => {
        Toast.error(`Some data is missing,`)
    }

    const showCollectionAPIErrorToast = () => {
        Toast.error(`Some Error occured, please try again later`)
    }


    const showFromDatePicker = () => {
        setFromDatePickerVisibility(true);
    };

    const hideFromDatePicker = () => {
        setFromDatePickerVisibility(false);
    };

    const handleFromDateConfirm = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        console.log('formattedFromDate', formattedDate)
        setFromDate(formattedDate);

        setCurrentCDetails({ ...currentCDetails, chqdate: formattedDate })

        // let newArray = selectedtInvTransactions?.map((item) => {
        //     if (item.invoice_number == currentInvoiceUnderTyping) {

        //         return { ...item, chqdate: formattedDate }

        //     } else {
        //         return item
        //     }

        // })

        // setSelectedInvTransactions(newArray)



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
        console.log('formattedToDate', formattedDate)
        setToDate(formattedDate);
        hideToDatePicker();
    };


    const fetchAsyncUserDataArray = async () => {
        try {
            const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
            const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];
            console.log('parsedUserDataArray', parsedUserDataArray)

            if (parsedUserDataArray.length > 0) {
                setPrivateKey(parsedUserDataArray[0].privatek)
            }
        } catch (error) {
            console.log('fetchAsyncUserDataArrayError', error)
        }
    }

    const searchStock = async (value) => {
        setShowActivity(true)
        try {
            await axios.get(`${appUrl}Search_Customer/${cmpcode}/Cust/${value}/${deptno}`)
                .then((res) => {

                    if (cmpcode?.trim().toUpperCase() == "SOCA") {
                        let filteredArrayBasedOnSalesman = res.data.filter((item) => {
                            return item.sale_man?.trim().toUpperCase() == salesName.trim().toUpperCase()
                        })


                        console.log("filteredArrayBasedOnSalesman>>", filteredArrayBasedOnSalesman, salesName.trim().toUpperCase())

                        setStockData(filteredArrayBasedOnSalesman)
                    } else if (cmpcode?.trim().toUpperCase() == "TAMMDOOD") {

                        let filteredArrayBasedOnSalesman = res.data.filter((item) => {
                            return item.sale_man?.trim().toUpperCase() == salesManKey.trim().toUpperCase()
                        })


                        console.log("filteredArrayBasedOnSalesman>>", filteredArrayBasedOnSalesman, salesName.trim().toUpperCase())

                        setStockData(filteredArrayBasedOnSalesman)
                    }

                    else {
                        setStockData(res.data)
                    }


                })
            setShowActivity(false)
        } catch (error) {
            console.log('searchCustomererror', error)
            setShowActivity(false)
        }
    }

    const fetchTop50Customers = async () => {
        setShowActivity(true)
        try {
            console.log('fetchTop50Customers', `${appUrl}Search_Customer/${cmpcode}/Cust50/a/${deptno}`)
            const response = await axios.get(`${appUrl}Search_Customer/${cmpcode}/Cust50/a/${deptno}`);
            // console.log('fetchTop50Customers', response.data);

            if (cmpcode?.trim().toUpperCase() == "SOCA" ) {
                let filteredArrayBasedOnSalesman = response.data.filter((item) => {
                    return item.sale_man?.trim().toUpperCase() == salesName.trim().toUpperCase()
                })


                console.log("filteredArrayBasedOnSalesman>> Receipt new", filteredArrayBasedOnSalesman, salesName.trim().toUpperCase())

                setTop50Customers(filteredArrayBasedOnSalesman)
            }else if ( cmpcode?.trim().toUpperCase() == "TAMMDOOD") {
                let filteredArrayBasedOnSalesman = response.data.filter((item) => {
                    return item.sale_man?.trim().toUpperCase() == salesManKey.trim().toUpperCase()
                })


                console.log("filteredArrayBasedOnSalesman>> Receipt new", filteredArrayBasedOnSalesman, salesName.trim().toUpperCase())

                setTop50Customers(filteredArrayBasedOnSalesman)
            }
             else {
                setTop50Customers(response.data)
            }

            setShowActivity(false)
        } catch (error) {
            console.log('fetchTop50CustomersError', error);
            setShowActivity(false)
        }
    }


    const fetchStatementData = async () => {
        setShowLoader(true)
        console.log(`${appUrl}OutstandingStmt/${cmpcode}/OUT_ACC1/${accountNo}/-/${fromDate}/${toDate}/-`)
        try {
            const result = await axios.get(`${appUrl}OutstandingStmt/${cmpcode}/OUT_ACC1/${accountNo}/-/${fromDate}/${toDate}/-`)
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

    // const handlePress = (inv) => {
    //     setSelectedInv((prevSelectedInv) => {
    //         if (prevSelectedInv.includes(inv)) {
    //             return prevSelectedInv.filter((item) => item !== inv);
    //         } else {
    //             return [...prevSelectedInv, inv];
    //         }
    //     });
    // };

    const handlePress = (inv, balance) => {

        setCurrentInvoiceUnderTyping(inv)

        setSelectedInv((prevSelectedInv) => {
            if (prevSelectedInv.includes(inv)) {
                setSelectedBalanceSum(prevSum => prevSum - balance);

                let newSelectedInvoices = selectedtInvTransactions?.filter((item) => item.invoice_number != inv)
                setSelectedInvTransactions(newSelectedInvoices)
                return prevSelectedInv.filter((item) => item !== inv);
            } else {

                const currentDate = new Date();

                const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd');

                let object = { invoice_number: inv, type: "cash", chqno: "", bank: "", chqdate: formattedCurrentDate, amount: 1 }
                console.log("object of selected inv ", object)
                setSelectedInvTransactions([...selectedtInvTransactions, object])

                setSelectedBalanceSum(prevSum => prevSum + balance);
                return [...prevSelectedInv, inv];
            }
        });
    };

    const statementClick = (item) => {
        setSelectedStock(item)
        setShowStatementPop(true)
    }

    const outStandingClick = (item) => {
        setSelectedStock(item)
        setShowOutstandingPop(true)
    }

    const goBack = () => {
        setSelectedStock('')
        setSelectedInv([])
        setRvAmnt('')
        setSelectedId('')
        setStatementData('')
        setAccountNo('')
    }




    // const getSelectedBalancesSum = () => {
    //     return statementData.reduce((acc, inv) => {
    //         const invoice = selectedtInv.find(invoice => invoice.INV === inv);
    //         return acc + (invoice ? invoice.BALANCE : 0);
    //     }, 0);
    // };

    // useEffect(() => {
    //     if (selectedtInv.length > 0) {
    //         const selectedBalancesSum = getSelectedBalancesSum();
    //         if (selectedBalancesSum) {
    //             setBalanceSum(selectedBalancesSum)
    //         }
    //     }
    // }, [selectedtInv])

    // const selectedBalancesSum = getSelectedBalancesSum();


    useEffect(() => {
        if (appUrl && cmpcode && deptno && salesName) {
            fetchTop50Customers()
        }
    }, [appUrl, cmpcode, deptno, salesName])

    useEffect(() => {
        if (searchItem !== '') {
            searchStock(searchItem)
            setSelectedStock(null)
        }
        if (searchItem == '') {
            setStockData(null)
            setSelectedStock(null)
        }
    }, [searchItem])

    useEffect(() => {
        if (selectedStock) {
            setAccountNo(selectedStock.account)
        }
    }, [selectedStock])

    useEffect(() => {
        if (selectedStock && accountNo) {
            fetchStatementData()
        }
    }, [selectedStock, accountNo])


    useEffect(() => {

        // console.log('dateRunnignRunnufng')
        const currentDate = new Date();
        const sevenDaysBefore = subDays(currentDate, 7);

        const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd');
        const formattedSevenDaysBefore = format(sevenDaysBefore, 'yyyy-MM-dd');

        setFromDate(formattedSevenDaysBefore);
        setToDate(formattedCurrentDate);

    }, []);

    const changeValuesInInput = (value, inputName) => {

        console.log("invoice amount, value, inputName", value, inputName)

        let newArray = selectedtInvTransactions?.map((itemMap) => {
            if (itemMap.invoice_number == invoiceNumber) {
                return { ...itemMap, [inputName]: value }
            } else {
                return itemMap
            }
        })

        setSelectedInvTransactions(newArray)


    }
    const changeValuesInInputAmount = (invoiceNumber, itemAmount, itembalance, value, inputName) => {

        console.log("invoiceNumber,itemAmount,itembalance,  value, inputName>>", invoiceNumber, itemAmount, itembalance, value, inputName)

        if (Number(value) > Number(itembalance)) {
            console.log("value > itembalance ")
            Alert.alert("Warning", "Amount exceeded")

            let newArray = selectedtInvTransactions?.map((itemMap) => {
                if (itemMap.invoice_number == invoiceNumber) {
                    return { ...itemMap, [inputName]: itemAmount }
                } else {
                    return itemMap
                }
            })

            setSelectedInvTransactions(newArray)

        } else {


            let newArray = selectedtInvTransactions?.map((itemMap) => {
                if (itemMap.invoice_number == invoiceNumber) {
                    return { ...itemMap, [inputName]: value }
                } else {
                    return itemMap
                }
            })

            setSelectedInvTransactions(newArray)
        }

    }

    const clickedOnAccountList = (item) => {

        setCurrentSelectedAccount(item)
    }

    // console.log('searchItem', searchItem)
    // console.log('stockData', stockData)
    // console.log('sleectedCust', selectedStock)
    // console.log('accountNo', accountNo)

    // console.log(fromDate, toDate)

    // console.log('selectedtInv', selectedtInv)

    // console.log('selectedId', selectedId)


    // console.log('statementData', statementData)

    // console.log(fromDate, toDate)

    return (
        <>
            <View contentContainerStyle={styles.HomeWrap}>
                {/* <Header /> */}

                <HeaderUiNew name={'Receipt'} />

                <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />


                <KeyboardAvoidingView
                    behavior='padding'
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
                    style={styles.HomeCont}
                >


                    {/* <View style={styles.HomeTextCont}>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                            <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                        </TouchableOpacity>
                        <Text style={styles.HomeText}>Customer Details</Text>
                    </View> */}

                    <View style={[styles.TANDCInpCont, { width: '90%' }]}>
                        {/* <View style={styles.InputImageCont}>
                            <Image style={styles.SearchIcon} source={require('../images/orangeLens.png')} />
                        </View> */}
                        <TextInput
                            style={styles.SrchPlaceHolderInput}
                            placeholder='Enter Customer name'
                            value={searchItem}
                            onChangeText={text => setSearchItem(text)}
                            placeholderTextColor="#2b2b2b"
                        />
                    </View>

                    {
                        showActivity &&

                        <ActivityIndicator />
                    }

                    {
                        showLoader &&

                        <ActivityIndicator />
                    }

                    {
                        stockData && !selectedStock && searchItem !== '' &&
                        // <View style={styles.TableContainer}>
                        //     <View style={styles.tableRow}>
                        //         <Text
                        //             style={[styles.headerCell, {
                        //                 borderTopLeftRadius: 4
                        //             }]}
                        //         >
                        //             Name
                        //         </Text>
                        //         <Text style={styles.headerCell}>
                        //             Account Number
                        //         </Text>
                        //         <Text
                        //             style={[styles.headerCell, {
                        //                 borderTopRightRadius: 4
                        //             }]}
                        //         >
                        //             OpenBalance
                        //         </Text>
                        //     </View>

                        //     {/* <ScrollView style={styles.ScrollView} horizontal={true} nestedScrollEnabled={true}> */}
                        //     <ScrollView style={styles.ScrollView}>
                        //         {
                        //             stockData && stockData.length > 0 && stockData.slice(0, 25).map((item, index) => (
                        //                 <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedStock(item)}>
                        //                     <Text style={styles.dataCell}>{item.Custname}</Text>
                        //                     <Text style={styles.dataCell}>{item.account}</Text>
                        //                     <Text style={styles.dataCell}>{item.openbal}</Text>
                        //                 </TouchableOpacity>

                        //             ))
                        //         }
                        //     </ScrollView>



                        //     {
                        //         stockData && stockData.length === 0 &&
                        //         <View>
                        //             <Text style={{
                        //                 color: 'red'
                        //             }}>No data available</Text>
                        //         </View>
                        //     }

                        // </View>

                        <ScrollView contentContainerStyle={[styles.CheckStockListView]} keyboardShouldPersistTaps="always">

                            {
                                stockData && stockData.length > 0 && stockData.map((item, index) => (
                                    <View style={styles.StockListItem} key={index}>
                                        <View style={styles.CustomerListCont}>

                                            <View style={styles.CustomerImgWrap}>
                                                <Image style={styles.CustomerImage} source={require('../images/customerList.png')} />
                                            </View>

                                            <View style={styles.CustomerListMid}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    width: '100%'
                                                }}>
                                                    <TouchableOpacity style={[styles.StockListDescText, { width: '75%' }]} onPress={() => setSelectedStock(item)}>
                                                        <Text style={[styles.StockListDescText]}>{item.Custname}</Text>
                                                    </TouchableOpacity>
                                                    <Text style={[styles.StockListDescTextSmall, { color: '#30B3A4', fontFamily: 'Lexend-Regular', }]}>{item.Avai_Bal}</Text>
                                                </View>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    width: '100%',
                                                    paddingVertical: 6
                                                }}>
                                                    <Text style={styles.StockListDescTextSmall}>{item.account}</Text>
                                                    <View style={{
                                                        marginLeft: 24,
                                                        flexDirection: 'row'
                                                    }}>
                                                        <Text style={[styles.StockListDescTextSmall,]}>C.Limit:</Text>
                                                        <Text style={[styles.StockListDescTextSmall,]}>{item.Credit_Limit}</Text>
                                                    </View>

                                                    <TouchableOpacity style={[styles.PlusMinusCont, { marginLeft: 'auto' }]} onPress={() => toggleExpand(item.account)}>
                                                        {
                                                            expandedItems.includes(item.account) ?
                                                                <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                                :
                                                                <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                        }
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                        </View>

                                        {
                                            expandedItems.includes(item.account) && (

                                                <View style={styles.QtyAvlQtyCont}>

                                                    <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', marginRight: 16 }]} onPress={() => statementClick(item)}>
                                                        <Text style={styles.QtyText}>Statement</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', }]} onPress={() => outStandingClick(item)}>
                                                        <Text style={styles.AvlText}>Outstanding</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }

                                    </View>

                                ))
                            }
                        </ScrollView>
                    }

                    {
                        !stockData && !selectedStock && !searchItem && top50Customers &&
                        <>
                            {/* <View style={{ marginHorizontal: 12, marginVertical: 12 }}>
                                <Text style={styles.StockLabel}>Top 50 Customers</Text>
                            </View> */}
                            {/* <View style={styles.TableContainer}>
                                <View style={styles.tableRow}>
                                    <Text
                                        style={[styles.headerCell, {
                                            borderTopLeftRadius: 4
                                        }]}
                                    >
                                        Name
                                    </Text>
                                    <Text style={styles.headerCell}>
                                        Account Number
                                    </Text>
                                    <Text
                                        style={[styles.headerCell, {
                                            borderTopRightRadius: 4
                                        }]}
                                    >
                                        OpenBalance
                                    </Text>
                                </View>

                                <ScrollView style={styles.ScrollView}>
                                    {
                                        top50Customers && top50Customers.length > 0 && top50Customers.slice(0, 25).map((item, index) => (
                                            <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedStock(item)}>
                                                <Text style={styles.dataCell}>{item.Custname}</Text>
                                                <Text style={styles.dataCell}>{item.account}</Text>
                                                <Text style={styles.dataCell}>{item.openbal}</Text>
                                            </TouchableOpacity>

                                        ))
                                    }
                                </ScrollView>



                                {
                                    top50Customers && top50Customers.length === 0 &&
                                    <View>
                                        <Text style={{
                                            color: 'red'
                                        }}>No data available</Text>
                                    </View>
                                }

                            </View> */}
                            <ScrollView contentContainerStyle={[styles.CheckStockListView]} keyboardShouldPersistTaps="always">

                                {
                                    top50Customers && top50Customers.length > 0 && top50Customers.map((item, index) => (
                                        <View style={styles.StockListItem} key={index}>
                                            <View style={styles.CustomerListCont}>

                                                <View style={styles.CustomerImgWrap}>
                                                    <Image style={styles.CustomerImage} source={require('../images/customerList.png')} />
                                                </View>

                                                <View style={styles.CustomerListMid}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        width: '100%'
                                                    }}>
                                                        <TouchableOpacity style={[styles.StockListDescText, { width: '75%' }]} onPress={() => setSelectedStock(item)}>
                                                            <Text style={[styles.StockListDescText]}>{item.Custname}</Text>
                                                        </TouchableOpacity>
                                                        <Text style={[styles.StockListDescTextSmall, { color: '#30B3A4', fontFamily: 'Lexend-Regular', }]}>{item.Balance}</Text>
                                                    </View>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        width: '100%',
                                                        paddingVertical: 6
                                                    }}>
                                                        <Text style={styles.StockListDescTextSmall}>{item.account}</Text>
                                                        <View style={{
                                                            marginLeft: 24,
                                                            flexDirection: 'row'
                                                        }}>
                                                            <Text style={[styles.StockListDescTextSmall,]}>C.Limit:</Text>
                                                            <Text style={[styles.StockListDescTextSmall,]}>{item.Credit_Limit}</Text>
                                                        </View>
                                                    </View>

                                                    {/* showed Avail.Bal here */}
                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                        }}>
                                                            <Text style={[styles.StockListDescTextSmall,]}>Avail.Bal: </Text>
                                                            <Text style={[styles.StockListDescTextSmall,]}>{item.Avai_Bal}</Text>
                                                        </View>
                                                        <TouchableOpacity style={[styles.PlusMinusCont]} onPress={() => toggleExpand(item.account)}>
                                                            {
                                                                expandedItems.includes(item.account) ?
                                                                    <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                                    :
                                                                    <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                            }
                                                        </TouchableOpacity>
                                                    </View>


                                                </View>

                                            </View>

                                            {
                                                expandedItems.includes(item.account) && (

                                                    <View style={styles.QtyAvlQtyCont}>

                                                        <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', marginRight: 16 }]} onPress={() => statementClick(item)}>
                                                            <Text style={styles.QtyText}>Statement</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', }]} onPress={() => outStandingClick(item)}>
                                                            <Text style={styles.AvlText}>Outstanding</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )
                                            }

                                        </View>

                                    ))
                                }
                            </ScrollView>

                        </>
                    }

                    {
                        selectedStock && !showLoader &&

                        <>
                            {/* <View style={styles.FromToDateButtonWrap}>

                                <View style={styles.DateButtonWrap}>
                                    <Button title="From Date" onPress={showFromDatePicker} />
                                    {fromDate && (
                                        <Text style={styles.dateText}>
                                            {fromDate}
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.DateButtonWrap}>
                                    <Button title="To Date" onPress={showToDatePicker} />
                                    {toDate && (
                                        <Text style={styles.dateText}>
                                            {toDate}
                                        </Text>
                                    )}
                                </View>

                                <View>
                                    <TouchableOpacity style={styles.ViewButton} onPress={() => fetchStatementData()}>
                                        <Text style={styles.ViewText}>View</Text>
                                    </TouchableOpacity>
                                </View>


                                <DateTimePickerModal
                                    isVisible={isFromDatePickerVisible}
                                    mode="date"
                                    onConfirm={handleFromDateConfirm}
                                    onCancel={hideFromDatePicker}
                                />

                                <DateTimePickerModal
                                    isVisible={isToDatePickerVisible}
                                    mode="date"
                                    onConfirm={handleToDateConfirm}
                                    onCancel={hideToDatePicker}
                                />
                            </View> */}

                            {/* <View style={{
                                marginTop: 8,
                                maxHeight: 560,
                                marginBottom: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3,
                                elevation: 5,
                                flex: 1
                            }}> */}
                            {
                                statementData && statementData.length > 0 &&
                                <ScrollView>
                                    <View style={{ padding: 10 }}>

                                        {
                                            showLoader &&
                                            <View>
                                                <ActivityIndicator />
                                            </View>

                                        }

                                        <View style={{
                                            paddingVertical: 2,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                            <TouchableOpacity style={styles.SettingsWrap} onPress={() => goBack()}>
                                                <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                                            </TouchableOpacity>
                                            <Text style={styles.StockLabel}>Selected Customer: {selectedStock.Custname}</Text>
                                        </View>

                                        <View style={{
                                            paddingVertical: 2
                                        }}>
                                            <Text style={styles.StockLabel}>Selected Invoices: {selectedtInv.join(', ')}</Text>
                                        </View>


                                        <View style={{
                                            paddingVertical: 2
                                        }}>
                                            <Text style={styles.StockLabel}>Total Selected Balance: {selectedBalanceSum.toFixed(2)}</Text>
                                        </View>



                                        {/* <View style={[styles.TANDCInpCont, { width: '90%' }]}>
                                        <TextInput
                                            style={styles.PlaceHolderInput}
                                            placeholder='Enter RV Amount'
                                            keyboardType="numeric" // This ensures the numeric keyboard appears
                                            onChangeText={text => {
                                                const numericText = text.replace(/[^0-9.]/g, '');// This removes any non-numeric characters
                                                setRvAmnt(numericText);
                                            }}
                                            value={rvAmnt}
                                            // onChangeText={text => setRvAmnt(text)}
                                            placeholderTextColor="#aaa"
                                        />
                                    </View> */}

                                        <View style={{ position: "relative" }}>
                                            <TouchableOpacity style={{ backgroundColor: "#000000", padding: 4, flexDirection: "row", width: 200 }} onPress={() => { getListOfAccounts(); setShowListofAccounts(prev => !prev) }}><Text style={{ color: "#ffffff" }}>Select Account</Text><Image style={{ marginLeft: 10, width: 20, height: 20 }} source={ic_arrow_down} />{
                                                isCallingListOfAccountsApi && <ActivityIndicator color={'white'} size={'small'} />
                                            }</TouchableOpacity>



                                            {
                                                showListofAccounts &&

                                                <FlatList
                                                    nestedScrollEnabled={true}
                                                    style={{ height: 200, marginTop: 30, position: "absolute", top: 0, zIndex: 3, backgroundColor: "#f7f7f7", borderBottomWidth: 1 }}
                                                    data={listOfAccounts ? listOfAccounts : []}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    contentContainerStyle={{ width: '100%' }}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity style={{ padding: 10 }} onPress={() => { clickedOnAccountList(item); setShowListofAccounts(prev => !prev); }}>
                                                            <Text>{item.Account}</Text>
                                                            <Text>{item.Accdesc}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                />

                                            }

                                            <View style={{ padding: 2 }}>
                                                <Text>{currentSelectedAccount?.Account}</Text><Text>{currentSelectedAccount?.Accdesc}</Text>
                                            </View>
                                        </View>

                                        <View>
                                            <TextInput placeholder='bank name' onChangeText={(text) => changeValuesInInput(text, "bank")} style={[styles.TANDCInpCont, { color: "#000000", width: "100%" }]}>{currentCDetails.bank}</TextInput>

                                            <View style={{ flexDirection: "row", marginLeft: "5%", alignItems: "center", margin: 4 }}>
                                                <Text style={styles.TopHeaderText}>Cheque Date</Text>
                                                <Text>:</Text>
                                                <TouchableOpacity style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    backgroundColor: "#f7f7f7",
                                                    padding: 10,
                                                    borderWidth: 1
                                                }} onPress={showFromDatePicker}>
                                                    <Text style={styles.TopHeaderText}>{currentCDetails.chqdate}</Text>

                                                </TouchableOpacity>

                                                <DateTimePickerModal
                                                    isVisible={isFromDatePickerVisible}
                                                    mode="date"
                                                    onConfirm={handleFromDateConfirm}
                                                    onCancel={hideFromDatePicker}
                                                />
                                            </View>

                                            <TextInput placeholder='cheque number' onChangeText={(text) => changeValuesInInput(text, "chqno")} style={[styles.TANDCInpCont, { color: "#000000", width: "100%" }]}>{currentCDetails.chqno}</TextInput>
                                            {/* <TextInput placeholder='amount' keyboardType='numeric' onChangeText={(text) => changeValuesInInput(text, "amount")} style={[styles.TANDCInpCont, { color: "#000000", width: "100%" }]}>{currentCDetails.amount}</TextInput> */}
                                        </View>

                                        <View style={styles.RadioWrap}>

                                            <View style={[styles.TANDCInpCont, { width: '100%', marginTop: 0 }]}>
                                                <TextInput
                                                    style={styles.PlaceHolderInput}
                                                    placeholder='Enter Remarks'
                                                    value={remarks}
                                                    onChangeText={text => setRemarks(text)}
                                                    placeholderTextColor="#aaa"
                                                />
                                            </View>
                                        </View>

                                        <View style={{ width: '20%', marginLeft: "auto" }}>
                                            <TouchableOpacity style={styles.StatementButton} onPress={() => postData()}>
                                                {
                                                    loading ?
                                                        <ActivityIndicator size={'large'} color={'white'} /> :

                                                        <Text style={styles.StatementText}>Save</Text>
                                                }
                                            </TouchableOpacity>
                                        </View>


                                        <View style={{
                                            paddingVertical: 4
                                        }}>
                                            <Text style={styles.StockLabel}>Outstanding bills, Click to Select::</Text>
                                        </View>

                                        {
                                            !showLoader &&
                                            <ScrollView horizontal={true} contentContainerStyle={{ width: '100%', maxHeight: 350 }} keyboardShouldPersistTaps="always">
                                                <>

                                                    <View style={styles.CollTableContainer}>
                                                        <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="always">

                                                            <FlatList
                                                                data={statementData}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                contentContainerStyle={{ width: '100%' }}
                                                                renderItem={({ item }) => (
                                                                    <>
                                                                        {/* <TouchableOpacity style={[
                                                                        styles.NewItemList,
                                                                        selectedtInv.includes(item.INV) ? styles.selectedRow : {},
                                                                    ]}
                                                                        onPress={() => handlePress(item.INV, item.BALANCE)}>

                                                                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                            <Text style={styles.StockListDescText}>INV : {item.INV}</Text>
                                                                            <Text style={styles.StockListDescText}>Amount : {(item.BALANCE.toFixed(3))}</Text>
                                                                        </View>
                                                                        <View>
                                                                            <Text style={styles.StockListDescText}>Date : {item.INVDATE.split('T')[0]}</Text>
                                                                        </View>
                                                                    </TouchableOpacity> */}

                                                                        <TouchableOpacity style={[styles.StockListItem, selectedtInv.includes(item.INV) ? styles.selectedRow : {},]} onPress={() => handlePress(item.INV, item.BALANCE)}>

                                                                            <View style={styles.CustomerListCont}>

                                                                                <View style={styles.CustomerImgWrap}>
                                                                                    <Image style={styles.CustomerImage} source={require('../images/listWhite.png')} />
                                                                                </View>

                                                                                <View style={styles.CustomerListMid}>
                                                                                    <View style={{
                                                                                        flexDirection: 'row',
                                                                                        justifyContent: 'space-between',
                                                                                        width: '100%'
                                                                                    }}>
                                                                                        <Text style={[styles.StockListDescText, { width: '75%' }]}>INV : {item.INV}</Text>
                                                                                        <Text style={[styles.StockListDescTextSmall, { color: '#30B3A4', fontFamily: 'Lexend-Regular', }]}>{(item.BALANCE.toFixed(3))}</Text>
                                                                                    </View>
                                                                                    <View style={{
                                                                                        flexDirection: 'row',
                                                                                        width: '100%',
                                                                                        paddingVertical: 6
                                                                                    }}>
                                                                                        <Text style={styles.StockListDescTextSmall}>Date : {item.INVDATE.split('T')[0]}</Text>
                                                                                        <View style={{
                                                                                            marginLeft: 24,
                                                                                            flexDirection: 'row'
                                                                                        }}>

                                                                                        </View>


                                                                                    </View>

                                                                                    <View style={
                                                                                        {
                                                                                            flexDirection: "row",
                                                                                            width: "100%"
                                                                                        }
                                                                                    }>
                                                                                        {selectedtInv.includes(item.INV) &&
                                                                                            <View style={{ width: "100%" }}>

                                                                                                {console.log("selectedtInvTransactions>>>", selectedtInvTransactions, "value", selectedtInvTransactions?.filter((itemTr) => itemTr.invoice_number == item.INV))}
                                                                                                {selectedtInvTransactions?.filter((itemTr) => itemTr.invoice_number == item.INV).map((itemRes) => {
                                                                                                    return (
                                                                                                        <View style={{ width: "100%" }}>
                                                                                                            {/* <View style={{ flexDirection: "row" }}>
                                                                                                            <TouchableOpacity onPress={() => changeValuesInInput(itemRes.invoice_number, "cash", "type")} style={{ width: '50%', flexDirection: "row", alignItems: "center" }}>
                                                                                                                {itemRes.type == "cash" ? <Image style={{ width: 40, height: 40 }} source={ic_select_round} /> : <Image style={{ width: 40, height: 40 }} source={ic_no_select} />}

                                                                                                                <Text>CASH</Text>
                                                                                                            </TouchableOpacity>
                                                                                                            <TouchableOpacity onPress={() => changeValuesInInput(itemRes.invoice_number, "credit", "type")} style={{ width: '50%', flexDirection: "row", alignItems: "center" }}>
                                                                                                                {itemRes.type == "credit" ? <Image style={{ width: 40, height: 40 }} source={ic_select_round} /> : <Image style={{ width: 40, height: 40 }} source={ic_no_select} />}
                                                                                                                <Text>CHEQUE</Text>
                                                                                                            </TouchableOpacity>
                                                                                                        </View> */}

                                                                                                            {/* <TextInput placeholder='bank name' onChangeText={(text) => changeValuesInInput(itemRes.invoice_number, text, "bank")} style={[styles.TANDCInpCont, { color: "#000000", width: "100%" }]}>{itemRes.bank}</TextInput>

                                                                                                        <View style={{ flexDirection: "row", marginLeft: "5%", alignItems: "center", margin: 4 }}>
                                                                                                            <Text style={styles.TopHeaderText}>Cheque Date</Text>
                                                                                                            <Text>:</Text>
                                                                                                            <TouchableOpacity style={{
                                                                                                                flexDirection: 'row',
                                                                                                                justifyContent: 'space-between',
                                                                                                                alignItems: 'center',
                                                                                                                backgroundColor: "#f7f7f7",
                                                                                                                padding: 10,
                                                                                                                borderWidth: 1
                                                                                                            }} onPress={showFromDatePicker}>
                                                                                                                <Text style={styles.TopHeaderText}>{itemRes.chqdate}</Text>

                                                                                                            </TouchableOpacity>

                                                                                                            <DateTimePickerModal
                                                                                                                isVisible={isFromDatePickerVisible}
                                                                                                                mode="date"
                                                                                                                onConfirm={handleFromDateConfirm}
                                                                                                                onCancel={hideFromDatePicker}
                                                                                                            />
                                                                                                        </View>

                                                                                                        <TextInput placeholder='cheque number' onChangeText={(text) => changeValuesInInput(itemRes.invoice_number, text, "chqno")} style={[styles.TANDCInpCont, { color: "#000000", width: "100%" }]}>{itemRes.chqno}</TextInput>*/}
                                                                                                            <TextInput value={itemRes.amount} placeholder='amount' keyboardType='numeric' onChangeText={(text) => changeValuesInInputAmount(itemRes.invoice_number, itemRes.amount, item.BALANCE.toFixed(3), text, "amount")} style={[styles.TANDCInpCont, { color: "#000000", width: "100%" }]} />
                                                                                                        </View>
                                                                                                    )
                                                                                                })
                                                                                                }
                                                                                            </View>
                                                                                        }
                                                                                    </View>
                                                                                </View>

                                                                            </View>


                                                                        </TouchableOpacity>
                                                                    </>
                                                                )}
                                                                ListEmptyComponent={
                                                                    <View>
                                                                        <Text style={{ color: 'red' }}>No data available</Text>
                                                                    </View>
                                                                }
                                                            />


                                                        </ScrollView>
                                                    </View>

                                                    {/* <View style={styles.CollTableContainer}>
                                                <View style={styles.ColltableRow}>
                                                    <Text style={[styles.CollheaderCell, { borderTopLeftRadius: 4 }]}>INVDATE</Text>
                                                    <Text style={styles.CollheaderCell}>INV</Text>
                                                  
                                                    <Text style={[styles.CollheaderCell, { borderTopRightRadius: 4 }]}>AMOUNT</Text>
                                                </View>


                                                <ScrollView nestedScrollEnabled={true}>

                                                    <FlatList
                                                        data={statementData}
                                                        keyExtractor={(item, index) => index.toString()}
                                                        contentContainerStyle={{}}
                                                        renderItem={({ item }) => (
                                                            <>
                                                                <TouchableOpacity style={[
                                                                    styles.ColltableRow,
                                                                    selectedtInv.includes(item.INV) ? styles.selectedRow : {},
                                                                ]}
                                                                    onPress={() => handlePress(item.INV, item.BALANCE)}>
                                                                    <Text style={[styles.ColldataCell, selectedtInv.includes(item.INV) ? styles.selectedRow : {}]}>{item.INVDATE.split('T')[0]}</Text>
                                                                    <Text style={[styles.ColldataCell, selectedtInv.includes(item.INV) ? styles.selectedRow : {}]}>{item.INV}</Text>
                                                                    <Text style={[styles.ColldataCell, selectedtInv.includes(item.INV) ? styles.selectedRow : {}]}>{(item.BALANCE.toFixed(3))}</Text>
                                                                </TouchableOpacity>
                                                            </>
                                                        )}
                                                        ListEmptyComponent={
                                                            <View>
                                                                <Text style={{ color: 'red' }}>No data available</Text>
                                                            </View>
                                                        }
                                                    />


                                                </ScrollView>


                                            </View> */}
                                                </>
                                            </ScrollView>
                                        }

                                    </View>
                                </ScrollView>
                            }

                            {
                                statementData && statementData.length === 0 && !showLoader &&
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <TouchableOpacity style={styles.SettingsWrap} onPress={() => goBack()}>
                                        <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                                    </TouchableOpacity>
                                    <Text style={{
                                        color: 'red',
                                        fontSize: 14,
                                        fontFamily: 'Lexend-Bold',
                                    }}>No Data Available</Text>
                                </View>
                            }
                            {/* </View> */}

                        </>

                    }

                </KeyboardAvoidingView>
            </View>

            {
                showStatementPop &&
                <StatementPop setShowStatementPop={setShowStatementPop} privateKey={privateKey} accountNo={accountNo} appUrl={appUrl} cmpcode={cmpcode} setSelectedStock={setSelectedStock} selectedStock={selectedStock} />
            }

            {
                showOutstandingPop &&
                <OutstandingPop setShowOutstandingPop={setShowOutstandingPop} privateKey={privateKey} accountNo={accountNo} appUrl={appUrl} cmpcode={cmpcode} setSelectedStock={setSelectedStock} selectedStock={selectedStock} />
            }

            {
                result &&
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent2}>
                        <View>
                            <Text style={styles.SuccessText}>
                                Collection Created successfully
                            </Text>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 32
                        }}>
                            <TouchableOpacity style={{
                                backgroundColor: 'red',
                                padding: 12,
                                borderRadius: 8
                            }} onPress={() => resultClosePress()}>
                                <Text style={styles.CancelText}>Close</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={{
                                backgroundColor: 'green',
                                padding: 12,
                                borderRadius: 8
                            }} onPress={generatePDF}>
                                <Text style={styles.PDFText}>Save Pdf</Text>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </View>
            }
        </>
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
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    HomeText: {
        fontSize: 18,
        color: 'black',
        borderBottomColor: 'gold',
        borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Bold'
    },
    InputCont: {
        width: '100%',
        backgroundColor: 'white',
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    InputImageCont: {
        // backgroundColor: '#EAEDF5',
        padding: 8,
        borderRadius: 6,
        // position: 'absolute',
        // right: 10
    },
    SearchIcon: {
        width: 25,
        height: 25
    },
    TextInput: {
        width: '100%',
        fontFamily: 'Lexend-Bold'
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
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        // flex: 1,
        // backgroundColor: '#5A55CA',
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: '33%',
        color: '#3A80EA',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',

    },
    dataCell: {
        // flex: 1,
        // backgroundColor: '#F3F3F3',
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: '33%',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "#3A80EA",
        fontFamily: 'Lexend-Regular'

    },
    ScrollView: {
        height: Dimensions.get('window').height - 300,
        marginBottom: 8
    },
    SelectedStockWrap: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginTop: 8
    },
    NameDescCont: {
        flexDirection: 'row',
        width: '95%',
        paddingHorizontal: 8,
        paddingVertical: 12,
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    AddressCont: {
        flexDirection: 'row',
        width: '95%',
        paddingHorizontal: 8,
        paddingVertical: 12,
        // alignItems: 'center',
        flexWrap: 'wrap'

    },
    TextNameDesc: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        color: 'black'
    },
    TextNameDescValue: {
        fontSize: 14,
        fontFamily: 'Lexend-Bold',
        color: 'black',
        marginLeft: 12,
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#dbdbdb',
    },
    TextAddressValue: {
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
        color: 'black',
        marginLeft: 12,
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#dbdbdb',
        marginVertical: 4
    },
    StockValueWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '95%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    PriceCard: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 4,
        marginVertical: 8
    },
    PriceText: {
        color: '#189A2E',
        fontSize: 18,
        fontFamily: 'Lexend-Regular',
    },
    PriceValue: {
        backgroundColor: '#189A2E',
        color: 'white',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        fontFamily: 'Lexend-Bold',
    },
    AddressBox: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    HeadIcon: {
        width: 25,
        height: 25
    },

    PlaceHolderInput: {
        width: '100%',
        fontFamily: 'Lexend-Regular',
        color: "#3A80EA",
    },
    TableHeadSpan: {
        backgroundColor: '#D9D9D9',
        padding: 12
    },

    StockDescWrap: {
        flexDirection: 'column',
        width: '95%',
        marginTop: 8,
        backgroundColor: 'white',
        padding: 18
    },
    StockItem: {
        padding: 8,
        marginBottom: 4
    },
    StockLabel: {
        fontFamily: 'Lexend-Regular',
        color: "#2b2b2b",
        fontSize: 14
    },
    StockTextValue: {
        fontFamily: 'Lexend-Bold',
        color: "black",
        fontSize: 16
    },
    StateOutWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
        paddingVertical: 14
    },

    StatementButton: {
        backgroundColor: '#1A6CF6',
        paddingHorizontal: 6,
        paddingVertical: 8,
        borderRadius: 6

    },
    StatementText: {
        fontFamily: 'Lexend-Regular',
        color: "white",
        fontSize: 13
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
        backgroundColor: 'green',
        padding: 8,
        borderRadius: 4
    },
    ViewText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular'
    },


    CollTableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
        // paddingBottom: 50,
        // height: 500,

        flex: 1,
        // width: 1200,
    },
    ColltableRow: {
        flexDirection: 'row',
        width: '100%',
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    CollheaderCell: {
        // flex: 1,
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 125,
        color: 'white',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',

    },
    ColldataCell: {
        // flex: 1,
        // backgroundColor: '#F3F3F3',
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: 125,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },

    selectedRow: {
        backgroundColor: '#cce5cc',
    },

    RadioWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 0,
        paddingBottom: 10,
    },

    StatementButton: {
        backgroundColor: '#64558E',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 6

    },
    StatementText: {
        fontFamily: 'Lexend-Regular',
        color: "white",
        fontSize: 14
    },

    SrchInputCont: {
        width: '95%',
        backgroundColor: '#c7e2de',
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    SrchPlaceHolderInput: {
        width: '100%',
        fontFamily: 'Lexend-Regular',
        color: "#2b2b2b",
    },


    CheckStockListView: {
        // backgroundColor: '#FDFDFD',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 8
    },

    StockListItem: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 8,
        backgroundColor: '#FDFDFD',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 14,
        width: '100%'
    },

    StockItemListHead: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    StockListCodeText: {
        fontFamily: 'Lexend-Light',
        color: "#2B2B2B",
    },
    PlusMinusImg: {
        width: 18,
        height: 18
    },
    PlusMinusCont: {
        padding: 4,
        backgroundColor: '#EFEFEF'
    },

    StockItemDescCont: {
        paddingVertical: 8
    },
    StockListDescText: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        color: '#4B5290'
    },
    QtyAvlQtyCont: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 8
    },
    QtyCont: {
        padding: 8,
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'orange'
    },
    QtyText: {
        fontFamily: 'Lexend-Light',
        // color: '#4B5290'
        color: 'black'
    },
    AvlText: {
        fontFamily: 'Lexend-Light',
        // color: '#8f6924'
        color: 'black'

    },
    DynamicPriceView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    PriceTag: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 8
    },
    PriceValueText: {
        fontFamily: 'Lexend-Regular',
        color: "#2B2B2B",
        marginLeft: 12
    },

    CustomerListCont: {
        flexDirection: 'row',
        width: '100%',
        // justifyContent: 'space-between',
        alignItems: 'center'
    },
    CustomerImage: {
        width: 30,
        height: 30
    },
    CustomerImgWrap: {
        backgroundColor: 'grey',
        borderRadius: 50,
        padding: 8,
        // width: 'auto'
    },

    CustomerListMid: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '80%',
        marginLeft: 12
    },
    StockListDescText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: '#2b2b2b'
    },
    StockListDescTextSmall: {
        fontSize: 14,
        fontFamily: 'Lexend-Light',
        color: '#2b2b2b'
    },
    CustomerListRight: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12
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

    radioButtonText: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Lexend-Light',
    },

    NewItemList: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        backgroundColor: 'white',
        marginVertical: 4,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,


        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowOpacity: 0.25, // Shadow opacity for iOS
        shadowRadius: 3.84, // Shadow radius for iOS
        elevation: 1.5, // Elevation for Android

        borderColor: 'grey',
        borderWidth: 0.5,

    },


    StockListItem: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 8,
        backgroundColor: '#FDFDFD',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 14,
        width: '100%'
    },

    StockItemListHead: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    StockListCodeText: {
        fontFamily: 'Lexend-Light',
        color: "#2B2B2B",
    },
    PlusMinusImg: {
        width: 18,
        height: 18
    },
    PlusMinusCont: {
        padding: 4,
        backgroundColor: '#EFEFEF'
    },

    StockItemDescCont: {
        paddingVertical: 8
    },
    StockListDescText: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        color: '#4B5290'
    },
    QtyAvlQtyCont: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 8
    },
    QtyCont: {
        padding: 8,
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'orange'
    },
    QtyText: {
        fontFamily: 'Lexend-Light',
        // color: '#4B5290'
        color: 'black'
    },
    AvlText: {
        fontFamily: 'Lexend-Light',
        // color: '#8f6924'
        color: 'black'

    },
    DynamicPriceView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    PriceTag: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 8
    },
    PriceValueText: {
        fontFamily: 'Lexend-Regular',
        color: "#2B2B2B",
        marginLeft: 12
    },

    CustomerListCont: {
        flexDirection: 'row',
        width: '100%',
        // justifyContent: 'space-between',
        alignItems: 'center'
    },
    CustomerImage: {
        width: 30,
        height: 30
    },
    CustomerImgWrap: {
        backgroundColor: 'grey',
        borderRadius: 50,
        padding: 8,
        // width: 'auto'
    },

    CustomerListMid: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '80%',
        marginLeft: 12
    },
    StockListDescText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: '#2b2b2b'
    },
    StockListDescTextSmall: {
        fontSize: 14,
        fontFamily: 'Lexend-Light',
        color: '#2b2b2b'
    },
    CustomerListRight: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12
    },

    TANDCInpCont: {
        width: '75%',
        backgroundColor: '#F0F4FD',
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        // justifyContent: 'space-between',
        alignItems: 'center',

        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowOpacity: 0.25, // Shadow opacity for iOS
        shadowRadius: 3.84, // Shadow radius for iOS
        elevation: 1.5, // Elevation for Android

        borderColor: 'grey',
        borderWidth: 0.5,
    },

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
    modalContent2: {
        // backgroundColor: '#F7F7F7',
        // backgroundColor: '#5A55CA',
        backgroundColor: 'white',
        // paddingHorizontal: 8,
        borderRadius: 5,
        // alignItems: 'center',
        width: '95%',
        minHeight: 160,
        maxHeight: Dimensions.get('window').height - 80,
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'center'

    },


    SuccessText: {
        color: 'green',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },
    CancelText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    PDFText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },









})


export default Receipt