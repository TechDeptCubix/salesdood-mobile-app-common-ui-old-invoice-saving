import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import StatusLogPop from '../popups/StatusLogPop';
import HeaderUiNew from './HeaderUiNew';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';
import {ToWords} from 'to-words';
import * as RNFS from 'react-native-fs';
import ThermalPrinterModule from 'react-native-thermal-printer';
import {generatePDF} from './InvoicePdf';
import SunmiPrinter, {AlignValue} from '@heasy/react-native-sunmi-printer';
import {ICUP_LOGO_BASE64} from '../images/icup_logo';

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
    const QTY_END = 32; // Where Qty column ends
    const RATE_END = 42; // Where Rate column ends
    const VAT_END = 52; // Where VAT column ends
    const AMOUNT_END = 62; // Where Amount column ends (matches your totals)

    return itemListBluetooth
      ?.map((item, index) => {
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
            const amountStr = (
              item.LINE_TOTAL +
              item.LINE_TOTAL * 0.05
            ).toFixed(2);

            // Calculate spacing for right-alignment in each column
            const qtySpaces = QTY_END - DESC_MAX_LEN - qtyStr.length;
            const rateSpaces = RATE_END - QTY_END - rateStr.length;
            const vatSpaces = VAT_END - RATE_END - vatStr.length;
            const amountSpaces = AMOUNT_END - VAT_END - amountStr.length;

            itemLine += `[L]${descriptionPadded}${' '.repeat(
              Math.max(1, qtySpaces),
            )}${qtyStr}${' '.repeat(
              Math.max(1, rateSpaces),
            )}${rateStr}${' '.repeat(
              Math.max(1, vatSpaces),
            )}${vatStr}${' '.repeat(Math.max(1, amountSpaces))}${amountStr}\n`;

            isFirstLine = false;
          } else {
            // WRAPPED LINES: Only contain the indented description text
            itemLine += `[L]${currentChunk}\n`;
          }
        }

        return itemLine;
      })
      .join('');
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
  const pad = count => ' '.repeat(count);
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
  const FOOT_PAD_SIGN = pad(23);

  const formatTotalLine = (label, value) => {
    const valueStr =
      typeof value === 'number' ? value.toFixed(2) : value.toString();
    const labelStart = 28; // Where label starts (below Qty column)
    const valueEnd = 62; // Increased to align with Amount column (was 48)

    // Create the label with its starting position
    const labelWithPadding = ' '.repeat(labelStart) + label;

    // Calculate total spaces needed between start and value end
    const totalSpaceForValue =
      valueEnd - labelWithPadding.length - valueStr.length;

    return `[L]${labelWithPadding}${' '.repeat(
      Math.max(1, totalSpaceForValue),
    )}${valueStr}\n`;
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

    return `[L]<b>${desc}${' '.repeat(Math.max(1, qtySpaces))}Qty${' '.repeat(
      Math.max(1, rateSpaces),
    )}Rate${' '.repeat(Math.max(1, vatSpaces))}VAT${' '.repeat(
      Math.max(1, amountSpaces),
    )}Amount</b>\n`;
  };
  // this one based on the reference syed icelab given
  const setFormatTextForBluetooth = () => {
    return {
      text:
        COMP_PAD +
        "[C]<b><font size='tall'>THE ICE LAB MANUFACTURING LLC</font></b>\n" +
        ADD_PAD +
        '[C]Central Plaza 2, Al Jurf\n' +
        CITY_PAD +
        '[C]Ajman, UAE\n' +
        TEL_PAD +
        '[C]Tel:065617700\n' +
        TRN_PAD +
        '[C]TRN : 104112430400003\n' +
        // Invoice and Customer Info
        '[L]\n' +
        INV_PAD +
        "[L]<font size='tall'>Tax Invoice</font>\n \n" +
        `[L]INVOICE NO       :  ${itemListBluetooth[0]?.inv_no}\n` +
        `[L]INVOICE DATE     :  ${
          itemListBluetooth[0]?.inv_date.split('T')[0]
        } ${itemListBluetooth[0]?.time}\n` +
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

        formatTotalLine(
          'Total (Ex VAT)',
          (itemListBluetooth[0]?.inv_total - itemListBluetooth[0]?.w)?.toFixed(
            2,
          ),
        ) +
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
        FOOT_PAD +
        '[C]Thank you for shopping with us\n' +
        FOOT_PAD_SIGN +
        '[C]Signature/date\n' +
        '[L]\n' +
        '[L]\n' +
        '[L]\n',
    };
  };

  const getLetterheadBase64 = async () =>
    new Promise((resolve, reject) => {
      RNFS.readFileAssets('premier_letterhead_text.txt')
        .then(result => {
          console.log(result);
          resolve(result);
        })
        .catch(err => {
          console.log(err);
        });
    });
  const printSunmiInvoice = async data => {
    try {
      if (!data || data.length === 0) return;

      const header = data[0];
      console.log('Inovice header data', header);

      // 🔹 CALCULATIONS
      const totalExclusive = data.reduce(
        (sum, item) => sum + (parseFloat(item.LINE_TOTAL) || 0),
        0,
      );
      const totalVat = data.reduce(
        (sum, item) => sum + (parseFloat(item.w) || 0),
        0,
      );
      const grandTotal = totalExclusive + totalVat;

      SunmiPrinter.printerInit();
      try {
        SunmiPrinter.setAlignment(AlignValue.CENTER);

        // Remove header if it exists (e.g., data:image/png;base64,)
        const cleanBase64 = ICUP_LOGO_BASE64.replace(
          /^data:image\/[a-z]+;base64,/,
          '',
        );

        // 384 is the standard pixel width for Sunmi 58mm paper
        await SunmiPrinter.printBitmap(cleanBase64, 384);
        SunmiPrinter.lineWrap(1);
      } catch (imgError) {
        console.log('Logo Print Error:', imgError);
      }

      // 🔹 HEADER
      SunmiPrinter.setAlignment(AlignValue.CENTER);
      SunmiPrinter.setFontSize(32);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText('TAX INVOICE\n');

      // 1. ADD PADDING BOTTOM FOR TAX INVOICE
      SunmiPrinter.lineWrap(1); // Adds one line of vertical space

      SunmiPrinter.setFontSize(28);
      SunmiPrinter.printerText('ICECUP FOOD INDUSTRIES L.L.C\n');

      SunmiPrinter.setFontSize(20);
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText(
        'Warehouse 23, First Industrial Area, Jebel Ali, Dubai.\n',
      );

      SunmiPrinter.printerText('Tel: +971 547642223 , +971 43264233\n');

      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText('TRN: 104173070400003\n');
      SunmiPrinter.setFontWeight(false); // Reset weight for subsequent text

      SunmiPrinter.lineWrap(1);

      // 🔹 WIDER DIVIDER
      // Increased number of dashes to ensure it spans the full width
      const divider = '----------------------------------------------------\n';
      // SunmiPrinter.printerText(divider);

      // 🔹 INVOICE INFO
      const infoWeights = [200, 360];

      // Determine the Payment Type Label
      const paymentType = header.cashcred === 'C' ? 'CASH' : 'CREDIT';

      SunmiPrinter.setAlignment(AlignValue.LEFT);

      // 1. Invoice Number
      SunmiPrinter.printColumnsString(
        ['Invoice No:', header.inv_no.toString()],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );

      // 2. NEW: Payment Mode
      SunmiPrinter.setFontWeight(true); // Make it bold so it's clear
      SunmiPrinter.printColumnsString(
        ['Payment Mode:', paymentType],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.setFontWeight(false);

      // 3. Customer
      SunmiPrinter.printColumnsString(
        ['Customer:', header.custref],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );

      // 4. Date
      SunmiPrinter.printColumnsString(
        ['Date:', header.inv_date.split('T')[0]],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );

      SunmiPrinter.printerText(
        '--------------------------------------------------------\n',
      );

      const tableWeights = [240, 40, 90, 70, 120];

      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.setFontSize(18);
      SunmiPrinter.printColumnsString(
        ['Description', 'Qty', 'Price', 'VAT', 'Total'],
        tableWeights,
        [
          AlignValue.LEFT,
          AlignValue.CENTER,
          AlignValue.RIGHT,
          AlignValue.RIGHT,
          AlignValue.RIGHT,
        ],
      );
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText(
        '--------------------------------------------------------------\n',
      );
      // 🔹 ITEMS LOOP
      data.forEach(item => {
        const lineExcl = parseFloat(item.LINE_TOTAL) || 0;
        const lineVat = parseFloat(item.w) || 0;
        const lineWithVat = lineExcl + lineVat;

        SunmiPrinter.printColumnsString(
          [
            item.DESCRIPTION,
            item.QTY.toString(),
            parseFloat(item.PRICE).toFixed(2),
            lineVat.toFixed(2),
            lineWithVat.toFixed(2),
          ],
          tableWeights,
          [
            AlignValue.LEFT,
            AlignValue.CENTER,
            AlignValue.RIGHT,
            AlignValue.RIGHT,
            AlignValue.RIGHT,
          ],
        );
      });

      SunmiPrinter.printerText(
        '--------------------------------------------------------------\n',
      );
      // 🔹 TOTAL SECTION
      const totalWeights = [340, 220];
      SunmiPrinter.setFontSize(20);

      SunmiPrinter.printColumnsString(
        ['Total (Excl):', totalExclusive.toFixed(2)],
        totalWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.printColumnsString(
        ['VAT Amount:', totalVat.toFixed(2)],
        totalWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );

      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.setFontSize(26);
      SunmiPrinter.printColumnsString(
        ['GRAND TOTAL:', grandTotal.toFixed(2) + ' AED'],
        totalWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );

      SunmiPrinter.setFontSize(20);
      SunmiPrinter.setFontWeight(false);
      //   SunmiPrinter.printColumnsString(
      //     ['Closing Bal:', parseFloat(header.Closing_Balance).toFixed(2)],
      //     totalWeights,
      //     [AlignValue.LEFT, AlignValue.RIGHT],
      //   );

      SunmiPrinter.setAlignment(AlignValue.CENTER);
      SunmiPrinter.printerText('\n*** Thank You ***\n');
      SunmiPrinter.lineWrap(4);
    } catch (error) {
      console.log('Sunmi Invoice Print Error:', error);
    }
  };
  const printSunmiInvoiceSM = data => {
    try {
      if (!data || data.length === 0) return;

      const header = data[0];

      // 🔹 CALCULATIONS
      const totalExclusive = data.reduce(
        (sum, item) => sum + (parseFloat(item.LINE_TOTAL) || 0),
        0,
      );
      const totalVat = data.reduce(
        (sum, item) => sum + (parseFloat(item.w) || 0),
        0,
      );
      const grandTotal = totalExclusive + totalVat;

      SunmiPrinter.printerInit();

      // 🔹 HEADER
      SunmiPrinter.setAlignment(AlignValue.CENTER);
      SunmiPrinter.setFontSize(32);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText('TAX INVOICE\n');

      SunmiPrinter.setFontSize(28);
      SunmiPrinter.printerText('VAN SALES INDUSTRIES\n');
      SunmiPrinter.setFontSize(20);
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText('Jabal Ali, Industrial 4\n');
      SunmiPrinter.printerText('TRN: 100XXXXXXXXXXXX\n');

      // 🔹 WIDER DIVIDER
      // Increased number of dashes to ensure it spans the full width
      const divider = '--------------------------------------\n';
      SunmiPrinter.printerText(divider);

      // 🔹 INVOICE INFO
      const infoWeights = [200, 360]; // Shifted weight to allow longer values on the right
      SunmiPrinter.setAlignment(AlignValue.LEFT);
      SunmiPrinter.printColumnsString(
        ['Invoice No:', header.inv_no.toString()],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.printColumnsString(
        ['Customer:', header.custref],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.printColumnsString(
        ['Date:', header.inv_date.split('T')[0]],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );

      SunmiPrinter.printerText('--------------------------------------\n');

      const tableWeights = [240, 40, 90, 70, 120];

      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.setFontSize(18);
      SunmiPrinter.printColumnsString(
        ['Description', 'Qty', 'Price', 'VAT', 'Total'],
        tableWeights,
        [
          AlignValue.LEFT,
          AlignValue.CENTER,
          AlignValue.RIGHT,
          AlignValue.RIGHT,
          AlignValue.RIGHT,
        ],
      );
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText('------------------------------------------\n');
      // 🔹 ITEMS LOOP
      data.forEach(item => {
        const lineExcl = parseFloat(item.LINE_TOTAL) || 0;
        const lineVat = parseFloat(item.w) || 0;
        const lineWithVat = lineExcl + lineVat;

        SunmiPrinter.printColumnsString(
          [
            item.DESCRIPTION,
            item.QTY.toString(),
            parseFloat(item.PRICE).toFixed(2),
            lineVat.toFixed(2),
            lineWithVat.toFixed(2),
          ],
          tableWeights,
          [
            AlignValue.LEFT,
            AlignValue.CENTER,
            AlignValue.RIGHT,
            AlignValue.RIGHT,
            AlignValue.RIGHT,
          ],
        );
      });

      SunmiPrinter.printerText('------------------------------------------\n');

      // 🔹 TOTAL SECTION
      const totalWeights = [340, 220];
      SunmiPrinter.setFontSize(20);

      SunmiPrinter.printColumnsString(
        ['Total (Excl):', totalExclusive.toFixed(2)],
        totalWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.printColumnsString(
        ['VAT Amount:', totalVat.toFixed(2)],
        totalWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );

      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.setFontSize(26);
      SunmiPrinter.printColumnsString(
        ['GRAND TOTAL:', grandTotal.toFixed(2) + ' AED'],
        totalWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );

      SunmiPrinter.setFontSize(20);
      SunmiPrinter.setFontWeight(false);
      //   SunmiPrinter.printColumnsString(
      //     ['Closing Bal:', parseFloat(header.Closing_Balance).toFixed(2)],
      //     totalWeights,
      //     [AlignValue.LEFT, AlignValue.RIGHT],
      //   );

      SunmiPrinter.setAlignment(AlignValue.CENTER);
      SunmiPrinter.printerText('\n*** Thank You ***\n');
      SunmiPrinter.lineWrap(4);
    } catch (error) {
      console.log('Sunmi Invoice Print Error:', error);
    }
  };
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

  const navigation = useNavigation();

  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [salesMan, setSalesMan] = useState('');

  const [showStatusLogPop, setShowStatusLogPop] = useState(false);
  const [orderIdPop, setOrderIdPop] = useState(null);

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [expandedItems, setExpandedItems] = useState([]);

  const [deptNo, setDeptNo] = useState('');

  const [showLoader, setShowLoader] = useState(false);

  const [listData, setListData] = useState(null);

  const [apiError, setApiError] = useState(false);

  const [searchInv, setSearchInv] = useState('');

  const [searchError, setSearchError] = useState('');

  const [itemList, setItemList] = useState('');

  const [itemListBluetooth, setItemListBluetooth] = useState('');

  const [loginUser, setLoginUser] = useState('');

  const [pdfUri, setPdfUri] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCustomerAddress, setSelectedCustomerAddress] = useState('');
  const [selectedInvoiceNo, setSlelecetdInvNo] = useState('');
  const [selectedInvDate, setSelectedInvDate] = useState('');

  const [selectedRadio, setSelectedRadio] = useState('');

  const [terms, setTerms] = useState('');

  const [discountedTotal, setDiscountedTotal] = useState('');
  const [discount, setDiscount] = useState(0);

  const [subTotal, setSubTotal] = useState('');

  const [trn, setTrn] = useState('');

  const [payment, setPayment] = useState('CASH-B2B');

  const [showPrintButtonLoader, setShowPrintButtonLoader] = useState(false);
  const [showPrintButtonLoaderBluetooth, setShowPrintButtonLoaderBluetooth] =
    useState(false);

  useEffect(() => {
    if (discount > 0) {
      const newTotal = subTotal - discount;

      setDiscountedTotal(newTotal);
    }
  }, [discount]);

  const getTRNnumber = companyCodeToCheck => {
    switch (companyCodeToCheck) {
      case 'MALBAR':
        return '100335207500003';
      case 'PREMIER':
        return '10027835690000';
      case 'ICELAB':
        return '104112430400003';
      case 'ICELAB_TEST':
        return '104112430400003';
      case 'MESHARI':
        return '100449215100003';
      default:
        return '-';
    }
  };
  const getCompanyname = companyCodeToCheck => {
    switch (companyCodeToCheck) {
      case 'PREMIER':
        return 'PREMIER AUTO PARTS LLC';
      case 'MESHARI':
        return 'MESHARI FOODSTUFF TRADING LLC';
      case 'ICELAB':
        return 'THE ICE LAB MANUFACTURING LLC';
      default:
        return '-';
    }
  };

  // pdfCode

  // pdfCode

  const resultClosePress = () => {
    setSelectedCustomer('');
    setSelectedCustomerAddress('');
    setSlelecetdInvNo('');
    setLoginUser('');
    setItemList('');
    setTerms('');
    setSubTotal(0);
    setDiscount(0);

    setShowPrintButtonLoader(false);
  };

  useEffect(() => {
    if (itemList && itemList.length > 0) {
      const totalLineCost = itemList.reduce(
        (acc, item) => acc + item.LINE_TOTAL,
        0,
      );
      console.log('Total Line Cost:', totalLineCost);
      setSubTotal(totalLineCost);
      // You can set this totalLineCost to state if needed
    }
  }, [itemList]);

  // getPrintItemDetails

  const fetchItemList = async item => {
    console.log('item after print button clicked >>', item);

    setShowPrintButtonLoader(true);
    try {
      setSelectedCustomer(item.CUSTOMER);
      setSelectedCustomerAddress(item.ADDRESS);
      setSlelecetdInvNo(item.INVNO);
      setLoginUser(item.USER);

      // Convert and format the date
      const formattedDate = format(new Date(item.INV_DATE), 'dd/MM/yyyy');
      setSelectedInvDate(formattedDate);
      console.log(
        'fetchItemList',
        `${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`,
      );
      const response = await axios.get(
        `${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`,
      );

      if (response.status === 200) {
        setItemList(response.data);
        setTerms(response.data[0].terms.trim().toUpperCase());
        // setSubTotal(response.data[0].inv_total)
        setDiscount(response.data[0].disc_amt);
        setTrn(response.data[0].TRN);
        console.log('trn from invoice list ', response.data[0].TRN);

        // setShowPrintButtonLoader(false)
      }
    } catch (error) {
      console.log('fetchItemListError', error);
      setError(error);
      setShowPrintButtonLoader(false);
    }
  };

  const fetchItemListBLuetooth = async item => {
    console.log('item after print button clicked >>', item);

    setShowPrintButtonLoaderBluetooth(true);
    try {
      setSelectedCustomer(item.CUSTOMER);
      setSelectedCustomerAddress(item.ADDRESS);
      setSlelecetdInvNo(item.INVNO);
      setLoginUser(item.USER);

      // Convert and format the date
      const formattedDate = format(new Date(item.INV_DATE), 'dd/MM/yyyy');
      setSelectedInvDate(formattedDate);
      console.log(
        'fetchItemList',
        `${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`,
      );
      const response = await axios.get(
        `${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`,
      );

      if (response.status === 200) {
        setItemListBluetooth(response.data);
        setTerms(response.data[0].terms.trim().toUpperCase());
        // setSubTotal(response.data[0].inv_total)
        setDiscount(response.data[0].disc_amt);
        setTrn(response.data[0].TRN);
        console.log('trn from invoice list ', response.data[0].TRN);
      }

      setShowPrintButtonLoaderBluetooth(false);
    } catch (error) {
      console.log('fetchItemListError', error);
      setError(error);
      setShowPrintButtonLoaderBluetooth(false);
    }
  };

  useEffect(() => {
    if (itemList && subTotal) {
      generatePDF({
        getCompanyname,
        getLetterheadBase64,
        cmpcode,
        selectedCustomer,
        selectedCustomerAddress,
        itemList,
        getTRNnumber,
        subTotal,
        toWords,
        selectedInvoiceNo,
        selectedInvDate,
        terms,
        discount,
        discountedTotal,
        loginUser,
        setPdfUri,
        resultClosePress,
      });

      // navigation.navigate("PrintSmallDevice")
    }
  }, [itemList, subTotal]);

  useEffect(() => {
    if (itemListBluetooth) {
      printBt();
    }
  }, [itemListBluetooth]);

  // const subTotal = itemList && itemList.length > 0 && itemList.reduce((sum, item) => sum + (item.line_total || 0), 0)

  // console.log('subTotal', subTotal)

  // getPrintItemDetails

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

  const fetchAsyncUser = async () => {
    const salesMan = await AsyncStorage.getItem('sales_man');

    const deptno = await AsyncStorage.getItem('DEPTNO');

    const appUrl = await AsyncStorage.getItem('appUrl');

    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    // const locusername = await AsyncStorage.getItem('loginUserName')

    // if (locusername) {
    //     setLoginUser(locusername)
    // }

    if (parsedUserDataArray) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim());
    }

    if (appUrl) {
      setAppUrl(appUrl);
    }

    if (salesMan === '----') {
      const salesManDrop = await AsyncStorage.getItem('sales_man_drop');
      setSalesMan(salesManDrop);
    } else {
      setSalesMan(salesMan);
    }
    if (deptno) {
      setDeptNo(deptno);
    } else {
      setDeptNo('----');
    }
  };

  useEffect(() => {
    fetchAsyncUser();
  }, []);

  useEffect(() => {
    if (salesMan && deptNo && appUrl && cmpcode) {
      setShowLoader(true);
      const fetchList = async () => {
        try {
          console.log(
            `${appUrl}SalesInvoice/${cmpcode}/invoicelist/${deptNo}/${salesMan}/-`,
          );
          const response = await axios.get(
            `${appUrl}SalesInvoice/${cmpcode}/invoicelist/${deptNo}/${salesMan}/-`,
          );

          // console.log(response.data)

          if (response.status === 200) {
            setListData(response.data);
            setData(response.data);
            setShowLoader(false);
          }
          setShowLoader(false);
        } catch (error) {
          console.log('fetchList', error);
          setApiError('Some Error Occured');
          setShowLoader(false);
        }
      };

      fetchList();
    }
  }, [salesMan, deptNo, appUrl, cmpcode]);

  const fetchAppUrl = async () => {
    const appUrl = await AsyncStorage.getItem('appUrl');
    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    if (parsedUserDataArray) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim());
    }
    if (appUrl) {
      setAppUrl(appUrl);
    }
  };

  const fetchSalesMan = async () => {
    const salesMan = await AsyncStorage.getItem('sales_man');

    if (salesMan === '----') {
      const salesManDrop = await AsyncStorage.getItem('sales_man_drop');
      setSalesMan(salesManDrop);
    } else {
      setSalesMan(salesMan);
    }
  };

  const formattedDate = date => {
    return format(new Date(date), 'dd-MM-yy');
  };

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
    fetchSalesMan();
    fetchAppUrl();
  });

  const requestBluetoothPermissions = async () => {
    // If scanning is not needed, you can skip this check for older Android
    if (Platform.OS === 'android') {
      let permissionsToRequest = [];

      // Android 12 (API 31) and higher require the new runtime permissions
      if (Platform.Version >= 31) {
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        );
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        );
      } else {
        // Older Android versions require location for discovery/scanning
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      }

      if (permissionsToRequest.length > 0) {
        try {
          const results = await PermissionsAndroid.requestMultiple(
            permissionsToRequest,
          );

          // Check if all requested permissions were granted
          const allGranted = permissionsToRequest.every(
            permission =>
              results[permission] === PermissionsAndroid.RESULTS.GRANTED,
          );

          if (allGranted) {
            console.log('All required Bluetooth permissions granted');
            return true;
          } else {
            console.log(
              'Not all required Bluetooth permissions granted:',
              results,
            );
            return false;
          }
        } catch (err) {
          console.warn('Bluetooth permissions error:', err);
          return false;
        }
      }
    }
    // For other platforms (or if no Android-specific runtime permissions were needed), assume success.
    return true;
  };

  const printBt = async () => {
    const hasPermission = await requestBluetoothPermissions();

    console.log('Has permission', hasPermission);

    if (!hasPermission) {
      console.log('Cannot print: Bluetooth Connect permission denied.');
      return;
    }

    try {
      const bluetoothDeviceList =
        await ThermalPrinterModule.getBluetoothDeviceList();

      console.log('BluetoothDevice list -----------', bluetoothDeviceList);

      // Check if devices exist
      if (!bluetoothDeviceList || bluetoothDeviceList.length === 0) {
        console.log('No Bluetooth printers found.');
        return;
      }

      const formattedData = setFormatTextForBluetooth();
      console.log('Formatted Data', formattedData);
      if (!formattedData?.text) {
        console.log('Print data is empty.');
        return;
      }

      await ThermalPrinterModule.printBluetooth({
        payload: formattedData.text,
      });

      console.log('Print completed successfully');
    } catch (err) {
      console.log('err bt print', err?.message || err);
    }
  };

  // console.log('prevOrder', data)

  // console.log('listData', listData && listData[0])

  console.log('itemList', itemList && itemList[0]);

  // console.log('selectedRadio', selectedRadio)

  console.log('terms', terms);

  console.log('subTotal', subTotal);

  console.log('discount', discount);

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

        {showLoader && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        {!showLoader && apiError && !listData && (
          <View>
            <Text style={styles.ErrorText}>{apiError}</Text>
          </View>
        )}
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
          style={{width: '94%'}}
          renderItem={({item}) => (
            <ScrollView style={styles.PreviousOrderWrap}>
              {/*  */}

              {/* <View style={styles.StockListItem} onPress={() => navigation.navigate('OrderDetails', { orderId: item.so_no })}> */}
              <View style={styles.StockListItem}>
                <View style={styles.CustomerListCont}>
                  <View style={styles.CustomerImgWrap}>
                    <Image
                      style={styles.CustomerImage}
                      source={require('../images/listWhite.png')}
                    />
                  </View>

                  <View style={styles.CustomerListMid}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}>
                      <Text style={[styles.StockListDescText, {width: '75%'}]}>
                        {item.CUSTOMER}
                      </Text>
                      <Text
                        style={[
                          styles.StockListDescTextSmall,
                          {color: '#30B3A4', fontFamily: 'Lexend-Regular'},
                        ]}>
                        {item.AMOUNT}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        paddingVertical: 6,
                      }}>
                      <Text style={styles.StockListDescTextSmall}>
                        {item.INVNO}
                      </Text>
                      <View
                        style={{
                          marginLeft: 24,
                          flexDirection: 'row',
                        }}>
                        {/* <Text style={[styles.StockListDescTextSmall,]}>Inv Date:</Text> */}
                        <Text style={[styles.StockListDescTextSmall]}>
                          {formattedDate(item.INV_DATE)}
                        </Text>
                      </View>
                      <View
                        style={{
                          marginLeft: 24,
                          flexDirection: 'row',
                        }}>
                        {/* <Text style={[styles.StockListDescTextSmall,]}>Inv Date:</Text> */}
                        <Text style={[styles.StockListDescTextSmall]}>
                          {item['SALES MAN']}
                        </Text>
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

                <View
                  style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <TouchableOpacity
                    style={[styles.PrintAcceptButton]}
                    onPress={() => fetchItemList(item)}>
                    {showPrintButtonLoader &&
                    item.INVNO === selectedInvoiceNo ? (
                      <ActivityIndicator color={'white'} />
                    ) : (
                      <Text style={styles.PrintAcceptText}>Print</Text>
                    )}
                  </TouchableOpacity>

                  {cmpcode?.toUpperCase().trim() == 'ICELAB' && (
                    <TouchableOpacity
                      style={[styles.PrintAcceptButtonBT]}
                      onPress={() => fetchItemListBLuetooth(item)}>
                      {showPrintButtonLoaderBluetooth &&
                      item.INVNO === selectedInvoiceNo ? (
                        <ActivityIndicator color={'white'} />
                      ) : (
                        <Text style={styles.PrintAcceptText}>Print BT </Text>
                      )}
                    </TouchableOpacity>
                  )}
                  {cmpcode?.toUpperCase().trim() === 'ICUP' ||
                  cmpcode?.toUpperCase().trim() === 'ICELAB_TEST' ? (
                    <TouchableOpacity
                      style={[
                        styles.PrintAcceptButton,
                        {backgroundColor: '#FF6B00', marginLeft: 10},
                      ]}
                      onPress={async () => {
                        try {
                          setShowPrintButtonLoaderBluetooth(true);

                          // Call the API
                          const response = await axios.get(
                            `${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`,
                          );

                          if (
                            response.status === 200 &&
                            response.data.length > 0
                          ) {
                            // Set States
                            setItemListBluetooth(response.data);
                            setSelectedCustomer(item.CUSTOMER);
                            setSelectedCustomerAddress(item.ADDRESS);
                            setSlelecetdInvNo(item.INVNO);
                            setLoginUser(item.USER);

                            // 🔹 BRAND SPECIFIC LOGIC
                            if (
                              cmpcode?.toUpperCase().trim() === 'ICELAB_TEST'
                            ) {
                              // Use the SM version for ICELAB
                              printSunmiInvoiceSM(response.data);
                            } else {
                              // Use the standard version for ICUP
                              printSunmiInvoice(response.data);
                            }
                          } else {
                            console.log(
                              'No invoice data found for Sunmi print.',
                            );
                          }
                        } catch (error) {
                          console.log(
                            'Error fetching invoice for Sunmi print:',
                            error,
                          );
                        } finally {
                          setShowPrintButtonLoaderBluetooth(false);
                        }
                      }}>
                      {showPrintButtonLoaderBluetooth &&
                      item.INVNO === selectedInvoiceNo ? (
                        <ActivityIndicator color={'white'} />
                      ) : (
                        <Text style={styles.PrintAcceptText}>Print SUNMI</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
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

        {data.length > 0 && !loading && (
          <View style={styles.pagination}>
            {currentPage !== 1 && (
              <TouchableOpacity
                onPress={handlePreviousPage}
                disabled={currentPage === 1}
                style={styles.pageButton}>
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </Text>
            {currentPage !== totalPages && (
              <TouchableOpacity
                onPress={handleNextPage}
                disabled={currentPage === totalPages}
                style={styles.pageButton}>
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {showStatusLogPop && (
        <StatusLogPop
          orderIdPop={orderIdPop}
          setShowStatusLogPop={setShowStatusLogPop}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  HomeWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    width: '100%',
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
    height: Dimensions.get('window').height - 70,
  },
  HomeTextCont: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  HomeText: {
    fontSize: 18,
    color: 'black',
    borderBottomColor: 'gold',
    borderBottomWidth: 2,
    marginTop: 6,
    marginLeft: 6,
    paddingBottom: 8,
    fontFamily: 'Lexend-Bold',
  },
  PreviousOrderWrap: {
    width: '100%',
    flexDirection: 'column',
    // alignItems: 'center',
    marginTop: 3,
  },
  PreviousOrderCard: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    marginBottom: 8,
  },
  OrderNoText: {
    backgroundColor: '#ffbb00',
    padding: 6,
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 6,
    width: '20%',
  },
  CustomerNameText: {
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginVertical: 4,
  },
  StatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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
    marginLeft: 12,
  },
  OrderUpdatesWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  ViewStatusWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 4,
  },
  ViewStatusButton: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  ViewStatusText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'white',
  },
  EditPullWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  EditPullButton: {
    backgroundColor: '#8f8f8f',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 12,
    borderRadius: 4,
  },
  EditPullText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'white',
  },
  CardScroll: {
    width: '100%',
    alignItems: 'center',
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    marginBottom: 16,
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
    color: 'black',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  HeadIcon: {
    width: 25,
    height: 25,
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
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
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
    alignItems: 'center',
  },
  StockListCodeText: {
    fontFamily: 'Lexend-Light',
    color: '#2B2B2B',
  },
  PlusMinusImg: {
    width: 18,
    height: 18,
  },
  PlusMinusCont: {
    padding: 4,
    backgroundColor: '#EFEFEF',
  },

  StockItemDescCont: {
    paddingVertical: 8,
  },
  StockListDescText: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: '#4B5290',
  },
  QtyAvlQtyCont: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
  },
  QtyCont: {
    padding: 8,
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'orange',
  },
  QtyText: {
    fontFamily: 'Lexend-Light',
    // color: '#4B5290'
    color: 'black',
  },
  AvlText: {
    fontFamily: 'Lexend-Light',
    // color: '#8f6924'
    color: 'black',
  },
  DynamicPriceView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  PriceTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  PriceValueText: {
    fontFamily: 'Lexend-Regular',
    color: '#2B2B2B',
    marginLeft: 12,
  },

  CustomerListCont: {
    flexDirection: 'row',
    width: '100%',
    // justifyContent: 'space-between',
    alignItems: 'center',
  },
  CustomerImage: {
    width: 30,
    height: 30,
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
    marginLeft: 12,
  },
  StockListDescText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: '#2b2b2b',
  },
  StockListDescTextSmall: {
    fontSize: 14,
    fontFamily: 'Lexend-Light',
    color: '#2b2b2b',
  },
  CustomerListRight: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
    marginLeft: 10,
  },
  PrintAcceptText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Lexend-Regular',
  },
});

export default InvoiceList;
