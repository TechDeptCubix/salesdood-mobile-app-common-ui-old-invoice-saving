import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';

const QrCodeScanner = ({ setQrScannedData, setShowQrScanner }) => {

    const [hasPermission, setHasPermission] = useState(false);
    const devices = useCameraDevices();
    const device = devices.back;

    const backCamera = devices.find(device => device.position === 'back');


    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes) => {
            // Alert.alert('QR Code Scanned', `Data: ${codes[0].displayValue}`);
            Alert.alert('QR Code Scanned', `Data: ${codes[0].value}`);
            console.log('codes', codes)

            setQrScannedData(codes[0].value)
            setShowQrScanner(false)

        },
    });

    useEffect(() => {
        const requestCameraPermission = async () => {
            const cameraPermission = await Camera.requestCameraPermission();
            console.log('cameraPermission', cameraPermission)
            setHasPermission(cameraPermission === 'granted');
        };

        requestCameraPermission();
    }, []);

    useEffect(() => {
        // console.log('devices', devices);
        // console.log('device', device);
    }, [devices, device]);


    useEffect(() => {
        console.log('hasPermission', hasPermission);
        // console.log('device', device);
        // console.log('backCamera', backCamera)
    }, [hasPermission, device, backCamera]);

    // if (device == null) return <Text>Loading...</Text>;
    if (!hasPermission) return <Text>No access to camera</Text>;



    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={backCamera}
                isActive={true}
                codeScanner={codeScanner}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 2
    },
});

export default QrCodeScanner;
