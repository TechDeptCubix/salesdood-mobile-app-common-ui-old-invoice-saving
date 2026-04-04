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
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import Header from './Header';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import RadioGroup from 'react-native-radio-buttons-group';

const Collections = () => {
  const navigation = useNavigation();
  const searchUrl = 'https://cubixweberp.com:203/api/Search_Customer/Cust/';

  const [searchItem, setSearchItem] = useState('');

  const [stockData, setStockData] = useState(null);

  const [selectedStock, setSelectedStock] = useState(null);

  const [showActivity, setShowActivity] = useState(false);

  const [selectedId, setSelectedId] = useState();

  const [inpData, setInpData] = useState('');

  const [showLoader, setShowLoader] = useState(false);

  const searchStock = async value => {
    setShowActivity(true);
    try {
      await axios.get(`${searchUrl}${value}`).then(res => {
        setStockData(res.data.jsont);
      });
      setShowActivity(false);
    } catch (error) {
      console.log('searchCustomererror', error);
      setShowActivity(false);
    }
  };

  const radioButtons = useMemo(
    () => [
      {
        id: 'CASH', // acts as primary key, should be unique and non-empty string
        label: 'CASH',
        value: 'CASH',
      },
      {
        id: 'CHECK',
        label: 'CHECK',
        value: 'CHECK',
      },
    ],
    [],
  );

  const SaveItem = () => {
    console.log('selectedId', selectedId);
    console.log('inpData', inpData);
    console.log('Custname', selectedStock.Custname);
  };

  useEffect(() => {
    if (searchItem !== '') {
      searchStock(searchItem);
      setSelectedStock(null);
    }
    if (searchItem == '') {
      setStockData(null);
      // setSelectedStock(null)
    }
  }, [searchItem]);

  useEffect(() => {
    if (selectedStock) {
      setSearchItem('');
    }
  }, [selectedStock]);

  // console.log('searchItem', searchItem)
  // console.log('stockData', stockData)
  // console.log('selectedStock', selectedStock)

  return (
    <View style={styles.HomeWrap}>
      <Header />

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={styles.HomeCont}>
        <View style={styles.HomeTextCont}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              style={styles.HeadIcon}
              source={require('../images/backIcon.png')}
            />
          </TouchableOpacity>
          <Text style={styles.HomeText}>Collections</Text>
        </View>

        <View style={styles.InputCont}>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Customer name"
            value={searchItem}
            onChangeText={text => setSearchItem(text)}
            placeholderTextColor="#aaa"
          />
          <View style={styles.InputImageCont}>
            <Image
              style={styles.SearchIcon}
              source={require('../images/searchIcon.png')}
            />
          </View>
        </View>

        {showActivity && <ActivityIndicator />}

        {stockData && !selectedStock && searchItem !== '' && (
          <View style={styles.TableContainer}>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.headerCell,
                  {
                    borderTopLeftRadius: 4,
                  },
                ]}>
                Name
              </Text>
              <Text style={styles.headerCell}>Account Number</Text>
              <Text
                style={[
                  styles.headerCell,
                  {
                    borderTopRightRadius: 4,
                  },
                ]}>
                Description
              </Text>
            </View>

            {/* <ScrollView style={styles.ScrollView} horizontal={true} nestedScrollEnabled={true}> */}
            <ScrollView style={styles.ScrollView}>
              {stockData &&
                stockData.length > 0 &&
                stockData.slice(0, 25).map((item, index) => (
                  <TouchableOpacity
                    style={styles.tableRow}
                    key={index}
                    onPress={() => setSelectedStock(item)}>
                    <Text style={styles.dataCell}>{item.Custname}</Text>
                    <Text style={styles.dataCell}>{item.account}</Text>
                    <Text style={styles.dataCell}>{item.openbal}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            {stockData && stockData.length === 0 && (
              <View>
                <Text
                  style={{
                    color: 'red',
                  }}>
                  No data available
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedStock && (
          <ScrollView style={styles.ScrollView}>
            <View style={styles.SelectedStockWrap}>
              <View style={styles.NameDescCont}>
                <Text style={styles.TextNameDesc}>Customer name:</Text>
                <Text style={styles.TextNameDescValue}>
                  {selectedStock.Custname}
                </Text>
              </View>
              <View style={styles.NameDescCont}>
                <Text style={styles.TextNameDesc}>Outstanding amount:</Text>
                <Text style={styles.TextNameDescValue}>555</Text>
              </View>
              <View style={styles.NameDescCont}>
                <Text style={styles.TextNameDesc}>RV No:</Text>
                <Text style={styles.TextNameDescValue}>555</Text>
              </View>

              {/* <View style={styles.StockValueWrap}>

                                <View style={styles.PriceCard}>
                                    <Text style={styles.PriceText}>Outstanding amount</Text>
                                    <Text style={styles.PriceValue}>{selectedStock.openbal !== '' ? selectedStock.openbal : "nil"}</Text>
                                </View>
                                <View style={styles.PriceCard}>
                                    <Text style={styles.PriceText}>RV No</Text>
                                    <Text style={styles.PriceValue}>{selectedStock.debit !== '' ? selectedStock.debit : "nil"}</Text>
                                </View>

                            </View> */}

              <View style={styles.RadioWrap}>
                <RadioGroup
                  radioButtons={radioButtons}
                  onPress={setSelectedId}
                  selectedId={selectedId}
                  layout="row"
                />
              </View>

              <View style={styles.InputCont}>
                <TextInput
                  style={styles.TextInput}
                  placeholder=""
                  value={inpData}
                  onChangeText={text => setInpData(text)}
                  placeholderTextColor="#aaa"
                />
              </View>

              {selectedId && inpData && (
                <View style={styles.AddtoCartCont}>
                  <TouchableOpacity
                    style={styles.SelectItemCont}
                    onPress={() => SaveItem()}>
                    <Text style={styles.PriceTextTotal}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* <View style={styles.HomeCont}> */}

      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  HomeWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5A55CA',
  },
  HomeCont: {
    width: '98%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#F0F4FD',
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
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  InputImageCont: {
    backgroundColor: '#EAEDF5',
    padding: 8,
    borderRadius: 6,
    position: 'absolute',
    right: 10,
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

  RadioWrap: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },

  AddtoCartCont: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  SelectItemCont: {
    backgroundColor: '#5A55CA',
    paddingVertical: 10,
    paddingHorizontal: 9,
    borderRadius: 4,
    marginLeft: 20,
  },
  PriceTextTotal: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
});

export default Collections;
