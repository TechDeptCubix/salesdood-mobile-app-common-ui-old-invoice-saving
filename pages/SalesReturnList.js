import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import HeaderUiNew from './HeaderUiNew';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';
import SunmiPrinter, {AlignValue} from '@heasy/react-native-sunmi-printer';
import {ICUP_LOGO_BASE64} from '../images/icup_logo';
import {generateSalesReturnPDF} from './SalesReturnPdf';

const ITEMS_PER_PAGE = 20;

const SalesReturnList = () => {
  const navigation = useNavigation();

  // ─── State Management ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesMan, setSalesMan] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [cmpcode, setCmpCode] = useState('');
  const [deptNo, setDeptNo] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [selectedReturnNo, setSelectedReturnNo] = useState('');
  const [showPrintButtonLoader, setShowPrintButtonLoader] = useState(false);
  const [showSunmiLoader, setShowSunmiLoader] = useState(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getTRNnumber = code => {
    const trns = {
      MALBAR: '100335207500003',
      PREMIER: '10027835690000',
      ICELAB: '104112430400003',
      MESHARI: '100449215100003',
      ICUP: '104173070400003',
    };
    return trns[code] || '-';
  };

  const getCompanyname = code => {
    const names = {
      PREMIER: 'PREMIER AUTO PARTS LLC',
      MESHARI: 'MESHARI FOODSTUFF TRADING LLC',
      ICELAB: 'THE ICE LAB MANUFACTURING LLC',
      ICUP: 'ICECUP FOOD INDUSTRIES L.L.C',
    };
    return names[code] || code || '-';
  };

  const formattedDate = date => {
    try {
      return format(new Date(date), 'dd-MM-yy');
    } catch {
      return date;
    }
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // ─── Async Storage ────────────────────────────────────────────────────────
  const fetchAsyncUser = async () => {
    try {
      const sm = await AsyncStorage.getItem('sales_man');
      const deptno = await AsyncStorage.getItem('DEPTNO');
      const url = await AsyncStorage.getItem('appUrl');
      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsedUserDataArray =
        (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

      if (parsedUserDataArray.length > 0) {
        setCmpCode(parsedUserDataArray[0].cmpcode.trim());
      }
      if (url) setAppUrl(url);

      if (sm === '----') {
        const smDrop = await AsyncStorage.getItem('sales_man_drop');
        setSalesMan(smDrop);
      } else {
        setSalesMan(sm);
      }

      setDeptNo(deptno || '----');
    } catch (err) {
      console.log('fetchAsyncUser error', err);
    }
  };

  useEffect(() => {
    fetchAsyncUser();
  }, []);

  useEffect(() => {
    if (appUrl && cmpcode && deptNo) {
      const fetchList = async () => {
        setShowLoader(true);
        setApiError(false);
        try {
          const cleanCmp = cmpcode.toLowerCase().trim();
          const url = `${appUrl}CRMDocListView/${cleanCmp}/SRET/ALL/-/-/-/-/${deptNo}/1/100`;
          const response = await axios.get(url);
          if (response.status === 200) {
            setData(response.data);
          }
        } catch (error) {
          setApiError('Failed to load Sales Returns');
        } finally {
          setShowLoader(false);
          setLoading(false);
        }
      };
      fetchList();
    }
  }, [appUrl, cmpcode, deptNo]);

  // ─── Manual VAT & Total Logic ─────────────────────────────────────────────
  const calculateTotals = items => {
    let totalExcl = 0;
    let totalVat = 0;

    const processedItems = items.map(i => {
      const qty = parseFloat(i.QTY) || 0;
      const price = parseFloat(i.PRICE) || 0;
      const lineExcl = qty * price;
      const lineVat = lineExcl * 0.05; // 5% VAT
      const lineTotal = lineExcl + lineVat;

      totalExcl += lineExcl;
      totalVat += lineVat;

      return {
        ...i,
        LINE_VAT: lineVat,
        LINE_TOTAL_INCL: lineTotal,
      };
    });

    return {
      processedItems,
      totalExcl,
      totalVat,
      grandTotal: totalExcl + totalVat,
    };
  };

  const printSunmiReturn = async item => {
    try {
      setShowSunmiLoader(true);
      setSelectedReturnNo(item.SR_NO);

      const lineItemsRaw = data.filter(i => i.SR_NO === item.SR_NO);
      const {processedItems, totalExcl, totalVat, grandTotal} =
        calculateTotals(lineItemsRaw);

      if (!processedItems || processedItems.length === 0) return;

      SunmiPrinter.printerInit();

      // Logo
      try {
        const cleanBase64 = ICUP_LOGO_BASE64.replace(
          /^data:image\/[a-z]+;base64,/,
          '',
        );
        SunmiPrinter.setAlignment(AlignValue.CENTER);
        await SunmiPrinter.printBitmap(cleanBase64, 384);
        SunmiPrinter.lineWrap(1);
      } catch (e) {}

      // Header Text
      SunmiPrinter.setAlignment(AlignValue.CENTER);
      SunmiPrinter.setFontSize(32);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText('SALES RETURN\n');
      SunmiPrinter.lineWrap(1);

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
      SunmiPrinter.lineWrap(1);

      // Info Section
      SunmiPrinter.setAlignment(AlignValue.LEFT);
      const infoWeights = [200, 360];
      SunmiPrinter.printColumnsString(
        ['Return No:', item.SR_NO],
        infoWeights,
        [0, 2],
      );
      SunmiPrinter.printColumnsString(
        ['Customer:', item.CUSTOMER || item.CUST_ACC],
        infoWeights,
        [0, 2],
      );
      SunmiPrinter.printColumnsString(
        ['Date:', formattedDate(item.SR_DATE)],
        infoWeights,
        [0, 2],
      );
      SunmiPrinter.printColumnsString(
        ['Inv No:', item.INV_NO.toString()],
        infoWeights,
        [0, 2],
      );

      // --- Table Start ---
      SunmiPrinter.setFontSize(20); // Reset to standard size for separators
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText(
        '--------------------------------------------------------\n',
      );

      const tableWeights = [240, 40, 90, 70, 120];
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.setFontSize(18);
      SunmiPrinter.printColumnsString(
        ['Description', 'Qty', 'Price', 'VAT', 'Total'],
        tableWeights,
        [0, 1, 2, 2, 2],
      );

      SunmiPrinter.setFontSize(20); // Reset to standard size for separators
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText(
        '--------------------------------------------------------\n',
      );

      // Items
      processedItems.forEach(i => {
        SunmiPrinter.setFontSize(18); // Use table font size for items
        SunmiPrinter.printColumnsString(
          [
            i.DESC || i.CODE,
            i.QTY.toString(),
            parseFloat(i.PRICE).toFixed(2),
            i.LINE_VAT.toFixed(2),
            i.LINE_TOTAL_INCL.toFixed(2),
          ],
          tableWeights,
          [0, 1, 2, 2, 2],
        );
      });

      SunmiPrinter.setFontSize(20); // Reset to standard size for separators
      SunmiPrinter.printerText(
        '--------------------------------------------------------\n',
      );

      // Totals
      const totalWeights = [340, 220];
      SunmiPrinter.setFontSize(20);
      SunmiPrinter.printColumnsString(
        ['Total (Excl):', totalExcl.toFixed(2)],
        totalWeights,
        [0, 2],
      );
      SunmiPrinter.printColumnsString(
        ['VAT Amount:', totalVat.toFixed(2)],
        totalWeights,
        [0, 2],
      );

      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.setFontSize(26);
      SunmiPrinter.printColumnsString(
        ['GRAND TOTAL:', grandTotal.toFixed(2) + ' AED'],
        totalWeights,
        [0, 2],
      );

      SunmiPrinter.setFontSize(20);
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.setAlignment(AlignValue.CENTER);
      SunmiPrinter.printerText('\n*** Sales Return Receipt ***\n');
      SunmiPrinter.lineWrap(4);
    } catch (error) {
      console.log('Sunmi Error:', error);
    } finally {
      setShowSunmiLoader(false);
      setSelectedReturnNo('');
    }
  };
  const printPdfReturn = async item => {
    try {
      setShowPrintButtonLoader(true);
      setSelectedReturnNo(item.SR_NO);
      const lineItemsRaw = data.filter(i => i.SR_NO === item.SR_NO);
      const {processedItems} = calculateTotals(lineItemsRaw);

      await generateSalesReturnPDF({
        cmpcode,
        returnNo: item.SR_NO,
        returnDate: formattedDate(item.SR_DATE),
        customerName: item.CUSTOMER || item.CUST_ACC,
        salesMan: item.SALES_MAN,
        itemList: processedItems,
        getCompanyname,
        getTRNnumber,
        resultClosePress: () => {
          setShowPrintButtonLoader(false);
          setSelectedReturnNo('');
        },
      });
    } catch (error) {
      setShowPrintButtonLoader(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.HomeWrap}>
      <HeaderUiNew name={'Sales Return'} />
      <View style={styles.HomeCont}>
        {showLoader ? (
          <ActivityIndicator size="large" color="#5A55CA" />
        ) : apiError ? (
          <Text style={styles.ErrorText}>{apiError}</Text>
        ) : (
          <FlatList
            data={getPaginatedData()}
            keyExtractor={(item, index) => item.SR_NO + index}
            style={{width: '94%'}}
            renderItem={({item}) => (
              <View style={styles.StockListItem}>
                <View style={styles.CustomerListCont}>
                  <View style={styles.CustomerImgWrap}>
                    <Image
                      style={styles.CustomerImage}
                      source={require('../images/listWhite.png')}
                    />
                  </View>
                  <View style={styles.CustomerListMid}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.CustomerTitle} numberOfLines={1}>
                        {item.CUSTOMER || `Account: ${item.CUST_ACC}`}
                      </Text>
                      <Text style={styles.AmountText}>
                        {parseFloat(item.AMOUNT).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.rowAlignCenter}>
                      <Text style={styles.ReturnBadge}>#{item.SR_NO}</Text>
                      <Text style={styles.SubText}>
                        {formattedDate(item.SR_DATE)}
                      </Text>
                      <Text style={styles.SubText}>Inv: {item.INV_NO}</Text>
                    </View>
                    <Text style={[styles.SubText, {marginTop: 4}]}>
                      Salesman: {item.SALES_MAN}
                    </Text>
                  </View>
                </View>

                <View style={styles.ActionRow}>
                  <TouchableOpacity
                    style={styles.BtnPdf}
                    onPress={() => printPdfReturn(item)}>
                    {showPrintButtonLoader &&
                    item.SR_NO === selectedReturnNo ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.BtnText}>PDF</Text>
                    )}
                  </TouchableOpacity>

                  {cmpcode?.toUpperCase() === 'ICUP' && (
                    <TouchableOpacity
                      style={styles.BtnSunmi}
                      onPress={() => printSunmiReturn(item)}>
                      {showSunmiLoader && item.SR_NO === selectedReturnNo ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={styles.BtnText}>Sunmi</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
        )}

        {data.length > 0 && !loading && (
          <View style={styles.pagination}>
            <TouchableOpacity
              onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              style={[
                styles.pageButton,
                {opacity: currentPage === 1 ? 0.5 : 1},
              ]}>
              <Text style={styles.pageButtonText}>Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </Text>
            <TouchableOpacity
              onPress={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
              style={[
                styles.pageButton,
                {opacity: currentPage === totalPages ? 0.5 : 1},
              ]}>
              <Text style={styles.pageButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  HomeWrap: {flex: 1, backgroundColor: '#EFEFEF'},
  HomeCont: {flex: 1, alignItems: 'center', paddingVertical: 12},
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rowAlignCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  StockListItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: '#DDD',
  },
  CustomerListCont: {flexDirection: 'row', alignItems: 'center'},
  CustomerImgWrap: {backgroundColor: 'grey', borderRadius: 50, padding: 8},
  CustomerImage: {width: 25, height: 25},
  CustomerListMid: {flex: 1, marginLeft: 12},
  CustomerTitle: {
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
    color: '#222',
    flex: 1,
  },
  AmountText: {fontSize: 14, fontFamily: 'Lexend-Bold', color: '#30B3A4'},
  ReturnBadge: {
    backgroundColor: '#F0F0FF',
    color: '#4B5290',
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 12,
  },
  SubText: {fontSize: 12, color: '#666', marginLeft: 8},
  ActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#EEE',
    paddingTop: 8,
  },
  BtnPdf: {
    backgroundColor: '#30B3A4',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  BtnSunmi: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  BtnText: {color: '#FFF', fontSize: 13, fontFamily: 'Lexend-Medium'},
  ErrorText: {color: 'red', marginTop: 20},
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    paddingVertical: 10,
  },
  pageButton: {padding: 8, backgroundColor: '#5A55CA', borderRadius: 5},
  pageButtonText: {color: '#FFF'},
  pageInfo: {color: '#333', fontFamily: 'Lexend-Regular'},
});

export default SalesReturnList;
