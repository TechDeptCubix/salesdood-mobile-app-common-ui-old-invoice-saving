import React, { useEffect, useState } from 'react';
import { View, Button, Platform, PermissionsAndroid, ScrollView, StyleSheet, Image, Text, FlatList } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';




const PdfTest = ({ route }) => {
  const { data, itemList } = route.params;
  const [pdfUri, setPdfUri] = useState(null);

  const phoneLogo = require('../images/phoneLogo.png');
  const letterLogo = require('../images/letterLogo.png');

  const [phoneLogoBase64, setPhoneLogoBase64] = useState('');
  const [letterLogoBase64, setLetterLogoBase64] = useState('');

  const subTotal = itemList && itemList.reduce((sum, item) => sum + (item.line_total || 0), 0)

  const convertImageToBase64 = async (image) => {
    const imageSource = resolveAssetSource(image);
    const base64String = await RNFS.readFile(imageSource.uri, 'base64');
    return `data:image/png;base64,${base64String}`;
  };

  useEffect(() => {
    const loadImages = async () => {
      const phoneLogoBase64String = await convertImageToBase64(phoneLogo);
      const letterLogoBase64String = await convertImageToBase64(letterLogo);
      setPhoneLogoBase64(phoneLogoBase64String);
      setLetterLogoBase64(letterLogoBase64String);
    };

    loadImages();
  }, []);

  console.log('phoneLogo', phoneLogo)
  console.log('letterLogo', letterLogo)

  console.log('phoneLogoBase64', phoneLogoBase64)
  console.log('letterLogoBase64', letterLogoBase64)

  const generatePDF = async () => {
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

    const htmlCONTTest = `
<html>

<head>
   
 <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .InvCard {
            display: flex;
            flex-direction: column;
            align-items: center;
            /* margin: 30px; */
            width: 100%;
            height: 100%;
            background-color: white;
            border-radius: 12px;
        }

        .header {
            background-color: #12151C;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
        }

        .HeadTop {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
        }

        .LogoContent {
            padding: 24px;
            width: 50%;
        }

        .CmpnyLogo {
            width: 80%;
            height: 150px;

        }

        .HeadInvoiceData {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 40%;
        }

        .InvcData {
            display: flex;
            flex-direction: row;
            color: white;
            margin: 12px 0 12px 0;
            font-weight: bold;
            fontFamily: InriaSans-Regular,
        }

        .HeadBottom {
            display: flex;
            flex-direction: row;
            width: 100%;
        }

        .ContactItem {
            display: flex;
            flex-direction: row;
            padding: 24px;
            color: white;
            align-items: center;
            font-size: 14px;
            margin-right: 12px;
             fontFamily: InriaSans-Regular,
        }

        .ContactItemImg {
            width: 25px;
            height: 25px;
            margin-right: 8px;
        }

        .content {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .section {
            padding-left: 12px;
            margin: 8px 0px;
        }

        .label {
            font-size: 14px;
            font-weight: bold;
             fontFamily: InriaSans-Regular,
        }

        .labelValue {
            font-size: 14px;
            margin: 4px 0;
             fontFamily: InriaSans-Regular,
        }

        .tableCont {
            /* width: 100%; */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 12px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        td {
            border-bottom: 1px solid gray;
            padding: 8px;
            text-align: left;
            color: rgb(75, 75, 75);
            font-size: 14px;
             fontFamily: InriaSans-Regular,
        }

        thead tr {
            border-bottom: 1px solid black;
        }

        th {
            text-align: left;
        }

        .subtotal,
        .vat,
        .grandTotal {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            font-size: 14px;
             fontFamily: InriaSans-Regular,
        }

        .grandTotal {
            font-size: 16px;
            font-weight: bold;
            color: blue;
             fontFamily: InriaSans-Regular,
        }
    </style>
  </head>

<body>
    <div class="InvCard">
        <div class="header">
            <div class="HeadTop">
                <div class="LogoContent">
                    <img src='./images/logo.png' alt="" class="CmpnyLogo">
                </div>
                <div class="HeadInvoiceData">
                    <div class="InvcData">
                        <div>Order No: </div>
                         <span>&nbsp;</span>
                        <div>${data[0].so_no}</div>
                    </div>
                    <div class="InvcData">
                        <div>Order Date: </div>
                         <span>&nbsp;</span>
                        <div> 06/17/2024</div>
                    </div>
                </div>
            </div>
            <div class="HeadBottom">
                <div class="ContactItem">
                    <img src="${phoneLogoBase64}" alt="" class="ContactItemImg">
                    <div>+123466789</div>
                </div>
                <div class="ContactItem">
                    <img src="${letterLogoBase64}" alt="" class="ContactItemImg">
                    <div>test@inv.com</div>
                </div>
            </div>
        </div>
        <div class="content">
            <div class="section">
                <div class="label">Customer Code:</div>
               <div  class="labelValue">${data[0].cust_acc}</div> 
            </div>
            <div class="section">
                <div class="label">Customer:</div>
               <div  class="labelValue">${data[0].accdesc}</div> 
            </div>
            <div class="section">
                <div class="label">Order Number:</div>
               <div  class="labelValue">${data[0].so_no}</div> 
            </div>
           
            <div class="tableCont">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                       
                         ${itemList.map(item => `
                        <tr>
                            <td>${item.idesc}</td>
                            <td>${item.tr_qty2}</td>
                            <td> ${item.so_cost}</td>
                            <td>${item.line_total}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="subtotal">
                <div>Subtotal:</div>
                 <div>${subTotal}</div>
            </div>
            <div class="vat">
                <div>VAT (5%):</div>
                 <div>${(data[0].so_amount * 0.05).toFixed(2)}</div>
            </div>
            <div class="grandTotal">
                <div>Grand Total:</div>
                 <div>${(parseFloat((data[0].so_amount * 0.05).toFixed(2)) + subTotal).toFixed(2)}</div>
            </div>

        </div>
    </div>
</body>

</html>
        
        `

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
              <div>${data[0].cust_acc}</div>
            </div>
            <div class="section">
              <div class="label">Customer:</div>
              <div>${data[0].accdesc}</div>
            </div>
            <div class="section">
              <div class="label">Order Number:</div>
              <div>${data[0].so_no}</div>
            </div>
            <div class="item-list">
              <div class="section">
                <div class="label">Item List</div>
                ${itemList.map(item => `
                  <div class="item">
                    <div class="description">${item.idesc}</div>
                    <div>Quantity: ${item.tr_qty2}</div>
                    <div>Unit Price: ${item.so_cost}</div>
                    <div>Total: ${item.line_total}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="subtotal">
              <div>Subtotal:</div>
             
              <div>${subTotal}</div>
            </div>
            <div class="vat">
              <div>VAT (5%):</div>
              <div>${(data[0].so_amount * 0.05).toFixed(2)}</div>
            </div>
           
          </div>
        </body>
      </html>
    `;

    // <div>${data[0].so_amount}</div>
    // <div class="total">
    //   <div>Total:</div>
    //   <div>${(data[0].so_amount + data[0].so_amount * 0.05).toFixed(2)}</div>
    // </div>

    let options = {
      // html: htmlContent,
      html: htmlCONTTest,
      fileName: 'orderDetails',
      directory: 'Documents',
    };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      setPdfUri(`file://${file.filePath}`);
      await Share.open({
        title: 'Share Order Details PDF',
        url: `file://${file.filePath}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  console.log('pdfUri', pdfUri)
  return (
    <View style={{ flex: 1 }}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headTop}>
              <View style={styles.logoContent}>
                <Image
                  source={require('../images/logo.png')}
                  style={styles.cmpnyLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headInvoiceData}>
                <View style={styles.invcData}>
                  <Text style={styles.WhiteTopText}>Order No:</Text>
                  <Text style={styles.WhiteTopText}>{data[0].so_no}</Text>
                </View>
                <View style={styles.invcData}>
                  <Text style={styles.WhiteTopText}>Order Date:</Text>
                  <Text style={styles.WhiteTopText}> 06/17/2024</Text>
                </View>
              </View>
            </View>
            <View style={styles.headBottom}>
              <View style={styles.contactItem}>
                <Image
                  source={require('../images/phoneLogo.png')}
                  style={styles.contactItemImg}
                  resizeMode="contain"
                />
                <Text style={styles.WhiteTopText}>+123466789</Text>
              </View>
              <View style={styles.contactItem}>
                <Image
                  source={require('../images/letterLogo.png')}
                  style={styles.contactItemImg}
                  resizeMode="contain"
                />
                <Text style={styles.WhiteTopText}>test@inv.com</Text>
              </View>
            </View>
          </View>
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Customer Code:</Text>
              <Text style={styles.labelValue}>{data[0].cust_acc}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.labelValue}>{data[0].accdesc}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Order Number:</Text>
              <Text style={styles.labelValue}>{data[0].so_no}</Text>
            </View>
            <View style={styles.tableCont}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Item</Text>
                <Text style={styles.tableHeaderText}>Quantity</Text>
                <Text style={styles.tableHeaderText}>Unit Price</Text>
                <Text style={styles.tableHeaderText}>Total</Text>
              </View>

              {
                itemList.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableCell}>{item.idesc}</Text>
                    <Text style={styles.tableCell}>{item.tr_qty2}</Text>
                    <Text style={styles.tableCell}>{item.so_cost}</Text>
                    <Text style={styles.tableCell}>{item.line_total}</Text>
                  </View>
                ))
              }
              {/* <FlatList
                data={itemList && itemList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.idesc}</Text>
                      <Text style={styles.tableCell}>{item.tr_qty2}</Text>
                      <Text style={styles.tableCell}>{item.so_cost}</Text>
                      <Text style={styles.tableCell}>{item.line_total}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>150263</Text>
                      <Text style={styles.tableCell}>150263</Text>
                      <Text style={styles.tableCell}>150263</Text>
                      <Text style={styles.tableCell}>150263</Text>
                    </View>
                  </>
                )}
              /> */}
            </View>
            {/* <ScrollView horizontal={true} style={{ width: '100%' }}>
            </ScrollView> */}
            <View style={styles.subtotal}>
              <Text>Subtotal:</Text>
              <Text>{subTotal}</Text>
            </View>
            <View style={styles.vat}>
              <Text>VAT (5%):</Text>
              <Text>{(data[0].so_amount * 0.05).toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalText}>Grand Total:</Text>
              <Text style={styles.grandTotalText}>{(parseFloat((data[0].so_amount * 0.05).toFixed(2)) + subTotal).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Generate PDF" onPress={generatePDF} />
      </View>

    </View>
  );
};


const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60, // Adjust this value as per your button height
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'black',
  },
  headTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  logoContent: {
    padding: 24,
    width: '50%',
  },
  cmpnyLogo: {
    width: '80%',
    height: 150,
  },
  headInvoiceData: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '40%',
  },
  invcData: {
    flexDirection: 'row',
    marginVertical: 12,
    fontWeight: 'bold',
    fontFamily: 'InriaSans-Regular',
  },
  WhiteTopText: {
    fontFamily: 'InriaSans-Regular',
    color: 'white'
  },
  headBottom: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  contactItemImg: {
    width: 25,
    height: 25,
    marginRight: 8,
  },
  content: {
    flexDirection: 'column',
    width: '100%',
    padding: 12,
  },
  section: {
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'InriaSans-Regular',

  },
  labelValue: {
    fontSize: 14,
    marginVertical: 4,
    fontFamily: 'InriaSans-Regular',

  },
  tableCont: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  subtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    fontSize: 14,
    fontFamily: 'InriaSans-Regular',

  },
  vat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    fontSize: 14,
    fontFamily: 'InriaSans-Regular',

  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
    fontFamily: 'InriaSans-Regular',

  },

  tableCont: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    width: '100%',
    paddingVertical: 8,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: "black",
    fontFamily: 'InriaSans-Regular',

  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    width: '100%',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: 'black',
    fontFamily: 'InriaSans-Regular',

  },
  grandTotalText: {
    fontSize: 16,
    color: 'blue',
    fontFamily: 'InriaSans-Bold',
  }
})

export default PdfTest