
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions,
  Touchable,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Modal} from 'react-native-paper';
import {it, tr} from 'date-fns/locale';
import ToastManager, {Toast} from 'toastify-react-native';
import {getReadableDate, getReadableTime} from './utils';




function PhysicalStock({navigation}) {

  

  

  // Simulate API call with error
 

  const [currentSearchingTextToLink, setCurrentSearchingTextToLink] =
    useState('');
  const [currentSearchingText, setCurrentSearchingText] = useState('');
  const [selectedItemForBarcodeLinking, setSelectedItemForBarcodeLinking] =
    useState('');

  const SCREEN_WIDTH = Dimensions.get('window').width;

  const [askShowBarCodeLinkComponent, setAskShowBarCodeLinkComponent] =
    useState(false);
  const [showBarCodeLinkComponent, setShowBarCodeLinkComponent] =
    useState(false);
  const [currentChosenLocation, setCurrentChosenLocation] = useState(null);
  const [loginUsername, setLoginUsername] = useState(null);
  const [locationList, setLocationList] = useState(null);
  const [noLocationIsSet, setnoLocationIsSet] = useState(true);
  //location list api also working in new api
  // http://bapvpn.fortiddns.com:60/api/Locmaster/admin

  //now new api http://bapvpn.fortiddns.com:60/api/Locmaster/admin?cmpcode=bauto&guid=1333..

  //http://bapvpn.fortiddns.com:60/api/Locmaster/162?cmpcode=BAUTO&guid=169C6815-E84C-4C41-B9BD-9F2028697412

  const [deptNo, setDeptNo] = useState('');
  const [cmpCode, setCmpCode] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [stockOfItemInThisLocation, setStockOfItemInThisLocation] =
    useState(null);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const previousInputBoxCharacterLengthRef = useRef(0);
  const keyDownRef = useRef(0);

  const previousTimeStampOfInputKeyDown = useRef();
  const previousTimeStampOfInput = useRef();

  const [inputError, setInputError] = useState('');

  const [defaultBinName, setDefaultBinName] = useState('');

  const [isDefaultBinChecked, setIsDefaultBinChecked] = useState(false);

  const [isAutoSaveChecked, setIsAutoSaveChecked] = useState(false);

  const [itemCameFromBarcodeReading, setItemCameFromBarcodeReading] =
    useState(false);

  const last4DigitQuantityRef = useRef(null);

  const itemSearchInputRef = useRef(null);

  const phyqty_input_ref = useRef(null);

  const [isCallingTemporaryList, setIsCallingTemporaryList] = useState(false);

  const [showLoading, setShowLoading] = useState(false);

  const [temporaryTableItemList, setTemporaryTableItemList] = useState([]);

  const [animation, setAnimation] = useState('');

  const [toggleForEntryType, setToggle] = useState(false);

  const handleToggleChange = () => {
    console.log('toggleForEntryType ', !toggleForEntryType);

    setToggle(!toggleForEntryType);
    setAnimation('open');
  };

  const [toggleForBinUpdate, setToggleForBinUpdate] = useState(false);
  const handleToggleChangeBinUpdate = () => {
    setToggleForBinUpdate(!toggleForBinUpdate);
  };

  const [currentInputItem, setCurrentInputItem] = useState(null);

  const [showLocationSelectionPopup, setShowLocationSelectionPopup] =
    useState(false);
  const [currentLocationState, setCurrentLocationState] = useState(null);

  const entryCardBinInputRef = useRef(null);

  let timeInterval = null;
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [arrayOfSearchResults, setArrayOfSearchResults] = useState(null);

  const [arrayOfSearchResultsLinkBarcode, setArrayOfSearchResultsLinkBarcode] =
    useState(null);

  const [showLoadingStateViewLog, setShowLoadingStateViewLog] = useState(false);
  const [showHideSearchListBox, setShowHideSearchListBox] = useState(false);

  const templateOfSingleObjectInArray = {
    id: '',
    item_code: '',
    available_quantity: '',
    picked_quantity: '',
    bin_location: '',
  };

  const [showHideScanPopupState, setShowHideScanPopupState] = useState(false);

  const [workListArray, setWorkListArray] = useState([]);

  const clickedOnScanButton = () => {
    if (workListArray.length == 0) {
      setShowHideScanPopupState(prev => !prev);
    } else {
      alert('Please save the item first or remove current item');
    }
  };

  const callLocationList = () => {
    let apiUrl = `${appUrl}Locmaster/${loginUsername}?cmpcode=${cmpCode}&guid=169C6815-E84C-4C41-B9BD-9F2028697412`;

    console.log('apiUrl->>>', apiUrl);

    axios
      .get(apiUrl)
      .then(res => {
        setLocationList(res.data);
      })
      .catch(err => {});
  };

  const succesFullyScanned = scannedResult => {
    if (scannedResult.length > 0) {
      // alert(`scannedResult , ${scannedResult}`)
      console.log('PhysicalStockHome scannedResult ', scannedResult);

      setShowHideScanPopupState(false);

      // const last4 = scannedResult.slice(-4);
      // console.log(last4);

      // Normally last 4 digit would not be there for some customers
      // we did like that on their request
      // so default scenario pass 1 as quantity, if customers with last 4 digit comes
      // pass last4 variable as quantity

      // last4DigitQuantityRef.current = parseInt(last4);
      last4DigitQuantityRef.current = 1;

      // Normally last 4 digit would not be there for some customers
      // we did like that on their request
      // so default scenario pass scannedResult as code, if customers with last 4 digit comes
      // pass codeWithoutLast4digits as code

      // const codeWithoutLast4digits = scannedResult.substring(0, scannedResult.length - 4)
      // console.log(codeWithoutLast4digits);

      // let harcodedItem = {
      //     Code: codeWithoutLast4digits,
      // }

      let harcodedItem = {
        Code: scannedResult,
      };

      setCurrentInputItem(harcodedItem);
      setItemCameFromBarcodeReading(true);
    } else {
      clickedOnScanButton();
      console.log('0 character');
      setShowHideScanPopupState(false);
    }
  };

  const clickedItemFromSearchList = (item, ind) => {
    console.log('clicked on --->+++>>>>>', item, ind, item.Code);
    setSelectedItemIndex(ind);
    setShowHideSearchListBox(false);
    setCurrentInputItem({Code: item.Code});

    // in best if i scan then wont show item in worklist array that is in screen so again uncommenting getitemdetails
    // start of getitemdetails no need because same search api we are calling the issue based on Bnttech 2 items came when passed an item code 
    // becuase first item had some part of  description exactly like second item code 
    let objectOfItem = item;

    console.log('toggleForEntryType before sending ', toggleForEntryType);

    let ObjectAfterGettingDetails = {
      ...templateOfSingleObjectInArray,
      id: workListArray.length + 1,
      item_code: objectOfItem.Code,
      item_description: objectOfItem.Description,
      available_quantity: objectOfItem.Stock == null ? 0 : objectOfItem.Stock,
      bin_location:
        objectOfItem.Location != null ? objectOfItem.Location.trim() : '',
      picked_quantity:
        last4DigitQuantityRef.current != null
          ? last4DigitQuantityRef.current
          : '',
      mode_of_entry: toggleForEntryType ? 'R' : 'N',
      Unit: objectOfItem.Unit,
    };

    console.log(' workListArray ', workListArray);

    let upatedArray = [...workListArray, ObjectAfterGettingDetails];

    console.log(' updatedArray ', upatedArray);

    setWorkListArray(upatedArray);

    callItemTemporaryTableList(item.Code, deptNo);

    // end of code taken from getItemDetails 
    itemSearchInputRef.current.value = '';

    console.log('phyqty_input_ref.current ', phyqty_input_ref.current);
    phyqty_input_ref.current?.focus();
  };

  const clickedItemFromSearchListBarcodeLinking = (item, ind) => {
    console.log('clicked on --->+++>>>>>', item, ind, item.Code);
    setSelectedItemForBarcodeLinking(item.Code);
    setArrayOfSearchResultsLinkBarcode(null);
  };

  useEffect(() => {
    if (workListArray.length > 0) {
      //phyqty_input_ref.current?.focus()
    }
  }, [workListArray]);

  const showLoadingForViewLog = () => {
    setShowLoadingStateViewLog(prev => !prev);
  };

  const callApi = searchingText => {
    showLoadingForViewLog();

    var specialCharacterRemovedItemCode = encodeURIComponent(searchingText);

    console.log(
      'specialCharacterRemovedItemCode ',
      specialCharacterRemovedItemCode,
    );
    // PREVIOUS PATH /Search_Items/Sitem/${specialCharacterRemovedItemCode}

    let apiUrl = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpCode}&guid=F4369B5E-8E23-4BCF-AC82-76C977991728&mod=code&Loc=${currentChosenLocation?.trim()}&searchKey=${specialCharacterRemovedItemCode}%`;

    console.log('apiUrl search item --++', apiUrl);

    axios
      .get(apiUrl)
      .then(res => {
        showLoadingForViewLog();
        console.log(' res is --->>>> +++uuu', res.data);

        if (res.data) {
          if (res.data.length == 0) {
            console.log(' res is --->>>> 2', res);

            //setShowBarCodeLinkComponent(true)

            
            setAskShowBarCodeLinkComponent(true);
          } else {
            setArrayOfSearchResults(res.data);
          }
        }
      })
      .catch(err => {
        console.log('error is ', err);
        showLoadingForViewLog();
      });
  };

  const callApiForBarcodeLinking = searchingText => {
    if (searchingText?.length > 0) {
      setCurrentSearchingTextToLink(searchingText);
    } else {
      setCurrentSearchingTextToLink('');
    }

    showLoadingForViewLog();

    var specialCharacterRemovedItemCode = encodeURIComponent(searchingText);

    console.log(
      'specialCharacterRemovedItemCode ',
      specialCharacterRemovedItemCode,
    );
    // PREVIOUS PATH /Search_Items/Sitem/${specialCharacterRemovedItemCode}

    let apiUrl = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpCode}&guid=F4369B5E-8E23-4BCF-AC82-76C977991728&mod=code&Loc=${currentChosenLocation?.trim()}&searchKey=${specialCharacterRemovedItemCode}%`;

    console.log('apiUrl search item --++', apiUrl);

    axios
      .get(apiUrl)
      .then(res => {
        showLoadingForViewLog();
        console.log(' res is --->>>> +++uuu', res.data);

        if (res.data) {
          if (res.data.length == 0) {
            console.log(' res is --->>>> 2', res);

            setArrayOfSearchResultsLinkBarcode([]);
          } else {
            setArrayOfSearchResultsLinkBarcode(res.data);
          }
        }
      })
      .catch(err => {
        console.log('error is ', err);
        showLoadingForViewLog();
      });
  };

  useEffect(() => {
    if (appUrl) {
      callLocationList();
    }
  }, [appUrl]);

  const getItemQuantityInThatLocation = itemCode => {
    var specialCharacterRemovedItemCode = encodeURIComponent(itemCode);

    axios
      .get(
        `${appUrl}Loc_Qty/locqty/${specialCharacterRemovedItemCode}/${deptNo}`,
      )
      .then(res => {
        console.log('res ', res.data.result[0].Stock);

        setStockOfItemInThisLocation(res.data.result[0].Stock);

        // if (res.data.result != null) {

        //     if (res.data.result.length > 0) {

        //         let objectOfItem = res.data.result[0];

        //         let ObjectAfterGettingDetails = {
        //             ...templateOfSingleObjectInArray,
        //             id: workListArray.length + 1,
        //             item_code: objectOfItem.code,
        //             item_description: objectOfItem.descr,
        //             available_quantity: objectOfItem.Qty == null ? 0 : objectOfItem.Qty,
        //             bin_location: objectOfItem.BIN,
        //             picked_quantity: last4DigitQuantityRef.current != null ? last4DigitQuantityRef.current : "",
        //             mode_of_entry: toggleForEntryType ? "R" : "N",
        //         }

        //         console.log(" workListArray ", workListArray);

        //         let upatedArray = [...workListArray, ObjectAfterGettingDetails]

        //         console.log(" updatedArray ", upatedArray);

        //         setWorkListArray(upatedArray)

        //     }
        // } else {
        //     alert("no item details found")
        // }
      })
      .catch(err => {
        console.log('err ', err);
      });
  };

  const getItemDetails = itemCode => {
    var specialCharacterRemovedItemCode = encodeURIComponent(itemCode);

    console.log('code ', `${deptNo}`);

    console.log(
      'specialCharacterRemovedItemCode ',
      specialCharacterRemovedItemCode,
    );

    // console.log("calling this api to get details", `${appUrl}ItemDetails/${(deptNo).trim()}/${specialCharacterRemovedItemCode}`);

    //below api not working so using the next one to get details
    // let apiUrl = `${appUrl}ItemDetails/${(deptNo)?.trim()}/${specialCharacterRemovedItemCode}`

    let apiUrl = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpCode}&guid=F4369B5E-8E23-4BCF-AC82-76C977991728&mod=code&Loc=${currentChosenLocation?.trim()}&searchKey=${specialCharacterRemovedItemCode}%`;

    console.log('apiUrl getitemdetail --->.', apiUrl);

    axios
      .get(apiUrl)
      .then(res => {
        console.log('res --->.', res.data);

        if (res.data != null) {
          if (res.data.length > 0) {
            let objectOfItem = res.data[0];

            console.log(
              'toggleForEntryType before sending ',
              toggleForEntryType,
            );

            let ObjectAfterGettingDetails = {
              ...templateOfSingleObjectInArray,
              id: workListArray.length + 1,
              item_code: objectOfItem.Code,
              item_description: objectOfItem.Description,
              available_quantity:
                objectOfItem.Stock == null ? 0 : objectOfItem.Stock,
              bin_location:
                objectOfItem.Location != null
                  ? objectOfItem.Location.trim()
                  : '',
              picked_quantity:
                last4DigitQuantityRef.current != null
                  ? last4DigitQuantityRef.current
                  : '',
              mode_of_entry: toggleForEntryType ? 'R' : 'N',
              Unit: objectOfItem.Unit,
            };

            console.log(' workListArray ', workListArray);

            let upatedArray = [...workListArray, ObjectAfterGettingDetails];

            console.log(' updatedArray ', upatedArray);

            setWorkListArray(upatedArray);

            callItemTemporaryTableList(itemCode, deptNo);
          } else {
            setAskShowBarCodeLinkComponent(true);
          }
        } else {
          Alert.alert('no item details found');
        }
      })
      .catch(err => {
        console.log('err -->', err.message);
      });
  };

  const handleInput = e => {
    if (workListArray.length == 0) {
      // commented for zebra tc15 device scan
      // because i tjust puts the scanned value to input
      // so to avoid search list container coming down we are hiding it
      // also make this as a toggle option
      // so if not having barcode we have to type
      // also check if we can trigger scan on button click from button in web page
      // but then input will be out of focus so paste wont happen

      clearInterval(timeInterval);

      timeInterval = setTimeout(() => {
        if (e.length > 0) {
          console.log(' searchtext changed is', e);
          if (timeInterval) {
            console.log('timer is not null we are clearing it');
            clearInterval(timeInterval);
          }
          setShowHideSearchListBox(true);
          callApi(e);
        } else {
          setShowHideSearchListBox(false);
        }
      }, 500);
    } else {
      alert('Please save the item first or remove current item');
    }
  };

  const handlePickedQuantity = (e, clickedPosition) => {
    setInputError('');

    let newArray = workListArray.map((item, index) => {
      if (index == clickedPosition) {
        return {...item, picked_quantity: e};
      } else {
        return item;
      }
    });

    setWorkListArray(newArray);
  };

  const handleBinInput = (e, clickedPosition) => {
    let newArray = workListArray.map((item, index) => {
      if (index == clickedPosition) {
        return {...item, bin_location: e};
      } else {
        return item;
      }
    });

    setWorkListArray(newArray);
  };

  const handleDefaultBinNameInput = e => {
    setDefaultBinName(e.target.value);
  };

  const clickedOnLocationListItem = clickedItem => {
    setCurrentLocationState(clickedItem);
  };

  const handleKeyDown = event => {
    console.log(' key down  is ', event.timeStamp);
    // console.log(" key down keyDownRef.current  is ", keyDownRef.current)
    // console.log(" event.timeStamp - keyDownRef.current ", event.timeStamp - keyDownRef.current)

    // if ((event.timeStamp - keyDownRef.current) < 10) {

    //     console.log(" <<<<< than 10ms so barcode ")
    //     succesFullyScanned(event.target.value)
    // } else {
    //     console.log(" >>>>>> than 10ms so user typed ")
    //     handleInput(event)
    // }

    // keyDownRef.current = event.timeStamp;
  };

  const handleKeyUp = event => {
    console.log(' key up  is ', event.timeStamp);

    // console.log(" key up  is ", event)
    // console.log(" key up keyDownRef.current  is ", keyDownRef.current)
    // console.log(" event.timeStamp - keyDownRef.current ", event.timeStamp - keyDownRef.current)

    // if ((event.timeStamp - keyDownRef.current) < 10) {

    //     console.log(" <<<<< than 10ms so barcode ")
    //     succesFullyScanned(event.target.value)
    // } else {
    //     console.log(" >>>>>> than 10ms so user typed ")
    //     handleInput(event)
    // }

    // keyDownRef.current = event.timeStamp;
  };

  const handleOnInput = e => {
    console.log('handleOnInput ', e.timeStamp);
    console.log('handleOnInput event >>>', e);
  };

  const handleOnChange = e => {
    setCurrentSearchingText(e);
    console.log('handleOnChange event ', e.length);

    if (e.length - previousInputBoxCharacterLengthRef.current > 1) {
      console.log(
        '>> than 1 character and input empty so either barcode or autosuggestion',
      );
      succesFullyScanned(e);
    } else {
      console.log('user entry');
      handleInput(e);
    }

    previousInputBoxCharacterLengthRef.current = e.length;
  };

  const handleOnBeforeInput = e => {
    console.log('handleOnBeforeInput ', e.timeStamp);
  };

  useEffect(() => {

      console.log("currentInputItem ", currentInputItem)

      if (currentInputItem != null) {
          getItemDetails(currentInputItem.Code)
      }

  }, [currentInputItem])

  useEffect(() => {
    if (loginUsername) {
      callLocationList();
    }
  }, [loginUsername]);

  const removeItemFromRow = () => {
    itemSearchInputRef.current.value = '';
    setWorkListArray([]);
    setTemporaryTableItemList([]);
  };

  const callItemTemporaryTableList = (
    itemCodeTemporaryList,
    locationCodeTemporaryList,
  ) => {
    setIsCallingTemporaryList(true);

    var specialCharacterRemovedItemCode = encodeURIComponent(
      itemCodeTemporaryList,
    );

    let apiUrl = `${appUrl}PhysicalStk/${cmpCode}/${specialCharacterRemovedItemCode}/${currentChosenLocation?.trim()}`;

    console.log(
      'apiUrl for retrieving list again ---> ',
      apiUrl,
      itemCodeTemporaryList,
    );
    axios
      .get(apiUrl)
      .then(res => {
        console.log('res is ', res);
        setTemporaryTableItemList(res.data);
        setIsCallingTemporaryList(false);
      })
      .catch(err => {
        console.log('err is --->>', err);
        setIsCallingTemporaryList(false);
      });
  };

  const checkForAnyMissingInput = () => {
    // if only bin update is false then only show the error to input quantity
    if (!toggleForBinUpdate) {
      if (workListArray[0].picked_quantity != '') {
        console.log(' picked_quantity not equal to empty string ');
        return true;
      } else {
        console.log(' picked_quantity equal to empty string ');
        setInputError('please enter quantity');
        return false;
      }
    } else {
      return true;
    }
  };

  const sendDataToAPI = () => {
    if (!checkForAnyMissingInput()) {
      return;
    }

    setShowLoading(true);

    console.log(' workListArray ', workListArray);
    console.log(' entryCardBinInputRef.current ', entryCardBinInputRef.current);

    const objectToSendToAPI = {
      mod: toggleForEntryType ? 'R' : 'N',
      code: workListArray[0].item_code,
      idesc: workListArray[0].item_description,
      loc: currentChosenLocation?.trim(),
      sysqty: workListArray[0].available_quantity, // get stock from another api
      phyqty: !toggleForBinUpdate ? workListArray[0].picked_quantity : '0', // because if bin only update is selected then no eed to pass value becuase it will update only bin column so no point in sending quantityh
      user: loginUsername,
      bin: workListArray[0].bin_location,
    };

    console.log(' objectToSendToAPI ', objectToSendToAPI);

    // new url /api/PhysicalStk/InsertPhyQty?compcode=BAUTO

    let apiUrl = `${appUrl}PhysicalStk/InsertPhyQty?compcode=${cmpCode}`;

    console.log('apiUrl for insert ', apiUrl);

    

    axios
      .post(apiUrl, objectToSendToAPI)
      .then(res => {
        console.log('res is ', res.data);

        setShowLoading(false);
        if (res.data.message == 'Insert/Update successful') {
          Toast.success(`Successfully saved`);

          itemSearchInputRef.current.focus();
          callItemTemporaryTableList(
            objectToSendToAPI.code,
            objectToSendToAPI.loc,
          );

          // clear current item in array
          setWorkListArray([]);
          setTemporaryTableItemList([]);

          //clear value that says value came from barcode
          // else when value is received after receiving itemdetails it will auto sae
          // even if item code came not through barcoding
          setItemCameFromBarcodeReading(false);

          // also set  last4DigitQuantityRef.current to null
          // else previous value will come in quantity input box
          last4DigitQuantityRef.current = null;

          // clear itemsearch inout box and set previousLength to 0 ,
          // else search dropdown list will come
          // bcoz previousLenghRef will be there now when barcode scan done both having same length
          // so will go to user typing logic

          itemSearchInputRef.current.value = '';
          previousInputBoxCharacterLengthRef.current = 0;
        } else {
          console.log('Quantity not added');
        }
      })
      .catch(err => {
        setShowLoading(false);
        console.log('err is --+++ ', err);
      });
  };

  const sendDataToAPILinkBarCode = () => {
    const objectToSendToAPI = {
      mod: 'I',
      code: selectedItemForBarcodeLinking,
      barcode: currentSearchingText,
      user: loginUsername,
    };

    console.log(' objectToSendToAPI barcode ', objectToSendToAPI);

    // new url /api/PhysicalStk/InsertPhyQty?compcode=BAUTO

    let apiUrl = `${appUrl}AddBarcode/InsertBarcode?compcode=${cmpCode}`;

    console.log('apiUrl for insert barcode', apiUrl);

    axios
      .post(apiUrl, objectToSendToAPI)
      .then(res => {
        console.log('res is ', res.data);

        setShowLoading(false);
        if (res.data.message == 'Barcode inserted successfully') {
          Toast.success(`Successfully saved`);

          setAskShowBarCodeLinkComponent(false);
          setShowBarCodeLinkComponent(false);
        } else {
          console.log('Quantity not added');
        }
      })
      .catch(err => {
        setShowLoading(false);
        console.log('err is --+++ ', err);
      });
  };

  const checkIfDeviceSupportNFC = async () => {
    // try{
    //     const device = await navigator.hid.requestDevice({ filters: [] });
    //     console.log("hid device  ", device)
    // }catch{
    //     console.log("error while  checking for hid ")
    // }
    //nfc
    //
    //
    // try {
    //     const status = await navigator.permissions.query({ name: 'midi' });
    //     console.log("nfc support ", status)
    // }
    // catch (e) {
    //     // No Web NFC support
    //     console.log("error while  checking for permission")
    // }
  };

  useEffect(() => {
    if (
      isAutoSaveChecked &&
      itemCameFromBarcodeReading &&
      workListArray.length > 0
    ) {
      sendDataToAPI();
    } else {
      // clicked list from search list
      // so dont save automatically wait till user click on save button
    }
  }, [isAutoSaveChecked, workListArray]);

  useEffect(() => {
    setShowLocationSelectionPopup(true);
  }, []);

  const getLocalStorageValues = async () => {
    const appUrl = await AsyncStorage.getItem('appUrl');

    setAppUrl(appUrl);

    const portNoData = await AsyncStorage.getItem('portNoData');

    const deptNo = await AsyncStorage.getItem('DEPTNO');
    const locusername = await AsyncStorage.getItem('loginUserName');

    if (portNoData) {
      // setCmpName(portNoData[0].COMPNAME)

      const dataArray = JSON.parse(portNoData);
      setCmpCode(dataArray[0].COMPID);
    }

    if (deptNo) {
      setDeptNo(deptNo);
    }

    if (locusername) {
      setLoginUsername(locusername);
    }
  };

  useEffect(() => {
    getLocalStorageValues();
  }, []);

  const clickedOnBackPhysicalStock = () => {
    console.log('back clicked');

    // setnoLocationIsSet(prev => !prev)
  };

  useEffect(() => {
    // Focus the TextInput when the component mounts
    if (!noLocationIsSet && itemSearchInputRef.current) {
      itemSearchInputRef.current.focus();
    }
  }, [noLocationIsSet]);
  return (
    <View
      style={{height: '100%', backgroundColor: '#ffffff', paddingBottom: 50}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          marginTop: 20,
          paddingRight: 10,
        }}>
        <Text
          style={{
            fontSize: 20,
            color: '#000000',
            backgroundColor: '#ffffff',
            paddingHorizontal: 20,
          }}>
          Physical Stock
        </Text>
        <TouchableOpacity
          style={{
            width: 100,
            backgroundColor: '#000000',
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={() => {
            itemSearchInputRef.current.focus();
            setShowSettingsPanel(prev => !prev);
          }}>
          <Text style={{fontSize: 16, color: '#ffffff'}}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: '#ffffff',
          flexDirection: 'row',
          paddingLeft: 20,
        }}>
        <Text style={{color: '#000000'}}>Selected Location</Text>
        <Text style={{marginLeft: 10, color: '#000000'}}>
          {currentChosenLocation}
        </Text>
      </View>

      {currentSearchingText && askShowBarCodeLinkComponent && (
        <View style={{padding: 10, backgroundColor: '#f7f7f7', margin: 10}}>
          <Text style={{color: '#000000', fontSize: 16}}>
            Item Not Found, Do you want to link
          </Text>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <TouchableOpacity
              onPress={() => {
                setAskShowBarCodeLinkComponent(false);
              }}
              style={styles.cancelButton}>
              <Text style={{color: '#000000'}}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                {
                  setAskShowBarCodeLinkComponent(false);
                  setShowBarCodeLinkComponent(true);
                }
              }}
              style={[styles.saveButton, {marginLeft: 10}]}>
              <Text style={{color: '#000000'}}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showBarCodeLinkComponent ? (
        <View
          style={{
            padding: 20,
            borderWidth: 1,
            borderRadius: 5,
            marginHorizontal: 10,
            marginTop: 10,
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{padding: 4, fontSize: 14, color: '#000000'}}>
              Barcode
            </Text>
            <Text
              style={{
                backgroundColor: '#d7d7d7',
                color: '#000000',
                padding: 4,
                fontSize: 16,
              }}>
              {currentSearchingText}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: 10}}>
            <Text style={{padding: 4, fontSize: 14, color: '#000000'}}>
              Selected Item To Link
            </Text>
            <Text
              style={{
                backgroundColor: '#d7d7d7',
                color: '#000000',
                padding: 4,
                fontSize: 16,
              }}>
              {selectedItemForBarcodeLinking}
            </Text>
          </View>

          <TextInput
            placeholder="Search item to link"
            style={styles.binInput}
            onChangeText={text => callApiForBarcodeLinking(text)}></TextInput>

          {arrayOfSearchResultsLinkBarcode?.length > 0 &&
            currentSearchingTextToLink?.length > 0 && (
              <FlatList
                nestedScrollEnabled={true}
                style={{backgroundColor: '#a7a7a7', height: 200}}
                data={arrayOfSearchResultsLinkBarcode}
                keyExtractor={(item, index) => item.Code.toString()}
                ListHeaderComponent={() => (
                  <View
                    style={{
                      flexDirection: 'row',
                      padding: 10,
                      backgroundColor: '#000000',
                    }}>
                    <Text
                      style={{
                        width: '50%',
                        textAlign: 'center',
                        color: '#ffffff',
                      }}>
                      Code
                    </Text>
                    <Text
                      style={{
                        width: '50%',
                        textAlign: 'center',
                        color: '#ffffff',
                      }}>
                      Description
                    </Text>
                  </View>
                )}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    onPress={() =>
                      clickedItemFromSearchListBarcodeLinking(item, index)
                    }
                    style={{
                      backgroundColor: '#f7f7f7',
                      borderWidth: 1,
                      borderColor: '#a7a7a7',
                      padding: 10,
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        width: '50%',
                        textAlign: 'center',
                        color: '#000000',
                      }}>
                      {item.Code}
                    </Text>
                    <Text
                      style={{
                        width: '50%',
                        textAlign: 'center',
                        color: '#000000',
                      }}>
                      {item.Description}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
              onPress={() => setShowBarCodeLinkComponent(false)}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={sendDataToAPILinkBarCode}
              style={styles.saveButton}>
              <Text style={[styles.saveButtonText]}>Link Barcode To Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={[styles.container]} nestedScrollEnabled={true}>
          {/* Settings Panel */}
          {showSettingsPanel && (
            <View style={styles.settingsPanel}>
              <Text style={styles.heading}>Selected Location</Text>

              <TouchableOpacity
                onPress={() => setIsAutoSaveChecked(!isAutoSaveChecked)}
                style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    isAutoSaveChecked && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.label}>Auto save after scanning</Text>
              </TouchableOpacity>

              {/* Entry Type Toggle */}
              <View style={styles.entryTypeContainer}>
                <Text style={styles.heading}>Entry type</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{color: '#000000'}}>Normal</Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={toggleForEntryType ? '#f5dd4b' : '#f4f3f4'}
                    onValueChange={handleToggleChange}
                    value={toggleForEntryType}
                  />
                  <Text style={{color: '#000000'}}>Reverse</Text>
                </View>
              </View>
            </View>
          )}

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={itemSearchInputRef}
              placeholder="search item"
              placeholderTextColor="#000000"
              style={styles.searchInput}
              onChangeText={text => handleOnChange(text)}
              value={workListArray[0]?.item_code}
              // Add onKeyDown, onInput handlers etc. here
            />
          </View>

          {/* put % inthe last after code in the search result Location means BIN  */}
          {/* Search Results List */}
          {showHideSearchListBox && (
            <FlatList
              nestedScrollEnabled={true}
              style={{backgroundColor: '#a7a7a7', height: 200}}
              data={arrayOfSearchResults}
              keyExtractor={(item, index) => item.Code.toString()}
              ListHeaderComponent={() => (
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: '#000000',
                  }}>
                  <Text
                    style={{
                      width: '50%',
                      textAlign: 'center',
                      color: '#ffffff',
                    }}>
                    Code
                  </Text>
                  <Text
                    style={{
                      width: '50%',
                      textAlign: 'center',
                      color: '#ffffff',
                    }}>
                    Description
                  </Text>
                </View>
              )}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() => clickedItemFromSearchList(item, index)}
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderWidth: 1,
                    borderColor: '#a7a7a7',
                    padding: 10,
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      width: '50%',
                      textAlign: 'center',
                      color: '#000000',
                    }}>
                    {item.Code}
                  </Text>
                  <Text
                    style={{
                      width: '50%',
                      textAlign: 'center',
                      color: '#000000',
                    }}>
                    {item.Description}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Work List Entry Card */}
          {workListArray.length > 0 && (
            <View style={styles.entryCard}>
              <Text style={styles.cardLabel}>Item Code</Text>
              <Text style={{color: '#000000'}}>
                {workListArray[0].item_code}
              </Text>

              <Text style={styles.cardLabel}>Description</Text>
              <Text style={{color: '#000000'}}>
                {workListArray[0].item_description}
              </Text>

              <Text style={styles.cardLabel}>Unit</Text>
              <Text style={{color: '#000000'}}>{workListArray[0]?.Unit}</Text>

              {!toggleForBinUpdate && (
                <>
                  <Text style={styles.cardLabel}>Phy. Qty</Text>
                  <TextInput
                    ref={phyqty_input_ref}
                    keyboardType="numeric"
                    style={styles.quantityInput}
                    value={String(workListArray[0].picked_quantity)}
                    onChangeText={text => handlePickedQuantity(text, 0)}
                  />
                </>
              )}

              {inputError.length > 0 && (
                <Text style={styles.errorText}>{inputError}</Text>
              )}

              <Text style={styles.cardLabel}>Bin</Text>
              <TextInput
                ref={entryCardBinInputRef}
                style={styles.binInput}
                value={
                  isDefaultBinChecked
                    ? defaultBinName
                    : workListArray[0].bin_location
                }
                editable={!isDefaultBinChecked}
                onChangeText={text =>
                  !isDefaultBinChecked && handleBinInput(text, 0)
                }
              />

              <TouchableOpacity
                onPress={removeItemFromRow}
                style={styles.removeButton}>
                <Text style={styles.removeButtonText}>🗑 Remove</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={sendDataToAPI}
                style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Temporary Table Summary */}
          {temporaryTableItemList?.length > 0 && (
            <View style={styles.summaryContainer}>
              <Text style={{fontSize: 20, fontWeight: '400', color: '#000000'}}>
                Previous Entries
              </Text>
              <Text style={{color: '#000000'}}>
                Code: {temporaryTableItemList[0].code}
              </Text>
              <Text style={{color: '#000000'}}>
                Description: {temporaryTableItemList[0].description}
              </Text>
              <Text style={{color: '#000000'}}>
                Total Stock Counted:{' '}
                {temporaryTableItemList.reduce(
                  (acc, curr) => acc + curr.phyQty,
                  0,
                )}
              </Text>
            </View>
          )}

          {temporaryTableItemList?.length > 0 && (
            <ScrollView
              horizontal
              style={{width: SCREEN_WIDTH, paddingBottom: 50}}>
              <FlatList
                style={{
                  backgroundColor: '#a7a7a7',
                  width: SCREEN_WIDTH,
                  marginTop: 10,
                }}
                data={temporaryTableItemList}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={() => (
                  <View
                    style={{
                      flexDirection: 'row',
                      padding: 10,
                      backgroundColor: '#000000',
                    }}>
                    <Text
                      style={{
                        width: '30%',
                        textAlign: 'center',
                        color: '#ffffff',
                      }}>
                      PhyQty
                    </Text>
                    <Text
                      style={{
                        width: '30%',
                        textAlign: 'center',
                        color: '#ffffff',
                      }}>
                      Date Time
                    </Text>
                    <Text
                      style={{
                        width: '40%',
                        textAlign: 'center',
                        color: '#ffffff',
                      }}>
                      User
                    </Text>
                  </View>
                )}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    onPress={() => clickedItemFromSearchList(item, index)}
                    style={{
                      backgroundColor: '#f7f7f7',
                      borderWidth: 1,
                      borderColor: '#a7a7a7',
                      padding: 10,
                      flexDirection: 'row',
                    }}>
                    <View style={{width: '30%', flexDirection: 'column'}}>
                      <Text
                        style={{
                          textAlign: 'center',
                          color: '#000000',
                          fontWeight: '700',
                        }}>
                        {item.phyQty}
                      </Text>
                      <Text style={{textAlign: 'center', color: '#000000'}}>
                        {' '}
                        {item.bin}
                      </Text>
                    </View>

                    <Text
                      style={{
                        width: '30%',
                        textAlign: 'center',
                        color: '#000000',
                      }}>
                      {getReadableDate(item.dtime) +
                        ' ' +
                        getReadableTime(item.dtime)}
                    </Text>
                    <Text
                      style={{
                        width: '40%',
                        textAlign: 'center',
                        color: '#000000',
                      }}>
                      {item.user}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </ScrollView>
          )}

          {/* Loading */}
          {isCallingTemporaryList && (
            <View style={styles.loadingContainer}>
              <Text>Loading Entries...</Text>
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}
        </ScrollView>
      )}

      {noLocationIsSet && (
        <View
          style={{
            position: 'absolute',
            backgroundColor: '#00000080',
            padding: 30,
            height: '100%',
            top: 0,
          }}>
          <View
            style={{
              width: '100%',
              height: '80%',
              padding: 20,
              backgroundColor: '#f7f7f7',
            }}>
            <View style={{flexDirection: 'row', backgroundColor: '#ffffff'}}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#000000',
                  padding: 10,
                }}>
                Please Select Location
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#ffffff',
                paddingTop: 20,
              }}>
              <Text style={{width: '50%', padding: 10, color: '#000000'}}>
                Code
              </Text>
              <Text style={{width: '50%', padding: 10, color: '#000000'}}>
                Description
              </Text>
            </View>
            <ScrollView>
              {locationList?.map(item => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setnoLocationIsSet(prev => !prev);
                      setCurrentChosenLocation(item.loc_code);
                    }}
                    style={{
                      backgroundColor: '#f7f7f7',
                      borderWidth: 1,
                      borderColor: '#d7d7d7',
                      flexDirection: 'row',
                    }}>
                    <Text style={{width: '50%', padding: 10, color: '#000000'}}>
                      {item.loc_code}
                    </Text>
                    <Text style={{width: '50%', color: '#000000', padding: 10}}>
                      {' '}
                      {item.DESC}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      <ToastManager width={380} height={120} textStyle={{fontSize: 16}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, backgroundColor: '#fff'},
  settingsPanel: {marginBottom: 20},
  heading: {fontWeight: 'bold', fontSize: 16, color: '#000000'},
  locationText: {color: '#fff'},
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {width: 20, height: 20, borderWidth: 1, marginRight: 10},
  checkboxChecked: {backgroundColor: '#000'},
  label: {fontSize: 14, color: '#000000'},
  entryTypeContainer: {marginTop: 20},
  searchContainer: {marginTop: 20},
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    color: '#000000',
  },
  searchResultsContainer: {marginTop: 10},
  searchItemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  searchItemText: {fontWeight: 'bold'},
  entryCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 20,
  },
  cardLabel: {fontWeight: 'bold', marginTop: 10, color: '#000000'},
  quantityInput: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    color: '#000000',
  },
  binInput: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    color: '#000000',
  },
  errorText: {color: 'red', marginTop: 5},
  removeButton: {alignSelf: 'flex-end', marginTop: 10},
  removeButtonText: {color: 'red'},
  saveButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {color: '#fff', fontWeight: 'bold'},

  cancelButton: {
    backgroundColor: '#d7d7d7',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {color: '#000000', fontWeight: 'bold'},

  summaryContainer: {marginTop: 30},
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

export default PhysicalStock;

