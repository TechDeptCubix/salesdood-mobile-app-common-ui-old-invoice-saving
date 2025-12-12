import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, PermissionsAndroid, Alert } from 'react-native';
// import { RNCamera } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';


const NewQrCode = () => {
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        const requestCameraPermission = async () => {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to your camera to scan QR codes.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setHasPermission(true);
                } else {
                    setHasPermission(false);
                    Alert.alert('Permission Denied', 'Camera access is required to scan QR codes.');
                }
            } catch (err) {
                console.warn(err);
            }
        };

        requestCameraPermission();
    }, []);

    const onSuccess = (e) => {
        console.log('QRCodeScannerData ==>', e.data);
    };

    if (hasPermission === null) {
        return <Text>Requesting camera permission...</Text>;
    }

    if (hasPermission === false) {
        return <Text>Camera permission denied</Text>;
    }

    return (
        <QRCodeScanner
            onRead={onSuccess}
            // flashMode={RNCamera.Constants.FlashMode.torch}
            topContent={
                <Text style={styles.centerText}>
                    Go to <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on
                    your computer and scan the QR code.
                </Text>
            }
            bottomContent={
                <TouchableOpacity style={styles.buttonTouchable}>
                    <Text style={styles.buttonText}>OK. Got it!</Text>
                </TouchableOpacity>
            }
        />
    );
};

const styles = StyleSheet.create({
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777',
    },
    textBold: {
        fontWeight: '500',
        color: '#000',
    },
    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)',
    },
    buttonTouchable: {
        padding: 16,
    },
});

export default NewQrCode;
