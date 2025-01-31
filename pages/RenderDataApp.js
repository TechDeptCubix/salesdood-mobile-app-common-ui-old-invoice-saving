// import React from 'react';
// // import ReactPDF  from '@react-pdf/renderer';
// import RenderPdf from './RenderPdf';
// import { PDFViewer } from '@react-pdf/renderer';


// const RenderDataApp = () => {
//     // Define your data here
//     const data = {
//         selectedCustomer: {
//             Custname: 'Customer Name',
//             address1: 'Address Line 1',
//             address2: 'Address Line 2',
//             address3: 'Address Line 3',
//         },
//         cashCustomerName: 'Cash Customer',
//         cashCustomerAddress: 'Cash Customer Address',
//         result: {
//             invoiceNo: '12345',
//         },
//         savedItemData: [
//             {
//                 Description: 'Item 1',
//                 quantity: 1,
//                 unit: 'pcs',
//                 unitPrice: 10.0,
//             },
//             {
//                 Description: 'Item 2',
//                 quantity: 2,
//                 unit: 'pcs',
//                 unitPrice: 20.0,
//             },
//         ],
//         discount: 0,
//         totalUnitPrice: 50.0,
//         VAT_RATE: 5,
//         discountedTotal: 50.0,
//         trn: '100335207500003',
//         loginUser: 'Admin',
//     };

//     return (
//         <>
//             <PDFViewer>
//                 <RenderPdf
//                     {...data}
//                 />
//             </PDFViewer>
            

//             {/* <ReactPDF
//             document={
//                 <RenderPdf
//                     {...data}
//                 />
//             }
//             fileName="invoice.pdf"
//         /> */}
//         </>
//     );
// };


// export default RenderDataApp