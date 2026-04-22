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
import Header from './Header';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import REACT_APP_BASE_URL from '../url/AppUrl';
import StatusLogPop from '../popups/StatusLogPop';
import HeaderUiNew from './HeaderUiNew';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

const PreviousOrde = () => {
  const ITEMS_PER_PAGE = 20;

  const navigation = useNavigation();

  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [salesMan, setSalesMan] = useState('');

  const [itemList, setItemList] = useState(null);
  const [showStatusLogPop, setShowStatusLogPop] = useState(false);
  const [orderIdPop, setOrderIdPop] = useState(null);

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [expandedItems, setExpandedItems] = useState([]);
  const [printingOrderId, setPrintingOrderId] = useState(null);
  const [cmpName, setCmpName] = useState('');

  const toggleExpand = so_no => {
    setExpandedItems(prevState => {
      if (prevState.includes(so_no)) {
        // If already open, close it
        return prevState.filter(id => id !== so_no);
      } else {
        // If closed, open it (and close others)
        return [so_no];
      }
    });
  };

  const fetchAppUrl = async () => {
    const appUrl = await AsyncStorage.getItem('appUrl');
    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];
    const portNoData = await AsyncStorage.getItem('portNoData');

    if (portNoData) {
      try {
        const dataArray = JSON.parse(portNoData);
        if (dataArray[0]?.COMPNAME) setCmpName(dataArray[0].COMPNAME);
      } catch (_) {}
    }
    if (parsedUserDataArray.length > 0) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim());
    }
    if (appUrl) {
      setAppUrl(appUrl);
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
    const salesMan = await AsyncStorage.getItem('sales_man');

    if (salesMan === '----') {
      const salesManDrop = await AsyncStorage.getItem('sales_man_drop');
      setSalesMan(salesManDrop);
    } else {
      setSalesMan(salesMan);
    }
  };

  const fetchPreviousOrders = async () => {
    try {
      // const response = await axios.get(`${REACT_APP_BASE_URL}Sales_Order/Salesall/ALL`);
      // const response = await axios.get(`https://cubixweberp.com:208/api/Sales_Order/automax/Salesall/ALL`);

      const deptno = await AsyncStorage.getItem('DEPTNO');

      console.log(
        'previous order api url -->[[]] ',
        `${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}/${deptno}`,
      );

      const response = await axios.get(
        `${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}/${deptno}`,
      );

      console.log(
        'salesorder API',
        `${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}`,
      );

      // https://cubixweberp.com:208/api/Sales_Order/automax/previous/SHA01
      setData(response.data);
      // console.log('Previous response data length', response?.data?.length);
      // console.log('previous orders response', response.data);
    } catch (error) {
      console.log('fetchPreviousOrdersError', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemList = async orderId => {
    try {
      const response = await axios.get(
        `http://tanoof.dyndns.org:92/api/Sales_Order/salesall/details/${orderId}`,
      );
      setItemList(response.data);
    } catch (error) {
      console.log('fetchItemListError', error);
      setError(error);
    }
  };

  const ViewStatusLogAction = async orderId => {
    setShowStatusLogPop(true);
    setOrderIdPop(orderId);
    // try {
    //     const response = await axios.get(`${REACT_APP_BASE_URL}PreviousOrderStatus/Get?type=asda&desc=${orderId}`);
    //     console.log(response.data); // You can handle the response data here
    // } catch (error) {
    //     console.error("ViewStatusLogAction Erro", error);
    // }

    // console.log(`${REACT_APP_BASE_URL}PreviousOrderStatus/Get?type=asda&desc=${orderId}`);
  };

  const formattedDate = date => {
    return format(new Date(date), 'dd-MM-yy');
  };

  // ── Storage permission ─────────────────────────────────────────────────────
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
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // ── Company label helper ────────────────────────────────────────────────────
  const getCompanyLabel = code => {
    const c = (code || '').trim().toUpperCase();
    if (c === 'SOCA') return 'SOCA TOOLS INTERNATIONAL TRADING LLC';
    if (c === 'POPULAR') return 'POPULAR AUTO SPARE PARTS TRADING LLC';
    if (c === 'ICELAB' || c === 'ICELAB_TEST')
      return 'THE ICE LAB MANUFACTURING LLC';
    if (c === 'ICUP') return 'ICECUP FOOD INDUSTRIES L.L.C';
    if (c === 'ICUP') return 'ICECUP FOOD INDUSTRIES L.L.C';
    return cmpName || code || 'Company';
  };

  // ── Generate PDF for an order ──────────────────────────────────────────────
  const generateOrderPDF = async orderItem => {
    if (printingOrderId) return; // prevent double-tap
    setPrintingOrderId(orderItem.so_no);
    await requestStoragePermission();

    try {
      const deptno = await AsyncStorage.getItem('DEPTNO');
      const res = await axios.get(
        `${appUrl}Sales_Order/${cmpcode}/details/${orderItem.so_no}/${deptno}`,
      );
      const items = res.data;
      if (!items || items.length === 0) {
        console.log('No items found for order', orderItem.so_no);
        return;
      }

      const firstItem = items[0];
      const soDate = firstItem.so_date
        ? new Date(firstItem.so_date).toLocaleDateString('en-GB')
        : '-';
      const subTotal = items.reduce(
        (sum, i) => sum + parseFloat(i.line_total || 0),
        0,
      );
      const vatAmt = (subTotal * 0.05).toFixed(2);
      const totalIncVat = firstItem.so_amount
        ? parseFloat(firstItem.so_amount).toFixed(2)
        : (subTotal * 1.05).toFixed(2);

      const companyLabel = getCompanyLabel(cmpcode);
      const accdesc = orderItem.accdesc || firstItem.cust_acc || '-';
      const address = [
        firstItem.address1,
        firstItem.address2,
        firstItem.address3,
      ]
        .filter(Boolean)
        .join(', ');

      const itemRows = items
        .map(
          (item, idx) => `
          <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
            <td class="tc">${idx + 1}</td>
            <td>${item.so_icode || '-'}</td>
            <td>${item.idesc || '-'}</td>
            <td>${item.batch || '-'}</td>
            <td class="tc">${item.unit || '-'}</td>
            <td class="tr">${parseFloat(item.tr_qty2 || 0).toFixed(2)}</td>
            <td class="tr">${parseFloat(item.so_cost || 0).toFixed(2)}</td>
            <td class="tr fw">${parseFloat(item.line_total || 0).toFixed(
              2,
            )}</td>
          </tr>`,
        )
        .join('');

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#1a1a2e;background:#fff;}
        /* ── Header ── */
        .header{
          background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%);
          color:white;padding:20px 24px;display:flex;
          justify-content:space-between;align-items:flex-start;
        }
        .header-left{max-width:60%;}
        .cmp-name{font-size:18px;font-weight:700;letter-spacing:0.5px;margin-bottom:4px;}
        .doc-label{font-size:22px;font-weight:300;letter-spacing:2px;color:#e0e0e0;margin-top:8px;}
        .header-right{text-align:right;}
        .order-no{font-size:15px;font-weight:700;background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:4px;display:inline-block;}
        .header-meta{font-size:11px;color:#b0b8d0;margin-top:6px;}
        /* ── Info strip ── */
        .info-strip{
          display:flex;flex-wrap:wrap;gap:0;
          border-bottom:2px solid #e8eaf0;
          margin:0;padding:0;
        }
        .info-cell{
          flex:1;min-width:33%;padding:10px 16px;
          border-right:1px solid #e8eaf0;
        }
        .info-cell:last-child{border-right:none;}
        .info-label{font-size:10px;text-transform:uppercase;color:#888;letter-spacing:0.5px;margin-bottom:3px;}
        .info-value{font-size:13px;font-weight:600;color:#1a1a2e;}
        /* ── Items table ── */
        .section-title{
          font-size:11px;text-transform:uppercase;letter-spacing:1px;
          color:#0f3460;font-weight:700;padding:10px 16px 4px;
          border-bottom:2px solid #0f3460;margin-bottom:0;
        }
        table{width:100%;border-collapse:collapse;font-size:11px;}
        thead tr{background:#0f3460;color:#fff;}
        th{padding:8px 10px;text-align:left;font-weight:600;letter-spacing:0.3px;}
        td{padding:7px 10px;}
        .row-even{background:#fff;}
        .row-odd{background:#f5f7fc;}
        tr:hover{background:#eef1fb;}
        td.tc{text-align:center;}
        td.tr{text-align:right;}
        td.fw{font-weight:600;}
        /* ── Totals ── */
        .totals-wrap{display:flex;justify-content:flex-end;padding:12px 16px 0;}
        .totals-box{min-width:260px;border:1px solid #e0e3ef;border-radius:8px;overflow:hidden;}
        .tot-row{display:flex;justify-content:space-between;padding:7px 14px;font-size:12px;}
        .tot-row:nth-child(even){background:#f5f7fc;}
        .tot-row .lbl{color:#555;}
        .tot-row .val{font-weight:600;color:#1a1a2e;}
        .tot-grand{
          display:flex;justify-content:space-between;padding:10px 14px;
          background:#0f3460;color:white;font-size:14px;font-weight:700;
        }
        /* ── Address / comments ── */
        .comments-strip{
          font-size:11px;color:#666;padding:8px 16px;
          border-top:1px solid #e8eaf0;margin-top:8px;
        }
        /* ── Footer ── */
        .footer{
          margin-top:20px;padding:12px 16px;
          border-top:1px solid #e0e3ef;
          display:flex;justify-content:space-between;align-items:center;
          font-size:10px;color:#aaa;
        }
        .sig-area{text-align:right;}
        .sig-line{border-top:1px solid #999;width:160px;padding-top:4px;font-size:11px;color:#444;}
      </style></head><body>
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <div class="cmp-name">${companyLabel}</div>
          <div class="doc-label">SALES ORDER</div>
        </div>
        <div class="header-right">
          <div class="order-no">${orderItem.so_no}</div>
          <div class="header-meta">Date: ${soDate}</div>
          <div class="header-meta">Currency: ${firstItem.fc || 'AED'}</div>
          ${
            firstItem.Lpo_no
              ? `<div class="header-meta">LPO: ${firstItem.Lpo_no}</div>`
              : ''
          }
        </div>
      </div>
      <!-- Info strip -->
      <div class="info-strip">
        <div class="info-cell">
          <div class="info-label">Customer Code</div>
          <div class="info-value">${firstItem.cust_acc || '-'}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">Customer Name</div>
          <div class="info-value">${accdesc}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">Salesman</div>
          <div class="info-value">${firstItem.sale_man || '-'}</div>
        </div>
        ${
          address
            ? `<div class="info-cell" style="min-width:100%;border-right:none;border-top:1px solid #e8eaf0;">
          <div class="info-label">Address</div>
          <div class="info-value">${address}</div>
        </div>`
            : ''
        }
      </div>
      <!-- Items -->
      <div class="section-title">Order Items</div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;text-align:center;">#</th>
            <th>Item Code</th>
            <th>Description</th>
            <th>Batch</th>
            <th style="text-align:center;">Unit</th>
            <th style="text-align:right;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <!-- Totals -->
      <div class="totals-wrap">
        <div class="totals-box">
          <div class="tot-row"><span class="lbl">Subtotal</span><span class="val">${subTotal.toFixed(
            2,
          )}</span></div>
          <div class="tot-row"><span class="lbl">VAT (5%)</span><span class="val">${vatAmt}</span></div>
          <div class="tot-grand"><span>Total Incl. VAT</span><span>${totalIncVat}</span></div>
        </div>
      </div>
      ${
        firstItem.comments
          ? `<div class="comments-strip"><b>Comments:</b> ${firstItem.comments}</div>`
          : ''
      }
      <!-- Footer -->
      <div class="footer">
        <div>${companyLabel}</div>
        <div class="sig-area"><div class="sig-line">Authorized Signature</div></div>
      </div>
      </body></html>`;

      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: `SalesOrder_${orderItem.so_no}`,
        directory: 'Documents',
      });
      await Share.open({
        title: `Sales Order ${orderItem.so_no}`,
        url: `file://${file.filePath}`,
      });
    } catch (err) {
      console.error('generateOrderPDF error:', err);
    } finally {
      setPrintingOrderId(null);
    }
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

  useEffect(() => {
    if (salesMan && appUrl && cmpcode) {
      fetchPreviousOrders();
    }
  }, [salesMan, appUrl, cmpcode]);

  // console.log('prevOrder', data)

  console.log('salesMan', salesMan);
  console.log('prevData', data);

  // console.log('itemList', itemList)

  return (
    <View style={styles.HomeWrap}>
      {/* <Header /> */}

      <HeaderUiNew name={'Previous Orders'} />

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
            <Text
              style={{
                color: 'red',
                fontSize: 16,
                fontFamily: 'Lexend-Bold',
              }}>
              No Data Available
            </Text>
          </View>
        )}

        <FlatList
          data={getPaginatedData()}
          keyExtractor={(item, index) => item.so_no}
          style={{width: '94%'}}
          renderItem={({item}) => (
            <ScrollView style={styles.PreviousOrderWrap}>
              {/*  */}

              <TouchableOpacity
                style={styles.StockListItem}
                onPress={() =>
                  navigation.navigate('OrderDetails', {orderId: item.so_no})
                }>
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
                        {item.accdesc}
                      </Text>
                      <Text
                        style={[
                          styles.StockListDescTextSmall,
                          {color: '#30B3A4', fontFamily: 'Lexend-Regular'},
                        ]}>
                        {item.so_amount}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        paddingVertical: 6,
                      }}>
                      <Text style={styles.StockListDescTextSmall}>
                        {item.so_no}
                      </Text>
                      <View
                        style={{
                          marginLeft: 24,
                          flexDirection: 'row',
                        }}>
                        <Text style={[styles.StockListDescTextSmall]}>
                          {formattedDate(item.inv_date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Print PDF button row */}
                <View style={styles.CardFooterRow}>
                  <TouchableOpacity
                    style={[
                      styles.PrintCardBtn,
                      printingOrderId === item.so_no && {opacity: 0.6},
                    ]}
                    onPress={e => {
                      e.stopPropagation && e.stopPropagation();
                      generateOrderPDF(item);
                    }}
                    disabled={!!printingOrderId}>
                    {printingOrderId === item.so_no ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.PrintCardBtnText}>Print PDF</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
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
  CardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 6,
  },
  PrintCardBtn: {
    backgroundColor: '#0f3460',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  PrintCardBtnText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Lexend-Regular',
  },
});

export default PreviousOrde;
