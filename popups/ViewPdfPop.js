import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'

import React from 'react'


const ViewPdfPop = ({ setShowPdf, data, itemList }) => {

    console.log('data', data)
    console.log('itemList', itemList)

    // Sample data based on provided structure
    const sampleData = {
        customerCode: '12051366',
        customer: 'CASH CUSTOMER-ALQUOZ',
        orderNumber: '1395',
        items: [
            { desc: 'SICCATHERM 250W E27 CLEAR BRAND: SPARKLE', qty: 50, price: 28 },
            { desc: 'MOBILE SOCKET 32A 3P+N+E CW60042H IP67 GEWISS', qty: 5, price: 39 },
            { desc: 'MOBILE TYPE PLUG 32A 3P+N+E CW60042H IP67 GEWISS', qty: 5, price: 30 },
            { desc: 'TUBE 4 FEET T8 BASIC 36W/765 COOL DAYLIGHT 2500lm G13 OSRAM', qty: 50, price: 2.45 },
            { desc: 'ECON CERAMIC HOLDER E27', qty: 50, price: 1.25 },
            { desc: 'TUBE INSECT KILLER 15W/10 G13 T8 ACTINIC BL MAKE: PHILIPS', qty: 50, price: 14.5 },
        ],
        vat: 5,
    };

    const MyDocument = () => (
        <Document>
            <Page style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Order Details</Text>
                    <Text>Customer Code: {sampleData.customerCode}</Text>
                    <Text>Customer: {sampleData.customer}</Text>
                    <Text>Order Number: {sampleData.orderNumber}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.bold}>Item List</Text>
                    {sampleData.items.map((item, index) => (
                        <View key={index} style={styles.item}>
                            <Text>{item.desc}</Text>
                            <Text>{item.qty}</Text>
                            <Text>{item.price}</Text>
                            <Text>{item.qty * item.price}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text>Subtotal: {sampleData.items.reduce((acc, item) => acc + item.qty * item.price, 0)}</Text>
                    <Text>VAT ({sampleData.vat}%): {(sampleData.items.reduce((acc, item) => acc + item.qty * item.price, 0) * sampleData.vat) / 100}</Text>
                    <Text style={styles.total}>
                        Total: {sampleData.items.reduce((acc, item) => acc + item.qty * item.price, 0) + (sampleData.items.reduce((acc, item) => acc + item.qty * item.price, 0) * sampleData.vat) / 100}
                    </Text>
                </View>
            </Page>
        </Document>
    );

    const App = () => (
        <div>
            <PDFDownloadLink document={<MyDocument />} fileName="order-details.pdf">
                {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
            </PDFDownloadLink>
        </div>
    );

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <ScrollView>

                    <View style={styles.HomeTextCont}>
                        <Text style={styles.HomeText}>Pdf</Text>
                        <View>
                            <TouchableOpacity style={styles.SettingsWrap} onPress={() => setShowPdf(false)}>
                                <Image style={styles.HeadIcon} source={require('../images/closeWhiteImg.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View>
                        <App />
                    </View>

                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
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
    modalContent: {
        // backgroundColor: '#F7F7F7',
        // backgroundColor: '#5A55CA',
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 5,
        // alignItems: 'center',
        width: '95%',
        minHeight: 750,
        maxHeight: Dimensions.get('window').height
    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    },
    HomeText: {
        fontSize: 18,
        color: 'black',
        borderBottomColor: 'gold',
        borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'InriaSans-Bold'
    },
    SettingsWrap: {
        backgroundColor: '#189A2E',
        backgroundColor: 'red',
        borderRadius: 50,
        padding: 6
    },
    HeadIcon: {
        width: 20,
        height: 20
    },
    // 

    page: { padding: 30 },
    section: { marginBottom: 10 },
    header: { fontSize: 12, marginBottom: 10 },
    item: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    bold: { fontWeight: 'bold' },
    total: { marginTop: 10, fontSize: 12, fontFamily: 'InriaSans-Bold' },
})

export default ViewPdfPop