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
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from './Header';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import HeaderUiNew from './HeaderUiNew';
import AsyncStorage from '@react-native-async-storage/async-storage';
import formatPrice3Decimal from '../utils';

const CheckStock = () => {
  const [vanFromLocalStorage, setVanFromLocalStorage] = useState(null);
  // const searchUrl = 'https://cubixweberp.com:203/api/Search_Items/Sitem/'

  const searchUrl =
    'https://cubixweberp.com:208/api/Search_Items/automax/Sitem/';

  const navigation = useNavigation();

  const [searchItem, setSearchItem] = useState('');

  const [stockData, setStockData] = useState(null);

  const [selectedStock, setSelectedStock] = useState(null);

  const [showActivity, setShowActivity] = useState(false);

  const [selectedTab, setSelectedTab] = useState('MODAL');

  const [modalNumberData, setModalNumberData] = useState(null);
  const [substituteData, setSubstituteData] = useState(null);

  const [modalLoader, setModalLoader] = useState(false);
  const [subLoader, setSubLoader] = useState(false);
  // const [modLoader, setModLoader] = useState(false)

  const [top50Items, setTop50Items] = useState(null);

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [expandedItems, setExpandedItems] = useState([]);

  const [selectedButton, setSelectedButton] = useState('Substitute');

  const fetchAppUrl = async () => {
    const van_from_local = await AsyncStorage.getItem('VAN');
    console.log('van_from_local in check stock', van_from_local);
    setVanFromLocalStorage(van_from_local);

    const appUrl = await AsyncStorage.getItem('appUrl');

    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    if (parsedUserDataArray) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim().toUpperCase());
    }

    if (appUrl) {
      setAppUrl(appUrl);
      console.log('appUrl in check stock', appUrl);
    }
  };

  const searchStock = async value => {
    setShowActivity(true);
    try {
      let encodedvalue = encodeURIComponent(value);

      // CHANGED SERACH STOCK TO THIS API BECAUSE IT WILL NOT CONFLICT WITH SOCA WEB APP SERCH STOCK
      // AND THIS IS ALREADY PRESENT IN ALL SALESDOOD API AS ABHILASH SIR SAID
      // loc = master means will search in all locations
      // let apiUrl = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpcode}&guid=F4369B5E-8E23-4BCF-AC82-76C977991728&mod=MOBILE&Loc=MASTER&searchKey=${encodedvalue}`

      let locationToPassToApiBasedOnVan =
        vanFromLocalStorage == '----' ? 'MASTER' : vanFromLocalStorage;
      let modeToPassToApiBasedOnVan =
        vanFromLocalStorage == '----' ? 'MOBILE' : 'all_top1000';

      // passing all_top1000 because it is present in all customer sp so location based qty will come inside Stock i think
      // so if normal user MOBILE mode if van user then pass all_top1000

      // not changed to MODE CODE because on result CODE comes so i have to change everywhere
      let apiUrl = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpcode}&guid=F4369B5E-8E23-4BCF-AC82-76C977991728&mod=${modeToPassToApiBasedOnVan}&Loc=${locationToPassToApiBasedOnVan}&searchKey=${encodedvalue}`;

      //let apiUrl = `${appUrl}Search_Items/${cmpcode}/Sitem/${encodedvalue}`

      console.log('search url ==>', apiUrl);

      await axios.get(apiUrl).then(res => {
        setStockData(res.data);
      });
      setShowActivity(false);
    } catch (error) {
      console.log('searchStockerror', error);
      setShowActivity(false);
    }
  };

  const toggleExpand = (code, oem) => {
    Keyboard.dismiss();
    setModalNumberData(null);
    setSubstituteData(null);
    fetchSubstituteData(code);
    fetchModalNumberData(oem);
    setExpandedItems(prevState => {
      if (prevState.includes(code)) {
        return prevState.filter(itemCode => itemCode !== code);
      } else {
        // return [...prevState, code];
        return [code];
      }
    });
  };

  useEffect(() => {
    if (searchItem !== '') {
      searchStock(searchItem);
      setSelectedStock(null);
    }
    if (searchItem == '') {
      setStockData(null);
      setSelectedStock(null);
      setShowActivity(false);
    }
  }, [searchItem]);

  const fetchModalNumberData = async OEM => {
    setModalLoader(true);
    try {
      const encodedOem = encodeURIComponent(OEM);
      console.log(
        `fetchModalNumberData--${appUrl}MasterList/${cmpcode}/MODELNUMBER/${encodedOem}`,
      );
      const response = await axios.get(
        `${appUrl}MasterList/${cmpcode}/MODELNUMBER/${encodedOem}`,
      );
      // console.log('fetchModalNumberData', response.data)
      setModalNumberData(response.data);
      setModalLoader(false);
    } catch (error) {
      console.log('fetchModalNumberDataError', error);
      setModalLoader(false);
    }
  };

  const fetchSubstituteData = async Code => {
    setSubLoader(true);
    try {
      const encodedCode = encodeURIComponent(Code);
      console.log(
        `fetchSubstituteData--${appUrl}MasterList/${cmpcode}/SUBSTITUTE/${encodedCode}`,
      );
      const response = await axios.get(
        `${appUrl}MasterList/${cmpcode}/SUBSTITUTE/${encodedCode}`,
      );
      // console.log('fetchSubstituteData', response.data);
      setSubstituteData(response.data);
      setSubLoader(false);
    } catch (error) {
      console.log('fetchSubstituteDataError', error);
      setSubLoader(false);
    }
  };

  const fetchTop50StockItems = async () => {
    setShowActivity(true);
    try {
      let locationToPassToApiBasedOnVan =
        vanFromLocalStorage === '----' ? 'MASTER' : vanFromLocalStorage;
      let modeToPassToApiBasedOnVan =
        vanFromLocalStorage === '----' ? 'MOBILE50' : 'all_top1000';

      // if location ie van is present use this mode all_top1000 insted of MOBILE50 because arya said if location is passed then call goes to another sp there MOBILE50 is not present but  all_top1000 is present in all customers sp
      let apiUrl = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpcode}&guid=F4369B5E-8E23-4BCF-AC82-76C977991728&mod=${modeToPassToApiBasedOnVan}&Loc=${locationToPassToApiBasedOnVan}&searchKey=-`;

      console.log(`fetchTop50StockItems--${apiUrl}`);

      const response = await axios.get(apiUrl);
      // console.log('fetchTop50StockItems', response.data[0]);
      setTop50Items(response.data);
      setShowActivity(false);
    } catch (error) {
      console.log('fetchTop50StockItemsError', error);
      setShowActivity(false);
    }
  };

  useEffect(() => {
    if (selectedStock) {
      fetchModalNumberData(selectedStock.OEM);
      fetchSubstituteData(selectedStock.Code);
    }
  }, [selectedStock]);

  useEffect(() => {
    if (appUrl && cmpcode) {
      fetchTop50StockItems();
    }
  }, [appUrl, cmpcode, vanFromLocalStorage]);

  useEffect(() => {
    fetchAppUrl();
  }, []);

  const handlePress = buttonName => {
    setSelectedButton(buttonName);
  };

  // console.log('formatPrice3Decimal', formatPrice3Decimal(500))

  // console.log('searchItem', searchItem)

  // console.log('stockData', stockData)

  // console.log('top50Items', top50Items && top50Items[0])

  // console.log('selectedStock', selectedStock && selectedStock)

  // console.log('modalNumberData', modalNumberData)

  // console.log('substituteData', substituteData)

  return (
    <View style={styles.HomeWrap}>
      {/* <Header /> */}

      <HeaderUiNew name={'Check Stock'} />

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        style={styles.HomeCont}>
        <View style={[styles.TANDCInpCont, {width: '90%', marginTop: 16}]}>
          {/* <View style={styles.InputImageCont}>
                        <Image style={styles.SearchIcon} source={require('../images/orangeLens.png')} />
                    </View> */}
          <TextInput
            style={styles.PlaceHolderInput}
            placeholder="Search item"
            value={searchItem}
            onChangeText={text => setSearchItem(text)}
            placeholderTextColor="#2b2b2b"
          />
        </View>

        {showActivity && <ActivityIndicator />}

        {stockData && !selectedStock && (
          <>
            {/* <View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                                <Text style={[styles.headerCell, {
                                    borderTopLeftRadius: 4
                                }]}>
                                    Code
                                </Text>
                                <Text style={[styles.headerCell, {
                                    borderTopRightRadius: 4
                                }]}>Description</Text>
                            </View>

                            <ScrollView style={styles.ScrollView}>
                                {
                                    stockData && stockData.length > 0 && stockData.map((item, index) => (
                                        <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedStock(item)}>
                                            <Text style={styles.dataCell}>{item.Code}</Text>
                                            <Text style={styles.dataCell}>{item.Description}</Text>
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
                                        color: 'red',
                                        fontFamily: 'Lexend-Bold',
                                    }}>No data available</Text>
                                </View>
                            }

                        </View> */}

            <ScrollView
              contentContainerStyle={[styles.CheckStockListView]}
              keyboardShouldPersistTaps="always">
              {stockData &&
                stockData.length > 0 &&
                stockData.map((item, index) => (
                  <View style={styles.StockListItem} key={index}>
                    {/* <View style={styles.StockItemListHead}>
                                            <Text style={styles.StockListCodeText}>{item.Code}</Text>
                                            <TouchableOpacity style={styles.PlusMinusCont} onPress={() => toggleExpand(item.Code)}>
                                                {
                                                    expandedItems.includes(item.Code) ?
                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                        :
                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                }
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity style={styles.StockItemDescCont} onPress={() => setSelectedStock(item)}>
                                            <Text style={styles.StockListDescText}>{item.Description}</Text>
                                        </TouchableOpacity>

                                        <View style={styles.QtyAvlQtyCont}>
                                            <View style={[styles.QtyCont, { backgroundColor: '#ECF0F9', marginRight: 16 }]}>
                                                <Text style={styles.QtyText}>Qty.</Text>
                                                <Text style={styles.QtyText}>{item.Qty}</Text>
                                            </View>
                                            <View style={[styles.QtyCont, { backgroundColor: '#FDEDD6' }]}>
                                                <Text style={styles.AvlText}>Avl. Qty.</Text>
                                                <Text style={styles.AvlText}>{item.AvlQty}</Text>
                                            </View>
                                        </View>

                                        {
                                            expandedItems.includes(item.Code) && (
                                                <View style={styles.DynamicPriceView}>
                                                    <View style={styles.PriceTag}>
                                                        <Text style={styles.StockListCodeText}>Price</Text>
                                                        <Text style={styles.PriceValueText}>{item.price}</Text>
                                                    </View>
                                                    <View style={styles.PriceTag}>
                                                        <Text style={styles.StockListCodeText}>Credit Price</Text>
                                                        <Text style={styles.PriceValueText}>{item['Credit Price']}</Text>
                                                    </View>
                                                    <View style={styles.PriceTag}>
                                                        <Text style={styles.StockListCodeText}>Order Pend.</Text>
                                                        <Text style={styles.PriceValueText}>{item.Ord_pend}</Text>
                                                    </View>
                                                </View>
                                            )
                                        } */}

                    <View style={styles.CustomerListCont}>
                      <View style={styles.CustomerImgWrap}>
                        <Image
                          style={styles.CustomerImage}
                          source={require('../images/stockList.png')}
                        />
                      </View>

                      <View style={styles.CustomerListMid}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}>
                          <Text
                            style={[styles.StockListDescText, {width: '75%'}]}>
                            {item.Description}
                          </Text>
                          <Text
                            style={[
                              styles.StockListDescTextSmall,
                              {color: '#30B3A4', fontFamily: 'Lexend-Regular'},
                            ]}>
                            {item.Qty}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            width: '100%',
                            paddingVertical: 6,
                          }}>
                          <Text style={styles.StockListDescTextSmall}>
                            {item.Code ? item.Code : item.code}
                          </Text>
                          <TouchableOpacity
                            style={[styles.PlusMinusCont, {marginLeft: 'auto'}]}
                            onPress={() =>
                              toggleExpand(
                                item.Code ? item.Code : item.code,
                                item.OEM,
                              )
                            }>
                            {expandedItems.includes(
                              item.Code ? item.Code : item.code,
                            ) ? (
                              <Image
                                style={styles.PlusMinusImg}
                                source={require('../images/chkMinus.png')}
                              />
                            ) : (
                              <Image
                                style={styles.PlusMinusImg}
                                source={require('../images/chkPlus.png')}
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* {console.log("item.Code ? item.Code : item.code-->>", item.Code ? item.Code : item.code)}
                                        {
                                            console.log("image_url", `http://popbr2.dyndns.org:86/` + item.Code + `.png`)
                                        } */}

                    {expandedItems.includes(
                      item.Code ? item.Code : item.code,
                    ) && (
                      <View style={styles.DynamicPriceView}>
                        <View
                          style={{
                            flexDirection: 'column',
                            width: 'auto',
                          }}>
                          {cmpcode?.trim().toUpperCase() == 'POPULAR' && (
                            <Image
                              style={{width: 100, height: 100, margin: 10}}
                              source={{
                                uri:
                                  `http://popbr2.dyndns.org:86/` +
                                  item.Code +
                                  `.png`,
                              }}
                            />
                          )}

                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>
                              Cash Price
                            </Text>
                            <Text style={styles.PriceValueText}>
                              {formatPrice3Decimal(item.price)}
                            </Text>
                          </View>
                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>
                              Credit Price
                            </Text>
                            <Text style={styles.PriceValueText}>
                              {formatPrice3Decimal(item['Credit Price'])}
                            </Text>
                          </View>
                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>
                              Block Price
                            </Text>
                            <Text style={styles.PriceValueText}>
                              {formatPrice3Decimal(item['Block Price'])}
                            </Text>
                          </View>
                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>
                              Order Pend .
                            </Text>
                            <Text style={styles.PriceValueText}>
                              {item.Ord_pend}
                            </Text>
                          </View>
                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>BIN.</Text>
                            <Text style={styles.PriceValueText}>
                              {item.BIN}
                            </Text>
                          </View>
                          {cmpcode?.trim().toUpperCase() !== 'STARLINK' && (
                            <View style={styles.PriceTag}>
                              <Text style={styles.StockListCodeText}>
                                Discount Price
                              </Text>
                              <Text style={styles.PriceValueText}>
                                {formatPrice3Decimal(item.Discount_Price)}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.TabCont}>
                          <TouchableOpacity
                            style={[
                              styles.ActionButtons,
                              selectedButton === 'Substitute' &&
                                styles.SelectedButton,
                            ]}
                            onPress={() => handlePress('Substitute')}>
                            <Text
                              style={[
                                styles.StockListCodeText,
                                {color: 'black'},
                              ]}>
                              Substitute
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.ActionButtons,
                              selectedButton === 'Model' &&
                                styles.SelectedButton,
                            ]}
                            onPress={() => handlePress('Model')}>
                            <Text
                              style={[
                                styles.StockListCodeText,
                                {color: 'black'},
                              ]}>
                              Model Number
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {selectedButton === 'Substitute' && (
                          <View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                              <Text
                                style={[
                                  styles.headerCell,
                                  {
                                    borderTopLeftRadius: 4,
                                    fontFamily: 'Lexend-Light',
                                    width: '50%',
                                  },
                                ]}>
                                Substitute List
                              </Text>
                              <Text
                                style={[
                                  styles.headerCell,
                                  {
                                    width: '20%',
                                    fontFamily: 'Lexend-Light',
                                  },
                                ]}>
                                Qty
                              </Text>
                              <Text
                                style={[
                                  styles.headerCell,
                                  {
                                    borderTopRightRadius: 4,
                                    fontFamily: 'Lexend-Light',
                                    width: '30%',
                                  },
                                ]}>
                                Price
                              </Text>
                            </View>

                            {subLoader && <ActivityIndicator />}

                            <ScrollView
                              style={[
                                styles.ScrollView,
                                {minHeight: 'auto', maxHeight: 200},
                              ]}
                              nestedScrollEnabled={true}>
                              {substituteData &&
                                substituteData.length > 0 &&
                                substituteData.map((item, index) => (
                                  <>
                                    <View style={styles.tableRow} key={index}>
                                      <Text
                                        style={[
                                          styles.dataCell,
                                          {
                                            fontFamily: 'Lexend-Light',
                                            width: '50%',
                                          },
                                        ]}>
                                        {item.Part_No}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.dataCell,
                                          {
                                            fontFamily: 'Lexend-Light',
                                            width: '20%',
                                          },
                                        ]}>
                                        {item.Balance}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.dataCell,
                                          {
                                            fontFamily: 'Lexend-Light',
                                            width: '30%',
                                          },
                                        ]}>
                                        {formatPrice3Decimal(
                                          item['Sales price'],
                                        )}
                                      </Text>
                                    </View>
                                  </>
                                ))}

                              {substituteData &&
                                substituteData.length === 0 && (
                                  <View style={styles.tableRow} key={index}>
                                    <Text
                                      style={[
                                        styles.dataCell,
                                        {
                                          fontFamily: 'Lexend-Light',
                                          width: '100%',
                                          color: 'red',
                                        },
                                      ]}>
                                      No Data Available
                                    </Text>
                                  </View>
                                )}
                            </ScrollView>
                          </View>
                        )}

                        {selectedButton === 'Model' && (
                          <View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                              <Text
                                style={[
                                  styles.headerCell,
                                  {
                                    borderTopLeftRadius: 4,
                                    fontFamily: 'Lexend-Light',
                                    width: '100%',
                                  },
                                ]}>
                                Model Number
                              </Text>
                            </View>

                            {modalLoader && <ActivityIndicator />}

                            <ScrollView
                              style={[
                                styles.ScrollView,
                                {minHeight: 'auto', maxHeight: 200},
                              ]}
                              nestedScrollEnabled={true}>
                              {modalNumberData &&
                                modalNumberData.length > 0 &&
                                modalNumberData.map((item, index) => (
                                  <>
                                    <View
                                      style={[
                                        styles.tableRow,
                                        {justifyContent: 'center'},
                                      ]}
                                      key={index}>
                                      <Text
                                        style={[
                                          styles.dataCell,
                                          {
                                            fontFamily: 'Lexend-Light',
                                            width: '100%',
                                            textAlign: 'middle',
                                          },
                                        ]}>
                                        {item.Model_Number}
                                      </Text>
                                    </View>
                                  </>
                                ))}

                              {modalNumberData &&
                                modalNumberData.length === 0 && (
                                  <View style={styles.tableRow} key={index}>
                                    <Text
                                      style={[
                                        styles.dataCell,
                                        {
                                          fontFamily: 'Lexend-Light',
                                          width: '100%',
                                          color: 'red',
                                        },
                                      ]}>
                                      No Data Available
                                    </Text>
                                  </View>
                                )}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
            </ScrollView>
          </>
        )}

        {!stockData && !selectedStock && !searchItem && top50Items && (
          <>
            {/* <View style={{ marginHorizontal: 12, marginVertical: 12, justifyContent: 'flex-start' }}>
                            <Text style={styles.StockLabel}>Top 50 Items</Text>
                        </View> */}

            {/* <View View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                                <Text style={[styles.headerCell, {
                                    borderTopLeftRadius: 4
                                }]}>
                                    Code
                                </Text>
                                <Text style={[styles.headerCell, {
                                    borderTopRightRadius: 4
                                }]}>Description</Text>
                            </View>

                            <ScrollView style={styles.ScrollView}>
                                {
                                    top50Items && top50Items.length > 0 && top50Items.map((item, index) => (
                                        <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedStock(item)}>
                                            <Text style={styles.dataCell}>{item.Code}</Text>
                                            <Text style={styles.dataCell}>{item.Description}</Text>
                                        </TouchableOpacity>

                                    ))
                                }
                            </ScrollView>

                            {
                                top50Items === null &&

                                <ActivityIndicator />
                            }

                            {
                                top50Items && top50Items.length === 0 &&
                                <View>
                                    <Text style={{
                                        color: 'red',
                                        fontFamily: 'Lexend-Bold',
                                    }}>No data available</Text>
                                </View>
                            }

                        </View> */}

            <ScrollView
              contentContainerStyle={[styles.CheckStockListView]}
              keyboardShouldPersistTaps="always">
              {top50Items &&
                top50Items.length > 0 &&
                top50Items.map((item, index) => (
                  <View style={styles.StockListItem} key={index}>
                    {/* <View style={styles.StockItemListHead}>
                                            <Text style={styles.StockListCodeText}>{item.Code}</Text>
                                            <TouchableOpacity style={styles.PlusMinusCont} onPress={() => toggleExpand(item.Code)}>
                                                {
                                                    expandedItems.includes(item.Code) ?
                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                        :
                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                }
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity style={styles.StockItemDescCont} onPress={() => setSelectedStock(item)}>
                                            <Text style={styles.StockListDescText}>{item.Description}</Text>
                                        </TouchableOpacity>

                                        <View style={styles.QtyAvlQtyCont}>
                                            <View style={[styles.QtyCont, { backgroundColor: '#ECF0F9', marginRight: 16 }]}>
                                                <Text style={styles.QtyText}>Qty.</Text>
                                                <Text style={styles.QtyText}>{item.Qty}</Text>
                                            </View>
                                            <View style={[styles.QtyCont, { backgroundColor: '#FDEDD6' }]}>
                                                <Text style={styles.AvlText}>Avl. Qty.</Text>
                                                <Text style={styles.AvlText}>{item.AvlQty}</Text>
                                            </View>
                                        </View> */}

                    <View style={styles.CustomerListCont}>
                      <View style={styles.CustomerImgWrap}>
                        <Image
                          style={styles.CustomerImage}
                          source={require('../images/stockList.png')}
                        />
                      </View>

                      <View style={styles.CustomerListMid}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}>
                          <Text
                            style={[styles.StockListDescText, {width: '75%'}]}>
                            {item.Description}
                          </Text>
                          <Text
                            style={[
                              styles.StockListDescTextSmall,
                              {color: '#30B3A4', fontFamily: 'Lexend-Regular'},
                            ]}>
                            {item.Qty}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            width: '100%',
                            paddingVertical: 6,
                          }}>
                          <Text style={styles.StockListDescTextSmall}>
                            {item.Code ? item.Code : item.code}
                          </Text>
                          <TouchableOpacity
                            style={[styles.PlusMinusCont, {marginLeft: 'auto'}]}
                            onPress={() =>
                              toggleExpand(
                                item.Code ? item.Code : item.code,
                                item.OEM,
                              )
                            }>
                            {expandedItems.includes(item.Code) ? (
                              <Image
                                style={styles.PlusMinusImg}
                                source={require('../images/chkMinus.png')}
                              />
                            ) : (
                              <Image
                                style={styles.PlusMinusImg}
                                source={require('../images/chkPlus.png')}
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {expandedItems.includes(
                      item.Code ? item.Code : item.code,
                    ) && (
                      <View style={styles.DynamicPriceView}>
                        <View
                          style={{
                            flexDirection: 'column',
                            width: 'auto',
                          }}>
                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>
                              Cash Price
                            </Text>
                            <Text style={styles.PriceValueText}>
                              {formatPrice3Decimal(item.price)}
                            </Text>
                          </View>
                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>
                              Credit Price
                            </Text>
                            <Text style={styles.PriceValueText}>
                              {formatPrice3Decimal(item['Credit Price'])}
                            </Text>
                          </View>

                          {cmpcode?.trim().toUpperCase() != 'SOCA' ? (
                            <View style={styles.PriceTag}>
                              <Text style={styles.StockListCodeText}>
                                Block Price
                              </Text>
                              <Text style={styles.PriceValueText}>
                                {formatPrice3Decimal(item['Block Price'])}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.PriceTag}>
                              <Text style={styles.StockListCodeText}>
                                Special Price
                              </Text>
                              <Text style={styles.PriceValueText}>
                                {formatPrice3Decimal(item['Spcial Price'])}
                              </Text>
                            </View>
                          )}

                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>
                              Order Pend.
                            </Text>
                            <Text style={styles.PriceValueText}>
                              {item.Ord_pend}
                            </Text>
                          </View>
                          <View style={styles.PriceTag}>
                            <Text style={styles.StockListCodeText}>BIN.</Text>
                            <Text style={styles.PriceValueText}>
                              {item.BIN}
                            </Text>
                          </View>
                          {cmpcode?.trim().toUpperCase() !== 'SOCA' &&
                            cmpcode?.trim().toUpperCase() !== 'STARLINK' && (
                              <View style={styles.PriceTag}>
                                <Text style={styles.StockListCodeText}>
                                  Discount Price
                                </Text>
                                <Text style={styles.PriceValueText}>
                                  {formatPrice3Decimal(item.Discount_Price)}
                                </Text>
                              </View>
                            )}
                        </View>

                        <View style={styles.TabCont}>
                          <TouchableOpacity
                            style={[
                              styles.ActionButtons,
                              selectedButton === 'Substitute' &&
                                styles.SelectedButton,
                            ]}
                            onPress={() => handlePress('Substitute')}>
                            <Text
                              style={[
                                styles.StockListCodeText,
                                {color: 'black'},
                              ]}>
                              Substitute
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.ActionButtons,
                              selectedButton === 'Model' &&
                                styles.SelectedButton,
                            ]}
                            onPress={() => handlePress('Model')}>
                            <Text
                              style={[
                                styles.StockListCodeText,
                                {color: 'black'},
                              ]}>
                              Model Number
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {selectedButton === 'Substitute' && (
                          <View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                              <Text
                                style={[
                                  styles.headerCell,
                                  {
                                    borderTopLeftRadius: 4,
                                    fontFamily: 'Lexend-Light',
                                    width: '50%',
                                  },
                                ]}>
                                Substitute List
                              </Text>
                              <Text
                                style={[
                                  styles.headerCell,
                                  {
                                    width: '20%',
                                    fontFamily: 'Lexend-Light',
                                  },
                                ]}>
                                Qty
                              </Text>
                              <Text
                                style={[
                                  styles.headerCell,
                                  {
                                    borderTopRightRadius: 4,
                                    fontFamily: 'Lexend-Light',
                                    width: '30%',
                                  },
                                ]}>
                                Price
                              </Text>
                            </View>

                            {subLoader && <ActivityIndicator />}

                            <ScrollView
                              style={[
                                styles.ScrollView,
                                {minHeight: 'auto', maxHeight: 200},
                              ]}
                              nestedScrollEnabled={true}>
                              {substituteData &&
                                substituteData.length > 0 &&
                                substituteData.map((item, index) => (
                                  <>
                                    <View style={styles.tableRow} key={index}>
                                      <Text
                                        style={[
                                          styles.dataCell,
                                          {
                                            fontFamily: 'Lexend-Light',
                                            width: '50%',
                                          },
                                        ]}>
                                        {item.Part_No}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.dataCell,
                                          {
                                            fontFamily: 'Lexend-Light',
                                            width: '20%',
                                          },
                                        ]}>
                                        {item.Balance}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.dataCell,
                                          {
                                            fontFamily: 'Lexend-Light',
                                            width: '30%',
                                          },
                                        ]}>
                                        {formatPrice3Decimal(
                                          item['Sales price'],
                                        )}
                                      </Text>
                                    </View>
                                  </>
                                ))}

                              {substituteData &&
                                substituteData.length === 0 && (
                                  <View style={styles.tableRow} key={index}>
                                    <Text
                                      style={[
                                        styles.dataCell,
                                        {
                                          fontFamily: 'Lexend-Light',
                                          width: '100%',
                                          color: 'red',
                                        },
                                      ]}>
                                      No Data Available
                                    </Text>
                                  </View>
                                )}
                            </ScrollView>
                          </View>
                        )}

                        {selectedButton === 'Model' && (
                          <View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                              <Text
                                style={[
                                  styles.headerCell,
                                  {
                                    borderTopLeftRadius: 4,
                                    fontFamily: 'Lexend-Light',
                                    width: '100%',
                                  },
                                ]}>
                                Model Number
                              </Text>
                            </View>

                            {modalLoader && <ActivityIndicator />}

                            <ScrollView
                              style={[
                                styles.ScrollView,
                                {minHeight: 'auto', maxHeight: 200},
                              ]}
                              nestedScrollEnabled={true}>
                              {modalNumberData &&
                                modalNumberData.length > 0 &&
                                modalNumberData.map((item, index) => (
                                  <>
                                    <View
                                      style={[
                                        styles.tableRow,
                                        {justifyContent: 'center'},
                                      ]}
                                      key={index}>
                                      <Text
                                        style={[
                                          styles.dataCell,
                                          {
                                            fontFamily: 'Lexend-Light',
                                            width: '100%',
                                            textAlign: 'middle',
                                          },
                                        ]}>
                                        {item.Model_Number}
                                      </Text>
                                    </View>
                                  </>
                                ))}

                              {modalNumberData &&
                                modalNumberData.length === 0 && (
                                  <View style={styles.tableRow} key={index}>
                                    <Text
                                      style={[
                                        styles.dataCell,
                                        {
                                          fontFamily: 'Lexend-Light',
                                          width: '100%',
                                          color: 'red',
                                        },
                                      ]}>
                                      No Data Available
                                    </Text>
                                  </View>
                                )}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
            </ScrollView>
          </>
        )}

        {selectedStock && (
          <>
            <ScrollView contentContainerStyle={styles.MainScroll}>
              <View style={styles.StockDescWrap}>
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Code</Text>
                  <Text style={styles.StockTextValue}>
                    {selectedStock.Code}
                  </Text>
                </View>
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Description</Text>
                  <Text style={styles.StockTextValue}>
                    {selectedStock.Description}
                  </Text>
                </View>
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Price</Text>
                  <Text style={styles.StockTextValue}>
                    {selectedStock.price}
                  </Text>
                </View>
                {/* <View style={styles.StockItem}>
                                    <Text style={styles.StockLabel}>Credit Price</Text>
                                    <Text style={styles.StockTextValue}>{selectedStock['Credit Price']}</Text>
                                </View> */}
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Quantity</Text>
                  <Text style={styles.StockTextValue}>{selectedStock.Qty}</Text>
                </View>
                {/* <View style={styles.StockItem}>
                                    <Text style={styles.StockLabel}>Order Pending</Text>
                                    <Text style={styles.StockTextValue}>{selectedStock.Ord_pend}</Text>
                                </View> */}
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Avl. Qty.</Text>
                  <Text style={styles.StockTextValue}>
                    {selectedStock.AvlQty}
                  </Text>
                </View>
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Vehicle</Text>
                  <Text style={styles.StockTextValue}>
                    {selectedStock.Vehicle}
                  </Text>
                </View>
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Brand</Text>
                  <Text style={styles.StockTextValue}>
                    {selectedStock.Brand}
                  </Text>
                </View>
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Category</Text>
                  <Text style={styles.StockTextValue}>
                    {selectedStock.Category}
                  </Text>
                </View>
                <View style={styles.StockItem}>
                  <Text style={styles.StockLabel}>Sub Category</Text>
                  <Text style={styles.StockTextValue}>
                    {selectedStock['Sub Category']}
                  </Text>
                </View>
              </View>

              <View style={styles.TabWrap}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    selectedTab === 'MODAL' && styles.selectedTab,
                  ]}
                  onPress={() => setSelectedTab('MODAL')}>
                  <Text style={styles.tabText}>Model Number</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    selectedTab === 'SUBSTITUTE' && styles.selectedTab,
                  ]}
                  onPress={() => setSelectedTab('SUBSTITUTE')}>
                  <Text style={styles.tabText}>Substitute</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                {selectedTab === 'MODAL' ? (
                  <>
                    {modalLoader && (
                      <View>
                        <ActivityIndicator />
                      </View>
                    )}

                    {modalNumberData &&
                      modalNumberData.length === 0 &&
                      !modalLoader && (
                        <View>
                          <Text
                            style={{
                              color: 'red',
                              fontFamily: 'Lexend-Regular',
                              fontSize: 16,
                            }}>
                            No data available
                          </Text>
                        </View>
                      )}

                    <View style={styles.ModalCont}>
                      <ScrollView
                        nestedScrollEnabled={true}
                        style={{
                          width: '100%',
                          maxHeight: 300,
                          marginBottom: 24,
                        }}>
                        {modalNumberData &&
                          modalNumberData.length > 0 &&
                          modalNumberData.map((item, index) => (
                            <View style={styles.ModaltableRow} key={index}>
                              <Text style={styles.ModalDatacell}>
                                {item.Model_Number}
                              </Text>
                              {/* <Text style={styles.dataCell}>{item.Description}</Text> */}
                            </View>
                          ))}
                      </ScrollView>
                    </View>
                  </>
                ) : (
                  <View
                    style={{
                      marginTop: 8,
                      maxHeight: 400,
                      marginBottom: 16,
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 2},
                      shadowOpacity: 0.25,
                      shadowRadius: 3,
                      elevation: 5,
                      flex: 1,
                    }}>
                    <>
                      {substituteData && substituteData.length > 0 && (
                        <ScrollView horizontal={true}>
                          <View style={styles.SubTableContainer}>
                            <View style={styles.SubtableRow}>
                              <Text
                                style={[
                                  styles.SubheaderCell,
                                  {borderTopLeftRadius: 4},
                                ]}>
                                PartNo
                              </Text>
                              <Text style={styles.SubheaderCell}>Brand</Text>
                              <Text style={styles.SubheaderCell}>Vehicle</Text>
                              <Text style={styles.SubheaderCell}>
                                Description
                              </Text>
                              <Text style={styles.SubheaderCell}>Balance</Text>
                              <Text
                                style={[
                                  styles.SubheaderCell,
                                  {borderTopRightRadius: 4},
                                ]}>
                                Sales Price
                              </Text>
                            </View>

                            <ScrollView nestedScrollEnabled={true}>
                              {/* <View style={styles.SubtableRow}>
                                                                <Text style={[styles.SubheaderCell, { borderTopLeftRadius: 4 }]}>PartNo</Text>
                                                                <Text style={styles.SubheaderCell}>Brand</Text>
                                                                <Text style={styles.SubheaderCell}>Vehicle</Text>
                                                                <Text style={styles.SubheaderCell}>Description</Text>
                                                                <Text style={styles.SubheaderCell}>Balance</Text>
                                                                <Text style={[styles.SubheaderCell, { borderTopRightRadius: 4 }]}>Sales Price</Text>
                                                            </View> */}
                              <FlatList
                                data={substituteData}
                                keyExtractor={(item, index) => index.toString()}
                                contentContainerStyle={{paddingBottom: 50}}
                                renderItem={({item}) => (
                                  <>
                                    <View style={styles.SubtableRow}>
                                      <Text style={styles.SubdataCell}>
                                        {item.Part_No}
                                      </Text>
                                      <Text style={styles.SubdataCell}>
                                        {item.Brand}
                                      </Text>
                                      <Text style={styles.SubdataCell}>
                                        {item.Vehicle}
                                      </Text>
                                      <Text style={styles.SubdataCell}>
                                        {item.Description}
                                      </Text>
                                      <Text style={styles.SubdataCell}>
                                        {item.Balance}
                                      </Text>
                                      <Text style={styles.SubdataCell}>
                                        {item['Sales price']}
                                      </Text>
                                    </View>
                                    {/* <View style={styles.SubtableRow}>
                                                                            <Text style={styles.SubdataCell}>{item.Part_No}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Brand}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Vehicle}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Description}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Balance}</Text>
                                                                            <Text style={styles.SubdataCell}>{item['Sales price']}</Text>
                                                                        </View>
                                                                        <View style={styles.SubtableRow}>
                                                                            <Text style={styles.SubdataCell}>{item.Part_No}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Brand}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Vehicle}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Description}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Balance}</Text>
                                                                            <Text style={styles.SubdataCell}>{item['Sales price']}</Text>
                                                                        </View>
                                                                        <View style={styles.SubtableRow}>
                                                                            <Text style={styles.SubdataCell}>{item.Part_No}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Brand}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Vehicle}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Description}</Text>
                                                                            <Text style={styles.SubdataCell}>{item.Balance}</Text>
                                                                            <Text style={styles.SubdataCell}>{item['Sales price']}</Text>
                                                                        </View> */}
                                  </>
                                )}
                                ListEmptyComponent={
                                  <View>
                                    <Text style={{color: 'red'}}>
                                      No data available
                                    </Text>
                                  </View>
                                }
                              />
                            </ScrollView>
                          </View>
                        </ScrollView>
                      )}

                      {substituteData &&
                        substituteData.length === 0 &&
                        !subLoader && (
                          <View>
                            <Text
                              style={{
                                color: 'red',
                                fontFamily: 'Lexend-Regular',
                                fontSize: 16,
                              }}>
                              No data available
                            </Text>
                          </View>
                        )}

                      {subLoader && (
                        <View>
                          <ActivityIndicator />
                        </View>
                      )}
                    </>
                  </View>
                )}
              </View>
            </ScrollView>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  HomeWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
  },
  HomeCont: {
    width: '98%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 8,
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
    justifyContent: 'space-between',
    backgroundColor: '#1A6CF6',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  HomeText: {
    fontSize: 18,
    color: 'white',
    // borderBottomColor: 'gold',
    // borderBottomWidth: 2,
    marginTop: 6,
    marginLeft: 12,
    paddingBottom: 8,
    fontFamily: 'Lexend-Bold',
  },
  InputCont: {
    width: '95%',
    backgroundColor: '#c7e2de',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  InputImageCont: {
    // backgroundColor: '#EAEDF5',
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
    width: '100%',
    fontFamily: 'Lexend-Bold',
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
    // backgroundColor: '#5A55CA',
    backgroundColor: 'white',
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    flexWrap: 'nowrap',
    width: '50%',
    color: '#3A80EA',
    fontFamily: 'Lexend-Bold',
  },
  dataCell: {
    // flex: 1,
    // backgroundColor: '#F3F3F3',
    backgroundColor: 'white',
    padding: 10,
    textAlign: 'center',
    width: '50%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#dbdbdb',
    color: '#3A80EA',
    fontFamily: 'Lexend-Regular',
  },
  ScrollView: {
    height: Dimensions.get('window').height - 300,
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
  TextNameDesc: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  TextNameDescValue: {
    fontSize: 15,
    fontFamily: 'Lexend-Bold',
    color: 'black',
    marginLeft: 12,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  StockValueWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '95%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  PriceCard: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    marginVertical: 8,
  },
  PriceText: {
    color: '#189A2E',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  PriceValue: {
    backgroundColor: '#189A2E',
    color: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
  },
  HeadIcon: {
    width: 25,
    height: 25,
  },

  HeadSettIcon: {
    width: 30,
    height: 30,
  },

  PlaceHolderInput: {
    width: '100%',
    fontFamily: 'Lexend-Light',
    color: '#2b2b2b',
  },
  TableHeadSpan: {
    backgroundColor: '#D9D9D9',
    padding: 12,
  },

  StockDescWrap: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 8,
    backgroundColor: 'white',
    padding: 18,
  },
  StockItem: {
    padding: 4,
    marginBottom: 2,
  },
  StockLabel: {
    fontFamily: 'Lexend-Regular',
    color: '#2B2B2B',
    fontSize: 16,
  },
  StockTextValue: {
    fontFamily: 'Lexend-Bold',
    color: 'black',
    fontSize: 16,
  },

  TabWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '94%',
    backgroundColor: 'white',
    marginTop: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue', // Change this color as per your design
  },
  tabText: {
    fontFamily: 'Lexend-Regular',
    color: '#3A80EA',
    fontSize: 16,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  ModalCont: {
    width: '94%',
    flexDirection: 'column',
  },
  ModaltableRow: {
    flexDirection: 'row',
    width: '100%',
    // justifyContent: 'space-between',
    // marginBottom: 5,
    // paddingVertical: 5,
  },

  ModalDatacell: {
    backgroundColor: 'white',
    padding: 10,
    textAlign: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#dbdbdb',
    color: '#3A80EA',
    fontFamily: 'Lexend-Regular',
  },

  MainScroll: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  SubTableContainer: {
    width: '100%',
    // padding: 10,
    marginTop: 8,
    alignItems: 'center',
    // paddingBottom: 50,
    // height: 500,
    flex: 1,
  },
  SubtableRow: {
    flexDirection: 'row',
    width: '100%',
    // justifyContent: 'space-between',
    // marginBottom: 5,
    // paddingVertical: 5,
  },
  SubheaderCell: {
    // flex: 1,
    backgroundColor: '#5A55CA',
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    flexWrap: 'nowrap',
    width: '16.5%',
    color: 'white',
    fontFamily: 'Lexend-Bold',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#dbdbdb',
    width: 150,
  },
  SubdataCell: {
    // flex: 1,
    // backgroundColor: '#F3F3F3',
    backgroundColor: 'white',
    padding: 10,
    textAlign: 'center',
    width: '16.5%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#dbdbdb',
    color: 'black',
    fontFamily: 'Lexend-Regular',
    width: 150,
  },

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
  DynamicPriceView: {
    flexDirection: 'column',
    // justifyContent: 'space-between'
  },
  PriceTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

  TableContainer: {
    width: '100%',
    // padding: 10,
    // marginTop: 8,
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
    backgroundColor: '#D0D0D0',
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    flexWrap: 'nowrap',
    // width: '33%',
    color: '#2b2b2b',
    fontFamily: 'Lexend-Bold',
    // borderTopWidth: 1,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    // borderColor: '#dbdbdb',
  },
  dataCell: {
    // flex: 1,
    // backgroundColor: '#F3F3F3',
    backgroundColor: 'white',
    padding: 10,
    textAlign: 'center',
    // width: '33%',
    // borderTopWidth: 1,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    // borderColor: '#dbdbdb',
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  ScrollView: {
    // height: Dimensions.get('window').height - 300,
    marginBottom: 8,
  },

  NewInputStyle: {
    width: '100%',
    fontFamily: 'Lexend-Light',
    color: '#2B2B2B',
    height: 35,
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
  },

  TabCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 6,
  },
  SubstitueTab: {},
  ModelTab: {},

  ActionButtons: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: 'white',
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#EFEFEF',
  },
  SelectedButton: {
    borderBottomColor: 'green',
    borderBottomWidth: 4,
  },
  ButtonText: {
    fontSize: 13,
    color: '#2B2B2B',
    color: 'black',
    fontFamily: 'Lexend-Bold',
  },
});

export default CheckStock;
