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
  Keyboard,
  Button,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from './Header';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import HeaderUiNew from './HeaderUiNew';
import StatementPop from '../popups/StatementPop';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OutstandingPop from '../popups/OutstandingPop';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddNewCustomer from './AddCustomer';

const CustomerDetails = () => {
  const [salesManKey, setSalesManKey] = useState(null);
  const [salesName, setSalseName] = useState('');

  const navigation = useNavigation();

  // const searchUrl = 'https://cubixweberp.com:203/api/Search_Customer/Cust/'

  const searchUrl =
    'https://cubixweberp.com:208/api/Search_Customer/automax/Cust/';

  const [searchItem, setSearchItem] = useState('');

  const [stockData, setStockData] = useState(null);

  const [selectedStock, setSelectedStock] = useState(null);

  const [showActivity, setShowActivity] = useState(false);

  const [top50Customers, setTop50Customers] = useState(null);

  const [showStatementPop, setShowStatementPop] = useState(false);

  const [showOutstandingPop, setShowOutstandingPop] = useState(false);

  const [privateKey, setPrivateKey] = useState('');

  const [accountNo, setAccountNo] = useState('');

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [expandedItems, setExpandedItems] = useState([]);

  const [deptNo, setDeptNo] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  const fetchAppUrl = async () => {
    const appUrl = await AsyncStorage.getItem('appUrl');

    const deptNo = await AsyncStorage.getItem('DEPTNO');

    const salesName = await AsyncStorage.getItem('salesman_name');

    const sman_key = await AsyncStorage.getItem('Smankey');

    console.log('sman_key in customer details', sman_key);

    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    if (parsedUserDataArray) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim());
    }
    if (appUrl) {
      setAppUrl(appUrl);
    }

    if (deptNo) {
      setDeptNo(deptNo);
    }

    if (salesName) {
      setSalseName(salesName);
    }

    if (sman_key) {
      setSalesManKey(sman_key);
    }
  };

  const fetchAsyncUserDataArray = async () => {
    try {
      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsedUserDataArray =
        (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];
      console.log('parsedUserDataArray', parsedUserDataArray);

      if (parsedUserDataArray.length > 0) {
        setPrivateKey(parsedUserDataArray[0].privatek);
      }
    } catch (error) {
      console.log('fetchAsyncUserDataArrayError', error);
    }
  };

  const searchStock = async value => {
    setShowActivity(true);
    try {
      console.log(
        'SEARCH_CUSTOMER_LINK',
        `${appUrl}Search_Customer/${cmpcode}/Cust/${value}/${deptNo}`,
      );
      await axios
        .get(`${appUrl}Search_Customer/${cmpcode}/Cust/${value}/${deptNo}`)
        .then(res => {
          if (cmpcode?.trim().toUpperCase() === 'SOCA') {
            let filteredArrayBasedOnSalesman = res.data.filter(item => {
              return (
                item.sale_man?.trim().toUpperCase() ===
                salesName.trim().toUpperCase()
              );
            });

            console.log(
              'filteredArrayBasedOnSalesman>>',
              filteredArrayBasedOnSalesman,
              salesName.trim().toUpperCase(),
            );

            setStockData(filteredArrayBasedOnSalesman);
          } else {
            setStockData(res.data);
          }
        });
      setShowActivity(false);
    } catch (error) {
      console.log('searchCustomererror', error);
      setShowActivity(false);
    }
  };

  const fetchTop50Customers = async () => {
    setShowActivity(true);
    try {
      const response = await axios.get(
        `${appUrl}Search_Customer/${cmpcode}/Cust50/-/${deptNo}`,
      );

      console.log('fetchTop50Customers>>', response.data);

      if (cmpcode?.trim().toUpperCase() === 'SOCA') {
        let filteredArrayBasedOnSalesman = response.data.filter(item => {
          return (
            item.sale_man?.trim().toUpperCase() ===
            salesName.trim().toUpperCase()
          );
        });
        console.log(
          'filteredArrayBasedOnSalesman',
          filteredArrayBasedOnSalesman,
        );
        setTop50Customers(filteredArrayBasedOnSalesman);

        console.log(
          'filteredArrayBasedOnSalesman>>',
          filteredArrayBasedOnSalesman,
          salesName.trim().toUpperCase(),
        );
      } else {
        setTop50Customers(response.data);
      }

      setShowActivity(false);
    } catch (error) {
      console.log('fetchTop50CustomersError', error);
      setShowActivity(false);
    }
  };

  const toggleExpand = account => {
    Keyboard.dismiss();
    setExpandedItems(prevState => {
      if (prevState.includes(account)) {
        return prevState.filter(itemCode => itemCode !== account);
      } else {
        // return [...prevState, account];
        return [account];
      }
    });
  };

  const statementClick = item => {
    setSelectedStock(item);
    setShowStatementPop(true);
  };

  const outStandingClick = item => {
    setSelectedStock(item);
    setShowOutstandingPop(true);
  };

  useEffect(() => {
    if (appUrl && cmpcode && deptNo && salesName) {
      fetchTop50Customers();
    }
  }, [appUrl, cmpcode, deptNo, salesName]);

  useEffect(() => {
    if (searchItem !== '') {
      searchStock(searchItem);
      setSelectedStock(null);
    }
    if (searchItem == '') {
      setStockData(null);
      setSelectedStock(null);
    }
  }, [searchItem]);

  useEffect(() => {
    if (selectedStock) {
      setAccountNo(selectedStock.account);
    }
  }, [selectedStock]);

  useEffect(() => {
    fetchAsyncUserDataArray();
    fetchAppUrl();
  }, []);

  console.log('top50Customers', top50Customers && top50Customers[0]);
  // console.log('searchItem', searchItem)
  // console.log('stockData', stockData)
  // console.log('selectedStock', selectedStock)
  // console.log('accountNo', accountNo)
  // console.log('expandedItems', expandedItems)

  return (
    <>
      <View style={styles.HomeWrap}>
        <HeaderUiNew name={'Customer Details'} />

        <View style={styles.HomeCont}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 12,
            }}>
            {/* Search Input */}
            <View style={[styles.TANDCInpCont, {flex: 1, marginTop: 0}]}>
              <TextInput
                style={styles.PlaceHolderInput}
                placeholder="Type name or account no"
                value={searchItem}
                onChangeText={text => setSearchItem(text)}
                placeholderTextColor="#999"
              />
            </View>
            {cmpcode?.trim().toUpperCase() === 'ICUP' && (
              <TouchableOpacity
                style={styles.AddButton}
                onPress={() => setShowAddCustomerModal(true)}>
                <Icon name="person-add" size={18} color="#fff" />

                <Text style={styles.AddButtonText}> New</Text>
              </TouchableOpacity>
            )}
          </View>
          {showActivity && <ActivityIndicator />}

          {stockData && !selectedStock && searchItem !== '' && (
            <>
              {stockData?.length > 0 ? (
                <ScrollView
                  contentContainerStyle={[styles.CheckStockListView]}
                  keyboardShouldPersistTaps="always">
                  {stockData &&
                    stockData.length > 0 &&
                    stockData.map((item, index) => (
                      <View style={styles.StockListItem} key={index}>
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
                              <Text
                                style={[
                                  styles.StockListDescText,
                                  {width: '75%'},
                                ]}>
                                {item.Custname}
                              </Text>
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
                                width: '100%',
                                paddingVertical: 6,
                              }}>
                              <Text style={styles.StockListDescTextSmall}>
                                {item.account}
                              </Text>
                              <View
                                style={{
                                  marginLeft: 24,
                                  flexDirection: 'row',
                                }}>
                                <Text style={[styles.StockListDescTextSmall]}>
                                  C.Limit:
                                </Text>
                                <Text style={[styles.StockListDescTextSmall]}>
                                  {item.Credit_Limit}
                                </Text>
                              </View>
                            </View>

                            <View
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                }}>
                                <Text style={[styles.StockListDescTextSmall]}>
                                  Avail.Bal:{' '}
                                </Text>
                                <Text style={[styles.StockListDescTextSmall]}>
                                  {item.Avai_Bal}
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={[
                                  styles.PlusMinusCont,
                                  {marginLeft: 'auto'},
                                ]}
                                onPress={() => toggleExpand(item.account)}>
                                {expandedItems.includes(item.account) ? (
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

                        {expandedItems.includes(item.account) && (
                          <View style={styles.QtyAvlQtyCont}>
                            <TouchableOpacity
                              style={[
                                styles.QtyCont,
                                {backgroundColor: '#D8D8DA', marginRight: 16},
                              ]}
                              onPress={() => statementClick(item)}>
                              <Text style={styles.QtyText}>Statement</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.QtyCont,
                                {backgroundColor: '#D8D8DA'},
                              ]}
                              onPress={() => outStandingClick(item)}>
                              <Text style={styles.AvlText}>Outstanding</Text>
                            </TouchableOpacity>
                          </View>
                          // <View style={styles.DynamicPriceView}>
                          //     <View style={styles.PriceTag}>
                          //         <Text style={styles.StockListCodeText}>openbal</Text>
                          //         <Text style={styles.PriceValueText}>{item.openbal}</Text>
                          //     </View>
                          //     <View style={styles.PriceTag}>
                          //         <Text style={styles.StockListCodeText}>Credit Price</Text>
                          //         <Text style={styles.PriceValueText}>{item.credit}</Text>
                          //     </View>
                          //     <View style={styles.PriceTag}>
                          //         <Text style={styles.StockListCodeText}>debit</Text>
                          //         <Text style={styles.PriceValueText}>{item.debit}</Text>
                          //     </View>
                          // </View>
                        )}
                      </View>
                    ))}
                </ScrollView>
              ) : (
                <View>
                  <Text style={{marginTop: 10, fontSize: 20}}>
                    No Data found
                  </Text>
                </View>
              )}
            </>
          )}

          {!stockData && !selectedStock && !searchItem && top50Customers && (
            <>
              {/* <View style={{ marginHorizontal: 12, marginVertical: 12 }}>
                                <Text style={styles.StockLabel}>Top 50 Customers</Text>
                            </View> */}
              {/* <View style={styles.TableContainer}>
                                <View style={styles.tableRow}>
                                    <Text
                                        style={[styles.headerCell, {
                                            borderTopLeftRadius: 4
                                        }]}
                                    >
                                        Name
                                    </Text>
                                    <Text style={styles.headerCell}>
                                        Account Number
                                    </Text>
                                    <Text
                                        style={[styles.headerCell, {
                                            borderTopRightRadius: 4
                                        }]}
                                    >
                                        OpenBalance
                                    </Text>
                                </View>

                                <ScrollView style={styles.ScrollView}>
                                    {
                                        top50Customers && top50Customers.length > 0 && top50Customers.slice(0, 25).map((item, index) => (
                                            <TouchableOpacity style={styles.tableRow} key={index} onPress={() => setSelectedStock(item)}>
                                                <Text style={styles.dataCell}>{item.Custname}</Text>
                                                <Text style={styles.dataCell}>{item.account}</Text>
                                                <Text style={styles.dataCell}>{item.openbal}</Text>
                                            </TouchableOpacity>

                                        ))
                                    }
                                </ScrollView>



                                {
                                    top50Customers && top50Customers.length === 0 &&
                                    <View>
                                        <Text style={{
                                            color: 'red'
                                        }}>No data available</Text>
                                    </View>
                                }

                            </View> */}

              {top50Customers?.length > 0 ? (
                <ScrollView
                  contentContainerStyle={[styles.CheckStockListView]}
                  keyboardShouldPersistTaps="always">
                  {top50Customers &&
                    top50Customers.length > 0 &&
                    top50Customers.map((item, index) => (
                      <View style={styles.StockListItem} key={index}>
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
                              <Text
                                style={[
                                  styles.StockListDescText,
                                  {width: '75%'},
                                ]}>
                                {item.Custname}
                              </Text>
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
                                width: '100%',
                                paddingVertical: 6,
                              }}>
                              <Text style={styles.StockListDescTextSmall}>
                                {item.account}
                              </Text>
                              <View
                                style={{
                                  marginLeft: 24,
                                  flexDirection: 'row',
                                }}>
                                <Text style={[styles.StockListDescTextSmall]}>
                                  C.Limit:{' '}
                                </Text>
                                <Text style={[styles.StockListDescTextSmall]}>
                                  {item.Credit_Limit}
                                </Text>
                              </View>
                            </View>

                            <View
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                }}>
                                <Text style={styles.StockListDescTextSmall}>
                                  Avail.Bal:{' '}
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={[
                                  styles.PlusMinusCont,
                                  {marginLeft: 'auto'},
                                ]}
                                onPress={() => toggleExpand(item.account)}>
                                {expandedItems.includes(item.account) ? (
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

                        {/* <View style={styles.StockItemListHead}>
                                                <Text style={styles.StockListCodeText}>{item.account}</Text>
                                                <TouchableOpacity style={styles.PlusMinusCont} onPress={() => toggleExpand(item.account)}>
                                                    {
                                                        expandedItems.includes(item.account) ?
                                                            <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                            :
                                                            <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                    }
                                                </TouchableOpacity>
                                            </View>


                                            <View style={styles.StockItemDescCont}>
                                                <Text style={styles.StockListDescText}>{item.Custname}</Text>
                                            </View>

                                            <View style={styles.QtyAvlQtyCont}>

                                                <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#ECF0F9', marginRight: 16 }]} onPress={() => statementClick(item)}>
                                                    <Text style={styles.QtyText}>Statement</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#FDEDD6' }]} onPress={() => outStandingClick(item)}>
                                                    <Text style={styles.AvlText}>Outstanding</Text>
                                                </TouchableOpacity>
                                            </View> */}

                        {expandedItems.includes(item.account) && (
                          <View style={styles.QtyAvlQtyCont}>
                            <TouchableOpacity
                              style={[
                                styles.QtyCont,
                                {backgroundColor: '#D8D8DA', marginRight: 16},
                              ]}
                              onPress={() => statementClick(item)}>
                              <Text style={styles.QtyText}>Statement</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.QtyCont,
                                {backgroundColor: '#D8D8DA'},
                              ]}
                              onPress={() => outStandingClick(item)}>
                              <Text style={styles.AvlText}>Outstanding</Text>
                            </TouchableOpacity>
                          </View>
                          // <View style={styles.DynamicPriceView}>
                          //     <View style={styles.PriceTag}>
                          //         <Text style={styles.StockListCodeText}>openbal</Text>
                          //         <Text style={styles.PriceValueText}>{item.openbal}</Text>
                          //     </View>
                          //     <View style={styles.PriceTag}>
                          //         <Text style={styles.StockListCodeText}>Credit Price</Text>
                          //         <Text style={styles.PriceValueText}>{item.credit}</Text>
                          //     </View>
                          //     <View style={styles.PriceTag}>
                          //         <Text style={styles.StockListCodeText}>debit</Text>
                          //         <Text style={styles.PriceValueText}>{item.debit}</Text>
                          //     </View>
                          // </View>
                        )}
                      </View>
                    ))}
                </ScrollView>
              ) : (
                <View>
                  <Text style={{marginTop: 10, fontSize: 18}}>
                    No top customers found, please search
                  </Text>
                </View>
              )}
            </>
          )}

          {/* {
                        selectedStock &&

                        <>
                            <View style={styles.StateOutWrap}>
                                <TouchableOpacity style={styles.StatementButton} onPress={() => setShowStatementPop(true)}>
                                    <Text style={styles.StatementText}>Statement of accounts</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.StatementButton} onPress={() => setShowOutstandingPop(true)}>
                                    <Text style={styles.StatementText}>Outstanding Statements</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.StockDescWrap}>



                                <View style={styles.StockItem}>
                                    <Text style={styles.StockLabel}>Customer Name</Text>
                                    <Text style={styles.StockTextValue}>{selectedStock.Custname}</Text>
                                </View>
                                <View style={styles.StockItem}>
                                    <Text style={styles.StockLabel}>Address</Text>
                                    <Text style={styles.StockTextValue}>
                                        {
                                            selectedStock.address1.trim() !== '' &&
                                            <Text style={styles.TextAddressValue}>{selectedStock.address1}</Text>

                                        }
                                        {
                                            selectedStock.address2.trim() !== '' &&
                                            <Text style={styles.TextAddressValue}>{selectedStock.address2}</Text>

                                        }
                                        {
                                            selectedStock.address3.trim() !== '' &&
                                            <Text style={styles.TextAddressValue}>{selectedStock.address3}</Text>

                                        }
                                    </Text>
                                </View>
                                <View style={styles.StockItem}>
                                    <Text style={styles.StockLabel}>Phone</Text>
                                    <Text style={styles.StockTextValue}>{selectedStock.phone.trim() !== '' ? selectedStock.phone : 'nil'}</Text>
                                </View>
                                <View style={styles.StockItem}>
                                    <Text style={styles.StockLabel}>Open Balance</Text>
                                    <Text style={styles.StockTextValue}>{selectedStock.openbal !== '' ? selectedStock.openbal : "nil"}</Text>
                                </View>
                                <View style={styles.StockItem}>
                                    <Text style={styles.StockLabel}>Balance</Text>
                                    <Text style={styles.StockTextValue}>{selectedStock.credit !== '' ? selectedStock.credit : "nil"}</Text>
                                </View>
                                <View style={styles.StockItem}>
                                    <Text style={styles.StockLabel}>Message</Text>
                                    <Text style={styles.StockTextValue}>{selectedStock.msg.trim() !== '' ? selectedStock.msg : "nil"}</Text>
                                </View>
                            </View>
                        </>
                    } */}
        </View>
      </View>

      {showStatementPop && (
        <StatementPop
          setShowStatementPop={setShowStatementPop}
          privateKey={privateKey}
          accountNo={accountNo}
          appUrl={appUrl}
          cmpcode={cmpcode}
          setSelectedStock={setSelectedStock}
          selectedStock={selectedStock}
        />
      )}

      {showOutstandingPop && (
        <OutstandingPop
          setShowOutstandingPop={setShowOutstandingPop}
          privateKey={privateKey}
          accountNo={accountNo}
          appUrl={appUrl}
          cmpcode={cmpcode}
          setSelectedStock={setSelectedStock}
          selectedStock={selectedStock}
        />
      )}
      {showAddCustomerModal && (
        <AddNewCustomer
          visible={showAddCustomerModal}
          onClose={() => setShowAddCustomerModal(false)}
          onCustomerAdded={() => {
            fetchTop50Customers();
          }}
        />
      )}
    </>
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
    width: '33%',
    color: '#3A80EA',
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
  AddressCont: {
    flexDirection: 'row',
    width: '95%',
    paddingHorizontal: 8,
    paddingVertical: 12,
    // alignItems: 'center',
    flexWrap: 'wrap',
  },
  TextNameDesc: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  TextNameDescValue: {
    fontSize: 14,
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
    fontSize: 16,
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
    width: '100%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    marginVertical: 8,
  },
  PriceText: {
    color: '#189A2E',
    fontSize: 18,
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
  HeadIcon: {
    width: 25,
    height: 25,
  },

  PlaceHolderInput: {
    width: '100%',
    fontFamily: 'Lexend-Regular',
    color: '#2b2b2b',
  },
  TableHeadSpan: {
    backgroundColor: '#D9D9D9',
    padding: 12,
  },
  AddButton: {
    marginLeft: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  AddButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  StockDescWrap: {
    flexDirection: 'column',
    width: '95%',
    marginTop: 8,
    backgroundColor: 'white',
    padding: 18,
  },
  StockItem: {
    padding: 8,
    marginBottom: 4,
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
  StateOutWrap: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 14,
  },

  StatementButton: {
    backgroundColor: '#1A6CF6',
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  StatementText: {
    fontFamily: 'Lexend-Regular',
    color: 'white',
    fontSize: 13,
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
});

export default CustomerDetails;
