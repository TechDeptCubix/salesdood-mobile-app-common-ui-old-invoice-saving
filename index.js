/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import MainApp from './MainApp';
import './fireBaseMessaging'

AppRegistry.registerComponent(appName, () => MainApp);

// Optional: Register headless task explicitly if needed
// AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => firebaseMessaging);
