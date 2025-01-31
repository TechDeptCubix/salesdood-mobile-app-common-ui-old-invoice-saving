import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, Button, Dimensions, ActivityIndicator } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ToastManager, { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocationModal from './LocationModal';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, PROVIDER_OSMDROID } from 'react-native-maps';
import { PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Linking } from 'react-native';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';

// Get the device's screen dimensions
const { width, height } = Dimensions.get('window');




// import DateTimePicker from 'react-native-ui-datepicker';
// import dayjs from 'dayjs';

const CompletedTask = () => {

    const [taskComesUnder, setTaskComesUnder] = useState('Common Job')
    const [taskType, setTaskType] = useState('Inhouse')
    const [includeTravel, setIncludeTravel] = useState('N')
    const [priorityLevel, setPriorityLevel] = useState('Moderate')


    const [taskList, setTaskList] = useState(null)

    const [modalVisible, setModalVisible] = useState(false);

    const [mapModalVisible, setMapModalVisible] = useState(false)

    const [taskname, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    const [userData, setUserData] = useState(null)

    const [empId, setEmpId] = useState('')

    const [userAttendance, setUserAttendance] = useState(null)

    const [checkInOutText, setCheckInOut] = useState('')

    const [loading, setLoading] = useState(false)

    const [mapRegion, setMapRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const navigation = useNavigation()

    const handleTaskComeUnder = (option) => {
        setTaskComesUnder(option)
    }


    const handleTaskType = (option) => {
        setTaskType(option)
    }


    const handleIncludeTravel = (option) => {
        setIncludeTravel(option)
    }


    const handlePriorityLevel = (option) => {
        setPriorityLevel(option)
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`https://cubixweberp.com:156/api/CRMTaskMainList/CPAYS/owner_completed/${empId}/-/-/-/-/2024-01-10/2024-03-28/-`);
            // const response = await axios.get(`https://cubixweberp.com:156/api/CRMTaskMainList/CPAYS/owner/AJMAL/-/-/-/-/2024-01-10/2024-12-28/-`);
            setTaskList(response.data);
            console.log('fetchData')
            setLoading(false)
        } catch (error) {
            console.log(error, 'getTaskListError')
        }
    };

    const fetchDataNew = async () => {
        try {
            const response = await axios.get(`https://cubixweberp.com:156/api/CRMTaskMainList/CPAYS/owner/${empId}/-/-/-/-/2024-01-10/2024-12-28/-`);
            // const response = await axios.get(`https://cubixweberp.com:156/api/CRMTaskMainList/CPAYS/owner/AJMAL/-/-/-/-/2024-01-10/2024-03-28/-`);
            setTaskList(response.data);
            showTaskSaveToast()
            console.log('fetchDataNew')
        } catch (error) {
            console.log(error, 'getTaskListError')
        }
    };

    const fetchUserAttendance = async () => {
        try {
            const response = await axios.get(`https://cubixweberp.com:156/api/CRMAttendanceList/CPAYS/${empId}`);
            setUserAttendance(response.data);
        } catch (error) {
            console.log(error, 'getTaskListError')
        }
    }

    useEffect(() => {
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().slice(0, 10); // Get the date part of the ISO string

        if (userAttendance && userAttendance.length > 0) {
            // Check if the punch_time is from today
            const punchTime = new Date(userAttendance[0].punch_time);
            const punchTimeString = punchTime.toISOString().slice(0, 10); // Get the date part of the ISO string

            if (punchTimeString === currentDateString && userAttendance[0].type === 'IN') {
                console.log('Punch time is from today');
                setCheckInOut('CHECKOUT');
                const latitude = userAttendance && parseFloat(userAttendance[0].latitude);
                const longitude = userAttendance && parseFloat(userAttendance[0].longitude);


                const fetchUserData = async () => {
                    try {
                        let userDataJson = await AsyncStorage.getItem('userData');
                        let userData = JSON.parse(userDataJson) || {};

                        // const latitude = mapRegion && mapRegion.latitude
                        // const longitude = mapRegion && mapRegion.longitude

                        // Add latitude and longitude to userData
                        userData.latitude = latitude;
                        userData.longitude = longitude;

                        // Update state with modified userData
                        setUserData(userData);
                        setEmpId(userData.empid);

                        // Store updated userData back to AsyncStorage
                        await AsyncStorage.setItem('userData', JSON.stringify(userData));

                        console.log('userData', userData);
                        // showUserDataToast(userData);

                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                };

                fetchUserData();
                // Update UI or perform actions accordingly
                setMapRegion(prevRegion => ({
                    ...prevRegion,
                    latitude,
                    longitude
                }));
            } else if (punchTimeString === currentDateString && userAttendance[0].type === 'OUT') {
                console.log('Punch time is from today, but type is OUT');
                setCheckInOut('CHECKIN');
            } else if (punchTimeString !== currentDateString) {
                console.log('Punch time is not from today');
                setCheckInOut('CHECKIN');
            }
        }
    }, [userAttendance]); // Run this effect whenever userAttendance changes

    // console.log('userAttendance', userAttendance)
    // console.log('userData', userData)

    // useEffect(() => {
    //     if (mapRegion.latitude !== 0) {
    //         const fetchUserData = async () => {
    //             try {
    //                 let userDataJson = await AsyncStorage.getItem('userData');
    //                 let userData = JSON.parse(userDataJson) || {};

    //                 const latitude = mapRegion && mapRegion.latitude
    //                 const longitude = mapRegion && mapRegion.longitude

    //                 // Add latitude and longitude to userData
    //                 userData.latitude = latitude;
    //                 userData.longitude = longitude;

    //                 // Update state with modified userData
    //                 setUserData(userData);
    //                 setEmpId(userData.empid);

    //                 // Store updated userData back to AsyncStorage
    //                 await AsyncStorage.setItem('userData', JSON.stringify(userData));

    //                 console.log(userData, 'userData');
    //                 // showUserDataToast(userData);

    //             } catch (error) {
    //                 console.error('Error fetching user data:', error);
    //             }
    //         };

    //         fetchUserData();
    //     }
    // }, [mapRegion])

    console.log(userAttendance)
    console.log(mapRegion)

    useEffect(() => {
        if (empId) fetchData();
    }, [empId])

    useEffect(() => {
        if (empId) {
            fetchUserAttendance()
        }
    }, [empId])

    const showUserDataToast = (userData) => {
        if (userData && userData.empid) {
            Toast.success(`Welcome ${userData.empid}`);
        }
    }


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataJson = await AsyncStorage.getItem('userData');
                const userData = JSON.parse(userDataJson);
                // Now you have userData, you can use it here
                setUserData(userData)
                setEmpId(userData.empid)
                console.log(userData, 'userData')
                showUserDataToast(userData)

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    console.log(userData, 'userData')

    const showTaskSaveToast = () => {
        Toast.success('Task Added Successfully')
    }

    const showEmptyTaskFields = () => {
        Toast.error('Form is not filled!')
    }

    const ErrorAddTask = () => {
        Toast.error('Some Error Occured')
    }

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

    const [combinedDateTime, setCombinedDateTime] = useState('')

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDateConfirm = (date) => {
        console.warn("A date has been picked: ", date);

        // Extract date part
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Formatted date in yyyy-MM-dd format
        const formattedDate = `${year}-${month}-${day}`;

        setDate(formattedDate);
        hideDatePicker();
    };

    const showTimePicker = () => {
        setTimePickerVisibility(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisibility(false);
    };

    const handleTimeConfirm = (time) => {
        console.warn("A time has been picked: ", time);

        // Extract time part
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        const seconds = String(time.getSeconds()).padStart(2, '0');

        // Formatted time in HH:mm:ss format
        const formattedTime = `${hours}:${minutes}:${seconds}`;

        setTime(formattedTime);
        hideTimePicker();
    };

    // Combine date and time into a single Date object
    const combineDateTime = () => {
        // Get date object from formatted date string
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is zero-based
        const day = parseInt(dateParts[2]);

        // Get time object from formatted time string
        const timeParts = time.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        const seconds = parseInt(timeParts[2]);

        // Create combined Date object
        const combinedDateTime = new Date(year, month, day, hours, minutes, seconds);

        setCombinedDateTime(combinedDateTime)

        // Use combinedDateTime as needed
        console.log("Combined DateTime:", combinedDateTime);
    };

    useEffect(() => {
        if (date && time) {
            combineDateTime()
        }
    }, [date, time])

    const getPriorityColor = priority => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return '#870404';
            case 'moderate':
                return '#F0D802';
            case 'low':
                return '#36CC36';
            default:
                return '#F3F3F3'; // Default color
        }
    };

    const getTextColor = (priority) => {
        return priority === 'High' || priority === 'Low' ? '#FFFFFF' : '#000000'; // White for High and Low, black for others
    };

    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const saveTask = async () => {
        if (taskname !== '' && taskDescription !== '' && includeTravel !== null && priorityLevel !== null && taskComesUnder !== null && taskType !== null) {
            console.log('field is filled')
            try {

                const createdOn = getCurrentDateTime();

                const requestData = [
                    {
                        "cmpcode": "CPAYS",
                        "mode": "ENTRY",
                        "task_id": "DE9ECBC2-F1DF-40F1-BC67-4BD3087978BD",
                        "task_name": taskname,
                        "task_description": taskDescription,
                        "include_travel": includeTravel,
                        "job_code": "",
                        "priority": priorityLevel,
                        "task_scheduledon": combinedDateTime,
                        "task_owner_id": empId,
                        "task_ownder_name": empId,
                        "task_ownder_dept": "",
                        "task_comes_under": taskComesUnder,
                        "task_type": taskType,
                        "latest_status": "",
                        "latest_status_code": "",
                        "latest_stage": "",
                        "latest_stage_code": "",
                        "created_on": createdOn,
                        "task_creator_name": empId,
                        "task_creator_id": empId
                    }
                ];

                console.log('Request Data:', requestData);

                const response = await axios.post('https://cubixweberp.com:156/api/CRMTaskMain', requestData);

                console.log('Response:', response.data);

                // Assuming a successful response has status code 200
                if (response.status === 200) {
                    showTaskSaveToast()
                    fetchDataNew()
                    // Task saved successfully, handle any further actions here
                    console.log('Task saved successfully');
                    console.log(response.data)
                    // setModalVisible(false)
                } else {
                    // Handle other status codes if needed
                    console.error('Failed to save task:', response.statusText);
                    console.log(response)
                    setModalVisible(false)
                }
                setModalVisible(false)
            } catch (error) {
                // Handle network errors or other issues
                console.error('Error while saving task:', error);
                ErrorAddTask()
            }

        } else {
            console.log('field is empty')
            showEmptyTaskFields()
        }
    };

    useEffect(() => {
        if (modalVisible === false) {
            setTaskName('')
            setTaskDescription('')
            setTaskComesUnder(null)
            setTaskType(null)
            setIncludeTravel(null)
            setPriorityLevel(null)
            setCombinedDateTime('')
            setDate('')
            setTime('')
        }
    }, [modalVisible])

    useEffect(() => {
        if (mapModalVisible === true) {
            requestLocationPermission()
        }
    }, [mapModalVisible])

    // tasklistclick

    const gotoTaskDetail = (task) => {
        navigation.navigate('CompletedTaskDetails', {
            task_id: task.task_id,
            created_on: task.created_on,
            task_scheduledon: task.task_scheduledon
        });
    };

    // location

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'This app needs access to your location.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Location permission granted');
                getUserLocation()
                return true;
            } else {
                console.log('Location permission denied');
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const sendCheckInOutReq = async () => {
        let reqData; // Declare reqData variable outside of if statements to make it accessible

        if (checkInOutText === 'CHECKIN') {
            reqData = [{
                cmpcode: 'CPAYS',
                mode: 'entry',
                username: empId,
                type: "IN",
                jobid: "-",
                shift: "-",
                latitude: mapRegion.latitude.toString(),
                longitude: mapRegion.longitude.toString(),
            }];
        } else if (checkInOutText === 'CHECKOUT') {
            reqData = [{
                cmpcode: 'CPAYS',
                mode: 'entry',
                username: empId,
                type: "IN",
                jobid: "-",
                shift: "-",
                latitude: mapRegion.latitude.toString(),
                longitude: mapRegion.longitude.toString(),
            }];
        }

        try {
            console.log('reqData', reqData)
            let stringifiedJSON = JSON.stringify(reqData);
            console.log('stringifiedJSON', stringifiedJSON)
            // Send a POST request to the endpoint with the reqData
            const response = await axios.post(
                'https://cubixweberp.com:156/api/CRMAttendance',
                stringifiedJSON, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            );

            // Handle the response
            console.log('Response:', response.data);
            if (response.status === 200) {
                // Call fetchUserAttendance
                fetchUserAttendance();
                setMapModalVisible(false)
            }
        } catch (error) {
            // Handle errors
            console.error('Error:', error);
        }
    };

    const getUserLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log('Latitude: ', latitude);
                console.log('Longitude: ', longitude);

                // Example zoom level (adjust as needed)
                const zoomLevel = 10;

                // Calculate latitudeDelta and longitudeDelta based on zoom level
                const latitudeDelta = 0.01 * Math.pow(2, (21 - zoomLevel));
                const longitudeDelta = 0.01 * Math.pow(2, (21 - zoomLevel)) * (width / height);

                console.log('Latitude Delta: ', latitudeDelta);
                console.log('Longitude Delta: ', longitudeDelta);

                setMapRegion({
                    latitude,
                    longitude,
                    latitudeDelta,
                    longitudeDelta,
                });
            },
            error => {
                console.error(error.code, error.message);
                promptEnableLocationServices();
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
            // { enableHighAccuracy: true, timeout: 30000 }
        );
    };

    const promptEnableLocationServices = () => {
        Alert.alert(
            'Location Services Disabled',
            'Please enable location services on your device to use this feature.',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            ],
            { cancelable: false }
        );
    };

    const openLocationSettings = () => {
        Linking.openSettings();
    };

    // console.log('mapRegion', mapRegion)


    // console.log(taskList)
    // console.log(date, 'date')
    // console.log(time, 'time')

    // console.log('empId', empId)

    // console.log('taskComesUnder', taskComesUnder)
    // console.log('taskType', taskType)
    // console.log('includeTravel', includeTravel)
    // console.log('priorityLevel', priorityLevel)

    return (
        <SafeAreaView style={styles.container}>
            {/* <ToastManager /> */}

            <View style={styles.TaskHomeWrapper}>


                {/* HeaderNav */}
                {/* <View style={styles.THHeaderNav}>
                    <View><Image source={require('../taskEmpImages/xpertLogo.png')} style={{ height: 40, width: 120 }}></Image></View>
                    <View>
                        <Image source={require('../taskEmpImages/ic_hamburger.png')}></Image>
                    </View>
                </View> */}
                <Header />

                {/* UserBanner */}
                <ImageBackground source={require('../taskEmpImages/header_background.png')} style={{
                    width: "100%",
                    marginTop: 12,
                    // paddingVertical: 24,
                    height: 110,
                    display: "flex",
                    justifyContent: "flex-end"
                    // paddingHorizontal: 0
                }}>
                    <View style={styles.THUserBanner}>
                        <View><Text style={{ fontWeight: "bold", fontSize: 20, color: "black" }}>{empId && empId}</Text></View>
                        <TouchableOpacity style={styles.button} onPress={() => setMapModalVisible(!mapModalVisible)}>
                            {/* <TouchableOpacity style={styles.button} onPress={() => requestLocationPermission()}> */}
                            <Image source={require('../taskEmpImages/location.png')} style={{
                                width: 16,
                                height: 16,
                            }}></Image>
                            <Text style={styles.buttonText}>{checkInOutText}</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                {
                    checkInOutText === 'CHECKIN' &&

                    <View style={{
                        margin: 8
                    }}>
                        <Text style={{
                            color: 'red',
                            fontWeight: 'bold'
                        }}>You need to check in to update tasks</Text>
                    </View>
                }

                {/* Add button */}

                {/* <View style={styles.AddButton}>
                    <TouchableOpacity style={styles.buttonAdd} onPress={() => setModalVisible(true)}>
                        <Image source={require('../taskEmpImages/addB.png')} style={{
                            width: 25,
                            height: 20,
                        }}></Image>
                        <Text style={{
                            fontSize: 16,
                            color: "black"
                        }}>Add Task</Text>
                    </TouchableOpacity>
                </View> */}

                <View style={{
                    margin: 4,
                    padding: 8
                }}>
                    <Text style={{
                        color: '#0bda51',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }}>Completed Tasks</Text>
                </View>


                {/* {
                    checkInOutText === 'CHECKOUT' &&
                    <View style={styles.AddButton}>
                        <TouchableOpacity style={styles.buttonAdd} onPress={() => setModalVisible(true)}>
                            <Image source={require('../taskEmpImages/addB.png')} style={{
                                width: 25,
                                height: 20,
                            }}></Image>
                            <Text style={{
                                fontSize: 16,
                                color: "black"
                            }}>Add Task</Text>
                        </TouchableOpacity>
                    </View>
                } */}

                {/* TaskTable */}
                <ScrollView vertical={true} style={{
                    marginTop: 8
                }}>
                    <ScrollView horizontal={true}>
                        <View style={styles.TableContainer}>
                            {/* Table Header */}
                            <View style={styles.tableRow}>
                                <Text style={styles.headerCell}>Name</Text>
                                <Text style={styles.headerCell}>Description</Text>
                                <Text style={styles.headerCell}>Scheduled on</Text>
                                <Text style={styles.headerCell}>Task owner name</Text>
                                <Text style={styles.headerCell}>Priority</Text>
                            </View>

                            {
                                loading &&
                                <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                    <View style={{ marginLeft: 34 }}><ActivityIndicator size="large" color="blue"></ActivityIndicator></View>
                                </View>
                            }

                            {/* Table Data */}
                            {
                                taskList && taskList?.map((task, index) => (
                                    <TouchableOpacity style={styles.tableRow} key={index} onPress={() => gotoTaskDetail(task)}>
                                        <Text style={styles.dataCell}>{task.task_name}</Text>
                                        <Text style={styles.dataCell}>{task.task_description}</Text>
                                        <Text style={styles.dataCell}>{task.task_scheduledon}</Text>
                                        <Text style={styles.dataCell}>{task.task_owner_name}</Text>
                                        <Text style={[styles.dataCell, { backgroundColor: getPriorityColor(task.priority), color: getTextColor(task.priority) }]}>
                                            {task.priority}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            }

                            {/* Add more rows as needed */}
                        </View>
                    </ScrollView>
                </ScrollView>



                {/* AddTaskModal */}

                {/* MapModal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={mapModalVisible}
                    onRequestClose={() => setMapModalVisible(false)}
                >

                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.mapCont}>
                                {mapRegion.latitude !== 0 && (
                                    <>
                                        <MapView style={styles.map} initialRegion={mapRegion} provider={PROVIDER_OSMDROID}>
                                            <Marker coordinate={mapRegion} />
                                        </MapView>
                                        <Text>Test</Text>
                                    </>
                                )}
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                padding: 4,
                                margin: 4,
                                justifyContent: 'space-between',
                                width: '100%'
                            }}>
                                <Text style={{ padding: 8, margin: 2, backgroundColor: 'green', color: 'white' }}>Latitude: {mapRegion.latitude}</Text>
                                <Text style={{ padding: 8, margin: 2, backgroundColor: 'green', color: 'white' }}>Longitude: {mapRegion.longitude}</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 8, backgroundColor: '#e3e3e3',
                                margin: 4,
                                borderRadius: 4
                            }}>
                                <Image source={require('../taskEmpImages/refresh.png')} style={{
                                    width: 16,
                                    height: 16,
                                }}></Image>
                                <Text style={{
                                    marginLeft: 6,
                                    fontSize: 18,
                                    color: 'black'
                                }}>Refresh Location</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 8, backgroundColor: '#e3e3e3',
                                margin: 4,
                                borderRadius: 4
                            }}>
                                <Image source={require('../taskEmpImages/globeLoc.png')} style={{
                                    width: 16,
                                    height: 16,
                                }}></Image>
                                <Text style={{
                                    marginLeft: 6,
                                    fontSize: 18,
                                    color: 'black'
                                }}>View my location</Text>
                            </View>
                            <View style={{
                                justifyContent: 'flex-end',
                                flexDirection: "row",
                                width: '100%',
                                borderTopColor: 'black',
                                borderTopWidth: 1
                                // backgroundColor: 'black'
                            }}>

                                <View style={{
                                    margin: 4,
                                    backgroundColor: 'red',
                                    color: 'white',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 4,
                                    paddingHorizontal: 4
                                }}>
                                    <TouchableOpacity onPress={() => setMapModalVisible(false)} style={{
                                        margin: 4,
                                        backgroundColor: 'red',
                                        color: 'white'
                                    }}>
                                        <Text style={styles.closeModalButton}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    margin: 4,
                                    backgroundColor: 'green',
                                    color: 'white',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 4,
                                    paddingHorizontal: 4
                                }}>
                                    <TouchableOpacity onPress={() => sendCheckInOutReq()} style={{
                                        margin: 4,
                                        color: 'white'
                                    }}>
                                        <Text style={styles.closeModalButton}>Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                </Modal>

                {/* <LocationModal mapModalVisible={mapModalVisible} /> */}
            </View >
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    TaskHomeWrapper: {
        flex: 1,
        alignItems: "center",
        backgroundColor: '#E6E6FA',
    },
    THHeaderNav: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 14
    },
    THUserBanner: {
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: "center",
    },
    button: {
        width: '45%',
        backgroundColor: '#303289',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: "center"
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    AddButton: {
        alignItems: "flex-end",
        width: "100%",
        paddingRight: 14,
        paddingTop: 14,
        color: "black"
    },
    buttonAdd: {
        width: '45%',
        backgroundColor: '#FFC107',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: "center",
        color: 'black'
    },
    TableContainer: {
        width: "100%",
        padding: 10,
        marginTop: 8
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 120
    },
    dataCell: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        padding: 10,
        textAlign: 'center',
        width: 120,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'white',
        color: "black"
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#F7F7F7',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '94%'
    },
    closeModalButton: {
        marginTop: 10,
        fontSize: 18,
        color: 'white',
    },
    inputContainer: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        marginTop: 12,
    },
    input: {
        width: '100%',
        height: 40,
        backgroundColor: 'white',
        paddingLeft: 10,
    },
    taskComesUnderCont: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 8
    },
    defaultOption: {
        width: 20,
        height: 20,
        backgroundColor: 'white',
        borderRadius: 50
    },
    selectedOption: {
        width: 20,
        height: 20,
        backgroundColor: 'gold',
        borderRadius: 50
    },
    dateTimeCont: {
        justifyContent: "center",
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 12
    },
    mapCont: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green',
        height: 400,
        width: '100%',
    },
    map: {
        // width: '100%',
        // height: '100%'
        // width: '100%',
        // height: 450,
        ...StyleSheet.absoluteFillObject,
        // width: Dimensions.get('window').width,
        // height: Dimensions.get('window').height,
    }
})

export default CompletedTask