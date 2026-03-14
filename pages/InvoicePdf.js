import {PDFDocument} from 'pdf-lib';
import {PermissionsAndroid, Platform, Share} from 'react-native';
import * as RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

export const generatePDF = async ({
  getCompanyname,
  getLetterheadBase64,
  cmpcode,
  selectedCustomer,
  selectedCustomerAddress,
  itemList,
  getTRNnumber,
  subTotal,
  toWords,
  selectedInvoiceNo,
  selectedInvDate,
  terms,
  discount,
  discountedTotal,
  loginUser,
  setPdfUri,
  resultClosePress,
}) => {
  if (Platform.OS === 'android') {
    try {
      console.log('Requesting permission...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to your storage to download the PDF',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('Permission result:', granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the storage');
      } else {
        console.log('Storage permission denied');
      }
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  }

  const logoUri = await getLetterheadBase64();

  const htmlNew = `
        <html>
        <head>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0;
                    padding: 0;
                    background-color: white;
                }
        
               
                .InvCard {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                     height: 96%;
                    background-color: white;
                    border-radius: 12px;
                    padding: 10px;
                }
        
                .header {
                    /* background-color: #12151C; */
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                     justify-content: center;
                    width: 100%;
                    padding: 8px 0;
                    color: black;
                    border-top: 1px solid gray;
                    border-bottom: 1px solid gray;
                     margin-top: 90px;
                }
                .header_zero_margin_top {
                    /* background-color: #12151C; */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                     justify-content: center;
                    width: 100%;
                    padding: 8px 0;
                    color: black;
                    border-top: 1px solid gray;
                    border-bottom: 1px solid gray;
                     margin-top: 0px;
                }
        
                .header_without_top_margin {
                    // /* background-color: #12151C; */
                    // display: flex;
                    // flex-direction: row;
                    // align-items: center;
                    //  justify-content: center;
                    // width: 100%;
                    // padding: 8px 0;
                    // color: black;
                    // border-top: 1px solid gray;
                    // border-bottom: 1px solid gray;
                    //  margin-top: 2px;
                }
        
                .HeadTop {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    width: 100%;
                    padding: 0 24px;
                }
        
               .LogoContent {
                    font-weight: bold;
                    font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
                    font-size: 24px;
                    text-align: center;
                    margin-top:20px;
                }
        
                .LogoContent_below_company_name {
                    font-weight: bold;
                    font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
                    font-size: 16px;
                    text-align: center;
                    margin-top:20px;
                }
        
                .CmpnyLogo {
                    width: 100%;
                    height: 150px;
                }
        
                .HeadInvoiceData {
                    width: 40%;
                    text-align: right;
                }
        
                .InvcData {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-end;
                    /* margin: 12px 0; */
                    font-weight: bold;
                    font-family: InriaSans-Regular, sans-serif;
                    width: 100%;
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
                    align-items: center;
                    font-size: 14px;
                    margin-right: 12px;
                    font-family: InriaSans-Regular, sans-serif;
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
        
                .topSection {
                    display: flex;
                    flex-wrap: wrap;
                    flex-direction: row;
                    justify-content: space-between;
                }
        
                .section {
                    margin: 0px 0;
                    width: 58%;
                    border: 1px solid #000000;
                    border-radius: 5px;
                    padding: 10px;
                    margin-right:2%;
                    display: flex;
                    flex-direction: column;
                }
        
                .label {
                    font-size: 14px;
                    font-weight: bold;
                    font-family: InriaSans-Regular, sans-serif;
                }
        
                .labelValue {
                    font-size: 14px;
                    margin: 4px 0;
                    font-family: InriaSans-Regular, sans-serif;
                }
        
                .tableCont {
                    /* width: 100%; */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    flex-grow: 1;
                    border: 1px solid #000000;
                    border-radius: 5px;
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
                    font-family: InriaSans-Regular, sans-serif;
                }
        
                thead tr {
                    border-bottom: 1px solid black;
                }
        
                th {
                    text-align: left;
                }
        
                .BottomTotalCont {
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                    flex-direction: row;
                }
        
                .TotalValues {
                    width: 45%;
                    display: flex;
                    flex-direction: column;
                }
        
                .subtotal,
                .vat,
                .grandTotal {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px;
                    font-size: 14px;
                    font-family: InriaSans-Regular, sans-serif;
                }
        
                .grandTotal {
                    font-size: 16px;
                    font-weight: bold;
                    color: blue;
                    font-family: InriaSans-Regular, sans-serif;
                }
        
                .netTotal {
                    font-size: 16px;
                    font-weight: bold;
                    font-family: InriaSans-Regular, sans-serif;
                }
        
                .BottomSignSection {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 50px;
                }
        
                .ForCustomer {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                }
        
                .CustomerName {
                    font-family: InriaSans-Bold, sans-serif;
                }
        
                .SignBoxCont {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
        
                .SignBox {
                    width: 120px;
                    height: 40px;
                    border: 1px solid grey;
                }
        
                .our_trn_number {
                    display: flex;
                    justify-content: center;
                    margin: 8px 0;
                }
        
                .our_company_name_panel {
                    display: flex;
                    justify-content: space-between;
                    padding: 0px 0px;
                }
        
                 .TopRightItemCont {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    border-radius: 5px;
                    padding: 10px;
                    border: 1px solid #000000;
                    width:40%;
                }
        
                .TopRightLables {
                    font-size: 14px;
                    font-weight: bold;
                    font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
                    padding: 2px 0px;
                }
        
                .TrnTop {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    width: max-content;
                    padding: 0px 0px;
                }
        
                   .footer-received-panel {
                    display: flex;
                    justify-content: space-between;
                    padding-right: 12px;
                }
        
                  .loginUserLabel {
                    display: flex;
                    flex-direction: column;
                }
        
                 .footer {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    margin-top: 18px;
                    padding: 0px 8px;
                }
        
                .image_letterhead{
                    width:99%;
                    object-fit:contain;
                }
        
        
                @page{ 
                    margin-left: 20pt;
                     margin-right: 20pt; 
                     margin-top: 0pt;
                     margin-bottom: 38pt; 
                     padding-left: 0pt; 
                     padding-right: 0pt;
                      padding-top: 20pt; 
                      padding-bottom: 0pt; }
                
                      .totals-section {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        min-height: 200px; /* Adjust based on your totals section height */
                    }
            </style>
            </head>
        
            <body>
            
                <div class="InvCard">
        
                        ${
                          cmpcode.toLowerCase().trim() == 'premier'
                            ? `<div>
                        <img class="image_letterhead" src=${logoUri}
                        </div>`
                            : ''
                        }
        
                        ${
                          cmpcode?.trim().toLowerCase() == 'premier'
                            ? `<div class=${
                                cmpcode?.trim().toLowerCase() == 'premier'
                                  ? 'header_without_top_margin'
                                  : ''
                              }>
                              
                         </div>`
                            : ''
                        }
                
                <div class=${
                  cmpcode?.trim().toLowerCase() == 'icelab' ||
                  cmpcode?.trim().toLowerCase() == 'icelab_test'
                    ? 'header_zero_margin_top'
                    : ''
                }>
                ${
                  cmpcode?.trim().toLowerCase() == 'icelab'
                    ? `<div class="LogoContent">
                            <div>THE ICE LAB MANUFACTURING LLC</div>
                        </div>
                        <div class="LogoContent_below_company_name">
                                <div>Central Plaza 2, Al Jurf</div>
                                <div>Ajman, UAE</div>
                                <div>Tel:065617700</div>
                            
                        </div>`
                    : ''
                }
        ${
          cmpcode?.trim().toLowerCase() == 'meshari'
            ? `<div>
                        <div class="LogoContent">
                            <div>MESHARI FOODSTUFF TRADING LLC</div>
                        </div>
                        <div class="LogoContent_below_company_name">
                                <div>21 Street, Al Qusais Ind, Area.1</div>
                                <div>PO Box No: 20875</div>
                                <div>Ph: 04 3700924</div>
                                <div>Mob: 050 280 5243</div>
                                <div>Email: mesharifoodstufftrading@gmail.com</div>
                                <div>https://mesharigroups.com</div>
                            
                        </div>
                        </div>`
            : ''
        }
        
                        
                
                </div> 
        
                <div class="content">
        
                <div class="LogoContent"> TAX INVOICE </div>
        
                    <div class="our_trn_number">
                        <div class="label">TRN:${getTRNnumber(
                          cmpcode?.toUpperCase().trim(),
                        )}</div>
                    </div>
        
                    <div>
                    <span STYLE="border-radius:5px;border:1px solid #000000;font-size:12px;padding:4px">
                    CUSTOMER DETAILS
                    </span>
                    </div>
        
                    <div class="our_company_name_panel">
        
                        <div class="section">
                            
                            <div style="flex-grow: 1;">
                                <div class="labelValue" style="font-weight: bold;">${
                                  selectedCustomer ? selectedCustomer : ''
                                }
                                </div>
                            
                                <div class="labelValue" style="font-weight: bold;">${
                                  selectedCustomerAddress
                                    ? selectedCustomerAddress
                                    : ''
                                }
                                </div>
                            </div>  
                            <div class="TrnTop">
                                <div class="label">CLIENT TRN:</div>
                                <div class="labelValue">${
                                  itemList ? itemList[0].TRN : ''
                                }</div>
                            </div>
        
                        </div>
        
                        <div class="TopRightItemCont">
        
                            <div>
                                <div class="TopRightLables">INV NO</div>
                                <div class="TopRightLables">INV Date</div>
                                <div class="TopRightLables">INV TYPE</div>
                                <div class="TopRightLables">LPO</div>
                                <div class="TopRightLables">SALESMAN</div>
                             
                            </div>
                            <div style="margin-left: 8px; margin-right: 8px;">
                                <div style="font-weight: bold;">:</div>
                                <div style="font-weight: bold;">:</div>
                                <div style="font-weight: bold;">:</div>
                                <div style="font-weight: bold;">:</div>
                                <div style="font-weight: bold;">:</div>
                            </div>
                            <div>
                                <div style="font-weight: bold;">${
                                  selectedInvoiceNo ? selectedInvoiceNo : ''
                                }
                                </div>
                                <div style="padding-top:1px">${selectedInvDate}
                                </div>
                                <div style="padding-top:1px">
                                </div>
                                <div style="padding-top:1px">
                                </div>
                                <div style="padding-top:1px"></div>
                            </div>
                        </div>
        
                    </div>
        
                     
                    
                    <div class="tableCont">
        
                        <table border="1">
                            <thead>
                                <tr>
                                    <th style="width:10%">Sl.No</th>
                                    <th style="width:15%">CODE</th>
                                    <th style="width:25%">DESCRIPTION</th>
                                    <th style="width:10%">QTY</th>
                                    <th style="width:10%">UNIT PRICE</th>
                                    <th style="width:10%">TOTAL<br>[Excl. VAT]</br></th>
                                    <th style="text-align: right;width:10%">VAT<br>@5%</br></th>
                                    <th style="text-align: right;width:10%">Total<br>[Incl. VAT]</br</th>
        
                                </tr>
                            </thead>
        
                            <tbody>
        
                               ${itemList
                                 .map(
                                   (item, index) => `
                               
                                <tr class="singleRowOfItem" style="border-bottom:2px dashed #7f7f7f">
                                    <td style="width:10%">${index + 1}</td>
                                    <td style="width:15%">${item.ITEM_CODE}</td>
                                    <td style="width:25%">${
                                      item.DESCRIPTION
                                    }</td>
                                  
                                    <td style="width:10%">${new Intl.NumberFormat(
                                      'en-US',
                                      {
                                        minimumFractionDigits: 3,
                                        maximumFractionDigits: 3,
                                      },
                                    ).format(item.QTY)}</td>
                                    <td style="width:10%">${item.PRICE}</td>
                                    <td style="width:10%">${
                                      item.LINE_TOTAL
                                    }</td>
                                   
                                    <td style="text-align: right; width:10%">${new Intl.NumberFormat(
                                      'en-US',
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    ).format(item.LINE_TOTAL * 0.05)}</td>
        
                        <td style="text-align: right; width:10%">${new Intl.NumberFormat(
                          'en-US',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        ).format(item.LINE_TOTAL * 0.05 + item.LINE_TOTAL)}</td>
                                </tr>
                                `,
                                 )
                                 .join('')}
                            
                            </tbody>
                            </table>
                        </div>
        
                         
                          
        <div class="totals-section">
                        <div   style="display:flex;flex-direction:column;width:100%;border:1px solid #000000;border-radius:5px;margin-top: 1px;">
        
                            <div style="width:100%">
                                <div style="display:flex;justify-content:end;margin:10">
                                    <div style="display:flex;justify-content:space-between;width:40%">
                                        <label>Total Qty: </label>
                                        <label style="min-width: 30%;margin-right: 10px;">${itemList?.reduce(
                                          (acc, curr) => {
                                            return (acc = acc + curr.QTY);
                                          },
                                          0,
                                        )} </label>
                                    </div>
                                    <div style="display:flex;justify-content:space-between;width:40%">
                                        <label>Total [Excl. VAT]: </label>
                                        <label>${
                                          subTotal
                                            ? new Intl.NumberFormat('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              }).format(subTotal)
                                            : ''
                                        } </label>
                                    </div>
                                </div>
        
                            </div>  
        
                            <div style="width:100%;display:flex;padding-top:30px">
                                <div style="width:60%">
                                    <div style="margin-left: 30px;">${toWords.convert(
                                      parseInt(
                                        subTotal
                                          ? subTotal + subTotal * 0.05
                                          : '',
                                      ),
                                    )}
                    AND 
                    ${
                      (
                        subTotal +
                        subTotal * 0.05 -
                        Math.floor(subTotal + subTotal * 0.05)
                      ).toFixed(2) * 100
                    }
                    / 100
                    ONLY
                    </div>
                                    <div style="margin-left: 30px;">TERMS </div>
                                </div>
                                <div style="width:40%">
                                    <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                                        <div>TAXABLE AMOUNT</div>
                                        <div>${
                                          subTotal
                                            ? new Intl.NumberFormat('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              }).format(subTotal)
                                            : ''
                                        }</div>
                                    </div>
                                        <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                                    <div>VAT AMOUNT</div>
                                    <div>${
                                      subTotal
                                        ? (subTotal * 0.05).toFixed(2)
                                        : ''
                                    }</div>
                                </div>
                                <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                                    <div>TOTAL[incl. VAT]</div>
                                    <div>${
                                      subTotal
                                        ? new Intl.NumberFormat('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }).format(subTotal + subTotal * 0.05)
                                        : ''
                                    }</div>
                                </div>
                            </div>
        
                        </div>
                
                    </div>  
                    <div style="display:flex;width:100%;margin-top:10px">
                            <div class="footer-received-panel" style="display:flex;width:60%">
                                
                             
                                <div style="display:flex;flex-direction:column;width:50%">
                                    <label style="font-weight: bold;">Received By</label>
                                    <label></label>
                                </div>
                            
                            </div>
        
                            <div style="display:flex;justify-content:end;width:40%;">
                           
                                <label class="loginUserLabel" style="margin-right:12px;>
                                <div style="font-weight: bold;padding-left:50px;padding-top:5px"><label style="font-weight: bold;"> ${getCompanyname(
                                  cmpcode?.trim().toUpperCase(),
                                )}</label></div>
                                </label>
                            </div>
                        </div>  
        </div>
                    
                    
                   
                </div>
            </div>
        
           
                </body>    
                </html>`;

  const htmlNewMalbar = `
        <html>
        <head>
           <style>
               body {
                   display: flex;
                   justify-content: center;
                   align-items: center;
                   margin: 0;
                   padding: 0;
                   background-color: white;
               }
        
               .InvCard {
                   display: flex;
                   flex-direction: column;
                   align-items: center;
                   width: 100%;
                    height: 96%;
                   background-color: white;
                   border-radius: 12px;
                   overflow: hidden;
                   padding: 18px;
               }
        
               .header {
                   /* background-color: #12151C; */
                   display: flex;
                   flex-direction: row;
                   align-items: center;
                    justify-content: center;
                   width: 100%;
                   padding: 8px 0;
                   color: black;
                   border-top: 1px solid gray;
                   border-bottom: 1px solid gray;
                    margin-top: 90px;
               }
        
               .HeadTop {
                   display: flex;
                   flex-direction: row;
                   justify-content: space-between;
                   width: 100%;
                   padding: 0 24px;
               }
        
              .LogoContent {
                   font-weight: bold;
                   font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
                   font-size: 24px;
               }
        
               .CmpnyLogo {
                   width: 80%;
                   height: 150px;
               }
        
               .HeadInvoiceData {
                   width: 40%;
                   text-align: right;
               }
        
               .InvcData {
                   display: flex;
                   flex-direction: row;
                   justify-content: flex-end;
                   /* margin: 12px 0; */
                   font-weight: bold;
                   font-family: InriaSans-Regular, sans-serif;
                   width: 100%;
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
                   align-items: center;
                   font-size: 14px;
                   margin-right: 12px;
                   font-family: InriaSans-Regular, sans-serif;
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
        
               .topSection {
                   display: flex;
                   flex-wrap: wrap;
                   flex-direction: row;
                   justify-content: space-between;
               }
        
               .section {
                   margin: 8px 0;
                   width: 30%;
               }
        
               .label {
                   font-size: 14px;
                   font-weight: bold;
                   font-family: InriaSans-Regular, sans-serif;
               }
        
               .labelValue {
                   font-size: 14px;
                   margin: 4px 0;
                   font-family: InriaSans-Regular, sans-serif;
               }
        
               .tableCont {
                   /* width: 100%; */
                   display: flex;
                   flex-direction: column;
                   justify-content: center;
                   align-items: center;
                   padding: 12px;
                   flex-grow: 1;
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
                   font-family: InriaSans-Regular, sans-serif;
               }
        
               thead tr {
                   border-bottom: 1px solid black;
               }
        
               th {
                   text-align: left;
               }
        
               .BottomTotalCont {
                   width: 100%;
                   display: flex;
                   justify-content: flex-end;
                   flex-direction: row;
               }
        
               .TotalValues {
                   width: 45%;
                   display: flex;
                   flex-direction: column;
               }
        
               .subtotal,
               .vat,
               .grandTotal {
                   display: flex;
                   justify-content: space-between;
                   padding: 8px;
                   font-size: 14px;
                   font-family: InriaSans-Regular, sans-serif;
               }
        
               .grandTotal {
                   font-size: 16px;
                   font-weight: bold;
                   color: blue;
                   font-family: InriaSans-Regular, sans-serif;
               }
        
               .netTotal {
                   font-size: 16px;
                   font-weight: bold;
                   font-family: InriaSans-Regular, sans-serif;
               }
        
               .BottomSignSection {
                   width: 100%;
                   display: flex;
                   flex-direction: row;
                   justify-content: space-between;
                   align-items: center;
                   padding-bottom: 50px;
               }
        
               .ForCustomer {
                   display: flex;
                   flex-direction: row;
                   justify-content: space-between;
               }
        
               .CustomerName {
                   font-family: InriaSans-Bold, sans-serif;
               }
        
               .SignBoxCont {
                   display: flex;
                   flex-direction: column;
                   justify-content: center;
                   align-items: center;
               }
        
               .SignBox {
                   width: 120px;
                   height: 40px;
                   border: 1px solid grey;
               }
        
               .our_trn_number {
                   display: flex;
                   justify-content: center;
                   margin: 8px 0;
               }
        
               .our_company_name_panel {
                   display: flex;
                   justify-content: space-between;
                   padding: 0px 8px;
               }
        
                .TopRightItemCont {
                   display: flex;
                   flex-direction: row;
                   justify-content: space-between;
               }
        
               .TopRightLables {
                   font-size: 14px;
                   font-weight: bold;
                   font-family: 'Calibri', 'InriaSans-Regular', sans-serif;
                   padding: 2px 0px;
               }
        
               .TrnTop {
                   display: flex;
                   flex-direction: row;
                   justify-content: space-between;
                   align-items: center;
                   width: max-content;
                   padding: 0px 8px;
               }
        
                  .footer-received-panel {
                   display: flex;
                   justify-content: space-between;
                   padding-right: 12px;
               }
        
                 .loginUserLabel {
                   display: flex;
                   flex-direction: column;
               }
        
                .footer {
                   width: 100%;
                   display: flex;
                   flex-direction: column;
                   margin-top: 18px;
                   padding: 0px 8px;
               }
        
        
               .footerPageNo {
                   position: fixed;
                   bottom: 10px;
                   left: 0;
                   right: 0;
                   text-align: center;
                   font-size: 10px;
                   color: #333;
                   counter-reset: page;
               }
               .footerPageNo::before {
                   counter-increment: page;
                   content: "Page " counter(page);
               }
        
              
        
           </style>
           </head>
        
           <body>
           <div class="InvCard">
               <div class="header">
                   <div class="LogoContent">
                       <div>TAX INVOICE</div>
                   </div>
               </div>
        
               <div class="content">
        
                   <div class="our_trn_number">
                       <div class="label">TRN:100335207500003</div>
                   </div>
        
                   <div class="our_company_name_panel">
        
                       <div class="section">
                           <div class="label">Invoice To:</div>
                           <div class="labelValue" style="font-weight: bold;">${
                             selectedCustomer ? selectedCustomer : ''
                           }
                           </div>
                         
        
        
        
                       </div>
        
                       <div class="TopRightItemCont">
        
                           <div>
                               <div class="TopRightLables">Invoice No</div>
                               <div class="TopRightLables">Date</div>
                               <div class="TopRightLables">Payment Terms</div>
                           
                           </div>
                           <div style="margin-left: 8px; margin-right: 8px;">
                               <div style="font-weight: bold;">:</div>
                               <div style="font-weight: bold;">:</div>
                               <div style="font-weight: bold;">:</div>
                           </div>
                           <div>
                               <div style="font-weight: bold;">MFS-${
                                 selectedInvoiceNo ? selectedInvoiceNo : ''
                               }
                               </div>
                               <div style="padding-top:1px">${selectedInvDate}
                               </div>
                               <div style="padding-top:1px">${
                                 terms ? terms : ''
                               }</div>
                           </div>
                       </div>
        
                   </div>
        
                     <div class="TrnTop">
                       <div class="label">TRN Number:</div>
                       <div class="labelValue">${
                         itemList ? itemList[0].TRN : ''
                       }</div>
                   </div>
        
                   <div class="tableCont">
        
                       <table>
                           <thead>
                               <tr>
                                   <th>Sl.No</th>
                                   <th>Item</th>
                                   <th>Qty</th>
                                   <th>Unit</th>
                                   <th style="text-align: right;">Price</th>
                                   <th style="text-align: right;">Total</th>
        
                               </tr>
                           </thead>
        
                           <tbody>
        
                              ${itemList
                                .map(
                                  (item, index) => `
                               <tr>
                                   <td>${index + 1}</td>
                                   <td>${item.DESCRIPTION}</td>
                                
                                   <td>${new Intl.NumberFormat('en-US', {
                                     minimumFractionDigits: 3,
                                     maximumFractionDigits: 3,
                                   }).format(item.QTY)}</td>
                                   <td>${item.UNIT}</td>
                                   <td style="text-align: right;">${new Intl.NumberFormat(
                                     'en-US',
                                     {
                                       minimumFractionDigits: 2,
                                       maximumFractionDigits: 2,
                                     },
                                   ).format(item.PRICE)}</td>
                                   <td style="text-align: right;">${new Intl.NumberFormat(
                                     'en-US',
                                     {
                                       minimumFractionDigits: 2,
                                       maximumFractionDigits: 2,
                                     },
                                   ).format(item.LINE_TOTAL)}</td>
                               </tr>
                               `,
                                )
                                .join('')}
                               <tr style="border:none; font-weight: bold; margin-top:12px">
                                   <td colspan="4" style="border:none; padding:4px;">Terms:</td>
                                   <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                       Discount:</td>
                                   <td
                                       style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                       ${
                                         discount !== 0
                                           ? discount
                                             ? discount
                                             : '0.00'
                                           : '0.00'
                                       }</td>
                               </tr>
                               <tr style="border:none; font-weight: bold;">
                                   <td colspan="4" style="border:none; padding:4px;">1. Goods received in good condition.</td>
                                   <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">
                                       Subtotal:</td>
                                   <td
                                       style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                       ${
                                         subTotal
                                           ? new Intl.NumberFormat('en-US', {
                                               minimumFractionDigits: 2,
                                               maximumFractionDigits: 2,
                                             }).format(subTotal)
                                           : ''
                                       }</td>
                               </tr>
                               <tr style="border:none; font-weight: bold;">
                                   <td colspan="4" style="border:none; padding:4px;">2. Expired goods will not be taken back
                                       under any circumstances.</td>
                                   <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">VAT
                                       (5%):</td>
                                   <td
                                       style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                       ${
                                         discount !== 0
                                           ? discountedTotal
                                             ? (discountedTotal * 0.05).toFixed(
                                                 2,
                                               )
                                             : ''
                                           : subTotal
                                           ? (subTotal * 0.05).toFixed(2)
                                           : ''
                                       }</td>
                               </tr>
                               <tr style="border:none; font-weight: bold;">
                                   <td colspan="4" style="border:none; padding:4px;">3. Goods once sold will not be taken back
                                       or exchanged.</td>
                                   <td style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px;">Amount
                                       Incl. VAT:</td>
                                   <td
                                       style="border-top: 1px solid black; border-bottom: 1px solid black; padding:4px; text-align: right;">
                                       ${
                                         discount !== 0
                                           ? discountedTotal
                                             ? new Intl.NumberFormat('en-US', {
                                                 minimumFractionDigits: 2,
                                                 maximumFractionDigits: 2,
                                               }).format(
                                                 discountedTotal +
                                                   discountedTotal * 0.05,
                                               )
                                             : ''
                                           : subTotal
                                           ? new Intl.NumberFormat('en-US', {
                                               minimumFractionDigits: 2,
                                               maximumFractionDigits: 2,
                                             }).format(
                                               subTotal + subTotal * 0.05,
                                             )
                                           : ''
                                       }</td>
                               </tr>
        
                           </tbody>
                       </table>
        
                       
                   </div>
                  
                   <div class="footer">
        
                       <div class="footer-received-panel">
                           <label class="loginUserLabel">
                               <div style="font-weight: bold;">For Malbar Stars Food Stuff TR.LLC</div>
                               <div>${loginUser ? loginUser : ''}</div>
                           </label>
                           <label class="loginUserLabel" style="margin-right:12px;">
                               <div style="font-weight: bold;">For ${
                                 selectedCustomer ? selectedCustomer : ''
                               }</div>
                               <div>Received By,</div>
                           </label>
                       </div>
        
                   </div>
               </div>
           </div>
        
         
               </body>   
               </html>`;

  const cmpcodeChk = cmpcode.toUpperCase();
  // const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNewMalbar : htmlNew;
  const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNewMalbar : htmlNew;

  console.log('cmpcodeChk', cmpcodeChk);

  let options = {
    html: initialHTML,
    fileName: 'Invoice',
    directory: 'Documents',
    base64: true,
  };

  try {
    // Generate the initial PDF to get the total number of pages
    const file = await RNHTMLtoPDF.convert(options);
    const totalPages = file.numberOfPages; // Assuming the library returns the number of pages

    console.log('totalPage>>', totalPages);

    ///

    //
    setPdfUri(`file://${file.filePath}`);

    if (cmpcode == 'MALBAR') {
      await Share.open({
        title: 'Share Invoice Details PDF',
        url: `file://${file.filePath}`,
      });
    } else {
      const existingPdfBytes = await fetch(`file://${file.filePath}`).then(
        res => res.arrayBuffer(),
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const pages = pdfDoc.getPages();

      // const firstPage = pages[0]

      for (i = 0; i < pages.length; i++) {
        const {width, height} = pages[i].getSize();

        console.log('page size ', width, height);

        pages[i].drawText('Page ' + (i + 1) + ' of ' + totalPages, {
          x: width / 2 - 50,
          y: 20,
          size: 16,
        });
      }

      try {
        // const pdfBytes = await pdfDoc.save()
        const pdfBytes = await pdfDoc.saveAsBase64();

        // Path where the file will be saved
        const filePath =
          RNFS.DocumentDirectoryPath + `/invoice_${selectedInvoiceNo}.pdf`; // Save as an image file (can be any file type)

        // Write the base64 string as a file
        await RNFS.writeFile(filePath, pdfBytes, 'base64');

        console.log('File saved at:->>>', filePath, selectedInvoiceNo);

        await Share.open({
          title: 'Share Invoice Details PDF',
          url: `file://${filePath}`,
        });

        // ends
      } catch (error) {
        console.log('File save error ', error);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    resultClosePress();
  }
};
