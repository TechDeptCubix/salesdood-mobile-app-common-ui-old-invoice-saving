import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from './Header'
import axios from 'axios'
import SelectedStockPop from '../popups/SelectedStockPop'
import QuotationPop from '../popups/QuotationPop'
import ToastManager, { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import REACT_APP_BASE_URL from '../url/AppUrl'
import HeaderUiNew from './HeaderUiNew'


const SalesInvoice = ({ route }) => {

    const { orderId, type } = route.params || {};

    const page = 'SALESINV'

    const navigation = useNavigation()

    // const customerSearchUrl = `https://cubixweberp.com:208/api/Search_Customer/${cmpcode}/Cust/`

    const [customerSearchItem, setCustomerSearchItem] = useState('')

    const [customerData, setCustomerData] = useState(null)

    const [selectedCustomer, setSelectedCustomer] = useState(null)

    const [showActivity, setShowActivity] = useState(false)

    const [showCashCust, setShowCashCust] = useState(false)

    // const searchUrl = `https://cubixweberp.com:208/api/Search_Items/${cmpcode}/Sitem/`

    const [searchItem, setSearchItem] = useState('')

    const [stockData, setStockData] = useState(null)

    const [selectedStock, setSelectedStock] = useState(null)

    const [selectedSearchItem, setSelectedSearchItem] = useState('')

    const [quantity, setQuantity] = useState('')

    const [unitPrice, setUnitPrice] = useState('')

    const [savedItemData, setSavedItemData] = useState([])

    const [totalUnitPrice, setTotalUnitPrice] = useState()

    const [showSelectedStockPop, setShowSelectedStockPop] = useState(false)

    const [showQuotationPop, setShowQuotationPop] = useState(false)

    const [cashCustomerName, setCashCustomerName] = useState('')

    const [cashCustomerAddress, setCashCustomerAddress] = useState('')

    const [cashCustomerPhone, setCashCustomerPhone] = useState('')

    const [orderRemark, setOrderRemark] = useState('')

    const [trn, setTrn] = useState('')

    const [payment, setPayment] = useState('')

    const [delivery, setDelivery] = useState('')

    const [validity, setValidity] = useState('')

    const [itemList, setItemList] = useState(null)

    const [editData, setEditData] = useState(null)

    const [salesMan, setSalesMan] = useState('')

    const [showItemSrchAct, setShowItemSrchAct] = useState(false)

    const [error, setError] = useState('')

    const isDataLoadedRef = useRef(false);

    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const [showResetPop, setShowResetPop] = useState(false)

    const [customerSearchError, setCustomerSearchError] = useState('')

    const [stockSearchError, setStockSearchError] = useState('')

    const [deptNo, setDeptNo] = useState('')

    const [appUrl, setAppUrl] = useState('')

    const [cmpcode, setCmpCode] = useState('')

    const [van, setVan] = useState('')

    const [showDetails, setShowDetails] = useState(false)

    const searchUserInputRef = useRef(null)

    const searchItemInpRef = useRef(null)

    const qtyInpRef = useRef(null)

    const unitPriceInpRef = useState(null)

    const cashCustNameRef = useRef(null)

    const cashCustAddressRef = useRef(null)

    const cashCustPhoneRef = useRef(null)

    const [selectedTab, setSelectedTab] = useState('Customer')

    const [walkSelectTab, setWalkSelectTab] = useState('WalkCustomer')

    const [cmpName, setCmpName] = useState('')

    const [loginUser, setLoginUser] = useState('')

    const [customerCreditBlocked, setCustomerCreditBlocked] = useState(false)

    const [totalWithVAT, setTotalWithVAT] = useState(0);

    console.log('customerCreditBlocked', customerCreditBlocked)


    useEffect(() => {
        if (searchUserInputRef.current) {
            searchUserInputRef.current.focus()
        }
    }, [])

    const calculateTotalWithVAT = (items) => {
        const vatRate = 0.05;
        const total = items.reduce((acc, item) => acc + parseFloat(item.total), 0);
        const totalIncludingVAT = total + (total * vatRate);
        return totalIncludingVAT;
    };



    // useEffect(() => {
    //     if (showCashCust && cashCustNameRef.current) {
    //         cashCustNameRef.current.focus()
    //     }
    // }, [showCashCust])



    const fetchAsyncUser = async () => {
        const salesMan = await AsyncStorage.getItem('sales_man')

        const deptno = await AsyncStorage.getItem('DEPTNO')

        const appUrl = await AsyncStorage.getItem('appUrl')

        const van = await AsyncStorage.getItem('VAN')

        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        const portNoData = await AsyncStorage.getItem('portNoData')

        const loginUserName = await AsyncStorage.getItem('loginUserName')

        if (loginUserName) {

            setLoginUser(loginUserName.trim())
        }

        if (portNoData) {
            // setCmpName(portNoData[0].COMPNAME)
            const dataArray = JSON.parse(portNoData);
            setCmpName(dataArray[0].COMPNAME)
        }


        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }

        if (van) {
            setVan(van)
        }

        if (appUrl) {
            setAppUrl(appUrl)
        }

        if (salesMan === '----') {
            const salesManDrop = await AsyncStorage.getItem('sales_man_drop')
            setSalesMan(salesManDrop)
        } else {
            setSalesMan(salesMan)

        }
        if (deptno) {
            setDeptNo(deptno)
        } else {
            setDeptNo('----')
        }
    }

    useEffect(() => {
        fetchAsyncUser()
    }, [])

    const handleRemoveItem = async (itemcode) => {
        setShowSelectedStockPop(false)
        const filteredItems = savedItemData.filter((item) => item.Code !== itemcode);
        setSavedItemData(filteredItems);
        await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(filteredItems));
        updateTotalUnitPrice(filteredItems)
        showItemRemove()
    };

    const handleEditRemoveItem = async (itemcode) => {
        setShowSelectedStockPop(false)
        const filteredItems = savedItemData.filter((item) => item.Code !== itemcode);
        setSavedItemData(filteredItems);
        await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(filteredItems));
    };

    const EditItem = (item) => {
        setShowSelectedStockPop(false)
        handleEditRemoveItem(item.Code)
        // console.log('editItem', item)
        setSelectedStock(item)
        setQuantity(item.quantity?.toString())
        setUnitPrice(item.unitPrice?.toString())
    }


    const searchCustomer = async (value) => {
        setShowActivity(true)
        setCustomerSearchError('')
        console.log('searchCustomer', `${appUrl}Search_Customer/${cmpcode}/Cust/${value}`)
        try {
            await axios.get(`${appUrl}Search_Customer/${cmpcode}/Cust/${value}`)
                .then((res) => {
                    setCustomerData(res.data)
                })
            setShowActivity(false)
        } catch (error) {
            console.log('searchCustomererror', error)
            setShowActivity(false)
            setCustomerSearchError('Some Error Occured, Please Try again Later')
        }
    }

    const searchEditCustomer = async (value) => {
        // setShowActivity(true)
        console.log('searchEditCustomer', value)
        try {
            console.log(`${appUrl}Search_Customer/${cmpcode}/Cust/${value}`)
            await axios.get(`${appUrl}Search_Customer/${cmpcode}/Cust/${value}`)
                .then((res) => {
                    setSelectedCustomer(res.data)
                    AsyncStorage.setItem('selectedCustomerInv', JSON.stringify(res.data))
                        .then(() => console.log('Data saved successfully'))
                        .catch(error => console.log('Error saving data', error));
                })
            // setShowActivity(false)
        } catch (error) {
            console.log('searchEditCustomererror', error)
            // setShowActivity(false)
        }
    }

    useEffect(() => {
        if (customerSearchItem !== '') {
            searchCustomer(customerSearchItem)
            setSelectedCustomer(null)
        }
        if (customerSearchItem === '') {
            setCustomerData(null)
            // setSelectedStock(null)

            console.log('nosrchuf')
        }
    }, [customerSearchItem])

    useEffect(() => {

        if (selectedCustomer) {

            console.log('insideSlecCustBlock')

            const removeCashCust = async () => {
                try {
                    await AsyncStorage.removeItem('cashCustomerNameInv')
                    await AsyncStorage.removeItem('cashCustomerAddressInv')
                    await AsyncStorage.removeItem('cashCustomerPhoneInv')

                    setShowCashCust(false)
                } catch (error) {
                    console.log('removeCashCustErr', error)
                }
            }

            removeCashCust()




            if (selectedCustomer.CREDITMETHOD == 'BLOCKED') {
                setCustomerCreditBlocked(true)
                Alert.alert('This customer is blocked for any kind of transaction')
            }

            if (selectedCustomer.CREDITMETHOD == 'CREDIT BLOCK') {
                console.log('insideSlecCustCREDITBLOCK')
                setCustomerCreditBlocked(false)
            }

            if (selectedCustomer.CREDITMETHOD == 'OPEN') {
                setCustomerCreditBlocked(false)
                setCustomerSearchItem('')
                setTrn(selectedCustomer.TRN)
                setPayment(selectedCustomer.terms)
                // if (selectedCustomer) {
                // }

                if (selectedCustomer && searchItemInpRef.current) {
                    searchItemInpRef.current.focus()
                }
            }
        }

    }, [selectedCustomer])

    useEffect(() => {
        if (savedItemData) {
            const totalIncludingVAT = calculateTotalWithVAT(savedItemData);
            setTotalWithVAT(totalIncludingVAT);
        }
    }, [savedItemData]);


    const searchStock = async (value) => {
        setShowItemSrchAct(true)
        setStockSearchError('')
        try {
            console.log(`${appUrl}Search_Items/${cmpcode}/Sitem/${value} `)
            await axios.get(`${appUrl}Search_Items/${cmpcode}/Sitem/${value}`)
                .then((res) => {
                    setStockData(res.data)
                })
            setShowItemSrchAct(false)
        } catch (error) {
            console.log('searchStockError', error)
            setShowItemSrchAct(false)
            setStockSearchError('Some Error Occured, Please Try again Later')
        }
    }

    useEffect(() => {
        if (searchItem !== '') {
            searchStock(searchItem)
            setSelectedStock(null)
            setSelectedSearchItem(searchItem)
        }
        if (searchItem == '') {
            setStockData(null)
            // setSelectedStock(null)
        }
    }, [searchItem])


    useEffect(() => {
        if (selectedStock) {
            setSearchItem('')
            setUnitPrice((selectedStock.price).toString())
        }

        if (selectedStock && qtyInpRef.current) {
            qtyInpRef.current.focus()
        }
    }, [selectedStock])

    const SaveItem = async () => {
        // Retrieve existing savedItemData from AsyncStorage
        const savedItemDataString = await AsyncStorage.getItem('savedItemDataInv');
        const savedItemDataArray = savedItemDataString ? JSON.parse(savedItemDataString) : [];

        console.log('savedItemDataArray', savedItemDataArray.length)

        // // Check if the item already exists in the list
        const itemExists = savedItemDataArray.some(item => item.Code === selectedStock.Code);

        console.log('itemExists', itemExists)

        if (itemExists) {
            showItemExistError()
            setQuantity('');
            setUnitPrice('');
            setSelectedStock(null)
            return; // Exit the function
        }

        // if (!itemExists && savedItemDataArray.length > 9) {
        //     showMoreThan10ItemError()
        //     setQuantity('');
        //     setUnitPrice('');
        //     setSelectedStock(null)
        //     return; // Exit the function
        // }


        if (selectedStock && quantity && unitPrice && selectedCustomer && !cashCustomerName && selectedCustomer.CREDITMETHOD == 'CREDIT BLOCK') {

            const newItem = {
                ...selectedStock,
                quantity: parseFloat(quantity).toFixed(2),
                unitPrice: parseFloat(unitPrice).toFixed(2),
                total: quantity * unitPrice
            }

            // Add the new item to the list
            const updatedSavedItemData = [...savedItemDataArray, newItem];

            const totalIncludingVAT = calculateTotalWithVAT(updatedSavedItemData);

            if (totalIncludingVAT && (totalIncludingVAT > selectedCustomer.Avai_Bal)) {
                Alert.alert(
                    'Amount Exceed',
                    'Amount exceed available limit. Please choose cash customer to add more items.',
                    [{ text: 'OK' }]
                );
                return
            } else {
                // Save the updated list back to AsyncStorage
                await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(updatedSavedItemData));

                await AsyncStorage.setItem('selectedCustomerInv', JSON.stringify(selectedCustomer))
                // await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(savedItemData))
                await AsyncStorage.setItem('orderRemarkInv', orderRemark)
                await AsyncStorage.setItem('trnInv', trn)
                await AsyncStorage.setItem('paymentInv', payment)
                await AsyncStorage.setItem('deliveryInv', delivery)
                await AsyncStorage.setItem('validityInv', validity)
                // await AsyncStorage.setItem('totalUnitPrice', totalUnitPrice)
                await AsyncStorage.setItem('cashCustomerNameInv', cashCustomerName)
                await AsyncStorage.setItem('cashCustomerAddressInv', cashCustomerAddress)
                await AsyncStorage.setItem('cashCustomerPhoneInv', cashCustomerPhone)

                setSavedItemData([...savedItemData, newItem]);
                setQuantity('');
                setUnitPrice('');
                setSelectedStock(null)
                showSaveItemSuccess()

                logAsyncData()
            }
        }

        if (selectedStock && quantity && unitPrice && selectedCustomer && selectedCustomer.CREDITMETHOD == 'OPEN') {
            const newItem = {
                ...selectedStock,
                quantity: parseFloat(quantity).toFixed(2),
                unitPrice: parseFloat(unitPrice).toFixed(2),
                total: quantity * unitPrice
            };

            console.log('newItem', newItem)

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
            const savedItemDataString = await AsyncStorage.getItem('savedItemDataInv');
            const savedItemDataArray = savedItemDataString ? JSON.parse(savedItemDataString) : [];

            // Add the new item to the list
            const updatedSavedItemData = [...savedItemDataArray, newItem];

            // Save the updated list back to AsyncStorage
            await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(updatedSavedItemData));

            await AsyncStorage.setItem('selectedCustomerInv', JSON.stringify(selectedCustomer))
            // await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(savedItemData))
            await AsyncStorage.setItem('orderRemarkInv', orderRemark)
            await AsyncStorage.setItem('trnInv', trn)
            await AsyncStorage.setItem('paymentInv', payment)
            await AsyncStorage.setItem('deliveryInv', delivery)
            await AsyncStorage.setItem('validityInv', validity)
            // await AsyncStorage.setItem('totalUnitPrice', totalUnitPrice)
            await AsyncStorage.setItem('cashCustomerNameInv', cashCustomerName)
            await AsyncStorage.setItem('cashCustomerAddressInv', cashCustomerAddress)
            await AsyncStorage.setItem('cashCustomerPhoneInv', cashCustomerPhone)

            setSavedItemData([...savedItemData, newItem]);
            setQuantity('');
            setUnitPrice('');
            setSelectedStock(null)
            showSaveItemSuccess()

            logAsyncData()
        }

        if (selectedStock && quantity && unitPrice && cashCustomerName) {
            const newItem = {
                ...selectedStock,
                quantity: parseFloat(quantity).toFixed(2),
                unitPrice: parseFloat(unitPrice).toFixed(2),
                total: quantity * unitPrice
            };

            console.log('newItem', newItem)

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
            const savedItemDataString = await AsyncStorage.getItem('savedItemDataInv');
            const savedItemDataArray = savedItemDataString ? JSON.parse(savedItemDataString) : [];

            // Add the new item to the list
            const updatedSavedItemData = [...savedItemDataArray, newItem];

            // Save the updated list back to AsyncStorage
            await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(updatedSavedItemData));

            await AsyncStorage.setItem('selectedCustomerInv', JSON.stringify(selectedCustomer))
            // await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(savedItemData))
            await AsyncStorage.setItem('orderRemarkInv', orderRemark)
            await AsyncStorage.setItem('trnInv', trn)
            await AsyncStorage.setItem('paymentInv', payment)
            await AsyncStorage.setItem('deliveryInv', delivery)
            await AsyncStorage.setItem('validityInv', validity)
            // await AsyncStorage.setItem('totalUnitPrice', totalUnitPrice)
            await AsyncStorage.setItem('cashCustomerNameInv', cashCustomerName)
            await AsyncStorage.setItem('cashCustomerAddressInv', cashCustomerAddress)
            await AsyncStorage.setItem('cashCustomerPhoneInv', cashCustomerPhone)

            setSavedItemData([...savedItemData, newItem]);
            setQuantity('');
            setUnitPrice('');
            setSelectedStock(null)
            showSaveItemSuccess()

            logAsyncData()
        }

        else if (!selectedCustomer && !cashCustomerName) {
            showAddToCartCustomerErr();
        }
        else if ((selectedCustomer || cashCustomerName) && !selectedStock) {
            showAddToCartErr()
        }

    };

    const saveCashCustomerDetails = async () => {
        try {
            await AsyncStorage.removeItem('selectedCustomerInv');

            const dataToSave = [
                ['orderRemarkInv', orderRemark],
                ['trnInv', trn],
                ['paymentInv', payment],
                ['deliveryInv', delivery],
                ['validityInv', validity],
                // ['totalUnitPrice', totalUnitPrice], // Uncomment if needed
                ['cashCustomerNameInv', cashCustomerName],
                ['cashCustomerAddressInv', cashCustomerAddress],
                ['cashCustomerPhoneInv', cashCustomerPhone],
            ];

            await AsyncStorage.multiSet(dataToSave);

            showCashCustSuccess()

            logAsyncData();
        } catch (error) {
            console.error('Error saving data to AsyncStorage', error);
        }
    };

    const logAsyncData = async () => {

        try {

            const storedSelectedCustomer = await AsyncStorage.getItem('selectedCustomerInv');
            const storedSavedItemData = await AsyncStorage.getItem('savedItemDataInv');
            const storedOrderRemark = await AsyncStorage.getItem('orderRemarkInv');
            const storedtrn = await AsyncStorage.getItem('trnInv');
            const storedPayment = await AsyncStorage.getItem('paymentInv');
            const storedDelivery = await AsyncStorage.getItem('deliveryInv');
            const storedValidity = await AsyncStorage.getItem('validityInv');
            // const storedTotalUnitPrice = await AsyncStorage.getItem('totalUnitPrice');
            const storedCashCustomerName = await AsyncStorage.getItem('cashCustomerNameInv');
            const storedCashCustomerAddress = await AsyncStorage.getItem('cashCustomerAddressInv');
            const storedCashCustomerPhone = await AsyncStorage.getItem('cashCustomerPhoneInv');

            if (storedSelectedCustomer) {
                setSelectedCustomer(JSON.parse(storedSelectedCustomer))
            } else {
                setSelectedCustomer(null)
            }
            if (storedSavedItemData) {
                setSavedItemData(JSON.parse(storedSavedItemData))
                setIsDataLoaded(true)
            } else {
                setSavedItemData([])
            }
            if (storedOrderRemark) {
                setOrderRemark((storedOrderRemark))
            } else {
                setOrderRemark('')
            }
            if (storedtrn) {
                setTrn((storedtrn))
            } else {
                setTrn('')
            }
            if (storedPayment) {
                setPayment((storedPayment))
            } else {
                setPayment('')
            }
            if (storedDelivery) {
                setDelivery((storedDelivery))
            } else {
                setDelivery('')
            }
            if (storedValidity) {
                setValidity((storedValidity))
            } else {
                setValidity('')
            }
            if (storedCashCustomerName) {
                setCashCustomerName((storedCashCustomerName))
                setShowCashCust(true)
            } else {
                setCashCustomerName('')
                setShowCashCust(false)

            }
            if (storedCashCustomerAddress) {
                setCashCustomerAddress((storedCashCustomerAddress))
                setShowCashCust(true)

            } else {
                setCashCustomerAddress('')
                setShowCashCust(false)

            }
            if (storedCashCustomerPhone) {
                setCashCustomerPhone((storedCashCustomerPhone))
                setShowCashCust(true)

            } else {
                setCashCustomerPhone('')
                setShowCashCust(false)

            }

            console.log('selectedCustomerLogAsyncData:', storedSelectedCustomer);
            console.log('savedItemDataLogAsyncData:', storedSavedItemData);
            console.log('orderRemarkLogAsyncData:', storedOrderRemark);
            console.log('paymentLogAsyncData:', storedPayment);
            console.log('deliveryLogAsyncData:', storedDelivery);
            console.log('validityLogAsyncData:', storedValidity);
            console.log('cashCustomerNameLogAsyncData:', storedCashCustomerName);
            console.log('cashCustomerAddressLogAsyncData:', storedCashCustomerAddress);
            console.log('cashCustomerPhoneLogAsyncData:', storedCashCustomerPhone);
        } catch (error) {
            console.error('Error loading data from AsyncStorage', error);
        }

    }

    const removeAsyncItems = async () => {
        try {
            await AsyncStorage.removeItem('selectedCustomerInv');
            await AsyncStorage.removeItem('savedItemDataInv');
            await AsyncStorage.removeItem('orderRemarkInv');
            await AsyncStorage.removeItem('trnInv');
            await AsyncStorage.removeItem('paymentInv');
            await AsyncStorage.removeItem('deliveryInv');
            await AsyncStorage.removeItem('validityInv');
            await AsyncStorage.removeItem('totalUnitPriceInv');
            await AsyncStorage.removeItem('cashCustomerNameInv');
            await AsyncStorage.removeItem('cashCustomerAddressInv');
            await AsyncStorage.removeItem('cashCustomerPhoneInv');

            console.log('All items removed from AsyncStorage.');

            showAsyncItemRemove()
            logAsyncData()
            // updateTotalUnitPrice()
            setTotalUnitPrice(0)

            setShowResetPop(false)
        } catch (error) {
            console.error('Error removing items from AsyncStorage', error);
        }
    };

    const removeAsyncItemsAfterOrderMade = async () => {
        try {
            await AsyncStorage.removeItem('selectedCustomerInv');
            await AsyncStorage.removeItem('savedItemDataInv');
            await AsyncStorage.removeItem('orderRemarkInv');
            await AsyncStorage.removeItem('trnInv');
            await AsyncStorage.removeItem('paymentInv');
            await AsyncStorage.removeItem('deliveryInv');
            await AsyncStorage.removeItem('validityInv');
            await AsyncStorage.removeItem('totalUnitPriceInv');
            await AsyncStorage.removeItem('cashCustomerNameInv');
            await AsyncStorage.removeItem('cashCustomerAddressInv');
            await AsyncStorage.removeItem('cashCustomerPhoneInv');

            console.log('All items removed from AsyncStorage.');

            // showAsyncItemRemove()
            showMakeOrderSuccess()
            logAsyncData()
            // updateTotalUnitPrice()
            setTotalUnitPrice(0)
        } catch (error) {
            console.error('Error removing items from AsyncStorage', error);
        }
    };


    const fetchItemList = async (orderId, type) => {
        if (type === 'pull') {
            try {
                const response = await axios.get(`${appUrl}Sales_Order/${cmpcode}/details/${orderId}`);
                setItemList(response.data);
                // await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(response.data));
                // setSavedItemData(response.data)
                showPullQuotToast()
            } catch (error) {
                console.log('fetchItemListError', error)
                setError(error);
            }
        }
        if (type === 'edit') {
            try {
                const response = await axios.get(`${appUrl}Sales_Order/${cmpcode}/details/${orderId}`);
                setItemList(response.data);
                // await AsyncStorage.setItem('savedItemDataInv', JSON.stringify(response.data));
                // setSavedItemData(response.data)
                showEditToast()
            } catch (error) {
                console.log('fetchItemListError', error)
                setError(error);
            }
        }
    };

    useEffect(() => {
        if (itemList && type) {
            if (itemList.length > 0 && type === 'pull') {
                const transformed = itemList.map(item => ({
                    AvlQty: 0,
                    Barcode: "",
                    Code: item.so_icode,
                    Cost_Avg: 0,
                    Description: item.idesc,
                    Group: "",
                    LPCost: 0,
                    LSPRICE: 0,
                    Ord_pend: 0,
                    Qty: 0,
                    SupportItem: "",
                    price: 0,
                    quantity: item.tr_qty2,
                    total: item.line_total,
                    unit: item.unit,
                    unitPrice: item.so_cost
                }));
                setSavedItemData(transformed);
                AsyncStorage.setItem('savedItemDataInv', JSON.stringify(transformed))
                    .then(() => {
                        logAsyncData()
                        console.log('Pull Data saved successfully')
                    })
                    .catch(error => console.log('Error saving data', error));
            }
            if (itemList.length > 0 && type === 'edit') {
                const transformed = itemList.map(item => ({
                    AvlQty: 0,
                    Barcode: "",
                    Code: item.so_icode,
                    Cost_Avg: 0,
                    Description: item.idesc,
                    Group: "",
                    LPCost: 0,
                    LSPRICE: 0,
                    Ord_pend: 0,
                    Qty: 0,
                    SupportItem: "",
                    price: 0,
                    quantity: item.tr_qty2,
                    total: item.line_total,
                    unit: item.unit,
                    unitPrice: item.so_cost
                }));
                setSavedItemData(transformed);
                AsyncStorage.setItem('savedItemDataInv', JSON.stringify(transformed))
                    .then(() => {
                        logAsyncData()
                        console.log('Edit Data saved successfully')
                    })
                    .catch(error => console.log('Error saving data', error));
            }
        }

    }, [itemList, type]);

    const fetchPreviousOrders = async (orderId) => {
        console.log(`${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}`)
        try {
            // const response = await axios.get(`${appUrl}Sales_Order/${cmpcode}/Salesall/ALL`);

            const response = await axios.get(`${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}`);


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

            console.log('filteredOrder', filteredOrder)

            // setSelectedCustomer(transformed)
            // AsyncStorage.setItem('selectedCustomerInv', JSON.stringify(transformed))
            //     .then(() => console.log('Data saved successfully'))
            //     .catch(error => console.log('Error saving data', error));

            searchEditCustomer(filteredOrder[0].account)

            // setSelectedCustomer(transformed)
            // setSele(filteredOrderdata[0].accdesc)
        } catch (error) {
            console.log('fetchPreviousOrdersError', error);
            setError(error);
        }
    };

    const updateTotalUnitPrice = (data) => {
        const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
        setTotalUnitPrice(total);
    };


    useEffect(() => {
        logAsyncData();
    }, []);

    useEffect(() => {
        if (savedItemData.length > 0) {
            updateTotalUnitPrice(savedItemData)
        }
    }, [savedItemData])

    useEffect(() => {
        if (showCashCust === false) {
            setCashCustomerName('')
            setCashCustomerAddress('')
            setCashCustomerPhone('')
        }
        if (showCashCust === true) {
            setCustomerSearchItem('')
        }
    }, [showCashCust])


    const showMakeOrderSuccess = () => {
        Toast.success(`Invoice created successfully `)
    }

    const showSaveItemSuccess = () => {
        Toast.success(`Item Saved `)
    }

    const showItemRemove = () => {
        Toast.error('Item Removed')
    }

    const showAddToCartErr = () => {
        Toast.error('Item/Quantity/unitPrice cannot be empty')
    }

    const showAsyncItemRemove = () => {
        Toast.warn('Deleted all saved Data')
    }

    const showFormEmptyToast = () => {
        Toast.error('UserId and Password cant be empty')
    }

    const showPullQuotToast = () => {
        Toast.success(`Qoutation pulled successfully, now add Customer`)
    }

    const showEditToast = () => {
        Toast.success(`You can now Edit the selected Quotation`)
    }

    const showItemExistError = () => {
        Toast.error(`Item already selected`)
    }

    const showMoreThan10ItemError = () => {
        Toast.error(`You cannot add more than 10 items`)
    }

    const showAddToCartCustomerErr = () => {
        Toast.error('Customer cannot be empty')
    }

    const showCashCustSuccess = () => {
        Toast.success(`CashCustomer saved`)
    }




    useEffect(() => {
        if (orderId && type === 'pull') {
            fetchItemList(orderId, type)
        }
        if (salesMan && orderId && type === 'edit') {
            fetchItemList(orderId, type)
            fetchPreviousOrders(orderId)
        }
    }, [orderId, type, salesMan])


    // console.log('editData', editData)
    // console.log('orderId', orderId)
    // console.log('type', type)
    // console.log('itemList', itemList)
    // console.log('searchItem', searchItem)
    // // console.log('customerData', customerData)
    console.log('selectedStock', selectedStock)
    // console.log('savedItemData', savedItemData)
    // console.log('editData', editData)
    // console.log('totalUnitPrice', totalUnitPrice)
    // console.log(quantity, unitPrice)
    console.log('selectedCustomer', selectedCustomer)
    // console.log('salesMan', salesMan)
    // console.log('trn', trn)

    // console.log('deptNo', deptNo)

    console.log('totalWithVAT', totalWithVAT)

    return (

        <>
            <View style={styles.HomeWrap}>
                {/* <Header /> */}

                <HeaderUiNew name={'Sales Invoice'} />

                <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />

                <KeyboardAvoidingView
                    // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    behavior='padding'
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                    style={styles.HomeCont}
                >

                    <ScrollView style={styles.MainScroll}>

                        {
                            type !== 'edit' &&
                            <>

                                <View style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'space-around'
                                }}>
                                    <View style={styles.CustomerSearchInp}>
                                        <View style={styles.InputImageCont}>
                                            <Image style={styles.SearchIcon} source={require('../images/orangeLens.png')} />
                                        </View>
                                        <TextInput
                                            style={styles.TextInput}
                                            ref={searchUserInputRef}
                                            placeholder='Search registered customers'
                                            value={customerSearchItem}
                                            onChangeText={text => setCustomerSearchItem(text)}
                                            placeholderTextColor="#aaa"
                                        />
                                        <View style={styles.OrWrap}>
                                            <Text style={styles.OrText}>Or</Text>
                                        </View>
                                        <TouchableOpacity style={styles.WalkInCutomerButton} onPress={() => setShowCashCust(!showCashCust)}>
                                            <Image style={[styles.SearchIcon, { resizeMode: 'contain' }]} source={require('../images/walkCustLight.png')} />
                                        </TouchableOpacity>
                                    </View>
                                </View>


                                {
                                    showActivity &&

                                    <ActivityIndicator />
                                }

                                {
                                    customerSearchError && !showActivity &&
                                    <View>
                                        <Text style={styles.ErrorText}>{customerSearchError}</Text>
                                    </View>
                                }

                                {
                                    customerData && !selectedCustomer && customerSearchItem !== '' &&
                                    // <View style={styles.TableContainer}>
                                    //     <View style={styles.tableRow}>
                                    //         <Text
                                    //             style={[styles.headerCell, {
                                    //                 borderTopLeftRadius: 4
                                    //             }]}
                                    //         >
                                    //             Name
                                    //         </Text>
                                    //         <Text style={styles.headerCell}>
                                    //             Account Number
                                    //         </Text>
                                    //         <Text
                                    //             style={[styles.headerCell, {
                                    //                 borderTopRightRadius: 4
                                    //             }]}
                                    //         >
                                    //             Balance
                                    //         </Text>
                                    //     </View>

                                    //     <ScrollView style={styles.ScrollView} nestedScrollEnabled={true}>
                                    //         {
                                    //             customerData && customerData.length > 0 && customerData.slice(0, 25).map((item, index) => (
                                    //                 <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedCustomer(item)}>
                                    //                     <Text style={styles.dataCell}>{item.Custname}</Text>
                                    //                     <Text style={styles.dataCell}>{item.account}</Text>
                                    //                     <Text style={styles.dataCell}>{item.openbal}</Text>
                                    //                 </TouchableOpacity>

                                    //             ))
                                    //         }
                                    //     </ScrollView>



                                    //     {
                                    //         customerData && customerData.length === 0 &&
                                    //         <View>
                                    //             <Text style={{
                                    //                 color: 'red'
                                    //             }}>No data available</Text>
                                    //         </View>
                                    //     }

                                    // </View>
                                    <View style={styles.TableContainer}>
                                        <ScrollView style={[styles.ScrollView, { backgroundColor: '#FDFDFD' }]} nestedScrollEnabled={true}>

                                            {
                                                customerData && customerData.length > 0 && customerData.map((item, index) => (
                                                    <TouchableOpacity style={styles.StockListItem} key={index} onPress={() => setSelectedCustomer(item)}>

                                                        <View style={styles.StockItemListHead}>
                                                            {/* <Text style={styles.StockListCodeText}>{item.account}</Text> */}
                                                            {/* <TouchableOpacity style={styles.PlusMinusCont} onPress={() => toggleExpand(item.account)}>
                                                                {
                                                                    expandedItems.includes(item.account) ?
                                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                                        :
                                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                                }
                                                            </TouchableOpacity> */}
                                                        </View>

                                                        {/* <TouchableOpacity style={styles.StockItemDescCont} onPress={() => setSelectedStock(item)}> */}
                                                        <View style={styles.StockItemDescCont}>
                                                            <Text style={styles.StockListDescText}>{item.Custname}</Text>
                                                        </View>

                                                        <View style={styles.QtyAvlQtyCont}>

                                                            <View style={[styles.QtyCont, { backgroundColor: '#ECF0F9', marginRight: 16 }]}>
                                                                <Text style={styles.QtyText}>Balance: {item.Balance}</Text>
                                                            </View>
                                                            {/* <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#FDEDD6' }]}>
                                                                <Text style={styles.AvlText}>Outstanding</Text>
                                                            </TouchableOpacity> */}
                                                        </View>
                                                        {/* 
                                                        {
                                                            expandedItems.includes(item.account) && (
                                                                <View style={styles.DynamicPriceView}>
                                                                    <View style={styles.PriceTag}>
                                                                        <Text style={styles.StockListCodeText}>openbal</Text>
                                                                        <Text style={styles.PriceValueText}>{item.openbal}</Text>
                                                                    </View>
                                                                    <View style={styles.PriceTag}>
                                                                        <Text style={styles.StockListCodeText}>Credit Price</Text>
                                                                        <Text style={styles.PriceValueText}>{item.credit}</Text>
                                                                    </View>
                                                                    <View style={styles.PriceTag}>
                                                                        <Text style={styles.StockListCodeText}>debit</Text>
                                                                        <Text style={styles.PriceValueText}>{item.debit}</Text>
                                                                    </View>
                                                                </View>
                                                            )
                                                        } */}


                                                    </TouchableOpacity>
                                                ))
                                            }

                                            {
                                                customerData && customerData.length === 0 &&
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={{
                                                        color: 'red',
                                                        fontFamily: 'Lexend-Bold'
                                                    }}>No Data Available</Text>
                                                </View>
                                            }
                                        </ScrollView>
                                    </View>
                                }
                            </>
                        }

                        <View style={styles.OrderMainWrap}>

                            {
                                // (!showCashCust || selectedCustomer) ?
                                (!showCashCust) ?
                                    <>

                                        <View style={styles.CustomerUIWrap}>

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
                                                <View style={[styles.CustUiItem, { paddingBottom: 16 }]}>
                                                    <Text style={styles.CustHeadText}>Name</Text>
                                                    <Text style={styles.CustHeadTextValue}>{selectedCustomer && selectedCustomer.Custname?.trim() !== '' ? selectedCustomer.Custname : ''}</Text>
                                                </View>
                                            }

                                            {
                                                selectedTab === 'Details' &&
                                                <>
                                                    <View style={styles.CustUiItem}>
                                                        <Text style={styles.CustHeadText}>Account</Text>
                                                        <Text style={styles.CustHeadTextValue}>{selectedCustomer && selectedCustomer.account?.trim() !== '' ? selectedCustomer.account : ''}</Text>
                                                    </View>
                                                    <View style={styles.CustUiItem}>
                                                        <Text style={styles.CustHeadText}>Available Balance</Text>
                                                        <Text style={styles.CustHeadTextValue}>{selectedCustomer && selectedCustomer.Avai_Bal !== '' ? selectedCustomer.Avai_Bal : ''}</Text>
                                                    </View>
                                                    <View style={styles.CustUiItem}>
                                                        <Text style={styles.CustHeadText}>Status</Text>
                                                        <Text style={styles.CustHeadTextValue}></Text>
                                                    </View>

                                                    <View style={styles.DetailsInpCont}>

                                                        {/* <View style={styles.RemarkInputCont}>
                <TextInput
                    style={styles.PlaceHolderInput}
                    placeholder='Enter Trn'
                    value={trn}
                    onChangeText={text => setTrn(text)}
                    placeholderTextColor="#aaa"
                />
            </View> */}

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

                                        </View>

                                    </>

                                    :

                                    <>

                                        <View style={styles.CustomerUIWrap}>

                                            <View style={styles.TabCont}>
                                                <TouchableOpacity style={[styles.TabButtons, walkSelectTab === 'WalkCustomer' && styles.SelectedTab]} onPress={() => setWalkSelectTab('WalkCustomer')}>
                                                    <Text style={[styles.TabText, walkSelectTab === 'WalkCustomer' && styles.SelectedText]}>Walk in Customer</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.TabButtons, { marginLeft: 8 }, walkSelectTab === 'Details' && styles.SelectedTab]} onPress={() => setWalkSelectTab('Details')}>
                                                    <Text style={[styles.TabText, walkSelectTab === 'Details' && styles.SelectedText]}>Details</Text>
                                                </TouchableOpacity>

                                                <View style={{
                                                    position: 'absolute', right: 5, top: 10
                                                }}>
                                                    <TouchableOpacity onPress={() => saveCashCustomerDetails()} style={{
                                                        padding: 6,
                                                        backgroundColor: 'blue',
                                                        borderRadius: 4
                                                    }}>
                                                        <Text style={{
                                                            color: 'white',
                                                            fontFamily: 'Lexend-Light',
                                                        }}>Save</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {
                                                walkSelectTab === 'WalkCustomer' &&
                                                <View style={styles.DetailsInpCont}>
                                                    <View style={styles.RemarkInputCont}>
                                                        <TextInput
                                                            style={styles.PlaceHolderInput}
                                                            ref={cashCustNameRef}
                                                            placeholder='Name'
                                                            value={cashCustomerName && cashCustomerName}
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

                                        </View>
                                    </>

                            }

                        </View>

                        {
                            customerCreditBlocked === false &&
                            <View style={styles.StockItemBox}>
                                <View style={styles.StockItemWrap}>

                                    <View style={styles.StockItemHead}>
                                        <View>
                                            <Text style={styles.CustomerText}>Add Item</Text>
                                        </View>

                                        <View style={styles.StockBagWrap}>

                                            <TouchableOpacity style={styles.stockBagCont} onPress={() => setShowSelectedStockPop(!showSelectedStockPop)}>
                                                <Image style={styles.stockBagIcon} source={require('../images/goCart.png')} />
                                                <Text style={styles.stockBagText}>Cart</Text>

                                                <View style={styles.itemCount}>
                                                    <Text style={styles.itemCountText}>{savedItemData && savedItemData.length}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            {/* <TouchableOpacity style={styles.SelectItemCont} onPress={() => SaveItem()}>
                                            <Text style={styles.PriceTextTotal}>Save Item</Text>
                                        </TouchableOpacity> */}
                                        </View>
                                    </View>

                                    <View>
                                        <View style={[styles.RemarkInputCont, { width: '100%' }]}>
                                            <TextInput
                                                style={styles.PlaceHolderInput}
                                                ref={searchItemInpRef}
                                                placeholder='Search Item'
                                                value={searchItem}
                                                onChangeText={text => setSearchItem(text)}
                                                placeholderTextColor="#aaa"
                                            />
                                        </View>
                                    </View>

                                    {
                                        showItemSrchAct &&
                                        <ActivityIndicator />
                                    }

                                    {
                                        stockSearchError && !showItemSrchAct &&
                                        <View>
                                            <Text style={styles.ErrorText}>{stockSearchError}</Text>
                                        </View>
                                    }

                                    <View style={styles.SelectedItemHead}>
                                        <Text style={styles.SelectHeadText}>Selected Item :</Text>
                                        <Text style={styles.SelectedItemText}>{selectedStock && selectedStock.Description !== '' ? selectedStock.Description : ''}</Text>
                                    </View>

                                    {
                                        stockData && !selectedStock &&
                                        <View style={styles.StockTableContainer}>
                                            <View style={styles.tableRow}>
                                                <Text style={[styles.StockheaderCell, {
                                                    borderTopLeftRadius: 4
                                                }]}>Code</Text>
                                                <Text style={[styles.StockheaderCell, {
                                                    borderTopRightRadius: 4
                                                }]}>Description</Text>
                                            </View>

                                            <ScrollView style={styles.ScrollView} nestedScrollEnabled={true}>
                                                {
                                                    stockData && stockData.length > 0 && stockData.map((item, index) => (
                                                        <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedStock(item)}>
                                                            <Text style={styles.StockdataCell}>{item.Code}</Text>
                                                            <Text style={styles.StockdataCell}>{item.Description}</Text>
                                                        </TouchableOpacity>

                                                    ))
                                                }
                                            </ScrollView>

                                            {
                                                stockData === null &&

                                                <ActivityIndicator />
                                            }

                                            {
                                                stockData && stockData.length === 0 &&
                                                <View>
                                                    <Text style={{
                                                        color: 'red'
                                                    }}>No data available</Text>
                                                </View>
                                            }

                                        </View>
                                    }

                                    <View style={styles.StockItemQtyPriceWrap}>


                                        <View style={[styles.StockInputCont, { width: '28%' }]}>

                                            <View style={[styles.RemarkInputCont, { width: '100%', marginTop: 0 }]}>
                                                <TextInput
                                                    style={styles.PlaceHolderInput}
                                                    ref={qtyInpRef}
                                                    placeholder="Qty"
                                                    placeholderTextColor="#aaa"
                                                    keyboardType="numeric" // This ensures the numeric keyboard appears
                                                    onChangeText={text => {
                                                        const numericText = text.replace(/[^0-9.]/g, ''); // This removes any non-numeric characters
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

                                        <View style={[styles.StockInputCont, { width: '48%' }]}>
                                            {/* <Text style={styles.SelectHeadText}>Unit Price</Text> */}
                                            <View style={[styles.RemarkInputCont, { width: '100%', marginTop: 0 }]}>
                                                <TextInput
                                                    style={styles.PlaceHolderInput}
                                                    ref={unitPriceInpRef}
                                                    placeholder='Unit price'
                                                    placeholderTextColor="#aaa"
                                                    keyboardType="numeric"
                                                    onChangeText={text => {
                                                        const numericText = text.replace(/[^0-9.]/g, ''); // This removes any non-numeric characters
                                                        setUnitPrice(numericText);
                                                    }}
                                                    value={unitPrice}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.AddtoCartCont}>
                                            <TouchableOpacity style={styles.SelectItemCont} onPress={() => SaveItem()}>
                                                <Image style={styles.stockBagIcon} source={require('../images/addCart.png')} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>


                                    <View style={styles.StockValueWrap}>

                                        <View style={styles.W100}>
                                            <Text style={styles.SelectText}>Details</Text>
                                        </View>
                                        {/* <View style={styles.SelectedItemHeadStockCost}>
                                        <Text style={styles.SelectHeadText}>Qty: </Text>
                                        <Text style={styles.SelectedItemText}>{selectedStock && selectedStock.Qty !== '' ? selectedStock.Qty : ''}</Text>
                                    </View> */}
                                        <View style={styles.SelectedItemHeadStockCost}>
                                            <Text style={styles.SelectHeadText}>Ord pend: </Text>
                                            <Text style={styles.SelectedItemText}>{selectedStock && selectedStock.Ord_pend !== '' ? selectedStock.Ord_pend : ''}</Text>
                                        </View>
                                        <View style={styles.SelectedItemHeadStockCost}>
                                            <Text style={styles.SelectHeadText}>Avl Stock: </Text>
                                            <Text style={styles.SelectedItemText}>{selectedStock && selectedStock.AvlQty !== '' ? selectedStock.AvlQty : ''}</Text>
                                        </View>
                                        <View style={styles.SelectedItemHeadStockCost}>
                                            <Text style={styles.SelectHeadText}>Price: </Text>
                                            <Text style={styles.SelectedItemText}>{selectedStock && selectedStock.price !== '' ? selectedStock.price : ''}</Text>
                                        </View>
                                        <View style={styles.SelectedItemHeadStockCost}>
                                            <Text style={styles.SelectHeadText}>Credit Price: </Text>
                                            <Text style={styles.SelectedItemText}>{selectedStock && selectedStock['Credit Price'] !== '' ? selectedStock['Credit Price'] : ''}</Text>
                                        </View>

                                    </View>


                                    <View style={styles.SelectedItemHeadStockCost}>
                                        <Text style={styles.SelectHeadText}>Cart Total: </Text>
                                        <Text style={styles.SelectedItemText}>{totalUnitPrice && (totalUnitPrice).toFixed(2)}</Text>
                                        {/* <Text style={styles.PriceValue}>{selectedStock.Ord_pend}</Text> */}
                                    </View>

                                    {/* <View style={styles.AddtoCartCont}>
                                    <TouchableOpacity style={styles.SelectItemCont} onPress={() => SaveItem()}>
                                        <Text style={styles.PriceTextTotal}>Add to Cart</Text>
                                    </TouchableOpacity>
                                </View> */}

                                </View>
                            </View>
                        }

                        {
                            customerCreditBlocked === true &&
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center'
                            }}>
                                <Text style={{
                                    color: 'red',
                                    fontFamily: 'Lexend-Bold'
                                }}>This customer is blocked for any kind of transaction</Text>
                            </View>
                        }


                    </ScrollView>

                    {/* <View style={styles.MakeQuotHead}> */}
                    <View style={styles.HomeTextCont}>

                        <TouchableOpacity style={styles.DeleteAllDataButton} onPress={() => setShowResetPop(true)}>
                            <Text style={styles.DeleteDataText}>Reset Data</Text>
                        </TouchableOpacity>
                    </View>
                    {/* </View> */}

                </KeyboardAvoidingView>

                {
                    showSelectedStockPop &&
                    <SelectedStockPop
                        savedItemData={savedItemData}
                        setShowSelectedStockPop={setShowSelectedStockPop}
                        showSelectedStockPop={showSelectedStockPop}
                        handleRemoveItem={handleRemoveItem}
                        EditItem={EditItem}
                        setShowQuotationPop={setShowQuotationPop}

                        page={page}
                    />
                }

                {
                    showQuotationPop &&
                    <QuotationPop
                        setShowQuotationPop={setShowQuotationPop}
                        showQuotationPop={showQuotationPop}
                        selectedCustomer={selectedCustomer}
                        orderRemark={orderRemark}
                        trn={trn}
                        payment={payment}
                        delivery={delivery}
                        validity={validity}
                        savedItemData={savedItemData}
                        totalUnitPrice={totalUnitPrice}
                        cashCustomerName={cashCustomerName}
                        cashCustomerAddress={cashCustomerAddress}
                        cashCustomerPhone={cashCustomerPhone}
                        showMakeOrderSuccess={showMakeOrderSuccess}
                        type={type}
                        salesMan={salesMan}
                        deptNo={deptNo}
                        cmpcode={cmpcode}
                        van={van}
                        cmpName={cmpName}
                        loginUser={loginUser}

                        setSelectedCustomer={setSelectedCustomer}
                        setOrderRemark={setOrderRemark}
                        setTrn={setTrn}
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

                        page={page}
                    />
                }

            </View>

            {
                showResetPop &&
                <View style={styles.LogOutModalWrapper}>

                    <View style={styles.LogOutModal}>
                        <View>
                            <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold', padding: 8, margin: 4, fontFamily: 'Lexend-Regular' }}>Reset Data</Text>
                        </View>
                        <View>
                            <Text style={{ color: 'black', fontSize: 16, padding: 8, margin: 4, fontFamily: 'Lexend-Regular' }}>Are you sure ?</Text>
                        </View>

                        <View style={{
                            // width: '100%',
                            padding: 8, margin: 4,
                            paddingLeft: 12,
                            paddingRight: 12,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <TouchableOpacity style={{
                                backgroundColor: 'grey',
                                padding: 8,
                                borderRadius: 4
                            }}
                                onPress={() => setShowResetPop(false)}
                            >
                                <Text style={{
                                    color: 'white',
                                    fontFamily: 'Lexend-Regular'
                                }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                backgroundColor: 'red',
                                padding: 8,
                                borderRadius: 4
                            }}
                                onPress={() => removeAsyncItems()}
                            >
                                <Text style={{
                                    color: 'white',
                                    fontFamily: 'Lexend-Regular'
                                }}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View >
            }
        </>
    )
}

const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFEFEF'
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
        height: Dimensions.get('window').height - 40

    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 40
    },
    HomeText: {
        fontSize: 16,
        color: 'black',
        borderBottomColor: 'gold',
        borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Bold'
    },
    MainScroll: {
        marginBottom: 50
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
        alignItems: 'center'
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
        height: 25
    },
    TextInput: {
        width: '90%',
        fontFamily: 'Lexend-Light',
        color: '#2B2B2B'
    },

    TableContainer: {
        width: "100%",
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
        color: "black",
        fontFamily: 'Lexend-Regular'

    },
    ScrollView: {
        height: Dimensions.get('window').height - 300,
        marginBottom: 8
    },
    SelectedStockWrap: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginTop: 8
    },
    NameDescCont: {
        flexDirection: 'row',
        width: '95%',
        paddingHorizontal: 8,
        paddingVertical: 12,
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    AddressCont: {
        flexDirection: 'row',
        width: '95%',
        paddingHorizontal: 8,
        paddingVertical: 12,
        // alignItems: 'center',
        flexWrap: 'wrap'

    },
    TextNameDesc: {
        fontSize: 18,
        fontFamily: 'Lexend-Regular',
        color: 'black'
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
        marginVertical: 4
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
        marginBottom: 8
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
        margin: 2
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
        width: '100%'
    },
    EnterCashCustomerButtonSection: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 6
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
        marginTop: 6
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
        alignItems: 'center'
    },
    SelectedCustWrap: {
        flexDirection: 'column',
        width: '100%'
    },
    SelectCustItem: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        marginVertical: 6,
        flexWrap: 'wrap',
        alignItems: 'center'
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
        marginLeft: 24
    },
    RemarkCont: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: 12
    },
    RemarkInputCont: {
        width: '90%',
        backgroundColor: '#F6F6F6',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
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
        width: '100%'
    },
    DAQHeadText: {
        color: 'white',
        fontFamily: 'Lexend-Bold',
        fontSize: 16,
        marginLeft: 4
    },
    DAQText: {
        color: 'white',
        fontFamily: 'Lexend-Regular',
        fontSize: 16,
        marginLeft: 16,
        textAlign: 'left',
        width: '100%'
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
        width: '100%'
    },
    StockItemBox: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    StockItemWrap: {
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'white',
        marginTop: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 2,
    },
    StockItemHead: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    StockItemQtyPriceWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 8
    },
    StockInputCont: {
        // width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    StockTextInput: {
        width: '100%',
        fontFamily: 'Lexend-Bold'
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
        margin: 2
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
        marginTop: 12
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
        // marginLeft: 20
    },
    SelectText: {
        color: '#525252',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
    },

    StockTableContainer: {
        width: "100%",
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
        color: "black",
        fontFamily: 'Lexend-Regular'
    },
    W100: {
        width: '100%',
        marginVertical: 12
    },
    SelectedItemHead: {
        flexDirection: 'row',
        marginVertical: 8,
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    SelectedItemText: {
        color: '#2B2B2B',
        fontSize: 16,
        fontFamily: 'Lexend-Bold',
        marginLeft: 8
    },
    StockBagWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    stockBagIcon: {
        width: 20,
        height: 20
    },
    stockBagCont: {
        backgroundColor: '#E0E9F7',
        padding: 8,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
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
        marginVertical: 2
    },
    ContinueButton: {
        padding: 12,
        backgroundColor: 'black',
        borderRadius: 6
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
        alignItems: 'center'
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
        alignItems: 'center'
    },
    QtyPriceTextInp: {
        width: '60%',
        fontFamily: 'Lexend-Bold'
    },
    SelectedItemHeadStockCost: {
        flexDirection: 'row',
        InputContmarginVertical: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
        marginLeft: 12,
        marginBottom: 8
    },
    AddtoCartCont: {
        width: '18%',
        backgroundColor: '#1A6CF6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2
    },
    MakeQuotHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    DeleteAllDataButton: {
        backgroundColor: 'red',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 4
    },
    DeleteDataText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },
    HeadIcon: {
        width: 25,
        height: 25
    },
    TopBannerBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    CustomerUIWrap: {
        flexDirection: 'column',
        width: '100%',
        marginTop: 8,
        backgroundColor: 'white',
        // padding: 18
    },
    CustomerText: {
        fontFamily: 'Lexend-Regular',
        color: "#3A80EA",
        fontSize: 16
    },
    CustHeadText: {
        color: '#aaa',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },
    CustHeadTextValue: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend-Bold',
    },
    CustUiItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        // marginBottom: 16,
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    PlaceHolderInput: {
        width: '100%',
        fontFamily: 'Lexend-Light',
        color: '#2B2B2B'
    },
    CustomerText: {
        fontFamily: 'Lexend-Regular',
        color: "#2B2B2B",
        fontSize: 16
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
        alignItems: 'center'
    },

    OrWrap: {
        position: 'absolute',
        left: '45%',
        top: '45%',
        backgroundColor: '#D9D9D9',
        padding: 8,
        borderRadius: 25,
        zIndex: 2
    },
    OrText: {
        fontFamily: 'Lexend-Regular',
        color: "#3A80EA",
        fontSize: 14
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
        borderRadius: 8
    },
    LogoutButton: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'red',
        borderRadius: 4,
        alignItems: 'center'
    },

    ErrorText: {
        color: 'red',
        fontFamily: 'Lexend-Regular',
        fontSize: 16,
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
        height: 12
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
        alignItems: 'center'
    },

    OrWrap: {
        position: 'absolute',
        right: '18%',
        top: '24%',
        backgroundColor: '#D9D9D9',
        padding: 8,
        borderRadius: 25,
        zIndex: 2
    },
    OrText: {
        fontFamily: 'Lexend-Regular',
        color: "#3A80EA",
        fontSize: 14
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
        marginBottom: 4
    },
    TabButtons: {
        padding: 8
    },

    TabText: {
        color: '#2B2B2B',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        padding: 8
    },
    SelectedTab: {
        borderBottomWidth: 1,
        borderBottomColor: '#1A6CF6'
    },
    SelectedText: {
        color: '#1A6CF6',
    },

    DetailsInpCont: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 16
    },

    stockBagText: {
        fontSize: 12,
        fontFamily: 'Lexend-Light',
        color: '#1A6CF6',
        marginLeft: 12,
        marginRight: 12
    },



    CheckStockListView: {
        backgroundColor: '#FDFDFD',
        width: '98%',
        display: 'flex',
        flexDirection: 'column',
        padding: 8
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
        padding: 8
    },
    StockItemListHead: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    StockListCodeText: {
        fontFamily: 'Lexend-Light',
        color: "#2B2B2B",
    },
    StockItemDescCont: {
        paddingVertical: 8
    },
    StockListDescText: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        color: '#4B5290'
    },
    QtyAvlQtyCont: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 8
    },
    QtyCont: {
        padding: 6,
        flexDirection: 'row'
    },
    QtyText: {
        fontFamily: 'Lexend-Light',
        color: '#4B5290'
    },
    AvlText: {
        fontFamily: 'Lexend-Light',
        color: '#8f6924'
    },

})

export default SalesInvoice