import { View, Text } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MachineValidation from './pages/MachineValidation';
import Login from './pages/Login';
import Home from './pages/Home';
import CheckStock from './pages/CheckStock';
import CustomerDetails from './pages/CustomerDetails';
import MakeOrder from './pages/MakeOrder';
import PreviousOrde from './pages/PreviousOrde';
import OrderDetails from './pages/OrderDetails';
import EditQuotation from './pages/EditQuotation';
import PickingList from './pages/PickingList';
import PdfPopTest from './popups/PdfPopTest';
import PdfTest from './popups/PdfTest';
import PickingListDetailPage from './pages/PickingListDetailPage';
import QrCodeScanner from './pages/QrCodeScanner';
import Collections from './pages/Collections';
import HomeNew from './pages/HomeNew';
import AddCmp from './pages/AddCmp';
import NewCollections from './pages/NewCollections';
import SalesInvoice from './pages/SalesInvoice';
import PreviousSalesInvoice from './pages/PreviousSalesInvoice';
import DashHome from './dashPages/Home'
import DashBoardCreation from './dashPages/DashBoardCreation';
import PickListNew from './pages/PickListNew';
import MyPickList from './pages/MyPickList';
import CheckListNew from './pages/CheckListNew';
import MyCheckList from './pages/MyCheckList';
import DriverHome from './pages/DriverHome';
import EmployeeTaskHome from './taskEmployee/EmployeeTaskHome';

import messaging from '@react-native-firebase/messaging';
import CollectionReport from './pages/CollectionReport';
import SalesOrder from './pages/SalesOrder';
import SalesInvoiceNew from './pages/SalesInvoiceNew';
import InvoiceList from './pages/InvoiceList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderDataApp from './pages/RenderDataApp';
import LeadEntryForm from './pages/Lead/LeadEntryForm';
import LeadList from './pages/Lead/LeadList';
import MakeQuotation from './pages/MakeQuotation';
import QuotationList from './pages/QuotationList';
import QuotationDetails from './pages/QuotationDetails';
import Receipt from './pages/Receipt';
import MaterialRequest from './pages/MaterialRequest';
import GoodsCollectionDelivery from './pages/GoodsCollectionDelivery';
import GoodsCollectionDeliveryPoolList from './pages/GoodsCollectionDeliveryPoolList';
import SiteSurvey from './pages/SiteSurvey';
import InspectionMaintenanceReport from './pages/InspectionMaintenanceReport';

import ScopeAndBOQ from './pages/ScopeAndBOQ';
import HomeNewTasra from './pages/HomeNewTasra';
import PhysicalStock from "./pages/PhysicalStock"
import BarcodeLinking from './pages/BarcodeLinking';
import InvoiceVsReceipt from './pages/InvoiceVsReceipt';
import WarehouseList from './pages/WarehouseList';
import WarehousePoolList from './pages/WarehousePoolList';
import WarehouseListItemDetails from './pages/WarehouseListItemDetails';
import SalesReturn from './pages/sales_return/SalesReturn'
import SalesReturnEntry from './pages/sales_return/SalesReturnEntry'
import SplitItemScreen from './pages/SplitItemScreen';




const Stack = createNativeStackNavigator();

const MainApp = () => {

    const [fcmToken, setFcmToken] = useState(null);


    async function requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
        }
    }

    useEffect(() => {
        // Function to retrieve FCM token
        const retrieveFcmToken = async () => {
            try {
                const token = await messaging().getToken();
                setFcmToken(token);
            } catch (error) {
                console.error('Error retrieving FCM token:', error);
            }
        };

        // Call the function to retrieve FCM token
        retrieveFcmToken();

        // Add listener to refresh FCM token if it changes
        const unsubscribe = messaging().onTokenRefresh(retrieveFcmToken);

        // Clean up subscription when component unmounts
        return unsubscribe;
    }, []);


    useEffect(() => {
        requestUserPermission()
        // getToken()
    }, [])

    console.log('fcmToken', fcmToken)

    // // Define a navigation reference using useRef
    const navigationRef = useRef(null);

    // // Function to handle navigation to TaskDetails
    // const navigateToTaskDetails = (data) => {
    //     navigationRef.current?.navigate('TaskDetails', {
    //         task_id: data.task_id,
    //         created_on: data.created_on,
    //         task_scheduledon: data.task_scheduledon,
    //         openChat: true
    //     });
    // };

    // // Function to handle navigation to TaskDetails
    // const navigateToNewTaskDetails = (data) => {
    //     navigationRef.current?.navigate('EmployeeHome')
    //     // navigationRef.current?.navigate('TaskDetails', {
    //     //     task_id: data.task_id,
    //     //     created_on: data.created_on,
    //     //     task_scheduledon: data.task_scheduledon,
    //     //     openChat: false
    //     // });
    // };

    // // Configure messaging event handler
    messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Handle notification click event', remoteMessage);

        if (remoteMessage.notification.title === 'New Delivery') {
            // Navigate to TaskDetails screen with the task details
            navigationRef.current?.navigate('DriversApp')
        }
        // Check if the notification contains data

        // if (remoteMessage.notification.title === 'New Message') {
        //     // Extract the task details from the notification data
        //     const taskData = {
        //         task_id: remoteMessage.data.task_id,
        //         created_on: remoteMessage.data.created_on,
        //         task_scheduledon: remoteMessage.data.task_scheduledon
        //     };

        //     // Navigate to TaskDetails screen with the task details
        //     navigateToTaskDetails(taskData);
        // }

        // if (remoteMessage.notification.title === 'New Task') {
        //     // Extract the task details from the notification data
        //     const taskData = {
        //         task_id: remoteMessage.data.task_id,
        //         created_on: remoteMessage.data.created_on,
        //         task_scheduledon: remoteMessage.data.task_scheduledon
        //     };

        //     // Navigate to TaskDetails screen with the task details
        //     navigateToNewTaskDetails(taskData)
        // }



    });

    // // Function to handle FCM messages when the app is in the background or terminated
    const handleBackgroundMessage = async (remoteMessage) => {
        console.log('Message handled in the background!', remoteMessage);

        if (remoteMessage.notification.title === 'New Delivery') {
            await AsyncStorage.setItem('gotoDriver', 'true');
            // Navigate to TaskDetails screen with the task details
            navigationRef.current?.navigate('DriversApp')
        }
        // Check if the notification contains data
        // if (remoteMessage.notification.title === 'New Message') {
        //     // Extract the task details from the notification data
        //     const taskData = {
        //         task_id: remoteMessage.data.task_id,
        //         created_on: remoteMessage.data.created_on,
        //         task_scheduledon: remoteMessage.data.task_scheduledon
        //     };

        //     // Navigate to TaskDetails screen with the task details
        //     navigateToTaskDetails(taskData);
        // }

        // if (remoteMessage.notification.title === 'New Task') {
        //     // Extract the task details from the notification data
        //     const taskData = {
        //         task_id: remoteMessage.data.task_id,
        //         created_on: remoteMessage.data.created_on,
        //         task_scheduledon: remoteMessage.data.task_scheduledon
        //     };

        //     // Navigate to TaskDetails screen with the task details
        //     navigateToNewTaskDetails(taskData)
        // }



    };

    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);

        if (remoteMessage.notification.title === 'New Delivery') {
            await AsyncStorage.setItem('gotoDriver', 'true');
        }
    });


    // // Set up background message handler
    messaging().setBackgroundMessageHandler(handleBackgroundMessage);

    // // kill state
    messaging().getInitialNotification(handleBackgroundMessage)


    return (
        <NavigationContainer>
            <Stack.Navigator>

                {/* <Stack.Screen name='AddCmp' component={AddCmp} options={{ headerShown: false }} /> */}
                {/* <Stack.Screen name='RenderPdf' component={RenderDataApp} options={{ headerShown: false }} /> */}


                <Stack.Screen name='MachineValidation' component={MachineValidation} options={{ headerShown: false }} />
                <Stack.Screen name='LoginPage' component={Login} options={{ headerShown: false }} />
                {/* <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} /> */}
                <Stack.Screen name='Home' component={HomeNew} options={{ headerShown: false }} />
                <Stack.Screen name='HomeNewTasra' component={HomeNewTasra} options={{ headerShown: false }} />
                <Stack.Screen name='CheckStock' component={CheckStock} options={{ headerShown: false }} />
                <Stack.Screen name='CustomerDetails' component={CustomerDetails} options={{ headerShown: false }} />
                <Stack.Screen name='MakeQuotation' component={MakeQuotation} options={{ headerShown: false }} />
                <Stack.Screen name='QuotationList' component={QuotationList} options={{ headerShown: false }} />
                <Stack.Screen name='QuotationDetails' component={QuotationDetails} options={{ headerShown: false }} />
                <Stack.Screen name='MakeOrder' component={SalesOrder} options={{ headerShown: false }} />
                <Stack.Screen name='PreviousOrders' component={PreviousOrde} options={{ headerShown: false }} />
                <Stack.Screen name='OrderDetails' component={OrderDetails} options={{ headerShown: false }} />
                <Stack.Screen name='EditQuotation' component={EditQuotation} options={{ headerShown: false }} />
                <Stack.Screen name='PickingList' component={PickingList} options={{ headerShown: false }} />
                <Stack.Screen name='PdfTest' component={PdfTest} options={{ headerShown: false }} />
                <Stack.Screen name='PickingListDetails' component={PickingListDetailPage} options={{ headerShown: false }} />

                <Stack.Screen name='Receipt' component={Receipt} options={{ headerShown: false }} />
                <Stack.Screen name='MaterialRequest' component={MaterialRequest} options={{ headerShown: false }} />
                <Stack.Screen name='Collections' component={Collections} options={{ headerShown: false }} />
                <Stack.Screen name='NewCollections' component={NewCollections} options={{ headerShown: false }} />
                <Stack.Screen name='SalesInvoice' component={SalesInvoiceNew} options={{ headerShown: false }} />

                <Stack.Screen name='PreviousSalesInvoice' component={InvoiceList} options={{ headerShown: false }} />

                <Stack.Screen name='PickListNew' component={PickListNew} options={{ headerShown: false }} />
                <Stack.Screen name='MyPickingList' component={MyPickList} options={{ headerShown: false }} />
                <Stack.Screen name='CheckingListNew' component={CheckListNew} options={{ headerShown: false }} />
                <Stack.Screen name='MyCheckingList' component={MyCheckList} options={{ headerShown: false }} />
                <Stack.Screen name='CollectionReport' component={CollectionReport} options={{ headerShown: false }} />

                <Stack.Screen name='DriversApp' component={DriverHome} options={{ headerShown: false }} />

                <Stack.Screen name='LeadEntry' component={LeadEntryForm} options={{ headerShown: false }} />
                <Stack.Screen name='LeadList' component={LeadList} options={{ headerShown: false }} />

                {/* dashboard */}

                <Stack.Screen name='DashBoardHome' component={DashHome} options={{ headerShown: false }} />
                <Stack.Screen name='DashBoardCreation' component={DashBoardCreation} options={{ headerShown: false }} />

                {/* taskEmp */}
                <Stack.Screen name='EmployeeHome' component={EmployeeTaskHome} options={{ headerShown: false }} />




                <Stack.Screen name='QrCodeScanner' component={QrCodeScanner} options={{ headerShown: false }} />

                <Stack.Screen name='GoodsCollectionDelivery' component={GoodsCollectionDelivery} options={{ headerShown: false }} />
                
                <Stack.Screen name='WarehouseListItemDetails' component={WarehouseListItemDetails} options={{ headerShown: false }} />
                <Stack.Screen name='GoodsCollectionDeliveryPoolList' component={GoodsCollectionDeliveryPoolList} options={{ headerShown: false }} />
                <Stack.Screen name='WarehouseList' component={WarehouseList} options={{ headerShown: false }} />
                <Stack.Screen name='WarehousePoolList' component={WarehousePoolList} options={{ headerShown: false }} />

                
                
                <Stack.Screen name='SiteSurvey' component={SiteSurvey} options={{ headerShown: false }} />
                <Stack.Screen name='InspectionMaintenanceReport' component={InspectionMaintenanceReport} options={{ headerShown: false }} />
                <Stack.Screen name='ScopeAndBOQ' component={ScopeAndBOQ} options={{ headerShown: false }} />
                <Stack.Screen name='PhysicalStock' component={PhysicalStock} options={{ headerShown: false }} />
                <Stack.Screen name='BarcodeLinking' component={BarcodeLinking} options={{ headerShown: false }} />
                <Stack.Screen name='InvoiceVsReceipt' component={InvoiceVsReceipt} options={{ headerShown: false }} />
                <Stack.Screen name='SalesReturn' component={SalesReturn} options={{ headerShown: false }} />
                <Stack.Screen name='SalesReturnEntry' component={SalesReturnEntry} options={{ headerShown: false }} />
                <Stack.Screen name='SplitItemScreen' component={SplitItemScreen} options={{ headerShown: false }} />

                
               

                

                
            
                {/* <Stack.Screen name='SelectLocation' component={SelectLocation} options={{ headerShown: false }} />
                <Stack.Screen name='WmsHome' component={WmsHome} options={{ headerShown: false }} />
                
                <Stack.Screen name='PickingList' component={PickingList} options={{ headerShown: false }} />
                <Stack.Screen name='BinToBin' component={BinToBin} options={{ headerShown: false }} /> */}

            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default MainApp