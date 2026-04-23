import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderUiNew from './HeaderUiNew';
import {format} from 'date-fns';
import DriversPendingAccept from './DriversPendingAccept';
import DriverMyTaskList from './DriverMyTaskList';
import DriverOntheWay from './DriverOntheWay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Picker} from '@react-native-picker/picker';
import ToastManager, {Toast} from 'toastify-react-native';
import DriverCompleted from './DriverCompleted';
import DeliveryDetailsPop from '../popups/DeliveryDetailsPop';

const {width, height} = Dimensions.get('window');

const DriverHome = () => {
  // --- STATE MANAGEMENT ---
  const [selectedButton, setSelectedButton] = useState('Pending Accept');
  const [deptno, setDeptNo] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [cmpCode, setCmpCode] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [portNo, setPortNo] = useState('');
  const [van, setVan] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [showAcceptLoader, setShowAcceptLoader] = useState(false);
  const [acceptDono, setAcceptDono] = useState('');
  const [selectedValue, setSelectedValue] = useState('-');
  const [deliveryData, setDeliveryData] = useState([]);
  const [areaCode, setAreaCode] = useState([]);
  const [myTaskLength, setMyTaskLength] = useState(0);
  const [onTheWayListLength, setOnTheWayListLength] = useState(0);
  const [completedTaskLength, setCompletedTaskLength] = useState(0);
  const [showDetailsPop, setDetailsPop] = useState(false);
  const [detailsPopItem, setDetailsPopItem] = useState('');
  const [fleetName, setFleetName] = useState('');

  // --- DATA FETCHING ---
  const fetchAsycData = async () => {
    const deptno = await AsyncStorage.getItem('DEPTNO');
    const loginUser = await AsyncStorage.getItem('loginUserName');
    const appUrlFromStorage = await AsyncStorage.getItem('appUrl');
    const van = await AsyncStorage.getItem('VAN');
    const fleetName = await AsyncStorage.getItem('Fleet_Name');
    const portNoData = await AsyncStorage.getItem('portNoData');
    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    if (portNoData) {
      const dataArray = JSON.parse(portNoData);
      setPortNo(dataArray[0].PORTNO);
    }
    if (fleetName) setFleetName(fleetName);
    if (van) setVan(van);
    if (loginUser) setLoginUser(loginUser.trim());
    if (deptno) setDeptNo(deptno);
    if (parsedUserDataArray.length > 0)
      setCmpCode(parsedUserDataArray[0].cmpcode.trim());
    if (appUrlFromStorage) {
      let apiUrlEdited = appUrlFromStorage.replace('/api/', '');
      setAppUrl(apiUrlEdited);
    }
  };

  const fetchDeliveryData = () => {
    setShowLoader(true);
    let apiLink = `${appUrl}/${cmpCode}/OPENDELIVERY/-/-/${deptno}/-/`;
    axios
      .get(apiLink)
      .then(res => {
        setDeliveryData(res.data);
        setShowLoader(false);
      })
      .catch(() => setShowLoader(false));
  };

  const fetchDeliveryDataWithAreaCode = async area => {
    setShowLoader(true);
    try {
      const response = await axios.get(
        `https://cubixweberp.com:${portNo}/${cmpCode}/OPENDELIVERY/${area}/-/${deptno}/-/`,
      );
      if (response.status === 200) setDeliveryData(response.data);
    } catch (error) {
      console.log('fetchError', error);
    } finally {
      setShowLoader(false);
    }
  };

  const fetchAreaCodes = async () => {
    try {
      const response = await axios.get(`${appUrl}MasterList/${cmpCode}/AREA/-`);
      if (response.status === 200) setAreaCode(response.data);
    } catch (error) {
      console.log('fetchAreaCodesError', error);
    }
  };

  // --- TASK ACTIONS ---
  const AcceptCheck = async item => {
    setShowAcceptLoader(true);
    setAcceptDono(item.do_no);
    const itemDeptno = item.deptno?.trim();
    const itemDono = item.do_no;

    try {
      let apilink = `${appUrl}/${cmpCode}/ACCEPTED_CHECKING/-/-/${itemDeptno}/${itemDono}/`;
      const response = await axios.get(apilink);
      if (response.data[0].Status?.trim().toUpperCase() === 'OPEN') {
        AcceptDelivery(itemDono, itemDeptno);
      } else {
        showAcceptCheckError();
        setShowAcceptLoader(false);
      }
    } catch (error) {
      showAcceptCheckError();
      setShowAcceptLoader(false);
    }
  };

  const AcceptDelivery = async (dono, itemDeptno) => {
    setShowAcceptLoader(true);
    try {
      const data = [
        {
          cmpcode: cmpCode,
          operation: 'ACCEPTED',
          do_no: dono,
          user: loginUser,
          vehicleno: van,
          deptno: itemDeptno?.trim(),
          status: '-',
        },
      ];
      const response = await axios.post(
        `${appUrl}/api/Delivery`,
        JSON.stringify(data),
        {
          headers: {'Content-Type': 'application/json'},
        },
      );

      if (response.status === 200) {
        showAcceptDeliverySuccess();
        fetchDeliveryData();
        fetchMyTaskCount();
      } else {
        showAcceptDeliveryError();
      }
    } catch (error) {
      showAcceptDeliveryError();
    } finally {
      setShowAcceptLoader(false);
      setAcceptDono('');
    }
  };

  // --- COUNT FETCHERS ---
  const fetchMyTaskCount = async () => {
    try {
      const response = await axios.get(
        `https://cubixweberp.com:${portNo}/${cmpCode}/MYLIST/${selectedValue}/${loginUser}/${deptno}/-/`,
      );
      if (response.status === 200) setMyTaskLength(response.data.length);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchOnTheWayTaskCount = async () => {
    try {
      const response = await axios.get(
        `https://cubixweberp.com:${portNo}/${cmpCode}/ONTHEWAY/${selectedValue}/${loginUser}/${deptno}/-/`,
      );
      if (response.status === 200) setOnTheWayListLength(response.data.length);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchCompletdtaskCount = async () => {
    try {
      const response = await axios.get(
        `https://cubixweberp.com:${portNo}/${cmpCode}/DELIVERED/${selectedValue}/${loginUser}/${deptno}/-/`,
      );
      if (response.status === 200) setCompletedTaskLength(response.data.length);
    } catch (e) {
      console.log(e);
    }
  };

  // --- TOASTS & HANDLERS ---
  const showAcceptDeliverySuccess = () =>
    Toast.success(`Accepted Successfully`);
  const showAcceptDeliveryError = () => Toast.error(`Error Accepting Delivery`);
  const showAcceptCheckError = () => Toast.error(`Already Accepted`);
  const showStartJobSuccess = () => Toast.success(`Started Job`);
  const showStartJobError = () => Toast.error(`Error Starting Job`);
  const showDeliveredSuccess = () => Toast.success(`Delivered Successfully`);
  const showDeliveredError = () => Toast.error(`Delivery API Error`);

  const showDetailsPopItem = item => {
    setDetailsPopItem(item);
    setDetailsPop(true);
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchAsycData();
  }, []);

  useEffect(() => {
    if (appUrl && cmpCode) fetchAreaCodes();
  }, [appUrl, cmpCode]);

  useEffect(() => {
    if (appUrl && cmpCode && deptno && portNo) fetchDeliveryData();
  }, [appUrl, cmpCode, deptno, portNo]);

  useEffect(() => {
    if (cmpCode && deptno && portNo) {
      fetchMyTaskCount();
      fetchOnTheWayTaskCount();
      fetchCompletdtaskCount();
    }
  }, [cmpCode, deptno, portNo, selectedValue]);

  useEffect(() => {
    if (selectedValue) fetchDeliveryDataWithAreaCode(selectedValue);
  }, [selectedValue]);

  // --- UI COMPONENTS ---
  const renderTab = (label, count, activeColor, type) => {
    const isActive = selectedButton === type;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedButton(type)}
        style={[
          styles.tabButton,
          isActive && {
            backgroundColor: '#FFFFFF',
            elevation: 2,
            shadowOpacity: 0.1,
          },
        ]}>
        <Text
          style={[
            styles.tabNumber,
            {color: isActive ? activeColor : '#8E8E93'},
          ]}>
          {count}
        </Text>
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? '#1C1C1E' : '#8E8E93',
              fontWeight: isActive ? '700' : '500',
            },
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderUiNew name={'Delivery Tasks'} />
      <ToastManager width={350} height={100} textStyle={{fontSize: 17}} />

      <View style={styles.mainContent}>
        {/* Modern Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.userNameText}>{loginUser || 'Driver'}</Text>
            </View>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>
                {format(new Date(), 'dd MMM yyyy')}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.infoRow}>
            <View>
              <Text style={styles.subLabel}>FLEET NAME</Text>
              <Text style={styles.subValue}>{fleetName || 'Not Assigned'}</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedValue}
                onValueChange={itemValue => setSelectedValue(itemValue)}
                style={styles.pickerStyle}
                dropdownIconColor="#30B3A4">
                <Picker.Item label="All Areas" value="-" />
                {areaCode.map((item, index) => (
                  <Picker.Item
                    label={item.AREACODE}
                    value={item.AREACODE}
                    key={index}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.segmentedControlWrapper}>
          <View style={styles.segmentedControl}>
            {renderTab(
              'Pending',
              deliveryData?.length || 0,
              '#2563EB',
              'Pending Accept',
            )}
            {renderTab('Tasks', myTaskLength, '#F59E0B', 'My Task List')}
            {renderTab('Enroute', onTheWayListLength, '#EF4444', 'On the way')}
            {renderTab('Done', completedTaskLength, '#10B981', 'Completed')}
          </View>
        </View>

        {/* Dynamic Content Area */}
        <View style={styles.listSheet}>
          {showLoader && (
            <ActivityIndicator
              size="large"
              color="#30B3A4"
              style={{marginTop: 30}}
            />
          )}

          <View style={{flex: 1}}>
            {selectedButton === 'Pending Accept' && (
              <DriversPendingAccept
                deliveryData={deliveryData}
                AcceptDelivery={AcceptDelivery}
                showAcceptLoader={showAcceptLoader}
                acceptDono={acceptDono}
                AcceptCheck={AcceptCheck}
                showDetailsPopItem={showDetailsPopItem}
              />
            )}

            {selectedButton === 'My Task List' && (
              <DriverMyTaskList
                appUrl={appUrl}
                cmpCode={cmpCode}
                loginUser={loginUser}
                van={van}
                deptno={deptno}
                portNo={portNo}
                areaCode={selectedValue}
                setMyTaskLength={setMyTaskLength}
                setShowLoader={setShowLoader}
                showStartJobSuccess={showStartJobSuccess}
                showStartJobError={showStartJobError}
                showLoader={showLoader}
                fetchOnTheWayTaskCount={fetchOnTheWayTaskCount}
                showDetailsPopItem={showDetailsPopItem}
              />
            )}

            {selectedButton === 'On the way' && (
              <DriverOntheWay
                appUrl={appUrl}
                cmpCode={cmpCode}
                loginUser={loginUser}
                van={van}
                deptno={deptno}
                portNo={portNo}
                areaCode={selectedValue}
                setOnTheWayListLength={setOnTheWayListLength}
                setShowLoader={setShowLoader}
                showDeliveredSuccess={showDeliveredSuccess}
                showDeliveredError={showDeliveredError}
                showLoader={showLoader}
                fetchCompletdtaskCount={fetchCompletdtaskCount}
                showDetailsPopItem={showDetailsPopItem}
              />
            )}

            {selectedButton === 'Completed' && (
              <DriverCompleted
                appUrl={appUrl}
                cmpCode={cmpCode}
                loginUser={loginUser}
                van={van}
                deptno={deptno}
                portNo={portNo}
                areaCode={selectedValue}
                setCompletedTaskLength={setCompletedTaskLength}
                setShowLoader={setShowLoader}
                showDetailsPopItem={showDetailsPopItem}
              />
            )}
          </View>
        </View>
      </View>

      {showDetailsPop && (
        <DeliveryDetailsPop
          setDetailsPop={setDetailsPop}
          detailsPopItem={detailsPopItem}
          portNo={portNo}
          cmpCode={cmpCode}
          selectedValue={selectedValue}
          loginUser={loginUser}
          deptno={deptno}
          appUrl={appUrl}
          driverCompletedTab={{status: selectedButton}}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light neutral background
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {elevation: 4},
    }),
    // marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Lexend-Regular',
  },
  userNameText: {
    fontSize: 20,
    color: '#1C1C1E',
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
  },
  dateBadge: {
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    color: '#30B3A4',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 12,
  },
  subLabel: {
    fontSize: 10,
    color: '#AEADB2',
    letterSpacing: 0.5,
  },
  subValue: {
    fontSize: 14,
    color: '#48484A',
    fontWeight: '600',
  },
  pickerWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    width: 140,
    height: 40,
    justifyContent: 'center',
  },
  pickerStyle: {
    width: '100%',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#E5E5EA',
    width: (width - 32) / 4 - 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Lexend-Bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#3A3A3C',
    fontFamily: 'Lexend-Regular',
    marginTop: 2,
  },
  segmentedControlWrapper: {
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 16,
    height: 65,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  tabNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 6,
  },

  listSheet: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
});

export default DriverHome;
