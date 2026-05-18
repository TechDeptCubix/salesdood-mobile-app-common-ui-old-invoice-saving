import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import HeaderUiNew from './HeaderUiNew';
import Icon from 'react-native-vector-icons/Feather';
import RadioGroup from 'react-native-radio-buttons-group';

const EditSalesInvoice = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {id, type} = route.params || {}; // id is INVNO or QUOT NO

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const [cmpcode, setCmpCode] = useState('');
  const [deptNo, setDeptNo] = useState('');
  const [salesMan, setSalesMan] = useState('');
  const [van, setVan] = useState('');
  const [loginUser, setLoginUser] = useState('');

  const [customer, setCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalVat, setTotalVat] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalCostAvg, setTotalCostAvg] = useState(0);

  const [selectedRadio, setSelectedRadio] = useState('CREDIT');
  const [selectedUserType, setSelectedUserType] = useState('reg');
  const [cashCustomerName, setCashCustomerName] = useState('');
  const [cashCustomerAddress, setCashCustomerAddress] = useState('');
  const [customerCashAccount, setCustomerCashAccount] = useState('');
  const [cashCustomerPhone, setCashCustomerPhone] = useState('');
  const [orderRemark, setOrderRemark] = useState('');
  const [trn, setTrn] = useState('');
  const [payment, setPayment] = useState('');
  const [delivery, setDelivery] = useState('');
  const [validity, setValidity] = useState('');
  const [discount, setDiscount] = useState(0);

  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [focusedItemIndex, setFocusedItemIndex] = useState(null);
  const qtyRefs = useRef({});

  const regUnregUserRadio = useMemo(
    () => [
      {
        id: 'reg',
        label: 'Registered',
        value: 'reg',
        labelStyle: {color: '#000000', fontSize: 16},
      },
      {
        id: 'unreg',
        label: 'Un-Registered',
        value: 'unreg',
        labelStyle: {color: '#000000', fontSize: 16},
      },
    ],
    [],
  );

  const cashCreditRadio = useMemo(
    () => [
      {
        id: 'CASH',
        label: 'CASH',
        value: 'CASH',
        disabled: selectedUserType === 'unreg',
        labelStyle: {color: '#000000', fontSize: 16},
      },
      {
        id: 'CREDIT',
        label: 'CREDIT',
        value: 'CREDIT',
        disabled: selectedUserType === 'unreg',
        labelStyle: {color: '#000000', fontSize: 16},
      },
    ],
    [selectedUserType],
  );

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const storedAppUrl = await AsyncStorage.getItem('appUrl');
      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsedUserDataArray =
        (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];
      const storedDeptNo = await AsyncStorage.getItem('DEPTNO');
      const storedSalesMan = await AsyncStorage.getItem('sales_man');
      const storedVan = await AsyncStorage.getItem('VAN');
      const storedLoginUser = await AsyncStorage.getItem('loginUserName');

      setAppUrl(storedAppUrl);
      if (parsedUserDataArray.length > 0) {
        setCmpCode(parsedUserDataArray[0].cmpcode.trim());
      }
      setDeptNo(storedDeptNo || '----');
      setSalesMan(storedSalesMan || '');
      setVan(storedVan || '');
      setLoginUser(storedLoginUser?.trim() || '');

      if (storedAppUrl && parsedUserDataArray.length > 0) {
        const code = parsedUserDataArray[0].cmpcode.trim();
        const dept = storedDeptNo || '----';
        fetchDetails(storedAppUrl, code, dept);
        fetchCashAccount(storedAppUrl, code, dept);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      setLoading(false);
    }
  };

  const fetchCashAccount = async (url, code, dept) => {
    try {
      const appUrlpath = `${url}CRMGLSettings/${code}/Scrn_code/si/-/${dept}/-`;
      const result = await axios.get(appUrlpath);
      const data = result?.data || [];
      const cashAcc = data.find(item => item.Scrn_code === 'SI-CA-D');
      if (cashAcc && cashAcc.ACCOUNT) {
        setCustomerCashAccount(cashAcc.ACCOUNT);
      }
    } catch (error) {
      console.error('Error fetching cash account:', error);
    }
  };

  const handleUserTypeChange = type => {
    setSelectedUserType(type);
    if (type === 'unreg') {
      setSelectedRadio('CASH');
    } else {
      setSelectedRadio('CREDIT');
    }
  };

  const fetchDetails = async (url, code, dept) => {
    try {
      setLoading(true);
      let itemsUrl = '';

      if (type === 'invoice') {
        itemsUrl = `${url}SalesInvoiceDetail/${code}/${id}/${dept}`;
      } else {
        itemsUrl = `${url}Proposal/${code}/QUOTEDETAILS/${id}/${dept}`;
      }

      const itemsResponse = await axios.get(itemsUrl);

      if (itemsResponse.data && itemsResponse.data.length > 0) {
        const transformedItems = itemsResponse.data.map(item => ({
          Code: item.code || item.ITEM_CODE,
          Description: item.Description || item.DESCRIPTION,
          quantity: parseFloat(item.qty || item.QTY || 0),
          unitPrice: parseFloat(item.so_fccost || item.PRICE || 0),
          unit: item.unit || item.UNIT || 'PCS',
          total:
            parseFloat(item.qty || item.QTY || 0) *
            parseFloat(item.so_fccost || item.PRICE || 0),
          VAT: parseFloat(item.VAT || 0),
          Cost_Avg: item.Cost_Avg || 0,
        }));
        setItems(transformedItems);

        const first = itemsResponse.data[0];
        setCustomer({
          name: first.CUSTOMER || first.custref || 'Unknown Customer',
          account: first.cust_acc || first.ACC_CODE || first.cust_code || '',
          trn: first.TRN || '',
          address: first.ADDRESS || '',
          phone: first.phone || '',
        });

        setOrderRemark(first.comments || '');
        setPayment(first.payment || first.terms || '');
        setDelivery(first.delivery || '');
        setValidity(first.validity || '');
        setTrn(first.governor || first.TRN || '');
        setCashCustomerName(first.custref || '');
        setCashCustomerAddress(first.injector || '');
        setCashCustomerPhone(first.starter || '');
        setSelectedRadio(first.enginetype || 'CREDIT');
        setDiscount(first.disc_amt || 0);

        if (first.cashcred === 'C') {
          setSelectedUserType('unreg');
        } else if (first.cashcred === 'R') {
          setSelectedUserType('reg');
        } else {
          if (first.cashcustomer === 'yes' || !first.account) {
            setSelectedUserType('unreg');
          } else {
            setSelectedUserType('reg');
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching details:', error);
      Alert.alert('Error', 'Failed to fetch details');
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateTotals();
  }, [items, discount]);

  const calculateTotals = () => {
    let sub = 0;
    let cost = 0;
    items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      sub += lineTotal;
      cost += item.quantity * (item.Cost_Avg || 0);
    });
    setTotalAmount(sub);
    setTotalCostAvg(cost);

    const discVal = parseFloat(discount) || 0;
    const netTotal = sub - discVal;
    const vat = netTotal * 0.05;

    setTotalVat(vat);
    setGrandTotal(netTotal + vat);
  };

  const handleUpdateQty = (index, val) => {
    const newItems = [...items];
    const qty = parseFloat(val) || 0;
    newItems[index].quantity = qty;
    newItems[index].total = qty * newItems[index].unitPrice;
    setItems(newItems);
  };

  const handleUpdatePrice = (index, val) => {
    const newItems = [...items];
    const price = parseFloat(val) || 0;
    newItems[index].unitPrice = price;
    newItems[index].total = newItems[index].quantity * price;
    setItems(newItems);
  };

  const handleRemoveItem = index => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newItems = items.filter((_, i) => i !== index);
          setItems(newItems);
        },
      },
    ]);
  };

  const searchItems = async query => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      let encodedQuery = encodeURIComponent(query);
      const url = `${appUrl}Search_Items/${cmpcode}/Sitem/${encodedQuery}`;
      const res = await axios.get(url);
      setSearchResults(res.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchCustomers = async query => {
    if (!query) {
      setCustomerSearchResults([]);
      return;
    }
    setIsSearchingCustomer(true);
    try {
      let encodedQuery = encodeURIComponent(query);
      const url = `${appUrl}Search_Customer/${cmpcode}/Cust/${encodedQuery}/${deptNo}`;
      const res = await axios.get(url);
      setCustomerSearchResults(res.data || []);
    } catch (error) {
      console.error('Customer Search error:', error);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const selectCustomer = cust => {
    setCustomer({
      name: cust.Custname,
      account: cust.account,
      trn: cust.TRN || '',
      address: cust.address1 || '',
      phone: cust.phone || '',
    });
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
  };

  const addItemToCart = item => {
    const exists = items.find(i => i.Code === item.Code);
    if (exists) {
      Alert.alert('Already Added', 'This item is already in the list');
      return;
    }

    const newItem = {
      Code: item.Code,
      Description: item.Description,
      quantity: 1,
      unitPrice: parseFloat(item.price || 0),
      unit: item.unit || 'PCS',
      total: parseFloat(item.price || 0),
      VAT: 0,
      Cost_Avg: item.Cost_Avg || 0,
    };
    setItems([newItem, ...items]);
    setSearchQuery('');
    setSearchResults([]);
    setFocusedItemIndex(0);
    setTimeout(() => {
      if (qtyRefs.current[0]) qtyRefs.current[0].focus();
    }, 200);
  };

  const formatDate = date => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const handleSave = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add at least one item');
      return;
    }

    if (selectedUserType === 'reg' && !customer) {
      Alert.alert('No Customer', 'Please select a customer');
      return;
    }

    setSaving(true);
    try {
      const endpoint = type === 'invoice' ? 'SalesInvoice' : 'Sales_Order';
      const apiUrl = `${appUrl}${endpoint}`;
      const VAT_RATE = 5;
      const today = formatDate(new Date());

      const payload = items.map((item, index) => ({
        cmpcode: cmpcode,
        modeop: 'EDIT',
        cashcustomer:
          selectedUserType === 'unreg'
            ? 'yes'
            : selectedRadio === 'CASH'
              ? 'yes'
              : 'no',
        inv_no: id,
        cust_acc:
          selectedUserType === 'reg' && selectedRadio === 'CREDIT' && customer
            ? customer.account
            : customerCashAccount,
        inv_total: String(grandTotal),
        inv_cost: String(totalCostAvg),
        jv_num: '',
        comments: orderRemark || '',
        disc_amt: discount || 0,
        sale_man: salesMan || '',
        lpo_no: '',
        do_no: '0',
        due_date: today,
        area_code: '',
        type: '',
        do_data: '',
        q_no: '0',
        inv_type: '',
        user_id: loginUser,
        fdisc_amt: '0',
        costc: '',
        job_code: '',
        inv_fctota: '0',
        fc: 'AED',
        awb: '',
        blno: '',
        pkg: '',
        rate2: '0',
        rate: '1',
        invcurr: 'AED',
        supl_code: '',
        status: '',
        tr_refno: '',
        payment: payment,
        manuf: '',
        origin: '',
        shipment: '',
        delivery: delivery,
        packing: '',
        netwt: '',
        grosswt: '',
        insurance: '',
        custom: '',
        validity: validity,
        foot1: '',
        frdet: '',
        fruprice: '0',
        framt: '0',
        fob: '',
        repeat: '',
        comm: '0',
        date_paid: today,
        commdue: '0',
        comm_paid: '0',
        commp: '0',
        type_no: '',
        paid_amt: '0',
        client_pd: '',
        tel: '',
        custref:
          selectedUserType === 'reg' && customer
            ? customer.name
            : cashCustomerName,
        terms: payment,
        deptno: deptNo,
        month: '',
        cashcred: '',
        inv_date: today,
        so_no: '0',
        sys_date: today,
        comm_pd_dt: today,
        pump: '',
        governor: trn || '',
        feedpump: '',
        injector: cashCustomerAddress || '',
        starter:
          selectedUserType === 'reg' && customer
            ? customer.phone || ''
            : cashCustomerPhone,
        enginetype: selectedRadio,
        date_prom: today,
        date_delvd: today,
        inv_qty: '0',
        rcvd_amt: '0',
        time: '',
        lab_charge: '0',
        oth_charge: '0',
        s: '',
        m: '0',
        d: '0',
        e: '0',
        w: totalVat.toFixed(2),
        wa: '0',
        pgroup: '',
        upd: '',
        do_date: today,
        lpo_date: today,
        vehicleno: '',
        drivername: '',
        deliv_site: '',
        head1: '',
        cap: '',
        salesacc: '',
        salesAccDesc: '',
        Slno: String(index + 1),
        code: item.Code?.trim(),
        description: item.Description?.trim(),
        locn: van === '----' ? '' : van,
        unit: item.unit,
        qty: item.quantity,
        'Unit Price': String(item.unitPrice),
        'Disc%': '0',
        Amount: String(item.total),
        x: '',
        cntrl: '',
        Fraction: '1',
        'vat%': String(VAT_RATE),
        'Unit Cost': item.Cost_Avg ? String(item.Cost_Avg) : '0',
        dono: '0',
        sono: '0',
        quotno: '0',
        Avlqty: '0',
        Vatamt: (item.unitPrice * item.quantity * (VAT_RATE / 100)).toFixed(2),
        BDiscsplit: '0',
        total: '0',
        oem: '',
        Bin: '',
      }));

      const response = await axios.post(apiUrl, JSON.stringify(payload), {
        headers: {'Content-Type': 'application/json'},
      });

      if (
        response.data.result === 'Saved' ||
        response.data.message === 'Sales order processed successfully'
      ) {
        setSaving(false);
        Alert.alert(
          'Success',
          `${
            type === 'invoice' ? 'Invoice' : 'Quotation'
          } updated successfully`,
          [{text: 'OK', onPress: () => navigation.goBack()}],
        );
      } else {
        throw new Error(
          response.data.result || response.data.message || 'Unknown error',
        );
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', `Failed to save changes: ${error.message}`);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderUiNew
        name={`Edit ${type === 'invoice' ? 'Invoice' : 'Quotation'}`}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'basic' && styles.activeTab]}
            onPress={() => setActiveTab('basic')}>
            <Icon
              name="info"
              size={18}
              color={activeTab === 'basic' ? '#4F46E5' : '#64748B'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'basic' && styles.activeTabText,
              ]}>
              Basic Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}>
            <Icon
              name="shopping-bag"
              size={18}
              color={activeTab === 'items' ? '#4F46E5' : '#64748B'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'items' && styles.activeTabText,
              ]}>
              Items ({items.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{flex: 1}}>
          {activeTab === 'items' && (
            <View style={styles.stickySearchSection}>
              <View style={styles.searchInputWrapper}>
                <Icon
                  name="search"
                  size={18}
                  color="#64748B"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search items..."
                  value={searchQuery}
                  onChangeText={val => {
                    setSearchQuery(val);
                    searchItems(val);
                  }}
                />
                {isSearching && (
                  <ActivityIndicator
                    size="small"
                    color="#4F46E5"
                    style={styles.searchLoader}
                  />
                )}
              </View>

              {searchResults.length > 0 && (
                <View
                  style={styles.searchResultsFloating}
                  onStartShouldSetResponder={() => true}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item, index) => index.toString()}
                    style={{maxHeight: 250}}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="always"
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.searchResultItem}
                        onPress={() => addItemToCart(item)}>
                        <Text style={styles.searchResultText}>
                          {item.Description}
                        </Text>
                        <Text style={styles.searchResultCode}>{item.Code}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>
          )}

          <ScrollView
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled">
            {activeTab === 'basic' ? (
              <View style={{paddingBottom: 20}}>
                {/* User Type */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>User Type</Text>
                  <RadioGroup
                    radioButtons={regUnregUserRadio}
                    onPress={handleUserTypeChange}
                    selectedId={selectedUserType}
                    layout="row"
                    containerStyle={{justifyContent: 'flex-start'}}
                  />
                </View>

                {/* Payment Type (only if registered) */}
                {selectedUserType === 'reg' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Payment Type</Text>
                    <RadioGroup
                      radioButtons={cashCreditRadio}
                      onPress={setSelectedRadio}
                      selectedId={selectedRadio}
                      layout="row"
                      containerStyle={{justifyContent: 'flex-start'}}
                    />
                  </View>
                )}

                {/* Customer Search & Details (only if registered) */}
                {selectedUserType === 'reg' && (
                  <>
                    <View style={styles.searchSection}>
                      <View style={styles.searchInputWrapper}>
                        <Icon
                          name="users"
                          size={18}
                          color="#64748B"
                          style={styles.searchIcon}
                        />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Change customer..."
                          value={customerSearchQuery}
                          onChangeText={val => {
                            setCustomerSearchQuery(val);
                            searchCustomers(val);
                          }}
                        />
                        {isSearchingCustomer && (
                          <ActivityIndicator
                            size="small"
                            color="#4F46E5"
                            style={styles.searchLoader}
                          />
                        )}
                      </View>

                      {customerSearchResults.length > 0 && (
                        <View style={styles.searchResults}>
                          <FlatList
                            data={customerSearchResults}
                            keyExtractor={(item, index) => index.toString()}
                            style={{maxHeight: 200}}
                            nestedScrollEnabled={true}
                            renderItem={({item}) => (
                              <TouchableOpacity
                                style={styles.searchResultItem}
                                onPress={() => selectCustomer(item)}>
                                <Text style={styles.searchResultText}>
                                  {item.Custname}
                                </Text>
                                <Text style={styles.searchResultCode}>
                                  {item.account}
                                </Text>
                              </TouchableOpacity>
                            )}
                          />
                        </View>
                      )}
                    </View>

                    <View style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Icon name="user" size={20} color="#4F46E5" />
                        <Text style={styles.cardTitle}>Customer Details</Text>
                      </View>
                      <View style={styles.customerInfo}>
                        <Text style={styles.customerName}>
                          {customer?.name || 'No Customer Selected'}
                        </Text>
                        <Text style={styles.customerSubText}>
                          Acc: {customer?.account}
                        </Text>
                        {customer?.trn ? (
                          <Text style={styles.customerSubText}>
                            TRN: {customer.trn}
                          </Text>
                        ) : null}
                        {customer?.address ? (
                          <Text style={styles.customerSubText}>
                            {customer.address}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </>
                )}

                {/* Walk-in Details (only if unreg) */}
                {selectedUserType === 'unreg' && (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Icon name="user-plus" size={20} color="#4F46E5" />
                      <Text style={styles.cardTitle}>Walk-in Details</Text>
                    </View>
                    <View style={styles.inputGrid}>
                      <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                          style={styles.textInput}
                          value={cashCustomerName}
                          onChangeText={setCashCustomerName}
                          placeholder="Customer Name"
                        />
                      </View>
                      <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                          style={styles.textInput}
                          value={cashCustomerAddress}
                          onChangeText={setCashCustomerAddress}
                          placeholder="Address"
                        />
                      </View>
                      <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>Phone</Text>
                        <TextInput
                          style={styles.textInput}
                          value={cashCustomerPhone}
                          onChangeText={setCashCustomerPhone}
                          placeholder="Phone"
                        />
                      </View>
                      <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>TRN</Text>
                        <TextInput
                          style={styles.textInput}
                          value={trn}
                          onChangeText={setTrn}
                          placeholder="TRN"
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Order Details */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Icon name="file-text" size={20} color="#4F46E5" />
                    <Text style={styles.cardTitle}>Order Details</Text>
                  </View>
                  <View style={styles.inputGrid}>
                    <View style={styles.inputField}>
                      <Text style={styles.inputLabel}>Remarks</Text>
                      <TextInput
                        style={styles.textInput}
                        value={orderRemark}
                        onChangeText={setOrderRemark}
                        placeholder="Remarks"
                      />
                    </View>
                    <View style={styles.inputField}>
                      <Text style={styles.inputLabel}>Payment Terms</Text>
                      <TextInput
                        style={styles.textInput}
                        value={payment}
                        onChangeText={setPayment}
                        placeholder="Payment Terms"
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{paddingBottom: 20}}>
                <Text style={styles.sectionTitle}>Cart Items</Text>
                {items.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.itemCard,
                      focusedItemIndex === index && styles.itemCardFocused,
                    ]}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.Description}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                        <Icon name="trash-2" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemCode}>{item.Code}</Text>
                    <View style={styles.itemActions}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Qty</Text>
                        <TextInput
                          ref={el => (qtyRefs.current[index] = el)}
                          style={styles.actionInput}
                          keyboardType="numeric"
                          value={item.quantity.toString()}
                          onChangeText={val => handleUpdateQty(index, val)}
                          onFocus={() => setFocusedItemIndex(index)}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Price</Text>
                        <TextInput
                          style={styles.actionInput}
                          keyboardType="numeric"
                          value={item.unitPrice.toString()}
                          onChangeText={val => handleUpdatePrice(index, val)}
                          onFocus={() => setFocusedItemIndex(index)}
                        />
                      </View>
                      <View style={styles.lineTotalWrapper}>
                        <Text style={styles.inputLabel}>Total</Text>
                        <Text style={styles.lineTotalText}>
                          {item.total.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                {items.length === 0 && (
                  <View style={styles.emptyState}>
                    <Icon name="shopping-cart" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyStateText}>
                      No items added yet
                    </Text>
                  </View>
                )}

                {/* Summary Card */}
                <View style={[styles.card, styles.summaryCard]}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                      {totalAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>VAT (5%)</Text>
                    <Text style={styles.summaryValue}>
                      {totalVat.toFixed(2)}
                    </Text>
                  </View>
                  {!['SOCA', 'ICUP'].includes(
                    cmpcode?.toUpperCase()?.trim(),
                  ) && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount</Text>
                      <TextInput
                        style={styles.summaryInput}
                        value={discount.toString()}
                        keyboardType="numeric"
                        onChangeText={text => {
                          const numericText = text.replace(/[^0-9.]/g, '');
                          if (Number(numericText) > totalAmount) {
                            Alert.alert('Error', 'Discount exceeded total');
                          } else {
                            setDiscount(numericText);
                          }
                        }}
                      />
                    </View>
                  )}
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.grandTotalLabel}>Grand Total</Text>
                    <Text style={styles.grandTotalValue}>
                      {grandTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <View style={{height: 100}} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon
                name="check-circle"
                size={20}
                color="white"
                style={{marginRight: 8}}
              />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 12, fontFamily: 'Lexend-Medium', color: '#64748B'},
  scrollView: {flex: 1, padding: 16},
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  cardTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 8,
  },
  customerInfo: {paddingLeft: 4},
  customerName: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 4,
  },
  customerSubText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  inputGrid: {gap: 12},
  inputField: {marginBottom: 4},
  inputLabel: {
    fontFamily: 'Lexend-Medium',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#0F172A',
  },
  sectionTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 12,
  },
  searchSection: {marginBottom: 20, zIndex: 10},
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {marginRight: 8},
  searchInput: {
    flex: 1,
    fontFamily: 'Lexend-Regular',
    fontSize: 15,
    color: '#0F172A',
  },
  searchLoader: {marginLeft: 8},
  searchResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 210,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  searchResultsFloating: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 260,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  stickySearchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
    zIndex: 1000,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchResultText: {
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
    color: '#1E293B',
  },
  searchResultCode: {
    fontFamily: 'Lexend-Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemCardFocused: {
    borderColor: '#4F46E5',
    borderWidth: 2,
    backgroundColor: '#F5F7FF',
    elevation: 4,
    shadowOpacity: 0.1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 15,
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  itemCode: {
    fontFamily: 'Lexend-Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  inputGroup: {flex: 1, marginRight: 12},
  actionInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
    color: '#0F172A',
    textAlign: 'center',
  },
  lineTotalWrapper: {minWidth: 80, alignItems: 'flex-end'},
  lineTotalText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: '#4F46E5',
    height: 36,
    textAlignVertical: 'center',
  },
  emptyState: {alignItems: 'center', justifyContent: 'center', padding: 40},
  emptyStateText: {
    fontFamily: 'Lexend-Medium',
    color: '#94A3B8',
    marginTop: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {backgroundColor: '#EEF2FF'},
  tabText: {fontFamily: 'Lexend-Medium', fontSize: 14, color: '#64748B'},
  activeTabText: {color: '#4F46E5', fontFamily: 'Lexend-SemiBold'},
  summaryCard: {marginTop: 8, backgroundColor: '#F8FAFC'},
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {fontFamily: 'Lexend-Regular', fontSize: 14, color: '#64748B'},
  summaryValue: {fontFamily: 'Lexend-Medium', fontSize: 14, color: '#0F172A'},
  summaryInput: {
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
    color: '#0F172A',
    textAlign: 'right',
    padding: 0,
    width: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  divider: {height: 1, backgroundColor: '#E2E8F0', marginVertical: 12},
  grandTotalLabel: {fontFamily: 'Lexend-Bold', fontSize: 16, color: '#0F172A'},
  grandTotalValue: {fontFamily: 'Lexend-Bold', fontSize: 20, color: '#4F46E5'},
  bottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonDisabled: {backgroundColor: '#94A3B8'},
  saveButtonText: {fontFamily: 'Lexend-Bold', fontSize: 16, color: '#FFFFFF'},
});

export default EditSalesInvoice;
