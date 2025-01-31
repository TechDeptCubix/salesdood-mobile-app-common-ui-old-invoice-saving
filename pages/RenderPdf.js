// import React from 'react';
// import {
//     Document,
//     Page,
//     Text,
//     View,
//     StyleSheet,
//     Image,
// } from '@react-pdf/renderer';

// // Define styles
// const styles = StyleSheet.create({
//     body: {
//         backgroundColor: '#f0f0f0',
//         padding: 0,
//         margin: 0,
//     },
//     InvCard: {
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         width: '100%',
//         height: '100%',
//         backgroundColor: 'white',
//         borderRadius: 12,
//         overflow: 'hidden',
//     },
//     header: {
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         width: '100%',
//         paddingVertical: 8,
//         borderBottom: '1px solid gray',
//         borderTop: '1px solid gray',
//         marginTop: 90,
//         color: 'black',
//     },
//     LogoContent: {
//         fontWeight: 'bold',
//         fontSize: 24,
//         textAlign: 'center',
//     },
//     content: {
//         display: 'flex',
//         flexDirection: 'column',
//         width: '100%',
//         marginBottom: 38,
//     },
//     our_trn_number: {
//         display: 'flex',
//         justifyContent: 'center',
//         margin: 8,
//     },
//     label: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         marginBottom: 4,
//     },
//     labelValue: {
//         fontSize: 14,
//         marginVertical: 4,
//     },
//     section: {
//         marginVertical: 8,
//         width: '30%',
//     },
//     tableCont: {
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 6,
//         height: '80%',
//         borderBottom: '1px solid black',
//     },
//     table: {
//         display: 'table',
//         width: '100%',
//         borderStyle: 'solid',
//         borderWidth: 1,
//         borderColor: '#E0E0E0',
//     },
//     tableRow: {
//         flexDirection: 'row',
//         borderBottom: '1px solid gray',
//     },
//     tableCell: {
//         borderBottom: '1px solid gray',
//         padding: 8,
//         fontSize: 14,
//         color: '#4B4B4B',
//     },
//     footer: {
//         width: '100%',
//         marginTop: 18,
//         paddingHorizontal: 8,
//         flexDirection: 'column',
//     },
//     footerReceivedPanel: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         paddingRight: 12,
//     },
//     loginUserLabel: {
//         display: 'flex',
//         flexDirection: 'column',
//     },
//     grandTotal: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: 'blue',
//     },
// });

// const RenderPdf = ({
//     selectedCustomer,
//     cashCustomerName,
//     cashCustomerAddress,
//     result,
//     savedItemData,
//     discount,
//     totalUnitPrice,
//     VAT_RATE,
//     discountedTotal,
//     trn,
//     loginUser,
// }) => (
//     <Document>
//         <Page size="A4" style={styles.body}>
//             <View style={styles.InvCard}>
//                 {/* Header Section */}
//                 <View style={styles.header}>
//                     <Text style={styles.LogoContent}>TAX INVOICE</Text>
//                 </View>

//                 {/* Content Section */}
//                 <View style={styles.content}>
//                     <View style={styles.our_trn_number}>
//                         <Text style={styles.label}>TRN:100335207500003</Text>
//                     </View>

//                     {/* Invoice To Section */}
//                     <View style={styles.section}>
//                         <Text style={styles.label}>Invoice To:</Text>
//                         <Text style={styles.labelValue} fontWeight="bold">
//                             {selectedCustomer ? selectedCustomer.Custname : cashCustomerName || ''}
//                         </Text>
//                         <Text style={styles.labelValue}>
//                             {selectedCustomer ? selectedCustomer.address1 : cashCustomerAddress || ''}
//                         </Text>
//                         <Text style={styles.labelValue}>
//                             {selectedCustomer ? selectedCustomer.address2 : ''}
//                         </Text>
//                         <Text style={styles.labelValue}>
//                             {selectedCustomer ? selectedCustomer.address3 : ''}
//                         </Text>
//                     </View>

//                     {/* Table Section */}
//                     <View style={styles.tableCont}>
//                         <View style={styles.table}>
//                             <View style={styles.tableRow}>
//                                 <Text style={[styles.tableCell, { flex: 1 }]}>Sl.No</Text>
//                                 <Text style={[styles.tableCell, { flex: 4 }]}>Item</Text>
//                                 <Text style={[styles.tableCell, { flex: 1 }]}>Qty</Text>
//                                 <Text style={[styles.tableCell, { flex: 1 }]}>Unit</Text>
//                                 <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
//                                     Price
//                                 </Text>
//                                 <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
//                                     Total
//                                 </Text>
//                             </View>

//                             {savedItemData.map((item, index) => (
//                                 <View style={styles.tableRow} key={index}>
//                                     <Text style={[styles.tableCell, { flex: 1 }]}>{index + 1}</Text>
//                                     <Text style={[styles.tableCell, { flex: 4 }]}>{item.Description}</Text>
//                                     <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantity}</Text>
//                                     <Text style={[styles.tableCell, { flex: 1 }]}>{item.unit}</Text>
//                                     <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
//                                         {item.unitPrice.toFixed(2)}
//                                     </Text>
//                                     <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
//                                         {(item.unitPrice * item.quantity).toFixed(2)}
//                                     </Text>
//                                 </View>
//                             ))}

//                             {/* Subtotal, VAT, and Grand Total */}
//                             <View style={styles.tableRow}>
//                                 <Text style={[styles.tableCell, { flex: 4 }]} colSpan={4}>
//                                     Subtotal:
//                                 </Text>
//                                 <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
//                                     {totalUnitPrice.toFixed(2)}
//                                 </Text>
//                             </View>
//                             <View style={styles.tableRow}>
//                                 <Text style={[styles.tableCell, { flex: 4 }]} colSpan={4}>
//                                     VAT (5%):
//                                 </Text>
//                                 <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
//                                     {(totalUnitPrice * (VAT_RATE / 100)).toFixed(2)}
//                                 </Text>
//                             </View>
//                             <View style={styles.tableRow}>
//                                 <Text style={[styles.tableCell, { flex: 4 }]} colSpan={4}>
//                                     Amount Incl. VAT:
//                                 </Text>
//                                 <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
//                                     {(totalUnitPrice + totalUnitPrice * (VAT_RATE / 100)).toFixed(2)}
//                                 </Text>
//                             </View>
//                         </View>
//                     </View>

//                     {/* Footer Section */}
//                     <View style={styles.footer}>
//                         <View style={styles.footerReceivedPanel}>
//                             <View style={styles.loginUserLabel}>
//                                 <Text>For Malbar Stars Food Stuff TR.LLC</Text>
//                                 <Text>{loginUser || ''}</Text>
//                             </View>
//                             <View style={styles.loginUserLabel}>
//                                 <Text>For {selectedCustomer ? selectedCustomer.Custname : cashCustomerName || ''}</Text>
//                                 <Text>Received By,</Text>
//                             </View>
//                         </View>
//                     </View>
//                 </View>
//             </View>
//         </Page>
//     </Document>
// );


// export default RenderPdf