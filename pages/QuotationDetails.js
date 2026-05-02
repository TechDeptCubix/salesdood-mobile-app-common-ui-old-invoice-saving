import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ChangeStatusPop from '../popups/ChangeStatusPop';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderUiNew from './HeaderUiNew';
import {useNavigation} from '@react-navigation/native';

const QuotationDetails = ({route}) => {
  const navigation = useNavigation();
  const {orderId} = route.params;
  const [showChangeStatusPop, setShowChangeStatus] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesMan, setSalesMan] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [cmpcode, setCmpCode] = useState('');
  const [cmpName, setCmpName] = useState('');

  const [quoteDetailsArray, setQuoteDetailsArray] = useState(null);

  const fetchAppUrl = React.useCallback(async () => {
    const storedAppUrl = await AsyncStorage.getItem('appUrl');
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

    if (storedAppUrl) {
      setAppUrl(storedAppUrl);
    }
    if (parsedUserDataArray.length > 0) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim());
    }

    try {
      const deptno = await AsyncStorage.getItem('DEPTNO');

      setLoading(true);
      if (storedAppUrl && parsedUserDataArray.length > 0) {
        const company = parsedUserDataArray[0]?.cmpcode.trim();
        console.log(
          'quotation details api-->>>',
          `${storedAppUrl}Proposal/${company}/QUOTEDETAILS/${orderId}/${deptno}`,
        );
        const response = await axios.get(
          `${storedAppUrl}Proposal/${company}/QUOTEDETAILS/${orderId}/${deptno}`,
        );
        console.log('quotation details response ', response.data);
        setQuoteDetailsArray(response.data);

        // Extract sales person if not already set
        const storedSalesMan = await AsyncStorage.getItem('sales_man');
        setSalesMan(storedSalesMan || '---');
      }
      setLoading(false);
    } catch (err) {
      console.log('fetchItemListError', err);
      setError(err);
      setLoading(false);
    }
  }, [orderId]);

  const subTotal =
    quoteDetailsArray &&
    quoteDetailsArray.reduce(
      (sum, item) =>
        sum +
        (parseFloat(item.qty || 0) * parseFloat(item.so_fccost || 0) || 0),
      0,
    );

  const VAT_RATE =
    cmpcode?.toUpperCase() === 'ALESSA' ||
    cmpcode?.toUpperCase() === 'ALESSA_TEST'
      ? 15
      : 5;

  console.log('subTotal', subTotal);

  useEffect(() => {
    fetchAppUrl();
  }, [fetchAppUrl]);

  // console.log('data', data)
  // console.log('itemList', itemList)

  console.log('orderId', orderId);
  // console.log('filDATA', data)
  // console.log('itemList', itemList)

  return (
    <View style={styles.HomeWrap}>
      {/* <Header /> */}

      <HeaderUiNew name={'Quotation Details'} />

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

      {quoteDetailsArray && quoteDetailsArray.length > 0 && (
        <ScrollView style={styles.OrderDetailsWrap}>
          <View style={styles.DetailsHeader}>
            <View style={styles.HeaderBadge}>
              <Text style={styles.HeaderBadgeText}>
                #{quoteDetailsArray[0]['QUOT NO']}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EditSalesInvoice', {
                    id: quoteDetailsArray[0]['QUOT NO'],
                    type: 'quotation',
                  })
                }
                style={[
                  styles.HeaderBadge,
                  {backgroundColor: '#E0F2FE', marginRight: 10},
                ]}>
                <Text style={[styles.HeaderBadgeText, {color: '#0369A1'}]}>
                  Edit
                </Text>
              </TouchableOpacity>
              <View style={styles.StatusBadge}>
                <Text style={styles.StatusBadgeText}>
                  {quoteDetailsArray[0].Status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.InfoCard}>
            <View style={styles.InfoRow}>
              <Text style={styles.InfoLabel}>Customer Name</Text>
              <Text style={styles.InfoValue}>
                {quoteDetailsArray[0].CUSTOMER}
              </Text>
            </View>
            <View style={styles.InfoDivider} />
            <View style={styles.InfoRow}>
              <Text style={styles.InfoLabel}>Sales Person</Text>
              <Text style={styles.InfoValue}>
                {quoteDetailsArray[0]['SALES PERSON']}
              </Text>
            </View>
            <View style={styles.InfoDivider} />
            <View style={styles.InfoRow}>
              <Text style={styles.InfoLabel}>Quotation Date</Text>
              <Text style={styles.InfoValue}>
                {new Date(quoteDetailsArray[0].DATE).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <Text style={styles.SectionTitle}>Items List</Text>

          {quoteDetailsArray.map((item, index) => {
            const lineTotal =
              parseFloat(item.qty || 0) * parseFloat(item.so_fccost || 0);
            return (
              <View key={index} style={styles.ItemCard}>
                <View style={styles.ItemHeader}>
                  <Text style={styles.ItemName}>{item.Description}</Text>
                  <Text style={styles.ItemTotal}>
                    {lineTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
                <View style={styles.ItemDetails}>
                  <Text style={styles.ItemCode}>Code: {item.code}</Text>
                  <Text style={styles.ItemQuantity}>
                    {item.qty} {item.unit} {' x '}
                    {parseFloat(item.so_fccost).toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}

          <View style={styles.GrandTotalCard}>
            <View style={styles.SummaryRow}>
              <Text style={styles.SummaryLabel}>Subtotal</Text>
              <Text style={styles.SummaryValue}>
                {subTotal?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.SummaryRow}>
              <Text style={styles.SummaryLabel}>VAT ({VAT_RATE}%)</Text>
              <Text style={styles.SummaryValue}>
                {(subTotal * (VAT_RATE / 100)).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.GrandTotalDivider} />
            <View style={styles.SummaryRow}>
              <Text style={styles.GrandTotalLabel}>Grand Total</Text>
              <Text style={styles.GrandTotalValue}>
                {(subTotal * (1 + VAT_RATE / 100)).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {!loading && (!quoteDetailsArray || quoteDetailsArray.length === 0) && (
        <View style={styles.centered}>
          <Text style={styles.ErrorText}>No quotation details found</Text>
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
  GrandTotalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  GrandTotalLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  GrandTotalValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: '#4F46E5',
  },
  DetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  HeaderBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  HeaderBadgeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: '#4F46E5',
  },
  StatusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  StatusBadgeText: {
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
    color: '#475569',
  },
  InfoCard: {
    backgroundColor: '#F8FAFC',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  InfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  InfoLabel: {
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  InfoValue: {
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
    color: '#1E293B',
    maxWidth: '60%',
    textAlign: 'right',
  },
  InfoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  SectionTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#0F172A',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  ItemCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  ItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ItemName: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  ItemTotal: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  ItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ItemCode: {
    fontFamily: 'Lexend-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  ItemQuantity: {
    fontFamily: 'Lexend-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  GrandTotalCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 24,
    marginBottom: 40,
  },
  SummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  SummaryLabel: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  SummaryValue: {
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
    color: '#0F172A',
  },
  PrintButton: {
    backgroundColor: '#4F46E5',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  PrintButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    marginLeft: 8,
  },
  PrintIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
});

export default QuotationDetails;
