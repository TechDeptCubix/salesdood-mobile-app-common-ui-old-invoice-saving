import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, LogBox, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderUiNew from './HeaderUiNew'
import { format } from 'date-fns'
import DriversPendingAccept from './DriversPendingAccept'
import DriverMyTaskList from './DriverMyTaskList'
import DriverOntheWay from './DriverOntheWay'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { Picker } from '@react-native-picker/picker'
import ToastManager, { Toast } from 'toastify-react-native'
import DriverCompleted from './DriverCompleted'
import DeliveryDetailsPop from '../popups/DeliveryDetailsPop'

const DriverHome = () => {

    const [selectedButton, setSelectedButton] = useState('Pending Accept');

    const [deptno, setDeptNo] = useState('')
    const [loginUser, setLoginUser] = useState('')
    const [cmpCode, setCmpCode] = useState('')
    const [appUrl, setAppUrl] = useState('')
    const [portNo, setPortNo] = useState('')
    const [van, setVan] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [showAcceptLoader, setShowAcceptLoader] = useState(false)

    const [acceptDono, setAcceptDono] = useState('')

    const [selectedValue, setSelectedValue] = useState('-')

    const [deliveryData, setDeliveryData] = useState('')

    const [areaCode, setAreaCode] = useState('')

    const [areaCodeinUrl, setAreaCodeinUrl] = useState('')

    const [myTaskLength, setMyTaskLength] = useState('')

    const [onTheWayListLength, setOnTheWayListLength] = useState('')

    const [completedTaskLength, setCompletedTaskLength] = useState('')

    const [showDetailsPop, setDetailsPop] = useState(false)

    const [detailsPopItem, setDetailsPopItem] = useState('')

    const [itemDeptno, setItemdeptno] = useState('')

    const [fleetName, setFleetName] = useState('')

    const fetchAsycData = async () => {

        const deptno = await AsyncStorage.getItem('DEPTNO')
        const loginUser = await AsyncStorage.getItem('loginUserName')
        const appUrl = await AsyncStorage.getItem('appUrl')
        const van = await AsyncStorage.getItem('VAN')

        const fleetName = await AsyncStorage.getItem('Fleet_Name')

        const portNoData = await AsyncStorage.getItem('portNoData')

        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        if (portNoData) {
            const dataArray = JSON.parse(portNoData);
            // console.log(dataArray)
            setPortNo(dataArray[0].PORTNO)
        }

        if (fleetName) {
            setFleetName(fleetName)
        }

        if (van) {
            setVan(van)
        }

        if (loginUser) {
            setLoginUser(loginUser.trim())
        }

        if (deptno) {
            setDeptNo(deptno)
        }

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }

        if (appUrl) {
            setAppUrl(appUrl)
        }

    }

    const fetchDeliveryData = async () => {
        setShowLoader(true)
        try {
            console.log('fetchDeliveryDataUrl', `https://cubixweberp.com:${portNo}/${cmpCode}/OPENDELIVERY/-/-/${deptno}/-/`)
            const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/OPENDELIVERY/-/-/${deptno}/-/`)
            console.log(response.data)
            if (response.status === 200) {
                setDeliveryData(response.data)
                setShowLoader(false)

            }
        } catch (error) {
            console.log('fetchDeliveryDataError', error)
            setShowLoader(false)
        }
    }

    const fetchDeliveryDataWithAreaCode = async (areaCode) => {
        setShowLoader(true)
        try {
            // console.log(`https://cubixweberp.com:${portNo}/${cmpCode}/OPENDELIVERY/${areaCode}/-/${deptno}/-/`)
            const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/OPENDELIVERY/${areaCode}/-/${deptno}/-/`)
            // console.log(response.data)
            if (response.status === 200) {
                setDeliveryData(response.data)
                setShowLoader(false)
            }
        } catch (error) {
            console.log('fetchDeliveryDataWithAreaCodeError', error)
            setShowLoader(false)
        }
    }

    const fetchAreaCodes = async () => {
        try {
            // console.log(`${appUrl}MasterList/${cmpCode}/AREA/-`)
            const response = await axios.get(`${appUrl}MasterList/${cmpCode}/AREA/-`)
            if (response.status === 200) {
                setAreaCode(response.data)
                // setSelectedValue(response.data[0])
            }
        } catch (error) {
            console.log('fetchAreaCodesError', error)
        }
    }

    const AcceptCheck = async (item) => {
        setShowAcceptLoader(true)
        setAcceptDono(item.do_no)
        setItemdeptno(item.deptno)

        const itemDeptno = item.deptno

        const itemDono = item.do_no

        try {

            // const postData = JSON.stringify(data)
            // console.log('postData', postData)

            console.log('postUrl', `https://cubixweberp.com:${portNo}/${cmpCode}/ACCEPTED_CHECKING/-/-/${itemDeptno}/${itemDono}/`)

            const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/ACCEPTED_CHECKING/-/-/${itemDeptno}/${itemDono}/`)

            console.log(response.data)

            if (response.data[0].Status === 'OPEN') {
                AcceptDelivery(itemDono, itemDeptno)
            }
            else {
                showAcceptCheckError()

            }
        } catch (error) {
            console.log('AcceptCheckError', error)
            showAcceptCheckError()
            setShowAcceptLoader(false)

        }
    }

    const AcceptDelivery = async (dono, itemDeptno) => {
        setShowAcceptLoader(true)
        setAcceptDono(dono)
        try {
            const data = [
                {
                    "cmpcode": cmpCode,
                    "operation": "ACCEPTED",
                    "do_no": dono,
                    "user": loginUser,
                    "vehicleno": van,
                    "deptno": itemDeptno,
                    "status": "-"
                }
            ]

            const postData = JSON.stringify(data)
            console.log('postData', postData)

            console.log('postUrl', `${appUrl}Delivery`)

            const response = await axios.post(`${appUrl}Delivery`, postData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (response.status === 200) {
                showAcceptDeliverySuccess()
                fetchDeliveryData()
                fetchMyTaskCount()
                setShowAcceptLoader(false)
                setAcceptDono('')

            }
            else {
                showAcceptDeliveryError()
                setShowAcceptLoader(false)
                setAcceptDono('')

            }
        } catch (error) {
            console.log('AcceptDeliveryError', error)
            showAcceptDeliveryError()
            setShowAcceptLoader(false)
            setAcceptDono('')

        }
    }

    // myTasksApi
    const fetchMyTaskCount = async () => {
        setShowLoader(true)
        try {
            console.log('fetchMyTaskurl', `https://cubixweberp.com:${portNo}/${cmpCode}/MYLIST/${selectedValue}/${loginUser}/${deptno}/-/`)
            const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/MYLIST/${selectedValue}/${loginUser}/${deptno}/-/`)

            if (response.status === 200) {
                // setMyTaskList(response.data)
                setMyTaskLength(response.data.length)
                setShowLoader(false)
            }
        } catch (error) {
            console.log('fetchMyTaskError', error)
            setShowLoader(false)
        }
    }

    // onTheWay
    const fetchOnTheWayTaskCount = async () => {
        setShowLoader(true)
        try {
            console.log('fetchOnTheWayTaskurl', `https://cubixweberp.com:${portNo}/${cmpCode}/ONTHEWAY/${selectedValue}/${loginUser}/${deptno}/-/`)
            const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/ONTHEWAY/${selectedValue}/${loginUser}/${deptno}/-/`)

            if (response.status === 200) {
                // setOnTheWayList(response.data)
                setOnTheWayListLength(response.data.length)
                setShowLoader(false)
            }
        } catch (error) {
            console.log('fetchOnTheWayTaskError', error)
            setShowLoader(false)
        }
    }

    // completed
    const fetchCompletdtaskCount = async () => {
        setShowLoader(true)
        try {
            console.log('fetchCompletdtaskurl', `https://cubixweberp.com:${portNo}/${cmpCode}/DELIVERED/${selectedValue}/${loginUser}/${deptno}/-/`)
            const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/DELIVERED/${selectedValue}/${loginUser}/${deptno}/-/`)

            if (response.status === 200) {
                // setCompletedList(response.data)
                setCompletedTaskLength(response.data.length)
                setShowLoader(false)
            }
        } catch (error) {
            console.log('fetchCompletdtaskError', error)
            setShowLoader(false)
        }
    }


    const showAcceptDeliverySuccess = () => {
        Toast.success(`Accepted Delivery Successfully`)
    }
    const showAcceptDeliveryError = () => {
        Toast.error(`Some Error on Accepting Delivery`)
    }

    const showAcceptCheckError = () => {
        Toast.error(`Already accepted Delivery`)
    }

    const showStartJobSuccess = () => {
        Toast.success(`Started Job Successfully`)
    }
    const showStartJobError = () => {
        Toast.error(`Some Error on Starting Job`)
    }

    const showDeliveredSuccess = () => {
        Toast.success(`Item Delivered Successfully`)
    }
    const showDeliveredError = () => {
        Toast.error(`Some Error on Delivery api`)
    }

    const showDetailsPopItem = (item) => {
        console.log('showDetailsPopItem', item)
        setDetailsPopItem(item)
        setDetailsPop(true)
    }


    const handlePress = (buttonName) => {
        setSelectedButton(buttonName);
    };

    const getFormattedDate = () => {
        const now = new Date();
        return format(now, 'dd-MMM-yyyy h:mm a').toLowerCase();
    };

    useEffect(() => {
        if (appUrl && cmpCode) {
            fetchAreaCodes()
        }
    }, [appUrl, cmpCode])

    useEffect(() => {
        if (cmpCode && deptno && portNo) {
            fetchDeliveryData()
        }
    }, [cmpCode, deptno, portNo])

    useEffect(() => {
        if (cmpCode && deptno && portNo && selectedValue) {
            fetchMyTaskCount()
            fetchOnTheWayTaskCount()
            fetchCompletdtaskCount()
        }
    }, [cmpCode, deptno, portNo, selectedValue])

    useEffect(() => {
        if (selectedValue) {
            fetchDeliveryDataWithAreaCode(selectedValue)
        }
    }, [selectedValue])

    useEffect(() => {
        fetchAsycData()
    }, [])

    const formattedDate = getFormattedDate();
    // console.log(formattedDate);

    // console.log(appUrl)
    // console.log(deptno)
    // console.log(cmpCode)
    // console.log(loginUser)

    // console.log('areaCode', areaCode)

    // console.log('selectedValue', selectedValue)

    return (
        <SafeAreaView style={styles.HomeWrap}>

            <HeaderUiNew name={'Delivery Tasks'} />

            <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />

            <View style={styles.HomeCont}>

                <View style={styles.HomeUserBox}>

                    <View style={styles.HomeUserTopCont}>
                        <View style={styles.HomeUserSection}>
                            <Text style={styles.HomeTopText}>User</Text>
                            <Text style={[styles.HomeTopText, { marginHorizontal: 6 }]}>:</Text>
                            <Text style={styles.HomeTopText}>
                                {loginUser ? loginUser : ""}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.HomeTopText}>{formattedDate}</Text>
                        </View>
                    </View>

                    <View style={[styles.HomeUserTopCont, { alignItems: 'center' }]}>
                        <View style={styles.HomeUserSection}>
                            <Text style={styles.HomeTopText}>Fleet No</Text>
                            <Text style={[styles.HomeTopText, { marginHorizontal: 6 }]}>:</Text>
                            <Text style={styles.HomeTopText}>{fleetName && fleetName}</Text>
                        </View>
                        <View>
                            <Picker
                                selectedValue={selectedValue}
                                onValueChange={(itemValue) => setSelectedValue(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="All" value="-" />
                                {
                                    areaCode.length > 0 && areaCode.map((item, index) => (
                                        <Picker.Item
                                            label={item.AREACODE}
                                            value={item.AREACODE}
                                            key={index}
                                        />
                                    ))
                                }

                            </Picker>
                        </View>
                    </View>

                </View>

                <View style={styles.ActionTabBox}>
                    <TouchableOpacity
                        style={[
                            styles.ActionButtons,
                            selectedButton === 'Pending Accept' && styles.SelectedButton, { backgroundColor: '#AEADB2' }
                        ]}
                        onPress={() => handlePress('Pending Accept')}
                    >
                        <Text style={styles.ButtonText}>Pending Accept</Text>
                        <Text style={[styles.ButtonText, { marginTop: 12 }]}>
                            {deliveryData && deliveryData.length}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.ActionButtons,
                            selectedButton === 'My Task List' && styles.SelectedButton, { backgroundColor: '#FF9402' }
                        ]}
                        onPress={() => handlePress('My Task List')}
                    >
                        <Text style={styles.ButtonText}>My Task List</Text>
                        <Text style={[styles.ButtonText, { marginTop: 12 }]}>
                            {myTaskLength && myTaskLength}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.ActionButtons,
                            selectedButton === 'On the way' && styles.SelectedButton, { backgroundColor: '#FF3B2F' }
                        ]}
                        onPress={() => handlePress('On the way')}
                    >
                        <Text style={styles.ButtonText}>On the way</Text>
                        <Text style={[styles.ButtonText, { marginTop: 12 }]}>
                            {onTheWayListLength && onTheWayListLength}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.ActionButtons,
                            selectedButton === 'Completed' && styles.SelectedButton, { backgroundColor: '#2DB44E' }
                        ]}
                        onPress={() => handlePress('Completed')}
                    >
                        <Text style={styles.ButtonText}>Completed</Text>
                        <Text style={[styles.ButtonText, { marginTop: 12 }]}>
                            {completedTaskLength && completedTaskLength}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    width: '100%', flexDirection: 'column',
                    justifyContent: 'center',
                    // alignItems: 'center',
                    marginTop: 16
                }}>
                    {
                        showLoader &&
                        <ActivityIndicator size={'large'} color={'#30B3A4'} />
                    }
                    {
                        selectedButton === 'Pending Accept' &&
                        <DriversPendingAccept
                            deliveryData={deliveryData}
                            AcceptDelivery={AcceptDelivery}
                            showAcceptLoader={showAcceptLoader}
                            acceptDono={acceptDono}
                            AcceptCheck={AcceptCheck}
                            showDetailsPopItem={showDetailsPopItem}
                        />
                    }

                    {
                        selectedButton === 'My Task List' &&
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
                    }

                    {
                        selectedButton === 'On the way' &&
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
                    }

                    {
                        selectedButton === 'Completed' &&
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
                            showDeliveredSuccess={showDeliveredSuccess}
                            showDeliveredError={showDeliveredError}
                            showLoader={showLoader}
                            showDetailsPopItem={showDetailsPopItem}


                        />
                    }
                </View>

            </View>

            {
                showDetailsPop &&
                <DeliveryDetailsPop
                    setDetailsPop={setDetailsPop}
                    detailsPopItem={detailsPopItem}
                    portNo={portNo}
                    cmpCode={cmpCode}
                    selectedValue={selectedValue}
                    loginUser={loginUser}
                    deptno={deptno}

                />
            }
        </SafeAreaView >
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
        width: '99%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        // borderTopLeftRadius: 18,
        // borderTopRightRadius: 18,
        backgroundColor: '#EFEFEF',
        height: Dimensions.get('window').height - 70

    },
    HomeUserBox: {
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    HomeUserTopCont: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    HomeUserSection: {
        flexDirection: 'row'
    },
    HomeTopText: {
        fontSize: 16,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
    },

    ActionTabBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 12,
        // backgroundColor: 'red'
    },
    ActionButtons: {
        width: '24%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 6,
        backgroundColor: 'white',
        marginHorizontal: 4,
        borderRadius: 4,
    },
    SelectedButton: {
        borderBottomColor: 'green',
        borderBottomWidth: 4,
    },
    ButtonText: {
        fontSize: 13,
        color: '#2B2B2B',
        color: 'white',
        fontFamily: 'Lexend-Bold',
    },
    picker: {
        // height: 50,
        width: 150,
    },


})

export default DriverHome