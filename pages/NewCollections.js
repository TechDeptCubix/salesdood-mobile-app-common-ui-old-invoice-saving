import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import Header from './Header';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import HeaderUiNew from './HeaderUiNew';
import StatementPop from '../popups/StatementPop';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OutstandingPop from '../popups/OutstandingPop';
import {format, subDays} from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RadioGroup from 'react-native-radio-buttons-group';
import ToastManager, {Toast} from 'toastify-react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import {getReadableDateYYYYMMDD} from './datesFunctions';
import RNFS from 'react-native-fs';

const NewCollections = () => {
  const [accessGrp, setAccessGrp] = useState('');

  const [salesManKey, setSalesManKey] = useState('');
  const navigation = useNavigation();

  // const searchUrl = 'https://cubixweberp.com:203/api/Search_Customer/Cust/'

  const searchUrl =
    'https://cubixweberp.com:208/api/Search_Customer/automax/Cust/';

  const [searchItem, setSearchItem] = useState('');

  const [stockData, setStockData] = useState(null);

  const [selectedStock, setSelectedStock] = useState(null);

  const [showActivity, setShowActivity] = useState(false);

  const [top50Customers, setTop50Customers] = useState(null);

  const [showStatementPop, setShowStatementPop] = useState(false);

  const [showOutstandingPop, setShowOutstandingPop] = useState(false);

  const [privateKey, setPrivateKey] = useState('');

  const [accountNo, setAccountNo] = useState('');

  const [fromDate, setFromDate] = useState('');

  const [toDate, setToDate] = useState('');

  const [showLoader, setShowLoader] = useState(false);

  const [statementData, setStatementData] = useState(null);

  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);

  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  const [selectedtInv, setSelectedInv] = useState([]);

  const [rvAmnt, setRvAmnt] = useState('');

  const [selectedId, setSelectedId] = useState();

  const [deptno, setDeptno] = useState('');

  const [van, setVan] = useState('');

  const [salesMan, setSalesMan] = useState('');

  const [loading, setLoading] = useState(false);

  const [selectedBalanceSum, setSelectedBalanceSum] = useState(0);

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [expandedItems, setExpandedItems] = useState([]);

  const [remarks, setRemarks] = useState('');

  const [result, setResult] = useState(false);

  const [pdfUri, setPdfUri] = useState(null);

  const [salesManName, setSalesManName] = useState('');

  const [cmpName, setCmopName] = useState('');

  // const getCurrentFormattedDateTime = () => {
  //     return format(currentDate, 'yyyy-mm-dd');
  // };

  const currentDate = new Date();
  const dnsDate = format(currentDate, 'yyyy-MM-dd');

  console.log('dnsDate', dnsDate);

  const formattedDateTime = getReadableDateYYYYMMDD(currentDate);

  // const formattedDateTime = getCurrentFormattedDateTime();

  console.log('formattedDateTimeNew', formattedDateTime);

  const generatePDF = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('Requesting permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message:
              'This app needs access to your storage to download the PDF',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
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
                <div class="ValueTag">${selectedStock?.Custname}</div>
            </div>
            <div class="CustomerDetailsTab">
                <div class="NameTag">Address</div>
                <div>:</div>
                <div class="ValueTag">
                    ${selectedStock?.address1} ${selectedStock?.address2} ${
      selectedStock?.address3
    }
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
                <td class="data-cell">${selectedStock?.Custname}</td>
                <td class="data-cell">${rvAmnt}</td>
                <td class="data-cell">${
                  selectedId === 'cash-collection'
                    ? 'CASH'
                    : selectedId === 'cheque-collection'
                    ? 'CHEQUE'
                    : ''
                }</td>
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

    const getLetterheadBase64 = async () =>
      new Promise((resolve, reject) => {
        RNFS.readFileAssets('soca_letterhead_text.txt')
          .then(result => {
            console.log(result);
            resolve(result);
          })
          .catch(err => {
            console.log(err);
          });
      });

    const logoUri = await getLetterheadBase64();

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
                .footer-received-panel {
                    display: flex;
                    justify-content: end;
                    padding-right: 12px;
                }
        
                .textAlignRight{
                    text-align: end;
                }
        
                .footer {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    margin-top: 18px;
                    padding: 0px 8px;
                }
            </style>
        </head>
        
        <body>

        ${
          cmpcode.toLowerCase().trim() == 'soca'
            ? `<div>
    <img class="image_letterhead" src=${logoUri}
    </div>`
            : ''
        }

            <div class="table-container">
        
               <div class="statementHead">
                    <div>
                        <h4 class="margin8">${cmpName}</h4>
                    </div>
                </div>
               <div class="statementHead">
                    <div>
                        <h4 class="margin8">Collection Voucher</h4>
                    </div>
                </div>
        
        
              <div class="TopBottBorder">
                    
            
                    <div class="RcptVouch">
            
                        <span class="TextAlignRight">Date: </span>
                        <span class="TextAlignRight">${formattedDateTime}</span>
            
                    </div>
            
                    <div class="RxcWithThanks">
                        <span class="margin8">Received with Thanks from : ${
                          selectedStock?.Custname
                        }</span>
                    </div>
                    <div class="RxcWithThanks">
                        <span class="margin8">AccountNo : ${accountNo}</span>
                    </div>
                    <div class="RxcWithThanks">
                    <span class="margin8">Invoices: ${selectedtInv.join(
                      ', ',
                    )}</span>
                    </div>
        
                    <div class="CollAmnt">
                        <span class="margin8">Collection Type : ${
                          selectedId === 'cash-collection'
                            ? 'CASH'
                            : selectedId === 'cheque-collection'
                            ? 'CHEQUE'
                            : ''
                        }</span>
            
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
        
               
        
                <div class="footer">
        
                <div class="footer-received-panel">
                    <h4 class="textAlignRight">${
                      cmpcode?.trim()?.toUpperCase() == 'SOCA'
                        ? 'SOCA TOOLS INTERNATIONAL TRADING LLC <br> Al Khabeesi bldg. Al Khabeesi Area <br> Near GMC Car Showroom Ittihad Road <br> Dubai - United Arab Emirates <br> +971 54 247 9690 <br> sales@socatools.com <br> www.socatools.com'
                        : cmpName
                    }</h4>
                </div>
        
            </div>
            
        
            </div>
        </body>
        
        </html>

`;

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
      resultClosePress();
    }
  };

  const toggleExpand = account => {
    setExpandedItems(prevState => {
      if (prevState.includes(account)) {
        return prevState.filter(itemCode => itemCode !== account);
      } else {
        // return [...prevState, account];
        return [account];
      }
    });
  };

  const radioButtons = useMemo(
    () => [
      {
        id: 'cash-collection', // acts as primary key, should be unique and non-empty string
        label: 'CASH',
        value: 'cash-collection',
        labelStyle: styles.radioButtonText,
      },
      {
        id: 'cheque-collection',
        label: 'CHEQUE',
        value: 'cheque-collection',
        labelStyle: styles.radioButtonText,
      },
    ],
    [],
  );

  const fetchAsyncData = async () => {
    try {
      const deptno = await AsyncStorage.getItem('DEPTNO');
      const van = await AsyncStorage.getItem('VAN');

      const salesMan = await AsyncStorage.getItem('sales_man');

      const accessgrp = await AsyncStorage.getItem('accessgrp');

      const salesManName = await AsyncStorage.getItem('salesman_name');

      const salesMankey = await AsyncStorage.getItem('Smankey');

      const appUrl = await AsyncStorage.getItem('appUrl');

      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsedUserDataArray =
        (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

      const portNoData = await AsyncStorage.getItem('portNoData');

      console.log('parsedUserDataArray', parsedUserDataArray);

      if (accessgrp) {
        setAccessGrp(accessgrp);
      }

      if (portNoData) {
        // setCmpName(portNoData[0].COMPNAME)

        console.log('portNoData', portNoData);

        const dataArray = JSON.parse(portNoData);
        setCmpCode(dataArray[0].COMPID);
        setCmopName(dataArray[0].COMPNAME);
      }

      if (salesManName) {
        setSalesManName(salesManName);
      }

      if (salesMankey) {
        setSalesManKey(salesMankey);
      }

      if (parsedUserDataArray) {
        setCmpCode(parsedUserDataArray[0].cmpcode.trim());
      }

      if (appUrl) {
        setAppUrl(appUrl);
      }

      if (deptno) {
        setDeptno(deptno);
      }
      if (van) {
        setVan(van);
      } else {
        console.log('van falsy value sales man', van, salesMan);

        setVan(salesMan?.trim());
      }
      if (salesMan === '----') {
        const salesManDrop = await AsyncStorage.getItem('sales_man_drop');
        setSalesMan(salesManDrop);
      } else {
        setSalesMan(salesMan);
      }
    } catch (error) {
      console.log('fetchAsyncDataError', error);
    }
  };

  useEffect(() => {
    fetchAsyncData();
    fetchAsyncUserDataArray();
    // fetchAppUrl()
  }, []);

  const postData = async () => {
    console.log(
      'if (!accountNo || !deptno || !salesMan || !rvAmnt || !selectedId || !selectedtInv || !van)',
      !accountNo,
      !deptno,
      !salesMan,
      !rvAmnt,
      !selectedId,
      !selectedtInv,
      !van,
    );

    if (
      !accountNo ||
      !deptno ||
      !salesMan ||
      !rvAmnt ||
      !selectedId ||
      !selectedtInv ||
      !van
    ) {
      return showCollectionErrorToast();
    }

    const url = `${appUrl}CollectionRegister`;

    console.log('collectionUrl', url);
    const data = [
      {
        cmpcode: cmpcode,
        rv_no: '0',
        rv_date: formattedDateTime,
        account: accountNo,
        accdesc: selectedStock.Custname,
        deptno: deptno,
        salesman: salesMan,
        rv_amt: rvAmnt,
        py_mode: selectedId,
        inv_ref: selectedtInv.join(','),
        van_id: van,
        status: 'N',
        remarks: remarks,
      },
    ];

    const apiData = JSON.stringify(data);

    console.log('collectionData', apiData);

    try {
      setLoading(true);
      const response = await axios.post(url, apiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setLoading(false);

      console.log('response >>> ', response);

      if (response.data.result === 'Saved') {
        // Alert.alert('Success', 'Data posted successfully');
        console.log('response.data.result ', response.data.result);

        setResult(true);
        // setSelectedStock(null)
        // setSelectedInv([])
        // setRvAmnt('')
        // setSelectedId('')
        // setSelectedBalanceSum(0)
        // showCollectionSuccessToast()
      } else {
        // Alert.alert('Error', 'Failed to post data');
        console.log('collection error >>>', response.data);
      }
    } catch (error) {
      setLoading(false);
      showCollectionAPIErrorToast();
      // Alert.alert('Error', 'An error occurred while posting data');
      console.log('collection error >>> +++', error);
    }
  };

  const resultClosePress = () => {
    setResult(false);
    setRemarks('');
    setSelectedStock(null);
    setSelectedInv([]);
    setRvAmnt('');
    setSelectedId('');
    setSelectedBalanceSum(0);
    setAccountNo('');
    showCollectionSuccessToast();
  };

  const showCollectionSuccessToast = () => {
    Toast.success(`Collection send Successfully`);
  };

  const showCollectionErrorToast = () => {
    Toast.error(`Some data is missing,`);
  };

  const showCollectionAPIErrorToast = () => {
    Toast.error(`Some Error occured, please try again later`);
  };

  const showFromDatePicker = () => {
    setFromDatePickerVisibility(true);
  };

  const hideFromDatePicker = () => {
    setFromDatePickerVisibility(false);
  };

  const handleFromDateConfirm = date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    console.log('formattedFromDate', formattedDate);
    setFromDate(formattedDate);
    hideFromDatePicker();
  };

  const showToDatePicker = () => {
    setToDatePickerVisibility(true);
  };

  const hideToDatePicker = () => {
    setToDatePickerVisibility(false);
  };

  const handleToDateConfirm = date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    console.log('formattedToDate', formattedDate);
    setToDate(formattedDate);
    hideToDatePicker();
  };

  const fetchAsyncUserDataArray = async () => {
    try {
      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsedUserDataArray =
        (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];
      console.log('parsedUserDataArray', parsedUserDataArray);

      if (parsedUserDataArray.length > 0) {
        setPrivateKey(parsedUserDataArray[0].privatek);
      }
    } catch (error) {
      console.log('fetchAsyncUserDataArrayError', error);
    }
  };

  const searchStock = async value => {
    setShowActivity(true);
    try {
      let apiUrlCustomerSearch = `${appUrl}Search_Customer/${cmpcode}/Cust/${value}/${deptno}`;
      console.log('apiUrlCustomerSearch ', apiUrlCustomerSearch);
      await axios.get(apiUrlCustomerSearch).then(res => {
        if (cmpcode?.trim().toUpperCase() == 'SOCA') {
          // if accegrp that is role is Driver show all customers else show only their customers
          if (accessGrp?.trim()?.toUpperCase() == 'DRIVER') {
            setStockData(res.data);
          } else {
            let filteredArrayBasedOnSalesman = res.data.filter(item => {
              return (
                item.sale_man?.trim().toUpperCase() ==
                salesMan.trim().toUpperCase()
              );
            });

            setStockData(filteredArrayBasedOnSalesman);

            console.log(
              'filteredArrayBasedOnSalesman>> NewC',
              filteredArrayBasedOnSalesman,
              salesMan.trim().toUpperCase(),
            );
          }
        } else if (cmpcode?.trim().toUpperCase() == 'TAMMDOOD') {
          let filteredArrayBasedOnSalesman = res.data.filter(item => {
            return (
              item.sale_man?.trim().toUpperCase() ==
              salesManKey.trim().toUpperCase()
            );
          });

          setStockData(filteredArrayBasedOnSalesman);

          console.log(
            'filteredArrayBasedOnSalesman>> NewC',
            filteredArrayBasedOnSalesman,
            salesMan.trim().toUpperCase(),
          );
        } else {
          setStockData(res.data);
        }
      });
      setShowActivity(false);
    } catch (error) {
      console.log('searchCustomererror', error);
      setShowActivity(false);
    }
  };

  const fetchTop50Customers = async () => {
    setShowActivity(true);
    try {
      console.log(
        'fetchTop50Customers---++',
        `${appUrl}Search_Customer/${cmpcode}/Cust50/a/${deptno}`,
      );
      const response = await axios.get(
        `${appUrl}Search_Customer/${cmpcode}/Cust50/a/${deptno}`,
      );
      console.log('fetchTop50Customers', response.data);

      if (cmpcode?.trim().toUpperCase() == 'SOCA') {
        if (accessGrp?.trim()?.toUpperCase() == 'DRIVER') {
          setTop50Customers(response.data);
        } else {
          let filteredArrayBasedOnSalesman = response.data.filter(item => {
            return (
              item.sale_man?.trim().toUpperCase() ==
              salesMan.trim().toUpperCase()
            );
          });
          setTop50Customers(filteredArrayBasedOnSalesman);

          console.log(
            'filteredArrayBasedOnSalesman>> NewC',
            filteredArrayBasedOnSalesman,
            salesMan.trim().toUpperCase(),
          );
        }
      } else if (cmpcode?.trim().toUpperCase() == 'TAMMDOOD') {
        let filteredArrayBasedOnSalesman = response.data.filter(item => {
          return (
            item.sale_man?.trim().toUpperCase() ==
            salesManKey.trim().toUpperCase()
          );
        });
        setTop50Customers(filteredArrayBasedOnSalesman);

        console.log(
          'filteredArrayBasedOnSalesman>> NewC',
          filteredArrayBasedOnSalesman,
          salesMan.trim().toUpperCase(),
        );
      } else {
        setTop50Customers(response.data);
      }

      setShowActivity(false);
    } catch (error) {
      console.log('fetchTop50CustomersError', error);
      setShowActivity(false);
    }
  };

  const fetchStatementData = async () => {
    setShowLoader(true);

    // a modification in the sp done because cash sales was also coming in the collection list so to avoid that use  OUT_ACC1VAN now present in icelab_test db earlier it was OUT_ACC1
    // now update this in every sp of customer
    // https://cubixweberp.com:313/api/OutstandingStmt/Icelab_test/OUT_ACC1VAN/12050005/-/2025-12-05/2025-12-12/-
    // earlier like this https://cubixweberp.com:313/api/OutstandingStmt/Icelab_test/OUT_ACC1/12050005/-/2025-12-05/2025-12-12/-

    console.log(
      `${appUrl}OutstandingStmt/${cmpcode}/OUT_ACC1VAN/${accountNo}/-/${fromDate}/${toDate}/-`,
    );
    try {
      const result = await axios.get(
        `${appUrl}OutstandingStmt/${cmpcode}/OUT_ACC1VAN/${accountNo}/-/${fromDate}/${toDate}/-`,
      );
      setStatementData(result.data);
      // setDisplayData(result.data);
      console.log('fetchStatementData', result.data);
      setShowLoader(false);
    } catch (error) {
      console.log('fetchStatementDataError', error);
      setShowLoader(false);
      setErrorText('Some Error Occured,Please Try again Later');
    }
  };

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
    setSelectedInv(prevSelectedInv => {
      if (prevSelectedInv.includes(inv)) {
        setSelectedBalanceSum(prevSum => prevSum - balance);
        return prevSelectedInv.filter(item => item !== inv);
      } else {
        setSelectedBalanceSum(prevSum => prevSum + balance);
        return [...prevSelectedInv, inv];
      }
    });
  };

  const statementClick = item => {
    setSelectedStock(item);
    setShowStatementPop(true);
  };

  const outStandingClick = item => {
    setSelectedStock(item);
    setShowOutstandingPop(true);
  };

  const goBack = () => {
    setSelectedStock('');
    setSelectedInv([]);
    setRvAmnt('');
    setSelectedId('');
    setStatementData('');
    setAccountNo('');
    setSelectedBalanceSum(0);
  };

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
    if (appUrl && cmpcode && deptno && salesMan) {
      fetchTop50Customers();
    }
  }, [appUrl, cmpcode, deptno, salesMan]);

  useEffect(() => {
    if (searchItem !== '') {
      searchStock(searchItem);
      setSelectedStock(null);
    }
    if (searchItem == '') {
      setStockData(null);
      setSelectedStock(null);
    }
  }, [searchItem]);

  useEffect(() => {
    if (selectedStock) {
      setAccountNo(selectedStock.account);
    }
  }, [selectedStock]);

  useEffect(() => {
    if (selectedStock && accountNo) {
      fetchStatementData();
    }
  }, [selectedStock, accountNo]);

  useEffect(() => {
    // console.log('dateRunnignRunnufng')
    const currentDate = new Date();
    const sevenDaysBefore = subDays(currentDate, 7);

    const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd');
    const formattedSevenDaysBefore = format(sevenDaysBefore, 'yyyy-MM-dd');

    setFromDate(formattedSevenDaysBefore);
    setToDate(formattedCurrentDate);
  }, []);

  // console.log('searchItem', searchItem)
  // console.log('stockData', stockData)
  // console.log('sleectedCust', selectedStock)
  // console.log('accountNo', accountNo)

  // console.log(fromDate, toDate)

  // console.log('selectedtInv', selectedtInv)

  // console.log('selectedId', selectedId)

  // console.log('statementData', statementData)

  // console.log(fromDate, toDate)

  // ── Shared: render a customer card ──────────────────────────────────────
  const renderCustomerCard = (item, index, showBalance = false) => {
    const isSelected = selectedStock?.account === item.account;
    const balance = Number(item?.credit || 0) - Number(item?.debit || 0);
    const balanceColor =
      balance > 0 ? '#22A45D' : balance < 0 ? '#E74C3C' : '#888';
    const expanded = expandedItems.includes(item.account);

    return (
      <View
        key={index}
        style={[
          styles.CustomerCard,
          isSelected && styles.CustomerCardSelected,
        ]}>
        {/* Main tappable row — clicking anywhere selects the customer */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSelectedStock(item)}
          style={styles.CustomerCardBody}>
          {/* Avatar */}
          <View style={styles.Avatar}>
            <Text style={styles.AvatarText}>
              {(item.Custname || '?').charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Middle info */}
          <View style={styles.CardMid}>
            <Text style={styles.CardName} numberOfLines={1}>
              {item.Custname}
            </Text>
            <View style={styles.CardMetaRow}>
              <Text style={styles.CardMeta}>{item.account}</Text>
              {item.Credit_Limit ? (
                <>
                  <Text style={styles.CardMetaSep}>·</Text>
                  <Text style={styles.CardMeta}>
                    Limit: {item.Credit_Limit}
                  </Text>
                </>
              ) : null}
            </View>
            {showBalance && (
              <Text style={[styles.CardBalance, {color: balanceColor}]}>
                Avail. Bal: {balance.toFixed(2)}
              </Text>
            )}
            {!showBalance && item.Avai_Bal !== undefined && (
              <Text style={[styles.CardBalance, {color: '#5A55CA'}]}>
                Bal: {item.Avai_Bal}
              </Text>
            )}
          </View>

          {/* Right — expand toggle */}
          <TouchableOpacity
            style={styles.ExpandBtn}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            onPress={e => {
              e.stopPropagation();
              toggleExpand(item.account);
            }}>
            <Text style={styles.ExpandBtnText}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Expanded actions */}
        {expanded && (
          <View style={styles.CardActions}>
            <TouchableOpacity
              style={[styles.CardActionBtn, {backgroundColor: '#5A55CA'}]}
              onPress={() => statementClick(item)}>
              <Text style={styles.CardActionText}> Statement</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.CardActionBtn, {backgroundColor: '#30B3A4'}]}
              onPress={() => outStandingClick(item)}>
              <Text style={styles.CardActionText}> Outstanding</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={styles.HomeWrap}>
        <HeaderUiNew name={'Collections'} />
        <ToastManager width={350} height={100} textStyle={{fontSize: 17}} />

        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
          style={styles.HomeCont}>
          <View style={styles.SearchBar}>
            {/* <Text style={styles.SearchIcon}>🔍</Text> */}
            <TextInput
              style={styles.SearchInput}
              placeholder="Search customer name..."
              value={searchItem}
              onChangeText={text => setSearchItem(text)}
              placeholderTextColor="#999"
            />
            {searchItem.length > 0 && (
              <TouchableOpacity onPress={() => setSearchItem('')}>
                <Text style={{color: '#999', fontSize: 16, paddingRight: 8}}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {(showActivity || showLoader) && (
            <ActivityIndicator color="#5A55CA" style={{marginTop: 12}} />
          )}

          {searchItem !== '' && stockData && !selectedStock && (
            <ScrollView
              style={{width: '100%'}}
              contentContainerStyle={styles.ListContainer}
              keyboardShouldPersistTaps="always">
              {stockData.length === 0 ? (
                <View style={styles.EmptyWrap}>
                  <Text style={styles.EmptyText}>No customers found</Text>
                </View>
              ) : (
                stockData.map((item, index) =>
                  renderCustomerCard(item, index, false),
                )
              )}
            </ScrollView>
          )}

          {!stockData && !selectedStock && !searchItem && top50Customers && (
            <ScrollView
              style={{width: '100%'}}
              contentContainerStyle={styles.ListContainer}
              keyboardShouldPersistTaps="always">
              <Text style={styles.ListSectionHeader}>Recent Customers</Text>
              {top50Customers.length === 0 ? (
                <View style={styles.EmptyWrap}>
                  <Text style={styles.EmptyText}>No customers available</Text>
                </View>
              ) : (
                top50Customers.map((item, index) =>
                  renderCustomerCard(item, index, true),
                )
              )}
            </ScrollView>
          )}

          {selectedStock && !showLoader && (
            <ScrollView
              style={{width: '100%'}}
              contentContainerStyle={{paddingBottom: 60}}
              keyboardShouldPersistTaps="always">
              <View style={styles.SelectedCustomerCard}>
                <TouchableOpacity style={styles.BackBtn} onPress={goBack}>
                  <Image
                    style={styles.HeadIcon}
                    source={require('../images/lftArr.png')}
                  />
                </TouchableOpacity>
                <View style={styles.SelectedCustomerInfo}>
                  <Text style={styles.SelectedName}>
                    {selectedStock.Custname}
                  </Text>
                  <Text style={styles.SelectedMeta}>
                    {selectedStock.account}
                  </Text>
                </View>
              </View>

              {showLoader && (
                <ActivityIndicator color="#5A55CA" style={{marginTop: 12}} />
              )}

              {statementData && statementData.length === 0 && !showLoader && (
                <View style={styles.EmptyWrap}>
                  <Text style={styles.EmptyText}>No outstanding invoices</Text>
                </View>
              )}

              {statementData && statementData.length > 0 && (
                <>
                  <View style={styles.SummaryPills}>
                    <View style={styles.Pill}>
                      <Text style={styles.PillLabel}>Selected Bills</Text>
                      <Text style={styles.PillValue}>
                        {selectedtInv.length}
                      </Text>
                    </View>
                    <View style={[styles.Pill, {backgroundColor: '#EEF5FF'}]}>
                      <Text style={styles.PillLabel}>Total Selected</Text>
                      <Text style={[styles.PillValue, {color: '#5A55CA'}]}>
                        {selectedBalanceSum.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.InputGroup}>
                    <Text style={styles.InputLabel}>RV Amount</Text>
                    <TextInput
                      style={styles.ModernInput}
                      placeholder="Enter amount..."
                      keyboardType="numeric"
                      onChangeText={text =>
                        setRvAmnt(text.replace(/[^0-9.]/g, ''))
                      }
                      value={rvAmnt}
                      placeholderTextColor="#bbb"
                    />
                  </View>

                  <View style={styles.InputGroup}>
                    <Text style={styles.InputLabel}>Remarks</Text>
                    <TextInput
                      style={styles.ModernInput}
                      placeholder="Enter remarks..."
                      value={remarks}
                      onChangeText={setRemarks}
                      placeholderTextColor="#bbb"
                    />
                  </View>

                  {/* Invoice list header */}
                  <Text style={styles.InvoiceListHeader}>
                    Outstanding Bills — tap to select
                  </Text>

                  {/* Invoice cards */}
                  <FlatList
                    data={statementData}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    renderItem={({item}) => {
                      const isSelected = selectedtInv.includes(item.INV);
                      return (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={[
                            styles.InvoiceCard,
                            isSelected && styles.InvoiceCardSelected,
                          ]}
                          onPress={() => handlePress(item.INV, item.BALANCE)}>
                          <View style={styles.InvoiceCardLeft}>
                            <Text style={styles.InvoiceNo}>
                              INV: {item.INV}
                            </Text>
                            <Text style={styles.InvoiceDate}>
                              {item.INVDATE.split('T')[0]}
                            </Text>
                          </View>
                          <View style={styles.InvoiceCardRight}>
                            <Text
                              style={[
                                styles.InvoiceBalance,
                                isSelected && {color: '#22A45D'},
                              ]}>
                              {item.BALANCE.toFixed(2)}
                            </Text>
                            {isSelected && (
                              <Text style={styles.SelectedTick}>✓</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    ListEmptyComponent={
                      <Text style={styles.EmptyText}>No invoices</Text>
                    }
                  />

                  {/* Payment type + Save */}
                  <View style={styles.PaymentRow}>
                    <RadioGroup
                      radioButtons={radioButtons}
                      onPress={setSelectedId}
                      selectedId={selectedId}
                      layout="row"
                    />
                    <TouchableOpacity style={styles.SaveBtn} onPress={postData}>
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={styles.SaveBtnText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </View>

      {showStatementPop && (
        <StatementPop
          setShowStatementPop={setShowStatementPop}
          privateKey={privateKey}
          accountNo={accountNo}
          appUrl={appUrl}
          cmpcode={cmpcode}
          setSelectedStock={setSelectedStock}
          selectedStock={selectedStock}
        />
      )}

      {showOutstandingPop && (
        <OutstandingPop
          setShowOutstandingPop={setShowOutstandingPop}
          privateKey={privateKey}
          accountNo={accountNo}
          appUrl={appUrl}
          cmpcode={cmpcode}
          setSelectedStock={setSelectedStock}
          selectedStock={selectedStock}
        />
      )}

      {result && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent2}>
            <View>
              <Text style={styles.SuccessText}>
                Collection Created successfully
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 32,
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'red',
                  padding: 12,
                  borderRadius: 8,
                }}
                onPress={() => resultClosePress()}>
                <Text style={styles.CancelText}>Close</Text>
              </TouchableOpacity>

              {/* this button because no voucher number , because from api i get only result:saved so cannot show
                            this issue came in soca so i told them to go to collection report there voucher number is there,, 
                             then click print then sharing oprion comes  */}
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
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // ── Root layout ───────────────────────────────────────────────
  HomeWrap: {
    flex: 1,
    backgroundColor: '#F2F3F8',
  },
  HomeCont: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // ── Search bar ────────────────────────────────────────────────
  SearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  SearchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#999',
  },
  SearchInput: {
    flex: 1,
    fontFamily: 'Lexend-Regular',
    color: '#222',
    fontSize: 14,
    paddingVertical: 0,
  },

  // ── List container ────────────────────────────────────────────
  ListContainer: {
    paddingBottom: 120,
    paddingTop: 4,
    width: '100%',
  },
  ListSectionHeader: {
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    color: '#888',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  // ── Customer card ─────────────────────────────────────────────
  CustomerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  CustomerCardSelected: {
    borderColor: '#5A55CA',
    borderWidth: 1.5,
  },
  CustomerCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  Avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5A55CA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  AvatarText: {
    color: '#fff',
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
  },
  CardMid: {
    flex: 1,
  },
  CardName: {
    fontFamily: 'Lexend-Regular',
    fontSize: 15,
    color: '#222',
    marginBottom: 3,
  },
  CardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  CardMeta: {
    fontFamily: 'Lexend-Light',
    fontSize: 12,
    color: '#888',
  },
  CardMetaSep: {
    marginHorizontal: 5,
    color: '#ccc',
  },
  CardBalance: {
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    marginTop: 3,
  },
  ExpandBtn: {
    padding: 8,
  },
  ExpandBtnText: {
    fontSize: 10,
    color: '#999',
  },
  CardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  CardActionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  CardActionText: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
  },

  // ── Empty state ───────────────────────────────────────────────
  EmptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  EmptyText: {
    fontFamily: 'Lexend-Regular',
    color: '#aaa',
    fontSize: 14,
  },

  // ── Selected customer header ──────────────────────────────────
  SelectedCustomerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A55CA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  BackBtn: {
    padding: 6,
    marginRight: 8,
  },
  HeadIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  SelectedCustomerInfo: {
    flex: 1,
  },
  SelectedName: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: '#fff',
  },
  SelectedMeta: {
    fontFamily: 'Lexend-Light',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // ── Summary pills ─────────────────────────────────────────────
  SummaryPills: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  Pill: {
    flex: 1,
    backgroundColor: '#F0EFF9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  PillLabel: {
    fontFamily: 'Lexend-Light',
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  PillValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#333',
  },

  // ── Input fields ──────────────────────────────────────────────
  InputGroup: {
    marginBottom: 12,
  },
  InputLabel: {
    fontFamily: 'Lexend-Regular',
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    marginLeft: 2,
  },
  ModernInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Lexend-Regular',
    color: '#222',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // ── Invoice list ──────────────────────────────────────────────
  InvoiceListHeader: {
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    color: '#888',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
    paddingLeft: 2,
  },
  InvoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  InvoiceCardSelected: {
    backgroundColor: '#F0FFF5',
    borderColor: '#22A45D',
  },
  InvoiceCardLeft: {
    flex: 1,
  },
  InvoiceNo: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  InvoiceDate: {
    fontFamily: 'Lexend-Light',
    fontSize: 12,
    color: '#888',
  },
  InvoiceCardRight: {
    alignItems: 'flex-end',
  },
  InvoiceBalance: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#5A55CA',
  },
  SelectedTick: {
    fontSize: 16,
    color: '#22A45D',
    marginTop: 2,
  },

  // ── Payment row ───────────────────────────────────────────────
  PaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  SaveBtn: {
    backgroundColor: '#5A55CA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#5A55CA',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  SaveBtnText: {
    fontFamily: 'Lexend-Bold',
    color: '#fff',
    fontSize: 15,
  },

  // ── Modal (result) ────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  modalContent2: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    padding: 24,
  },
  SuccessText: {
    color: '#22A45D',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    marginBottom: 16,
  },
  CloseModalBtn: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  CloseModalText: {
    color: '#fff',
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
  },
  CancelText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Lexend-Regular',
  },

  // ── Legacy / still-used styles ────────────────────────────────
  StockLabel: {
    fontFamily: 'Lexend-Regular',
    color: '#2b2b2b',
    fontSize: 14,
  },
  radioButtonText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Light',
  },
  StatementButton: {
    backgroundColor: '#64558E',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 6,
  },
  StatementText: {
    fontFamily: 'Lexend-Regular',
    color: 'white',
    fontSize: 14,
  },
  SettingsWrap: {
    padding: 6,
  },
  selectedRow: {
    backgroundColor: '#cce5cc',
  },
  PlaceHolderInput: {
    width: '100%',
    fontFamily: 'Lexend-Regular',
    color: '#3A80EA',
  },
  TANDCInpCont: {
    backgroundColor: '#F0F4FD',
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1.5,
  },
  PDFText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
});

export default NewCollections;
