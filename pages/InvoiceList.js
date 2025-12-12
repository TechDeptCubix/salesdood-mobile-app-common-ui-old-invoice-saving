import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Image, PermissionsAndroid, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import REACT_APP_BASE_URL from '../url/AppUrl'
import StatusLogPop from '../popups/StatusLogPop'
import HeaderUiNew from './HeaderUiNew'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { ToWords } from 'to-words';
import * as RNFS from 'react-native-fs';
import { PDFDocument } from 'pdf-lib'
import ThermalPrinterModule from 'react-native-thermal-printer';


const InvoiceList = () => {




    // the issue is fixed padding
    // const generateItemLines = () => {

    //     const DESC_MAX_LEN = 24;

    //     return itemListBluetooth?.map((item, index) => {
    //         const fullDesc = `${item.DESCRIPTION}`;
    //         let itemLine = '';

    //         // 1. Split the description into chunks
    //         let remainingDesc = fullDesc;
    //         let isFirstLine = true;

    //         while (remainingDesc.length > 0) {
    //             // Get the next chunk of the description
    //             const currentChunk = remainingDesc.substring(0, DESC_MAX_LEN);
    //             remainingDesc = remainingDesc.substring(DESC_MAX_LEN).trimStart();

    //             if (isFirstLine) {
    //                 // FIRST LINE: Contains Description, QTY, PRICE, and TOTAL
    //                 const descriptionPadded = currentChunk.padEnd(DESC_MAX_LEN, ' ');
    //                 const qty = item.QTY.toString().padStart(8, ' ');
    //                 const price = item.PRICE.toFixed(2).padStart(8, ' ');
    //                 const vat = (item.LINE_TOTAL * 0.05).toFixed(2).padStart(8, ' ');
    //                 const total = (item.LINE_TOTAL + item.LINE_TOTAL * 0.05).toFixed(2).padStart(8, ' ');

    //                 itemLine += `[L]${descriptionPadded}${qty} ${price} ${vat} ${total}\n`;
    //                 isFirstLine = false;
    //             } else {
    //                 // WRAPPED LINES: Only contain the indented description text
    //                 itemLine += `[L]${currentChunk}\n`;
    //             }
    //         }

    //         return itemLine;
    //     }).join('');
    // };


    // new generated dynamic solution 
    const generateItemLines = () => {
        const DESC_MAX_LEN = 20; // Reduced to make room for larger numbers

        // Column end positions (adjust based on your 58-60 char paper width)
        const QTY_END = 32;      // Where Qty column ends
        const RATE_END = 42;     // Where Rate column ends  
        const VAT_END = 52;      // Where VAT column ends
        const AMOUNT_END = 62;   // Where Amount column ends (matches your totals)

        return itemListBluetooth?.map((item, index) => {
            const fullDesc = `${item.DESCRIPTION}`;
            let itemLine = '';

            // Split the description into chunks
            let remainingDesc = fullDesc;
            let isFirstLine = true;

            while (remainingDesc.length > 0) {
                const currentChunk = remainingDesc.substring(0, DESC_MAX_LEN);
                remainingDesc = remainingDesc.substring(DESC_MAX_LEN).trimStart();

                if (isFirstLine) {
                    // FIRST LINE: Contains Description + all values right-aligned in columns
                    const descriptionPadded = currentChunk.padEnd(DESC_MAX_LEN, ' ');

                    // Format values as strings
                    const qtyStr = item.QTY.toString();
                    const rateStr = item.PRICE.toFixed(2);
                    const vatStr = (item.LINE_TOTAL * 0.05).toFixed(2);
                    const amountStr = (item.LINE_TOTAL + item.LINE_TOTAL * 0.05).toFixed(2);

                    // Calculate spacing for right-alignment in each column
                    const qtySpaces = QTY_END - DESC_MAX_LEN - qtyStr.length;
                    const rateSpaces = RATE_END - QTY_END - rateStr.length;
                    const vatSpaces = VAT_END - RATE_END - vatStr.length;
                    const amountSpaces = AMOUNT_END - VAT_END - amountStr.length;

                    itemLine += `[L]${descriptionPadded}${' '.repeat(Math.max(1, qtySpaces))}${qtyStr}${' '.repeat(Math.max(1, rateSpaces))}${rateStr}${' '.repeat(Math.max(1, vatSpaces))}${vatStr}${' '.repeat(Math.max(1, amountSpaces))}${amountStr}\n`;

                    isFirstLine = false;
                } else {
                    // WRAPPED LINES: Only contain the indented description text
                    itemLine += `[L]${currentChunk}\n`;
                }
            }

            return itemLine;
        }).join('');
    };


    // const setFormatTextForBluetooth = () => {
    //     return {
    //         text: '[L]\n' +
    //             '[C]<b><font size=\'tall\'>THE ICELAB</font></b>\n' +
    //             '[C]AJMAN\n' +
    //             '[C]INVOICE\n' +
    //             // Invoice and Customer Info
    //             '[L]\n' +
    //             `[L]${itemListBluetooth[0]?.custref}[R] Trans ID: ${itemListBluetooth[0]?.inv_no}\n` +
    //             `[L]Inv Date: ${itemListBluetooth[0]?.inv_date.split('T')[0]}[R]Time: ${itemListBluetooth[0]?.time}\n` +
    //             '[L]\n' +
    //             // Item Table Header (4-COLUMN MANUAL ALIGNMENT)
    //             '[C]<b>============================================================</b>\n' +
    //             '[L]<b>DESCRIPTION</b>              <b>         QTY</b><b>       PRICE</b><b>       TOTAL</b>\n' + // Manually spaced header
    //             '[C]<b>============================================================</b>\n' +
    //             // Item Lines (Dynamic)
    //             generateItemLines() +
    //             '[C]<b>============================================================</b>\n' +
    //             // Totals Summary
    //             `[L]Grand Total[R]${itemListBluetooth?.reduce((acc, curr) => acc + curr.LINE_TOTAL, 0)?.toFixed(2)}\n` +
    //             `[L]VAT(5%)[R]${(itemListBluetooth?.reduce((acc, curr) => acc + curr.LINE_TOTAL, 0) * 0.05)?.toFixed(2)}\n` +
    //             '[R]CASH RECEIVED \n' +
    //             '[R]CARD RECEIVED \n' +
    //             '[C]<b>============================================================</b>\n' +
    //             // Footer
    //             '[L]\n' +
    //             '[C]THE ICELAB MANUFACTURING LLC\n' +
    //             '[C]Central Plazza2, Al jurf\n' +
    //             '[C]Ajman, UAE\n'
    //     }
    // }

    // --- Define Padding Functions ---
    const pad = (count) => ' '.repeat(count);
    // Adjusted for a wider print area (e.g., 64 characters)

    // Text Length: "THE ICE LAB MANUFACTURING LLC" (29 chars) -> (64-29)/2 = 17.5
    const COMP_PAD = pad(18);

    const CITY_PAD = pad(27);

    const TEL_PAD = pad(26);
    // Text Length: "Central Plaza 2, Al Jurf" (24 chars) -> (64-24)/2 = 20
    const ADD_PAD = pad(24);

    // Text Length: "TRN : 104112430400003" (21 chars) -> (64-21)/2 = 21.5
    const TRN_PAD = pad(22);

    // Text Length: "Tax Invoice" (11 chars) -> (64-11)/2 = 26.5
    const INV_PAD = pad(27);

    // Text Length: "Signature/date" (14 chars) -> (64-14)/2 = 25
    const FOOT_PAD = pad(20);
    const FOOT_PAD_SIGN = pad(23)

    const formatTotalLine = (label, value) => {
        const valueStr = typeof value === 'number' ? value.toFixed(2) : value.toString();
        const labelStart = 28; // Where label starts (below Qty column)
        const valueEnd = 62; // Increased to align with Amount column (was 48)

        // Create the label with its starting position
        const labelWithPadding = ' '.repeat(labelStart) + label;

        // Calculate total spaces needed between start and value end
        const totalSpaceForValue = valueEnd - labelWithPadding.length - valueStr.length;

        return `[L]${labelWithPadding}${' '.repeat(Math.max(1, totalSpaceForValue))}${valueStr}\n`;
    };

    const generateTableHeader = () => {
        const DESC_WIDTH = 20;
        const QTY_END = 32;
        const RATE_END = 42;
        const VAT_END = 52;
        const AMOUNT_END = 62;

        // Right-align each column header
        const desc = 'Description'.padEnd(DESC_WIDTH, ' ');

        // Calculate spaces needed for right-alignment
        const qtySpaces = QTY_END - DESC_WIDTH - 'Qty'.length;
        const rateSpaces = RATE_END - QTY_END - 'Rate'.length;
        const vatSpaces = VAT_END - RATE_END - 'VAT'.length;
        const amountSpaces = AMOUNT_END - VAT_END - 'Amount'.length;

        return `[L]<b>${desc}${' '.repeat(Math.max(1, qtySpaces))}Qty${' '.repeat(Math.max(1, rateSpaces))}Rate${' '.repeat(Math.max(1, vatSpaces))}VAT${' '.repeat(Math.max(1, amountSpaces))}Amount</b>\n`;
    };
    // this one based on the reference syed icelab given
    const setFormatTextForBluetooth = () => {
        return {
            text: COMP_PAD + '[C]<b><font size=\'tall\'>THE ICE LAB MANUFACTURING LLC</font></b>\n' +
                ADD_PAD + '[C]Central Plaza 2, Al Jurf\n' +
                CITY_PAD + '[C]Ajman, UAE\n' +
                TEL_PAD + '[C]Tel:065617700\n' +
                TRN_PAD + '[C]TRN : 104112430400003\n' +

                // Invoice and Customer Info
                '[L]\n' +
                INV_PAD + '[L]<font size=\'tall\'>Tax Invoice</font>\n \n' +
                `[L]INVOICE NO       :  ${itemListBluetooth[0]?.inv_no}\n` +
                `[L]INVOICE DATE     :  ${itemListBluetooth[0]?.inv_date.split('T')[0]} ${itemListBluetooth[0]?.time}\n` +
                `[L]SALESMAN NAME    :  ${itemListBluetooth[0]?.sale_man}\n` +
                `[L]SALESMAN PHONE   :  ${itemListBluetooth[0]?.Sman_Mobile}\n` +
                `[L]CUSTOMER NAME    :  ${itemListBluetooth[0]?.custref}\n` +
                `[L]CUSTOMER TRN NO  :  ${itemListBluetooth[0]?.TRN}\n` +
                `[L]PAYMENT MODE     :  ${itemListBluetooth[0]?.enginetype}\n` +


                '[L]\n' +
                // Item Table Header (4-COLUMN MANUAL ALIGNMENT)
                '[C]============================================================\n' +
                generateTableHeader() +
                '[C]============================================================\n' +
                // Item Lines (Dynamic)
                generateItemLines() +

                '[L]\n' +
                // Totals Summary

                formatTotalLine('Total (Ex VAT)', (itemListBluetooth[0]?.inv_total - itemListBluetooth[0]?.w)?.toFixed(2)) +
                formatTotalLine('VAT amount', itemListBluetooth[0]?.w) +
                formatTotalLine('Grand Total', itemListBluetooth[0]?.inv_total) +

                '[L]\n' +

                '[C]============================================================\n' +
                `[L]OPENING BALANCE  :  ${itemListBluetooth[0]?.Opening_Balance}\n` +
                `[L]CUR TRANSACTION  :  ${itemListBluetooth[0]?.Transaction_Balance}\n` +
                `[L]CLOSING BALANCE  :  ${itemListBluetooth[0]?.Closing_Balance}\n` +
                '[C]============================================================\n' +

                // Footer
                '[L]\n' +
                FOOT_PAD + '[C]Thank you for shopping with us\n' +
                FOOT_PAD_SIGN + '[C]Signature/date\n' +
                '[L]\n' +
                '[L]\n' +
                '[L]\n'
        }
    }



    const getLetterheadBase64 = async () => new Promise((resolve, reject) => {

        RNFS.readFileAssets('premier_letterhead_text.txt').then(result => {
            console.log(result);
            resolve(result)
        }).catch(err => {
            console.log(err);
        })


    })

    const toWords = new ToWords();

    // const logoUri = Image.resolveAssetSource(
    //     require("../assets/images/premier_letterhead.jpeg")
    // ).uri;

    // in this image not coming even in emulator

    // const logoUri = 
    //     require("../images/premier_letterhead.jpeg")
    //     ;

    // console.log("logoUri>>> ", logoUri)

    const ITEMS_PER_PAGE = 20;

    const navigation = useNavigation()

    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    const [salesMan, setSalesMan] = useState('')


    const [showStatusLogPop, setShowStatusLogPop] = useState(false)
    const [orderIdPop, setOrderIdPop] = useState(null)

    const [appUrl, setAppUrl] = useState('')

    const [cmpcode, setCmpCode] = useState('')

    const [expandedItems, setExpandedItems] = useState([]);

    const [deptNo, setDeptNo] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [listData, setListData] = useState(null)

    const [apiError, setApiError] = useState(false)

    const [searchInv, setSearchInv] = useState('')

    const [searchError, setSearchError] = useState('')

    const [itemList, setItemList] = useState('')

    const [itemListBluetooth, setItemListBluetooth] = useState('')

    const [loginUser, setLoginUser] = useState('')

    const [pdfUri, setPdfUri] = useState(null);

    const [selectedCustomer, setSelectedCustomer] = useState('')
    const [selectedCustomerAddress, setSelectedCustomerAddress] = useState('')
    const [selectedInvoiceNo, setSlelecetdInvNo] = useState('')
    const [selectedInvDate, setSelectedInvDate] = useState('')

    const [selectedRadio, setSelectedRadio] = useState('')

    const [terms, setTerms] = useState('')

    const [discountedTotal, setDiscountedTotal] = useState('');
    const [discount, setDiscount] = useState(0)

    const [subTotal, setSubTotal] = useState('')

    const [trn, setTrn] = useState('')

    const [payment, setPayment] = useState('CASH-B2B')

    const [showPrintButtonLoader, setShowPrintButtonLoader] = useState(false)
    const [showPrintButtonLoaderBluetooth, setShowPrintButtonLoaderBluetooth] = useState(false)



    useEffect(() => {
        if (discount > 0) {

            const newTotal = subTotal - discount

            setDiscountedTotal(newTotal)
        }
    }, [discount]);


    const getTRNnumber = (companyCodeToCheck) => {

        switch (companyCodeToCheck) {
            case "MALBAR": return "100335207500003";
            case "PREMIER": return "10027835690000";
            case "ICELAB": return "104112430400003";
            case "ICELAB_TEST": return "104112430400003";
            default: return "-"
        }

    }

    // pdfCode
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

        const dummyHTML = `<h1 style='margin-bottom: 20px'>Heading</h1>
      <div style='text-align: justify'>Exercitation velit irure irure est nisi eu deserunt ut sunt eiusmod tempor aute esse ad. Id velit magna dolor occaecat fugiat cupidatat cillum eiusmod dolor exercitation laborum consequat sint. Amet incididunt voluptate dolor adipisicing laboris eiusmod nulla commodo consequat laborum in in. Est do do nisi incididunt occaecat enim quis occaecat ipsum et. Duis officia consequat veniam irure. Ad ad dolor velit aliquip nostrud. Ullamco irure tempor cupidatat laborum duis eu sit amet dolore id. Qui duis laboris aliqua occaecat ullamco dolor ipsum. Aute reprehenderit laboris nulla sit ea ex dolor et magna quis in ex. Irure pariatur veniam exercitation mollit dolor ex sit esse velit minim nisi. Amet adipisicing cillum labore esse commodo sunt. Ut cillum proident nulla elit anim ipsum irure commodo amet aliquip commodo consequat. Sit irure nisi cillum ullamco. Lorem occaecat in cupidatat nulla nulla nostrud pariatur aliqua anim aliqua ea Lorem. In reprehenderit sunt laboris ex ea adipisicing fugiat cillum est dolor anim ad. Lorem mollit nostrud culpa excepteur. Sint elit id anim esse magna est pariatur adipisicing.</div>

      <h1 style='margin-bottom: 20px'>Heading 2</h1>
      <div style='text-align: justify'>Exercitation velit irure irure est nisi eu deserunt ut sunt eiusmod tempor aute esse ad. Id velit magna dolor occaecat fugiat cupidatat cillum eiusmod dolor exercitation laborum consequat sint. Amet incididunt voluptate dolor adipisicing laboris eiusmod nulla commodo consequat laborum in in. Est do do nisi incididunt occaecat enim quis occaecat ipsum et. Duis officia consequat veniam irure. Ad ad dolor velit aliquip nostrud. Ullamco irure tempor cupidatat laborum duis eu sit amet dolore id. Qui duis laboris aliqua occaecat ullamco dolor ipsum. Aute reprehenderit laboris nulla sit ea ex dolor et magna quis in ex. Irure pariatur veniam exercitation mollit dolor ex sit esse velit minim nisi. Amet adipisicing cillum labore esse commodo sunt. Ut cillum proident nulla elit anim ipsum irure commodo amet aliquip commodo consequat. Sit irure nisi cillum ullamco. Lorem occaecat in cupidatat nulla nulla nostrud pariatur aliqua anim aliqua ea Lorem. In reprehenderit sunt laboris ex ea adipisicing fugiat cillum est dolor anim ad. Lorem mollit nostrud culpa excepteur. Sint elit id anim esse magna est pariatur adipisicing.</div>

      <h1 style='margin-bottom: 20px'>Heading 3</h1>
      <div style='text-align: justify'>Exercitation velit irure irure est nisi eu deserunt ut sunt eiusmod tempor aute esse ad. Id velit magna dolor occaecat fugiat cupidatat cillum eiusmod dolor exercitation laborum consequat sint. Amet incididunt voluptate dolor adipisicing laboris eiusmod nulla commodo consequat laborum in in. Est do do nisi incididunt occaecat enim quis occaecat ipsum et. Duis officia consequat veniam irure. Ad ad dolor velit aliquip nostrud. Ullamco irure tempor cupidatat laborum duis eu sit amet dolore id. Qui duis laboris aliqua occaecat ullamco dolor ipsum. Aute reprehenderit laboris nulla sit ea ex dolor et magna quis in ex. Irure pariatur veniam exercitation mollit dolor ex sit esse velit minim nisi. Amet adipisicing cillum labore esse commodo sunt. Ut cillum proident nulla elit anim ipsum irure commodo amet aliquip commodo consequat. Sit irure nisi cillum ullamco. Lorem occaecat in cupidatat nulla nulla nostrud pariatur aliqua anim aliqua ea Lorem. In reprehenderit sunt laboris ex ea adipisicing fugiat cillum est dolor anim ad. Lorem mollit nostrud culpa excepteur. Sint elit id anim esse magna est pariatur adipisicing.</div>

      <h1 style='margin-bottom: 20px'>Heading 4</h1>
      <ol>
        <li>Voluptate cupidatat aute officia exercitation anim duis.</li>
        <li>Non ea aliquip anim dolor dolor voluptate deserunt exercitation do.</li>
        <li>Adipisicing cupidatat excepteur ipsum laboris ex laboris cupidatat aliquip eiusmod id veniam anim est.</li>
        <ul>
          <li>Pariatur deserunt velit deserunt velit nisi ut minim laborum magna culpa.</li>
          <li>Proident proident nostrud dolore adipisicing anim duis amet nostrud exercitation ut deserunt eiusmod eiusmod deserunt.</li>
          <li>Proident sunt proident in quis ut consectetur non sunt ad eu id.</li>
        </ul>
      </ol>

      <a href="https://sgcodes.co.in" style="font-size: 34px">Click here</a>

      <h1 style='margin-bottom: 20px'>Heading 5</h1>
      <table border="1">
        <tr>
          <th>Heading 1</th>
          <th>Heading 2</th>
          <th>Heading 3</th>
          <th>Heading 4</th>
        </tr>
        <tr>
          <td>Data 1</td>
          <td>Data 2</td>
          <td>Data 3</td>
          <td>Data 4</td>
        </tr>
        <tr>
          <td>Data 1</td>
          <td>Data 2</td>
          <td>Data 3</td>
          <td>Data 4</td>
        </tr>
        <tr>
          <td>Data 1</td>
          <td>Data 2</td>
          <td>Data 3</td>
          <td>Data 4</td>
        </tr>
      </table>
      `

        const logoUri = await getLetterheadBase64()

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
            width: 100%;
             height: 96%;
            background-color: white;
            border-radius: 12px;
            padding: 10px;
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
        .header_zero_margin_top {
            /* background-color: #12151C; */
            display: flex;
            flex-direction: column;
            align-items: center;
             justify-content: center;
            width: 100%;
            padding: 8px 0;
            color: black;
            border-top: 1px solid gray;
            border-bottom: 1px solid gray;
             margin-top: 0px;
        }

        .header_without_top_margin {
            // /* background-color: #12151C; */
            // display: flex;
            // flex-direction: row;
            // align-items: center;
            //  justify-content: center;
            // width: 100%;
            // padding: 8px 0;
            // color: black;
            // border-top: 1px solid gray;
            // border-bottom: 1px solid gray;
            //  margin-top: 2px;
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
            text-align: center;
            margin-top:20px;
        }

        .LogoContent_below_company_name {
            font-weight: bold;
            font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
            font-size: 16px;
            text-align: center;
            margin-top:20px;
        }

        .CmpnyLogo {
            width: 100%;
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
            margin: 0px 0;
            width: 58%;
            border: 1px solid #000000;
            border-radius: 5px;
            padding: 10px;
            margin-right:2%;
            display: flex;
            flex-direction: column;
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
            flex-grow: 1;
            border: 1px solid #000000;
            border-radius: 5px;
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
            padding: 0px 0px;
        }

         .TopRightItemCont {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            border-radius: 5px;
            padding: 10px;
            border: 1px solid #000000;
            width:40%;
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
            padding: 0px 0px;
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

        .image_letterhead{
            width:99%;
            object-fit:contain;
        }


        @page{ 
            margin-left: 20pt;
             margin-right: 20pt; 
             margin-top: 0pt;
             margin-bottom: 38pt; 
             padding-left: 0pt; 
             padding-right: 0pt;
              padding-top: 20pt; 
              padding-bottom: 0pt; }
        

    </style>
    </head>

    <body>
    
        <div class="InvCard">

                ${cmpcode.toLowerCase().trim() == 'premier' ?
                `<div>
                <img class="image_letterhead" src=${logoUri}
                </div>` : ""}

                ${cmpcode?.trim().toLowerCase() == 'premier' ?
                `<div class=${cmpcode?.trim().toLowerCase() == 'premier' ? "header_without_top_margin" : "header"}>
                       <div class="LogoContent">
                         <div> TAX INVOICE </div>
                      </div>
                 </div>`
                : ""}
        
        <div class=${cmpcode?.trim().toLowerCase() == 'icelab' || cmpcode?.trim().toLowerCase() == 'icelab_test' ? "header_zero_margin_top" : "header"}>
            
                <div class="LogoContent">
                    <div>THE ICE LAB MANUFACTURING LLC</div>
                </div>
                <div class="LogoContent_below_company_name">
                        <div>Central Plaza 2, Al Jurf</div>
                        <div>Ajman, UAE</div>
                        <div>Tel:065617700</div>
                    
                </div>
                <div class="LogoContent"> TAX INVOICE </div>
        
        </div> 

        <div class="content">

            <div class="our_trn_number">
                <div class="label">TRN:${getTRNnumber(cmpcode?.toUpperCase().trim())}</div>
            </div>

            <div>
            <span STYLE="border-radius:5px;border:1px solid #000000;font-size:12px;padding:4px">
            CUSTOMER DETAILS
            </span>
            </div>

            <div class="our_company_name_panel">

                <div class="section">
                    
                    <div style="flex-grow: 1;">
                        <div class="labelValue" style="font-weight: bold;">${selectedCustomer ? selectedCustomer : ''}
                        </div>
                    
                        <div class="labelValue" style="font-weight: bold;">${selectedCustomerAddress ? selectedCustomerAddress : ''}
                        </div>
                    </div>  
                    <div class="TrnTop">
                        <div class="label">CLIENT TRN:</div>
                        <div class="labelValue">${itemList ? itemList[0].TRN : ''}</div>
                    </div>

                </div>

                <div class="TopRightItemCont">

                    <div>
                        <div class="TopRightLables">INV NO</div>
                        <div class="TopRightLables">INV Date</div>
                        <div class="TopRightLables">INV TYPE</div>
                        <div class="TopRightLables">LPO</div>
                        <div class="TopRightLables">SALESMAN</div>
                     
                    </div>
                    <div style="margin-left: 8px; margin-right: 8px;">
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                        <div style="font-weight: bold;">:</div>
                    </div>
                    <div>
                        <div style="font-weight: bold;">${selectedInvoiceNo ? selectedInvoiceNo : ""}
                        </div>
                        <div style="padding-top:1px">${selectedInvDate}
                        </div>
                        <div style="padding-top:1px">
                        </div>
                        <div style="padding-top:1px">
                        </div>
                        <div style="padding-top:1px"></div>
                    </div>
                </div>

            </div>

             
            
            <div class="tableCont">

                <table border="1">
                    <thead>
                        <tr>
                            <th style="width:10%">Sl.No</th>
                            <th style="width:15%">CODE</th>
                            <th style="width:25%">DESCRIPTION</th>
                            <th style="width:10%">QTY</th>
                            <th style="width:10%">UNIT PRICE</th>
                            <th style="width:10%">TOTAL<br>[Excl. VAT]</br></th>
                            <th style="text-align: right;width:10%">VAT<br>@5%</br></th>
                            <th style="text-align: right;width:10%">Total<br>[Incl. VAT]</br</th>

                        </tr>
                    </thead>

                    <tbody>

                       ${itemList.map((item, index) => `
                       
                        <tr class="singleRowOfItem" style="border-bottom:2px dashed #7f7f7f">
                            <td style="width:10%">${index + 1}</td>
                            <td style="width:15%">${item.ITEM_CODE}</td>
                            <td style="width:25%">${item.DESCRIPTION}</td>
                          
                            <td style="width:10%">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3
                }).format(item.QTY)}</td>
                            <td style="width:10%">${item.PRICE}</td>
                            <td style="width:10%">${item.LINE_TOTAL}</td>
                           
                            <td style="text-align: right; width:10%">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(item.LINE_TOTAL * 0.05)}</td>

                <td style="text-align: right; width:10%">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format((item.LINE_TOTAL * 0.05) + item.LINE_TOTAL)}</td>
                        </tr>
                        `).join('')}
                    
                    </tbody>
                    </table>
                </div>

                 
                  

                <div style="display:flex;flex-direction:column;width:100%;border:1px solid #000000;border-radius:5px;margin-top: 1px;">

                    <div style="width:100%">
                        <div style="display:flex;justify-content:end;margin:10">
                            <div style="display:flex;justify-content:space-between;width:40%">
                                <label>Total Qty: </label>
                                <label style="min-width: 30%;margin-right: 10px;">${itemList?.reduce((acc, curr) => {
                    return acc = acc + curr.QTY
                }, 0)
            } </label>
                            </div>
                            <div style="display:flex;justify-content:space-between;width:40%">
                                <label>Total [Excl. VAT]: </label>
                                <label>${subTotal ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(subTotal) : ''} </label>
                            </div>
                        </div>

                    </div>  

                    <div style="width:100%;display:flex;padding-top:30px">
                        <div style="width:60%">
                            <div style="margin-left: 30px;">${toWords.convert(
                parseInt(
                    subTotal
                        ? subTotal + subTotal * 0.05
                        : '')
            )
            }
            AND 
            ${(((subTotal + subTotal * 0.05) - Math.floor(subTotal + subTotal * 0.05)).toFixed(2) * 100)}
            / 100
            ONLY
            </div>
                            <div style="margin-left: 30px;">TERMS </div>
                        </div>
                        <div style="width:40%">
                            <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                                <div>TAXABLE AMOUNT</div>
                                <div>${subTotal ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(subTotal) : ''}</div>
                            </div>
                                <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                            <div>VAT AMOUNT</div>
                            <div>${(subTotal ? (subTotal * 0.05).toFixed(2) : '')
            }</div>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                            <div>TOTAL[incl. VAT]</div>
                            <div>${(subTotal
                ? new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2, maximumFractionDigits: 2
                }).format(subTotal + subTotal * 0.05)
                : '')}</div>
                        </div>
                    </div>

                </div>
            </div>  

            
            
            <div class="footer">

                <div style="display:flex;width:100%;">
                    <div class="footer-received-panel" style="display:flex;width:60%">
                        
                        <div style="display:flex;flex-direction:column;width:50%">
                            <label style="font-weight: bold;">DO NO</label>
                            <label></label>
                        </div>
                        <div style="display:flex;flex-direction:column;width:50%">
                            <label style="font-weight: bold;">Remarks</label>
                            <label></label>
                        </div>
                    
                    </div>

                    <div style="display:flex;justify-content:end;width:40%;padding-top:80px">
                   
                        <label class="loginUserLabel" style="margin-right:12px;border-top:1px solid #000000">
                        <div style="font-weight: bold;padding-left:50px;padding-top:5px"> ${cmpcode?.trim().toUpperCase() == "PREMIER" ? "PREMIER AUTO PARTS LLC" : ''}</div>
                        </label>
                    </div>
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
                   overflow: hidden;
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
                           <div class="labelValue" style="font-weight: bold;">${selectedCustomer ? selectedCustomer : ''}
                           </div>
                         
        
        
        
                       </div>
        
                       <div class="TopRightItemCont">
        
                           <div>
                               <div class="TopRightLables">Invoice No</div>
                               <div class="TopRightLables">Date</div>
                               <div class="TopRightLables">Payment Terms</div>
                           
                           </div>
                           <div style="margin-left: 8px; margin-right: 8px;">
                               <div style="font-weight: bold;">:</div>
                               <div style="font-weight: bold;">:</div>
                               <div style="font-weight: bold;">:</div>
                           </div>
                           <div>
                               <div style="font-weight: bold;">MFS-${selectedInvoiceNo ? selectedInvoiceNo : ""}
                               </div>
                               <div style="padding-top:1px">${selectedInvDate}
                               </div>
                               <div style="padding-top:1px">${terms ? terms : ""}</div>
                           </div>
                       </div>
        
                   </div>
        
                     <div class="TrnTop">
                       <div class="label">TRN Number:</div>
                       <div class="labelValue">${itemList ? itemList[0].TRN : ''}</div>
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
        
                              ${itemList.map((item, index) => `
                               <tr>
                                   <td>${index + 1}</td>
                                   <td>${item.DESCRIPTION}</td>
                                
                                   <td>${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }).format(item.QTY)}</td>
                                   <td>${item.UNIT}</td>
                                   <td style="text-align: right;">${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(item.PRICE)}</td>
                                   <td style="text-align: right;">${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(item.LINE_TOTAL)}</td>
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
                                       ${subTotal ? new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(subTotal) : ''}</td>
                               </tr>
                               <tr style="border:none; font-weight: bold;">
                                   <td colspan="4" style="border:none; padding:4px;">2. Expired goods will not be taken back
                                       under any circumstances.</td>
                                   <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">VAT
                                       (5%):</td>
                                   <td
                                       style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                       ${discount !== 0 ? (discountedTotal ? (discountedTotal * 0.05).toFixed(2) :
                '') : (subTotal ? (subTotal * 0.05).toFixed(2) : '')}</td>
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
                    }).format(discountedTotal + discountedTotal * 0.05)
                    : '')
                : (subTotal
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2, maximumFractionDigits: 2
                    }).format(subTotal + subTotal * 0.05)
                    : '')}</td>
                               </tr>
        
                           </tbody>
                       </table>
        
                       
                   </div>
                  
                   <div class="footer">
        
                       <div class="footer-received-panel">
                           <label class="loginUserLabel">
                               <div style="font-weight: bold;">For Malbar Stars Food Stuff TR.LLC</div>
                               <div>${loginUser ? loginUser : ''}</div>
                           </label>
                           <label class="loginUserLabel" style="margin-right:12px;">
                               <div style="font-weight: bold;">For ${selectedCustomer ? selectedCustomer : ''}</div>
                               <div>Received By,</div>
                           </label>
                       </div>
        
                   </div>
               </div>
           </div>
        
         
               </body>   
               </html>`


        const cmpcodeChk = cmpcode.toUpperCase();
        // const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNewMalbar : htmlNew;
        const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNewMalbar : htmlNew;

        console.log('cmpcodeChk', cmpcodeChk)

        let options = {
            html: initialHTML,
            fileName: 'Invoice',
            directory: 'Documents',
            base64: true
        };

        try {

            // Generate the initial PDF to get the total number of pages
            const file = await RNHTMLtoPDF.convert(options);
            const totalPages = file.numberOfPages; // Assuming the library returns the number of pages

            console.log("totalPage>>", totalPages);

            ///



            //
            setPdfUri(`file://${file.filePath}`);

            if (cmpcode == 'MALBAR') {
                await Share.open({
                    title: 'Share Invoice Details PDF',
                    url: `file://${file.filePath}`,
                });
            } else {

                const existingPdfBytes = await fetch(`file://${file.filePath}`).then(res => res.arrayBuffer())
                const pdfDoc = await PDFDocument.load(existingPdfBytes)

                const pages = pdfDoc.getPages()

                // const firstPage = pages[0]

                for (i = 0; i < pages.length; i++) {

                    const { width, height } = pages[i].getSize()

                    console.log("page size ", width, height)

                    pages[i].drawText("Page " + (i + 1) + " of " + totalPages, {
                        x: (width / 2) - 50,
                        y: 20,
                        size: 16,
                    })
                }

                try {

                    // const pdfBytes = await pdfDoc.save()
                    const pdfBytes = await pdfDoc.saveAsBase64()


                    // Path where the file will be saved
                    const filePath = RNFS.DocumentDirectoryPath + `/invoice_${selectedInvoiceNo}.pdf`; // Save as an image file (can be any file type)

                    // Write the base64 string as a file
                    await RNFS.writeFile(filePath, pdfBytes, 'base64');

                    console.log('File saved at:->>>', filePath, selectedInvoiceNo);

                    await Share.open({
                        title: 'Share Invoice Details PDF',
                        url: `file://${filePath}`,
                    });

                    // ends 



                } catch (error) {
                    console.log('File save error ', error);
                }
            }


        } catch (error) {
            console.error(error);
        } finally {
            resultClosePress()
        }
    }
    // pdfCode

    const resultClosePress = () => {
        setSelectedCustomer('')
        setSelectedCustomerAddress('')
        setSlelecetdInvNo('')
        setLoginUser('')
        setItemList('')
        setTerms('')
        setSubTotal(0)
        setDiscount(0)

        setShowPrintButtonLoader(false)

    }

    useEffect(() => {
        if (itemList && itemList.length > 0) {
            const totalLineCost = itemList.reduce((acc, item) => acc + item.LINE_TOTAL, 0);
            console.log("Total Line Cost:", totalLineCost);
            setSubTotal(totalLineCost)
            // You can set this totalLineCost to state if needed
        }
    }, [itemList]);


    // getPrintItemDetails

    const fetchItemList = async (item) => {

        console.log("item after print button clicked >>", item)

        setShowPrintButtonLoader(true)
        try {
            setSelectedCustomer(item.CUSTOMER)
            setSelectedCustomerAddress(item.ADDRESS)
            setSlelecetdInvNo(item.INVNO)
            setLoginUser(item.USER)

            // Convert and format the date
            const formattedDate = format(new Date(item.INV_DATE), 'dd/MM/yyyy');
            setSelectedInvDate(formattedDate)
            console.log('fetchItemList', `${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`)
            const response = await axios.get(`${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`);

            if (response.status === 200) {
                setItemList(response.data);
                setTerms(response.data[0].terms.trim().toUpperCase())
                // setSubTotal(response.data[0].inv_total)
                setDiscount(response.data[0].disc_amt)
                setTrn(response.data[0].TRN)
                console.log("trn from invoice list ", response.data[0].TRN)

                // setShowPrintButtonLoader(false)
            }


        } catch (error) {
            console.log('fetchItemListError', error)
            setError(error);
            setShowPrintButtonLoader(false)
        }
    };

    const fetchItemListBLuetooth = async (item) => {

        console.log("item after print button clicked >>", item)

        setShowPrintButtonLoaderBluetooth(true)
        try {
            setSelectedCustomer(item.CUSTOMER)
            setSelectedCustomerAddress(item.ADDRESS)
            setSlelecetdInvNo(item.INVNO)
            setLoginUser(item.USER)

            // Convert and format the date
            const formattedDate = format(new Date(item.INV_DATE), 'dd/MM/yyyy');
            setSelectedInvDate(formattedDate)
            console.log('fetchItemList', `${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`)
            const response = await axios.get(`${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`);

            if (response.status === 200) {
                setItemListBluetooth(response.data);
                setTerms(response.data[0].terms.trim().toUpperCase())
                // setSubTotal(response.data[0].inv_total)
                setDiscount(response.data[0].disc_amt)
                setTrn(response.data[0].TRN)
                console.log("trn from invoice list ", response.data[0].TRN)


            }

            setShowPrintButtonLoaderBluetooth(false)

        } catch (error) {
            console.log('fetchItemListError', error)
            setError(error);
            setShowPrintButtonLoaderBluetooth(false)
        }
    };

    useEffect(() => {
        if (itemList && subTotal) {
            generatePDF()// earlier like this

            // navigation.navigate("PrintSmallDevice")


        }
    }, [itemList, subTotal])


    useEffect(() => {
        if (itemListBluetooth) {
            printBt()


        }
    }, [itemListBluetooth])



    // const subTotal = itemList && itemList.length > 0 && itemList.reduce((sum, item) => sum + (item.line_total || 0), 0)

    // console.log('subTotal', subTotal)

    // getPrintItemDetails


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

    const fetchAsyncUser = async () => {
        const salesMan = await AsyncStorage.getItem('sales_man')

        const deptno = await AsyncStorage.getItem('DEPTNO')

        const appUrl = await AsyncStorage.getItem('appUrl')

        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        // const locusername = await AsyncStorage.getItem('loginUserName')

        // if (locusername) {
        //     setLoginUser(locusername)
        // }

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }


        if (appUrl) {
            setAppUrl(appUrl)
        }

        if (salesMan === '----') {
            const salesManDrop = await AsyncStorage.getItem('sales_man_drop')
            setSalesMan(salesManDrop)
        } else {
            setSalesMan(salesMan)

        }
        if (deptno) {
            setDeptNo(deptno)
        } else {
            setDeptNo('----')
        }
    }

    useEffect(() => {
        fetchAsyncUser()
    }, [])

    useEffect(() => {

        if (salesMan && deptNo && appUrl && cmpcode) {
            setShowLoader(true)
            const fetchList = async () => {
                try {
                    console.log(`${appUrl}SalesInvoice/${cmpcode}/invoicelist/${deptNo}/${salesMan}/-`)
                    const response = await axios.get(`${appUrl}SalesInvoice/${cmpcode}/invoicelist/${deptNo}/${salesMan}/-`)

                    // console.log(response.data)

                    if (response.status === 200) {
                        setListData(response.data)
                        setData(response.data)
                        setShowLoader(false)
                    }
                    setShowLoader(false)

                } catch (error) {
                    console.log('fetchList', error)
                    setApiError('Some Error Occured')
                    setShowLoader(false)

                }
            }

            fetchList()

        }

    }, [salesMan, deptNo, appUrl, cmpcode])



    const fetchAppUrl = async () => {
        const appUrl = await AsyncStorage.getItem('appUrl')
        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }
        if (appUrl) {
            setAppUrl(appUrl)
        }
    }


    const fetchSalesMan = async () => {
        const salesMan = await AsyncStorage.getItem('sales_man')

        if (salesMan === '----') {
            const salesManDrop = await AsyncStorage.getItem('sales_man_drop')
            setSalesMan(salesManDrop)
        } else {
            setSalesMan(salesMan)

        }
    }



    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy');
    }


    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return data.slice(startIndex, endIndex);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        fetchSalesMan()
        fetchAppUrl()
    })

    const requestBluetoothPermissions = async () => {
        // If scanning is not needed, you can skip this check for older Android
        if (Platform.OS === 'android') {
            let permissionsToRequest = [];

            // Android 12 (API 31) and higher require the new runtime permissions
            if (Platform.Version >= 31) {
                permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
                permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
            } else {
                // Older Android versions require location for discovery/scanning
                permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            }

            if (permissionsToRequest.length > 0) {
                try {
                    const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);

                    // Check if all requested permissions were granted
                    const allGranted = permissionsToRequest.every(permission =>
                        results[permission] === PermissionsAndroid.RESULTS.GRANTED
                    );

                    if (allGranted) {
                        console.log("All required Bluetooth permissions granted");
                        return true;
                    } else {
                        console.log("Not all required Bluetooth permissions granted:", results);
                        return false;
                    }
                } catch (err) {
                    console.warn("Bluetooth permissions error:", err);
                    return false;
                }
            }
        }
        // For other platforms (or if no Android-specific runtime permissions were needed), assume success.
        return true;
    };

    const printBt = async () => {

        const hasPermission = await requestBluetoothPermissions();

        if (!hasPermission) {
            // Optionally show a message to the user that printing cannot proceed
            console.log("Cannot print: Bluetooth Connect permission denied.");
            return;
        }

        try {
            await ThermalPrinterModule.printBluetooth({
                payload: setFormatTextForBluetooth().text,

            });
        } catch (err) {
            //error handling
            console.log(err.message);
        }
    }


    // console.log('prevOrder', data)

    // console.log('listData', listData && listData[0])

    console.log('itemList', itemList && itemList[0])

    // console.log('selectedRadio', selectedRadio)

    console.log('terms', terms)

    console.log('subTotal', subTotal)

    console.log('discount', discount)

    return (
        <View style={styles.HomeWrap}>
            {/* <Header /> */}

            <HeaderUiNew name={'Previous Invoices'} />

            <View style={styles.HomeCont}>

                {/* <View style={styles.HomeTextCont}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                    </TouchableOpacity>
                    <Text style={styles.HomeText}>Previous Orders</Text>
                </View> */}

                {
                    showLoader &&
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                }

                {
                    !showLoader && apiError && !listData &&
                    <View>
                        <Text style={styles.ErrorText}>{apiError}</Text>
                    </View>
                }
                {/* 
                {
                    data.length === 0 && !loading &&
                    <View>
                        <Text style={{
                            color: 'red',
                            fontSize: 16,
                            fontFamily: 'Lexend-Bold',
                        }}>No Data Available</Text>
                    </View>
                } */}


                <FlatList
                    data={getPaginatedData()}
                    keyExtractor={(item, index) => index}
                    style={{ width: '94%' }}
                    renderItem={({ item }) => (
                        <ScrollView style={styles.PreviousOrderWrap}>
                            {/*  */}

                            {/* <View style={styles.StockListItem} onPress={() => navigation.navigate('OrderDetails', { orderId: item.so_no })}> */}
                            <View style={styles.StockListItem}>

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
                                            <Text style={[styles.StockListDescText, { width: '75%' }]}>{item.CUSTOMER}</Text>
                                            <Text style={[styles.StockListDescTextSmall, { color: '#30B3A4', fontFamily: 'Lexend-Regular', }]}>{item.AMOUNT}</Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            width: '100%',
                                            paddingVertical: 6
                                        }}>
                                            <Text style={styles.StockListDescTextSmall}>{item.INVNO}</Text>
                                            <View style={{
                                                marginLeft: 24,
                                                flexDirection: 'row'
                                            }}>
                                                {/* <Text style={[styles.StockListDescTextSmall,]}>Inv Date:</Text> */}
                                                <Text style={[styles.StockListDescTextSmall,]}>{formattedDate(item.INV_DATE)}</Text>
                                            </View>
                                            <View style={{
                                                marginLeft: 24,
                                                flexDirection: 'row'
                                            }}>
                                                {/* <Text style={[styles.StockListDescTextSmall,]}>Inv Date:</Text> */}
                                                <Text style={[styles.StockListDescTextSmall,]}>{item['SALES MAN']}</Text>
                                            </View>

                                            {/* commented because to test print bt */}





                                            {/* <TouchableOpacity style={[styles.PlusMinusCont, { marginLeft: 'auto' }]} onPress={() => toggleExpand(item.INVNO)}>
                                                {
                                                    expandedItems.includes(item.INVNO) ?
                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                        :
                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                }
                                            </TouchableOpacity> */}
                                        </View>
                                    </View>

                                </View>

                                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                    <TouchableOpacity style={[styles.PrintAcceptButton,]} onPress={() => fetchItemList(item)}>
                                        {
                                            showPrintButtonLoader && item.INVNO === selectedInvoiceNo ?
                                                <ActivityIndicator color={'white'} />
                                                :
                                                <Text style={styles.PrintAcceptText}>Print</Text>
                                        }
                                    </TouchableOpacity>

                                    {(cmpcode?.toUpperCase().trim() == "ICELAB" || cmpcode?.toUpperCase().trim() == "ICELAB_TEST") && <TouchableOpacity style={[styles.PrintAcceptButtonBT,]} onPress={() => fetchItemListBLuetooth(item)}>

                                        {
                                            showPrintButtonLoaderBluetooth && item.INVNO === selectedInvoiceNo ?
                                                <ActivityIndicator color={'white'} />
                                                :
                                                <Text style={styles.PrintAcceptText}>Print BT</Text>
                                        }
                                    </TouchableOpacity>}


                                </View>


                                {/* {
                                    expandedItems.includes(item.so_no) && (

                                        <View style={styles.QtyAvlQtyCont}>

                                            <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', marginRight: 16 }]} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'edit' })}>
                                                <Text style={styles.QtyText}>Edit Sales Order</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', }]} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'pull' })}>
                                                <Text style={styles.AvlText}>Pull Sales Order</Text>
                                            </TouchableOpacity>
                                        </View>

                                    )
                                } */}


                            </View>
                            {/*  */}
                            {/* 
                            <View style={styles.PreviousOrderCard}>
                                <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: item.so_no })}>
                                    <Text style={styles.OrderNoText}>{item.so_no}</Text>
                                    <Text style={styles.CustomerNameText}>{item.accdesc}</Text>

                                </TouchableOpacity>

                                <View style={styles.OrderUpdatesWrap}>


                                    <View style={styles.EditPullWrap}>
                                        <TouchableOpacity style={styles.EditPullButton} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'edit' })}>
                                            <Text style={styles.EditPullText}>Edit Sales Order</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.EditPullButton} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'pull' })}>
                                            <Text style={styles.EditPullText}>Pull Sales Order</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View> */}

                        </ScrollView>
                    )}
                />


                {
                    data.length > 0 && !loading &&
                    <View style={styles.pagination}>
                        {
                            currentPage !== 1 &&
                            <TouchableOpacity onPress={handlePreviousPage} disabled={currentPage === 1} style={styles.pageButton}>
                                <Text style={styles.pageButtonText}>Previous</Text>
                            </TouchableOpacity>
                        }
                        <Text style={styles.pageInfo}>
                            Page {currentPage} of {totalPages}
                        </Text>
                        {
                            currentPage !== totalPages &&
                            <TouchableOpacity onPress={handleNextPage} disabled={currentPage === totalPages} style={styles.pageButton}>
                                <Text style={styles.pageButtonText}>Next</Text>
                            </TouchableOpacity>
                        }
                    </View>
                }


            </View>

            {
                showStatusLogPop &&
                <StatusLogPop orderIdPop={orderIdPop} setShowStatusLogPop={setShowStatusLogPop} />
            }
        </View >
    )
}

const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFEFEF',
        width: '100%'
    },
    HomeCont: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingHorizontal: 8,
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
    PreviousOrderWrap: {
        width: '100%',
        flexDirection: 'column',
        // alignItems: 'center',
        marginTop: 3
    },
    PreviousOrderCard: {
        width: '100%',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        marginBottom: 8
    },
    OrderNoText: {
        backgroundColor: '#ffbb00',
        padding: 6,
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        color: 'black',
        marginBottom: 6,
        width: '20%'
    },
    CustomerNameText: {
        fontSize: 18,
        fontFamily: 'Lexend-Regular',
        color: 'black',
        marginVertical: 4
    },
    StatusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4
    },
    StatusTextTag: {
        color: 'blue',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    StatusText: {
        fontSize: 18,
        fontFamily: 'Lexend-Regular',
        color: 'black',
        marginLeft: 12
    },
    OrderUpdatesWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginVertical: 4,
        backgroundColor: '#f5f5f5',
        padding: 8
    },
    ViewStatusWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginVertical: 4
    },
    ViewStatusButton: {
        backgroundColor: 'black',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 4
    },
    ViewStatusText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'white',
    },
    EditPullWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8
    },
    EditPullButton: {
        backgroundColor: '#8f8f8f',
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginRight: 12,
        borderRadius: 4
    },
    EditPullText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'white',
    },
    CardScroll: {
        width: '100%',
        alignItems: 'center'
    },

    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        width: '80%',
        marginBottom: 16
    },
    pageButton: {
        padding: 10,
        backgroundColor: '#5A55CA',
        borderRadius: 5,
    },
    pageButtonText: {
        color: '#fff',
        fontFamily: 'Lexend-Regular',
    },
    pageInfo: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: 'black'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    HeadIcon: {
        width: 25,
        height: 25
    },


    StockListItem: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 8,
        backgroundColor: '#FDFDFD',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 14,
        width: '100%',

        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowOpacity: 0.25, // Shadow opacity for iOS
        shadowRadius: 3.84, // Shadow radius for iOS
        elevation: 1.5, // Elevation for Android

        borderColor: 'grey',
        borderWidth: 0.5,
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

    PrintAcceptButton: {
        backgroundColor: '#30B3A4',
        // padding: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',

    },

    PrintAcceptButtonBT: {
        backgroundColor: '#30B3A4',
        // padding: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
        marginLeft: 10

    },
    PrintAcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },




})


export default InvoiceList