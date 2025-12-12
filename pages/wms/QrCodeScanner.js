import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

const QrCodeScanner = () => {
    const [scanResult, setScanResult] = useState(null);

    // Callback when QR code is scanned
    const onScanSuccess = (e) => {
        setScanResult(e.data);  // Store the QR code data
    };

    return (
        <View style={{ flex: 1 }}>
            {scanResult ? (
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <Text>Scanned QR Code:</Text>
                    <Text>{scanResult}</Text>
                    <TouchableOpacity
                        onPress={() => setScanResult(null)} // Reset scan result
                        style={{ marginTop: 20, padding: 10, backgroundColor: '#007BFF' }}
                    >
                        <Text style={{ color: '#fff' }}>Scan Another</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <QRCodeScanner
                    onRead={onScanSuccess}
                    // flashMode={RNCamera.Constants.FlashMode.auto} // Auto flash mode
                    topContent={
                        <Text style={{ padding: 20, fontSize: 18, textAlign: 'center' }}>
                            Scan a QR code to get the data.
                        </Text>
                    }
                    bottomContent={
                        <TouchableOpacity style={{ padding: 10, backgroundColor: '#007BFF', marginBottom: 20 }}>
                            <Text style={{ color: '#fff' }}>Cancel</Text>
                        </TouchableOpacity>
                    }
                />
            )}
        </View>
    );
};

export default QrCodeScanner;
