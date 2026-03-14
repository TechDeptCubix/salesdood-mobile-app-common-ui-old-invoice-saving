// AddNewCustomer.js - Modal for adding a new customer
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const VAT_OPTIONS = ['VAT Applied', 'VAT Exempted', 'Out of Scope'];

const AddNewCustomer = ({visible, onClose, onCustomerAdded}) => {
  const [appUrl, setAppUrl] = useState('');
  const [cmpcode, setCmpCode] = useState('');
  const [deptNo, setDeptNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Salesman dropdown
  const [salesmanList, setSalesmanList] = useState([]);
  const [showSalesmanDropdown, setShowSalesmanDropdown] = useState(false);
  const [salesman, setSalesman] = useState('');
  const [selectedSalesmanLabel, setSelectedSalesmanLabel] = useState('');

  // Form fields
  const [customerLedger] = useState('1205');
  const [accountNo, setAccountNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address1, setAddress1] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [vatOption, setVatOption] = useState('VAT Applied');
  const [showVatDropdown, setShowVatDropdown] = useState(false);
  const [trn, setTrn] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  useEffect(() => {
    if (visible) {
      loadStoredData();
    }
  }, [visible]);

  const loadStoredData = async () => {
    try {
      setLoading(true);
      const storedAppUrl = await AsyncStorage.getItem('appUrl');
      const storedDeptNo = await AsyncStorage.getItem('DEPTNO');
      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsedUserDataArray =
        (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

      let resolvedUrl = storedAppUrl || '';
      let resolvedCmp = '';
      let resolvedDept = storedDeptNo || '';
      console.log('Resolved URL:', resolvedUrl);

      if (storedAppUrl) setAppUrl(storedAppUrl);
      if (storedDeptNo) setDeptNo(storedDeptNo);
      if (parsedUserDataArray.length > 0) {
        resolvedCmp = parsedUserDataArray[0].cmpcode.trim();
        setCmpCode(resolvedCmp);
      }

      await Promise.all([
        fetchNextAccountNo(resolvedUrl, resolvedCmp, resolvedDept),
        fetchSalesmanList(resolvedUrl, resolvedCmp, resolvedDept),
      ]);

      setLoading(false);
    } catch (error) {
      console.log('loadStoredDataError', error);
      setLoading(false);
    }
  };

  const fetchNextAccountNo = async (url, cmp, dept) => {
    try {
      // Build the full URL
      const fullUrl = `${url}CRMGLSettings/${cmp}/ACCOUNTNEWNUM/1205/-/-/-`;

      // Log the URL being called
      console.log('Calling fetchNextAccountNo API:', fullUrl);

      // Make the API request
      const response = await axios.get(fullUrl);

      // Log the full response object for debugging
      console.log(
        'fetchNextAccountNo API Response:',
        JSON.stringify(response.data, null, 2),
      );

      // Check if data exists
      if (
        response.data &&
        response.data.length > 0 &&
        response.data[0].Column1
      ) {
        const nextAccNo = response.data[0].Column1.toString();
        setAccountNo(nextAccNo);
        console.log('Next account number fetched:', nextAccNo);
      } else {
        console.log('No account number returned from API.');
      }
    } catch (error) {
      console.log('fetchNextAccountNoError', error);
    }
  };

  const fetchSalesmanList = async (url, cmp, dept) => {
    try {
      const response = await axios.get(
        `${url}MasterCount/${cmp}/SALESPERSONLIST/-/${dept}`,
      );

      if (response.data && Array.isArray(response.data)) {
        setSalesmanList(response.data);

        // 🔹 AUTO-SELECT FROM LOCAL STORAGE
        const storedSalesmanName = await AsyncStorage.getItem('sales_man');

        if (storedSalesmanName) {
          // Find the salesman object that matches the stored name
          const matchedSalesman = response.data.find(
            item => item.NAME === storedSalesmanName,
          );

          if (matchedSalesman) {
            const label = matchedSalesman.NAME;
            const value = matchedSalesman.EMP_ID || label;

            // Set your states so the dropdown shows the checkmark and label
            setSalesman(value);
            setSelectedSalesmanLabel(label);
          }
        }
      }
    } catch (error) {
      console.log('fetchSalesmanListError', error);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setAddress1('');
    setOpeningBalance('');
    setVatOption('VAT Applied');
    setTrn('');
    setPhone('');
    setCreditLimit('');
    setAccountNo('');
    setSalesman('');
    setSelectedSalesmanLabel('');
    setShowVatDropdown(false);
    setShowSalesmanDropdown(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert('Validation', 'Customer Name is required.');
      return;
    }
    if (!salesman) {
      Alert.alert('Validation', 'Please select a Salesman.');
      return;
    }

    try {
      setSubmitting(true);

      const apiURL = `${appUrl}CRMCustSupptCRMReg`;
      console.log('Submitting to API URL:', apiURL);
      const payload = [
        {
          cmpcode: cmpcode,
          mod: 'I',
          account: accountNo || '',
          acctype: customerLedger || '', // ledger 1205 maps to acctype
          accdesc: customerName || '',
          balance_open: Number(openingBalance) || 0,
          curbalance_open: 0,
          dr: 0,
          cr: 0,
          fc: 'AED',
          fdr: 0,
          fcr: 0,
          divcode: '',
          keywords: '',
          adr1: address1 || '',
          adr2: '',
          adr3: '',
          adr4: '',
          adr5: '',
          tel: '',
          fax: '',
          mobile: phone || '',
          salesman: salesman || '',
          areacode: '',
          email: '',
          remarks: '',
          country: '',
          state: '',
          crlimit: Number(creditLimit) || 0,
          curcrlimit: 0,
          currency: 'AED',
          duedays: 0,
          terms: '',
          crmethod: '',
          cntrlcode: 'CUST',
          avtive: 'Y',
          colourcode: '',
          price_cat: '',
          grade: '',
          vattype: vatOption || '',
          vatregno: '',
          shippingadr: '',
          create_user: '',
          discount: 0,
          margin: 0,
          GPSCorditate: '',
          PriWhatsapp: '',
          OtWhatsapp: '',
          QtnStat: '',
          InvStat: '',
          RetnStat: '',
          UserTrn: trn || '',
          UseForDel: '',
          custtype: 'LOCAL',
          autoid: '1',
          patron: '',
          patrontype: '',
          officenumber: '',
          regno: '',
          dumpfield: '',
        },
      ];
      console.log(
        'Submitting new customer with payload:',
        JSON.stringify(payload, null, 2),
      );

      const response = await axios.post(apiURL, payload, {
        headers: {'Content-Type': 'application/json'},
      });

      console.log('Customer saved:', response);

      Alert.alert('Success', 'Customer added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            if (onCustomerAdded) onCustomerAdded();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.log('handleSubmitError', error);
      Alert.alert('Error', 'Failed to add customer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.Overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.KeyboardView}>
          <View style={styles.ModalContainer}>
            {/* ── Header ── */}
            <View style={styles.ModalHeader}>
              <View style={styles.HeaderLeft}>
                <Icon name="person-add" size={20} color="#fff" />
                <Text style={styles.ModalTitle}>New Customer</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.CloseBtn}>
                <Icon name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.LoadingCont}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.LoadingText}>Loading...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.FormScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {/* ── Ledger + Account No (both read-only) ── */}
                <View style={styles.RowWrap}>
                  <View style={[styles.FieldGroup, {flex: 1, marginRight: 8}]}>
                    <Text style={styles.Label}>Customer Ledger</Text>
                    <View style={[styles.InputBox, styles.DisabledBox]}>
                      <TextInput
                        style={[styles.Input, styles.DisabledInput]}
                        value={customerLedger}
                        editable={false}
                      />
                    </View>
                  </View>

                  <View style={[styles.FieldGroup, {flex: 1}]}>
                    <Text style={styles.Label}>Account No</Text>
                    <View style={[styles.InputBox, styles.DisabledBox]}>
                      <TextInput
                        style={[styles.Input, styles.DisabledInput]}
                        value={accountNo}
                        editable={false}
                        placeholder="000000"
                        placeholderTextColor="#aaa"
                      />
                    </View>
                  </View>
                </View>

                {/* ── Customer Name ── */}
                <View style={styles.FieldGroup}>
                  <Text style={styles.Label}>
                    Customer Name <Text style={styles.Required}>*</Text>
                  </Text>
                  <View style={styles.InputBox}>
                    <TextInput
                      style={styles.Input}
                      value={customerName}
                      onChangeText={setCustomerName}
                      placeholder="Enter customer name"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                </View>

                {/* ── Salesman Dropdown ── */}
                <View style={styles.FieldGroup}>
                  <Text style={styles.Label}>
                    Salesman <Text style={styles.Required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.DropdownBox}
                    onPress={() => {
                      setShowSalesmanDropdown(prev => !prev);
                      setShowVatDropdown(false);
                    }}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.DropdownText,
                        !selectedSalesmanLabel && styles.DropdownPlaceholder,
                      ]}>
                      {selectedSalesmanLabel || 'Select salesman'}
                    </Text>
                    <Icon
                      name={
                        showSalesmanDropdown ? 'expand-less' : 'expand-more'
                      }
                      size={22}
                      color="#555"
                    />
                  </TouchableOpacity>

                  {showSalesmanDropdown && (
                    <View style={styles.DropdownList}>
                      {salesmanList.length === 0 ? (
                        <View style={styles.DropdownItem}>
                          <Text style={styles.DropdownEmptyText}>
                            No salesmen found
                          </Text>
                        </View>
                      ) : (
                        salesmanList.map((item, idx) => {
                          const label = item.NAME;
                          const value = item.EMP_ID || label;
                          const isActive = salesman === value;

                          return (
                            <TouchableOpacity
                              key={idx}
                              style={[
                                styles.DropdownItem,
                                isActive && styles.DropdownItemActive,
                              ]}
                              onPress={() => {
                                setSalesman(value);
                                setSelectedSalesmanLabel(label);
                                setShowSalesmanDropdown(false);
                              }}>
                              <Text
                                style={[
                                  styles.DropdownItemText,
                                  isActive && styles.DropdownItemTextActive,
                                ]}>
                                {label}
                              </Text>
                              {isActive && (
                                <Icon name="check" size={16} color="#007BFF" />
                              )}
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                  )}
                </View>

                {/* ── Phone ── */}
                <View style={styles.FieldGroup}>
                  <Text style={styles.Label}>Phone</Text>
                  <View style={styles.InputBox}>
                    <TextInput
                      style={styles.Input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Enter phone number"
                      placeholderTextColor="#aaa"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* ── Address (single line) ── */}
                <View style={styles.FieldGroup}>
                  <Text style={styles.Label}>Address</Text>
                  <View style={styles.InputBox}>
                    <TextInput
                      style={styles.Input}
                      value={address1}
                      onChangeText={setAddress1}
                      placeholder="Enter address"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                </View>

                {/* ── Opening Balance + Credit Limit ── */}
                <View style={styles.RowWrap}>
                  <View style={[styles.FieldGroup, {flex: 1, marginRight: 8}]}>
                    <Text style={styles.Label}>Opening Balance</Text>
                    <View style={styles.InputBox}>
                      <TextInput
                        style={styles.Input}
                        value={openingBalance}
                        onChangeText={setOpeningBalance}
                        placeholder="0.00"
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.FieldGroup, {flex: 1}]}>
                    <Text style={styles.Label}>Credit Limit</Text>
                    <View style={styles.InputBox}>
                      <TextInput
                        style={styles.Input}
                        value={creditLimit}
                        onChangeText={setCreditLimit}
                        placeholder="0.00"
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* ── VAT Info Dropdown ── */}
                <View style={styles.FieldGroup}>
                  <Text style={styles.Label}>VAT Info</Text>
                  <TouchableOpacity
                    style={styles.DropdownBox}
                    onPress={() => {
                      setShowVatDropdown(prev => !prev);
                      setShowSalesmanDropdown(false);
                    }}
                    activeOpacity={0.8}>
                    <Text style={styles.DropdownText}>{vatOption}</Text>
                    <Icon
                      name={showVatDropdown ? 'expand-less' : 'expand-more'}
                      size={22}
                      color="#555"
                    />
                  </TouchableOpacity>

                  {showVatDropdown && (
                    <View style={styles.DropdownList}>
                      {VAT_OPTIONS.map((opt, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.DropdownItem,
                            vatOption === opt && styles.DropdownItemActive,
                          ]}
                          onPress={() => {
                            setVatOption(opt);
                            setShowVatDropdown(false);
                          }}>
                          <Text
                            style={[
                              styles.DropdownItemText,
                              vatOption === opt &&
                                styles.DropdownItemTextActive,
                            ]}>
                            {opt}
                          </Text>
                          {vatOption === opt && (
                            <Icon name="check" size={16} color="#007BFF" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* ── TRN (Important) ── */}
                <View style={styles.FieldGroup}>
                  <View style={styles.TRNLabelRow}>
                    <Text
                      style={[styles.Label, {marginLeft: 4, marginBottom: 0}]}>
                      TRN
                    </Text>
                  </View>
                  <View style={[styles.InputBox]}>
                    <TextInput
                      style={styles.Input}
                      value={trn}
                      onChangeText={setTrn}
                      placeholder="Enter TRN number"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={{height: 24}} />
              </ScrollView>
            )}

            {/* ── Footer ── */}
            {!loading && (
              <View style={styles.Footer}>
                <TouchableOpacity
                  style={styles.CancelBtn}
                  onPress={handleClose}
                  disabled={submitting}>
                  <Text style={styles.CancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.SaveBtn, submitting && styles.SaveBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="save" size={16} color="#fff" />
                      <Text style={styles.SaveText}> Save Customer</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  Overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  KeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ModalContainer: {
    backgroundColor: '#F5F7FB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  ModalHeader: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  HeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ModalTitle: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Lexend-Bold',
    marginLeft: 8,
  },
  CloseBtn: {
    padding: 4,
  },
  LoadingCont: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  LoadingText: {
    marginTop: 10,
    fontFamily: 'Lexend-Regular',
    color: '#555',
  },
  FormScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  RowWrap: {
    flexDirection: 'row',
    width: '100%',
  },
  FieldGroup: {
    marginBottom: 14,
  },
  Label: {
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: '#444',
    marginBottom: 5,
  },
  Required: {
    color: '#E53935',
    fontFamily: 'Lexend-Bold',
  },
  FixedTag: {
    color: '#999',
    fontSize: 11,
  },
  InputBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE3F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  DisabledBox: {
    backgroundColor: '#EAECF5',
    borderColor: '#D0D5E8',
  },
  Input: {
    flex: 1,
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#2B2B2B',
  },
  DisabledInput: {
    color: '#888',
  },
  DropdownBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE3F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  DropdownText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#2B2B2B',
  },
  DropdownPlaceholder: {
    color: '#aaa',
  },
  DropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE3F0',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    elevation: 6,
  },
  DropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  DropdownItemActive: {
    backgroundColor: '#EBF3FF',
  },
  DropdownItemText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#2B2B2B',
  },
  DropdownItemTextActive: {
    color: '#007BFF',
    fontFamily: 'Lexend-Bold',
  },
  DropdownEmptyText: {
    fontFamily: 'Lexend-Light',
    fontSize: 13,
    color: '#999',
  },
  TRNLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ImportantBadge: {
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  ImportantText: {
    color: '#E53935',
    fontSize: 10,
    fontFamily: 'Lexend-Bold',
  },
  TRNBox: {
    borderColor: '#FFCDD2',
    borderWidth: 1.5,
  },
  Footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF5',
    backgroundColor: '#fff',
  },
  CancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD0E0',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  CancelText: {
    fontFamily: 'Lexend-Regular',
    color: '#555',
    fontSize: 14,
  },
  SaveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  SaveBtnDisabled: {
    backgroundColor: '#90C1FF',
  },
  SaveText: {
    fontFamily: 'Lexend-Bold',
    color: '#fff',
    fontSize: 14,
  },
});

export default AddNewCustomer;
