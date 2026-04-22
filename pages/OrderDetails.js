import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from './Header';
import ChangeStatusPop from '../popups/ChangeStatusPop';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import REACT_APP_BASE_URL from '../url/AppUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewPdfPop from '../popups/ViewPdfPop';
import PdfPopTest from '../popups/PdfPopTest';
import HeaderUiNew from './HeaderUiNew';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

const OrderDetails = ({route}) => {
  const {orderId} = route.params;
  const navigation = useNavigation();
  const [showChangeStatusPop, setShowChangeStatus] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [itemList, setItemList] = useState(null);
  const [salesMan, setSalesMan] = useState('');

  const [showPdf, setShowPdf] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');
  const [cmpName, setCmpName] = useState('');

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

  const fetchPreviousOrders = async () => {
    try {
      // const response = await axios.get('http://tanoof.dyndns.org:92/api/Sales_Order/Salesall/ALL');

      const deptno = await AsyncStorage.getItem('DEPTNO');

      console.log(
        'fetch previous order api+++-->>>><<<',
        `${appUrl}Sales_Order/${cmpcode}/Salesall/ALL/${deptno}`,
      );

      const response = await axios.get(
        `${appUrl}Sales_Order/${cmpcode}/Salesall/ALL/${deptno}`,
      );
      const allOrders = response.data;
      const filteredOrder = allOrders.filter(order => order.so_no === orderId);
      const salesMan = await AsyncStorage.getItem('sales_man');
      setSalesMan(salesMan);

      //   console.log(
      //     'filteredOrder >> fetchPreviousOrders allOrders orderId',
      //     allOrders,
      //     orderId,
      //     filteredOrder,
      //   );
      setData(filteredOrder);
    } catch (error) {
      console.log('fetchPreviousOrdersError[[[', error);
      setError(error);
    }
  };

  const fetchItemList = async () => {
    try {
      // const response = await axios.get(`http://tanoof.dyndns.org:92/api/Sales_Order/salesall/details/${orderId}`);
      // const response = await axios.get(`${REACT_APP_BASE_URL}Sales_Order/salesall/details/${orderId}`);

      const deptno = await AsyncStorage.getItem('DEPTNO');

      console.log(
        'order details-->++[[[',
        `${appUrl}Sales_Order/${cmpcode}/details/${orderId}/${deptno}`,
      );
      const response = await axios.get(
        `${appUrl}Sales_Order/${cmpcode}/details/${orderId}/${deptno}`,
      );
      setItemList(response.data);
    } catch (error) {
      console.log('fetchItemListError', error);
      setError(error);
    }
  };

  const subTotal =
    itemList && itemList.reduce((sum, item) => sum + (item.line_total || 0), 0);

  // ── Request storage permission ─────────────────────────────────────────────
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to save the PDF',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission denied');
        }
      } catch (err) {
        console.warn('Permission request error:', err);
      }
    }
  };

  // ── Company helper ───────────────────────────────────────────────
  const getCompanyDetails = code => {
    const c = (code || '').trim().toUpperCase();

    const companyMap = {
      SOCA: {
        name: 'SOCA TOOLS INTERNATIONAL TRADING LLC',
        trn: '100123456700003',
      },

      POPULAR: {
        name: 'POPULAR AUTO SPARE PARTS TRADING LLC',
        trn: '100327766000003',
      },

      ICELAB: {
        name: 'THE ICE LAB MANUFACTURING LLC',
        trn: '100345678900003',
      },

      ICELAB_TEST: {
        name: 'THE ICE LAB MANUFACTURING LLC',
        trn: '100345678900003',
      },

      ICUP: {
        name: 'ICECUP FOOD INDUSTRIES L.L.C',
        trn: '100456789000003',
      },
    };

    return (
      companyMap[c] || {
        name: cmpName || code || 'Company',
        trn: '',
      }
    );
  };
  // ── Generate Order PDF ───────────────────────────────────────────────────
  const generateOrderPDF = async () => {
    if (!itemList || itemList.length === 0) return;
    setPdfLoading(true);
    await requestStoragePermission();

    const firstItem = itemList[0];
    const soDate = firstItem.so_date
      ? new Date(firstItem.so_date).toLocaleDateString('en-GB')
      : '-';
    const vatAmt = subTotal ? (subTotal * 0.05).toFixed(2) : '0.00';
    const totalIncVat = firstItem.so_amount
      ? parseFloat(firstItem.so_amount).toFixed(2)
      : subTotal
      ? (subTotal * 1.05).toFixed(2)
      : '0.00';
    const companyDetails = getCompanyDetails(cmpcode?.toUpperCase());

    const companyLabel = companyDetails.name;
    const companyTRN = companyDetails.trn;

    const address = [firstItem.address1, firstItem.address2, firstItem.address3]
      .filter(Boolean)
      .join(', ');

    const itemRows = itemList
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
          <td class="tr fw">${parseFloat(item.line_total || 0).toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#1a1a2e;background:#fff;}
      .header{
        background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%);
        color:white;padding:20px 24px;display:flex;
        justify-content:space-between;align-items:flex-start;
      }
      .header-left{max-width:60%;}
      .cmp-name{font-size:18px;font-weight:700;letter-spacing:0.5px;margin-bottom:4px;}
      .cmp-trn{font-size:14px;font-weight:700;letter-spacing:0.5px;margin-bottom:4px;}
      .doc-label{font-size:22px;font-weight:300;letter-spacing:2px;color:#e0e0e0;margin-top:8px;}
      .header-right{text-align:right;}
      .order-no{font-size:15px;font-weight:700;background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:4px;display:inline-block;}
      .header-meta{font-size:11px;color:#b0b8d0;margin-top:6px;}
      .info-strip{display:flex;flex-wrap:wrap;gap:0;border-bottom:2px solid #e8eaf0;}
      .info-cell{flex:1;min-width:33%;padding:10px 16px;border-right:1px solid #e8eaf0;}
      .info-cell:last-child{border-right:none;}
      .info-label{font-size:10px;text-transform:uppercase;color:#888;letter-spacing:0.5px;margin-bottom:3px;}
      .info-value{font-size:13px;font-weight:600;color:#1a1a2e;}
      .section-title{
        font-size:11px;text-transform:uppercase;letter-spacing:1px;
        color:#0f3460;font-weight:700;padding:10px 16px 4px;
        border-bottom:2px solid #0f3460;
      }
      table{width:100%;border-collapse:collapse;font-size:11px;}
      thead tr{background:#0f3460;color:#fff;}
      th{padding:8px 10px;text-align:left;font-weight:600;}
      td{padding:7px 10px;}
      .row-even{background:#fff;}
      .row-odd{background:#f5f7fc;}
      td.tc{text-align:center;}
      td.tr{text-align:right;}
      td.fw{font-weight:600;}
      .totals-wrap{display:flex;justify-content:flex-end;padding:12px 16px 0;}
      .totals-box{min-width:260px;border:1px solid #e0e3ef;border-radius:8px;overflow:hidden;}
      .tot-row{display:flex;justify-content:space-between;padding:7px 14px;font-size:12px;}
      .tot-row:nth-child(even){background:#f5f7fc;}
      .tot-row .lbl{color:#555;}
      .tot-row .val{font-weight:600;color:#1a1a2e;}
      .tot-grand{display:flex;justify-content:space-between;padding:10px 14px;background:#0f3460;color:white;font-size:14px;font-weight:700;}
      .comments-strip{font-size:11px;color:#666;padding:8px 16px;border-top:1px solid #e8eaf0;margin-top:8px;}
      .footer{margin-top:20px;padding:12px 16px;border-top:1px solid #e0e3ef;display:flex;justify-content:space-between;font-size:10px;color:#aaa;}
      .sig-line{border-top:1px solid #999;width:160px;padding-top:4px;font-size:11px;color:#444;text-align:right;}
    </style></head><body>
    <div class="header">
      <div class="header-left">
        <div class="cmp-name">${companyLabel}</div>
        <div class="cmp-trn">TRN:${companyTRN}</div>
        <div class="doc-label">SALES ORDER</div>
      </div>
      <div class="header-right">
        <div class="order-no">${orderId}</div>
        <div class="header-meta">Date: ${soDate}</div>
        <div class="header-meta">Currency: ${firstItem.fc || 'AED'}</div>
        ${
          firstItem.Lpo_no
            ? `<div class="header-meta">LPO: ${firstItem.Lpo_no}</div>`
            : ''
        }
      </div>
    </div>
    <div class="info-strip">
      <div class="info-cell">
        <div class="info-label">Customer Code</div>
        <div class="info-value">${firstItem.cust_acc || '-'}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Salesman</div>
        <div class="info-value">${firstItem.sale_man || '-'}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Order No</div>
        <div class="info-value">${orderId}</div>
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
    <div class="totals-wrap">
      <div class="totals-box">
        <div class="tot-row"><span class="lbl">Subtotal</span><span class="val">${
          subTotal ? subTotal.toFixed(2) : '0.00'
        }</span></div>
        <div class="tot-row"><span class="lbl">VAT (5%)</span><span class="val">${vatAmt}</span></div>
        <div class="tot-grand"><span>Total Incl. VAT</span><span>${totalIncVat}</span></div>
      </div>
    </div>
    ${
      firstItem.comments
        ? `<div class="comments-strip"><b>Comments:</b> ${firstItem.comments}</div>`
        : ''
    }
    <div class="footer">
      <div>${companyLabel}</div>
      <div class="sig-line">Authorized Signature</div>
    </div>
    </body></html>`;

    try {
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: `SalesOrder_${orderId}`,
        directory: 'Documents',
      });
      await Share.open({
        title: 'Share Sales Order PDF',
        url: `file://${file.filePath}`,
      });
    } catch (err) {
      console.error('generateOrderPDF error:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  //   console.log('subTotal', subTotal);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchPreviousOrders(), fetchItemList()]);
      } catch (error) {
        console.log('fetchDataError', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (appUrl && cmpcode) {
      fetchData();
    }
  }, [appUrl, cmpcode]);

  useEffect(() => {
    fetchAppUrl();
  }, []);

  // console.log('data', data)
  // console.log('itemList', itemList)

  console.log('orderId', orderId);
  // console.log('filDATA', data)
  // console.log('itemList', itemList)

  return (
    <View style={styles.HomeWrap}>
      {/* <Header /> */}

      <HeaderUiNew name={'Order Details'} />

      {/* <TouchableOpacity style={styles.HomeCont} onPress={() => navigation.navigate('PreviousOrders')}>
                <View>
                    <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                </View>
                <View style={styles.HomeTextCont}>
                    <Text style={styles.HomeText}>Order Details</Text>
                </View>
            </TouchableOpacity> */}

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

      {itemList && itemList.length > 0 && (
        <ScrollView style={styles.OrderDetailsWrap}>
          <View style={styles.SectionHeaderRow}>
            <Text style={styles.CustomerTagText}>Item List</Text>
            <TouchableOpacity
              style={[styles.PrintBtn, pdfLoading && {opacity: 0.6}]}
              onPress={generateOrderPDF}
              disabled={pdfLoading}>
              {pdfLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.PrintBtnText}> Print PDF</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView nestedScrollEnabled={true} style={styles.InnerScroll}>
            <View style={styles.InnerView}>
              {itemList &&
                itemList.map((item, index) => (
                  <View style={styles.loopCont}>
                    <View style={styles.indexCont}>
                      <Text style={styles.indexText}>{index + 1}.</Text>
                    </View>
                    <View key={index} style={styles.SelectedItemCont}>
                      <View style={styles.itemDescToTHead}>
                        <Text style={styles.DescText}>{item.idesc}</Text>
                        <Text style={styles.TotalText}>{item.line_total}</Text>
                      </View>
                      <View style={styles.DescCont}>
                        <Text style={styles.DescSubText}>Item Code :</Text>
                        <Text style={styles.DescSubTextValue}>
                          {item.so_icode}
                        </Text>
                      </View>
                      <View style={styles.DescCont}>
                        <Text style={styles.DescSubText}>Unit Price :</Text>
                        <Text style={styles.DescSubTextValue}>
                          {item.so_cost}
                        </Text>
                      </View>
                      <View style={styles.DescCont}>
                        <Text style={styles.DescSubText}>Quantity :</Text>
                        <Text style={styles.DescSubTextValue}>
                          {item.tr_qty2}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </ScrollView>

          <View style={styles.SubTotalCont}>
            <Text style={styles.CustomerValueText}>Subtotal</Text>
            <Text style={styles.CustomerValueText}>
              {subTotal && subTotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.TaxBox}>
            <View style={styles.TaxCont}>
              <Text style={styles.CustomerValueText}>VAT% :</Text>
              <Text style={styles.CustomerValueText}>5%</Text>
            </View>
            <View style={styles.TaxCont}>
              <Text style={styles.CustomerValueText}>VAT :</Text>
              <Text style={styles.CustomerValueText}>
                {subTotal && (subTotal * 0.05).toFixed(2)}
              </Text>
            </View>
            <View style={styles.TaxCont}>
              <Text style={styles.CustomerValueText}>Amount Incl.VAT</Text>
              <Text style={styles.CustomerValueText}>
                {itemList[0].so_amount}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {(!data || !itemList) && !loading && (
        <View style={styles.OrderDetailsWrap}>
          <Text style={styles.ErrorText}>No data available</Text>
        </View>
      )}

      {showChangeStatusPop && (
        <ChangeStatusPop
          setShowChangeStatus={setShowChangeStatus}
          orderId={orderId}
          salesMan={salesMan}
        />
      )}

      {/* {
                showPdf &&
                // <ViewPdfPop setShowPdf={setShowPdf} data={data} itemList={itemList} />
                // <PdfPopTest />
            } */}
    </View>
  );
};

const styles = StyleSheet.create({
  HomeTextCont: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  SettingsWrap: {
    backgroundColor: '#189A2E',
    backgroundColor: 'red',
    borderRadius: 50,
    padding: 6,
  },
  HeadIcon: {
    width: 25,
    height: 25,
  },
  CustomerSection: {
    flexDirection: 'column',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  CustomerItemWrap: {
    paddingVertical: 2,
  },
  AdressWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 2,
  },
  CustomerTagText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  CustomerValueText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  InnerScroll: {
    minHeight: 'auto',
    maxHeight: 400,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  InnerView: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  totalTag: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#5A55CA',
    // padding: 2,
    borderRadius: 50,
    width: 40,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCountText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
  },
  SectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  PrintBtn: {
    backgroundColor: '#5A55CA',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  PrintBtnText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  SubTotalCont: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  TaxBox: {
    width: '100%',
    flexDirection: 'column',
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#e9ecef',
  },
  TaxBox2: {
    width: '100%',
    flexDirection: 'column',
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#dee2e6',
  },
  TaxCont: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },

  //
  HomeWrap: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#5A55CA'
  },
  HomeCont: {
    width: '100%',
    flexDirection: 'row',
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
    marginVertical: 6,
  },
  DescText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  DescCont: {
    flexDirection: 'row',
    marginVertical: 2,
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
    marginLeft: 8,
  },
  UpdateWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 6,
  },
  EditButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
    // marginRight: 6
    marginLeft: 35,
  },
  EditText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  DeleteButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 6,
  },
  DeleteText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  OrderDetailsWrap: {
    width: '100%',
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 12,
    height: Dimensions.get('window').height - 100,
  },
  TopButtonsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  ChngStatusOrderButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  ViewPdfButton: {
    backgroundColor: 'green',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  TopButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  CustomerOrderCont: {
    flexDirection: 'column',
  },
  CustomerOrderText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  CustomerOrderValue: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  ErrorText: {
    color: 'red',
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
  },

  InnerScroll: {
    minHeight: 'auto',
    maxHeight: 400,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  InnerView: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  loopCont: {
    flexDirection: 'row',
    // justifyContent: 'space-between'
  },
  indexCont: {
    width: '5%',
    paddingTop: 18,
  },
  indexText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
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
    height: 25,
  },

  SelectedItemCont: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    // borderWidth: 1,
    // borderColor: '#dbdbdb',
    // borderRadius: 6,
    marginVertical: 6,
  },
  DescText: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    marginBottom: 8,
    width: '75%',
  },
  DescCont: {
    flexDirection: 'row',
    marginVertical: 2,
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
    marginLeft: 8,
  },

  TotalValueTexts: {
    color: '#1A6CF6',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    marginLeft: 8,
  },
});

export default OrderDetails;
