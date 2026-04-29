import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  TextInput,
  PermissionsAndroid,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import {format} from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {useNavigation} from '@react-navigation/native';
import {Alert} from 'react-native';

const MakeQuotationPop = ({
  setShowQuotationPop,
  showQuotationPop,
  selectedCustomer,
  orderRemark,
  payment,
  delivery,
  validity,
  savedItemData,
  totalUnitPrice,
  cashCustomerName,
  cashCustomerAddress,
  cashCustomerPhone,
  showMakeOrderSuccess,
  showMakeOrderError,
  type,
  salesMan,
  trn,
  deptNo,
  appUrl,
  cmpcode,
  van,
  cmpName,
  loginUser,
  selectedUserType,
  selectedRadio,
  unitValue,

  setSelectedCustomer,
  setOrderRemark,
  setPayment,
  setDelivery,
  setValidity,
  setSavedItemData,
  setTotalUnitPrice,
  setCashCustomerName,
  setCashCustomerAddress,
  setCashCustomerPhone,
  removeAsyncItems,
  setShowSelectedStockPop,
  removeAsyncItemsAfterOrderMade,
  setTrn,
  setVan,
  setShowCartPanel,
  setSelectedUserType,

  page,
}) => {
  const navigation = useNavigation();
  const logoUri = Image.resolveAssetSource(
    require('../images/premier_letterhead.jpeg'),
  ).uri;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalCostAvg, setTotalCostAvg] = useState(0);

  const [discount, setDiscount] = useState(0);

  const [discountedTotal, setDiscountedTotal] = useState(0);

  const [result, setResult] = useState(null);

  const VAT_RATE =
    cmpcode?.toUpperCase() === 'ALESSA' ||
    cmpcode?.toUpperCase() === 'ALESSA_TEST'
      ? 15
      : 5;

  const [pdfUri, setPdfUri] = useState(null);

  const [calculatedValue, setCalculatedValue] = useState('');

  const [vatValue, setVatValue] = useState('');

  const [currentDate, setCurrentDate] = useState('');

  const [storedType, setStoredType] = useState('');

  const [highPriority, setHighPriority] = useState(false);

  const [currency, setCurrency] = useState('');

  console.log('trn', trn);

  useEffect(() => {
    if (cmpcode && cmpcode === 'AUTOMAX') {
      setCurrency('OMR');
    } else {
      setCurrency('AED');
    }
  }, [cmpcode]);

  const getTRNnumber = companyCodeToCheck => {
    switch (companyCodeToCheck) {
      case 'MALBAR':
        return '100335207500003';
      case 'PREMIER':
        return '10027835690000';
      default:
        return '-';
    }
  };

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

    const htmlNew = `
<html>
<head>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 0;
            background-color: white;
        }

        .InvCard {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
             height: 96%;
            background-color: white;
            border-radius: 12px;
            padding: 18px;
        }

        .header {
            /* background-color: #12151C; */
             display: flex;
            flex-direction: row;
            align-items: center;
             justify-content: center;
            width: 100%;
            padding: 8px 0;
            color: black;
            border-top: 1px solid gray;
            border-bottom: 1px solid gray;
             margin-top: 90px;
        }

        .HeadTop {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            padding: 0 24px;
        }

        .LogoContent {
            font-weight: bold;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
            font-size: 24px;
            display:flex;
            justify-content: center;
        }

        .CmpnyLogo {
            width: 80%;
            height: 150px;
        }

        .HeadInvoiceData {
            width: 40%;
            text-align: right;
        }

        .InvcData {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            /* margin: 12px 0; */
            font-weight: bold;
            font-family: InriaSans-Regular, sans-serif;
            width: 100%;
        }

        .HeadBottom {
            display: flex;
            flex-direction: row;
            width: 100%;
        }

        .ContactItem {
            display: flex;
            flex-direction: row;
            padding: 24px;
            align-items: center;
            font-size: 14px;
            margin-right: 12px;
            font-family: InriaSans-Regular, sans-serif;
        }

        .ContactItemImg {
            width: 25px;
            height: 25px;
            margin-right: 8px;
        }

        .content {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .topSection {
            display: flex;
            flex-wrap: wrap;
            flex-direction: row;
            justify-content: space-between;
        }

        .section {
            margin: 8px 0;
            width: 30%;
        }

        .label {
            font-size: 14px;
            font-weight: bold;
            font-family: InriaSans-Regular, sans-serif;
        }

        .labelValue {
            font-size: 14px;
            margin: 4px 0;
            font-family: InriaSans-Regular, sans-serif;
        }

        .tableCont {
            /* width: 100%; */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 12px;
            flex-grow: 1;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        td {
            border-bottom: 1px solid gray;
            padding: 8px;
            text-align: left;
            color: rgb(75, 75, 75);
            font-size: 14px;
            font-family: InriaSans-Regular, sans-serif;
        }

        thead tr {
            border-bottom: 1px solid black;
        }

        th {
            text-align: left;
        }

        .BottomTotalCont {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            flex-direction: row;
        }

        .TotalValues {
            width: 45%;
            display: flex;
            flex-direction: column;
        }

        .subtotal,
        .vat,
        .grandTotal {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            font-size: 14px;
            font-family: InriaSans-Regular, sans-serif;
        }

        .grandTotal {
            font-size: 16px;
            font-weight: bold;
            color: blue;
            font-family: InriaSans-Regular, sans-serif;
        }

        .netTotal {
            font-size: 16px;
            font-weight: bold;
            font-family: InriaSans-Regular, sans-serif;
        }

        .BottomSignSection {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 50px;
        }

        .ForCustomer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .CustomerName {
            font-family: InriaSans-Bold, sans-serif;
        }

        .SignBoxCont {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .SignBox {
            width: 120px;
            height: 40px;
            border: 1px solid grey;
        }

        .our_trn_number {
            display: flex;
            justify-content: center;
            margin: 8px 0;
        }

        .our_company_name_panel {
            display: flex;
            justify-content: space-between;
            padding: 0px 8px;
        }

         .TopRightItemCont {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .TopRightLables {
            font-size: 14px;
            font-weight: bold;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
            padding: 2px 0px;
        }

        .TrnTop {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: max-content;
            padding: 0px 8px;
        }

           .footer-received-panel {
            display: flex;
            justify-content: space-between;
            padding-right: 12px;
        }

          .loginUserLabel {
            display: flex;
            flex-direction: column;
        }

         .footer {
            width: 100%;
            display: flex;
            flex-direction: column;
            margin-top: 18px;
            padding: 0px 8px;
        }


        .footerPageNo {
            position: fixed;
            bottom: 10px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #333;
            counter-reset: page;
        }
        .footerPageNo::before {
            counter-increment: page;
            content: "Page " counter(page);
        }
        .image_letterhead{
            width:"100%";
            height:100px;
        }
        

    </style>
    </head>

    <body>
    <div class="InvCard">

    ${
      cmpcode.toLowerCase().trim() == 'premier'
        ? `<div>
    <img class="image_letterhead" src=${logoUri}
    </div>`
        : ''
    }

        <div class=${
          cmpcode == 'premier' ? 'header_without_top_margin' : 'header'
        }>
            <div class="LogoContent">
                <div>TAX INVOICE</div>
            </div>
        </div>

        <div class="content">

            <div class="our_trn_number">
                <div class="label">TRN:${getTRNnumber(
                  cmpcode?.toUpperCase().trim(),
                )}</div>
            </div>

            <div class="our_company_name_panel">

                <div class="section">
                    <div class="label">Invoice To:</div>
                    <div class="labelValue" style="font-weight: bold;">${
                      selectedCustomer
                        ? selectedCustomer.Custname
                        : cashCustomerName
                        ? cashCustomerName
                        : ''
                    }
                    </div>
                    <div class="labelValue">${
                      selectedCustomer
                        ? selectedCustomer.address1
                        : cashCustomerAddress
                        ? cashCustomerAddress
                        : ''
                    }
                    </div>
                    <div class="labelValue">${
                      selectedCustomer ? selectedCustomer.address2 : ''
                    }</div>
                    <div class="labelValue">${
                      selectedCustomer ? selectedCustomer.address3 : ''
                    }</div>
                </div>

                <div class="TopRightItemCont">

                    <div>
                        <div class="TopRightLables">Invoice No</div>
                        <div class="TopRightLables">Date</div>
                        <div class="TopRightLables">${
                          selectedRadio === 'CREDIT'
                            ? `Payment Terms`
                            : selectedRadio === 'CASH'
                            ? `CASH`
                            : ''
                        }</div>
                    </div>
                    <div style="margin-left: 8px; margin-right: 8px;">
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                    </div>
                    <div>
                        <div style="font-weight: bold;">${
                          result.invoiceNo ? result.invoiceNo : ''
                        }
                        </div>
                        <div style="padding-top:1px">${new Date()
                          .toJSON()
                          .slice(0, 10)
                          .split('-')
                          .reverse()
                          .join('/')}
                        </div>
                        <div style="padding-top:1px">${
                          payment ? payment : ''
                        }</div>
                    </div>
                </div>

            </div>

             <div class="TrnTop">
                <div class="label">TRN Number:</div>
                <div class="labelValue">${trn ? trn : ''}</div>
            </div>


            <div class="tableCont">

                <table>
                    <thead>
                        <tr>
                            <th>Sl.No</th>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Unit</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>

                        </tr>
                    </thead>

                    <tbody>

                       ${savedItemData
                         .map(
                           (item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.Description}</td>
                            <td>${item.quantity}</td>
                            <td>${item.unit}</td>
                            <td style="text-align: right;">${new Intl.NumberFormat(
                              'en-US',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            ).format(item.unitPrice)}</td>
                            <td style="text-align: right;">${new Intl.NumberFormat(
                              'en-US',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            ).format(item.unitPrice * item.quantity)}</td>
                        </tr>
                        `,
                         )
                         .join('')}
                        <tr style="border:none; font-weight: bold; margin-top:12px">
                            <td colspan="4" style="border:none; padding:4px;">Terms:</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                Discount:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${
                                  discount !== 0
                                    ? discount
                                      ? discount
                                      : '0.00'
                                    : '0.00'
                                }</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;"></td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                Subtotal:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${
                                  totalUnitPrice
                                    ? new Intl.NumberFormat('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(totalUnitPrice)
                                    : ''
                                }</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;"></td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">VAT
                                ${
                                  cmpcode?.toUpperCase() === 'ALESSA' ||
                                  cmpcode?.toUppercase() === 'ALESSA_TEST'
                                    ? 15
                                    : 5
                                }%:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${
                                  discount !== 0
                                    ? discountedTotal
                                      ? (
                                          discountedTotal *
                                          (VAT_RATE / 100)
                                        ).toFixed(2)
                                      : ''
                                    : totalUnitPrice
                                    ? (
                                        totalUnitPrice *
                                        (VAT_RATE / 100)
                                      ).toFixed(2)
                                    : ''
                                }</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;"></td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">Amount
                                Incl. VAT:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${
                                  discount !== 0
                                    ? discountedTotal
                                      ? new Intl.NumberFormat('en-US', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(
                                          discountedTotal +
                                            discountedTotal * (VAT_RATE / 100),
                                        )
                                      : ''
                                    : totalUnitPrice
                                    ? new Intl.NumberFormat('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(
                                        totalUnitPrice +
                                          totalUnitPrice * (VAT_RATE / 100),
                                      )
                                    : ''
                                }</td>
                        </tr>

                    </tbody>
                </table>

                 
            </div>
            
            <div class="footer">

                <div class="footer-received-panel">
                    <label class="loginUserLabel">
                        <div style="font-weight: bold;">For ${cmpcode}</div>
                        <div>${loginUser ? loginUser : ''}</div>
                    </label>
                    <label class="loginUserLabel" style="margin-right:12px;">
                        <div style="font-weight: bold;">For ${
                          selectedCustomer
                            ? selectedCustomer.Custname
                            : cashCustomerName
                            ? cashCustomerName
                            : ''
                        }</div>
                        <div>Received By,</div>
                    </label>
                </div>

            </div>
        </div>
    </div>

   
        </body>    
        </html>`;

    const htmlNewMalbar = `
<html>

<head>

    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
        }

        .InvCard {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 98%;
            background-color: white;
            border-radius: 12px;
           padding: 18px;
        }

        .header {
            /* background-color: #12151C; */
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 8px 0;
            color: black;
            border-top: 1px solid gray;
            border-bottom: 1px solid gray;
            margin-top: 90px;
        }

        .header_without_top_margin {
            /* background-color: #12151C; */
            display: flex;
            flex-direction: row;
            align-items: center;
             justify-content: center;
            width: 100%;
            padding: 8px 0;
            color: black;
            border-top: 1px solid gray;
            border-bottom: 1px solid gray;
             margin-top: 2px;
        }

        .HeadTop {
            display: flex;
            flex-direction: row;
            justify-content: center;
            width: 100%;
            padding: 0 24px;
        }

        .LogoContent {
            font-weight: bold;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
            font-size: 24px;
        }

        .CmpnyLogo {
            width: 80%;
            height: 150px;
        }

        .HeadInvoiceData {
            width: 40%;
            text-align: right;
        }

        .InvcData {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            /* margin: 12px 0; */
            font-weight: bold;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
            width: 100%;
        }

        .HeadBottom {
            display: flex;
            flex-direction: row;
            width: 100%;
        }

        .ContactItem {
            display: flex;
            flex-direction: row;
            padding: 24px;
            align-items: center;
            font-size: 14px;
            margin-right: 12px;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
        }

        .ContactItemImg {
            width: 25px;
            height: 25px;
            margin-right: 8px;
        }

        .content {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .topSection {
            display: flex;
            flex-wrap: wrap;
            flex-direction: row;
            justify-content: space-between;
        }

        .section {
            margin: 8px 0;
            width: 30%;
        }

        .label {
            font-size: 14px;
            font-weight: bold;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
        }

        .labelValue {
            font-size: 14px;
            margin: 4px 0;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
        }

        .tableCont {
            /* width: 100%; */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 12px;
            flex-grow: 1;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        td {
            border-bottom: 1px solid gray;
            padding: 8px;
            text-align: left;
            color: rgb(75, 75, 75);
            font-size: 14px;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
        }

        thead tr {
            border-top: 1px solid black;
            border-bottom: 1px solid black;
        }

        th {
            text-align: left;
        }

        .BottomTotalCont {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            flex-direction: row;
        }

        .TotalValues {
            width: 45%;
            display: flex;
            flex-direction: column;
        }

        .subtotal,
        .vat,
        .grandTotal {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            font-size: 14px;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
        }

        .grandTotal {
            font-size: 16px;
            font-weight: bold;
            color: blue;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
        }

        .netTotal {
            font-size: 16px;
            font-weight: bold;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
        }

        .our_trn_number {
            display: flex;
            justify-content: center;
            margin: 8px 0;
        }

        .our_company_name_panel {
            display: flex;
            justify-content: space-between;
            padding: 0px 8px;
        }

        .horizontal {
            display: flex;
            align-items: center;
        }

        .marginLefTen {
            margin-left: 10px;
        }

        .footer-received-panel {
            display: flex;
            justify-content: space-between;
            padding-right: 12px;
        }

        .footer {
            width: 100%;
            display: flex;
            flex-direction: column;
            margin-top: 18px;
            padding: 0px 8px;
        }

        .declarations {
            width: 100%;
            flex-direction: column;
            justify-content: flex-start;
            border-top: 1px solid gray;
            border-bottom: 1px solid gray;
        }

        .small-text {
            font-size: 12px;
            margin-top: 4px;
        }

        .loginUserLabel {
            display: flex;
            flex-direction: column;
        }

        .Pagefooter {
            display: flex;
            flex-direction: row;
            justify-content: center;
            position: absolute;
            bottom: 0px;
            width: 100%;
        }

        .TopRightItemCont {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .TopRightLables {
            font-size: 14px;
            font-weight: bold;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
            padding: 2px 0px;
        }

        .TrnTop {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: max-content;
            padding: 0px 8px;
        }

          .footer {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding-top: 10px;
            font-size: 12px;
            border-top: 1px solid gray;
            position: absolute;
            bottom: 0;
        }

        
        .BottomSignSection {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 50px;
        }

    </style>
</head>

<body>
    <div class="InvCard">
        <div class="header">
            <div class="LogoContent">
                <div>TAX INVOICE</div>
            </div>
        </div>

        <div class="content">

            <div class="our_trn_number">
                <div class="label">TRN:100335207500003</div>
            </div>

            <div class="our_company_name_panel">

                <div class="section">
                    <div class="label">Invoice To:</div>
                    <div class="labelValue" style="font-weight: bold;">${
                      selectedCustomer
                        ? selectedCustomer.Custname
                        : cashCustomerName
                        ? cashCustomerName
                        : ''
                    }
                    </div>
                    <div class="labelValue">${
                      selectedCustomer
                        ? selectedCustomer.address1
                        : cashCustomerAddress
                        ? cashCustomerAddress
                        : ''
                    }
                    </div>
                    <div class="labelValue">${
                      selectedCustomer ? selectedCustomer.address2 : ''
                    }</div>
                    <div class="labelValue">${
                      selectedCustomer ? selectedCustomer.address3 : ''
                    }</div>
                </div>

                <div class="TopRightItemCont">

                    <div>
                        <div class="TopRightLables">Invoice No</div>
                        <div class="TopRightLables">Date</div>
                        <div class="TopRightLables">${
                          selectedRadio === 'CREDIT'
                            ? `Payment Terms`
                            : selectedRadio === 'CASH'
                            ? `CASH`
                            : ''
                        }</div>
                    </div>
                    <div style="margin-left: 8px; margin-right: 8px;">
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                    </div>
                    <div>
                        <div style="font-weight: bold;">MFS-${
                          result.invoiceNo ? result.invoiceNo : ''
                        }
                        </div>
                        <div style="padding-top:1px">${new Date()
                          .toJSON()
                          .slice(0, 10)
                          .split('-')
                          .reverse()
                          .join('/')}
                        </div>
                        <div style="padding-top:1px">${
                          payment ? payment : ''
                        }</div>
                    </div>
                </div>

            </div>

            <div class="TrnTop">
                <div class="label">TRN Number:</div>
                <div class="labelValue">${trn ? trn : ''}</div>
            </div>


            <div class="tableCont">
                <table>
                    <thead>
                        <tr>
                            <th>Sl.No</th>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Unit</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>

                        </tr>
                    </thead>

                    <tbody>

                        ${savedItemData
                          .map(
                            (item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.Description}</td>
                            <td>${item.quantity}</td>
                            <td>${item.unit}</td>
                            <td style="text-align: right;">${new Intl.NumberFormat(
                              'en-US',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            ).format(item.unitPrice)}</td>
                            <td style="text-align: right;">${new Intl.NumberFormat(
                              'en-US',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            ).format(item.unitPrice * item.quantity)}</td>


                        </tr>
                        `,
                          )
                          .join('')}
                        <tr style="border:none; font-weight: bold; margin-top:12px">
                            <td colspan="4" style="border:none; padding:4px;">Terms:</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                Discount:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${
                                  discount !== 0
                                    ? discount
                                      ? discount
                                      : '0.00'
                                    : '0.00'
                                }</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;">1. Goods received in good condition.</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                Subtotal:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${
                                  totalUnitPrice
                                    ? new Intl.NumberFormat('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(totalUnitPrice)
                                    : ''
                                }</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;">2. Expired goods will not be taken back
                                under any circumstances.</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">VAT
                                (${
                                  cmpcode?.toUpperCase() === 'ALESSA' ||
                                  cmpcode?.toUppercase() === 'ALESSA_TEST'
                                    ? 15
                                    : 5
                                }%):</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${
                                  discount !== 0
                                    ? discountedTotal
                                      ? (
                                          discountedTotal *
                                          (VAT_RATE / 100)
                                        ).toFixed(2)
                                      : ''
                                    : totalUnitPrice
                                    ? (
                                        totalUnitPrice *
                                        (VAT_RATE / 100)
                                      ).toFixed(2)
                                    : ''
                                }</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;">3. Goods once sold will not be taken back
                                or exchanged.</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">Amount
                                Incl. VAT:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${
                                  discount !== 0
                                    ? discountedTotal
                                      ? new Intl.NumberFormat('en-US', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(
                                          discountedTotal +
                                            discountedTotal * (VAT_RATE / 100),
                                        )
                                      : ''
                                    : totalUnitPrice
                                    ? new Intl.NumberFormat('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(
                                        totalUnitPrice +
                                          totalUnitPrice * (VAT_RATE / 100),
                                      )
                                    : ''
                                }</td>
                        </tr>

                    </tbody>
                </table>
            </div>
            
            <div class="BottomSignSection">

                <div class="footer-received-panel">
                    <label class="loginUserLabel">
                        <div style="font-weight: bold;">For ${cmpcode} </div>
                        <div>${loginUser ? loginUser : ''}</div>
                    </label>
                    <label class="loginUserLabel" style="margin-right:12px;">
                        <div style="font-weight: bold;">For ${
                          selectedCustomer
                            ? selectedCustomer.Custname
                            : cashCustomerName
                            ? cashCustomerName
                            : ''
                        }</div>
                        <div>Received By,</div>
                    </label>
                </div>

            </div>
        </div>
    </div>
</body>

</html>
  `;

    const addPageNumbersToHTML = (html, totalPages) => {
      let pageNumberHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        pageNumberHTML += `<div class="page-number">Page ${i} of ${totalPages}</div>`;
      }

      return html.replace(
        /<div class="Pagefooter">([\s\S]*?)<\/div>/g,
        (_, footerContent) => {
          const pageNumberDiv = pageNumberHTML.split('</div>')[0] + '</div>';
          pageNumberHTML = pageNumberHTML.replace(pageNumberDiv, '');
          return `<div class="Pagefooter">${footerContent}${pageNumberDiv}</div>`;
        },
      );
    };

    const cmpcodeChk = cmpcode.toUpperCase();
    // const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNewMalbar : htmlNew;
    const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNew : htmlNew;

    console.log('cmpcodeChk', cmpcodeChk);

    let options = {
      html: initialHTML,
      fileName: 'Invoice',
      directory: 'Documents',
    };

    try {
      // Generate the initial PDF to get the total number of pages
      const file = await RNHTMLtoPDF.convert(options);
      const totalPages = file.numberOfPages; // Assuming the library returns the number of pages

      // Modify the HTML to include page numbers
      // let updatedHTML = addPageNumbersToHTML(initialHTML, totalPages);

      // Create a new options object for the final PDF generation
      // let finalOptions = {
      //     html: updatedHTML,
      //     fileName: 'Invoice',
      //     directory: 'Documents',
      // };

      // Generate the final PDF with page numbers
      // const finalFile = await RNHTMLtoPDF.convert(options);
      // setPdfUri(`file://${finalFile.filePath}`);
      // await Share.open({
      //     title: 'Share Order Details PDF',
      //     url: `file://${finalFile.filePath}`,
      // });

      //
      // const file = await RNHTMLtoPDF.convert(options);

      setPdfUri(`file://${file.filePath}`);
      await Share.open({
        title: 'Share Invoice Details PDF',
        url: `file://${file.filePath}`,
      });
    } catch (err) {
      console.error('Error sharing PDF:', err);
    } finally {
      resultClosePress();
    }
  };

  useEffect(() => {
    let value = '';
    let vat = '';
    if (discount !== 0) {
      value = discountedTotal
        ? (discountedTotal + discountedTotal * (VAT_RATE / 100)).toFixed(2)
        : '';
      vat = discountedTotal
        ? (discountedTotal * (VAT_RATE / 100)).toFixed(2)
        : '';
    } else {
      value = totalUnitPrice
        ? (totalUnitPrice + totalUnitPrice * (VAT_RATE / 100)).toFixed(2)
        : '';
      vat = totalUnitPrice
        ? (totalUnitPrice * (VAT_RATE / 100)).toFixed(2)
        : '';
    }
    setCalculatedValue(value);
    setVatValue(vat);
  }, [discount, discountedTotal, totalUnitPrice]);

  useEffect(() => {
    const d = new Date();
    const formattedCurrentDate = format(d, 'yyyy-MM-dd');
    setCurrentDate(formattedCurrentDate);
  }, []);

  useEffect(() => {
    const getTypeFromAsyncStorage = async () => {
      try {
        const value = await AsyncStorage.getItem('type');
        if (value !== null) {
          setStoredType(value);
        }
      } catch (err) {
        console.error('Error retrieving type from AsyncStorage:', err);
      }
    };

    getTypeFromAsyncStorage();
  }, []);

  const makeQuotation = async () => {
    setLoading(true);

    if (savedItemData && savedItemData.length > 0) {
      try {
        const postData = JSON.stringify(transformedData);

        console.log('makeQuotationApi+++====>>> postData xxxx', postData);

        console.log(
          'makeQuotationApi>>>',
          `${appUrl}Proposal/SaveQuotation?cmpcode=${cmpcode}`,
        );

        console.log('Payload Data ------', postData);

        const response = await axios.post(
          `${appUrl}Proposal/SaveQuotation?cmpcode=${cmpcode}`,
          postData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (
          response.data.message ||
          response.data.result?.trim().toUpperCase() === 'SAVED'
        ) {
          const quotNo = response.data.message || 'New';
          // 0. Trigger parent success (notifications, etc)
          showMakeOrderSuccess();

          // 1. CLEAR DATA
          setSelectedCustomer(null);
          setOrderRemark('');
          setTrn('');
          setVan('');
          setPayment('');
          setDelivery('');
          setValidity('');
          setSavedItemData([]);
          setTotalUnitPrice(0);
          setCashCustomerName('');
          setCashCustomerAddress('');
          setCashCustomerPhone('');
          removeAsyncItemsAfterOrderMade();
          setShowQuotationPop(false);
          setShowSelectedStockPop(false);
          setShowCartPanel(false);

          // 2. SHOW SUCCESS ALERT WITH OPTIONS
          Alert.alert(
            'Success',
            `Quotation #${quotNo} created successfully!`,
            [
              {
                text: 'New Quotation',
                onPress: () => console.log('Staying for new quotation'),
                style: 'default',
              },
              {
                text: 'View Quotation List',
                onPress: () => navigation.navigate('InvoiceList'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      } catch (err) {
        setError('Error creating order');
        console.error('Error creating order', err);
        showMakeOrderError();
        setShowQuotationPop(false);
        setShowSelectedStockPop(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const resultClosePress = async () => {
    setSelectedCustomer(null);
    setOrderRemark('');
    setTrn('');
    setPayment('');
    setDelivery('');
    setValidity('');
    setSavedItemData([]);
    setTotalUnitPrice();
    setCashCustomerName('');
    setCashCustomerAddress('');
    setCashCustomerPhone('');
    setShowQuotationPop(false);
    removeAsyncItemsAfterOrderMade();
    setShowSelectedStockPop(false);
    setTotalCostAvg(0);
    setShowCartPanel(false);
  };

  const transformData = (
    data,
    customer,
    orderRem,
    payM,
    delivM,
    validM,
    totalP,
    cashN,
    cashA,
    cashPh,
  ) => {
    // Quotation updated to new API structure
    console.log('transformData=====> called ');
    const formattedDateForTr = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

    return {
      modeOp: 'SAVE',
      soNo: 0,
      soDate: formattedDateForTr,
      custAcc:
        selectedUserType === 'reg' && customer ? customer.account : 'CASH',
      jvNum: '0',
      comments: orderRem || '',
      saleMan: salesMan || '',
      invNo: 0,
      soStatus: 'N',
      areaCode: 'ADMIN',
      soRef: '0',
      soDoc: '0',
      fc: 'AED',
      soAmount: parseFloat(totalP || 0),
      soFcAmt: parseFloat(totalP || 0),
      soFcRate: 1.0,
      soDisc: parseFloat(discount || 0),
      dueDate: formattedDateForTr,
      soFDisc: parseFloat(discount || 0),
      accDesc:
        selectedUserType === 'reg' && customer
          ? customer.Custname
          : cashN || '',
      head1: 'Quote Header',
      subject: 'Services Quote',
      foot1: 'Terms & Conditions',
      payment: payM || '',
      delivery: delivM || '',
      validity: validM || '',
      deptNo: deptNo?.trim() || '01',
      estiNo: 0,
      quotNo: 2, // identifier for mobile app
      ordNo: '0',
      remarks: orderRem || '',
      c1: '',
      c2: '',
      c3: '',
      items: data.map((item, index) => {
        const itemAmount =
          parseFloat(item.unitPrice) * parseFloat(item.quantity);
        const itemVatAmt = itemAmount * (VAT_RATE / 100);
        return {
          slno: (index + 1).toString(),
          code: item.Code?.trim(),
          description: item.Description?.trim(),
          locn: van || '',
          unit: unitValue || item.unit,
          qty: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          discPercent: 0,
          blkPrice: parseFloat(item.unitPrice),
          amount: itemAmount,
          x: '',
          cntrl: '',
          fraction: 1,
          vatPercent: VAT_RATE,
          vatAmt: itemVatAmt,
          total: itemAmount + itemVatAmt,
          oem: '',
          uPriceVIncl: parseFloat(item.unitPrice) * (1 + VAT_RATE / 100),
          remarks: '',
        };
      }),
    };
  };

  const transformedData = transformData(
    savedItemData,
    selectedCustomer,
    orderRemark,
    payment,
    delivery,
    validity,
    totalUnitPrice,
    cashCustomerName,
    cashCustomerAddress,
    cashCustomerPhone,
  );

  useEffect(() => {
    if (savedItemData) {
      const totalCostAvgValue =
        savedItemData &&
        savedItemData.reduce(
          (sum, item) => sum + item.Cost_Avg * item.quantity,
          0,
        );
      if (totalCostAvgValue) {
        setTotalCostAvg(totalCostAvgValue.toFixed(2));
      }
    }
  }, [savedItemData]);

  useEffect(() => {
    // Safely parse discount to a number and default to 0 if NaN or empty
    const discountVal = parseFloat(discount) || 0;

    if (discountVal !== 0) {
      const newTotal = totalUnitPrice - discountVal;
      setDiscountedTotal(newTotal);
    } else {
      setDiscountedTotal(totalUnitPrice);
    }
  }, [discount, totalUnitPrice]);

  // const showFormEmptyToast = () => {
  //     Toast.error('UserId and Password cant be empty')
  // }

  // useEffect(() => {
  //     showFormEmptyToast()
  // }, [])
  // console.log('transformedData', JSON.stringify(transformedData, null, 2));

  console.log('selectedCustomer', selectedCustomer);
  console.log('savedItemData', savedItemData);

  // console.log('totalCostAvg', totalCostAvg)

  // console.log('discountedTotal', discountedTotal)

  // console.log('calculatedValue', calculatedValue)

  // console.log('trn', trn)

  // console.log('makeOrderApi', `${appUrl}Sales_Order`)

  // console.log('van', van)

  console.log('selectedRadio', selectedRadio);

  // console.log('page', page)

  console.log('type', type);

  console.log('highPriority', highPriority);

  return (
    <>
      <View style={styles.modalContainer}>
        {/* Added KeyboardAvoidingView to keep buttons visible when typing discount */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.modalContent}>
            {/* 1. FIXED HEADER */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowQuotationPop(false)}>
                <Image
                  style={styles.backIcon}
                  source={require('../images/lftArr.png')}
                />
                <Text style={styles.headerTitle}>Quotation</Text>
              </TouchableOpacity>
            </View>

            {/* 2. SCROLLABLE BODY (Only this part scrolls) */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              style={styles.scrollViewStyle}>
              {/* Customer Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Customer Details</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>
                      {selectedCustomer
                        ? selectedCustomer.Custname
                        : cashCustomerName || '---'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={[styles.infoValue, {textAlign: 'right'}]}>
                      {selectedCustomer
                        ? `${selectedCustomer.address1 || ''} ${
                            selectedCustomer.address2 || ''
                          } ${selectedCustomer.address3 || ''}`
                        : cashCustomerAddress || '---'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>
                      {selectedCustomer
                        ? selectedCustomer.phone
                        : cashCustomerPhone || '---'}
                    </Text>
                  </View>
                  <View style={[styles.infoRow, {borderBottomWidth: 0}]}>
                    <Text style={styles.infoLabel}>TRN</Text>
                    <Text style={styles.infoValue}>{trn || '---'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Selected Items</Text>
                <Text style={styles.itemCount}>
                  {savedItemData?.length || 0} items
                </Text>
              </View>

              {/* Items List */}
              <View style={styles.itemsContainer}>
                {savedItemData &&
                  savedItemData.map((item, index) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemBadge}>
                          <Text style={styles.itemBadgeText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.Description}
                        </Text>
                      </View>
                      <View style={styles.itemDetails}>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Code</Text>
                          <Text style={styles.detailValue}>{item.Code}</Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Price</Text>
                          <Text style={styles.detailValue}>
                            {parseFloat(item.unitPrice).toFixed(
                              cmpcode === 'AUTOMAX' ? 3 : 2,
                            )}
                          </Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Qty</Text>
                          <Text style={styles.detailValue}>
                            {parseFloat(item.quantity).toFixed(0)}
                          </Text>
                        </View>
                        <View
                          style={[styles.detailCol, {alignItems: 'flex-end'}]}>
                          <Text style={styles.detailLabel}>Total</Text>
                          <Text style={styles.detailValuePrimary}>
                            {(item.unitPrice * item.quantity).toFixed(
                              cmpcode === 'AUTOMAX' ? 3 : 2,
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>

              {/* Order Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryTitle}>Order Summary</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    {currency}{' '}
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                      maximumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                    }).format(totalUnitPrice || 0)}
                  </Text>
                </View>
                {cmpcode?.toUpperCase() !== 'ALESSA' && (
                  <View style={styles.discountContainer}>
                    <Text style={styles.summaryLabel}>Discount</Text>

                    <TextInput
                      style={styles.discountInput}
                      placeholder="0.00"
                      value={discount.toString()}
                      keyboardType="numeric"
                      onChangeText={text => {
                        const numericText = text.replace(/[^0-9.]/g, '');
                        setDiscount(numericText);
                      }}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Net Total</Text>
                  <Text style={styles.summaryValue}>
                    {currency}{' '}
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                      maximumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                    }).format(
                      (parseFloat(discount) || 0) !== 0
                        ? discountedTotal
                        : totalUnitPrice,
                    )}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    VAT (
                    {cmpcode?.toUpperCase() === 'ALESSA' ||
                    cmpcode?.toUpperCase() === 'ALESSA_TEST'
                      ? 15
                      : 5}
                    %):
                  </Text>
                  <Text style={styles.summaryValue}>
                    {currency}{' '}
                    {(
                      ((parseFloat(discount) || 0) !== 0
                        ? discountedTotal
                        : totalUnitPrice) *
                      (VAT_RATE / 100)
                    ).toFixed(cmpcode === 'AUTOMAX' ? 3 : 2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalAmount}>
                    {currency}{' '}
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                      maximumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                    }).format(
                      ((parseFloat(discount) || 0) !== 0
                        ? discountedTotal
                        : totalUnitPrice) *
                        (1 + VAT_RATE / 100),
                    )}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {loading && (
              <ActivityIndicator size={'large'} style={{marginVertical: 10}} />
            )}
            {error && <Text style={styles.ErrorText}>{error}</Text>}

            {/* 3. FIXED FOOTER BUTTONS (Outside ScrollView) */}
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowQuotationPop(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => makeQuotation()}>
                <Text style={styles.sendButtonText}>Send Quotation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Success Modal Overlay */}
      {result && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent2}>
            <View>
              <Text style={styles.SuccessText}>
                InvoiceNo: {result.invoiceNo} Created successfully
              </Text>
            </View>
            <View style={styles.resultButtonsRow}>
              <TouchableOpacity
                style={styles.resultCloseBtn}
                onPress={() => resultClosePress()}>
                <Text style={styles.CancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resultSaveBtn}
                onPress={generatePDF}>
                <Text style={styles.PDFText}>Save Pdf</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    zIndex: 10,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 60, // Permanent fix for occlusion from nav bars/tabs
  },
  keyboardView: {
    width: '100%',
    flex: 1, // Added flex: 1 to ensure KeyboardAvoidingView fills the space
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    height: Dimensions.get('window').height * 0.9, // Fixed height for internal scrolling
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    overflow: 'hidden', // Ensures content doesn't bleed out of rounded corners
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#6366f1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 12,
    fontFamily: 'Lexend-Bold',
  },
  scrollViewStyle: {
    flex: 1, // This allows the scrollview to fill the gap between header and footer
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    fontFamily: 'Lexend-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Lexend-Regular',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    fontFamily: 'Lexend-Medium',
    flex: 2,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'Lexend-Bold',
  },
  itemCount: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  itemsContainer: {
    paddingHorizontal: 16,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    fontFamily: 'Lexend-Medium',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
    fontFamily: 'Lexend-Regular',
  },
  detailValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    fontFamily: 'Lexend-Medium',
  },
  detailValuePrimary: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '700',
    fontFamily: 'Lexend-Bold',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'Lexend-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Lexend-Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    fontFamily: 'Lexend-Medium',
  },
  discountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  discountInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 100,
    textAlign: 'right',
    fontSize: 14,
    color: '#1e293b',
    fontFamily: 'Lexend-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'Lexend-Bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366f1',
    fontFamily: 'Lexend-Bold',
  },
  footerButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Lexend-Medium',
  },
  sendButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Lexend-Bold',
  },
  modalContent2: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '85%',
    padding: 24,
    alignItems: 'center',
    elevation: 20,
  },
  SuccessText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    fontFamily: 'Lexend-Bold',
    marginBottom: 20,
  },
  resultButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    width: '100%',
  },
  resultCloseBtn: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  resultSaveBtn: {
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  CancelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  PDFText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ErrorText: {
    color: '#ef4444',
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default MakeQuotationPop;
