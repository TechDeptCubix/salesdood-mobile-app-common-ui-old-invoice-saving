import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Header from './Header';
import axios from 'axios';
import MakeQuotationPopup from '../popups/MakeQuotationPopup';
import ToastManager, {Toast} from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import REACT_APP_BASE_URL from '../url/AppUrl';
import HeaderUiNew from './HeaderUiNew';
import {format} from 'date-fns';
import RadioGroup from 'react-native-radio-buttons-group';
import formatPrice3Decimal from '../utils';

import {SERVER_KEY} from '@env';
import {resolver} from '../metro.config';
import SelectedStockPopQuotation from './SelectedStockPopQuotation';

const MakeQuotation = ({route}) => {
  const [isCallingDueDateApi, setIsCallingDueDateApi] = useState(false);
  const [isCallingPriceManagementApi, setIsCallingpriceManagementApi] =
    useState(false);
  const [isCallingBulkApi, setIsCallingBulkPriceApi] = useState(false);

  const {orderId, type} = route.params || {};

  const navigation = useNavigation();

  const [customerSearchItem, setCustomerSearchItem] = useState('');

  const [customerData, setCustomerData] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [showActivity, setShowActivity] = useState(false);

  const [showCashCust, setShowCashCust] = useState(false);

  const [searchItem, setSearchItem] = useState('');

  const [stockData, setStockData] = useState(null);

  const [selectedStock, setSelectedStock] = useState(null);

  const [selectedSearchItem, setSelectedSearchItem] = useState('');

  const [quantity, setQuantity] = useState('');

  const [unitPrice, setUnitPrice] = useState('');

  const [savedItemData, setSavedItemData] = useState([]);

  const [totalUnitPrice, setTotalUnitPrice] = useState();

  const [showSelectedStockPop, setShowSelectedStockPop] = useState(false);

  const [showQuotationPop, setShowQuotationPop] = useState(false);

  const [cashCustomerName, setCashCustomerName] = useState('');

  const [cashCustomerAddress, setCashCustomerAddress] = useState('');

  const [cashCustomerPhone, setCashCustomerPhone] = useState('');

  const [orderRemark, setOrderRemark] = useState('');

  const [trn, setTrn] = useState('');

  const [payment, setPayment] = useState('');

  const [delivery, setDelivery] = useState('');

  const [validity, setValidity] = useState('');

  const [itemList, setItemList] = useState(null);

  const [editData, setEditData] = useState(null);

  const [salesMan, setSalesMan] = useState('');

  const [showItemSrchAct, setShowItemSrchAct] = useState(false);

  const [error, setError] = useState('');

  const isDataLoadedRef = useRef(false);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [showResetPop, setShowResetPop] = useState(false);

  const [customerSearchError, setCustomerSearchError] = useState('');

  const [stockSearchError, setStockSearchError] = useState('');

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [deptNo, setDeptNo] = useState('');

  const [van, setVan] = useState('');

  const [showDetails, setShowDetails] = useState(false);

  const searchUserInputRef = useRef(null);

  const searchItemInpRef = useRef(null);

  const qtyInpRef = useRef(null);

  const unitPriceInpRef = useRef(null);

  const cashCustNameRef = useRef(null);

  const cashCustAddressRef = useRef(null);

  const cashCustPhoneRef = useRef(null);

  const [selectedTab, setSelectedTab] = useState('Customer');

  const [walkSelectTab, setWalkSelectTab] = useState('WalkCustomer');

  const [selectedRadio, setSelectedRadio] = useState('CREDIT');

  const [selectedUserType, setSelectedUserType] = useState('reg');

  const [customerCreditBlocked, setCustomerCreditBlocked] = useState(false);

  const [totalWithVAT, setTotalWithVAT] = useState(0);

  const [showCartPanel, setShowCartPanel] = useState(false);

  const [showUnitPop, setShowUnitPop] = useState(false);

  const [unitValue, setUnitValue] = useState('PCS');

  const [blocknextButtonView, setBlockNextButtonView] = useState(false);

  const [operationType, setOperationType] = useState('');

  const [custPriceGrp, setCustPriceGrp] = useState('');

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'dd-MMM-yyyy');
  const formattedTime = format(currentDate, 'h:mm a');

  const cashCreditRadio = useMemo(
    () => [
      {
        id: 'CASH', // acts as primary key, should be unique and non-empty string
        label: 'CASH',
        value: 'CASH',
        disabled: selectedUserType === 'unreg',
        color: 'black',
        labelStyle: styles.radioButtonText,
      },
      {
        id: 'CREDIT',
        label: 'CREDIT',
        value: 'CREDIT',
        disabled: selectedUserType === 'unreg',
        color: 'black',
        labelStyle: styles.radioButtonText,
      },
    ],
    [selectedUserType],
  );

  const regUnregUserRadio = useMemo(
    () => [
      {
        id: 'reg',
        label: 'Registered',
        value: 'reg',
        color: 'black',
        labelStyle: styles.radioButtonText,
      },
      {
        id: 'unreg',
        label: 'Un-Registered',
        value: 'unreg',
        color: 'black',
        labelStyle: styles.radioButtonText,
      },
    ],
    [],
  );

  const calculateTotalWithVAT = items => {
    const vatRate = 0.05;
    const total = items.reduce((acc, item) => acc + parseFloat(item.total), 0);
    const totalIncludingVAT = total + total * vatRate;
    return totalIncludingVAT;
  };

  useEffect(() => {
    if (searchUserInputRef.current) {
      searchUserInputRef.current.focus();
    }
  }, []);

  // useEffect(() => {
  //     if (showCashCust && cashCustNameRef.current) {
  //         cashCustNameRef.current.focus()
  //     }
  // }, [showCashCust])

  const fetchAsyncUser = async () => {
    const salesMan = await AsyncStorage.getItem('sales_man');

    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    const deptno = await AsyncStorage.getItem('DEPTNO');

    const van = await AsyncStorage.getItem('VAN');

    if (parsedUserDataArray) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim().toUpperCase());
    }

    const appUrl = await AsyncStorage.getItem('appUrl');
    if (appUrl) {
      setAppUrl(appUrl);
    }

    if (van) {
      setVan(van);
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

  const handleRemoveItem = async itemcode => {
    setShowSelectedStockPop(false);
    const filteredItems = savedItemData.filter(item => item.Code !== itemcode);
    setSavedItemData(filteredItems);
    await AsyncStorage.setItem('savedItemData', JSON.stringify(filteredItems));
    updateTotalUnitPrice(filteredItems);
    showItemRemove();
  };

  const handleEditRemoveItem = async itemcode => {
    setShowSelectedStockPop(false);
    const filteredItems = savedItemData.filter(item => item.Code !== itemcode);
    setSavedItemData(filteredItems);
    await AsyncStorage.setItem('savedItemData', JSON.stringify(filteredItems));
  };

  const EditItem = item => {
    setShowSelectedStockPop(false);
    handleEditRemoveItem(item.Code);
    console.log('editItem', item.unitPrice);
    setSelectedStock(item);
    setQuantity(item.quantity?.toString());
    setUnitPrice(item.unitPrice?.toString());
  };

  const searchCustomer = async value => {
    setShowActivity(true);
    console.log(`${appUrl}Search_Customer/${cmpcode}/Cust/${value}/${deptNo}`);
    try {
      await axios
        .get(`${appUrl}Search_Customer/${cmpcode}/Cust/${value}/${deptNo}`)
        .then(res => {
          const data = res.data;

          // Limit the data to the first 25 items
          const limitedData = data.slice(0, 25);

          // Set the limited data to the state
          setCustomerData(limitedData);
        });
      setShowActivity(false);
    } catch (error) {
      console.log('searchCustomererror', error);
      setShowActivity(false);
      setCustomerSearchError('Some Error Occured, Please Try again Later');
    }
  };

  const searchEditCustomer = async value => {
    // setShowActivity(true)
    console.log('searchEditCustomer', value);
    try {
      await axios
        .get(`${appUrl}Search_Customer/${cmpcode}/Cust/${value}/${deptNo}`)
        .then(res => {
          setSelectedCustomer(res.data[0]);
          AsyncStorage.setItem('selectedCustomer', JSON.stringify(res.data))
            .then(() => console.log('Data saved successfully'))
            .catch(error => console.log('Error saving data', error));
        });
      // setShowActivity(false)
    } catch (error) {
      console.log('searchEditCustomererror', error);
      // setShowActivity(false)
    }
  };

  useEffect(() => {
    if (customerSearchItem !== '') {
      searchCustomer(customerSearchItem);
      // setSelectedCustomer(null)
    }
    if (customerSearchItem === '') {
      setCustomerData(null);
      // setSelectedStock(null)

      console.log('nosrchuf');
    }
  }, [customerSearchItem]);

  useEffect(() => {
    if (selectedCustomer) {
      console.log('insideSlecCustBlock');

      if (selectedCustomer.PRICEGRP === 'A') {
        setCustPriceGrp('price_A');
      }
      if (selectedCustomer.PRICEGRP === 'B') {
        setCustPriceGrp('price_B');
      }
      if (selectedCustomer.PRICEGRP === 'C') {
        setCustPriceGrp('price_C');
      }

      if (selectedCustomer.PRICEGRP === '') {
        setCustPriceGrp('price');
      }

      setCustomerData('');
      setCustomerSearchItem('');

      // const removeCashCust = async () => {
      //     try {
      //         await AsyncStorage.removeItem('cashCustomerName')
      //         await AsyncStorage.removeItem('cashCustomerAddress')
      //         await AsyncStorage.removeItem('cashCustomerPhone')

      //         setShowCashCust(false)
      //     } catch (error) {
      //         console.log('removeCashCustErr', error)
      //     }
      // }

      // removeCashCust()

      if (selectedCustomer.CREDITMETHOD == 'BLOCKED') {
        setCustomerCreditBlocked(true);
        Alert.alert('This customer is blocked for any kind of transaction');
      }

      if (
        selectedCustomer.CREDITMETHOD == 'CREDIT BLOCK' &&
        selectedRadio === 'CREDIT'
      ) {
        console.log('insideSlecCustCREDITBLOCK');
        setCustomerCreditBlocked(false);

        if (selectedCustomer.Avai_Bal > selectedCustomer.Credit_Limit) {
          setBlockNextButtonView(true);
          Alert.alert(
            'Amount Exceed',
            'Available balance is greater than Credit limit. Please choose cash customer to add more items.',
            [{text: 'OK'}],
          );
        }
        if (selectedCustomer.Avai_Bal <= 0) {
          setBlockNextButtonView(true);
          Alert.alert(
            'Amount Zero',
            'Available balance is Zero. Please choose cash customer to add more items.',
            [{text: 'OK'}],
          );
        }
      }

      if (selectedCustomer.CREDITMETHOD == 'OPEN') {
        setCustomerCreditBlocked(false);
        setCustomerSearchItem('');
        setTrn(selectedCustomer.TRN);
        setPayment(selectedCustomer.terms);
        setBlockNextButtonView(false);

        // if (selectedCustomer) {
        // }

        if (selectedCustomer && searchItemInpRef.current) {
          searchItemInpRef.current.focus();
        }
      }
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (savedItemData) {
      const totalIncludingVAT = calculateTotalWithVAT(savedItemData);
      setTotalWithVAT(totalIncludingVAT);
    }
  }, [savedItemData]);

  const searchStock = async value => {
    let encodedvalue = encodeURIComponent(value);

    const url = `${appUrl}Search_Items/${cmpcode}/Sitem/${encodedvalue}`;

    console.log('value before and after:', value, encodedvalue);
    console.log('search api url:', url);

    setShowItemSrchAct(true);

    try {
      const res = await axios.get(url);

      console.log('searched item:', res.data);

      setStockData(res.data);
    } catch (error) {
      console.log('searchStockError:', error);
      setStockSearchError('Some Error Occured, Please Try again Later');
    } finally {
      setShowItemSrchAct(false);
    }
  };

  const isDueDateExceeded = async () => {
    return new Promise((resolve, reject) => {
      setIsCallingDueDateApi(true);

      let appUrlDueDate = `${appUrl}MasterCount/${cmpcode}/duedays/${selectedCustomer.account?.trim()}/${deptNo}`;
      console.log('res due days ->1', appUrlDueDate);

      axios
        .get(
          `${appUrl}MasterCount/${cmpcode}/duedays/${selectedCustomer.account?.trim()}/${deptNo} `,
        )
        .then(res => {
          setIsCallingDueDateApi(false);

          console.log('res due days ->2', res.data);

          if (res.data?.length == 0) {
            resolve(false);
          }

          let duedays = res.data[0].duedays;
          let ddays = res.data[0].ddays;

          console.log('res due days ->2', res.data, duedays, ddays);

          if (ddays > 0) {
            if (duedays > ddays) {
              resolve(false);
            } else {
              resolve(true);
            }
          } else {
            resolve(false);
          }
        })
        .catch(err => {
          setIsCallingDueDateApi(false);
          console.log('err is -> ++ ', err);
          reject(null);
        });
    });
  };

  useEffect(() => {
    if (searchItem !== '') {
      searchStock(searchItem);
      setSelectedStock(null);
      setSelectedSearchItem(searchItem);
    }
    if (searchItem == '') {
      setStockData(null);
      // setSelectedStock(null)
    }
  }, [searchItem]);

  useEffect(() => {
    console.log('selectedStock+++', selectedStock);

    if (selectedStock) {
      setSearchItem('');
      if (
        cmpcode?.trim().toUpperCase() == 'SUPERLAND' ||
        cmpcode?.trim().toUpperCase() == 'POPULAR'
      ) {
        setUnitPrice(selectedStock['price'].toString());
        setQuantity('1');
      } else {
        setUnitPrice(
          selectedStock[custPriceGrp]
            ? selectedStock[custPriceGrp].toString()
            : '',
        );
      }
    }

    if (selectedStock && qtyInpRef.current) {
      qtyInpRef.current.focus();
    }
  }, [selectedStock]);

  const NextClick = async () => {
    if (selectedCustomer || cashCustomerName) {
      if (
        selectedRadio === 'CREDIT' &&
        selectedCustomer.CREDITMETHOD == 'CREDIT BLOCK'
      ) {
        if (totalWithVAT > selectedCustomer.Avai_Bal) {
          Alert.alert(
            'Amount Exceed',
            'Amount exceed available limit. Please choose cash customer to add more items.',
            [{text: 'OK'}],
          );
          return;
        }
      }

      // check for due date

      //commented because due date may not have importance in quotation

      // let resultOfDueDays = await isDueDateExceeded()

      // console.log("resultOfDueDays>>+++", resultOfDueDays)

      // if (resultOfDueDays == true) {
      //     Alert.alert(
      //         'Due Days',
      //         'Due Days Limit Exceeded',
      //         [{ text: 'OK' }]
      //     );
      //     return
      // } else if (resultOfDueDays == null) {
      //     Alert.alert(
      //         'Due Days',
      //         'Something went wrong... cannot proceed',
      //         [{ text: 'OK' }]
      //     );
      //     return
      // }

      if (selectedUserType === 'reg') {
        await AsyncStorage.setItem(
          'selectedCustomer',
          JSON.stringify(selectedCustomer),
        );
        await AsyncStorage.setItem(
          'orderRemark',
          orderRemark ? orderRemark : '',
        );
        await AsyncStorage.setItem('payment', payment ? payment : '');
        await AsyncStorage.setItem('delivery', delivery ? delivery : '');
        await AsyncStorage.setItem('validity', validity ? validity : '');
        await AsyncStorage.setItem('trn', trn ? trn : '');
        Keyboard.dismiss();
        setShowCartPanel(true);
      }

      if (selectedUserType === 'unreg') {
        await AsyncStorage.setItem(
          'cashCustomerName',
          cashCustomerName ? cashCustomerName : '',
        );
        await AsyncStorage.setItem(
          'cashCustomerAddress',
          cashCustomerAddress ? cashCustomerAddress : '',
        );
        await AsyncStorage.setItem(
          'cashCustomerPhone',
          cashCustomerPhone ? cashCustomerPhone : '',
        );
        await AsyncStorage.setItem(
          'orderRemark',
          orderRemark ? orderRemark : '',
        );
        await AsyncStorage.setItem('trn', trn ? trn : '');
        await AsyncStorage.setItem('payment', payment ? payment : '');
        await AsyncStorage.setItem('delivery', delivery ? delivery : '');
        await AsyncStorage.setItem('validity', validity ? validity : '');
        Keyboard.dismiss();
        setShowCartPanel(true);
      }
    } else {
      showAddToCartCustomerErr();
    }
  };

  const SaveItem = async () => {
    // Retrieve existing savedItemData from AsyncStorage
    const savedItemDataString = await AsyncStorage.getItem('savedItemData');
    const savedItemDataArray = savedItemDataString
      ? JSON.parse(savedItemDataString)
      : [];

    console.log('savedItemDataArray', savedItemDataArray);

    if (!selectedStock) {
      showAddToCartEmptyErr();
      return;
    }

    // // Check if the item already exists in the list
    const itemExists = savedItemDataArray.some(
      item => item.Code === selectedStock.Code,
    );

    console.log('itemExists', itemExists);

    if (itemExists) {
      showItemExistError();
      setQuantity('');
      setUnitPrice('');
      setSelectedStock(null);
      return; // Exit the function
    }

    if (
      selectedStock &&
      quantity &&
      unitPrice &&
      selectedCustomer &&
      !cashCustomerName &&
      selectedCustomer.CREDITMETHOD == 'CREDIT BLOCK'
    ) {
      const newItem = {
        ...selectedStock,
        quantity: parseFloat(quantity).toFixed(2),
        unitPrice: parseFloat(unitPrice).toFixed(2),
        total: quantity * unitPrice,
      };

      // Add the new item to the list
      const updatedSavedItemData = [...savedItemDataArray, newItem];

      const totalIncludingVAT = calculateTotalWithVAT(updatedSavedItemData);

      if (
        totalIncludingVAT &&
        totalIncludingVAT > selectedCustomer.Avai_Bal &&
        selectedRadio === 'CREDIT'
      ) {
        Alert.alert(
          'Amount Exceed',
          'Amount exceed available limit. Please choose cash customer to add more items.',
          [{text: 'OK'}],
        );
        return;
      } else {
        // Save the updated list back to AsyncStorage
        await AsyncStorage.setItem(
          'savedItemData',
          JSON.stringify(updatedSavedItemData),
        );

        await AsyncStorage.setItem(
          'selectedCustomer',
          JSON.stringify(selectedCustomer),
        );
        // await AsyncStorage.setItem('savedItemData', JSON.stringify(savedItemData))
        await AsyncStorage.setItem(
          'orderRemark',
          orderRemark ? orderRemark : '',
        );
        await AsyncStorage.setItem('trn', trn ? trn : '');
        await AsyncStorage.setItem('payment', payment ? payment : '');
        await AsyncStorage.setItem('delivery', delivery ? delivery : '');
        await AsyncStorage.setItem('validity', validity ? validity : '');
        // await AsyncStorage.setItem('totalUnitPrice', totalUnitPrice)
        await AsyncStorage.setItem(
          'cashCustomerName',
          cashCustomerName ? cashCustomerName : '',
        );
        await AsyncStorage.setItem(
          'cashCustomerAddress',
          cashCustomerAddress ? cashCustomerAddress : '',
        );
        await AsyncStorage.setItem(
          'cashCustomerPhone',
          cashCustomerPhone ? cashCustomerPhone : '',
        );

        setSavedItemData([...savedItemData, newItem]);
        setQuantity('');
        setUnitPrice('');
        setSelectedStock(null);
        // showSaveItemSuccess()

        logAsyncData();

        if (selectedCustomer && searchItemInpRef.current) {
          searchItemInpRef.current.focus();
        }
      }
    } else {
      console.log(
        'else after itemexist ',
        selectedStock,
        'q',
        quantity,
        'u',
        unitPrice,
        'sc',
        selectedCustomer,
        'cn',
        cashCustomerName,
        'sc credit',
        selectedCustomer.CREDITMETHOD,
      );
    }

    if (
      selectedStock &&
      quantity &&
      unitPrice &&
      selectedCustomer &&
      selectedCustomer.CREDITMETHOD == 'OPEN'
    ) {
      const newItem = {
        ...selectedStock,
        quantity: parseFloat(quantity).toFixed(2),
        unitPrice: parseFloat(unitPrice).toFixed(2),
        total: quantity * unitPrice,
      };

      console.log('newItem', newItem);

      // Retrieve existing savedItemData from AsyncStorage
      // const savedItemDataString = await AsyncStorage.getItem('savedItemData');
      // const savedItemDataArray = savedItemDataString ? JSON.parse(savedItemDataString) : [];

      // console.log('savedItemDataArray', savedItemDataArray)

      // // Check if the item already exists in the list
      // const itemExists = savedItemDataArray.some(item => item.Code === selectedStock.Code);

      // if (itemExists) {
      //     showItemExistError()
      //     return; // Exit the function
      // }

      // Retrieve existing savedItemData from AsyncStorage
      const savedItemDataString = await AsyncStorage.getItem('savedItemData');
      const savedItemDataArray = savedItemDataString
        ? JSON.parse(savedItemDataString)
        : [];

      // Add the new item to the list
      const updatedSavedItemData = [...savedItemDataArray, newItem];

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem(
        'savedItemData',
        JSON.stringify(updatedSavedItemData),
      );

      await AsyncStorage.setItem(
        'selectedCustomer',
        JSON.stringify(selectedCustomer),
      );
      // await AsyncStorage.setItem('savedItemData', JSON.stringify(savedItemData))
      await AsyncStorage.setItem('orderRemark', orderRemark ? orderRemark : '');
      await AsyncStorage.setItem('trn', trn ? trn : '');
      await AsyncStorage.setItem('payment', payment ? payment : '');
      await AsyncStorage.setItem('delivery', delivery ? delivery : '');
      await AsyncStorage.setItem('validity', validity ? validity : '');
      // await AsyncStorage.setItem('totalUnitPrice', totalUnitPrice)
      await AsyncStorage.setItem(
        'cashCustomerName',
        cashCustomerName ? cashCustomerName : '',
      );
      await AsyncStorage.setItem(
        'cashCustomerAddress',
        cashCustomerAddress ? cashCustomerAddress : '',
      );
      await AsyncStorage.setItem(
        'cashCustomerPhone',
        cashCustomerPhone ? cashCustomerPhone : '',
      );

      setSavedItemData([...savedItemData, newItem]);
      setQuantity('');
      setUnitPrice('');
      setSelectedStock(null);
      // showSaveItemSuccess()

      logAsyncData();

      if (selectedCustomer && searchItemInpRef.current) {
        searchItemInpRef.current.focus();
      }
    } else {
      console.log(
        'else after itemexist creditblock open ',
        selectedStock,
        'q',
        quantity,
        'u',
        unitPrice,
        'sc',
        selectedCustomer,
        'cn',
        cashCustomerName,
        'sc credit',
        selectedCustomer.CREDITMETHOD,
      );
    }

    if (selectedStock && quantity && unitPrice && cashCustomerName) {
      const newItem = {
        ...selectedStock,
        quantity: parseFloat(quantity).toFixed(2),
        unitPrice: parseFloat(unitPrice).toFixed(2),
        total: quantity * unitPrice,
      };

      console.log('newItem', newItem);

      // Retrieve existing savedItemData from AsyncStorage
      // const savedItemDataString = await AsyncStorage.getItem('savedItemData');
      // const savedItemDataArray = savedItemDataString ? JSON.parse(savedItemDataString) : [];

      // console.log('savedItemDataArray', savedItemDataArray)

      // // Check if the item already exists in the list
      // const itemExists = savedItemDataArray.some(item => item.Code === selectedStock.Code);

      // if (itemExists) {
      //     showItemExistError()
      //     return; // Exit the function
      // }

      // Retrieve existing savedItemData from AsyncStorage
      const savedItemDataString = await AsyncStorage.getItem('savedItemData');
      const savedItemDataArray = savedItemDataString
        ? JSON.parse(savedItemDataString)
        : [];

      // Add the new item to the list
      const updatedSavedItemData = [...savedItemDataArray, newItem];

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem(
        'savedItemData',
        JSON.stringify(updatedSavedItemData),
      );

      await AsyncStorage.setItem(
        'selectedCustomer',
        JSON.stringify(selectedCustomer),
      );
      // await AsyncStorage.setItem('savedItemData', JSON.stringify(savedItemData))
      await AsyncStorage.setItem('orderRemark', orderRemark ? orderRemark : '');
      await AsyncStorage.setItem('trn', trn ? trn : '');
      await AsyncStorage.setItem('payment', payment ? payment : '');
      await AsyncStorage.setItem('delivery', delivery ? delivery : '');
      await AsyncStorage.setItem('validity', validity ? validity : '');
      // await AsyncStorage.setItem('totalUnitPrice', totalUnitPrice)
      await AsyncStorage.setItem(
        'cashCustomerName',
        cashCustomerName ? cashCustomerName : '',
      );
      await AsyncStorage.setItem(
        'cashCustomerAddress',
        cashCustomerAddress ? cashCustomerAddress : '',
      );
      await AsyncStorage.setItem(
        'cashCustomerPhone',
        cashCustomerPhone ? cashCustomerPhone : '',
      );

      setSavedItemData([...savedItemData, newItem]);
      setQuantity('');
      setUnitPrice('');
      setSelectedStock(null);
      // showSaveItemSuccess()

      logAsyncData();

      if (cashCustomerName && searchItemInpRef.current) {
        searchItemInpRef.current.focus();
      }
    } else if (!selectedCustomer && !cashCustomerName) {
      showAddToCartCustomerErr();
    } else if ((selectedCustomer || cashCustomerName) && !selectedStock) {
      showAddToCartErr();
    }
  };

  const logAsyncData = async () => {
    try {
      const storedSelectedCustomer = await AsyncStorage.getItem(
        'selectedCustomer',
      );
      const storedSavedItemData = await AsyncStorage.getItem('savedItemData');
      const storedOrderRemark = await AsyncStorage.getItem('orderRemark');
      const storedtrn = await AsyncStorage.getItem('trn');
      const storedPayment = await AsyncStorage.getItem('payment');
      const storedDelivery = await AsyncStorage.getItem('delivery');
      const storedValidity = await AsyncStorage.getItem('validity');
      // const storedTotalUnitPrice = await AsyncStorage.getItem('totalUnitPrice');
      const storedCashCustomerName = await AsyncStorage.getItem(
        'cashCustomerName',
      );
      const storedCashCustomerAddress = await AsyncStorage.getItem(
        'cashCustomerAddress',
      );
      const storedCashCustomerPhone = await AsyncStorage.getItem(
        'cashCustomerPhone',
      );

      if (storedSelectedCustomer) {
        setSelectedCustomer(JSON.parse(storedSelectedCustomer));
      } else {
        setSelectedCustomer(null);
      }
      if (storedSavedItemData) {
        setSavedItemData(JSON.parse(storedSavedItemData));
        setIsDataLoaded(true);
      } else {
        setSavedItemData([]);
      }
      if (storedOrderRemark) {
        setOrderRemark(storedOrderRemark);
      } else {
        setOrderRemark('');
      }
      if (storedtrn) {
        setTrn(storedtrn);
      } else {
        setTrn('');
      }
      if (storedPayment) {
        setPayment(storedPayment);
      } else {
        setPayment('');
      }
      if (storedDelivery) {
        setDelivery(storedDelivery);
      } else {
        setDelivery('');
      }
      if (storedValidity) {
        setValidity(storedValidity);
      } else {
        setValidity('');
      }
      if (storedCashCustomerName) {
        setCashCustomerName(storedCashCustomerName);
        setShowCashCust(true);
      } else {
        setCashCustomerName('');
        setShowCashCust(false);
      }
      if (storedCashCustomerAddress) {
        setCashCustomerAddress(storedCashCustomerAddress);
        setShowCashCust(true);
      } else {
        setCashCustomerAddress('');
        // setShowCashCust(false)
      }
      if (storedCashCustomerPhone) {
        setCashCustomerPhone(storedCashCustomerPhone);
        setShowCashCust(true);
      } else {
        setCashCustomerPhone('');
        // setShowCashCust(false)
      }

      // console.log('selectedCustomer:', storedSelectedCustomer);
      // console.log('savedItemData:', storedSavedItemData);
      // console.log('orderRemark:', storedOrderRemark);
      // console.log('payment:', storedPayment);
      // console.log('delivery:', storedDelivery);
      // console.log('validity:', storedValidity);
      // console.log('cashCustomerName:', storedCashCustomerName);
      // console.log('cashCustomerAddress:', storedCashCustomerAddress);
      // console.log('cashCustomerPhone:', storedCashCustomerPhone);
    } catch (error) {
      console.error('Error loading data from AsyncStorage', error);
    }
  };

  const removeAsyncItems = async () => {
    try {
      await AsyncStorage.removeItem('selectedCustomer');
      await AsyncStorage.removeItem('savedItemData');
      await AsyncStorage.removeItem('orderRemark');
      await AsyncStorage.removeItem('trn');
      await AsyncStorage.removeItem('payment');
      await AsyncStorage.removeItem('delivery');
      await AsyncStorage.removeItem('validity');
      await AsyncStorage.removeItem('totalUnitPrice');
      await AsyncStorage.removeItem('cashCustomerName');
      await AsyncStorage.removeItem('cashCustomerAddress');
      await AsyncStorage.removeItem('cashCustomerPhone');
      await AsyncStorage.removeItem('operationType');

      console.log('All items removed from AsyncStorage.');

      navigation.setParams({type: undefined});

      showAsyncItemRemove();
      logAsyncData();
      // updateTotalUnitPrice()
      setTotalUnitPrice(0);

      setShowResetPop(false);

      setShowCartPanel(false);

      setSelectedUserType('reg');

      setCustPriceGrp('');
    } catch (error) {
      console.error('Error removing items from AsyncStorage', error);
    }
  };

  const removeAsyncItemsAfterOrderMade = async () => {
    try {
      await AsyncStorage.removeItem('selectedCustomer');
      await AsyncStorage.removeItem('savedItemData');
      await AsyncStorage.removeItem('orderRemark');
      await AsyncStorage.removeItem('trn');
      await AsyncStorage.removeItem('payment');
      await AsyncStorage.removeItem('delivery');
      await AsyncStorage.removeItem('validity');
      await AsyncStorage.removeItem('totalUnitPrice');
      await AsyncStorage.removeItem('cashCustomerName');
      await AsyncStorage.removeItem('cashCustomerAddress');
      await AsyncStorage.removeItem('cashCustomerPhone');
      await AsyncStorage.removeItem('operationType');

      console.log('All items removed from AsyncStorage.');

      navigation.setParams({type: undefined});

      // showAsyncItemRemove()
      showMakeOrderSuccess();
      logAsyncData();
      // updateTotalUnitPrice()
      setTotalUnitPrice(0);

      setShowResetPop(false);

      setShowCartPanel(false);

      setSelectedUserType('reg');

      setCustPriceGrp('');
    } catch (error) {
      console.error('Error removing items from AsyncStorage', error);
    }
  };

  const fetchItemList = async (orderId, type) => {
    if (type === 'pull') {
      try {
        const response = await axios.get(
          `${appUrl}Sales_Order/${cmpcode}/details/${orderId}`,
        );
        setItemList(response.data);
        // await AsyncStorage.setItem('savedItemData', JSON.stringify(response.data));
        // setSavedItemData(response.data)
        showPullQuotToast();
      } catch (error) {
        console.log('fetchItemListError', error);
        setError(error);
      }
    }
    if (type === 'edit') {
      try {
        const response = await axios.get(
          `${appUrl}Sales_Order/${cmpcode}/details/${orderId}`,
        );
        setItemList(response.data);
        // await AsyncStorage.setItem('savedItemData', JSON.stringify(response.data));
        // setSavedItemData(response.data)
        showEditToast();
      } catch (error) {
        console.log('fetchItemListError', error);
        setError(error);
      }
    }
  };

  useEffect(() => {
    if (itemList && type) {
      if (itemList.length > 0 && type === 'pull') {
        const transformed = itemList.map(item => ({
          AvlQty: 0,
          Barcode: '',
          Code: item.so_icode,
          Cost_Avg: 0,
          Description: item.idesc,
          Group: '',
          LPCost: 0,
          LSPRICE: 0,
          Ord_pend: 0,
          Qty: 0,
          SupportItem: '',
          price: 0,
          quantity: item.tr_qty2,
          total: item.line_total,
          unit: item.unit,
          unitPrice: item.so_cost,
          OEM: item.batch,
        }));
        setSavedItemData(transformed);
        AsyncStorage.setItem('savedItemData', JSON.stringify(transformed))
          .then(() => {
            logAsyncData();
            console.log('Pull Data saved successfully');
          })
          .catch(error => console.log('Error saving data', error));
      }
      if (itemList.length > 0 && type === 'edit') {
        const transformed = itemList.map(item => ({
          AvlQty: 0,
          Barcode: '',
          Code: item.so_icode,
          Cost_Avg: 0,
          Description: item.idesc,
          Group: '',
          LPCost: 0,
          LSPRICE: 0,
          Ord_pend: 0,
          Qty: 0,
          SupportItem: '',
          price: 0,
          quantity: item.tr_qty2,
          total: item.line_total,
          unit: item.unit,
          unitPrice: item.so_cost,
          OEM: item.batch,
        }));
        setSavedItemData(transformed);
        AsyncStorage.setItem('savedItemData', JSON.stringify(transformed))
          .then(() => {
            logAsyncData();
            console.log('Edit Data saved successfully');
          })
          .catch(error => console.log('Error saving data', error));
      }
    }
  }, [itemList, type]);

  const fetchPreviousOrders = async orderId => {
    console.log(`${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}`);
    try {
      // const response = await axios.get(`${appUrl}Sales_Order/${cmpcode}/Salesall/ALL`);

      const response = await axios.get(
        `${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}`,
      );

      const allOrders = response.data;
      const filteredOrder = allOrders.filter(order => order.so_no === orderId);
      // setEditData(filteredOrder);

      // const transformed = {
      //     "account": filteredOrder[0].account,
      //     "Custname": filteredOrder[0].accdesc,
      //     "openbal": filteredOrder[0].openbal,
      //     "debit": filteredOrder[0].debit,
      //     "credit": filteredOrder[0].credit,
      //     "address1": filteredOrder[0].area_code,
      //     "address2": filteredOrder[0].area_code1,
      //     "address3": "",
      //     "phone": "",
      //     "msg": "",
      //     "sale_man": filteredOrder[0].sale_man,
      //     "CREDITMETHOD": filteredOrder[0].CREDITMETHOD
      // }

      console.log('filteredOrder', filteredOrder);

      // setSelectedCustomer(transformed)
      // AsyncStorage.setItem('selectedCustomer', JSON.stringify(transformed))
      //     .then(() => console.log('Data saved successfully'))
      //     .catch(error => console.log('Error saving data', error));

      searchEditCustomer(filteredOrder[0].account);

      // setSelectedCustomer(transformed)
      // setSele(filteredOrderdata[0].accdesc)
    } catch (error) {
      console.log('fetchPreviousOrdersError', error);
      setError(error);
    }
  };

  const updateTotalUnitPrice = data => {
    const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
    setTotalUnitPrice(total);
  };

  useEffect(() => {
    logAsyncData();
  }, []);

  useEffect(() => {
    if (savedItemData.length > 0) {
      updateTotalUnitPrice(savedItemData);
    }
  }, [savedItemData]);

  useEffect(() => {
    if (showCashCust === false) {
      setCashCustomerName('');
      setCashCustomerAddress('');
      setCashCustomerPhone('');
    }
    if (showCashCust === true) {
      setCustomerSearchItem('');
    }
  }, [showCashCust]);

  const ItemBinClick = () => {
    setSelectedStock('');
    setQuantity('');
    setUnitPrice('');
    setTotalUnitPrice('');
  };

  async function sendNotification() {
    // console.log("notification to this channel and key is ", `/topics/${cmpcode.trim().toUpperCase()}_drivers `  )
    // const notification = {
    //     notification: {
    //         title: 'New Delivery',
    //         body: 'An Item is ready to be delivered!'
    //     },
    //     to: `/topics/${cmpcode.trim().toUpperCase()}drivers`
    // };
    // console.log('sendNotification', notification)
    // try {
    //     const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `key=${SERVER_KEY}` // Replace with your actual server key
    //         }
    //     });
    //     console.log('FCM token sent to API:', response.data);
    // } catch (error) {
    //     console.error('Error sending FCM token to API:', error, SERVER_KEY);
    // }
  }

  const showMakeOrderSuccess = () => {
    Toast.success(`Quotation created successfully `);

    sendNotification();
  };

  const showMakeOrderError = () => {
    Toast.error(`Some error occured`);
  };

  const showSaveItemSuccess = () => {
    Toast.success(`Item Saved `);
  };

  const showItemRemove = () => {
    Toast.error('Item Removed');
  };

  const showAddToCartEmptyErr = () => {
    Toast.error('Cart cannot be empty');
  };
  const showAddToCartCustomerErr = () => {
    Toast.error('Customer not selected');
  };
  const showAddToCartTrnErr = () => {
    Toast.error('Trn cannot be empty');
  };

  const showAddToCartErr = () => {
    Toast.error('Item/Quantity/unitPrice cannot be empty');
  };

  const showAsyncItemRemove = () => {
    Toast.warn('Deleted all saved Data');
  };

  const showFormEmptyToast = () => {
    Toast.error('UserId and Password cant be empty');
  };

  const showPullQuotToast = () => {
    Toast.success(`Qoutation pulled successfully, now add Customer`);
  };

  const showEditToast = () => {
    Toast.success(`You can now Edit the selected Quotation`);
  };

  const showItemExistError = () => {
    Toast.error(`Item already selected->`);
  };

  useEffect(() => {
    if (orderId && type === 'pull') {
      fetchItemList(orderId, type);
    }
    if (salesMan && orderId && type === 'edit') {
      fetchItemList(orderId, type);
      fetchPreviousOrders(orderId);
    }
  }, [orderId, type, salesMan]);

  useEffect(() => {
    if (selectedUserType === 'unreg') {
      setSelectedRadio('CASH');
      setShowCashCust(true);

      if (selectedCustomer) {
        setCashCustomerName(selectedCustomer.Custname);
        setCashCustomerAddress(
          `${
            selectedCustomer.address1 ? selectedCustomer.address1 + ' ' : ''
          }` +
            `${
              selectedCustomer.address2 ? selectedCustomer.address2 + ' ' : ''
            }` +
            `${selectedCustomer.address3 ? selectedCustomer.address3 : ''}`,
        );
        setCashCustomerPhone(
          selectedCustomer.phone && selectedCustomer.phone.trim(),
        );
      }

      // setSelectedCustomer('')
    }
    if (selectedUserType === 'reg') {
      setSelectedRadio('CREDIT');
      setShowCashCust(false);
    }
  }, [selectedUserType]);

  useEffect(() => {
    if (selectedRadio === 'CASH') {
      setBlockNextButtonView(false);
    }

    if (
      selectedRadio === 'CREDIT' &&
      selectedCustomer &&
      selectedCustomer.CREDITMETHOD === 'CREDIT BLOCK' &&
      selectedCustomer.Avai_Bal === 0
    ) {
      setBlockNextButtonView(true);
      Alert.alert(
        'Amount Equal',
        'Available balance is equal to Credit limit. Please choose cash customer to add more items.',
        [{text: 'OK'}],
      );
    }

    if (
      selectedRadio === 'CREDIT' &&
      selectedCustomer &&
      selectedCustomer.CREDITMETHOD === 'CREDIT BLOCK' &&
      selectedCustomer.Avai_Bal > selectedCustomer.Credit_Limit
    ) {
      setBlockNextButtonView(true);
      Alert.alert(
        'Amount Exceed',
        'Available balance is greater than Credit limit. Please choose cash customer to add more items.',
        [{text: 'OK'}],
      );
    }

    // if (selectedRadio === 'CREDIT' && selectedCustomer && selectedCustomer.CREDITMETHOD === 'CREDIT BLOCK') {
    //     console.log('selectedCustomerFromRadio', selectedCustomer)
    //     if (selectedCustomer.Avai_Bal >= selectedCustomer.Credit_Limit) {
    //         setBlockNextButtonView(true)
    //     }
    // }
  }, [selectedRadio]);

  useEffect(() => {
    if (showCartPanel) {
      if (selectedCustomer && searchItemInpRef.current) {
        searchItemInpRef.current.focus();
      }
    }
  }, [showCartPanel]);

  // useEffect(() => {
  //     if (quantity && unitPriceInpRef.current) {
  //         unitPriceInpRef.current.focus()
  //     }
  // }, [quantity])

  const callBulkPriceAPI = qty => {
    setIsCallingBulkPriceApi(true);

    let encodedItemvalue = encodeURIComponent(selectedStock?.Code);

    const apiUrl = `${appUrl}PriceSlab/${cmpcode}/${encodedItemvalue}/${selectedCustomer.account}/${qty}`;

    console.log('apiurl bulk price', apiUrl);

    axios
      .get(`${apiUrl}`)
      .then(res => {
        setIsCallingBulkPriceApi(false);

        console.log('res.data[0].Price ', res.data[0].Price);
        setUnitPrice(res.data[0].Price);
      })
      .catch(err => {
        setIsCallingBulkPriceApi(false);
      });
  };
  useEffect(() => {
    if (quantity) {
      callBulkPriceAPI(quantity);
    }
  }, [quantity]);

  const handleUnitClick = unit => {
    setUnitValue(unit);
    setShowUnitPop(false);
  };

  const dummyUnits = [
    {
      unit: 'PCS',
    },
    // {
    //     "unit": "ele",
    // },
    // {
    //     "unit": "kg",
    // },
    // {
    //     "unit": "pcs",
    // },
    // {
    //     "unit": "ele",
    // },
    // {
    //     "unit": "kg",
    // },
    // {
    //     "unit": "pcs",
    // },
    // {
    //     "unit": "ele",
    // },
    // {
    //     "unit": "kg",
    // },
  ];

  useEffect(() => {
    const fetchType = async () => {
      if (type) {
        setOperationType(type);
        await AsyncStorage.setItem('operationType', type);
      } else {
        const storedType = await AsyncStorage.getItem('operationType');
        if (storedType) {
          setOperationType(storedType);
        }
      }
    };
    fetchType();
  }, [type]);

  const checkIfItemIsPriceManaged = async item => {
    return new Promise((resolve, reject) => {
      console.log('item to check', item);

      let encodedvalue = encodeURIComponent(item.Code);

      const apiUrl = `${appUrl}mastercount/${cmpcode}/pricemanager/${encodedvalue}/-`;

      console.log('item to check apiUrl', apiUrl);

      axios
        .get(apiUrl)
        .then(res => {
          console.log('res after item check ', res.data[0].Column1);

          if (res.data[0].Column1 == 0) {
            console.log('res after item check == 0');
            resolve(false);
          } else {
            console.log('res after item check == 1');
            resolve(true);
          }
        })
        .catch(err => {
          console.log('err after item check ', err);
          resolve(null);
        });
    });
  };
  // console.log('editData', editData)
  // console.log('orderId', orderId)
  // console.log('type', type)
  // console.log('itemList', itemList)
  // console.log('searchItem', searchItem)
  // // console.log('customerData', customerData)
  // console.log('selectedStock', selectedStock && custPriceGrp && selectedStock)
  // console.log('selectedStock', selectedStock && custPriceGrp && selectedStock[custPriceGrp])
  // console.log('savedItemData', savedItemData)
  // console.log('editData', editData)
  // console.log('totalUnitPrice', totalUnitPrice)
  // console.log(quantity, unitPrice)
  console.log('selectedCustomer', selectedCustomer && selectedCustomer);
  // console.log('salesMan', salesMan)
  // console.log('stockData', stockData && stockData[0])
  // console.log('unitPrice', unitPrice)
  // console.log('customerSearchError', customerSearchError)
  console.log('operationType', operationType);

  console.log('custPriceGrp', custPriceGrp);

  const checkIfitemStockisZero = async item => {
    if (item.Status == 'NS') {
      Alert.alert('This item cannot be sold');
      return;
    }

    if (item.Qty == 0) {
      Alert.alert('zero stock for this item');
    }

    if (cmpcode?.trim().toUpperCase() == 'AUTOMAX') {
      setIsCallingpriceManagementApi(true);

      let resultOfPriceManagement = await checkIfItemIsPriceManaged(item);
      setIsCallingpriceManagementApi(false);

      if (resultOfPriceManagement) {
        Alert.alert(
          'Price Management',
          'This item is required to update the new price. Please contact the concerned team. Selection Blocked',
        );
        return;
      } else {
        setSelectedStock(item);
      }
    } else {
      setSelectedStock(item);
    }
  };

  return (
    <>
      <View style={styles.HomeWrap}>
        <HeaderUiNew
          name={'Quotation'}
          setShowSelectedStockPop={setShowSelectedStockPop}
          showSelectedStockPop={showSelectedStockPop}
          savedItemData={savedItemData}
          showCartPanel={showCartPanel}
          totalUnitPrice={totalUnitPrice}
        />

        <ToastManager width={350} height={100} textStyle={{fontSize: 17}} />

        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          style={styles.HomeCont}>
          <View style={{width: '100%', height: '100%'}}>
            {/* {
                                showCartPanel === false &&
                                <View style={styles.RadioWrap}>
                                    <View style={{ width: '100%' }}>
                                        <RadioGroup
                                            radioButtons={regUnregUserRadio}
                                            onPress={setSelectedUserType}
                                            selectedId={selectedUserType}
                                            layout='row'
                                            containerStyle={{
                                                justifyContent: 'space-between'
                                            }}
                                        />
                                    </View>
    
                                </View>
                            } */}

            <ScrollView
              contentContainerStyle={styles.MainScroll}
              bounces={false}
              keyboardShouldPersistTaps="handled">
              {showCartPanel === false && (
                <>
                  {/* <View style={styles.RadioWrap}>
                                        <View style={{ width: '100%' }}>
                                            <RadioGroup
                                                radioButtons={regUnregUserRadio}
                                                onPress={setSelectedUserType}
                                                selectedId={selectedUserType}
                                                layout='row'
                                                containerStyle={{
                                                    justifyContent: 'space-between'
                                                }}
                                            />
                                        </View>

                                    </View> */}
                  {type !== 'edit' && (
                    <>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          justifyContent: 'space-around',
                        }}>
                        {selectedUserType === 'reg' && (
                          // <View style={styles.CustomerSearchInp}>
                          //     <View style={styles.InputImageCont}>
                          //         <Image style={styles.SearchIcon} source={require('../images/orangeLens.png')} />
                          //     </View>
                          //     <TextInput
                          //         style={styles.TextInput}
                          //         ref={searchUserInputRef}
                          //         placeholder='Search registered customers'
                          //         value={customerSearchItem}
                          //         onChangeText={text => setCustomerSearchItem(text)}
                          //         placeholderTextColor="#aaa"
                          //     />

                          // </View>
                          <View style={[styles.TANDCInpCont, {width: '90%'}]}>
                            <TextInput
                              style={styles.NewInputStyle}
                              ref={searchUserInputRef}
                              placeholder="Search registered customers"
                              value={customerSearchItem}
                              onChangeText={text => setCustomerSearchItem(text)}
                              placeholderTextColor="#aaa"
                            />
                          </View>
                        )}
                      </View>

                      {showActivity && <ActivityIndicator />}

                      <View style={{width: '100%'}}>
                        {customerSearchError && !showActivity && (
                          <Text style={styles.ErrorText}>
                            {customerSearchError}
                          </Text>
                        )}
                      </View>

                      {
                        // customerData && !selectedCustomer && customerSearchItem !== '' &&
                        customerData && customerSearchItem !== '' && (
                          <>
                            {/* {
                                                            customerData && customerData.length > 0 &&
                                                            <View style={styles.TableContainer}>
                                                                <ScrollView style={[styles.ScrollView, { backgroundColor: '#FDFDFD', width: '98%' }]} nestedScrollEnabled={true}>
    
                                                                    {
                                                                        customerData && customerData.length > 0 && customerData.map((item, index) => (
                                                                            <TouchableOpacity style={styles.StockListItem} key={index} onPress={() => setSelectedCustomer(item)}>
    
                                                                                <View style={styles.StockItemListHead}>
                                                                                </View>
    
                                                                                <View style={styles.StockItemDescCont}>
                                                                                    <Text style={styles.StockListDescText}>{item.Custname}</Text>
                                                                                </View>
    
                                                                                <View style={styles.QtyAvlQtyCont}>
    
                                                                                    <View style={[styles.QtyCont, { backgroundColor: '#ECF0F9', marginRight: 16 }]}>
                                                                                        <Text style={styles.QtyText}>Balance: {item.Balance}</Text>
                                                                                    </View>
                                                                                </View>
    
                                                                            </TouchableOpacity>
                                                                        ))
                                                                    }
    
                                                                </ScrollView>
                                                            </View>
                                                        } */}

                            <ScrollView
                              contentContainerStyle={[
                                styles.CheckStockListView,
                              ]}
                              keyboardShouldPersistTaps="handled">
                              {customerData &&
                                customerData.length > 0 &&
                                customerData.map((item, index) => (
                                  <TouchableOpacity
                                    style={styles.StockListItem}
                                    key={index}
                                    onPress={() => {
                                      Keyboard.dismiss();
                                      setSelectedCustomer(item);
                                    }}>
                                    <View style={styles.CustomerListCont}>
                                      <View style={styles.CustomerImgWrap}>
                                        <Image
                                          style={styles.CustomerImage}
                                          source={require('../images/customerList.png')}
                                        />
                                      </View>

                                      <View style={styles.CustomerListMid}>
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                          }}>
                                          <View
                                            style={[
                                              styles.StockListDescText,
                                              {width: '75%'},
                                            ]}>
                                            <Text
                                              style={[
                                                styles.StockListDescText,
                                              ]}>
                                              {item.Custname}
                                            </Text>
                                          </View>
                                          <Text
                                            style={[
                                              styles.StockListDescTextSmall,
                                              {
                                                color: '#30B3A4',
                                                fontFamily: 'Lexend-Regular',
                                              },
                                            ]}>
                                            {item.Balance}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            width: '100%',
                                            paddingVertical: 6,
                                          }}>
                                          <Text
                                            style={
                                              styles.StockListDescTextSmall
                                            }>
                                            {item.account}
                                          </Text>
                                          <View
                                            style={{
                                              marginLeft: 24,
                                              flexDirection: 'row',
                                            }}>
                                            <Text
                                              style={[
                                                styles.StockListDescTextSmall,
                                              ]}>
                                              C.Limit:
                                            </Text>
                                            <Text
                                              style={[
                                                styles.StockListDescTextSmall,
                                              ]}>
                                              {item.Credit_Limit}
                                            </Text>
                                          </View>
                                          <View
                                            style={{
                                              marginLeft: 'auto',
                                              flexDirection: 'row',
                                            }}>
                                            <Text
                                              style={[
                                                styles.StockListDescTextSmall,
                                                {fontSize: 11},
                                              ]}>
                                              {item.CREDITMETHOD}
                                            </Text>
                                          </View>

                                          {/* <TouchableOpacity style={[styles.PlusMinusCont, { marginLeft: 'auto' }]} onPress={() => toggleExpand(item.account)}>
                                                                                        {
                                                                                            expandedItems.includes(item.account) ?
                                                                                                <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                                                                :
                                                                                                <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                                                        }
                                                                                    </TouchableOpacity> */}
                                        </View>
                                      </View>
                                    </View>

                                    {/* {
                                                                            expandedItems.includes(item.account) && (
    
                                                                                <View style={styles.QtyAvlQtyCont}>
    
                                                                                    <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', marginRight: 16 }]} onPress={() => statementClick(item)}>
                                                                                        <Text style={styles.QtyText}>Statement</Text>
                                                                                    </TouchableOpacity>
                                                                                    <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', }]} onPress={() => outStandingClick(item)}>
                                                                                        <Text style={styles.AvlText}>Outstanding</Text>
                                                                                    </TouchableOpacity>
                                                                                </View>
                                                                            )
                                                                        } */}
                                  </TouchableOpacity>
                                ))}
                            </ScrollView>
                          </>
                        )
                      }
                      {customerData && customerData.length === 0 && (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            width: '100%',
                          }}>
                          <Text
                            style={{
                              color: 'red',
                              fontFamily: 'Lexend-Bold',
                            }}>
                            No Data Available
                          </Text>
                        </View>
                      )}

                      {/* <View style={styles.RadioWrap}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        width: '100%',
                                                    }}>
                                                        <RadioGroup
                                                            radioButtons={cashCreditRadio}
                                                            onPress={setSelectedRadio}
                                                            selectedId={selectedRadio}
                                                            layout='row'
                                                            // disabled={selectedUserType === 'unreg'}
                                                            containerStyle={{
                                                                justifyContent: 'space-between'
                                                            }}
                                                        />
                                                    </View>
    
                                                </View> */}
                    </>
                  )}

                  <View style={styles.RadioWrap}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}>
                      <RadioGroup
                        radioButtons={cashCreditRadio}
                        onPress={setSelectedRadio}
                        selectedId={selectedRadio}
                        layout="row"
                        // disabled={selectedUserType === 'unreg'}
                        containerStyle={{
                          justifyContent: 'space-between',
                        }}
                      />
                    </View>
                  </View>

                  {customerCreditBlocked === false && (
                    <View style={styles.OrderMainWrap}>
                      <>
                        {
                          // (!showCashCust || selectedCustomer) ?
                          !showCashCust ? (
                            <>
                              {selectedCustomer && (
                                <View style={styles.SelectedCustomerNewBanner}>
                                  <View>
                                    <Text style={styles.SelectCustNewText}>
                                      {selectedCustomer &&
                                      selectedCustomer.Custname?.trim() !== ''
                                        ? selectedCustomer.Custname
                                        : ''}
                                    </Text>
                                  </View>
                                  <View style={styles.SelectCustNewBottomWrap}>
                                    <View style={styles.SelectCustBottomItem}>
                                      <Text
                                        style={styles.SelectCustNewBottomText}>
                                        Account :
                                      </Text>
                                      <Text
                                        style={[
                                          styles.SelectCustNewBottomText,
                                          {marginLeft: 8},
                                        ]}>
                                        {selectedCustomer &&
                                        selectedCustomer.account?.trim() !== ''
                                          ? selectedCustomer.account
                                          : ''}
                                      </Text>
                                    </View>
                                    <View style={styles.SelectCustBottomItem}>
                                      <Text
                                        style={styles.SelectCustNewBottomText}>
                                        Status :
                                      </Text>
                                      <Text
                                        style={[
                                          styles.SelectCustNewBottomText,
                                          {marginLeft: 8},
                                        ]}>
                                        {selectedCustomer &&
                                          selectedCustomer.CREDITMETHOD}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              )}

                              <View style={styles.NextWrap}>
                                <View style={styles.NextValuesCotn}>
                                  <View style={styles.NextValueInner}>
                                    <Text style={styles.CustHeadText}>
                                      Credit Limit:
                                    </Text>
                                    <Text
                                      style={[
                                        styles.CustHeadTextValue,
                                        {marginLeft: 12},
                                      ]}>
                                      {selectedCustomer &&
                                        selectedCustomer.Credit_Limit}
                                    </Text>
                                  </View>
                                  <View style={styles.NextValueInner}>
                                    <Text style={styles.CustHeadText}>
                                      Available Balance:
                                    </Text>
                                    <Text
                                      style={[
                                        styles.CustHeadTextValue,
                                        {marginLeft: 12},
                                      ]}>
                                      {selectedCustomer &&
                                        selectedCustomer.Avai_Bal}
                                    </Text>
                                  </View>
                                </View>
                                {blocknextButtonView === false && (
                                  <View>
                                    <TouchableOpacity
                                      style={styles.NextButton}
                                      onPress={() => NextClick()}>
                                      <Text
                                        style={[
                                          styles.CustHeadText,
                                          {color: 'white'},
                                        ]}>
                                        Next
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>

                              {selectedCustomer && (
                                <View style={styles.AddressDetailsWrap}>
                                  <View style={styles.AddressTopBanner}>
                                    <Text style={styles.CustHeadText}>
                                      Address Details
                                    </Text>
                                  </View>
                                  <View>
                                    <Text style={styles.CustHeadText}>
                                      {selectedCustomer &&
                                        selectedCustomer.address1}
                                    </Text>
                                  </View>
                                  <View>
                                    <Text style={styles.CustHeadText}>
                                      {selectedCustomer &&
                                        selectedCustomer.address2}
                                    </Text>
                                  </View>
                                  <View>
                                    <Text style={styles.CustHeadText}>
                                      {selectedCustomer &&
                                        selectedCustomer.address3}
                                    </Text>
                                  </View>
                                </View>
                              )}

                              <View style={styles.AddressDetailsWrap}>
                                <View style={styles.AddressTopBanner}>
                                  <Text style={styles.CustHeadText}>
                                    Terms & Condition
                                  </Text>
                                </View>

                                <View style={styles.TermsCondtitonInpWrap}>
                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Payment
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='payment'
                                        value={payment}
                                        onChangeText={text => setPayment(text)}
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Delivery
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='delivery'
                                        value={delivery}
                                        onChangeText={text => setDelivery(text)}
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Validity
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='validity'
                                        value={validity}
                                        onChangeText={text => setValidity(text)}
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      TRN
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='Enter Trn'
                                        value={trn}
                                        onChangeText={text => setTrn(text)}
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>
                                </View>
                              </View>

                              {/* <View style={styles.CustomerUIWrap}>
    
                                                                    <View style={styles.TabCont}>
                                                                        <TouchableOpacity style={[styles.TabButtons, selectedTab === 'Customer' && styles.SelectedTab]} onPress={() => setSelectedTab('Customer')}>
                                                                            <Text style={[styles.TabText, selectedTab === 'Customer' && styles.SelectedText]}>Customer</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity style={[styles.TabButtons, { marginLeft: 8 }, selectedTab === 'Details' && styles.SelectedTab]} onPress={() => setSelectedTab('Details')}>
                                                                            <Text style={[styles.TabText, selectedTab === 'Details' && styles.SelectedText]}>Details</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
    
                                                                    {
                                                                        selectedTab === 'Customer' &&
                                                                        <View style={{
                                                                            paddingHorizontal: 6,
                                                                            paddingVertical: 8
                                                                        }}>
                                                                            <View style={[styles.CustUiItem]}>
                                                                                <Text style={styles.CustHeadText}>Name</Text>
                                                                                <View style={{ width: '80%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                                                    <Text style={styles.CustHeadTextValue}>{selectedCustomer && selectedCustomer.Custname?.trim() !== '' ? selectedCustomer.Custname : ''}</Text>
                                                                                </View>
                                                                            </View>
                                                                            <View style={styles.CustUiItem}>
                                                                                <Text style={styles.CustHeadText}>Account</Text>
                                                                                <Text style={styles.CustHeadTextValue}>{selectedCustomer && selectedCustomer.account?.trim() !== '' ? selectedCustomer.account : ''}</Text>
                                                                            </View>
                                                                            <View style={styles.CustUiItem}>
                                                                                <Text style={styles.CustHeadText}>Address</Text>
                                                                                <Text style={styles.CustHeadTextValue}>{selectedCustomer && selectedCustomer.address1 !== '' && selectedCustomer.address2 !== '' && selectedCustomer.address3 !== '' ? selectedCustomer.address1 + selectedCustomer.address2 + selectedCustomer.address3 : ''}</Text>
                                                                            </View>
                                                                            <View style={styles.CustUiItem}>
                                                                                <Text style={styles.CustHeadText}>Status</Text>
                                                                                <Text style={styles.CustHeadTextValue}>{selectedCustomer && selectedCustomer.CREDITMETHOD}</Text>
                                                                            </View>
                                                                        </View>
                                                                    }
    
                                                                    {
                                                                        selectedTab === 'Details' &&
                                                                        <>
    
    
                                                                            <View style={styles.DetailsInpCont}>
    
                                                                                <View style={styles.RemarkInputCont}>
                                                                                    <TextInput
                                                                                        style={styles.PlaceHolderInput}
                                                                                        placeholder='Enter Trn'
                                                                                        value={trn}
                                                                                        onChangeText={text => setTrn(text)}
                                                                                        placeholderTextColor="#aaa"
                                                                                    />
                                                                                </View>
    
                                                                                <View style={styles.RemarkInputCont}>
                                                                                    <TextInput
                                                                                        style={styles.PlaceHolderInput}
                                                                                        placeholder='Enter order remark'
                                                                                        value={orderRemark}
                                                                                        onChangeText={text => setOrderRemark(text)}
                                                                                        placeholderTextColor="#aaa"
                                                                                    />
                                                                                </View>
    
                                                                                <View style={styles.RemarkInputCont}>
                                                                                    <TextInput
                                                                                        style={styles.PlaceHolderInput}
                                                                                        placeholder='payment'
                                                                                        value={payment}
                                                                                        onChangeText={text => setPayment(text)}
                                                                                        placeholderTextColor="#aaa"
                                                                                    />
                                                                                </View>
    
                                                                                <View style={styles.RemarkInputCont}>
                                                                                    <TextInput
                                                                                        style={styles.PlaceHolderInput}
                                                                                        placeholder='delivery'
                                                                                        value={delivery}
                                                                                        onChangeText={text => setDelivery(text)}
                                                                                        placeholderTextColor="#aaa"
                                                                                    />
                                                                                </View>
    
                                                                                <View style={styles.RemarkInputCont}>
                                                                                    <TextInput
                                                                                        style={styles.PlaceHolderInput}
                                                                                        placeholder='validity'
                                                                                        value={validity}
                                                                                        onChangeText={text => setValidity(text)}
                                                                                        placeholderTextColor="#aaa"
                                                                                    />
                                                                                </View>
                                                                            </View>
    
                                                                        </>
                                                                    }
    
                                                                </View> */}
                            </>
                          ) : (
                            <>
                              <View style={styles.NextWrap}>
                                <View style={styles.NextValuesCotn}>
                                  <View style={styles.NextValueInner}>
                                    <Text style={styles.CustHeadText}>
                                      Credit Limit:
                                    </Text>
                                    <Text
                                      style={[
                                        styles.CustHeadTextValue,
                                        {marginLeft: 12},
                                      ]}>
                                      {selectedCustomer &&
                                        selectedCustomer.Credit_Limit}
                                    </Text>
                                  </View>
                                  <View style={styles.NextValueInner}>
                                    <Text style={styles.CustHeadText}>
                                      Available Balance:
                                    </Text>
                                    <Text
                                      style={[
                                        styles.CustHeadTextValue,
                                        {marginLeft: 12},
                                      ]}>
                                      {selectedCustomer &&
                                        selectedCustomer.Avai_Bal}
                                    </Text>
                                  </View>
                                </View>
                                {blocknextButtonView === false && (
                                  <View>
                                    <TouchableOpacity
                                      style={styles.NextButton}
                                      onPress={() => NextClick()}>
                                      <Text
                                        style={[
                                          styles.CustHeadText,
                                          {color: 'white'},
                                        ]}>
                                        Next
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>

                              <View style={styles.AddressDetailsWrap}>
                                <View style={styles.AddressTopBanner}>
                                  <Text style={styles.CustHeadText}>
                                    Walkin Customer Details
                                  </Text>
                                </View>

                                <View style={styles.TermsCondtitonInpWrap}>
                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Name
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        ref={cashCustNameRef}
                                        // placeholder='Name'
                                        value={cashCustomerName}
                                        onChangeText={text =>
                                          setCashCustomerName(text)
                                        }
                                        placeholderTextColor="#aaa"
                                        // onBlur={() => {
                                        //     if (cashCustAddressRef.current) {
                                        //         cashCustAddressRef.current.focus();
                                        //     }
                                        // }}
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Address
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        ref={cashCustAddressRef}
                                        // placeholder='Address'
                                        value={cashCustomerAddress}
                                        onChangeText={text =>
                                          setCashCustomerAddress(text)
                                        }
                                        placeholderTextColor="#aaa"
                                        // onBlur={() => {
                                        //     if (cashCustPhoneRef.current) {
                                        //         cashCustPhoneRef.current.focus();
                                        //     }
                                        // }}
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Phone Number
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        ref={cashCustPhoneRef}
                                        // placeholder='Phone Number'
                                        value={cashCustomerPhone}
                                        onChangeText={text =>
                                          setCashCustomerPhone(text)
                                        }
                                        placeholderTextColor="#aaa"
                                        // onBlur={() => {
                                        //     if (searchItemInpRef.current) {
                                        //         searchItemInpRef.current.focus();
                                        //     }
                                        // }}
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Remark
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='Enter order remark'
                                        value={orderRemark}
                                        onChangeText={text =>
                                          setOrderRemark(text)
                                        }
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      TRN
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='Enter Trn'
                                        value={trn}
                                        onChangeText={text => setTrn(text)}
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Payment
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='payment'
                                        value={payment}
                                        onChangeText={text => setPayment(text)}
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Delivery
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='delivery'
                                        value={delivery}
                                        onChangeText={text => setDelivery(text)}
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.TANDCInpItem}>
                                    <Text
                                      style={[
                                        styles.CustHeadText,
                                        {width: '20%'},
                                      ]}>
                                      Validity
                                    </Text>
                                    <View style={styles.TANDCInpCont}>
                                      <TextInput
                                        style={styles.NewInputStyle}
                                        // placeholder='validity'
                                        value={validity}
                                        onChangeText={text => setValidity(text)}
                                        placeholderTextColor="#aaa"
                                      />
                                    </View>
                                  </View>
                                </View>
                              </View>

                              {/* <View style={styles.CustomerUIWrap}>
    
                                                                    <View style={styles.TabCont}>
                                                                        <TouchableOpacity style={[styles.TabButtons, walkSelectTab === 'WalkCustomer' && styles.SelectedTab]} onPress={() => setWalkSelectTab('WalkCustomer')}>
                                                                            <Text style={[styles.TabText, walkSelectTab === 'WalkCustomer' && styles.SelectedText]}>Walk in Customer</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity style={[styles.TabButtons, { marginLeft: 8 }, walkSelectTab === 'Details' && styles.SelectedTab]} onPress={() => setWalkSelectTab('Details')}>
                                                                            <Text style={[styles.TabText, walkSelectTab === 'Details' && styles.SelectedText]}>Details</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
    
                                                                    {
                                                                        walkSelectTab === 'WalkCustomer' &&
                                                                        <View style={styles.DetailsInpCont}>
                                                                            <View style={styles.RemarkInputCont}>
                                                                                <TextInput
                                                                                    style={styles.PlaceHolderInput}
                                                                                    ref={cashCustNameRef}
                                                                                    placeholder='Name'
                                                                                    value={cashCustomerName}
                                                                                    onChangeText={text => setCashCustomerName(text)}
                                                                                    placeholderTextColor="#aaa"
                                                                                // onBlur={() => {
                                                                                //     if (cashCustAddressRef.current) {
                                                                                //         cashCustAddressRef.current.focus();
                                                                                //     }
                                                                                // }}
                                                                                />
                                                                            </View>
    
                                                                            <View style={styles.RemarkInputCont}>
                                                                                <TextInput
                                                                                    style={styles.PlaceHolderInput}
                                                                                    ref={cashCustAddressRef}
                                                                                    placeholder='Address'
                                                                                    value={cashCustomerAddress}
                                                                                    onChangeText={text => setCashCustomerAddress(text)}
                                                                                    placeholderTextColor="#aaa"
                                                                                // onBlur={() => {
                                                                                //     if (cashCustPhoneRef.current) {
                                                                                //         cashCustPhoneRef.current.focus();
                                                                                //     }
                                                                                // }}
                                                                                />
                                                                            </View>
    
                                                                            <View style={styles.RemarkInputCont}>
                                                                                <TextInput
                                                                                    style={styles.PlaceHolderInput}
                                                                                    ref={cashCustPhoneRef}
                                                                                    placeholder='Phone Number'
                                                                                    value={cashCustomerPhone}
                                                                                    onChangeText={text => setCashCustomerPhone(text)}
                                                                                    placeholderTextColor="#aaa"
                                                                                // onBlur={() => {
                                                                                //     if (searchItemInpRef.current) {
                                                                                //         searchItemInpRef.current.focus();
                                                                                //     }
                                                                                // }}
                                                                                />
                                                                            </View>
                                                                        </View>
    
                                                                    }
    
                                                                    {
                                                                        walkSelectTab === 'Details' &&
                                                                        <View style={styles.DetailsInpCont}>
                                                                            <View style={styles.RemarkInputCont}>
                                                                                <TextInput
                                                                                    style={styles.PlaceHolderInput}
                                                                                    placeholder='Enter order remark'
                                                                                    value={orderRemark}
                                                                                    onChangeText={text => setOrderRemark(text)}
                                                                                    placeholderTextColor="#aaa"
                                                                                />
                                                                            </View>
    
    
                                                                            <View style={styles.RemarkInputCont}>
                                                                                <TextInput
                                                                                    style={styles.PlaceHolderInput}
                                                                                    placeholder='Enter Trn'
                                                                                    value={trn}
                                                                                    onChangeText={text => setTrn(text)}
                                                                                    placeholderTextColor="#aaa"
                                                                                />
                                                                            </View>
    
                                                                            <View style={styles.RemarkInputCont}>
                                                                                <TextInput
                                                                                    style={styles.PlaceHolderInput}
                                                                                    placeholder='payment'
                                                                                    value={payment}
                                                                                    onChangeText={text => setPayment(text)}
                                                                                    placeholderTextColor="#aaa"
                                                                                />
                                                                            </View>
    
                                                                            <View style={styles.RemarkInputCont}>
                                                                                <TextInput
                                                                                    style={styles.PlaceHolderInput}
                                                                                    placeholder='delivery'
                                                                                    value={delivery}
                                                                                    onChangeText={text => setDelivery(text)}
                                                                                    placeholderTextColor="#aaa"
                                                                                />
                                                                            </View>
    
                                                                            <View style={styles.RemarkInputCont}>
                                                                                <TextInput
                                                                                    style={styles.PlaceHolderInput}
                                                                                    placeholder='validity'
                                                                                    value={validity}
                                                                                    onChangeText={text => setValidity(text)}
                                                                                    placeholderTextColor="#aaa"
                                                                                />
                                                                            </View>
                                                                        </View>
                                                                    }
                                                                </View> */}
                            </>
                          )
                        }

                        {/* <View style={styles.NextWrap}>
    
                                                        <View style={styles.NextValuesCotn}>
                                                            <View style={styles.NextValueInner}>
                                                                <Text style={styles.CustHeadText}>Credit Limit:</Text>
                                                                <Text style={[styles.CustHeadTextValue, { marginLeft: 12 }]}>{selectedCustomer && selectedCustomer.Credit_Limit}</Text>
                                                            </View>
                                                            <View style={styles.NextValueInner}>
                                                                <Text style={styles.CustHeadText}>Available Balance:</Text>
                                                                <Text style={[styles.CustHeadTextValue, { marginLeft: 12 }]}>{selectedCustomer && selectedCustomer.Avai_Bal}</Text>
                                                            </View>
                                                        </View>
    
                                                        {
                                                            blocknextButtonView === false &&
                                                            <View>
                                                                <TouchableOpacity style={styles.NextButton} onPress={() => NextClick()}>
                                                                    <Text style={[styles.CustHeadText, { color: 'white' }]}>Next</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        }
    
                                                    </View> */}
                      </>
                    </View>
                  )}

                  <View style={[styles.HomeTextCont, {marginTop: 24}]}>
                    <TouchableOpacity
                      style={styles.DeleteAllDataButton}
                      onPress={() => setShowResetPop(true)}>
                      <Text style={styles.DeleteDataText}>Reset Data</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {showCartPanel && (
                <>
                  <View style={styles.StockItemBox}>
                    <View style={styles.StockItemWrap}>
                      {/* <View style={styles.StockItemHead}>
    
    
                                                    <View style={styles.StockBagWrap}>
    
                                                        <TouchableOpacity style={styles.stockBagCont} onPress={() => setShowSelectedStockPop(!showSelectedStockPop)}>
                                                            <Image style={styles.stockBagIcon} source={require('../images/goCart.png')} />
    
                                                            <View style={styles.itemCount}>
                                                                <Text style={styles.itemCountText}>{savedItemData && savedItemData.length}</Text>
                                                            </View>
                                                        </TouchableOpacity>
    
                                                    </View>
                                                </View> */}

                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        {/* <View style={[styles.RemarkInputCont, { width: '100%' }]}>
                                                        <TextInput
                                                            style={styles.PlaceHolderInput}
                                                            ref={searchItemInpRef}
                                                            placeholder='Search Item'
                                                            value={searchItem}
                                                            onChangeText={text => setSearchItem(text)}
                                                            placeholderTextColor="#aaa"
                                                        />
                                                    </View> */}
                        <View
                          style={[
                            styles.TANDCInpCont,
                            {width: '95%', marginTop: 12},
                          ]}>
                          <TextInput
                            style={styles.NewInputStyle}
                            ref={searchItemInpRef}
                            placeholder="Search Item"
                            value={searchItem}
                            onChangeText={text => setSearchItem(text)}
                            placeholderTextColor="#aaa"
                          />
                        </View>
                      </View>

                      {showItemSrchAct && <ActivityIndicator />}

                      {stockSearchError && !showItemSrchAct && (
                        <View>
                          <Text style={styles.ErrorText}>
                            {stockSearchError}
                          </Text>
                        </View>
                      )}

                      {stockData && !selectedStock && (
                        // <View style={styles.StockTableContainer}>
                        //     <View style={styles.tableRow}>
                        //         <Text style={[styles.StockheaderCell, {
                        //             borderTopLeftRadius: 4
                        //         }]}>Code</Text>
                        //         <Text style={[styles.StockheaderCell, {
                        //             borderTopRightRadius: 4
                        //         }]}>Description</Text>
                        //     </View>

                        //     <ScrollView style={styles.ScrollView} nestedScrollEnabled={true}>
                        //         {
                        //             stockData && stockData.length > 0 && stockData.map((item, index) => (
                        //                 <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedStock(item)}>
                        //                     <Text style={styles.StockdataCell}>{item.Code}</Text>
                        //                     <Text style={styles.StockdataCell}>{item.Description}</Text>
                        //                 </TouchableOpacity>

                        //             ))
                        //         }
                        //     </ScrollView>

                        // </View>
                        <>
                          <ScrollView
                            nestedScrollEnabled={true}
                            contentContainerStyle={[styles.CheckStockListView]}
                            keyboardShouldPersistTaps="handled">
                            {stockData &&
                              stockData.length > 0 &&
                              stockData.map((item, index) => (
                                <TouchableOpacity
                                  style={[
                                    styles.StockListItem,
                                    {
                                      borderColor: '#E2E8F0',
                                      borderWidth: 1,
                                      backgroundColor: '#F8FAFC',
                                      padding: 10,
                                      borderRadius: 8,
                                      marginVertical: 4,
                                    },
                                  ]}
                                  key={index}
                                  onPress={() => {
                                    if (cmpcode == 'SUPERLAND') {
                                      setSelectedStock(item);
                                    } else {
                                      checkIfitemStockisZero(item);
                                    }
                                  }}>
                                  {/* Row 1 */}
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}>
                                    <Text
                                      style={[
                                        styles.StockListDescText,
                                        {
                                          width: '70%',
                                          fontWeight: '600',
                                          color: '#1F2937',
                                        },
                                      ]}
                                      numberOfLines={1}>
                                      {item.Description}
                                    </Text>

                                    <Text style={styles.StockListDescTextSmall}>
                                      Avl Qty:{' '}
                                      <Text
                                        style={{
                                          color:
                                            item.AvlQty > 0
                                              ? '#16A34A'
                                              : '#DC2626',
                                          fontWeight: '700',
                                        }}>
                                        {item.AvlQty}
                                      </Text>
                                    </Text>
                                  </View>

                                  {/* Row 2 */}
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      marginTop: 4,
                                    }}>
                                    <Text
                                      style={[
                                        styles.StockListDescTextSmall,
                                        {color: '#64748B'},
                                      ]}>
                                      {item.Code}
                                    </Text>

                                    <Text
                                      style={[
                                        styles.StockListDescTextSmall,
                                        {color: '#2563EB'},
                                      ]}>
                                      Cash: {item['Cash Price']}
                                    </Text>
                                    {cmpcode?.trim().toUpperCase() ===
                                      'STARLINK' && (
                                      <Text
                                        style={[
                                          styles.StockListDescTextSmall,
                                          {color: '#2563EB'},
                                        ]}>
                                        Cost: {item.Cost_Avg}
                                      </Text>
                                    )}

                                    <Text
                                      style={[
                                        styles.StockListDescTextSmall,
                                        {color: '#0EA5E9'},
                                      ]}>
                                      Credit: {item['Credit Price']}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              ))}
                          </ScrollView>

                          {stockData === null && <ActivityIndicator />}

                          {stockData && stockData.length === 0 && (
                            <View>
                              <Text
                                style={{
                                  color: 'red',
                                  fontFamily: 'Lexend-Bold',
                                }}>
                                No data available
                              </Text>
                            </View>
                          )}
                        </>
                      )}

                      {selectedStock && (
                        <View>
                          <View style={styles.SelectedItemHead}>
                            <Text
                              style={[
                                styles.SelectedItemText,
                                {fontSize: 13, width: '85%'},
                              ]}>
                              {selectedStock && selectedStock.Description !== ''
                                ? selectedStock.Description
                                : ''}
                            </Text>
                            <Text
                              style={[
                                styles.SelectedItemText,
                                {fontSize: 13, fontFamily: 'Lexend-Regular'},
                              ]}>
                              {selectedStock && selectedStock.Code !== ''
                                ? selectedStock.Code
                                : ''}
                            </Text>
                            <TouchableOpacity
                              style={styles.DeleteButton}
                              onPress={() => ItemBinClick()}>
                              <Image
                                style={styles.UpdateIcons}
                                source={require('../images/deleteBin.png')}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      <View style={styles.AddtoCartInps}>
                        <View style={[styles.TANDCInpItem, {width: '75%'}]}>
                          <View
                            style={{
                              flexDirection: 'row',
                              width: '100%',
                              paddingVertical: 6,
                            }}>
                            <Text style={styles.StockListDescTextSmall}>
                              AvlQty{' '}
                            </Text>
                            <Text style={{marginLeft: 10}}>
                              {selectedStock && selectedStock.Code !== ''
                                ? selectedStock.Qty
                                : ''}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.TANDCInpItem, {width: '75%'}]}>
                          <Text style={[styles.CustHeadText, {width: '20%'}]}>
                            Unit
                          </Text>
                          <View style={[styles.AddItemInpCont, {marginTop: 0}]}>
                            {/* <Text style={styles.AddCartInpLabel}>Unit</Text> */}
                            <View
                              style={[
                                {
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  height: 35,
                                },
                              ]}>
                              <Text
                                style={[
                                  {marginLeft: 4, color: '#aaa', width: '100%'},
                                ]}>
                                {unitValue}
                              </Text>
                              <TouchableOpacity
                                style={{
                                  position: 'absolute',
                                  right: 8,
                                }}
                                onPress={() => setShowUnitPop(true)}>
                                <Image
                                  style={styles.UnitDrpImg}
                                  source={require('../images/drop.png')}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>

                        <View style={[styles.TANDCInpItem, {width: '75%'}]}>
                          <Text style={[styles.CustHeadText, {width: '20%'}]}>
                            Qty
                          </Text>

                          <View
                            style={[
                              styles.TANDCInpCont,
                              {marginTop: 0, width: '60%'},
                            ]}>
                            {/* <Text style={styles.AddCartInpLabel}>Qty</Text> */}
                            <TextInput
                              style={styles.NewInputStyle}
                              ref={qtyInpRef}
                              // placeholder="Qty"
                              placeholderTextColor="#aaa"
                              keyboardType="numeric" // This ensures the numeric keyboard appears
                              onChangeText={text => {
                                const numericText = text.replace(
                                  /[^0-9.]/g,
                                  '',
                                ); // This removes any non-numeric characters
                                setQuantity(numericText);
                              }}
                              onBlur={() => {
                                if (unitPriceInpRef.current) {
                                  unitPriceInpRef.current.focus();
                                }
                              }}
                              value={quantity}
                            />
                          </View>
                        </View>

                        <View style={[styles.TANDCInpItem, {width: '75%'}]}>
                          <Text style={[styles.CustHeadText, {width: '20%'}]}>
                            Price
                          </Text>

                          <View
                            style={[
                              styles.TANDCInpCont,
                              {marginTop: 0, width: '60%'},
                            ]}>
                            {/* <Text style={styles.AddCartInpLabel}>Price</Text> */}
                            <TextInput
                              style={styles.NewInputStyle}
                              ref={unitPriceInpRef}
                              // placeholder='Unit price'
                              placeholderTextColor="#aaa"
                              keyboardType="numeric"
                              onChangeText={text => {
                                console.log('onchangetext -->', text);
                                const numericText = text.replace(
                                  /[^0-9.]/g,
                                  '',
                                ); // This removes any non-numeric characters
                                setUnitPrice(numericText);
                              }}
                              value={
                                cmpcode?.trim().toUpperCase() == 'SUPERLAND' ||
                                cmpcode?.trim().toUpperCase() ==
                                  'SALESDOODDEMO' ||
                                cmpcode?.trim().toUpperCase() == 'POPULAR' ||
                                cmpcode?.trim().toUpperCase() != 'AUTOMAX' ||
                                selectedStock?.Code == 'CUSTOM-CODE'
                                  ? unitPrice
                                  : formatPrice3Decimal(unitPrice)
                              }
                              editable={
                                cmpcode?.trim().toUpperCase() == 'SUPERLAND' ||
                                cmpcode?.trim().toUpperCase() ==
                                  'SALESDOODDEMO' ||
                                cmpcode?.trim().toUpperCase() == 'POPULAR' ||
                                cmpcode?.trim().toUpperCase() != 'AUTOMAX' ||
                                selectedStock?.Code == 'CUSTOM-CODE'
                                  ? true
                                  : false
                              }
                            />
                          </View>
                          {isCallingBulkApi && <ActivityIndicator />}
                        </View>

                        <View style={[styles.TANDCInpItem, {width: '75%'}]}>
                          <Text style={[styles.CustHeadText, {width: '20%'}]}>
                            Total
                          </Text>
                          <View style={[styles.AddItemInpCont, {marginTop: 0}]}>
                            {/* <Text style={styles.AddCartInpLabel}>Unit</Text> */}
                            <View
                              style={[
                                {
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  height: 35,
                                },
                              ]}>
                              <Text
                                style={[
                                  {marginLeft: 4, color: '#aaa', width: '100%'},
                                ]}>
                                {(quantity * unitPrice).toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 16,
                    }}>
                    <TouchableOpacity
                      style={[styles.NextButton, {width: '30%'}]}
                      onPress={() => {
                        setShowCartPanel(false);
                      }}>
                      <Text
                        style={[
                          styles.CustHeadText,
                          {color: 'white', textAlign: 'center'},
                        ]}>
                        Back
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.AddCartButton, {width: '30%'}]}
                      onPress={() => SaveItem()}>
                      <Text
                        style={[
                          styles.CustHeadText,
                          {color: 'white', textAlign: 'center'},
                        ]}>
                        Add to Cart
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* </TouchableWithoutFeedback> */}
                </>
              )}

              {customerCreditBlocked === true && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'red',
                      fontFamily: 'Lexend-Bold',
                    }}>
                    This customer is blocked for any kind of transaction
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* <View><Text>TESTETETETETE</Text></View> */}
        </KeyboardAvoidingView>
        {/* </TouchableWithoutFeedback> */}

        {showSelectedStockPop && (
          <SelectedStockPopQuotation
            savedItemData={savedItemData}
            setShowSelectedStockPop={setShowSelectedStockPop}
            showSelectedStockPop={showSelectedStockPop}
            handleRemoveItem={handleRemoveItem}
            EditItem={EditItem}
            setShowQuotationPop={setShowQuotationPop}
            cmpcode={cmpcode}
          />
        )}

        {showQuotationPop && (
          <MakeQuotationPopup
            setShowQuotationPop={setShowQuotationPop}
            showQuotationPop={showQuotationPop}
            selectedCustomer={selectedCustomer}
            orderRemark={orderRemark}
            payment={payment}
            delivery={delivery}
            validity={validity}
            savedItemData={savedItemData}
            totalUnitPrice={totalUnitPrice}
            cashCustomerName={cashCustomerName}
            cashCustomerAddress={cashCustomerAddress}
            cashCustomerPhone={cashCustomerPhone}
            showMakeOrderSuccess={showMakeOrderSuccess}
            showMakeOrderError={showMakeOrderError}
            type={operationType}
            salesMan={salesMan}
            appUrl={appUrl}
            cmpcode={cmpcode}
            trn={trn}
            deptNo={deptNo}
            van={van}
            selectedUserType={selectedUserType}
            selectedRadio={selectedRadio}
            unitValue={unitValue}
            setTrn={setTrn}
            setSelectedCustomer={setSelectedCustomer}
            setOrderRemark={setOrderRemark}
            setPayment={setPayment}
            setDelivery={setDelivery}
            setValidity={setValidity}
            setSavedItemData={setSavedItemData}
            setTotalUnitPrice={setTotalUnitPrice}
            setCashCustomerName={setCashCustomerName}
            setCashCustomerAddress={setCashCustomerAddress}
            setCashCustomerPhone={setCashCustomerPhone}
            removeAsyncItems={removeAsyncItems}
            removeAsyncItemsAfterOrderMade={removeAsyncItemsAfterOrderMade}
            setShowSelectedStockPop={setShowSelectedStockPop}
            setDeptNo={setDeptNo}
            setVan={setVan}
            setShowCartPanel={setShowCartPanel}
          />
        )}
      </View>

      {showResetPop && (
        <View style={styles.LogOutModalWrapper}>
          <View style={styles.LogOutModal}>
            <View>
              <Text
                style={{
                  color: 'red',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 8,
                  margin: 4,
                  fontFamily: 'Lexend-Regular',
                }}>
                Reset Data
              </Text>
            </View>
            <View>
              <Text
                style={{
                  color: 'black',
                  fontSize: 16,
                  padding: 8,
                  margin: 4,
                  fontFamily: 'Lexend-Regular',
                }}>
                Are you sure ?
              </Text>
            </View>

            <View
              style={{
                // width: '100%',
                padding: 8,
                margin: 4,
                paddingLeft: 12,
                paddingRight: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'grey',
                  padding: 8,
                  borderRadius: 4,
                }}
                onPress={() => setShowResetPop(false)}>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Lexend-Regular',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: 'red',
                  padding: 8,
                  borderRadius: 4,
                }}
                onPress={() => removeAsyncItems()}>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Lexend-Regular',
                  }}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showUnitPop && (
        <View style={styles.UnitModalWrapper}>
          <View style={styles.UnitModal}>
            <ScrollView
              nestedScrollEnabled={true}
              contentContainerStyle={styles.UnitScrollView}>
              {dummyUnits &&
                dummyUnits.map((item, index) => (
                  <TouchableOpacity
                    style={styles.UntiItems}
                    onPress={() => handleUnitClick(item.unit)}>
                    <Text style={styles.UnitText}>{item.unit}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      )}

      {isCallingDueDateApi && (
        <View style={styles.UnitModalWrapper}>
          <View style={styles.UnitModal}>
            <Text style={{margin: 4, color: '#000000'}}>
              Checking Customer Due Days...Please wait
            </Text>
            <ActivityIndicator />
          </View>
        </View>
      )}

      {isCallingPriceManagementApi && (
        <View style={styles.UnitModalWrapper}>
          <View style={styles.UnitModal}>
            <Text style={{margin: 4, color: '#000000'}}>
              Checking if item is in Price Management...Please wait
            </Text>
            <ActivityIndicator />
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  HomeWrap: {
    flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#EFEFEF',
  },
  HomeCont: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    // borderTopLeftRadius: 18,
    // borderTopRightRadius: 18,
    backgroundColor: '#EFEFEF',
    // height: Dimensions.get('window').height
  },
  HomeTextCont: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  HomeText: {
    fontSize: 16,
    color: 'black',
    borderBottomColor: 'gold',
    borderBottomWidth: 2,
    marginTop: 6,
    marginLeft: 6,
    paddingBottom: 8,
    fontFamily: 'Lexend-Bold',
  },
  MainScroll: {
    marginBottom: 50,
    width: '100%',
  },
  InputCont: {
    width: '94%',
    backgroundColor: 'white',
    paddingVertical: 4,
    // paddingHorizontal: 4,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  InputImageCont: {
    // backgroundColor: '#EAEDF5',
    width: '10%',
    padding: 8,
    borderRadius: 6,
    // position: 'absolute',
    // right: 10
  },
  SearchIcon: {
    width: 25,
    height: 25,
  },
  TextInput: {
    width: '90%',
    fontFamily: 'Lexend-Light',
    color: '#2B2B2B',
  },

  TableContainer: {
    width: '100%',
    // padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    // justifyContent: 'space-between',
    // marginBottom: 5,
    // paddingVertical: 5,
  },
  headerCell: {
    // flex: 1,
    backgroundColor: '#5A55CA',
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    flexWrap: 'nowrap',
    width: '33%',
    color: 'white',
    fontFamily: 'Lexend-Bold',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#dbdbdb',
  },
  dataCell: {
    // flex: 1,
    // backgroundColor: '#F3F3F3',
    backgroundColor: 'white',
    padding: 10,
    textAlign: 'center',
    width: '33%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#dbdbdb',
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  ScrollView: {
    maxHeight: Dimensions.get('window').height - 300,
    minHeight: 'auto',
    marginBottom: 8,
  },
  SelectedStockWrap: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  NameDescCont: {
    flexDirection: 'row',
    width: '95%',
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  AddressCont: {
    flexDirection: 'row',
    width: '95%',
    paddingHorizontal: 8,
    paddingVertical: 12,
    // alignItems: 'center',
    flexWrap: 'wrap',
  },
  TextNameDesc: {
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  TextNameDescValue: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: 'black',
    marginLeft: 12,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#dbdbdb',
  },
  TextAddressValue: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: 'black',
    marginLeft: 12,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#dbdbdb',
    marginVertical: 4,
  },
  StockValueWrap: {
    flexDirection: 'column',
    // flexWrap: 'wrap',
    width: '100%',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    marginTop: 12,
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
    marginBottom: 8,
  },
  PriceCard: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '48%',
    // marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    // marginVertical: 8
    margin: 2,
  },
  PriceText: {
    color: '#189A2E',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  PriceValue: {
    backgroundColor: '#189A2E',
    color: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontFamily: 'Lexend-Bold',
  },
  AddressBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  EnterCashCustomerButtonSection: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 6,
  },
  OrText: {
    color: 'black',
    fontSize: 15,
    fontFamily: 'Lexend-Regular',
  },
  CashCustomerButton: {
    backgroundColor: '#1A6CF6',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 6,
  },
  CashCustText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  OrderMainWrap: {
    // backgroundColor: 'white',
    paddingHorizontal: 6,
    // paddingVertical: 4,
    borderRadius: 6,
    width: '100%',
    // marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  SelectedCustWrap: {
    flexDirection: 'column',
    width: '100%',
  },
  SelectCustItem: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginVertical: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
    // justifyContent: 'space-between'
  },
  SelectedText: {
    color: 'brown',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  SelectedValue: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    marginLeft: 24,
  },
  RemarkCont: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 12,
  },
  RemarkInputCont: {
    width: '100%',
    backgroundColor: '#F0F4FD',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  RemarkText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  DAQCont: {
    backgroundColor: '#5A55CA',
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginTop: 8,
    borderRadius: 4,
    width: '100%',
  },
  DAQHeadText: {
    color: 'white',
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    marginLeft: 4,
  },
  DAQText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
    fontSize: 16,
    marginLeft: 16,
    textAlign: 'left',
    width: '100%',
  },
  DAQInputCont: {
    width: '95%',
    backgroundColor: 'white',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginLeft: 6
  },
  DAQInpBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    width: '100%',
  },
  StockItemBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  StockItemWrap: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'white',
    // marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 2,
  },
  StockItemHead: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  StockItemQtyPriceWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  StockInputCont: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  StockTextInput: {
    width: '100%',
    fontFamily: 'Lexend-Bold',
    color: '#2B2B2B',
  },
  PriceCardTotal: {
    backgroundColor: '#189A2E',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '48%',
    // marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    // marginVertical: 8
    margin: 2,
  },
  PriceTextTotal: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  PriceValueTotal: {
    backgroundColor: 'white',
    color: '#189A2E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontFamily: 'Lexend-Bold',
  },
  PriceCardAllTotal: {
    backgroundColor: '#5A55CA',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    // marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    // marginVertical: 8
    marginTop: 12,
  },
  PriceValueAllTotal: {
    backgroundColor: 'white',
    color: '#5A55CA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontFamily: 'Lexend-Bold',
  },
  SelectItemCont: {
    backgroundColor: '#1A6CF6',
    paddingVertical: 15,
    paddingHorizontal: 18,
    // borderRadius: 20,
    // marginLeft: 20
  },
  SelectText: {
    color: '#525252',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },

  StockTableContainer: {
    width: '100%',
    // padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    // justifyContent: 'space-between',
    // marginBottom: 5,
    // paddingVertical: 5,
  },
  StockheaderCell: {
    // flex: 1,
    backgroundColor: '#5A55CA',
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    flexWrap: 'nowrap',
    width: '50%',
    color: 'white',
    fontFamily: 'Lexend-Bold',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#dbdbdb',
  },
  StockdataCell: {
    backgroundColor: 'white',
    padding: 10,
    textAlign: 'center',
    width: '50%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#dbdbdb',
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  W100: {
    width: '100%',
    marginVertical: 12,
  },
  SelectedItemHead: {
    flexDirection: 'column',
    marginVertical: 8,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  SelectedItemText: {
    color: '#2B2B2B',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    marginLeft: 8,
  },
  StockBagWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBagIcon: {
    width: 20,
    height: 20,
  },
  stockBagCont: {
    backgroundColor: '#E0E9F7',
    padding: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderRadius: 50,
  },
  stockBagText: {
    fontSize: 12,
    fontFamily: 'Lexend-Light',
    color: '#1A6CF6',
    marginLeft: 12,
    marginRight: 12,
  },
  itemCount: {
    position: 'absolute',
    top: -15,
    right: -10,
    backgroundColor: '#1A6CF6',
    // padding: 2,
    borderRadius: 50,
    width: 30,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCountText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  ContinueWrap: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  ContinueButton: {
    padding: 12,
    backgroundColor: 'black',
    borderRadius: 6,
  },
  ContinueText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },

  EnterItemInpCont: {
    width: '100%',
    backgroundColor: 'white',
    // paddingVertical: 2,
    // paddingHorizontal: 8,
    marginTop: 16,
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  SelectHeadText: {
    color: '#2B2B2B',
    fontSize: 14,
    fontFamily: 'Lexend-Light',
  },
  QtyPriceInpCont: {
    width: '100%',
    backgroundColor: 'white',
    // paddingVertical: 2,
    // paddingHorizontal: 8,
    // marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  QtyPriceTextInp: {
    width: '60%',
    fontFamily: 'Lexend-Bold',
  },
  SelectedItemHeadStockCost: {
    flexDirection: 'row',
    InputContmarginVertical: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginLeft: 12,
    marginBottom: 8,
    marginTop: 12,
    borderTopColor: 'grey',
    borderTopWidth: 1,
  },
  MakeQuotHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  DeleteAllDataButton: {
    backgroundColor: '#64558E',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  DeleteDataText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  HeadIcon: {
    width: 25,
    height: 25,
  },
  TopBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  CustomerUIWrap: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    // padding: 18
  },
  CustomerText: {
    fontFamily: 'Lexend-Regular',
    color: '#3A80EA',
    fontSize: 16,
  },
  CustHeadText: {
    color: '#2B2B2B',
    fontSize: 14,
    fontFamily: 'Lexend-Light',
  },
  CustHeadTextValue: {
    color: '#2B2B2B',
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
  },
  CustUiItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  PlaceHolderInput: {
    width: '100%',
    fontFamily: 'Lexend-Light',
    color: '#2B2B2B',
  },
  CustomerText: {
    fontFamily: 'Lexend-Regular',
    color: '#2B2B2B',
    fontSize: 16,
  },

  WalkInputCont: {
    width: '94%',
    backgroundColor: 'white',
    paddingVertical: 8,
    // paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  OrWrap: {
    position: 'absolute',
    right: '18%',
    top: '24%',
    backgroundColor: '#D9D9D9',
    padding: 8,
    borderRadius: 25,
    zIndex: 2,
  },
  OrText: {
    fontFamily: 'Lexend-Regular',
    color: '#3A80EA',
    fontSize: 14,
  },

  LogOutModalWrapper: {
    zIndex: 2,
    backgroundColor: '#00000080',
    position: 'absolute',
    width: '100%',
    height: Dimensions.get('window').height,
  },
  LogOutModal: {
    backgroundColor: 'white',
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    width: '80%',
    height: 160,
    borderRadius: 8,
  },
  LogoutButton: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'red',
    borderRadius: 4,
    alignItems: 'center',
  },

  ErrorText: {
    color: 'red',
    fontFamily: 'Lexend-Regular',
    fontSize: 16,
  },

  StockItemQtyPriceWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  StockInputCont: {
    // width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  RemarkInputCont: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
  },
  RemarkText: {
    color: '#2B2B2B',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },

  AddtoCartCont: {
    width: '18%',
    backgroundColor: '#1A6CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },

  UPDOWNButton: {
    backgroundColor: '#1A6CF6',
    padding: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 50,
  },

  UPDOWNIMG: {
    width: 12,
    height: 12,
  },

  CustomerUIWrapDrop: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 8,
    backgroundColor: 'white',

    // padding: 18
  },

  CustomerSearchInp: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 4,
    // paddingHorizontal: 4,
    // marginTop: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  WalkInCutomerButton: {
    backgroundColor: '#EC6013',
    position: 'absolute',
    padding: 16,
    right: '0%',
  },

  TabCont: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  TabButtons: {
    padding: 8,
  },

  TabText: {
    color: '#2B2B2B',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    padding: 8,
  },
  SelectedTab: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A6CF6',
  },
  SelectedText: {
    color: '#1A6CF6',
  },

  DetailsInpCont: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal: 12,
    paddingBottom: 12,
  },

  CheckStockListView: {
    backgroundColor: '#FDFDFD',
    width: '98%',
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
  },
  StockListItem: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 4,
    width: '100%',
    backgroundColor: '#FDFDFD',
    // width: '95%',
    // display: 'flex',
    // flexDirection: 'column',
    padding: 8,
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
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  QtyCont: {
    padding: 6,
    flexDirection: 'row',
  },
  QtyText: {
    fontFamily: 'Lexend-Light',
    color: '#4B5290',
  },
  AvlText: {
    fontFamily: 'Lexend-Light',
    color: '#8f6924',
  },

  RadioWrap: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginVertical: 16,
    // paddingBottom: 32,
    paddingVertical: 6,
  },

  DateText: {
    fontSize: 14,
    color: '#2B2B2B',
    fontFamily: 'Lexend-Regular',
  },

  NextWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  NextValuesCotn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  NextValueInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  AddtoCartInps: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  AddtoCartInpBox: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  AddCartInpLabel: {
    fontSize: 14,
    color: '#2B2B2B',
    fontFamily: 'Lexend-Regular',
    position: 'absolute',
    left: -45,
  },

  AddCartButton: {
    backgroundColor: '#2AB6A1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  NextButton: {
    backgroundColor: '#64558E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },

  UnitDrpImg: {
    width: 25,
    height: 25,
  },

  UnitModalWrapper: {
    zIndex: 2,
    backgroundColor: '#00000080',
    position: 'absolute',
    width: '100%',
    height: Dimensions.get('window').height,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  UnitModal: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 8,
    padding: 12,
    minHeight: 'auto',
    maxHeight: 500,
  },

  UnitScrollView: {
    // minHeight: 'auto',
    // maxHeight: 400,
  },

  UntiItems: {
    padding: 12,
    borderColor: 'grey',
    // borderTopWidth: 1,
    borderBottomWidth: 0.5,
  },

  UnitText: {
    fontSize: 14,
    color: '#2B2B2B',
    fontFamily: 'Lexend-Regular',
  },

  // newCustomerList
  CheckStockListView: {
    // backgroundColor: '#FDFDFD',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
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

  SelectedCustomerNewBanner: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },

  SelectCustNewText: {
    fontSize: 13,
    fontFamily: 'Lexend-Bold',
    color: '#2b2b2b',
  },

  SelectCustNewBottomWrap: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  SelectCustBottomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  SelectCustNewBottomText: {
    fontSize: 13,
    fontFamily: 'Lexend-Light',
    color: '#2b2b2b',
  },

  AddressDetailsWrap: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  AddressTopBanner: {
    borderBottomColor: 'orange',
    borderBottomWidth: 1,
    width: '100%',
  },

  NewInputStyle: {
    width: '100%',
    fontFamily: 'Lexend-Light',
    color: '#2B2B2B',
    height: 30, // Reduce the height
    paddingVertical: 5, // Adjust vertical padding to ensure text isn't cut off
    paddingHorizontal: 5, // Adjust horizontal padding if needed
    fontSize: 14, // Adjust font size
    lineHeight: 20, // Adjust line height if needed
  },

  TermsCondtitonInpWrap: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 4,
  },

  TANDCInpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 6,
  },

  TANDCInpCont: {
    width: '75%',
    backgroundColor: '#F0F4FD',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,

    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
    elevation: 1.5, // Elevation for Android

    borderColor: 'grey',
    borderWidth: 0.5,
    padding: 5,
  },

  AddItemInpCont: {
    width: '60%',
    backgroundColor: '#F0F4FD',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,

    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
    elevation: 1.5, // Elevation for Android

    borderColor: 'grey',
    borderWidth: 0.5,
  },

  radioButtonText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Light',
  },

  DeleteButton: {
    backgroundColor: '#F7CFCF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'absolute',
    right: 4,
    top: '24%',
  },
  DeleteText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },

  UpdateIcons: {
    width: 25,
    height: 25,
  },
});

export default MakeQuotation;
