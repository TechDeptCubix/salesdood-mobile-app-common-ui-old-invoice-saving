import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Button,
  ScrollView,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {format} from 'date-fns';
import data from '../url/statement.json';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import SunmiPrinter from '@heasy/react-native-sunmi-printer';
const StatementPop = ({
  setShowStatementPop,
  privateKey,
  accountNo,
  appUrl,
  cmpcode,
  setSelectedStock,
  selectedStock,
}) => {
  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);
  const [fromData, setFromData] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
  const [toData, setToData] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [statementData, setStatementData] = useState(null);

  const [displayData, setDisplayData] = useState(null);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  const [showLoader, setShowLoader] = useState(false);

  const [errorText, setErrorText] = useState('');

  const [pdfUri, setPdfUri] = useState(null);

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

        .image_letterhead{
            width:99%;
            object-fit:contain;
        }
    </style>
</head>
<body>
    <div class="table-container">




 ${
   cmpcode.toLowerCase().trim() == 'soca'
     ? `<div>
    <img class="image_letterhead" src=${logoUri}
    </div>`
     : ''
 }

        <div class="statementHead">
            <div><h2>Statement of Account ${accountNo}</h2></div>
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
                    ${selectedStock.address1} ${selectedStock.address2} ${
      selectedStock.address3
    }
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
                    <th class="header-cell">DATE</th>
                    <th class="header-cell">TYPE</th>
                    <th class="header-cell">REF</th>
                    <th class="header-cell">DESCRIPTION</th>
                    <th class="header-cell">DEBIT</th>
                    <th class="header-cell">CREDIT</th>
                    <th class="header-cell">BALANCE</th>
                </tr>
            </thead>
            <tbody>
                ${
                  displayData &&
                  displayData
                    .map(
                      item => `
                    <tr class="table-row">
                        <td class="data-cell">${item.DATE.split('T')[0]}</td>
                        <td class="data-cell">${item.TYPE}</td>
                        <td class="data-cell">${item.REF}</td>
                        <td class="data-cell">${item.DESCRIPTION}</td>
                       <td class="data-cell">${new Intl.NumberFormat('en-US', {
                         minimumFractionDigits: 3,
                         maximumFractionDigits: 3,
                       }).format(item.DEBIT)}</td>
                       <td class="data-cell">${new Intl.NumberFormat('en-US', {
                         minimumFractionDigits: 3,
                         maximumFractionDigits: 3,
                       }).format(item.CREDIT)}</td>
                       <td class="data-cell">${new Intl.NumberFormat('en-US', {
                         minimumFractionDigits: 3,
                         maximumFractionDigits: 3,
                       }).format(item.BALANCE)}</td>
                    </tr>
                `,
                    )
                    .join('')
                }
            </tbody>
        </table>
        <div class="total-values-wrap">
           <div class="total-cont">
                <div class="total-label">Total Debit</div>
                <div class="total-value-text">${
                  totalDebit &&
                  new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  }).format(totalDebit)
                }</div>
            </div>
            <div class="total-cont">
                <div class="total-label">Total Credit</div>
                <div class="total-value-text">${
                  totalCredit &&
                  new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  }).format(totalCredit)
                }</div>
            </div>
            <div class="total-cont">
                <div class="total-label">Total Balance</div>
                <div class="total-value-text">${
                  totalBalance &&
                  new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  }).format(totalBalance)
                }</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

    let options = {
      html: htmlContent2,
      fileName: 'statement',
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

  const handleFromDateConfirm = date => {
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

  const handleToDateConfirm = date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setToData(formattedDate);
    hideToDatePicker();
  };

  const fetchStatementData = async () => {
    setShowLoader(true);
    console.log(
      `${appUrl}Statement/${cmpcode}/STMT_ACC1/${accountNo}/-/${fromData}/${toData}`,
    );
    try {
      const result = await axios.get(
        `${appUrl}Statement/${cmpcode}/STMT_ACC1/${accountNo}/-/${fromData}/${toData}`,
      );
      setStatementData(result.data);
      console.log('fetchStatementData', result.data);
      setShowLoader(false);
    } catch (error) {
      console.log('fetchStatementDataError', error);
      setShowLoader(false);
      setErrorText('Some Error Occured,Please Try again Later');
    }
  };

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

        return {...entry, BALANCE: runningBalance};
      });

      setDisplayData(newData);
      setTotalDebit(debitTotal);
      setTotalCredit(creditTotal);
      setTotalBalance(debitTotal - creditTotal);
    } catch (error) {
      console.log('fetchRunningDataError', error);
    }
  };

  useEffect(() => {
    if (statementData) {
      fetchRunningData();
    }
  }, [statementData]);

  const goBack = () => {
    setSelectedStock(null);
    setShowStatementPop(false);
  };

  const formatNumber = (number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  };

  // console.log('privateKey', privateKey)
  console.log('statementData', statementData);
  console.log('displayData', displayData);
  console.log('debitTotal', totalDebit);
  console.log('creditTotal', totalCredit);
  console.log('totalBalance', totalBalance);
  console.log('jsonfiledata', data);

  console.log('selectedStock', selectedStock);

  console.log('appUrl', appUrl);
  const handleSunmiPrint = async () => {
    try {
      // 1. Prepare Printer
      await SunmiPrinter.printerInit();

      // 2. Print Header
      await SunmiPrinter.setAlignment(1); // Center
      await SunmiPrinter.setFontSize(24);
      await SunmiPrinter.printText('ICECUP FOOD INDUSTRIES\n');
      await SunmiPrinter.setFontSize(20);
      await SunmiPrinter.printText('Statement of Accounts\n');
      await SunmiPrinter.printText(`Period: ${fromData} to ${toData}\n`);
      await SunmiPrinter.printText('--------------------------------\n');

      // 3. Table Header
      await SunmiPrinter.setAlignment(0); // Left
      // Sunmi printColumnsText: [Array of strings], [Array of widths], [Array of alignments]
      // Total width for Sunmi is usually 32 or 48 characters
      await SunmiPrinter.printColumnsText(
        ['Date', 'Ref', 'Amount'],
        [12, 10, 10],
        [0, 0, 2],
      );
      await SunmiPrinter.printText('--------------------------------\n');

      // 4. Print Rows
      for (const item of displayData) {
        const date = item.DATE.split('T')[0];
        const ref = item.REF || '-';
        const amount = formatNumber(
          item.DEBIT > 0 ? item.DEBIT : -item.CREDIT,
          3,
        );

        await SunmiPrinter.printColumnsText(
          [date, ref, amount],
          [12, 10, 10],
          [0, 0, 2],
        );
      }

      // 5. Print Totals
      await SunmiPrinter.printText('--------------------------------\n');
      await SunmiPrinter.setAlignment(2); // Right
      await SunmiPrinter.printText(
        `Total Debit: ${formatNumber(totalDebit, 3)}\n`,
      );
      await SunmiPrinter.printText(
        `Total Credit: ${formatNumber(totalCredit, 3)}\n`,
      );
      await SunmiPrinter.setFontSize(24);
      await SunmiPrinter.printText(
        `Balance: ${formatNumber(totalBalance, 3)}\n`,
      );

      // 6. Feed paper and cut
      await SunmiPrinter.lineFeed(3);
    } catch (error) {
      console.error('Sunmi Print Error:', error);
      alert('Printer error: Make sure this is a Sunmi device.');
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {/* 1. HEADER (Fixed) */}
        <View style={styles.HomeTextCont}>
          <TouchableOpacity
            style={styles.SettingsWrap}
            onPress={() => goBack()}>
            <Image
              style={styles.HeadIcon}
              source={require('../images/lftArr.png')}
            />
          </TouchableOpacity>
          <Text style={styles.HomeText}>Statement of Accounts</Text>
        </View>

        {/* 2. FILTERS (Fixed - This ensures they are always clickable) */}
        <View style={styles.FromToDateButtonWrap}>
          <View style={styles.DateButtonWrap}>
            <TouchableOpacity
              style={styles.DetailsButton}
              onPress={showFromDatePicker}>
              <Icon name="calendar-today" size={18} color="#333" />
              <Text style={styles.DetailsText}>
                {fromData ? fromData : 'Select From Date'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.DateButtonWrap}>
            <TouchableOpacity
              style={styles.DetailsButton}
              onPress={showToDatePicker}>
              <Icon name="calendar-today" size={18} color="#333" />
              <Text style={styles.DetailsText}>
                {toData ? toData : 'Select To Date'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.ViewButton}
            onPress={() => fetchStatementData()}>
            <Text style={styles.ViewText}>View</Text>
          </TouchableOpacity>

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
        </View>

        {/* 3. SCROLLABLE CONTENT (Flex: 1 makes this take up the middle space) */}
        <View style={{flex: 1}}>
          {showLoader && (
            <ActivityIndicator
              size="large"
              color="#1A6CF6"
              style={{marginTop: 20}}
            />
          )}
          {errorText && <Text style={styles.ErrorText}>{errorText}</Text>}

          {displayData && displayData.length > 0 && (
            <ScrollView horizontal={true}>
              <View style={styles.TableContainer}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                  <Text style={[styles.headerCell, {borderTopLeftRadius: 4}]}>
                    DATE
                  </Text>
                  <Text style={styles.headerCell}>TYPE</Text>
                  <Text style={styles.headerCell}>REF</Text>
                  <Text style={styles.headerCell}>DESCRIPTION</Text>
                  <Text style={styles.headerCell}>DEBIT</Text>
                  <Text style={styles.headerCell}>CREDIT</Text>
                  <Text style={[styles.headerCell, {borderTopRightRadius: 4}]}>
                    BALANCE
                  </Text>
                </View>

                {/* Vertical Scroll for Table Rows ONLY */}
                <ScrollView nestedScrollEnabled={true}>
                  {displayData.map((item, index) => (
                    <View key={index.toString()} style={styles.tableRow}>
                      <Text style={styles.dataCell}>
                        {item.DATE.split('T')[0]}
                      </Text>
                      <Text style={styles.dataCell}>{item.TYPE}</Text>
                      <Text style={styles.dataCell}>{item.REF}</Text>
                      <Text style={styles.dataCell}>{item.DESCRIPTION}</Text>
                      <Text style={styles.dataCell}>
                        {formatNumber(item.DEBIT, 3)}
                      </Text>
                      <Text style={styles.dataCell}>
                        {formatNumber(item.CREDIT, 3)}
                      </Text>
                      <Text style={styles.dataCell}>
                        {formatNumber(item.BALANCE, 3)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          )}
        </View>

        {/* 4. FIXED FOOTER (Totals and PDF always at bottom right) */}
        {displayData && displayData.length > 0 && (
          <View style={styles.FixedFooter}>
            <View style={styles.TotalValuesWrap}>
              <View style={styles.TotalCont}>
                <Text style={styles.TotalLabel}>Total Debit</Text>
                <Text style={styles.TotalValueText}>
                  {formatNumber(totalDebit, 3)}
                </Text>
              </View>
              <View style={styles.TotalCont}>
                <Text style={styles.TotalLabel}>Total Credit</Text>
                <Text style={styles.TotalValueText}>
                  {formatNumber(totalCredit, 3)}
                </Text>
              </View>
              <View style={styles.TotalCont}>
                <Text style={[styles.TotalLabel, {color: '#1A6CF6'}]}>
                  Total Balance
                </Text>
                <Text style={[styles.TotalValueText, {color: '#1A6CF6'}]}>
                  {formatNumber(totalBalance, 3)}
                </Text>
              </View>
            </View>

            <View style={styles.PDFWrap}>
              <TouchableOpacity
                style={styles.PDFButtonBlue}
                onPress={() => generatePDF()}>
                <Text style={styles.PDFText}>GENERATE PDF</Text>
              </TouchableOpacity>
            </View>
            {/* <TouchableOpacity
              style={styles.PrintButtonGreen}
              onPress={() => handleSunmiPrint()}>
              <Icon name="print" size={18} color="white" />
              <Text style={styles.ButtonText}>PRINT</Text>
            </TouchableOpacity> */}
          </View>
        )}
      </View>
    </View>
  );
};

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
    backgroundColor: 'white',
    borderRadius: 5,
    width: '95%',
    height: '90%', // Use height instead of minHeight/maxHeight for layout stability
  },

  HomeTextCont: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#DCDBDB',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  HomeText: {
    fontSize: 18,
    color: '#1A6CF6',
    // borderBottomColor: 'gold',
    // borderBottomWidth: 2,
    marginTop: 6,
    marginLeft: 6,
    paddingBottom: 8,
    fontFamily: 'Lexend-Regular',
  },
  SettingsWrap: {
    // backgroundColor: '#189A2E',
    // backgroundColor: 'red',
    // borderRadius: 50,
    padding: 6,
  },
  HeadIcon: {
    width: 20,
    height: 20,
  },
  FixedFooter: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#dbdbdb',
    backgroundColor: '#fff',
    alignItems: 'flex-end', // Pushes everything to the right
  },
  TotalValuesWrap: {
    width: '100%',
    alignItems: 'flex-end', // Aligns the text to the right
  },
  TotalCont: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 2,
  },
  TotalLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: '#2b2b2b',
    marginRight: 10,
  },
  TotalValueText: {
    fontSize: 16,
    color: '#2b2b2b',
    fontFamily: 'Lexend-Bold',
    width: 120,
    textAlign: 'right',
  },
  // PDFWrap: {
  //   marginTop: 10,
  //   width: '100%',
  //   flexDirection: 'row',
  //   justifyContent: 'flex-end', // PDF button to the right
  // },
  PDFButtonBlue: {
    backgroundColor: '#1A6CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    elevation: 2,
  },
  FromToDateButtonWrap: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  DateButtonWrap: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#1A6CF6',
    paddingBottom: 8,
    fontFamily: 'Lexend-Regular',
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
    // width: '100%',
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
    // width: '100%',
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
    color: 'black',
    fontFamily: 'Lexend-Regular',
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
    paddingRight: 12,
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
    fontFamily: 'Lexend-Bold',
  },

  PDFWrap: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  PDFButton: {
    backgroundColor: '#1A6CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
  PDFText: {
    fontFamily: 'Lexend-Regular',
    color: 'white',
    fontSize: 14,
  },

  ErrorText: {
    fontSize: 16,
    color: 'red',
    fontFamily: 'Lexend-Bold',
  },

  DetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  DetailsText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  NoDataText: {
    color: 'red',
    padding: 20,
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
  },
});

export default StatementPop;
