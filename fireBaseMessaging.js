// firebaseMessaging.js
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);

    if (remoteMessage.notification.title === 'New Delivery') {
        await AsyncStorage.setItem('gotoDriver', 'true');
    }
});
