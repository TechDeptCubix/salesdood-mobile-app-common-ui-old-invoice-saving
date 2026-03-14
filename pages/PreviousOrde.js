import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from './Header';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import REACT_APP_BASE_URL from '../url/AppUrl';
import StatusLogPop from '../popups/StatusLogPop';
import HeaderUiNew from './HeaderUiNew';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';

const PreviousOrde = () => {
  const ITEMS_PER_PAGE = 20;

  const navigation = useNavigation();

  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [salesMan, setSalesMan] = useState('');

  const [itemList, setItemList] = useState(null);
  const [showStatusLogPop, setShowStatusLogPop] = useState(false);
  const [orderIdPop, setOrderIdPop] = useState(null);

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [expandedItems, setExpandedItems] = useState([]);

  const toggleExpand = so_no => {
    setExpandedItems(prevState => {
      if (prevState.includes(so_no)) {
        // If already open, close it
        return prevState.filter(id => id !== so_no);
      } else {
        // If closed, open it (and close others)
        return [so_no];
      }
    });
  };

  const fetchAppUrl = async () => {
    const appUrl = await AsyncStorage.getItem('appUrl');
    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    if (parsedUserDataArray) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim());
    }
    if (appUrl) {
      setAppUrl(appUrl);
    }
  };

  // const fetchSalesMan = async () => {
  //     try {
  //         const salesMan = await AsyncStorage.getItem('sales_man')
  //         setSalesMan(salesMan)
  //     } catch (error) {
  //         console.error('Error fetchSalesMan:', error);
  //     }
  // }

  const fetchSalesMan = async () => {
    const salesMan = await AsyncStorage.getItem('sales_man');

    if (salesMan === '----') {
      const salesManDrop = await AsyncStorage.getItem('sales_man_drop');
      setSalesMan(salesManDrop);
    } else {
      setSalesMan(salesMan);
    }
  };

  const fetchPreviousOrders = async () => {
    try {
      // const response = await axios.get(`${REACT_APP_BASE_URL}Sales_Order/Salesall/ALL`);
      // const response = await axios.get(`https://cubixweberp.com:208/api/Sales_Order/automax/Salesall/ALL`);

      const deptno = await AsyncStorage.getItem('DEPTNO');

      console.log(
        'previous order api url -->[[]] ',
        `${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}/${deptno}`,
      );

      const response = await axios.get(
        `${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}/${deptno}`,
      );

      // console.log(`${appUrl}Sales_Order/${cmpcode}/previous/${salesMan}`)

      // https://cubixweberp.com:208/api/Sales_Order/automax/previous/SHA01
      setData(response.data);
      console.log('Previous response data length', response?.data?.length);
      console.log('previous orders response', response.data);
    } catch (error) {
      console.log('fetchPreviousOrdersError', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemList = async orderId => {
    try {
      const response = await axios.get(
        `http://tanoof.dyndns.org:92/api/Sales_Order/salesall/details/${orderId}`,
      );
      setItemList(response.data);
    } catch (error) {
      console.log('fetchItemListError', error);
      setError(error);
    }
  };

  const ViewStatusLogAction = async orderId => {
    setShowStatusLogPop(true);
    setOrderIdPop(orderId);
    // try {
    //     const response = await axios.get(`${REACT_APP_BASE_URL}PreviousOrderStatus/Get?type=asda&desc=${orderId}`);
    //     console.log(response.data); // You can handle the response data here
    // } catch (error) {
    //     console.error("ViewStatusLogAction Erro", error);
    // }

    // console.log(`${REACT_APP_BASE_URL}PreviousOrderStatus/Get?type=asda&desc=${orderId}`);
  };

  const formattedDate = date => {
    return format(new Date(date), 'dd-MM-yy');
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchSalesMan();
    fetchAppUrl();
  });

  useEffect(() => {
    if (salesMan && appUrl && cmpcode) {
      fetchPreviousOrders();
    }
  }, [salesMan, appUrl, cmpcode]);

  // console.log('prevOrder', data)

  console.log('salesMan', salesMan);
  console.log('prevData', data);

  // console.log('itemList', itemList)

  return (
    <View style={styles.HomeWrap}>
      {/* <Header /> */}

      <HeaderUiNew name={'Previous Orders'} />

      <View style={styles.HomeCont}>
        {/* <View style={styles.HomeTextCont}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                    </TouchableOpacity>
                    <Text style={styles.HomeText}>Previous Orders</Text>
                </View> */}

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

        {data.length === 0 && !loading && (
          <View>
            <Text
              style={{
                color: 'red',
                fontSize: 16,
                fontFamily: 'Lexend-Bold',
              }}>
              No Data Available
            </Text>
          </View>
        )}

        <FlatList
          data={getPaginatedData()}
          keyExtractor={(item, index) => item.so_no}
          style={{width: '94%'}}
          renderItem={({item}) => (
            <ScrollView style={styles.PreviousOrderWrap}>
              {/*  */}

              <TouchableOpacity
                style={styles.StockListItem}
                onPress={() =>
                  navigation.navigate('OrderDetails', {orderId: item.so_no})
                }>
                <View style={styles.CustomerListCont}>
                  <View style={styles.CustomerImgWrap}>
                    <Image
                      style={styles.CustomerImage}
                      source={require('../images/listWhite.png')}
                    />
                  </View>

                  <View style={styles.CustomerListMid}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}>
                      <Text style={[styles.StockListDescText, {width: '75%'}]}>
                        {item.accdesc}
                      </Text>
                      <Text
                        style={[
                          styles.StockListDescTextSmall,
                          {color: '#30B3A4', fontFamily: 'Lexend-Regular'},
                        ]}>
                        {item.so_amount}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        paddingVertical: 6,
                      }}>
                      <Text style={styles.StockListDescTextSmall}>
                        {item.so_no}
                      </Text>
                      <View
                        style={{
                          marginLeft: 24,
                          flexDirection: 'row',
                        }}>
                        {/* <Text style={[styles.StockListDescTextSmall,]}>Inv Date:</Text> */}
                        <Text style={[styles.StockListDescTextSmall]}>
                          {formattedDate(item.inv_date)}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.PlusMinusCont, {marginLeft: 'auto'}]}
                        onPress={() => toggleExpand(item.so_no)}>
                        {expandedItems.includes(item.so_no) ? (
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

                {expandedItems.includes(item.so_no) && (
                  <View style={styles.QtyAvlQtyCont}>
                    {/* commented because to check if working properly
                                            <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', marginRight: 16 }]} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'edit' })}>
                                                <Text style={styles.QtyText}>Edit Sales Order</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', }]} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'pull' })}>
                                                <Text style={styles.AvlText}>Pull Sales Order</Text>
                                            </TouchableOpacity> */}
                  </View>
                )}
              </TouchableOpacity>
              {/*  */}
              {/* 
                            <View style={styles.PreviousOrderCard}>
                                <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: item.so_no })}>
                                    <Text style={styles.OrderNoText}>{item.so_no}</Text>
                                    <Text style={styles.CustomerNameText}>{item.accdesc}</Text>

                                </TouchableOpacity>

                                <View style={styles.OrderUpdatesWrap}>


                                    <View style={styles.EditPullWrap}>
                                        <TouchableOpacity style={styles.EditPullButton} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'edit' })}>
                                            <Text style={styles.EditPullText}>Edit Sales Order</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.EditPullButton} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'pull' })}>
                                            <Text style={styles.EditPullText}>Pull Sales Order</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View> */}
            </ScrollView>
          )}
        />

        {data.length > 0 && !loading && (
          <View style={styles.pagination}>
            {currentPage !== 1 && (
              <TouchableOpacity
                onPress={handlePreviousPage}
                disabled={currentPage === 1}
                style={styles.pageButton}>
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </Text>
            {currentPage !== totalPages && (
              <TouchableOpacity
                onPress={handleNextPage}
                disabled={currentPage === totalPages}
                style={styles.pageButton}>
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {showStatusLogPop && (
        <StatusLogPop
          orderIdPop={orderIdPop}
          setShowStatusLogPop={setShowStatusLogPop}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  HomeWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    width: '100%',
  },
  HomeCont: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: 8,
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
  PreviousOrderWrap: {
    width: '100%',
    flexDirection: 'column',
    // alignItems: 'center',
    marginTop: 3,
  },
  PreviousOrderCard: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    marginBottom: 8,
  },
  OrderNoText: {
    backgroundColor: '#ffbb00',
    padding: 6,
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 6,
    width: '20%',
  },
  CustomerNameText: {
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginVertical: 4,
  },
  StatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  StatusTextTag: {
    color: 'blue',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  StatusText: {
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginLeft: 12,
  },
  OrderUpdatesWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  ViewStatusWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 4,
  },
  ViewStatusButton: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  ViewStatusText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'white',
  },
  EditPullWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  EditPullButton: {
    backgroundColor: '#8f8f8f',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 12,
    borderRadius: 4,
  },
  EditPullText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'white',
  },
  CardScroll: {
    width: '100%',
    alignItems: 'center',
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    marginBottom: 16,
  },
  pageButton: {
    padding: 10,
    backgroundColor: '#5A55CA',
    borderRadius: 5,
  },
  pageButtonText: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
  },
  pageInfo: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: 'black',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  HeadIcon: {
    width: 25,
    height: 25,
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

    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
    elevation: 1.5, // Elevation for Android

    borderColor: 'grey',
    borderWidth: 0.5,
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
});

export default PreviousOrde;
