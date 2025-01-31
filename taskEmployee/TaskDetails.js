import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, TextInput, ScrollView, ActivityIndicator, Button } from 'react-native'
import userAvt from '../taskEmpImages/userAvt.png'
import ViewJobList from '../taskEmpImages/ic_view_job_list.png'
import TaskOpen from '../taskEmpImages/task_open.png'
import Triangle from '../taskEmpImages/triangle_in_path.png'
import TaskHold from '../taskEmpImages/task_end_in_path.png'
import TaskEscalated from '../taskEmpImages/escalated.png'
import TravelStart from '../taskEmpImages/travel_start_in_path.png'
import TravelEnd from '../taskEmpImages/travel_end_in_path.png'
import TaskStart from '../taskEmpImages/task_start_in_path.png'
import TaskEnd from '../taskEmpImages/task_end.png'
import completed from '../taskEmpImages/ic_check_scanned_button.png'
import beyondScope from '../taskEmpImages/task_end_in_path.png'
import pause from '../taskEmpImages/pause.png'
import { useNavigation, useRoute } from '@react-navigation/native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Header from './Header'
import DocumentPicker from 'react-native-document-picker';
import ToastManager, { Toast } from 'toastify-react-native'
import Loader from './Loader'
import messaging from '@react-native-firebase/messaging';
import { SERVER_KEY } from "@env";



const TaskDetails = () => {
    const route = useRoute()

    const { task_id, created_on, task_scheduledon, openChat } = route.params;

    const scrollViewRef = useRef();

    const navigation = useNavigation()


    const createdDate = created_on.split('T')[0]; // Extract date part
    const scheduledDate = task_scheduledon.split('T')[0]; // Extract date part

    const [userData, setUserData] = useState(null)

    const [taskData, setTaskData] = useState(null)
    const [taskHistory, setTaskHistory] = useState(null)
    const [allStatusList, setAllStatusList] = useState(null)
    const [statusArray, setStatusArray] = useState([])

    const [statusDescription, setStatusDescription] = useState('')
    const [fileDescription, setFileDescription] = useState('')

    const [endStatusFlow, setEndStatusFlow] = useState([])

    const initStatus = ['ESCALATED', 'ACCEPTED_OPEN', 'ACCEPTED_ON_HOLD']
    const travelStart = ['TRAVEL_START', 'HOLD']
    const travelStop = ['TRAVEL_END', 'HOLD']
    const taskStart = ['TASK_START', 'HOLD']
    const taskStop = ['TASK_END', 'HOLD']
    const lastStatus = ['CUSTOMER_REJECTION', 'COMPLETED', 'BEYOND THE SCOPE']

    // already hold states
    const travelStartPrevHold = ['TRAVEL_START']
    const travelStopPrevHold = ['TRAVEL_END']
    const taskStartPrevHold = ['TASK_START']
    const taskStopPrevHold = ['TASK_END']


    const [selectedStatus, setSelectedStatus] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);

    const [userAttendance, setUserAttendance] = useState(null);

    const [viewImage, setViewImage] = useState(false)

    const [imageApiData, setImageApiData] = useState(null)

    const [modifiedImgData, setModifiedImgData] = useState(null)

    const [viewImgPop, setImagePoP] = useState(false)

    const [chatBoxView, setChatBoxView] = useState(false)

    // const [chatOpen, setChatOpen] = useState(false)

    const [chatMsg, setChatMsg] = useState('')

    const [chatData, setChatData] = useState(null)

    const [uploadLoader, setUploadLoader] = useState(false)

    const [checkInOutText, setCheckInOut] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [msgModal, setmsgModal] = useState(false);

    const [newTaskModal, setNewTaskModal] = useState(false);

    const [messageData, setMessageData] = useState(null);

    const [fcmToken, setFcmToken] = useState(null);

    const [showHighTaskCount, setHighTaskCount] = useState(null)

    let currentDate = new Date();
    let formattedDate = currentDate.toISOString().replace("T", " ").replace("Z", "");

    // console.log('formattedDate', formattedDate);

    console.log(task_id, created_on, task_scheduledon)

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            setMessageData(remoteMessage.data);
            if (remoteMessage.notification.title === 'New Message') {
                setmsgModal(true);
            }
            if (remoteMessage.notification.title === 'New Task') {
                setNewTaskModal(true);
            }
            // When a foreground message is received, set the message data and show the modal

        });

        return unsubscribe;
    }, []);

    console.log('messageData', messageData)

    const scrollToBottom = () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    };


    const handleStatusClick = (item) => {
        // console.log(item)
        setSelectedStatus(item === selectedStatus ? null : item);
    };

    useEffect(() => {
        setChatBoxView(openChat);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataJson = await AsyncStorage.getItem('userData');
                const userData = JSON.parse(userDataJson);
                // Now you have userData, you can use it here
                setUserData(userData)
                // console.log('userData', userData)

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const [isActiveTask, setIsActiveTask] = useState()

    const [openTaskInactiveWarn, setOpenTaskInactiveWarn] = useState(false)

    useEffect(() => {
        const fetchPrevTaskCount = async () => {
            try {
                const response = await axios.get(`https://cubixweberp.com:156/api/CRMTAskCountowner/cpays/${userData.empid}`)
                if (response.status === 200) {
                    console.log('FROMFETCHPREVCNT', response.data)
                    setHighTaskCount(response.data)

                    if (response.data[0].CNT > 0) {
                        console.log('CNT>O')
                        if (taskData[0].latest_stage === 'ACCEPTED_OPEN' || taskData[0].latest_stage === '') {
                            setIsActiveTask(false)
                        } else {
                            setIsActiveTask(true)
                        }
                    } else {
                        setIsActiveTask(true)
                    }
                }
            } catch (error) {
                console.error('fetchPrevTaskCount:', error);
            }
        }

        if (userData && taskData) {
            fetchPrevTaskCount()
        }
    }, [userData, taskData])

    console.log('isActiveTask', isActiveTask)

    useEffect(() => {
        const fetchTaskData = async () => {
            if (task_id) {
                try {
                    const response = await axios.get(`https://cubixweberp.com:156/api/CRMTaskMainList/CPAYS/single/-/-/-/${task_id}/-/${createdDate}/${scheduledDate}/-`);
                    const data = response.data;
                    setTaskData(data)

                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchTaskData();
    }, [task_id])

    const fetchHistoryData = async () => {
        if (task_id) {
            try {
                const response = await axios.get(`https://cubixweberp.com:156/api/CRMTAskHistoryList/cpays/all/-/${task_id}/`);
                const data = response.data;
                setTaskHistory(data)

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    useEffect(() => {

        fetchHistoryData();
    }, [task_id])

    useEffect(() => {
        if (taskHistory && taskHistory.length > 0 && taskHistory[0].hasOwnProperty('name_of_file_uploaded')) {
            if (taskHistory[0].name_of_file_uploaded === 'Y') {
                setViewImage(true);
            } else {
                setViewImage(false);
            }
        } else {
            setViewImage(false);
        }
    }, [taskHistory]);

    useEffect(() => {
        const fetchStatusListAll = async () => {
            try {
                const response = await axios.get(`https://cubixweberp.com:156/api/CRMTAskStageList/CPAYS/all/-`);
                const data = response.data;
                setAllStatusList(data)

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchStatusListAll()
    }, [])

    useEffect(() => {
        if (taskHistory && taskData) {
            if (taskHistory.length == 0) {
                setStatusArray(initStatus)
            } else if ((taskHistory[0].task_stage === 'ACCEPTED_OPEN' || taskHistory[0].task_stage === '') && taskHistory[0].task_status !== 'HOLD' && taskData[0]?.include_travel === 'Y') {
                setStatusArray(travelStart)
            } else if ((taskHistory[0].task_stage === 'ACCEPTED_OPEN' || taskHistory[0].task_stage === '') && taskHistory[0].task_status !== 'HOLD' && taskData[0]?.include_travel === 'N') {
                setStatusArray(taskStart)
            } else if (taskHistory[0].task_stage === 'TRAVEL_START' && taskHistory[0].task_status !== 'HOLD') {
                setStatusArray(travelStop)
            } else if (taskHistory[0].task_stage === 'TASK_START' && taskHistory[0].task_status !== 'HOLD') {
                setStatusArray(taskStop)
            } else if (taskHistory[0].task_stage === 'TRAVEL_END' && taskHistory[0].task_status !== 'HOLD') {
                setStatusArray(taskStart)
            } else if (taskHistory[0].task_stage === 'TASK_END' && taskHistory[0].task_status !== 'COMPLETED') {
                setStatusArray(lastStatus)
            } else if (taskHistory[0].task_stage === 'TASK_END' && taskHistory[0].task_status === 'COMPLETED') {
                setEndStatusFlow([taskHistory[0].task_status]);
            } else if (taskHistory[0].task_status === 'HOLD' && taskHistory[1].task_stage === 'ACCEPTED_OPEN' && taskData[0]?.include_travel === 'Y') {
                setStatusArray(travelStartPrevHold)
            } else if (taskHistory[0].task_status === 'HOLD' && taskHistory[1].task_stage === 'ACCEPTED_OPEN' && taskData[0]?.include_travel === 'N') {
                setStatusArray(taskStartPrevHold)
            } else if (taskHistory[0].task_status === 'HOLD' && taskHistory[1].task_stage === 'TRAVEL_START') {
                setStatusArray(travelStopPrevHold)
            } else if (taskHistory[0].task_status === 'HOLD' && taskHistory[1].task_stage === 'TASK_START') {
                setStatusArray(taskStopPrevHold)
            } else if (taskHistory[0].task_status === 'HOLD' && taskHistory[1].task_stage === 'TRAVEL_END') {
                setStatusArray(taskStartPrevHold)
            } else if (taskHistory[0].task_status === 'HOLD' && taskHistory[1].task_stage === 'TASK_END' && taskHistory[0].task_status !== 'COMPLETED') {
                setStatusArray(lastStatus)
            }
            else if (taskHistory[0].task_stage === 'HOLD' && taskHistory[1].task_stage === 'TASK_END' && taskHistory[0].task_status === 'COMPLETED') {
                setEndStatusFlow([taskHistory[0].task_status]);
            }
            else if (taskHistory[0].task_stage === 'ESCALATED' || taskHistory[0].task_stage === 'ACCEPTED_ON_HOLD' || taskHistory[0].task_stage === 'CUSTOMER_REJECTION' || taskHistory[0].task_stage === 'COMPLETED' || taskHistory[0].task_stage === 'BEYOND THE SCOPE') {
                setEndStatusFlow([taskHistory[0].task_stage]);
            }
        }
    }, [taskHistory, taskData])

    console.log('endStatusFlow', endStatusFlow)

    // console.log('statusArray', statusArray)

    // console.log('userData', userData)

    // taskstatusSave
    const taskStatusSave = async () => {

        setShowLoader(true)

        setStatusDescription('')

        const statusCode = allStatusList.find((item) => item.code_name === selectedStatus)?.code_value;


        const stageCode = allStatusList.find((item) => item.code_name === taskHistory[0]?.task_stage)?.code_value;

        const defApiStatusCode = allStatusList.find((item) => item.code_name === 'ACCEPTED_OPEN')?.code_value;

        let apiStatus = ''
        let apiStatusCode = ''

        let apiStage = ''
        let apiStageCode = '0'

        if (selectedStatus === 'ESCALATED' || selectedStatus === 'ACCEPTED_OPEN' || selectedStatus === 'ACCEPTED_ON_HOLD') {
            apiStatus = selectedStatus
            apiStatusCode = statusCode
        } else if (selectedStatus === 'CUSTOMER_REJECTION' || selectedStatus === 'COMPLETED' || selectedStatus === 'BEYOND THE SCOPE') {
            apiStatus = selectedStatus
            apiStatusCode = statusCode
            apiStage = taskHistory[0].task_stage
            apiStageCode = stageCode
        } else if (selectedStatus === 'TRAVEL_START' || selectedStatus === 'TRAVEL_END' || selectedStatus === 'TASK_START' || selectedStatus === 'TASK_END') {
            apiStatus = 'ACCEPTED_OPEN'
            apiStatusCode = defApiStatusCode
            apiStage = selectedStatus
            apiStageCode = statusCode
        } else if (selectedStatus === 'HOLD') {
            apiStatus = selectedStatus
            apiStatusCode = statusCode
            apiStage = selectedStatus
            apiStageCode = statusCode
        }

        console.log('apiStatus', apiStatus)

        // console.log('statusCode', statusCode)

        // task_stage: taskHistory.length === 0 ? '' : selectedStatus,
        // task_stage_code: taskHistory.length === 0 ? '0' : statusCode,


        let reqData = [
            {
                cmpcode: "CPAYS",
                mode: "ENTRY",
                task_id: task_id,
                task_status: apiStatus,
                task_status_code: apiStatusCode,
                task_status_description: statusDescription,
                task_stage: apiStage,
                task_stage_code: apiStageCode,
                task_stage_description: statusDescription,
                task_scheduledon: task_scheduledon,
                task_ownder_id: userData && userData.empid,
                task_ownder_name: userData && userData.Name,
                latitude: userData && userData.latitude.toString(),
                longitude: userData && userData.longitude.toString(),
                created_on: currentDate,
                name_of_file_uploaded: "",
            }
        ]

        console.log('reqData', reqData)

        let stringifiedJson = JSON.stringify(reqData)

        console.log('stringifiedJson', stringifiedJson)
        try {
            await axios.post(`https://cubixweberp.com:156/api/CRMTaskHistory`, stringifiedJson, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                console.log(res, 'taskSave')
                fetchHistoryData()
                setSelectedStatus(null)
                setShowLoader(false)
            })
        } catch (error) {
            console.error('taskStatusSave:', error);
            setShowLoader(false)
        }
    }

    // timelineImage
    const getImageForStatus = (status) => {
        switch (status) {
            case 'ACCEPTED_OPEN':
                return TaskOpen
            case 'TRAVEL_START':
                return TravelStart
            case 'TRAVEL_END':
                return TravelEnd
            case 'TASK_START':
                return TaskStart
            case 'TASK_END':
                return TaskEnd
            case 'ESCALATED':
                return TaskEscalated
            case 'ACCEPTED_ON_HOLD':
                return TaskHold
            case 'CUSTOMER_REJECTION':
                return Triangle
            case 'COMPLETED':
                return completed
            case 'BEYOND THE SCOPE':
                return beyondScope
            case 'HOLD':
                return pause
            case '':
                return TaskOpen
            case '0':
                return TaskOpen
            case 0:
                return TaskOpen
            // Add cases for other statuses as needed
            default:
                return TaskOpen;
        }
    };

    // toast

    const showFileUploadToast = () => {
        Toast.success('File Uploaded Successfully')
    }

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };

    const handleFileSelection = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            if (res) {
                console.log('res', res)
                setSelectedFile(res)
                console.log(
                    res.uri,
                    res.type, // mime type
                    res.name,
                    res.size
                );
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
                console.log('User cancelled the picker');
            } else {
                throw err;
            }
        }
    };

    const handleUpload = async () => {
        setUploadLoader(true)
        setShowLoader(true)
        try {
            // Create FormData object
            const formData = new FormData();
            const file = {
                uri: selectedFile[0].uri,
                type: selectedFile[0].type,
                name: selectedFile[0].name,
            };

            console.log(file)
            formData.append('image', file);; // Append the selected file
            formData.append('description', fileDescription);
            formData.append('UserId', taskHistory && taskHistory[0].id);
            formData.append('imagepath', selectedFile[0].uri);

            console.log(formData)
            // Send POST request using Axios
            const response = await axios.post(
                'https://cubixweberp.com:190/Posts',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Upload success:', response);
            if (response.status === 200) {
                setFileDescription('')
                setSelectedFile(null)
                showFileUploadToast()
                fetchHistoryData()
                setUploadLoader(false)
                setShowLoader(false)
            }
        } catch (error) {
            console.error('Upload error:', error);
            setShowLoader(false)
        }
    };

    // fetchPrevMsg
    const fetchPrevMessage = async () => {
        try {
            const response = await axios.get(`https://cubixweberp.com:156/api/CRMTaskChatList/cpays/${task_id}`)
            // console.log(response)
            if (response.status === 200) {
                setChatData(response.data)
            }
        } catch (error) {
            console.error('fetchPrevMessageErr:', error);
        }
    }

    // console.log('chatData', chatData)

    useEffect(() => {
        if (task_id) {
            fetchPrevMessage()
        }
    }, [task_id])

    // send msg

    const sendMsg = async () => {
        setChatMsg('')
        let msgData = [
            {
                cmpcode: 'CPAYS',
                mode: 'ENTRY',
                task_id: task_id,
                chat_message: chatMsg,
                task_ownder_id: taskData[0]?.task_owner_id,
                created_on: formattedDate,
                status: "n"
            }
        ]

        let stringifiedJson = JSON.stringify(msgData)
        console.log('stringifiedJson', stringifiedJson)
        try {
            // Obtain the FCM token of the user
            // const fcmToken = await messaging().getToken();

            // Construct the notification payload
            // const notification = {
            //     to: 'edsSctpeTtu9oZU8QS2bAo:APA91bFT-3ezq97SOM4K5v7BJkqXHX1c8ExQbMh6VG6aP9M0i2o-5WCq0dN1HE6uRXQ8IXPZvBMGsLTgoaEkhQd8_F7WRzYZ6m11MR9FdHYENGNLNU6zz7VegpbKAaEhZt1ZL-PiAanx',
            //     from: fcmToken,
            //     notification: {
            //         title: 'New Message',
            //         body: {
            //             task_id: task_id,
            //             chat_message: chatMsg,
            //             task_ownder_id: taskData[0]?.task_owner_id,
            //         },
            //         // You can customize the notification further as needed
            //     },
            // };

            const notification = {

                // to: 'e7FBPovdT_O-VmFq4oIQQP:APA91bFpa63ZJaNOirwHMcudcroP_jaWfUTeSGNelHlQrbh-EMuNuPL9YFoL8S03UIFrgy7IS060Xx0DSbfSau9vqz9MUSYEGMC34e9JfjrKz4WMJ6-IQ1wx0dL6AIWl3CE4akEtMm14',
                to: taskData[0].DEVICETOKEN_admin ? taskData[0].DEVICETOKEN_admin : "",
                // to: 'e9U5gETuS8ifQ99XJ3AGnN:APA91bHNgP_H0Kkpfwnmu9UjDYeEvOlKSkLJnUUqTdSb257zdVcLdXLHTjS2ycaQaBVD7Qc5chIVo-5RtuHWaeCwLpI2MuafneZgl90tpubS9wUd1l4irhuKSZHZ42xXb231-z0ayg8Z',
                notification: {
                    title: 'New Message',
                    body: 'You have a new message!', // Body should be a string
                },
                // Optionally include data payload
                data: {
                    task_id: task_id,
                    chat_message: chatMsg,
                    task_ownder_id: taskData[0]?.task_owner_id,
                    created_on: taskData[0].created_on,
                    task_scheduledon: taskData[0].task_scheduledon
                }
            };


            console.log('notification', notification)

            const response = await axios.post(`https://cubixweberp.com:156/api/CRMTaskChat`, stringifiedJson, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.status === 200) {
                // Send the FCM token to the FCM API
                fetchPrevMessage()
                await sendFcmTokenToApi(notification);
                console.log(response.data)
            }
            // console.log(response)
            // fetchPrevMessage()
            // if (response) {
            // }
        } catch (error) {
            console.error('chat error:', error);
        }
    }

    // const sendFcmTokenToApi = async (notification) => {
    //     try {
    //         if (!notification) {
    //             throw new Error('Notification object is null or undefined.');
    //         }

    //         console.log('notificationFromsendFcmTokenToApi', notification);

    //         // Send the notification using the FCM token
    //         const response = await messaging().sendMessage({
    //             to: notification.to, // Use the provided token or the retrieved one
    //             // to: 'e7FBPovdT_O-VmFq4oIQQP:APA91bFpa63ZJaNOirwHMcudcroP_jaWfUTeSGNelHlQrbh-EMuNuPL9YFoL8S03UIFrgy7IS060Xx0DSbfSau9vqz9MUSYEGMC34e9JfjrKz4WMJ6-IQ1wx0dL6AIWl3CE4akEtMm14',
    //             notification: {
    //                 title: notification.notification ? notification.notification.title : '',
    //                 body: notification.notification ? notification.notification.body : '',
    //             },
    //             data: notification.data || {}, // Optionally include data payload
    //         });

    //         if (response) {
    //             console.log('FCM token sent to API successfully.', response.data);
    //         } else {
    //             throw new Error('Failed to send FCM token to API. Response is null.');
    //         }
    //     } catch (error) {
    //         console.error('Error sending FCM token to API:', error);
    //     }
    // };




    // Function to send the FCM token to the FCM API
    const sendFcmTokenToApi = async (notification) => {
        try {
            const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification, {
                // const response = await axios.post('https://fcm.googleapis.com/v1/projects/nativechatapp-9398f/messages:send', notification, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${SERVER_KEY}` // Replace with your actual authorization token
                }
            });

            console.log('FCM token sent to API:', response.data);
        } catch (error) {
            console.error('Error sending FCM token to API:', error);
        }
    };

    const getImage = async () => {
        setImagePoP(true)
        if (taskHistory) {
            try {
                const response = await axios.get(`https://cubixweberp.com:156/api/CRMTAskImageList/cpays/${taskHistory[0].id}`)
                console.log(response.data)
                setImageApiData(response.data)
            } catch (error) {
                console.log('getImageError', error)
            }
        }
    }

    const imgBaseUrl = "https://cubixweberp.com:186/dummy/";

    useEffect(() => {
        if (imageApiData) {
            const modifiedData = imageApiData.map(item => {
                const imagePathParts = item.Imagepath.split("\\");
                const filename = imagePathParts[imagePathParts.length - 1];
                const imagePath = imgBaseUrl + filename;

                return {
                    ...item,
                    Imagepath: imagePath
                };
            });
            // console.log(modifiedData);
            if (modifiedData) setModifiedImgData(modifiedData)
        }

    }, [imageApiData])


    console.log('modifiedImgData', modifiedImgData)


    useEffect(() => {
        if (taskData) {
            const fetchUserAttendance = async () => {
                try {
                    const response = await axios.get(`https://cubixweberp.com:156/api/CRMAttendanceList/CPAYS/${taskData[0].task_owner_id}`);
                    setUserAttendance(response.data);
                } catch (error) {
                    console.error('Error fetching user attendance:', error);
                }
            };

            fetchUserAttendance();
        }

    }, [taskData]);

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
                // const latitude = userAttendance && parseFloat(userAttendance[0].latitude);
                // const longitude = userAttendance && parseFloat(userAttendance[0].longitude);


                // const fetchUserData = async () => {
                //     try {
                //         let userDataJson = await AsyncStorage.getItem('userData');
                //         let userData = JSON.parse(userDataJson) || {};

                //         // const latitude = mapRegion && mapRegion.latitude
                //         // const longitude = mapRegion && mapRegion.longitude

                //         // Add latitude and longitude to userData
                //         userData.latitude = latitude;
                //         userData.longitude = longitude;

                //         // Update state with modified userData
                //         setUserData(userData);
                //         setEmpId(userData.empid);

                //         // Store updated userData back to AsyncStorage
                //         await AsyncStorage.setItem('userData', JSON.stringify(userData));

                //         console.log('userData', userData);
                //         // showUserDataToast(userData);

                //     } catch (error) {
                //         console.error('Error fetching user data:', error);
                //     }
                // };

                // fetchUserData();
                // // Update UI or perform actions accordingly
                // setMapRegion(prevRegion => ({
                //     ...prevRegion,
                //     latitude,
                //     longitude
                // }));
            }
            // else if (punchTimeString === currentDateString && userAttendance[0].type === 'OUT') {
            //     console.log('Punch time is from today, but type is OUT');
            //     setCheckInOut('CHECKIN');
            // }
            else if (punchTimeString === currentDateString && userAttendance[0].type === 'OUT') {
                console.log('Punch time is from today, but type is OUT');
                setCheckInOut('CHECKIN');
            }
            else if (punchTimeString !== currentDateString && userAttendance[0].type === 'IN') {
                console.log('Punch time is not from today');
                setCheckInOut('CHECKIN');
            }
            else if (punchTimeString !== currentDateString) {
                console.log('Punch time is not from today');
                setCheckInOut('CHECKIN');
            }
        }
    }, [userAttendance]);

    const openNewMsg = async () => {
        await fetchPrevMessage()
        scrollToBottom()
        setmsgModal(false)
    }

    const navigateToNewTask = () => {
        setNewTaskModal(!newTaskModal)
        navigation.navigate('EmployeeHome')
    }

    // console.log('serverKey', SERVER_KEY)


    // console.log('userAttendanceFromDet', userAttendance)

    console.log('taskData', taskData)
    console.log('taskHistory', taskHistory)

    // console.log(allStatusList)

    console.log('statusArray', statusArray)

    // console.log(task_id, created_on, task_scheduledon)
    return (
        <SafeAreaView style={styles.container}>
            <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />
            <Header />

            <ScrollView vertical={!viewImgPop} style={{
                marginTop: 8
            }}>
                <View style={styles.TaskHomeWrapper}>

                    {/* HeaderNav */}
                    {/* <View style={styles.THHeaderNav}>
                        <View><Text>EXPERT</Text></View>
                        <View>
                            <Image source={require('../taskEmpImages/ic_hamburger.png')}></Image>
                        </View>
                    </View> */}


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
                    </ImageBackground>

                    <View style={{
                        width: "100%",
                        justifyContent: 'flex-start',
                        margin: 8,
                        padding: 4,
                        backgroundColor: 'white'
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Task Details</Text>
                    </View>

                    <View style={{
                        width: "100%",
                        justifyContent: 'flex-start',
                        margin: 8,
                        padding: 4,
                        backgroundColor: 'white'
                    }}>
                        <Text style={{ fontSize: 16, color: 'grey' }}>task name</Text>
                        <Text style={{ fontSize: 16, color: 'black' }}>{taskData ? taskData[0].task_name : ''}</Text>
                    </View>

                    <View style={{
                        width: "100%",
                        justifyContent: 'flex-start',
                        margin: 8,
                        padding: 4,
                        backgroundColor: 'white'
                    }}>
                        <Text style={{ fontSize: 16, color: 'grey' }}>task description</Text>
                        <Text style={{ fontSize: 16, color: 'black' }}>{taskData ? taskData[0].task_description : ''}</Text>

                    </View>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        backgroundColor: 'white'
                    }}>

                        <View style={{
                            width: '40%',
                            padding: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 14,
                            margin: 4,
                            borderColor: 'gray', // Border color
                            borderWidth: 1, // Border width
                            shadowColor: "black",
                            shadowOffset: {
                                width: 0,
                                height: 1,
                            },
                            shadowOpacity: 0.20,
                            shadowRadius: 1.41,

                            elevation: 1,

                        }}>
                            <Text style={{ fontSize: 16, color: 'grey' }}>travel included</Text>
                            <Text style={{ fontSize: 16, color: 'black' }}>{taskData ? taskData[0].include_travel : ''}</Text>
                        </View>
                        <View style={{
                            width: '40%',
                            padding: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 14,
                            margin: 4,
                            borderColor: 'gray', // Border color
                            borderWidth: 1, // Border width
                            shadowColor: "black",
                            shadowOffset: {
                                width: 0,
                                height: 1,
                            },
                            shadowOpacity: 0.20,
                            shadowRadius: 1.41,

                            elevation: 1,
                        }}>
                            <Text style={{ fontSize: 16, color: 'grey' }}>priority</Text>
                            <Text style={{ fontSize: 16, color: 'black' }}>{taskData ? taskData[0].priority : ''}</Text>
                        </View>
                        <View style={{
                            width: '40%',
                            padding: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 14,
                            margin: 4,
                            borderColor: 'gray', // Border color
                            borderWidth: 1, // Border width
                            shadowColor: "black",
                            shadowOffset: {
                                width: 0,
                                height: 1,
                            },
                            shadowOpacity: 0.20,
                            shadowRadius: 1.41,

                            elevation: 1,
                        }}>
                            <Text style={{ fontSize: 16, color: 'grey' }}>task start date</Text>
                            <Text style={{ fontSize: 16, color: 'black' }}>{scheduledDate}</Text>
                        </View>
                        <View style={{
                            width: '40%',
                            padding: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 14,
                            margin: 4,
                            borderColor: 'gray', // Border color
                            borderWidth: 1, // Border width
                            shadowColor: "black",
                            shadowOffset: {
                                width: 0,
                                height: 1,
                            },
                            shadowOpacity: 0.20,
                            shadowRadius: 1.41,

                            elevation: 1,
                        }}>
                            <Text style={{ fontSize: 16, color: 'grey' }}>task assigned to</Text>
                            <Text style={{ fontSize: 16, color: 'black' }}>{taskData ? taskData[0].task_owner_name : ''}</Text>
                        </View>
                        <View style={{
                            width: '40%',
                            padding: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 14,
                            margin: 4,
                            borderColor: 'gray', // Border color
                            borderWidth: 1, // Border width
                            shadowColor: "black",
                            shadowOffset: {
                                width: 0,
                                height: 1,
                            },
                            shadowOpacity: 0.20,
                            shadowRadius: 1.41,

                            elevation: 1,

                        }}>
                            <Text style={{ fontSize: 16, color: 'grey' }}>task type</Text>
                            <Text style={{ fontSize: 16, color: 'black' }}>{taskData ? taskData[0].task_type : ''}</Text>
                        </View>
                    </View>

                    {
                        // checkInOutText && checkInOutText === 'CHECKOUT' && showHighTaskCount && showHighTaskCount[0].CNT === 0 &&
                        checkInOutText && checkInOutText === 'CHECKOUT' &&

                        <>
                            <View style={{
                                width: '98%',
                                padding: 12,
                                margin: 8,
                                backgroundColor: '#F8F8FF',
                                borderRadius: 4
                            }}>


                                <View>
                                    <Text style={{
                                        color: 'black'
                                    }}>select status</Text>
                                </View>

                                <View style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap'
                                }}>
                                    {
                                        endStatusFlow.length == 0 &&
                                        <>

                                            {
                                                statusArray.map((status, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => {
                                                            if (isActiveTask) {
                                                                console.log('insideATTouch')
                                                                handleStatusClick(status);
                                                            } else {
                                                                setOpenTaskInactiveWarn(true)
                                                                console.log('insideIACT')
                                                            }
                                                        }}
                                                        style={{
                                                            backgroundColor: selectedStatus === status ? '#0D6EFD' : '#F1F1F1',
                                                            padding: 8,
                                                            margin: 4,
                                                            borderRadius: 4,
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            width: 'auto',
                                                            height: "auto"
                                                        }}
                                                    >
                                                        <Image style={(status === 'COMPLETED' || status === 'HOLD') ? { width: 40, height: 40 } : null} source={getImageForStatus(status)}></Image>
                                                        <Text style={{ color: selectedStatus === status ? 'white' : 'black' }}>{status}</Text>
                                                    </TouchableOpacity>
                                                ))
                                            }
                                        </>
                                    }

                                    {
                                        endStatusFlow.length > 0 &&
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: '#0D6EFD',
                                                padding: 8,
                                                margin: 4,
                                                borderRadius: 4
                                            }}
                                        >
                                            <Text style={{ color: 'white' }}>{endStatusFlow[0]}</Text>
                                        </TouchableOpacity>
                                    }

                                </View>

                                <View>
                                    {
                                        endStatusFlow.length == 0 &&
                                        <>
                                            <View>
                                                <Text>optional</Text>
                                            </View>
                                            <View style={[styles.inputContainer]}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder='Enter description'
                                                    onChangeText={text => setStatusDescription(text)}
                                                    value={statusDescription}
                                                />
                                            </View>
                                        </>
                                    }

                                    {
                                        selectedStatus &&
                                        <TouchableOpacity
                                            onPress={() => taskStatusSave()}
                                            style={{
                                                width: '20%',
                                                margin: 4,
                                                color: 'white',
                                                backgroundColor: '#0D6EFD',
                                                padding: 8,
                                                borderRadius: 4
                                            }}>
                                            <Text style={{
                                                color: 'white',
                                                fontSize: 15
                                            }}>Save</Text>
                                        </TouchableOpacity>
                                    }
                                </View>

                            </View>

                            <View style={{
                                width: '98%',
                                padding: 12,
                                margin: 8,
                                backgroundColor: '#F8F8FF',
                                borderRadius: 4
                            }}>


                                <View>
                                    <Text style={{
                                        color: 'black'
                                    }}>upload files</Text>
                                </View>

                                <View style={{
                                    width: '100%'
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <View>
                                            <TouchableOpacity onPress={handleFileSelection} style={{
                                                width: 'auto',
                                                margin: 4,
                                                color: 'white',
                                                backgroundColor: '#EFEFEF',
                                                padding: 8,
                                                borderRadius: 4
                                            }}>
                                                <Text style={{
                                                    color: 'black',
                                                    fontSize: 15
                                                }}>Choose file</Text>
                                            </TouchableOpacity>
                                            {
                                                selectedFile ? <Text>{selectedFile[0].name}</Text> :
                                                    <Text>No File Chosen</Text>
                                            }
                                        </View>

                                        {
                                            viewImage &&
                                            <TouchableOpacity onPress={getImage} style={{
                                                width: '30%',
                                                margin: 4,
                                                color: 'white',
                                                backgroundColor: '#0D6EFD',
                                                padding: 8,
                                                borderRadius: 4
                                            }}>
                                                <Text style={{
                                                    color: 'white',
                                                    fontSize: 15
                                                }}>View Image</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                    <View style={[styles.inputContainer]}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder='Enter description'
                                            onChangeText={text => setFileDescription(text)}
                                            value={fileDescription}
                                        />
                                    </View>
                                    {
                                        selectedFile && fileDescription &&
                                        <>
                                            {
                                                uploadLoader ? <ActivityIndicator size="large" color="green"></ActivityIndicator> :
                                                    <TouchableOpacity onPress={handleUpload} style={{
                                                        width: '20%',
                                                        margin: 4,
                                                        color: 'white',
                                                        backgroundColor: '#FFC107',
                                                        padding: 8,
                                                        borderRadius: 4
                                                    }}>
                                                        <Text style={{
                                                            color: 'black',
                                                            fontSize: 15
                                                        }}>Upload</Text>
                                                    </TouchableOpacity>
                                            }
                                        </>

                                    }
                                </View>

                            </View>
                        </>
                    }

                    {
                        checkInOutText && checkInOutText === 'CHECKIN' &&

                        <View style={{
                            margin: 8
                        }}>
                            <Text style={{
                                color: 'red',
                                fontWeight: 'bold'
                            }}>You need to check in to update tasks</Text>
                        </View>
                    }

                    {/* {
                        showHighTaskCount && showHighTaskCount[0]?.CNT !== 0 &&
                        <View style={{
                            margin: 8
                        }}>
                            <Text style={{
                                color: 'red',
                                fontWeight: 'bold'
                            }}>Please complete previous tasks</Text>
                        </View>
                    } */}


                    <View style={{
                        width: '100%',
                        paddingHorizontal: 6,
                        backgroundColor: '#F1F1FB',
                    }}>

                        <View>
                            <Text style={{
                                color: 'black',
                                fontSize: 18,
                                fontWeight: 'bold'
                            }}>Task timeline</Text>
                        </View>
                        {
                            taskHistory?.length == 0 &&
                            <View>
                                <Text style={{
                                    color: 'black'
                                }}>no activity to show</Text>
                            </View>
                        }

                        {
                            taskHistory?.length > 0 &&

                            <View style={{
                                width: '100%',
                                marginTop: 20,
                                backgroundColor: '#F1F1FB',
                                padding: 8,
                                marginLeft: 24,
                                borderLeftWidth: 2, borderLeftColor: '#ff1010',
                                position: 'relative'

                            }}>
                                {
                                    taskHistory.map((history, index) => (
                                        <View key={index} style={{
                                            // flexDirection: 'row',
                                            width: '60%',
                                            alignItems: 'left',
                                            margin: 12
                                            // position: 'relative'

                                        }}>
                                            <View style={{
                                                backgroundColor: 'white',
                                                width: 45,
                                                height: 45,
                                                borderRadius: 50,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                position: 'absolute',
                                                zIndex: 2,
                                                left: -42,
                                                top: 20
                                            }}>
                                                <Image style={(history.task_stage === 'COMPLETED' || history.task_stage === 'HOLD') ? { width: 40, height: 40 } : null} source={getImageForStatus(history.task_stage)}></Image>
                                            </View>
                                            <View style={{
                                                marginLeft: 10,
                                                // borderLeftWidth: 2, borderLeftColor: '#ff1010'
                                            }}>
                                                <View style={{
                                                    backgroundColor: 'white',
                                                    padding: 8,
                                                    margin: 4,
                                                    marginLeft: 25,
                                                }}>
                                                    <Text style={{
                                                        color: 'black'
                                                    }}>{formatDate(history.created_on)}</Text>
                                                </View>

                                                <View style={{
                                                    backgroundColor: '#F0F8FF',
                                                    padding: 8,
                                                    margin: 4,
                                                    marginLeft: 25,
                                                }}>
                                                    <Text style={{ color: 'black', fontSize: 16 }}>{history.task_stage}</Text>
                                                    <Text style={{ color: 'black', marginTop: 4 }}>{history.task_status_description}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                }

                            </View>
                        }
                    </View>



                </View>
            </ScrollView>
            {/* imgPop */}
            {
                viewImgPop &&

                <View style={styles.ViewImgModalWrapper}>
                    <View style={styles.ViewImgModal}>

                        <View style={{
                            flexDirection: "row",
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8
                        }}>
                            <Text style={{
                                padding: 8,
                                margin: 4,
                                color: 'black',
                                fontSize: 18,
                                fontWeight: 'bold'
                            }}>File Details</Text>

                            <TouchableOpacity onPress={() => setImagePoP(false)}>
                                <Image style={{ width: 30, height: 30 }} source={require('../taskEmpImages/closeIcon.png')}></Image>
                            </TouchableOpacity>
                        </View>

                        <ScrollView vertical={true}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                marginTop: 12,
                                marginBottom: 12
                            }}>

                                {
                                    modifiedImgData && modifiedImgData.map((item, index) => (
                                        <View style={{
                                            width: '40%',
                                            margin: 4,
                                            justifyContent: "center",
                                            alignItems: 'center',

                                            // borderColor: 'red',
                                            // borderWidth: 2
                                        }} key={index}>
                                            <Image source={{ uri: item.Imagepath }} style={{ width: '100%', height: 200, }}></Image>
                                            <Text>{item.Description ? item.Description : ""}</Text>
                                        </View>
                                    ))
                                }

                            </View>
                        </ScrollView>


                    </View>
                </View>
            }


            {/* chatBox */}

            <View style={styles.ChatIcon}>
                <TouchableOpacity onPress={() => setChatBoxView(!chatBoxView)}>
                    <Image source={require('../taskEmpImages/chatIcon.png')} style={{ width: 50, height: 50 }}></Image>
                </TouchableOpacity>
            </View>

            {
                chatBoxView &&
                <View style={styles.ViewImgModalWrapper}>
                    <View style={styles.ViewImgModal}>

                        <View style={{
                            flexDirection: "row",
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8
                        }}>
                            <Text style={{
                                padding: 8,
                                margin: 4,
                                color: 'black',
                                fontSize: 18,
                                fontWeight: 'bold'
                            }}>Chat</Text>

                            <TouchableOpacity onPress={() => setChatBoxView(!chatBoxView)}>
                                <Image style={{ width: 30, height: 30 }} source={require('../taskEmpImages/closeIcon.png')}></Image>
                            </TouchableOpacity>
                        </View>

                        <ScrollView vertical={true} ref={scrollViewRef} onLayout={scrollToBottom} style={{
                            padding: 8
                        }}>
                            <View style={{
                                backgroundColor: "#F3F3F3",
                                minHeight: 500,
                                padding: 12,
                            }}>
                                {
                                    chatData && chatData.map((chat, index) => (
                                        <View style={{
                                            width: '100%',
                                            justifyContent: chat.user_id === userData.empid ? 'flex-end' : 'flex-start',
                                            flexDirection: 'row'
                                        }} key={index}>
                                            <View style={{
                                                backgroundColor: chat.user_id === userData.empid ? 'white' : '#F0F8FF',
                                                padding: 12,
                                                margin: 8
                                            }}>
                                                <Text style={{ color: 'black' }}>{chat.chat_message}</Text>
                                            </View>
                                        </View>
                                    ))
                                }
                            </View>
                        </ScrollView>
                        <View style={[styles.inputContainer]}>
                            <View style={{
                                padding: 8,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <TextInput
                                    // style={[styles.input, { backgroundColor: '#E0FFFF' }]}
                                    style={{ backgroundColor: '#E0FFFF', width: chatMsg !== '' ? '80%' : '100%' }}
                                    placeholder='Type a message'
                                    onChangeText={text => setChatMsg(text)}
                                    value={chatMsg}
                                />
                                {
                                    chatMsg !== '' &&
                                    <TouchableOpacity onPress={sendMsg} style={{
                                        padding: 8,
                                        borderRadius: 4,
                                        backgroundColor: '#0D6EFD'
                                    }}>
                                        <Text style={{ color: 'white' }}>Send</Text>
                                    </TouchableOpacity>

                                }
                            </View>
                        </View>
                    </View>
                </View>
            }

            {/* {
                chatBoxView && chatOpen === false &&

                <View style={styles.ViewImgModalWrapper}>
                    <View style={styles.ViewImgModal}>

                        <View style={{
                            flexDirection: "row",
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8
                        }}>
                            <Text style={{
                                padding: 8,
                                margin: 4,
                                color: 'black',
                                fontSize: 18,
                                fontWeight: 'bold'
                            }}>Chat</Text>

                            <TouchableOpacity onPress={() => setChatBoxView(false)}>
                                <Image style={{ width: 30, height: 30 }} source={require('../taskEmpImages/closeIcon.png')}></Image>
                            </TouchableOpacity>
                        </View>

                        <ScrollView vertical={true} style={{
                            padding: 8
                        }}>
                            <View style={{
                                backgroundColor: "#F3F3F3",
                                minHeight: 500,
                                padding: 12,
                            }}>
                                {
                                    chatData && chatData.map((chat, index) => (
                                        <View style={{
                                            width: '100%',
                                            justifyContent: chat.user_id === userData.empid ? 'flex-end' : 'flex-start',
                                            flexDirection: 'row'
                                        }} key={index}>
                                            <View style={{
                                                backgroundColor: chat.user_id === userData.empid ? 'white' : '#F0F8FF',
                                                padding: 12,
                                                margin: 8
                                            }}>
                                                <Text style={{ color: 'black' }}>{chat.chat_message}</Text>
                                            </View>
                                        </View>
                                    ))
                                }
                            </View>
                        </ScrollView>
                        <View style={[styles.inputContainer]}>
                            <View style={{
                                padding: 8,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <TextInput
                                    // style={[styles.input, { backgroundColor: '#E0FFFF' }]}
                                    style={{ backgroundColor: '#E0FFFF', width: chatMsg !== '' ? '80%' : '100%' }}
                                    placeholder='Type a message'
                                    onChangeText={text => setChatMsg(text)}
                                    value={chatMsg}
                                />
                                {
                                    chatMsg !== '' &&
                                    <TouchableOpacity onPress={sendMsg} style={{
                                        padding: 8,
                                        borderRadius: 4,
                                        backgroundColor: '#0D6EFD'
                                    }}>
                                        <Text style={{ color: 'white' }}>Send</Text>
                                    </TouchableOpacity>

                                }
                            </View>
                        </View>
                    </View>
                </View>
            } */}

            {
                showLoader &&
                <Loader visible={showLoader} />
            }

            {
                msgModal &&
                <View
                    // visible={modalVisible}
                    // animationType="slide"
                    // onRequestClose={closeModal}
                    style={styles.mapmodalContainer}
                >
                    {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> */}
                    <View style={styles.mapmodalContent}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>New Message Received!</Text>
                        <View>
                            <Text>
                                {messageData.task_ownder_id} send you a message
                            </Text>
                        </View>
                        {/* <Button title="OpenChat" onPress={() => navigateToTaskDetails(messageData)} /> */}
                        <Button title="OpenChat" onPress={() => openNewMsg()} />
                    </View>
                </View>
            }

            {
                newTaskModal &&
                <View
                    // visible={modalVisible}
                    // animationType="slide"
                    // onRequestClose={closeModal}
                    style={styles.mapmodalContainer}
                >
                    {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> */}
                    <View style={styles.mapmodalContent}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>New Task assigned</Text>
                        <View>
                            <Text>
                                {messageData.task_creator_id} assigned you a Task
                            </Text>
                        </View>
                        {/* <Button title="OpenChat" onPress={() => setNewTaskModal(!newTaskModal)} /> */}
                        <Button title="OpenChat" onPress={() => navigateToNewTask()} />
                    </View>
                </View>
            }

            {
                openTaskInactiveWarn &&
                <View style={styles.mapmodalContainer}>
                    <View style={styles.mapmodalContent}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Please complete or hold the current active Task</Text>
                        <View style={{ marginTop: 12, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setOpenTaskInactiveWarn(false)} style={{ backgroundColor: 'red', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 4 }}>
                                <Text style={{ color: 'white' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }

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
        backgroundColor: 'white'
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
    ViewImgModalWrapper: {
        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    ViewImgModal: {
        backgroundColor: 'white',
        position: 'fixed',
        top: '15%',
        left: '6%',
        width: '90%',
        height: '70%',
        borderRadius: 8
    },
    ChatIcon: {
        position: 'absolute',
        right: 15,
        bottom: 15
    },
    mapmodalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    mapmodalContent: {
        backgroundColor: '#F7F7F7',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '94%'
    },
})

export default TaskDetails