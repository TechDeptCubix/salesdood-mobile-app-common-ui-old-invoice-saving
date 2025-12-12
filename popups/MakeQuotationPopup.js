import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, ScrollViewComponent, Image, TextInput, PermissionsAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import REACT_APP_BASE_URL from '../url/AppUrl';
import ToastManager from 'toastify-react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from "react-native-bouncy-checkbox";


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

    page
}) => {

    const logoUri = Image.resolveAssetSource(
        require("../images/premier_letterhead.jpeg")
    ).uri;

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [totalCostAvg, setTotalCostAvg] = useState(0)

    const [discount, setDiscount] = useState(0)

    const [discountedTotal, setDiscountedTotal] = useState(0);

    const [result, setResult] = useState(null)

    const VAT_RATE = 5;

    const [pdfUri, setPdfUri] = useState(null);

    const [calculatedValue, setCalculatedValue] = useState('');

    const [vatValue, setVatValue] = useState('')

    const [currentDate, setCurrentDate] = useState('')

    const [storedType, setStoredType] = useState('');

    const [highPriority, setHighPriority] = useState(false)

    const [currency, setCurrency] = useState('')

    console.log('trn', trn)

    useEffect(() => {
        if (cmpcode && cmpcode === 'AUTOMAX') {
            setCurrency('OMR')
        } else {
            setCurrency('AED')
        }
    }, [cmpcode])

    const getTRNnumber = (companyCodeToCheck) => {

        switch (companyCodeToCheck) {
            case "MALBAR": return "100335207500003";
            case "PREMIER": return "10027835690000"
            default: return "-"
        }

    }

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

    ${cmpcode.toLowerCase().trim() == 'premier' ? `<div>
    <img class="image_letterhead" src=${logoUri}
    </div>` : ""}

        <div class=${cmpcode == 'premier' ? "header_without_top_margin" : "header"}>
            <div class="LogoContent">
                <div>TAX INVOICE</div>
            </div>
        </div>

        <div class="content">

            <div class="our_trn_number">
                <div class="label">TRN:${getTRNnumber(cmpcode?.toUpperCase().trim())}</div>
            </div>

            <div class="our_company_name_panel">

                <div class="section">
                    <div class="label">Invoice To:</div>
                    <div class="labelValue" style="font-weight: bold;">${selectedCustomer ? selectedCustomer.Custname :
                cashCustomerName ?
                    cashCustomerName : ''}
                    </div>
                    <div class="labelValue">${selectedCustomer ? selectedCustomer.address1 : cashCustomerAddress ?
                cashCustomerAddress : ""}
                    </div>
                    <div class="labelValue">${selectedCustomer ? selectedCustomer.address2 : ''}</div>
                    <div class="labelValue">${selectedCustomer ? selectedCustomer.address3 : ''}</div>
                </div>

                <div class="TopRightItemCont">

                    <div>
                        <div class="TopRightLables">Invoice No</div>
                        <div class="TopRightLables">Date</div>
                        <div class="TopRightLables">${selectedRadio === 'CREDIT' ? `Payment Terms` : selectedRadio === 'CASH' ? `CASH` : ''}</div>
                    </div>
                    <div style="margin-left: 8px; margin-right: 8px;">
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                    </div>
                    <div>
                        <div style="font-weight: bold;">${result.invoiceNo ? result.invoiceNo : ""}
                        </div>
                        <div style="padding-top:1px">${new Date().toJSON().slice(0, 10).split('-').reverse().join('/')}
                        </div>
                        <div style="padding-top:1px">${payment ? payment : ""}</div>
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

                       ${savedItemData.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.Description}</td>
                            <td>${item.quantity}</td>
                            <td>${item.unit}</td>
                            <td style="text-align: right;">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(item.unitPrice)}</td>
                            <td style="text-align: right;">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(item.unitPrice * item.quantity)}</td>
                        </tr>
                        `).join('')}
                        <tr style="border:none; font-weight: bold; margin-top:12px">
                            <td colspan="4" style="border:none; padding:4px;">Terms:</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                Discount:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${discount !== 0 ? (discount ? discount : '0.00') : '0.00'}</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;"></td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                Subtotal:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${totalUnitPrice ? new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(totalUnitPrice) : ''}</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;"></td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">VAT
                                (5%):</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${discount !== 0 ? (discountedTotal ? (discountedTotal * (VAT_RATE / 100)).toFixed(2) :
                '') : (totalUnitPrice ? (totalUnitPrice * (VAT_RATE / 100)).toFixed(2) : '')}</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;"></td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">Amount
                                Incl. VAT:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${discount !== 0
                ? (discountedTotal
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2, maximumFractionDigits: 2
                    }).format(discountedTotal + discountedTotal * (VAT_RATE / 100))
                    : '')
                : (totalUnitPrice
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2, maximumFractionDigits: 2
                    }).format(totalUnitPrice + totalUnitPrice * (VAT_RATE / 100))
                    : '')}</td>
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
                        <div style="font-weight: bold;">For ${selectedCustomer ? selectedCustomer.Custname :
                cashCustomerName ? cashCustomerName : ''}</div>
                        <div>Received By,</div>
                    </label>
                </div>

            </div>
        </div>
    </div>

   
        </body>    
        </html>`

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
                    <div class="labelValue" style="font-weight: bold;">${selectedCustomer ? selectedCustomer.Custname :
                cashCustomerName ?
                    cashCustomerName : ''}
                    </div>
                    <div class="labelValue">${selectedCustomer ? selectedCustomer.address1 : cashCustomerAddress ?
                cashCustomerAddress : ""}
                    </div>
                    <div class="labelValue">${selectedCustomer ? selectedCustomer.address2 : ''}</div>
                    <div class="labelValue">${selectedCustomer ? selectedCustomer.address3 : ''}</div>
                </div>

                <div class="TopRightItemCont">

                    <div>
                        <div class="TopRightLables">Invoice No</div>
                        <div class="TopRightLables">Date</div>
                        <div class="TopRightLables">${selectedRadio === 'CREDIT' ? `Payment Terms` : selectedRadio === 'CASH' ? `CASH` : ''}</div>
                    </div>
                    <div style="margin-left: 8px; margin-right: 8px;">
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                    </div>
                    <div>
                        <div style="font-weight: bold;">MFS-${result.invoiceNo ? result.invoiceNo : ""}
                        </div>
                        <div style="padding-top:1px">${new Date().toJSON().slice(0, 10).split('-').reverse().join('/')}
                        </div>
                        <div style="padding-top:1px">${payment ? payment : ""}</div>
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

                        ${savedItemData.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.Description}</td>
                            <td>${item.quantity}</td>
                            <td>${item.unit}</td>
                            <td style="text-align: right;">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(item.unitPrice)}</td>
                            <td style="text-align: right;">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(item.unitPrice * item.quantity)}</td>


                        </tr>
                        `).join('')}
                        <tr style="border:none; font-weight: bold; margin-top:12px">
                            <td colspan="4" style="border:none; padding:4px;">Terms:</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                Discount:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${discount !== 0 ? (discount ? discount : '0.00') : '0.00'}</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;">1. Goods received in good condition.</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                Subtotal:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${totalUnitPrice ? new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(totalUnitPrice) : ''}</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;">2. Expired goods will not be taken back
                                under any circumstances.</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">VAT
                                (5%):</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${discount !== 0 ? (discountedTotal ? (discountedTotal * (VAT_RATE / 100)).toFixed(2) :
                '') : (totalUnitPrice ? (totalUnitPrice * (VAT_RATE / 100)).toFixed(2) : '')}</td>
                        </tr>
                        <tr style="border:none; font-weight: bold;">
                            <td colspan="4" style="border:none; padding:4px;">3. Goods once sold will not be taken back
                                or exchanged.</td>
                            <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">Amount
                                Incl. VAT:</td>
                            <td
                                style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                ${discount !== 0
                ? (discountedTotal
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2, maximumFractionDigits: 2
                    }).format(discountedTotal + discountedTotal * (VAT_RATE / 100))
                    : '')
                : (totalUnitPrice
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2, maximumFractionDigits: 2
                    }).format(totalUnitPrice + totalUnitPrice * (VAT_RATE / 100))
                    : '')}</td>
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
                        <div style="font-weight: bold;">For ${selectedCustomer ? selectedCustomer.Custname :
                cashCustomerName ? cashCustomerName : ''}</div>
                        <div>Received By,</div>
                    </label>
                </div>

            </div>
        </div>
    </div>
</body>

</html>
  `

        const addPageNumbersToHTML = (html, totalPages) => {
            let pageNumberHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                pageNumberHTML += `<div class="page-number">Page ${i} of ${totalPages}</div>`;
            }

            return html.replace(/<div class="Pagefooter">([\s\S]*?)<\/div>/g, (_, footerContent) => {
                const pageNumberDiv = pageNumberHTML.split('</div>')[0] + '</div>';
                pageNumberHTML = pageNumberHTML.replace(pageNumberDiv, '');
                return `<div class="Pagefooter">${footerContent}${pageNumberDiv}</div>`;
            });
        };

        const cmpcodeChk = cmpcode.toUpperCase();
        // const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNewMalbar : htmlNew;
        const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNew : htmlNew;

        console.log('cmpcodeChk', cmpcodeChk)

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
        } catch (error) {
            console.error(error);
        } finally {
            resultClosePress()
        }
    }

    useEffect(() => {
        let value = '';
        let vat = ''
        if (discount !== 0) {
            value = discountedTotal ? (discountedTotal + discountedTotal * (VAT_RATE / 100)).toFixed(2) : '';
            vat = discountedTotal ? (discountedTotal * (VAT_RATE / 100)).toFixed(2) : '';
        } else {
            value = totalUnitPrice ? (totalUnitPrice + totalUnitPrice * (VAT_RATE / 100)).toFixed(2) : '';
            vat = totalUnitPrice ? (totalUnitPrice * (VAT_RATE / 100)).toFixed(2) : '';
        }
        setCalculatedValue(value);
        setVatValue(vat)
    }, [discount, discountedTotal, totalUnitPrice]);

    useEffect(() => {

        // console.log('dateRunnignRunnufng')
        const currentDate = new Date();

        const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd');

        setCurrentDate(formattedCurrentDate)

    }, []);

    useEffect(() => {
        const getTypeFromAsyncStorage = async () => {
            try {
                const value = await AsyncStorage.getItem('type');
                if (value !== null) {
                    setStoredType(value);
                }
            } catch (error) {
                console.error('Error retrieving type from AsyncStorage:', error);
            }
        };

        getTypeFromAsyncStorage();

    }, []);

    const makeQuotation = async () => {

        setLoading(true);

        if (transformData.length > 0) {

            
            try {
                const postData = JSON.stringify(transformedData)

                console.log('makeQuotationApi+++====>>> postData', postData)

                console.log('makeQuotationApi>>>', `${appUrl}Proposal`)

                console.log('reqData', transformedData)

                const response = await axios.post(`${appUrl}Proposal`, postData, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                // setResponse(response.data);
               
                console.log('Quotation created successfully', response.data);

                if (response.data.result?.trim().toUpperCase() == "SAVED") {
                    showMakeOrderSuccess()
                    setSelectedCustomer(null)
                    setOrderRemark('')
                    setTrn('')
                    setVan('')
                    setPayment('')
                    setDelivery('')
                    setValidity('')
                    setSavedItemData([])
                    setTotalUnitPrice()
                    setCashCustomerName('')
                    setCashCustomerAddress('')
                    setCashCustomerPhone('')
                    setShowQuotationPop(false)
                    removeAsyncItemsAfterOrderMade()
                    setShowSelectedStockPop(false)
                    setShowCartPanel(false)
                    // setSelectedUserType('reg')
                }
            } catch (error) {
                setError('Error creating order');
                console.error('Error creating order', error);
                showMakeOrderError()
                setShowQuotationPop(false)
                setShowSelectedStockPop(false)
            }
            finally {
                setLoading(false);
            }
        }
    };



    const resultClosePress = async () => {
        setSelectedCustomer(null)
        setOrderRemark('')
        setTrn('')
        setPayment('')
        setDelivery('')
        setValidity('')
        setSavedItemData([])
        setTotalUnitPrice()
        setCashCustomerName('')
        setCashCustomerAddress('')
        setCashCustomerPhone('')
        setShowQuotationPop(false)
        removeAsyncItemsAfterOrderMade()
        setShowSelectedStockPop(false)
        setTotalCostAvg(0)
        setShowCartPanel(false)

    }



    

    const transformData = (data, customer, orderRemark, payment, delivery, validity, totalUnitPrice, cashCustomerName, cashCustomerAddress, cashCustomerPhone) => {

        // Quotation first time used for SUNRISE
        console.log("transformData=====> called ")

        return data.map((item, index) => ({

            cmpcode: cmpcode,
            opmode: "SAVE",
            so_no: "20004",
            so_date: "2025-03-01T10:30:00", // dynamic
            Cust_Acc: selectedUserType === 'reg' && customer ? customer.account : '',
            jv_num: "0",
            comments: "Urgent order",
            sale_man: salesMan ? salesMan : '',
            inv_no: "0",
            so_status: "",
            area_code: "AC1001",
            so_ref: "REF98765",
            so_doc: "DOC54321",
            fc: "AED",
            so_amount: item.total + parseFloat( vatValue ? vatValue : '0'), // pass here total + vat
            so_fcamt: item.total + parseFloat( vatValue ? vatValue : '0'), // pass here also total + vat
            so_fcrate: 1, // doubt
            so_disc: 0, // doubt
            due_date: "2025-03-15T00:00:00", // dynamic
            so_fdisc: 0.000, // doubt
            accdesc: selectedUserType === 'reg' && customer ? customer.Custname : '',
            head1: "Contact Person Name", // doubt
            subject: "Sales Order", // doubt
            foot1: "Footer Details", // doubt
            payment: payment, // check why value did not come
            delivery: delivery,
            validity: validity,
            deptno: deptNo?.trim(),
            ESTI_NO: 0, // lead number if created from lead lead number 0 if directly frpm quotation button in home
            quot_NO: 2, // to identify quotation is sent from mobile app 1 if sent from website
            ord_NO: 0, // doubt
            remarks: orderRemark,// check why value did not come
            c1: "",
            c2: "",
            c3: "",
            cash_customer: "No",
            cash_customer_company_address: cashCustomerAddress,
            cash_customer_company_name: cashCustomerName,
            cash_customer_company_phone_number: cashCustomerPhone,
            Slno: (index + 1) + "",
            code: item.Code?.trim(),
            description: item.Description?.trim(),
            locn: van,
            unit: unitValue,
            qty: parseFloat( item.quantity),
            unit_price:parseFloat( item.unitPrice),
            ['disc%']: 0.000, // doubt
            BlkPrice: 0.000, // doubt
            Amount: parseFloat(item.total),
            x: "Extra Info",
            cntrl: "",
            fraction: 1, // doubt
            ['vat%']: 5.000, // doubt
            Vatamt: parseFloat( vatValue ? vatValue : '0'),
            total: parseFloat(totalUnitPrice),
            oem: "", // doubt
            UPrice_VIncl: 0, // doubt
            item_Remarks: ""

        }));
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
        cashCustomerPhone
    );


   

    useEffect(() => {
        if (savedItemData) {
            const totalCostAvgValue = savedItemData && savedItemData.reduce((sum, item) => sum + (item.Cost_Avg * item.quantity), 0);
            if (totalCostAvgValue) {
                setTotalCostAvg(totalCostAvgValue.toFixed(3))
            }

        }
    }, [savedItemData])

    useEffect(() => {
        if (discount !== 0) {
            // const discountValue = parseFloat(discount) / 100;
            // const newTotal = totalUnitPrice - (totalUnitPrice * discountValue);
            const newTotal = totalUnitPrice - discount
            // setTotalUnitPrice(newTotal);
            setDiscountedTotal(newTotal)
        } else {
            setTotalUnitPrice(totalUnitPrice);
        }
    }, [discount]);

    // const showFormEmptyToast = () => {
    //     Toast.error('UserId and Password cant be empty')
    // }

    // useEffect(() => {
    //     showFormEmptyToast()
    // }, [])
    // console.log('transformedData', JSON.stringify(transformedData, null, 2));

    console.log('selectedCustomer', selectedCustomer)
    console.log('savedItemData', savedItemData)

    // console.log('totalCostAvg', totalCostAvg)

    // console.log('discountedTotal', discountedTotal)

    // console.log('calculatedValue', calculatedValue)

    // console.log('trn', trn)

    // console.log('makeOrderApi', `${appUrl}Sales_Order`)

    // console.log('van', van)

    console.log('selectedRadio', selectedRadio)

    // console.log('page', page)

    console.log('type', type)

    console.log('highPriority', highPriority)

    return (
        <>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>

                    <View style={styles.HomeTextCont}>
                        <TouchableOpacity style={styles.SettingsWrap} onPress={() => setShowQuotationPop(false)}>
                            <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                            {
                               
                                    <Text style={styles.HomeText}>Quotation</Text>

                            }
                        </TouchableOpacity>

                        {
                            page !== 'SALESINV' &&
                            <View style={{
                                position: 'absolute',
                                right: 10
                            }}>
                                <BouncyCheckbox
                                    size={25}
                                    fillColor="green"
                                    unFillColor="#FFFFFF"
                                    text="High Priority"
                                    iconStyle={{ borderColor: "green" }}
                                    innerIconStyle={{ borderWidth: 2 }}
                                    textStyle={{ fontFamily: 'Lexend-Regular', fontSize: 14, textDecorationLine: "none", color: 'black' }}
                                    onPress={(isChecked) => setHighPriority(isChecked)}

                                />
                            </View>
                        }

                    </View>

                    <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>


                        <View style={styles.CustomerSection}>
                            {
                                selectedCustomer &&
                                <>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerTagText}>Customer</Text>
                                    </View>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerValueText}>{selectedCustomer ? selectedCustomer.Custname : ''}</Text>
                                    </View>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerTagText}>Address</Text>
                                    </View>
                                    <View style={styles.AdressWrap}>
                                        <Text style={styles.CustomerValueText}>{selectedCustomer ? selectedCustomer.address1 : ""}</Text>
                                        <Text style={styles.CustomerValueText}>{selectedCustomer ? selectedCustomer.address2 : ""}</Text>
                                        <Text style={styles.CustomerValueText}>{selectedCustomer ? selectedCustomer.address3 : ""}</Text>
                                    </View>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerTagText}>Phone</Text>
                                    </View>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerValueText}>{selectedCustomer ? selectedCustomer.phone : ""}</Text>
                                    </View>
                                </>
                            }

                            {
                                !selectedCustomer &&
                                <>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerTagText}>Customer</Text>
                                    </View>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerValueText}>{cashCustomerName ? cashCustomerName : ''}</Text>
                                    </View>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerTagText}>Address</Text>
                                    </View>
                                    <View style={styles.AdressWrap}>
                                        <Text style={styles.CustomerValueText}>{cashCustomerAddress ? cashCustomerAddress : ""}</Text>
                                    </View>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerTagText}>Phone</Text>
                                    </View>
                                    <View style={styles.CustomerItemWrap}>
                                        <Text style={styles.CustomerValueText}>{cashCustomerPhone ? cashCustomerPhone : ""}</Text>
                                    </View>
                                </>
                            }
                        </View>

                        <View style={styles.CustomerSection}>


                            {/* <View style={styles.CustomerItemWrap}>
                                <Text style={styles.CustomerTagText}>Order Remarks</Text>
                            </View>
                            <View style={styles.CustomerItemWrap}>
                                <Text style={styles.CustomerValueText}>{orderRemark ? orderRemark : '---'}</Text>
                            </View> */}
                        </View>

                        <View style={styles.CustomerSection}>
                            <View style={styles.CustomerItemWrap}>
                                <Text style={styles.CustomerTagText}>Trn</Text>
                            </View>
                            <View style={styles.CustomerItemWrap}>
                                <Text style={styles.CustomerValueText}>{trn ? trn : '---'}</Text>
                            </View>
                        </View>

                        <View style={styles.CustomerSection}>
                            <View style={styles.CustomerItemWrap}>
                                <Text style={styles.CustomerTagText}>Items</Text>
                            </View>
                        </View>
                        <ScrollView nestedScrollEnabled={true} style={styles.InnerScroll}>

                            <View style={styles.InnerView}>
                                {/* {
                                    savedItemData && savedItemData.map((item, index) => (
                                        <View key={index} style={styles.SelectedItemCont}>
                                            <View style={styles.totalTag}>
                                                <Text style={styles.itemCountText}>
                                                    {
                                                        item.total
                                                    }
                                                </Text>
                                            </View>
                                            <Text style={styles.DescText}>{item.Description}</Text>
                                            <View style={styles.DescCont}>
                                                <Text style={styles.DescSubText}>Item Code :</Text>
                                                <Text style={styles.DescSubTextValue}>{item.Code}</Text>
                                            </View>
                                            <View style={styles.DescCont}>
                                                <Text style={styles.DescSubText}>Unit Price :</Text>
                                                <Text style={styles.DescSubTextValue}>{item.unitPrice}</Text>
                                            </View>
                                            <View style={styles.DescCont}>
                                                <Text style={styles.DescSubText}>Quantity :</Text>
                                                <Text style={styles.DescSubTextValue}>{item.quantity}</Text>
                                            </View>
                                        </View>
                                    ))
                                } */}

                                {
                                    savedItemData && savedItemData.map((item, index) => (
                                        <View style={styles.loopCont}>
                                            <View style={styles.indexCont}>
                                                <Text style={styles.indexText}>{index + 1}.</Text>
                                            </View>
                                            <View key={index} style={styles.SelectedItemCont}>
                                                <View style={styles.itemDescToTHead}>
                                                    <Text style={styles.DescText}>{item.Description}</Text>
                                                    <Text style={styles.TotalText}>{(item.unitPrice * item.quantity).toFixed(3)}</Text>
                                                </View>
                                                <View style={styles.DescCont}>
                                                    <Text style={styles.DescSubText}>Item Code :</Text>
                                                    <Text style={styles.DescSubTextValue}>{item.Code}</Text>
                                                </View>
                                                <View style={styles.DescCont}>
                                                    <Text style={styles.DescSubText}>Unit Price :</Text>
                                                    {
                                                        cmpcode === 'AUTOMAX' ?
                                                            <Text style={styles.DescSubTextValue}>{parseFloat(item.unitPrice).toFixed(3)}</Text>
                                                            :
                                                            <Text style={styles.DescSubTextValue}>{(item.unitPrice)}</Text>
                                                    }
                                                </View>
                                                <View style={styles.DescCont}>
                                                    <Text style={styles.DescSubText}>Quantity :</Text>
                                                    {
                                                        cmpcode === 'AUTOMAX' ?
                                                            <Text style={styles.DescSubTextValue}>{parseFloat(item.quantity).toFixed(0)}</Text>
                                                            :
                                                            <Text style={styles.DescSubTextValue}>{item.quantity}</Text>
                                                    }
                                                    {/* <Text style={styles.DescSubTextValue}>{item.quantity}</Text> */}
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                }

                            </View>
                        </ScrollView>

                        <View style={styles.SubTotalCont}>
                            <Text style={styles.CustomerValueText}>Subtotal</Text>

                            {/* <Text style={styles.TotalValueTexts}>{totalUnitPrice ? (totalUnitPrice.toFixed(2)) : ''}</Text> */}

                            <Text style={styles.TotalValueTexts}>
                                {
                                    cmpcode === 'AUTOMAX' ?
                                        <>
                                            {totalUnitPrice ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(totalUnitPrice)}` : ''}
                                        </>
                                        :
                                        <>
                                            {totalUnitPrice ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalUnitPrice)}` : ''}
                                        </>
                                }
                            </Text>


                        </View>

                        <View style={styles.RemarkInputCont}>
                            <TextInput
                                style={styles.PlaceHolderInput}
                                placeholder='Discount'
                                value={discount}
                                keyboardType="numeric" // This ensures the numeric keyboard appears
                                onChangeText={text => {
                                    const numericText = text.replace(/[^0-9.]/g, ''); // This removes any non-numeric characters
                                    setDiscount(numericText);
                                }}
                                // onChangeText={text => setDiscount(text)}
                                placeholderTextColor="#aaa"
                            />
                        </View>

                        {/* {
                            page === 'SALESINV' &&
                            <View style={styles.RemarkInputCont}>
                                <TextInput
                                    style={styles.PlaceHolderInput}
                                    placeholder='Discount'
                                    value={discount}
                                    onChangeText={text => setDiscount(text)}
                                    placeholderTextColor="#aaa"
                                />
                            </View>
                        } */}

                        <View style={styles.SubTotalCont}>
                            <Text style={styles.CustomerValueText}>NetTotal</Text>

                            {/* {
                                discount !== 0 ?
                                    <Text style={styles.TotalValueTexts}>{discountedTotal ? (discountedTotal.toFixed(2)) : ''}</Text>
                                    :
                                    <Text style={styles.TotalValueTexts}>{totalUnitPrice ? (totalUnitPrice.toFixed(2)) : ''}</Text>

                            } */}

                            {
                                cmpcode === 'AUTOMAX' ?
                                    <>
                                        {
                                            discount !== 0 ? (
                                                <Text style={styles.TotalValueTexts}>
                                                    {discountedTotal ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(discountedTotal)}` : ''}
                                                </Text>
                                            ) : (
                                                <Text style={styles.TotalValueTexts}>
                                                    {totalUnitPrice ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(totalUnitPrice)}` : ''}
                                                </Text>
                                            )
                                        }

                                    </>
                                    :
                                    <>
                                        {
                                            discount !== 0 ? (
                                                <Text style={styles.TotalValueTexts}>
                                                    {discountedTotal ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(discountedTotal)}` : ''}
                                                </Text>
                                            ) : (
                                                <Text style={styles.TotalValueTexts}>
                                                    {totalUnitPrice ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalUnitPrice)}` : ''}
                                                </Text>
                                            )
                                        }

                                    </>
                            }



                        </View>



                        <View style={styles.SubTotalCont}>
                            <Text style={styles.CustomerValueText}>VAT%</Text>
                            <Text style={styles.TotalValueTexts}>5</Text>
                        </View>
                        <View style={styles.SubTotalCont}>
                            <Text style={styles.CustomerValueText}>VAT</Text>

                            {
                                discount !== 0 ?
                                    <Text style={styles.TotalValueTexts}>
                                        {
                                            cmpcode === 'AUTOMAX' ?
                                                <> {discountedTotal ? (discountedTotal * (VAT_RATE / 100)).toFixed(3) : ''}</>
                                                :
                                                <> {discountedTotal ? (discountedTotal * (VAT_RATE / 100)).toFixed(2) : ''}</>
                                        }
                                    </Text>
                                    :
                                    <Text style={styles.TotalValueTexts}>
                                        {
                                            cmpcode === 'AUTOMAX' ?
                                                <>
                                                    {totalUnitPrice ? (totalUnitPrice * (VAT_RATE / 100)).toFixed(3) : ''}
                                                </>
                                                :
                                                <>
                                                    {totalUnitPrice ? (totalUnitPrice * (VAT_RATE / 100)).toFixed(2) : ''}
                                                </>
                                        }

                                    </Text>
                            }
                        </View>
                        <View style={styles.SubTotalCont}>
                            <Text style={styles.CustomerValueText}>Amount Incl.VAT</Text>
                            {/* {
                                discount !== 0 ?
                                    <Text style={styles.TotalValueTexts}>
                                        {discountedTotal ? (discountedTotal + discountedTotal * (VAT_RATE / 100)).toFixed(2) : ''}
                                    </Text>
                                    :
                                    <Text style={styles.TotalValueTexts}>
                                        {totalUnitPrice ? (totalUnitPrice + totalUnitPrice * (VAT_RATE / 100)).toFixed(2) : ''}
                                    </Text>
                            } */}

                            {
                                discount !== 0 ? (
                                    <Text style={styles.TotalValueTexts}>
                                        {
                                            cmpcode === 'AUTOMAX' ?
                                                <>
                                                    {discountedTotal ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(discountedTotal + discountedTotal * (VAT_RATE / 100))}` : ''}
                                                </>
                                                :
                                                <>
                                                    {discountedTotal ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(discountedTotal + discountedTotal * (VAT_RATE / 100))}` : ''}
                                                </>
                                        }
                                    </Text>
                                ) : (
                                    <Text style={styles.TotalValueTexts}>
                                        {
                                            cmpcode === 'AUTOMAX' ?
                                                <>
                                                    {totalUnitPrice ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(totalUnitPrice + totalUnitPrice * (VAT_RATE / 100))}` : ''}
                                                </>
                                                :
                                                <>
                                                    {totalUnitPrice ? `${currency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalUnitPrice + totalUnitPrice * (VAT_RATE / 100))}` : ''}
                                                </>
                                        }
                                    </Text>
                                )
                            }

                        </View>
                        {/* <View style={styles.SubTotalCont}>
                            <Text style={styles.CustomerValueText}>Payment</Text>
                            <Text style={styles.TotalValueTexts}>{payment ? payment : ''}</Text>
                        </View>
                        <View style={styles.SubTotalCont}>
                            <Text style={styles.CustomerValueText}>Delivery</Text>
                            <Text style={styles.TotalValueTexts}>{delivery ? delivery : ""}</Text>
                        </View> */}
                        {/* <View style={styles.SubTotalCont}>
                            <Text style={styles.CustomerValueText}>Validity</Text>
                            <Text style={styles.TotalValueTexts}>{validity ? validity : ""}</Text>
                        </View> */}

                        {/* <View style={styles.TaxBox}>
                            <View style={styles.TaxCont}>
                                <Text style={styles.CustomerValueText}>VAT% :</Text>
                                <Text style={styles.CustomerValueText}>5%</Text>
                            </View>
                            <View style={styles.TaxCont}>
                                <Text style={styles.CustomerValueText}>VAT :</Text>
                                <Text style={styles.CustomerValueText}>0.5</Text>
                            </View>
                            <View style={styles.TaxCont}>
                                <Text style={styles.CustomerValueText}>Amount Incl.VAT</Text>
                                <Text style={styles.CustomerValueText}>10.5</Text>
                            </View>
                        </View>
    
                        <View style={styles.TaxBox2}>
                            <View style={styles.TaxCont}>
                                <Text style={styles.CustomerValueText}>Payment</Text>
                                <Text style={styles.CustomerValueText}>{payment ? payment : ''}</Text>
                            </View>
                            <View style={styles.TaxCont}>
                                <Text style={styles.CustomerValueText}>Delivery</Text>
                                <Text style={styles.CustomerValueText}>{delivery ? delivery : ""}</Text>
                            </View>
                            <View style={styles.TaxCont}>
                                <Text style={styles.CustomerValueText}>Validity</Text>
                                <Text style={styles.CustomerValueText}>{validity ? validity : ""}</Text>
                            </View>
                        </View> */}

                    </ScrollView>

                    {
                        transformedData.length > 0 &&
                        !error &&
                        !loading &&
                        <View style={styles.UpdateWrap}>
                            <TouchableOpacity style={styles.DeleteButton} onPress={() => setShowQuotationPop(false)}>
                                {/* <TouchableOpacity style={styles.DeleteButton} onPress={() => generatePDF()}> */}
                                <Text style={styles.DeleteText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.EditButton} onPress={() => makeQuotation()}>
                                <Text style={styles.EditText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    }

                    {
                        loading &&
                        <ActivityIndicator size={'large'} />
                    }

                    {
                        error &&
                        <Text style={styles.ErrorText}>{error}</Text>
                    }



                </View>
            </View>

            {
                result &&
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent2}>
                        <View>
                            <Text style={styles.SuccessText}>
                                InvoiceNo:{result.invoiceNo} Created successfully
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
                            <TouchableOpacity style={{
                                backgroundColor: 'green',
                                padding: 12,
                                borderRadius: 8
                            }} onPress={generatePDF}>
                                <Text style={styles.PDFText}>Save Pdf</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }

        </>
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
        // minHeight: 750,
        maxHeight: Dimensions.get('window').height - 100,
        bottom: 25
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
        // padding: 6
        flexDirection: 'row',
        alignItems: 'center'
    },
    HeadIcon: {
        width: 20,
        height: 20
    },
    CustomerSection: {
        flexDirection: 'column',
        paddingVertical: 10,
        paddingHorizontal: 8
    },
    CustomerItemWrap: {
        paddingVertical: 2
    },
    AdressWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 2
    },
    CustomerTagText: {
        color: '#aaa',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    CustomerValueText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    InnerScroll: {
        minHeight: 'auto',
        maxHeight: 400,
        borderBottomWidth: 1,
        borderBottomColor: 'grey'
    },
    InnerView: {
        paddingHorizontal: 12,
        marginBottom: 8
    },
    totalTag: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#5A55CA',
        // padding: 2,
        borderRadius: 50,
        width: 35,
        height: 35,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemCountText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },
    SubTotalCont: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
        paddingHorizontal: 8
    },
    TaxBox: {
        width: '100%',
        flexDirection: 'column',
        marginVertical: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#e9ecef'

    },
    TaxBox2: {
        width: '100%',
        flexDirection: 'column',
        marginVertical: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#dee2e6'

    },
    TaxCont: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2
    },

    // 
    HomeWrap: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5A55CA'
    },
    HomeCont: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: '#F0F4FD',
        // height: Dimensions.get('window').height - 70

    },

    SelectedItemCont: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        marginVertical: 6
    },
    DescText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },
    DescCont: {
        flexDirection: 'row',
        marginVertical: 2
    },
    DescSubText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    DescSubTextValue: {
        color: 'blue',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        marginLeft: 8
    },
    UpdateWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 6,
        paddingHorizontal: 12
    },
    EditButton: {
        backgroundColor: '#1A6CF6',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        // marginRight: 6
        marginLeft: 35
    },
    EditText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    DeleteButton: {
        backgroundColor: '#D9D9D9',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 6
    },
    DeleteText: {
        color: '#6069B8',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    ErrorText: {
        color: 'red',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },

    loopCont: {
        flexDirection: 'row',
        alignItems: 'flex-start'
        // justifyContent: 'space-between'
    },
    indexCont: {
        width: '5%',
        paddingTop: 20
    },
    indexText: {
        color: 'black',
        fontSize: 12,
        fontFamily: 'Lexend-Regular',
    },
    itemDescToTHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '98%',
        // marginRight: 8
    },
    TotalText: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginBottom: 8,
        // width: '20%'
    },
    UpdateIcons: {
        width: 25,
        height: 25
    },

    SelectedItemCont: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 8,
        // borderWidth: 1,
        // borderColor: '#dbdbdb',
        // borderRadius: 6,
        marginVertical: 6
    },
    DescText: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginBottom: 8,
        width: '75%'
    },
    DescCont: {
        flexDirection: 'row',
        marginVertical: 2
    },
    DescSubText: {
        color: '#aaa',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },
    DescSubTextValue: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginLeft: 8
    },


    TotalValueTexts: {
        color: '#1A6CF6',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        marginLeft: 8
    },


    RemarkInputCont: {
        width: '100%',
        backgroundColor: '#F0F4FD',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    RemarkText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },

    PlaceHolderInput: {
        width: '100%',
        fontFamily: 'Lexend-Regular',
        color: '#aaa',
        textAlign: 'right',
        paddingRight: 16
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

export default MakeQuotationPop