import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import HeaderUiNew from './HeaderUiNew';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import ThermalPrinterModule from 'react-native-thermal-printer';
import SunmiPrinter, { AlignValue } from '@heasy/react-native-sunmi-printer';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Shared helper: request Android storage permission ─────────────────────
const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
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
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission denied');
      }
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  }
};

// ─── Shared section header styles for PDF ──────────────────────────────────
const PDF_SECTION_LABEL_STYLE =
  'font-weight:bold; border-bottom:1px solid #5A55CA; margin:10px 0 4px 0; font-size:13px; color:#5A55CA;';

const PDF_ROW_STYLE =
  'display:flex; flex-direction:row; border-bottom:1px solid #eee; padding:4px 0;';

const PDF_HEADER_CELL =
  'padding:6px 8px; font-weight:bold; background:#5A55CA; color:white; font-size:12px;';

const buildPdfItemRows = (items, typeFilter) =>
  items
    .filter(i => i.Type === typeFilter)
    .map(
      item => `
  <tr>
    <td style="padding:6px 8px;">${item.rv_no || '-'}</td>
    <td style="padding:6px 8px;">${item.Inv_ref || '-'}</td>
    <td style="padding:6px 8px; width:200px;">${item['Customer Name'] || '-'
        }</td>
    <td style="padding:6px 8px; text-align:right;">${parseFloat(
          item.Amount || 0,
        ).toFixed(2)}</td>
    <td style="padding:6px 8px;">${item.Salesman || ''}</td>
    <td style="padding:6px 8px;">${item.Remarks || ''}</td>
  </tr>`,
    )
    .join('');

const buildPdfAdminRows = (groupedData, typeFilter) =>
  Object.entries(groupedData)
    .map(([name, items]) => {
      const filtered = items.filter(i => i.Type === typeFilter);
      if (!filtered.length) return '';
      const subTotal = filtered.reduce((s, i) => s + (i.Amount || 0), 0);
      return `
  <tr style="background:#f0f0ff;">
    <td colspan="5" style="padding:4px 8px; font-weight:bold;">${name}</td>
    <td style="padding:4px 8px; text-align:right; font-weight:bold;">${subTotal.toFixed(
        3,
      )}</td>
  </tr>
  ${filtered
          .map(
            item => `
  <tr>
    <td style="padding:6px 8px;">${item.rv_no || '-'}</td>
    <td style="padding:6px 8px;">${item.Inv_ref || '-'}</td>
    <td style="padding:6px 8px; width:200px;">${item['Customer Name'] || '-'
              }</td>
    <td style="padding:6px 8px; text-align:right;">${parseFloat(
                item.Amount || 0,
              ).toFixed(2)}</td>
    <td style="padding:6px 8px;">${item.Salesman || ''}</td>
    <td style="padding:6px 8px;">${item.Remarks || ''}</td>
  </tr>`,
          )
          .join('')}`;
    })
    .join('');

const CollectionReport = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [apiResponse, setApiResponse] = useState(null);
  const [accessGroup, setAccessGroup] = useState('');
  const [apiDataGroupedBySalesman, setApiDataGroupedBySalesman] =
    useState(null);
  const [apiData, setApiData] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showError, setShowError] = useState('');

  const [cashSum, setCashSum] = useState(0);
  const [chequeSum, setChequeSum] = useState(0);
  const [cashSalesSum, setCashSalesSum] = useState(0);
  const [creditSalesSum, setCreditSalesSum] = useState(0);
  const [cashSalesReturnSum, setCashSalesReturnSum] = useState(0);
  const [creditSalesReturnSum, setCreditSalesReturnSum] = useState(0);

  const [activeTab, setActiveTab] = useState('collection');

  const [salesperson, setSalesPerson] = useState('');
  const [cmpCode, setCmpCode] = useState('');
  const [deptNo, setDeptno] = useState('');
  const [van, setVan] = useState('');
  const [salesName, setSalesName] = useState('');
  const [salesManName, setSalesManName] = useState('');
  const [cmpName, setCmpName] = useState('');

  const getCompanyDetails = code => {
    const c = (code || '').trim().toUpperCase();
    const companyMap = {
      MALBAR: {
        name: 'MALBAR',
        trn: '100335207500003',
        address: 'Address line 1',
        city: 'City',
        tel: 'Tel',
      },
      PREMIER: {
        name: 'PREMIER AUTO PARTS LLC',
        trn: '10027835690000',
        address: 'Address line 1',
        city: 'City',
        tel: 'Tel',
      },
      ICELAB: {
        name: 'THE ICE LAB MANUFACTURING LLC',
        trn: '104112430400003',
        address: 'Central Plaza 2, Al Jurf',
        city: 'Ajman, UAE',
        tel: '065617700',
      },
      ICELAB_TEST: {
        name: 'CUBIX TEST COMPANY VAN SALES',
        trn: '1041000000000000',
        address: 'Dumuscusss, Al Qusais',
        city: 'Dubai, UAE',
        tel: '000617700',
      },
      POPULAR: {
        name: 'POPULAR AUTO SPARE PARTS TRADING LLC',
        trn: '100327766000003',
        address: 'Address line 1',
        city: 'City',
        tel: 'Tel',
      },
      MESHARI: {
        name: 'MESHARI FOODSTUFF TRADING LLC',
        trn: '100449215100003',
        address: 'Address line 1',
        city: 'City',
        tel: 'Tel',
      },
      ICUP: {
        name: 'ICECUP FOOD INDUSTRIES L.L.C',
        trn: '100456789000003',
        address: 'Address line 1',
        city: 'City',
        tel: 'Tel',
      },
    };

    return (
      companyMap[c] || {
        name: cmpName || code || 'Company',
        trn: '-',
        address: '-',
        city: '-',
        tel: '-',
      }
    );
  };

  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);
  const [fromData, setFromData] = useState(null);
  const [appUrl, setAppUrl] = useState('');

  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedStockSmall, setSelectedStockSmall] = useState(null);

  const [pdfLoadingColl, setPdfLoadingColl] = useState(false);
  const [pdfLoadingDaily, setPdfLoadingDaily] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const isAdmin =
    accessGroup?.trim()?.toUpperCase() === 'C ADMIN' ||
    accessGroup?.trim()?.toUpperCase() === 'CADMIN' ||
    accessGroup?.trim()?.toUpperCase() === 'ADMIN';

  const cashInHand =
    parseFloat(cashSalesSum || 0) +
    parseFloat(cashSum || 0) -
    parseFloat(cashSalesReturnSum || 0);

  const formattedDateTime = selectedStock?.Rv_date
    ? format(selectedStock.Rv_date, 'dd-MM-yyyy')
    : format(new Date(), 'dd-MM-yyyy');

  // ── Date picker ────────────────────────────────────────────────────────────
  const showFromDatePicker = () => setFromDatePickerVisibility(true);
  const hideFromDatePicker = () => setFromDatePickerVisibility(false);
  const handleFromDateConfirm = date => {
    setFromData(format(date, 'yyyy-MM-dd'));
    hideFromDatePicker();
  };

  // ── Fetch async storage ───────────────────────────────────────────────────
  const fetchAsyncData = async () => {
    try {
      const sm = await AsyncStorage.getItem('sales_man');
      const deptno = await AsyncStorage.getItem('DEPTNO');
      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsedUserDataArray =
        (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];
      const van_ = await AsyncStorage.getItem('VAN');
      const salesName_ = await AsyncStorage.getItem('salesman_name');
      const appUrl_ = await AsyncStorage.getItem('appUrl');
      const salesManName_ = await AsyncStorage.getItem('salesman_name');
      const portNoData = await AsyncStorage.getItem('portNoData');
      const accessGroup_ = await AsyncStorage.getItem('accessgrp');

      setAccessGroup(accessGroup_);
      if (portNoData) {
        const dataArray = JSON.parse(portNoData);
        setCmpCode(dataArray[0].COMPID);
        setCmpName(dataArray[0].COMPNAME);
      }
      if (salesManName_) setSalesManName(salesManName_);
      if (appUrl_) setAppUrl(appUrl_);
      if (van_) setVan(van_);
      if (salesName_) setSalesName(salesName_);
      if (parsedUserDataArray.length > 0)
        setCmpCode(parsedUserDataArray[0].cmpcode.trim());
      if (deptno) setDeptno(deptno);
      if (sm) setSalesPerson(sm);
    } catch (error) {
      console.log('fetchAsyncDataError', error);
    }
  };

  useEffect(() => {
    fetchAsyncData();
  }, []);

  // ── Set today's date when user info is ready ──────────────────────────────
  useEffect(() => {
    if (cmpCode && deptNo && salesperson) {
      setFromData(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [cmpCode, deptNo, salesperson]);

  // ── Fetch API data ────────────────────────────────────────────────────────
  const groupedBySalesman = arr =>
    arr.reduce((acc, curr) => {
      const key = curr.Salesman;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

  const fetchCollectionData = async () => {
    setShowLoader(true);
    setShowError('');
    let apiUrl = `${appUrl}DailyReport/${cmpCode}/COLLECTION/${deptNo}/${salesperson}/${fromData}`;
    console.log('Fetching collection data from:', apiUrl);
    if (isAdmin) {
      apiUrl = `${appUrl}DailyReport/${cmpCode}/COLLECTION/${deptNo}/${accessGroup.replaceAll(
        ' ',
        '',
      )}/${fromData}`;
    }
    try {
      const response = await axios.get(apiUrl);

      console.log("response.data collection", response.data)
      if (response.status === 200) {
        setApiResponse(response.data);
        if (isAdmin) {
          setApiDataGroupedBySalesman(groupedBySalesman(response.data));
        } else {
          setApiData(response.data);
        }
      }
    } catch (error) {
      console.log('fetchCollectionData error:', error);
      setShowError('Some Error Occurred');
    } finally {
      setShowLoader(false);
    }
  };

  useEffect(() => {
    if (cmpCode && deptNo && salesperson && fromData && appUrl && accessGroup) {
      fetchCollectionData();
    }
  }, [cmpCode, deptNo, salesperson, fromData, appUrl, accessGroup]);

  // ── Process sums ──────────────────────────────────────────────────────────
  const processSums = dataArr => {
    const getSum = typeKeys =>
      dataArr
        .filter(item =>
          typeKeys.some(
            k => item.Type?.trim().toUpperCase() === k.toUpperCase(),
          ),
        )
        .reduce((s, i) => s + (parseFloat(i.Amount) || 0), 0);

    setCashSum(getSum(['CASH-SALES']));
    setCashSalesSum(getSum(['CASH-COLLECTION']));
    setCreditSalesSum(getSum(['Credit', 'CREDIT-SALES']));
    setCashSalesReturnSum(
      getSum(['CASH_RET', 'CASH-SALES-RETURN', 'SALES-RETURN']),
    );
    setCreditSalesReturnSum(getSum(['CREDIT_RET', 'CREDIT-SALES-RETURN']));
    setChequeSum(getSum(['CHEQUE-COLLECTION']));
  };

  useEffect(() => {
    console.log("apiData collection ", apiData)
    if (apiData && Array.isArray(apiData)) processSums(apiData);
  }, [apiData]);

  useEffect(() => {
    if (apiResponse && Array.isArray(apiResponse)) processSums(apiResponse);
  }, [apiResponse]);

  // ── Letter head for SOCA ──────────────────────────────────────────────────
  const getLetterheadBase64 = () =>
    new Promise(resolve => {
      RNFS.readFileAssets('soca_letterhead_text.txt')
        .then(result => resolve(result))
        .catch(() => resolve(''));
    });

  // ── Collection voucher PDF (per-item) ─────────────────────────────────────
  const generatePDFColl = async item => {
    await requestStoragePermission();
    const logoUri = await getLetterheadBase64();

    const cmpLabel =
      cmpCode?.trim()?.toUpperCase() === 'SOCA'
        ? 'SOCA TOOLS INTERNATIONAL TRADING LLC'
        : cmpName;

    const collType =
      item.Type === 'CASH-SALES'
        ? 'CASH'
        : item.Type === 'cash-collection'
          ? 'CASH'
          : item.Type === 'cheque-collection'
            ? 'CHEQUE'
            : item.Type;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:'Calibri',sans-serif;margin:0;padding:12px;font-size:13px;}
      .title{text-align:center;font-size:18px;font-weight:bold;margin:8px 0;}
      .company{text-align:center;font-size:15px;font-weight:bold;margin-bottom:4px;}
      .divider{border-top:1px solid #333;border-bottom:1px solid #333;padding:10px 0;margin:8px 0;}
      .row{display:flex;justify-content:space-between;margin:5px 0;}
      .label{font-weight:bold;}
      .amount-box{border:1px solid #999;padding:2px 8px;display:inline-block;}
      .sig{margin-top:80px;text-align:right;}
      .footer{margin-top:24px;font-size:11px;color:#555;text-align:center;}
    </style></head><body>
    ${cmpCode?.toLowerCase().trim() === 'soca'
        ? `<img src="${logoUri}" style="width:100%;" />`
        : ''
      }
    <div class="company">${cmpLabel}</div>
    <div class="title">Collection Voucher</div>
    <div class="divider">
      <div class="row"><span class="label">Date:</span><span>${formattedDateTime}</span></div>
      <div class="row"><span class="label">Voucher No:</span><span>${item?.rv_no || '-'
      }</span></div>
      ${item?.Inv_ref
        ? `<div class="row"><span class="label">Invoice Ref:</span><span>${item.Inv_ref}</span></div>`
        : ''
      }
      <div class="row"><span class="label">Received with thanks from:</span><span>${item['Customer Name'] || '-'
      }</span></div>
      <div class="row">
        <span class="label">Collection Type: ${collType}</span>
        <span>Amount: <span class="amount-box">${parseFloat(
        item?.Amount || 0,
      ).toFixed(2)}</span></span>
      </div>
      <div class="row"><span class="label">Remarks:</span><span>${item?.Remarks || '-'
      }</span></div>
    </div>
    <div class="sig"><div>Signature</div><div>${salesManName}</div></div>
    <div class="footer">${getCompanyDetails(cmpCode).name} | ${getCompanyDetails(cmpCode).address
      } | ${getCompanyDetails(cmpCode).tel}</div>
    </body></html>`;

    try {
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: `Collection_Voucher_${item?.rv_no || 'unknown'}`,
        directory: 'Documents',
      });
      await Share.open({
        title: 'Share Collection Voucher PDF',
        url: `file://${file.filePath}`,
      });
    } catch (err) {
      console.error('generatePDFColl error:', err);
    }
  };

  // ── Collection Report PDF (list) ──────────────────────────────────────────
  const buildCollectionReportHtml = (data, grouped) => {
    const details = getCompanyDetails(cmpCode);
    const infoSection = `
      <div style="text-align:center; margin-bottom:16px;">
        <h2 style="margin:0; color:#1a1a2e;">${details.name}</h2>
        <div style="font-size:12px; color:#666;">${details.address} | Tel: ${details.tel
      }</div>
        ${details.trn !== '-'
        ? `<div style="font-size:12px; color:#666; font-weight:bold;">TRN: ${details.trn}</div>`
        : ''
      }
        <h3 style="margin:10px 0 0; color:#5A55CA; text-transform:uppercase; letter-spacing:1px;">Collection Report</h3>
      </div>
      <div style="margin-bottom:12px; padding:10px; background:#f8f8ff; border-radius:6px; border:1px solid #ddd;">
        <div style="display:flex; gap:24px; flex-wrap:wrap;">
          <span><b>Date:</b> ${fromData}</span>
          <span><b>Location:</b> ${van}</span>
          <span><b>Salesperson:</b> ${salesName}</span>
        </div>
      </div>`;

    const tableHeader = `
      <tr>
        <th style="${PDF_HEADER_CELL}">Rv No</th>
        <th style="${PDF_HEADER_CELL}">Inv No</th>
        <th style="${PDF_HEADER_CELL} width:200px;">Customer</th>
        <th style="${PDF_HEADER_CELL} text-align:right;">Amount</th>
        <th style="${PDF_HEADER_CELL}">Salesman</th>
        <th style="${PDF_HEADER_CELL}">Remarks</th>
      </tr>`;

    const buildSection = (label, typeFilter, total) => {
      const rows = grouped
        ? buildPdfAdminRows(grouped, typeFilter)
        : data
          ? buildPdfItemRows(data, typeFilter)
          : '';
      if (!rows) return '';
      return `
        <div style="${PDF_SECTION_LABEL_STYLE}">${label}</div>
        <table style="border-collapse:collapse; width:100%; margin-bottom:8px; font-size:12px;">
          <thead>${tableHeader}</thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr style="background:#eef; font-weight:bold;">
              <td colspan="3" style="padding:6px 8px;">Total</td>
              <td style="padding:6px 8px; text-align:right;">${parseFloat(
        total || 0,
      ).toFixed(2)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>`;
    };

    const cashSalesSection = buildSection('Cash Sales', 'CASH-SALES', cashSum);
    const cashCollSection = buildSection(
      'Cash Collection',
      'cash-collection',
      cashSalesSum,
    );
    const chequeSection = buildSection(
      'Cheque Collection',
      'cheque-collection',
      chequeSum,
    );

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:'Calibri',sans-serif;margin:0;padding:12px;font-size:13px;}
      h2{text-align:center;color:#5A55CA;}
      table{border-collapse:collapse;width:100%;}
      td{border-bottom:1px solid #eee;}
    </style></head><body>
    ${infoSection}
    ${cashSalesSection}
    ${cashCollSection}
    <div style="background:#fff3cd; border:1px solid #ccc; border-radius:4px; padding:8px; margin:10px 0; font-weight:bold;">
      Cash Balance: ${parseFloat(cashSalesSum + cashSum).toFixed(2)}
    </div>
    ${chequeSection}
    </body></html>`;
  };

  const generateCollectionPDF = async () => {
    setPdfLoadingColl(true);
    await requestStoragePermission();
    try {
      const html = buildCollectionReportHtml(
        isAdmin ? null : apiData,
        isAdmin ? apiDataGroupedBySalesman : null,
      );
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: 'CollectionReport',
        directory: 'Documents',
      });
      await Share.open({
        title: 'Share Collection Report PDF',
        url: `file://${file.filePath}`,
      });
    } catch (err) {
      console.error('generateCollectionPDF error:', err);
    } finally {
      setPdfLoadingColl(false);
    }
  };

  // ── Daily Report PDF ───────────────────────────────────────────────────────
  const generateDailyPDF = async () => {
    setPdfLoadingDaily(true);
    await requestStoragePermission();
    const rows = [
      { label: 'Cash Collection', value: cashSalesSum },
      { label: 'Cash Sales', value: cashSum },
      { label: 'Credit Sales', value: creditSalesSum },
      { label: 'Cash Sales Return', value: cashSalesReturnSum },
      { label: 'Credit Sales Return', value: creditSalesReturnSum },
    ];

    const details = getCompanyDetails(cmpCode);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:'Calibri',sans-serif;margin:0;padding:16px;font-size:13px;color:#222;}
      h2{text-align:center;color:#1a1a2e;margin-bottom:4px;}
      h3{text-align:center;color:#5A55CA;margin-top:0;margin-bottom:12px;}
      .info{background:#f8f8ff;border:1px solid #ddd;border-radius:6px;padding:10px;margin-bottom:16px;}
      .info span{margin-right:20px;}
      .row{display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #eee;}
      .row:nth-child(even){background:#f8f8ff;}
      .label{font-size:14px;}
      .value{font-size:14px;font-weight:bold;}
      .total-row{display:flex;justify-content:space-between;padding:10px 12px;background:#5A55CA;color:white;border-radius:4px;margin-top:10px;font-size:16px;font-weight:bold;}
    </style></head><body>
    <h2>${details.name}</h2>
    <h3>Daily Report – ${fromData}</h3>
    <div class="info">
      <span><b>Date:</b> ${fromData}</span>
      <span><b>Location:</b> ${van}</span>
      <span><b>Salesperson:</b> ${salesName}</span>
    </div>
    ${rows
        .map(
          r =>
            `<div class="row"><span class="label">${r.label
            }</span><span class="value">${parseFloat(r.value || 0).toFixed(
              3,
            )}</span></div>`,
        )
        .join('')}
    <div class="total-row">
      <span>Cash In Hand</span>
      <span>${cashInHand.toFixed(2)} AED</span>
    </div>
    </body></html>`;

    try {
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: `DailyReport_${fromData}`,
        directory: 'Documents',
      });
      await Share.open({
        title: 'Share Daily Report PDF',
        url: `file://${file.filePath}`,
      });
    } catch (err) {
      console.error('generateDailyPDF error:', err);
    } finally {
      setPdfLoadingDaily(false);
    }
  };

  // ── Sunmi print ────────────────────────────────────────────────────────────
  const printToSunmi = async () => {
    try {
      const details = getCompanyDetails(cmpCode);
      SunmiPrinter.printerInit();
      SunmiPrinter.setAlignment(AlignValue.CENTER);
      SunmiPrinter.setFontSize(32);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText(`${details.name}\n`);
      SunmiPrinter.setFontSize(24);
      SunmiPrinter.printerText('DAILY COLLECTION REPORT\n');
      if (details.trn !== '-') {
        SunmiPrinter.setFontSize(20);
        SunmiPrinter.printerText(`TRN: ${details.trn}\n`);
      }
      SunmiPrinter.lineWrap(1);

      const infoWeights = [200, 360];
      SunmiPrinter.setAlignment(AlignValue.LEFT);
      SunmiPrinter.setFontSize(20);
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printColumnsString(
        ['Date:', fromData?.toString() || '-'],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.printColumnsString(
        ['Location:', van?.toString() || '-'],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.printColumnsString(
        ['Salesman:', salesName?.toString() || '-'],
        infoWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.printerText(
        '--------------------------------------------------------\n',
      );

      const dataWeights = [340, 220];
      [
        { label: 'Cash Collection', value: cashSalesSum },
        { label: 'Cash Sales', value: cashSum },
        { label: 'Credit Sales', value: creditSalesSum },
        { label: 'Cash Sales Return', value: cashSalesReturnSum },
        { label: 'Credit Sales Return', value: creditSalesReturnSum },
      ].forEach(item =>
        SunmiPrinter.printColumnsString(
          [item.label + ':', parseFloat(item.value || 0).toFixed(2)],
          dataWeights,
          [AlignValue.LEFT, AlignValue.RIGHT],
        ),
      );

      SunmiPrinter.printerText(
        '--------------------------------------------------------\n',
      );
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.setFontSize(26);
      SunmiPrinter.printColumnsString(
        ['CASH IN HAND:', cashInHand.toFixed(2) + ' AED'],
        dataWeights,
        [AlignValue.LEFT, AlignValue.RIGHT],
      );
      SunmiPrinter.setAlignment(AlignValue.CENTER);
      SunmiPrinter.setFontSize(20);
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText('\n*** End of Report ***\n');
      SunmiPrinter.lineWrap(4);
    } catch (error) {
      console.error('Sunmi Print Error:', error);
    }
  };
  const pad = count => ' '.repeat(count);
  const COMP_PAD = pad(18);
  const CITY_PAD = pad(27);
  const TEL_PAD = pad(26);
  const ADD_PAD = pad(24);
  const TRN_PAD = pad(22);
  const INV_PAD = pad(27);
  const BODY_PAD = pad(5);
  const PAGE_WIDTH = 32;
  const LEFT_SHIFT = 12;
  const BODY_WIDTH = 32;
  const BLOCK_PAD = Math.max(0, Math.floor((PAGE_WIDTH - BODY_WIDTH) / 2));
  const GLOBAL_BODY_PAD = ' '.repeat(LEFT_SHIFT);
  const INTERNAL_WIDTH = PAGE_WIDTH - BLOCK_PAD * 2;
  const LABEL_WIDTH = 16; // adjust for your printer

  const formatAlignedRow = (label, value) => {
    const left = (label || '').padEnd(LABEL_WIDTH, ' ');
    return `[L]${GLOBAL_BODY_PAD}${left}${value || ''}\n`;
  };

  const formatVoucherRow = (label, value) => {
    const left = (label || '').padEnd(LABEL_WIDTH + 10, ' ');
    return `[L]${GLOBAL_BODY_PAD}${left}${value || ''}\n`;
  };
  const formatInlineRow = (label, value) => {
    return `[L]${GLOBAL_BODY_PAD}${label} ${value || ''}\n`;
  };
  const setFormatTextForBluetooth = item => {
    const details = getCompanyDetails(cmpCode);

    const collType =
      item?.Type === 'CASH-SALES' || item?.Type === 'cash-collection'
        ? 'CASH'
        : item?.Type === 'cheque-collection'
          ? 'CHEQUE'
          : item?.Type || '';

    return {
      text:
        // --- Header (Center Tags - These handle themselves) ---
        `${COMP_PAD}<b><font size='tall'>${details.name}</font></b>\n` +
        `${ADD_PAD}${details.address}\n` +
        `${CITY_PAD}${details.city}\n` +
        `${TEL_PAD}Tel: ${details.tel}\n` +
        `${TRN_PAD}TRN: ${details.trn}\n` +
        '[L]\n' +
        // --- Title ---
        `${ADD_PAD}[C]<b><font size='tall'>Collection Voucher</font></b>\n` +
        `[L]\n` +
        // `[C]${'-'.repeat(INTERNAL_WIDTH)}\n` +
        // --- Body Section ---
        formatVoucherRow('Voucher No:', item?.rv_no || '') +
        formatVoucherRow('Inv Ref:', item?.Inv_ref || '') +
        formatVoucherRow('Date:', item?.Rv_date?.slice(0, 10) || '') +
        '[L]\n' +
        `[L]${GLOBAL_BODY_PAD}Received from:\n` +
        `[L]${GLOBAL_BODY_PAD}<b>${item['Customer Name'] || ''}</b>\n` +
        '[L]\n' +
        formatInlineRow('Type:', collType?.trim()) +
        formatAlignedRow(
          'Total Amount:',
          `<b>${parseFloat(item?.Amount || 0).toFixed(2)}</b>`,
        ) +
        (item?.Remarks
          ? '[L]\n' + formatAlignedRow('Remarks:', item.Remarks)
          : '') +
        '[L]\n' +
        `[L]${GLOBAL_BODY_PAD}Received by:\n` +
        `[L]${GLOBAL_BODY_PAD}<b>${item?.Salesman || ''}</b>\n` +
        '[L]\n' +
        `[C]${'-'.repeat(INTERNAL_WIDTH)}\n` +
        '[L]\n[L]\n[L]\n', // 👈 bottom spacing
    };
  };
  const printBluetooth = async item => {
    try {
      const formattedData = setFormatTextForBluetooth(item);
      console.log('Print Data', formattedData);
      await ThermalPrinterModule.printBluetooth({
        payload: formattedData.text,
      });
    } catch (err) {
      console.log('BT print error:', err.message);
    }
  };
  // ── Shared: render a section of collection rows ─────────────────────────
  const renderSectionHeader = label => (
    <View style={styles.SectionHeader}>
      <Text style={styles.SectionHeaderText}>{label}</Text>
    </View>
  );

  const renderTotalRow = (label, value, highlight = false) => (
    <View style={[styles.TotalRow, highlight && styles.TotalRowHighlight]}>
      <Text style={[styles.TotalLabel, highlight && styles.TotalLabelHL]}>
        {label}
      </Text>
      <Text style={[styles.TotalValue, highlight && styles.TotalValueHL]}>
        {parseFloat(value || 0).toFixed(2)}
      </Text>
    </View>
  );

  const renderCollectionItem = (item, index) => (
    <View style={styles.ItemRow} key={index}>
      <View style={styles.ItemBody}>
        <Text style={styles.ItemCustomer} numberOfLines={1}>
          {item['Customer Name']}
        </Text>
        <View style={styles.ItemMeta}>
          <Text style={styles.ItemMetaText}>{item.rv_no}</Text>
          <Text style={styles.ItemMetaSep}>·</Text>
          <Text style={styles.ItemMetaText}>{item.Inv_ref}</Text>
          {item.Salesman ? (
            <>
              <Text style={styles.ItemMetaSep}>·</Text>
              <Text style={styles.ItemMetaText}>{item.Salesman}</Text>
            </>
          ) : null}
        </View>
        {item.Remarks ? (
          <Text style={styles.ItemRemarks} numberOfLines={1}>
            {item.Remarks}
          </Text>
        ) : null}
      </View>
      <View style={styles.ItemRight}>
        <Text style={styles.ItemAmount}>
          {parseFloat(item.Amount || 0).toFixed(2)}
        </Text>
        <View style={styles.ItemActions}>
          <TouchableOpacity
            style={styles.ActionBtn}
            onPress={() => generatePDFColl(item)}>
            <Text style={styles.ActionBtnText}>PDF</Text>
          </TouchableOpacity>
          {(cmpCode?.toUpperCase().trim() === 'ICELAB' ||
            cmpCode?.toUpperCase().trim() === 'ICELAB_TEST') && (
              <TouchableOpacity
                style={[
                  styles.ActionBtn,
                  { backgroundColor: '#444', marginTop: 4 },
                ]}
                onPress={() => printBluetooth(item)}>
                <Text style={styles.ActionBtnText}>BT</Text>
              </TouchableOpacity>
            )}
        </View>
      </View>
    </View>
  );

  const renderItemsByType = (items, typeFilter) =>
    items
      .filter(i => i.Type === typeFilter)
      .map((item, index) => renderCollectionItem(item, index));

  const renderGroupedByType = (grouped, typeFilter) =>
    Object.entries(grouped).map(([name, items]) => {
      const filtered = items.filter(i => i.Type === typeFilter);
      if (!filtered.length) return null;
      const groupTotal = filtered.reduce((s, i) => s + (i.Amount || 0), 0);
      return (
        <View key={name} style={styles.GroupBlock}>
          <View style={styles.GroupNameRow}>
            <Text style={styles.GroupName}>{name}</Text>
            <Text style={styles.GroupTotal}>{groupTotal.toFixed(2)}</Text>
          </View>
          {filtered.map((item, idx) => renderCollectionItem(item, idx))}
        </View>
      );
    });

  const renderSection = (label, typeFilter, sectionTotal) => {
    if (sectionTotal === 0) return null;
    return (
      <>
        {renderSectionHeader(label)}
        {isAdmin && apiDataGroupedBySalesman
          ? renderGroupedByType(apiDataGroupedBySalesman, typeFilter)
          : apiData
            ? renderItemsByType(apiData, typeFilter)
            : null}
        {renderTotalRow(`${label} Total`, sectionTotal)}
      </>
    );
  };

  // ── Info strip (shared by both tabs) ─────────────────────────────────────
  const InfoStrip = () => (
    <View style={styles.InfoStrip}>
      <View style={styles.InfoStripLeft}>
        <TouchableOpacity
          style={styles.DatePickerTrigger}
          onPress={showFromDatePicker}>
          <Text style={styles.InfoLabel}>Date</Text>
          <Text style={styles.InfoValue}>{fromData}</Text>
          <Image
            style={styles.DropImg}
            source={require('../images/drop.png')}
          />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isFromDatePickerVisible}
          mode="date"
          onConfirm={handleFromDateConfirm}
          onCancel={hideFromDatePicker}
        />
        <View style={styles.InfoItem}>
          <Text style={styles.InfoLabel}>Location</Text>
          <Text style={styles.InfoValue}>{van || '-'}</Text>
        </View>
        <View style={styles.InfoItem}>
          <Text style={styles.InfoLabel}>Salesperson</Text>
          <Text style={styles.InfoValue}>{salesName || '-'}</Text>
        </View>
      </View>
    </View>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.Root}>
      <HeaderUiNew name={'Collection Report'} />

      {/* ── Tab Bar ── */}
      <View style={styles.TabBar}>
        {['collection', 'daily'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.TabBtn, activeTab === tab && styles.TabBtnActive]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.TabBtnText,
                activeTab === tab && styles.TabBtnTextActive,
              ]}>
              {tab === 'collection' ? 'Collection Report' : 'Daily Report'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ══════════════════════════════════════════════════════════
          COLLECTION REPORT TAB
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'collection' && (
        <View style={styles.TabContent}>
          {/* Info + Print PDF button */}
          <View style={styles.CollTopBar}>
            <InfoStrip />
            <TouchableOpacity
              style={styles.PdfTopBtn}
              disabled={
                pdfLoadingColl || !(apiData?.length || apiDataGroupedBySalesman)
              }
              onPress={generateCollectionPDF}>
              {pdfLoadingColl ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.PdfTopBtnText}>PDF</Text>
              )}
            </TouchableOpacity>
          </View>

          {showLoader && (
            <ActivityIndicator
              size="large"
              color="#5A55CA"
              style={{ marginTop: 24 }}
            />
          )}

          {!showLoader && showError ? (
            <View style={styles.ErrorWrap}>
              <Text style={styles.ErrorText}>{showError}</Text>
            </View>
          ) : null}

          {!showLoader && (
            <ScrollView
              style={styles.CollList}
              contentContainerStyle={{ paddingBottom: 120 }}>
              {renderSection('Cash Sales', 'CASH-SALES', cashSum)}
              {renderSection(
                'Cash Collection',
                'cash-collection',
                cashSalesSum,
              )}

              {(cashSum !== 0 || cashSalesSum !== 0) &&
                renderTotalRow('Cash Balance', cashSalesSum + cashSum, true)}

              {renderSection(
                'Cheque Collection',
                'cheque-collection',
                chequeSum,
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════
          DAILY REPORT TAB
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'daily' && (
        <ScrollView
          style={styles.DailyScroll}
          contentContainerStyle={{ paddingBottom: 40 }}>
          {/* ── Info Card ── */}
          <View style={styles.DailyInfoCard}>
            <InfoStrip />
          </View>

          {showLoader && (
            <ActivityIndicator color="#5A55CA" style={{ marginTop: 16 }} />
          )}

          {/* ── Financial Summary Card ── */}
          <View style={styles.SummaryCard}>
            <Text style={styles.SummaryTitle}>Financial Summary</Text>
            {[
              { label: 'Cash Collection', value: cashSalesSum, color: '#30B3A4' },
              { label: 'Cash Sales', value: cashSum, color: '#5A55CA' },
              { label: 'Credit Sales', value: creditSalesSum, color: '#0084B4' },
              {
                label: 'Cash Sales Return',
                value: cashSalesReturnSum,
                color: '#E74C3C',
              },
              {
                label: 'Credit Sales Return',
                value: creditSalesReturnSum,
                color: '#E7803C',
              },
            ].map((item, idx) => (
              <View key={idx} style={styles.SummaryRow}>
                <View style={styles.SummaryDot}>
                  <View style={[styles.Dot, { backgroundColor: item.color }]} />
                  <Text style={styles.SummaryLabel}>{item.label}</Text>
                </View>
                <Text style={[styles.SummaryValue, { color: item.color }]}>
                  {parseFloat(item.value || 0).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.SummaryDivider} />

            <View style={styles.CashInHandRow}>
              <Text style={styles.CashInHandLabel}>Cash In Hand</Text>
              <Text style={styles.CashInHandValue}>
                {cashInHand.toFixed(2)} AED
              </Text>
            </View>
          </View>

          {/* ── Cheque Card ─ */}
          {chequeSum !== 0 && (
            <View style={[styles.SummaryCard, { marginTop: 8 }]}>
              <View style={styles.SummaryRow}>
                <Text style={styles.SummaryLabel}>Cheque Collection</Text>
                <Text style={[styles.SummaryValue, { color: '#7D3C98' }]}>
                  {parseFloat(chequeSum).toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* ── Action Buttons ── */}
          <View style={styles.DailyActions}>
            <TouchableOpacity
              style={[styles.DailyBtn, styles.SunmiBtn]}
              onPress={printToSunmi}>
              <Text style={styles.DailyBtnText}>🖨 Print Sunmi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.DailyBtn, styles.PdfBtn]}
              disabled={pdfLoadingDaily}
              onPress={generateDailyPDF}>
              {pdfLoadingDaily ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.DailyBtnText}>📄 Export PDF</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  Root: {
    flex: 1,
    backgroundColor: '#F2F3F8',
  },

  // ── Tab Bar ──────────────────────────────────────────────────
  TabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  TabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  TabBtnActive: {
    borderBottomColor: '#5A55CA',
  },
  TabBtnText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: '#888',
  },
  TabBtnTextActive: {
    color: '#5A55CA',
    fontFamily: 'Lexend-Bold',
  },

  // ── Info Strip ───────────────────────────────────────────────
  InfoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  InfoStripLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    flex: 1,
  },
  InfoItem: {
    flexDirection: 'column',
    marginRight: 16,
    marginBottom: 4,
  },
  InfoLabel: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'Lexend-Light',
  },
  InfoValue: {
    fontSize: 13,
    color: '#222',
    fontFamily: 'Lexend-Regular',
  },
  DatePickerTrigger: {
    flexDirection: 'column',
    marginRight: 16,
    marginBottom: 4,
  },
  DropImg: {
    width: 18,
    height: 18,
    marginTop: 2,
  },

  // ── Collection Tab ───────────────────────────────────────────
  TabContent: {
    flex: 1,
  },
  CollTopBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  PdfTopBtn: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
    alignSelf: 'center',
    minWidth: 56,
    alignItems: 'center',
  },
  PdfTopBtnText: {
    color: '#fff',
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
  },
  CollList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
  },

  // ── Section ──────────────────────────────────────────────────
  SectionHeader: {
    backgroundColor: '#5A55CA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 6,
  },
  SectionHeaderText: {
    color: '#fff',
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ── Item Row ─────────────────────────────────────────────────
  ItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  ItemBody: {
    flex: 1,
    marginRight: 10,
  },
  ItemCustomer: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#222',
    marginBottom: 3,
  },
  ItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ItemMetaText: {
    fontFamily: 'Lexend-Light',
    fontSize: 12,
    color: '#666',
  },
  ItemMetaSep: {
    marginHorizontal: 4,
    color: '#bbb',
  },
  ItemRemarks: {
    fontFamily: 'Lexend-Light',
    fontSize: 11,
    color: '#888',
    marginTop: 3,
    fontStyle: 'italic',
  },
  ItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ItemAmount: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: '#5A55CA',
    marginBottom: 6,
  },
  ItemActions: {
    alignItems: 'flex-end',
  },
  ActionBtn: {
    backgroundColor: '#30B3A4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ActionBtnText: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
    fontSize: 12,
  },

  // ── Grouped block ────────────────────────────────────────────
  GroupBlock: {
    marginBottom: 8,
  },
  GroupNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EEEEFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 2,
  },
  GroupName: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: '#444',
  },
  GroupTotal: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: '#5A55CA',
  },

  // ── Total rows ───────────────────────────────────────────────
  TotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F0F0FF',
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  TotalRowHighlight: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFCC00',
    marginVertical: 8,
  },
  TotalLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: '#333',
  },
  TotalLabelHL: {
    color: '#856404',
  },
  TotalValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: '#5A55CA',
  },
  TotalValueHL: {
    color: '#856404',
    fontSize: 15,
  },

  // ── Error ────────────────────────────────────────────────────
  ErrorWrap: {
    padding: 12,
    alignItems: 'center',
  },
  ErrorText: {
    color: '#E74C3C',
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
  },

  // ── Daily Tab ────────────────────────────────────────────────
  DailyScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  DailyInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  SummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  SummaryTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  SummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  SummaryDot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  Dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  SummaryLabel: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#444',
  },
  SummaryValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
  },
  SummaryDivider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginVertical: 10,
  },
  CashInHandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  CashInHandLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 17,
    color: '#222',
  },
  CashInHandValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#30B3A4',
  },

  // ── Daily Action Buttons ─────────────────────────────────────
  DailyActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  DailyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  SunmiBtn: {
    backgroundColor: '#FF6200',
  },
  PdfBtn: {
    backgroundColor: '#E74C3C',
  },
  DailyBtnText: {
    color: '#fff',
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
  },

  // ── FinancialSection (legacy compat) ─────────────────────────
  FinancialSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
});

export default CollectionReport;
