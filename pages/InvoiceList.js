import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Image, PermissionsAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import REACT_APP_BASE_URL from '../url/AppUrl'
import StatusLogPop from '../popups/StatusLogPop'
import HeaderUiNew from './HeaderUiNew'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { ToWords } from 'to-words';

const InvoiceList = () => {

    const toWords = new ToWords();

    const logoUri = Image.resolveAssetSource(
        require("../images/premier_letterhead.jpeg")
    ).uri;

    // in this image not coming even in emulator

    // const logoUri = 
    //     require("../images/premier_letterhead.jpeg")
    //     ;

    console.log("logoUri>>> ", logoUri)

    const ITEMS_PER_PAGE = 20;

    const navigation = useNavigation()

    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    const [salesMan, setSalesMan] = useState('')


    const [showStatusLogPop, setShowStatusLogPop] = useState(false)
    const [orderIdPop, setOrderIdPop] = useState(null)

    const [appUrl, setAppUrl] = useState('')

    const [cmpcode, setCmpCode] = useState('')

    const [expandedItems, setExpandedItems] = useState([]);

    const [deptNo, setDeptNo] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [listData, setListData] = useState(null)

    const [apiError, setApiError] = useState(false)

    const [searchInv, setSearchInv] = useState('')

    const [searchError, setSearchError] = useState('')

    const [itemList, setItemList] = useState('')

    const [loginUser, setLoginUser] = useState('')

    const [pdfUri, setPdfUri] = useState(null);

    const [selectedCustomer, setSelectedCustomer] = useState('')
    const [selectedCustomerAddress, setSelectedCustomerAddress] = useState('')
    const [selectedInvoiceNo, setSlelecetdInvNo] = useState('')
    const [selectedInvDate, setSelectedInvDate] = useState('')

    const [selectedRadio, setSelectedRadio] = useState('')

    const [terms, setTerms] = useState('')

    const [discountedTotal, setDiscountedTotal] = useState('');
    const [discount, setDiscount] = useState(0)

    const [subTotal, setSubTotal] = useState('')

    const [trn, setTrn] = useState('')

    const [payment, setPayment] = useState('CASH-B2B')

    const [showPrintButtonLoader, setShowPrintButtonLoader] = useState(false)

    useEffect(() => {
        if (discount > 0) {

            const newTotal = subTotal - discount

            setDiscountedTotal(newTotal)
        }
    }, [discount]);


    const getTRNnumber = (companyCodeToCheck) => {

        switch (companyCodeToCheck) {
            case "MALBAR": return "100335207500003";
            case "PREMIER": return "10027835690000"
            default: return "-"
        }

    }

    // pdfCode
    const generatePDF = async () => {

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
                    }
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

        const dummyHTML = `<h1 style='margin-bottom: 20px'>Heading</h1>
      <div style='text-align: justify'>Exercitation velit irure irure est nisi eu deserunt ut sunt eiusmod tempor aute esse ad. Id velit magna dolor occaecat fugiat cupidatat cillum eiusmod dolor exercitation laborum consequat sint. Amet incididunt voluptate dolor adipisicing laboris eiusmod nulla commodo consequat laborum in in. Est do do nisi incididunt occaecat enim quis occaecat ipsum et. Duis officia consequat veniam irure. Ad ad dolor velit aliquip nostrud. Ullamco irure tempor cupidatat laborum duis eu sit amet dolore id. Qui duis laboris aliqua occaecat ullamco dolor ipsum. Aute reprehenderit laboris nulla sit ea ex dolor et magna quis in ex. Irure pariatur veniam exercitation mollit dolor ex sit esse velit minim nisi. Amet adipisicing cillum labore esse commodo sunt. Ut cillum proident nulla elit anim ipsum irure commodo amet aliquip commodo consequat. Sit irure nisi cillum ullamco. Lorem occaecat in cupidatat nulla nulla nostrud pariatur aliqua anim aliqua ea Lorem. In reprehenderit sunt laboris ex ea adipisicing fugiat cillum est dolor anim ad. Lorem mollit nostrud culpa excepteur. Sint elit id anim esse magna est pariatur adipisicing.</div>

      <h1 style='margin-bottom: 20px'>Heading 2</h1>
      <div style='text-align: justify'>Exercitation velit irure irure est nisi eu deserunt ut sunt eiusmod tempor aute esse ad. Id velit magna dolor occaecat fugiat cupidatat cillum eiusmod dolor exercitation laborum consequat sint. Amet incididunt voluptate dolor adipisicing laboris eiusmod nulla commodo consequat laborum in in. Est do do nisi incididunt occaecat enim quis occaecat ipsum et. Duis officia consequat veniam irure. Ad ad dolor velit aliquip nostrud. Ullamco irure tempor cupidatat laborum duis eu sit amet dolore id. Qui duis laboris aliqua occaecat ullamco dolor ipsum. Aute reprehenderit laboris nulla sit ea ex dolor et magna quis in ex. Irure pariatur veniam exercitation mollit dolor ex sit esse velit minim nisi. Amet adipisicing cillum labore esse commodo sunt. Ut cillum proident nulla elit anim ipsum irure commodo amet aliquip commodo consequat. Sit irure nisi cillum ullamco. Lorem occaecat in cupidatat nulla nulla nostrud pariatur aliqua anim aliqua ea Lorem. In reprehenderit sunt laboris ex ea adipisicing fugiat cillum est dolor anim ad. Lorem mollit nostrud culpa excepteur. Sint elit id anim esse magna est pariatur adipisicing.</div>

      <h1 style='margin-bottom: 20px'>Heading 3</h1>
      <div style='text-align: justify'>Exercitation velit irure irure est nisi eu deserunt ut sunt eiusmod tempor aute esse ad. Id velit magna dolor occaecat fugiat cupidatat cillum eiusmod dolor exercitation laborum consequat sint. Amet incididunt voluptate dolor adipisicing laboris eiusmod nulla commodo consequat laborum in in. Est do do nisi incididunt occaecat enim quis occaecat ipsum et. Duis officia consequat veniam irure. Ad ad dolor velit aliquip nostrud. Ullamco irure tempor cupidatat laborum duis eu sit amet dolore id. Qui duis laboris aliqua occaecat ullamco dolor ipsum. Aute reprehenderit laboris nulla sit ea ex dolor et magna quis in ex. Irure pariatur veniam exercitation mollit dolor ex sit esse velit minim nisi. Amet adipisicing cillum labore esse commodo sunt. Ut cillum proident nulla elit anim ipsum irure commodo amet aliquip commodo consequat. Sit irure nisi cillum ullamco. Lorem occaecat in cupidatat nulla nulla nostrud pariatur aliqua anim aliqua ea Lorem. In reprehenderit sunt laboris ex ea adipisicing fugiat cillum est dolor anim ad. Lorem mollit nostrud culpa excepteur. Sint elit id anim esse magna est pariatur adipisicing.</div>

      <h1 style='margin-bottom: 20px'>Heading 4</h1>
      <ol>
        <li>Voluptate cupidatat aute officia exercitation anim duis.</li>
        <li>Non ea aliquip anim dolor dolor voluptate deserunt exercitation do.</li>
        <li>Adipisicing cupidatat excepteur ipsum laboris ex laboris cupidatat aliquip eiusmod id veniam anim est.</li>
        <ul>
          <li>Pariatur deserunt velit deserunt velit nisi ut minim laborum magna culpa.</li>
          <li>Proident proident nostrud dolore adipisicing anim duis amet nostrud exercitation ut deserunt eiusmod eiusmod deserunt.</li>
          <li>Proident sunt proident in quis ut consectetur non sunt ad eu id.</li>
        </ul>
      </ol>

      <a href="https://sgcodes.co.in" style="font-size: 34px">Click here</a>

      <h1 style='margin-bottom: 20px'>Heading 5</h1>
      <table border="1">
        <tr>
          <th>Heading 1</th>
          <th>Heading 2</th>
          <th>Heading 3</th>
          <th>Heading 4</th>
        </tr>
        <tr>
          <td>Data 1</td>
          <td>Data 2</td>
          <td>Data 3</td>
          <td>Data 4</td>
        </tr>
        <tr>
          <td>Data 1</td>
          <td>Data 2</td>
          <td>Data 3</td>
          <td>Data 4</td>
        </tr>
        <tr>
          <td>Data 1</td>
          <td>Data 2</td>
          <td>Data 3</td>
          <td>Data 4</td>
        </tr>
      </table>
      `

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
        .image_letterhead{
            width:99%;
            object-fit:contain;
        }

       
        

    </style>
    </head>

    <body>
    
        <div class="InvCard">

                ${cmpcode.toLowerCase().trim() == 'premier' ?
                `<div>
                <img class="image_letterhead" src=${logoUri}
                </div>` : ""}


        <div class=${cmpcode?.trim().toLowerCase() == 'premier' ? "header_without_top_margin" : "header"}>
            <div class="LogoContent">
                <div>TAX INVOICE</div>
            </div>
        </div>

        <div class="content">

            <div class="our_trn_number">
                <div class="label">TRN:${getTRNnumber(cmpcode?.toUpperCase().trim())}</div>
            </div>

            <div>
            <span STYLE="border-radius:5px;border:1px solid #000000;font-size:12px;padding:4px">
            CUSTOMER DETAILS
            </span>
            </div>

            <div class="our_company_name_panel">

                <div class="section">
                    
                    <div style="flex-grow: 1;">
                        <div class="labelValue" style="font-weight: bold;">${selectedCustomer ? selectedCustomer : ''}
                        </div>
                    
                        <div class="labelValue" style="font-weight: bold;">${selectedCustomerAddress ? selectedCustomerAddress : ''}
                        </div>
                    </div>  
                    <div class="TrnTop">
                        <div class="label">CLIENT TRN:</div>
                        <div class="labelValue">${trn ? trn : ''}</div>
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
                        <div style="font-weight: bold;">${selectedInvoiceNo ? selectedInvoiceNo : ""}
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

                       ${itemList.map((item, index) => `
                        <tr style="border-bottom:2px dashed #7f7f7f">
                            <td style="width:10%">${index + 1}</td>
                            <td style="width:15%">${item.ITEM_CODE}</td>
                            <td style="width:25%">${item.DESCRIPTION}</td>
                          
                            <td style="width:10%">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3
                }).format(item.QTY)}</td>
                            <td style="width:10%">${item.PRICE}</td>
                            <td style="width:10%">${item.LINE_TOTAL}</td>
                           
                            <td style="text-align: right; width:10%">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(item.LINE_TOTAL * 0.05)}</td>

                <td style="text-align: right; width:10%">${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format((item.LINE_TOTAL * 0.05) + item.LINE_TOTAL)}</td>
                        </tr>
                        `).join('')}
                    
                    </tbody>
                    </table>
                </div>

                 
                  

                <div style="display:flex;flex-direction:column;width:100%;border:1px solid #000000;border-radius:5px;margin-top: 1px;">

                    <div style="width:100%">
                        <div style="display:flex;justify-content:end;margin:10">
                            <div style="display:flex;justify-content:space-between;width:40%">
                                <label>Total Qty: </label>
                                <label style="min-width: 30%;margin-right: 10px;">${
                                    itemList?.reduce((acc,curr)=>{
                                        return acc = acc + curr.QTY
                                    },0)
                                } </label>
                            </div>
                            <div style="display:flex;justify-content:space-between;width:40%">
                                <label>Total [Excl. VAT]: </label>
                                <label>${subTotal ? new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(subTotal) : ''} </label>
                            </div>
                        </div>

                    </div>  

                    <div style="width:100%;display:flex;padding-top:30px">
                        <div style="width:60%">
                            <div style="margin-left: 30px;">${toWords.convert(123)}</div>
                            <div style="margin-left: 30px;">TERMS </div>
                        </div>
                        <div style="width:40%">
                            <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                                <div>TAXABLE AMOUNT</div>
                                <div>${subTotal ? new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(subTotal) : ''}</div>
                            </div>
                                <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                            <div>VAT AMOUNT</div>
                            <div>${
                                (subTotal ? (subTotal * 0.05).toFixed(2) : '')
                            }</div>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding: 0px 10px 10px 0px;">
                            <div>TOTAL[incl. VAT]</div>
                            <div>${(subTotal
                                ? new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2, maximumFractionDigits: 2
                                }).format(subTotal + subTotal * 0.05)
                                : '')}</div>
                        </div>
                    </div>

                </div>
            </div>  

            
            
            <div class="footer">

                <div style="display:flex;width:100%;">
                    <div class="footer-received-panel" style="display:flex;width:60%">
                        
                        <div style="display:flex;flex-direction:column;width:50%">
                            <label style="font-weight: bold;">DO NO</label>
                            <label></label>
                        </div>
                        <div style="display:flex;flex-direction:column;width:50%">
                            <label style="font-weight: bold;">Remarks</label>
                            <label></label>
                        </div>
                    
                    </div>

                    <div style="display:flex;justify-content:end;width:40%;padding-top:80px">
                   
                        <label class="loginUserLabel" style="margin-right:12px;border-top:1px solid #000000">
                        <div style="font-weight: bold;padding-left:50px;padding-top:5px"> ${cmpcode?.trim().toUpperCase() == "PREMIER" ? "PREMIER AUTO PARTS LLC" : ''}</div>
                        </label>
                    </div>
                </div>    

            </div>
        </div>
    </div>

   
        </body>    
        </html>`


        const addPageNumbersToHTML = (html, totalPages) => {
            let pageNumberHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                pageNumberHTML += `<div class="page-number">Page ${i} of ${totalPages}</div>`;
            }

            return html.replace(/<div class="Pagefooter">([\s\S]*?)<\/div>/g, (_, footerContent) => {
                const pageNumberDiv = pageNumberHTML.split('</div>')[0] + '</div>';
                pageNumberHTML = pageNumberHTML.replace(pageNumberDiv, '');
                return `<div class="Pagefooter">${footerContent}${pageNumberDiv}</div>`;
            });
        };

        const cmpcodeChk = cmpcode.toUpperCase();
        // const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNewMalbar : htmlNew;
        const initialHTML = cmpcodeChk === 'MALBAR' ? htmlNew : htmlNew;

        console.log('cmpcodeChk', cmpcodeChk)

        let options = {
            html: initialHTML,
            fileName: 'Invoice',
            directory: 'Documents',
        };

        try {

            // Generate the initial PDF to get the total number of pages
            const file = await RNHTMLtoPDF.convert(options);
            const totalPages = file.numberOfPages; // Assuming the library returns the number of pages

            console.log("totalPage>>", totalPages);

            setPdfUri(`file://${file.filePath}`);
            await Share.open({
                title: 'Share Invoice Details PDF',
                url: `file://${file.filePath}`,
            });
        } catch (error) {
            console.error(error);
        } finally {
            resultClosePress()
        }
    }
    // pdfCode

    const resultClosePress = () => {
        setSelectedCustomer('')
        setSelectedCustomerAddress('')
        setSlelecetdInvNo('')
        setLoginUser('')
        setItemList('')
        setTerms('')
        setSubTotal(0)
        setDiscount(0)

        setShowPrintButtonLoader(false)

    }

    useEffect(() => {
        if (itemList && itemList.length > 0) {
            const totalLineCost = itemList.reduce((acc, item) => acc + item.LINE_TOTAL, 0);
            console.log("Total Line Cost:", totalLineCost);
            setSubTotal(totalLineCost)
            // You can set this totalLineCost to state if needed
        }
    }, [itemList]);


    // getPrintItemDetails

    const fetchItemList = async (item) => {

        console.log("item after print button clicked ", item)

        setShowPrintButtonLoader(true)
        try {
            setSelectedCustomer(item.CUSTOMER)
            setSelectedCustomerAddress(item.ADDRESS)
            setSlelecetdInvNo(item.INVNO)
            setLoginUser(item.USER)

            // Convert and format the date
            const formattedDate = format(new Date(item.INV_DATE), 'dd/MM/yyyy');
            setSelectedInvDate(formattedDate)
            console.log('fetchItemList', `${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`)
            const response = await axios.get(`${appUrl}SalesInvoiceDetail/${cmpcode}/${item.INVNO}/${deptNo}`);

            if (response.status === 200) {
                setItemList(response.data);
                setTerms(response.data[0].terms.trim().toUpperCase())
                // setSubTotal(response.data[0].inv_total)
                setDiscount(response.data[0].disc_amt)
                setTrn(response.data[0].TRN)

                // setShowPrintButtonLoader(false)
            }


        } catch (error) {
            console.log('fetchItemListError', error)
            setError(error);
            setShowPrintButtonLoader(false)
        }
    };

    useEffect(() => {
        if (itemList && subTotal) {
            generatePDF()
        }
    }, [itemList, subTotal])

    // const subTotal = itemList && itemList.length > 0 && itemList.reduce((sum, item) => sum + (item.line_total || 0), 0)

    // console.log('subTotal', subTotal)

    // getPrintItemDetails


    const toggleExpand = (account) => {
        setExpandedItems(prevState => {
            if (prevState.includes(account)) {
                return prevState.filter(itemCode => itemCode !== account);
            } else {
                // return [...prevState, account];
                return [account];
            }
        });
    };

    const fetchAsyncUser = async () => {
        const salesMan = await AsyncStorage.getItem('sales_man')

        const deptno = await AsyncStorage.getItem('DEPTNO')

        const appUrl = await AsyncStorage.getItem('appUrl')

        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        // const locusername = await AsyncStorage.getItem('loginUserName')

        // if (locusername) {
        //     setLoginUser(locusername)
        // }

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }


        if (appUrl) {
            setAppUrl(appUrl)
        }

        if (salesMan === '----') {
            const salesManDrop = await AsyncStorage.getItem('sales_man_drop')
            setSalesMan(salesManDrop)
        } else {
            setSalesMan(salesMan)

        }
        if (deptno) {
            setDeptNo(deptno)
        } else {
            setDeptNo('----')
        }
    }

    useEffect(() => {
        fetchAsyncUser()
    }, [])

    useEffect(() => {

        if (salesMan && deptNo && appUrl && cmpcode) {
            setShowLoader(true)
            const fetchList = async () => {
                try {
                    console.log(`${appUrl}SalesInvoice/${cmpcode}/invoicelist/${deptNo}/${salesMan}/-`)
                    const response = await axios.get(`${appUrl}SalesInvoice/${cmpcode}/invoicelist/${deptNo}/${salesMan}/-`)

                    // console.log(response.data)

                    if (response.status === 200) {
                        setListData(response.data)
                        setData(response.data)
                        setShowLoader(false)
                    }
                    setShowLoader(false)

                } catch (error) {
                    console.log('fetchList', error)
                    setApiError('Some Error Occured')
                    setShowLoader(false)

                }
            }

            fetchList()

        }

    }, [salesMan, deptNo, appUrl, cmpcode])



    const fetchAppUrl = async () => {
        const appUrl = await AsyncStorage.getItem('appUrl')
        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }
        if (appUrl) {
            setAppUrl(appUrl)
        }
    }


    const fetchSalesMan = async () => {
        const salesMan = await AsyncStorage.getItem('sales_man')

        if (salesMan === '----') {
            const salesManDrop = await AsyncStorage.getItem('sales_man_drop')
            setSalesMan(salesManDrop)
        } else {
            setSalesMan(salesMan)

        }
    }



    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy');
    }


    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return data.slice(startIndex, endIndex);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        fetchSalesMan()
        fetchAppUrl()
    })



    // console.log('prevOrder', data)

    // console.log('listData', listData && listData[0])

    console.log('itemList', itemList && itemList[0])

    // console.log('selectedRadio', selectedRadio)

    console.log('terms', terms)

    console.log('subTotal', subTotal)

    console.log('discount', discount)

    return (
        <View style={styles.HomeWrap}>
            {/* <Header /> */}

            <HeaderUiNew name={'Previous Invoices'} />

            <View style={styles.HomeCont}>

                {/* <View style={styles.HomeTextCont}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                    </TouchableOpacity>
                    <Text style={styles.HomeText}>Previous Orders</Text>
                </View> */}

                {
                    showLoader &&
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                }

                {
                    !showLoader && apiError && !listData &&
                    <View>
                        <Text style={styles.ErrorText}>{apiError}</Text>
                    </View>
                }
                {/* 
                {
                    data.length === 0 && !loading &&
                    <View>
                        <Text style={{
                            color: 'red',
                            fontSize: 16,
                            fontFamily: 'Lexend-Bold',
                        }}>No Data Available</Text>
                    </View>
                } */}


                <FlatList
                    data={getPaginatedData()}
                    keyExtractor={(item, index) => index}
                    style={{ width: '94%' }}
                    renderItem={({ item }) => (
                        <ScrollView style={styles.PreviousOrderWrap}>
                            {/*  */}

                            {/* <View style={styles.StockListItem} onPress={() => navigation.navigate('OrderDetails', { orderId: item.so_no })}> */}
                            <View style={styles.StockListItem}>

                                <View style={styles.CustomerListCont}>

                                    <View style={styles.CustomerImgWrap}>
                                        <Image style={styles.CustomerImage} source={require('../images/listWhite.png')} />
                                    </View>

                                    <View style={styles.CustomerListMid}>
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            width: '100%'
                                        }}>
                                            <Text style={[styles.StockListDescText, { width: '75%' }]}>{item.CUSTOMER}</Text>
                                            <Text style={[styles.StockListDescTextSmall, { color: '#30B3A4', fontFamily: 'Lexend-Regular', }]}>{item.AMOUNT}</Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            width: '100%',
                                            paddingVertical: 6
                                        }}>
                                            <Text style={styles.StockListDescTextSmall}>{item.INVNO}</Text>
                                            <View style={{
                                                marginLeft: 24,
                                                flexDirection: 'row'
                                            }}>
                                                {/* <Text style={[styles.StockListDescTextSmall,]}>Inv Date:</Text> */}
                                                <Text style={[styles.StockListDescTextSmall,]}>{formattedDate(item.INV_DATE)}</Text>
                                            </View>
                                            <View style={{
                                                marginLeft: 24,
                                                flexDirection: 'row'
                                            }}>
                                                {/* <Text style={[styles.StockListDescTextSmall,]}>Inv Date:</Text> */}
                                                <Text style={[styles.StockListDescTextSmall,]}>{item['SALES MAN']}</Text>
                                            </View>

                                            <TouchableOpacity style={[styles.PrintAcceptButton,]} onPress={() => fetchItemList(item)}>
                                                {
                                                    showPrintButtonLoader && item.INVNO === selectedInvoiceNo ?
                                                        <ActivityIndicator color={'white'} />
                                                        :
                                                        <Text style={styles.PrintAcceptText}>Print</Text>
                                                }
                                            </TouchableOpacity>

                                            {/* <TouchableOpacity style={[styles.PlusMinusCont, { marginLeft: 'auto' }]} onPress={() => toggleExpand(item.INVNO)}>
                                                {
                                                    expandedItems.includes(item.INVNO) ?
                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkMinus.png')} />
                                                        :
                                                        <Image style={styles.PlusMinusImg} source={require('../images/chkPlus.png')} />
                                                }
                                            </TouchableOpacity> */}
                                        </View>
                                    </View>

                                </View>


                                {/* {
                                    expandedItems.includes(item.so_no) && (

                                        <View style={styles.QtyAvlQtyCont}>

                                            <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', marginRight: 16 }]} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'edit' })}>
                                                <Text style={styles.QtyText}>Edit Sales Order</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.QtyCont, { backgroundColor: '#D8D8DA', }]} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'pull' })}>
                                                <Text style={styles.AvlText}>Pull Sales Order</Text>
                                            </TouchableOpacity>
                                        </View>

                                    )
                                } */}


                            </View>
                            {/*  */}
                            {/* 
                            <View style={styles.PreviousOrderCard}>
                                <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: item.so_no })}>
                                    <Text style={styles.OrderNoText}>{item.so_no}</Text>
                                    <Text style={styles.CustomerNameText}>{item.accdesc}</Text>

                                </TouchableOpacity>

                                <View style={styles.OrderUpdatesWrap}>


                                    <View style={styles.EditPullWrap}>
                                        <TouchableOpacity style={styles.EditPullButton} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'edit' })}>
                                            <Text style={styles.EditPullText}>Edit Sales Order</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.EditPullButton} onPress={() => navigation.navigate('MakeOrder', { orderId: item.so_no, type: 'pull' })}>
                                            <Text style={styles.EditPullText}>Pull Sales Order</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View> */}

                        </ScrollView>
                    )}
                />


                {
                    data.length > 0 && !loading &&
                    <View style={styles.pagination}>
                        {
                            currentPage !== 1 &&
                            <TouchableOpacity onPress={handlePreviousPage} disabled={currentPage === 1} style={styles.pageButton}>
                                <Text style={styles.pageButtonText}>Previous</Text>
                            </TouchableOpacity>
                        }
                        <Text style={styles.pageInfo}>
                            Page {currentPage} of {totalPages}
                        </Text>
                        {
                            currentPage !== totalPages &&
                            <TouchableOpacity onPress={handleNextPage} disabled={currentPage === totalPages} style={styles.pageButton}>
                                <Text style={styles.pageButtonText}>Next</Text>
                            </TouchableOpacity>
                        }
                    </View>
                }


            </View>

            {
                showStatusLogPop &&
                <StatusLogPop orderIdPop={orderIdPop} setShowStatusLogPop={setShowStatusLogPop} />
            }
        </View >
    )
}

const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFEFEF',
        width: '100%'
    },
    HomeCont: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingHorizontal: 8,
        paddingVertical: 12,
        // borderTopLeftRadius: 18,
        // borderTopRightRadius: 18,
        backgroundColor: '#EFEFEF',
        height: Dimensions.get('window').height - 70

    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    HomeText: {
        fontSize: 18,
        color: 'black',
        borderBottomColor: 'gold',
        borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Bold'
    },
    PreviousOrderWrap: {
        width: '100%',
        flexDirection: 'column',
        // alignItems: 'center',
        marginTop: 3
    },
    PreviousOrderCard: {
        width: '100%',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 6,
        marginBottom: 8
    },
    OrderNoText: {
        backgroundColor: '#ffbb00',
        padding: 6,
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        color: 'black',
        marginBottom: 6,
        width: '20%'
    },
    CustomerNameText: {
        fontSize: 18,
        fontFamily: 'Lexend-Regular',
        color: 'black',
        marginVertical: 4
    },
    StatusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4
    },
    StatusTextTag: {
        color: 'blue',
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
    StatusText: {
        fontSize: 18,
        fontFamily: 'Lexend-Regular',
        color: 'black',
        marginLeft: 12
    },
    OrderUpdatesWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginVertical: 4,
        backgroundColor: '#f5f5f5',
        padding: 8
    },
    ViewStatusWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginVertical: 4
    },
    ViewStatusButton: {
        backgroundColor: 'black',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 4
    },
    ViewStatusText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'white',
    },
    EditPullWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8
    },
    EditPullButton: {
        backgroundColor: '#8f8f8f',
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginRight: 12,
        borderRadius: 4
    },
    EditPullText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'white',
    },
    CardScroll: {
        width: '100%',
        alignItems: 'center'
    },

    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        width: '80%',
        marginBottom: 16
    },
    pageButton: {
        padding: 10,
        backgroundColor: '#5A55CA',
        borderRadius: 5,
    },
    pageButtonText: {
        color: '#fff',
        fontFamily: 'Lexend-Regular',
    },
    pageInfo: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: 'black'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    HeadIcon: {
        width: 25,
        height: 25
    },


    StockListItem: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 8,
        backgroundColor: '#FDFDFD',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 14,
        width: '100%',

        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowOpacity: 0.25, // Shadow opacity for iOS
        shadowRadius: 3.84, // Shadow radius for iOS
        elevation: 1.5, // Elevation for Android

        borderColor: 'grey',
        borderWidth: 0.5,
    },

    StockItemListHead: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    StockListCodeText: {
        fontFamily: 'Lexend-Light',
        color: "#2B2B2B",
    },
    PlusMinusImg: {
        width: 18,
        height: 18
    },
    PlusMinusCont: {
        padding: 4,
        backgroundColor: '#EFEFEF'
    },

    StockItemDescCont: {
        paddingVertical: 8
    },
    StockListDescText: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        color: '#4B5290'
    },
    QtyAvlQtyCont: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 8
    },
    QtyCont: {
        padding: 8,
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'orange'
    },
    QtyText: {
        fontFamily: 'Lexend-Light',
        // color: '#4B5290'
        color: 'black'
    },
    AvlText: {
        fontFamily: 'Lexend-Light',
        // color: '#8f6924'
        color: 'black'

    },
    DynamicPriceView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    PriceTag: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 8
    },
    PriceValueText: {
        fontFamily: 'Lexend-Regular',
        color: "#2B2B2B",
        marginLeft: 12
    },

    CustomerListCont: {
        flexDirection: 'row',
        width: '100%',
        // justifyContent: 'space-between',
        alignItems: 'center'
    },
    CustomerImage: {
        width: 30,
        height: 30
    },
    CustomerImgWrap: {
        backgroundColor: 'grey',
        borderRadius: 50,
        padding: 8,
        // width: 'auto'
    },

    CustomerListMid: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '80%',
        marginLeft: 12
    },
    StockListDescText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: '#2b2b2b'
    },
    StockListDescTextSmall: {
        fontSize: 14,
        fontFamily: 'Lexend-Light',
        color: '#2b2b2b'
    },
    CustomerListRight: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12
    },

    PrintAcceptButton: {
        backgroundColor: '#30B3A4',
        // padding: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',

        position: 'absolute',
        right: 0
    },
    PrintAcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },




})


export default InvoiceList