import React from 'react';
import { View, Button, Platform, PermissionsAndroid } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const generatePDF = async () => {
    // Ensure permissions for Android
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: 'Storage Permission',
                message: 'This app needs access to your storage to download the PDF',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Storage permission denied');
            return;
        }
    }

    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { background-color: #0054a6; color: white; padding: 10px 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .section { margin-bottom: 20px; }
          .section .label { font-weight: bold; }
          .section div { margin-bottom: 5px; }
          .item-list { border-top: 2px solid #0054a6; margin-top: 20px; padding-top: 20px; }
          .item-list .item { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .item-list .item div { flex: 1; padding: 0 5px; }
          .item-list .item .description { flex: 3; }
          .item-list .item .total { text-align: right; }
          .subtotal, .vat, .total { display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; }
          .total { font-size: 18px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Order Details</h1>
        </div>
        <div class="content">
          <div class="section">
            <div class="label">Customer Code:</div>
            <div>12051366</div>
          </div>
          <div class="section">
            <div class="label">Customer:</div>
            <div>CASH CUSTOMER-ALQUOZ</div>
          </div>
          <div class="section">
            <div class="label">Order Number:</div>
            <div>1395</div>
          </div>
          <div class="item-list">
            <div class="section">
              <div class="label">Item List</div>
              <div class="item">
                <div class="description">SICCATHERM 250W E27 CLEAR BRAND: SPARKLE</div>
                <div>Quantity: 50</div>
                <div>Unit Price: 28</div>
                <div class="total">1400</div>
              </div>
              <div class="item">
                <div class="description">MOBILE SOCKET 32A 3P+N+E CW60042H IP67 GEWISS</div>
                <div>Quantity: 5</div>
                <div>Unit Price: 39</div>
                <div class="total">195</div>
              </div>
              <div class="item">
                <div class="description">MOBILE TYPE PLUG 32A 3P+N+E CW60042H IP67 GEWISS</div>
                <div>Quantity: 5</div>
                <div>Unit Price: 30</div>
                <div class="total">150</div>
              </div>
              <div class="item">
                <div class="description">TUBE 4 FEET T8 BASIC 36W/765 COOL DAYLIGHT 2500lm G13 OSRAM</div>
                <div>Quantity: 50</div>
                <div>Unit Price: 2.45</div>
                <div class="total">122.5</div>
              </div>
              <div class="item">
                <div class="description">ECON CERAMIC HOLDER E27</div>
                <div>Quantity: 50</div>
                <div>Unit Price: 1.25</div>
                <div class="total">62.5</div>
              </div>
              <div class="item">
                <div class="description">TUBE INSECT KILLER 15W/10 G13 T8 ACTINIC BL MAKE: PHILIPS</div>
                <div>Quantity: 50</div>
                <div>Unit Price: 14.5</div>
                <div class="total">725</div>
              </div>
            </div>
          </div>
          <div class="subtotal">
            <div>Subtotal:</div>
            <div>2655</div>
          </div>
          <div class="vat">
            <div>VAT (5%):</div>
            <div>132.75</div>
          </div>
          <div class="total">
            <div>Total:</div>
            <div>2787.75</div>
          </div>
        </div>
      </body>
    </html>
  `;


    // Generate PDF
    const options = {
        html: htmlContent,
        fileName: 'order-details',
        directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);

    // Share PDF
    Share.open({
        title: 'Order Details',
        url: `file://${file.filePath}`,
        type: 'application/pdf',
    });
};

const PdfPopTest = ({ route }) => (
    
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Generate PDF" onPress={generatePDF} />
    </View>
);

export default PdfPopTest;


// export default PdfPopTest