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
import Header from './Header';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import StatusLogPop from '../popups/StatusLogPop';
import HeaderUiNew from './HeaderUiNew';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import {PermissionsAndroid, Platform} from 'react-native';
import {STARLINK_LOGO} from '../images/STARLINK_LOGO';
import {ALESSA_LOGO} from '../images/ALESSA_LOGO';

const QuotationList = () => {
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [salesMan, setSalesMan] = useState('');
  const [cmpName, setCmpName] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  const [showStatusLogPop, setShowStatusLogPop] = useState(false);
  const [orderIdPop, setOrderIdPop] = useState(null);

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [expandedItems, setExpandedItems] = useState([]);

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

  const fetchAppUrl = async () => {
    const storedAppUrl = await AsyncStorage.getItem('appUrl');
    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    const portNoData = await AsyncStorage.getItem('portNoData');
    if (portNoData) {
      try {
        const dataArray = JSON.parse(portNoData);
        if (dataArray[0]?.COMPNAME) {
          setCmpName(dataArray[0].COMPNAME);
        }
      } catch (_) {}
    }

    if (parsedUserDataArray && parsedUserDataArray.length > 0) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim());
    }
    if (storedAppUrl) {
      setAppUrl(storedAppUrl);
    }
  };

  // const fetchSalesMan = async () => {
  //     try {
  //         const salesMan = await AsyncStorage.getItem('sales_man')
  //         setSalesMan(salesMan)
  //     } catch (error) {
  //         console.error('Error fetchSalesMan:', error);
  //     }
  // }

  const fetchSalesMan = async () => {
    const storedSalesMan = await AsyncStorage.getItem('sales_man');

    if (storedSalesMan === '----') {
      const salesManDrop = await AsyncStorage.getItem('sales_man_drop');
      setSalesMan(salesManDrop);
    } else {
      setSalesMan(storedSalesMan);
    }
  };

  const fetchPreviousOrders = async () => {
    try {
      // const response = await axios.get(`${REACT_APP_BASE_URL}Sales_Order/Salesall/ALL`);
      // const response = await axios.get(`https://cubixweberp.com:208/api/Sales_Order/automax/Salesall/ALL`);

      const deptno = await AsyncStorage.getItem('DEPTNO');

      console.log(
        'previous quotation api url ======+++',
        `${appUrl}proposal/${cmpcode}/quoteprevious/${salesMan}/${deptno}`,
      );

      const response = await axios.get(
        `${appUrl}proposal/${cmpcode}/quoteprevious/${salesMan}/${deptno}`,
      );
      console.log('API RESPONSE --------', response.data);

      // console.log(`${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}`)

      // https://cubixweberp.com:208/api/Sales_Order/automax/previous/SHA01
      setData(response.data);
    } catch (err) {
      console.log('fetchPreviousOrdersError', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyDetails = code => {
    const c = (code || '').trim().toUpperCase();
    const companyMap = {
      ALESSA: {
        name: 'ALESSA INDUSTRIES',
        trn: '300062402100003',
        logo: ALESSA_LOGO,
      },
      ALESSA_TEST: {
        name: 'ALESSA INDUSTRIES',
        trn: '300062402100003',
        logo: ALESSA_LOGO,
      },
      STARLINK: {
        name: 'STARLINK COMMUNICATIONS',
        trn: '100456123400003',
        logo: STARLINK_LOGO,
      },
    };

    return (
      companyMap[c] || {
        name: cmpName || code || 'Company',
        trn: '-',
        logo: '',
      }
    );
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs storage access to save the PDF',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const generatePDF = async item => {
    if (isPrinting) return;
    setIsPrinting(true);
    await requestStoragePermission();

    try {
      const deptno = await AsyncStorage.getItem('DEPTNO');
      const res = await axios.get(
        `${appUrl}Proposal/${cmpcode}/QUOTEDETAILS/${item['QUOT NO']}/${deptno}`,
      );
      const items = res.data;
      if (!items || items.length === 0) return;

      const companyDetails = getCompanyDetails(cmpcode);
      const firstItem = items[0];

      // CALCULATIONS
      const taxableAmount = items.reduce(
        (sum, i) =>
          sum + (parseFloat(i.qty || 0) * parseFloat(i.so_fccost || 0) || 0),
        0,
      );

      const VAT_RATE =
        cmpcode?.toUpperCase() === 'ALESSA' ||
        cmpcode?.toUpperCase() === 'ALESSA_TEST'
          ? 15
          : 5;

      const vatAmt = taxableAmount * (VAT_RATE / 100);
      const netAmount = taxableAmount + vatAmt;

      const itemRows = items
        .map(
          (i, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${i.code || '-'}</td>
        <td>${i.Description || '-'}</td>
        <td style="text-align: center;">${i.qty || '0'}</td>
        <td style="text-align: center;">${i.unit || '-'}</td>
        <td style="text-align: right;">${parseFloat(i.so_fccost || 0).toFixed(
          2,
        )}</td>
        <td style="text-align: right; font-weight: bold;">${(
          parseFloat(i.qty || 0) * parseFloat(i.so_fccost || 0)
        ).toFixed(2)}</td>
      </tr>`,
        )
        .join('');

      const html = `
    <html>
    <head>
      <style>
        @page { margin: 0px; } /* Removes default browser margins */
        body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 0; color: #333; }
        
       
        .header-banner {
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .header-banner img {
          width: 100%;
          display: block; /* Removes bottom whitespace */
        }

        .content { padding: 20px; }
        
        .quotation-title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          margin: 15px 0;
          text-decoration: underline;
        }

        .info-table { width: 100%; margin-bottom: 20px; font-size: 14px; }
        
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { border: 1px solid #000; background: #f2f2f2; padding: 8px; font-size: 12px; }
        .items-table td { border: 1px solid #000; padding: 8px; font-size: 12px; }

        .totals-box { margin-left: auto; width: 250px; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
        .total-row.net { border-top: 2px solid #000; font-weight: bold; font-size: 16px; margin-top: 5px; padding-top: 10px; }
        
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #777; }
      </style>
    </head>
    <body>
      <div class="header-banner">
        ${
          companyDetails.logo
            ? `<img src="${companyDetails.logo}" />`
            : `<h1>${companyDetails.name}</h1>`
        }
      </div>

      <div class="content">
        <div class="quotation-title">QUOTATION</div>

        <table class="info-table">
          <tr>
            <td style="width: 15%"><strong>No:</strong></td>
            <td style="width: 35%">#${firstItem['QUOT NO']}</td>
            <td style="width: 15%"><strong>Date:</strong></td>
            <td style="width: 35%">${new Date(
              firstItem.DATE,
            ).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td><strong>Customer:</strong></td>
            <td colspan="3">${firstItem.CUSTOMER}</td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th>Si No</th>
              <th>Code</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="totals-box">
          <div class="total-row">
            <span>Total Amount:</span>
            <span>${taxableAmount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Taxable Amount:</span>
            <span>${taxableAmount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>VAT (${VAT_RATE}%):</span>
            <span>${vatAmt.toFixed(2)}</span>
          </div>
          <div class="total-row net">
            <span>Net Amount:</span>
            <span>${netAmount.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>This is an electronically generated quotation.</p>
        </div>
      </div>
    </body>
    </html>`;

      const options = {
        html,
        fileName: `Quotation_${firstItem['QUOT NO']}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      await Share.open({
        url: `file://${file.filePath}`,
        title: 'Share Quotation',
      });
    } catch (err) {
      console.log('PDF Error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const formattedDate = dateStr => {
    if (!dateStr) {
      return 'N/A';
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return 'N/A';
      }
      return format(d, 'dd MMM yyyy');
    } catch (e) {
      return 'N/A';
    }
  };

  useEffect(() => {
    fetchSalesMan();
    fetchAppUrl();
  });

  useEffect(() => {
    if (salesMan && appUrl && cmpcode) {
      fetchPreviousOrders();
    }
  }, [salesMan, appUrl, cmpcode]);

  // console.log('prevOrder', data)

  console.log('salesMan', salesMan);
  console.log('prevData', data[0]);

  // console.log('itemList', itemList)

  return (
    <View style={styles.HomeWrap}>
      {/* <Header /> */}

      <HeaderUiNew name={'Quotation List'} />

      <View style={styles.HomeCont}>
        {/* <View style={styles.HomeTextCont}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                    </TouchableOpacity>
                    <Text style={styles.HomeText}>Previous Orders</Text>
                </View> */}

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text>Error fetching data: {error.message}</Text>
          </View>
        )}

        {data.length === 0 && !loading && (
          <View>
            <Text style={styles.NoDataText}>No Data Available</Text>
          </View>
        )}

        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          style={styles.ListStyle}
          contentContainerStyle={styles.ListContent}
          renderItem={({item}) => {
            const isOpen = item.Status === 'Open';
            return (
              <TouchableOpacity
                style={styles.QuotCard}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('QuotationDetails', {
                    orderId: item['QUOT NO'],
                  })
                }>
                <View style={styles.QuotCardHeader}>
                  <View style={styles.QuotNumberBadge}>
                    <Text style={styles.QuotNumberText}>
                      #{item['QUOT NO']}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.StatusBadge,
                      isOpen ? styles.StatusOpen : styles.StatusClosed,
                    ]}>
                    <Text
                      style={[
                        styles.StatusBadgeText,
                        isOpen
                          ? styles.StatusTextOpen
                          : styles.StatusTextClosed,
                      ]}>
                      {item.Status}
                    </Text>
                  </View>
                </View>

                <View style={styles.QuotCardBody}>
                  <Text style={styles.CustomerTitle} numberOfLines={1}>
                    {item.CUSTOMER}
                  </Text>
                  <View style={styles.DetailRow}>
                    <View style={styles.DetailItem}>
                      {/* <Image
                        style={styles.DetailIcon}
                        source={require('../images/calc.png')}
                      /> */}
                      {/* <Icon name="calendar" size={20} color="black" /> */}
                      <Text style={styles.DetailText}>
                        {formattedDate(item.DATE)}
                      </Text>
                    </View>
                    <View style={styles.AmountContainer}>
                      <Text style={styles.AmountLabel}>Total Amount</Text>
                      <Text style={styles.AmountValue}>
                        {parseFloat(item.SO_AMOUNT || 0).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.QuotCardFooter}>
                  <Text style={styles.SalesPersonText}>
                    Sales: {item['SALES PERSON']}
                  </Text>
                  <View style={styles.FooterActionContainer}>
                    <TouchableOpacity
                      onPress={() => generatePDF(item)}
                      style={styles.PrintIconContainer}
                      disabled={isPrinting}>
                      {isPrinting ? (
                        <ActivityIndicator size="small" color="#4F46E5" />
                      ) : (
                        <Icon name="print" size={24} color="#4F46E5" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
  QuotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  QuotCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  QuotNumberBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  QuotNumberText: {
    color: '#4F46E5',
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
  },
  StatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  StatusBadgeText: {
    fontFamily: 'Lexend-Medium',
    fontSize: 12,
  },
  StatusOpen: {
    backgroundColor: '#E0F2FE',
  },
  StatusClosed: {
    backgroundColor: '#F1F5F9',
  },
  StatusTextOpen: {
    color: '#0369A1',
  },
  StatusTextClosed: {
    color: '#475569',
  },
  QuotCardBody: {
    marginBottom: 12,
  },
  CustomerTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 8,
  },
  DetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  DetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  DetailIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    tintColor: '#64748B',
  },
  DetailText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  AmountContainer: {
    alignItems: 'flex-end',
  },
  AmountLabel: {
    fontFamily: 'Lexend-Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  AmountValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  QuotCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  SalesPersonText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  ArrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#4F46E5',
  },
  ListStyle: {
    width: '100%',
  },
  ListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  FooterActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  PrintIconContainer: {
    marginRight: 15,
    padding: 8,
  },
  NoDataText: {
    color: 'red',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
});

export default QuotationList;
