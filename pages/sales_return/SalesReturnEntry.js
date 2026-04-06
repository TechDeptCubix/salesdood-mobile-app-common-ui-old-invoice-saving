import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function SalesReturnEntry({route, navigation}) {
  const {selectedItems, customer, invoiceId, invoiceDetailObject, salesMan, deptNo} =
    route.params;

const [glSettings, setGLSettings] = useState(null)

  const [loading, setLoading] = useState(false);

  const [qtys, setQtys] = useState({});
  const [reason, setReason] = useState('');
  const [vatPercent, setVatPercent] = useState('5');

  // --- GLOBAL LOGIC CONSTANTS ---
  // 1. Original Subtotal (Price * Original Qty) e.g., 53
  const originalSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  // 2. Global Discount (6)
  const globalDiscountValue = selectedItems[0]?.discount_amount || 0;

  // 3. Discount Ratio (Percentage) e.g., 6 / 53 = 0.1132
  const discountRatio =
    originalSubtotal > 0 ? globalDiscountValue / originalSubtotal : 0;

  const vatRate = parseFloat(vatPercent) || 0;

  const updateQty = (id, value) => {
    // Basic validation: prevent entering more than original invoice quantity
    const item = selectedItems.find(i => i.id === id);
    const numValue = parseFloat(value) || 0;

    if (numValue > (item?.qty || 0)) {
      alert(`Cannot return more than purchased (${item?.qty})`);
      return;
    }
    setQtys(prev => ({...prev, [id]: value}));
  };

  const handleSubmit = async () => {


    const SR_VT_D_Account = glSettings?.find(item => item.Scrn_code === "SR-VT-D")?.ACCOUNT;

    if(!SR_VT_D_Account){
      Alert.alert("Cannot find accounts, please contact admin")
      return
    }
    const SR_CR_D_Account = glSettings?.find(item => item.Scrn_code === "SR-CR-D")?.ACCOUNT;
    if(!SR_CR_D_Account){
      Alert.alert("Cannot find accounts, please contact admin")
      return
    }

    if(deptNo == "----"){
      Alert.alert('Department missing');
      return
    }

    // 1. Check if EVERY item has a quantity entered and it's greater than 0
    const allItemsHaveQty = selectedItems.every(item => {
      const qty = parseFloat(qtys[item.id]);
      return qty > 0; // Must be a number and greater than 0
    });

    if (!allItemsHaveQty) {
      Alert.alert('Please enter a valid quantity for ALL items before submitting.');
      return; // Stop execution
    }

    // 2. Check for reason first
    if (!reason.trim()) {
      Alert.alert('Please enter a reason for return');
      return;
    }

    setLoading(true); // Start loading spinner/disable button

    try {
      const now = new Date().toISOString();
      const van = await AsyncStorage.getItem('VAN');

      // Calculate Return Totals for Payload
      const returnSubtotal = selectedItems.reduce((sum, item) => {
        const qty = parseFloat(qtys[item.id]) || 0;
        return sum + qty * item.price;
      }, 0);

      const totalReturnDiscount = returnSubtotal * discountRatio;
      const netReturnAmount = returnSubtotal - totalReturnDiscount;
      const totalReturnVat = netReturnAmount * (vatRate / 100);
      const finalReturnTotal = netReturnAmount + totalReturnVat;

      const payload = {
        modeOp: 'SAVE',
        srNo: 0,
        srDate: now,
        custAcc: invoiceDetailObject.custAcc,
        srTotal: parseFloat(finalReturnTotal.toFixed(2)),
        srCost: 0,
        srTrRef: customer,
        comments: reason,
        srInvNo: invoiceDetailObject.id + '',
        saleMan: salesMan,
        discAmt: parseFloat(totalReturnDiscount.toFixed(2)),
        glSr: SR_CR_D_Account, // income account take SR-CR-D from gl settings api
        nextSrNo: 0,
        lpoNo: '',
        doNo: 0,
        dueDate: now,
        fDiscAmt: 0,
        srFcTotal: 0,
        rate: 1,
        fc: 'AED',
        areaCode: '',
        deptNo: deptNo,
        jobCode: '',
        upd: '',
        retQty: parseFloat(
          selectedItems.reduce((sum, item) => {
            const qty = parseFloat(qtys[item.id]) || 0;
            const unitPrice = item.price ?? 0;
            const lineSubtotal = qty * unitPrice;
            const lineDiscount = lineSubtotal * discountRatio;
            const lineNet = lineSubtotal - lineDiscount;
            const lineVat = lineNet * (vatRate / 100);
            return sum + lineVat;
          }, 0).toFixed(2)
        ), // earlier i send total of qty returned but after checking backend found out vat amount should be send here 
        vatAcc: SR_VT_D_Account,  // for vat account take SR-VT-D from glsettings api
        stkAcc: '',
        cosAcc: '',
        commAcc: '',
        invMethod: '',
        refComments: reason,
        ccAcc: '',
        status: 'N',
        approvedBy: '',
        approvedDt: now,
        commExpAc: '',
        commCrAc: '',
        comAmt: 0,
        items: selectedItems.map((item, index) => {
          const qty = parseFloat(qtys[item.id]) || 0;
          const unitPrice = item.price ?? 0;
          const lineSubtotal = qty * unitPrice;
          const lineDiscount = lineSubtotal * discountRatio;
          const lineNet = lineSubtotal - lineDiscount;
          const lineVat = lineNet * (vatRate / 100);
          const lineTotal = lineNet + lineVat;

          return {
            slNo: (index + 1).toString(),
            code: item.id,
            description: item.name,
            locn: van === '----' ? '' : van?.trim() ?? '',
            unit: item.unit ?? '',
            qty: qty,
            unitPrice: unitPrice,
            unitCost: 0,
            amount: parseFloat(lineNet.toFixed(2)),
            sel: 'Y',
            cntrl: '',
            fraction: 1,
            vatPercent: vatRate,
            vatAmt: parseFloat(lineVat.toFixed(2)),
            total: parseFloat(lineTotal.toFixed(2)),
            partNo: '',
            returnedTo: '',
            rcPercent: '0',
            invQty: item.qty + '',
            invNo: invoiceDetailObject.id + '',
            comm: 0,
          };
        }),
      };

      console.log('------------------------------------------');
      console.log('payload', payload);
      console.log('🚀 SALES RETURN PAYLOAD GENERATED');
      console.log(`Original Inv Subtotal: ${originalSubtotal.toFixed(2)}`);
      console.log(`Global Discount Rate: ${(discountRatio * 100).toFixed(2)}%`);
      console.log(`Return Subtotal: ${returnSubtotal.toFixed(2)}`);
      console.log(`Applied Discount: -${totalReturnDiscount.toFixed(2)}`);
      console.log(`Net Return: ${netReturnAmount.toFixed(2)}`);
      console.log(`Return VAT: ${totalReturnVat.toFixed(2)}`);
      console.log(`FINAL TOTAL: ${finalReturnTotal.toFixed(2)}`);
      console.log('------------------------------------------');

      const postData = JSON.stringify(payload);
      console.log("stringified json", postData)
      

      const appUrl = await AsyncStorage.getItem('appUrl');

      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsedUserDataArray =
        (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

      let company_code = parsedUserDataArray[0].cmpcode.trim();
      const url = `${appUrl}SalesReturnTransaction?cmpcode=${company_code}`

      console.log("url for api", url)
      // --- AXIOS CALL ---
      const response = await axios.post(url,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        },
      );

      console.log("response from api success", response, response.data)

      // Axios puts the response body in .data
      if (response.data.message?.toUpperCase() === 'SAVED SUCCESSFULLY') {
        Alert.alert('Return Processed Successfully');
        navigation.goBack();
      }
    } catch (err) {

        console.log("response from api", err)

      // Axios Error Handling
      if (err.response) {
        // The server responded with a status code outside of 2xx
        console.log('Server Error Data:', err.response.data);
        console.log('Status Code:', err.response.status);
        Alert.alert(
          `Server Error: ${err.response.status} - ${JSON.stringify(
            err.response.data,
          )}`,
        );
      } else if (err.request) {
        // The request was made but no response was received (Network issues)
        Alert.alert('No response from server. Check your internet connection.');
      } else {
        // Something happened in setting up the request
        Alert.alert('Error: ' + err.message);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };


  const getGLSettings = async () => {
    const appUrl = await AsyncStorage.getItem('appUrl');

    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    let company_code = parsedUserDataArray[0].cmpcode.trim();

    try {
      let apiUrl = `${appUrl}CRMGLSettings/${company_code}/Scrn_code/Sr/-/${deptNo}/-`
      console.log('GL Settings: url', apiUrl);
      const response = await axios.get(apiUrl);
  
      console.log('GL Settings:', response.data);
      setGLSettings(response.data)
      return response.data;
  
    } catch (error) {
      console.error('Error fetching GL Settings:', error.message);
    }
  };
  
  

  useEffect(()=>{


    getGLSettings();
  },[])

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Image
            style={styles.HeadIcon}
            source={require('../../images/leftArrowDark.png')}
          />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          Process Return
        </Text>
        <View style={styles.backBtn} />
      </View>

      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 20}}>
        {/* Customer Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {customer?.slice(0, 2).toUpperCase() || 'NA'}
              </Text>
            </View>
            <View>
              <Text style={styles.customerName}>{customer ?? 'Customer'}</Text>
              <Text style={styles.invoiceId}>INV-{invoiceId}</Text>
            </View>
          </View>
        </View>

        {/* Item Selection Cards */}
        {selectedItems.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Item</Text>
                <Text style={styles.cardValue}>{item.name}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Price</Text>
                <Text style={styles.cardValue}>
                  AED {item.price?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Orig. Qty</Text>
                <Text style={styles.cardValue}>{item.qty}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>RETURN QTY</Text>
              <TextInput
                placeholder="0"
                keyboardType="numeric"
                value={qtys[item.id] || ''}
                onChangeText={v => updateQty(item.id, v)}
                style={[
                  styles.qtyInput,
                  qtys[item.id] && styles.qtyInputFilled,
                ]}
              />
            </View>
          </View>
        ))}

        {/* Reason Card */}
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <TextInput
              placeholder="Enter reason for return..."
              placeholderTextColor="#cbd5e1"
              value={reason}
              onChangeText={setReason}
              style={[
                styles.reasonInput,
                reason.trim() && styles.reasonInputFilled,
              ]}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Summary Card */}
        {selectedItems.some(item => qtys[item.id] > 0) && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Return Summary</Text>

            <View style={styles.divider} />

            {/* Item List */}

            <View style={styles.summaryDivider} />

            {/* Calculations Block */}
            {(() => {
              const currentGross = selectedItems.reduce(
                (sum, item) =>
                  sum + (parseFloat(qtys[item.id]) || 0) * item.price,
                0,
              );
              const currentDiscount = currentGross * discountRatio;
              const currentVAT =
                (currentGross - currentDiscount) * (vatRate / 100);
              const currentNet = currentGross - currentDiscount + currentVAT;

              return (
                <View style={{paddingHorizontal: 14, paddingVertical: 5}}>
                  {/* 1. Gross Amount */}
                  <View style={styles.summaryRowLine}>
                    <Text style={styles.detailLabel}>Gross Amount</Text>
                    <Text style={styles.detailValue}>
                      AED {currentGross.toFixed(2)}
                    </Text>
                  </View>

                  {/* 2. Discount Amount (Only show if > 0) */}
                  {currentDiscount > 0 && (
                    <View style={styles.summaryRowLine}>
                      <Text style={[styles.detailLabel, {color: '#e74c3c'}]}>
                        Total Discount ({(discountRatio * 100).toFixed(1)}%)
                      </Text>
                      <Text style={[styles.detailValue, {color: '#e74c3c'}]}>
                        -AED {currentDiscount.toFixed(2)}
                      </Text>
                    </View>
                  )}

                  {/* 3. VAT Amount */}
                  <View style={styles.summaryRowLine}>
                    <Text style={styles.detailLabel}>VAT ({vatRate}%)</Text>
                    <Text style={styles.detailValue}>
                      AED {currentVAT.toFixed(2)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.summaryDivider,
                      {marginHorizontal: 0, marginTop: 10},
                    ]}
                  />

                  {/* 4. Final Net Amount */}
                  <View
                    style={[styles.summaryTotalRow, {paddingHorizontal: 0}]}>
                    <Text style={styles.summaryTotalLabel}>Net Amount</Text>
                    <Text style={styles.summaryTotalValue}>
                      AED {currentNet.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {/* Submit */}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading} // Disable while calling API
          activeOpacity={0.9}>
          <Text style={styles.submitText}>
            {loading ? 'Processing...' : 'Submit Return'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  HeadIcon: {width: 25, height: 25},
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 14, fontWeight: '600', color: '#0369a1'},
  customerName: {fontSize: 14, fontWeight: '600', color: '#0f172a'},
  invoiceId: {fontSize: 12, color: '#94a3b8', marginTop: 2},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardHeader: {paddingHorizontal: 14, paddingVertical: 11, gap: 6},
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  cardLabel: {fontSize: 12, color: '#64748b', fontWeight: '500'},
  cardValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  divider: {height: 0.5, backgroundColor: '#e2e8f0'},
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.5,
    flex: 1,
  },
  qtyInput: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    textAlign: 'center',
  },
  qtyInputFilled: {
    borderColor: '#bfdbfe',
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
  },
  reasonInput: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    minHeight: 80,
  },
  reasonInputFilled: {
    borderColor: '#bfdbfe',
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    paddingBottom: 4,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
  },
  summaryItemName: {flex: 1, fontSize: 12, color: '#334155'},
  summaryItemQty: {fontSize: 11, color: '#94a3b8'},
  summaryItemTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    minWidth: 80,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 0.5,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 14,
    marginTop: 4,
    marginBottom: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  summaryTotalLabel: {fontSize: 13, fontWeight: '600', color: '#0f172a'},
  summaryTotalValue: {fontSize: 15, fontWeight: '700', color: '#0369a1'},
  submitBtn: {
    backgroundColor: '#0369a1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginHorizontal: 12,
  },
  submitBtnDisabled: {backgroundColor: '#94a3b8'},
  submitText: {color: '#fff', fontSize: 15, fontWeight: '600'},
  summaryRowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
});
